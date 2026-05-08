import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { useMemo } from "react";

export function Markdown({ children, className }: { children: string; className?: string }) {
  // Render @mentions as visually distinct chips
  const users = useStore((s) => s.users);
  const enriched = useMemo(() => {
    let body = children;
    for (const u of users) {
      const handle = u.name.toLowerCase().replace(/\s+/g, "-");
      const regex = new RegExp(`@${handle}\\b`, "g");
      body = body.replace(regex, `[__@${u.name}__](#mention-${u.id})`);
    }
    return body;
  }, [children, users]);

  return (
    <div className={cn("prose-glass", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a({ href, children, ...rest }) {
            if (href?.startsWith("#mention-")) {
              return (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-accent/15 text-accent text-[0.92em] font-medium">
                  {children}
                </span>
              );
            }
            return (
              <a href={href} target="_blank" rel="noreferrer" {...rest}>
                {children}
              </a>
            );
          },
        }}
      >
        {enriched}
      </ReactMarkdown>
    </div>
  );
}
