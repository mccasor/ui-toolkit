import type { SelectOption, TableColumn } from 'ui-toolkit';

export interface Partita {
  id: string;
  casa: string;
  ospiti: string;
  gc: number | null;
  go: number | null;
  ora: string;
  campo: string;
  stato: 'live' | 'programmata' | 'finita';
  girone: string;
  coloreCasa: string;
  coloreOspiti: string;
}

export const PARTITE: Partita[] = [
  { id: 'p1', casa: 'Leoni di Quartiere', ospiti: 'Falchi', gc: 2, go: 1, ora: '15:00', campo: 'Campo 1', stato: 'live', girone: 'A', coloreCasa: '#1565C0', coloreOspiti: '#FFB936' },
  { id: 'p2', casa: 'Aquile Città', ospiti: 'San Marco', gc: null, go: null, ora: '15:45', campo: 'Campo 2', stato: 'programmata', girone: 'A', coloreCasa: '#2E7D32', coloreOspiti: '#6A1B9A' },
  { id: 'p3', casa: 'Perché No', ospiti: 'Città Alta', gc: 3, go: 3, ora: '14:15', campo: 'Campo 3', stato: 'finita', girone: 'B', coloreCasa: '#00796B', coloreOspiti: '#AD1457' },
  { id: 'p4', casa: 'Olimpia', ospiti: 'Stella Rossa', gc: 0, go: 2, ora: '13:30', campo: 'Campo 1', stato: 'finita', girone: 'B', coloreCasa: '#C62828', coloreOspiti: '#455A64' },
  { id: 'p5', casa: 'Velox', ospiti: 'Atlético Borgo', gc: null, go: null, ora: '16:30', campo: 'Campo 2', stato: 'programmata', girone: 'C', coloreCasa: '#FDD835', coloreOspiti: '#8E2448' },
];

export interface RigaClassifica {
  id: string;
  pos: number;
  squadra: string;
  colore: string;
  g: number;
  v: number;
  n: number;
  p: number;
  dr: number;
  pt: number;
}

export const CLASSIFICA: Record<string, RigaClassifica[]> = {
  A: [
    { id: 'leoni', pos: 1, squadra: 'Leoni di Quartiere', colore: '#1565C0', g: 6, v: 4, n: 0, p: 2, dr: 7, pt: 12 },
    { id: 'falchi', pos: 2, squadra: 'Falchi', colore: '#FFB936', g: 6, v: 3, n: 0, p: 3, dr: 2, pt: 9 },
    { id: 'aquile', pos: 3, squadra: 'Aquile Città', colore: '#2E7D32', g: 6, v: 2, n: 1, p: 3, dr: -1, pt: 7 },
    { id: 'sanmarco', pos: 4, squadra: 'San Marco', colore: '#6A1B9A', g: 6, v: 1, n: 1, p: 4, dr: -8, pt: 4 },
  ],
  B: [
    { id: 'perche', pos: 1, squadra: 'Perché No', colore: '#00796B', g: 6, v: 3, n: 2, p: 1, dr: 5, pt: 11 },
    { id: 'citta', pos: 2, squadra: 'Città Alta', colore: '#AD1457', g: 6, v: 3, n: 1, p: 2, dr: 3, pt: 10 },
    { id: 'olimpia', pos: 3, squadra: 'Olimpia', colore: '#C62828', g: 6, v: 2, n: 0, p: 4, dr: -2, pt: 6 },
    { id: 'stella', pos: 4, squadra: 'Stella Rossa', colore: '#455A64', g: 6, v: 0, n: 2, p: 4, dr: -6, pt: 2 },
  ],
};

export const COLONNE_CLASSIFICA: TableColumn<RigaClassifica>[] = [
  { key: 'pos', label: '#', numeric: true, align: 'start', width: '2.5rem', leading: true },
  { key: 'squadra', label: 'Squadra', primary: true },
  { key: 'g', label: 'G', numeric: true },
  { key: 'v', label: 'V', numeric: true },
  { key: 'n', label: 'N', numeric: true },
  { key: 'p', label: 'P', numeric: true },
  { key: 'dr', label: 'DR', numeric: true, value: (r) => (r.dr > 0 ? `+${r.dr}` : r.dr) },
  { key: 'pt', label: 'Punti', numeric: true },
];

export const GIRONI: SelectOption<string>[] = [
  { value: 'A', label: 'Girone A', description: '4 squadre' },
  { value: 'B', label: 'Girone B', description: '4 squadre' },
  { value: 'C', label: 'Girone C', description: '2 squadre' },
];
