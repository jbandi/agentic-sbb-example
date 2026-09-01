import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { ladeFahrplan, type Fahrplan, type FahrplanDaten } from "./domain/fahrplan.js";

const STANDARD_PFAD = fileURLToPath(new URL("../data/fahrplan.json", import.meta.url));

/** Lädt den Beispielfahrplan aus `data/fahrplan.json`. */
export function ladeFahrplanAusDatei(pfad: string = STANDARD_PFAD): Fahrplan {
  const daten = JSON.parse(readFileSync(pfad, "utf-8")) as FahrplanDaten;
  return ladeFahrplan(daten);
}
