# CLAUDE.md

Verbindungssuche auf einem statischen Fahrplan. TypeScript, Vitest, keine
Laufzeit-Abhängigkeiten.

## Befehle

| Befehl | Zweck |
|---|---|
| `npm test` | Testsuite einmal ausführen |
| `npm run test:watch` | Tests im Watch-Modus |
| `npm run typecheck` | TypeScript prüfen (`tsc --noEmit`) |
| `npm run suche -- <von> <nach> [HH:MM]` | Verbindungssuche auf der Kommandozeile |

## Konventionen

- **Domänensprache ist Deutsch.** Typen, Funktionen und Variablen heissen
  `Verbindung`, `Abschnitt`, `Fahrt`, `Halt`, `sucheVerbindungen` — nicht
  `Connection` oder `findRoutes`. Auch Testnamen sind deutsch.
- **Zeiten sind Minuten seit Mitternacht** (`Zeit` in `src/domain/zeit.ts`),
  nie `Date`. Werte ab 1440 liegen am Folgetag.
- **Tests laufen gegen den echten Fahrplan** aus `data/fahrplan.json`, nicht
  gegen Mocks. Getestet wird an der öffentlichen Schnittstelle
  (`sucheVerbindungen`), nicht an internen Hilfsfunktionen.
- Reine Funktionen bevorzugen; kein globaler Zustand.
