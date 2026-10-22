import katex from 'katex';
import { Fragment, ReactNode, useMemo } from 'react';

const cache = new Map<string, string>();

function render(tex: string, display: boolean) {
  const k = (display ? 'D' : 'I') + tex;
  let html = cache.get(k);
  if (html === undefined) {
    try {
      html = katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: 'ignore', trust: false });
    } catch {
      html = `<code>${tex}</code>`;
    }
    cache.set(k, html);
  }
  return html;
}

/** inline math */
export function M({ children }: { children: string }) {
  const html = useMemo(() => render(children, false), [children]);
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}

/** display math */
export function MB({ children }: { children: string }) {
  const html = useMemo(() => render(children, true), [children]);
  return <div className="my-2" dangerouslySetInnerHTML={{ __html: html }} />;
}

/* ----------------------------------------------------------------------------
 * Rich: lightweight markup for content strings.
 *   $..$ inline math, $$..$$ display math, **bold**, *italic*, `code`,
 *   "- " bullet lists, "1. " numbered lists, "| a | b |" tables,
 *   blank line = new paragraph, "::: note" ... ":::" callouts.
 * -------------------------------------------------------------------------- */

const DOLLAR = '\u0001';
const lit = (s: string) => s.split(DOLLAR).join('$');

function inline(raw: string, keyBase: string): ReactNode[] {
  const text = raw.replace(/\\\$/g, DOLLAR);
  const out: ReactNode[] = [];
  const re = /(\$[^$]+\$|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|`[^`]+`)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(lit(text.slice(last, m.index)));
    const tok = m[0];
    const k = `${keyBase}-${i++}`;
    if (tok.startsWith('$')) out.push(<M key={k}>{lit(tok.slice(1, -1))}</M>);
    else if (tok.startsWith('**')) out.push(<strong key={k}>{inline(tok.slice(2, -2), k)}</strong>);
    else if (tok.startsWith('`')) out.push(<code key={k} className="rounded bg-sunk px-1 font-mono text-[0.85em]">{lit(tok.slice(1, -1))}</code>);
    else out.push(<em key={k}>{inline(tok.slice(1, -1), k)}</em>);
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(lit(text.slice(last)));
  return out;
}

export function Rich({ text, className = '' }: { text: string; className?: string }) {
  const nodes = useMemo(() => parseBlocks(text), [text]);
  return <div className={`prose-body ${className}`}>{nodes}</div>;
}

function parseBlocks(src: string): ReactNode[] {
  const out: ReactNode[] = [];
  // split into chunks by display math & callouts while keeping them intact
  const lines = src.replace(/\r/g, '').split('\n');
  let i = 0;
  let key = 0;
  let para: string[] = [];
  const flush = () => {
    if (para.length) {
      const t = para.join(' ').trim();
      if (t) out.push(<p key={key++}>{inline(t, `p${key}`)}</p>);
      para = [];
    }
  };
  while (i < lines.length) {
    const line = lines[i];
    const tr = line.trim();
    if (tr.startsWith('$$')) {
      flush();
      let buf = tr.slice(2);
      if (buf.endsWith('$$') && buf.length >= 2) {
        out.push(<MB key={key++}>{buf.slice(0, -2)}</MB>);
        i++;
        continue;
      }
      i++;
      while (i < lines.length && !lines[i].trim().endsWith('$$')) buf += '\n' + lines[i++];
      if (i < lines.length) buf += '\n' + lines[i].trim().slice(0, -2);
      i++;
      out.push(<MB key={key++}>{buf}</MB>);
      continue;
    }
    if (tr.startsWith(':::')) {
      flush();
      const kind = tr.slice(3).trim() || 'note';
      const body: string[] = [];
      i++;
      while (i < lines.length && lines[i].trim() !== ':::') body.push(lines[i++]);
      i++;
      out.push(
        <Callout key={key++} kind={kind as CalloutKind}>
          {parseBlocks(body.join('\n'))}
        </Callout>,
      );
      continue;
    }
    if (/^\s*[-•]\s+/.test(line)) {
      flush();
      const items: string[] = [];
      while (i < lines.length && (/^\s*[-•]\s+/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
        if (/^\s*[-•]\s+/.test(lines[i])) items.push(lines[i].replace(/^\s*[-•]\s+/, ''));
        else items[items.length - 1] += ' ' + lines[i].trim();
        i++;
      }
      out.push(
        <ul key={key++}>
          {items.map((it, k) => (
            <li key={k}>{inline(it, `u${key}-${k}`)}</li>
          ))}
        </ul>,
      );
      continue;
    }
    if (/^\s*\d+[.)]\s+/.test(line)) {
      flush();
      const items: string[] = [];
      while (i < lines.length && (/^\s*\d+[.)]\s+/.test(lines[i]) || (/^\s{2,}\S/.test(lines[i]) && items.length))) {
        if (/^\s*\d+[.)]\s+/.test(lines[i])) items.push(lines[i].replace(/^\s*\d+[.)]\s+/, ''));
        else items[items.length - 1] += ' ' + lines[i].trim();
        i++;
      }
      out.push(
        <ol key={key++}>
          {items.map((it, k) => (
            <li key={k}>{inline(it, `o${key}-${k}`)}</li>
          ))}
        </ol>,
      );
      continue;
    }
    if (tr.startsWith('|')) {
      flush();
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const cells = lines[i]
          .trim()
          .replace(/^\||\|$/g, '')
          .split('|')
          .map((c) => c.trim());
        if (!cells.every((c) => /^:?-+:?$/.test(c))) rows.push(cells);
        i++;
      }
      const [head, ...body] = rows;
      out.push(
        <div key={key++} className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {head.map((h, k) => (
                  <th key={k}>{inline(h, `th${k}`)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {body.map((r, ri) => (
                <tr key={ri}>
                  {r.map((c, k) => (
                    <td key={k}>{inline(c, `td${ri}-${k}`)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }
    if (tr === '') {
      flush();
      i++;
      continue;
    }
    para.push(line);
    i++;
  }
  flush();
  return out;
}

export type CalloutKind = 'note' | 'warn' | 'tip' | 'exam' | 'supp' | 'def' | 'thm';

const calloutStyle: Record<CalloutKind, { label: string; cls: string }> = {
  note: { label: 'Merk', cls: 'border-accent/50 bg-accent/5' },
  warn: { label: 'Vanlig feil', cls: 'border-bad/50 bg-bad/5' },
  tip: { label: 'Tips', cls: 'border-good/50 bg-good/5' },
  exam: { label: 'Eksamensrelevant', cls: 'border-obj/60 bg-obj/5' },
  supp: { label: 'Supplerende (utenfor forelesningsnotatene)', cls: 'border-line bg-sunk/60' },
  def: { label: 'Definisjon', cls: 'border-accent/60 bg-accent/5' },
  thm: { label: 'Teorem', cls: 'border-dual/60 bg-dual/5' },
};

export function Callout({ kind = 'note', title, children }: { kind?: CalloutKind; title?: string; children: ReactNode }) {
  const st = calloutStyle[kind] ?? calloutStyle.note;
  return (
    <div className={`my-4 rounded-md border-l-4 px-4 py-2 font-sans text-[0.95rem] ${st.cls}`}>
      <div className="label mb-1">{title ?? st.label}</div>
      <div className="prose-body text-[0.98rem]">{children}</div>
    </div>
  );
}

export function Frag({ children }: { children: ReactNode }) {
  return <Fragment>{children}</Fragment>;
}
