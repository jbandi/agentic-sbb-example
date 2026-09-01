# Ticket #3: Verbindungen mit einem Umstieg

GitHub-Issue [#3](https://github.com/jbandi/agentic-sbb-example/issues/3), Label `ready-for-agent`.
Erzeugt mit `/to-tickets` aus Spec-Issue #1. Massgeblich ist das Issue.

---

## Parent

#1 — Umsteigeverbindungen in der Verbindungssuche

## What to build

Wer eine Station sucht, zu der keine Fahrt durchfährt, bekommt eine Verbindung mit einem Umstieg statt einer leeren Antwort.

Ein Umstieg zählt nur, wenn er an derselben Station stattfindet und die Umsteigezeit mindestens der Mindestumsteigezeit entspricht. Die Suchanfrage erhält dafür ein optionales Feld mit Standardwert fünf Minuten, damit ein vorsichtiger Reisender es heraufsetzen kann und bestehende Aufrufer unverändert weiterlaufen.

Direktverbindungen und Umsteigeverbindungen landen in derselben Ergebnisliste. Ein Sonderpfad für Direktverbindungen entsteht nicht.

Das ist der Tracer Bullet des Features: Danach funktioniert der Anwendungsfall, der die Spec ausgelöst hat.

## Acceptance criteria

- [ ] `Luzern → Interlaken Ost` ab 08:00 liefert die Verbindung über Olten mit Ankunft 10:33 (IR 36 ab 08:09, Olten an 08:52; IC 61 ab 09:03).
- [ ] `Zürich HB → Brig` ab 08:00 liefert **nicht** den Umstieg in Olten mit null Minuten Umsteigezeit (IC 1 an 08:30, IC 6 ab 08:30), sondern den späteren IC 6 mit Ankunft 11:30.
- [ ] Eine auf 15 Minuten heraufgesetzte Mindestumsteigezeit verschiebt `Luzern → Interlaken Ost` auf den späteren Anschluss (Ankunft 11:33).
- [ ] Ein Umstieg zwischen zwei verschiedenen Stationen kommt nicht vor.
- [ ] Die bisher gefundenen Direktverbindungen werden unverändert gefunden.
- [ ] Der bestehende Test, der für `Luzern → Interlaken Ost` ein leeres Resultat erwartet, wird auf das neue Verhalten umgestellt — das ist die einzige erlaubte Änderung an einem bestehenden Test.
- [ ] Eine Verbindung, deren Ankunft nach Mitternacht liegt, wird mit ihrer Ankunft am Folgetag geliefert; es wird nirgends modulo 24 Stunden gerechnet.

## Blocked by

- #2
