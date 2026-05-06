import { Link } from 'react-router-dom';
import { ArrowLeft, Search } from 'lucide-react';

export function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center px-6 bg-bg">
      <div className="text-center max-w-md">
        <div className="h-16 w-16 rounded-2xl bg-accent/10 grid place-items-center mx-auto mb-6">
          <Search size={28} className="text-accent" />
        </div>
        <p className="eyebrow mb-2">404</p>
        <h1 className="text-3xl font-semibold tracking-tight">Page not found.</h1>
        <p className="text-fg-muted mt-3 leading-relaxed">The page you're looking for moved, was renamed, or never existed.</p>
        <Link to="/" className="btn-primary inline-flex mt-7"><ArrowLeft size={15} /> Back home</Link>
      </div>
    </div>
  );
}
