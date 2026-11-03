import { useEffect, useState } from 'react'

// Foto dall'ARCHIVIO DIGITALE (cartella Drive, _INDICE.csv), divise per formato e anno.
// L'indice completo, con didascalie e fonti, è pesante: si carica solo quando si apre una scheda.
export type Foto = {
  f: string // percorso senza estensione: formato/anno/nome
  w: number
  h: number
  t: string // tipo, dal nome del file (manifesto, applicazione, scenografia…)
  logo: boolean // marchio dell'edizione
  d: string // didascalia o fonte
  l: string // pagine del libro, se usata nella tesi
  scuro?: boolean // disegno chiaro (marchio in bianco): va su fondo scuro
  tr?: boolean // immagine trasparente: va su un fondo pieno, bianco o (se scuro) nero
  tavola?: boolean // tavola d'identità della tesi (casi studio): anche in versione da 2400 px
}
export type FotoFormato = Record<string, Foto[]>

let indice: Promise<Record<string, FotoFormato>> | null = null
const carica = () => (indice ??= import('./immagini.json').then((m) => m.default as unknown as Record<string, FotoFormato>))

const BASE = `${import.meta.env.BASE_URL}foto/`
// p: miniatura per le griglie (480 px), g: vista ingrandita (1280 px), x: tavola a tutta larghezza (2400 px)
// Le misure nell'indirizzo: se un file cambia (ritaglio) cambia anche l'indirizzo e il browser non usa la copia vecchia
export const fotoSrc = (x: Foto, misura: 'p' | 'g' | 'x') => `${BASE}${misura}/${x.f}.webp?${x.w}x${x.h}`
export const annoFoto = (x: Foto) => x.f.split('/')[1]
// Fondo dietro un'immagine: i marchi e le immagini trasparenti su un fondo pieno che dia contrasto in
// entrambi i temi (bianco, o nero per i disegni chiari); le fotografie sul grigio del segnaposto
export const fondoFoto = (x: Foto) => (x.scuro ? 'bg-nero' : x.logo || x.tr ? 'bg-white' : 'bg-g50')

export function useFoto(id: string) {
  const [foto, setFoto] = useState<FotoFormato | null>(null)
  useEffect(() => {
    let vivo = true
    carica().then((tutte) => vivo && setFoto(tutte[id] ?? {}))
    return () => {
      vivo = false
    }
  }, [id])
  return foto
}
