import { useEffect, useRef, type ReactNode } from 'react'

// Piedino con la sfumatura della parte, sul modello del footer di Dia: colonne sfocate fino a fondersi.
// Lo scorrimento la fa crescere: appena la sua zona entra nello schermo si alza dal bordo inferiore,
// piatta e orizzontale, poi le colonne salgono a gradini verso il centro fino alla forma piena in
// fondo alla pagina. Tornando su si riappiattisce. Le scritte salgono con lei, quelle interne più in alto
// di quelle esterne, e alla fine disegnano anche loro un arco.
const COLONNE = 9
const PIATTA = 55 // altezza di tutte le colonne quando la sfumatura nasce, in %
const BASSA = 30 // altezza finale delle colonne ai lati
const ALTA = 88 // altezza finale della colonna centrale; lascia spazio sopra alla sfocatura
const SALITA = [0.1, 0.18, 0.18, 0.1] // di quanto salgono le scritte, in frazioni dell'altezza dello schermo
const profilo = Array.from({ length: COLONNE }, (_, i) => {
  const c = (COLONNE - 1) / 2
  return 1 - Math.abs(i - c) / c
})
const clamp = (x: number) => Math.min(1, Math.max(0, x))

export default function Piedino({ children }: { children: ReactNode }) {
  const fondo = useRef<HTMLDivElement>(null)
  const voci = useRef<HTMLDivElement>(null)
  const scena = useRef<HTMLDivElement>(null)
  const col = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const draw = () => {
      raf = 0
      const r = fondo.current?.getBoundingClientRect()
      if (!r) return
      const vh = window.innerHeight
      // 0 quando la zona della sfumatura entra dal basso, 1 quando la pagina è finita
      const p = still ? 1 : clamp((vh - r.top) / r.height)
      const forma = p * p * (3 - 2 * p)
      // la sfumatura poggia sul bordo inferiore dello schermo e cresce fino a riempire la parte visibile:
      // si vede alzarsi mentre entra, senza mai salire sopra le scritte
      const sotto = Math.max(0, r.bottom - vh)
      scena.current!.style.transform = `translateY(${-sotto}px) scaleY(${p})`
      profilo.forEach((k, i) => {
        const el = col.current[i]
        if (el) el.style.height = `${PIATTA + (BASSA + (ALTA - BASSA) * k - PIATTA) * forma}%`
      })
      Array.from(voci.current!.children).forEach((el, i) => {
        ;(el as HTMLElement).style.transform = `translateY(${-p * SALITA[i % SALITA.length] * window.innerHeight}px)`
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
    <footer className="mt-32">
      {/* Lo spazio sopra le scritte è quello in cui salgono */}
      <div ref={voci} className="grid grid-cols-2 gap-4 px-6 pt-[18svh] pb-10 text-[13px] text-ink md:grid-cols-4 md:px-10">
        {children}
      </div>
      <div ref={fondo} aria-hidden="true" className="relative h-[clamp(240px,48svh,520px)] overflow-hidden">
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
