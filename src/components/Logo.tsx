import dims from '../data/loghi.json'

const BASE = `${import.meta.env.BASE_URL}loghi/`
const size = dims as Record<string, { w: number; h: number }>

// Logo del formato in tre versioni: nero di giorno, bianco di notte, a colori al passaggio del mouse.
// Il contenitore deve avere la classe `group` perché il colore compaia sull'hover; `colore` lo mostra sempre.
// La casella che lo contiene porta la classe `logo-box`.
export default function Logo({ id, name, colore = false, className = '' }: { id: string; name: string; colore?: boolean; className?: string }) {
  const d = size[id]
  if (!d) return null
  const img = (v: string, cls: string, alt = '') => (
    <img
      src={`${BASE}${id}-${v}.webp`}
      width={d.w}
      height={d.h}
      alt={alt}
      loading="lazy"
      decoding="async"
      draggable={false}
      className={`absolute inset-0 h-full w-full object-contain ${cls}`}
    />
  )
  // Versioni ufficiali: a colori solo su fondo bianco (di notte la casella diventa bianca, vedi .logo-box),
  // altrimenti monocromatico pieno, nero di giorno e bianco di notte
  if (colore) return <div className={`relative ${className}`}>{img('colore', '', name)}</div>
  return (
    <div className={`relative ${className}`}>
      {img('nero', 'logo-giorno transition-opacity duration-300 group-hover:opacity-0', name)}
      {img('bianco', 'logo-notte transition-opacity duration-300 group-hover:opacity-0', name)}
      {img('colore', 'opacity-0 transition-opacity duration-300 group-hover:opacity-100')}
    </div>
  )
}
