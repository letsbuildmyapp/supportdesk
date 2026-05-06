import { Link } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

export function ServerError() {
  return (
    <div className="min-h-screen grid place-items-center px-6 bg-bg">
      <div className="text-center max-w-md">
        <div className="h-16 w-16 rounded-2xl bg-danger/10 grid place-items-center mx-auto mb-6">
          <AlertTriangle size={28} className="text-danger" />
        </div>
        <p className="eyebrow mb-2">500</p>
        <h1 className="text-3xl font-semibold tracking-tight">Something went wrong.</h1>
        <p className="text-fg-muted mt-3 leading-relaxed">An error occurred on our end. We've been notified and we're looking into it.</p>
        <Link to="/" className="btn-primary inline-flex mt-7"><ArrowLeft size={15} /> Back home</Link>
      </div>
    </div>
  );
}
