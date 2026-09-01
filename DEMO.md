# Live-Demo: Der agentische Workflow an einem echten Feature

Diese Demo zeigt den End-to-End-Workflow der [Engineering-Skills von Matt
Pocock](https://github.com/mattpocock/skills) an einer bestehenden Anwendung.

**Die Kernaussage für das Publikum:** Arbeiten mit einem Coding-Agenten ist
kein One-Shot-Prompt. Zwischen „ich hätte gerne Umsteigeverbindungen" und
fertigem Code liegen fünf Schritte, und jeder einzelne produziert ein Artefakt,
das man lesen, prüfen und aufbewahren kann.

Der Flow:

```
/setup-matt-pocock-skills   einmalig: wo leben Issues, Labels, Domain-Docs?
        ↓
/grill-with-docs            Verhör: der Agent fragt, statt zu raten
        ↓                   → CONTEXT.md (Glossar) + ADRs
/to-spec                    aus dem Gespräch wird ein Dokument
        ↓                   → GitHub-Issue
/to-tickets                 aus dem Dokument werden vertikale Schnitte
        ↓                   → GitHub-Issues mit Blocking-Kanten
/implement (+ /tdd)         rot → grün, Ticket für Ticket
        ↓
/code-review                zwei Achsen: Standards und Spec-Treue
```

## Die Ausgangslage

`main` enthält eine kleine Fahrplan-Suche in TypeScript. Sie findet **nur
Direktverbindungen**.

```sh
npm install
npm test                                        # 11 Tests grün
npm run suche -- Bern "Zürich HB" 08:00         # findet die Direktverbindung
npm run suche -- Luzern "Interlaken Ost" 08:00  # "Keine Verbindung gefunden."
```

Der zweite Aufruf ist der Aufhänger der Demo: Die Reise ist mit einem Umstieg
in Olten problemlos möglich, aber die Suche kennt keine Umstiege. Genau dieses
Feature wird gebaut.

Warum dieses Feature? Es ist klein genug, um in zehn Minuten zu passen, und
gross genug, dass es echte Mehrdeutigkeiten enthält — wie viele Umstiege sind
zumutbar, wie knapp darf ein Anschluss sein, was passiert über Mitternacht.
Das ist der Stoff, aus dem ein Grill besteht.

## Ein Branch pro Schritt

| Branch | Was dazukommt |
|---|---|
| `main` | Ausgangslage: nur Direktverbindungen, 11 Tests |
| `step-1-setup-skills` | `docs/agents/*` — Issue-Tracker, Triage-Labels, Domain-Doc-Layout |
| `step-2-grill` | `CONTEXT.md` (Glossar mit 15 Begriffen) und zwei ADRs |
| `step-3-spec` | die Spec als GitHub-Issue |
| `step-4-tickets` | die Tickets als GitHub-Issues mit Blocking-Kanten |
| `step-5-implement` | das fertige Feature, test-getrieben gebaut |
| `step-6-code-review` | der Review-Bericht |

Jeder Branch baut auf dem vorherigen auf, `step-6-code-review` ist das
Endresultat. Nützliche Diffs während des Vortrags:

```sh
git diff main..step-2-grill --stat          # was der Grill hinterlässt: nur Doku
git diff main..step-5-implement -- src/     # was am Code wirklich passiert ist
```

## Regieplan für zehn Minuten

| Zeit | Was | Worauf das Publikum achten soll |
|---|---|---|
| 0:00–1:00 | Ausgangslage zeigen: `npm test`, dann `npm run suche -- Luzern "Interlaken Ost" 08:00` | Das Problem ist in einem Satz erklärt und in einer Zeile sichtbar. |
| 1:00–4:00 | `/grill-with-docs` mit einem bewusst vagen Wunsch starten | **Der Agent baut nicht. Er fragt.** Das ist der Bruch mit der Erwartung. |
| 4:00–5:00 | `CONTEXT.md` und einen ADR aufschlagen | Aus dem Gespräch ist Projektwissen geworden, nicht nur Code. |
| 5:00–6:00 | `/to-spec`, dann das Issue auf GitHub zeigen | Die Spec ist nicht im Chat verloren, sie liegt im Tracker. |
| 6:00–7:00 | `/to-tickets`, die Issue-Liste mit „Blocked by" zeigen | Vertikale Schnitte statt Layer-für-Layer. |
| 7:00–9:00 | `/implement` mit `npm run test:watch` im zweiten Fenster | Rot → grün, mehrmals. Kein Big-Bang-Commit. |
| 9:00–10:00 | `npm run suche -- "Zürich HB" Brig 08:00` und der Beweis-Moment (unten) | Warum die Frage im Grill kein Selbstzweck war. |

**Tipp zur Sicherheit:** Alle Branches existieren bereits. Wenn ein Agent live
zäh wird, einfach auf den nächsten Branch wechseln und weitererzählen — die
Demo bricht nie ab. Die vollständigen Konversationen liegen zusätzlich als
Markdown vor (siehe unten) und lassen sich ganz ohne laufenden Agenten zeigen.

## Der Beweis-Moment

Am Ende, auf `step-5-implement` oder `step-6-code-review`:

```sh
npm run suche -- "Zürich HB" Brig 08:00
```

Es gibt keine Direktverbindung. Eine naive Umsteigesuche findet den Umstieg in
Olten: Der IC 1 kommt um **08:30** an, der IC 6 fährt um **08:30** ab. Null
Minuten. Der Algorithmus liefert eine Verbindung, die physikalisch unmöglich
ist — und kein Test schlägt an, weil niemand vorher darüber nachgedacht hat.

Genau diese Frage hat der Agent im Grill gestellt („wie knapp darf ein
Anschluss sein?"), und deshalb steht heute eine **Mindestumsteigezeit von fünf
Minuten** in der Spec, im ADR und im Test. Die Suche liefert korrekt den
späteren IC 6.

Das ist das stärkste Argument des Vortrags: Der Wert des Workflows liegt nicht
darin, dass der Agent schneller tippt. Er liegt darin, dass die richtigen
Fragen gestellt werden, **bevor** Code entsteht.

Zum Vergleich der Aufhänger, der jetzt funktioniert:

```sh
npm run suche -- Luzern "Interlaken Ost" 08:00
# 08:09 Luzern → 08:52 Olten   [IR 36]
# 09:03 Olten  → 10:33 Interlaken Ost  [IC 61]
```

Elf Minuten Umsteigezeit in Olten — knapp, aber machbar, und über der
vereinbarten Schranke.

## Die Konversationen offline zeigen

Jeder Schritt liegt zusätzlich als Transkript unter
`../agentic-sbb-2026/conversations/` und lässt sich in der T3-Code-Demo-App
abspielen, ohne dass ein Agent laufen muss:

| Datei | Schritt |
|---|---|
| `02-setup-skills.md` | `/setup-matt-pocock-skills` |
| `03-grill-umsteigeverbindungen.md` | `/grill-with-docs` — das Herzstück |
| `04-spec-umsteigeverbindungen.md` | `/to-spec` |
| `05-tickets-umsteigeverbindungen.md` | `/to-tickets` |
| `06-implement-umsteigeverbindungen.md` | `/implement` + `/tdd` |
| `07-code-review.md` | `/code-review` |

Das ist der Notausgang, falls im Vortragsraum das WLAN streikt: Die Demo
funktioniert dann als Lesung statt als Live-Session.

## Die Skills installieren

```sh
npx skills-cli@latest add mattpocock/skills
```

Die Skills liegen danach unter `~/.claude/skills/`. Danach einmalig pro Repo:

```
/setup-matt-pocock-skills
```

**Wichtig für die Vorbereitung:** `setup-matt-pocock-skills`, `to-spec`,
`to-tickets` und `implement` tragen `disable-model-invocation: true`. Sie
lassen sich **nur** starten, indem ein Mensch den Slash-Command tippt — kein
Agent kann sie selbst aufrufen. Für die Live-Demo ist das ein Vorteil (der
Mensch bleibt der Auslöser jedes Schritts), beim Vorbereiten muss man die
Schritte aber von Hand anstossen.

## Die Branches step-3 bis step-6 erzeugen

`main`, `step-1-setup-skills` und `step-2-grill` liegen fertig auf GitHub. Die
restlichen Branches entstehen mit drei getippten Slash-Commands, jeweils in
einer **frischen** Claude-Code-Session im Repo-Verzeichnis (frisch, weil jeder
Schritt sonst den Kontext des vorherigen mitschleppt — genau das soll der
Workflow ja vermeiden).

**Schritt 3 — Spec.** Vorher `git checkout step-2-grill && git checkout -b step-3-spec`, dann:

```
/to-spec Feature: Umsteigeverbindungen für die Verbindungssuche. Der Grill dazu ist
bereits gelaufen; die Entscheide stehen in CONTEXT.md und in docs/adr/0001-*.md und
docs/adr/0002-*.md, das vollständige Transkript in
../agentic-sbb-2026/conversations/03-grill-umsteigeverbindungen.md. Lies diese drei
Quellen zuerst und synthetisiere daraus die Spec — die Naht ist sucheVerbindungen().
```

**Schritt 4 — Tickets.** `git checkout -b step-4-tickets`, dann:

```
/to-tickets Die Spec liegt als GitHub-Issue #<Nummer aus Schritt 3>.
```

**Schritt 5 — Implementierung.** `git checkout -b step-5-implement`, dann:

```
/implement Die Tickets #<a> bis #<b> aus Issue #<Spec-Nummer>. Arbeite sie in
Dependency-Reihenfolge ab.
```

`/implement` ruft am Ende selbst `/code-review` auf. Für einen eigenen
Review-Branch stattdessen `git checkout -b step-6-code-review` und dort:

```
/code-review seit main
```

Danach die Konversationen exportieren — `../agentic-sbb-2026/EXPORT-SPEC.md`
ist genau dafür als Prompt formuliert:

```
Exportiere diese Konversation gemäss der Spezifikation in
../agentic-sbb-2026/EXPORT-SPEC.md nach
../agentic-sbb-2026/conversations/04-spec-umsteigeverbindungen.md
```
