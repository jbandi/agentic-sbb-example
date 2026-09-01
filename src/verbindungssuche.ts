import type { Fahrplan, StationsId } from "./domain/fahrplan.js";
import type { Abschnitt, Verbindung } from "./domain/verbindung.js";
import { ankunftszeit } from "./domain/verbindung.js";
import type { Zeit } from "./domain/zeit.js";

export interface Suchanfrage {
  von: StationsId;
  nach: StationsId;
  /** Frühestmögliche Abfahrtszeit. */
  ab: Zeit;
  /**
   * Minuten, die zwischen der Ankunft eines Abschnitts und der Abfahrt des
   * nächsten mindestens liegen müssen, damit ein Umstieg als machbar gilt.
   */
  mindestUmsteigezeit?: number;
}

const STANDARD_MINDESTUMSTEIGEZEIT = 5;

/** Höchstens so viele Umstiege, also höchstens ein Abschnitt mehr. */
const MAX_UMSTIEGE = 1;

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
 * Sammelt alle Verbindungen von `von` nach `ziel`, die frühestens um `ab`
 * losfahren und höchstens `verbleibendeUmstiege` weitere Umstiege brauchen.
 */
function sammleVerbindungen(
  fahrplan: Fahrplan,
  von: StationsId,
  ab: Zeit,
  ziel: StationsId,
  mindestUmsteigezeit: number,
  verbleibendeUmstiege: number,
  bisher: Abschnitt[],
): Verbindung[] {
  const gefunden: Verbindung[] = [];

  for (const abschnitt of abschnitteAb(fahrplan, von, ab)) {
    const abschnitte = [...bisher, abschnitt];

    if (abschnitt.nach === ziel) {
      gefunden.push({ abschnitte });
    } else if (verbleibendeUmstiege > 0) {
      gefunden.push(
        ...sammleVerbindungen(
          fahrplan,
          abschnitt.nach,
          abschnitt.ankunft + mindestUmsteigezeit,
          ziel,
          mindestUmsteigezeit,
          verbleibendeUmstiege - 1,
          abschnitte,
        ),
      );
    }
  }

  return gefunden;
}

/**
 * Sucht Verbindungen von `von` nach `nach`, die frühestens um `anfrage.ab` starten.
 *
 * Gefunden werden Direktverbindungen und Verbindungen mit Umstieg. Ein Umstieg
 * gilt als machbar, wenn er an derselben Station stattfindet und die
 * Umsteigezeit die Mindestumsteigezeit erreicht.
 *
 * Sortiert nach Ankunftszeit.
 */
export function sucheVerbindungen(fahrplan: Fahrplan, anfrage: Suchanfrage): Verbindung[] {
  const mindestUmsteigezeit = anfrage.mindestUmsteigezeit ?? STANDARD_MINDESTUMSTEIGEZEIT;

  const verbindungen = sammleVerbindungen(
    fahrplan,
    anfrage.von,
    anfrage.ab,
    anfrage.nach,
    mindestUmsteigezeit,
    MAX_UMSTIEGE,
    [],
  );

  return verbindungen.sort((a, b) => ankunftszeit(a) - ankunftszeit(b));
}
