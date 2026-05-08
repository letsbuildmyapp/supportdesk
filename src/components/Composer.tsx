import { useState, useMemo, useRef } from "react";
import { Send, MessageSquare, Lock, BookOpen, AtSign, Bold, Italic, Code, List } from "lucide-react";
import { cn, substituteCannedVars, userHandle } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Button } from "./Button";
import { FileUpload } from "./FileUpload";
import { Markdown } from "./Markdown";
import type { Attachment, CannedResponse } from "@/lib/types";

export function Composer({
  ticketId,
  onSent,
  customerOnly = false,
  onChange,
}: {
  ticketId: string;
  onSent?: () => void;
  customerOnly?: boolean;
  onChange?: (text: string) => void;
}) {
  const store = useStore();
  const ticket = store.tickets.find((t) => t.id === ticketId);
  const currentUser = store.users.find((u) => u.id === store.currentUserId);
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showCanned, setShowCanned] = useState(false);
  const [showMentions, setShowMentions] = useState(false);
  const [pending, setPending] = useState(false);
  const ref = useRef<HTMLTextAreaElement>(null);

  const orgName = store.orgSettings.name;
  const cannedList = useMemo(
    () =>
      store.cannedResponses.filter(
        (c) => !c.categoryId || c.categoryId === ticket?.categoryId || (isInternal && c.tags.includes("internal"))
      ),
    [store.cannedResponses, ticket?.categoryId, isInternal]
  );
  const teammates = store.users.filter((u) => u.role !== "customer" && u.id !== currentUser?.id);

  if (!ticket || !currentUser) return null;
  const t = ticket;
  const me = currentUser;
  const customer = store.users.find((u) => u.id === t.customerId);

  function insertAtCursor(text: string) {
    const ta = ref.current;
    if (!ta) {
      const next = body + text;
      setBody(next);
      onChange?.(next);
      return;
    }
    const start = ta.selectionStart ?? body.length;
    const end = ta.selectionEnd ?? body.length;
    const next = body.slice(0, start) + text + body.slice(end);
    setBody(next);
    onChange?.(next);
    setTimeout(() => {
      ta.focus();
      ta.selectionStart = ta.selectionEnd = start + text.length;
    }, 0);
  }

  function applyCanned(c: CannedResponse) {
    const filled = substituteCannedVars(c.body, {
      customerName: customer?.name?.split(" ")[0] ?? "there",
      agentName: me.name?.split(" ")[0] ?? "the team",
      ticketId: t.id,
      orgName,
    });
    const next = body ? `${body}\n\n${filled}` : filled;
    setBody(next);
    onChange?.(next);
    setShowCanned(false);
  }

  function applyMention(handle: string) {
    insertAtCursor(`@${handle} `);
    setShowMentions(false);
  }

  async function send() {
    if (!body.trim() && attachments.length === 0) return;
    setPending(true);
    setTimeout(() => {
      store.addReply({
        ticketId: t.id,
        authorId: me.id,
        body: body.trim(),
        isInternal: customerOnly ? false : isInternal,
        attachments,
      });
      setBody("");
      setAttachments([]);
      setIsInternal(false);
      setShowPreview(false);
      setPending(false);
      onSent?.();
    }, 220);
  }

  function wrap(prefix: string, suffix = prefix) {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart ?? body.length;
    const end = ta.selectionEnd ?? body.length;
    const sel = body.slice(start, end) || "text";
    const next = body.slice(0, start) + prefix + sel + suffix + body.slice(end);
    setBody(next);
    onChange?.(next);
  }

  return (
    <div className={cn(
      "rounded-2xl glass-card overflow-hidden transition-shadow",
      isInternal && "ring-2 ring-status-pending/50 ring-offset-1 ring-offset-bg"
    )}>
      {!customerOnly && (
        <div className="flex items-center gap-1 p-1.5 border-b border-border/60">
          <button
            type="button"
            onClick={() => setIsInternal(false)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
              !isInternal ? "bg-accent text-accent-fg" : "text-fg-muted hover:text-fg hover:bg-bg-elevated/40"
            )}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Public reply
          </button>
          <button
            type="button"
            onClick={() => setIsInternal(true)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
              isInternal ? "bg-status-pending/25 text-status-pending border border-status-pending/40" : "text-fg-muted hover:text-fg hover:bg-bg-elevated/40"
            )}
          >
            <Lock className="w-3.5 h-3.5" />
            Internal note
          </button>
          <span className="ml-auto text-[11px] text-fg-subtle pr-2">
            {isInternal ? "Only your team can see this" : "Visible to the customer"}
          </span>
        </div>
      )}

      {/* toolbar */}
      <div className="flex items-center gap-0.5 px-2 pt-2">
        <ToolbarBtn onClick={() => wrap("**")} title="Bold">
          <Bold className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => wrap("*")} title="Italic">
          <Italic className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => wrap("`")} title="Code">
          <Code className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <ToolbarBtn onClick={() => insertAtCursor("\n- ")} title="List">
          <List className="w-3.5 h-3.5" />
        </ToolbarBtn>
        <span className="w-px h-4 bg-border mx-1" />
        {!customerOnly && (
          <>
            <ToolbarBtn onClick={() => setShowCanned((s) => !s)} title="Canned response" data-active={showCanned}>
              <BookOpen className="w-3.5 h-3.5" />
              <span className="text-[12px] hidden sm:inline">Canned</span>
            </ToolbarBtn>
            <ToolbarBtn onClick={() => setShowMentions((s) => !s)} title="Mention teammate" data-active={showMentions}>
              <AtSign className="w-3.5 h-3.5" />
              <span className="text-[12px] hidden sm:inline">Mention</span>
            </ToolbarBtn>
          </>
        )}
        <span className="ml-auto" />
        <button
          type="button"
          onClick={() => setShowPreview((p) => !p)}
          className={cn(
            "px-2 py-1 rounded-md text-[12px] font-medium",
            showPreview ? "bg-accent/15 text-accent" : "text-fg-muted hover:text-fg hover:bg-bg-elevated/50"
          )}
        >
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {showCanned && !customerOnly && (
        <div className="mx-2 my-2 rounded-xl border border-border bg-bg-elevated/40 backdrop-blur-md overflow-hidden max-h-[220px] overflow-y-auto">
          {cannedList.length === 0 && (
            <div className="px-3 py-4 text-[13px] text-fg-muted">No canned responses yet.</div>
          )}
          {cannedList.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => applyCanned(c)}
              className="w-full text-left px-3 py-2 hover:bg-bg-elevated/60 border-b border-border/40 last:border-b-0"
            >
              <div className="text-[13px] font-medium text-fg">{c.name}</div>
              <div className="text-[12px] text-fg-muted truncate mt-0.5">{c.body.replace(/\n/g, " · ").slice(0, 110)}</div>
            </button>
          ))}
        </div>
      )}

      {showMentions && !customerOnly && (
        <div className="mx-2 my-2 rounded-xl border border-border bg-bg-elevated/40 backdrop-blur-md overflow-hidden max-h-[220px] overflow-y-auto">
          {teammates.map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => applyMention(userHandle(u.name))}
              className="flex w-full items-center gap-2 px-3 py-2 hover:bg-bg-elevated/60 border-b border-border/40 last:border-b-0"
            >
              <img src={u.avatar} alt="" className="w-6 h-6 rounded-full" />
              <div className="text-left">
                <div className="text-[13px] font-medium text-fg">{u.name}</div>
                <div className="text-[11px] text-fg-muted">@{userHandle(u.name)} · {u.title}</div>
              </div>
            </button>
          ))}
        </div>
      )}

      {showPreview ? (
        <div className="px-4 py-3 min-h-[120px]">
          {body.trim() ? <Markdown>{body}</Markdown> : <span className="text-fg-subtle text-[14px]">Nothing to preview yet.</span>}
        </div>
      ) : (
        <textarea
          ref={ref}
          value={body}
          onChange={(e) => {
            setBody(e.target.value);
            onChange?.(e.target.value);
          }}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
              e.preventDefault();
              send();
            }
          }}
          rows={4}
          placeholder={isInternal ? "Internal note — only your team will see this. Use @name to mention a teammate." : "Write a reply… markdown supported."}
          className="w-full bg-transparent border-0 outline-none px-4 py-3 text-[15px] text-fg placeholder:text-fg-subtle resize-y min-h-[110px] font-sans"
        />
      )}

      <div className="flex items-center gap-2 px-3 py-2 border-t border-border/60 bg-bg-elevated/30">
        <FileUpload attachments={attachments} onChange={setAttachments} compact />
        <span className="ml-auto" />
        <span className="text-[11px] text-fg-subtle">⌘↩ to send</span>
        <Button
          size="sm"
          variant="primary"
          onClick={send}
          loading={pending}
          disabled={!body.trim() && attachments.length === 0}
        >
          <Send className="w-3.5 h-3.5" />
          {customerOnly ? "Send reply" : isInternal ? "Add note" : "Reply"}
        </Button>
      </div>
    </div>
  );
}

function ToolbarBtn({
  children,
  onClick,
  title,
  ...rest
}: {
  children: React.ReactNode;
  onClick: () => void;
  title: string;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-fg-muted hover:text-fg hover:bg-bg-elevated/50 data-[active=true]:bg-accent/15 data-[active=true]:text-accent transition-colors"
      {...rest}
    >
      {children}
    </button>
  );
}
