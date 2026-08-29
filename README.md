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
    zulassungsstellen/       Suche über Unterscheidungszeichen
    ratgeber/ kontakt/       Inhalte und Support
    impressum/ datenschutz/ agb/ widerruf/ barrierefreiheit/
    api/
      kennzeichen/           Verfügbarkeitsprüfung
      bestellung/            Auftragsannahme inkl. Uploads
      checkout/              Stripe-Session
      stripe/webhook/        Zahlungsbestätigung
      kontakt/               Kontaktformular
  components/                Header, Footer, Sektionen, Assistent, UI-Bausteine
  lib/
    site.ts                  Stammdaten (Platzhalter)
    services.ts              Leistungen und Preise
    districts.ts             Unterscheidungszeichen
    plate.ts                 Kennzeichenlogik
    order.ts                 Optionen, Validierung, Preisberechnung
    orders-store.ts          Ablage
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
