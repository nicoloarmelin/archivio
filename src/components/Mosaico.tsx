import { useEffect, useMemo, useRef, useState } from 'react'
import { Minus, Plus, Maximize } from 'lucide-react'
import type { Format } from '../data/archive'

const COLS = 10
const TW = 220
const TH = 165
const GAP = 40
const STEP = TW + GAP
const STEP_Y = TH + GAP + 24
const MIN_Z = 0.25
const MAX_Z = 2.5
const FRICTION = 0.92

// Ordine deterministico: ogni formato ha una posizione stabile nel blocco che si ripete
const shuffle = <T,>(arr: T[]) => {
  const a = [...arr]
  let seed = 7
  for (let i = a.length - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280
    const j = Math.floor((seed / 233280) * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

type Cam = { x: number; y: number; z: number }

export default function Mosaico({ formats, matches, onOpen, cam, setCam }: {
  formats: Format[]
  matches: Set<string>
  onOpen: (id: string) => void
  cam: Cam | null
  setCam: (c: Cam) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [placed] = useState(() => shuffle(formats))
  const rows = Math.ceil(placed.length / COLS)
  const W = COLS * STEP + STEP / 2
  const H = rows * STEP_Y

  const c = useRef<Cam>(cam ?? { x: 0, y: 0, z: 1 })
  const [, force] = useState(0)
  const vel = useRef({ x: 0, y: 0 })
  const drag = useRef<{ x: number; y: number; t: number; moved: number } | null>(null)
  const raf = useRef(0)
  const lastMoved = useRef(0)
  // Puntatori attivi: con due dita si fa pinch-zoom
  const pts = useRef(new Map<number, { x: number; y: number }>())
  const pinch = useRef<{ d: number } | null>(null)
  // Comparsa a cascata solo al primo ingresso; le celle che entrano dopo, scorrendo, appaiono già al loro posto
  const born = useRef(performance.now())
  const firstSeen = useRef(new Map<string, number>())

  // Mosaico infinito: nessun limite di posizione, il blocco dei formati si ripete in ogni direzione
  const apply = (k: Cam) => {
    c.current = k
    force((n) => n + 1)
  }

  const center = (z = 1) => {
    const el = ref.current!
    apply({ z, x: (el.clientWidth - W * z) / 2, y: (el.clientHeight - H * z) / 2 })
  }

  useEffect(() => {
    if (!cam) center(ref.current!.clientWidth < 640 ? 0.6 : 1)
    else apply(cam)
    return () => {
      cancelAnimationFrame(raf.current)
      setCam(c.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const inertia = () => {
    vel.current.x *= FRICTION
    vel.current.y *= FRICTION
    if (Math.abs(vel.current.x) < 0.1 && Math.abs(vel.current.y) < 0.1) return
    apply({ ...c.current, x: c.current.x + vel.current.x, y: c.current.y + vel.current.y })
    raf.current = requestAnimationFrame(inertia)
  }

  const zoomAt = (factor: number, px: number, py: number) => {
    const k = c.current
    const z = Math.min(MAX_Z, Math.max(MIN_Z, k.z * factor))
    const r = z / k.z
    apply({ z, x: px - (px - k.x) * r, y: py - (py - k.y) * r })
  }

  // wheel: scroll su due assi; ctrl/pinch = zoom (listener non passivo)
  useEffect(() => {
    const el = ref.current!
    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      cancelAnimationFrame(raf.current)
      const rect = el.getBoundingClientRect()
      if (e.ctrlKey || e.metaKey) zoomAt(Math.exp(-e.deltaY * 0.01), e.clientX - rect.left, e.clientY - rect.top)
      else apply({ ...c.current, x: c.current.x - e.deltaX, y: c.current.y - e.deltaY })
    }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const pinchDist = () => {
    const [a, b] = [...pts.current.values()]
    return { d: Math.hypot(a.x - b.x, a.y - b.y), mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }
  }
  const onDown = (e: React.PointerEvent) => {
    cancelAnimationFrame(raf.current)
    pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pts.current.size === 2) {
      pinch.current = { d: pinchDist().d }
      drag.current = null
      lastMoved.current = 99
      return
    }
    drag.current = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0 }
    vel.current = { x: 0, y: 0 }
  }
  const onMove = (e: React.PointerEvent) => {
    if (pts.current.has(e.pointerId)) pts.current.set(e.pointerId, { x: e.clientX, y: e.clientY })
    if (pinch.current && pts.current.size === 2) {
      const { d: nd, mx, my } = pinchDist()
      const rect = ref.current!.getBoundingClientRect()
      zoomAt(nd / pinch.current.d, mx - rect.left, my - rect.top)
      pinch.current.d = nd
      return
    }
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x, dy = e.clientY - d.y
    d.moved += Math.abs(dx) + Math.abs(dy)
    if (d.moved > 4) (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
    const now = performance.now()
    const dt = Math.max(1, now - d.t)
    vel.current = { x: (dx / dt) * 16, y: (dy / dt) * 16 }
    d.x = e.clientX; d.y = e.clientY; d.t = now
    apply({ ...c.current, x: c.current.x + dx, y: c.current.y + dy })
  }
  const onUp = (e: React.PointerEvent) => {
    pts.current.delete(e.pointerId)
    if (pinch.current) {
      if (pts.current.size < 2) pinch.current = null
      return
    }
    const d = drag.current
    drag.current = null
    lastMoved.current = d?.moved ?? 0
    if (d && performance.now() - d.t < 80) raf.current = requestAnimationFrame(inertia)
  }

  const zoomBtn = (f: number) => {
    const el = ref.current!
    zoomAt(f, el.clientWidth / 2, el.clientHeight / 2)
  }

  const k = c.current
  // Solo le celle visibili (più un margine) vengono disegnate, anche con lo zoom al minimo
  const vw = ref.current?.clientWidth ?? 0
  const vh = ref.current?.clientHeight ?? 0
  const i0 = Math.floor(-k.x / k.z / STEP) - 1
  const i1 = Math.ceil((vw - k.x) / k.z / STEP) + 1
  const j0 = Math.floor(-k.y / k.z / STEP_Y) - 1
  const j1 = Math.ceil((vh - k.y) / k.z / STEP_Y) + 1

  const tiles = useMemo(() => {
    if (!vw) return []
    const now = performance.now()
    const cells = []
    for (let row = j0; row <= j1; row++) {
      const r = ((row % rows) + rows) % rows
      const shift = ((row % 2) + 2) % 2 ? STEP / 2 : 0
      for (let col = i0; col <= i1; col++) {
        const f = placed[r * COLS + (((col % COLS) + COLS) % COLS)]
        if (!f) continue
        const key = `${col}:${row}`
        let delay = firstSeen.current.get(key)
        if (delay === undefined) {
          // Distanza dal centro dello schermo al primo ingresso, in celle
          const cx = (col * STEP + shift + TW / 2) * k.z + k.x - vw / 2
          const cy = (row * STEP_Y + TH / 2) * k.z + k.y - vh / 2
          delay = now - born.current < 400 ? 0.15 + Math.hypot(cx / (STEP * k.z), cy / (STEP_Y * k.z)) * 0.06 : -1
          firstSeen.current.set(key, delay)
        }
        cells.push({ f, key, col, row, left: col * STEP + shift, delay })
      }
    }
    return cells
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [i0, i1, j0, j1, placed, rows])

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        ref={ref}
        className="absolute inset-0 cursor-grab touch-none select-none active:cursor-grabbing"
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={onUp}
      >
        <div className="absolute left-0 top-0 origin-top-left will-change-transform" style={{ transform: `translate3d(${k.x}px, ${k.y}px, 0) scale(${k.z})` }}>
          {tiles.map(({ f, key, col, row, left, delay }) => {
            const on = matches.has(f.id)
            // Il blocco di partenza resta nell'ordine di tabulazione; le sue ripetizioni no
            const origin = col >= 0 && col < COLS && row >= 0 && row < rows
            return (
              <button
                key={key}
                onClick={() => lastMoved.current < 5 && on && onOpen(f.id)}
                className={`group absolute text-left ${on ? '' : 'pointer-events-none'}`}
                style={{ width: TW, left, top: row * STEP_Y }}
                tabIndex={on && origin ? 0 : -1}
                aria-hidden={origin ? undefined : true}
              >
                <div
                  className="reveal relative flex items-center justify-center bg-g50 transition-[clip-path,opacity,transform] duration-300 ease-out-soft"
                  style={{
                    height: TH,
                    ...(delay >= 0 ? { animationDelay: `${delay}s` } : { animationName: 'none' }),
                    ...(on ? {} : { clipPath: 'inset(50% 50% 50% 50%)', opacity: 0, transform: 'scale(0.7)', animationName: 'none' }),
                  }}
                >
                  <span className="px-4 text-center font-serif text-[13px] italic tracking-normal text-g200 transition-colors group-hover:text-ink">{f.name}</span>
                  {f.caseStudy && <span className="absolute left-2 top-2 rounded-[3px] bg-archive px-2 py-0.5 text-[10px] text-[#231f20]">caso studio</span>}
                  <span className="pointer-events-none absolute inset-0 ring-2 ring-archive opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <div className={`mt-2 flex justify-between text-[12px] transition-opacity ${on ? 'opacity-0 group-hover:opacity-100 [@media(hover:none)]:opacity-100' : 'opacity-0'}`}>
                  <span className="truncate pr-2">{f.name.toLowerCase()}</span>
                  <span className="shrink-0 text-g200">{f.primaEdizione ?? '—'}</span>
                </div>
                {!on && <div className="absolute left-1/2 top-[82px] h-1 w-1 -translate-x-1/2 rounded-full bg-g100" />}
              </button>
            )
          })}
        </div>
      </div>

      <div className="absolute bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-3 z-10 flex items-center gap-1 md:bottom-[calc(1.5rem+env(safe-area-inset-bottom))] md:right-6 rounded-[8px] border border-g100 bg-surface/90 backdrop-blur-[10px] p-1.5">
        <button onClick={() => zoomBtn(1 / 1.25)} className="rounded-[6px] p-2 text-g300 hover:bg-g50 hover:text-ink" aria-label="Riduci"><Minus size={14} /></button>
        <span className="w-10 text-center text-[12px] tabular-nums text-g300">{Math.round(k.z * 100)}%</span>
        <button onClick={() => zoomBtn(1.25)} className="rounded-[6px] p-2 text-g300 hover:bg-g50 hover:text-ink" aria-label="Ingrandisci"><Plus size={14} /></button>
        <button onClick={() => center()} className="rounded-[6px] p-2 text-g300 hover:bg-g50 hover:text-ink" aria-label="Centra"><Maximize size={14} /></button>
      </div>
    </div>
  )
}
