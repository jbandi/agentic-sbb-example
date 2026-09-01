# Ticket #4: Dominierte Verbindungen verwerfen, sortieren und auf fünf kürzen

GitHub-Issue [#4](https://github.com/jbandi/agentic-sbb-example/issues/4), Label `ready-for-agent`.
Erzeugt mit `/to-tickets` aus Spec-Issue #1. Massgeblich ist das Issue.

---

## Parent

#1 — Umsteigeverbindungen in der Verbindungssuche

## What to build

Das Resultat wird lesbar. Sobald Umstiege möglich sind, produziert der Fahrplan mit seinem Stundentakt für eine einzige Anfrage tausende Kandidaten — dieselbe Reise, nur eine Stunde früher losgefahren und in Olten eine Stunde gewartet. Für niemanden ist das die bessere Wahl.

Drei Regeln, in dieser Reihenfolge angewandt:

1. **Dominierte Verbindungen verwerfen.** Eine Verbindung fliegt raus, wenn eine andere existiert, die nicht später abfährt, nicht später ankommt und nicht mehr Umstiege hat — und in mindestens einem der drei Kriterien echt besser ist.
2. **Sortieren**: früheste Ankunft, dann wenigste Umstiege, dann späteste Abfahrt.
3. **Auf höchstens fünf kürzen.**

Die Reihenfolge ist bedeutsam: Wer zuerst kürzt, wirft womöglich genau die Verbindung weg, die eine andere dominiert hätte.

## Acceptance criteria

- [ ] Keine dominierte Verbindung erscheint im Resultat.
- [ ] Die Sortierung stimmt, einschliesslich des dritten Kriteriums: Bei gleicher Ankunft und gleich vielen Umstiegen steht die später abfahrende Verbindung vorn.
- [ ] Bei gleicher Ankunft steht die Direktverbindung vor der Umsteigeverbindung.
- [ ] Das Resultat enthält höchstens fünf Verbindungen.
- [ ] Ein Scheinumstieg — dieselbe Fahrt an einer Zwischenstation künstlich in zwei Abschnitte geteilt — erscheint nicht im Resultat. Dafür braucht es keine eigene Regel; die Dominanz erledigt ihn.
- [ ] Die drei Regeln greifen in der Reihenfolge verwerfen → sortieren → kürzen.

## Blocked by

- #3
