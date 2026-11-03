import type { Blocco, Tavola as TavolaDati } from '../data/tavole'
import { fotoSrc, type Foto } from '../data/foto'

const BASE = `${import.meta.env.BASE_URL}foto/`

type Ctx = { cartella: string; lista: Foto[]; apri: (i: number) => void }

// Altezza stimata di un blocco, in frazioni della larghezza della pagina: serve a ripartire l'altezza
// del quadrato tra le righe in proporzione alla tavola della tesi
const DIDA = 0.06
const altezza = (b: Blocco, f = b.span / 12): number => {
  if ('colonna' in b) return b.colonna.reduce((h, x) => h + altezza(x, f), 0) + 0.02 * (b.colonna.length - 1)
  if ('colori' in b) return Math.ceil(b.colori.length / b.cols) * (f / b.cols / (b.ar ?? 1.2) + 0.05)
  if ('gruppo' in b) return Math.ceil(b.gruppo.length / b.cols) * (f / b.cols / b.ar) + DIDA
  return f / b.ar + DIDA
}
const peso = (riga: Blocco[]) => Math.max(...riga.map((b) => altezza(b)))

// La doppia della tesi ricomposta. Su schermo grande le due pagine affiancate formano un quadrato, come
// la tavola stampata: le righe si dividono l'altezza in proporzione e le immagini riempiono le cornici.
// Sul telefono le pagine vanno una sotto l'altra con le proporzioni delle immagini; i blocchi stretti
// stanno a due per riga e le palette larghe su tre colonne. Le immagini aprono la vista ingrandita.
export default function Tavola({ t, ...ctx }: { t: TavolaDati } & Ctx) {
  const pagina = (righe: Blocco[][]) => (
    <div className="pagina space-y-6 md:space-y-0">
      {righe.map((riga, ri) => (
        <div key={ri} className="riga grid grid-cols-12 gap-x-2.5 gap-y-6" style={{ ['--peso' as string]: peso(riga) }}>
          {riga.map((b, bi) => (
            <Pezzo key={bi} b={b} ctx={ctx} />
          ))}
        </div>
      ))}
    </div>
  )
  return (
    <div data-tavola className="tavola grid gap-y-6 md:grid-cols-2 md:gap-x-10">
      {pagina(t.sinistra)}
      {pagina(t.destra)}
    </div>
  )
}

// Larghezza sul telefono: i blocchi fino a metà pagina vanno a due per riga, gli altri a tutta pagina
const colonne = (span: number) =>
  ({ 3: 'col-span-6 md:col-span-3', 4: 'col-span-6 md:col-span-4', 5: 'col-span-6 md:col-span-5', 6: 'col-span-6', 7: 'col-span-12 md:col-span-7', 8: 'col-span-12 md:col-span-8', 9: 'col-span-12 md:col-span-9' } as Record<number, string>)[span] ?? 'col-span-12'

const sfondo = (c: string) => (c.includes('>') ? `linear-gradient(to bottom, ${c.split('>').join(', ')})` : c)

function Didascalia({ titolo, sotto }: { titolo: string; sotto?: string }) {
  return (
    <figcaption className="mt-2 shrink-0">
      <div className="text-[10px] tracking-[0.03em]">{titolo}</div>
      {sotto && <div className="font-serif text-[12px] leading-snug tracking-normal">{sotto}</div>}
    </figcaption>
  )
}

// Una cornice con l'immagine: apre la vista ingrandita se la foto è nell'archivio
function Cornice({ f, r, ar, fit, alt, ctx }: { f?: string; r?: string; ar: number; fit?: 'cover'; alt: string; ctx: Ctx }) {
  const i = f ? ctx.lista.findIndex((x) => x.f === `${ctx.cartella}/${f}`) : -1
  const src = i >= 0 ? fotoSrc(ctx.lista[i], 'g') : r ? `${BASE}g/${ctx.cartella}/${r}.webp` : ''
  const img = <img src={src} alt={alt} loading="lazy" decoding="async" className={`h-full w-full ${fit === 'cover' ? 'object-cover' : 'object-contain'}`} />
  return (
    <div className={`cornice relative overflow-hidden ${i >= 0 && ctx.lista[i].scuro ? 'bg-nero' : fit === 'cover' && !(i >= 0 && ctx.lista[i].tr) ? 'bg-g50' : 'bg-white'}`} style={{ ['--ar' as string]: ar }}>
      {i >= 0 ? (
        <button onClick={() => ctx.apri(i)} className="group block h-full w-full">
          {img}
          <span className="anello absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" />
        </button>
      ) : (
        img
      )}
    </div>
  )
}

function Pezzo({ b, ctx }: { b: Blocco; ctx: Ctx }) {
  if ('colonna' in b) {
    return (
      <div className={`col-span-12 ${b.span === 8 ? 'md:col-span-8' : 'md:col-span-6'} colonna flex min-w-0 flex-col gap-6`}>
        {b.colonna.map((x, k) => (
          <div key={k} className="grid grid-cols-12" style={{ ['--peso' as string]: altezza(x, b.span / 12) }}>
            <Pezzo b={{ ...x, span: 12 }} ctx={ctx} />
          </div>
        ))}
      </div>
    )
  }
  if ('colori' in b) {
    return (
      // Sul telefono la palette è un elenco a due colonne su tutta la pagina; --car è la riga più lunga delle diciture
      <div
        className={`${b.span <= 6 ? 'col-span-12 md:col-span-6' : colonne(b.span)} palette grid min-w-0 gap-y-4`}
        style={{ ['--cols' as string]: b.cols, ['--car' as string]: Math.max(...b.colori.flatMap(([n, c]) => [n, ...c.split('\n')].map((r) => r.length))) }}
      >
        {b.colori.map(([nome, codici, c], k) => (
          <div key={k} className="campione flex min-w-0 flex-col">
            {/* Sul telefono un quadratino accanto alla dicitura, su schermo grande il campione pieno */}
            <div className="tinta border-g100" style={{ background: sfondo(c), ['--ar' as string]: c.includes('>') ? 0.9 : 1.7, borderWidth: c.toLowerCase() === '#ffffff' ? 1 : 0 }} />
            <div className="dicitura mt-2 shrink-0 pr-1 leading-[1.35] tracking-normal whitespace-nowrap">
              <div>{nome}</div>
              <div className="whitespace-pre">{codici}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  const alt = [b.titolo, b.sotto].filter(Boolean).join(', ')
  if ('gruppo' in b) {
    return (
      <figure className={`${colonne(b.span)} figura min-w-0`}>
        <div className="gruppo grid gap-2.5" style={{ gridTemplateColumns: `repeat(${b.cols}, minmax(0, 1fr))` }}>
          {b.gruppo.map((f) => (
            <Cornice key={f} f={f} ar={b.ar} fit={b.fit} alt={alt} ctx={ctx} />
          ))}
        </div>
        <Didascalia titolo={b.titolo} sotto={b.sotto} />
      </figure>
    )
  }
  return (
    <figure className={`${colonne(b.span)} figura min-w-0`}>
      <Cornice f={b.f} r={b.r} ar={b.ar} fit={b.fit} alt={alt} ctx={ctx} />
      <Didascalia titolo={b.titolo} sotto={b.sotto} />
    </figure>
  )
}
