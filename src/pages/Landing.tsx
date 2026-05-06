import { Link } from 'react-router-dom';
import { ArrowRight, MessageSquare, Zap, Inbox, Users, Headphones } from 'lucide-react';
import { useAuth } from '@/lib/auth';

export function Landing() {
  const { user } = useAuth();
  return (
    <div className="min-h-screen flex flex-col bg-bg">
      <header className="h-16 border-b border-line bg-bg-panel/85 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-[1200px] mx-auto h-full px-6 flex items-center">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-accent grid place-items-center shadow-soft">
              <Headphones size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="font-semibold tracking-tight text-[17px]">SupportDesk</span>
          </Link>
          <nav className="ml-auto flex items-center gap-2">
            {user ? (
              <Link to="/home" className="btn-primary">Open dashboard <ArrowRight size={15} /></Link>
            ) : (
              <>
                <Link to="/login" className="btn">Sign in</Link>
                <Link to="/login" className="btn-primary">Try the demo <ArrowRight size={15} /></Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="px-6 pt-20 pb-24">
          <div className="max-w-[1200px] mx-auto text-center">
            <div className="inline-flex items-center gap-2 h-7 px-3 rounded-full border border-line bg-bg-panel mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
              <span className="eyebrow !text-fg-muted">Demo · live ticket data</span>
            </div>
            <h1 className="text-4xl sm:text-6xl font-semibold tracking-tight max-w-3xl mx-auto leading-[1.05]">
              Support that doesn't feel like <span className="text-accent">software.</span>
            </h1>
            <p className="mt-6 text-lg sm:text-xl text-fg-muted max-w-2xl mx-auto leading-relaxed">
              Customer tickets in. Calm, organized replies out. SupportDesk is the SaaS support portal your customers actually thank you for.
            </p>
            <div className="mt-10 flex items-center justify-center gap-3">
              <Link to="/login" className="btn-primary !h-12 !px-6 text-base">Try the demo <ArrowRight size={16} /></Link>
              <a href="#features" className="btn !h-12 !px-6 text-base">See how it works</a>
            </div>
          </div>
        </section>

        <section id="features" className="px-6 pb-24">
          <div className="max-w-[1200px] mx-auto grid md:grid-cols-3 gap-5">
            {[
              { icon: Inbox, title: 'Tickets, organized', body: 'Customers submit. Agents triage by priority, status, or assignee. Nothing falls through.' },
              { icon: MessageSquare, title: 'Threads with private notes', body: 'Public reply or internal note — toggle in the same composer. Teammates see notes, customers do not.' },
              { icon: Zap, title: 'Email notifications', body: 'New ticket, reply, status change. Resend-powered, with a fixture fallback when keys are missing.' },
              { icon: Users, title: 'Three roles, one workspace', body: 'Customer portal, agent queue, admin dashboard — same data, role-aware UI.' },
              { icon: Headphones, title: 'Built for SaaS support', body: 'Categories, SLA reminders, agent leaderboard, average response time. The KPIs you actually report on.' },
              { icon: ArrowRight, title: '⌘K and keyboard-first', body: 'Search any ticket, jump to any view, switch theme, sign out. Without lifting your hands.' },
            ].map((f, i) => (
              <div key={i} className="card p-7">
                <div className="h-11 w-11 rounded-xl bg-accent/10 grid place-items-center mb-5">
                  <f.icon size={20} className="text-accent" />
                </div>
                <h3 className="text-lg font-semibold tracking-tight">{f.title}</h3>
                <p className="mt-2 text-[15px] text-fg-muted leading-relaxed">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 pb-24">
          <div className="max-w-[1200px] mx-auto card p-10 sm:p-14 text-center bg-gradient-to-br from-bg-panel to-bg-subtle">
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight">See it from every angle.</h2>
            <p className="mt-4 text-lg text-fg-muted max-w-xl mx-auto">One-click into the customer, agent, or admin view. Fully populated demo — file an actual ticket, watch a teammate reply.</p>
            <Link to="/login" className="btn-primary !h-12 !px-6 text-base mt-8 inline-flex">Open the demo <ArrowRight size={16} /></Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-line bg-bg-panel/50 py-6 px-6">
        <div className="max-w-[1200px] mx-auto flex items-center justify-between text-xs text-fg-subtle">
          <span>SupportDesk · portfolio demo</span>
          <a href="https://letsbuildmyapp.com" className="text-accent hover:underline">Built by letsbuildmyapp.com</a>
        </div>
      </footer>
    </div>
  );
}
