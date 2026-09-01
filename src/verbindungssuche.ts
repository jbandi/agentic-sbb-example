import type { Fahrplan, StationsId } from "./domain/fahrplan.js";
import type { Verbindung } from "./domain/verbindung.js";
import { ankunftszeit } from "./domain/verbindung.js";
import type { Zeit } from "./domain/zeit.js";

export interface Suchanfrage {
  von: StationsId;
  nach: StationsId;
  /** Frühestmögliche Abfahrtszeit. */
  ab: Zeit;
}

/**
 * Sucht Verbindungen von `von` nach `nach`, die frühestens um `anfrage.ab` starten.
 *
 * Gefunden werden aktuell nur Direktverbindungen: Fahrten, die beide Stationen
 * in der richtigen Reihenfolge bedienen. Reisen mit Umstieg liefert die Suche
 * noch nicht.
 *
 * Sortiert nach Ankunftszeit, bei Gleichstand nach späterer Abfahrt.
 */
export function sucheVerbindungen(fahrplan: Fahrplan, anfrage: Suchanfrage): Verbindung[] {
  const verbindungen: Verbindung[] = [];

  for (const fahrt of fahrplan.fahrten) {
    const einstieg = fahrt.halte.findIndex(
      (halt) => halt.station === anfrage.von && halt.abfahrt !== null && halt.abfahrt >= anfrage.ab,
    );
    if (einstieg === -1) continue;

    const ausstieg = fahrt.halte.findIndex(
      (halt, index) => index > einstieg && halt.station === anfrage.nach && halt.ankunft !== null,
    );
    if (ausstieg === -1) continue;

    verbindungen.push({
      abschnitte: [
        {
          fahrtId: fahrt.id,
          linie: fahrt.linie,
          richtung: fahrt.richtung,
          von: anfrage.von,
          abfahrt: fahrt.halte[einstieg]!.abfahrt!,
          nach: anfrage.nach,
          ankunft: fahrt.halte[ausstieg]!.ankunft!,
        },
      ],
    });
  }

  return verbindungen.sort((a, b) => ankunftszeit(a) - ankunftszeit(b));
}
