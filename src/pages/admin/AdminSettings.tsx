import { useEffect, useState } from 'react';
import { loadSLA, saveSLA, type SLASettings } from '@/lib/queries';
import { toast } from 'sonner';
import { Clock, Zap, AlertTriangle, Bell, type LucideIcon } from 'lucide-react';

export function AdminSettings() {
  const [sla, setSla] = useState<SLASettings | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadSLA().then(setSla); }, []);

  async function save() {
    if (!sla) return;
    setSaving(true);
    try {
      await saveSLA(sla);
      toast.success('SLA settings saved');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSaving(false);
    }
  }

  if (!sla) return <div className="max-w-[800px] mx-auto px-6 py-10"><div className="card h-64 animate-pulse" /></div>;

  return (
    <div className="max-w-[800px] mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="eyebrow mb-1">Admin</p>
        <h1 className="text-3xl font-semibold tracking-tight">SLA &amp; reminders</h1>
        <p className="text-fg-muted mt-1">Define response-time targets and how often agents get nudged on aging tickets.</p>
      </div>

      <div className="card p-7 space-y-6">
        <SLAField
          icon={Clock} label="First response target" hint="How quickly an agent should reply for the first time."
          value={sla.firstResponseHours} onChange={(v) => setSla({ ...sla, firstResponseHours: v })} unit="hours"
        />
        <SLAField
          icon={AlertTriangle} label="Resolution target · urgent" hint="Maximum hours to resolve an urgent ticket."
          value={sla.resolveHoursUrgent} onChange={(v) => setSla({ ...sla, resolveHoursUrgent: v })} unit="hours"
        />
        <SLAField
          icon={Zap} label="Resolution target · high" hint="Maximum hours to resolve a high-priority ticket."
          value={sla.resolveHoursHigh} onChange={(v) => setSla({ ...sla, resolveHoursHigh: v })} unit="hours"
        />

        <label className="flex items-start gap-3 p-4 rounded-xl border border-line bg-bg-subtle/40 cursor-pointer">
          <input
            type="checkbox" checked={sla.reminderEnabled}
            onChange={(e) => setSla({ ...sla, reminderEnabled: e.target.checked })}
            className="mt-1 h-4 w-4 rounded accent-[rgb(var(--accent))]"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Bell size={14} className="text-accent" /> Automated SLA reminders
            </div>
            <p className="text-xs text-fg-muted mt-1">Email assignees and escalate to admins when a ticket exceeds its SLA target.</p>
          </div>
        </label>

        <div className="flex justify-end pt-2 border-t border-line">
          <button onClick={save} disabled={saving} className="btn-primary">
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

function SLAField({ icon: Icon, label, hint, value, onChange, unit }: {
  icon: LucideIcon;
  label: string; hint: string; value: number; onChange: (v: number) => void; unit: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="h-10 w-10 rounded-xl bg-accent/10 grid place-items-center shrink-0">
        <Icon size={16} className="text-accent" />
      </div>
      <div className="min-w-0 flex-1">
        <label className="text-sm font-semibold tracking-tight">{label}</label>
        <p className="text-xs text-fg-muted mt-0.5">{hint}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <input
          type="number" min={1} max={720} value={value}
          onChange={(e) => onChange(Math.max(1, Number(e.target.value) || 1))}
          className="input !h-10 !w-24 text-right tnum"
        />
        <span className="text-sm text-fg-muted">{unit}</span>
      </div>
    </div>
  );
}
