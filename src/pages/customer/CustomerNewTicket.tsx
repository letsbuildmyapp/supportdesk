import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { createTicket, listCategories } from '@/lib/queries';
import type { Category, Priority } from '@/lib/types';
import { toast } from 'sonner';
import { ArrowLeft, Paperclip, X } from 'lucide-react';
import { bytes } from '@/lib/utils';
import { CATEGORIES as FALLBACK_CATEGORIES } from '@/lib/seed';

const Schema = z.object({
  subject: z.string().min(4, 'Add a short subject (min 4 chars)').max(140),
  description: z.string().min(10, 'Tell us a bit more (min 10 chars)').max(8000),
  category: z.string().min(1, 'Pick a category'),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
});
type Form = z.infer<typeof Schema>;

export function CustomerNewTicket() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [files, setFiles] = useState<File[]>([]);
  const [cats, setCats] = useState<Category[]>(FALLBACK_CATEGORIES);

  useEffect(() => {
    listCategories().then(c => { if (c.length) setCats(c); }).catch(() => {});
  }, []);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Form>({
    resolver: zodResolver(Schema),
    defaultValues: { priority: 'normal', category: 'technical' },
  });

  async function onSubmit(values: Form) {
    if (!user) return;
    try {
      const id = await createTicket({
        subject: values.subject,
        description: values.description,
        category: values.category,
        priority: values.priority as Priority,
        customer: user,
        files,
      });
      toast.success('Ticket submitted');
      nav(`/t/${id}`);
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <Link to="/tickets" className="inline-flex items-center gap-1.5 text-sm text-fg-muted hover:text-fg mb-6">
        <ArrowLeft size={14} /> Back to tickets
      </Link>

      <p className="eyebrow mb-1">New ticket</p>
      <h1 className="text-3xl font-semibold tracking-tight mb-2">How can we help?</h1>
      <p className="text-fg-muted mb-8">Add as much context as you can — agent replies usually arrive within 2 hours.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="card p-7 sm:p-8 space-y-6">
        <div>
          <label className="label" htmlFor="subject">Subject</label>
          <input id="subject" className="input" placeholder="Short summary of the issue" {...register('subject')} />
          {errors.subject && <p className="text-xs text-danger mt-1.5">{errors.subject.message}</p>}
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          <div>
            <label className="label" htmlFor="category">Category</label>
            <select id="category" className="input" {...register('category')}>
              {cats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="priority">Priority</label>
            <select id="priority" className="input" {...register('priority')}>
              <option value="low">Low — when you have a minute</option>
              <option value="normal">Normal</option>
              <option value="high">High — affecting our work</option>
              <option value="urgent">Urgent — production down</option>
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="description">Description</label>
          <textarea id="description" className="textarea !min-h-[180px]" placeholder="What happened? What did you expect? Any error messages?" {...register('description')} />
          {errors.description && <p className="text-xs text-danger mt-1.5">{errors.description.message}</p>}
        </div>

        <div>
          <label className="label">Attachments (optional)</label>
          <label className="flex items-center justify-center gap-2 h-24 rounded-xl border-2 border-dashed border-line hover:border-accent/40 hover:bg-accent/5 transition-colors cursor-pointer text-sm text-fg-muted">
            <Paperclip size={16} />
            <span>Click or drag files here · max 10MB each</span>
            <input
              type="file" multiple className="hidden"
              onChange={(e) => setFiles(Array.from(e.target.files ?? []))}
            />
          </label>
          {files.length > 0 && (
            <ul className="mt-3 space-y-2">
              {files.map((f, i) => (
                <li key={i} className="flex items-center gap-3 text-sm bg-bg-subtle rounded-lg px-3 py-2">
                  <Paperclip size={14} className="text-fg-subtle" />
                  <span className="truncate flex-1">{f.name}</span>
                  <span className="text-xs text-fg-subtle tnum">{bytes(f.size)}</span>
                  <button type="button" onClick={() => setFiles(files.filter((_, j) => j !== i))} className="text-fg-subtle hover:text-danger">
                    <X size={14} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Link to="/tickets" className="btn-ghost">Cancel</Link>
          <button type="submit" disabled={isSubmitting} className="btn-primary">
            {isSubmitting ? 'Submitting…' : 'Submit ticket'}
          </button>
        </div>
      </form>
    </div>
  );
}
