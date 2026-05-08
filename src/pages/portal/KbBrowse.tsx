import { Link } from "react-router-dom";
import { useState, useMemo } from "react";
import { Search, ArrowRight, Activity } from "lucide-react";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { highlight } from "@/lib/utils";

export function KbBrowse() {
  const store = useStore();
  const [q, setQ] = useState("");
  const [activeCat, setActiveCat] = useState<string | "all">("all");

  const articles = useMemo(() => {
    let xs = store.kbArticles.filter((a) => a.published);
    if (activeCat !== "all") xs = xs.filter((a) => a.categoryId === activeCat);
    if (q.trim()) {
      const ql = q.toLowerCase();
      xs = xs.filter(
        (a) =>
          a.title.toLowerCase().includes(ql) ||
          a.excerpt.toLowerCase().includes(ql) ||
          a.tags.some((t) => t.includes(ql)) ||
          a.body.toLowerCase().includes(ql)
      );
    }
    return xs;
  }, [store.kbArticles, q, activeCat]);

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
      <div className="mb-6">
        <span className="eyebrow">Knowledge base</span>
        <h1 className="font-display text-[36px] sm:text-[48px] leading-tight text-fg mt-1">
          <span className="italic">Answers,</span> indexed.
        </h1>
        <p className="mt-2 text-[15px] text-fg-muted max-w-xl">
          Documentation written by the team that runs the platform. Search or browse by category.
        </p>
      </div>

      <GlassCard variant="strong" className="px-3 sm:px-4 py-3 flex items-center gap-3 mb-6">
        <Search className="w-4 h-4 text-fg-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search articles…"
          className="flex-1 bg-transparent outline-none text-[15px] text-fg placeholder:text-fg-subtle"
        />
      </GlassCard>

      <div className="flex flex-wrap gap-2 mb-6">
        <CatChip label="All" active={activeCat === "all"} onClick={() => setActiveCat("all")} />
        {store.categories.map((c) => (
          <CatChip
            key={c.id}
            label={c.name}
            color={c.color}
            active={activeCat === c.id}
            onClick={() => setActiveCat(c.id)}
          />
        ))}
      </div>

      {articles.length === 0 ? (
        <GlassCard className="px-6 py-12 text-center">
          <p className="text-[15px] text-fg-muted">No articles match.</p>
        </GlassCard>
      ) : (
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          {articles.map((a) => {
            const cat = store.categories.find((c) => c.id === a.categoryId);
            return (
              <li key={a.id}>
                <Link
                  to={`/portal/articles/${a.slug}`}
                  className="group block p-5 rounded-2xl glass-card hover:shadow-glass-lg transition-all h-full"
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
                  <h3
                    className="font-medium text-[17px] text-fg leading-snug group-hover:text-accent transition-colors"
                    dangerouslySetInnerHTML={{ __html: highlight(a.title, q) }}
                  />
                  <p
                    className="mt-1.5 text-[13.5px] text-fg-muted leading-relaxed line-clamp-2"
                    dangerouslySetInnerHTML={{ __html: highlight(a.excerpt, q) }}
                  />
                  <div className="mt-3 inline-flex items-center gap-1 text-[12px] text-accent group-hover:translate-x-0.5 transition-transform">
                    Read article <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

function CatChip({ label, color, active, onClick }: { label: string; color?: string; active?: boolean; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium border transition-colors ${
        active ? "bg-accent text-accent-fg border-accent" : "bg-bg-elevated/40 border-border-strong/50 text-fg-muted hover:text-fg hover:bg-bg-elevated/60"
      }`}
    >
      {color && <span className="w-1.5 h-1.5 rounded-full" style={{ background: `oklch(${color})` }} />}
      {label}
    </button>
  );
}
