import { useMemo, useState } from "react";
import { Search, ShieldOff, ShieldCheck, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Field, Input, Select } from "@/components/Input";
import type { User } from "@/lib/types";
import { formatDate } from "@/lib/utils";

export function CustomersAdmin() {
  const store = useStore();
  const customers = store.users.filter((u) => u.role === "customer");
  const [q, setQ] = useState("");
  const [editing, setEditing] = useState<User | null>(null);

  const filtered = useMemo(() => {
    if (!q.trim()) return customers;
    const ql = q.toLowerCase();
    return customers.filter((c) => c.name.toLowerCase().includes(ql) || c.email.toLowerCase().includes(ql) || (c.company ?? "").toLowerCase().includes(ql));
  }, [customers, q]);

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      <div className="mb-6">
        <span className="eyebrow">Customers</span>
        <h1 className="font-display text-[36px] sm:text-[44px] leading-tight text-fg mt-1">
          <span className="italic">Everyone</span> on the platform.
        </h1>
      </div>

      <GlassCard variant="strong" className="px-3 sm:px-4 py-2.5 flex items-center gap-3 mb-4">
        <Search className="w-4 h-4 text-fg-muted" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter by name, email, or company…"
          className="flex-1 bg-transparent outline-none text-[14px] text-fg placeholder:text-fg-subtle"
        />
      </GlassCard>

      <GlassCard className="overflow-hidden">
        <ul className="divide-y divide-border/40">
          {filtered.map((c) => {
            const tickets = store.tickets.filter((t) => t.customerId === c.id);
            const open = tickets.filter((t) => t.status !== "closed" && t.status !== "resolved").length;
            return (
              <li key={c.id} className="flex items-center gap-3 px-4 py-3.5">
                <Avatar user={c} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-medium text-fg truncate">{c.name} <span className="text-fg-muted font-normal text-[13px]">· {c.title}</span></div>
                  <div className="text-[12px] text-fg-muted truncate">{c.company} · {c.email}</div>
                </div>
                <div className="w-20 text-right hidden sm:block">
                  <div className="text-[10.5px] uppercase text-fg-subtle">Plan</div>
                  <div className="text-[13px] text-fg">{c.plan}</div>
                </div>
                <div className="w-20 text-right hidden md:block">
                  <div className="text-[10.5px] uppercase text-fg-subtle">Tickets</div>
                  <div className="text-[13px] text-fg tabnum">{tickets.length}<span className="text-fg-muted text-[11px]"> ({open} open)</span></div>
                </div>
                <div className="w-28 text-right hidden md:block">
                  <div className="text-[10.5px] uppercase text-fg-subtle">Joined</div>
                  <div className="text-[12.5px] text-fg-muted tabnum">{formatDate(c.joinedAt)}</div>
                </div>
                {c.suspended && (
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-status-breach/15 text-status-breach border border-status-breach/30">
                    Suspended
                  </span>
                )}
                <Button variant="ghost" size="sm" onClick={() => setEditing(c)}>Edit</Button>
              </li>
            );
          })}
          {filtered.length === 0 && (
            <li className="px-4 py-12 text-center text-[14px] text-fg-muted">No customers match.</li>
          )}
        </ul>
      </GlassCard>

      {editing && <EditCustomer user={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function EditCustomer({ user, onClose }: { user: User; onClose: () => void }) {
  const store = useStore();
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [company, setCompany] = useState(user.company ?? "");
  const [title, setTitle] = useState(user.title ?? "");
  const [plan, setPlan] = useState<NonNullable<User["plan"]>>((user.plan ?? "Starter") as NonNullable<User["plan"]>);
  const [suspended, setSuspended] = useState(!!user.suspended);

  function save() {
    store.upsertUser({ ...user, name, email, company, title, plan, suspended });
    toast.success("Updated");
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${user.name}`}
      size="md"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Email"><Input value={email} onChange={(e) => setEmail(e.target.value)} /></Field>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Company"><Input value={company} onChange={(e) => setCompany(e.target.value)} /></Field>
          <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
        </div>
        <Field label="Plan">
          <Select value={plan} onChange={(e) => setPlan(e.target.value as NonNullable<User["plan"]>)}>
            <option>Free</option>
            <option>Starter</option>
            <option>Growth</option>
            <option>Enterprise</option>
          </Select>
        </Field>
        <div className="rounded-xl border border-border bg-bg-elevated/40 p-4">
          <div className="flex items-center gap-3">
            {suspended ? <ShieldOff className="w-4 h-4 text-status-breach" /> : <ShieldCheck className="w-4 h-4 text-status-resolved" />}
            <div className="flex-1">
              <div className="text-[13px] font-medium text-fg">{suspended ? "Account suspended" : "Account active"}</div>
              <div className="text-[12px] text-fg-muted">{suspended ? "Customer can't open new tickets." : "Toggle to suspend new ticket creation."}</div>
            </div>
            <button
              type="button"
              onClick={() => setSuspended((s) => !s)}
              className={`relative w-10 h-6 rounded-full transition-colors ${suspended ? "bg-status-breach" : "bg-status-resolved"}`}
            >
              <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white transition-transform ${suspended ? "translate-x-4" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
