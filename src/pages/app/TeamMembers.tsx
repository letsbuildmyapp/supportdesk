import { useState } from "react";
import { UserPlus, Copy, Check } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Avatar } from "@/components/Avatar";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { Field, Input, Select } from "@/components/Input";
import type { Role, User } from "@/lib/types";
import { uid, formatDate } from "@/lib/utils";

export function TeamMembers() {
  const store = useStore();
  const internal = store.users.filter((u) => u.role !== "customer");
  const [editing, setEditing] = useState<User | null>(null);
  const [inviting, setInviting] = useState(false);

  return (
    <div className="px-4 sm:px-6 py-6 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <span className="eyebrow">Team members</span>
          <h1 className="font-display text-[36px] sm:text-[44px] leading-tight text-fg mt-1">
            <span className="italic">Who's</span> on the team.
          </h1>
        </div>
        <Button variant="primary" onClick={() => setInviting(true)}>
          <UserPlus className="w-4 h-4" />
          Invite teammate
        </Button>
      </div>

      <GlassCard className="overflow-hidden">
        <div className="px-4 py-2 border-b border-border/50 flex items-center text-[11px] uppercase tracking-wider text-fg-subtle font-medium">
          <span className="flex-1">Member</span>
          <span className="w-32 hidden sm:inline">Role</span>
          <span className="w-32 hidden md:inline">Joined</span>
          <span className="w-24 hidden md:inline">Status</span>
          <span className="w-24" />
        </div>
        <ul className="divide-y divide-border/40">
          {internal.map((u) => (
            <li key={u.id} className="flex items-center gap-3 px-4 py-3">
              <Avatar user={u} size="md" showStatus />
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-fg truncate">{u.name}</div>
                <div className="text-[12px] text-fg-muted truncate">{u.email} · {u.title}</div>
              </div>
              <div className="w-32 hidden sm:block text-[13px] text-fg capitalize">{u.role}</div>
              <div className="w-32 hidden md:block text-[12.5px] text-fg-muted">{formatDate(u.joinedAt)}</div>
              <div className="w-24 hidden md:block text-[12px]">
                <span className={`px-1.5 py-0.5 rounded ${u.online ? "bg-status-resolved/15 text-status-resolved" : "bg-bg-elevated/50 text-fg-muted"}`}>
                  {u.online ? "Online" : "Away"}
                </span>
              </div>
              <div className="w-24 text-right">
                <Button variant="ghost" size="sm" onClick={() => setEditing(u)}>Edit</Button>
              </div>
            </li>
          ))}
        </ul>
      </GlassCard>

      {editing && <EditMember user={editing} onClose={() => setEditing(null)} />}
      {inviting && <InviteModal onClose={() => setInviting(false)} />}
    </div>
  );
}

function EditMember({ user, onClose }: { user: User; onClose: () => void }) {
  const store = useStore();
  const [role, setRole] = useState<Role>(user.role);
  const [title, setTitle] = useState(user.title ?? "");
  const [online, setOnline] = useState(!!user.online);

  function save() {
    store.upsertUser({ ...user, role, title, online });
    toast.success("Updated");
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Edit ${user.name}`}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save}>Save</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <Avatar user={user} size="lg" />
          <div>
            <div className="text-[15px] font-medium text-fg">{user.name}</div>
            <div className="text-[12px] text-fg-muted">{user.email}</div>
          </div>
        </div>
        <Field label="Title">
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Role">
          <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="agent">Agent</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </Select>
        </Field>
        <Field label="Availability">
          <label className="flex items-center gap-2 text-[14px] text-fg cursor-pointer">
            <input type="checkbox" checked={online} onChange={(e) => setOnline(e.target.checked)} className="accent-accent" />
            Currently online
          </label>
        </Field>
      </div>
    </Modal>
  );
}

function InviteModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("agent");
  const [copied, setCopied] = useState(false);
  const link = `https://supportdesk-lbma-prod.web.app/join?token=${uid("inv")}`;

  return (
    <Modal
      open
      onClose={onClose}
      title="Invite a teammate"
      description="Generates a one-time invite link. (Demo: the link is local and won't actually deliver an email.)"
      footer={
        <Button variant="primary" onClick={onClose}>Done</Button>
      }
    >
      <div className="space-y-4">
        <Field label="Email" required>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="teammate@northwindcloud.com" />
        </Field>
        <Field label="Role">
          <Select value={role} onChange={(e) => setRole(e.target.value as Role)}>
            <option value="agent">Agent</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </Select>
        </Field>
        <Field label="Invite link" hint="Share this with the new teammate.">
          <div className="flex gap-2">
            <Input value={link} readOnly />
            <Button
              variant="secondary"
              onClick={() => {
                navigator.clipboard.writeText(link);
                setCopied(true);
                toast.success("Copied to clipboard");
                setTimeout(() => setCopied(false), 1500);
              }}
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              Copy
            </Button>
          </div>
        </Field>
      </div>
    </Modal>
  );
}
