import { useEffect, useRef, type ReactNode } from 'react'

// Piedino con la sfumatura della parte, sul modello del footer di Dia: colonne sfocate fino a fondersi.
// Lo scorrimento dentro il piedino ne fa un ciclo di vita: appena entra nello schermo la sfumatura
// nasce dal basso (pre), a metà le colonne salgono a gradini verso il centro (evento), in fondo alla
// pagina tornano tutte alla stessa altezza e la sfumatura resta orizzontale (post).
// Le scritte salgono insieme, quelle esterne più lente di quelle interne.
const COLONNE = 9
const PIATTA = 58 // altezza delle colonne a riposo, in %
const PICCO = 30 // quanto sale la colonna centrale al culmine; lascia spazio sopra alla sfocatura
const SALITA = [24, 48, 48, 24] // di quanto salgono le scritte, in px
const profilo = Array.from({ length: COLONNE }, (_, i) => {
  const c = (COLONNE - 1) / 2
  return 1 - Math.abs(i - c) / c
})
const clamp = (x: number) => Math.min(1, Math.max(0, x))

export default function Piedino({ children }: { children: ReactNode }) {
  const box = useRef<HTMLElement>(null)
  const voci = useRef<HTMLDivElement>(null)
  const scena = useRef<HTMLDivElement>(null)
  const col = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const draw = () => {
      raf = 0
      const r = box.current?.getBoundingClientRect()
      if (!r) return
      // 0 quando il piedino entra dal basso, 1 quando la pagina è finita
      const p = still ? 1 : clamp((window.innerHeight - r.top) / Math.min(r.height, window.innerHeight))
      const culmine = Math.sin(Math.PI * p)
      scena.current!.style.transform = `scaleY(${clamp(p / 0.3)})`
      profilo.forEach((k, i) => {
        const el = col.current[i]
        if (el) el.style.height = `${PIATTA + PICCO * k * culmine}%`
      })
      Array.from(voci.current!.children).forEach((el, i) => {
        ;(el as HTMLElement).style.transform = `translateY(${(1 - p) * SALITA[i % SALITA.length]}px)`
      })
    }
    const on = () => {
      if (!raf) raf = requestAnimationFrame(draw)
    }
    draw()
    window.addEventListener('scroll', on, { passive: true })
    window.addEventListener('resize', on)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('scroll', on)
      window.removeEventListener('resize', on)
    }
  }, [])

  return (
    <footer ref={box} className="mt-32">
      <div ref={voci} className="grid grid-cols-2 gap-4 px-6 pb-10 text-[13px] text-ink md:grid-cols-4 md:px-10">
        {children}
      </div>
      <div aria-hidden="true" className="relative h-[clamp(240px,48svh,520px)] overflow-hidden">
        {/* Oltre i bordi, perché la sfocatura non schiarisca i lati e il fondo */}
        <div ref={scena} className="absolute -inset-x-10 -bottom-10 top-0 flex origin-bottom items-end blur-[14px] will-change-transform md:blur-[22px]">
          {profilo.map((_, i) => (
            <div
              key={i}
              ref={(el) => { col.current[i] = el }}
              className="flex-1"
              style={{ height: `${PIATTA}%`, background: 'var(--sfumatura-piede)' }}
            />
          ))}
        </div>
      </div>
    </footer>
  )
}
