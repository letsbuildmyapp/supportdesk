import { useEffect, useState } from 'react';
import { listCategories, upsertCategory } from '@/lib/queries';
import type { Category } from '@/lib/types';
import { Plus, Tag } from 'lucide-react';
import { toast } from 'sonner';

const PALETTE = ['#f97316', '#0ea5e9', '#10b981', '#a855f7', '#f43f5e', '#eab308', '#06b6d4', '#8b5cf6', '#f59e0b'];

export function AdminCategories() {
  const [cats, setCats] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [color, setColor] = useState(PALETTE[0]);

  useEffect(() => { listCategories().then(setCats); }, []);

  async function add() {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = trimmed.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    if (cats.find(c => c.id === id)) {
      toast.error('A category with that ID already exists');
      return;
    }
    const cat: Category = { id, name: trimmed, color };
    await upsertCategory(cat);
    setCats([...cats, cat]);
    setName('');
    toast.success('Category added');
  }

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">
      <div className="mb-8">
        <p className="eyebrow mb-1">Admin</p>
        <h1 className="text-3xl font-semibold tracking-tight">Categories</h1>
        <p className="text-fg-muted mt-1">Customers pick from this list when opening a ticket.</p>
      </div>

      <div className="card p-7 mb-6">
        <p className="eyebrow mb-3">Add a category</p>
        <div className="grid sm:grid-cols-[1fr_auto_auto] gap-3 items-start">
          <input className="input" placeholder="e.g., Onboarding" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && add()} />
          <div className="flex items-center gap-1.5 h-11">
            {PALETTE.map(c => (
              <button
                key={c} onClick={() => setColor(c)} aria-label={`Color ${c}`}
                className={`h-7 w-7 rounded-lg border-2 transition-all ${color === c ? 'border-fg scale-110' : 'border-transparent'}`}
                style={{ background: c }}
              />
            ))}
          </div>
          <button onClick={add} className="btn-primary"><Plus size={15} /> Add</button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <ul className="divide-y divide-line">
          {cats.length === 0 ? (
            <li className="p-12 text-center text-fg-muted">No categories yet.</li>
          ) : cats.map(c => (
            <li key={c.id} className="flex items-center gap-4 p-5">
              <div className="h-10 w-10 rounded-xl grid place-items-center" style={{ background: `${c.color}20` }}>
                <Tag size={16} style={{ color: c.color }} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[15px] font-semibold tracking-tight">{c.name}</div>
                <div className="text-xs text-fg-subtle font-mono">{c.id}</div>
              </div>
              <div className="h-2 w-12 rounded-full" style={{ background: c.color }} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
