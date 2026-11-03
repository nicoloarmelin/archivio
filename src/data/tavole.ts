// Tavole d'identità della tesi (le doppie delle 13 edizioni studiate), ricomposte per il sito con le
// stesse immagini e gli stessi colori. Ogni pagina è fatta di righe; ogni riga di blocchi larghi
// `span` colonne su 12.
//  - immagine: f è il nome del file dell'archivio (senza estensione) nella cartella dell'edizione;
//    r un ritaglio della tavola esportata, per i campioni di carattere composti in InDesign
//  - gruppo: più immagini affiancate con una sola didascalia (manifesti, copertine)
//  - colonna: blocchi impilati, quando una colonna della tavola ne contiene più d'uno
//  - palette: [nome, codici, colore]; il colore «a>b» è una sfumatura dall'alto in basso
// ar è il rapporto larghezza/altezza della cornice come nella tavola; fit 'cover' riempie la cornice
// (fotografie al vivo), altrimenti l'immagine sta intera su fondo bianco.
export type Colore = [nome: string, codici: string, hex: string]
export type Blocco =
  | { f?: string; r?: string; titolo: string; sotto?: string; span: number; ar: number; fit?: 'cover' }
  | { gruppo: string[]; cols: number; titolo: string; sotto?: string; span: number; ar: number; fit?: 'cover' }
  | { colonna: Blocco[]; span: number }
  | { colori: Colore[]; cols: number; span: number; ar?: number }
export type Tavola = { sinistra: Blocco[][]; destra: Blocco[][] }

const hex = (nome: string, h: string): Colore => [nome, h.toUpperCase(), h]

export const tavole: Record<string, Tavola> = {
  'giochi-olimpici/1968': {
    sinistra: [
      [{ f: 'logo-edizione-1968-01', titolo: 'Logotipo', sotto: 'Lance Wyman, Eduardo Terrazas, 1966', span: 12, ar: 2.78 }],
      [{ f: '1968-varianti-01', titolo: 'Varianti di colore', span: 12, ar: 2.3 }],
      [
        { f: '1968-costruzione-01', titolo: 'Costruzione', sotto: 'Schizzo a compasso', span: 6, ar: 1.19 },
        { f: '1968-regola-parole-01', titolo: 'Regola delle parole', sotto: 'Le lettere si fondono', span: 6, ar: 1.14 },
      ],
      [{ f: '1968-segnaletica-01', titolo: 'Segnaletica', sotto: 'Pittogrammi dei servizi', span: 12, ar: 2.35 }],
    ],
    destra: [
      [{ f: '1968-alfabeto-01', titolo: 'Alfabeto', sotto: 'Maiuscole, segni e cifre', span: 12, ar: 2.78 }],
      [{ f: '1968-pittogrammi-01', titolo: 'Pittogrammi', sotto: 'Un colore per ogni sport', span: 12, ar: 1.51 }],
      [
        {
          cols: 7,
          span: 12,
          ar: 0.85,
          colori: [
            ['Nero', 'Pantone Black C\nC0 M0 Y0 K100', '#000000'],
            ['Ginnastica', 'Pantone 203 C\nC0 M40 Y2 K0', '#f5b5d0'],
            ['Bianco', 'White\nC0 M0 Y0 K0', '#ffffff'],
            ['Pesi', 'Pantone 107 C\nC0 M5 Y95 K0', '#fee600'],
            ['Calcio', 'Pantone 7765 C\nC15 M5 Y100 K5', '#ddd100'],
            ['Tiro', 'Pantone 7536 C\nC15 M15 Y25 K30', '#878787'],
            ['Lotta', 'Pantone 618 C\nC15 M15 Y85 K25', '#b9a62e'],
            ['Pugilato', 'Pantone 7569 C\nC5 M50 Y100 K5', '#e28b00'],
            ['Equitazione', 'Pantone 7598 C\nC10 M85 Y100 K10', '#c63d13'],
            ['Scherma', 'Pantone 7408 C\nC0 M30 Y100 K0', '#fbba00'],
            ['Pallavolo', 'Pantone 1585 C\nC0 M70 Y100 K0', '#ec6607'],
            ['Pallacanestro', 'Pantone 1788 C\nC0 M100 Y90 K0', '#e40520'],
            ['Nuoto', 'Pantone 213 C\nC0 M100 Y20 K0', '#e6006d'],
            ['Pentathlon', 'Pantone 675 C\nC20 M100 Y0 K10', '#b90276'],
            ['Ciclismo', 'Pantone 7662 C\nC60 M90 Y10 K0', '#833684'],
            ['Hockey', 'Pantone 2298 C\nC3 M0 Y80 K0', '#ffed43'],
            ['Atletica', 'Pantone 361 C\nC75 M0 Y100 K0', '#3baa34'],
            ['Pallanuoto', 'Pantone 339 C\nC85 M0 Y65 K0', '#00a47a'],
            ['Canottaggio', 'Pantone 326 C\nC85 M0 Y40 K0', '#00a7a7'],
            ['Canoa', 'Pantone 2995 C\nC85 M5 Y0 K0', '#00a7e5'],
            ['Vela', 'Pantone 285 C\nC90 M60 Y0 K0', '#1860ac'],
          ],
        },
      ],
    ],
  },

  'giochi-olimpici/1972': {
    sinistra: [
      [{ f: '1972-emblema-01', titolo: 'Emblema', sotto: 'Coordt von Mannstein, 1968', span: 12, ar: 1.08 }],
      [
        { f: '1972-emblema-costruzione-01', titolo: 'Costruzione', sotto: 'Manuale, scheda 2.1', span: 6, ar: 1.15 },
        { f: '1972-spirale-01', titolo: 'Spirale', sotto: 'Manuale, scheda 3.1', span: 6, ar: 1.15 },
      ],
      [
        {
          cols: 4,
          span: 12,
          ar: 1.5,
          colori: [
            ['Olympia-Blau 72', 'Pantone 311 C\nC70 M0 Y10 K0', '#1cbadf'],
            ['Weiss', 'White\nC0 M0 Y0 K0', '#ffffff'],
            ['Olympia-Silber 72', 'Pantone Silver C\nC0 M0 Y0 K40', '#878787'],
            ['Olympia-Grün 72', 'Pantone 7487 C\nC50 M0 Y100 K0', '#94c120'],
            ['Olympia-Orange 72', 'Pantone 2013 C\nC0 M45 Y100 K0', '#f59c00'],
            ['Olympia-Blauviolett 72', 'Pantone 2135 C\nC70 M45 Y0 K0', '#587fc0'],
            ['Olympia-Dunkelgrün 72', 'Pantone 347 C\nC80 M0 Y80 K0', '#01a75d'],
            ['Olympia-Hellorange 72', 'Pantone 123 C\nC0 M15 Y100 K0', '#fed501'],
          ],
        },
      ],
    ],
    destra: [
      [{ f: '1972-scritta-01', titolo: 'Emblema e scritta', sotto: 'Otl Aicher, Rolf Müller', span: 12, ar: 4.6 }],
      [{ f: '1972-scritta-fondi-01', titolo: 'Su fondo colorato', span: 12, ar: 4.4 }],
      [
        { r: 'ritaglio-carattere', titolo: 'Carattere', sotto: 'Adrian Frutiger, 1957', span: 6, ar: 1.19 },
        { f: '1972-denominazione-01', titolo: 'Denominazione', sotto: 'Manuale, scheda 5.1', span: 6, ar: 1.19 },
      ],
      [{ f: '1972-pittogrammi-01', titolo: 'Pittogrammi', sotto: 'Otl Aicher, Gerhard Joksch', span: 12, ar: 2.38 }],
      [
        { f: '1972-pittogramma-griglia-01', titolo: 'Pittogramma', sotto: 'Sulla griglia', span: 4, ar: 0.85 },
        { f: '1972-freccia-01', titolo: 'Freccia', sotto: 'Sulla griglia', span: 4, ar: 0.85 },
        { f: '1972-waldi-01', titolo: 'Mascotte', sotto: 'Waldi', span: 4, ar: 0.85 },
      ],
    ],
  },

  'giochi-olimpici/2024': {
    sinistra: [
      [
        { f: '2024-emblema-01', titolo: 'Emblema', sotto: 'Royalties-Ecobranding', span: 6, ar: 0.55 },
        {
          span: 6,
          colonna: [
            { f: '2024-emblemi-01', titolo: 'Olimpici e paralimpici', sotto: 'Un solo emblema', span: 12, ar: 1.05 },
            { f: '2024-phryges-01', titolo: 'Mascotte', sotto: 'Les Phryges', span: 12, ar: 1.05 },
          ],
        },
      ],
      [
        {
          cols: 7,
          span: 12,
          ar: 0.85,
          colori: [
            ['Blanc', 'White\nC0 M0 Y0 K0', '#ffffff'],
            ['Sable', 'Pantone 4525 C\nC15 M18 Y47 K0', '#e1cd98'],
            ['Vert opéra 3', 'Pantone 629 C\nC50 M1 Y25 K0', '#89cbc9'],
            ['Vert opéra 2', 'Pantone 7472 C\nC72 M0 Y37 K3', '#24b0ad'],
            ['Vert opéra 1', 'Pantone 7477 C\nC100 M62 Y40 K32', '#00455f'],
            ['Bleu de Sèvres 3', 'Pantone 2915 C\nC68 M0 Y7 K0', '#31bce3'],
            ['Bleu de Sèvres 2', 'Pantone 3538 C\nC100 M22 Y0 K0', '#0089d1'],
            ['Bleu de Sèvres 1', 'Pantone 3597 C\nC100 M80 Y0 K40', '#102d69'],
            ['Violet glycine 3', 'Pantone 2705 C\nC40 M34 Y0 K0', '#a6a7d5'],
            ['Violet glycine 2', 'Pantone 272 C\nC60 M53 Y0 K0', '#7a7ab8'],
            ['Violet glycine 1', 'Pantone 2112 C\nC90 M100 Y10 K35', '#361c5b'],
            ['Rose Paris 2024', 'Pantone 672 C\nC0 M49 Y0 K0', '#f3a1c7'],
            ['Rouge amour 2', 'Pantone 2031 C\nC0 M83 Y60 K0', '#e94850'],
            ['Rouge amour 1', 'Pantone 7652 C\nC50 M100 Y10 K50', '#5e0c4a'],
          ],
        },
      ],
      [
        {
          cols: 6,
          span: 12,
          ar: 1,
          colori: [
            ['Vert 1 › Vert 2', 'C100 M62 Y40 K32\nC72 M0 Y37 K3', '#004a64>#1aa5a5'],
            ['Vert 3 › Vert 2', 'C50 M1 Y25 K0\nC72 M0 Y37 K3', '#84cac7>#33b3af'],
            ['Vert 2 › Rose', 'C72 M0 Y37 K3\nC0 M49 Y0 K0', '#43b2af>#e8a6c7'],
            ['Bleu 1 › Bleu 2', 'C100 M80 Y0 K40\nC100 M22 Y0 K0', '#07326e>#0080c7'],
            ['Bleu 2 › Bleu 3', 'C100 M22 Y0 K0\nC68 M0 Y7 K0', '#008cd2>#11b7e4'],
            ['Bleu 3 › Rose', 'C68 M0 Y7 K0\nC0 M49 Y0 K0', '#4dbde4>#e9a7cb'],
            ['Violet 1 › Violet 2', 'C90 M100 Y10 K35\nC60 M53 Y0 K0', '#3a1f61>#7170af'],
            ['Violet 3 › Violet 2', 'C40 M34 Y0 K0\nC60 M53 Y0 K0', '#a3a5d2>#7e7ebc'],
            ['Violet 2 › Rose', 'C60 M53 Y0 K0\nC0 M49 Y0 K0', '#837db9>#ea9ec6'],
            ['Rouge 1 › Rouge 2', 'C50 M100 Y10 K50\nC0 M83 Y60 K0', '#65104c>#db4252'],
            ['Rouge 2 › Rose', 'C0 M83 Y60 K0\nC0 M49 Y0 K0', '#ea4d57>#f29abc'],
          ],
        },
      ],
    ],
    destra: [
      [{ f: '2024-carattere-01', titolo: 'Carattere', sotto: 'Paris2024 Semibold', span: 12, ar: 3.4 }],
      [
        { f: '2024-look-01', titolo: 'Il look', sotto: 'Moduli composti', span: 4, ar: 0.7, fit: 'cover' },
        {
          span: 8,
          colonna: [
            { f: '2024-griglia-01', titolo: 'Griglia del selciato', span: 12, ar: 2.9 },
            { f: '2024-moduli-01', titolo: 'Moduli del look', span: 12, ar: 2.9 },
          ],
        },
      ],
      [{ f: '2024-pittogrammi-01', titolo: 'Pittogrammi', sotto: '47 blasoni sportivi', span: 12, ar: 1.34 }],
    ],
  },

  'esposizioni-universali/1967': {
    sinistra: [
      [{ f: 'logo-edizione-1967-01', titolo: 'Marchio', sotto: 'Julien Hébert', span: 12, ar: 1.08 }],
      [
        { r: 'ritaglio-optima', titolo: 'Carattere del logotipo', sotto: 'Optima, logotipo «expo67»', span: 6, ar: 0.74 },
        { r: 'ritaglio-univers', titolo: 'Carattere dei testi', sotto: 'Univers, testi e segnaletica', span: 6, ar: 0.74 },
      ],
    ],
    destra: [
      [{ gruppo: ['1967-manifesti-1-01', '1967-manifesti-2-01', '1967-manifesti-3-01'], cols: 3, titolo: 'Manifesti ufficiali', span: 12, ar: 0.66 }],
      [
        { r: 'ritaglio-unita', titolo: 'Unità di base', sotto: 'Homme, femme', span: 4, ar: 0.73 },
        { cols: 4, span: 8, ar: 0.5, colori: [hex('Blu', '#1f2c6b'), hex('Bianco', '#ffffff'), hex('Rosso', '#fe3422'), hex('Nero', '#1a1a1a')] },
      ],
      [{ f: '1967-bandiere-01', titolo: 'Bandiere dei paesi', span: 12, ar: 5.6 }],
    ],
  },

  'esposizioni-universali/2015': {
    sinistra: [
      [{ f: 'logo-edizione-2015-01', titolo: 'Marchio', sotto: 'Andrea Puppa', span: 12, ar: 1.5 }],
      [
        { f: '2015-carattere-01', titolo: 'Carattere', sotto: 'Carmi e Ubertis', span: 6, ar: 0.42 },
        {
          span: 6,
          colonna: [
            {
              cols: 2,
              span: 12,
              ar: 1.5,
              colori: [hex('Magenta', '#ed008c'), hex('Giallo', '#fbd700'), hex('Azzurro', '#00abf2'), hex('Verde', '#029744'), hex('Rosso', '#c0101e'), hex('Blu viola', '#3f389d')],
            },
            { f: '2015-spille-01', titolo: 'Marchio su oggetti', span: 12, ar: 1.05 },
          ],
        },
      ],
    ],
    destra: [
      [{ f: '2015-manuale-01', titolo: 'Manuale', sotto: "Carmi e Ubertis, manuale d'identità", span: 12, ar: 1.41, fit: 'cover' }],
      [{ gruppo: ['2015-manuale-pagine-1-01', '2015-manuale-pagine-2-01'], cols: 2, titolo: 'Pagine del manuale', span: 12, ar: 1.2, fit: 'cover' }],
      [{ f: '2015-foody-01', titolo: 'Mascotte', sotto: 'Foody', span: 12, ar: 1.4 }],
    ],
  },

  'eurovision-song-contest/2021': {
    sinistra: [
      [{ f: '2021-marchio-01', titolo: 'Marchio con theme art', sotto: 'Open Up', span: 12, ar: 1.41, fit: 'cover' }],
      [
        { f: 'logo-edizione-2021-01', titolo: 'Logotipo', sotto: 'Rotterdam 2021', span: 6, ar: 1.05 },
        {
          cols: 4,
          span: 6,
          ar: 0.75,
          colori: [
            hex('Blu notte', '#070932'), hex('Rosso', '#fc0000'), hex('Blu', '#0750c6'), hex('Giallo', '#fdd338'),
            hex('Verde', '#0dae53'), hex('Azzurro', '#2495c9'), hex('Bianco', '#ffffff'), hex('Bordeaux', '#480521'),
          ],
        },
      ],
      [{ f: '2021-bandiere-raggi-01', titolo: 'Bandiere in raggi', sotto: 'Un fascio di raggi per paese', span: 12, ar: 1.41, fit: 'cover' }],
    ],
    destra: [
      [{ f: '2021-theme-art-01', titolo: 'Theme art', span: 12, ar: 1.41, fit: 'cover' }],
      [{ f: '2021-mappa-01', titolo: 'Mappa dei dati', sotto: 'I raggi partono da Rotterdam', span: 12, ar: 1.41, fit: 'cover' }],
      [{ f: '2021-manuale-01', titolo: 'Manuale', span: 12, ar: 2.1, fit: 'cover' }],
    ],
  },

  'eurovision-song-contest/2024': {
    sinistra: [
      [{ f: 'logo-edizione-2024-01', titolo: 'Logotipo', sotto: 'Malmö 2024', span: 12, ar: 1.45 }],
      [
        {
          cols: 4,
          span: 6,
          ar: 0.75,
          colori: [
            hex('Giallo', '#ffca34'), hex('Magenta', '#ff45fe'), hex('Pesca', '#ffa491'), hex('Menta', '#6edabd'),
            hex('Viola', '#a5379f'), hex('Azzurro', '#00e0f1'), hex('Blu', '#5a8ff2'), hex('Rosa', '#ff86be'),
          ],
        },
        {
          cols: 4,
          span: 6,
          ar: 0.31,
          colori: [
            ['Sfumatura', '#FFCA34\n#FF45FE', '#ffca34>#ff45fe'],
            ['Sfumatura', '#00E0F1\n#5A8FF2', '#00e0f1>#5a8ff2'],
            ['Sfumatura', '#FFA491\n#FF19FE', '#ffa491>#ff19fe'],
            ['Sfumatura', '#6EDABD\n#A5379F', '#6edabd>#a5379f'],
          ],
        },
      ],
      [
        { f: '2024-tipografia-01', titolo: 'Tipografia', sotto: '«Welcome back to Malmö»', span: 6, ar: 0.74, fit: 'cover' },
        { f: '2024-grafica-tv-01', titolo: 'Grafica televisiva', span: 6, ar: 0.74, fit: 'cover' },
      ],
    ],
    destra: [
      [{ f: '2024-theme-art-01', titolo: 'Theme art', sotto: 'The Eurovision Lights', span: 12, ar: 1.06, fit: 'cover' }],
      [
        { f: '2024-gradienti-01', titolo: 'Gradienti nello spazio', span: 6, ar: 0.53, fit: 'cover' },
        { f: '2024-quadrato-01', titolo: 'Formato quadrato', span: 6, ar: 0.53, fit: 'cover' },
      ],
    ],
  },

  'offf-barcelona/2023': {
    sinistra: [
      [{ f: '2023-marchio-01', titolo: 'Marchio', sotto: 'Vasava', span: 12, ar: 3.6, fit: 'cover' }],
      [{ f: '2023-logotipo-esteso-01', titolo: 'Logotipo esteso', sotto: 'La O si ripete', span: 12, ar: 5.55, fit: 'cover' }],
      [
        { f: '2023-cubo-01', titolo: 'Il cubo', sotto: 'Vasava, Found Studio', span: 6, ar: 0.53, fit: 'cover' },
        {
          cols: 2,
          span: 6,
          ar: 1.5,
          colori: [hex('Blu', '#1332be'), hex('Blu viola', '#3739d7'), hex('Viola', '#6c5ce6'), hex('Lavanda', '#b9a6f2'), hex('Blu notte', '#06157a'), hex('Cemento', '#d3cec6')],
        },
      ],
    ],
    destra: [
      [{ f: '2023-manifesto-01', titolo: 'Manifesto', span: 12, ar: 0.86, fit: 'cover' }],
      [{ f: '2023-ambiente-01', titolo: 'Ambiente della sequenza', span: 12, ar: 1.41, fit: 'cover' }],
    ],
  },

  'offf-barcelona/2026': {
    sinistra: [
      [
        { f: '2026-marchio-01', titolo: 'Marchio', span: 6, ar: 1.05 },
        { f: '2026-marchio-coltura-01', titolo: 'Marchio in coltura', span: 6, ar: 1.05, fit: 'cover' },
      ],
      [{ f: '2026-carattere-01', titolo: 'Carattere', sotto: 'Petri Serif', span: 12, ar: 1.78 }],
      [
        { f: '2026-tipografia-01', titolo: 'Tipografia', sotto: '«Cultured»', span: 6, ar: 0.7, fit: 'cover' },
        {
          cols: 2,
          span: 6,
          ar: 1.5,
          colori: [
            hex('Crema', '#ebe9dc'), hex('Nero', '#000000'), hex('Rosso coltura', '#a4040a'), hex('Rosa muffa', '#ad5f5c'),
            hex('Ottanio', '#1b8992'), hex('Verde acqua', '#c9dfd4'), hex('Ocra', '#986532'), hex('Verde muschio', '#475328'),
          ],
        },
      ],
    ],
    destra: [
      [{ gruppo: ['2026-colture-1-01', '2026-colture-2-01', '2026-colture-3-01', '2026-colture-4-01'], cols: 2, titolo: 'Colture', sotto: 'Le muffe da cui derivano forme e colori', span: 12, ar: 1.1, fit: 'cover' }],
      [
        { f: '2026-manifesto-01', titolo: 'Manifesto', sotto: '«Come get cultured»', span: 6, ar: 0.53, fit: 'cover' },
        { f: '2026-segnaletica-01', titolo: 'Segnaletica', sotto: 'Cubi impilati al Disseny Hub', span: 6, ar: 0.53, fit: 'cover' },
      ],
    ],
  },

  'documenta/2012': {
    sinistra: [
      [{ f: '2012-regola-nome-01', titolo: 'Regola del nome', sotto: 'Iniziale minuscola, numero tra parentesi', span: 12, ar: 1.41, fit: 'cover' }],
      [
        { f: '2012-varianti-nome-01', titolo: 'Varianti del nome', span: 6, ar: 0.42 },
        {
          span: 6,
          colonna: [
            {
              cols: 4,
              span: 12,
              ar: 0.75,
              colori: [
                hex('Rosa cipria', '#edc8d8'), hex('Pesca', '#fcd095'), hex('Crema', '#ffe9ba'), hex('Azzurro polvere', '#b9c7d5'),
                hex('Verde acqua', '#70c2b2'), hex('Giallo paglia', '#f0d786'), hex('Grigio', '#74808a'), hex('Bruno', '#403834'),
              ],
            },
            { f: '2012-cartoline-01', titolo: 'Cartoline', span: 12, ar: 1.1 },
          ],
        },
      ],
    ],
    destra: [
      [{ f: '2012-catalogo-01', titolo: 'Catalogo', sotto: 'Tre volumi, tre verdi, tre caratteri', span: 12, ar: 1.41, fit: 'cover' }],
      [{ f: '2012-manifesto-01', titolo: 'Manifesto tipografico', span: 12, ar: 2.1, fit: 'cover' }],
      [{ f: '2012-cancelleria-01', titolo: 'Cancelleria', sotto: 'Il nome cambia carattere su ogni stampato', span: 12, ar: 1.41, fit: 'cover' }],
    ],
  },

  'documenta/2022': {
    sinistra: [
      [{ f: '2022-lettering-01', titolo: 'Lettering', sotto: 'Studio 4oo2', span: 12, ar: 3.57, fit: 'cover' }],
      [{ f: '2022-mani-motivo-01', titolo: 'Mani', sotto: 'Le mani-corda come motivo', span: 12, ar: 1.41, fit: 'cover' }],
      [
        {
          cols: 2,
          span: 6,
          ar: 1.5,
          colori: [hex('Arancio', '#f5532d'), hex('Giallo', '#fedf14'), hex('Verde', '#289b70'), hex('Viola', '#b952d6'), hex('Nero', '#000000'), hex('Bianco', '#ffffff')],
        },
        { f: '2022-lumbung-01', titolo: 'Lumbung', sotto: '«Let there be lumbung»', span: 6, ar: 0.7, fit: 'cover' },
      ],
    ],
    destra: [
      [{ f: '2022-manifesto-01', titolo: 'Manifesto', span: 12, ar: 1.41, fit: 'cover' }],
      [
        { f: '2022-manifesto-viola-01', titolo: 'Manifesto verticale', span: 6, ar: 0.53, fit: 'cover' },
        { f: '2022-progetto-bozza-4oo2-01', titolo: 'Disegni', sotto: 'Studio 4oo2, bozza del motivo', span: 6, ar: 0.53, fit: 'cover' },
      ],
    ],
  },

  'cop-conferenza-delle-parti-unfccc/2015': {
    sinistra: [
      [{ f: '2015-marchio-01', titolo: 'Marchio', sotto: 'Florent Giambagli', span: 12, ar: 1.3 }],
      [
        { f: '2015-logotipo-01', titolo: 'Versione orizzontale', span: 6, ar: 1.05 },
        { f: '2015-logotipo-2015-01', titolo: 'Versione ridotta', span: 6, ar: 1.05 },
      ],
      [
        { f: '2015-foglia-01', titolo: 'Simbolo', span: 6, ar: 1.05 },
        {
          cols: 3,
          span: 6,
          ar: 1,
          colori: [hex('Verde scuro', '#03853d'), hex('Verde', '#2d8f45'), hex('Verde chiaro', '#8abe43'), hex('Verde tenue', '#c3dc7f'), hex('Ardesia', '#3a4c63'), hex('Bianco', '#ffffff')],
        },
      ],
    ],
    destra: [
      [{ gruppo: ['2015-copertine-1-01', '2015-copertine-2-01', '2015-copertine-3-01', '2015-copertine-4-01'], cols: 2, titolo: 'Copertine dei rapporti', sotto: 'Il marchio in un colore per tema', span: 12, ar: 0.707 }],
      [{ f: '2015-fondale-01', titolo: 'Fondale', span: 12, ar: 4, fit: 'cover' }],
      [{ f: '2015-foglia-oro-01', titolo: 'Marchio in oro', span: 12, ar: 1.4, fit: 'cover' }],
    ],
  },

  'cop-conferenza-delle-parti-unfccc/2021': {
    sinistra: [
      [{ f: '2021-marchio-01', titolo: 'Marchio', sotto: 'Johnson Banks', span: 12, ar: 1.9 }],
      [{ f: '2021-globi-01', titolo: 'Varianti del globo', span: 12, ar: 2.1, fit: 'cover' }],
      [
        { f: '2021-tungsten-01', titolo: 'Carattere', sotto: 'Tungsten', span: 6, ar: 0.85 },
        { cols: 1, span: 6, ar: 3, colori: [hex('Blu', '#352f8c'), hex('Verde', '#8ddc73'), hex('Bianco', '#ffffff')] },
      ],
    ],
    destra: [
      [{ gruppo: ['2021-manifesti-1-01', '2021-manifesti-2-01'], cols: 2, titolo: 'Manifesti', span: 12, ar: 0.757 }],
      [{ f: '2021-slogan-01', titolo: 'Slogan', sotto: '«The Climate has no Borders»', span: 12, ar: 1.41, fit: 'cover' }],
    ],
  },
}
