import { useState } from "react";
import { Plus, Pencil, Trash2, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Button } from "@/components/Button";
import { Field, Input, Select } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { Markdown } from "@/components/Markdown";
import { useConfirm } from "@/components/ConfirmDialog";
import type { CannedResponse } from "@/lib/types";
import { uid } from "@/lib/utils";

export function CannedResponsesAdmin() {
  const store = useStore();
  const [edit, setEdit] = useState<CannedResponse | null>(null);
  const [creating, setCreating] = useState(false);
  const [activeCat, setActiveCat] = useState<string | "all">("all");
  const { confirm, node: confirmNode } = useConfirm();

  const filtered = activeCat === "all" ? store.cannedResponses : store.cannedResponses.filter((c) => c.categoryId === activeCat);

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <span className="eyebrow">Canned responses</span>
          <h1 className="font-display text-[36px] sm:text-[44px] leading-tight text-fg mt-1">
            <span className="italic">Words</span> the team trusts.
          </h1>
          <p className="mt-1.5 text-[14px] text-fg-muted">Variables: <code className="text-fg">{`{{customer.name}}`}</code>, <code className="text-fg">{`{{agent.name}}`}</code>, <code className="text-fg">{`{{ticket.id}}`}</code>.</p>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4" />
          New canned response
        </Button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-4">
        <button
          onClick={() => setActiveCat("all")}
          className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors ${activeCat === "all" ? "bg-accent text-accent-fg border-accent" : "border-border-strong/50 text-fg-muted bg-bg-elevated/40 hover:text-fg"}`}
        >
          All
        </button>
        {store.categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setActiveCat(c.id)}
            className={`px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors flex items-center gap-1.5 ${activeCat === c.id ? "bg-accent text-accent-fg border-accent" : "border-border-strong/50 text-fg-muted bg-bg-elevated/40 hover:text-fg"}`}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: `oklch(${c.color})` }} />
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((c) => {
          const cat = store.categories.find((x) => x.id === c.categoryId);
          return (
            <GlassCard key={c.id} className="p-4 group">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-3.5 h-3.5 text-fg-muted" />
                <h3 className="font-medium text-[14.5px] text-fg flex-1">{c.name}</h3>
                <Button variant="ghost" size="icon" onClick={() => setEdit(c)}>
                  <Pencil className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={async () => {
                    const ok = await confirm({
                      title: `Delete "${c.name}"?`,
                      description: "Agents won't be able to insert this template anymore. This can't be undone.",
                      confirmLabel: "Delete",
                      danger: true,
                    });
                    if (ok) {
                      store.deleteCanned(c.id);
                      toast.success("Canned response deleted");
                    }
                  }}
                >
                  <Trash2 className="w-3.5 h-3.5 text-status-breach" />
                </Button>
              </div>
              <div className="text-[12.5px] text-fg-muted whitespace-pre-line line-clamp-4 leading-relaxed font-mono">{c.body}</div>
              <div className="mt-3 pt-3 border-t border-border/60 flex items-center gap-2">
                {cat && (
                  <span className="text-[11px] flex items-center gap-1 text-fg-muted">
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: `oklch(${cat.color})` }} />
                    {cat.name}
                  </span>
                )}
                {c.tags.map((t) => (
                  <span key={t} className="text-[10.5px] px-1.5 py-0.5 rounded bg-bg-elevated/60 text-fg-muted">{t}</span>
                ))}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {(edit || creating) && (
        <CannedModal initial={edit} onClose={() => { setEdit(null); setCreating(false); }} />
      )}
      {confirmNode}
    </div>
  );
}

function CannedModal({ initial, onClose }: { initial: CannedResponse | null; onClose: () => void }) {
  const store = useStore();
  const [name, setName] = useState(initial?.name ?? "");
  const [body, setBody] = useState(initial?.body ?? "");
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [showPreview, setShowPreview] = useState(false);

  function save() {
    if (!name.trim() || !body.trim()) return toast.error("Name and body required");
    store.upsertCanned({
      id: initial?.id ?? uid("cr"),
      name: name.trim(),
      body: body.trim(),
      tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
      categoryId: categoryId || undefined,
    });
    toast.success(initial ? "Saved" : "Created");
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={initial ? "Edit canned response" : "New canned response"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>{initial ? "Save" : "Create"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} autoFocus />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Category" hint="Optional. Limits when this template appears.">
            <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
              <option value="">— Any</option>
              {store.categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Tags" hint="Comma-separated. Used for filtering in the picker.">
            <Input value={tags} onChange={(e) => setTags(e.target.value)} placeholder="billing, refund" />
          </Field>
        </div>
        <Field label="Body" required hint="Markdown supported. Variables substituted at insert time.">
          <div className="rounded-xl glass-card overflow-hidden">
            <div className="flex items-center gap-1 px-2 py-1 border-b border-border/40">
              <button type="button" onClick={() => setShowPreview(false)} className={`px-2 py-1 rounded-md text-[12px] ${!showPreview ? "bg-bg-elevated text-fg" : "text-fg-muted"}`}>Edit</button>
              <button type="button" onClick={() => setShowPreview(true)} className={`px-2 py-1 rounded-md text-[12px] ${showPreview ? "bg-bg-elevated text-fg" : "text-fg-muted"}`}>Preview</button>
            </div>
            {showPreview ? (
              <div className="px-4 py-3 min-h-[200px]"><Markdown>{body}</Markdown></div>
            ) : (
              <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={10} className="w-full bg-transparent border-0 outline-none px-4 py-3 text-[14px] text-fg placeholder:text-fg-subtle resize-y min-h-[220px] font-mono leading-relaxed" />
            )}
          </div>
        </Field>
      </div>
    </Modal>
  );
}
