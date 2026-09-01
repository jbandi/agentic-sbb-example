/**
 * Eine Uhrzeit als Minuten seit Mitternacht des Abfahrtstages.
 * Werte ab 1440 liegen am Folgetag (eine Fahrt, die über Mitternacht geht,
 * behält so eine monoton steigende Zeitachse).
 */
export type Zeit = number;

export const MINUTEN_PRO_TAG = 24 * 60;

export function parseZeit(text: string): Zeit {
  const treffer = /^(\d{1,2}):(\d{2})$/.exec(text.trim());
  if (!treffer) {
    throw new Error(`Ungültige Uhrzeit: "${text}" (erwartet wird HH:MM)`);
  }
  const stunden = Number(treffer[1]);
  const minuten = Number(treffer[2]);
  if (stunden > 23 || minuten > 59) {
    throw new Error(`Ungültige Uhrzeit: "${text}"`);
  }
  return stunden * 60 + minuten;
}

/** Formatiert als `HH:MM`, mit `+1`-Suffix für Zeiten am Folgetag. */
export function formatZeit(zeit: Zeit): string {
  const imTag = ((zeit % MINUTEN_PRO_TAG) + MINUTEN_PRO_TAG) % MINUTEN_PRO_TAG;
  const stunden = Math.floor(imTag / 60);
  const minuten = imTag % 60;
  const uhrzeit = `${String(stunden).padStart(2, "0")}:${String(minuten).padStart(2, "0")}`;
  const tage = Math.floor(zeit / MINUTEN_PRO_TAG);
  return tage > 0 ? `${uhrzeit}+${tage}` : uhrzeit;
}

export function formatDauer(minuten: number): string {
  const stunden = Math.floor(minuten / 60);
  const rest = minuten % 60;
  return stunden > 0 ? `${stunden}h${String(rest).padStart(2, "0")}` : `${rest}min`;
}
