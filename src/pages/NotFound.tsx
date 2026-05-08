import { Link } from "react-router-dom";
import { Button } from "@/components/Button";
import { Logo } from "@/components/Logo";

export function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <Logo size={48} />
      <div className="mt-8 inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-border-strong/40">
        <span className="text-[11px] uppercase tracking-wider text-fg-muted">404</span>
      </div>
      <h1 className="mt-4 font-display text-[60px] leading-[1.05] text-fg">
        <span className="italic">Lost</span> in transit.
      </h1>
      <p className="mt-3 text-[15px] text-fg-muted max-w-md">
        That URL doesn't lead anywhere we know about. Either it changed, you typed it from memory, or we shipped a deploy that removed it.
      </p>
      <div className="mt-7 flex gap-2">
        <Link to="/">
          <Button variant="primary" size="lg">
            Back to login
          </Button>
        </Link>
      </div>
    </main>
  );
}
