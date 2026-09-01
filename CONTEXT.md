# Verbindungssuche

Suche nach Zugverbindungen auf einem statischen Fahrplan eines einzelnen
Betriebstags. Die Domänensprache ist Deutsch — Typen, Funktionen, Tests und
diese Begriffe hier verwenden dieselben Wörter.

## Language

### Fahrplan

**Fahrplan**:
Die Menge aller Fahrten und Stationen eines Betriebstags, wie sie aus
`data/fahrplan.json` entsteht.
_Avoid_: Timetable, Schedule, Netz

**Betriebstag**:
Der eine Tag, dessen Fahrten der Fahrplan enthält. Es gibt keinen Folgetag —
eine Reise kann zwar über Mitternacht hinaus dauern, aber es beginnt danach
keine neue Fahrt.
_Avoid_: Service Day, Kalendertag, Tagesfahrplan

**Linie**:
Ein wiederkehrendes Fahrtmuster mit fester Haltefolge und festen Fahrzeiten,
das im Takt mehrfach am Tag verkehrt (z.B. `IC 61` Richtung Interlaken Ost).
Eine Linie ist keine Reise, sondern die Vorlage für ihre Fahrten.
_Avoid_: Route, Service, Zuglauf

**Fahrt**:
Ein konkreter Zuglauf einer Linie an einem Betriebstag, identifiziert durch
`fahrtId`, mit seiner geordneten Folge von Halten.
_Avoid_: Trip, Zug, Kurs

**Halt**:
Das Anhalten einer Fahrt an einer Station, mit Ankunft und Abfahrt. Am
Startbahnhof fehlt die Ankunft, am Endbahnhof die Abfahrt.
_Avoid_: Stop, Stopover, Haltestelle, Station (die Station ist der Ort, der
Halt ist das Ereignis)

**Station**:
Ein Bahnhof im Fahrplan, mit `id` und Name.
_Avoid_: Bahnhof (im Code), Stop, Haltestelle

### Reisen

**Verbindung**:
Eine Reisemöglichkeit von einer Station zu einer anderen, bestehend aus einem
oder mehreren aufeinanderfolgenden Abschnitten.
_Avoid_: Connection, Route, Reise, Itinerary, Journey

**Abschnitt**:
Das Teilstück einer Verbindung, das ohne Zugwechsel in einer einzigen Fahrt
zurückgelegt wird — von der Einstiegs- bis zur Ausstiegsstation.
_Avoid_: Leg, Segment, Teilstrecke, Etappe

**Direktverbindung**:
Eine Verbindung aus genau einem Abschnitt, also ohne Umstieg.
_Avoid_: Direct Connection, Direktzug, Durchgehende Verbindung

**Umstieg**:
Der Wechsel von einem Abschnitt zum nächsten an derselben Station. Die Anzahl
Umstiege einer Verbindung ist die Anzahl Abschnitte minus eins.
_Avoid_: Transfer, Umsteigen, Wechsel, Anschluss

**Umsteigezeit**:
Die Zeitspanne zwischen der Ankunft des einen Abschnitts und der Abfahrt des
nächsten, an derselben Station. Die tatsächlich anfallende Zeit einer
konkreten Verbindung.
_Avoid_: Transfer Time, Wartezeit, Anschlusszeit

**Mindestumsteigezeit**:
Die untere Schranke, die eine Umsteigezeit erreichen muss, damit ein Umstieg
als machbar gilt. Ein Parameter der Suchanfrage, kein Merkmal der Station.
_Avoid_: Minimum Transfer Time, Umsteigepuffer, Mindestwartezeit

**Suchanfrage**:
Was gesucht wird: Startstation, Zielstation, frühestmögliche Abfahrt und
optional die Mindestumsteigezeit.
_Avoid_: Query, Request, Suche

**Dominierte Verbindung**:
Eine Verbindung, zu der eine andere existiert, die nicht später abfährt, nicht
später ankommt und nicht mehr Umstiege hat — und in mindestens einem dieser
drei Kriterien echt besser ist. Dominierte Verbindungen sind für niemanden die
bessere Wahl und erscheinen nicht im Resultat.
_Avoid_: Dominated Connection, Schlechtere Verbindung, Redundante Verbindung

### Zeit

**Zeit**:
Ein Zeitpunkt als Minuten seit Mitternacht des Betriebstags. Werte ab 1440
liegen nach Mitternacht, also am Folgetag; die Zeitachse bleibt dadurch monoton
steigend.
_Avoid_: Timestamp, Uhrzeit (im Code), Date, Minuten

**Reisedauer**:
Die Spanne von der Abfahrt des ersten Abschnitts bis zur Ankunft des letzten,
in Minuten — Umsteigezeiten eingeschlossen.
_Avoid_: Duration, Fahrzeit, Fahrdauer
