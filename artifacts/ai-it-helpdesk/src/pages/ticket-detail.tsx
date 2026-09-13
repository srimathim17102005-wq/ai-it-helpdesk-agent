import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CalendarDays, Check, ChevronDown, Clock3, LoaderCircle, Save, ShieldAlert, UserRound } from 'lucide-react';
import { Link, useParams } from 'wouter';
import { getGetTicketQueryKey, getListTicketsQueryKey, useGetTicket, useUpdateTicket } from '@workspace/api-client-react';
import { Initials, PriorityBadge, SectionLabel, StatusBadge } from '@/components/helpdesk-ui';

export default function TicketDetail() {
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);
  const queryClient = useQueryClient();
  const ticketQuery = useGetTicket(ticketId, { query: { enabled: Number.isFinite(ticketId), queryKey: getGetTicketQueryKey(ticketId) } });
  const updateTicket = useUpdateTicket();
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [assignee, setAssignee] = useState('');
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (ticketQuery.data) {
      setStatus(ticketQuery.data.status);
      setPriority(ticketQuery.data.priority);
      setAssignee(ticketQuery.data.assignee || '');
    }
  }, [ticketQuery.data]);
  const saveChanges = () => {
    updateTicket.mutate({ id: ticketId, data: { status, priority, assignee: assignee || null } }, {
      onSuccess: (updated) => {
        queryClient.setQueryData(getGetTicketQueryKey(ticketId), updated);
        queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey() });
        setSaved(true);
        window.setTimeout(() => setSaved(false), 2600);
      },
    });
  };
  if (ticketQuery.isLoading) return <div className="animate-rise-in space-y-5"><div className="h-4 w-24 animate-pulse rounded bg-secondary" /><div className="h-48 animate-pulse rounded-2xl bg-secondary" /><div className="grid gap-5 lg:grid-cols-[1fr_300px]"><div className="h-72 animate-pulse rounded-2xl bg-secondary" /><div className="h-72 animate-pulse rounded-2xl bg-secondary" /></div></div>;
  if (ticketQuery.isError || !ticketQuery.data) return <div className="rounded-2xl border border-border bg-card p-10 text-center"><ShieldAlert className="mx-auto text-destructive" /><h1 className="mt-4 text-lg font-extrabold">Ticket not found</h1><p className="mt-2 text-sm text-muted-foreground">This request may have moved or is temporarily unavailable.</p><Link href="/tickets" className="mt-5 inline-flex rounded-xl bg-primary px-4 py-3 text-xs font-bold text-primary-foreground" data-testid="link-back-queue">Back to queue</Link></div>;
  const ticket = ticketQuery.data;
  return (
    <div className="animate-rise-in space-y-6">
      <Link href="/tickets" className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.13em] text-muted-foreground transition-colors hover:text-primary" data-testid="link-back-tickets"><ArrowLeft size={14} /> Back to queue</Link>
      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"><div className="flex flex-col justify-between gap-5 lg:flex-row"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="font-mono text-[10px] text-muted-foreground">NS-{String(ticket.id).padStart(4, '0')}</span><PriorityBadge priority={ticket.priority} /><StatusBadge status={ticket.status} /></div><h1 className="mt-4 max-w-3xl text-[clamp(1.45rem,3vw,2.35rem)] font-extrabold leading-tight tracking-[-.05em]">{ticket.title}</h1><p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground">{ticket.description}</p></div><div className="flex shrink-0 items-start gap-3"><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Clock3 size={18} /></span><div><p className="font-mono text-[10px] uppercase tracking-[.12em] text-muted-foreground">Last updated</p><p className="mt-1 text-xs font-bold">{new Date(ticket.updatedAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p></div></div></div><div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3 border-t border-border/70 pt-5"><span className="inline-flex items-center gap-2 text-xs text-muted-foreground"><UserRound size={14} /> Requested by <strong className="text-foreground">{ticket.requester}</strong></span><span className="inline-flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays size={14} /> Opened {new Date(ticket.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span><span className="rounded-md bg-secondary px-2 py-1 font-mono text-[10px] uppercase tracking-[.1em]">{ticket.category}</span></div></section>
      <div className="grid gap-5 lg:grid-cols-[1fr_310px]">
        <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><SectionLabel>Resolution controls</SectionLabel><h2 className="text-lg font-extrabold tracking-[-.03em]">Move this request forward</h2></div>{saved && <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2 py-1 font-mono text-[10px] text-primary animate-rise-in"><Check size={12} /> Saved</span>}</div><div className="mt-6 grid gap-5 sm:grid-cols-2"><label className="space-y-2"><span className="text-xs font-bold">Status</span><div className="relative"><select value={status} onChange={(event) => setStatus(event.target.value)} className="w-full appearance-none rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="select-ticket-status"><option>Open</option><option>In Progress</option><option>Waiting</option><option>Resolved</option><option>Closed</option></select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3.5 text-muted-foreground" /></div></label><label className="space-y-2"><span className="text-xs font-bold">Priority</span><div className="relative"><select value={priority} onChange={(event) => setPriority(event.target.value)} className="w-full appearance-none rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="select-ticket-detail-priority"><option>Urgent</option><option>High</option><option>Normal</option><option>Low</option></select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3.5 text-muted-foreground" /></div></label></div><label className="mt-5 block space-y-2"><span className="text-xs font-bold">Assigned to</span><div className="relative"><select value={assignee} onChange={(event) => setAssignee(event.target.value)} className="w-full appearance-none rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="select-ticket-assignee"><option value="">Unassigned</option><option value="Maya Chen">Maya Chen</option><option value="Jon Bell">Jon Bell</option><option value="Priya Nair">Priya Nair</option><option value="Leo Martinez">Leo Martinez</option></select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3.5 text-muted-foreground" /></div></label><button onClick={saveChanges} disabled={updateTicket.isPending} className="mt-6 inline-flex w-fit items-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-extrabold text-primary-foreground transition-transform hover:-translate-y-0.5 disabled:opacity-50" data-testid="button-save-ticket">{updateTicket.isPending ? <LoaderCircle size={14} className="animate-spin" /> : <Save size={14} />} {updateTicket.isPending ? 'Saving…' : 'Save changes'}</button>{updateTicket.isError && <p className="mt-3 text-xs font-semibold text-destructive">Could not save this update. Please try again.</p>}</section>
        <aside className="h-fit rounded-2xl border border-border bg-sidebar p-5 text-sidebar-foreground shadow-sm sm:p-6"><SectionLabel>Current owner</SectionLabel><div className="mt-4 flex items-center gap-3"><Initials name={ticket.assignee} dark /><div><p className="text-sm font-bold">{ticket.assignee || 'Unassigned'}</p><p className="mt-0.5 text-[11px] text-sidebar-foreground/50">{ticket.assignee ? 'Working this request' : 'Needs a next owner'}</p></div></div><div className="mt-6 border-t border-sidebar-border pt-4"><div className="flex justify-between text-[11px]"><span className="text-sidebar-foreground/50">Category</span><span className="font-semibold">{ticket.category}</span></div><div className="mt-3 flex justify-between text-[11px]"><span className="text-sidebar-foreground/50">Requester</span><span className="font-semibold">{ticket.requester}</span></div></div></aside>
      </div>
    </div>
  );
}