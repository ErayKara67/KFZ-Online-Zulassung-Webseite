/**
 * Unterscheidungszeichen (Ortskürzel) der deutschen Zulassungsbezirke.
 * Auszug der gebräuchlichsten Kürzel – für den Produktivbetrieb sollte die
 * vollständige Liste des KBA eingelesen werden (siehe README).
 */
const RAW = `
B|Berlin|Berlin
M|München|Bayern
HH|Hamburg|Hamburg
K|Köln|Nordrhein-Westfalen
F|Frankfurt am Main|Hessen
S|Stuttgart|Baden-Württemberg
D|Düsseldorf|Nordrhein-Westfalen
DO|Dortmund|Nordrhein-Westfalen
E|Essen|Nordrhein-Westfalen
L|Leipzig|Sachsen
HB|Bremen|Bremen
DD|Dresden|Sachsen
H|Hannover|Niedersachsen
N|Nürnberg|Bayern
DU|Duisburg|Nordrhein-Westfalen
BO|Bochum|Nordrhein-Westfalen
W|Wuppertal|Nordrhein-Westfalen
BI|Bielefeld|Nordrhein-Westfalen
BN|Bonn|Nordrhein-Westfalen
MS|Münster|Nordrhein-Westfalen
KA|Karlsruhe|Baden-Württemberg
MA|Mannheim|Baden-Württemberg
A|Augsburg|Bayern
WI|Wiesbaden|Hessen
MG|Mönchengladbach|Nordrhein-Westfalen
GE|Gelsenkirchen|Nordrhein-Westfalen
BS|Braunschweig|Niedersachsen
C|Chemnitz|Sachsen
KI|Kiel|Schleswig-Holstein
AC|Aachen|Nordrhein-Westfalen
HAL|Halle (Saale)|Sachsen-Anhalt
MD|Magdeburg|Sachsen-Anhalt
FR|Freiburg im Breisgau|Baden-Württemberg
KR|Krefeld|Nordrhein-Westfalen
HOB|Oberhausen|Nordrhein-Westfalen
ER|Erlangen|Bayern
RO|Rosenheim|Bayern
MZ|Mainz|Rheinland-Pfalz
RS|Remscheid|Nordrhein-Westfalen
SB|Saarbrücken|Saarland
HA|Hagen|Nordrhein-Westfalen
P|Potsdam|Brandenburg
HN|Heilbronn|Baden-Württemberg
LU|Ludwigshafen am Rhein|Rheinland-Pfalz
OF|Offenbach am Main|Hessen
UL|Ulm|Baden-Württemberg
HD|Heidelberg|Baden-Württemberg
PB|Paderborn|Nordrhein-Westfalen
WÜ|Würzburg|Bayern
GÖ|Göttingen|Niedersachsen
WOB|Wolfsburg|Niedersachsen
RE|Recklinghausen|Nordrhein-Westfalen
BOT|Bottrop|Nordrhein-Westfalen
R|Regensburg|Bayern
IN|Ingolstadt|Bayern
FÜ|Fürth|Bayern
KO|Koblenz|Rheinland-Pfalz
TR|Trier|Rheinland-Pfalz
KL|Kaiserslautern|Rheinland-Pfalz
J|Jena|Thüringen
GI|Gießen|Hessen
KS|Kassel|Hessen
MR|Marburg|Hessen
FD|Fulda|Hessen
HG|Bad Homburg|Hessen
DA|Darmstadt|Hessen
HU|Hanau|Hessen
SI|Siegen|Nordrhein-Westfalen
SO|Soest|Nordrhein-Westfalen
UN|Unna|Nordrhein-Westfalen
HAM|Hamm|Nordrhein-Westfalen
LEV|Leverkusen|Nordrhein-Westfalen
NE|Neuss|Nordrhein-Westfalen
ME|Mettmann|Nordrhein-Westfalen
SU|Siegburg|Nordrhein-Westfalen
GM|Gummersbach|Nordrhein-Westfalen
EU|Euskirchen|Nordrhein-Westfalen
DN|Düren|Nordrhein-Westfalen
HS|Heinsberg|Nordrhein-Westfalen
VIE|Viersen|Nordrhein-Westfalen
KLE|Kleve|Nordrhein-Westfalen
WES|Wesel|Nordrhein-Westfalen
BOR|Borken|Nordrhein-Westfalen
COE|Coesfeld|Nordrhein-Westfalen
ST|Steinfurt|Nordrhein-Westfalen
WAF|Warendorf|Nordrhein-Westfalen
GT|Gütersloh|Nordrhein-Westfalen
HF|Herford|Nordrhein-Westfalen
MI|Minden|Nordrhein-Westfalen
LIP|Detmold|Nordrhein-Westfalen
HX|Höxter|Nordrhein-Westfalen
HSK|Meschede|Nordrhein-Westfalen
OE|Olpe|Nordrhein-Westfalen
MK|Lüdenscheid|Nordrhein-Westfalen
EN|Schwelm|Nordrhein-Westfalen
OS|Osnabrück|Niedersachsen
OL|Oldenburg|Niedersachsen
DEL|Delmenhorst|Niedersachsen
WHV|Wilhelmshaven|Niedersachsen
EMD|Emden|Niedersachsen
AUR|Aurich|Niedersachsen
LER|Leer|Niedersachsen
CLP|Cloppenburg|Niedersachsen
VEC|Vechta|Niedersachsen
DH|Diepholz|Niedersachsen
NI|Nienburg|Niedersachsen
SHG|Stadthagen|Niedersachsen
HM|Hameln|Niedersachsen
HI|Hildesheim|Niedersachsen
PE|Peine|Niedersachsen
SZ|Salzgitter|Niedersachsen
GS|Goslar|Niedersachsen
NOM|Northeim|Niedersachsen
HOL|Holzminden|Niedersachsen
CE|Celle|Niedersachsen
GF|Gifhorn|Niedersachsen
UE|Uelzen|Niedersachsen
LG|Lüneburg|Niedersachsen
HK|Bad Fallingbostel|Niedersachsen
ROW|Rotenburg (Wümme)|Niedersachsen
STD|Stade|Niedersachsen
CUX|Cuxhaven|Niedersachsen
WL|Winsen (Luhe)|Niedersachsen
VER|Verden|Niedersachsen
OHZ|Osterholz-Scharmbeck|Niedersachsen
WST|Westerstede|Niedersachsen
FRI|Jever|Niedersachsen
BRB|Brandenburg an der Havel|Brandenburg
CB|Cottbus|Brandenburg
FF|Frankfurt (Oder)|Brandenburg
BAR|Eberswalde|Brandenburg
LDS|Lübben|Brandenburg
MOL|Seelow|Brandenburg
OHV|Oranienburg|Brandenburg
PM|Potsdam-Mittelmark|Brandenburg
TF|Luckenwalde|Brandenburg
OPR|Neuruppin|Brandenburg
UM|Prenzlau|Brandenburg
EE|Herzberg (Elster)|Brandenburg
SPN|Forst (Lausitz)|Brandenburg
HVL|Rathenow|Brandenburg
PR|Perleberg|Brandenburg
OSL|Senftenberg|Brandenburg
SN|Schwerin|Mecklenburg-Vorpommern
HRO|Rostock|Mecklenburg-Vorpommern
HST|Stralsund|Mecklenburg-Vorpommern
HGW|Greifswald|Mecklenburg-Vorpommern
NB|Neubrandenburg|Mecklenburg-Vorpommern
LWL|Ludwigslust|Mecklenburg-Vorpommern
NWM|Wismar|Mecklenburg-Vorpommern
VG|Pasewalk|Mecklenburg-Vorpommern
VR|Grimmen|Mecklenburg-Vorpommern
MSE|Waren (Müritz)|Mecklenburg-Vorpommern
LRO|Güstrow|Mecklenburg-Vorpommern
DES|Dessau-Roßlau|Sachsen-Anhalt
SAW|Salzwedel|Sachsen-Anhalt
SDL|Stendal|Sachsen-Anhalt
WB|Wittenberg|Sachsen-Anhalt
BLK|Naumburg|Sachsen-Anhalt
MSH|Sangerhausen|Sachsen-Anhalt
SK|Merseburg|Sachsen-Anhalt
ABI|Köthen|Sachsen-Anhalt
HZ|Halberstadt|Sachsen-Anhalt
JL|Burg|Sachsen-Anhalt
BK|Haldensleben|Sachsen-Anhalt
Z|Zwickau|Sachsen
PIR|Pirna|Sachsen
GR|Görlitz|Sachsen
BZ|Bautzen|Sachsen
MEI|Meißen|Sachsen
FG|Freiberg|Sachsen
ERZ|Annaberg-Buchholz|Sachsen
V|Plauen|Sachsen
G|Gera|Thüringen
SHL|Suhl|Thüringen
EF|Erfurt|Thüringen
GTH|Gotha|Thüringen
NDH|Nordhausen|Thüringen
SM|Schmalkalden|Thüringen
SLZ|Bad Salzungen|Thüringen
IK|Arnstadt|Thüringen
AP|Apolda|Thüringen
SÖM|Sömmerda|Thüringen
EIC|Heilbad Heiligenstadt|Thüringen
UH|Mühlhausen|Thüringen
KYF|Sondershausen|Thüringen
SON|Sonneberg|Thüringen
SLF|Saalfeld|Thüringen
GRZ|Greiz|Thüringen
ABG|Altenburg|Thüringen
HBN|Hildburghausen|Thüringen
PF|Pforzheim|Baden-Württemberg
RT|Reutlingen|Baden-Württemberg
TÜ|Tübingen|Baden-Württemberg
KN|Konstanz|Baden-Württemberg
RV|Ravensburg|Baden-Württemberg
FN|Friedrichshafen|Baden-Württemberg
AA|Aalen|Baden-Württemberg
GP|Göppingen|Baden-Württemberg
ES|Esslingen|Baden-Württemberg
LB|Ludwigsburg|Baden-Württemberg
WN|Waiblingen|Baden-Württemberg
BB|Böblingen|Baden-Württemberg
CW|Calw|Baden-Württemberg
FDS|Freudenstadt|Baden-Württemberg
RW|Rottweil|Baden-Württemberg
TUT|Tuttlingen|Baden-Württemberg
VS|Villingen-Schwenningen|Baden-Württemberg
OG|Offenburg|Baden-Württemberg
EM|Emmendingen|Baden-Württemberg
LÖ|Lörrach|Baden-Württemberg
WT|Waldshut-Tiengen|Baden-Württemberg
SIG|Sigmaringen|Baden-Württemberg
BC|Biberach|Baden-Württemberg
HDH|Heidenheim|Baden-Württemberg
SHA|Schwäbisch Hall|Baden-Württemberg
TBB|Tauberbischofsheim|Baden-Württemberg
MOS|Mosbach|Baden-Württemberg
KÜN|Künzelsau|Baden-Württemberg
RA|Rastatt|Baden-Württemberg
BAD|Baden-Baden|Baden-Württemberg
BL|Balingen|Baden-Württemberg
IZ|Itzehoe|Schleswig-Holstein
FL|Flensburg|Schleswig-Holstein
NF|Husum|Schleswig-Holstein
SL|Schleswig|Schleswig-Holstein
RD|Rendsburg|Schleswig-Holstein
PLÖ|Plön|Schleswig-Holstein
OH|Eutin|Schleswig-Holstein
SE|Bad Segeberg|Schleswig-Holstein
PI|Pinneberg|Schleswig-Holstein
OD|Bad Oldesloe|Schleswig-Holstein
RZ|Ratzeburg|Schleswig-Holstein
NMS|Neumünster|Schleswig-Holstein
HEI|Heide|Schleswig-Holstein
KT|Kitzingen|Bayern
AN|Ansbach|Bayern
WUG|Weißenburg|Bayern
EI|Eichstätt|Bayern
ND|Neuburg an der Donau|Bayern
DON|Donauwörth|Bayern
GZ|Günzburg|Bayern
NU|Neu-Ulm|Bayern
MN|Mindelheim|Bayern
KF|Kaufbeuren|Bayern
KE|Kempten|Bayern
OA|Sonthofen|Bayern
LI|Lindau|Bayern
MM|Memmingen|Bayern
LL|Landsberg am Lech|Bayern
FFB|Fürstenfeldbruck|Bayern
STA|Starnberg|Bayern
WM|Weilheim|Bayern
GAP|Garmisch-Partenkirchen|Bayern
TÖL|Bad Tölz|Bayern
MB|Miesbach|Bayern
EBE|Ebersberg|Bayern
ED|Erding|Bayern
FS|Freising|Bayern
DAH|Dachau|Bayern
AIC|Aichach|Bayern
PAF|Pfaffenhofen|Bayern
KEH|Kelheim|Bayern
LA|Landshut|Bayern
DGF|Dingolfing|Bayern
SR|Straubing|Bayern
DEG|Deggendorf|Bayern
PA|Passau|Bayern
FRG|Freyung|Bayern
REG|Regen|Bayern
CHA|Cham|Bayern
SAD|Schwandorf|Bayern
AM|Amberg|Bayern
NM|Neumarkt|Bayern
WEN|Weiden|Bayern
NEW|Neustadt an der Waldnaab|Bayern
TIR|Tirschenreuth|Bayern
BT|Bayreuth|Bayern
KU|Kulmbach|Bayern
HO|Hof|Bayern
CO|Coburg|Bayern
LIF|Lichtenfels|Bayern
BA|Bamberg|Bayern
FO|Forchheim|Bayern
ERH|Erlangen-Höchstadt|Bayern
NEA|Neustadt an der Aisch|Bayern
SW|Schweinfurt|Bayern
HAS|Haßfurt|Bayern
RH|Roth|Bayern
MSP|Marktheidenfeld|Bayern
MIL|Miltenberg|Bayern
AB|Aschaffenburg|Bayern
MTK|Hofheim am Taunus|Hessen
GG|Groß-Gerau|Hessen
ERB|Erbach|Hessen
HP|Heppenheim|Hessen
LDK|Wetzlar|Hessen
LM|Limburg|Hessen
RÜD|Rüdesheim|Hessen
HR|Homberg (Efze)|Hessen
KB|Korbach|Hessen
ESW|Eschwege|Hessen
HEF|Bad Hersfeld|Hessen
VB|Lauterbach|Hessen
FB|Friedberg|Hessen
AZ|Alzey|Rheinland-Pfalz
BIT|Bitburg|Rheinland-Pfalz
NR|Neuwied|Rheinland-Pfalz
MYK|Mayen|Rheinland-Pfalz
AW|Bad Neuenahr-Ahrweiler|Rheinland-Pfalz
COC|Cochem|Rheinland-Pfalz
WIL|Wittlich|Rheinland-Pfalz
DAU|Daun|Rheinland-Pfalz
SIM|Simmern|Rheinland-Pfalz
KH|Bad Kreuznach|Rheinland-Pfalz
KIB|Kirchheimbolanden|Rheinland-Pfalz
WO|Worms|Rheinland-Pfalz
FT|Frankenthal|Rheinland-Pfalz
SP|Speyer|Rheinland-Pfalz
NW|Neustadt an der Weinstraße|Rheinland-Pfalz
LD|Landau in der Pfalz|Rheinland-Pfalz
GER|Germersheim|Rheinland-Pfalz
SÜW|Bad Bergzabern|Rheinland-Pfalz
PS|Pirmasens|Rheinland-Pfalz
ZW|Zweibrücken|Rheinland-Pfalz
KUS|Kusel|Rheinland-Pfalz
DÜW|Bad Dürkheim|Rheinland-Pfalz
EMS|Bad Ems|Rheinland-Pfalz
WW|Montabaur|Rheinland-Pfalz
AK|Altenkirchen|Rheinland-Pfalz
BIR|Birkenfeld|Rheinland-Pfalz
NK|Neunkirchen|Saarland
HOM|Homburg|Saarland
SLS|Saarlouis|Saarland
MZG|Merzig|Saarland
WND|St. Wendel|Saarland
IGB|St. Ingbert|Saarland
`;

export interface District {
  code: string;
  city: string;
  state: string;
}

export const districts: District[] = Array.from(
  RAW.trim()
    .split("\n")
    .map((line) => line.split("|"))
    .filter((p) => p.length === 3)
    .reduce((map, [code, city, state]) => {
      const key = `${code}|${city}`;
      if (!map.has(key)) map.set(key, { code, city, state });
      return map;
    }, new Map<string, District>())
    .values(),
).sort((a, b) => a.city.localeCompare(b.city, "de"));

const codeSet = new Set(districts.map((d) => d.code));

export function isKnownDistrict(code: string): boolean {
  return codeSet.has(code.toUpperCase());
}

export function findDistricts(query: string, limit = 8): District[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return districts
    .filter(
      (d) =>
        d.code.toLowerCase().startsWith(q) ||
        d.city.toLowerCase().includes(q),
    )
    .slice(0, limit);
}

export const featuredDistricts = [
  "B",
  "M",
  "HH",
  "K",
  "F",
  "S",
  "D",
  "DO",
  "E",
  "L",
  "HB",
  "DD",
]
  .map((code) => districts.find((d) => d.code === code))
  .filter((d): d is District => Boolean(d));
