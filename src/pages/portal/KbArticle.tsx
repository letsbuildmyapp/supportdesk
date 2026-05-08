import { Link, useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, MessageSquarePlus, Calendar } from "lucide-react";
import { useStore } from "@/lib/store";
import { GlassCard } from "@/components/Glass";
import { Markdown } from "@/components/Markdown";
import { Button } from "@/components/Button";
import { formatDate } from "@/lib/utils";
import { useEffect } from "react";

export function KbArticleView() {
  const { slug } = useParams();
  const store = useStore();
  const nav = useNavigate();
  const article = store.kbArticles.find((a) => a.slug === slug);

  useEffect(() => {
    if (article) {
      // bump view count locally
      store.upsertArticle({ ...article, views: article.views + 1 });
    }
    // eslint-disable-next-line
  }, [slug]);

  if (!article) {
    return (
      <div className="max-w-3xl mx-auto px-5 sm:px-6 py-16 text-center">
        <h2 className="font-display text-[34px] text-fg italic">Article not found.</h2>
        <Link to="/portal/articles" className="inline-block mt-4 text-accent hover:underline">
          ← Back to knowledge base
        </Link>
      </div>
    );
  }

  const cat = store.categories.find((c) => c.id === article.categoryId);
  const author = store.users.find((u) => u.id === article.authorId);
  const related = store.kbArticles
    .filter((a) => a.id !== article.id && a.categoryId === article.categoryId && a.published)
    .slice(0, 3);

  return (
    <article className="max-w-3xl mx-auto px-5 sm:px-6 py-8 sm:py-12">
      <Link to="/portal/articles" className="inline-flex items-center gap-1 text-[13px] text-fg-muted hover:text-fg mb-5">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to knowledge base
      </Link>

      <div className="flex items-center gap-2 mb-3">
        <span
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: cat ? `oklch(${cat.color})` : "oklch(var(--accent))" }}
        />
        <span className="text-[11px] uppercase tracking-wider text-fg-subtle font-medium">{cat?.name}</span>
      </div>

      <h1 className="font-display text-[40px] sm:text-[52px] leading-[1.05] text-fg text-balance">{article.title}</h1>
      <p className="mt-3 text-[16px] sm:text-[17px] text-fg-muted leading-relaxed">{article.excerpt}</p>

      <div className="mt-5 flex items-center gap-3 text-[12px] text-fg-subtle border-y border-border/60 py-3">
        {author && (
          <span className="flex items-center gap-1.5">
            <img src={author.avatar} alt="" className="w-5 h-5 rounded-full" />
            <span className="text-fg-muted">{author.name}</span>
          </span>
        )}
        <span>·</span>
        <span className="flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Updated {formatDate(article.updatedAt)}
        </span>
        <span>·</span>
        <span className="tabnum">{article.views.toLocaleString()} views</span>
      </div>

      <div className="mt-8 prose-glass">
        <Markdown>{article.body}</Markdown>
      </div>

      <GlassCard variant="strong" className="mt-12 px-5 sm:px-7 py-6 text-center">
        <h3 className="font-display text-[24px] text-fg italic">Didn't quite answer it?</h3>
        <p className="mt-1.5 text-[14px] text-fg-muted">Open a ticket and an agent will follow up directly.</p>
        <Button variant="primary" size="md" className="mt-4" onClick={() => nav("/portal/new")}>
          <MessageSquarePlus className="w-4 h-4" />
          Submit a ticket
        </Button>
      </GlassCard>

      {related.length > 0 && (
        <section className="mt-12">
          <span className="eyebrow">Related</span>
          <h3 className="font-display text-[24px] text-fg mt-1 mb-4">More on {cat?.name}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {related.map((r) => (
              <Link
                key={r.id}
                to={`/portal/articles/${r.slug}`}
                className="block p-4 rounded-2xl glass-card hover:shadow-glass-lg transition-all"
              >
                <h4 className="text-[14.5px] font-medium text-fg leading-snug">{r.title}</h4>
                <p className="mt-1.5 text-[12.5px] text-fg-muted leading-relaxed line-clamp-2">{r.excerpt}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
