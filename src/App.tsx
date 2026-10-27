import { useEffect, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { ArrowLeft, ArrowUpRight, Moon, Search, Sun, X } from 'lucide-react'
import Mosaico from './components/Mosaico'
import Cursor from './components/Cursor'
import { formats, ambiti, ricorrenze, dimensioni, ricerca, type Format, type Edition, type TesiFormato, type Caso } from './data/archive'

type Route =
  | { page: 'home' }
  | { page: 'archivio' }
  | { page: 'formato'; id: string }
  | { page: 'edizione'; id: string; ed: string }
  | { page: 'ricerca' }

type Image = { formato: string; edizione: string; tipo: string; didascalia: string; fonte: string }
type Filters = { ambito: string; ricorrenza: string; dimensione: string; variabilita: string; caseStudy: boolean }
const EMPTY: Filters = { ambito: '', ricorrenza: '', dimensione: '', variabilita: '', caseStudy: false }

const Meta = ({ children, className = '' }: { children: ReactNode; className?: string }) => (
  <div className={`font-sans text-[11px] uppercase tracking-[0.03em] text-g200 ${className}`}>{children}</div>
)

// Testi in serif in tondo con l'iniziale maiuscola; i nomi propri scritti in minuscolo restano tali
const cap = (s: string) => (!s || /^documenta/.test(s) ? s : s[0].toUpperCase() + s.slice(1))

const Tile = ({ text, className = '', onClick, delay = 0 }: { text: string; className?: string; onClick?: () => void; delay?: number }) => (
  <button
    onClick={onClick}
    className={`reveal group relative flex items-center justify-center bg-g50 ${className}`}
    style={{ animationDelay: `${delay}s` }}
  >
    <span className="px-3 text-center font-serif text-[12px] italic tracking-normal text-g200 transition-colors group-hover:text-ink">{cap(text)}</span>
    <span className="pointer-events-none absolute inset-0 opacity-0 ring-2 ring-archive transition-opacity group-hover:opacity-100" />
  </button>
)

export default function App() {
  const [route, setRoute] = useState<Route>({ page: 'home' })
  // Continuità: vista, filtri e posizione della mappa restano salvati
  const [view, setView] = useState<'mosaico' | 'indice'>('mosaico')
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState<Filters>(EMPTY)
  const [cam, setCam] = useState<{ x: number; y: number; z: number } | null>(null)
  const [lightbox, setLightbox] = useState<Image | null>(null)
  const [loading, setLoading] = useState(true)
  // La memoria del browser può mancare (navigazione privata, pagine incorporate): il tema resta comunque
  const [dark, setDark] = useState(() => {
    let saved: string | null = null
    try { saved = localStorage.getItem('dte-tema') } catch {}
    return saved ? saved === 'notte' : window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
    try { localStorage.setItem('dte-tema', dark ? 'notte' : 'giorno') } catch {}
  }, [dark])

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 1100)
    return () => clearTimeout(t)
  }, [])

  const go = (r: Route) => {
    setRoute(r)
    window.scrollTo(0, 0)
  }

  const section = route.page === 'formato' || route.page === 'edizione' ? 'archivio' : route.page

  return (
    <div className="min-h-svh">
      <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-archive transition-[opacity,visibility] duration-500 ${loading ? '' : 'invisible opacity-0'}`}>
        <h2 className="fadeup px-6 text-center text-[clamp(25px,3vw,40px)] text-[#231f20]">caricamento dell'archivio</h2>
      </div>

      <Nav section={section} go={go} dark={dark} toggleDark={() => setDark((d) => !d)} />

      <main key={JSON.stringify(route)} className="fadein">
        {route.page === 'home' && <Home go={go} />}
        {route.page === 'archivio' && (
          <Archivio view={view} setView={setView} q={q} setQ={setQ} filters={filters} setFilters={setFilters} go={go} cam={cam} setCam={setCam} />
        )}
        {route.page === 'formato' && <Formato f={formats.find((f) => f.id === route.id)!} go={go} open={setLightbox} />}
        {route.page === 'edizione' && (() => {
          const f = formats.find((f) => f.id === route.id)!
          return <Edizione f={f} e={f.editions.find((e) => e.id === route.ed)!} go={go} open={setLightbox} />
        })()}
        {route.page === 'ricerca' && <Ricerca go={go} />}
      </main>

      {route.page !== 'archivio' && (
        <footer className="mt-32 grid grid-cols-2 gap-4 px-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[13px] text-g200 md:grid-cols-4 md:px-10">
          <span>designed to end</span>
          <span>archivio digitale delle identità visive dei formati di eventi</span>
          <span className="hidden md:block">base: tesi / foglio archivio</span>
          <span className="hidden text-right md:block">dati segnaposto · 2026</span>
        </footer>
      )}

      {lightbox && <Lightbox img={lightbox} close={() => setLightbox(null)} />}
      <Cursor />
    </div>
  )
}

/* Navigazione a pillola, fluttuante */
function Nav({ section, go, dark, toggleDark }: { section: string; go: (r: Route) => void; dark: boolean; toggleDark: () => void }) {
  const refs = useRef<Record<string, HTMLButtonElement | null>>({})
  const [bar, setBar] = useState({ left: 0, width: 0, on: false })
  const items = [
    ['home', 'designed to end'],
    ['archivio', 'archivio'],
    ['ricerca', 'la ricerca'],
  ] as const

  useLayoutEffect(() => {
    const el = refs.current[section]
    if (el && section !== 'home') setBar({ left: el.offsetLeft, width: el.offsetWidth, on: true })
    else setBar((b) => ({ ...b, on: false }))
  }, [section])

  return (
    <nav className="fixed inset-x-0 top-[calc(0.75rem+env(safe-area-inset-top))] z-50 mx-auto flex w-fit max-w-[calc(100%-1.5rem)] items-center gap-2.5 whitespace-nowrap rounded-[8px] border border-g100 bg-surface/90 backdrop-blur-[10px] px-3.5 py-3 sm:top-[calc(1rem+env(safe-area-inset-top))] sm:gap-4 sm:px-6 sm:py-3.5 shadow-none">
      {items.map(([k, label]) => (
        <button
          key={k}
          ref={(el) => { refs.current[k] = el }}
          onClick={() => go({ page: k })}
          aria-label={k === 'home' ? label : undefined}
          className={`text-[12px] min-[400px]:text-[13px] sm:text-[clamp(16px,1.2vw,18px)] transition-colors duration-300 ease-out-soft ${section === k || k === 'home' ? 'text-ink' : 'text-g300 hover:text-ink'}`}
        >
          {/* Il Mono è largo: sui telefoni più stretti il marchio si abbrevia */}
          {k === 'home' ? (<><span className="min-[375px]:hidden">dte</span><span className="hidden min-[375px]:inline">{label}</span></>) : label}
        </button>
      ))}
      <span
        className="absolute bottom-2.5 h-[3px] bg-archive transition-all duration-300 ease-out-soft"
        style={{ left: bar.left, width: bar.width, opacity: bar.on ? 1 : 0 }}
      />
      <span className="h-4 w-px bg-g100" />
      <button
        onClick={toggleDark}
        className="-mx-1.5 rounded-[4px] p-1.5 text-g300 transition-colors hover:bg-g50 hover:text-ink"
        aria-label={dark ? 'modalità giorno' : 'modalità notte'}
        title={dark ? 'modalità giorno' : 'modalità notte'}
      >
        {dark ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </nav>
  )
}

/* 01 — Ingresso */
function Home({ go }: { go: (r: Route) => void }) {
  // Ordine casuale a ogni visita, diviso in due file che scorrono in direzioni opposte
  const rows = useMemo(() => {
    const a = [...formats]
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
    }
    const h = Math.ceil(a.length / 2)
    return [a.slice(0, h), a.slice(h)]
  }, [])
  return (
    <section className="px-6 pt-[calc(9rem+env(safe-area-inset-top))] md:px-10">
      <h1 className="text-[min(64px,calc((100vw-3rem)/5))] leading-[0.9] tracking-normal sm:text-[clamp(64px,10vw,300px)]">
        designed<br />to end
      </h1>
      <div className="mt-16 grid gap-10 md:grid-cols-4">
        <p className="font-serif text-[clamp(25px,3vw,40px)] leading-[1.15] md:col-span-2">
          Un archivio delle identità visive dei formati di eventi e delle loro edizioni.{' '}
          <span className="text-g200">Cosa resta e cosa cambia, attraverso immagini e analisi.</span>
        </p>
        <div className="flex flex-col items-start gap-3 md:col-start-4 md:items-end">
          <button onClick={() => go({ page: 'archivio' })} className="rounded-[6px] bg-ink px-[22px] py-[14px] font-serif text-[14px] tracking-normal text-paper transition-colors hover:bg-archive hover:text-[#231f20]">
            Entra nell'archivio
          </button>
          <button onClick={() => go({ page: 'ricerca' })} className="rounded-[6px] bg-g50 px-[22px] py-[14px] text-[14px] transition-colors hover:bg-g100">
            la ricerca
          </button>
        </div>
      </div>

      <div className="-mx-6 mt-24 space-y-2.5 overflow-hidden md:-mx-10">
        {rows.map((row, r) => (
          <div key={r} className="marquee-row flex w-max gap-2.5" style={{ animationDirection: r ? 'reverse' : 'normal', animationDuration: `${row.length * 3}s` }}>
            {[...row, ...row].map((f, i) => (
              <div key={`${f.id}-${i}`} className="w-[180px] shrink-0 md:w-[220px]" aria-hidden={i >= row.length || undefined}>
                <Tile text={f.name} delay={0.4 + (i % 14) * 0.04} className="aspect-[4/3] w-full" onClick={() => go({ page: 'formato', id: f.id })} />
                <div className="mt-1.5 flex justify-between gap-2 text-[12px] text-g200">
                  <span className="truncate">{f.name.toLowerCase()}</span>
                  {f.caseStudy && <span className="shrink-0 font-serif italic tracking-normal rounded-[3px] bg-archive px-1.5 text-[#231f20]">Caso studio</span>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <div className="mt-10 grid grid-cols-3 gap-4 border-t border-g100 pt-4">
        {[
          ['formati', formats.length],
          ['edizioni', formats.reduce((n, f) => n + f.editions.length, 0)],
          ['casi studio', formats.filter((f) => f.caseStudy).length],
        ].map(([k, v]) => (
          <div key={k as string}>
            <Meta>{k}</Meta>
            <div className="mt-1 text-[clamp(40px,5.1vw,120px)] leading-none tracking-normal">{v}</div>
          </div>
        ))}
      </div>
    </section>
  )
}

/* 02 — Orientamento: mosaico (mappa) / indice + filtri in overlay */
function Archivio({ view, setView, q, setQ, filters, setFilters, go, cam, setCam }: {
  view: 'mosaico' | 'indice'
  setView: (v: 'mosaico' | 'indice') => void
  q: string
  setQ: (s: string) => void
  filters: Filters
  setFilters: (f: Filters) => void
  go: (r: Route) => void
  cam: { x: number; y: number; z: number } | null
  setCam: (c: { x: number; y: number; z: number }) => void
}) {
  const [panel, setPanel] = useState(false)
  const list = useMemo(
    () =>
      formats.filter(
        (f) =>
          f.name.toLowerCase().includes(q.toLowerCase()) &&
          (!filters.ambito || f.ambito === filters.ambito) &&
          (!filters.ricorrenza || f.ricorrenza === filters.ricorrenza) &&
          (!filters.dimensione || f.dimensione === filters.dimensione) &&
          (!filters.variabilita || f.variabilita === filters.variabilita) &&
          (!filters.caseStudy || f.caseStudy),
      ),
    [q, filters],
  )
  const matches = useMemo(() => new Set(list.map((f) => f.id)), [list])
  const active = (['ambito', 'ricorrenza', 'dimensione', 'variabilita'] as const).filter((k) => filters[k]).length + (filters.caseStudy ? 1 : 0)
  const set = (k: keyof Filters, v: string | boolean) => setFilters({ ...filters, [k]: v })

  const Chips = ({ k, label, opts }: { k: 'ambito' | 'ricorrenza' | 'dimensione' | 'variabilita'; label: string; opts: string[] }) => (
    <div>
      <Meta>{label}</Meta>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {opts.map((o) => (
          <button
            key={o}
            onClick={() => set(k, filters[k] === o ? '' : o)}
            className={`rounded-[6px] px-3.5 py-2 text-[14px] transition-colors ${filters[k] === o ? 'bg-archive text-[#231f20]' : 'bg-g50 hover:bg-g100'}`}
          >
            {o.toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  )

  return (
    <section className={view === 'mosaico' ? 'relative h-svh overflow-hidden' : 'px-6 pt-[calc(8rem+env(safe-area-inset-top))] md:px-10'}>
      {view === 'mosaico' && <Mosaico formats={formats} matches={matches} onOpen={(id) => go({ page: 'formato', id })} cam={cam} setCam={setCam} />}

      {view === 'indice' && (
        <div className="pb-10 text-center">
          <h1 className="text-[clamp(40px,5.1vw,120px)] leading-[0.95] tracking-normal">indice illustrato</h1>
        </div>
      )}
      {/* Barra di controllo fluttuante */}
      <div
        className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 flex items-center gap-1 rounded-[8px] border border-g100 bg-surface/90 backdrop-blur-[10px] p-1.5 sm:inset-x-auto sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] sm:left-1/2 sm:w-fit sm:-translate-x-1/2"
      >
        <div className="flex rounded-[6px] bg-g50 p-0.5">
          {(['mosaico', 'indice'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={`rounded-[4px] px-2 py-2 text-[12px] transition-colors min-[400px]:px-2.5 min-[400px]:text-[14px] sm:px-3.5 ${view === v ? 'bg-archive text-[#231f20]' : 'text-g300 hover:text-ink'}`}>
              {v}
            </button>
          ))}
        </div>
        <label className="flex min-w-0 flex-1 items-center gap-2 px-2 sm:flex-none sm:px-3">
          <Search size={14} className="text-g200" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="cerca" className="w-full min-w-0 bg-transparent text-[16px] outline-none placeholder:text-g200 sm:w-44 sm:text-[14px]" />
        </label>
        <button onClick={() => setPanel(true)} className="flex shrink-0 items-center gap-2 rounded-[6px] px-2 py-2 text-[12px] text-g300 min-[400px]:px-3 min-[400px]:text-[14px] hover:bg-g50 hover:text-ink sm:px-3.5">
          filtri
          {active > 0 && <span className="flex h-4 min-w-4 items-center justify-center rounded-[3px] bg-archive px-1 text-[10px] text-[#231f20]">{active}</span>}
        </button>
        <span className="hidden pr-3 pl-1 text-[13px] tabular-nums text-g200 sm:block">{list.length}/{formats.length}</span>
      </div>

      {view === 'indice' && <IndiceRows list={list} go={go} />}

      {view === 'mosaico' && (
        <div className="pointer-events-none fixed bottom-[calc(1.75rem+env(safe-area-inset-bottom))] left-6 z-30 hidden text-[13px] text-g200 lg:block">
          trascina · scroll · ⌘ + scroll per zoom
        </div>
      )}
      {view === 'mosaico' && (
        <div className="pointer-events-none fixed inset-x-0 top-[calc(4.5rem+env(safe-area-inset-top))] z-30 text-center text-[12px] text-g200 sm:hidden">trascina · pizzica per zoom</div>
      )}

      {/* Scheda filtri in overlay */}
      <div className={`fixed inset-0 z-[60] transition-[visibility] ${panel ? '' : 'invisible'}`}>
        <div className={`absolute inset-0 bg-paper/60 transition-opacity duration-300 ${panel ? 'opacity-100' : 'opacity-0'}`} onClick={() => setPanel(false)} />
        <aside className={`absolute inset-x-2 bottom-2 flex max-h-[calc(85svh-env(safe-area-inset-top))] flex-col rounded-[12px] border border-g100 bg-surface p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] transition-transform duration-500 ease-out-soft sm:inset-x-auto sm:bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:right-4 sm:top-[calc(1rem+env(safe-area-inset-top))] sm:max-h-none sm:w-[calc(100%-2rem)] sm:max-w-[420px] sm:p-6 ${panel ? 'translate-y-0 sm:translate-x-0' : 'translate-y-[110%] sm:translate-y-0 sm:translate-x-[110%]'}`}>
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[clamp(25px,3vw,40px)] leading-none">filtri</h2>
              <Meta className="mt-2">condivisi tra mosaico e indice</Meta>
            </div>
            <button onClick={() => setPanel(false)} className="rounded-[6px] bg-g50 p-2 hover:bg-g100" aria-label="Chiudi"><X size={16} /></button>
          </div>
          <div className="mt-8 flex-1 space-y-8 overflow-y-auto overscroll-contain sm:mt-10">
            <Chips k="ambito" label="ambito" opts={ambiti} />
            <Chips k="ricorrenza" label="ricorrenza" opts={ricorrenze} />
            <Chips k="dimensione" label="dimensione" opts={dimensioni} />
            <Chips k="variabilita" label="grado di variabilità" opts={['bassa', 'media', 'alta', 'n.d.']} />
            <div>
              <Meta>approfondimento</Meta>
              <button onClick={() => set('caseStudy', !filters.caseStudy)} className={`mt-3 rounded-[6px] px-3.5 py-2 text-[14px] transition-colors ${filters.caseStudy ? 'bg-archive text-[#231f20]' : 'bg-g50 hover:bg-g100'}`}>
                solo con caso studio
              </button>
            </div>
          </div>
          <div className="flex gap-2 pt-6">
            <button onClick={() => setFilters(EMPTY)} className="flex-1 rounded-[6px] bg-g50 py-[14px] text-[14px] hover:bg-g100">azzera</button>
            <button onClick={() => setPanel(false)} className="flex-1 rounded-[6px] bg-ink py-[14px] font-serif text-[14px] tracking-normal text-paper hover:bg-archive hover:text-[#231f20]">
              Mostra {list.length} formati
            </button>
          </div>
        </aside>
      </div>
    </section>
  )
}

function IndiceRows({ list, go }: { list: Format[]; go: (r: Route) => void }) {
  return (
    <div className="pb-[calc(7rem+env(safe-area-inset-bottom))]">
      <div className="hidden grid-cols-[88px_1fr_1fr_1fr_1fr_100px] gap-6 border-b border-g100 pb-3 text-[13px] text-g200 md:grid">
        <span />
        <span>formato</span>
        <span>ambito</span>
        <span>ricorrenza</span>
        <span>variabilità</span>
        <span className="text-right">dal</span>
      </div>
      {list.map((f, i) => (
        <button
          key={f.id}
          onClick={() => go({ page: 'formato', id: f.id })}
          className="group grid w-full grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-4 border-b md:gap-6 border-g50 py-3 text-left md:grid-cols-[88px_1fr_1fr_1fr_1fr_100px]"
        >
          <div className="reveal flex aspect-[4/3] items-center justify-center bg-g50 transition-colors group-hover:bg-archive" style={{ animationDelay: `${Math.min(i, 20) * 0.025}s` }}>
            <span className="font-serif text-[9px] italic tracking-normal text-g200">Logo</span>
          </div>
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-3 gap-y-1">
            <span className="text-[clamp(18px,1.6vw,24px)] transition-transform duration-300 ease-out-soft group-hover:translate-x-1.5">{f.name.toLowerCase()}</span>
            {f.caseStudy && <span className="font-serif text-[12px] italic tracking-normal rounded-[3px] bg-archive px-1.5 text-[#231f20]">Caso studio</span>}
          </div>
          <span className="hidden text-g300 md:block">{f.ambito.toLowerCase()}</span>
          <span className="hidden text-g300 md:block">{f.ricorrenza.toLowerCase()}</span>
          <span className="hidden text-g300 md:block">{f.variabilita}</span>
          <span className="text-right tabular-nums text-g300">{f.primaEdizione ?? '—'}</span>
        </button>
      ))}
      {list.length === 0 && <p className="py-24 text-center text-[clamp(25px,3vw,40px)] text-g200">nessun formato corrisponde ai filtri</p>}
    </div>
  )
}

const TIPI = ['logo', 'manifesto', 'applicazione', 'segnaletica', 'pubblicazione', 'merchandising', 'allestimento', 'biglietto']
const RATIOS = ['aspect-[3/4]', 'aspect-square', 'aspect-[4/5]', 'aspect-[2/3]', 'aspect-[4/3]', 'aspect-[3/5]']

/* 03–04 — Scheda del formato */
function Formato({ f, go, open }: { f: Format; go: (r: Route) => void; open: (i: Image) => void }) {
  const info: [string, string][] = [
    ['ambito', f.ambito], ['titolare', f.titolare], ['produttore', f.produttore], ['ricorrenza', f.ricorrenzaNota || f.ricorrenza],
    ['prima edizione', f.primaEdizione ? String(f.primaEdizione) : '—'], ['edizioni svolte', f.edizioniSvolte ? String(f.edizioniSvolte) : '—'], ['arco temporale', f.arco || '—'], ['dimensione', f.dimensione], ['sede', f.sede], ['durata', f.durata],
    ['segni permanenti', f.segniPermanenti], ['variabilità', f.variabilita + (f.periodoVariabilita ? ` (${f.periodoVariabilita.replace(/^([A-Z])(?=[a-zà-ù])/, (m) => m.toLowerCase())})` : '')], ['edizioni confrontate', f.edizioniConfrontate || '—'],
  ]
  // Galleria solo per i formati senza caso studio (i casi studio usano timeline dei loghi e approfondimenti)
  const gallery = f.editions
  const img = (edizione: string, tipo: string): Image => ({ formato: f.name, edizione, tipo, didascalia: 'didascalia da definire', fonte: f.fonti })

  return (
    <article className="px-6 pt-[calc(8rem+env(safe-area-inset-top))] md:px-10">
      <BackBtn onClick={() => go({ page: 'archivio' })} label="archivio" />

      <header className="mt-10 grid gap-10 md:grid-cols-4">
        <div className="text-center md:col-span-4">
          <Meta>scheda del formato</Meta>
          <h1 className="mt-4 text-[clamp(48px,7vw,180px)] leading-[0.9] tracking-normal [overflow-wrap:anywhere] hyphens-auto">{f.name.toLowerCase()}</h1>
        </div>
      </header>

      <Tile text="logo del formato" className="mt-16 aspect-[4/3] w-full md:aspect-[21/9]" onClick={() => open(img(String(f.primaEdizione ?? ''), 'logo'))} />

      <div className="mt-16 grid gap-10 md:grid-cols-4">
        <p className="font-serif text-[clamp(22px,2.2vw,32px)] leading-[1.25] md:col-span-3">{f.tesi?.intro || f.descrizione}</p>
      </div>
      <dl className="mt-10 grid grid-cols-2 gap-x-6 border-t border-g100 md:grid-cols-4 md:gap-x-10">
        {info.map(([k, v]) => (
          <div key={k} className="border-b border-g50 py-3">
            <Meta>{k}</Meta>
            <dd className="mt-1 font-serif leading-snug">{cap(v)}</dd>
          </div>
        ))}
      </dl>

      {f.tesi && <Serie t={f.tesi} />}

      {!f.caseStudy && (
        <section className="mt-32">
          <SectionHead title="identità visive di alcune edizioni" sub="loghi e applicazioni raccolti per edizione · anno, didascalia e fonte" />
          <div className="space-y-20">
            {gallery.map((e, gi) => (
              <div key={e.id}>
                <div className="flex items-baseline justify-between border-t border-ink pt-3">
                  <span className="text-[clamp(32px,4vw,64px)] leading-none tracking-normal tabular-nums">{e.year}</span>
                  <Meta>{(e.caseStudy ? e.label : e.city || '').toLowerCase()}</Meta>
                </div>
                {/* Masonry: colonne CSS, altezze variabili come una bacheca */}
                <div className="mt-5 columns-2 gap-2.5 md:columns-3 lg:columns-4">
                  {TIPI.slice(0, 5 + ((e.year + gi) % 4)).map((t, i) => (
                    <div key={t} className="mb-2.5 break-inside-avoid">
                      <Tile text={t} delay={i * 0.04} className={`w-full ${RATIOS[(e.year * 7 + i * 3) % RATIOS.length]}`} onClick={() => open(img(String(e.year), t))} />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {f.caseStudy ? (
        <section className="mt-32">
          <SectionHead title="tutte le edizioni" sub="loghi di tutte le edizioni in ordine cronologico. le edizioni in lilla aprono una scheda approfondita." />
          <div className="relative">
            <div className="absolute inset-x-0 top-[44px] h-px bg-g100 md:top-[60px]" />
            <div className="relative flex gap-8 overflow-x-auto pb-6">
              {f.editions.map((e, i) => (
                <button
                  key={e.id}
                  onClick={() => (e.caseStudy ? go({ page: 'edizione', id: f.id, ed: e.id }) : open(img(String(e.year), 'logo')))}
                  className="group flex shrink-0 flex-col items-center gap-3"
                >
                  <span
                    className={`reveal flex h-[88px] w-[88px] items-center justify-center rounded-full md:h-[120px] md:w-[120px] font-serif text-[12px] italic tracking-normal transition-transform duration-300 ease-out-soft group-hover:scale-105 ${e.caseStudy ? 'bg-archive text-[#231f20]' : 'bg-g50 text-g200'}`}
                    style={{ animationDelay: `${i * 0.06}s` }}
                  >
                    Logo
                  </span>
                  <span className="tabular-nums">{e.year}</span>
                  {e.city && <span className="-mt-2 max-w-[88px] text-center md:max-w-[120px] text-[12px] leading-tight text-g200">{e.city.toLowerCase()}</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-12 border-t border-g100">
            {f.editions.filter((e) => e.caseStudy).map((e) => (
              <button
                key={e.id}
                onClick={() => go({ page: 'edizione', id: f.id, ed: e.id })}
                className="group flex w-full items-center justify-between border-b border-g100 py-5 text-left"
              >
                <span className="text-[clamp(28px,3.4vw,56px)] leading-none tracking-normal transition-transform duration-300 ease-out-soft group-hover:translate-x-3">
                  {e.label.toLowerCase()}
                </span>
                <span className="flex items-center gap-2 font-serif text-[13px] italic tracking-normal text-g200 group-hover:text-ink">
                  Scheda dell'edizione <ArrowUpRight size={16} />
                </span>
              </button>
            ))}
          </div>
        </section>
      ) : null}
    </article>
  )
}

/* Serie delle edizioni — testo e tabella dalla tesi (cap. 6, «Le edizioni») */
function Serie({ t }: { t: TesiFormato }) {
  const [all, setAll] = useState(false)
  const rows = all ? t.tabella.rows : t.tabella.rows.slice(0, 12)
  return (
    <section className="mt-32">
      <SectionHead title="la serie delle edizioni" sub="dalla tesi · continuità, discontinuità e cambi di fase del formato" />
      <div className="grid gap-10 md:grid-cols-4">
        <div className="space-y-5 font-serif text-[15px] leading-[1.65] tracking-normal text-g300 md:col-span-2">
          {t.edizioniTesto.map((p, i) => (
            <p key={i} className={i === 0 ? 'text-ink' : ''}>{p}</p>
          ))}
        </div>
      </div>
      {/* Righe su griglia a 4 colonne, allineate al resto della pagina; le colonne in più condividono l'ultima */}
      <div className="mt-16 overflow-x-auto">
        <div className="min-w-[560px]">
          <TRow cells={t.tabella.header} className="border-b border-ink pb-3 text-[13px] text-g200" />
          {rows.map((r, i) => (
            <TRow
              key={i}
              cells={r.map((c, j) => (
                <>
                  <span className="tabular-nums">{c.toLowerCase()}</span>
                  {j === 0 && t.casi[c] && <span className="ml-2 font-serif text-[12px] italic tracking-normal rounded-[3px] bg-archive px-1.5 text-[#231f20]">Caso studio</span>}
                </>
              ))}
              className={`border-b border-g50 py-2.5 ${t.casi[r[0]] ? 'text-ink' : 'text-g300'}`}
            />
          ))}
        </div>
      </div>
      {t.tabella.rows.length > 12 && (
        <button onClick={() => setAll(!all)} className="mt-6 rounded-[6px] bg-g50 px-3.5 py-2 text-[14px] hover:bg-g100">
          {all ? 'mostra meno' : `mostra tutte le ${t.tabella.rows.length} edizioni`}
        </button>
      )}
    </section>
  )
}

/* 05 — Scheda dell'edizione */
function Edizione({ f, e, go, open }: { f: Format; e: Edition; go: (r: Route) => void; open: (i: Image) => void }) {
  const others = f.editions.filter((x) => x.caseStudy && x.id !== e.id)
  const c = e.caso
  const mats = ['manifesto', 'pittogrammi', 'segnaletica', 'biglietto', 'merchandising', 'pubblicazione', 'uniforme', 'medaglia']
  return (
    <article className="px-6 pt-[calc(8rem+env(safe-area-inset-top))] md:px-10">
      <BackBtn onClick={() => go({ page: 'formato', id: f.id })} label={f.name.toLowerCase()} />

      <header className="mt-10 grid gap-10 md:grid-cols-4">
        <div className="text-center md:col-span-4">
          <Meta>scheda dell'edizione · caso studio · {f.name.toLowerCase()}</Meta>
          <h1 className="mt-4 text-[clamp(48px,7vw,180px)] leading-[0.9] tracking-normal [overflow-wrap:anywhere] hyphens-auto">{e.label.toLowerCase()}</h1>
        </div>
      </header>

      <Tile
        text="logo dell'edizione e identità visiva"
        className="mt-16 aspect-[4/3] w-full md:aspect-[21/9]"
        onClick={() => open({ formato: f.name, edizione: e.label, tipo: 'logo', didascalia: 'didascalia', fonte: f.fonti })}
      />

      <section className="mt-32">
        <SectionHead title="logo e immagini" sub="applicazioni e materiali selezionati · didascalie, autori e fonti" />
        <div className="columns-2 gap-2.5 md:columns-3 lg:columns-4">
          {mats.map((t, i) => (
            <div key={t} className="mb-2.5 break-inside-avoid">
              <Tile text={t} delay={i * 0.05} className={`w-full ${RATIOS[(e.year * 7 + i * 3) % RATIOS.length]}`} onClick={() => open({ formato: f.name, edizione: e.label, tipo: t, didascalia: 'didascalia, autore', fonte: f.fonti })} />
            </div>
          ))}
        </div>
      </section>

      {c && (
        <section className="mt-32">
          <SectionHead title="spiegazione e analisi" sub="dalla tesi · contesto, progetto grafico e rapporto con il formato" />
          <div className="grid gap-10 md:grid-cols-4">
            <div className="space-y-5 md:col-span-2">
              {c.descrizione.map((p, i) => (
                <p key={i} className="font-serif text-[clamp(20px,1.8vw,26px)] leading-[1.3]">{p}</p>
              ))}
            </div>
          </div>
          <dl className="mt-16 grid border-t border-ink md:grid-cols-2 lg:grid-cols-3">
            {c.scheda.map(([k, v]) => (
              <div key={k} className="border-b border-g100 py-4 pr-6">
                <Meta>{k.toLowerCase()}</Meta>
                <dd className="mt-1.5 font-serif leading-snug">{v}</dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {c && <Ciclo c={c} />}

      <section className="mt-32 border-t border-g100">
        {[
          { label: `← ${f.name.toLowerCase()}`, hint: 'Torna alla scheda del formato', on: () => go({ page: 'formato', id: f.id }) },
          ...others.map((o) => ({ label: o.label.toLowerCase(), hint: 'Altra edizione approfondita', on: () => go({ page: 'edizione', id: f.id, ed: o.id }) })),
          { label: 'archivio', hint: 'Scegli un altro formato', on: () => go({ page: 'archivio' }) },
        ].map((r) => (
          <button key={r.label} onClick={r.on} className="group flex w-full items-center justify-between border-b border-g100 py-5 text-left">
            <span className="text-[clamp(28px,3.4vw,56px)] leading-none tracking-normal transition-transform duration-300 ease-out-soft group-hover:translate-x-3">{r.label}</span>
            <span className="font-serif text-[13px] italic tracking-normal text-g200 group-hover:text-ink">{r.hint}</span>
          </button>
        ))}
      </section>
    </article>
  )
}

/* Ciclo di vita: date ordinate sulle tre fasi (cap. 5) e testo della tesi per ciascuna fase */
function Ciclo({ c }: { c: Caso }) {
  const phases: { k: string; v: string; date: [string, string][]; testo: string[] }[] = [
    { k: 'pre', v: 'candidatura, progettazione, presentazione', date: [], testo: [] },
    { k: 'evento', v: 'svolgimento', date: [], testo: [] },
    { k: 'post', v: 'congedo, dismissione e persistenza dei segni', date: [], testo: [] },
  ]
  const misure: [string, string][] = []
  let ph = 0
  for (const [k, v] of c.date) {
    if (/^(distanza|durata)/i.test(k)) { misure.push([k, v]); continue }
    if (/^(apertura|semifinali|finale)/i.test(k)) ph = 1
    phases[ph].date.push([k, v])
    if (/^chiusura/i.test(k)) ph = 2
  }
  let tp = 0
  for (const p of c.ciclo) {
    if (/fase dell.evento/i.test(p.slice(0, 40))) tp = 1
    else if (/fase post|fase conclusiva/i.test(p.slice(0, 40))) tp = 2
    phases[tp].testo.push(p)
  }
  return (
    <section className="mt-32">
      <SectionHead title="ciclo di vita e date" sub="presentazione, evento e fase post · le date disponibili ordinate sull'asse del progetto" />
      <div className="relative grid gap-12 pt-10 md:grid-cols-3 md:gap-10">
        <div className="absolute inset-x-0 top-0 h-px bg-ink" />
        {phases.map((p, i) => (
          <div key={p.k} className="relative">
            <span className="absolute -top-[45.5px] left-0 hidden h-[11px] w-[11px] rounded-full bg-archive ring-1 ring-ink md:block" />
            <div className="text-[clamp(25px,3vw,40px)] leading-none">{p.k}</div>
            <Meta className="mt-2">{p.v}</Meta>
            {p.date.length > 0 && (
              <ol className="mt-6 border-t border-g100">
                {p.date.map(([k, v], j) => (
                  <li key={j} className="grid grid-cols-[1fr_auto] gap-4 border-b border-g50 py-2.5 text-[14px] leading-snug">
                    <span>{k || v}</span>
                    {k && <span className="text-right tabular-nums text-g200">{v.replace(/\.$/, '')}</span>}
                  </li>
                ))}
              </ol>
            )}
            <div className="mt-6 space-y-4 font-serif text-[15px] leading-[1.65] tracking-normal text-g300">
              {p.testo.map((t, j) => <p key={j}>{t}</p>)}
            </div>
          </div>
        ))}
      </div>
      {misure.length > 0 && (
        <div className="mt-16 grid grid-cols-2 gap-px border-t border-ink md:grid-cols-4">
          {misure.map(([k, v]) => (
            <div key={k} className="py-4 pr-4">
              <div className="text-[clamp(22px,2.2vw,32px)] leading-none tracking-normal">{v.replace(/\.$/, '')}</div>
              <Meta className="mt-2">{k.toLowerCase()}</Meta>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}

/* La ricerca */
function Ricerca({ go }: { go: (r: Route) => void }) {
  const r = ricerca
  const glossario: [string, string][] = [
    ['formato', 'Il contenitore ricorrente: nome, regole, titolare e, spesso, alcuni segni che attraversano le occorrenze.'],
    ['edizione', "L'occorrenza a termine del formato, con una data di inizio e una di fine e un apparato visivo proprio."],
    ['titolare', "Il soggetto permanente che conserva il formato: concede il nome, stabilisce i vincoli e continua a operare dopo le singole edizioni."],
    ['produttore', "Chi realizza l'edizione, spesso un comitato o una struttura che si scioglie a manifestazione conclusa. Lo studio grafico non lo sostituisce."],
    ['segni permanenti', "Gli elementi grafici che il formato trattiene da un'edizione all'altra; nome, sede o trofeo non bastano da soli."],
    ['grado di variabilità', "Il margine entro cui l'apparato di un'edizione può differire da quello della precedente. Il grado esercitato si osserva confrontando gli artefatti; il grado concesso solo quando un documento del titolare lo attesta."],
    ['ciclo di vita', 'Le tre fasi di un\'identità di evento: presentazione e promozione, evento, fase post fino alla dismissione dei segni e alla loro eventuale persistenza.'],
  ]
  const sections: { t: string; body: ReactNode }[] = [
    { t: 'la tesi', body: r.abstract.map((p, i) => <p key={i} className={i === 0 ? 'text-ink' : ''}>{p}</p>) },
    {
      t: 'domanda di ricerca',
      body: r.domanda.slice(0, 4).map((p, i) => {
        // La domanda evidenziata come nella tesi: Mono corsivo su fondo lilla, staccata dal testo che la introduce
        const q = i === 1 ? p.match(/^(.*?ricerca:)\s*(.+?\?)\s*(.*)$/s) : null
        if (!q) return <p key={i}>{p}</p>
        return (
          <div key={i} className="space-y-5 text-ink">
            <p>{q[1]}</p>
            <p className="font-sans text-[clamp(17px,1.4vw,20px)] italic leading-[1.7] tracking-normal">
              <mark className="bg-archive px-1.5 py-0.5 text-[#231f20] [-webkit-box-decoration-break:clone] [box-decoration-break:clone]">{cap(q[2])}</mark>
            </p>
            {q[3] && <p>{q[3]}</p>}
          </div>
        )
      }),
    },
    { t: 'metodo', body: r.metodo.map((p, i) => <p key={i}>{p}</p>) },
    {
      t: 'glossario',
      body: (
        <dl className="border-t border-g100">
          {glossario.map(([k, v]) => (
            <div key={k} className="grid gap-2 border-b border-g50 py-3 md:grid-cols-[180px_1fr]">
              <dt className="font-sans uppercase tracking-normal text-ink">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      ),
    },
    {
      t: 'gradi di variabilità',
      body: r.gradi.map(([k, p]) => (
        <div key={k} className="border-t border-g100 pt-3">
          <div className="font-sans text-[clamp(20px,1.8vw,26px)] uppercase tracking-normal text-ink">{k}</div>
          <p className="mt-2">{p}</p>
        </div>
      )),
    },
    {
      t: 'bibliografia e fonti',
      body: (
        <>
          <ul className="space-y-2.5 text-[14px]">{r.bibliografia.map((b) => <li key={b} className="pl-6 -indent-6">{b}</li>)}</ul>
          <Meta className="!mt-10">repertori e fonti documentarie</Meta>
          <ul className="space-y-2.5 text-[14px]">{r.repertori.map((b) => <li key={b} className="pl-6 -indent-6">{b}</li>)}</ul>
        </>
      ),
    },
    {
      t: 'crediti',
      body: (
        <dl className="border-t border-g100">
          {[['tesi', r.crediti.titolo], ['autore', r.crediti.studente], ['relatore', r.crediti.relatore], ['istituzione', r.crediti.istituzione], ['anno accademico', r.crediti.anno]].map(([k, v]) => (
            <div key={k} className="grid gap-2 border-b border-g50 py-3 md:grid-cols-[180px_1fr]">
              <dt className="font-sans uppercase tracking-normal text-ink">{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      ),
    },
  ]
  return (
    <article className="px-6 pt-[calc(8rem+env(safe-area-inset-top))] md:px-10">
      <header className="grid gap-10 md:grid-cols-4">
        <Meta>la ricerca</Meta>
        <h1 className="text-[clamp(48px,7vw,180px)] leading-[0.9] tracking-normal [overflow-wrap:anywhere] hyphens-auto md:col-span-3">metodo, glossario, fonti</h1>
      </header>
      <div className="mt-24 grid gap-10 md:grid-cols-4">
        <nav className="space-y-1.5 md:sticky md:top-28 md:self-start">
          {sections.map(({ t }, i) => (
            <a key={t} href={`#${t}`} className="flex gap-3 text-g300 transition-colors hover:text-ink">
              <span className="w-5 tabular-nums text-g100">{String(i + 1).padStart(2, '0')}</span>
              {t}
            </a>
          ))}
        </nav>
        <div className="min-w-0 md:col-span-3">
          {sections.map(({ t, body }) => (
            <section key={t} id={t} className="grid scroll-mt-28 gap-6 border-t border-g100 py-10 md:grid-cols-3">
              <h2 className="text-[clamp(25px,3vw,40px)] leading-none">{t}</h2>
              <div className="min-w-0 space-y-5 font-serif text-[15px] leading-[1.65] tracking-normal text-g300 [overflow-wrap:anywhere] md:col-span-2">{body}</div>
            </section>
          ))}
          <button onClick={() => go({ page: 'archivio' })} className="mt-6 rounded-[6px] bg-ink px-[22px] py-[14px] font-serif text-[14px] tracking-normal text-paper hover:bg-archive hover:text-[#231f20]">
            Vai all'archivio
          </button>
        </div>
      </div>
    </article>
  )
}

/* Consultazione delle immagini */
function Lightbox({ img, close }: { img: Image; close: () => void }) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', k)
    return () => window.removeEventListener('keydown', k)
  }, [close])
  return (
    <div className="fadeup fixed inset-0 z-[70] grid grid-rows-[minmax(0,1fr)_auto] gap-4 bg-paper p-3 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-[calc(0.75rem+env(safe-area-inset-bottom))] md:grid-cols-[1fr_320px] md:grid-rows-1 md:gap-6 md:p-10">
      <div className="reveal flex items-center justify-center bg-g50">
        <span className="font-serif text-[14px] italic tracking-normal text-g200">Immagine ingrandita</span>
      </div>
      <aside className="flex max-h-[45svh] flex-col md:max-h-none">
        <button onClick={close} className="order-first ml-auto rounded-[6px] bg-g50 px-3.5 py-2 text-[14px] hover:bg-g100">chiudi</button>
        <div className="mt-3 space-y-4 overflow-y-auto md:mt-auto">
          {[['formato', img.formato], ['edizione', img.edizione], ['tipo di applicazione', img.tipo], ['didascalia', img.didascalia]].map(([k, v]) => (
            <div key={k} className="border-t border-g100 pt-2">
              <Meta>{k}</Meta>
              <p className="mt-1 whitespace-pre-line break-words">{v.toLowerCase()}</p>
            </div>
          ))}
        </div>
      </aside>
    </div>
  )
}

function TRow({ cells, className = '' }: { cells: ReactNode[]; className?: string }) {
  const main = cells.slice(0, 3)
  const rest = cells.slice(3)
  return (
    <div className={`grid grid-cols-4 gap-x-6 md:gap-x-10 ${className}`}>
      {main.map((c, i) => <div key={i}>{c}</div>)}
      <div className="grid gap-x-4" style={{ gridTemplateColumns: `repeat(${rest.length}, minmax(0, 1fr))` }}>
        {rest.map((c, i) => <div key={i}>{c}</div>)}
      </div>
    </div>
  )
}

function SectionHead({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-10 grid gap-10 md:grid-cols-4">
      <div className="text-center md:col-span-4">
        <h2 className="text-[clamp(32px,4vw,72px)] leading-[0.95] tracking-normal">{title}</h2>
        {sub && <Meta className="mt-3">{sub}</Meta>}
      </div>
    </div>
  )
}

function BackBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="group flex items-center gap-2 text-g300 transition-colors hover:text-ink">
      <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" /> {label}
    </button>
  )
}
