import { useState, useEffect, useRef } from 'react';
import { Cable, Save, Trash2, Search, MapPin, ShieldCheck, AlertTriangle, RefreshCw, ExternalLink, BookOpen } from 'lucide-react';
import { tw, typography, cn } from '../../lib/colors';

interface PhaseRecord {
  id: number;
  voltage_system: string;
  phase: string;
  region: string;
  jobsite_note: string;
  verified_color: string;
  expected_color: string;
  neutral_color: string;
  ground_color: string;
  convention_notes: string;
  source_hint: string;
  status: string;
  summary: string;
  created_at?: string;
}

interface SearchResult {
  title: string;
  link: string;
  snippet: string;
  position?: number;
}

declare global {
  interface Window {
    useWorkspaceDB: <T = any>(
      table: string,
      options?: { shared?: boolean; limit?: number; offset?: number; orderBy?: { column: string; direction: 'asc' | 'desc' }; filters?: Array<{ column: string; operator: string; value: any }> }
    ) => { data: T[]; loading: boolean; error: Error | null; total: number; refresh: () => void };
    __workspaceDb: any;
  }
}

const PHASES = ['A / L1', 'B / L2', 'C / L3', 'Neutral', 'Ground / PE'];
const VOLTAGE_SYSTEMS = ['120/208V Wye', '120/240V Split-phase', '277/480V Wye', '347/600V Wye', '230/400V IEC', '240/415V UK/AU'];
const REGIONS = ['US NEC — 120/208V', 'US NEC — 277/480V', 'Canada CEC', 'IEC / EU', 'UK BS 7671', 'Australia / New Zealand', 'Jobsite custom'];

const CONVENTIONS: Record<string, { colors: Record<string, string>; neutral: string; ground: string; notes: string; sourceHint: string }> = {
  'us-low': {
    colors: { 'A / L1': 'Black', 'B / L2': 'Red', 'C / L3': 'Blue', Neutral: 'White or gray', 'Ground / PE': 'Green, green/yellow, or bare' },
    neutral: 'White or gray',
    ground: 'Green, green/yellow, or bare',
    notes: 'Common US low-voltage branch-circuit convention. Local practice and existing installations vary; verify against drawings, labels, and AHJ requirements.',
    sourceHint: 'NEC identification rules and common US 120/208V practice',
  },
  'us-high': {
    colors: { 'A / L1': 'Brown', 'B / L2': 'Orange', 'C / L3': 'Yellow', Neutral: 'Gray', 'Ground / PE': 'Green, green/yellow, or bare' },
    neutral: 'Gray',
    ground: 'Green, green/yellow, or bare',
    notes: 'Common US 277/480V convention. Orange may indicate high-leg only in some delta systems; verify system type before relying on color.',
    sourceHint: 'Common US 277/480V field convention plus NEC identification requirements',
  },
  canada: {
    colors: { 'A / L1': 'Red', 'B / L2': 'Black', 'C / L3': 'Blue', Neutral: 'White', 'Ground / PE': 'Green or bare' },
    neutral: 'White',
    ground: 'Green or bare',
    notes: 'Common Canadian phase convention. Confirm with CEC requirements, engineered drawings, and site labels.',
    sourceHint: 'Common CEC field convention',
  },
  iec: {
    colors: { 'A / L1': 'Brown', 'B / L2': 'Black', 'C / L3': 'Gray', Neutral: 'Blue', 'Ground / PE': 'Green/yellow' },
    neutral: 'Blue',
    ground: 'Green/yellow',
    notes: 'IEC harmonized conductor colors: L1 brown, L2 black, L3 gray, neutral blue, protective earth green/yellow.',
    sourceHint: 'IEC harmonized conductor color convention',
  },
  uk: {
    colors: { 'A / L1': 'Brown', 'B / L2': 'Black', 'C / L3': 'Grey', Neutral: 'Blue', 'Ground / PE': 'Green/yellow' },
    neutral: 'Blue',
    ground: 'Green/yellow',
    notes: 'Current UK harmonized colors. Legacy UK installations may use red/yellow/blue phases and black neutral; verify before modifying existing circuits.',
    sourceHint: 'BS 7671 harmonized conductor color convention',
  },
  au: {
    colors: { 'A / L1': 'Brown', 'B / L2': 'Black', 'C / L3': 'Grey', Neutral: 'Blue', 'Ground / PE': 'Green/yellow' },
    neutral: 'Blue',
    ground: 'Green/yellow',
    notes: 'Common AU/NZ active conductor colors align with harmonized brown/black/grey, neutral blue, earth green/yellow. Verify local standards and site markings.',
    sourceHint: 'Common AS/NZS conductor color convention',
  },
  custom: {
    colors: { 'A / L1': 'Record verified color', 'B / L2': 'Record verified color', 'C / L3': 'Record verified color', Neutral: 'Record verified neutral', 'Ground / PE': 'Record verified ground' },
    neutral: 'Record verified neutral',
    ground: 'Record verified ground',
    notes: 'Custom jobsite reference. Use this when drawings, labels, legacy colors, or owner standards override a typical convention.',
    sourceHint: 'Jobsite verified reference',
  },
};

function resolveConvention(region: string, voltageSystem: string) {
  if (region.includes('US NEC') && (region.includes('277/480') || voltageSystem.includes('277/480'))) return CONVENTIONS['us-high'];
  if (region.includes('US NEC')) return CONVENTIONS['us-low'];
  if (region.includes('Canada')) return CONVENTIONS.canada;
  if (region.includes('IEC')) return CONVENTIONS.iec;
  if (region.includes('UK')) return CONVENTIONS.uk;
  if (region.includes('Australia')) return CONVENTIONS.au;
  return CONVENTIONS.custom;
}

function normalize(value: string) {
  return value.toLowerCase().replace(/gray/g, 'grey').replace(/[^a-z/ ]/g, '').trim();
}

function getStatus(verifiedColor: string, expectedColor: string) {
  if (!verifiedColor.trim()) return 'Needs field verification';
  if (expectedColor.startsWith('Record verified')) return 'Custom verified';
  const verified = normalize(verifiedColor);
  const expectedParts = normalize(expectedColor).split(/or|\//).map((item) => item.trim()).filter(Boolean);
  return expectedParts.some((part) => verified.includes(part) || part.includes(verified)) ? 'Verified match' : 'Field mismatch';
}

export default function PhaseLookup() {
  const { data: savedReferences, loading, error, refresh } = window.useWorkspaceDB<PhaseRecord>('phase_lookup', {
    orderBy: { column: 'created_at', direction: 'desc' },
    limit: 100,
  });

  const [voltageSystem, setVoltageSystem] = useState('120/208V Wye');
  const [phase, setPhase] = useState('A / L1');
  const [region, setRegion] = useState('US NEC — 120/208V');
  const [jobsiteNote, setJobsiteNote] = useState('Verify before landing conductors at panel.');
  const [verifiedColor, setVerifiedColor] = useState('');
  const [busy, setBusy] = useState(false);
  const [searchBusy, setSearchBusy] = useState(false);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchError, setSearchError] = useState('');
  const noteRef = useRef<HTMLInputElement | null>(null);

  const convention = resolveConvention(region, voltageSystem);
  const expectedColor = convention.colors[phase] || 'Verify on site';
  const status = getStatus(verifiedColor, expectedColor);
  const isMismatch = status === 'Field mismatch';
  const summary = `${voltageSystem} • ${region}: ${phase} is commonly identified as ${expectedColor}. Field verified: ${verifiedColor.trim() || 'not recorded'}. ${status}.`;

  useEffect(() => {
    setSearchResults([]);
    setSearchError('');
  }, [voltageSystem, phase, region]);

  const handleSave = async () => {
    setBusy(true);
    try {
      await window.__workspaceDb.from('phase_lookup').insert({
        voltage_system: voltageSystem,
        phase,
        region,
        jobsite_note: jobsiteNote,
        verified_color: verifiedColor,
        expected_color: expectedColor,
        neutral_color: convention.neutral,
        ground_color: convention.ground,
        convention_notes: convention.notes,
        source_hint: convention.sourceHint,
        status,
        summary,
      });
      refresh();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    await window.__workspaceDb.from('phase_lookup').delete(id);
    refresh();
  };

  const handleSearch = async () => {
    setSearchBusy(true);
    setSearchError('');
    try {
      const query = `${region} ${voltageSystem} ${phase} electrical phase color code conductor identification`;
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, searchType: 'web', num: 4, location: 'United States', language: 'en' }),
      });
      const data = await response.json();
      if (!data.success) throw new Error(data.error || 'Search failed');
      setSearchResults(data.results || []);
    } catch (err: any) {
      setSearchError(err?.message || 'Search unavailable. Use the built-in convention notes and verify locally.');
    } finally {
      setSearchBusy(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col w-full bg-transparent">
      <div className="relative overflow-hidden border-b border-[var(--space-border-default)] bg-[var(--space-surface-card)]">
        <div className="absolute -left-14 top-10 h-px w-64 rotate-12 bg-[var(--space-border-strong)]" />
        <div className="absolute -left-8 top-20 h-px w-72 rotate-12 bg-[var(--space-brand-primary-200)]" />
        <div className="absolute right-4 top-4 grid grid-cols-3 gap-1 opacity-80">
          {['L1', 'L2', 'L3'].map((item, index) => (
            <span key={item} className={cn('rounded-full px-2 py-1 text-[10px] font-bold', index === 0 ? tw.badge.primary : index === 1 ? tw.badge.accent : tw.badge.neutral)}>{item}</span>
          ))}
        </div>
        <div className="relative p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1', tw.bg.accent, typography.color.accent, typography.size.xs, typography.weight.semibold)}>
                <Cable className="h-3.5 w-3.5" /> Phase identification
              </div>
              <h1 className={cn('text-2xl font-bold tracking-tight', typography.color.brand)}>Phase Lookup</h1>
              <p className={cn('mt-1 max-w-md text-sm', typography.color.secondary)}>Reference color conventions by voltage system, region, and verified jobsite notes.</p>
            </div>
            <div className="hidden rounded-2xl bg-[var(--space-surface-panel)] p-3 shadow-[0_10px_24px_var(--space-shell-shadow)] sm:block">
              <Cable className={cn('h-7 w-7', tw.icon.primary)} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
          <section className={cn(tw.card.elevated, 'p-4')}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={cn('font-semibold', typography.color.primary)}>Lookup inputs</h2>
              <button onClick={() => noteRef.current?.focus()} className={cn('rounded-lg px-3 py-2 text-xs', tw.button.secondary)}>Add field note</button>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className={cn('mb-1 block text-xs font-semibold uppercase tracking-wide', typography.color.tertiary)}>Voltage system</span>
                <select value={voltageSystem} onChange={(e) => setVoltageSystem(e.target.value)} className={cn(tw.input.base, tw.input.default)}>
                  {VOLTAGE_SYSTEMS.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={cn('mb-1 block text-xs font-semibold uppercase tracking-wide', typography.color.tertiary)}>Phase / conductor</span>
                  <select value={phase} onChange={(e) => setPhase(e.target.value)} className={cn(tw.input.base, tw.input.default)}>
                    {PHASES.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className={cn('mb-1 block text-xs font-semibold uppercase tracking-wide', typography.color.tertiary)}>Region / convention</span>
                  <select value={region} onChange={(e) => setRegion(e.target.value)} className={cn(tw.input.base, tw.input.default)}>
                    {REGIONS.map((item) => <option key={item} value={item}>{item}</option>)}
                  </select>
                </label>
              </div>

              <label className="block">
                <span className={cn('mb-1 block text-xs font-semibold uppercase tracking-wide', typography.color.tertiary)}>Verified color reference</span>
                <input value={verifiedColor} onChange={(e) => setVerifiedColor(e.target.value)} placeholder={`Field observed color, e.g. ${expectedColor}`} className={cn(tw.input.base, tw.input.default)} />
              </label>

              <label className="block">
                <span className={cn('mb-1 block text-xs font-semibold uppercase tracking-wide', typography.color.tertiary)}>Jobsite note</span>
                <input ref={noteRef} value={jobsiteNote} onChange={(e) => setJobsiteNote(e.target.value)} placeholder="Panel, area, drawing note, label condition…" className={cn(tw.input.base, tw.input.default)} />
              </label>
            </div>
          </section>

          <section className={cn(tw.card.elevated, 'overflow-hidden')}>
            <div className="border-b border-[var(--space-border-default)] bg-[var(--space-surface-panel)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className={cn('font-semibold', typography.color.primary)}>Lookup card</h2>
                  <p className={cn('text-xs', typography.color.secondary)}>Use as a field reference—not a code substitute.</p>
                </div>
                <span className={cn(tw.badge.default, isMismatch ? tw.badge.warning : status === 'Verified match' ? tw.badge.success : tw.badge.neutral)}>{status}</span>
              </div>
            </div>

            <div className="space-y-4 p-4">
              <div className="rounded-2xl border border-[var(--space-border-strong)] bg-[var(--space-surface-muted)] p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <p className={cn('text-xs uppercase tracking-wide', typography.color.tertiary)}>Expected identification</p>
                    <h3 className={cn('text-3xl font-bold tracking-tight', typography.color.brand)}>{expectedColor}</h3>
                  </div>
                  <div className="rounded-full bg-[var(--space-surface-card)] p-3 shadow-[0_8px_18px_var(--space-shell-shadow)]">
                    <ShieldCheck className={cn('h-7 w-7', isMismatch ? tw.icon.accent : tw.icon.primary)} />
                  </div>
                </div>
                <p className={cn('text-sm leading-relaxed', typography.color.secondary)}>{summary}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-[var(--space-surface-muted)] p-3">
                  <p className={cn('text-[10px] uppercase tracking-wide', typography.color.tertiary)}>Neutral</p>
                  <p className={cn('font-semibold', typography.color.primary)}>{convention.neutral}</p>
                </div>
                <div className="rounded-xl bg-[var(--space-surface-muted)] p-3">
                  <p className={cn('text-[10px] uppercase tracking-wide', typography.color.tertiary)}>Ground / PE</p>
                  <p className={cn('font-semibold', typography.color.primary)}>{convention.ground}</p>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--space-border-default)] bg-[var(--space-surface-card)] p-3">
                <p className={cn('mb-1 flex items-center gap-2 text-sm font-semibold', typography.color.primary)}><AlertTriangle className={cn('h-4 w-4', tw.icon.accent)} /> Convention notes</p>
                <p className={cn('text-xs leading-relaxed', typography.color.secondary)}>{convention.notes}</p>
                <p className={cn('mt-2 text-[11px]', typography.color.tertiary)}>Source hint: {convention.sourceHint}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleSearch} disabled={searchBusy} className={cn('rounded-xl px-3 py-3 text-sm', tw.button.secondary, searchBusy && tw.button.disabled)}>
                  {searchBusy ? <RefreshCw className="mr-2 inline h-4 w-4 animate-spin" /> : <Search className="mr-2 inline h-4 w-4" />} Search refs
                </button>
                <button onClick={handleSave} disabled={busy} className={cn('rounded-xl px-3 py-3 text-sm', tw.button.primary, busy && tw.button.disabled)}>
                  <Save className="mr-2 inline h-4 w-4" /> {busy ? 'Saving…' : 'Save card'}
                </button>
              </div>
            </div>
          </section>
        </div>

        {(searchResults.length > 0 || searchError) && (
          <section className={cn(tw.card.elevated, 'p-4')}>
            <div className="mb-3 flex items-center gap-2">
              <BookOpen className={cn('h-4 w-4', tw.icon.primary)} />
              <h2 className={cn('font-semibold', typography.color.primary)}>Web reference search</h2>
            </div>
            {searchError ? (
              <p className={cn('rounded-xl bg-[var(--space-surface-muted)] p-3 text-sm', typography.color.secondary)}>{searchError}</p>
            ) : (
              <div className="space-y-3">
                {searchResults.map((result, index) => (
                  <a key={`${result.link}-${index}`} href={result.link} target="_blank" rel="noreferrer" className="block rounded-xl border border-[var(--space-border-default)] bg-[var(--space-surface-muted)] p-3 transition-all hover:bg-[var(--space-surface-card-hover)]">
                    <span className={cn('flex items-start justify-between gap-3 text-sm font-semibold', typography.color.primary)}>
                      {result.title}
                      <ExternalLink className={cn('mt-0.5 h-4 w-4 shrink-0', tw.icon.muted)} />
                    </span>
                    <span className={cn('mt-1 block text-xs leading-relaxed', typography.color.secondary)}>{result.snippet}</span>
                  </a>
                ))}
              </div>
            )}
          </section>
        )}

        <section className={cn(tw.card.elevated, 'overflow-hidden')}>
          <div className="flex items-center justify-between border-b border-[var(--space-border-default)] bg-[var(--space-surface-card)] p-4">
            <div>
              <h2 className={cn('font-semibold', typography.color.primary)}>Saved field references</h2>
              <p className={cn('text-xs', typography.color.secondary)}>Phase notes saved per visitor in WorkspaceDB.</p>
            </div>
            <button onClick={refresh} className={cn('rounded-lg px-3 py-2 text-xs', tw.button.secondary)}>Refresh</button>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="py-10 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--space-brand-primary)] border-t-transparent" />
                <p className={cn('mt-2 text-sm', typography.color.secondary)}>Loading phase references…</p>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-[var(--space-surface-muted)] p-4 text-center">
                <p className={cn('text-sm font-semibold', typography.color.primary)}>Ready for your first phase reference</p>
                <p className={cn('mt-1 text-xs', typography.color.secondary)}>The phase lookup table is created the first time you save a card.</p>
              </div>
            ) : !savedReferences || savedReferences.length === 0 ? (
              <div className="rounded-xl bg-[var(--space-surface-muted)] p-6 text-center">
                <MapPin className={cn('mx-auto mb-2 h-8 w-8', tw.icon.muted)} />
                <p className={cn('text-sm font-semibold', typography.color.primary)}>No saved references yet</p>
                <p className={cn('mt-1 text-xs', typography.color.secondary)}>Save a lookup card after you verify the jobsite color reference.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedReferences.map((record) => (
                  <article key={record.id} className="rounded-xl border border-[var(--space-border-default)] bg-[var(--space-surface-muted)] p-4 transition-all hover:bg-[var(--space-surface-card-hover)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className={cn('font-semibold', typography.color.primary)}>{record.voltage_system} · {record.phase}</h3>
                        <p className={cn('mt-1 text-sm leading-relaxed', typography.color.secondary)}>{record.summary}</p>
                        {record.jobsite_note && <p className={cn('mt-2 text-xs', typography.color.tertiary)}>Note: {record.jobsite_note}</p>}
                      </div>
                      <button onClick={() => handleDelete(record.id)} className={cn('rounded-lg p-2', tw.button.ghost)} title="Delete saved reference">
                        <Trash2 className={cn('h-4 w-4', tw.icon.danger)} />
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={cn(tw.badge.default, record.status === 'Field mismatch' ? tw.badge.warning : record.status === 'Verified match' ? tw.badge.success : tw.badge.neutral)}>{record.status}</span>
                      <span className={cn(tw.badge.default, tw.badge.primary)}>Expected: {record.expected_color}</span>
                      <span className={cn(tw.badge.default, tw.badge.accent)}>Verified: {record.verified_color || '—'}</span>
                      <span className={cn(tw.badge.default, tw.badge.neutral)}>{record.region}</span>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}