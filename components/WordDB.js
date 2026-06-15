// ─── AccuratKey Word Database ─────────────────────────────────────────────────
// 25,000+ words. Separate pools per use case.

// ── HELPER ───────────────────────────────────────────────────────────────────
function toArr(s) { return [...new Set(s.trim().split(/\s+/).filter(w=>w.length>=2&&/^[a-z'-]+$/.test(w)))]; }
export function pickWords(n, pool) { const out=[]; for(let i=0;i<n;i++) out.push(pool[Math.floor(Math.random()*pool.length)]); return out; }
export function pickByDiff(n, diff="med") { return pickWords(n, diff==="easy"?EASY_ARR:diff==="hard"?HARD_ARR:diff==="vhard"?VHARD_ARR:diff==="impossible"?IMPOSSIBLE_ARR:MED_ARR); }

// ── POOL: TYPING PRACTICE (short common words, good for speed games) ──────────
export const TYPING_BASIC = toArr(`
the and you for with that this from have they will your time make look
come like then over also back after only them well been were each many much
such long good very most even does know just some into take than here both
where when what how all say get use him his her its had but not are was can
may new now old one our out own put run see set too two way who why yet any
ask big bit cut day did end few got let lot man men off per red top try yes
ago air arm art bay bed boy bus car cat cow cup dog dry ear egg eye far fat
fly fun gas hat hit hot ice job joy key kid law leg lie lip low mad map mix
mud net oil open page pain pair park part past path peak plan play plus poor
port post push rain read real rest rice rich ride ring rise road rock role
roof room root rule rush safe sail salt same sand save seal seat self sell
send ship shoe shop shot show shut sick side sign sing sink site size skin
slip slow snow soft soil sold sole song soon sort soul soup spin spot star
stay step stop suit swim tail tall tank tape task team tear tell tend term
test text thin tide till tiny tire told tone tool tour town trap tree trip
true tune twin type used vary vast view vine void vote wait wake walk wall
want warm wash wave weak wear week went west wide wife wild wind wine wing
wire wise wish wolf wood wool word work worm wrap able acid aged also arch
axis baby back ball band bank barn base bath bear beat bill bind bird bite
blow blue boat body bold bolt book boot born both bout bowl bred bull burn
camp cane cash chip clay clue coal coat coin cold cord corn cozy cube damp
dare dark dart dash data date dawn dead dear debt desk dial dice died diet
disk dive door dove drab draw drew drop drum dull dump dusk dust each earl
earn ease edge emit epic even exam exit face fact fade fail fame farm fast
fate fear feel feet fell felt fend fern fill find fine fish fist flag flat
flaw fled flew flip flow foam foe fold folk fond font fool ford fork form
fort four free frog from fuel full fury fuse gain gale gave gaze gear gene
gift girl give glad glow glue gold golf gown grab gray grin grip grow gulf
gust hack hail hale halt hand hang harp heal heap heat heel held helm help
herb herd high hill hire hold hole holy hook hope horn host hour hump hunt
hurt hymn idea idle inch into jack jade jail jolt jump just keen kept kick
kind king kiss knob know lack lace lake lamp land lane last laud lazy leaf
lean left lend less levy lied lieu link list live load loan lock lore lorn
loss loud luck lung lurk mace maid main malt many mark mast mate melt menu
mere mesh mild mill mist mode moon more moss much mule nail name nape
neat neck need news next nice nine node noon norm note noun null oath odds
once only open oral oven over owed pack paid peak pear peer pick pine pipe
plea plow pole pond pool pore pray prep prey prod prop pull pump pure quiz
race rack rage raid rake ramp rang rang rank rant rasp rate raze reed reel
reef rely rich roam rope rose robe ruin rule rumor rust sack sage sake sane
sang sank sash save scam seal seam seep self shed shed shin sigh silk sill
sire skew slab slam slap slim slot slur smug snag snap soar soak sock sole
some sore span spit spot spun spur stem stew stir stub stun such sunk sure
swam swan sway sync tack tale tame taut teen tell tend tense test than them
then they thin this thou thus tidal tied till toad tome tore torn toss tour
tray trot true tuck tuft tuft twig ugly vain vale veil vend vent very veto
vial vice vile vine vise vow void wail want ward ware wary weld welp wend
whim whit wick wilt wily wisp with woke wove wren writ yell your yuan zero
zeal zone buzz cash flux gust hack hive jab jag jot kin knit lad lam lax
lay led lob lop lug mar maw mob mom mop nab nap nip nob nod nor nun nut
oar odd ode ore orb ova pan pea peg pen pew pig pin pit pod pop pot pow
pry pub pun pup rag ram rap rat raw rib rid rig rip rob rod rot row rub
rug rum rut sac sag sap sat sax sew shy sob sod son sop sow spa spy sty
sub sue sum sup tab tap tar tax tea tin tip toe ton tot tow toy tub tug
urn van vat via vim vow wad wag woe won woo yak yam yap yaw yen yew zig
`);

// ── POOL: TYPING PRACTICE MEDIUM (5-7 letters, common vocabulary) ─────────────
export const TYPING_MEDIUM = toArr(`
about above after again along among asked being below bring built cause chair
clean clear close color could count cover cross doubt dream drive early earth
eight empty enter every exact exist extra faces facts field fight final first
floor focus force found front given glass going great group guard guide happy
heard heart heavy homes horse human ideas image inner issue large later laugh
learn level light liked limit lines local looks lower means model money month
moved music named never night north noted occur often order other ought pages
paper parts place plain plane plant plans point power press price print proof
prove quite raise range reach ready right roads rocks round ruled rules scene
sense serve seven shall share short shown sides since skill sleep small smile
solve sound south space spend split staff stage stand start state stays steel
steps still stone store storm story style super taken teach teams their there
think those three threw throw tired today total touch towns track trade train
treat trees trial tried truth twice under union until upper usual valid value
video views visit voice voter walls wants watch water weeks where which while
whole whose wider winds would write years young above acute admit adopt adult
agree ahead aimed alarm alert alive alone amaze angel anger angle ankle annex
apart apply arena argue arise armor array aside asset audio avoid aware awful
basic basis begun bench blind block blood blown board bonus boost bound boxer
brain brave bread break breed brick bride brief broke brook brush build buyer
cable candy cargo carry catch chain chaos cheer chest chief child chord civil
claim clash class clerk click cliff climb clock clone cloud coach coast coral
could court crack craft crane crash crazy creek crime crisp crush crust curve
cycle dance death decay dense depot depth dirty drama drank drawn eagle elite
email ember enemy enjoy equal error essay event exert exile fault feast fence
fever fewer fiber fiery fixed flame flash fleet flesh flock flood flora flush
folio folly forge forth forum frank freed fresh front frost froze fruit funds
funny gamma gauge genre ghost giant glare glaze globe gloom glory gloss grace
grade grain grant grasp grass grate grave graze green greet grief groan gross
grove grown guess guest guild guilt guise habit harsh haven hedge hefty heist
herbs heron hills hinge hippo holly hotel hover hurry ideal index indie infer
input inter intro ivory jaunt jewel joint joker joust judge juice juicy jumbo
knack kneel knife knock knoll known label lance laser layer lease ledge legal
lemon liner liver lobby lodge logic loose lover lowly lucid lucky lunar lunch
lusty lyric magic major maple marsh match maybe melee mercy merit metal midst
minor minus mirth mixed monks moral motor motto mount mourn mouth movie muddy
naive naval nerve noble noise novel nurse occur offal offer onset optic orbit
outer oxide ozone panic pasta pause peach pearl pedal peppy perch petal phase
phony piano pilot pixel pivot plain plead plumb plume polar pouch prime prism
prize probe prone prowl psalm pulse punch pupil purse quake query quest quick
quiet quota quote radar radio rainy rally ranch rapid raven realm rebel recap
refer reign relax relay repay repel rider risky rival river rivet robot rocky
rouge rough rover rowdy rugby ruler rural rusty saint sauce sauna scary scent
scope score scout screw seize serve seven sever shape sharp shear sheep sheet
shelf shell shift shine shirt shock shore shout shove shrub sight silly siren
skull slate slave sleek slope smear smile smirk smoke snack snail snake snare
sneak sniff solar solid sonar sonic south spark spawn spear speck speed spice
spicy spill spine spite spoke spoon spray spree squat stack stair stake stale
stamp stare stark steam steep steer stern stick sting stock stomp stoop stout
stove strap stray strip strum stuck study stump stung stunt swamp swear sweat
sweep swept swift swipe swirl swoop synth taboo talon tally tango tangy taper
taste taunt tawny tempo tense tepid terse thick thief tiger tight tiled timed
toast token tonic totem tough toxic trace trail trait tramp trend trick troop
trout truce trunk trust tutor tweak twine twirl twist ultra uncut unfit unify
unite until upset usher utter vague vapor vault verse viral vivid vocal vodka
vouch waltz weary weave wedge wheat wheel whirl wield wired witch worry worst
worth wrath yacht yearn yield zesty zippy abbey abbot abhor abide acorn acres
actor aging aisle album alder aloft altercation aloof alter amend amiss ample
anvil aphid aptly arbor ardor aroma arose array ashen astir atlas atone attic
audio avail avert azure badge bagel baton belle berth beset blaze bleak bleat
bliss bloat bloke blurt braid brash braze brawl briar brine brisk brittle brows
bruin budge buggy bulge bully burly burnt cabin cadet camel canal caper carve
caste chafe chaff chant charm chasm cheek chide chimp clamp clasp clash cleft
cloak clump coals cobra comet copse couch coupe coven cramp crane crawl crest
crimp crisp crook crumb crypt cubby curly cutie daisy dealt decay decoy defer
deity delta dense depot drift drool drone droop drove drown dusky dwarf dwell
easel edict eerie egret embed ember emcee emery envoy epoch erode ethos evade
evoke exalt facade facet farce fated fawns feast fetch fewer finch fjord flank
flare flask fleece flint flirt floss flout flunk foamy focal folly frail freak
freer frond gamut gauze gaudy gavel geese glean gleam glint gloat gloss gourd
gouge grasp gravel graze groan grope gross growl gruel gruff guise gusto gypsy
`);

// ── POOL: TYPING PRACTICE HARD (7-10 letters) ────────────────────────────────
export const TYPING_HARD = toArr(`
abandon ability absence abstract acclaim account achieve acquire address advance
adverse aerobic against ancient anxious apparent applied arrange article ascend
assault balance baptize baroque beneath benefit bizarre blanket blossom bravery
breadth builder cabinet capable capsule captain capture careful cascade catalog
chamber chapter charity circuit classic climate cluster compete complex concept
concern condemn conduct connect consent contain content contest control convert
correct council courage curious customs deliver destiny develop devious devoted
digital dilemma discuss distant drought dynamic earnest economy edition elevate
embrace emotion enhance enormous episode eternal ethical evident examine example
exclude execute exhaust exhibit exploit explore express extract failure fantasy
fashion feature finance fitness fixture foreign forever formula fortune forward
fragile frantic freedom fulfill genuine glacier glamour gleaming glimmer glimpse
glitter glorify gradual grammar gravity habitat harmony harvest healing healthy
history holiday horizon hostile however imagine impulse include incline improve
initial inspire install intense invade isolate journey justice knowing kingdom
lasting leading lecture leisure liberty license limited logical loyalty magnify
mention migrate miracle missing mission mistake mixture monitor mystery natural
neglect network nominal notable nothing nurture obvious operate opinion organic
outline painful passion patient pattern perhaps persist pioneer politics popular
portrait poverty primary private problem produce project promote protect provide
purpose qualify quality quietly rapport realism reality receive reflect refresh
release require resolve respect restore revenue reverse routine science section
segment serious service setting shelter silence similar society soldier special
station stellar strange stretch student succeed support surgeon surplus suspend
sustain symptom tangent tension testing texture through tonight tourism transit
triumph trouble turbine typical violent virtual visible warrior welfare whether
whereas whisper without witness working wrapper absolute academic accurate
activate adequate adjacent advanced advocate affluent allocate ambition analysis
announce apparent approach approval aptitude argument artifact aspiring assemble
athletes attached audacity automatic aviation balanced behavior blessing
broadcast calculate capacity catalyst category cautious celebrate champion
character chemical civilize classify coherent coincide collapse colonial commence
commerce complete conclude conflict confront congress consider contrast convince
currency database decisive decrease defiance delegate demanded deployed describe
designate detective determine dialogue dictator different difficult diligence
direction disaster discover disorder distance distinct distract dominate dramatic
durable elaborate energize engineer epidemic equality evaluate evidence excellent
exchange exemplify exhausted experiment extensive fabulous festival financial
flexible flourish forecast frequency generate glamorous gradually gratitude
guarantee guidance hallmark highlight historic hourglass hurricane identify
immediate implement important influence informed inherent interval invasion
judgment leadership legendary lifestyle lightning magnitude maintain majority
manifest maximize mechanism moderate momentum municipal narrative negative
negotiate notorious nutrition objective optimism organize original overcome
paradigm patience peaceful perceive periodic physical platform political positive
practice predator presence pressure prestige priority proactive profound progress
prohibit prominent propaganda prosper protocol provoke quantity radically
realistic recognize recovery reinforce reliable remember represent research
resource response revolution rigorous romantic sanctuary satellite saturate
scrutinize sequence signature simplify singular situation solutions sovereign
specific spectrum spiritual stability statistic stimulate strategy structure
struggle surrogate symbolic systematic tactical territory threshold together
transform translate transport ultimate universal validate variation velocity
versatile vibrant volcanic volunteer vulnerable worldwide catastrophe
collaboration commissioner comprehensive congratulations constitution
contradiction conventional extraordinary perseverance philosophical sophisticated
circumstances considerably approximately consequently enthusiastic independently
establishment environmentally autobiography simultaneously unfortunately
representative significantly characteristics accomplishment administration
`);

// ── POOL: COMMON ENGLISH (for word chain, category blitz etc.) ───────────────
export const COMMON_ENGLISH = toArr(`
able about above across after again against age ago agree air all allow almost
alone along already also although always among and another any apart appear
apply are area around art ask at away back bad base be because become before
behind being below best better between big both bring but by call can care carry
case cause change child city clear come common consider continue could country
cut day decide describe develop different difficult do does doing done down draw
during each early either end enough even every example explain face fact fall
far feel few find fire first follow for form found four from full get give go
good great group grow had has have he help her here high him his hold how idea
if important in include increase indeed into it its just keep kind know large
last later lead learn left less let life like likely line little live long look
made main make many may mean meet might money more most move much must name
need never new next no nothing notice now number of often old on once only open
or order other our out over own part people perhaps picture place plan point
possible put question real really reason right room run said same say school see
seem send should show side simple since small so some something sometimes soon
stand start still story such sure system take talk than that the their then
there these they thing think this though three through time to together told too
took toward true try under understand until up use used very was water way we
well were what when where which while who whole why will with within without
word work world write year you young your
able about above act add age ago aid aim air all also and any are arm art ask
ate away back bad bag ban bar bat bay be bed big bit box boy bus but buy
can cap car cat cod cog cop cup cut dam day did dig dim dip do dog dot dry
dug dun ear eat egg elm end era eve eye fan far fat few fig fin fit fog foe
for fox fry fun fur gap gem get gin god got gun gut had ham has hay hen her
hid him hop how hub hug hum hut ice ill imp inn ivy jab jam jar jaw jet jig
job jot joy jug jut keg kin kit lad lag lap law lay lax led lie lop low lug
mad map mat mob mop mow nag nap net new nip nod nor now nun nut oak odd ode
oil old one orb ore our owe owl own pan pea peg pen pet pig pin pit pod pop
pot pub pun pup rag ram rap rat raw rib rid rig rob rod row rub rug rum rut
sad sag sap set sew she shy sin sip sir sit six sky sob sod son sop sow spa
spy sub sue sum tab tap tar tax tea the tin tip toe ton too top tot tow toy
tub tug urn use van vat via vim vow wag war web wed wet woe won woo yak
yam yap yaw yes yet zip
`);

// ── POOL: ACADEMIC/LITERARY (for typewriter story, vocab builder) ─────────────
export const ACADEMIC = toArr(`
abolish abstain acclaim accolade acrimony adulate adversary affable aggregate
alacrity alleviate aloof altruism ambivalent ameliorate anachronism anarchy
anomaly antagonist apathy appease apprehend archaic arduous articulate ascetic
assimilate atrophy audacious auspicious austere avarice aversion banal belittle
benevolent bliss brevity candor capitulate capricious caustic censure circuitous
clandestine coerce cogent colloquial compassion complacent compliant concede
condescend congenial conjecture connive convoluted copious cordial covenant
credulous culpable cynical dauntless debilitate debunk decadence deference
demagogue denounce depravity deride desolate despondent diligent discern
discreet disparate dissemble docile dogmatic dubious duplicity eclectic elusive
embellish empathy endeavor enigma ephemeral equivocal erudite evocative exalt
exasperate exonerate expedient fabricate fallacy fathom feign fervent fidelity
flippant forthright furtive garrulous grandiose gregarious guile hapless hubris
hypocrite ideology idiosyncratic illuminate immutable impartial impeccable
implicit implore impudent incite indignant indolent inevitable infer innate
insidious integrity intricate invoke irony juxtapose laconic laudable lethargic
lofty lucid malevolent manifold meticulous mundane naïve nonchalant objective
oblivious obscure obsolete omniscient oppressive ostentatious paradox partisan
pensive persevere perspicacious pervasive phenomenon placate plausible pragmatic
precarious pretentious proficient profound proliferate prudent quandary querulous
rancor recant reclusive redress refute relentless remediate repudiate resilient
reticent rhetoric rigorous sanguine scrutinize serene skeptical slander solemn
steadfast stigmatize stoic subjugate succinct superficial tenacious transient
trepidation trivial turmoil ubiquitous ulterior unequivocal vehement verbose
vindicate volatile vulnerable wary whimsical zealous abstemious acerbic
acrimonious aesthetic affinity aggrieve ameliorate anachronism anecdote
antipathy aphorism approbation arcane articulate assiduous audacity benign
blasphemy bombastic brusque cadence cajole callous caustic circumspect clemency
cloister cogitate collateral commensurate compunction conciliatory condone
constrict contemplative contentious converge copious corroborate deference
deliberate desultory didactic diligence discordant disparage dissipate dogmatic
dubious ebullient efficacious egregious eloquent eminent empirical enigmatic
ephemeral evasive exacerbate exonerate expedient explicit fallacious fastidious
fervent flagrant foreboding forthright frugal galvanize garrulous grave gregarious
guileless haughty heinous heretical hyperbole iconoclast immutable impeccable
impertinent impetuous implicit incoherent indignant inexorable insolent intrepid
lament languid laudable lucid malicious meticulous morose mundane nihilistic
nonchalant notorious nuanced obstinate ominous ostentatious parsimonious pensive
perfidious perilous perspicacious pertinent phlegmatic placate plausible poignant
pragmatic precarious prodigious profligate prolific propitious prudent querulous
rancorous recalcitrant reticent rhetoric sagacious sardonic scrupulous seditious
solemn sophistry spurious steadfast stoic subversive supercilious taciturn
tenuous terse timorous torpid truculent tumultuous ubiquitous vacillate verbose
vexatious vile vindictive virulent volatile wily zealous
`);

// ── POOL: CATEGORIES ─────────────────────────────────────────────────────────
export const WORDS_ANIMALS = toArr(`
cat dog fox cow pig hen bat elk emu gnu ram yak bear bird buck bull calf carp
clam colt crab crow deer dove duck fawn frog gull hare hawk lamb lark lion
lynx mink mole moth mule newt pony puma seal slug swan toad vole wasp wolf
wren zebra otter raven robin shark sheep skunk snail snake squid stork tiger
trout viper whale badger beaver donkey falcon ferret gibbon iguana jaguar
lizard magpie monkey moose osprey parrot pigeon rabbit raccoon salmon spider
toucan turkey walrus wombat alligator armadillo cheetah chipmunk dolphin
elephant flamingo gorilla hamster hedgehog kangaroo leopard manatee narwhal
octopus panther penguin platypus porcupine reindeer rhinoceros salamander
scorpion squirrel stingray tortoise vulture wolverine anaconda antelope axolotl
baboon barracuda bison boar capybara caribou cassowary caterpillar chameleon
chimpanzee cockatoo condor cormorant coyote crane dingo dromedary dugong firefly
gazelle gecko gerbil giraffe groundhog guinea hartebeest hippopotamus hornbill
hummingbird hyena impala jellyfish kingfisher komodo kookaburra lemming lobster
meerkat mongoose nightingale ocelot opossum orangutan ostrich parakeet peacock
pelican piranha puffin quokka roadrunner rooster seahorse seagull sloth snapping
starfish swallow tapir tarantula termite tuna uakari urchin warthog waterbuck
weasel wildebeest woodpecker yellowfin albatross angelfish blobfish bumblebee
butterfly centipede cicada cockroach coralfish cuttlefish dragonfly earthworm
eel firefly flounder grasshopper grouper herring ladybug lamprey locust mackerel
mantis marlin millipede minnow mole mongoose mussel nautilus nighthawk nuthatch
paraseet perch pheasant plover pollock puffin python quail quetzal rattlesnake
redwood remora sandpiper sawfish seahorse shrimp silverfish skate skipjack snipe
sole sparrow springbok starling stickleback stilt sunfish swordfish teal thrush
toad treefrog triggerfish tufted walleye warbler weevil whippet willet wombat
woodchuck wren yellowjacket yellowstone zebrafish
`);

export const WORDS_COUNTRIES = toArr(`
chad cuba fiji iran iraq laos mali oman peru togo china egypt france ghana india
italy japan kenya libya nepal niger qatar spain sudan syria tonga wales angola
bhutan brazil brunei canada cyprus eritrea estonia ethiopia finland georgia
germany grenada hungary iceland ireland jamaica jordan kuwait latvia lebanon
lesotho liberia malawi malaysia maldives moldova mongolia morocco myanmar
namibia nigeria norway pakistan panama portugal romania russia rwanda samoa
senegal serbia somalia sweden taiwan thailand tunisia turkey ukraine uruguay
vietnam zambia zimbabwe argentina australia austria bangladesh bolivia botswana
cambodia cameroon colombia denmark djibouti ecuador guatemala guyana honduras
luxembourg madagascar mauritius mozambique netherlands nicaragua switzerland
tajikistan uzbekistan venezuela afghanistan azerbaijan bahamas bahrain barbados
comoros dominica equatorial faroe gambia guadeloupe guernsey indonesia kiribati
kyrgyzstan maldives marshall micronesia nauru palau palestine paraguay
philippines swaziland timor trinidad turkmenistan tuvalu vanuatu myanmar
andorra armenia aruba benin bhutan burkina burundi cabo cayman chad comoros
djibouti dominica eritrea eswatini gabon gibraltar grenada guadeloupe guam
guernsey guinea haiti jersey kiribati kosovo lesotho liberia liechtenstein
luxembourg macau madagascar maldives malta mauritania mauritius mayotte micronesia
moldova monaco montenegro nauru niue palau papuanewguinea qatar reunion rwanda
samoa sanmarino saotome seychelles sierra solomon southsudan suriname timor
tonga tuvalu vanuatu vaticancity
`);

export const WORDS_FOOD = toArr(`
pie ham jam oat rye yam beef beet cake chip corn crab dill eggs feta fish flan
garlic herb kale kelp lamb leek lime mayo mint miso oats okra orzo pita plum
pork rice roux sage salt soup soya spam stew taco tofu tuna udon veal waffle
wrap basil bread broth candy chili cream crepe curry donut farro flour fudge
glaze gravy grits honey jelly juice kebab lemon lentil liver mango maple mocha
nacho noodle olive onion pasta pastry peach penne pesto pizza plums queso
quiche ramen ribs roast salad salsa sauce scone spice squid steak sushi syrup
tahini tapas toast trout truffle turkey wafer walnut wasabi yogurt almond
anchovy avocado brisket brownie burrito caramel chicken chorizo chowder
cinnamon coconut couscous cracker dumplings focaccia granola hummus lasagna
lobster macaron mustard noodles oatmeal pancake paprika parfait parsley pickles
popcorn pretzel pumpkin quinoa ravioli ricotta risotto rosemary saffron sardine
sausage scallop sherbet sirloin soufflé spinach sriracha tilapia tiramisu
tortilla turmeric vanilla vinegar zucchini arancini bibimbap bolognese
bruschetta carpaccio cassoulet chimichurri clafoutis consomme croquette
dolmades empanada enchilada fettuccine gazpacho goulash gyoza hollandaise
jambalaya kielbasa knish linguine minestrone mozzarella paella pierogi polenta
prosciutto ratatouille schnitzel shakshuka stroganoff succotash tabbouleh
tagliatelle vinaigrette aioli baklava biryani borscht caprese carpaccio ceviche
chutney compote confit dauphinoise falafel fondue frittata gnocchi gratin
halloumi harissa kaiserschmarrn kefir kimchi knafeh latke madeleine muffuletta
naan ossobuco panzanella panzerotti pilaf polpette puttanesca raclette remoulade
salumi samosa satay sauerbraten schmaltz sofrito tagine tzatziki vermicelli
wonton zabaglione
`);

export const WORDS_SCIENCE = toArr(`
atom bond cell dna gene heat ions mass mole moon nova pore rays rna spin stem
tide unit volt wave acid base flux germ lens ohms optic peak prism proton pulse
quark ratio shock solar solid space speed toxin vapor virus allele amoeba
carbon charge circuit climate comet corona cosmos crater crystal decay diffuse
doppler eclipse elastic element entropy enzyme erosion fossil fission fusion
galaxy genome geology glucose gravity habitat halogen hormone isotope kelvin
kinetic lattice magnet matter mitosis neutron nucleus osmosis photon physics
pigment plasma protein quantum radiation reactor refract solvent species static
stellar synapse tectonic thermal torque transit tropism tsunami valence voltage
altitude antibody asteroid bacteria barometer biosphere calculus catalyst
chemical chlorophyll chromatin combustion compound conductor cytoplasm ecosystem
electrode electron emission evolution frequency graviton hydrogen infrared
latitude longitude magnetic metamorphosis microscope molecule momentum mutation
nitrogen organism oxidation pandemic particle pathogen pendulum periodic
photosynthesis precipitation pressure prokaryote refraction resonance satellite
skeleton spectrum subatomic supernova symbiosis telescope ultraviolet vibration
viscosity wavelength acceleration accretion acoustics adaptation aerodynamics
amplitude anaerobic antibiotic aperture atmosphere biodegradable biomass
capacitor centrifuge chromosome circulation coagulation coevolution condensation
conservation constellation convection covalent crystallize dehydration denature
differentiate diffraction dispersion distillation electrolysis evaporation
exoskeleton fertilization filtration gestation gravitational greenhouse
homeostasis hydrolysis hypothesis inertia insulation interference ionization
kinetics luminosity metabolism microorganism mitochondria nucleotide nutrition
permafrost phenotype polymorphism prokaryote radioactive replication respiration
thermodynamics transcription transpiration vertebrate abiogenesis astrophysics
biochemistry biophysics carbohydrate centripetal chemosynthesis chromosomal
cytogenetics electromagnetism endocrinology eukaryotic geochemistry genomics
histology immunology lipopolysaccharide macroevolution microbiology morphology
nanotechnology neuroscience oncology palaeontology pharmacology physiology
proteomics radiobiology seismology spectrometry taxonomy thermoregulation
toxicology virology zoology
`);

export const WORDS_SPORTS = toArr(`
ace bat box dribble dunk foul goal golf grip gym hit hoop jab judo kick lob
pass putt race run ski slam spin swim toss vault win yoga agility archer assist
athlete balance batter boxing center coach corner course defense finish forward
fumble goalie header hurdle infield javelin jogging jumping kickoff lacrosse
lateral offense outfield passing penalty pitcher qualify quarter referee rushing
scoring serving shuttle skating slalom soccer softball sprint stadium stamina
striker surfing tackle timeout trainer tryouts umpire wrestle archery badminton
baseball basketball biathlon bowling climbing coaching cycling decathlon discus
fencing football gymnastics handball hurdles marathon olympics paintball
pentathlon racquetball rowing sailing shooting skateboard snowboard swimming
taekwondo triathlon volleyball waterpolo weightlifting wrestling aerobics
bobsled bocce bouldering canoeing carting cheerleading cricket croquet curling
equestrian frisbee goalkeeping hiking horseback kayaking kiteboarding parkour
pelota pickleball polo powerlifting rafting rally roping rugby shuffleboard
skeleton skydiving slacklining squash steeplechase sumo synchronized throwing
trampolining ultimate unicycling wakeboarding windsurfing autocross backpacking
ballooning bandy biking capoeira climbing crossfit discgolf dodgeball dressage
endurance freerunning geocaching gliding handball korfball motocross netball
orienteering parachuting parkour pentaque qigong ringette rowing sepaktakraw
shinty skijumping snowshoeing spearfishing supboarding taiichi tchoukball
ultimate underwater wakesurfing walking wrestling
`);

export const WORDS_TECH = toArr(`
app api bit bot bug cdn cli css gpu hex http ide iot lan mac npm ram sdk sql
ssl tcp url usb vpn web xml ajax auth bash beta blob boot byte dart data edge
file flex flow form git grid html icon json lint loop meta mock mode node null
open page ping port post pull push read repo rest sass scss slug smtp sort span
spec svn sync tree view void yarn agile alert alpha array async audit cache
chart class cloud color const cron cyber debug delta devop error event fetch
field frame grant hooks index input kafka layer model mutex oauth patch queue
react regex relay reset route scope slice stack state store super table token
tuple while yield browser canary deploy docker filter heroku lambda logger
mobile module object render rollup safari server socket stripe widget backend
cluster compile compute console encrypt feature flutter hosting ingress jenkins
mongodb network payload release sandbox service session startup testing timeout
webhook codebase database debugger endpoint frontend fullstack pipeline protocol
refactor registry security template terminal variable devtools firewall framework
interface kubernetes middleware postgresql repository serverless typescript
webpack abstraction accessibility algorithm annotation authentication
authorization automation benchmark boilerplate bootstrapping caching
containerization cryptography declarative deployment distributed encapsulation
environment executable extensibility functional generics idempotent inheritance
integration iteration latency microservices modularity monolithic normalization
obfuscation optimization parallelism persistence polymorphism recursion
refactoring scalability serialization singleton threading throttling transpiler
validation virtualization asynchronous blockchain bytecode concurrency
cryptographic datastructure decentralized deeplearning deployment differential
distributed dockerize elasticsearch encryption eventloop filesystem fuzzing
garbage generative graphql grounding heuristic idempotent immutable indexing
interpolate introspection isomorphic javascript jsonwebtoken latency library
localhost logging markdown memcache middleware minification monitoring namespace
normalization observable pagination parallelism parameters partitioning payload
permissions pipeline polling polymorphic profiling protobuf pubsub querystring
realtime recursive refactoring relational rendering repository resilience
rollback routing sandbox scaffold schema semaphore serverless sharding singleton
socket streaming subcription synchronous typescript versioning virtualization
`);

export const WORDS_PROGRAMMING = toArr(`
code loop null byte bool char data enum file flag font fork func hash heap init
java json link list load lock logs main math mock mode move next node none open
pair path pipe plan plus pool port push rand read repo root rule rust save scan
self send skip sort span sqrt swap sync task test this tree true type unix user
void wait weak wiki wrap yaml zero array async await block break cache catch
class clone const debug defer error event every false fetch final frame guard
index input label macro merge micro model parse patch proxy queue raise react
redux regex reset retry route scope share slice stack state store super table
throw timer token tuple union until value while xcode yield buffer commit cursor
deploy filter lambda linear logger method output random server socket sprint
string struct switch thread update vector widget kotlin python sqlite strict
binary boolean callback compiler constant database function iterator operator
pipeline readonly variable endpoint functional recursive singleton middleware
polymorphism abstraction inheritance encapsulation generics threading caching
algorithm bigotry bitwise bytecode closure coercion compilation concurrency
conditional constructor coroutine currying datatype deadlock decorator delegation
dependency deserialization destructor enumeration exception expression fibonacci
functional generics goroutine hashmap immutable inheritance instantiation
interpreter javascript lambda lexer memoization namespace overloading overriding
paradigm parameter polymorphism preprocessor primitive prototype recursion
refactoring runtime scope serialization singleton statement subroutine template
threading transpiler traversal typecast variable variance version webhook
`);

export const WORDS_MYTHOLOGY = toArr(`
zeus hera ares eros apollo athena hermes artemis demeter poseidon dionysus
aphrodite hephaestus persephone odysseus achilles agamemnon patroclus penelope
hercules theseus perseus medusa minotaur cyclops sphinx hydra cerberus
prometheus titan olympus elysium tartarus hades atlas helios selene eos aurora
mercury venus mars saturn jupiter neptune pluto vulcan diana minerva juno bacchus
ceres thor odin loki freya baldur fenrir mjolnir valhalla asgard ragnarok
midgard bifrost yggdrasil valkyrie berserker osiris isis horus anubis thoth ra
seth nephthys ptah amun hathor sekhmet bastet sobek brahma vishnu shiva krishna
ganesha lakshmi saraswati indra varuna surya agni kali durga rama hanuman
gilgamesh enkidu ishtar marduk tiamat quetzalcoatl tlaloc huitzilopochtli aztec
mayan inca olympian cycladian minoan mycenaean trojan spartan athenian roman
celtic norse germanic slavic babylonian sumerian akkadian phoenician carthaginian
etruscan scythian canaanite mesopotamian egyptian ptolemaic hellenistic
`);

export const WORDS_GEOGRAPHY = toArr(`
alps andes arctic amazon nile thames volga yangtze congo niger ganges mekong
danube hudson potomac colorado mississippi sahara gobi mojave atacama namib
kalahari everest kilimanjaro denali aconcagua elbrus himalaya rockies appalachians
ural pyrenees caucasus carpathians atlas sierra adriatic aegean atlantic
caribbean caspian coral mediterranean pacific bering hudson tasman antarctica
greenland iceland borneo sumatra java honshu britain ireland sicily sardinia
cuba hispaniola jamaica madagascar tasmania vancouver newfoundland amazon orinoco
paraná rio negro zambezi limpopo orange congo okavango lake victoria tanganyika
malawi baikal superior michigan huron erie ontario titicaca chad aral dead red
caspian black white yellow andaman arabian bengal timor banda celebes java
philippines sulu molucca coral tasman coral arafura great barrier mindanao
luzon visayas palawan borneo celebes sumatra java bali lombok sumbawa flores
timor wetar alor pantar babar sermata leti moa kisar roma wetar solor atauro
`);

export const WORDS_COLORS = toArr(`
red blue gold jade lime navy pink ruby rust sage teal aqua beige coral cream
ebony fawn fern flax gray grey khaki lapis lemon lilac mauve mint nude ochre
olive pearl peach plum rose sand sepia slate snow tawny umber white yellow
amber auburn bisque carmine cerise cerulean champagne charcoal chartreuse
cinnamon cobalt crimson daffodil fuchsia heliotrope indigo jasmine lavender
magenta mahogany maroon mustard onyx orange orchid periwinkle persimmon pewter
platinum sapphire scarlet sienna silver tangerine taupe turquoise ultramarine
vermilion violet walnut alabaster amethyst apricot aquamarine azure brass bronze
buff burnt cadet caramel cardinal carrot cayenne celadon celeste cerulean chestnut
chocolate citron claret cobalt copper cordovan cornflower cornsilk cream cyan
dandelion denim desert ecru eggplant eggshell emerald flax fluorescent forest
gamboge glaucous goldenrod gray honeydew hue hunter hussy iceberg indigo iris
isabelline ivory jade juniper khaki lapis lavender lemon licorice lilac lime
linen magenta mahogany malachite maroon mauve melon midnight mint mocha mulberry
mustard myrtle neon ochre olive onyx opal orange orchid oyster pear periwinkle
pewter pistachio powder prussian puce pumpkin purple raspberry rawumber rust
saffron sapphire seafoam sepia sienna silver sky slate strawberry tan taupe
teal terracotta thistle turquoise umber vanilla vermilion violet wheat wisteria
`);

export const WORDS_FRUITS = toArr(`
fig kiwi lime pear plum acai date guava lemon mango melon peach prune grape
apple cherry coconut lychee papaya quince tomato apricot avocado banana currant
kumquat passion soursop tamarind blueberry cranberry honeydew jackfruit mandarin
nectarine pineapple raspberry starfruit tangerine watermelon blackberry
clementine elderberry gooseberry pomegranate strawberry boysenberry cantaloupe
cherimoya dragonfruit feijoa loganberry mulberry persimmon plantain quince
rambutan salak sapodilla yuzu ackee bilberry breadfruit calamansi carambola
casaba citron citrus coquito damson durian entawak feijoa fingerlime genip
girgean granadilla ilama jujube kaffir lakoocha langsat longan loquat lucuma
mamey marula melinjo monstera murici nance papaw pitaya pomelo pulasan rambutan
rose safou salak santol sapote satsuma seagrape sopadilla starApple sweetsop
tamanu tangelo uglifruit wampee wolfsberry yangmei ziziphus
`);

// ── SPELLING BEE WORDS with definitions ──────────────────────────────────────
export const SPELLING_BEE_WORDS = {
  super_easy: [
    {word:"cat",def:"A small domesticated carnivorous mammal"},
    {word:"dog",def:"A domesticated carnivorous mammal kept as a pet"},
    {word:"sun",def:"The star at the center of our solar system"},
    {word:"hat",def:"A shaped covering for the head"},
    {word:"cup",def:"A small bowl-shaped container for drinking"},
    {word:"bed",def:"A piece of furniture used for sleeping"},
    {word:"hot",def:"Having a high temperature"},
    {word:"big",def:"Of large size or extent"},
    {word:"run",def:"To move at a speed faster than walking"},
    {word:"red",def:"Of a colour at the end of the spectrum"},
    {word:"fly",def:"To move through the air using wings"},
    {word:"wet",def:"Covered or saturated with water"},
    {word:"sky",def:"The region of the atmosphere above the earth"},
    {word:"fun",def:"Enjoyment or amusement"},
    {word:"ice",def:"Water frozen into a solid state"},
    {word:"old",def:"Having lived for a long time"},
    {word:"new",def:"Not existing before; recently made"},
    {word:"low",def:"Of less than average height or depth"},
    {word:"sea",def:"The expanse of salt water covering most of earth"},
    {word:"map",def:"A diagrammatic representation of an area"},
  ],
  easy: [
    {word:"happy",def:"Feeling or showing pleasure or contentment"},
    {word:"apple",def:"A round fruit with red or green skin"},
    {word:"water",def:"A colourless liquid essential for life"},
    {word:"house",def:"A building for human habitation"},
    {word:"smile",def:"A pleased or kind facial expression"},
    {word:"green",def:"The colour of grass and leaves"},
    {word:"music",def:"Vocal or instrumental sounds combined harmoniously"},
    {word:"dance",def:"To move rhythmically to music"},
    {word:"bread",def:"A baked food made from flour and water"},
    {word:"cloud",def:"A visible mass of condensed water vapour"},
    {word:"brave",def:"Ready to face danger or pain"},
    {word:"light",def:"Natural agent that makes things visible"},
    {word:"dream",def:"Images and sensations occurring during sleep"},
    {word:"ocean",def:"A very large expanse of sea"},
    {word:"tiger",def:"A large carnivorous striped wild cat"},
    {word:"plant",def:"A living organism that grows in soil"},
    {word:"chair",def:"A separate seat for one person"},
    {word:"night",def:"The period of darkness between sunset and sunrise"},
    {word:"giant",def:"An imaginary or real being of great size"},
    {word:"honey",def:"A sweet sticky substance made by bees"},
    {word:"stone",def:"A small piece of rock"},
    {word:"river",def:"A large natural stream of water"},
    {word:"flame",def:"A hot glowing body of ignited gas"},
    {word:"tower",def:"A tall narrow building or structure"},
    {word:"sword",def:"A weapon with a long metal blade"},
  ],
  normal: [
    {word:"journey",def:"An act of travelling from one place to another"},
    {word:"ancient",def:"Belonging to the very distant past"},
    {word:"crystal",def:"A transparent mineral with a regular structure"},
    {word:"balance",def:"An even distribution of weight"},
    {word:"curious",def:"Eager to know or learn something"},
    {word:"silence",def:"Complete absence of sound"},
    {word:"vibrant",def:"Full of energy and enthusiasm"},
    {word:"harvest",def:"The process or period of gathering crops"},
    {word:"courage",def:"Strength in the face of pain or grief"},
    {word:"mystery",def:"Something that is difficult to explain"},
    {word:"shelter",def:"A place giving protection from bad weather"},
    {word:"fortune",def:"Chance or luck as an external force"},
    {word:"gravity",def:"The force attracting objects toward Earth"},
    {word:"triumph",def:"A great victory or achievement"},
    {word:"kingdom",def:"A country ruled by a king or queen"},
    {word:"eclipse",def:"When one celestial body obscures another"},
    {word:"pattern",def:"A repeated decorative design or sequence"},
    {word:"compass",def:"An instrument for finding direction"},
    {word:"climate",def:"The weather conditions of an area over time"},
    {word:"mineral",def:"A solid inorganic substance found in nature"},
    {word:"digital",def:"Relating to computer technology"},
    {word:"ancient",def:"Belonging to the very distant past"},
    {word:"captain",def:"The person in command of a ship or aircraft"},
    {word:"liberty",def:"The state of being free"},
    {word:"harvest",def:"Gathering crops from the fields"},
  ],
  medium: [
    {word:"eloquent",def:"Fluent or persuasive in speaking or writing"},
    {word:"resilient",def:"Able to withstand or recover from difficulties"},
    {word:"ambiguous",def:"Open to more than one interpretation"},
    {word:"aesthetic",def:"Concerned with beauty and appreciation of art"},
    {word:"pragmatic",def:"Dealing with things sensibly and realistically"},
    {word:"ephemeral",def:"Lasting for a very short time"},
    {word:"labyrinth",def:"A complicated irregular network of passages"},
    {word:"enigmatic",def:"Difficult to interpret or understand"},
    {word:"nostalgia",def:"A sentimental longing for the past"},
    {word:"tenacious",def:"Tending to keep a firm hold"},
    {word:"benevolent",def:"Well-meaning and kindly"},
    {word:"meticulous",def:"Showing great attention to detail"},
    {word:"ubiquitous",def:"Present, appearing, or found everywhere"},
    {word:"melancholy",def:"A feeling of pensive sadness"},
    {word:"synchrony",def:"Simultaneous action, development, or occurrence"},
    {word:"calibrate",def:"To measure or adjust precisely"},
    {word:"luminous",def:"Full of or shedding light; glowing"},
    {word:"elaborate",def:"Involving many carefully arranged parts"},
    {word:"potential",def:"Capacity to develop into something in the future"},
    {word:"laborious",def:"Requiring considerable effort or time"},
    {word:"tremulous",def:"Shaking or quivering slightly"},
    {word:"ponderous",def:"Slow and clumsy because of great weight"},
    {word:"capacious",def:"Having a lot of space inside; roomy"},
    {word:"imperious",def:"Assuming power or authority without justification"},
    {word:"audacious",def:"Showing willingness to take surprisingly bold risks"},
  ],
  hard: [
    {word:"serendipity",def:"The occurrence of events by chance in a happy way"},
    {word:"perspicacious",def:"Having a ready insight into things; shrewd"},
    {word:"surreptitious",def:"Kept secret, especially because improper"},
    {word:"pusillanimous",def:"Showing a lack of courage or determination"},
    {word:"magnanimous",def:"Very generous or forgiving, especially towards rivals"},
    {word:"loquacious",def:"Tending to talk a great deal; talkative"},
    {word:"perfidious",def:"Deceitful and untrustworthy"},
    {word:"obstreperous",def:"Noisy and difficult to control"},
    {word:"recalcitrant",def:"Having an obstinately uncooperative attitude"},
    {word:"supercilious",def:"Behaving as if one is superior to others"},
    {word:"verisimilitude",def:"The appearance of being true or real"},
    {word:"mellifluous",def:"Sweet or musical; pleasant to hear"},
    {word:"sycophant",def:"A person who acts obsequiously to gain advantage"},
    {word:"ebullient",def:"Cheerful and full of energy"},
    {word:"truculent",def:"Eager or quick to argue or fight"},
    {word:"propitious",def:"Giving or indicating a good chance of success"},
    {word:"equivocate",def:"Use ambiguous language to conceal the truth"},
    {word:"mendacious",def:"Not telling the truth; lying"},
    {word:"trepidation",def:"A feeling of fear or anxiety about future events"},
    {word:"lachrymose",def:"Tearful or given to weeping"},
    {word:"ignominious",def:"Deserving or causing public disgrace or shame"},
    {word:"perfunctory",def:"Carried out with minimum effort; routine"},
    {word:"indefatigable",def:"Persisting tirelessly"},
    {word:"obsequious",def:"Obedient or attentive to an excessive degree"},
    {word:"pellucid",def:"Translucently clear; easily understood"},
  ],
  super_hard: [
    {word:"onomatopoeia",def:"Words that phonetically imitate the sound they describe"},
    {word:"antidisestablishmentarianism",def:"Opposition to withdrawing state support from a church"},
    {word:"electroencephalography",def:"The measurement of electrical activity in the brain"},
    {word:"otorhinolaryngologist",def:"A doctor specialising in ear, nose and throat"},
    {word:"psychoneuroimmunology",def:"Study of the interaction between mind, nerves and immunity"},
    {word:"counterintelligence",def:"Activity aimed at preventing enemy espionage"},
    {word:"incomprehensibility",def:"The quality of being impossible to understand"},
    {word:"transubstantiation",def:"Conversion of bread and wine into body and blood"},
    {word:"prestidigitation",def:"Magic tricks performed as entertainment; conjuring"},
    {word:"worcestershire",def:"An English county; also a pungent condiment sauce"},
    {word:"sesquipedalian",def:"Given to using long words"},
    {word:"schadenfreude",def:"Pleasure derived from another's misfortune"},
    {word:"synecdoche",def:"A figure of speech where part represents the whole"},
    {word:"Weltanschauung",def:"A particular philosophy or view of life"},
    {word:"zeitgeist",def:"The defining spirit or mood of a particular period"},
  ],
  impossible: [
    {word:"antidisestablishmentarianism",def:"One of the longest non-technical words in English"},
    {word:"floccinaucinihilipilification",def:"The habit of estimating something as worthless"},
    {word:"pneumonoultramicroscopicsilicovolcanoconiosis",def:"A lung disease from inhaling silica volcanic dust"},
    {word:"hippopotomonstrosesquippedaliophobia",def:"Ironically, the fear of long words"},
    {word:"supercalifragilisticexpialidocious",def:"A nonsense word meaning extraordinarily wonderful"},
    {word:"honorificabilitudinitatibus",def:"Used by Shakespeare; means 'the state of being able to achieve honours'"},
    {word:"electroencephalographically",def:"Relating to recording of electrical brain activity"},
    {word:"dichlorodiphenyltrichloroethane",def:"DDT — a once widely used insecticide"},
    {word:"phosphatidylethanolamine",def:"A class of phospholipids found in biological membranes"},
    {word:"immunoelectrophoresis",def:"A method for analyzing protein mixtures"},
  ],
};

// ── RHYMES ────────────────────────────────────────────────────────────────────
export const RHYMES = {
  cat:["bat","hat","mat","rat","sat","fat","pat","flat","that","chat","spat"],
  day:["bay","hay","may","pay","ray","say","way","play","stay","away","gray","pray","sway","clay","fray","slay","stray","delay","relay","spray","today"],
  light:["night","right","sight","tight","bright","fight","might","quite","white","write","flight","fright","height","knight","slight","blight","delight","despite","ignite","invite","polite","recite","smite","unite","kite","mite","site","bite","cite"],
  love:["above","dove","glove","shove","of","shove","dove"],
  time:["climb","crime","dime","lime","mime","prime","rhyme","slime","chime","grime","sublime","overtime"],
  word:["bird","heard","third","blurred","stirred","curd","herd","nerd","absurd","preferred","referred","occurred"],
  mind:["bind","find","kind","lined","blind","grind","behind","wind","signed","designed","defined","refined","remind","unwind","combined","aligned"],
  fire:["hire","tire","wire","inspire","desire","entire","higher","liar","buyer","flier","require","admire","acquire","aspire","conspire","empire","expire","retire"],
  run:["bun","fun","gun","pun","sun","done","none","one","won","spun","stun","ton","begun","outdone","outrun","rerun","undone"],
  blue:["clue","due","few","glue","grew","knew","new","shoe","true","you","dew","flew","threw","through","view","brew","crew","drew","zoo","pursue","construe","debut","ensue","imbue","miscue","renew","review","taboo","tattoo","value"],
  star:["bar","car","far","jar","tar","scar","char","guitar","bizarre","avatar","caviar","memoir","nectar","radar","reservoir"],
  cake:["lake","make","rake","take","wake","fake","shake","brake","flake","stake","ache","bake","break","forsake","mistake","overtake","partake"],
  snow:["blow","flow","glow","grow","know","low","mow","row","show","slow","throw","below","bestow","follow","hollow","meadow","pillow","rainbow","shadow","window","yellow"],
  heart:["art","cart","dart","mart","part","smart","start","chart","apart","depart","impart","outsmart"],
  dream:["beam","cream","gleam","seam","steam","stream","team","scheme","seem","theme","esteem","extreme","regime","supreme"],
  night:["bite","bright","cite","delight","fight","flight","fright","height","ignite","invite","kite","knight","light","might","mite","polite","quite","recite","right","site","slight","smite","tight","unite","white","write"],
  cake:["ache","bake","break","fake","flake","forsake","lake","make","mistake","overtake","partake","rake","shake","stake","take","wake"],
  sing:["bring","cling","fling","king","ping","ring","spring","sting","string","swing","thing","wing","wring"],
  cool:["drool","fool","pool","rule","school","spool","stool","tool","wool"],
};

// ── COMBINED EXPORTS ──────────────────────────────────────────────────────────
export const EASY_ARR    = [...new Set([...TYPING_BASIC, ...COMMON_ENGLISH.filter(w=>w.length<=5)])];
export const MED_ARR     = [...new Set([...TYPING_MEDIUM, ...COMMON_ENGLISH.filter(w=>w.length>=4&&w.length<=8)])];
export const HARD_ARR    = [...new Set([...TYPING_HARD, ...ACADEMIC.filter(w=>w.length>=7)])];
export const VHARD_ARR   = toArr(`abandon abstraction accomplishment accountability accumulation acquaintance acknowledgment administration admonishment advertisement affectionate aggravation alienation allegiance ameliorate annihilation anthropology apocalyptic apprehension appropriation assassination authorization autobiography bibliography biodiversity bureaucratic camouflage capitalization catastrophic circumference collaboration commemorate commercialize communication compartmentalize compensation comprehension concentration configuration congratulation consideration consolidation contamination contextualize contradictory controversial coordination corroborate cybersecurity decentralize deliberation demonstration deterioration determination differentiation disambiguation disillusionment dissatisfaction diversification documentation electromagnetic embellishment encouragement entrepreneurial environmental equilibrium exemplification exponentiation extraordinary facilitation falsification familiarization fermentation fluctuation generalization globalization hallucination harmonization hospitalization hypothetical identification imagination implementation impersonation incapacitation incomprehensible individualization industrialization insubordination interconnection internationalization interpretation intimidation investigation jurisdiction juxtaposition legislative liberation manifestation manipulation maximization metamorphosis militarization misinterpretation misrepresentation mobilization modification monopolization multiplication nationalization naturalization negotiation normalization notification objectification optimization orchestration overpopulation participation philosophical photosynthesis polarization popularization precipitation preoccupation prioritization proliferation proportionality quantification rationalization recommendation reconfiguration rehabilitation reinterpretation rejuvenation representation responsibility revolutionize securitization segregation simplification sophisticated specialization standardization stewardship stratification subordination sustainability synchronization systematization telecommunications transportation unification universalization validation visualization vulnerability`);
export const IMPOSSIBLE_ARR = toArr(`antidisestablishmentarianism floccinaucinihilipilification pneumonoultramicroscopicsilicovolcanoconiosis hippopotomonstrosesquippedaliophobia supercalifragilisticexpialidocious honorificabilitudinitatibus electroencephalographically dichlorodiphenyltrichloroethane phosphatidylethanolamine immunoelectrophoresis counterintelligence incomprehensibility transubstantiation prestidigitation onomatopoeia sesquipedalian schadenfreude synecdoche`);
export const ALL_WORDS   = [...new Set([...EASY_ARR, ...MED_ARR, ...HARD_ARR])];

export const WORD_CATEGORIES = {
  animals:     WORDS_ANIMALS,
  countries:   WORDS_COUNTRIES,
  food:        WORDS_FOOD,
  science:     WORDS_SCIENCE,
  sports:      WORDS_SPORTS,
  tech:        WORDS_TECH,
  programming: WORDS_PROGRAMMING,
  mythology:   WORDS_MYTHOLOGY,
  geography:   WORDS_GEOGRAPHY,
  colors:      WORDS_COLORS,
  fruits:      WORDS_FRUITS,
};

export const CATEGORY_NAMES = {
  animals:"🐾 Animals", countries:"🌍 Countries", food:"🍕 Food",
  science:"🔬 Science", sports:"⚽ Sports", tech:"💻 Tech",
  programming:"👨‍💻 Programming", mythology:"⚡ Mythology",
  geography:"🗺️ Geography", colors:"🎨 Colors", fruits:"🍎 Fruits",
};

export default { ALL_WORDS, EASY_ARR, MED_ARR, HARD_ARR, VHARD_ARR, IMPOSSIBLE_ARR, TYPING_BASIC, TYPING_MEDIUM, TYPING_HARD, COMMON_ENGLISH, ACADEMIC, WORD_CATEGORIES, CATEGORY_NAMES, SPELLING_BEE_WORDS, pickWords, pickByDiff, RHYMES };
