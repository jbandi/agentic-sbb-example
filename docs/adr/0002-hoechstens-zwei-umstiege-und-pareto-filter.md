# Höchstens zwei Umstiege und Pareto-Filter auf dem Resultat

Status: accepted

## Kontext

Der Fahrplan hat 12 Stationen, 5 Linien und 164 Fahrten im Stundentakt. Sucht
man ohne Schranke, wächst der Suchraum mit jeder erlaubten Umstiegsstufe, und
das Resultat füllt sich mit Varianten derselben Reise: dieselbe Ankunft, nur
eine Stunde früher losgefahren, oder ein zusätzlicher Umstieg ohne jeden
Gewinn. Wer `Luzern → Interlaken Ost` sucht, will nicht vierzig Zeilen lesen.

Zwei Regelungen sind dafür nötig, und sie hängen zusammen: eine harte Schranke
gegen den Suchraum, ein Qualitätsfilter gegen die Redundanz.

## Entscheid

**Höchstens 2 Umstiege**, also maximal 3 Abschnitte pro Verbindung. In einem
Netz dieser Grösse ist alles darüber unrealistisch.

**Dominierte Verbindungen werden verworfen.** Eine Verbindung fliegt raus, wenn
eine andere existiert, die nicht später abfährt, nicht später ankommt und nicht
mehr Umstiege hat — und in mindestens einem der drei Kriterien echt besser ist.
Übrig bleibt die Pareto-Front über (Abfahrt, Ankunft, Umstiege).

**Sortierung**: primär früheste Ankunft, dann wenigste Umstiege, dann späteste
Abfahrt. Wer bei gleicher Ankunft und gleich vielen Umstiegen später losfahren
kann, gewinnt.

**Höchstens 5 Verbindungen** im Resultat, nach dieser Sortierung.

## Konsequenzen

- Das Ergebnis ist stabil und kurz genug, um es in einem Test wörtlich
  hinzuschreiben.
- Eine Reise mit drei Umstiegen wird nicht gefunden, auch wenn sie theoretisch
  existiert. Im aktuellen Fahrplan ist kein Ziel darauf angewiesen.
- Der Pareto-Filter verwirft nie die beste Option für einen Reisenden, aber er
  verwirft Verbindungen, die eine reine Ankunftszeit-Sortierung noch gezeigt
  hätte. Wer alle Varianten sehen will, ist hier falsch.
- Beide Regeln sind Verhalten von `sucheVerbindungen` und werden dort getestet,
  gegen den echten `data/fahrplan.json`. Es entsteht kein neues öffentliches
  Modul und keine zusätzliche exportierte API — die Naht bleibt genau eine.
