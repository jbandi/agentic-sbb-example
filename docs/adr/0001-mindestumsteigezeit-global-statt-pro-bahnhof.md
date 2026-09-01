# Mindestumsteigezeit global statt pro Bahnhof

Status: accepted

## Kontext

Ohne Mindestumsteigezeit findet die Suche Umstiege, die es real nicht gibt. Der
Beleg aus `data/fahrplan.json`: Für `Zürich HB → Brig` kommt der IC 1 um 08:30
in Olten an, und der IC 6 nach Brig fährt um 08:30 in Olten ab. Umsteigezeit:
0 Minuten. Der naive Algorithmus hält diese Verbindung für die beste
überhaupt — sie steht zuoberst und ist unbrauchbar.

Real hängt die nötige Umsteigezeit vom Bahnhof ab: Olten mit seinen
Perronunterführungen braucht mehr als ein kleiner Durchgangsbahnhof; die SBB
pflegt dafür bahnhofsspezifische Werte. Der Fahrplan hier kennt aber weder
Perrons noch Wege, sondern nur Stations-IDs und Zeiten — bahnhofsspezifische
Werte müssten frei erfunden werden.

## Entscheid

Eine einzige, globale Mindestumsteigezeit von **5 Minuten**, als optionales
Feld `mindestUmsteigezeit` auf der `Suchanfrage` mit Default 5. Wer für eine
einzelne Anfrage konservativer oder aggressiver rechnen will, überschreibt sie
dort.

Bahnhofsspezifische Umsteigezeiten sind bewusst **out of scope**. Ebenso
Umstiege zwischen zwei verschiedenen Stationen: Ein Umstieg findet nur am
selben Halt statt, also bei gleicher Stations-ID. Fusswege zwischen Bahnhöfen
gibt es nicht.

## Konsequenzen

- Der 0-Minuten-Umstieg in Olten verschwindet aus dem Resultat: Für
  `Zürich HB → Brig` bleibt der IC 6 eine Stunde später.
- Umstiege in kleinen Bahnhöfen werden strenger behandelt als nötig, Olten
  eventuell zu lasch. Das nehmen wir in Kauf, solange der Fahrplan keine
  Bahnhofsdaten enthält.
- Wird das später doch gebraucht, ist die Erweiterung additiv: eine Tabelle
  pro Station, mit dem globalen Wert als Fallback. Das Feld auf der
  `Suchanfrage` bleibt dabei bestehen.
- Der Default ist Teil des beobachtbaren Verhaltens von `sucheVerbindungen`
  und wird dort getestet, nicht in einer Konstante versteckt.
