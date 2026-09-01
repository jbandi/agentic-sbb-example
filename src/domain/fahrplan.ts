import { parseZeit, type Zeit } from "./zeit.js";

export type StationsId = string;

export interface Station {
  id: StationsId;
  name: string;
}

/**
 * Ein Halt einer konkreten Fahrt.
 * `ankunft` fehlt am Startbahnhof, `abfahrt` am Endbahnhof.
 */
export interface Halt {
  station: StationsId;
  ankunft: Zeit | null;
  abfahrt: Zeit | null;
}

/** Eine konkrete Zugfahrt an einem Betriebstag. */
export interface Fahrt {
  id: string;
  linie: string;
  richtung: string;
  halte: Halt[];
}

export interface Fahrplan {
  stationen: Station[];
  fahrten: Fahrt[];
}

/** Rohformat, wie es in `data/fahrplan.json` steht. */
export interface FahrplanDaten {
  stationen: Station[];
  linien: LinienDaten[];
}

export interface LinienDaten {
  linie: string;
  richtung: string;
  /** Abfahrt der ersten Fahrt am Startbahnhof, als `HH:MM`. */
  ersteAbfahrt: string;
  taktMinuten: number;
  anzahlFahrten: number;
  halte: {
    station: StationsId;
    ankunftNachMin: number | null;
    abfahrtNachMin: number | null;
  }[];
}

/** Expandiert die Linien des Rohfahrplans in die einzelnen Fahrten des Tages. */
export function ladeFahrplan(daten: FahrplanDaten): Fahrplan {
  const fahrten: Fahrt[] = [];

  for (const linie of daten.linien) {
    const start = parseZeit(linie.ersteAbfahrt);
    const zielId = linie.halte[linie.halte.length - 1]?.station ?? "";

    for (let nummer = 0; nummer < linie.anzahlFahrten; nummer++) {
      const abfahrtszeit = start + nummer * linie.taktMinuten;
      fahrten.push({
        id: `${linie.linie.replace(/\s+/g, "")}/${zielId}/${String(nummer + 1).padStart(2, "0")}`,
        linie: linie.linie,
        richtung: linie.richtung,
        halte: linie.halte.map((halt) => ({
          station: halt.station,
          ankunft: halt.ankunftNachMin === null ? null : abfahrtszeit + halt.ankunftNachMin,
          abfahrt: halt.abfahrtNachMin === null ? null : abfahrtszeit + halt.abfahrtNachMin,
        })),
      });
    }
  }

  return { stationen: daten.stationen, fahrten };
}

/**
 * Findet eine Station über ihre ID oder ihren Namen (Gross-/Kleinschreibung
 * egal, Präfix genügt). Wirft, wenn nichts oder mehrdeutiges gefunden wird.
 */
export function findeStation(fahrplan: Fahrplan, suchbegriff: string): Station {
  const begriff = suchbegriff.trim().toLowerCase();

  const nachId = fahrplan.stationen.find((s) => s.id.toLowerCase() === begriff);
  if (nachId) return nachId;

  const treffer = fahrplan.stationen.filter((s) => s.name.toLowerCase().startsWith(begriff));
  if (treffer.length === 1) return treffer[0]!;
  if (treffer.length > 1) {
    const namen = treffer.map((s) => s.name).join(", ");
    throw new Error(`Station "${suchbegriff}" ist mehrdeutig: ${namen}`);
  }
  throw new Error(`Unbekannte Station: "${suchbegriff}"`);
}

export function stationsName(fahrplan: Fahrplan, id: StationsId): string {
  return fahrplan.stationen.find((s) => s.id === id)?.name ?? id;
}
