# SBB-Fahrplan — Verbindungssuche

Eine kleine TypeScript-Anwendung, die auf einem statischen Fahrplan nach
Zugverbindungen sucht. Sie dient als Ausgangslage für eine Live-Demo des
agentischen Entwicklungs-Workflows (siehe [DEMO.md](./DEMO.md)).

## Ausprobieren

```sh
npm install
npm run suche -- Bern "Zürich HB" 08:00
npm test
```

## Was die Anwendung kann

`sucheVerbindungen` findet **Direktverbindungen**: Fahrten, die Start- und
Zielbahnhof in der richtigen Reihenfolge bedienen und frühestens zur
gewünschten Zeit abfahren. Reisen mit Umstieg kennt die Suche noch nicht — die
Anfrage `Luzern → Interlaken Ost` liefert deshalb kein Resultat, obwohl die
Reise mit einem Umstieg in Olten möglich wäre.

## Aufbau

| Datei | Inhalt |
|---|---|
| `data/fahrplan.json` | Stationen und Linien; jede Linie verkehrt im Stundentakt |
| `src/domain/zeit.ts` | `Zeit` als Minuten seit Mitternacht, Parsen und Formatieren |
| `src/domain/fahrplan.ts` | Stationen, Fahrten, Halte; Expansion der Linien in Fahrten |
| `src/domain/verbindung.ts` | `Verbindung` aus `Abschnitt`en, Reisedauer, Anzahl Umstiege |
| `src/verbindungssuche.ts` | die eigentliche Suche |
| `src/cli.ts` | Kommandozeilen-Ausgabe |

Die Fahrplandaten sind an das Schweizer Netz angelehnt, aber frei erfunden und
stark vereinfacht: Jede Linie verkehrt stündlich mit konstanten Fahrzeiten.

## Skripte

| Befehl | Zweck |
|---|---|
| `npm test` | Testsuite einmal ausführen |
| `npm run test:watch` | Tests im Watch-Modus |
| `npm run typecheck` | TypeScript prüfen |
| `npm run suche -- <von> <nach> [HH:MM]` | Verbindungssuche auf der Kommandozeile |
