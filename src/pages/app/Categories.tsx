import { useState } from "react";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Button } from "@/components/Button";
import { Field, Input, Select } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { useConfirm } from "@/components/ConfirmDialog";
import type { Category, TicketPriority } from "@/lib/types";
import { uid } from "@/lib/utils";

const COLORS = [
  "0.55 0.215 254", "0.62 0.155 158", "0.72 0.165 65",
  "0.52 0.250 305", "0.58 0.220 22", "0.65 0.140 220", "0.68 0.180 180",
];

export function Categories() {
  const store = useStore();
  const [edit, setEdit] = useState<Category | null>(null);
  const [creating, setCreating] = useState(false);
  const { confirm, node: confirmNode } = useConfirm();

  return (
    <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <span className="eyebrow">Categories</span>
          <h1 className="font-display text-[36px] sm:text-[44px] leading-tight text-fg mt-1">
            <span className="italic">How</span> tickets get sorted.
          </h1>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4" />
          New category
        </Button>
      </div>

      <GlassCard className="overflow-hidden">
        <ul className="divide-y divide-border/50">
          {store.categories.map((c) => {
            const sla = store.slaPolicies.find((s) => s.id === c.defaultSlaId);
            const count = store.tickets.filter((t) => t.categoryId === c.id).length;
            return (
              <li key={c.id} className="px-4 py-3.5 flex items-center gap-4">
                <span className="w-3 h-3 rounded-full shrink-0" style={{ background: `oklch(${c.color})` }} />
                <div className="flex-1 min-w-0">
                  <div className="text-[14.5px] font-medium text-fg">{c.name}</div>
                  <div className="text-[12.5px] text-fg-muted">{c.description}</div>
                </div>
                <div className="text-[11.5px] text-fg-muted text-right hidden sm:block">
                  Default SLA: <span className="text-fg">{sla?.name ?? "—"}</span>
                  <br />
                  Default priority: <span className="text-fg capitalize">{c.defaultPriority}</span>
                </div>
                <div className="text-[11px] text-fg-muted px-2 py-1 rounded-md bg-bg-elevated/60 tabnum">{count}</div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEdit(c)} aria-label="Edit">
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      if (store.categories.length === 1) {
                        toast.error("Keep at least one category.");
                        return;
                      }
                      const ok = await confirm({
                        title: `Delete "${c.name}"?`,
                        description: <>Existing tickets in this category will be reassigned to <span className="text-fg font-medium">{store.categories.find((x) => x.id !== c.id)?.name}</span>. This can't be undone.</>,
                        confirmLabel: "Delete category",
                        danger: true,
                      });
                      if (ok) {
                        store.deleteCategory(c.id);
                        toast.success("Category deleted");
                      }
                    }}
                    aria-label="Delete"
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
        <CategoryModal
          initial={edit ?? null}
          onClose={() => {
            setEdit(null);
            setCreating(false);
          }}
        />
      )}
      {confirmNode}
    </div>
  );
}

function CategoryModal({ initial, onClose }: { initial: Category | null; onClose: () => void }) {
  const store = useStore();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [color, setColor] = useState(initial?.color ?? COLORS[0]);
  const [defaultPriority, setDefaultPriority] = useState<TicketPriority>(initial?.defaultPriority ?? "normal");
  const [defaultSlaId, setDefaultSlaId] = useState(initial?.defaultSlaId ?? store.slaPolicies[0]?.id ?? "");

  function save() {
    if (!name.trim()) return toast.error("Name is required");
    const payload: Category = {
      id: initial?.id ?? uid("cat"),
      name: name.trim(),
      description: description.trim(),
      color,
      defaultPriority,
      defaultSlaId,
    };
    store.upsertCategory(payload);
    toast.success(initial ? "Category updated" : "Category created");
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? "Edit category" : "New category"}
      description="Categories shape the inbox, the SLA, and the customer-facing taxonomy."
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>
            {initial ? "Save" : "Create"}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Billing & Subscriptions" autoFocus />
        </Field>
        <Field label="Description" hint="Shown on the customer portal when picking a category.">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Color">
          <div className="flex flex-wrap gap-2">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full border-2 transition-all ${color === c ? "border-fg scale-110" : "border-transparent"}`}
                style={{ background: `oklch(${c})` }}
                aria-label={`Color ${c}`}
              />
            ))}
          </div>
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Default priority">
            <Select value={defaultPriority} onChange={(e) => setDefaultPriority(e.target.value as TicketPriority)}>
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </Select>
          </Field>
          <Field label="Default SLA policy">
            <Select value={defaultSlaId} onChange={(e) => setDefaultSlaId(e.target.value)}>
              {store.slaPolicies.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </Field>
        </div>
      </div>
    </Modal>
  );
}
