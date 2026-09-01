import type { StationsId } from "./fahrplan.js";
import type { Zeit } from "./zeit.js";

/** Ein Teilstück einer Verbindung, das in einem einzigen Zug zurückgelegt wird. */
export interface Abschnitt {
  fahrtId: string;
  linie: string;
  richtung: string;
  von: StationsId;
  abfahrt: Zeit;
  nach: StationsId;
  ankunft: Zeit;
}

/** Eine Reisemöglichkeit von A nach B, aus einem oder mehreren Abschnitten. */
export interface Verbindung {
  abschnitte: Abschnitt[];
}

export function abfahrtszeit(verbindung: Verbindung): Zeit {
  const erster = verbindung.abschnitte[0];
  if (!erster) throw new Error("Verbindung ohne Abschnitte");
  return erster.abfahrt;
}

export function ankunftszeit(verbindung: Verbindung): Zeit {
  const letzter = verbindung.abschnitte[verbindung.abschnitte.length - 1];
  if (!letzter) throw new Error("Verbindung ohne Abschnitte");
  return letzter.ankunft;
}

export function reisedauer(verbindung: Verbindung): number {
  return ankunftszeit(verbindung) - abfahrtszeit(verbindung);
}

export function anzahlUmstiege(verbindung: Verbindung): number {
  return Math.max(0, verbindung.abschnitte.length - 1);
}
