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

## Agent skills

### Issue tracker

Issues und Specs leben als GitHub Issues in `jbandi/agentic-sbb-example` (via `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Die fünf kanonischen Labels unverändert: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: ein `CONTEXT.md` und ein `docs/adr/` im Repo-Root. See `docs/agents/domain.md`.
