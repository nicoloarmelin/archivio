import { useEffect, useRef } from 'react'

// Fondo del piedino: colonne nella sfumatura della parte, sfocate fino a fondersi.
// Quando il piedino arriva nell'inquadratura si compie un ciclo di vita: la sfumatura nasce
// piatta dal basso (pre), le colonne salgono a gradini verso il centro (evento) e poi tornano
// tutte alla stessa altezza, così la sfumatura resta orizzontale (post). Uscendo si riavvolge.
const COLONNE = 9
const PIATTA = 58 // altezza delle colonne a riposo, in %
const PICCO = 30 // quanto sale la colonna centrale al culmine; lascia spazio sopra alla sfocatura
const DURATA = 2600
const profilo = Array.from({ length: COLONNE }, (_, i) => {
  const c = (COLONNE - 1) / 2
  return 1 - Math.abs(i - c) / c
})
const clamp = (x: number) => Math.min(1, Math.max(0, x))
const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)

export default function Piedino() {
  const box = useRef<HTMLDivElement>(null)
  const scena = useRef<HTMLDivElement>(null)
  const col = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    // p da 0 (non ancora nata) a 1 (orizzontale): crescita nel primo terzo, culmine a metà
    const draw = (p: number) => {
      const culmine = Math.sin(Math.PI * clamp((p - 0.15) / 0.85))
      scena.current!.style.transform = `scaleY(${clamp(p / 0.35)})`
      profilo.forEach((k, i) => {
        const el = col.current[i]
        if (el) el.style.height = `${PIATTA + PICCO * k * culmine}%`
      })
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      draw(1)
      return
    }
    draw(0)
    let raf = 0
    let fatto = false
    const play = () => {
      const t0 = performance.now()
      const step = (now: number) => {
        const t = clamp((now - t0) / DURATA)
        draw(ease(t))
        raf = t < 1 ? requestAnimationFrame(step) : 0
      }
      raf = requestAnimationFrame(step)
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.intersectionRatio >= 0.5 && !fatto) {
          fatto = true
          play()
        } else if (!e.isIntersecting && fatto) {
          // fuori dall'inquadratura si riavvolge, per ripartire al prossimo arrivo
          fatto = false
          cancelAnimationFrame(raf)
          draw(0)
        }
      },
      { threshold: [0, 0.5] },
    )
    io.observe(box.current!)
    return () => {
      io.disconnect()
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={box} aria-hidden="true" className="relative h-[clamp(200px,26vw,380px)] overflow-hidden">
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
  )
}
