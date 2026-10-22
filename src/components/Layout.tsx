import { ReactNode, useEffect, useState } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { CHAPTERS, LESSONS, LABS } from '../content/course';
import { useProgress } from '../store/progress';
import { getUser, switchUser } from '../store/user';

export function useCountdown(target: string) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(t);
  }, []);
  const ms = new Date(target).getTime() - now;
  const days = Math.floor(ms / 86400000);
  const hours = Math.floor((ms % 86400000) / 3600000);
  return { ms, days, hours };
}

function NavItem({ to, children, done, end }: { to: string; children: ReactNode; done?: boolean; end?: boolean }) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-2 rounded-md px-2 py-1 text-[13px] transition-colors ${isActive ? 'bg-accent/10 font-medium text-accent' : 'text-ink/80 hover:bg-sunk hover:text-ink'}`
      }
    >
      {done !== undefined && <span className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${done ? 'bg-good' : 'bg-line'}`} aria-hidden />}
      <span className="truncate">{children}</span>
    </NavLink>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const done = useProgress((s) => s.lessonsDone);
  return (
    <nav className="space-y-5 px-3 py-4" onClick={(e) => (e.target as HTMLElement).closest('a') && onNavigate?.()} aria-label="Hovedmeny">
      <div className="space-y-0.5">
        <NavItem to="/" end>
          Dashbord
        </NavItem>
        <NavItem to="/fremgang">Fremgang og svake temaer</NavItem>
      </div>
      {CHAPTERS.map((ch) => (
        <div key={ch.id}>
          <Link to={`/kapittel/${ch.id}`} className="label mb-1 block px-2 hover:text-ink">
            {ch.title}
          </Link>
          <div className="space-y-0.5">
            {LESSONS.filter((l) => l.chapter === ch.id).map((l) => (
              <NavItem key={l.id} to={`/leksjon/${l.id}`} done={!!done[l.id]}>
                {l.title}
              </NavItem>
            ))}
            {LABS.filter((l) => l.chapter === ch.id).map((l) => (
              <NavItem key={l.id} to={`/lab/${l.id}`}>
                <span className="text-obj">◆</span> {l.title}
              </NavItem>
            ))}
            <NavItem to={`/oppgaver?kapittel=${ch.id}`}>
              <span className="text-dual">✎</span> Oppgaver
            </NavItem>
          </div>
        </div>
      ))}
      <div>
        <div className="label mb-1 px-2">Midtveiseksamen</div>
        <div className="space-y-0.5">
          <NavItem to="/eksamen">Eksamenssimulator</NavItem>
          <NavItem to="/repetisjon">Repetisjon (flashcards)</NavItem>
          <NavItem to="/formelark">Formelark (A4)</NavItem>
          <NavItem to="/oppgaver">Alle oppgaver</NavItem>
        </div>
      </div>
      <div>
        <div className="label mb-1 px-2">Om kurset</div>
        <NavItem to="/kildeoversikt">Kildeoversikt og pensumkart</NavItem>
      </div>
    </nav>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const theme = useProgress((s) => s.theme);
  const setTheme = useProgress((s) => s.setTheme);
  const examDate = useProgress((s) => s.examDate);
  const cd = useCountdown(examDate);
  const loc = useLocation();
  useEffect(() => setOpen(false), [loc.pathname]);
  const wide = loc.pathname.startsWith('/lab') || loc.pathname.startsWith('/eksamen/');
  return (
    <div className="min-h-screen">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-panel focus:px-3 focus:py-2">
        Hopp til innhold
      </a>
      <header className="no-print sticky top-0 z-30 flex h-12 items-center gap-3 border-b border-line bg-panel/90 px-3 backdrop-blur">
        <button className="btn-ghost lg:hidden" onClick={() => setOpen((o) => !o)} aria-label="Meny" aria-expanded={open}>
          ☰
        </button>
        <Link to="/" className="flex items-center gap-2 font-semibold tracking-tight">
          <svg width="22" height="22" viewBox="0 0 32 32" aria-hidden>
            <rect width="32" height="32" rx="6" fill="rgb(var(--ink))" />
            <path d="M6 26 L6 8 L20 8 L26 16 L18 26 Z" fill="rgb(var(--feas))" opacity="0.9" />
            <circle cx="20" cy="8" r="3" fill="rgb(var(--opt))" />
          </svg>
          <span>IEDA3010</span>
          <span className="hidden text-sm font-normal text-mute sm:inline">Prescriptive Analytics</span>
        </Link>
        <div className="ml-auto flex items-center gap-2">
          {cd.ms > 0 ? (
            <span className="hidden rounded-md border border-line px-2 py-0.5 text-xs text-mute sm:inline" title={new Date(examDate).toLocaleString('nb-NO')}>
              Midtveis om <strong className="text-ink">{cd.days} d {cd.hours} t</strong>
            </span>
          ) : (
            <span className="hidden text-xs text-mute sm:inline">Midtveiseksamen er gjennomført</span>
          )}
          <button className="btn-ghost" onClick={() => switchUser(null)} title="Bytt bruker">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/15 text-xs font-semibold text-accent">{getUser()?.[0]}</span>
            <span className="hidden sm:inline">{getUser()}</span>
          </button>
          <button className="btn-ghost" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} aria-label="Bytt fargetema" title="Lyst/mørkt tema">
            {theme === 'dark' ? '☀' : '☾'}
          </button>
        </div>
      </header>
      <div className="flex">
        <aside className={`no-print fixed inset-y-12 left-0 z-20 w-64 shrink-0 overflow-y-auto border-r border-line bg-panel transition-transform lg:sticky lg:top-12 lg:h-[calc(100vh-3rem)] lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar onNavigate={() => setOpen(false)} />
        </aside>
        {open && <div className="fixed inset-0 z-10 bg-black/30 lg:hidden" onClick={() => setOpen(false)} aria-hidden />}
        <main id="main" className={`min-w-0 flex-1 px-4 py-6 md:px-8 ${wide ? '' : ''}`}>
          <div className={wide ? 'mx-auto max-w-[1400px]' : 'mx-auto max-w-5xl'}>{children}</div>
        </main>
      </div>
    </div>
  );
}
