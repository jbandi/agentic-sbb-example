# AGENTS.md

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

## Commits

- **Keine Signatur-Trailer.** Commit-Messages enthalten weder `Co-Authored-By:`
  noch `Claude-Session:` noch einen „Generated with"-Hinweis. Wer committet hat,
  steht im Git-Autor; die Message beschreibt ausschliesslich die Änderung.
- Betreffzeile im Imperativ und auf Deutsch, keine Zeichen ausserhalb von
  ASCII — sonst zerlegen manche Terminals das Log.

## Agent skills

### Issue tracker

Issues und Specs leben als GitHub Issues in `jbandi/agentic-sbb-example` (via `gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Die fünf kanonischen Labels unverändert: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: ein `CONTEXT.md` und ein `docs/adr/` im Repo-Root. See `docs/agents/domain.md`.

### Tickets schliessen

Sobald die Arbeit an einem Ticket committet und die Testsuite grün ist, schliesse
das Issue selbst — ohne dass jemand danach fragen muss:

    gh issue close <n> --comment "<ein Satz: was umgesetzt wurde, mit Commit-SHA>"

Nicht auf einen Merge nach `main` warten. Wir arbeiten mit einem Branch pro
Schritt, und GitHubs `Closes #N`-Automatik greift nur auf dem Default-Branch —
auf einem Feature-Branch bleibt sie wirkungslos.

Ist ein Akzeptanzkriterium **nicht** erfüllt, wird das Issue nicht geschlossen,
sondern kommentiert: was fehlt und was zum Schliessen nötig wäre. Das
Eltern-Issue der Spec wird nie geschlossen. See `docs/agents/issue-tracker.md`.
