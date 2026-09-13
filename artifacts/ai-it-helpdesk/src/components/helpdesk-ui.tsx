import { ArrowUpRight, Check, CircleAlert, Clock3, UserRound } from 'lucide-react';
import type { Ticket } from '@workspace/api-client-react';
import { Link } from 'wouter';

export function Initials({ name, dark = false }: { name?: string | null; dark?: boolean }) {
  const initials = (name || 'Unassigned').split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase();
  return <span className={`grid size-8 shrink-0 place-items-center rounded-full font-mono text-[10px] font-medium ${dark ? 'bg-sidebar-accent text-sidebar-foreground' : 'bg-secondary text-secondary-foreground'}`}>{initials}</span>;
}

export function StatusBadge({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const tone = normalized.includes('resolved') || normalized.includes('closed') ? 'bg-primary/10 text-primary' : normalized.includes('progress') ? 'bg-accent/25 text-accent-foreground' : normalized.includes('waiting') ? 'bg-secondary text-muted-foreground' : 'bg-[#e8edf2] text-foreground';
  return <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 font-mono text-[10px] font-medium uppercase tracking-[.08em] ${tone}`} data-testid={`status-ticket-${status}`}><span className={`size-1.5 rounded-full ${normalized.includes('resolved') || normalized.includes('closed') ? 'bg-primary' : normalized.includes('progress') ? 'bg-accent' : 'bg-muted-foreground/45'}`} />{status}</span>;
}

export function PriorityBadge({ priority }: { priority: string }) {
  const urgent = priority.toLowerCase().includes('urgent') || priority.toLowerCase().includes('high');
  return <span className={`font-mono text-[10px] uppercase tracking-[.1em] ${urgent ? 'text-destructive' : 'text-muted-foreground'}`} data-testid={`priority-ticket-${priority}`}><span className="mr-1.5">•</span>{priority}</span>;
}

export function TicketRow({ ticket }: { ticket: Ticket }) {
  return (
    <Link href={`/tickets/${ticket.id}`} className="group grid grid-cols-[minmax(0,1fr)_130px_120px_110px] items-center gap-4 border-t border-border/70 px-5 py-4 transition-colors hover:bg-secondary/45 sm:px-6" data-testid={`row-ticket-${ticket.id}`}>
      <div className="min-w-0">
        <div className="flex items-center gap-2"><span className="font-mono text-[10px] text-muted-foreground">NS-{String(ticket.id).padStart(4, '0')}</span><PriorityBadge priority={ticket.priority} /></div>
        <p className="mt-1 truncate text-[13px] font-bold text-foreground group-hover:text-primary">{ticket.title}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{ticket.requester} · {ticket.category}</p>
      </div>
      <div className="hidden sm:block"><StatusBadge status={ticket.status} /></div>
      <div className="hidden items-center gap-2 sm:flex"><Initials name={ticket.assignee} /><span className="truncate text-[11px] text-muted-foreground">{ticket.assignee || 'Unassigned'}</span></div>
      <div className="hidden items-center justify-end gap-1.5 text-[11px] text-muted-foreground sm:flex"><Clock3 size={13} />{relativeTime(ticket.updatedAt)}<ArrowUpRight size={13} className="ml-1 opacity-0 transition-opacity group-hover:opacity-100" /></div>
    </Link>
  );
}

export function EmptyState({ title, detail }: { title: string; detail: string }) {
  return <div className="flex min-h-[190px] flex-col items-center justify-center px-6 text-center"><span className="mb-3 grid size-10 place-items-center rounded-xl bg-secondary text-muted-foreground"><Check size={18} /></span><p className="text-sm font-bold">{title}</p><p className="mt-1 max-w-xs text-xs text-muted-foreground">{detail}</p></div>;
}

export function ErrorState({ onRetry }: { onRetry: () => void }) {
  return <div className="flex min-h-[190px] flex-col items-center justify-center px-6 text-center"><span className="mb-3 grid size-10 place-items-center rounded-xl bg-destructive/10 text-destructive"><CircleAlert size={18} /></span><p className="text-sm font-bold">The queue is out of reach</p><p className="mt-1 max-w-xs text-xs text-muted-foreground">Northstar could not load this view. Try reconnecting.</p><button onClick={onRetry} className="mt-4 rounded-lg bg-secondary px-3 py-2 text-xs font-bold hover:bg-secondary/70" data-testid="button-retry">Try again</button></div>;
}

export function SkeletonRows({ count = 4 }: { count?: number }) {
  return <div className="space-y-3 p-5">{Array.from({ length: count }).map((_, index) => <div className="flex animate-pulse items-center gap-4" key={index}><span className="size-8 rounded-full bg-secondary" /><div className="flex-1 space-y-2"><div className="h-2.5 w-2/3 rounded bg-secondary" /><div className="h-2 w-1/3 rounded bg-secondary" /></div><div className="h-5 w-16 rounded bg-secondary" /></div>)}</div>;
}

export function relativeTime(value: string) {
  const delta = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(delta / 60000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-3 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-muted-foreground"><span className="size-1.5 rounded-full bg-primary" />{children}</div>;
}

export function RequesterLine({ name }: { name: string }) {
  return <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"><UserRound size={13} />{name}</span>;
}