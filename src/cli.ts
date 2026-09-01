import { findeStation, stationsName } from "./domain/fahrplan.js";
import { anzahlUmstiege, reisedauer, type Verbindung } from "./domain/verbindung.js";
import { formatDauer, formatZeit, parseZeit } from "./domain/zeit.js";
import { ladeFahrplanAusDatei } from "./fahrplan-laden.js";
import { sucheVerbindungen } from "./verbindungssuche.js";

const VERWENDUNG = `Verwendung: npm run suche -- <von> <nach> [ab HH:MM]

Beispiele:
  npm run suche -- Bern "Zürich HB" 08:00
  npm run suche -- Luzern "Interlaken Ost" 08:00`;

function beschreibe(fahrplan: ReturnType<typeof ladeFahrplanAusDatei>, verbindung: Verbindung): string {
  const zeilen = verbindung.abschnitte.map(
    (abschnitt) =>
      `    ${formatZeit(abschnitt.abfahrt)} ${stationsName(fahrplan, abschnitt.von)}` +
      ` → ${formatZeit(abschnitt.ankunft)} ${stationsName(fahrplan, abschnitt.nach)}` +
      `  [${abschnitt.linie} Richtung ${abschnitt.richtung}]`,
  );

  const umstiege = anzahlUmstiege(verbindung);
  const kopf =
    `  ${formatDauer(reisedauer(verbindung))}, ` +
    (umstiege === 0 ? "direkt" : `${umstiege} Umstieg${umstiege > 1 ? "e" : ""}`);

  return [kopf, ...zeilen].join("\n");
}

function main(argv: string[]): number {
  const [vonArg, nachArg, abArg = "08:00"] = argv;
  if (!vonArg || !nachArg) {
    console.error(VERWENDUNG);
    return 1;
  }

  const fahrplan = ladeFahrplanAusDatei();

  try {
    const von = findeStation(fahrplan, vonArg);
    const nach = findeStation(fahrplan, nachArg);
    const ab = parseZeit(abArg);

    const verbindungen = sucheVerbindungen(fahrplan, { von: von.id, nach: nach.id, ab });

    console.log(`\n${von.name} → ${nach.name}, ab ${formatZeit(ab)}\n`);
    if (verbindungen.length === 0) {
      console.log("  Keine Verbindung gefunden.\n");
      return 0;
    }

    for (const verbindung of verbindungen.slice(0, 3)) {
      console.log(beschreibe(fahrplan, verbindung));
      console.log("");
    }
  } catch (fehler) {
    console.error(fehler instanceof Error ? fehler.message : String(fehler));
    return 1;
  }

  return 0;
}

process.exitCode = main(process.argv.slice(2));
