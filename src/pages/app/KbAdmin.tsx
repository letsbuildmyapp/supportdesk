import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, Activity } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Field, Input, Select } from "@/components/Input";
import { Markdown } from "@/components/Markdown";
import { useConfirm } from "@/components/ConfirmDialog";
import type { KbArticle } from "@/lib/types";
import { uid, formatDate } from "@/lib/utils";

export function KbAdmin() {
  const store = useStore();
  const [edit, setEdit] = useState<KbArticle | null>(null);
  const [creating, setCreating] = useState(false);
  const { confirm, node: confirmNode } = useConfirm();

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <span className="eyebrow">Knowledge base</span>
          <h1 className="font-display text-[36px] sm:text-[44px] leading-tight text-fg mt-1">
            <span className="italic">What</span> the docs say.
          </h1>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4" />
          New article
        </Button>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="px-4 py-2 border-b border-border/50 flex items-center text-[11px] uppercase tracking-wider text-fg-subtle font-medium">
          <span className="flex-1">Title</span>
          <span className="w-32 hidden sm:inline">Category</span>
          <span className="w-20 hidden md:inline">Views</span>
          <span className="w-28 hidden md:inline">Updated</span>
          <span className="w-24">Status</span>
          <span className="w-20" />
        </div>
        <ul className="divide-y divide-border/40">
          {store.kbArticles.map((a) => {
            const cat = store.categories.find((c) => c.id === a.categoryId);
            return (
              <li key={a.id} className="flex items-center gap-3 px-4 py-3.5">
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-fg truncate">{a.title}</div>
                  <div className="text-[12px] text-fg-muted truncate">{a.excerpt}</div>
                </div>
                <div className="w-32 hidden sm:flex items-center gap-1.5">
                  {cat && <span className="w-1.5 h-1.5 rounded-full" style={{ background: `oklch(${cat.color})` }} />}
                  <span className="text-[12.5px] text-fg-muted">{cat?.name}</span>
                </div>
                <div className="w-20 hidden md:block text-[12.5px] tabnum text-fg-muted">{a.views.toLocaleString()}</div>
                <div className="w-28 hidden md:block text-[12px] text-fg-muted tabnum">{formatDate(a.updatedAt)}</div>
                <div className="w-24">
                  <span className={`text-[11px] px-2 py-0.5 rounded-full ${a.published ? "bg-status-resolved/15 text-status-resolved" : "bg-bg-elevated/60 text-fg-muted"}`}>
                    {a.published ? <><Eye className="inline w-3 h-3 mr-0.5" />Published</> : <><EyeOff className="inline w-3 h-3 mr-0.5" />Draft</>}
                  </span>
                </div>
                <div className="w-20 flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEdit(a)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      const ok = await confirm({
                        title: `Delete "${a.title}"?`,
                        description: "This article will be removed from the customer-facing knowledge base. This can't be undone.",
                        confirmLabel: "Delete article",
                        danger: true,
                      });
                      if (ok) {
                        store.deleteArticle(a.id);
                        toast.success("Article deleted");
                      }
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-status-breach" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      </GlassCard>

      {(edit || creating) && (
        <ArticleEditor initial={edit} onClose={() => { setEdit(null); setCreating(false); }} />
      )}
      {confirmNode}
    </div>
  );
}

function ArticleEditor({ initial, onClose }: { initial: KbArticle | null; onClose: () => void }) {
  const store = useStore();
  const me = store.users.find((u) => u.id === store.currentUserId);
  const [title, setTitle] = useState(initial?.title ?? "");
  const [excerpt, setExcerpt] = useState(initial?.excerpt ?? "");
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? store.categories[0]?.id);
  const [body, setBody] = useState(initial?.body ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [published, setPublished] = useState(initial?.published ?? false);
  const [showPreview, setShowPreview] = useState(false);

  function save() {
    if (!title.trim() || !body.trim()) return toast.error("Title and body required");
    const slug = (initial?.slug ?? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""));
    const now = new Date().toISOString();
    store.upsertArticle({
      id: initial?.id ?? uid("kb"),
      slug,
      title: title.trim(),
      excerpt: excerpt.trim() || title.trim(),
      categoryId: categoryId ?? "",
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      published,
      authorId: initial?.authorId ?? me?.id ?? "",
      createdAt: initial?.createdAt ?? now,
      updatedAt: now,
      views: initial?.views ?? 0,
      body: body.trim(),
    });
    toast.success(initial ? "Article saved" : "Article created");
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={initial ? "Edit article" : "New article"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant={published ? "primary" : "secondary"} onClick={save}>
            {initial ? "Save" : "Create"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Title" required>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </Field>
        <Field label="Excerpt" hint="Shown in lists and search results.">
          <Input value={excerpt} onChange={(e) => setExcerpt(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              {store.categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Tags" hint="Comma-separated.">
            <Input value={tags} onChange={(e) => setTags(e.target.value)} />
          </Field>
        </div>
        <Field label="Body" required>
          <div className="rounded-xl glass-card overflow-hidden">
            <div className="flex items-center gap-1 px-2 py-1 border-b border-border/40">
              <button type="button" onClick={() => setShowPreview(false)} className={`px-2 py-1 rounded-md text-[12px] ${!showPreview ? "bg-bg-elevated text-fg" : "text-fg-muted"}`}>Edit</button>
              <button type="button" onClick={() => setShowPreview(true)} className={`px-2 py-1 rounded-md text-[12px] ${showPreview ? "bg-bg-elevated text-fg" : "text-fg-muted"}`}>Preview</button>
            </div>
            {showPreview ? (
              <div className="px-4 py-3 min-h-[320px] max-h-[60vh] overflow-y-auto"><Markdown>{body}</Markdown></div>
            ) : (
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={18} className="w-full bg-transparent border-0 outline-none px-4 py-3 text-[14px] text-fg placeholder:text-fg-subtle resize-y min-h-[320px] font-mono leading-relaxed" />
            )}
          </div>
        </Field>
        <div className="rounded-xl border border-border bg-bg-elevated/40 p-4 flex items-center gap-3">
          <div className="flex-1">
            <div className="text-[13px] font-medium text-fg">{published ? "Published" : "Draft"}</div>
            <div className="text-[12px] text-fg-muted">{published ? "Visible in the customer portal." : "Not visible to customers."}</div>
          </div>
          <button type="button" onClick={() => setPublished((p) => !p)} className={`relative w-10 h-6 rounded-full transition-colors ${published ? "bg-status-resolved" : "bg-bg-elevated/80"}`}>
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${published ? "translate-x-4" : ""}`} />
          </button>
        </div>
      </div>
    </Modal>
  );
}
