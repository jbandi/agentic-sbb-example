import { beforeAll, describe, expect, it } from "vitest";
import type { Fahrplan } from "./domain/fahrplan.js";
import { anzahlUmstiege, reisedauer } from "./domain/verbindung.js";
import { formatZeit, parseZeit } from "./domain/zeit.js";
import { ladeFahrplanAusDatei } from "./fahrplan-laden.js";
import { sucheVerbindungen } from "./verbindungssuche.js";

let fahrplan: Fahrplan;

beforeAll(() => {
  fahrplan = ladeFahrplanAusDatei();
});

/** Kurzschreibweise für die Prüfung: "AB 09:04 → AN 10:30 (IC 1)". */
function alsText(fahrplan: Fahrplan, index: number, verbindungen: ReturnType<typeof sucheVerbindungen>) {
  const abschnitt = verbindungen[index]!.abschnitte[0]!;
  return `${formatZeit(abschnitt.abfahrt)} → ${formatZeit(abschnitt.ankunft)} (${abschnitt.linie})`;
}

describe("sucheVerbindungen", () => {
  it("findet die Direktverbindung Bern → Zürich HB", () => {
    const verbindungen = sucheVerbindungen(fahrplan, {
      von: "BN",
      nach: "ZUE",
      ab: parseZeit("08:00"),
    });

    expect(verbindungen.length).toBeGreaterThan(0);
    expect(alsText(fahrplan, 0, verbindungen)).toBe("08:32 → 09:30 (IC 1)");
    expect(anzahlUmstiege(verbindungen[0]!)).toBe(0);
    expect(reisedauer(verbindungen[0]!)).toBe(58);
  });

  it("berücksichtigt nur Abfahrten ab der gewünschten Zeit", () => {
    const verbindungen = sucheVerbindungen(fahrplan, {
      von: "BN",
      nach: "ZUE",
      ab: parseZeit("08:35"),
    });

    expect(alsText(fahrplan, 0, verbindungen)).toBe("09:32 → 10:30 (IC 1)");
  });

  it("liefert die Verbindungen nach Ankunftszeit sortiert", () => {
    const verbindungen = sucheVerbindungen(fahrplan, {
      von: "BS",
      nach: "BN",
      ab: parseZeit("08:00"),
    });

    const ankuenfte = verbindungen.map((v) => v.abschnitte[0]!.ankunft);
    expect(ankuenfte).toEqual([...ankuenfte].sort((a, b) => a - b));
  });

  it("findet keine Verbindung, wenn die Fahrtrichtung nicht passt", () => {
    // Die IR 36 Richtung Basel hält in Luzern und Olten, aber nicht umgekehrt.
    const verbindungen = sucheVerbindungen(fahrplan, {
      von: "OL",
      nach: "LZ",
      ab: parseZeit("08:00"),
    });

    for (const verbindung of verbindungen) {
      expect(verbindung.abschnitte[0]!.richtung).toBe("Luzern");
    }
  });

  it("findet Luzern → Interlaken Ost nicht, weil es keine Direktverbindung gibt", () => {
    const verbindungen = sucheVerbindungen(fahrplan, {
      von: "LZ",
      nach: "IO",
      ab: parseZeit("08:00"),
    });

    expect(verbindungen).toEqual([]);
  });
});
