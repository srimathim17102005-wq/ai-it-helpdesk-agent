import { useMemo, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ArrowRight, Bot, ChevronRight, CircleCheck, Clock3, Plus, Send, ShieldAlert, Sparkles, Ticket as TicketIcon, TrendingUp, X } from 'lucide-react';
import { Link } from 'wouter';
import { getGetHelpdeskDashboardQueryKey, getListHelpdeskActivityQueryKey, getListTicketsQueryKey, useCreateTicket, useDiagnoseIssue, useGetHelpdeskDashboard, useListHelpdeskActivity, useListTickets } from '@workspace/api-client-react';
import { EmptyState, ErrorState, relativeTime, SectionLabel, SkeletonRows, StatusBadge, TicketRow } from '@/components/helpdesk-ui';

export default function Home() {
  const queryClient = useQueryClient();
  const dashboard = useGetHelpdeskDashboard();
  const tickets = useListTickets({}, { query: { queryKey: getListTicketsQueryKey({}) } });
  const activity = useListHelpdeskActivity();
  const diagnose = useDiagnoseIssue();
  const createTicket = useCreateTicket();
  const [issue, setIssue] = useState('');
  const [diagnosis, setDiagnosis] = useState<Awaited<ReturnType<typeof import('@workspace/api-client-react').diagnoseIssue>> | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [notice, setNotice] = useState('');
  const [newTicket, setNewTicket] = useState({ title: '', description: '', category: 'Access', priority: 'Normal', requester: '' });
  const recentTickets = useMemo(() => (tickets.data || []).slice(0, 4), [tickets.data]);

  const runDiagnosis = () => {
    if (!issue.trim()) return;
    diagnose.mutate({ data: { message: issue.trim() } }, { onSuccess: (result) => setDiagnosis(result) });
  };
  const submitTicket = (event: React.FormEvent) => {
    event.preventDefault();
    if (!newTicket.title || !newTicket.description || !newTicket.requester) return;
    createTicket.mutate({ data: newTicket }, {
      onSuccess: () => {
        setShowCreate(false);
        setNotice('Ticket created and added to the queue.');
        setNewTicket({ title: '', description: '', category: 'Access', priority: 'Normal', requester: '' });
        queryClient.invalidateQueries({ queryKey: getListTicketsQueryKey({}) });
        queryClient.invalidateQueries({ queryKey: getGetHelpdeskDashboardQueryKey() });
        queryClient.invalidateQueries({ queryKey: getListHelpdeskActivityQueryKey() });
        window.setTimeout(() => setNotice(''), 3500);
      },
    });
  };
  const stats = dashboard.data;

  return (
    <div className="animate-rise-in space-y-8">
      <section className="relative overflow-hidden rounded-[22px] bg-sidebar px-6 py-7 text-sidebar-foreground shadow-xl shadow-sidebar/10 sm:px-9 sm:py-9">
        <div className="absolute -right-12 -top-24 size-72 rounded-full border-[32px] border-sidebar-primary/10" />
        <div className="absolute right-16 top-10 size-28 rounded-full border border-sidebar-primary/20" />
        <div className="relative max-w-2xl">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.2em] text-sidebar-primary"><span className="size-1.5 rounded-full bg-sidebar-primary animate-pulse-line" /> Northstar agent is watching</div>
          <h1 className="mt-4 max-w-xl text-[clamp(1.9rem,4vw,3.25rem)] font-extrabold leading-[1.05] tracking-[-0.06em]">Let’s get you<br /><span className="text-sidebar-primary">unstuck.</span></h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-sidebar-foreground/60">Describe what’s getting in the way. I’ll find the likely path, then hand the right context to IT when you need a human.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <button onClick={() => document.getElementById('diagnosis-box')?.focus()} className="inline-flex items-center gap-2 rounded-xl bg-sidebar-primary px-4 py-3 text-xs font-extrabold text-sidebar-primary-foreground transition-transform hover:-translate-y-0.5" data-testid="button-start-diagnosis"><Sparkles size={15} /> Diagnose an issue <ArrowRight size={14} /></button>
            <button onClick={() => setShowCreate(true)} className="inline-flex items-center gap-2 rounded-xl border border-sidebar-foreground/15 bg-sidebar-foreground/5 px-4 py-3 text-xs font-bold text-sidebar-foreground transition-colors hover:bg-sidebar-foreground/10" data-testid="button-new-ticket"><Plus size={15} /> Open a ticket</button>
          </div>
        </div>
        <div className="absolute bottom-8 right-9 hidden w-52 lg:block">
          <div className="mb-2 flex items-center justify-between font-mono text-[9px] uppercase tracking-[.16em] text-sidebar-foreground/40"><span>Queue signal</span><span className="text-sidebar-primary">stable</span></div>
          <div className="flex h-14 items-end gap-1.5">{[26, 38, 30, 46, 38, 49, 43, 58, 51, 64, 56, 70, 63, 76, 71, 80].map((height, index) => <span key={index} className="flex-1 rounded-t-sm bg-sidebar-primary/30" style={{ height: `${height}%` }} />)}</div>
        </div>
      </section>

      <section id="diagnosis-box" className="grid gap-5 lg:grid-cols-[1.35fr_.65fr]">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6">
          <div className="flex items-start justify-between gap-3"><div><SectionLabel>Guided resolution</SectionLabel><h2 className="text-lg font-extrabold tracking-[-.03em]">What’s happening?</h2><p className="mt-1 text-xs text-muted-foreground">Start with the symptoms, not the solution.</p></div><span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><Bot size={19} /></span></div>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <textarea id="diagnosis-box" value={issue} onChange={(event) => setIssue(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) runDiagnosis(); }} placeholder="For example: I can’t connect to the office VPN from my laptop..." className="min-h-[102px] flex-1 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm outline-none transition-shadow placeholder:text-muted-foreground/60 focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="input-diagnosis" />
            <button onClick={runDiagnosis} disabled={diagnose.isPending || !issue.trim()} className="inline-flex h-fit items-center justify-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-extrabold text-primary-foreground transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50 sm:self-end" data-testid="button-run-diagnosis">{diagnose.isPending ? 'Thinking…' : 'Find a path'} <Send size={14} /></button>
          </div>
          {diagnosis && <div className="mt-5 rounded-xl border border-primary/20 bg-primary/5 p-4 animate-rise-in" data-testid="panel-diagnosis-result"><div className="flex flex-wrap items-center justify-between gap-2"><span className="font-mono text-[10px] uppercase tracking-[.14em] text-primary">Suggested path</span><span className="rounded-md bg-primary/10 px-2 py-1 font-mono text-[10px] text-primary">{Math.round(diagnosis.confidence * 100)}% confidence</span></div><p className="mt-2 text-sm font-semibold leading-relaxed">{diagnosis.summary}</p><ol className="mt-3 space-y-2">{diagnosis.steps.map((step, index) => <li key={step} className="flex gap-2 text-xs text-muted-foreground"><span className="grid size-5 shrink-0 place-items-center rounded-full bg-card font-mono text-[10px] font-bold text-primary shadow-sm">{index + 1}</span><span>{step}</span></li>)}</ol><div className="mt-4 flex flex-wrap items-center gap-2 border-t border-primary/10 pt-3"><span className="font-mono text-[10px] text-muted-foreground">ROUTE AS</span><span className="rounded-md bg-card px-2 py-1 text-[10px] font-bold">{diagnosis.suggestedCategory}</span><span className="rounded-md bg-card px-2 py-1 text-[10px] font-bold">{diagnosis.suggestedPriority}</span>{diagnosis.needsEscalation && <span className="inline-flex items-center gap-1 text-[10px] font-bold text-destructive"><ShieldAlert size={12} /> Human review recommended</span>}</div></div>}
          {diagnose.isError && <p className="mt-3 text-xs font-semibold text-destructive">Diagnosis is temporarily unavailable. You can still open a ticket below.</p>}
        </div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"><SectionLabel>Quick context</SectionLabel><div className="mt-5 space-y-4"><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Average response</span><span className="font-mono text-sm font-medium">{stats ? `${stats.avgResponseMinutes} min` : '—'}</span></div><div className="h-px bg-border/70" /><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Resolved today</span><span className="font-mono text-sm font-medium text-primary">{stats?.resolvedToday ?? '—'}</span></div><div className="h-px bg-border/70" /><div className="flex items-center justify-between"><span className="text-xs text-muted-foreground">Urgent in queue</span><span className="font-mono text-sm font-medium text-destructive">{stats?.urgentTickets ?? '—'}</span></div></div><Link href="/tickets" className="mt-7 flex items-center justify-between rounded-xl bg-secondary px-3.5 py-3 text-xs font-bold transition-colors hover:bg-secondary/70" data-testid="link-view-queue">View the live queue <ChevronRight size={15} /></Link></div>
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.35fr_.65fr]">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"><div className="flex items-center justify-between px-5 py-5 sm:px-6"><div><SectionLabel>Recent tickets</SectionLabel><h2 className="text-lg font-extrabold tracking-[-.03em]">Context from the queue</h2></div><Link href="/tickets" className="font-mono text-[10px] uppercase tracking-[.13em] text-primary hover:underline" data-testid="link-all-tickets">See all tickets</Link></div><div className="hidden grid-cols-[minmax(0,1fr)_130px_120px_110px] gap-4 border-y border-border/70 bg-secondary/30 px-5 py-2.5 font-mono text-[9px] uppercase tracking-[.14em] text-muted-foreground sm:grid sm:px-6"><span>Issue</span><span>Status</span><span>Owner</span><span className="text-right">Updated</span></div>{tickets.isLoading ? <SkeletonRows /> : tickets.isError ? <ErrorState onRetry={() => tickets.refetch()} /> : recentTickets.length ? recentTickets.map((ticket) => <TicketRow key={ticket.id} ticket={ticket} />) : <EmptyState title="The queue is clear" detail="No tickets have come through yet. That is a good signal." />}</div>
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><SectionLabel>Signal mix</SectionLabel><h2 className="text-lg font-extrabold tracking-[-.03em]">Where help is going</h2></div><TrendingUp size={17} className="text-primary" /></div>{dashboard.isLoading ? <div className="mt-6 space-y-4"><div className="h-4 animate-pulse rounded bg-secondary" /><div className="h-4 animate-pulse rounded bg-secondary" /><div className="h-4 animate-pulse rounded bg-secondary" /></div> : dashboard.isError ? <ErrorState onRetry={() => dashboard.refetch()} /> : <div className="mt-6 space-y-4">{(stats?.categoryBreakdown || []).slice(0, 5).map((item, index) => { const max = Math.max(...(stats?.categoryBreakdown || []).map((entry) => entry.count), 1); return <div key={item.category}><div className="mb-1.5 flex justify-between text-xs"><span className="font-semibold">{item.category}</span><span className="font-mono text-muted-foreground">{item.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-secondary"><div className={`h-full rounded-full ${index === 0 ? 'bg-primary' : index === 1 ? 'bg-chart-3' : index === 2 ? 'bg-accent' : 'bg-muted-foreground/40'}`} style={{ width: `${(item.count / max) * 100}%` }} /></div></div> })}</div>}</div>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="flex items-center justify-between"><div><SectionLabel>Live trail</SectionLabel><h2 className="text-lg font-extrabold tracking-[-.03em]">What the team is moving</h2></div><Link href="/activity" className="font-mono text-[10px] uppercase tracking-[.13em] text-primary hover:underline" data-testid="link-all-activity">Open activity log</Link></div><div className="mt-5 grid gap-4 md:grid-cols-3">{activity.isLoading ? <SkeletonRows count={3} /> : (activity.data || []).slice(0, 3).map((item) => <div key={item.id} className="relative rounded-xl bg-secondary/55 p-4"><div className="flex items-center gap-2"><span className="grid size-7 place-items-center rounded-lg bg-card text-primary"><CircleCheck size={14} /></span><span className="font-mono text-[10px] text-muted-foreground">{relativeTime(item.createdAt)}</span></div><p className="mt-3 text-xs font-semibold leading-relaxed">{item.message}</p><p className="mt-2 text-[10px] text-muted-foreground">{item.actor}{item.ticketId ? ` · NS-${String(item.ticketId).padStart(4, '0')}` : ''}</p></div>)}</div></section>

      {showCreate && <div className="fixed inset-0 z-50 grid place-items-center bg-sidebar/45 p-4 backdrop-blur-sm"><form onSubmit={submitTicket} className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-2xl animate-rise-in" data-testid="form-create-ticket"><div className="flex items-start justify-between"><div><SectionLabel>New request</SectionLabel><h2 className="text-xl font-extrabold tracking-[-.04em]">Open a ticket</h2></div><button type="button" onClick={() => setShowCreate(false)} className="rounded-lg p-2 text-muted-foreground hover:bg-secondary" aria-label="Close form" data-testid="button-close-create-ticket"><X size={17} /></button></div><div className="mt-5 space-y-3"><input value={newTicket.title} onChange={(event) => setNewTicket({ ...newTicket, title: event.target.value })} placeholder="Short issue title" className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="input-ticket-title" /><textarea value={newTicket.description} onChange={(event) => setNewTicket({ ...newTicket, description: event.target.value })} placeholder="What do you need help with?" className="min-h-24 w-full resize-none rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="input-ticket-description" /><div className="grid gap-3 sm:grid-cols-2"><input value={newTicket.requester} onChange={(event) => setNewTicket({ ...newTicket, requester: event.target.value })} placeholder="Requester name" className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="input-ticket-requester" /><select value={newTicket.category} onChange={(event) => setNewTicket({ ...newTicket, category: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="select-ticket-category"><option>Access</option><option>Hardware</option><option>Software</option><option>Network</option><option>Security</option></select></div><select value={newTicket.priority} onChange={(event) => setNewTicket({ ...newTicket, priority: event.target.value })} className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="select-ticket-priority"><option>Normal</option><option>High</option><option>Urgent</option><option>Low</option></select></div><div className="mt-5 flex items-center justify-between gap-3"><span className="text-xs text-destructive">{createTicket.isError ? 'Could not create ticket. Try again.' : notice}</span><button type="submit" disabled={createTicket.isPending} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-extrabold text-primary-foreground disabled:opacity-50" data-testid="button-submit-ticket">{createTicket.isPending ? 'Opening…' : 'Open ticket'}<TicketIcon size={14} /></button></div></form></div>}
    </div>
  );
}