import { useState } from "react";
import { Plus, Pencil, Trash2, Timer, Target } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Button } from "@/components/Button";
import { Field, Input } from "@/components/Input";
import { Modal } from "@/components/Modal";
import { useConfirm } from "@/components/ConfirmDialog";
import type { SlaPolicy } from "@/lib/types";
import { uid, durationStr } from "@/lib/utils";

export function SlaPolicies() {
  const store = useStore();
  const [edit, setEdit] = useState<SlaPolicy | null>(null);
  const [creating, setCreating] = useState(false);
  const { confirm, node: confirmNode } = useConfirm();

  return (
    <div className="px-4 sm:px-6 py-6 max-w-4xl mx-auto">
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <span className="eyebrow">SLA policies</span>
          <h1 className="font-display text-[36px] sm:text-[44px] leading-tight text-fg mt-1">
            <span className="italic">How fast</span> we promise to be.
          </h1>
        </div>
        <Button variant="primary" onClick={() => setCreating(true)}>
          <Plus className="w-4 h-4" />
          New policy
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {store.slaPolicies.map((s) => {
          const usedBy = store.tickets.filter((t) => t.slaId === s.id).length;
          const cats = store.categories.filter((c) => c.defaultSlaId === s.id);
          return (
            <GlassCard key={s.id} className="p-5 flex flex-col">
              <div className="flex items-start gap-2.5">
                <div className="flex-1 min-w-0">
                  <h3 className="font-display text-[24px] text-fg leading-tight">{s.name}</h3>
                  <p className="text-[12.5px] text-fg-muted mt-1 leading-relaxed">{s.description}</p>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => setEdit(s)}>
                    <Pencil className="w-3.5 h-3.5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={async () => {
                      if (store.slaPolicies.length === 1) return toast.error("Keep at least one policy.");
                      const ok = await confirm({
                        title: `Delete "${s.name}"?`,
                        description: "Tickets using this policy will be reassigned to another. This can't be undone.",
                        confirmLabel: "Delete policy",
                        danger: true,
                      });
                      if (ok) {
                        store.deleteSla(s.id);
                        toast.success("Policy deleted");
                      }
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-status-breach" />
                  </Button>
                </div>
              </div>
              <dl className="mt-5 space-y-2.5 pt-4 border-t border-border/60">
                <Row icon={<Target className="w-3.5 h-3.5" />} label="First response" value={durationStr(s.firstResponseMins)} />
                <Row icon={<Timer className="w-3.5 h-3.5" />} label="Resolution" value={durationStr(s.resolutionMins)} />
              </dl>
              <div className="mt-4 pt-4 border-t border-border/60 text-[11.5px] text-fg-muted">
                <div className="tabnum">{usedBy} active tickets · default for {cats.length} categor{cats.length === 1 ? "y" : "ies"}</div>
              </div>
            </GlassCard>
          );
        })}
      </div>

      {(edit || creating) && (
        <SlaModal initial={edit} onClose={() => { setEdit(null); setCreating(false); }} />
      )}
      {confirmNode}
    </div>
  );
}

function Row({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="text-fg-muted shrink-0">{icon}</span>
      <span className="text-[12px] text-fg-muted">{label}</span>
      <span className="ml-auto text-[14px] text-fg font-medium tabnum">{value}</span>
    </div>
  );
}

function SlaModal({ initial, onClose }: { initial: SlaPolicy | null; onClose: () => void }) {
  const store = useStore();
  const [name, setName] = useState(initial?.name ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [firstMins, setFirstMins] = useState(initial?.firstResponseMins ?? 240);
  const [resMins, setResMins] = useState(initial?.resolutionMins ?? 1440);

  function save() {
    if (!name.trim()) return toast.error("Name is required");
    store.upsertSla({
      id: initial?.id ?? uid("sla"),
      name: name.trim(),
      description: description.trim(),
      firstResponseMins: Number(firstMins) || 0,
      resolutionMins: Number(resMins) || 0,
    });
    toast.success(initial ? "Policy updated" : "Policy created");
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={initial ? "Edit SLA policy" : "New SLA policy"}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>{initial ? "Save" : "Create"}</Button>
        </>
      }
    >
      <div className="space-y-4">
        <Field label="Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. VIP" autoFocus />
        </Field>
        <Field label="Description">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="First response (minutes)" hint={`Currently ${durationStr(firstMins)}`}>
            <Input type="number" value={firstMins} onChange={(e) => setFirstMins(Number(e.target.value))} />
          </Field>
          <Field label="Resolution (minutes)" hint={`Currently ${durationStr(resMins)}`}>
            <Input type="number" value={resMins} onChange={(e) => setResMins(Number(e.target.value))} />
          </Field>
        </div>
      </div>
    </Modal>
  );
}
