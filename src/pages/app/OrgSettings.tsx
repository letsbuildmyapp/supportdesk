import { useState } from "react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Field, Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";

export function OrgSettings() {
  const store = useStore();
  const o = store.orgSettings;
  const [name, setName] = useState(o.name);
  const [tagline, setTagline] = useState(o.tagline);
  const [supportEmail, setSupportEmail] = useState(o.supportEmail);
  const [businessHours, setBusinessHours] = useState(o.businessHours);
  const [logoChar, setLogoChar] = useState(o.logoChar);

  function save() {
    store.setOrgSettings({ name, tagline, supportEmail, businessHours, logoChar });
    toast.success("Settings updated");
  }

  return (
    <div className="px-4 sm:px-6 py-6 max-w-3xl mx-auto">
      <div className="mb-6">
        <span className="eyebrow">Org settings</span>
        <h1 className="font-display text-[36px] sm:text-[44px] leading-tight text-fg mt-1">
          <span className="italic">How</span> we appear.
        </h1>
      </div>

      <GlassCard variant="strong" className="p-5 sm:p-6 mb-4">
        <h2 className="text-[15px] font-medium text-fg mb-4">Brand</h2>
        <div className="flex items-center gap-4 mb-5 pb-5 border-b border-border/60">
          <Logo size={56} />
          <div className="flex-1 min-w-0">
            <div className="font-display text-[22px] text-fg">{name}</div>
            <div className="text-[13px] text-fg-muted">{tagline}</div>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Organisation name"><Input value={name} onChange={(e) => setName(e.target.value)} /></Field>
          <Field label="Logo character" hint="One letter shown inside the logo mark.">
            <Input value={logoChar} maxLength={1} onChange={(e) => setLogoChar(e.target.value.toUpperCase())} />
          </Field>
        </div>
        <div className="mt-4">
          <Field label="Tagline"><Input value={tagline} onChange={(e) => setTagline(e.target.value)} /></Field>
        </div>
      </GlassCard>

      <GlassCard variant="strong" className="p-5 sm:p-6 mb-4">
        <h2 className="text-[15px] font-medium text-fg mb-4">Support</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Support email" hint="The from address on outbound notifications.">
            <Input value={supportEmail} onChange={(e) => setSupportEmail(e.target.value)} />
          </Field>
          <Field label="Business hours" hint="Shown in the help center footer.">
            <Input value={businessHours} onChange={(e) => setBusinessHours(e.target.value)} />
          </Field>
        </div>
      </GlassCard>

      <div className="flex justify-end gap-2">
        <Button variant="primary" onClick={save}>Save settings</Button>
      </div>
    </div>
  );
}
