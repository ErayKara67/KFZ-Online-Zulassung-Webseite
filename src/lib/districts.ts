/**
 * Unterscheidungszeichen der deutschen Zulassungsbezirke.
 *
 * Format je Zeile: KÜRZEL|Zulassungsbezirk|Bundesland
 *
 * Das Bundesland ist bei einem Teil der Einträge nicht hinterlegt. Es steuert
 * ausschließlich die landesspezifischen Kennzeichensperren (plate-rules.ts) –
 * fehlt es, greifen nur die bundesweiten Sperren nach § 8 FZV. Das ist die
 * sichere Richtung: Es wird nichts fälschlich abgewiesen.
 *
 * Herkunft: öffentlich verfügbarer Datensatz der Unterscheidungszeichen,
 * ergänzt um die Bundesländer. Vor dem Livegang gegen das Verzeichnis des
 * Kraftfahrt-Bundesamts abgleichen und dort auch die fehlenden Bundesländer
 * nachtragen.
 */
const RAW = `
AC|Aachen|Nordrhein-Westfalen
AH|Ahaus|
AW|Ahrweiler (Bad Neuenahr-Ahrweiler)|Rheinland-Pfalz
AIC|Aichach-Friedberg (Aichach)|Bayern
UL|Alb-Donau-Kreis (Ulm)|Baden-Württemberg
ALF|Alfeld|
ALS|Alsfeld|
AL|Altena|
ABG|Altenburger Land (Altenburg)|Thüringen
AK|Altenkirchen|Rheinland-Pfalz
AT|Altentreptow|
SAW|Altmarkkreis (Salzwedel)|Sachsen-Anhalt
AÖ|Altötting|
ALZ|Alzenau|
AZ|Alzey-Worms (Alzey)|Rheinland-Pfalz
AM|Amberg|Bayern
AS|Amberg-Sulzbach (Amberg)|
WST|Ammerland (Westerstede)|Niedersachsen
ANG|Angermünde|
AZE|Anhalt-Zerbst (Coswig)|
ANK|Anklam|
ANA|Annaberg (Annaberg-Buchholz)|
AN|Ansbach|Bayern
APD|Apolda|
AR|Arnsberg|
ARN|Arnstadt|
ART|Artern|
AB|Aschaffenburg|Bayern
ASD|Aschendorf-Hümmling (Papenburg-Aschendorf)|
ASL|Aschersleben-Staßfurter Landkreis (Aschersleben)|
AU|Aue|
AE|Auerbach|
A|Augsburg|Bayern
AUR|Aurich|Niedersachsen
BK|Backnang|Sachsen-Anhalt
AIB|Bad Aibling|
BRK|Bad Brückenau|
DBR|Bad Doberan|
DÜW|Bad Dürkheim|Rheinland-Pfalz
FRW|Bad Freienwalde|
KG|Bad Kissingen|
KH|Bad Kreuznach|Rheinland-Pfalz
LSZ|Bad Langensalza|
LIB|Bad Liebenwerda|
MGH|Bad Mergentheim|
SLZ|Bad Salzungen|Thüringen
TÖL|Bad Tölz-Wolfratshausen (Bad Tölz)|Bayern
BAD|Baden-Baden|Baden-Württemberg
BWL|Baden-Württemberg|
BA|Bamberg|Bayern
BAR|Barnim (Eberswalde)|Brandenburg
BZ|Bautzen|Sachsen
BYL|Bayern|
BT|Bayreuth|Bayern
BE|Beckum|
BSK|Beeskow|
BEI|Beilngries|
BEL|Belzig|
BGD|Berchtesgaden|
BGL|Berchtesgadener Land (Bad Reichenhall)|
REI|Berchtesgadener Land (Bad Reichenhall)|
HP|Bergstraße (Heppenheim)|Hessen
BZA|Bergzabern|
B|Berlin|Berlin
BER|Bernau|
BBG|Bernburg|
BKS|Bernkastel (Bernkastel-Kues)|
WIL|Bernkastel-Wittlich (Wittlich)|Rheinland-Pfalz
BSB|Bersenbrück|
BC|Biberach|Baden-Württemberg
BID|Biedenkopf|
BI|Bielefeld|Nordrhein-Westfalen
BIN|Bingen|
BIR|Birkenfeld|Rheinland-Pfalz
BIW|Bischofswerda|
BIT|Bitburg-Prüm (Bitburg)|Rheinland-Pfalz
BTF|Bitterfeld|
BRL|Blankenburg (Braunlage)|
BOH|Bocholt|
BO|Bochum|Nordrhein-Westfalen
FN|Bodenseekreis (Friedrichshafen)|Baden-Württemberg
BOG|Bogen|
BN|Bonn|Nordrhein-Westfalen
BOR|Borken|Nordrhein-Westfalen
BNA|Borna|
BOT|Bottrop|Nordrhein-Westfalen
BED|Brand-Erbisdorf|
BBL|Brandenburg|
BRB|Brandenburg|Brandenburg
BS|Braunschweig|Niedersachsen
FR|Breisgau-Hochschwarzwald (Freiburg)|Baden-Württemberg
BRV|Bremervörde|
BRI|Brilon|
BR|Bruchsal|
BCH|Buchen|
BW|Bundes-Wasser- und Schiffahrtsverwaltung|
BG|Bundesgrenzschutz|
BD|Bundestag,Bundesrat,Bundesregierung|
Y|Bundeswehr|
X|Bundeswehr für Fahrzeuge der NATO-Hauptquartiere|
BRG|Burg|
BU|Burgdorf|
BLK|Burgenlandkreis (Naumburg)|Sachsen-Anhalt
BUL|Burglengenfeld|
BB|Böblingen|Baden-Württemberg
BÖ|Bördekreis (Oschersleben)|
OC|Bördekreis (Oschersleben)|
BÜD|Büdingen|
BH|Bühl|
BÜR|Büren|
BÜS|Büsingen am Hochrhein|
BÜZ|Bützow|
CA|Calau|
CW|Calw|Baden-Württemberg
CAS|Castrop-Rauxel|
CE|Celle|Niedersachsen
CHA|Cham|Bayern
C|Chemnitz|Sachsen
GC|Chemnitzer Land (Glauchau)|
CLZ|Clausthal-Zellerfeld (Zellerfeld)|
CLP|Cloppenburg|Niedersachsen
CO|Coburg|Bayern
COC|Cochem-Zell (Cochem)|Rheinland-Pfalz
COE|Coesfeld|Nordrhein-Westfalen
CB|Cottbus|Brandenburg
CR|Crailsheim|
CUX|Cuxhaven|Niedersachsen
DAH|Dachau|Bayern
LDS|Dahme-Spreewald (Lübben)|Brandenburg
DA|Darmstadt-Dieburg (Darmstadt)|Hessen
DAU|Daun|Rheinland-Pfalz
DEG|Deggendorf|Bayern
DZ|Delitzsch|
DEL|Delmenhorst|Niedersachsen
DM|Demmin|
DE|Dessau|
DB|Deutsche Bundesbahn|
BP|Deutsche Bundespost|
DI|Dieburg|
DH|Diepholz|Niedersachsen
DLG|Dillingen|
DIL|Dillkreis (Dillenburg)|
DGF|Dingolfing-Landau (Dingolfing)|Bayern
DKB|Dinkelsbühl|
DIN|Dinslaken|
HEI|Dithmarschen (Heide)|Schleswig-Holstein
DON|Donau-Ries (Donauwörth)|Bayern
DS|Donaueschingen|
KIB|Donnersbergkreis (Kirchheimbolanden)|Rheinland-Pfalz
DO|Dortmund|Nordrhein-Westfalen
DD|Dresden|Sachsen
DUD|Duderstadt|
DU|Duisburg|Nordrhein-Westfalen
DL|Döbeln|
DN|Düren|Nordrhein-Westfalen
D|Düsseldorf|Nordrhein-Westfalen
EBS|Ebermannstadt|
EBN|Ebern|
EBE|Ebersberg|Bayern
EW|Eberswalde|
ECK|Eckernförde|
EG|Eggenfelden|
EHI|Ehingen|
EIC|Eichsfeld (Heiligenstadt)|Thüringen
EI|Eichstätt|Bayern
EIH|Eichstätt|
TÖN|Eiderstedt (Tönning)|
EB|Eilenburg|
EIN|Einbeck|
ESA|Eisenach|
EIS|Eisenberg|
EH|Eisenhüttenstadt|
EIL|Eisleben|
EE|Elbe-Elster (Herzberg)|Brandenburg
EMD|Emden|Niedersachsen
EM|Emmendingen|Baden-Württemberg
EL|Emsland (Meppen)|
EN|Ennepe-Ruhr-Kreis (Schwelm)|Nordrhein-Westfalen
ED|Erding|Bayern
BM|Erftkreis (Bergheim)|
EF|Erfurt|Thüringen
ERK|Erkelenz|
ER|Erlangen|Bayern
ERH|Erlangen-Höchstadt (Erlangen)|Bayern
ESB|Eschenbach|
E|Essen|Nordrhein-Westfalen
ES|Esslingen|Baden-Württemberg
EU|Euskirchen|Nordrhein-Westfalen
EUT|Eutin|
FEU|Feuchtwangen|
FI|Finsterwalde|
FL|Flensburg|Schleswig-Holstein
FLÖ|Flöha|
FO|Forchheim|Bayern
FOR|Forst|
FKB|Frankenberg|
FT|Frankenthal|Rheinland-Pfalz
FF|Frankfurt|Brandenburg
F|Frankfurt am Main|Hessen
FG|Freiberg|Sachsen
FS|Freising|Bayern
FTL|Freital|
FDS|Freudenstadt|Baden-Württemberg
FRG|Freyung-Grafenau (Freyung)|Bayern
FDB|Friedberg|
FRI|Friesland (Jever)|Niedersachsen
JEV|Friesland (Jever)|
FZ|Fritzlar-Homberg (Fritzlar)|
FD|Fulda|Hessen
FFB|Fürstenfeldbruck|Bayern
FW|Fürstenwalde|
FÜ|Fürth|Bayern
FÜS|Füssen|
GDB|Gadebusch|
GAN|Gandersheim (Bad Gandersheim)|
GA|Gardelegen|
GAP|Garmisch-Partenkirchen|Bayern
GK|Geilenkirchen-Heinsberg (Erkelenz)|
GHA|Geithain|
GEL|Geldern|
GN|Gelnhausen|
GE|Gelsenkirchen|Nordrhein-Westfalen
GEM|Gemünden|
GNT|Genthin|
G|Gera|Thüringen
GER|Germersheim|Rheinland-Pfalz
GEO|Gerolzhofen|
GI|Gießen|Hessen
GF|Gifhorn|Niedersachsen
GLA|Gladbeck (Stadt)|
GS|Goslar|Niedersachsen
GTH|Gotha|Thüringen
GRA|Grafenau|
NOH|Grafschaft Bentheim (Nordhorn)|
SY|Grafschaft Hoya (Syke)|
RI|Grafschaft Schaumburg (Rinteln)|
GRS|Gransee|
GW|Greifswald|
GRZ|Greiz|Thüringen
GV|Grevenbroich|
GVM|Grevesmühlen|
GRI|Griesbach Rottal|
GRM|Grimma|
GMN|Grimmen|
GG|Groß-Gerau|Hessen
GRH|Großenhain|
GHC|Gräfenhainichen|
GUB|Guben|
GUN|Gunzenhausen|
GP|Göppingen|Baden-Württemberg
GR|Görlitz|Sachsen
GÖ|Göttingen|Niedersachsen
GZ|Günzburg|Bayern
GÜ|Güstrow|
GT|Gütersloh|Nordrhein-Westfalen
HA|Hagen|Nordrhein-Westfalen
HGN|Hagenow|
HC|Hainichen|
HBS|Halberstadt|
HDL|Haldensleben|
HAL|Halle|Sachsen-Anhalt
HW|Halle|
HM|Hameln-Pyrmont (Hameln)|Niedersachsen
HAM|Hamm|Nordrhein-Westfalen
HAB|Hammelburg|
H|Hannover|Niedersachsen
HMÜ|Hannoversch Münden|
HB|Hansestadt Bremen und Bremerhaven|Bremen
HGW|Hansestadt Greifswald|Mecklenburg-Vorpommern
HH|Hansestadt Hamburg|Hamburg
HL|Hansestadt Lübeck|
HRO|Hansestadt Rostock|Mecklenburg-Vorpommern
HST|Hansestadt Stralsund|Mecklenburg-Vorpommern
HWI|Hansestadt Wismar|
WL|Harburg (Winsen)|Niedersachsen
HV|Havelberg|
HVL|Havelland (Rathenow)|Brandenburg
HAS|Haßberge (Haßfurt)|Bayern
HCH|Hechingen|
HDH|Heidenheim|Baden-Württemberg
HN|Heilbronn|Baden-Württemberg
HIG|Heiligenstadt|
HS|Heinsberg|Nordrhein-Westfalen
HE|Helmstedt|
HF|Herford|Nordrhein-Westfalen
HER|Herne|
HEB|Hersbruck|
HEF|Hersfeld-Rotenburg (Bad Hersfeld)|Hessen
HZ|Herzberg|Sachsen-Anhalt
RZ|Herzogtum Lauenburg (Ratzeburg)|Schleswig-Holstein
HEL|Hessen|
HET|Hettstedt|
HBN|Hildburghausen|Thüringen
HI|Hildesheim|Niedersachsen
HIP|Hilpoltstein|
HSK|Hochsauerlandkreis (Meschede)|Nordrhein-Westfalen
MES|Hochsauerlandkreis (Meschede)|
NEU|Hochschwarzwald (Titisee-Neustadt)|
HG|Hochtaunuskreis (Bad Homburg vor der Höhe)|Hessen
HO|Hof|Bayern
HOG|Hofgeismar|
HOH|Hofheim|
KÜN|Hohenlohe-Kreis (Künzelsau)|Baden-Württemberg
HHM|Hohenmölsen|
HOT|Hohenstein-Ernstthal|
HOL|Holzminden|Niedersachsen
HOR|Horb|
HY|Hoyerswerda|
HUS|Husum|
HÖS|Höchstadt|
HX|Höxter|Nordrhein-Westfalen
HÜN|Hünfeld|
ILL|Illertissen|
IL|Ilmenau|
IK|Ilmkreis (Arnstadt)|Thüringen
IN|Ingolstadt|Bayern
IS|Iserlohn|
J|Jena|Thüringen
JL|Jerichower Land (Burg b. Magdeburg)|Sachsen-Anhalt
JE|Jessen|
JÜL|Jülich|
JB|Jüterbog|
KL|Kaiserslautern|Rheinland-Pfalz
KM|Kamenz|
KA|Karlsruhe|Baden-Württemberg
KS|Kassel|Hessen
KF|Kaufbeuren|Bayern
KEL|Kehl|
KEH|Kelheim|Bayern
KEM|Kemnath|
KK|Kempen-Krefeld (Kempen)|
KE|Kempten|Bayern
KI|Kiel|Schleswig-Holstein
KT|Kitzingen|Bayern
KLE|Kleve|Nordrhein-Westfalen
KLZ|Klötze|
KO|Koblenz|Rheinland-Pfalz
KN|Konstanz|Baden-Württemberg
KR|Krefeld|Nordrhein-Westfalen
KC|Kronach|
KRU|Krumbach|
KU|Kulmbach|Bayern
KUS|Kusel|Rheinland-Pfalz
KYF|Kyffhäuserkreis (Sondershausen)|Thüringen
KY|Kyritz|
K|Köln|Nordrhein-Westfalen
KW|Königs Wusterhausen|
KÖN|Königshofen|
KÖT|Köthen|
KÖZ|Kötzting|
LDK|Lahn-Dill-Kreis (Wetzlar)|Hessen
LR|Lahr|
OTT|Land Hadeln (Otterndorf)|
LAN|Landau|
LD|Landau|Rheinland-Pfalz
LL|Landsberg|Bayern
LA|Landshut|Bayern
LF|Laufen|
LER|Leer|Niedersachsen
L|Leipziger Land|Sachsen
LE|Lemgo|
LEO|Leonberg|
LEV|Leverkusen|Nordrhein-Westfalen
LIF|Lichtenfels|Bayern
LM|Limburg-Weilburg (Limburg)|Hessen
LI|Lindau|Bayern
LIN|Lingen|
DT|Lippe (Detmold)|
LIP|Lippe (Detmold)|Nordrhein-Westfalen
LP|Lippstadt|
LBS|Lobenstein|
LOH|Lohr|
LC|Luckau|
LUK|Luckenwalde|
LB|Ludwigsburg|Baden-Württemberg
LU|Ludwigshafen|Rheinland-Pfalz
LWL|Ludwigslust|Mecklenburg-Vorpommern
ZI|Löbau-Zittau (Zittau)|
LÖ|Lörrach|Baden-Württemberg
LK|Lübbecke|
LN|Lübben|
LBZ|Lübz|
DAN|Lüchow-Dannenberg (Lüchow)|
LÜD|Lüdenscheid|
LH|Lüdinghausen|
LG|Lüneburg|Niedersachsen
LÜN|Lünen|
MD|Magdeburg|Sachsen-Anhalt
HU|Main-Kinzig-Kreis (Hanau)|Hessen
MSP|Main-Spessart (Karlstadt)|Bayern
KAR|Main-Spessart-Kreis (Karlstadt)|
TBB|Main-Tauber-Kreis (Tauberbischofsheim)|Baden-Württemberg
FH|Main-Taunus-Kreis (Frankfurt am Main-Höchst)|
MTK|Main-Taunus-Kreis (Hofheim am Taunus)|Hessen
MAI|Mainburg|
MZ|Mainz-Bingen (Mainz)|Rheinland-Pfalz
MC|Malchin|
MAL|Mallersdorf|
MA|Mannheim|Baden-Württemberg
ML|Mansfelder Land (Lutherstadt Eisleben)|
MR|Marburg-Biedenkopf (Marburg)|Hessen
MAB|Marienberg|
MAR|Marktheidenfeld|
MAK|Marktredwitz|
MY|Mayen|
MYK|Mayen-Koblenz (Koblenz)|Rheinland-Pfalz
MST|Mecklenburg-Strelitz (Neustrelitz)|
MVL|Mecklenburg-Vorpommern|
MGN|Meiningen|
MEI|Meißen|Sachsen
MEL|Melle|
MET|Mellrichstadt|
MEG|Melsungen|
MM|Memmingen|Bayern
MEP|Meppen|
MER|Merseburg|
MQ|Merseburg-Querfurt (Merseburg)|
MZG|Merzig-Wadern (Merzig)|Saarland
ME|Mettmann|Nordrhein-Westfalen
MB|Miesbach|Bayern
MIL|Miltenberg|Bayern
MI|Minden-Lübbecke (Minden)|Nordrhein-Westfalen
MEK|Mittlerer Erzgebirgskreis (Marienberg)|
MW|Mittweida|
MO|Moers|
MON|Monschau|
MTL|Muldentalkreis (Grimma)|
MOL|Märkisch-Oderland (Seelow)|Brandenburg
LS|Märkischer Kreis (Lüdenscheid)|
MK|Märkischer Kreis (Lüdenscheid)|Nordrhein-Westfalen
MG|Mönchengladbach|Nordrhein-Westfalen
MÜ|Mühldorf am Inn|
MHL|Mühlhausen|
MH|Mülheim|
MÜL|Müllheim|
MÜB|Münchberg|
M|München|Bayern
MÜN|Münsingen|
MS|Münster|Nordrhein-Westfalen
MÜR|Müritz (Waren)|
NAB|Nabburg|
NAI|Naila|
NAU|Nauen|
NMB|Naumburg|
NEB|Nebra|
MOS|Neckar-Odenwald-Kreis (Mosbach)|Baden-Württemberg
NU|Neu-Ulm|Bayern
NB|Neubrandenburg|Mecklenburg-Vorpommern
ND|Neuburg-Schrobenhausen (Neuburg)|Bayern
NH|Neuhaus|
NM|Neumarkt|Bayern
NMS|Neumünster|Schleswig-Holstein
NEN|Neunburg vorm Wald|
NK|Neunkirchen|Saarland
NP|Neuruppin|
NE|Neuss|Nordrhein-Westfalen
NW|Neustadt|Rheinland-Pfalz
NRÜ|Neustadt am Rübenberge|
NEA|Neustadt an der Aisch-Bad Windsheim (Neustadt an der Aisch)|Bayern
NEW|Neustadt an der Waldnaab|Bayern
NEC|Neustadt bei Coburg|
NZ|Neustrelitz|
NR|Neuwied|Rheinland-Pfalz
NL|Niedersachsen|
NOL|Niederschlesischer Oberlausitzkreis (Görlitz)|
NI|Nienburg|Niedersachsen
NY|Niesky|
NOR|Norden|
NF|Nordfriesland (Husum)|Schleswig-Holstein
NDH|Nordhausen|Thüringen
NRW|Nordrhein-Westfalen|
RWL|Nordrhein-Westfalen|
NVP|Nordvorpommern (Grimmen)|
NWM|Nordwestmecklenburg (Grevesmühlen)|Mecklenburg-Vorpommern
NOM|Northeim|Niedersachsen
NÖ|Nördlingen|
N|Nürnberg|Bayern
LAU|Nürnberger Land (Lauf)|
NT|Nürtingen|
OA|Oberallgäu (Sonthofen)|Bayern
SF|Oberallgäu (Sonthofen)|
GM|Oberbergischer Kreis (Gummersbach)|Nordrhein-Westfalen
OB|Oberhausen|
OHV|Oberhavel (Oranienburg)|Brandenburg
WEL|Oberlahn-Kreis (Weilburg)|
OBB|Obernburg|
OSL|Oberspreewald-Lausitz (Senftenberg)|Brandenburg
OVI|Oberviechtach|
OVL|Obervogtland (Oelsnitz und Klingenthal)|
WEB|Oberwesterwaldkreis (Westerburg)|
OCH|Ochsenfurt|
ERB|Odenwaldkreis (Erbach)|Hessen
LOS|Oder-Spree (Beeskow)|
OF|Offenbach|Hessen
OK|Ohrekreis (Haldensleben)|
OL|Oldenburg|Niedersachsen
OLD|Oldenburg|
OE|Olpe|Nordrhein-Westfalen
OR|Oranienburg|
OG|Ortenaukreis (Offenburg)|Baden-Württemberg
OZ|Oschatz|
OS|Osnabrück|Niedersachsen
AA|Ostalbkreis (Aalen)|Baden-Württemberg
MOD|Ostallgäu (Marktoberdorf)|
OAL|Ostallgäu (Marktoberdorf)|
OBG|Osterburg|
OHZ|Osterholz (Osterholz-Scharmbeck)|Niedersachsen
OHA|Osterode am Harz|
OH|Ostholstein (Eutin)|Schleswig-Holstein
OPR|Ostprignitz-Ruppin (Neuruppin)|Brandenburg
OVP|Ostvorpommern (Anklam)|
OTW|Ottweiler|
PB|Paderborn|Nordrhein-Westfalen
PCH|Parchim|
PAR|Parsberg|
PW|Pasewalk|
PA|Passau|Bayern
PEG|Pegnitz|
PE|Peine|Niedersachsen
PER|Perleberg|
PAF|Pfaffenhofen an der Ilm|Bayern
PF|Pforzheim|Baden-Württemberg
PI|Pinneberg|Schleswig-Holstein
PS|Pirmasens|Rheinland-Pfalz
PL|Plauen|
PLÖ|Plön (Holstein)|Schleswig-Holstein
P|Potsdam|Brandenburg
PM|Potsdam-Mittelmark (Belzig)|Brandenburg
PZ|Prenzlau|
PR|Prignitz (Perleberg)|Brandenburg
PK|Pritzwalk|
PRÜ|Prüm|
PN|Pößneck|
QLB|Quedlinburg|
QFT|Querfurt|
RA|Rastatt|Baden-Württemberg
RN|Rathenow|
RV|Ravensburg|Baden-Württemberg
RE|Recklinghausen|Nordrhein-Westfalen
REG|Regen|Bayern
R|Regensburg|Bayern
REH|Rehau|
RC|Reichenbach|
WN|Rems-Murr-Kreis (Waiblingen)|Baden-Württemberg
RS|Remscheid|Nordrhein-Westfalen
RD|Rendsburg-Eckernförde (Rendsburg)|Schleswig-Holstein
RT|Reutlingen|Baden-Württemberg
SIM|Rhein-Hunsrück-Kreis (Simmern)|Rheinland-Pfalz
EMS|Rhein-Lahn-Kreis (Bad Ems)|Rheinland-Pfalz
HD|Rhein-Neckar-Kreis|Baden-Württemberg
SU|Rhein-Sieg-Kreis (Siegburg)|Nordrhein-Westfalen
OP|Rhein-Wupper-Kreis (Opladen)|
SWA|Rheingau-Taunus-Kreis (Bad Schwalbach)|
RÜD|Rheingau-Taunus-Kreis (Rüdesheim)|Hessen
GL|Rheinisch-Bergischer Kreis (Bergisch Gladbach)|
RPL|Rheinland-Pfalz|
RY|Rheydt|
NES|Rhön-Grabfeld (Bad Neustadt)|
RDG|Ribnitz-Damgarten|
RID|Riedenburg|
RIE|Riesa|
RG|Riesa-Großenhain (Großenhain)|
RL|Rochlitz|
ROK|Rockenhausen|
ROD|Roding|
RO|Rosenheim|Bayern
ROS|Rostock|
ROF|Rotenburg|
ROH|Rotenburg|
ROW|Rotenburg|Niedersachsen
RH|Roth|Bayern
ROT|Rothenburg ob der Tauber|
PAN|Rottal-Inn (Pfarrkirchen)|
ROL|Rottenburg|
RW|Rottweil|Baden-Württemberg
RSL|Roßlau|
RU|Rudolstadt|
RM|Röbel|
RÜG|Rügen (Bergen)|
SHK|Saale-Holzland-Kreis (Eisenberg)|
SOK|Saale-Orla-Kreis (Schleiz)|
SLF|Saalfeld-Rudolstadt (Saalfeld)|Thüringen
SK|Saalkreis|Sachsen-Anhalt
HOM|Saar-Pfalz-Kreis (Homburg)|Saarland
SB|Saarbrücken|Saarland
SAB|Saarburg|
SAL|Saarland|
SLS|Saarlouis|Saarland
LSN|Sachsen|
LSA|Sachsen-Anhalt|
SZ|Salzgitter|Niedersachsen
SGH|Sangerhausen|
GOA|Sankt Goar|
GOH|Sankt Goarshausen|
SLG|Saulgau|
SHG|Schaumburg (Stadthagen)|Niedersachsen
STH|Schaumburg-Lippe (Stadthagen)|
SEF|Scheinfeld|
SLE|Schleiden|
SCZ|Schleiz|
SL|Schleswig-Flensburg (Schleswig)|Schleswig-Holstein
SH|Schleswig-Holstein|
SLÜ|Schlüchtern|
SM|Schmalkalden-Meiningen (Meiningen)|Thüringen
SLN|Schmölln|
SOG|Schongau|
SOB|Schrobenhausen|
SC|Schwabach|
SMÜ|Schwabmünchen|
HR|Schwalm-Eder-Kreis (Homberg)|Hessen
SAD|Schwandorf|Bayern
SZB|Schwarzenberg|
ASZ|Schwarzenberg (Aue)|
VS|Schwarzwald-Baar-Kreis (Villingen-Schwenningen)|Baden-Württemberg
SDT|Schwedt|
SW|Schweinfurt|Bayern
SN|Schwerin|Mecklenburg-Vorpommern
GD|Schwäbisch Gmünd|
SHA|Schwäbisch Hall|Baden-Württemberg
SBK|Schönebeck|
SEB|Sebnitz|
SEE|Seelow|
SE|Segeberg (Bad Segeberg)|Schleswig-Holstein
SEL|Selb|
SFB|Senftenberg|
SI|Siegen|Nordrhein-Westfalen
SIG|Sigmaringen|Baden-Württemberg
SNH|Sinsheim|
SO|Soest|Nordrhein-Westfalen
SG|Solingen|
SOL|Soltau|
FAL|Soltau-Fallingbostel (Fallingbostel)|
SFA|Soltau-Fallingbostel (Fallingbostel)|
SDH|Sondershausen|
SON|Sonneberg|Thüringen
SP|Speyer|Rheinland-Pfalz
SPN|Spree-Neiße (Forst)|Brandenburg
SPB|Spremberg|
SPR|Springe|
IGB|St. Ingbert|Saarland
WND|St. Wendel|Saarland
SD|Stade|
STD|Stade|Niedersachsen
SRO|Stadtroda|
SAN|Stadtsteinach|
STE|Staffelstein|
STA|Starnberg|Bayern
SFT|Staßfurt|
IZ|Steinburg (Itzehoe)|Schleswig-Holstein
ST|Steinfurt|Nordrhein-Westfalen
BF|Steinfurt (Burgsteinfurt)|
SDL|Stendal|Sachsen-Anhalt
STB|Sternberg|
STO|Stockach|
STL|Stollberg|
OD|Stormarn (Bad Oldesloe)|Schleswig-Holstein
SBG|Strasburg|
SR|Straubing|Bayern
SRB|Strausberg|
S|Stuttgart|Baden-Württemberg
SHL|Suhl|Thüringen
SUL|Sulzbach-Rosenberg|
PIR|Sächsische Schweiz (Pirna)|Sachsen
LÖB|Sächsischer Oberlausitzkreis (Löbau)|
SÄK|Säckingen|
SÖM|Sömmerda|Thüringen
NIB|Süd-Tondern (Niebüll)|
MED|Süderdithmarschen (Meldorf)|
SÜW|Südliche Weinstraße (Landau)|Rheinland-Pfalz
TE|Tecklenburg|
TF|Teltow-Fläming (Luckenwalde)|Brandenburg
TP|Templin|
TET|Teterow|
TT|Tettnang|
THL|Thüringen|
TIR|Tirschenreuth|Bayern
TG|Torgau|
TO|Torgau-Oschatz (Torgau)|
TS|Traunstein|
TR|Trier-Saarburg (Trier)|Rheinland-Pfalz
TUT|Tuttlingen|Baden-Württemberg
TÜ|Tübingen|Baden-Württemberg
UM|Uckermark (Prenzlau)|Brandenburg
UER|Uecker-Randow (Pasewalk)|
UEM|Ueckermünde|
UE|Uelzen|Niedersachsen
UFF|Uffenheim|
UN|Unna|Nordrhein-Westfalen
UH|Unstrut-Hainich (Mühlhausen)|Thüringen
MN|Unterallgäu (Mindelheim)|Bayern
DIZ|Unterlahnkreis (Diez)|
USI|Usingen|
VAI|Vaihingen|
VEC|Vechta|Niedersachsen
VER|Verden|Niedersachsen
VIT|Viechtach|
VIE|Viersen|Nordrhein-Westfalen
VL|Villingen|
VIB|Vilsbiburg|
VOF|Vilshofen|
LAT|Vogelsberg-Kreis (Lauterbach)|
VB|Vogelsbergkreis (Lauterbach)|Hessen
V|Vogtlandkreis (Plauen)|Sachsen
VOH|Vohenstrauß|
VK|Völklingen|
WA|Waldeck (Korbach)|
KB|Waldeck-Frankenberg (Korbach)|Hessen
WÜM|Waldmünchen|
WT|Waldshut (Waldshut-Tiengen)|Baden-Württemberg
WG|Wangen|
WAN|Wanne-Eickel|
WZL|Wanzleben|
WAR|Warburg|
WRN|Waren|
WAF|Warendorf|Nordrhein-Westfalen
WAK|Wartburgkreis (Bad Salzungen, Eisenach)|
WS|Wasserburg|
WAT|Wattenscheid|
WEG|Wegscheid|
WEN|Weiden|Bayern
WM|Weilheim-Schongau (Weilheim)|Bayern
WE|Weimar|
AP|Weimarer Land (Apolda)|Thüringen
WUG|Weißenburg-Gunzenhausen (Weißenburg)|Bayern
WSF|Weißenfels|
DW|Weißeritzkreis (Dippoldiswalde)|
WSW|Weißwasser|
WDA|Werdau|
WR|Wernigerode|
ESW|Werra-Meißner-Kreis (Eschwege)|Hessen
WER|Wertingen|
WES|Wesel|Nordrhein-Westfalen
BRA|Wesermarsch (Brake)|
WEM|Wesermünde (Bremerhaven)|
MT|Westerwald (Montabaur)|
WW|Westerwaldkreis (Montabaur)|Rheinland-Pfalz
FB|Wetteraukreis (Friedberg)|Hessen
WZ|Wetzlar|
WD|Wiedenbrück|
WI|Wiesbaden|Hessen
WHV|Wilhelmshaven|Niedersachsen
WIS|Wismar|
WIT|Witten|
WB|Wittenberg|Sachsen-Anhalt
BLB|Wittgenstein (Bad Berleburg)|
WTL|Wittlage (Bad Essen)|
WTM|Wittmund|
WK|Wittstock|
WIZ|Witzenhausen|
WOL|Wolfach|
WF|Wolfenbüttel|
WOH|Wolfhagen|
WOR|Wolfratshausen|
WOB|Wolfsburg|Niedersachsen
WOS|Wolfstein (Freyung)|
WLG|Wolgast|
WMS|Wolmirstedt|
WBS|Worbis|
WO|Worms|Rheinland-Pfalz
WUN|Wunsiedel|
W|Wuppertal|Nordrhein-Westfalen
WUR|Wurzen|
WÜ|Würzburg|Bayern
ZEL|Zell|
ZE|Zerbst|
ZR|Zeulenroda|
ZIG|Ziegenhain (Schwalmstadt)|
BL|Zollernalbkreis (Balingen)|Baden-Württemberg
ZS|Zossen|
ZP|Zschopau|
ZW|Zweibrücken|Rheinland-Pfalz
Z|Zwickauer Land (Werdau)|Sachsen
ÖHR|Öhringen|
ÜB|Überlingen|
`;

export interface District {
  code: string;
  city: string;
  /** Leer, wenn nicht hinterlegt */
  state: string;
}

export const districts: District[] = RAW.trim()
  .split("\n")
  .map((zeile) => zeile.split("|"))
  .filter((teile) => teile.length === 3)
  .map(([code, city, state]) => ({ code, city, state }))
  .sort((a, b) => a.city.localeCompare(b.city, "de"));

const codeSet = new Set(districts.map((d) => d.code));

export function isKnownDistrict(code: string): boolean {
  return codeSet.has(code.toUpperCase());
}

export function findDistricts(query: string, limit = 8): District[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return districts
    .filter(
      (d) => d.code.toLowerCase().startsWith(q) || d.city.toLowerCase().includes(q),
    )
    .slice(0, limit);
}

/** Häufig angefragte Bezirke für die Übersichtstabelle auf der Startseite. */
export const featuredDistricts = [
  "HER", "BO", "E", "DO", "GE", "RE", "W", "D", "K", "MS", "B", "M",
]
  .map((code) => districts.find((d) => d.code === code))
  .filter((d): d is District => Boolean(d));
