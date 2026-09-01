# Live-Demo: Der agentische Workflow an einem echten Feature

Diese Demo zeigt den End-to-End-Workflow der [Engineering-Skills von Matt
Pocock](https://github.com/mattpocock/skills) an einer bestehenden Anwendung.

**Die Kernaussage für das Publikum:** Arbeiten mit einem Coding-Agenten ist
kein One-Shot-Prompt. Zwischen „ich hätte gerne Umsteigeverbindungen" und
fertigem Code liegen fünf Schritte, und jeder einzelne hinterlässt ein
Artefakt, das man lesen, prüfen und aufbewahren kann.

```
/setup-matt-pocock-skills   einmalig: wo leben Issues, Labels, Domain-Docs?
        ↓
/grill-with-docs            Verhör: der Agent fragt, statt zu raten
        ↓                   → CONTEXT.md (Glossar) + zwei ADRs
/to-spec                    aus dem Gespräch wird ein Dokument
        ↓                   → Issue #1
/to-tickets                 aus dem Dokument werden vertikale Schnitte
        ↓                   → Issues #2–#5 mit Blocking-Kanten
/implement (+ /tdd)         rot → grün, Ticket für Ticket
        ↓                   → 18 Tests
/code-review                zwei Achsen: Standards und Spec-Treue
                            → neun Befunde
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

Der zweite Aufruf ist der Aufhänger: Die Reise ist mit einem Umstieg in Olten
problemlos möglich, aber die Suche kennt keine Umstiege.

Warum dieses Feature? Es ist klein genug für zehn Minuten und gross genug, dass
es echte Mehrdeutigkeiten enthält — wie viele Umstiege sind zumutbar, wie knapp
darf ein Anschluss sein, was passiert über Mitternacht. Das ist der Stoff, aus
dem ein Grill besteht.

## Ein Branch pro Schritt

| Branch | Was dazukommt |
|---|---|
| `main` | Ausgangslage: nur Direktverbindungen, 11 Tests |
| `step-1-setup-skills` | `docs/agents/*` — Issue-Tracker, Triage-Labels, Domain-Doc-Layout |
| `step-2-grill` | `CONTEXT.md` (15 Begriffe) und zwei ADRs |
| `step-3-spec` | Spec als [Issue #1](https://github.com/jbandi/agentic-sbb-example/issues/1), Kopie unter `docs/specs/` |
| `step-4-tickets` | vier Tickets als [Issues #2–#5](https://github.com/jbandi/agentic-sbb-example/issues) mit nativen Blocking-Kanten |
| `step-5-implement` | das Feature, ein Commit pro Ticket, 18 Tests |
| `step-6-code-review` | der Review-Bericht unter `docs/reviews/` |

Jeder Branch baut auf dem vorherigen auf; `step-6-code-review` ist das
Endresultat. Nützliche Diffs während des Vortrags:

```sh
git diff main..step-2-grill --stat          # was der Grill hinterlässt: nur Doku
git diff main..step-5-implement -- src/     # was am Code wirklich passiert ist
git log --oneline main..step-5-implement    # ein Commit pro Ticket
```

## Regieplan für zehn Minuten

| Zeit | Was | Worauf das Publikum achten soll |
|---|---|---|
| 0:00–1:00 | Ausgangslage: `npm test`, dann `npm run suche -- Luzern "Interlaken Ost" 08:00` | Das Problem ist in einem Satz erklärt und in einer Zeile sichtbar. |
| 1:00–4:00 | `/grill-with-docs` mit einem bewusst vagen Wunsch | **Der Agent baut nicht. Er fragt.** Das ist der Bruch mit der Erwartung. |
| 4:00–5:00 | `CONTEXT.md` und einen ADR aufschlagen | Aus dem Gespräch ist Projektwissen geworden, nicht nur Code. |
| 5:00–6:00 | `/to-spec`, dann Issue #1 auf GitHub | Die Spec ist nicht im Chat verloren, sie liegt im Tracker. |
| 6:00–7:00 | `/to-tickets`, Issue-Liste mit „Blocked by" | Vertikale Schnitte statt Layer-für-Layer. |
| 7:00–9:00 | `/implement` mit `npm run test:watch` im zweiten Fenster | Rot → grün, viermal. Kein Big-Bang-Commit. |
| 9:00–10:00 | Der Beweis-Moment und der Review (beide unten) | Warum die Frage im Grill kein Selbstzweck war. |

**Zur Sicherheit:** Alle Branches existieren bereits. Wenn ein Agent live zäh
wird, einfach auf den nächsten Branch wechseln und weitererzählen — die Demo
bricht nie ab. Die vollständigen Konversationen liegen zusätzlich als Markdown
vor und lassen sich ganz ohne laufenden Agenten zeigen.

## Der Beweis-Moment

Auf `step-5-implement` oder `step-6-code-review`:

```sh
npm run suche -- "Zürich HB" Brig 08:00
```

Es gibt keine Direktverbindung. Eine naive Umsteigesuche findet den Umstieg in
Olten: Der IC 1 kommt um **08:30** an, der IC 6 fährt um **08:30** ab. Null
Minuten. Der Algorithmus liefert eine Verbindung, die physikalisch unmöglich
ist — sie hat sogar die früheste Ankunft und stünde damit zuoberst. Und kein
Test schlägt an, weil niemand vorher darüber nachgedacht hat.

Genau diese Frage hat der Agent im Grill gestellt („wie knapp darf ein
Anschluss sein?"). Deshalb steht heute eine **Mindestumsteigezeit von fünf
Minuten** in der Spec, im ADR und im Test, und die Suche liefert korrekt den
IC 6 um 09:30.

Das ist das stärkste Argument des Vortrags: Der Wert des Workflows liegt nicht
darin, dass der Agent schneller tippt. Er liegt darin, dass die richtigen
Fragen gestellt werden, **bevor** Code entsteht.

Der Aufhänger, der jetzt funktioniert:

```sh
npm run suche -- Luzern "Interlaken Ost" 08:00
# 08:09 Luzern → 08:52 Olten            [IR 36]
# 09:03 Olten  → 10:33 Interlaken Ost   [IC 61]
```

Elf Minuten Umsteigezeit in Olten — knapp, aber über der vereinbarten Schranke.

## Der Schluss, der besser ist als ein Happy End

Die Demo endet **nicht** mit „alles grün". Der Zwei-Achsen-Review auf
`step-6-code-review` hat neun Befunde produziert, und drei davon sind gute
Vortragsmomente:

1. **Die Spec hat sich geirrt.** Sie sagte, genau ein bestehender Test müsse
   angepasst werden. Es waren drei. Der Review hat nachgemessen, dass zwei
   davon gar nicht hätten geändert werden müssen — und dass einer dabei
   abgeschwächt wurde.
2. **Der Kronzeuge der Spec hat selbst einen Mangel.** `Zürich HB → Brig` zeigt
   dreimal dieselbe Reise: dieselben zwei Züge, der Umstieg einmal in Olten und
   einmal in Bern verbucht. Nach dem Buchstaben der Spec korrekt, aber die
   Absicht („keine Varianten derselben Reise") ist verfehlt. Das ist eine
   Produktentscheidung, keine Korrektur — und sie geht als Kommentar zurück an
   Issue #1.
3. **Zwei Akzeptanzkriterien sind unbeobachtbar.** Der Pareto-Filter aus
   Ticket #4 verwirft genau die Verbindungspaare, an denen die Tie-Breaker der
   Sortierung sichtbar würden. Regel 1 desselben Tickets macht Regel 2
   untestbar. Der Review empfiehlt, das im Ticket zu vermerken statt einen Test
   zu erzwingen, der die Naht verlassen müsste.

Deshalb sind die Issues #1–#5 bewusst **offen** geblieben. Der Workflow endet
nicht bei grünen Tests, sondern bei einem Review, der Fragen zurückgibt.

Der vollständige Bericht: `docs/reviews/umsteigeverbindungen.md` auf
`step-6-code-review`.

## Die Konversationen offline zeigen

Jeder Schritt liegt zusätzlich als Transkript unter
`../agentic-sbb-2026/conversations/` und lässt sich in der T3-Code-Demo-App
abspielen, ohne dass ein Agent laufen muss:

| Datei | Schritt |
|---|---|
| `91-grill-umsteigeverbindungen.md` | `/grill-with-docs` — das Herzstück, drei Frontier-Runden |
| `92-spec-umsteigeverbindungen.md` | `/to-spec` |
| `93-tickets-umsteigeverbindungen.md` | `/to-tickets` |
| `94-implement-umsteigeverbindungen.md` | `/implement` + `/tdd` |
| `95-code-review.md` | `/code-review` |

Das einmalige `/setup-matt-pocock-skills` hat kein Transkript — es ist
Einrichtung, nicht Teil des Flows, den die Demo zeigt.

Das ist der Notausgang, falls im Vortragsraum das WLAN streikt: Die Demo
funktioniert dann als Lesung statt als Live-Session.

## Die Demo für einen neuen Vortrag neu aufsetzen

[SETUP-NEUES-REPO.md](./SETUP-NEUES-REPO.md) enthält einen fertigen Prompt, der
ein frisches Demo-Repo anlegt: Ausgangs-App plus Skills-Konfiguration, ohne
jede Spur des Flows. Er fragt nur nach dem Repo-Namen und macht den Rest selbst.

## Die Skills installieren

```sh
npx skills-cli@latest add mattpocock/skills
```

Die Skills liegen danach unter `~/.claude/skills/`. Einmalig pro Repo:

```
/setup-matt-pocock-skills
```

**Ein Detail, das man vor dem Vortrag kennen muss:**
`setup-matt-pocock-skills`, `to-spec`, `to-tickets` und `implement` tragen
`disable-model-invocation: true`. Sie starten **nur**, wenn ein Mensch den
Slash-Command tippt — ein Agent kann sie nicht selbst aufrufen und wird
ausdrücklich angewiesen, den Workflow auch nicht nachzubauen. Der führende
Schrägstrich ist dabei entscheidend: Text, der bloss mit `to-spec` beginnt,
gilt nicht als Aufruf.

Für die Live-Demo ist das ein Vorteil — der Mensch bleibt der Auslöser jedes
Schritts. Beim Vorbereiten heisst es: diese vier Schritte von Hand anstossen.
