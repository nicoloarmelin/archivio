import type { Blocco, Tavola as TavolaDati } from '../data/tavole'
import { fotoSrc, type Foto } from '../data/foto'

const BASE = `${import.meta.env.BASE_URL}foto/`

type Ctx = { cartella: string; lista: Foto[]; apri: (i: number) => void }

// La doppia della tesi ricomposta: le due pagine affiancate su schermo grande, una sotto l'altra sul
// telefono. Dentro ogni pagina i blocchi stanno su 12 colonne; sul telefono i blocchi stretti vanno
// a due per riga e le palette larghe su tre colonne. Le immagini aprono la vista ingrandita.
export default function Tavola({ t, ...ctx }: { t: TavolaDati } & Ctx) {
  const pagina = (righe: Blocco[][]) => (
    <div className="space-y-6 md:space-y-7">
      {righe.map((riga, ri) => (
        <div key={ri} className="grid grid-cols-12 gap-x-2.5 gap-y-6">
          {riga.map((b, bi) => (
            <Pezzo key={bi} b={b} ctx={ctx} />
          ))}
        </div>
      ))}
    </div>
  )
  return (
    <div data-tavola className="grid gap-y-6 md:grid-cols-2 md:gap-x-10">
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
    <figcaption className="mt-2 border-b border-ink pb-1.5">
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
    <div className={`relative overflow-hidden ${fit === 'cover' ? 'bg-g50' : 'bg-white'}`} style={{ aspectRatio: String(ar) }}>
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
      <div className={`${colonne(b.span)} flex min-w-0 flex-col gap-6`}>
        {b.colonna.map((x, k) => (
          <div key={k} className="grid grid-cols-12">
            <Pezzo b={{ ...x, span: 12 }} ctx={ctx} />
          </div>
        ))}
      </div>
    )
  }
  if ('colori' in b) {
    return (
      <div className={`${colonne(b.span)} palette grid min-w-0 gap-y-4`} style={{ ['--cols' as string]: b.cols, ['--cols-telefono' as string]: b.cols > 4 ? 3 : b.cols }}>
        {b.colori.map(([nome, codici, c], k) => (
          <div key={k} className="min-w-0">
            <div className="border-g100" style={{ background: sfondo(c), aspectRatio: String(b.ar ?? 1.2), borderWidth: c.toLowerCase() === '#ffffff' ? 1 : 0 }} />
            <div className="mt-2 pr-1.5 text-[9px] leading-[1.35] tracking-normal break-words">
              <div>{nome}</div>
              <div className="whitespace-pre-line">{codici}</div>
            </div>
          </div>
        ))}
      </div>
    )
  }
  const alt = [b.titolo, b.sotto].filter(Boolean).join(', ')
  if ('gruppo' in b) {
    return (
      <figure className={`${colonne(b.span)} min-w-0`}>
        <div className="grid gap-2.5" style={{ gridTemplateColumns: `repeat(${b.cols}, minmax(0, 1fr))` }}>
          {b.gruppo.map((f) => (
            <Cornice key={f} f={f} ar={b.ar} fit={b.fit} alt={alt} ctx={ctx} />
          ))}
        </div>
        <Didascalia titolo={b.titolo} sotto={b.sotto} />
      </figure>
    )
  }
  return (
    <figure className={`${colonne(b.span)} min-w-0`}>
      <Cornice f={b.f} r={b.r} ar={b.ar} fit={b.fit} alt={alt} ctx={ctx} />
      <Didascalia titolo={b.titolo} sotto={b.sotto} />
    </figure>
  )
}
