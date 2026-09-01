# Live-Demo: Der agentische Workflow an einem echten Feature

Diese Demo zeigt den End-to-End-Workflow der [Engineering-Skills von Matt
Pocock](https://github.com/mattpocock/skills) an einer bestehenden Anwendung.

**Die Kernaussage:** Arbeiten mit einem Coding-Agenten ist kein
One-Shot-Prompt. Zwischen „ich hätte gerne Umsteigeverbindungen" und
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

Warum dieses Feature? Es ist klein genug für eine kurze Demo und gross genug,
dass es echte Mehrdeutigkeiten enthält — wie viele Umstiege sind zumutbar, wie knapp
darf ein Anschluss sein, was passiert über Mitternacht. Das ist der Stoff, aus
dem ein Grill besteht.

## Ein Branch pro Schritt

| Branch | Was dazukommt |
|---|---|
| `main` | Ausgangslage: nur Direktverbindungen, 11 Tests |
| `step-1-setup-skills` | `docs/agents/*` — Issue-Tracker, Triage-Labels, Domain-Doc-Layout |
| `step-2-grill` | `CONTEXT.md` (15 Begriffe) und zwei ADRs |
| `step-3-spec` | Spec als [Issue #1](https://github.com/jbandi/agentic-sbb-example/issues/1) |
| `step-4-tickets` | vier Tickets als [Issues #2–#5](https://github.com/jbandi/agentic-sbb-example/issues) mit nativen Blocking-Kanten |
| `step-5-implement` | das Feature, ein Commit pro Ticket, 18 Tests |
| `step-6-code-review` | der Review-Bericht unter `docs/reviews/` |

Jeder Branch baut auf dem vorherigen auf; `step-6-code-review` ist das
Endresultat. Nützliche Diffs:

```sh
git diff main..step-2-grill --stat          # was der Grill hinterlässt: nur Doku
git diff main..step-5-implement -- src/     # was am Code wirklich passiert ist
git log --oneline main..step-5-implement    # ein Commit pro Ticket
```

**Spec und Tickets leben auf GitHub, nicht im Repo.** Mit einem konfigurierten
GitHub-Tracker publizieren `/to-spec` und `/to-tickets` ausschliesslich Issues —
die Schritte 3 und 4 fassen den Code gar nicht an. Ein Schritt, der keine Zeile
Code erzeugt, sondern vier Issues. Unter `docs/demo-kopien/` liegen ab
`step-3-spec` trotzdem Textkopien, damit sich Spec und Tickets auch ohne Netz
nebeneinanderlegen lassen; eine README dort stellt klar, dass sie bei keinem
Lauf der Skills entstehen.

## Regieplan

| Schritt | Was | Worauf es ankommt |
|---|---|---|
| 1 | Ausgangslage: `npm test`, dann `npm run suche -- Luzern "Interlaken Ost" 08:00` | Das Problem ist in einem Satz erklärt und in einer Zeile sichtbar. |
| 2 | `/grill-with-docs` mit einem bewusst vagen Wunsch | **Der Agent baut nicht. Er fragt.** Das ist der Bruch mit der Erwartung. |
| 3 | `CONTEXT.md` und einen ADR aufschlagen | Aus dem Gespräch ist Projektwissen geworden, nicht nur Code. |
| 4 | `/to-spec`, dann Issue #1 auf GitHub | Die Spec ist nicht im Chat verloren, sie liegt im Tracker. |
| 5 | `/to-tickets`, Issue-Liste mit „Blocked by" | Vertikale Schnitte statt Layer-für-Layer. |
| 6 | `/implement` mit `npm run test:watch` im zweiten Fenster | Rot → grün, viermal. Kein Big-Bang-Commit. |
| 7 | Der Beweis-Moment und der Review (beide unten) | Warum die Frage im Grill kein Selbstzweck war. |

Schritt 2 und 6 dauern am längsten und sind am wenigsten planbar; wie lange sie
brauchen, hängt vom Agenten ab. Wird die Zeit knapp, lässt sich der Grill nach
zwei Runden abkürzen und bei der Implementierung auf den fertigen Branch
wechseln.

**Zur Sicherheit:** Alle Branches existieren bereits. Wird ein Agent live zäh,
genügt ein Wechsel auf den nächsten Branch — die Demo bricht nie ab.

## Der Beweis-Moment

Auf `step-5-implement` oder `step-6-code-review`:

```sh
npm run suche -- "Zürich HB" Brig 08:00
```

Es gibt keine Direktverbindung, also muss umgestiegen werden — und hier zeigt
sich, was die Frage im Grill wert war.

Eine naive Implementierung würde in Olten umsteigen lassen. Sie kettet zwei
Abschnitte einfach dann aneinander, wenn der zweite Zug **nicht früher** abfährt
als der erste ankommt. In Olten trifft der IC 1 um 08:30 ein, und der IC 6 nach
Brig fährt um 08:30 ab: Nach dieser Regel ist das ein gültiger Anschluss, mit
null Minuten zum Umsteigen.

Das Tückische daran ist nicht nur, dass diese Reise physikalisch unmöglich ist.
Sie hat auch die früheste Ankunft von allen und stünde deshalb **zuoberst** im
Resultat — der Bug wäre also nicht ein Ausreisser irgendwo unten in der Liste,
sondern der Vorschlag, den der Reisende zuerst sieht. Und kein Test hätte
angeschlagen, weil niemand die Regel je aufgeschrieben hat.

Genau diese Frage hat der Agent im Grill gestellt („wie knapp darf ein
Anschluss sein?"). Deshalb steht heute eine **Mindestumsteigezeit von fünf
Minuten** in der Spec, im ADR und im Test, und die Suche liefert korrekt den
IC 6 um 09:30.

Das ist das stärkste Argument für den Workflow: Sein Wert liegt nicht darin,
dass der Agent schneller tippt. Er liegt darin, dass die richtigen
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
`step-6-code-review` hat neun Befunde produziert. Drei davon sind besonders
aufschlussreich:

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

Entsprechend sieht die Issue-Liste am Ende aus: nicht fünfmal „erledigt",
sondern zwei geschlossene Tickets und drei offene Punkte, jeder mit einer
Begründung aus dem Review.

| Issue | Status | Warum |
|---|---|---|
| [#2](https://github.com/jbandi/agentic-sbb-example/issues/2) Prefactor | **geschlossen** | Alle Akzeptanzkriterien erfüllt, der Review hat nichts beanstandet. |
| [#5](https://github.com/jbandi/agentic-sbb-example/issues/5) Zwei Umstiege | **geschlossen** | Ebenfalls sauber — dank des Zuschnitts aus #3 genügte eine geänderte Zeile. |
| [#3](https://github.com/jbandi/agentic-sbb-example/issues/3) Ein Umstieg | offen | Verletzt ein **eigenes** Akzeptanzkriterium: „das ist die einzige erlaubte Änderung an einem bestehenden Test". Es wurden drei geändert, zwei davon nachweislich ohne Not. |
| [#4](https://github.com/jbandi/agentic-sbb-example/issues/4) Dominanzfilter | offen | Zwei seiner Kriterien sind durch Regel 1 desselben Tickets unbeobachtbar geworden. Kein Mangel am Code, sondern eine Erkenntnis über das Ticket. |
| [#1](https://github.com/jbandi/agentic-sbb-example/issues/1) Spec | offen | Wartet auf die Produktentscheidung zu den dreifach angezeigten Reisen. |

Die Begründungen stehen ausformuliert als Kommentare an den Issues.

Der vollständige Bericht: `docs/reviews/umsteigeverbindungen.md` auf
`step-6-code-review`.

## Die Demo neu aufsetzen

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

**Ein Detail, das man vorher kennen muss:** `setup-matt-pocock-skills`, `to-spec`, `to-tickets` und `implement` tragen
`disable-model-invocation: true`. Sie starten **nur**, wenn ein Mensch den
Slash-Command tippt — ein Agent kann sie nicht selbst aufrufen und wird
ausdrücklich angewiesen, den Workflow auch nicht nachzubauen. Der führende
Schrägstrich ist dabei entscheidend: Text, der bloss mit `to-spec` beginnt,
gilt nicht als Aufruf.

Für eine Live-Demo ist das ein Vorteil: Der Mensch bleibt der Auslöser jedes
Schritts. Beim Vorbereiten bedeutet es, dass diese vier Schritte von Hand
angestossen werden müssen.
