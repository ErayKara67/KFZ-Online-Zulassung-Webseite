# Kfz-Portal24 – Online-Zulassungsservice

Next.js-Anwendung für Wunschkennzeichen-Reservierung und Online-Kfz-Zulassung.
Funktional an vergleichbaren Portalen orientiert, aber mit eigenständigem,
hellem und amtlich-seriösem Design.

**Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · Zod ·
Stripe · Nodemailer

---

## 1. Schnellstart

```bash
npm install
cp .env.example .env.local     # Werte eintragen (optional, siehe unten)
npm run dev                    # http://localhost:3000
```

Produktion:

```bash
npm run build
npm run start
```

Ohne Stripe-Schlüssel und ohne SMTP-Zugang läuft alles im **Demo-Modus**:
Bestellungen werden vollständig gespeichert, E-Mails landen in der
Serverkonsole, die Zahlung springt direkt auf die Erfolgsseite.

---

## 2. Was die Seite kann

| Bereich | Umsetzung |
|---|---|
| **Sofortzulassung (i-Kfz Stufe 4)** | Eigener Bestellweg mit Vorprüfung, Sicherheitscodes, elektronischer Identifizierung, Express-Schilderlogistik, automatisiertem Bescheid und vorläufigem Zulassungsnachweis |
| **Auftragsverfolgung** | Statusseite mit Zugriffscode, Zeitstrahl, Countdown für Abruffenster und Zehn-Tage-Frist, PDF-Download |
| Kennzeichenprüfung | Formatvalidierung nach FZV, bundesland-abhängige Sperren, Kennzeichen-Vorschau; Verfügbarkeit nur mit angebundener Schnittstelle (siehe Abschnitt 4) |
| Leistungen | Wunschkennzeichen, Zulassung, Ummeldung, Abmeldung, Adressänderung, Umweltplakette – je mit eigener Landingpage |
| Bestellprozess | Mehrstufiger Assistent: Leistung → Fahrzeug → Halter/Versicherung/SEPA → Unterlagen & Vollmacht → Prüfen & zahlen |
| Validierung | FIN (17 Zeichen), eVB (7 Zeichen), IBAN, PLZ, Pflichtfelder – client- und serverseitig mit denselben Zod-Schemata |
| Uploads | Ausweis und Fahrzeugpapiere als JPG/PNG/HEIC/PDF, max. 10 MB je Datei |
| Zahlung | Stripe Checkout (Karte, PayPal, Klarna, SEPA-Lastschrift, Apple/Google Pay) inkl. Webhook |
| E-Mail | Auftragsbestätigung an den Kunden, Benachrichtigung mit Anhängen an das Team, Kontaktformular |
| Inhalte | Ablauf, Preise, Vorteile, Erklärtexte, FAQ mit FAQ-Schema, Zulassungsstellen-Suche, Ratgeber |
| Recht | Impressum, Datenschutz, AGB, Widerruf, Barrierefreiheit (als strukturierte Platzhalter) |
| Technik | Sitemap, robots.txt, Security-Header, JSON-LD, Tastaturbedienung, Skip-Link, Fokus-Styling |

---

## 3. Vor dem Livegang unbedingt anpassen

### 3.1 Stammdaten
`src/lib/site.ts` enthält **alle** Firmen-, Kontakt- und Versandangaben als
Platzhalter. Nur diese Datei anpassen – Header, Footer und Rechtstexte ziehen
sich die Werte von dort.

### 3.2 Vertrauenssignale
In `site.ts` stehen `trust.certification` und `trust.reviews` bewusst auf
`enabled: false`. Zertifikatsnummern (z. B. DIN 74069) und Bewertungsangaben
dürfen erst eingeblendet werden, wenn sie tatsächlich vorliegen – sonst ist das
eine abmahnfähige Irreführung nach UWG.

### 3.3 Rechtstexte
Impressum, Datenschutzerklärung, AGB, Widerrufsbelehrung und die Erklärung zur
Barrierefreiheit sind fachlich vorstrukturiert, aber **Platzhalter**. Alle mit
`[ ]` markierten Stellen ausfüllen und die Fassung anwaltlich prüfen lassen.
Den Betreiber-Hinweiskasten anschließend abschalten: in den jeweiligen Seiten
`notice={false}` an `<LegalPage>` übergeben.

### 3.4 Preise
`src/lib/services.ts` – Preise, Leistungsbeschreibungen und Bearbeitungszeiten.
Die aktuell hinterlegten Werte sind Orientierungswerte und müssen durch Ihre
eigene Kalkulation ersetzt werden.

---

## 3.5 Sofortzulassung: was fachlich gilt

Die Sofortzulassung beruht auf der internetbasierten Fahrzeugzulassung
(i-Kfz) nach der Fahrzeug-Zulassungsverordnung. Drei Punkte bestimmen den
gesamten Ablauf und sind im Code entsprechend abgebildet:

**Ohne montierte Schilder gilt die Fahrberechtigung nicht.** § 31 FZV erlaubt
das Fahren ohne Stempelplaketten für höchstens **vierzehn Tage**, gerechnet ab
dem Abruf der automatisierten Entscheidung – nicht ab Bestellung. Voraussetzung
sind angebrachte Kennzeichenschilder, der von außen gut lesbar im Fahrzeug
ausgelegte vorläufige Zulassungsnachweis (§ 32 FZV) und der mitgeführte
Ausdruck der Entscheidung.

> **Frist geändert:** Bis Ende 2025 galten zehn Tage. Quellen aus 2023 – auch
> Behörden-Leitfäden – nennen weiterhin die alte Frist. Maßgeblich ist § 31 FZV
> in der aktuellen Fassung. Deshalb liefert die Anwendung die Schilder **vor** dem
Zulassungsantrag und gibt den Antrag erst frei, wenn die Zustellung bestätigt
ist (`src/lib/order-flow.ts`, `antragEinreichen`).

**Der Bescheid hat ein kurzes Abruffenster.** Voreingestellt sind 30 Minuten
(`IKFZ_ABRUFFENSTER_MINUTEN`). Diese Frist steht nicht in der FZV, sondern ist
eine technische Vorgabe des jeweiligen Portals – beim Zulassungspartner
erfragen und anpassen. Die Auftragsverfolgung zeigt den Countdown, die
Bestätigungsmail enthält den direkten Link.

**Papiere und Plaketten kommen per Post.** Zulassungsbescheinigung und
Plakettenträger versendet die Behörde. Nach Erhalt sind die Plaketten
unverzüglich anzubringen; danach ist der vorläufige Nachweis zu vernichten.
Nach Ablauf der zehn Tage darf ohne Plaketten nicht mehr gefahren werden.

Ausschlussgründe prüft `src/lib/ikfz/eligibility.ts`: Fahrzeugpapiere ohne
Sicherheitscode (Teil I vor dem 01.01.2015, Teil II vor dem 01.01.2018),
Sonderkennzeichen wie Kurzzeit-, Ausfuhr- und rote Kennzeichen, fehlende oder
abgelaufene Hauptuntersuchung, fehlende eVB-Nummer oder fehlendes SEPA-Mandat.
Die Prüfung läuft im Formular live mit und noch einmal serverseitig.

---

## 3.6 i-Kfz anbinden

Die Anwendung programmiert gegen ein Adapter-Interface (`IkfzProvider` in
`src/lib/ikfz/types.ts`). Der aktive Adapter wird über `IKFZ_PROVIDER`
gewählt – Frontend und Bestellprozess bleiben in allen Varianten gleich.

### `sandbox` (Voreinstellung)

Bildet den kompletten fachlichen Ablauf ab, spricht aber mit keiner Behörde.
Prüfregeln, Abruffenster und Fristen verhalten sich wie im Echtbetrieb. Auf der
Auftragsverfolgung erscheint eine Sandbox-Steuerung, mit der sich Ereignisse des
Versanddienstleisters auslösen lassen – gut für Demos und Abnahmen.

Die erzeugten PDF sind **deutlich als Muster gekennzeichnet** und berechtigen
nicht zur Teilnahme am Straßenverkehr. Im Echtbetrieb werden ausschließlich die
von der Behörde gelieferten Dokumente durchgereicht; `nachweis-pdf.ts` wird dann
nicht mehr aufgerufen.

### `gks` – eigene Großkundenschnittstelle

Voraussetzungen laut Kraftfahrt-Bundesamt:

- juristische Person mit **mehr als 500 Zulassungsvorgängen pro Jahr**
- Registrierung beim KBA, einmalige Gebühr **3.220 €**
- freigegebene, zertifizierte Software (XFZ-Nachrichten über OSCI-Transport)
- IT-Sicherheitskonzept nach BSI-Standard, Protokollierung der Zugriffe
- ELSTER-Unternehmenskonto
- digital abgebildete Vollmacht der Kundin bzw. des Kunden

Als „Dienstleister“ registrierte Teilnehmer dürfen auf Dritte zulassen –
das ist die Rolle, die dieses Portal braucht. `src/lib/ikfz/gks-provider.ts`
enthält das Gerüst mit den Umsetzungsschritten.

### `partner` – über einen bestehenden GKS-Teilnehmer  ← **gewählter Weg**

Der Partner ist bereits GKS-Teilnehmer und tritt mit der Vollmacht Ihrer
Kundinnen und Kunden gegenüber der Behörde auf. Kein eigenes Mindestvolumen,
keine KBA-Registrierung, keine zertifizierte Software – dafür Abhängigkeit vom
Partner und eine Marge je Vorgang.

**Was der Adapter bereits mitbringt** (`src/lib/ikfz/partner-provider.ts`):

- Wiederholung mit wachsender Wartezeit bei Zeitüberschreitung und HTTP 5xx,
  keine Wiederholung bei fachlicher Ablehnung
- Idempotenz-Schlüssel je Auftrag – eine Wiederholung erzeugt nie eine zweite
  Zulassung
- Fehlertrennung in fachlich, technisch und Konfiguration; die Oberfläche zeigt
  jede Art unterschiedlich an, ein technischer Ausfall verbrennt den Auftrag nicht
- Dokumentenabruf über den eigenen Server, damit Partner-URL und Token nie beim
  Kunden landen
- asynchroner Rückruf unter `POST /api/ikfz/callback`, HMAC-SHA256-signiert
  (`IKFZ_PARTNER_WEBHOOK_SECRET`) – für Entscheidungen, die erst später kommen
- Vollmachtsnachweis mit Textversion, Text-Hash, Unterschrift, Zeitpunkt,
  IP und User-Agent (`src/lib/ikfz/vollmacht.ts`)

**Was Sie beim Partner anfordern müssen**, bevor es losgeht:

1. Schnittstellenbeschreibung mit vollständiger Feldliste und Testumgebung
2. Format des Vollmachtsnachweises – manche Partner verlangen eine
   qualifizierte elektronische Signatur (QES). Dann wird der Signaturdienst im
   Schritt „Vollmacht“ eingehängt und die Referenz in `qesReferenz` abgelegt.
3. Welche Vorgänge abgedeckt sind (Neuzulassung, Tageszulassung, Umschreibung,
   Wiederzulassung, Abmeldung, Adressänderung) und welche Kennzeichenarten
4. Ob der vorläufige Zulassungsnachweis als PDF geliefert wird und wie lange er
   abrufbar bleibt
5. Preis je Vorgang, Abrechnung der amtlichen Gebühren (Durchreichung ohne
   Aufschlag ist üblich), Mindestumsatz, Kündigungsfrist
6. Haftung und Verantwortlichkeiten bei fehlerhaften Zulassungen
7. Auftragsverarbeitungsvertrag nach Art. 28 DSGVO – es fließen Ausweis-,
   Fahrzeug- und Kontodaten

**Anbindung in vier Schritten:**

```bash
# 1. Zugangsdaten eintragen
IKFZ_PROVIDER="partner"
IKFZ_PARTNER_URL="https://api.ihr-partner.de/v1"
IKFZ_PARTNER_TOKEN="..."
IKFZ_PARTNER_WEBHOOK_SECRET="..."
```

2. Feldnamen in `src/lib/ikfz/partner-mapping.ts` an das Schema des Partners
   anpassen – **nur diese Datei**, der Rest der Anwendung bleibt unverändert.
   Dort liegen auch die Statuszuordnungen (`statusZuordnung`).
3. Rückruf-Endpunkt beim Partner hinterlegen:
   `https://IHRE-DOMAIN/api/ikfz/callback`
4. In der Testumgebung des Partners einen kompletten Vorgang durchspielen,
   danach `IKFZ_PROVIDER` produktiv schalten.

Zum Entwickeln bleibt `sandbox` sinnvoll: gleicher Ablauf, keine Kosten je
Testvorgang.

**Gewählter Partner: Zulio.** Kostenlose GKS-Nummer, QES enthalten, keine
Grundgebühr und keine Mindestabnahme – die passende Struktur für einen Start
ohne Volumen. Konditionen laut Anbieterangaben: 13,90 € je Vorgang plus 3,90 €
je qualifizierter Signatur; mit eigener GKS-Nummer später 9,90 € + 3,90 €.

Was nach Erhalt der Schnittstellenbeschreibung zu tun ist:

1. Feldnamen und Statuswerte in `src/lib/ikfz/partner-mapping.ts` anpassen.
   Das ist die einzige Datei, die das Partnerschema kennt.
2. `SIGNATURE_PROVIDER="partner"` setzen – Zulio bringt die QES mit, ein
   separater Vertrauensdiensteanbieter ist dann überflüssig. Endpunktnamen in
   `src/lib/signature/index.ts` (Abschnitt „Partner") prüfen.
3. Klären, ob es einen eigenen Endpunkt für die Wunschkennzeichen-Verfügbarkeit
   gibt, und ihn über `PLATE_CHECK_URL` anbinden.
4. Rückruf-Endpunkt `/api/ikfz/callback` hinterlegen und das gemeinsame
   Geheimnis eintragen.
5. Einkaufspreise in `src/lib/costs.ts` gegen den Vertrag abgleichen.

**Offen bei Zulio:** Ob Schilderprägung und Expressversand abgedeckt sind, ist
nicht dokumentiert – notfalls separater Prägepartner. Und das Zulio-Glossar
nennt für den vorläufigen Zulassungsbescheid zehn Tage statt der vierzehn aus
§ 31 FZV; welchen Wert die API liefert, muss vor dem Livegang geklärt sein.
Die Anwendung prüft das inzwischen selbst (siehe unten).

**Alternative:** digital-zulassen.de – deckt zusätzlich Schilder und
Feinstaubplakette ab, rechnet aber über eine monatliche Softwarepauschale ab.

### Vollmacht: qualifizierte Signatur ist Pflicht

§ 38 FZV verlangt für Vollmachten, die über die Großkundenschnittstelle laufen:

- **natürliche Personen:** qualifizierte elektronische Signatur (QES)
- **juristische Personen:** qualifiziertes elektronisches Siegel – oder die QES
  einer vertretungsberechtigten Person, deren Vertretungsberechtigung ein
  qualifizierter Vertrauensdiensteanbieter geprüft hat

Ein Bestätigungshaken, eine getippte oder eine mit der Maus gemalte Unterschrift
erfüllen das **nicht**. Die Anwendung erfasst deshalb im Bestellprozess nur die
Vollmachtserteilung und holt die Signatur anschließend über einen QTSP ein
(`src/lib/signature/`, Auswahl über `SIGNATURE_PROVIDER`).

Zwei Sperren sind im Ablauf eingebaut: Ohne Signatur im Status `signiert` geht
kein Antrag raus, und eine im Testbetrieb erzeugte Signatur wird abgelehnt,
sobald der i-Kfz-Adapter produktiv läuft. Damit kann keine rechtlich wertlose
Vollmacht in einen echten Behördenvorgang geraten.

### Eingebaute Kontrolle der Fahrfrist

`pruefeFahrfrist` in `src/lib/ikfz/eligibility.ts` vergleicht die vom Partner
gelieferte Gültigkeitsdauer mit den vierzehn Tagen aus § 31 FZV. Weicht sie ab,
landet eine Warnung im Log und eine E-Mail im Postfach aus
`ORDER_NOTIFY_EMAIL` – der Auftrag läuft weiter, aber die Abweichung fällt
sofort auf. Hintergrund: Das Portal zeigt den gelieferten Wert als Countdown;
ein zu kurzer Wert würde Kundinnen und Kunden dazu bringen, das Fahrzeug zu
früh stehen zu lassen.

### Interne Kostenrechnung

`src/lib/costs.ts` hält die Einkaufspreise und rechnet je Auftrag einen
Deckungsbeitrag aus, der in der internen Auftragsmail mitgeschickt wird. Noch
nicht hinterlegte Posten – amtliche Gebühren, Schilder, Versand – erscheinen
als „offen", und die Marge bleibt so lange unberechnet, statt eine falsche Zahl
auszuweisen.

### Identifizierung

Voreingestellt sind drei Wege: Online-Ausweisfunktion (Vertrauensniveau „hoch“),
Vertrauensdiensteanbieter für Kundinnen und Kunden ohne aktivierte PIN, sowie
das ELSTER-Unternehmenskonto für Firmen. Die Oberfläche und der Datenfluss sind
vollständig gebaut; der Redirect zum jeweiligen Anbieter wird in
`src/app/api/auftrag/[id]/aktion/route.ts` (Aktion `identifizierung`)
eingehängt.

---

## 4. Kennzeichenprüfung: was echt ist und was nicht

**Echt und belastbar** ist die Formprüfung in `src/lib/plate.ts`: 1 bis 3
Buchstaben Unterscheidungszeichen, 1 bis 2 Buchstaben und 1 bis 4 Ziffern im
Erkennungsteil, höchstens 8 Zeichen insgesamt, keine führende Null.

**Echt, aber bewusst nicht abschließend** sind die Sperren in
`src/lib/plate-rules.ts`. Bundesweit gesperrt sind nach § 8 FZV nur fünf
Buchstabenkombinationen: HJ, KZ, NS, SA, SS. Alles Weitere legen die Länder und
teilweise einzelne Bezirke fest – hinterlegt sind die bekannten Zusatzregeln für
Hamburg (SD), Nordrhein-Westfalen (K-Z), Bayern (AH/HH mit 18/88/28, Nürnberg
N-PD und N-SU) und Brandenburg (14, 18, 28, 88, 188, 1888, 8888, 8188).
Zahlen mit einschlägiger Bedeutung erzeugen außerhalb dieser Länder einen
**Hinweis, keine Sperre** – sonst würden zulässige Kombinationen abgewiesen.
Die letzte Entscheidung trifft immer die Zulassungsbehörde.

**Nicht vorhanden ohne Anbindung ist die Verfügbarkeit.** Es gibt keine
öffentliche Datenquelle für den Kennzeichenbestand. Ohne konfigurierte
Schnittstelle liefert die Prüfung deshalb den Status `formal_ok` und die
Anwendung sagt wörtlich, dass die Verfügbarkeit noch offen ist. Sie behauptet
nichts, was sie nicht weiß.

Zum Anbinden genügen zwei Variablen:

```bash
PLATE_CHECK_URL="https://api.ihr-partner.de/v1"
PLATE_CHECK_TOKEN="..."
```

Erwartet wird `POST {PLATE_CHECK_URL}/verfuegbarkeit` mit
`{ districtCode, letters, digits }` und einer Antwort mit `available: boolean`
(oder `state: "AVAILABLE" | "TAKEN" | "RESERVED"`). Feldnamen bei Bedarf in
`src/lib/plate-availability.ts` anpassen. Fällt die Schnittstelle aus, wird das
Ergebnis auf `formal_ok` zurückgestuft – eine Störung darf nie als „vergeben“
beim Kunden ankommen.

### Die Kürzelliste ist ein Auszug

`src/lib/districts.ts` enthält 337 Unterscheidungszeichen. In Deutschland gibt
es durch die Kennzeichenliberalisierung deutlich mehr – gängige Kürzel wie PCH,
ANA, WSF, OHA, LOS, TS oder AÖ fehlen. Ein unbekanntes Kürzel führt deshalb
**nicht** zur Ablehnung, sondern nur zu einem Hinweis.

Für den Livegang die vollständige Liste einpflegen. Quelle ist das
Kraftfahrt-Bundesamt: die Kennzeichenliste als Faltblatt sowie die
Verzeichnisse der Zulassungsbezirke unter kba.de. Format in `districts.ts`:
`KÜRZEL|Zulassungsbezirk|Bundesland`, eine Zeile je Eintrag. Das Bundesland ist
kein Beiwerk – daran hängen die Landessperren oben.

## 5. Zahlungen

1. Stripe-Konto anlegen, im Dashboard unter *Zahlungsmethoden* Karte, PayPal,
   Klarna, SEPA-Lastschrift sowie Apple/Google Pay aktivieren.
2. `STRIPE_SECRET_KEY` in `.env.local` eintragen.
3. Webhook-Endpunkt auf `https://IHRE-DOMAIN/api/stripe/webhook` setzen, Event
   `checkout.session.completed` abonnieren und `STRIPE_WEBHOOK_SECRET` eintragen.
4. Lokal testen:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

Der Webhook setzt den Auftrag auf `bezahlt` und verschickt die
Zahlungsbestätigung.

---

## 5.5 Storno und Erstattung

Die AGB sagen zu, nicht angefallene Leistungen zu erstatten. Was „nicht
angefallen" heißt, hängt vom Fortschritt ab – und daran hängt Geld, das
teilweise schon bei Behörde und Prägepartner liegt. `src/lib/refunds.ts`
rechnet deshalb einen **Vorschlag**, den ein Mensch bestätigt oder überstimmt:

| Stand des Vorgangs | Vorschlag |
|---|---|
| Bezahlt, Bearbeitung nicht begonnen | voller Betrag |
| Schilder geprägt | abzüglich Schilder – nach Kundenvorgabe angefertigt, kein Widerrufsrecht (§ 312g Abs. 2 Nr. 1 BGB) |
| Schilder versandt | zusätzlich abzüglich Versand |
| Antrag eingereicht | zusätzlich abzüglich verauslagter Gebühren und Bearbeitung |
| Bescheid erteilt | Leistung erbracht – Erstattung ist Kulanzentscheidung, wird zur Prüfung markiert |
| Fehler im eigenen Haus | immer voller Betrag ohne Abzug |

Solange Schilder-, Versand- und Gebührenpreise in `costs.ts` bei null stehen,
setzt der Vorschlag dafür nichts ab und markiert den Fall mit
`pruefenLassen: true`. Lieber zu viel erstattet als eine erfundene Kürzung.

**Bedienung.** Erst den Vorschlag ansehen:

```bash
curl -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  "https://IHRE-DOMAIN/api/admin/erstattung?auftrag=KP-2026…&grund=kundenwunsch"
```

Dann ausführen – mit `betragCent` lässt sich der Vorschlag bewusst überstimmen:

```bash
curl -X POST -H "Authorization: Bearer $ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"auftrag":"KP-2026…","grund":"nicht_durchfuehrbar","notiz":"eVB abgelaufen"}' \
  https://IHRE-DOMAIN/api/admin/erstattung
```

Gründe: `kundenwunsch`, `widerruf`, `nicht_durchfuehrbar`,
`unterlagen_unvollstaendig`, `behoerde_abgelehnt`, `fehler_intern`.

Jede Erstattung wird am Auftrag vermerkt (Betrag, Grund, Notiz, Referenz des
Zahlungsdienstleisters, Zeitpunkt), Kundin bzw. Kunde und Team werden per
E-Mail informiert. Die Stripe-Rückzahlung läuft mit Idempotenz-Schlüssel, ein
Wiederholungsversuch zahlt also nicht doppelt aus, und mehr als gezahlt lässt
sich nicht erstatten.

> **Grenze der jetzigen Lösung:** Der Endpunkt ist mit einem gemeinsamen Token
> abgesichert. Für den Anfang mit wenigen Personen reicht das, es ersetzt aber
> kein Sachbearbeiter-Backend mit persönlichen Konten, Rollen, Zwei-Faktor und
> revisionssicherem Protokoll. Token wie ein Passwort behandeln und bei
> Personalwechsel tauschen.

---

## 6. Datenhaltung

Aufträge liegen als JSON unter `.data/orders`, Uploads unter `.data/uploads`.
Das ist bewusst simpel gehalten, damit die Anwendung ohne Datenbank läuft.

**Für den Produktivbetrieb ersetzen** – insbesondere auf serverlosen Hostern
(Vercel), wo das Dateisystem nicht dauerhaft ist. Zu tauschen sind nur die
Funktionen in `src/lib/orders-store.ts`:

- `saveOrder`, `getOrder`, `updateOrder` → Datenbank (z. B. PostgreSQL/Prisma)
- `storeUpload` → Objektspeicher (z. B. S3-kompatibel)

Die IBAN wird bereits maskiert gespeichert. Ausweis- und Fahrzeugdokumente
sollten nach Abschluss des Vorgangs automatisiert gelöscht werden – die Frist
steht in der Datenschutzerklärung und muss eingehalten werden.

---

## 7. Datenschutz und Sicherheit

- Es werden besonders schützenswerte Daten verarbeitet (Ausweisdokumente,
  IBAN, Fahrzeugdaten). Ein Verarbeitungsverzeichnis nach Art. 30 DSGVO und
  Auftragsverarbeitungsverträge mit Hoster, Zahlungs- und Versanddienstleister
  sind Pflicht.
- Security-Header sind in `next.config.ts` gesetzt; HSTS wirkt nur unter HTTPS.
- Uploads werden auf Typ (JPG, PNG, HEIC, PDF) und Größe (10 MB) geprüft.
- Das Kontaktformular hat ein Honeypot-Feld; für den Livebetrieb empfiehlt sich
  zusätzlich ein Rate-Limit (z. B. Upstash Ratelimit) auf den API-Routen.

---

## 8. Struktur

```
src/
  app/
    page.tsx                 Startseite
    <leistung>/page.tsx      6 Leistungsseiten
    bestellung/              Assistent, Erfolgs- und Abbruchseite
    sofortzulassung/         Landingpage zu i-Kfz Stufe 4
    auftrag/[id]/            Auftragsverfolgung mit Zugriffscode
    zulassungsstellen/       Suche über Unterscheidungszeichen
    ratgeber/ kontakt/       Inhalte und Support
    impressum/ datenschutz/ agb/ widerruf/ barrierefreiheit/
    api/
      kennzeichen/           Verfügbarkeitsprüfung
      bestellung/            Auftragsannahme inkl. Uploads
      checkout/              Stripe-Session
      stripe/webhook/        Zahlungsbestätigung
      kontakt/               Kontaktformular
      auftrag/[id]/          Status, Aktionen, Dokumentenabruf
      ikfz/callback/         signierter Rückruf des Zulassungspartners
  components/                Header, Footer, Sektionen, Assistent, UI-Bausteine
  lib/
    site.ts                  Stammdaten (Platzhalter)
    services.ts              Leistungen und Preise
    districts.ts             Unterscheidungszeichen
    plate.ts                 Kennzeichenlogik
    plate-rules.ts           gesperrte Kombinationen je Bundesland
    plate-availability.ts    Verfügbarkeitsabfrage (optional)
    order.ts                 Optionen, Validierung, Preisberechnung
    orders-store.ts          Ablage
    order-flow.ts            Ablaufsteuerung des Auftrags
    order-access.ts          Zugriffscode-Prüfung
    ikfz/
      types.ts               Domänenmodell und Provider-Vertrag
      eligibility.ts         Vorprüfung der Stufe-4-Voraussetzungen
      partner-provider.ts    aktiver Adapter (GKS-Partner)
      partner-mapping.ts     Feldzuordnung – hier anpassen
      sandbox-provider.ts    Testbetrieb ohne Behörde
      gks-provider.ts        Gerüst für eine eigene GKS
      vollmacht.ts           versionierter Vollmachtstext und Hash
    mail.ts / stripe.ts      Integrationen
```

---

## 9. Design

Helles, amtlich-seriöses Layout: viel Weißraum, klare Rasterlinien,
Signalblau als einzige Akzentfarbe, Grün/Gelb/Rot ausschließlich für
Statusmeldungen. Alle Farben liegen als Tokens in `src/app/globals.css`
(`@theme`) – ein Markenwechsel ist eine Änderung an einer Stelle.

Die Schrift ist der System-Font-Stack (schnell, kein externer Request, kein
Google-Fonts-Thema im Datenschutz). Ein Hinweis zum Umstieg auf Inter steht in
`src/app/layout.tsx`.
