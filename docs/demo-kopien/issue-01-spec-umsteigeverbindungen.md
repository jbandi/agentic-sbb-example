# Spec: Umsteigeverbindungen in der Verbindungssuche

> **Demo-Kopie, kein Ergebnis der Skills.** `/to-spec` hat diese Spec geschrieben
> und ausschliesslich als GitHub-Issue
> [#1](https://github.com/jbandi/agentic-sbb-example/issues/1) publiziert (Label
> `ready-for-agent`), aus dem Grill auf `step-2-grill`. Die Datei hier wurde für
> den Vortrag danebengelegt — siehe [README](./README.md). Massgeblich ist das
> Issue.

---

## Problem Statement

Die Verbindungssuche findet nur Direktverbindungen. Wer eine Station erreichen will, zu der von seiner Startstation keine Fahrt durchfährt, bekommt kein Resultat — obwohl die Reise mit einem Umstieg möglich wäre.

Das ist keine Randerscheinung: Der Fahrplan hat 12 Stationen und 5 Linien, aber keine Linie verbindet alle. `Luzern → Interlaken Ost` liefert heute „Keine Verbindung gefunden", obwohl ein Umstieg in Olten die Reise in gut zweieinhalb Stunden erledigt. Für den Reisenden sieht das aus, als gäbe es keine Zugverbindung. Tatsächlich hat nur die Suche nicht nachgesehen.

## Solution

`sucheVerbindungen` findet zusätzlich Verbindungen mit einem oder zwei Umstiegen. Ein Umstieg gilt als machbar, wenn er an derselben Station stattfindet und die Umsteigezeit die Mindestumsteigezeit erreicht — voreingestellt fünf Minuten, pro Suchanfrage überschreibbar.

Damit das Resultat lesbar bleibt, verwirft die Suche dominierte Verbindungen, sortiert nach früheste Ankunft → wenigste Umstiege → späteste Abfahrt und liefert höchstens fünf Verbindungen. Direktverbindungen und Umsteigeverbindungen stehen in derselben Liste und konkurrieren nach denselben Regeln; eine Direktverbindung gewinnt bei gleicher Ankunft automatisch, weil sie weniger Umstiege hat.

Nach aussen ändert sich nichts an der Form: Dieselbe Funktion, dieselbe Rückgabe, ein zusätzliches optionales Feld auf der Suchanfrage.

## User Stories

1. Als Reisender möchte ich eine Verbindung mit Umstieg vorgeschlagen bekommen, so dass ich auch Ziele erreiche, zu denen keine Fahrt durchfährt.
2. Als Reisender möchte ich, dass jeder vorgeschlagene Umstieg tatsächlich machbar ist, so dass ich meinen Anschlusszug nicht verpasse.
3. Als Reisender möchte ich, dass ein Umstieg an derselben Station stattfindet, so dass ich nicht unbemerkt zu Fuss durch eine fremde Stadt geschickt werde.
4. Als Reisender möchte ich zu jedem Abschnitt Linie, Einstiegsstation, Abfahrt, Ausstiegsstation und Ankunft sehen, so dass ich der Verbindung ohne Rückfragen folgen kann.
5. Als Reisender möchte ich höchstens zwei Umstiege vorgeschlagen bekommen, so dass ein Reisevorschlag ein Reisevorschlag bleibt und keine Zumutung wird.
6. Als Reisender möchte ich eine kurze Ergebnisliste, so dass ich die Auswahl auf einen Blick erfassen kann.
7. Als Reisender möchte ich keine Verbindung sehen, die von einer anderen in jeder Hinsicht geschlagen wird, so dass ich nicht Varianten derselben Reise vergleichen muss.
8. Als Reisender möchte ich die am frühesten ankommende Verbindung zuoberst, so dass die für mich wichtigste Information ganz oben steht.
9. Als Reisender möchte ich bei gleicher Ankunft die Verbindung mit weniger Umstiegen zuoberst, so dass ich bei gleichem Ergebnis die bequemere Reise zuerst sehe.
10. Als Reisender möchte ich bei gleicher Ankunft und gleich vielen Umstiegen die später abfahrende Verbindung zuoberst, so dass ich länger schlafen kann, ohne später anzukommen.
11. Als vorsichtiger Reisender möchte ich die Mindestumsteigezeit für meine Anfrage heraufsetzen können, so dass ich mit Gepäck und Kind nicht durch den Bahnhof hetzen muss.
12. Als geübter Reisender möchte ich die Mindestumsteigezeit heruntersetzen können, so dass mir knappe, aber machbare Anschlüsse nicht vorenthalten werden.
13. Als Reisender möchte ich eine Reise, die über Mitternacht hinaus dauert, korrekt mit ihrer Ankunft am Folgetag angezeigt bekommen, so dass ich die Ankunftszeit nicht falsch lese.
14. Als Reisender möchte ich am späten Abend ehrlich kein Resultat bekommen, statt einer Verbindung, die es am nächsten Tag gäbe, so dass ich nicht auf einen Zug warte, der heute nicht mehr fährt.
15. Als Reisender möchte ich, dass die Direktverbindungen, die ich bisher gefunden habe, unverändert gefunden werden, so dass das neue Feature mir nichts wegnimmt.
16. Als Reisender möchte ich weiterhin die Ausgabe auf der Kommandozeile in gewohnter Form sehen, so dass ich mich nicht umgewöhnen muss.
17. Als Entwickler möchte ich, dass die Suche eine einzige öffentliche Schnittstelle behält, so dass die Tests Verhalten prüfen und nicht Zwischenschritte.
18. Als Entwickler möchte ich, dass die Mindestumsteigezeit einen Standardwert hat, so dass bestehende Aufrufer unverändert weiterlaufen.
19. Als Entwickler möchte ich, dass das Ergebnis klein und stabil genug ist, um es in einem Test wörtlich hinzuschreiben, so dass die Tests lesbar bleiben.

## Implementation Decisions

- **Die Naht bleibt genau eine.** `sucheVerbindungen(fahrplan, anfrage)` behält Signatur und Rückgabetyp. Alles, was für die Umsteigesuche neu entsteht, ist eine interne Hilfsfunktion ohne Export. Es entsteht kein neues öffentliches Modul.
- **Die `Suchanfrage` erhält ein optionales Feld `mindestUmsteigezeit`** in Minuten, mit Standardwert 5. Bestehende Aufrufer bleiben unverändert gültig.
- **Ein Umstieg ist zulässig**, wenn die Ausstiegsstation des einen Abschnitts und die Einstiegsstation des nächsten dieselbe Station sind (Vergleich über die Stations-ID) und die Umsteigezeit mindestens der Mindestumsteigezeit entspricht.
- **Höchstens 2 Umstiege**, also höchstens 3 Abschnitte pro Verbindung. Siehe ADR 0002.
- **Direktverbindungen und Umsteigeverbindungen entstehen im selben Durchgang** und landen in derselben Ergebnisliste. Es gibt keinen Sonderpfad für Direktverbindungen, damit Filter und Sortierung beide Arten nach denselben Regeln bewerten.
- **Die Nachbearbeitung des Resultats hat eine feste Reihenfolge**: zuerst dominierte Verbindungen verwerfen, dann sortieren, dann auf 5 kürzen. Die Reihenfolge ist bedeutsam — wer zuerst kürzt, wirft womöglich die Verbindung weg, die eine andere dominiert hätte.
- **Dominanz** ist definiert über die drei Kriterien Abfahrt, Ankunft und Anzahl Umstiege: Eine Verbindung wird verworfen, wenn eine andere existiert, die in keinem der drei schlechter und in mindestens einem echt besser ist.
- **Sortierung**: früheste Ankunft, dann wenigste Umstiege, dann späteste Abfahrt.
- **`Zeit` bleibt Minuten seit Mitternacht** des Betriebstags. Werte ab 1440 sind gültig und bezeichnen den Folgetag; es wird nirgends modulo gerechnet, damit die Zeitachse monoton bleibt und Umsteigezeiten über Mitternacht korrekt herauskommen.
- **Ein Betriebstag.** Die Suche betrachtet ausschliesslich die Fahrten des geladenen Fahrplans. Es gibt keine Fahrten des Folgetags; späte Anfragen liefern entsprechend weniger oder gar nichts.
- **Die Kommandozeilen-Ausgabe bleibt unverändert.** Sie stellt mehrere Abschnitte bereits korrekt dar und schneidet weiterhin auf drei Verbindungen.
- **Scheinumstiege brauchen keine Sonderregel.** Eine Verbindung, die dieselbe Fahrt an einer Zwischenstation künstlich in zwei Abschnitte teilt, hat dieselbe Abfahrt und Ankunft wie die Direktverbindung, aber einen Umstieg mehr — sie wird vom Dominanzfilter verworfen.

## Testing Decisions

- **Ein guter Test prüft hier beobachtbares Verhalten**: Welche Verbindungen kommen für eine Suchanfrage heraus, in welcher Reihenfolge, mit welchen Zeiten. Kein Test greift auf interne Hilfsfunktionen zu, kein Test prüft, wie der Suchraum durchlaufen wird. Die Implementierung darf sich vollständig ändern, ohne dass ein Test bricht.
- **Getestet wird ausschliesslich an `sucheVerbindungen`.** Das ist die einzige Naht und die höchstmögliche: Sie ist die Schnittstelle, die auch die Kommandozeile benutzt.
- **Getestet wird gegen den echten Fahrplan**, nicht gegen Mocks oder Testdaten. Prior Art sind die bestehenden Tests der Verbindungssuche, die genau so gebaut sind: Fahrplan laden, Suchanfrage stellen, Abfahrts- und Ankunftszeiten als Literale prüfen.
- **Erwartete Werte kommen als bekannte Literale in den Test** (abgelesen aus dem Fahrplan), nie aus einer Rechnung, die der Produktivcode ebenso anstellt.
- Abzudeckende Fälle:
  - Eine Verbindung mit einem Umstieg wird gefunden, wo es keine Direktverbindung gibt (`Luzern → Interlaken Ost`).
  - Ein Umstieg, dessen Umsteigezeit unter der Mindestumsteigezeit liegt, wird nicht vorgeschlagen (`Zürich HB → Brig`, siehe Further Notes).
  - Eine heraufgesetzte Mindestumsteigezeit verschiebt das Resultat auf einen späteren Anschluss.
  - Die bisher gefundenen Direktverbindungen werden unverändert gefunden und stehen bei gleicher Ankunft vor Umsteigeverbindungen.
  - Das Resultat enthält höchstens fünf Verbindungen.
  - Die Sortierreihenfolge stimmt, inklusive des Kriteriums „spätere Abfahrt gewinnt".
  - Dominierte Verbindungen erscheinen nicht im Resultat.
  - Eine Verbindung mit zwei Umstiegen wird gefunden, wo ein Umstieg nicht genügt.
  - Eine Reise über Mitternacht wird mit korrekter Ankunft am Folgetag geliefert.
- Die bestehenden 11 Tests bleiben unverändert gültig. Ein Test muss angepasst werden: Er hält heute fest, dass `Luzern → Interlaken Ost` **kein** Resultat liefert — genau das Verhalten, das dieses Feature aufhebt.

## Out of Scope

- **Bahnhofsspezifische Mindestumsteigezeiten.** Real braucht Olten mehr Zeit als ein kleiner Durchgangsbahnhof, aber der Fahrplan kennt weder Perrons noch Wege. Bewusst verworfen, siehe ADR 0001.
- **Fusswege zwischen zwei Bahnhöfen.** Ein Umstieg findet an genau einer Station statt.
- **Mehr als zwei Umstiege.** Siehe ADR 0002.
- **Fahrten des Folgetags.** Der Fahrplan beschreibt einen Betriebstag.
- **Änderungen an der Kommandozeilen-Ausgabe**, inklusive einer expliziten Anzeige der Umsteigezeit.
- **Echtzeitdaten**: Verspätungen, Anschlusssicherung, Auslastung, Preise, Barrierefreiheit.
- **Performance-Optimierung.** Der Fahrplan hat 164 Fahrten; eine direkte Suche genügt.

## Further Notes

Der Testfall, an dem sich zeigt, ob die Mindestumsteigezeit wirklich umgesetzt ist: `Zürich HB → Brig` ab 08:00. Es gibt keine Direktverbindung. Eine Umsteigesuche ohne Mindestumsteigezeit findet den Umstieg in Olten, weil der IC 1 dort um 08:30 ankommt und der IC 6 nach Brig um 08:30 abfährt — null Minuten Umsteigezeit. Diese Verbindung hat die früheste Ankunft und stünde damit zuoberst. Mit der Mindestumsteigezeit von fünf Minuten fällt sie heraus und die Suche liefert den nächsten IC 6.

Der Gegenfall, der funktionieren muss: `Luzern → Interlaken Ost` ab 08:00 mit Umstieg in Olten. Die Umsteigezeit beträgt dort elf Minuten — knapp, aber über der Schranke.

Beide Fälle stammen aus dem Grill und sind in den ADRs belegt. Sie eignen sich als Abnahmekriterien für das Feature als Ganzes.
