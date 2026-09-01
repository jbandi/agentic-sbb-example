# Ticket #5: Verbindungen mit zwei Umstiegen

GitHub-Issue [#5](https://github.com/jbandi/agentic-sbb-example/issues/5), Label `ready-for-agent`.
Erzeugt mit `/to-tickets` aus Spec-Issue #1. Massgeblich ist das Issue.

---

## Parent

#1 — Umsteigeverbindungen in der Verbindungssuche

## What to build

Ziele, die mit einem Umstieg nicht erreichbar sind, werden mit zwei erreichbar. `Zug → Brig` ist der Fall: Zug liegt nur an der IR 70, Brig nur an der IC 6, und zwischen beiden liegt keine gemeinsame Station — es braucht zwei Umstiege.

Bei drei ist Schluss: höchstens zwei Umstiege, also höchstens drei Abschnitte pro Verbindung. In einem Netz mit zwölf Stationen ist alles darüber kein Reisevorschlag mehr.

Dieses Ticket kommt bewusst nach dem Filter aus #4: Ohne ihn wächst das Rohresultat auf über tausend Kandidaten pro Anfrage, und die Tests wären nicht mehr lesbar.

## Acceptance criteria

- [ ] `Zug → Brig` ab 08:00 liefert eine Verbindung mit zwei Umstiegen und Ankunft 12:30.
- [ ] Keine Verbindung im Resultat hat mehr als zwei Umstiege.
- [ ] Wo ein Umstieg genügt, verdrängt eine Verbindung mit zwei Umstiegen die einfachere nicht: `Luzern → Interlaken Ost` liefert weiterhin die Verbindung mit einem Umstieg zuoberst.
- [ ] Das Resultat bleibt bei höchstens fünf Verbindungen.
- [ ] Die vollständige Testsuite ist grün und `npm run typecheck` sauber.

## Blocked by

- #4
