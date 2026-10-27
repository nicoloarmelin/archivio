import { useEffect, useRef, useState } from 'react'
import type { Format } from '../data/archive'

const COUNT_MS = 1700
const EXIT_MS = 750
const PHASES = ['pre', 'evento', 'post'] as const

// Lento all'inizio e alla fine, come un ciclo di vita che parte e si esaurisce
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

// Schermata di caricamento progettata per finire: l'archivio scorre da 000 a 100,
// il ciclo pre / evento / post si compie e la pagina si chiude verso l'alto
export default function Caricamento({ formats, onEnd }: { formats: Format[]; onEnd: () => void }) {
  const total = formats.length
  const [n, setN] = useState(0)
  const [ending, setEnding] = useState(false)
  const ended = useRef(false)

  const end = () => {
    if (ended.current) return
    ended.current = true
    setN(total)
    setEnding(true)
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    setTimeout(onEnd, still ? 200 : EXIT_MS)
  }

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const t = setTimeout(end, 400)
      return () => clearTimeout(t)
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / COUNT_MS)
      setN(Math.round(ease(t) * total))
      if (t < 1) raf = requestAnimationFrame(tick)
      else setTimeout(end, 250)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const progress = total ? n / total : 1
  const current = formats[Math.max(0, Math.min(total - 1, n - 1))]

  return (
    <div
      role="status"
      aria-label="Caricamento dell'archivio"
      onClick={end}
      className="fixed inset-0 z-[100] flex cursor-pointer flex-col bg-archive p-6 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-[calc(1.5rem+env(safe-area-inset-bottom))] text-[#231f20] md:p-10"
      style={{
        clipPath: ending ? 'inset(0 0 100% 0)' : 'inset(0 0 0 0)',
        transition: `clip-path ${EXIT_MS}ms cubic-bezier(0.76, 0, 0.24, 1)`,
      }}
    >
      {/* Testatina come nelle pagine della tesi */}
      <div className="flex items-start justify-between gap-6 text-[11px] tracking-[0.03em]" aria-hidden>
        <span>Designed to end.</span>
        <span className="text-right">06 — L'archivio</span>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center text-center" aria-hidden>
        <div className="font-serif text-[clamp(110px,24vw,340px)] leading-[0.85] tabular-nums tracking-normal">
          {String(n).padStart(3, '0')}
        </div>
        <div className="mt-6 text-[12px] tracking-[0.03em]">formati in archivio</div>
        <div className="mt-3 h-[1.4em] max-w-[min(90vw,560px)] truncate font-serif text-[clamp(16px,1.6vw,20px)] italic">
          {n > 0 && current ? current.name : ' '}
        </div>
      </div>

      {/* Ciclo di vita: la linea si riempie, i punti si accendono uno dopo l'altro */}
      <div aria-hidden>
        <div className="relative h-px bg-[#231f20]/25">
          <div className="absolute inset-y-0 left-0 bg-[#231f20]" style={{ width: `${progress * 100}%` }} />
          {PHASES.map((p, i) => {
            const at = i / (PHASES.length - 1)
            const on = progress >= at - 0.001
            return (
              <span
                key={p}
                className={`absolute top-1/2 h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#231f20] transition-colors duration-200 ${on ? 'bg-[#231f20]' : 'bg-archive'}`}
                style={{ left: `${at * 100}%` }}
              />
            )
          })}
        </div>
        <div className="mt-4 grid grid-cols-3 text-[11px] tracking-[0.03em]">
          {PHASES.map((p, i) => (
            <span key={p} className={`transition-opacity duration-200 ${i === 0 ? 'text-left' : i === 1 ? 'text-center' : 'text-right'} ${progress >= i / 2 - 0.001 ? 'opacity-100' : 'opacity-35'}`}>
              {p}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
