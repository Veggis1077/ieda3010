import { useEffect, useMemo, useRef, useState } from 'react';
import { analyze, Analysis2D, Constraint2D, Model2D, Vertex } from '../math/lp2d';
import { LPPlot, PlotOptions, autoView, conColor, defaultOptions, View } from '../components/plot/LPPlot';
import { NumberInput, Panel, Segmented, Slider, Toggle, Badge } from '../components/ui';
import { M } from '../components/Math';
import { getPreset, newConId, PRESETS } from '../content/presets';
import { fmtNum, texLinear, opTex, texNum } from '../math/format';

export function conTex(c: Constraint2D, names: [string, string] = ['x_1', 'x_2']) {
  return `${texLinear([c.a1, c.a2], names)} ${opTex(c.op)} ${texNum(c.b)}`;
}

export function classificationText(a: Analysis2D, m: Model2D): { title: string; tone: 'good' | 'warn' | 'bad' | 'accent'; body: string } {
  switch (a.classification) {
    case 'unique':
      return {
        title: 'Entydig optimal løsning (unique optimal solution)',
        tone: 'good',
        body: `Objektivlinjen forlater det tillatte området i nøyaktig ett hjørnepunkt. ${a.regionBounded ? '' : 'Merk: det tillatte området er ubegrenset, men målfunksjonen er likevel begrenset i forbedringsretningen.'}`,
      };
    case 'multiple-edge':
      return {
        title: 'Flere optimale løsninger (multiple optimal solutions)',
        tone: 'accent',
        body: 'Objektivlinjen er parallell med en bindende kant. Alle punkter på den markerte kanten er optimale – uendelig mange løsninger med samme Z*. To optimale hjørner ⇒ hele linjestykket mellom dem er optimalt.',
      };
    case 'multiple-ray':
      return {
        title: 'Flere optimale løsninger langs en stråle',
        tone: 'accent',
        body: 'Optimal verdi er endelig, men mengden av optimale løsninger er en ubegrenset stråle (objektivlinjen er parallell med en ubegrenset kant).',
      };
    case 'all-feasible':
      return { title: 'Alle tillatte punkter er optimale', tone: 'accent', body: 'Målfunksjonen er 0x₁ + 0x₂, så alle tillatte løsninger gir Z = 0.' };
    case 'unbounded':
      return {
        title: 'Ubegrenset problem (unbounded)',
        tone: 'warn',
        body: `Det finnes tillatte løsninger, men Z kan gjøres vilkårlig ${m.sense === 'max' ? 'stor' : 'liten'}: vi kan skyve objektivlinjen uendelig langt i forbedringsretningen uten å forlate området. Klassifiseringen er beregnet eksakt (simpleks med resesjonsretning), ikke fra plottvinduet.`,
      };
    case 'infeasible':
      return { title: 'Ingen tillatt løsning (infeasible / inconsistent)', tone: 'bad', body: 'Snittet av alle halvplanene er tomt – restriksjonene motsier hverandre («too many restrictions»).' };
  }
}

function simplexPath(a: Analysis2D, sense: 'max' | 'min'): Vertex[] {
  if (a.status !== 'optimal' || a.vertices.length === 0) return [];
  const better = (p: number, q: number) => (sense === 'max' ? p > q + 1e-9 : p < q - 1e-9);
  let cur = a.vertices.find((v) => v.p[0] === 0 && v.p[1] === 0) ?? a.vertices[0];
  const path = [cur];
  for (let k = 0; k < 30; k++) {
    const nbrs = a.vertices.filter((v) => v !== cur && v.active.some((id) => cur.active.includes(id)));
    const imp = nbrs.filter((v) => better(v.z, cur.z));
    if (!imp.length) break;
    cur = imp.reduce((b, v) => (better(v.z, b.z) ? v : b), imp[0]);
    path.push(cur);
  }
  return path;
}

export function LPLab({ presetId = 'wyndor', compact = false, showPresets = true, height }: { presetId?: string; compact?: boolean; showPresets?: boolean; height?: number }) {
  const [presetKey, setPresetKey] = useState(presetId);
  const preset = useMemo(() => getPreset(presetKey), [presetKey]);
  const [model, setModel] = useState<Model2D>(preset.model);
  const [view, setView] = useState<View>(() => autoView(preset.model));
  const [opts, setOpts] = useState<PlotOptions>({ ...defaultOptions, isoFamily: false });
  const [level, setLevel] = useState<number | null>(0);
  const [showPath, setShowPath] = useState(false);
  const anim = useRef<number | null>(null);
  const names = (preset.axisNames ?? ['x_1', 'x_2']) as [string, string];
  const texNames: [string, string] = [names[0].includes('_') ? names[0] : names[0], names[1]];

  useEffect(() => {
    setModel(preset.model);
    setView(autoView(preset.model));
    setLevel(0);
  }, [preset]);

  const a = useMemo(() => analyze(model), [model]);
  const path = useMemo(() => (showPath ? simplexPath(a, model.sense) : []), [a, showPath, model.sense]);

  const updateCon = (id: string, patch: Partial<Constraint2D>) => setModel((m) => ({ ...m, constraints: m.constraints.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
  const removeCon = (id: string) => setModel((m) => ({ ...m, constraints: m.constraints.filter((c) => c.id !== id) }));
  const addCon = () =>
    setModel((m) => ({ ...m, constraints: [...m.constraints, { id: newConId(), a1: 1, a2: 1, op: '<=', b: Math.round((view.x1 + view.y1) / 3) || 5 }] }));

  const animate = () => {
    if (a.status !== 'optimal' || a.zStar === undefined) return;
    if (anim.current) cancelAnimationFrame(anim.current);
    const from = level ?? 0;
    const to = a.zStar;
    const t0 = performance.now();
    const dur = 1400;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    const tick = (t: number) => {
      const u = reduce ? 1 : Math.min(1, (t - t0) / dur);
      const e = 1 - Math.pow(1 - u, 3);
      setLevel(from + (to - from) * e);
      if (u < 1) anim.current = requestAnimationFrame(tick);
    };
    anim.current = requestAnimationFrame(tick);
  };
  useEffect(() => () => void (anim.current && cancelAnimationFrame(anim.current)), []);

  const cls = classificationText(a, model);
  const zoom = (f: number) =>
    setView((v) => {
      const cx = v.x0 + (v.x1 - v.x0) * 0.1;
      const cy = v.y0 + (v.y1 - v.y0) * 0.1;
      return { x0: cx - (cx - v.x0) * f, x1: cx + (v.x1 - cx) * f, y0: cy - (cy - v.y0) * f, y1: cy + (v.y1 - cy) * f };
    });

  const levelRange = useMemo(() => {
    const corners = [
      [view.x0, view.y0],
      [view.x1, view.y0],
      [view.x0, view.y1],
      [view.x1, view.y1],
    ].map(([x, y]) => model.c1 * x + model.c2 * y);
    return [Math.min(...corners), Math.max(...corners)];
  }, [view, model.c1, model.c2]);

  const objTex = `\\${model.sense}\\; Z = ${texLinear([model.c1, model.c2], texNames)}`;

  return (
    <div className={`grid gap-4 ${compact ? '' : 'xl:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]'}`}>
      <div className="space-y-3">
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-3 py-2">
            <div className="text-sm">
              <M>{objTex}</M>
            </div>
            <div className="flex items-center gap-1">
              <button className="btn-ghost" onClick={() => zoom(0.8)} aria-label="Zoom inn">
                ＋
              </button>
              <button className="btn-ghost" onClick={() => zoom(1.25)} aria-label="Zoom ut">
                －
              </button>
              <button className="btn-ghost" onClick={() => setView(autoView(model, a.vertices.map((v) => v.p)))}>
                Tilpass
              </button>
            </div>
          </div>
          <LPPlot
            model={model}
            analysis={a}
            view={view}
            options={opts}
            objLevel={level}
            onObjLevel={(L) => {
              if (anim.current) cancelAnimationFrame(anim.current);
              setLevel(L);
            }}
            onConstraint={updateCon}
            onObjective={(c1, c2) => setModel((m) => ({ ...m, c1, c2 }))}
            height={height}
            axisNames={names}
            segments={path.slice(1).map((v, i) => ({ a: path[i].p, b: v.p, color: 'rgb(var(--dual))', width: 3.5, dash: '1 0' }))}
            points={path.map((v, i) => ({ p: v.p, color: 'rgb(var(--dual))', label: `${i}`, r: 4 }))}
          />
          <div className="border-t border-line px-3 py-2">
            <div className="flex items-center gap-3 text-sm">
              <span className="whitespace-nowrap text-obj">
                Isokvant <M>{`Z = ${texNum(+(level ?? 0).toFixed(2))}`}</M>
              </span>
              <Slider value={level ?? 0} min={levelRange[0]} max={levelRange[1]} step={(levelRange[1] - levelRange[0]) / 400 || 0.01} onChange={setLevel} label="Objektivnivå" />
              <button className="btn whitespace-nowrap" onClick={animate} disabled={a.status !== 'optimal'}>
                ▶ Skyv til optimum
              </button>
            </div>
            <p className="mt-1 text-xs text-mute">
              Dra linjene for å endre <M>b</M>, dra de firkantede håndtakene for å endre koeffisientene, dra den stiplede oransje linjen for å flytte isokvanten, og dra pilspissen for å rotere målfunksjonen.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1">
          <Toggle checked={!!opts.vertices} onChange={(v) => setOpts({ ...opts, vertices: v })}>Hjørnepunkter</Toggle>
          <Toggle checked={!!opts.vertexLabels} onChange={(v) => setOpts({ ...opts, vertexLabels: v })}>Koordinater</Toggle>
          <Toggle checked={!!opts.constraintLabels} onChange={(v) => setOpts({ ...opts, constraintLabels: v })}>Restriksjonsnavn</Toggle>
          <Toggle checked={!!opts.isoquant} onChange={(v) => setOpts({ ...opts, isoquant: v })}>Isokvant</Toggle>
          <Toggle checked={!!opts.isoFamily} onChange={(v) => setOpts({ ...opts, isoFamily: v })}>Isokvant-familie</Toggle>
          <Toggle checked={!!opts.gradient} onChange={(v) => setOpts({ ...opts, gradient: v })}>Forbedringsretning</Toggle>
          <Toggle checked={!!opts.optimum} onChange={(v) => setOpts({ ...opts, optimum: v })}>Vis optimum</Toggle>
          <Toggle checked={!!opts.binding} onChange={(v) => setOpts({ ...opts, binding: v })}>Bindende = heltrukket</Toggle>
          <Toggle checked={!!opts.halfPlanes} onChange={(v) => setOpts({ ...opts, halfPlanes: v })}>Skraver ikke-tillatt side</Toggle>
          <Toggle checked={!!opts.intGrid} onChange={(v) => setOpts({ ...opts, intGrid: v })}>Heltallsgitter</Toggle>
          <Toggle checked={showPath} onChange={setShowPath}>Simpleks-sti</Toggle>
        </div>
      </div>

      <div className="space-y-3">
        {showPresets && (
          <Panel title="Eksempel" actions={
              <button
                className="btn-ghost"
                onClick={() => {
                  const p = getPreset(presetKey);
                  setModel(p.model);
                  setView(autoView(p.model));
                  setLevel(0);
                }}
              >
                Tilbakestill
              </button>
            }>
            <select className="input w-full" value={presetKey} onChange={(e) => setPresetKey(e.target.value)} aria-label="Velg eksempel">
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <p className="mt-1.5 text-xs text-mute">Kilde: {preset.source}</p>
            {preset.note && <p className="mt-1 text-xs text-mute">{preset.note}</p>}
          </Panel>
        )}
        <Panel title="Modell">
          <div className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            <Segmented
              value={model.sense}
              onChange={(s) => setModel({ ...model, sense: s })}
              options={[
                { value: 'max', label: 'max' },
                { value: 'min', label: 'min' },
              ]}
            />
            <span className="font-serif italic">Z =</span>
            <NumberInput value={model.c1} onChange={(v) => setModel({ ...model, c1: v })} ariaLabel="c1" step={1} />
            <M>{texNames[0]}</M>
            <span>+</span>
            <NumberInput value={model.c2} onChange={(v) => setModel({ ...model, c2: v })} ariaLabel="c2" step={1} />
            <M>{texNames[1]}</M>
          </div>
          <div className="space-y-2">
            {model.constraints.map((c, i) => (
              <div key={c.id} className="rounded-md border border-line p-2">
                <div className="flex flex-wrap items-center gap-1.5 text-sm">
                  <span className="w-7 font-semibold" style={{ color: conColor(i) }}>
                    ({i + 1})
                  </span>
                  <NumberInput value={c.a1} onChange={(v) => updateCon(c.id, { a1: v })} ariaLabel={`a${i + 1}1`} step={0.5} />
                  <M>{texNames[0]}</M>
                  <span>+</span>
                  <NumberInput value={c.a2} onChange={(v) => updateCon(c.id, { a2: v })} ariaLabel={`a${i + 1}2`} step={0.5} />
                  <M>{texNames[1]}</M>
                  <select className="input px-1 py-0.5" value={c.op} onChange={(e) => updateCon(c.id, { op: e.target.value as Constraint2D['op'] })} aria-label="relasjon">
                    <option value="<=">≤</option>
                    <option value=">=">≥</option>
                    <option value="=">=</option>
                  </select>
                  <NumberInput value={c.b} onChange={(v) => updateCon(c.id, { b: v })} ariaLabel={`b${i + 1}`} step={1} />
                  <span className="ml-auto flex items-center gap-1">
                    {a.redundant.includes(c.id) && <Badge tone="mute">redundant</Badge>}
                    {a.status === 'optimal' && (a.binding.includes(c.id) ? <Badge tone="opt">bindende</Badge> : <Badge tone="mute">ikke-bindende</Badge>)}
                    <button className="btn-ghost px-1.5" onClick={() => removeCon(c.id)} aria-label={`Fjern restriksjon ${i + 1}`} title="Fjern">
                      ✕
                    </button>
                  </span>
                </div>
                {!compact && (
                  <div className="mt-1 flex items-center gap-2 pl-8">
                    <span className="text-xs text-mute">b</span>
                    <Slider value={c.b} min={Math.min(0, c.b * 2, -10)} max={Math.max(c.b * 2, 10)} step={Math.max(Math.abs(c.b), 10) / 200} onChange={(v) => updateCon(c.id, { b: +v.toFixed(3) })} label={`b${i + 1}`} />
                  </div>
                )}
                {c.label && <div className="pl-8 text-xs text-mute">{c.label}</div>}
              </div>
            ))}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <button className="btn" onClick={addCon}>
              + Legg til restriksjon
            </button>
            <Toggle checked={model.nonneg} onChange={(v) => setModel({ ...model, nonneg: v })}>
              <M>{`${texNames[0]}, ${texNames[1]} \\ge 0`}</M>
            </Toggle>
          </div>
        </Panel>
        <ResultPanel a={a} model={model} names={texNames} cls={cls} />
      </div>
    </div>
  );
}

export function ResultPanel({ a, model, names, cls }: { a: Analysis2D; model: Model2D; names: [string, string]; cls: ReturnType<typeof classificationText> }) {
  const idx = (id: string) => model.constraints.findIndex((c) => c.id === id);
  const conName = (id: string) => (id === 'x1>=0' ? `${names[0]} \\ge 0` : id === 'x2>=0' ? `${names[1]} \\ge 0` : `(${idx(id) + 1})`);
  return (
    <Panel title="Analyse">
      <div className={`rounded-md border-l-4 px-3 py-2 text-sm ${cls.tone === 'good' ? 'border-good bg-good/5' : cls.tone === 'bad' ? 'border-bad bg-bad/5' : cls.tone === 'warn' ? 'border-warn bg-warn/5' : 'border-accent bg-accent/5'}`}>
        <div className="font-semibold">{cls.title}</div>
        <div className="mt-0.5 text-mute">{cls.body}</div>
      </div>
      {a.status === 'optimal' && a.xStar && (
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
          <div className="rounded-md bg-sunk px-3 py-2">
            <div className="label">Optimal løsning</div>
            {a.classification === 'multiple-edge' ? (
              <M>{`\\text{linjestykket } (${texNum(a.optimalVertices[0].p[0])}, ${texNum(a.optimalVertices[0].p[1])}) \\text{–} (${texNum(a.optimalVertices[1].p[0])}, ${texNum(a.optimalVertices[1].p[1])})`}</M>
            ) : (
              <M>{`(${names[0]}^*, ${names[1]}^*) = (${texNum(a.xStar[0])}, ${texNum(a.xStar[1])})`}</M>
            )}
          </div>
          <div className="rounded-md bg-sunk px-3 py-2">
            <div className="label">Optimal verdi</div>
            <M>{`Z^* = ${texNum(a.zStar!)}`}</M>
          </div>
        </div>
      )}
      <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
        <Badge tone={a.regionBounded ? 'mute' : 'warn'}>{a.status === 'infeasible' ? 'tomt område' : a.regionBounded ? 'begrenset område' : 'ubegrenset område'}</Badge>
        {a.degenerateVertices.length > 0 && <Badge tone="warn">degenerert hjørne: {a.degenerateVertices.map((v) => `(${fmtNum(v.p[0])}, ${fmtNum(v.p[1])})`).join(', ')}</Badge>}
        {a.redundant.length > 0 && <Badge tone="mute">redundante: {a.redundant.map((r) => conName(r).replace(/\\ge/g, '≥').replace(/_/g, '')).join(', ')}</Badge>}
      </div>
      {a.status !== 'infeasible' && a.vertices.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <div className="label mb-1">Hjørnepunkter (CPF-løsninger)</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-mute">
                <th className="py-1 pr-2 font-medium">Punkt</th>
                <th className="py-1 pr-2 font-medium">Z</th>
                <th className="py-1 font-medium">Aktive restriksjoner</th>
              </tr>
            </thead>
            <tbody>
              {[...a.vertices]
                .sort((p, q) => (model.sense === 'max' ? q.z - p.z : p.z - q.z))
                .map((v, k) => {
                  const opt = a.status === 'optimal' && Math.abs(v.z - (a.zStar ?? NaN)) < 1e-7 * (1 + Math.abs(v.z));
                  return (
                    <tr key={k} className={`border-t border-line/60 ${opt ? 'text-opt' : ''}`}>
                      <td className="py-1 pr-2 font-mono text-[13px]">
                        ({fmtNum(v.p[0])}, {fmtNum(v.p[1])})
                      </td>
                      <td className="py-1 pr-2 font-mono text-[13px]">{fmtNum(v.z)}</td>
                      <td className="py-1 text-xs">
                        {v.active.map((id) => (
                          <span key={id} className="mr-1.5">
                            <M>{conName(id)}</M>
                          </span>
                        ))}
                        {v.active.length > 2 && <span className="text-warn">(degenerert)</span>}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
          {a.status === 'unbounded' && <p className="mt-1 text-xs text-mute">Ingen av hjørnene er optimale: Z kan forbedres uten grense langs den røde pilen.</p>}
        </div>
      )}
      {a.status === 'optimal' && (
        <div className="mt-3 overflow-x-auto">
          <div className="label mb-1">Restriksjoner i optimum</div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-mute">
                <th className="py-1 pr-2 font-medium">#</th>
                <th className="py-1 pr-2 font-medium">VS i x*</th>
                <th className="py-1 pr-2 font-medium">Slakk</th>
                <th className="py-1 pr-2 font-medium">Bindende?</th>
                <th className="py-1 font-medium" title="Skyggepris: endring i Z* per enhet økning i b">Skyggepris</th>
              </tr>
            </thead>
            <tbody>
              {model.constraints.map((c, i) => {
                const l = c.a1 * a.xStar![0] + c.a2 * a.xStar![1];
                return (
                  <tr key={c.id} className="border-t border-line/60">
                    <td className="py-1 pr-2 font-semibold" style={{ color: conColor(i) }}>
                      ({i + 1})
                    </td>
                    <td className="py-1 pr-2 font-mono text-[13px]">
                      {fmtNum(l)} {c.op === '<=' ? '≤' : c.op === '>=' ? '≥' : '='} {fmtNum(c.b)}
                    </td>
                    <td className="py-1 pr-2 font-mono text-[13px]">{fmtNum(a.slack[c.id])}</td>
                    <td className="py-1 pr-2">{a.binding.includes(c.id) ? <Badge tone="opt">ja</Badge> : <Badge>nei</Badge>}</td>
                    <td className="py-1 font-mono text-[13px] text-dual">{fmtNum(a.duals[c.id])}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {a.degenerateVertices.some((v) => a.xStar && v.p[0] === a.xStar[0] && v.p[1] === a.xStar[1]) && (
            <p className="mt-1 text-xs text-warn">Optimum er degenerert: skyggeprisene er ikke entydige her (venstre- og høyrederivert av Z* kan være ulike).</p>
          )}
          {a.classification === 'multiple-edge' && <p className="mt-1 text-xs text-mute">Bindende-status og slakk vises for det representative optimale punktet ({fmtNum(a.xStar![0])}, {fmtNum(a.xStar![1])}).</p>}
        </div>
      )}
      {a.status === 'optimal' && (model.c1 !== 0 || model.c2 !== 0) && <SlopePanel a={a} model={model} />}
    </Panel>
  );
}

function SlopePanel({ a, model }: { a: Analysis2D; model: Model2D }) {
  const bindingUser = model.constraints.filter((c) => a.binding.includes(c.id) && c.a2 !== 0);
  if (model.c2 === 0) return null;
  const objSlope = -model.c1 / model.c2;
  return (
    <div className="mt-3 rounded-md bg-sunk px-3 py-2 text-sm">
      <div className="label mb-1">Stigningstall (slope)</div>
      <div>
        Objektivlinjen: <M>{`-c_1/c_2 = ${texNum(objSlope)}`}</M>
      </div>
      {bindingUser.map((c) => (
        <div key={c.id}>
          Restriksjon ({model.constraints.indexOf(c) + 1}): <M>{`-a_1/a_2 = ${texNum(-c.a1 / c.a2)}`}</M>
        </div>
      ))}
      <p className="mt-1 text-xs text-mute">
        For et maksimeringsproblem med bindende restriksjoner i et hjørne forblir hjørnet optimalt så lenge objektivlinjens stigningstall ligger mellom stigningstallene til de to bindende restriksjonene. Like stigningstall ⇒ parallelle linjer ⇒ flere optima.
      </p>
    </div>
  );
}
