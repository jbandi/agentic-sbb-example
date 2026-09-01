import type { Fahrplan, StationsId } from "./domain/fahrplan.js";
import type { Abschnitt, Verbindung } from "./domain/verbindung.js";
import { ankunftszeit } from "./domain/verbindung.js";
import type { Zeit } from "./domain/zeit.js";

export interface Suchanfrage {
  von: StationsId;
  nach: StationsId;
  /** Frühestmögliche Abfahrtszeit. */
  ab: Zeit;
}

/**
 * Alle Abschnitte, die sich von `von` aus in einer einzigen Fahrt zurücklegen
 * lassen, wenn frühestens um `fruehestensAb` abgefahren wird.
 */
function abschnitteAb(fahrplan: Fahrplan, von: StationsId, fruehestensAb: Zeit): Abschnitt[] {
  const abschnitte: Abschnitt[] = [];

  for (const fahrt of fahrplan.fahrten) {
    const einstieg = fahrt.halte.findIndex(
      (halt) => halt.station === von && halt.abfahrt !== null && halt.abfahrt >= fruehestensAb,
    );
    if (einstieg === -1) continue;

    const abfahrt = fahrt.halte[einstieg]!.abfahrt!;

    for (let index = einstieg + 1; index < fahrt.halte.length; index++) {
      const halt = fahrt.halte[index]!;
      if (halt.ankunft === null) continue;

      abschnitte.push({
        fahrtId: fahrt.id,
        linie: fahrt.linie,
        richtung: fahrt.richtung,
        von,
        abfahrt,
        nach: halt.station,
        ankunft: halt.ankunft,
      });
    }
  }

  return abschnitte;
}

/**
 * Sucht Verbindungen von `von` nach `nach`, die frühestens um `anfrage.ab` starten.
 *
 * Gefunden werden aktuell nur Direktverbindungen: Fahrten, die beide Stationen
 * in der richtigen Reihenfolge bedienen. Reisen mit Umstieg liefert die Suche
 * noch nicht.
 *
 * Sortiert nach Ankunftszeit.
 */
export function sucheVerbindungen(fahrplan: Fahrplan, anfrage: Suchanfrage): Verbindung[] {
  const verbindungen = abschnitteAb(fahrplan, anfrage.von, anfrage.ab)
    .filter((abschnitt) => abschnitt.nach === anfrage.nach)
    .map((abschnitt) => ({ abschnitte: [abschnitt] }));

  return verbindungen.sort((a, b) => ankunftszeit(a) - ankunftszeit(b));
}
