# Prompt: neues Demo-Repo one-shot aufsetzen

Diesen Prompt in einer **frischen Claude-Code-Session** in ein beliebiges
Verzeichnis einfügen. Er legt ein neues, sofort vorführbares Demo-Repo an — die
Ausgangs-App plus die vollständige Skills-Konfiguration, aber ohne jede Spur des
Flows, den du live zeigen willst.

Danach beginnt die Demo direkt mit `/grill-with-docs`.

> **Warum nicht `/setup-matt-pocock-skills`?** Der Skill trägt
> `disable-model-invocation: true` und lässt sich ausschliesslich starten, indem
> ein Mensch den Slash-Command tippt. Ein Agent, der ihn aufrufen soll, wird
> blockiert und ausdrücklich angewiesen, den Workflow auch nicht nachzubauen.
> Ein One-Shot-Prompt kann ihn also nicht verwenden. Stattdessen kopiert dieser
> Prompt die fertige, erprobte Konfiguration aus dem Referenz-Repo — das ist
> auch schneller, weil das Interview des Skills entfällt und das Ergebnis
> bit-genau dem entspricht, was hier schon einmal funktioniert hat.

---

## Der Prompt

```
Setze ein neues Demo-Repo für meinen Vortrag über den agentischen
Entwicklungs-Workflow auf. Arbeite eigenständig durch, ohne Zwischenfragen —
mit einer einzigen Ausnahme, siehe Schritt 1.

## 1. Frag mich nach dem Repo-Namen

Stell mir genau eine Frage: wie das neue Repo heissen soll. Leite alles Übrige
daraus ab und nenne mir die abgeleiteten Werte, wenn du fertig bist:

- GitHub-Owner: `jbandi`
- Sichtbarkeit: public
- Lokales Verzeichnis: `~/Dev/<repo-name>`

Bricht etwas davon (Verzeichnis existiert schon, Repo-Name vergeben), sag es
mir und schlag eine Alternative vor, statt zu raten.

## 2. Prüf zuerst das GitHub-Konto

`gh auth status`. Ist `jbandi` nicht das aktive Konto, stell jedem `gh`-Aufruf
`export GH_TOKEN=$(gh auth token -u jbandi)` voran. Das ist wichtig: sonst
landen die Issues später still im falschen Repo.

## 3. Ausgangsstand holen

Klon den Branch `step-1-setup-skills` aus dem Referenz-Repo:

    git clone --branch step-1-setup-skills --single-branch --depth 1 \
      git@github.com:jbandi/agentic-sbb-example.git ~/Dev/<repo-name>

Dieser Branch enthält die Ausgangs-App plus die Skills-Konfiguration unter
`docs/agents/`. Lösch danach `.git` und leg eine frische Historie an — das neue
Repo soll keine Vorgeschichte haben.

**Kritisch:** `CONTEXT.md`, `docs/adr/`, `docs/demo-kopien/`, `docs/reviews/` und
`DEMO.md` dürfen NICHT vorhanden sein. Das sind die Ergebnisse der
Schritte, die ich live vorführe. Liegen sie schon da, liest der Agent sie beim
Explorieren und stellt die Fragen im Grill gar nicht mehr — die Demo fällt in
sich zusammen. Auf `step-1-setup-skills` fehlen sie korrekterweise; prüf es
trotzdem und lösch sie, falls doch etwas mitgekommen ist.

`DEMO.md` liegt dort und muss weg: Die Anleitung nennt die Mindestumsteigezeit,
die ADRs und die Tickets — ein Agent, der sie beim Explorieren liest, kennt die
Antworten des Grills bereits. Nach dem Vortrag lässt sie sich jederzeit aus dem
Referenz-Repo nachziehen.

## 4. Repo-Namen in der Konfiguration umbiegen

Der alte Slug `jbandi/agentic-sbb-example` steht an genau zwei Stellen. Ersetz
ihn dort durch den neuen:

- `AGENTS.md`, im Abschnitt `## Agent skills` → `### Issue tracker` (`CLAUDE.md`
  importiert diese Datei nur und enthält den Slug nicht)
- `docs/agents/issue-tracker.md`, erste Zeile unter der Überschrift

Grep danach noch einmal über das ganze Repo, um sicherzugehen, dass keine
Fundstelle übrig ist. Bleibt eine stehen, schreiben die Skills später Issues
ins alte Repo.

## 5. GitHub-Repo anlegen und pushen

Erster Commit mit der Nachricht "Ausgangslage: Verbindungssuche fuer
Direktverbindungen", Branch `main`. Dann `gh repo create` mit einer knappen
deutschen Beschreibung, Remote setzen, pushen.

## 6. Die Triage-Labels anlegen

Die liegen nicht in Dateien, sondern auf GitHub — ohne sie scheitert `/to-spec`
später beim Label `ready-for-agent`:

    needs-triage     d4c5f9  Neu eingegangen, noch nicht triagiert
    needs-info       fbca04  Rueckfrage offen: Beschreibung reicht dem Agenten nicht
    ready-for-agent  0e8a16  Klar genug spezifiziert, ein Agent kann uebernehmen
    ready-for-human  1d76db  Braucht menschliches Urteil oder eine Produktentscheidung

`wontfix` existiert bei GitHub schon; pass nur die Beschreibung an
("Wird bewusst nicht umgesetzt") oder lass es, falls das fehlschlägt.

## 7. Verifizieren, bevor du fertig meldest

Alles davon muss stimmen, sonst melde es als Problem statt als Erfolg:

- `npm install`, dann `npm test` → 11 Tests grün
- `npm run typecheck` → keine Fehler
- `npm run suche -- Bern "Zürich HB" 08:00` → findet die Direktverbindung
- `npm run suche -- Luzern "Interlaken Ost" 08:00` → "Keine Verbindung
  gefunden." Das ist der Aufhänger der Demo; liefert der Aufruf etwas anderes,
  ist der falsche Branch gelandet.
- `gh label list` → die fünf Labels sind da
- `gh issue list` → leer

## 8. Nicht tun

Führ den Flow NICHT aus. Kein Grill, keine Spec, keine Tickets, keine
Implementierung. Das Repo soll exakt auf der Ausgangslage stehen. Ruf auch
`/setup-matt-pocock-skills` nicht auf — die Konfiguration ist bereits kopiert,
und der Skill ist für Agenten ohnehin gesperrt.

## 9. Abschlussbericht

Nenn mir: Repo-URL, lokales Verzeichnis, Ergebnis der sechs Prüfungen aus
Schritt 7, und als letzte Zeile den Befehl, mit dem ich die Demo starte:

    /grill-with-docs Die Verbindungssuche soll auch Verbindungen mit Umstieg finden.
```

---

## Danach

Der erste Schritt der Live-Demo ist der Grill. Die Ausgangslage zeigst du in
einer Minute mit `npm test` und dem Aufruf `Luzern → Interlaken Ost`, der nichts
findet.

Alles Weitere — Regieplan, Beweis-Moment, die Befunde des Reviews — steht in
[DEMO.md](./DEMO.md).

**Vier Skills bleiben Handarbeit.** `setup-matt-pocock-skills`, `to-spec`,
`to-tickets` und `implement` starten nur, wenn du den Slash-Command selbst
tippst, mit führendem `/`. Text, der bloss mit `to-spec` beginnt, zählt nicht.
Für die Bühne ist das ein Vorteil: Der Mensch bleibt der Auslöser jedes
Schritts.
