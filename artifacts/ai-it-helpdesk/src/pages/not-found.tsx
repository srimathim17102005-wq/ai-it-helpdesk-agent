import { ArrowLeft, Compass } from 'lucide-react';
import { Link } from 'wouter';

export default function NotFound() {
  return (
    <div className="grid min-h-[70dvh] place-items-center">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 text-center shadow-sm">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary"><Compass size={22} /></span>
        <p className="mt-5 font-mono text-[10px] uppercase tracking-[.18em] text-primary">Signal lost · 404</p>
        <h1 className="mt-3 text-2xl font-extrabold tracking-[-.04em]">This path went quiet.</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">That page is not part of the Northstar workspace. Let’s get you back to the command center.</p>
        <Link href="/" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-extrabold text-primary-foreground" data-testid="link-not-found-home"><ArrowLeft size={14} /> Return to command center</Link>
      </div>
    </div>
  );
}
