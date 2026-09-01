import { beforeAll, describe, expect, it } from "vitest";
import type { Fahrplan } from "./domain/fahrplan.js";
import { ankunftszeit, anzahlUmstiege, reisedauer, type Verbindung } from "./domain/verbindung.js";
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

/** Eine Verbindung als eine Zeile pro Abschnitt: "08:09 IR 36 LZ→OL 08:52". */
function alsFahrplanzeilen(verbindung: Verbindung): string[] {
  return verbindung.abschnitte.map(
    (abschnitt) =>
      `${formatZeit(abschnitt.abfahrt)} ${abschnitt.linie} ${abschnitt.von}→${abschnitt.nach}` +
      ` ${formatZeit(abschnitt.ankunft)}`,
  );
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

    const ankuenfte = verbindungen.map((v) => ankunftszeit(v));
    expect(ankuenfte).toEqual([...ankuenfte].sort((a, b) => a - b));
  });

  it("fährt jeden Abschnitt in der Richtung seiner Fahrt", () => {
    // Die IR 36 Richtung Basel hält in Luzern und Olten, aber nicht umgekehrt:
    // eine Direktverbindung Olten → Luzern fährt zwingend Richtung Luzern.
    const verbindungen = sucheVerbindungen(fahrplan, {
      von: "OL",
      nach: "LZ",
      ab: parseZeit("08:00"),
    });

    const direkte = verbindungen.filter((verbindung) => anzahlUmstiege(verbindung) === 0);
    expect(direkte.length).toBeGreaterThan(0);
    for (const verbindung of direkte) {
      expect(verbindung.abschnitte[0]!.richtung).toBe("Luzern");
    }

    for (const verbindung of verbindungen) {
      for (const abschnitt of verbindung.abschnitte) {
        expect(abschnitt.ankunft).toBeGreaterThan(abschnitt.abfahrt);
      }
    }
  });

  it("findet Luzern → Interlaken Ost mit einem Umstieg in Olten", () => {
    const verbindungen = sucheVerbindungen(fahrplan, {
      von: "LZ",
      nach: "IO",
      ab: parseZeit("08:00"),
    });

    expect(alsFahrplanzeilen(verbindungen[0]!)).toEqual([
      "08:09 IR 36 LZ→OL 08:52",
      "09:03 IC 61 OL→IO 10:33",
    ]);
    expect(anzahlUmstiege(verbindungen[0]!)).toBe(1);
  });

  it("verwirft einen Umstieg, der die Mindestumsteigezeit nicht erreicht", () => {
    // In Olten kommt der IC 1 um 08:30 an und der IC 6 nach Brig fährt um 08:30 ab.
    // Dieser Umstieg hätte die früheste Ankunft und stünde sonst zuoberst.
    const verbindungen = sucheVerbindungen(fahrplan, {
      von: "ZUE",
      nach: "BR",
      ab: parseZeit("08:00"),
    });

    expect(alsFahrplanzeilen(verbindungen[0]!)).toEqual([
      "08:02 IC 1 ZUE→OL 08:30",
      "09:30 IC 6 OL→BR 11:30",
    ]);
  });

  it("berücksichtigt eine heraufgesetzte Mindestumsteigezeit", () => {
    const verbindungen = sucheVerbindungen(fahrplan, {
      von: "LZ",
      nach: "IO",
      ab: parseZeit("08:00"),
      mindestUmsteigezeit: 15,
    });

    expect(formatZeit(ankunftszeit(verbindungen[0]!))).toBe("11:33");
  });

  it("liefert höchstens fünf Verbindungen, ohne dominierte", () => {
    const verbindungen = sucheVerbindungen(fahrplan, {
      von: "LZ",
      nach: "IO",
      ab: parseZeit("08:00"),
    });

    expect(verbindungen.map((verbindung) => alsFahrplanzeilen(verbindung).join(" | "))).toEqual([
      "08:09 IR 36 LZ→OL 08:52 | 09:03 IC 61 OL→IO 10:33",
      "09:09 IR 36 LZ→OL 09:52 | 10:03 IC 61 OL→IO 11:33",
      "10:09 IR 36 LZ→OL 10:52 | 11:03 IC 61 OL→IO 12:33",
      "11:09 IR 36 LZ→OL 11:52 | 12:03 IC 61 OL→IO 13:33",
      "12:09 IR 36 LZ→OL 12:52 | 13:03 IC 61 OL→IO 14:33",
    ]);
  });

  it("verwirft eine Verbindung, die eine andere in jeder Hinsicht schlägt", () => {
    // Um 08:09 in Luzern losfahren und in Olten bis 11:03 warten kommt gleich
    // an wie die Abfahrt um 09:09 — bei gleich vielen Umstiegen. Die frühere
    // Abfahrt ist damit dominiert und darf nicht erscheinen.
    const verbindungen = sucheVerbindungen(fahrplan, {
      von: "LZ",
      nach: "IO",
      ab: parseZeit("08:00"),
    });

    const dominierte = verbindungen.filter(
      (verbindung) =>
        formatZeit(verbindung.abschnitte[0]!.abfahrt) === "08:09" &&
        formatZeit(ankunftszeit(verbindung)) === "11:33",
    );
    expect(dominierte).toEqual([]);
  });

  it("findet Zug → Brig mit zwei Umstiegen", () => {
    // Zug liegt nur an der IR 70, Brig nur an der IC 6, und die beiden Linien
    // teilen keine Station — mit einem Umstieg ist Brig nicht erreichbar.
    const verbindungen = sucheVerbindungen(fahrplan, {
      von: "ZG",
      nach: "BR",
      ab: parseZeit("08:00"),
    });

    expect(alsFahrplanzeilen(verbindungen[0]!)).toEqual([
      "08:34 IR 70 ZG→LZ 08:57",
      "09:09 IR 36 LZ→OL 09:52",
      "10:30 IC 6 OL→BR 12:30",
    ]);
    expect(anzahlUmstiege(verbindungen[0]!)).toBe(2);
  });

  it("liefert keine Verbindung mit mehr als zwei Umstiegen", () => {
    const anfragen = [
      { von: "ZG", nach: "BR" },
      { von: "LZ", nach: "IO" },
      { von: "GE", nach: "BR" },
    ];

    for (const { von, nach } of anfragen) {
      const verbindungen = sucheVerbindungen(fahrplan, { von, nach, ab: parseZeit("08:00") });
      expect(verbindungen.length).toBeGreaterThan(0);
      for (const verbindung of verbindungen) {
        expect(anzahlUmstiege(verbindung)).toBeLessThanOrEqual(2);
      }
    }
  });

  it("liefert eine Ankunft nach Mitternacht als Zeit am Folgetag", () => {
    const verbindungen = sucheVerbindungen(fahrplan, {
      von: "GE",
      nach: "ZUE",
      ab: parseZeit("21:00"),
    });

    const letzte = verbindungen[verbindungen.length - 1]!;
    expect(ankunftszeit(letzte)).toBe(1470);
    expect(formatZeit(ankunftszeit(letzte))).toBe("00:30+1");
  });
});
