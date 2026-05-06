import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { ArrowRight, Headphones } from 'lucide-react';
import { QUICK_TILES, SEED_USERS, DEMO_PASSWORD } from '@/lib/seed';

export function Login() {
  const { signIn, signInGoogle } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('admin@supportdesk.demo');
  const [password, setPassword] = useState(DEMO_PASSWORD);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    try {
      await signIn(email, password);
      toast.success('Signed in');
      nav('/home');
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  async function googleIn() {
    setPending(true);
    try { await signInGoogle(); nav('/home'); } catch (e) { toast.error((e as Error).message); } finally { setPending(false); }
  }

  async function quick(uid: string) {
    const seed = SEED_USERS.find(x => x.uid === uid);
    if (!seed) return;
    setEmail(seed.email);
    setPassword(DEMO_PASSWORD);
    setPending(true);
    try {
      await signIn(seed.email, DEMO_PASSWORD);
      toast.success(`Signed in as ${seed.role}`);
      nav('/home');
    } catch (err) {
      toast.error((err as Error).message + ' — did you run `npm run seed`?');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-[1.1fr_1fr]">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-gradient-to-br from-bg-subtle to-bg text-fg">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-accent grid place-items-center shadow-soft">
            <Headphones size={18} className="text-white" strokeWidth={2.5} />
          </div>
          <span className="font-semibold tracking-tight text-[17px]">SupportDesk</span>
        </Link>

        <div className="max-w-md">
          <p className="eyebrow mb-4">Live demo</p>
          <h2 className="text-4xl font-semibold tracking-tight leading-[1.1]">
            Pick a role.<br />
            See the <span className="text-accent">whole product</span><br />
            in 30 seconds.
          </h2>
          <p className="mt-6 text-fg-muted leading-relaxed">
            Each role gets its own workspace — customer portal, agent queue, admin dashboard — wired to live data.
          </p>
        </div>

        <div className="text-xs text-fg-subtle">Demo build · seeded · safe to break</div>
      </div>

      <div className="flex items-center justify-center p-6 sm:p-12 bg-bg-panel">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2.5 mb-10">
            <div className="h-9 w-9 rounded-xl bg-accent grid place-items-center shadow-soft">
              <Headphones size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold tracking-tight text-[17px]">SupportDesk</span>
          </Link>

          <p className="eyebrow mb-2">Sign in</p>
          <h1 className="text-3xl font-semibold tracking-tight mb-8">Welcome back.</h1>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input id="email" className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
            </div>
            <div>
              <label className="label" htmlFor="password">Password</label>
              <input id="password" className="input" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
            </div>
            <button type="submit" disabled={pending} className="btn-primary w-full !h-11">
              {pending ? 'Signing in…' : (<>Continue <ArrowRight size={15} /></>)}
            </button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="flex-1 h-px bg-line" />
            <span className="text-xs text-fg-subtle">or</span>
            <div className="flex-1 h-px bg-line" />
          </div>

          <button onClick={googleIn} disabled={pending} className="btn w-full !h-11">Continue with Google</button>

          <div className="mt-10">
            <p className="eyebrow mb-3">One-click demo accounts</p>
            <div className="grid sm:grid-cols-3 gap-2.5">
              {QUICK_TILES.map((tile) => (
                <button
                  key={tile.uid}
                  type="button"
                  onClick={() => quick(tile.uid)}
                  disabled={pending}
                  className="text-left rounded-xl border border-line bg-bg-panel hover:border-accent hover:bg-accent/5 transition-colors p-4 disabled:opacity-50 disabled:pointer-events-none"
                >
                  <div className="text-sm font-semibold tracking-tight">{tile.label}</div>
                  <div className="text-[12px] text-fg-subtle mt-1 leading-snug">{tile.tagline}</div>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-fg-subtle mt-3">Password for all demo accounts: <span className="font-mono text-fg-muted">{DEMO_PASSWORD}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
