# Ticket #2: Prefactor: Abschnitte einer Fahrt wiederverwendbar aus dem Fahrplan ziehen

> **Demo-Kopie, kein Ergebnis der Skills.** `/to-tickets` hat dieses Ticket
> ausschliesslich als GitHub-Issue
> [#2](https://github.com/jbandi/agentic-sbb-example/issues/2) publiziert
> (Label `ready-for-agent`), aus Spec-Issue #1. Die Datei hier wurde für den
> Vortrag danebengelegt — siehe [README](./README.md). Massgeblich ist das Issue.

---

## Parent

#1 — Umsteigeverbindungen in der Verbindungssuche

## What to build

Kein neues Verhalten, sondern die Vorbereitung darauf: "Make the change easy, then make the easy change."

Die Verbindungssuche baut ihre Abschnitte heute inline zusammen, während sie über die Fahrten läuft. Für die Umsteigesuche wird derselbe Schritt mehrfach gebraucht — einmal ab der Startstation, danach ab jeder Umsteigestation. Dieser Schritt wird deshalb zu einer eigenen internen Funktion: Zu einer Station und einer frühestmöglichen Abfahrt liefert sie alle Abschnitte, die eine einzelne Fahrt von dort aus hergibt.

Nach aussen ändert sich nichts. Die Suche liefert exakt dieselben Direktverbindungen wie vorher, die öffentliche Schnittstelle bleibt unberührt.

## Acceptance criteria

- [ ] Die bestehenden 11 Tests laufen unverändert grün — keiner wird angepasst.
- [ ] `npm run typecheck` ist sauber.
- [ ] `npm run suche -- Bern "Zürich HB" 08:00` liefert dieselbe Ausgabe wie vor der Änderung.
- [ ] Der neue Schritt ist eine interne Hilfsfunktion ohne `export`. Es entsteht kein neues öffentliches Modul und keine zusätzliche exportierte API.
- [ ] Kein Test greift auf die neue Hilfsfunktion zu.

## Blocked by

- None (can start immediately)
