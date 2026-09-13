import { useEffect, useState } from 'react';
import { Bell, Check, ChevronDown, Keyboard, Moon, Save, Shield, SlidersHorizontal } from 'lucide-react';
import { SectionLabel } from '@/components/helpdesk-ui';

export default function Settings() {
  const [saved, setSaved] = useState(false);
  const [preferences, setPreferences] = useState({ displayName: 'Maya Chen', defaultPriority: 'Normal', autoAssign: true, activityAlerts: true, compactQueue: false });
  useEffect(() => {
    const stored = localStorage.getItem('northstar-preferences');
    if (stored) setPreferences((current) => ({ ...current, ...JSON.parse(stored) }));
  }, []);
  const update = <K extends keyof typeof preferences>(key: K, value: (typeof preferences)[K]) => setPreferences((current) => ({ ...current, [key]: value }));
  const save = () => { localStorage.setItem('northstar-preferences', JSON.stringify(preferences)); setSaved(true); window.setTimeout(() => setSaved(false), 2600); };
  return (
    <div className="animate-rise-in space-y-7">
      <div><SectionLabel>Workspace / preferences</SectionLabel><h1 className="text-[clamp(1.8rem,4vw,2.65rem)] font-extrabold tracking-[-.06em]">Workspace settings</h1><p className="mt-2 max-w-lg text-sm text-muted-foreground">A few quiet defaults for how Northstar feels during a busy shift.</p></div>
      <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
        <div className="space-y-5">
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-primary/10 text-primary"><SlidersHorizontal size={17} /></span><div><h2 className="text-sm font-extrabold">Workspace defaults</h2><p className="mt-1 text-xs text-muted-foreground">These settings apply to your operator view.</p></div></div><div className="mt-6 space-y-5"><label className="block space-y-2"><span className="text-xs font-bold">Your display name</span><input value={preferences.displayName} onChange={(event) => update('displayName', event.target.value)} className="w-full rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="input-display-name" /></label><label className="block space-y-2"><span className="text-xs font-bold">Default priority for new tickets</span><div className="relative"><select value={preferences.defaultPriority} onChange={(event) => update('defaultPriority', event.target.value)} className="w-full appearance-none rounded-xl border border-input bg-background px-3.5 py-3 text-sm outline-none focus:border-primary focus:ring-4 focus:ring-primary/10" data-testid="select-default-priority"><option>Low</option><option>Normal</option><option>High</option><option>Urgent</option></select><ChevronDown size={15} className="pointer-events-none absolute right-3 top-3.5 text-muted-foreground" /></div></label><ToggleRow label="Suggest an owner automatically" detail="Use queue context to recommend the next best assignee." value={preferences.autoAssign} onChange={(value) => update('autoAssign', value)} testId="toggle-auto-assign" /><ToggleRow label="Activity alerts" detail="Keep a subtle signal when a ticket changes state." value={preferences.activityAlerts} onChange={(value) => update('activityAlerts', value)} testId="toggle-activity-alerts" /><ToggleRow label="Compact queue rows" detail="Fit more requests on screen when scanning the queue." value={preferences.compactQueue} onChange={(value) => update('compactQueue', value)} testId="toggle-compact-queue" /></div><div className="mt-7 flex items-center justify-end gap-3 border-t border-border/70 pt-5">{saved && <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[.12em] text-primary animate-rise-in"><Check size={13} /> Saved locally</span>}<button onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-3 text-xs font-extrabold text-primary-foreground transition-transform hover:-translate-y-0.5" data-testid="button-save-settings"><Save size={14} /> Save preferences</button></div></section>
          <section className="rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-6"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center rounded-xl bg-secondary text-muted-foreground"><Keyboard size={17} /></span><div><h2 className="text-sm font-extrabold">Shortcuts</h2><p className="mt-1 text-xs text-muted-foreground">Small moves that keep you in flow.</p></div></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Shortcut keys="⌘ K" label="Open command search" /><Shortcut keys="G then Q" label="Go to ticket queue" /><Shortcut keys="N" label="New ticket" /><Shortcut keys="R" label="Refresh current view" /></div></section>
        </div>
        <aside className="h-fit rounded-2xl border border-border bg-sidebar p-5 text-sidebar-foreground shadow-sm sm:p-6"><div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.16em] text-sidebar-primary"><Shield size={13} /> Workspace health</div><h2 className="mt-5 text-xl font-extrabold tracking-[-.04em]">Calm tools<br />for busy teams.</h2><p className="mt-3 text-xs leading-relaxed text-sidebar-foreground/55">Northstar keeps the signal close and the noise out. Your preferences stay in this browser.</p><div className="mt-7 space-y-3 border-t border-sidebar-border pt-4"><HealthLine icon={<Bell size={13} />} label="Alerts" value={preferences.activityAlerts ? 'On' : 'Off'} /><HealthLine icon={<Moon size={13} />} label="Theme" value="Light" /><HealthLine icon={<Shield size={13} />} label="Workspace" value="Protected" /></div></aside>
      </div>
    </div>
  );
}

function ToggleRow({ label, detail, value, onChange, testId }: { label: string; detail: string; value: boolean; onChange: (value: boolean) => void; testId: string }) {
  return <div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold">{label}</p><p className="mt-1 max-w-md text-[11px] leading-relaxed text-muted-foreground">{detail}</p></div><button onClick={() => onChange(!value)} className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${value ? 'bg-primary' : 'bg-secondary'}`} aria-pressed={value} data-testid={testId}><span className={`absolute top-1 size-4 rounded-full bg-card shadow-sm transition-transform ${value ? 'translate-x-6' : 'translate-x-1'}`} /></button></div>;
}

function Shortcut({ keys, label }: { keys: string; label: string }) {
  return <div className="flex items-center justify-between rounded-xl bg-secondary/55 px-3.5 py-3"><span className="text-xs font-semibold">{label}</span><kbd className="rounded-md border border-border bg-card px-2 py-1 font-mono text-[10px] text-muted-foreground">{keys}</kbd></div>;
}

function HealthLine({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-center justify-between text-xs"><span className="inline-flex items-center gap-2 text-sidebar-foreground/55">{icon}{label}</span><span className="font-mono text-[10px] text-sidebar-primary">{value}</span></div>;
}