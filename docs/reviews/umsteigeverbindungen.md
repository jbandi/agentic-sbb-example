# Code-Review: Umsteigeverbindungen

Fixpunkt `main` (`01a0f91`), Stand `bc531c3`. Diff: `git diff main...HEAD`.
Spec: Issue [#1](https://github.com/jbandi/agentic-sbb-example/issues/1). Tickets:
[#2](https://github.com/jbandi/agentic-sbb-example/issues/2),
[#3](https://github.com/jbandi/agentic-sbb-example/issues/3),
[#4](https://github.com/jbandi/agentic-sbb-example/issues/4),
[#5](https://github.com/jbandi/agentic-sbb-example/issues/5).

Erzeugt mit `/code-review`. Zwei Achsen, parallel und voneinander getrennt
geprüft: **Standards** (hält der Code die dokumentierten Konventionen und die
ADRs ein?) und **Spec** (tut der Code, was Issue #1 und die Tickets verlangt
haben?). Die Achsen werden bewusst nicht ineinander gerechnet.

Zustand bei Review-Beginn: 18 Tests grün, `npm run typecheck` sauber.

---

## Achse Standards

Quellen: `CLAUDE.md` (Konventionen), `CONTEXT.md` (Glossar), `docs/adr/0001-…`,
`docs/adr/0002-…`, dazu die Fowler-Smell-Baseline.

### Muss behoben werden

**S1 — ADR 0001 verlangt, dass der Default beobachtbar getestet wird; er ist es nicht.**
`src/verbindungssuche.ts:18` setzt `STANDARD_MINDESTUMSTEIGEZEIT = 5`.
ADR 0001, Konsequenzen: _"Der Default ist Teil des beobachtbaren Verhaltens von
`sucheVerbindungen` und wird dort getestet, nicht in einer Konstante versteckt."_
Kein Test pinnt den Wert. `src/verbindungssuche.test.ts:100–113` belegt nur, dass
der Null-Minuten-Umstieg in Olten wegfällt — der Test bestünde mit **jedem**
Default ≥ 1. `src/verbindungssuche.test.ts:115–124` prüft ausschliesslich den
überschriebenen Wert 15.

Nachgemessen über alle Stationspaare: ein Default von 3 oder 4 liefert
**identische** Resultate wie 5, ein Default von 6 weicht in 36 Anfragen ab, einer
von 1 in 96. Der dokumentierte Wert 5 ist also von 3 und 4 nicht unterscheidbar,
von 6 aber sehr wohl — ein Test, der den Default festnagelt, wäre billig zu haben
und fehlt.

**S2 — Wirkungsloser Sortieraufruf.**
`src/verbindungssuche.ts:164`:

```typescript
return verwirfDominierte(verbindungen).sort(vergleiche).slice(0, MAX_VERBINDUNGEN);
```

`verwirfDominierte` sortiert intern bereits mit demselben Comparator
(`src/verbindungssuche.ts:129`) und baut `front` als Teilfolge dieser sortierten
Liste (`:131–136`). Das Ergebnis ist damit schon in `vergleiche`-Ordnung; das
zweite `.sort(vergleiche)` ändert nachweisbar nichts.

Der Aufruf ist nicht falsch, sondern folgenlos — er liest sich aber wie die
Umsetzung von Regel 2 aus Ticket #4 ("verwerfen → sortieren → kürzen"), während
die Sortierung real eine Zeile tiefer im Filter passiert. Wer den Filter später
umbaut, entfernt womöglich die tragende Sortierung und lässt die dekorative
stehen. Entweder die Sortierung aus `verwirfDominierte` herausziehen oder an
Zeile 164 kommentieren, warum sie dort nur noch Zusicherung ist.

### Bewusst so, aber festhalten

**S3 — Sieben Positionsparameter auf `sammleVerbindungen` (Data Clumps).**
`src/verbindungssuche.ts:64–72`. Drei davon (`fahrplan`, `ziel`,
`mindestUmsteigezeit`) sind über die ganze Rekursion invariant, `(von, ab)` reist
stets gemeinsam. Die Aufrufstelle `:82–90` ist entsprechend schwer zu lesen. Ein
Suchkontext-Objekt oder eine Closure über die Invarianten wäre die Fowler-Antwort.
Bei einer einzigen Aufrufstelle vertretbar.

**S4 — Zwei Formatier-Helfer im Test (Duplicated Code).**
`src/verbindungssuche.test.ts:14–18` (`alsText`, Bestand) und `:20–27`
(`alsFahrplanzeilen`, neu) bauen beide dieselbe Form aus `formatZeit(abfahrt)`,
`linie` und `formatZeit(ankunft)`. `alsFahrplanzeilen` kann alles, was `alsText`
kann, und zusätzlich mehrere Abschnitte. Ein Helfer würde genügen.

**S5 — Ein Test, zwei Anliegen.**
`src/verbindungssuche.test.ts:64–84` heisst "fährt jeden Abschnitt in der Richtung
seiner Fahrt", prüft in `:79–83` aber zusätzlich `ankunft > abfahrt` für alle
Abschnitte — eine unabhängige Zeitmonotonie-Aussage, die der Name nicht
ankündigt. Siehe auch P1: dieselbe Zeile ersetzt eine weggenommene Zusicherung.

**S6 — Ein Test ohne eigene Aussage.**
`src/verbindungssuche.test.ts:142–158` stellt dieselbe Anfrage wie `:126–140` und
prüft, dass "08:09 → 11:33" fehlt. Die Liste in `:133–139` fixiert bereits alle
fünf Verbindungen wörtlich und beweist die Abwesenheit stärker. Der zweite Test
formuliert dieselbe Aussage schwächer.

**S7 — `MAX_UMSTIEGE` / `MAX_VERBINDUNGEN`.**
`src/verbindungssuche.ts:21` und `:24`. Englisches Präfix neben dem deutschen
`STANDARD_MINDESTUMSTEIGEZEIT`; `CLAUDE.md` verlangt deutsche Domänensprache.
Schwach — aber `HOECHSTENS_…` entspräche der Sprache der ADRs.

### Eingehalten

Optionales Feld `mindestUmsteigezeit` auf der `Suchanfrage` mit Default 5
(ADR 0001); Umstieg nur bei gleicher Stations-ID (die Rekursion setzt
`abschnitt.nach` als neues `von`, `:83`); höchstens zwei Umstiege; Dominanz exakt
über (Abfahrt, Ankunft, Umstiege) mit korrektem "nirgends schlechter / irgendwo
besser" (`:102–114`); höchstens fünf Verbindungen. ADR 0002, _"die Naht bleibt
genau eine"_: alle neuen Helfer sind modul-privat, exportiert bleiben nur
`Suchanfrage` und `sucheVerbindungen`. Alle Tests laufen über `sucheVerbindungen`
gegen den echten Fahrplan, keine Mocks, kein Zugriff auf interne Helfer. Zeiten
bleiben durchgehend `Zeit` in Minuten seit Mitternacht, kein `Date`; `:201–202`
prüft 1470 und `"00:30+1"` korrekt als Folgetag. Die Glossarbegriffe aus
`CONTEXT.md` werden ohne erfundene Synonyme verwendet.

---

## Achse Spec

### Muss behoben werden

**P1 — Drei bestehende Tests geändert, erlaubt war genau einer; zwei Änderungen waren nicht erzwungen, eine schwächt die Abdeckung.**
Ticket #3: _"Der bestehende Test, der für `Luzern → Interlaken Ost` ein leeres
Resultat erwartet, wird auf das neue Verhalten umgestellt — das ist die **einzige**
erlaubte Änderung an einem bestehenden Test."_ Ticket #2 zusätzlich: _"Die
bestehenden 11 Tests laufen unverändert grün — keiner wird angepasst."_

Ticket #2 (`7888efa`) hat die Tests korrekt nicht angefasst. In `fb1299f`
(Ticket #3) wurden dagegen **drei** der fünf Bestandstests in
`src/verbindungssuche.test.ts` geändert. Lässt man die Testdatei aus `main` gegen
die Implementation von `HEAD` laufen, sind **vier von fünf grün** — nur der
Luzern-Test fällt. Die beiden übrigen Änderungen waren also nicht nötig:

- `src/verbindungssuche.test.ts:60` — `v.abschnitte[0]!.ankunft` wurde zu
  `ankunftszeit(v)`. Inhaltlich die richtigere Aussage, aber nicht erzwungen:
  `Basel SBB → Bern ab 08:00` liefert die Erst-Abschnitt-Ankünfte
  `[538, 571, 598, 631, 658]`, also monoton steigend. Die alte Zusicherung wäre
  grün geblieben.
- `src/verbindungssuche.test.ts:64–84` — umbenannt von "findet keine Verbindung,
  wenn die Fahrtrichtung nicht passt" zu "fährt jeden Abschnitt in der Richtung
  seiner Fahrt" **und abgeschwächt**: `richtung === "Luzern"` galt vorher für
  *alle* Resultate, gilt jetzt nur noch für die nach `anzahlUmstiege === 0`
  gefilterte Teilmenge (`:73–77`). `Olten → Luzern ab 08:00` liefert heute fünf
  Verbindungen, alle mit genau einem Abschnitt — die alte, stärkere Zusicherung
  wäre unverändert grün geblieben. An ihre Stelle trat eine schwächere plus eine
  themenfremde (`ankunft > abfahrt`, `:79–83`).

Das ist der einzige harte Prozessverstoss im Diff. Beide Änderungen sind
nachvollziehbar gemeint, aber die Spec hatte genau diesen Fall vorweggenommen und
ausgeschlossen.

**P2 — Fünf Plätze, drei Reisen: Zwillingsverbindungen füllen das Resultat.**
Betrifft Story 6 (_"eine kurze Ergebnisliste"_) und Story 7 (_"keine Verbindung
sehen, die von einer anderen in jeder Hinsicht geschlagen wird … so dass ich
nicht Varianten derselben Reise vergleichen muss"_), ADR 0002 Kontext
(_"das Resultat füllt sich mit Varianten derselben Reise"_).

Ausgerechnet der Kronzeugen-Fall der Spec, `Zürich HB → Brig ab 08:00`, liefert
fünf Verbindungen, die nur drei Reisen sind. Auf der Kommandozeile, die auf drei
kürzt, sieht der Reisende:

```
3h28, 1 Umstieg
  08:02 Zürich HB → 08:30 Olten  [IC 1 Richtung Genève]
  09:30 Olten → 11:30 Brig  [IC 6 Richtung Brig]

3h28, 1 Umstieg
  08:02 Zürich HB → 09:00 Bern  [IC 1 Richtung Genève]
  10:02 Bern → 11:30 Brig  [IC 6 Richtung Brig]

3h28, 1 Umstieg
  09:02 Zürich HB → 09:30 Olten  [IC 1 Richtung Genève]
  10:30 Olten → 12:30 Brig  [IC 6 Richtung Brig]
```

Vorschlag 1 und 2 sind **dieselben zwei Züge**: derselbe IC 1 ab 08:02, derselbe
IC 6 an 11:30. Unterschiedlich ist nur, wo der Umstieg verbucht wird — Olten oder
Bern. Für den Reisenden ist das ein und dieselbe Reise; er sitzt in beiden Fällen
in denselben Wagen. Von drei Vorschlägen bleibt einer.

Nach dem Buchstaben der Spec ist das korrekt: Gleichstand in allen drei Kriterien
(Abfahrt, Ankunft, Umstiege) ist keine Dominanz, `dominiert`
(`src/verbindungssuche.ts:102–114`) verwirft zu Recht nichts. Die Absicht der
Stories 6 und 7 ist trotzdem verfehlt. Das ist kein Implementationsfehler, sondern
eine Lücke in der Dominanzdefinition der Spec — sie kennt keinen Tie-Break für
identische Reisen.

Umfang: über alle 132 Stationspaare × 7 Startzeiten sind **101 von 870**
Anfragen mit Resultat betroffen (12 %). Kein Test bemerkt es: `:100` prüft nur
`verbindungen[0]`, und die goldene Liste `:126–140` verwendet `Luzern →
Interlaken Ost`, wo der Effekt zufällig nicht auftritt.

Das gehört als Befund zurück in Issue #1, nicht still im Code repariert.

**P3 — Der Mitternachts-Test prüft nicht, was das Kriterium meint.**
Ticket #3: _"Eine Verbindung, deren Ankunft nach Mitternacht liegt, wird mit ihrer
Ankunft am Folgetag geliefert; es wird nirgends modulo 24 Stunden gerechnet."_
Der Test `src/verbindungssuche.test.ts:193–203` (`Genève → Zürich HB ab 21:00`)
trifft eine **Direktverbindung** und läuft unverändert grün gegen die
Implementation auf `main` — er kann also nichts absichern, was dieses Feature neu
gebaut hat.

Das eigentliche Risiko sitzt in `src/verbindungssuche.ts:85`
(`abschnitt.ankunft + mindestUmsteigezeit`): eine Umsteigezeit über die
Tagesgrenze. Der Fahrplan gibt den Fall her — `Basel SBB → Genève ab 20:00`
liefert `21:12 IR 36 BS→OL 21:39 | 22:33 IC 1 OL→GE 00:49+1`. Genau das ist
ungetestet.

**P4 — Story 14 ist ungedeckt, und der einzige Leer-Resultat-Test wurde ersatzlos entfernt.**
Spec, Story 14: _"Als Reisender möchte ich am späten Abend ehrlich kein Resultat
bekommen."_ Kein Ticket-Kriterium, kein Test. Das Verhalten stimmt
(`Genève → Brig ab 23:00` liefert "Keine Verbindung gefunden", verifiziert), aber
der Branch hat mit dem Luzern-Test die einzige Zusicherung
`expect(verbindungen).toEqual([])` gelöscht, ohne Ersatz. Die Suite kann jetzt
nicht mehr merken, wenn die Suche nie mehr leer antwortet — und genau das wäre
die Regression, die Story 14 fürchtet.

### Echte Testlücken (Verhalten korrekt, Nachweis fehlt)

**P5 — Umstiegsstation-Kontinuität.** Ticket #3: _"Ein Umstieg zwischen zwei
verschiedenen Stationen kommt nicht vor."_ Ein Scan über alle Paare zeigt null
Lücken, das Verhalten ist also richtig. An der Naht wäre es mit einer
Kontinuitätsschleife (`abschnitte[i].nach === abschnitte[i+1].von`) billig zu
prüfen; stattdessen prüft die Schleife an `src/verbindungssuche.test.ts:79–83`
nur `ankunft > abfahrt`. Echte Lücke.

**P6 — Scheinumstieg.** Ticket #4: _"Ein Scheinumstieg … erscheint nicht im
Resultat. Dafür braucht es keine eigene Regel; die Dominanz erledigt ihn."_ Über
3973 geprüfte Verbindungen: null Scheinumstiege, die Dominanz erledigt ihn
tatsächlich. Beobachtbar ist er trotzdem — mit `mindestUmsteigezeit: 0` erzeugt
`Bern → Zürich HB ab 08:00` den Split der IC 1 in Olten. Kein Test hält es fest.
Echte Lücke, und eine, die den Kommentar der Spec belegen würde.

**P7 — Mindestumsteigezeit heruntersetzen.** Spec, Story 12. Nur das Heraufsetzen
ist getestet (`:115`). Beobachtbar: `Zürich HB → Brig` mit
`mindestUmsteigezeit: 0` liefert den Null-Minuten-Umstieg mit Ankunft 10:30.

### Kriterien, die an der Naht nicht beobachtbar sind

Zwei der sechs Kriterien von Ticket #4 haben keinen Test, und das ist **keine
Nachlässigkeit** — sie lassen sich über `sucheVerbindungen` nicht prüfen, weil
Regel 1 des Tickets genau die Fälle wegfiltert, an denen Regel 2 sichtbar würde.

**P8 — Drittes Sortierkriterium.** _"Bei gleicher Ankunft und gleich vielen
Umstiegen steht die später abfahrende Verbindung vorn."_ Wenn zwei Verbindungen in
Ankunft und Umstiegen gleich sind und verschieden abfahren, dominiert die später
abfahrende die frühere — `verwirfDominierte` läuft vor dem Sortieren, also
erreicht die frühere das Resultat nie. Allgemein beweisbar, empirisch bestätigt:
in 193 Gleichstandspaaren war die Abfahrt **immer** ebenfalls gleich.
`abfahrtszeit(b) - abfahrtszeit(a)` in `src/verbindungssuche.ts:126` entscheidet
nie über die Ausgabereihenfolge.

Die Zeile ist trotzdem tragend — allerdings an anderer Stelle als das Kriterium
behauptet: Ohne sie stünde im Vorsortieren des Filters (`:129`) die spätere
Abfahrt nicht garantiert vor der früheren, und der Ein-Durchgang-Vergleich nur
gegen die bereits behaltenen würde die dominierte Verbindung behalten. Das
Kriterium beschreibt also die Sortierung des Resultats, wirkt aber ausschliesslich
im Filter.

**P9 — Direktverbindung vor Umsteigeverbindung bei gleicher Ankunft.** Dieser Fall
verlangt eine Umsteigeverbindung, die bei gleicher Ankunft **später** abfährt als
die Direktverbindung — sonst dominiert die Direkte. Scan über alle Stationspaare
und Startzeiten: null Fälle. Im aktuellen Fahrplan nicht herstellbar.

Beide Kriterien sollten in Ticket #4 als "nicht an der Naht prüfbar" vermerkt
werden, statt als offene Häkchen stehen zu bleiben.

### Kein Scope Creep

Der Produktivcode hält sich an den Auftrag. Kein neuer Export, kein neues
öffentliches Modul, kein Out-of-Scope-Punkt angefasst: keine
bahnhofsspezifischen Umsteigezeiten, keine Fusswege, keine Fahrten des Folgetags,
keine Performance-Optimierung. Die CLI ist unverändert —
`npm run suche -- Bern "Zürich HB" 08:00` liefert dieselbe Ausgabe wie auf `main`.
Einzige nicht beauftragte Zeile ist die Zusicherung
`abschnitt.ankunft > abschnitt.abfahrt` in `src/verbindungssuche.test.ts:81`, und
sie steht dort anstelle einer weggenommenen (siehe P1).

**Zeit-Literale**: alle vier gegen `data/fahrplan.json` nachgerechnet und korrekt
(`Luzern → Interlaken Ost` 10:33 via IR 36 ab 08:09 / IC 61 ab 09:03;
`Zürich HB → Brig` 11:30; mit `mindestUmsteigezeit: 15` dann 11:33;
`Zug → Brig` 12:30 mit zwei Umstiegen). Keine Abweichung zu Spec und Tickets.

---

## Fazit

**Die Umsetzung ist inhaltlich richtig.** Der Algorithmus tut, was Spec und ADRs
beschreiben: Umstiege nur an derselben Station, Mindestumsteigezeit als
überschreibbares Feld, höchstens zwei Umstiege, Pareto-Filter vor Sortierung vor
Kürzung, eine einzige Naht. Die Zeit-Literale stimmen, die CLI ist unberührt, es
gibt keinen Scope Creep. 18 Tests grün, `npm run typecheck` sauber.

**Trotzdem ist der Branch nicht abnahmereif.** Drei Punkte gehören erledigt, bevor
er nach `main` geht:

1. **P2 zurück in Issue #1.** Der Kronzeugen-Fall der Spec,
   `Zürich HB → Brig`, zeigt dem Reisenden dreimal dieselbe Reise. Das ist die
   Lücke einer Spec-Definition, nicht ein Bug im Code, und deshalb eine
   Entscheidung, keine Korrektur. Sie sollte fallen, bevor das Feature
   ausgeliefert wird.
2. **P1 festhalten.** Zwei Bestandstests wurden ohne Not geändert, einer davon
   abgeschwächt. Nachweislich wären beide grün geblieben. Die alte, stärkere
   Richtungs-Zusicherung gehört zurück.
3. **P3, P4 und S1 schliessen.** Drei billige Tests, die heute fehlen: eine
   Umsteigeverbindung über Mitternacht, ein ehrlich leeres Resultat am späten
   Abend, und der Default von fünf Minuten. Alle drei sind an der Naht
   beobachtbar; die ersten beiden decken echte Risiken, der dritte ist von
   ADR 0001 ausdrücklich verlangt.

Alles Übrige — S2 bis S7, P5 bis P7 — ist festzuhalten, aber kein Grund, den
Branch aufzuhalten. **P8 und P9 sind keine Mängel**, sondern eine Erkenntnis über
die Spec: Zwei Akzeptanzkriterien von Ticket #4 beschreiben Verhalten, das durch
die eigene Regel 1 desselben Tickets unbeobachtbar wird. Sie gehören im Ticket
entsprechend vermerkt, nicht mit einem Test erzwungen, der die Naht verlassen
müsste.
