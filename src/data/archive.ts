// Dati dal foglio ARCHIVIO.xlsx (scheda «Formati»), convertiti in formati.json
import raw from './formati.json'
import tesiRaw from './tesi.json'

// Testi dalla tesi (cap. 6): formato, serie delle edizioni e approfondimenti
export type Caso = { title: string; scheda: [string, string][]; descrizione: string[]; date: [string, string][]; ciclo: string[] }
export type TesiFormato = {
  scheda: [string, string][]; intro: string; edizioniTesto: string[]
  tabella: { header: string[]; rows: string[][] }; casi: Record<string, Caso>
}
export type Ricerca = {
  abstract: string[]; domanda: string[]; metodo: string[]; gradi: [string, string][]
  bibliografia: string[]; repertori: string[]
  crediti: { titolo: string; studente: string; relatore: string; istituzione: string; anno: string }
}
const tesi = tesiRaw as unknown as { formati: Record<string, TesiFormato>; ricerca: Ricerca }
export const ricerca = tesi.ricerca

export type Edition = { id: string; label: string; year: number; city?: string; caseStudy?: boolean; caso?: Caso }
export type Format = {
  id: string; name: string; ambito: string; ricorrenza: string; ricorrenzaNota: string; dimensione: string
  variabilita: 'bassa' | 'media' | 'alta' | 'n.d.'; periodoVariabilita: string; titolare: string; produttore: string
  sede: string; durata: string; primaEdizione: number | null; edizioniSvolte: number | null; arco: string
  descrizione: string; segniPermanenti: string; esito: string; motivazione: string; lacune: string
  edizioniConfrontate: string; fonti: string; editions: Edition[]; caseStudy: boolean; tesi?: TesiFormato
}

type Row = Omit<Format, 'editions' | 'caseStudy'> & { anniConfrontati: number[] }

export const formats: Format[] = (raw as Row[]).map(({ anniConfrontati, ...r }) => {
  const t = tesi.formati[r.id]
  if (t) {
    // Serie completa dalla tabella «Le edizioni»; gli approfondimenti aprono la scheda dell'edizione
    const byYear = new Map<number, Edition>()
    for (const [anno, luogo] of t.tabella.rows) {
      const year = parseInt(anno)
      if (!byYear.has(year)) byYear.set(year, { id: String(year), label: String(year), year, city: luogo })
    }
    for (const [y, caso] of Object.entries(t.casi)) {
      const year = Number(y)
      byYear.set(year, { ...(byYear.get(year) ?? { id: y, year }), id: y, year, label: caso.title, caseStudy: true, caso })
    }
    return { ...r, tesi: t, caseStudy: true, editions: [...byYear.values()].sort((a, b) => a.year - b.year) }
  }
  const years = [...new Set([...(r.primaEdizione ? [r.primaEdizione] : []), ...anniConfrontati])].sort((a, b) => a - b)
  return { ...r, caseStudy: false, editions: years.map((year) => ({ id: String(year), label: String(year), year })) }
})

export const ambiti = [...new Set(formats.map((f) => f.ambito))].sort()
export const ricorrenze = [...new Set(formats.map((f) => f.ricorrenza))]
export const dimensioni = [...new Set(formats.map((f) => f.dimensione))]
