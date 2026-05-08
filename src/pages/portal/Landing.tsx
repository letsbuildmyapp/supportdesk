import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Search, BookOpen, MessageSquarePlus, Inbox, ArrowRight, Activity } from "lucide-react";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Button } from "@/components/Button";
import { search as searchData } from "@/lib/search";
import { highlight } from "@/lib/utils";

export function PortalLanding() {
  const store = useStore();
  const me = store.users.find((u) => u.id === store.currentUserId);
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const data = store;

  const hits = useMemo(() => searchData(data, q).slice(0, 8), [data, q]);
  const popular = useMemo(
    () => [...store.kbArticles].filter((a) => a.published).sort((a, b) => b.views - a.views).slice(0, 6),
    [store.kbArticles]
  );
  const myOpen = me ? store.tickets.filter((t) => t.customerId === me.id && t.status !== "closed") : [];

  return (
    <div className="relative">
      {/* Hero */}
      <section className="px-5 sm:px-6 pt-10 pb-12 sm:pt-16 sm:pb-16 max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-12"
        >
          <h1 className="font-display text-[40px] sm:text-[64px] leading-[1.05] text-fg text-balance">
            How can we <span className="italic">help</span>?
          </h1>
          <p className="mt-3 sm:mt-4 text-[16px] sm:text-[18px] text-fg-muted max-w-xl mx-auto leading-relaxed">
            Search the knowledge base, browse popular articles, or open a ticket and we'll get on it.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="relative max-w-2xl mx-auto"
        >
          <GlassCard variant="strong" className="px-3 sm:px-4 py-3 flex items-center gap-3" data-tour="portal-search">
            <Search className="w-5 h-5 text-fg-muted" />
            <input
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search articles or your past tickets…"
              className="flex-1 bg-transparent outline-none text-[16px] text-fg placeholder:text-fg-subtle py-1"
              autoFocus
            />
            {q && (
              <button onClick={() => setQ("")} className="text-[12px] text-fg-muted hover:text-fg px-2 py-1 rounded-md hover:bg-bg-elevated/50">
                Clear
              </button>
            )}
          </GlassCard>

          {q && hits.length > 0 && (
            <GlassCard variant="strong" className="mt-2 absolute left-0 right-0 z-20 max-h-[60vh] overflow-y-auto">
              <ul className="py-1.5">
                {hits.map((h) => {
                  if (h.kind === "article") {
                    return (
                      <li key={h.article.id}>
                        <Link
                          to={`/portal/articles/${h.article.slug}`}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-bg-elevated/50 transition-colors border-b border-border/40 last:border-b-0"
                        >
                          <BookOpen className="w-4 h-4 mt-0.5 text-fg-muted shrink-0" />
                          <div className="min-w-0">
                            <div
                              className="text-[14px] text-fg"
                              dangerouslySetInnerHTML={{ __html: highlight(h.article.title, q) }}
                            />
                            <div className="text-[12px] text-fg-muted truncate">{h.article.excerpt}</div>
                          </div>
                        </Link>
                      </li>
                    );
                  }
                  if (h.kind === "ticket" && me && h.ticket.customerId === me.id) {
                    return (
                      <li key={h.ticket.id}>
                        <Link
                          to={`/portal/ticket/${h.ticket.id}`}
                          className="flex items-start gap-3 px-4 py-2.5 hover:bg-bg-elevated/50 transition-colors border-b border-border/40 last:border-b-0"
                        >
                          <Inbox className="w-4 h-4 mt-0.5 text-fg-muted shrink-0" />
                          <div className="min-w-0">
                            <div className="text-[14px] text-fg">{h.ticket.subject}</div>
                            <div className="text-[12px] text-fg-muted">
                              {h.ticket.id} · {h.ticket.status}
                            </div>
                          </div>
                        </Link>
                      </li>
                    );
                  }
                  return null;
                })}
              </ul>
            </GlassCard>
          )}
          {q && hits.length === 0 && (
            <GlassCard className="mt-2 px-4 py-6 text-center text-[14px] text-fg-muted">
              Nothing matched. Try different keywords or{" "}
              <Link to="/portal/new" className="text-accent hover:underline">
                submit a ticket
              </Link>
              .
            </GlassCard>
          )}
        </motion.div>

        {/* Quick actions */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          <ActionTile
            to="/portal/articles"
            icon={<BookOpen className="w-5 h-5" />}
            title="Browse articles"
            description="Documentation, guides, and answers to common questions."
          />
          <ActionTile
            to="/portal/new"
            icon={<MessageSquarePlus className="w-5 h-5" />}
            title="Submit a ticket"
            description="Open a new ticket and an agent will pick it up shortly."
            primary
          />
          <ActionTile
            to="/portal/my-tickets"
            icon={<Inbox className="w-5 h-5" />}
            title="My tickets"
            description={myOpen.length ? `${myOpen.length} open · view your full history` : "View your full history of past requests."}
          />
        </div>
      </section>

      {/* Popular articles */}
      <section className="px-5 sm:px-6 pb-16 max-w-5xl mx-auto">
        <div className="flex items-end justify-between mb-5">
          <div>
            <span className="eyebrow">Popular this month</span>
            <h2 className="font-display text-[28px] sm:text-[34px] text-fg mt-1">Most-read articles</h2>
          </div>
          <Link to="/portal/articles" className="text-[13px] text-accent hover:underline flex items-center gap-1">
            All articles <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {popular.map((a) => {
            const cat = store.categories.find((c) => c.id === a.categoryId);
            return (
              <Link
                key={a.id}
                to={`/portal/articles/${a.slug}`}
                className="group block p-5 rounded-2xl glass-card hover:shadow-glass-lg transition-all"
              >
                <div className="flex items-center gap-1.5 mb-2">
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full"
                    style={{ background: cat ? `oklch(${cat.color})` : "oklch(var(--accent))" }}
                  />
                  <span className="text-[11px] uppercase tracking-wider text-fg-subtle font-medium">{cat?.name}</span>
                  <span className="ml-auto text-[11px] text-fg-subtle tabnum">
                    <Activity className="inline w-3 h-3 mr-0.5" />
                    {a.views.toLocaleString()}
                  </span>
                </div>
                <h3 className="font-medium text-[17px] text-fg leading-snug group-hover:text-accent transition-colors">
                  {a.title}
                </h3>
                <p className="mt-1.5 text-[13.5px] text-fg-muted leading-relaxed line-clamp-2">{a.excerpt}</p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="px-5 sm:px-6 pb-16 max-w-5xl mx-auto">
        <GlassCard variant="strong" className="px-6 sm:px-10 py-8 sm:py-10 text-center">
          <span className="eyebrow">Still need help?</span>
          <h3 className="font-display text-[28px] sm:text-[34px] text-fg italic mt-2">We're a few minutes away.</h3>
          <p className="mt-2 text-[14.5px] text-fg-muted max-w-md mx-auto">
            Average first response under 4 hours on Standard, under 30 minutes on VIP. Submit a ticket and we'll get on it.
          </p>
          <div className="mt-5 flex justify-center">
            <Button variant="primary" size="lg" onClick={() => nav("/portal/new")}>
              Open a new ticket
            </Button>
          </div>
        </GlassCard>
      </section>
    </div>
  );
}

function ActionTile({
  to,
  icon,
  title,
  description,
  primary,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  primary?: boolean;
}) {
  return (
    <Link
      to={to}
      className={`group relative block p-5 rounded-2xl glass-card overflow-hidden hover:shadow-glass-lg transition-all ${
        primary ? "ring-1 ring-accent/40" : ""
      }`}
    >
      {primary && (
        <span
          className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-32 rounded-full blur-3xl opacity-40 group-hover:opacity-80 transition-opacity"
          style={{ background: "oklch(var(--accent) / 0.5)" }}
        />
      )}
      <div className="relative flex items-start gap-3">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-bg-elevated/60 border border-border/60 text-fg shrink-0">
          {icon}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-medium text-fg group-hover:text-accent transition-colors">{title}</h3>
          <p className="mt-1 text-[13px] text-fg-muted leading-relaxed">{description}</p>
        </div>
        <ArrowRight className="w-4 h-4 text-fg-muted group-hover:text-accent group-hover:translate-x-0.5 transition-all shrink-0 mt-1" />
      </div>
    </Link>
  );
}
