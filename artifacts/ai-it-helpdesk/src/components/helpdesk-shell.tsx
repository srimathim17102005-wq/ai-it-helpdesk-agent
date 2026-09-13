import { Bell, ChevronDown, Command, Headphones, LayoutDashboard, ListFilter, Settings2, Activity as ActivityIcon, X } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useState } from 'react';

const navItems = [
  { href: '/', label: 'Command center', icon: LayoutDashboard },
  { href: '/tickets', label: 'Ticket queue', icon: ListFilter },
  { href: '/activity', label: 'Activity', icon: ActivityIcon },
  { href: '/settings', label: 'Workspace', icon: Settings2 },
];

export function HelpdeskShell({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <div className="grain app-shell min-h-[100dvh] text-foreground">
      <aside className={`fixed inset-y-0 left-0 z-40 flex w-[248px] flex-col bg-sidebar px-4 py-5 text-sidebar-foreground transition-transform duration-200 lg:translate-x-0 ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-2">
          <Link href="/" className="flex items-center gap-3" data-testid="link-brand">
            <span className="grid size-9 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-black/10">
              <Headphones size={18} strokeWidth={2.5} />
            </span>
            <span>
              <span className="block text-[15px] font-extrabold tracking-[-0.03em]">northstar</span>
              <span className="block font-mono text-[9px] uppercase tracking-[.2em] text-sidebar-foreground/50">IT operations</span>
            </span>
          </Link>
          <button className="rounded-lg p-2 text-sidebar-foreground/60 hover:bg-sidebar-accent lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close navigation" data-testid="button-close-navigation"><X size={17} /></button>
        </div>
        <div className="mt-9 px-2 font-mono text-[10px] uppercase tracking-[.18em] text-sidebar-foreground/40">Workspace</div>
        <nav className="mt-3 space-y-1">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === '/' ? location === '/' : location.startsWith(href);
            return (
              <Link key={href} href={href} onClick={() => setMobileOpen(false)} className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-[13px] font-semibold transition-all ${active ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_3px_0_0_hsl(var(--sidebar-primary))]' : 'text-sidebar-foreground/62 hover:bg-sidebar-accent/70 hover:text-sidebar-foreground'}`} data-testid={`link-nav-${label.toLowerCase().replaceAll(' ', '-')}`}>
                <Icon size={17} strokeWidth={active ? 2.3 : 1.8} />
                <span>{label}</span>
                {label === 'Ticket queue' && <span className="ml-auto rounded-md bg-sidebar-primary/15 px-1.5 py-0.5 font-mono text-[10px] text-sidebar-primary">live</span>}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto">
          <div className="mb-4 rounded-2xl border border-sidebar-border bg-sidebar-accent/60 p-3.5">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-sidebar-primary animate-pulse-line" />
              <span className="font-mono text-[10px] uppercase tracking-[.15em] text-sidebar-primary">Agent online</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-sidebar-foreground/55">Watching the queue and ready to route the next issue.</p>
          </div>
          <div className="flex items-center gap-3 border-t border-sidebar-border px-2 pt-4">
            <span className="grid size-8 place-items-center rounded-full bg-accent font-mono text-xs font-medium text-accent-foreground">MC</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-bold text-sidebar-foreground">Maya Chen</p>
              <p className="truncate text-[10px] text-sidebar-foreground/45">IT operations lead</p>
            </div>
            <ChevronDown size={14} className="text-sidebar-foreground/40" />
          </div>
        </div>
      </aside>
      {mobileOpen && <button className="fixed inset-0 z-30 bg-sidebar/40 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu" data-testid="button-overlay-close" />}
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[68px] items-center justify-between border-b border-border/70 bg-background/85 px-5 backdrop-blur-md sm:px-8">
          <div className="flex items-center gap-3">
            <button className="rounded-lg border border-border bg-card p-2 text-muted-foreground lg:hidden" onClick={() => setMobileOpen(true)} aria-label="Open navigation" data-testid="button-open-navigation"><Command size={16} /></button>
            <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-muted-foreground sm:flex"><span className="size-1.5 rounded-full bg-primary" /> Northstar workspace <span className="text-border">/</span> {location === '/' ? 'Overview' : location.slice(1).split('/')[0]}</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative rounded-lg p-2 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground" aria-label="Notifications" data-testid="button-notifications"><Bell size={17} /><span className="absolute right-1.5 top-1.5 size-1.5 rounded-full bg-accent" /></button>
            <div className="ml-2 hidden h-6 w-px bg-border sm:block" />
            <span className="hidden text-xs font-semibold text-muted-foreground sm:block">Tuesday, June 18</span>
          </div>
        </header>
        <main className="mx-auto max-w-[1440px] px-5 py-7 sm:px-8 sm:py-9">{children}</main>
      </div>
    </div>
  );
}