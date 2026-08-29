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
| Verfügbarkeitsprüfung | Live-Prüfung mit Formatvalidierung nach FZV, Sperrkombinationen, Alternativvorschlägen und Kennzeichen-Vorschau |
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

**Ohne montierte Schilder gilt die Fahrberechtigung nicht.** Der vorläufige
Zulassungsnachweis erlaubt zehn Kalendertage Fahrt, aber nur mit angebrachten
Kennzeichenschildern – die in dieser Zeit noch ungesiegelt sein dürfen –, dem
ausgedruckten Nachweis sichtbar im Fahrzeug und dem mitgeführten
Zulassungsbescheid. Deshalb liefert die Anwendung die Schilder **vor** dem
Zulassungsantrag und gibt den Antrag erst frei, wenn die Zustellung bestätigt
ist (`src/lib/order-flow.ts`, `antragEinreichen`).

**Der Bescheid hat ein kurzes Abruffenster.** Er muss innerhalb von 30 Minuten
abgerufen werden. Die Auftragsverfolgung zeigt den Countdown, die
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

**Anbieter am Markt** (Stand der Recherche, bitte selbst aktuell prüfen):
Kroschke (i-Kfz-Branchenlösung), digital-zulassen.de (B2B mit eingebautem
Großkundenaccount, Whitelabel und QES), cronn/ZULEX (Software und Anbindung),
T-KFZ. Wer ohne eigene KBA-Lizenz sofort starten will, braucht einen Anbieter,
der seinen eigenen Großkundenaccount mitbringt – nicht nur eine Softwarelizenz.

### Identifizierung

Voreingestellt sind drei Wege: Online-Ausweisfunktion (Vertrauensniveau „hoch“),
Vertrauensdiensteanbieter für Kundinnen und Kunden ohne aktivierte PIN, sowie
das ELSTER-Unternehmenskonto für Firmen. Die Oberfläche und der Datenfluss sind
vollständig gebaut; der Redirect zum jeweiligen Anbieter wird in
`src/app/api/auftrag/[id]/aktion/route.ts` (Aktion `identifizierung`)
eingehängt.

---

## 4. Echte Verfügbarkeitsprüfung anbinden

Aktuell prüft `src/lib/plate.ts` das Format vollständig korrekt (Länge,
Buchstaben-/Ziffernaufbau, führende Null, Gesamtlänge, gesperrte
Kombinationen) und liefert die Verfügbarkeit über einen stabilen Hash – im
Demobetrieb ist damit jede Kombination reproduzierbar frei oder vergeben.

Für den Echtbetrieb nur eine Stelle ersetzen:

```ts
// src/lib/plate.ts
export function availabilityOf(input: PlateInput) { … }
```

bzw. den Aufruf in `src/app/api/kennzeichen/route.ts`. Dort die Schnittstelle
Ihres Reservierungsdienstleisters oder der jeweiligen Zulassungsbehörde
aufrufen. Die Antwortstruktur (`PlateResult`) bleibt unverändert, das Frontend
muss nicht angefasst werden.

Die Liste der Unterscheidungszeichen in `src/lib/districts.ts` ist ein Auszug
der gebräuchlichsten Kürzel. Für den Produktivbetrieb empfiehlt sich der
vollständige Datensatz des Kraftfahrt-Bundesamts.

---

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
