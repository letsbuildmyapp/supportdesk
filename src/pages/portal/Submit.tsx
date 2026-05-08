import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Send, ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Field, Input, Select } from "@/components/Input";
import { Button } from "@/components/Button";
import { FileUpload } from "@/components/FileUpload";
import { Markdown } from "@/components/Markdown";
import type { Attachment, TicketPriority } from "@/lib/types";
import { Link } from "react-router-dom";

export function SubmitTicket() {
  const store = useStore();
  const nav = useNavigate();
  const me = store.users.find((u) => u.id === store.currentUserId);
  const fallbackCustomer = me?.role === "customer" ? me : store.users.find((u) => u.id === "c_aisha");

  const [subject, setSubject] = useState("");
  const [categoryId, setCategoryId] = useState(store.categories[0]?.id ?? "");
  const [priority, setPriority] = useState<TicketPriority>("normal");
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<"subject" | "body", string>>>({});

  function validate() {
    const e: Partial<Record<"subject" | "body", string>> = {};
    if (subject.trim().length < 6) e.subject = "Add a more descriptive subject (at least 6 characters).";
    if (body.trim().length < 12) e.body = "Tell us a little more — at least a sentence or two.";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function submit(ev: React.FormEvent) {
    ev.preventDefault();
    if (!fallbackCustomer) return;
    if (!validate()) return;
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600)); // simulated submit
    const t = store.createTicket({
      subject: subject.trim(),
      description: body.trim(),
      customerId: fallbackCustomer.id,
      categoryId,
      priority,
      attachments,
    });
    setSubmitting(false);
    toast.success(`Ticket ${t.id} submitted — we'll be in touch shortly.`);
    nav(`/portal/ticket/${t.id}`);
  }

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
      <Link to="/portal" className="inline-flex items-center gap-1 text-[13px] text-fg-muted hover:text-fg mb-5">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to help
      </Link>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <span className="eyebrow">New ticket</span>
        <h1 className="font-display text-[36px] sm:text-[44px] leading-tight text-fg mt-1">
          <span className="italic">Tell us</span> what's going on.
        </h1>
        <p className="mt-2 text-[14.5px] text-fg-muted max-w-xl">
          A subject, a category, a description. Add a screenshot if it helps. We'll route it to the right person automatically.
        </p>
      </motion.div>

      <form onSubmit={submit} className="mt-8 space-y-5">
        <GlassCard variant="strong" className="p-5 sm:p-6 space-y-5">
          <Field label="Subject" required error={errors.subject}>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Webhook signatures failing on deployment events"
              autoFocus
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Category" required>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
                {store.categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label="Priority" hint="An agent may adjust this based on impact.">
              <Select value={priority} onChange={(e) => setPriority(e.target.value as TicketPriority)}>
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </Field>
          </div>

          <Field label="Description" required error={errors.body} hint="Markdown supported. Steps to reproduce, error messages, screenshots all help.">
            <div className="rounded-xl glass-card overflow-hidden">
              <div className="flex items-center gap-1 px-2 py-1 border-b border-border/40">
                <button
                  type="button"
                  onClick={() => setShowPreview(false)}
                  className={`px-2.5 py-1 rounded-md text-[12px] font-medium ${!showPreview ? "bg-bg-elevated text-fg" : "text-fg-muted hover:text-fg"}`}
                >
                  Write
                </button>
                <button
                  type="button"
                  onClick={() => setShowPreview(true)}
                  className={`px-2.5 py-1 rounded-md text-[12px] font-medium ${showPreview ? "bg-bg-elevated text-fg" : "text-fg-muted hover:text-fg"}`}
                >
                  Preview
                </button>
              </div>
              {showPreview ? (
                <div className="px-4 py-3 min-h-[180px]">
                  {body.trim() ? <Markdown>{body}</Markdown> : <span className="text-fg-subtle text-[14px]">Nothing to preview yet.</span>}
                </div>
              ) : (
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  rows={8}
                  placeholder="What's going on? When did it start? Any error messages, request IDs, or steps to reproduce?"
                  className="w-full bg-transparent border-0 outline-none px-4 py-3 text-[15px] text-fg placeholder:text-fg-subtle resize-y min-h-[180px] font-sans leading-relaxed"
                />
              )}
            </div>
          </Field>

          <Field label="Attachments" hint="Drag and drop or click to add. Up to 8 files.">
            <FileUpload attachments={attachments} onChange={setAttachments} />
          </Field>
        </GlassCard>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          <p className="text-[12px] text-fg-muted sm:flex-1">
            By submitting you'll start a conversation with the support team. You'll receive email updates and can reply at any time.
          </p>
          <div className="flex items-center justify-end gap-2">
            <Button type="button" variant="ghost" size="md" onClick={() => nav("/portal")}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={submitting}>
              <Send className="w-3.5 h-3.5" />
              Submit ticket
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
