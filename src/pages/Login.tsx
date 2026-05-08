import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { ArrowRight, Loader2, Headphones, UserRound, Inbox, ShieldCheck } from 'lucide-react';
import { QUICK_TILES, SEED_USERS, DEMO_PASSWORD } from '@/lib/seed';

const TILE_META: Record<string, { icon: any; color: string }> = {
  Customer: { icon: UserRound, color: 'from-emerald-500 to-teal-500' },
  Agent: { icon: Inbox, color: 'from-amber-500 to-orange-500' },
  Admin: { icon: ShieldCheck, color: 'from-indigo-500 to-violet-500' },
};

export function Login() {
  const { signIn } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await signIn(email, password);
      toast.success('Signed in');
      nav('/home');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function onDemoLogin(uid: string) {
    const seed = SEED_USERS.find((x) => x.uid === uid);
    if (!seed) return;
    setEmail(seed.email);
    setPassword(DEMO_PASSWORD);
    setDemoLoading(uid);
    try {
      await signIn(seed.email, DEMO_PASSWORD);
      toast.success(`Signed in as ${seed.role}`);
      nav('/home');
    } catch (err) {
      toast.error((err as Error).message + ' — did you run `npm run seed`?');
    } finally {
      setDemoLoading(null);
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col bg-bg">
      <header className="relative z-10 flex items-center justify-between px-6 py-5 sm:px-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-xl bg-accent grid place-items-center shadow-soft">
            <Headphones size={16} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold tracking-tight">SupportDesk</span>
        </Link>
        <span className="text-xs text-fg-subtle">
          Need help?{' '}
          <a href="mailto:hello@letsbuildmyapp.com?subject=SupportDesk%20support" className="text-fg underline-offset-4 hover:underline">
            Contact support
          </a>
        </span>
      </header>

      <main className="relative z-10 flex flex-1 items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="w-full max-w-[440px]"
        >
          <div className="rounded-2xl border border-line bg-bg-panel/90 p-8 shadow-2xl backdrop-blur-sm">
            <div className="space-y-1.5">
              <h1 className="text-2xl font-semibold tracking-tight">Sign in to SupportDesk</h1>
              <p className="text-sm text-fg-muted">Pick a role — see the whole product in 30 seconds.</p>
            </div>

            <div className="my-6 grid gap-2">
              <div className="mb-1 flex items-center justify-between">
                <span className="eyebrow">One-click demo logins</span>
                <span className="text-[10px] text-fg-subtle">No password needed</span>
              </div>
              {QUICK_TILES.map((tile) => {
                const meta = TILE_META[tile.label] ?? TILE_META.Customer;
                const Icon = meta.icon;
                return (
                  <button
                    key={tile.uid}
                    type="button"
                    onClick={() => onDemoLogin(tile.uid)}
                    disabled={demoLoading !== null || loading}
                    className="group flex items-center gap-3 rounded-xl border border-line bg-bg/60 p-3 text-left transition-colors hover:border-accent hover:bg-accent/5 disabled:opacity-50"
                  >
                    <div className={`flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${meta.color} text-white shadow-sm`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-semibold tracking-tight">{tile.label}</div>
                      <div className="truncate text-xs text-fg-subtle">{tile.tagline}</div>
                    </div>
                    {demoLoading === tile.uid ? (
                      <Loader2 size={14} className="animate-spin text-fg-subtle" />
                    ) : (
                      <ArrowRight size={14} className="text-fg-subtle transition-transform group-hover:translate-x-0.5" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-line" />
              </div>
              <div className="relative flex justify-center text-xs uppercase tracking-wider">
                <span className="bg-bg-panel px-3 text-fg-subtle">or sign in with email</span>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="label" htmlFor="email">Email</label>
                <input id="email" className="input" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@supportdesk.demo" />
              </div>
              <div>
                <label className="label" htmlFor="password">Password</label>
                <input id="password" className="input" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full !h-11">
                {loading ? <Loader2 size={15} className="animate-spin" /> : (<>Sign in <ArrowRight size={15} /></>)}
              </button>
            </form>
          </div>
        </motion.div>
      </main>

      <footer className="relative z-10 px-6 pb-8 text-center text-xs text-fg-subtle sm:px-10">
        <a href="https://letsbuildmyapp.com" target="_blank" rel="noreferrer" className="font-medium text-fg underline-offset-4 hover:underline">
          Let&apos;s Build My App
        </a>
      </footer>
    </div>
  );
}
