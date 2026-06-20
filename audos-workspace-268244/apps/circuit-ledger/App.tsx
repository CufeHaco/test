import { useState, useEffect, useRef } from 'react';
import { Calculator, Save, Trash2, AlertTriangle, Zap, Gauge, Copy, Sparkles, RefreshCw } from 'lucide-react';
import { tw, typography, cn } from '../../lib/colors';

interface CircuitRecord {
  id: number;
  label: string;
  voltage: number;
  amperage: number;
  phase: string;
  material: string;
  wire_size: string;
  run_length: number;
  tolerance: number;
  voltage_drop: number;
  voltage_drop_percent: number;
  va_load: number;
  status: string;
  formula: string;
  assumptions: string;
  cautions: string;
  summary: string;
  ai_review?: string;
  created_at?: string;
}

interface CalcResult {
  voltageDrop: number;
  voltageDropPercent: number;
  vaLoad: number;
  status: 'Within tolerance' | 'Check sizing';
  formula: string;
  assumptions: string;
  cautions: string;
  summary: string;
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

const WIRE_OPTIONS = ['14 AWG', '12 AWG', '10 AWG', '8 AWG', '6 AWG', '4 AWG', '3 AWG', '2 AWG', '1 AWG', '1/0 AWG', '2/0 AWG', '3/0 AWG', '4/0 AWG', '250 kcmil', '350 kcmil', '500 kcmil'];

const RESISTANCE_OHMS_PER_1000FT: Record<string, Record<string, number>> = {
  copper: {
    '14 AWG': 3.07, '12 AWG': 1.93, '10 AWG': 1.21, '8 AWG': 0.764, '6 AWG': 0.491, '4 AWG': 0.308,
    '3 AWG': 0.245, '2 AWG': 0.194, '1 AWG': 0.154, '1/0 AWG': 0.122, '2/0 AWG': 0.0967, '3/0 AWG': 0.0766,
    '4/0 AWG': 0.0608, '250 kcmil': 0.0515, '350 kcmil': 0.0367, '500 kcmil': 0.0258,
  },
  aluminum: {
    '14 AWG': 5.06, '12 AWG': 3.18, '10 AWG': 2.00, '8 AWG': 1.26, '6 AWG': 0.808, '4 AWG': 0.508,
    '3 AWG': 0.403, '2 AWG': 0.319, '1 AWG': 0.253, '1/0 AWG': 0.201, '2/0 AWG': 0.159, '3/0 AWG': 0.126,
    '4/0 AWG': 0.100, '250 kcmil': 0.0847, '350 kcmil': 0.0605, '500 kcmil': 0.0424,
  },
};

const APPROX_AMPACITY: Record<string, Record<string, number>> = {
  copper: {
    '14 AWG': 15, '12 AWG': 20, '10 AWG': 30, '8 AWG': 50, '6 AWG': 65, '4 AWG': 85, '3 AWG': 100, '2 AWG': 115,
    '1 AWG': 130, '1/0 AWG': 150, '2/0 AWG': 175, '3/0 AWG': 200, '4/0 AWG': 230, '250 kcmil': 255, '350 kcmil': 310, '500 kcmil': 380,
  },
  aluminum: {
    '14 AWG': 0, '12 AWG': 0, '10 AWG': 25, '8 AWG': 40, '6 AWG': 50, '4 AWG': 65, '3 AWG': 75, '2 AWG': 90,
    '1 AWG': 100, '1/0 AWG': 120, '2/0 AWG': 135, '3/0 AWG': 155, '4/0 AWG': 180, '250 kcmil': 205, '350 kcmil': 250, '500 kcmil': 310,
  },
};

function formatNumber(value: number, digits = 2) {
  if (!Number.isFinite(value)) return '—';
  return value.toLocaleString(undefined, { maximumFractionDigits: digits, minimumFractionDigits: digits });
}

function calculateCircuit(label: string, voltage: number, amperage: number, phase: string, material: string, wireSize: string, runLength: number, tolerance: number): CalcResult {
  const resistance = RESISTANCE_OHMS_PER_1000FT[material]?.[wireSize] || 0;
  const multiplier = phase === 'three-phase' ? Math.sqrt(3) : 2;
  const voltageDrop = multiplier * amperage * (resistance / 1000) * runLength;
  const voltageDropPercent = voltage > 0 ? (voltageDrop / voltage) * 100 : 0;
  const vaLoad = phase === 'three-phase' ? Math.sqrt(3) * voltage * amperage : voltage * amperage;
  const ampacity = APPROX_AMPACITY[material]?.[wireSize] || 0;
  const status = voltageDropPercent <= tolerance ? 'Within tolerance' : 'Check sizing';
  const formula = phase === 'three-phase'
    ? 'VD = √3 × I × R × one-way feet; VA = √3 × V × I'
    : 'VD = 2 × I × R × one-way feet; VA = V × I';
  const assumptions = `${material === 'copper' ? 'Copper' : 'Aluminum'} ${wireSize}; ${resistance} Ω/1000 ft conductor resistance; ${phase === 'three-phase' ? '3-phase' : 'single-phase'} circuit; one-way run length; ${tolerance}% target voltage-drop tolerance.`;
  const cautionItems = [
    voltageDropPercent > tolerance ? `Voltage drop is above the ${tolerance}% target.` : `Voltage drop is within the ${tolerance}% target.`,
    ampacity > 0 && amperage > ampacity ? `Load exceeds the rough ${wireSize} ${material} ampacity reference (${ampacity}A).` : `Ampacity reference: ${ampacity > 0 ? `${ampacity}A rough check` : 'verify conductor ampacity before use'}.`,
    'Verify NEC/local code, temperature rating, conduit fill, terminal ratings, derating, and actual conductor type before installation.'
  ];
  const summary = `${label || 'Circuit'}: ${formatNumber(amperage, 1)}A at ${formatNumber(voltage, 0)}V on ${phase === 'three-phase' ? '3-phase' : 'single-phase'} ${material} ${wireSize} over ${formatNumber(runLength, 0)} ft. Estimated drop ${formatNumber(voltageDrop)}V (${formatNumber(voltageDropPercent)}%). ${status}.`;

  return {
    voltageDrop,
    voltageDropPercent,
    vaLoad,
    status,
    formula,
    assumptions,
    cautions: cautionItems.join(' '),
    summary,
  };
}

export default function CircuitLedger() {
  const { data: savedRecords, loading, error, refresh } = window.useWorkspaceDB<CircuitRecord>('circuit_ledger', {
    orderBy: { column: 'created_at', direction: 'desc' },
    limit: 100,
  });

  const [label, setLabel] = useState('Panel A / Circuit 12');
  const [voltage, setVoltage] = useState(120);
  const [amperage, setAmperage] = useState(16);
  const [phase, setPhase] = useState('single-phase');
  const [material, setMaterial] = useState('copper');
  const [wireSize, setWireSize] = useState('12 AWG');
  const [runLength, setRunLength] = useState(85);
  const [tolerance, setTolerance] = useState(3);
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const [aiReview, setAiReview] = useState('');
  const [copied, setCopied] = useState(false);
  const resultRef = useRef<HTMLDivElement | null>(null);

  const result = calculateCircuit(label, Number(voltage), Number(amperage), phase, material, wireSize, Number(runLength), Number(tolerance));
  const isWarning = result.status === 'Check sizing';

  useEffect(() => {
    setAiReview('');
  }, [label, voltage, amperage, phase, material, wireSize, runLength, tolerance]);

  const handleSave = async () => {
    setBusy(true);
    try {
      await window.__workspaceDb.from('circuit_ledger').insert({
        label: label.trim() || 'Untitled circuit',
        voltage: Number(voltage),
        amperage: Number(amperage),
        phase,
        material,
        wire_size: wireSize,
        run_length: Number(runLength),
        tolerance: Number(tolerance),
        voltage_drop: Number(result.voltageDrop.toFixed(4)),
        voltage_drop_percent: Number(result.voltageDropPercent.toFixed(4)),
        va_load: Number(result.vaLoad.toFixed(2)),
        status: result.status,
        formula: result.formula,
        assumptions: result.assumptions,
        cautions: result.cautions,
        summary: result.summary,
        ai_review: aiReview,
      });
      refresh();
      resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async (id: number) => {
    await window.__workspaceDb.from('circuit_ledger').delete(id);
    refresh();
  };

  const handleCopy = async () => {
    const text = `${result.summary}\nFormula: ${result.formula}\nAssumptions: ${result.assumptions}\nCautions: ${result.cautions}${aiReview ? `\nAI review: ${aiReview}` : ''}`;
    await navigator.clipboard?.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  const handleAiReview = async () => {
    setAiBusy(true);
    setAiReview('');
    try {
      const response = await fetch('/proxy/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          max_tokens: 180,
          temperature: 0.2,
          messages: [
            { role: 'system', content: 'You are a cautious electrical field-note assistant. Do not certify code compliance. Return 2-3 concise caution bullets for an electrician to verify.' },
            { role: 'user', content: `${result.summary}\n${result.formula}\n${result.assumptions}\n${result.cautions}` }
          ],
        }),
      });
      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content?.trim();
      setAiReview(content || 'AI review returned no notes. Verify NEC/local code and site conditions before use.');
    } catch {
      setAiReview('AI review is unavailable right now. Verify NEC/local code, site conditions, derating, and terminal ratings before use.');
    } finally {
      setAiBusy(false);
    }
  };

  return (
    <div className="min-h-full flex flex-col w-full bg-transparent">
      <div className="relative overflow-hidden border-b border-[var(--space-border-default)] bg-[var(--space-surface-card)]">
        <div className="absolute -right-10 -top-12 h-36 w-36 rounded-full border-[18px] border-[var(--space-brand-primary-100)]" />
        <div className="absolute right-8 top-10 h-12 w-12 rounded-full border-[10px] border-[var(--space-brand-highlight-100)]" />
        <div className="relative p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className={cn('mb-2 inline-flex items-center gap-2 rounded-full px-3 py-1', tw.bg.accent, typography.color.accent, typography.size.xs, typography.weight.semibold)}>
                <Zap className="h-3.5 w-3.5" /> Field math ledger
              </div>
              <h1 className={cn('text-2xl font-bold tracking-tight', typography.color.brand)}>Circuit Ledger</h1>
              <p className={cn('mt-1 text-sm', typography.color.secondary)}>Voltage drop, load, wire size notes, and job-ready summaries saved by circuit.</p>
            </div>
            <div className="hidden rounded-2xl bg-[var(--space-surface-panel)] p-3 shadow-[0_10px_24px_var(--space-shell-shadow)] sm:block">
              <Calculator className={cn('h-7 w-7', tw.icon.primary)} />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-5 overflow-y-auto p-4">
        <div className="grid gap-4 lg:grid-cols-[1fr_0.95fr]">
          <section className={cn(tw.card.elevated, 'p-4')}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className={cn('font-semibold', typography.color.primary)}>Inputs</h2>
              <span className={cn(tw.badge.primary, tw.badge.default)}>one-way run</span>
            </div>

            <div className="space-y-3">
              <label className="block">
                <span className={cn('mb-1 block text-xs font-semibold uppercase tracking-wide', typography.color.tertiary)}>Circuit / job label</span>
                <input value={label} onChange={(e) => setLabel(e.target.value)} className={cn(tw.input.base, tw.input.default)} />
              </label>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={cn('mb-1 block text-xs font-semibold uppercase tracking-wide', typography.color.tertiary)}>Voltage</span>
                  <input type="number" value={voltage} onChange={(e) => setVoltage(Number(e.target.value))} className={cn(tw.input.base, tw.input.default)} />
                </label>
                <label className="block">
                  <span className={cn('mb-1 block text-xs font-semibold uppercase tracking-wide', typography.color.tertiary)}>Amps / load</span>
                  <input type="number" value={amperage} onChange={(e) => setAmperage(Number(e.target.value))} className={cn(tw.input.base, tw.input.default)} />
                </label>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <label className="block">
                  <span className={cn('mb-1 block text-xs font-semibold uppercase tracking-wide', typography.color.tertiary)}>Phase</span>
                  <select value={phase} onChange={(e) => setPhase(e.target.value)} className={cn(tw.input.base, tw.input.default)}>
                    <option value="single-phase">Single-phase</option>
                    <option value="three-phase">3-phase</option>
                  </select>
                </label>
                <label className="block">
                  <span className={cn('mb-1 block text-xs font-semibold uppercase tracking-wide', typography.color.tertiary)}>Material</span>
                  <select value={material} onChange={(e) => setMaterial(e.target.value)} className={cn(tw.input.base, tw.input.default)}>
                    <option value="copper">Copper</option>
                    <option value="aluminum">Aluminum</option>
                  </select>
                </label>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <label className="block">
                  <span className={cn('mb-1 block text-xs font-semibold uppercase tracking-wide', typography.color.tertiary)}>Wire</span>
                  <select value={wireSize} onChange={(e) => setWireSize(e.target.value)} className={cn(tw.input.base, tw.input.default)}>
                    {WIRE_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className={cn('mb-1 block text-xs font-semibold uppercase tracking-wide', typography.color.tertiary)}>Run ft</span>
                  <input type="number" value={runLength} onChange={(e) => setRunLength(Number(e.target.value))} className={cn(tw.input.base, tw.input.default)} />
                </label>
                <label className="block">
                  <span className={cn('mb-1 block text-xs font-semibold uppercase tracking-wide', typography.color.tertiary)}>Tol %</span>
                  <input type="number" value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))} className={cn(tw.input.base, tw.input.default)} />
                </label>
              </div>
            </div>
          </section>

          <section ref={resultRef} className={cn(tw.card.elevated, 'overflow-hidden')}>
            <div className="border-b border-[var(--space-border-default)] bg-[var(--space-surface-panel)] p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className={cn('font-semibold', typography.color.primary)}>Calculated result</h2>
                  <p className={cn('text-xs', typography.color.secondary)}>Formula and cautions ready to save.</p>
                </div>
                <span className={cn(tw.badge.default, isWarning ? tw.badge.warning : tw.badge.success)}>{result.status}</span>
              </div>
            </div>

            <div className="space-y-4 p-4">
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl bg-[var(--space-surface-muted)] p-3">
                  <p className={cn('text-[10px] uppercase tracking-wide', typography.color.tertiary)}>Drop</p>
                  <p className={cn('text-lg font-bold', typography.color.brand)}>{formatNumber(result.voltageDrop)}V</p>
                </div>
                <div className="rounded-xl bg-[var(--space-surface-muted)] p-3">
                  <p className={cn('text-[10px] uppercase tracking-wide', typography.color.tertiary)}>Drop %</p>
                  <p className={cn('text-lg font-bold', isWarning ? typography.color.danger : typography.color.success)}>{formatNumber(result.voltageDropPercent)}%</p>
                </div>
                <div className="rounded-xl bg-[var(--space-surface-muted)] p-3">
                  <p className={cn('text-[10px] uppercase tracking-wide', typography.color.tertiary)}>Load</p>
                  <p className={cn('text-lg font-bold', typography.color.brand)}>{formatNumber(result.vaLoad / 1000, 2)} kVA</p>
                </div>
              </div>

              <div className="rounded-xl border border-[var(--space-border-default)] bg-[var(--space-surface-card)] p-3">
                <div className="mb-2 flex items-center gap-2">
                  <Gauge className={cn('h-4 w-4', tw.icon.primary)} />
                  <p className={cn('text-sm font-semibold', typography.color.primary)}>Job-ready summary</p>
                </div>
                <p className={cn('text-sm leading-relaxed', typography.color.secondary)}>{result.summary}</p>
              </div>

              <div className="grid gap-3 text-sm">
                <div>
                  <p className={cn('mb-1 font-semibold', typography.color.primary)}>Formula</p>
                  <p className={cn('rounded-lg bg-[var(--space-surface-muted)] p-2 font-mono text-xs', typography.color.secondary)}>{result.formula}</p>
                </div>
                <div>
                  <p className={cn('mb-1 font-semibold', typography.color.primary)}>Assumptions</p>
                  <p className={cn('text-xs leading-relaxed', typography.color.secondary)}>{result.assumptions}</p>
                </div>
                <div>
                  <p className={cn('mb-1 flex items-center gap-1 font-semibold', typography.color.primary)}><AlertTriangle className={cn('h-4 w-4', tw.icon.accent)} /> Cautions</p>
                  <p className={cn('text-xs leading-relaxed', typography.color.secondary)}>{result.cautions}</p>
                </div>
              </div>

              {aiReview && (
                <div className="rounded-xl border border-[var(--space-border-strong)] bg-[var(--space-surface-panel)] p-3">
                  <p className={cn('mb-1 flex items-center gap-2 text-sm font-semibold', typography.color.primary)}><Sparkles className={cn('h-4 w-4', tw.icon.accent)} /> AI caution review</p>
                  <p className={cn('whitespace-pre-line text-xs leading-relaxed', typography.color.secondary)}>{aiReview}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                <button onClick={handleAiReview} disabled={aiBusy} className={cn('rounded-xl px-3 py-3 text-sm', tw.button.secondary, aiBusy && tw.button.disabled)}>
                  {aiBusy ? <RefreshCw className="mr-2 inline h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 inline h-4 w-4" />} Review cautions
                </button>
                <button onClick={handleCopy} className={cn('rounded-xl px-3 py-3 text-sm', tw.button.secondary)}>
                  <Copy className="mr-2 inline h-4 w-4" /> {copied ? 'Copied' : 'Copy note'}
                </button>
                <button onClick={handleSave} disabled={busy} className={cn('col-span-2 rounded-xl px-3 py-3 text-sm', tw.button.primary, busy && tw.button.disabled)}>
                  <Save className="mr-2 inline h-4 w-4" /> {busy ? 'Saving…' : 'Save to Circuit Ledger'}
                </button>
              </div>
            </div>
          </section>
        </div>

        <section className={cn(tw.card.elevated, 'overflow-hidden')}>
          <div className="flex items-center justify-between border-b border-[var(--space-border-default)] bg-[var(--space-surface-card)] p-4">
            <div>
              <h2 className={cn('font-semibold', typography.color.primary)}>Saved circuit notes</h2>
              <p className={cn('text-xs', typography.color.secondary)}>Stored per visitor in WorkspaceDB.</p>
            </div>
            <button onClick={refresh} className={cn('rounded-lg px-3 py-2 text-xs', tw.button.secondary)}>Refresh</button>
          </div>

          <div className="p-4">
            {loading ? (
              <div className="py-10 text-center">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[var(--space-brand-primary)] border-t-transparent" />
                <p className={cn('mt-2 text-sm', typography.color.secondary)}>Loading saved circuits…</p>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-[var(--space-surface-muted)] p-4 text-center">
                <p className={cn('text-sm font-semibold', typography.color.primary)}>Ready for your first save</p>
                <p className={cn('mt-1 text-xs', typography.color.secondary)}>The ledger table is created the first time you save a circuit.</p>
              </div>
            ) : !savedRecords || savedRecords.length === 0 ? (
              <div className="rounded-xl bg-[var(--space-surface-muted)] p-6 text-center">
                <Calculator className={cn('mx-auto mb-2 h-8 w-8', tw.icon.muted)} />
                <p className={cn('text-sm font-semibold', typography.color.primary)}>No saved circuits yet</p>
                <p className={cn('mt-1 text-xs', typography.color.secondary)}>Run the calculator and save the result for job documentation.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {savedRecords.map((record) => (
                  <article key={record.id} className="rounded-xl border border-[var(--space-border-default)] bg-[var(--space-surface-muted)] p-4 transition-all hover:bg-[var(--space-surface-card-hover)]">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className={cn('font-semibold', typography.color.primary)}>{record.label}</h3>
                        <p className={cn('mt-1 text-sm leading-relaxed', typography.color.secondary)}>{record.summary}</p>
                      </div>
                      <button onClick={() => handleDelete(record.id)} className={cn('rounded-lg p-2', tw.button.ghost)} title="Delete saved circuit">
                        <Trash2 className={cn('h-4 w-4', tw.icon.danger)} />
                      </button>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className={cn(tw.badge.default, record.status === 'Check sizing' ? tw.badge.warning : tw.badge.success)}>{record.status}</span>
                      <span className={cn(tw.badge.default, tw.badge.primary)}>{formatNumber(record.voltage_drop_percent)}% drop</span>
                      <span className={cn(tw.badge.default, tw.badge.neutral)}>{record.phase}</span>
                      <span className={cn(tw.badge.default, tw.badge.accent)}>{record.wire_size}</span>
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