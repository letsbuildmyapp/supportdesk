import { useDropzone } from "react-dropzone";
import { useState } from "react";
import { Paperclip, X, FileText, ImageIcon, FileArchive, File as FileIcon, Loader2 } from "lucide-react";
import { cn, formatBytes, sleep, uid } from "@/lib/utils";
import type { Attachment } from "@/lib/types";
import { toast } from "sonner";

const IMAGE_MAX_BYTES = 2 * 1024 * 1024;

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

function iconFor(mime: string) {
  if (mime.startsWith("image/")) return <ImageIcon className="w-4 h-4" />;
  if (mime === "application/pdf") return <FileText className="w-4 h-4" />;
  if (mime.includes("zip") || mime.includes("tar")) return <FileArchive className="w-4 h-4" />;
  return <FileIcon className="w-4 h-4" />;
}

export function FileUpload({
  attachments,
  onChange,
  maxFiles = 8,
  compact = false,
}: {
  attachments: Attachment[];
  onChange: (next: Attachment[]) => void;
  maxFiles?: number;
  compact?: boolean;
}) {
  const [uploadingNames, setUploadingNames] = useState<string[]>([]);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    noClick: true,
    noKeyboard: true,
    onDrop: async (accepted) => {
      if (attachments.length + accepted.length > maxFiles) {
        toast.error(`Maximum ${maxFiles} files`);
        return;
      }
      setUploadingNames((p) => [...p, ...accepted.map((f) => f.name)]);
      const results: Attachment[] = [];
      for (const file of accepted) {
        await sleep(700 + Math.random() * 900); // simulated upload
        let dataUrl: string | undefined;
        if (file.type.startsWith("image/") && file.size <= IMAGE_MAX_BYTES) {
          try {
            dataUrl = await fileToDataUrl(file);
          } catch {}
        }
        results.push({
          id: uid("att"),
          name: file.name,
          size: file.size,
          mime: file.type || "application/octet-stream",
          uploadedAt: new Date().toISOString(),
          dataUrl,
        });
      }
      setUploadingNames((p) => p.filter((n) => !accepted.some((f) => f.name === n)));
      onChange([...attachments, ...results]);
    },
  });

  return (
    <div {...getRootProps()} className={cn("relative", isDragActive && "ring-2 ring-accent rounded-2xl")}>
      <input {...getInputProps()} />
      {!compact && (
        <button
          type="button"
          onClick={open}
          className={cn(
            "flex items-center gap-2 text-[13px] font-medium text-fg-muted hover:text-fg",
            "px-3 py-1.5 rounded-xl border border-dashed border-border-strong/60 hover:border-accent/50 hover:bg-accent/5 transition-colors"
          )}
        >
          <Paperclip className="w-4 h-4" />
          Attach files
        </button>
      )}
      {compact && (
        <button type="button" onClick={open} className="text-fg-muted hover:text-fg p-2 rounded-lg hover:bg-bg-elevated/50 transition-colors" title="Attach">
          <Paperclip className="w-4 h-4" />
        </button>
      )}

      {(attachments.length > 0 || uploadingNames.length > 0) && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {attachments.map((a) => (
            <AttachmentChip
              key={a.id}
              attachment={a}
              onRemove={() => onChange(attachments.filter((x) => x.id !== a.id))}
            />
          ))}
          {uploadingNames.map((n) => (
            <span
              key={n}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-bg-elevated/50 text-[12px] text-fg-muted"
            >
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="max-w-[160px] truncate">{n}</span>
            </span>
          ))}
        </div>
      )}

      {isDragActive && (
        <div className="absolute inset-0 rounded-2xl bg-accent/10 backdrop-blur-sm flex items-center justify-center pointer-events-none">
          <span className="text-accent font-medium text-[14px]">Drop to attach</span>
        </div>
      )}
    </div>
  );
}

export function AttachmentChip({
  attachment,
  onRemove,
}: {
  attachment: Attachment;
  onRemove?: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border bg-bg-elevated/50 text-[12px] text-fg-muted hover:text-fg">
      {iconFor(attachment.mime)}
      <span className="max-w-[180px] truncate text-fg">{attachment.name}</span>
      <span className="text-fg-subtle tabnum">{formatBytes(attachment.size)}</span>
      {onRemove && (
        <button type="button" onClick={onRemove} className="ml-0.5 text-fg-subtle hover:text-status-breach">
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}

export function AttachmentList({ attachments }: { attachments: Attachment[] }) {
  if (!attachments?.length) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {attachments.map((a) => (
        <div key={a.id} className="rounded-xl border border-border bg-bg-elevated/40 backdrop-blur-md overflow-hidden">
          {a.dataUrl && a.mime.startsWith("image/") ? (
            <a href={a.dataUrl} target="_blank" rel="noreferrer" className="block">
              <img src={a.dataUrl} alt={a.name} className="max-w-[200px] max-h-[140px] object-cover" loading="lazy" />
              <div className="px-2.5 py-1.5 text-[11px] text-fg-muted flex items-center justify-between gap-2">
                <span className="truncate">{a.name}</span>
                <span className="tabnum">{formatBytes(a.size)}</span>
              </div>
            </a>
          ) : (
            <button
              type="button"
              onClick={() => toast.info(`In a real environment, ${a.name} would download.`)}
              className="flex items-center gap-2 px-3 py-2 text-left hover:bg-bg-elevated/50 transition-colors w-full"
            >
              {iconFor(a.mime)}
              <div className="min-w-0">
                <div className="text-[13px] text-fg truncate max-w-[240px]">{a.name}</div>
                <div className="text-[11px] text-fg-muted tabnum">{formatBytes(a.size)}</div>
              </div>
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
