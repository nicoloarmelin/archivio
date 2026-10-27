import { useEffect, useRef } from 'react'

// Pallino che inverte i colori sotto di sé (mix-blend-mode: difference).
// Sopra gli elementi cliccabili si ingrandisce e li mostra in negativo. Solo con mouse.
export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return
    document.documentElement.classList.add('has-cursor')
    const el = dot.current!
    const pos = { x: -100, y: -100 }
    const cur = { x: -100, y: -100 }
    let raf = 0

    const loop = () => {
      cur.x += (pos.x - cur.x) * 0.25
      cur.y += (pos.y - cur.y) * 0.25
      el.style.transform = `translate3d(${cur.x}px, ${cur.y}px, 0) translate(-50%, -50%)`
      raf = requestAnimationFrame(loop)
    }
    const move = (e: PointerEvent) => {
      pos.x = e.clientX
      pos.y = e.clientY
      const t = e.target as Element | null
      const hot = !!t?.closest('a, button, input, label, select, textarea, [role="button"]')
      el.dataset.hot = hot ? '1' : ''
      el.dataset.text = t?.closest('input, textarea') ? '1' : ''
      el.style.opacity = '1'
    }
    const leave = () => { el.style.opacity = '0' }
    const down = () => { el.dataset.down = '1' }
    const up = () => { el.dataset.down = '' }

    window.addEventListener('pointermove', move)
    document.addEventListener('pointerleave', leave)
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('pointermove', move)
      document.removeEventListener('pointerleave', leave)
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      document.documentElement.classList.remove('has-cursor')
    }
  }, [])

  return <div ref={dot} aria-hidden className="cursor-dot" style={{ opacity: 0 }} />
}
