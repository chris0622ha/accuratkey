"use client";
import { useState, useEffect } from "react";
import { onAuthStateChanged, signInWithPopup, signOut, signInWithEmailAndPassword, GoogleAuthProvider, GithubAuthProvider } from "firebase/auth";
import { getAdminAuth, getAdminDb, isAdmin, getAllUsers, getAllBans, getAllAdmins, banUser, tempBanUser, unbanUser, grantAdmin, revokeAdmin, adminSkipLevel, setAdminNote, getAdminNote, getActivityLog, setMaintenanceMode, getMaintenanceMode, getUserByUsername, logActivity, adminSetKeys, adminSetTrials, adminSetProfileAdmin, getProfilesForAdmin, getUserSessions, getUserLastSeen, warnUser, clearWarning, setBroadcast, getBroadcast, getAppStats, updateLevelWords, getLevelOverrides, getLevelFailStats, getAdminFeedback, dismissFeedback, getAdminBirthdayRequests, approveBirthdayRequest, rejectBirthdayRequest, replyToFeedback, getFlaggedScores, getRestoreRequests, approveFlaggedScore, dismissFlaggedScore, resolveRestoreRequest, getCoppaAuditSummary, runCoppaCleanup } from "@/lib/firebase";
import { KKey } from "@/components/icons/KKey";
const LEVELS = [
  { id:1,  name:"Home Row Hero",         emoji:"🏠", wpmTarget:12,  accuracy:75, color:"#10b981", words:["ffjj","fjfj","asdf","jkl;","add","ask","fall","glad","flask","lads","fads","salads"] },
  { id:2,  name:"Top Row Climber",       emoji:"🧗", wpmTarget:16,  accuracy:75, color:"#3b82f6", words:["quit","wrap","type","your","power","tower","write","pretty","quite","report"] },
  { id:3,  name:"Full Board Basics",     emoji:"⌨️", wpmTarget:20,  accuracy:75, color:"#8b5cf6", words:["the","and","for","you","big","hot","map","key","ask","say","put","old","new","see","try","own","two","way","how","run"] },
  { id:4,  name:"Word Builder",          emoji:"🔨", wpmTarget:25,  accuracy:75, color:"#f59e0b", words:["water","every","first","place","years","young","great","three","never","world","about","right","could","still","small","found"] },
  { id:5,  name:"Speed Seeker",          emoji:"🚀", wpmTarget:30,  accuracy:75, color:"#ef4444", words:["people","before","should","between","through","because","without","another","against","thought","looking","children","problem","school"] },
  { id:6,  name:"Rhythm Rider",          emoji:"🎵", wpmTarget:35,  accuracy:75, color:"#06b6d4", words:["practice","keyboard","fingers","accuracy","improve","typing","computer","program","achieve","success","quickly","journey","forward","perfect"] },
  { id:7,  name:"Flow State",            emoji:"🌊", wpmTarget:40,  accuracy:75, color:"#ec4899", words:["development","environment","technology","information","understand","experience","important","following","sometimes","something","everything","different"] },
  { id:8,  name:"Steady Hands",          emoji:"🎯", wpmTarget:45,  accuracy:75, color:"#f97316", words:["communication","international","organization","understanding","professional","relationship","immediately","particularly","responsibility","approximately"] },
  { id:9,  name:"The Zone",              emoji:"⚡", wpmTarget:50,  accuracy:75, color:"#a855f7", words:["implementation","administration","circumstances","representative","accomplishment","infrastructure","simultaneously","recommendations","acknowledgment"] },
  { id:10, name:"Turbo Typist",          emoji:"🔥", wpmTarget:55,  accuracy:75, color:"#ef4444", words:["thequickbrownfox","shesellsseashells","howmuchwoodcould","packmyboxwithfive","thefiveboxingwizards","jackdawslovemybig","fixingquartz","jumpingquickly","waxyourfivezinc"] },
  { id:11, name:"Precision Pro",         emoji:"💎", wpmTarget:60,  accuracy:75, color:"#6366f1", words:["extraordinary","indistinguishable","miscommunication","uncharacteristically","counterproductive","straightforwardness","unpredictability","incomprehensible","unconventionally","disproportionate","acknowledgement","characteristically","instantaneously"] },
  { id:12, name:"Key Wizard",            emoji:"🧙", wpmTarget:65,  accuracy:75, color:"#8b5cf6", words:["practiceisthekeytomastery","focusonaccuracybeforespeed","typingisaskillbuiltovertime","keepyoureyesonthescreen","smoothrhythmbeatsbursttyping","thequickbrownfoxjumpedoverthedog","alwaysreturntohomerow"] },
  { id:13, name:"Lightning Fingers",     emoji:"⚡", wpmTarget:70,  accuracy:75, color:"#facc15", words:["weholdthesetruthstobeselfevident","inthemiddleofeverydifficultyliesopportunity","successisnotfinalfailureisnotfatal","youmissonehandredpercentoftheshotsyoudontake","thebesttimetoplantatreewastwentyyearsago"] },
  { id:14, name:"Speed Demon",           emoji:"👹", wpmTarget:80,  accuracy:75, color:"#f43f5e", words:["tobeornottobethatisthequestion","allthatglittersisnotgold","thereisnothingeithergoodorbadbutthinkingmakesitso","itwasabrightcoldday","thecourseoftrueloveneverranunsmoothly"] },
  { id:15, name:"Legend",                emoji:"🏆", wpmTarget:90,  accuracy:75, color:"#fbbf24", words:["itwasthebestoftimesitwastheworstoftimes","asknotwhatyourcountrycandoforyouaskwhatyoucandoforyourcountry","fourscoreandsevenyearsagoourforefathersbroughtforthuponthiscontinent","onesmallstepformanonegiantleapformankind","donotgogentleintothatgoodnightrageinagethedyingofthelight"] },

  // ── NEW LEVELS 16-65 ─────────────────────────────────────────────────────────

  // Common words sprint
  { id:16, name:"Word Sprint",           emoji:"🏃", wpmTarget:35,  accuracy:75, color:"#22c55e", words:["time","person","year","way","day","thing","man","world","life","hand","part","place","case","week","company","system","program","question","government","number","night","point","home","water","room","mother","area","money","story","fact","month","lot","right","study","book","eye","job","word","business","issue","side","kind","head","house","service","friend","father","power","hour","game","line","end","among","while","name","land","large","soon","big","next","early","young","important","public","private","real","best","free","only","old","high","order","local","current","national","education","health","social","economic","political","legal","medical","financial","cultural","environmental","international","technological","scientific","historical"] },

  // Coding keywords
  { id:17, name:"Tech Talk",             emoji:"💻", wpmTarget:38,  accuracy:75, color:"#34d399", words:["function","return","const","let","var","if","else","for","while","class","import","export","async","await","try","catch","throw","new","this","true","false","null","undefined","typeof","instanceof","switch","case","break","continue","default","delete","void","yield","static","super","extends","implements","interface","package","private","protected","public","abstract","final","synchronized","volatile","transient","native","strictfp","assert","enum"] },

  // Tongue twisters (no spaces)
  { id:18, name:"Twist It",              emoji:"🌀", wpmTarget:40,  accuracy:75, color:"#f472b6", words:["shesellsseashellsbytheseashore","peterpiperpckedapeckofpickledpeppers","howmuchwoodwouldawoodchuckchuck","bettyboterboterbutterbutterisbitter","sixslipperysnailsslidslowly","redlorryyellowlorry","uniquenewyork","toyboatoyboat","thirtythreethiefsthoughtthings","blackbackbatbag","sixthickthisletssticks","rubberbabybuggybumpers"] },

  // Famous quotes no spaces
  { id:19, name:"Quote Runner",          emoji:"📖", wpmTarget:42,  accuracy:75, color:"#818cf8", words:["bethechangeyouwishtoSeeintheworld","theonlywaytodomadworkistolovewhatyoudo","imaginationismoreimportantthanknoWledge","lifeiswhatyoumakeit","thejourneYofathousandmilesbeginswithonestep","intheenditsnottheyearsinyourlifethatcountitsthelifeinyouryears","successisnotthekeytoHappiness","wherethereisnowillthereisaway","thebesttimetostartissecondbesttimenow"] },

  // Numbers and symbols adjacent to letters
  { id:20, name:"Number Words",          emoji:"🔢", wpmTarget:35,  accuracy:75, color:"#fb923c", words:["one","two","three","four","five","six","seven","eight","nine","ten","eleven","twelve","thirteen","fourteen","fifteen","sixteen","seventeen","eighteen","nineteen","twenty","thirty","forty","fifty","sixty","seventy","eighty","ninety","hundred","thousand","million","billion","trillion","first","second","third","fourth","fifth","sixth","seventh","eighth","ninth","tenth"] },

  // Animals
  { id:21, name:"Wild Words",            emoji:"🦊", wpmTarget:38,  accuracy:75, color:"#fbbf24", words:["elephant","rhinoceros","hippopotamus","chimpanzee","orangutan","crocodile","alligator","salamander","chameleon","porcupine","wolverine","armadillo","capybara","platypus","narwhal","flamingo","pelican","penguin","albatross","chameleon","komododragon","tarantula","scorpion","centipede","millipede","butterfly","dragonfly","hummingbird","woodpecker","roadrunner"] },

  // Geography
  { id:22, name:"Around the World",      emoji:"🌏", wpmTarget:40,  accuracy:75, color:"#2dd4bf", words:["Afghanistan","Bangladesh","Cameroon","Denmark","Ethiopia","Finlnad","Guatemala","Honduras","Indonesia","Jamaica","Kazakhstan","Lebanon","Madagascar","Namibia","Oman","Pakistan","Qatar","Romania","Singapore","Tanzania","Uruguay","Venezuela","Uzbekistan","Zimbabwe","Philippines","Switzerland","Netherlands","Azerbaijan","Mozambique","Kyrgyzstan"] },

  // Science words
  { id:23, name:"Science Lab",           emoji:"🔬", wpmTarget:42,  accuracy:75, color:"#38bdf8", words:["photosynthesis","mitochondria","chromosome","deoxyribonucleic","electromagnetic","thermodynamics","spectroscopy","chromatography","electrochemistry","astrophysics","neuroscience","biochemistry","paleontology","oceanography","meteorology","seismology","crystallography","nanotechnology","biotechnology","epidemiology","pharmacology","toxicology","immunology","bacteriology","virology","parasitology","genetics","genomics","proteomics","metabolomics"] },

  // Music related
  { id:24, name:"Music Words",           emoji:"🎵", wpmTarget:38,  accuracy:75, color:"#e879f9", words:["symphony","orchestra","instrument","melody","harmony","rhythm","tempo","dynamics","crescendo","diminuendo","fortissimo","pianissimo","allegretto","moderato","andante","accelerando","ritardando","syncopation","counterpoint","polyphony","monophony","heterophony","timbre","resonance","vibrato","tremolo","staccato","legato","pizzicato","arpeggiate"] },

  // Food names
  { id:25, name:"Food Run",              emoji:"🍕", wpmTarget:35,  accuracy:75, color:"#f97316", words:["spaghetti","carbonara","guacamole","quesadilla","enchilada","bruschetta","capricciosa","margherita","bolognese","fettuccine","prosciutto","mozzarella","parmesan","gorgonzola","mascarpone","tiramisu","cannoli","biscotti","panzanella","gazpacho","ratatouille","bouillabaisse","croissant","brioche","baguette","profiterole","macaroon","creme brulee","chateaubriand","bourgignon"] },

  // Alternating hands (ergonomic)
  { id:26, name:"Both Hands",            emoji:"🤲", wpmTarget:45,  accuracy:75, color:"#84cc16", words:["element","problem","visible","formula","bicycle","suspend","neurotic","penalty","stomach","blanket","captain","diagram","edition","fiction","general","hundred","journey","kingdom","laundry","maximum","nominal","optical","pattern","quality","railway","several","texture","unusual","vitamin","warning","exactly","factory","gallons","hundred","islands","jasmine","kitchen","lending","morning","nothing","opening","quickly","reading","setting","turning","uniform","village","western","younger"] },

  // Long compound words
  { id:27, name:"Long Words",            emoji:"📏", wpmTarget:48,  accuracy:75, color:"#a78bfa", words:["groundbreaking","overwhelming","understanding","uncomfortable","internationally","misrepresentation","straightforward","underestimated","overcomplicating","misunderstanding","underperforming","overachievement","counterintuitive","underdeveloped","interconnected","multidimensional","self-sufficient","extraordinarily","unenthusiastically","hypersensitivity","underappreciated","overprotective","misinterpreting","hyperventilating","uncharacteristic","unprofessional","disenfranchised","unconstitutional","insubordination","electromagnetic"] },

  // Short fast words
  { id:28, name:"Short Burst",           emoji:"💨", wpmTarget:55,  accuracy:75, color:"#f43f5e", words:["the","be","to","of","and","a","in","that","have","it","for","not","on","with","he","as","you","do","at","this","but","his","by","from","they","we","say","her","she","or","an","will","my","one","all","would","there","their","what","so","up","out","if","about","who","get","which","go","me","when","make","can","like","time","no","just","him","know","take","people","into","year","your","good","some","could","them","see","other","than","then","now","look","only","come","its","over","think","also","back","after","use","two","how","our","work","first","well","way","even","new","want","because","any","these","give","day","most","us"] },

  // Programming patterns
  { id:29, name:"Code Words",            emoji:"🖥️", wpmTarget:50,  accuracy:75, color:"#06b6d4", words:["functioncallback","returnpromise","asyncfunction","awaitfetch","trycatchfinally","constresult","letcounter","varlegacy","classcomponent","importreact","exportdefault","usestatehook","useeffecthook","arraymap","arrayfilter","arrayreduce","objectkeys","objectvalues","objectentries","jsonparse","jsonstringify","consolelog","consoleerror","documentquery","eventlistener","setinterval","settimeout","requestanimation","localstorageget","localstorageset"] },

  // Classic literature phrases (no spaces)
  { id:30, name:"Classic Lines",         emoji:"📚", wpmTarget:52,  accuracy:75, color:"#c084fc", words:["tobeornottobethatisthequestion","callmoishmael","itwasthebestoftimes","itisatruthuniversallyacknowledged","inthebeginningwastheword","onceupona timeinafarawayland","theonlywaytodogreatworkistoloveit","stayhungrystayfoolish","aneyeforaneyemakesthewholeworldblind","thejourneyofathousandmiles","weholdthesetruthstobeselfevident","fourscoreandsevenyearsago","asknotwhatyourcountrycan","spacethefinalfrontier","maytheforcebewithyou","elementarymydearwatson","franklydarlinidontgiveadamn","hereislookingatyoukid"] },

  // Medical terms
  { id:31, name:"Medical Terms",         emoji:"🩺", wpmTarget:50,  accuracy:75, color:"#34d399", words:["cardiovascular","hypertension","hyperlipidemia","atherosclerosis","arrhythmia","tachycardia","bradycardia","electrocardiogram","echocardiogram","angioplasty","appendicitis","cholecystitis","pancreatitis","gastroenteritis","nephrology","urology","neurology","ophthalmology","otolaryngology","rheumatology","endocrinology","hematology","oncology","pulmonology","dermatology","psychiatry","orthopedics","anesthesiology","radiology","pathology"] },

  // Sports
  { id:32, name:"Sports Words",          emoji:"⚽", wpmTarget:42,  accuracy:75, color:"#facc15", words:["touchdown","quarterback","linebacker","cornerback","defenseman","goalkeeper","midfielder","centerfield","shortstop","tournament","championship","semifinal","quarterfinal","elimination","qualification","substitution","penalty","offside","freeThrow","threepointline","powerplay","breakaway","fastbreak","alleyoop","slapshot","golfcourse","marathon","triathlon","decathlon","heptathlon"] },

  // Weather and nature
  { id:33, name:"Nature Words",          emoji:"🌿", wpmTarget:40,  accuracy:75, color:"#86efac", words:["thunderstorm","precipitation","evaporation","condensation","atmospheric","stratosphere","troposphere","mesosphere","thermosphere","magnetosphere","biodiversity","ecosystem","photosynthesis","decomposition","nitrogen","phosphorus","potassium","chlorophyll","mitochondria","chloroplast","metamorphosis","pollination","germination","deforestation","reforestation","conservation","sustainability","renewable","nonrenewable","hydroelectric"] },

  // Business jargon
  { id:34, name:"Business Words",        emoji:"💼", wpmTarget:48,  accuracy:75, color:"#94a3b8", words:["synergy","leverage","paradigm","scalable","disruption","bandwidth","stakeholder","deliverable","milestone","roadmap","iteration","agile","scrum","kanban","backlog","sprint","retrospective","onboarding","offboarding","performance","metrics","analytics","dashboard","pipeline","conversion","acquisition","retention","churnrate","engagement","monetization"] },

  // Mythology
  { id:35, name:"Mythology",             emoji:"🏛️", wpmTarget:45,  accuracy:75, color:"#fbbf24", words:["Prometheus","Persephone","Demeter","Hephaestus","Dionysus","Aphrodite","Poseidon","Artemis","Athena","Hermes","Odysseus","Achilles","Agamemnon","Patroclus","Penelope","Telemachus","Polyphemus","Calypso","Circe","Tiresias","Narcissus","Orpheus","Eurydice","Theseus","Ariadne","Minotaur","Andromeda","Perseus","Medusa","Bellerophon"] },

  // Alliterations
  { id:36, name:"Alliterations",         emoji:"🔤", wpmTarget:50,  accuracy:75, color:"#f472b6", words:["peterpiperpicked","sallysellsseashells","bigblackbugbled","seventhsleepysheep","smoothsnakeslid","sixslimyslugs","proudprancingpony","cleancleverclaws","dancing daffodils daily","fredforgotfifty","gracefulgreengecko","harvesthappyhens","ipicked icy igloos","junglejaguarjumped","kinkykrakenknocked","largelazylobsters","mintymorningmist","nicenauticalnight"] },

  // Rhyming words
  { id:37, name:"Rhyming Words",         emoji:"🎤", wpmTarget:45,  accuracy:75, color:"#fb923c", words:["lightnight","bringspring","thingring","playday","makebreak","fightmight","roundsound","loveabove","findkind","mindwind","growshow","knowflow","throwbelow","standhand","movelove","learnburn","highsky","tryfry","stayplay","waymay","beengreen","seenclean","donegone","sunfun","rungun","cometome","homeroam","timerime","dreamstream","heartstart"] },

  // Motivational phrases
  { id:38, name:"Power Phrases",         emoji:"💪", wpmTarget:55,  accuracy:75, color:"#ef4444", words:["believeinyourself","nevergiveuP","hardworkpaysoff","dreambigworkhardstayhumble","successisajourney","pushingyourlimits","beyondyourcomfortzone","disciplinebeatstalent","consistencyiskey","focusonprogress","onedayatatime","makeithappen","keepmovingforward","riseandgrind","noshortscuts","embracethegrind","stayhungry","keepgoing","beunstoppable","dominate"] },

  // Countries capitals
  { id:39, name:"World Capitals",        emoji:"🗺️", wpmTarget:42,  accuracy:75, color:"#38bdf8", words:["Canberra","Brasilia","Ottawa","Beijing","Bogota","Havana","Prague","Copenhagen","Cairo","Helsinki","Budapest","Reykjavik","Jakarta","Tehran","Baghdad","Dublin","Jerusalem","Tokyo","Amman","Nairobi","Pyongyang","Seoul","Beirut","Vilnius","Luxembourg","Skopje","Kuala","Valletta","Wellington","Kathmandu","Amsterdam","Islamabad","Manila","Warsaw","Lisbon","Bucharest","Moscow","Riyadh","Belgrade","Bratislava","Ljubljana","Mogadishu","Pretoria","Madrid","Khartoum","Stockholm","Bern","Damascus","Taipei","Ankara","Kyiv","Montevideo","Tashkent","Caracas","Hanoi","Sana"] },

  // Tech company names & products
  { id:40, name:"Tech Terms",            emoji:"🏢", wpmTarget:50,  accuracy:75, color:"#818cf8", words:["cryptocurrency","blockchain","distributed","decentralized","machinelearning","artificialintelligence","deeplearning","neuralnetwork","algorithm","optimization","virtualization","containerization","microservices","kubernetes","orchestration","serverless","cloudcomputing","devops","devsecops","infrastructure","automation","monitoring","observability","telemetry","latency","throughput","scalability","redundancy","failover","loadbalancing"] },

  // Homophones
  { id:41, name:"Homophones",            emoji:"👂", wpmTarget:45,  accuracy:75, color:"#a3e635", words:["their","there","they're","your","you're","its","it's","whose","who's","affect","effect","accept","except","lay","lie","raise","rise","fewer","less","further","farther","principal","principle","stationary","stationery","complement","compliment","elicit","illicit","eminent","imminent","averse","adverse","assure","ensure","insure","council","counsel","allude","elude","allusion","illusion","cite","sight","site","to","too","two","bare","bear","buy","by","bye"] },

  // Compound words
  { id:42, name:"Compound Words",        emoji:"🔗", wpmTarget:48,  accuracy:75, color:"#e2e8f0", words:["sunflower","moonlight","starfish","thunderstorm","rainbow","waterfall","fireplace","snowflake","earthquake","whirlpool","butterscotch","grasshopper","dragonfly","bullseye","honeybee","toadstool","nightfall","daybreak","footprint","handshake","heartbeat","brainwave","lifeguard","bookworm","daydream","moonwalk","sunburn","windmill","driftwood","clockwork"] },

  // Adverbs
  { id:43, name:"Adverbs",               emoji:"✨", wpmTarget:50,  accuracy:75, color:"#67e8f9", words:["absolutely","accidentally","actually","already","always","approximately","basically","carefully","certainly","clearly","completely","constantly","correctly","currently","definitely","deliberately","directly","easily","efficiently","entirely","especially","eventually","exactly","extremely","finally","fortunately","frequently","generally","gradually","honestly","immediately","importantly","incredibly","inevitably","innocently","intentionally","largely","literally","logically","mainly","meanwhile","mentally","naturally","nearly","necessarily","obviously","partially","particularly","perfectly","physically","possibly","practically","precisely","previously","probably","quickly","quietly","rapidly","really","recently","regularly","relatively","remarkably","repeatedly","seriously","significantly","simply","slightly","slowly","specifically","strongly","successfully","suddenly","supposedly","surprisingly","typically","unfortunately","usually","virtually","vividly","willingly","wonderfully"] },

  // Prefixes practice
  { id:44, name:"Prefixes",              emoji:"🔑", wpmTarget:52,  accuracy:75, color:"#c4b5fd", words:["predetermined","preposterous","prerequisite","premonition","prehistoric","predominant","preliminary","precautionary","pronunciation","precipitation","preparation","presentation","preservation","presumptuous","preternatural","supernatural","superimposed","superconductor","superstitious","superficial","superfluous","superlative","supremacy","surpassing","surrounding","survival","sustainable","systematic","syndication","symptomatic"] },

  // Emoji descriptions (no emoji, just the words)
  { id:45, name:"Descriptive Words",     emoji:"🖊️", wpmTarget:48,  accuracy:75, color:"#fde68a", words:["rollinglaughing","facewithtearsof","starstruckeyes","thinkingface","explodinghead","mindblown","hearteyesface","sunglassescool","upsetface","sleepingface","grimacingface","hushedface","fearfulface","worriedface","confusedface","flushedface","perseveringface","disappointedface","anguishedface","fearstruckeyes","coldsweatface","openmouth","astonishedface","wearyface","tiredness","sleepiness","screamingfear","confoundedface","poutingface","angryface"] },

  // Spelling bee words
  { id:46, name:"Hard Spellings",        emoji:"🐝", wpmTarget:55,  accuracy:75, color:"#fcd34d", words:["pneumonia","mnemonic","acquiesce","cacophony","egregious","ephemeral","perfidious","sycophant","ubiquitous","verisimilitude","perspicacious","loquacious","magnanimous","ostentatious","mellifluous","obsequious","parsimonious","querulous","recalcitrant","solipsistic","tenacious","undulating","vivacious","zealous","abstemious","bellicose","cantankerous","dilettante","effervescent","fastidious","garrulous","histrionic","impecunious","jejune","knavish","lugubrious"] },

  // Historical figures (lowercase no spaces)
  { id:47, name:"Famous Names",          emoji:"🏺", wpmTarget:50,  accuracy:75, color:"#d97706", words:["napoleon","cleopatra","charlemagne","genghiskhan","alexanderthegreat","juliuscaesar","marcoantony","marcopolo","christophercolumbus","leonardodavinci","michelangelo","galileogalilei","isaacnewton","benjaminfranklin","georgewashington","abrahamlincoln","theodoreroosevelt","winstonchurchill","mahatmagandhi","martinlutherking","nelsonmandela","maozetung","josephstalin","adolfhitler","mussolini","charlesdeGaulle","sigmundfreud","karlmarx","charlesdarwin","alberteinstein"] },

  // Common misspellings (correct versions)
  { id:48, name:"Tricky Words",          emoji:"✅", wpmTarget:48,  accuracy:75, color:"#4ade80", words:["accommodate","achieve","acknowledge","aggressive","apparent","appearance","argument","beautiful","beginning","believe","calendar","caribbean","cemetery","committee","conscience","conscientious","definitely","disappear","embarrass","environment","exhilarate","fluorescent","foreign","grateful","guarantee","harass","height","immediately","independent","indispensable","liaison","lightning","maintenance","maneuver","mischievous","necessary","noticeable","occasion","occurrence","parallel","pastime","perseverance","precede","privilege","pronunciation","publicly","questionnaire","receive","recommend","referred","relevant","restaurant","rhyme","rhythm","separate","sergeant","succeed","supersede","surprise","technique","threshold","tomorrow","twelfth","vacuum","vague","vengeance","weird","whether","withhold","yacht"] },

  // Keyboard row practice mixed
  { id:49, name:"Keyboard Rows",         emoji:"⌨️", wpmTarget:58,  accuracy:75, color:"#818cf8", words:["queuepop","quizwerp","quixote","pewpewpew","typewriter","proprietor","rupture","poetry","powertower","query","equip","queue","perpetuity","quarterly","quipster","perturb","prettier","preppier","quieter","portrayer","asdfghjkl","flashsalad","galahad","halfhalf","gladhand","lashfall","halfshaft","salsa","flag","gash","flask","slash","zxcvbnm","zinc","maxim","venom","combo","numb","bomb","comb","zap","buzz","fizz","jazz","fuzz"] },

  // One hand words (left hand QWERTY)
  { id:50, name:"Left Side",             emoji:"🤚", wpmTarget:35,  accuracy:75, color:"#f87171", words:["bags","dagger","edge","egg","fad","grave","grace","decreased","brace","caged","staged","debate","great","based","greed","breed","beast","feast","grease","steel","taste","after","safer","refer","effect","stead","water","trade","swear","aware","stare","brave","grave","waste","grade","rated","grate","crate","adverb","crave","beard","create","berate","debate","exert","extra","feast","grace","graze","restate","starve","stave","sweet","treat","tread","wrest"] },

  // Right hand words (QWERTY)
  { id:51, name:"Right Side",            emoji:"🖐️", wpmTarget:35,  accuracy:75, color:"#fb923c", words:["million","union","opinion","onion","noon","moon","numb","holm","hull","hill","him","hip","hit","inn","nil","oil","ohm","him","ink","inn","ion","jolly","join","kiln","kill","loin","look","loop","lull","lumpy","milk","mill","mini","monk","moon","moil","moll","noun","null","numb","ohm","oink","only","onion","opium","pull","poll","polo","poky","polo","pool","pony","puny","pylon","junk","link","lion","limp","limp","linn","lip"] },

  // Speed sentences (no spaces)
  { id:52, name:"Full Sentences",        emoji:"🏁", wpmTarget:60,  accuracy:75, color:"#ef4444", words:["themanranfast","shedranintothehouse","theyatebreakfasttogether","wecantypereallyfastnow","shelovestotypeallday","thekeyboardneverrests","fingersflowlikewaterwhenfast","typingfastereverysinglesession","accuracyfirstspeedsecond","buildthemuscleofthemind","neverletgoofthekeys","keepyourfingersmoving","returnhomealways","breatheandtype","flowlikewater","thinkbeforeyoutype","eyesonthescreen","wristsstayrelaxed","shouldersdown","standtalltype"] },

  // Philosophical quotes
  { id:53, name:"Philosophy",            emoji:"🧠", wpmTarget:58,  accuracy:75, color:"#a78bfa", words:["iknowthatiknownothing","weareallmadehereinaliceinwonderland","hellisotherpeoplesartre","godisdeadnietzsche","thecaveisourmindsplato","maniscondemnedtobefreeexistentialism","toliveiswhatmostpeopleneverdo","theunexaminedlifeisnotworth","manisthemeasureofallthings","cogitoegosum","theloveofmoneyistherootofallevil","allisvanityqohelet","knowledgeispowerfrancisbacon","idescartesergosum","timewaitstfornoone","beautyisintheeyeofthebeholder","thetruthwillsetyoufree","whatdoesitprofitaman"] },

  // Keyboard shortcuts (words)
  { id:54, name:"Shortcut Words",        emoji:"⌨️", wpmTarget:55,  accuracy:75, color:"#38bdf8", words:["control","command","option","shift","alt","delete","backspace","escape","enter","return","tab","capslock","pageup","pagedown","home","end","insert","function","print","scroll","pause","numlock","select","all","copy","paste","cut","undo","redo","save","open","close","quit","find","replace","bold","italic","underline","zoom","minimize","maximize","screenshot","spotlight","refresh","reload","newwindow","newtab","closetab","switchtab","history","bookmark","fullscreen","sidebar"] },

  // World languages words
  { id:55, name:"World Languages",       emoji:"🗣️", wpmTarget:50,  accuracy:75, color:"#e879f9", words:["bonjour","merci","baguette","croissant","cafe","rendezvous","entrepreneur","ballet","genre","naive","hola","gracias","tortilla","siesta","fiesta","mañana","ciao","pasta","pizza","espresso","cappuccino","gelato","aria","crescendo","andante","danke","gesundheit","kindergarten","hamburger","angst","wanderlust","zeitgeist","schadenfreude","karate","karaoke","origami","tsunami","typhoon","tofu","kimchi","bibimbap","ramen","sake","ninja","samurai","anime","manga"] },

  // Running words (long continuous phrases)
  { id:56, name:"Long Phrases",          emoji:"🎯", wpmTarget:62,  accuracy:75, color:"#f43f5e", words:["thefastesttypistsneverlookdown","buildingspeedtakesdailycommitment","everykeystrokebringsyoucloser","thegoalisnotperfectionbutprogress","onehourofpracticetranslatestolifetimeskills","focusonthepresentstrokenottheprevious","letyourfingersleadyourmind","typingislikeswimmingyoujustdoit","muscmemorymakesmastershappen","thesecretisrelentlessdailypractice","speedcomesafteraccuracy","neverrushtheprocess","enjoythejourney","celebratesmallwins","trackingprogressmotivates"] },

  // Difficult consonant clusters
  { id:57, name:"Hard Clusters",         emoji:"🔷", wpmTarget:58,  accuracy:75, color:"#94a3b8", words:["strength","lengths","twelfths","scratched","stretched","scrunched","squelched","twitched","crunched","clenched","blanched","branched","breached","britches","clenches","crunches","squelches","stretches","twitches","wrenches","trenches","benches","bleaches","branches","breeches","breaches","clutches","crutches","drenches","flinches","fretches","inches","latches","lunches","matches","notches","patches","peaches","reaches","retches","sketches","sketched","snatches","speeches","stitches","swatches","switches","teaches","touches","watches","witches","wretches"] },

  // Two-letter starts
  { id:58, name:"Common Words",          emoji:"📝", wpmTarget:60,  accuracy:75, color:"#22c55e", words:["abstract","actually","address","advance","against","already","although","another","because","between","business","careful","certain","chapter","collect","company","complete","computer","contain","control","correct","country","covered","created","culture","decided","develop","different","directly","discover","display","distance","division","during","earlier","eastern","economic","either","element","energy","enough","entire","exactly","example","explain","extend","failure","finally","follow","foreign","forward","freedom","general","getting","government","greater","growth","happen","having","history","however","human","hundred","important","increase","indeed","industry","instead","interest","involve","issues","itself","kingdom","knowing","largely","letter","likely","limited","listen","living","looking","machine","making","market","matter","medium","method","modern","moment","moving","national","nature","needed","neither","network","never","normal","notice","number","object","obtain","occur","offer","often","once","opinion","outside","overall","paper","passed","people","perhaps","period","person","physical","please","point","policy","political","position","possible","power","practice","prepare","present","previous","primary","private","process","produce","program","provide","public","purpose","quality","question","quickly","rather","reason","recent","record","remain","report","require","result","return","review","right","since","social","society","source","special","standard","start","state","still","structure","study","subject","success","suggest","support","system","taken","technology","theory","though","thought","thousand","through","today","together","toward","travel","treatment","tried","truly","understand","united","until","usually","various","version","view","water","whether","while","whole","within","without","world","would","write"] },

  // Emotional words
  { id:59, name:"Emotion Words",         emoji:"💙", wpmTarget:50,  accuracy:75, color:"#fb7185", words:["happiness","sadness","excitement","disappointment","frustration","gratitude","loneliness","anxiety","contentment","enthusiasm","melancholy","nostalgia","serenity","compassion","empathy","jealousy","resentment","forgiveness","acceptance","belonging","vulnerability","resilience","courage","confidence","humility","patience","generosity","kindness","love","joy","peace","hope","faith","trust","honesty","integrity","loyalty","dedication","perseverance","ambition","passion","curiosity","wonder","awe","delight","bliss","euphoria","tranquility","harmony","balance"] },

  // Very long words
  { id:60, name:"Very Long Words",       emoji:"📏", wpmTarget:55,  accuracy:75, color:"#c084fc", words:["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pseudopseudohypoparathyroidism","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia","incomprehensibilities","honorificabilitudinitatibus","thyroparathyroidectomized","dichlorodiphenyltrichloroethane","electroencephalographically","psychoneuroimmunological","spectrophotometrically","radioimmunoelectrophoresis","microspectrophotometries","immunoelectrophoretically","philosophicotheological","counterrevolutionaries","disproportionableness","indistinguishableness"] },

  // Common 3-letter words speed drill
  { id:61, name:"Short Word Rush",       emoji:"⚡",  wpmTarget:65,  accuracy:75, color:"#facc15", words:["the","and","for","are","but","not","you","all","can","her","was","one","our","out","day","get","has","him","his","how","man","new","now","old","see","two","way","who","boy","did","its","let","put","say","she","too","use","dad","any","big","end","far","few","got","had","may","run","set","sit","six","ten","try","win","yet","age","ago","aid","aim","air","ask","bad","bag","bit","buy","car","cut","die","dog","dry","due","ear","eat","eye","far","fly","fun","gas","god","gun","gut","hit","hot","ice","job","key","kid","law","lay","leg","lie","lot","low","map","mix","net","oil","own","pay","per","pit","pot","raw","red","row","rub","shy","sin","sky","tip","top","war","web","wet","win","yes","zip"] },

  // Maximum speed - alternating finger patterns
  { id:62, name:"Fast Patterns",         emoji:"🌊", wpmTarget:70,  accuracy:75, color:"#fbbf24", words:["enenene","ananan","tototo","dididid","laLala","mememe","nanana","sisisi","tetete","vovovo","wiwiwi","pepepep","kekekek","rararar","bububub","cococo","dedede","fififi","gogogo","hahaha","icicic","jojojo","kukuku","lelele","mimimi","nonono","opopop","pupupu","qiqi","rerere","sososo","tutututu","ududud","veveve","wuwuwu","xyxy","yoyoyo","zazaza","ababab","acacac","adadad","aeaeae","afafaf","agagag","ahah","aiaiai","ajaJaj","akakak","alalal","amama","ananан"] },

  // Code snippets (no syntax, just words)
  { id:63, name:"Dev Commands",          emoji:"💾",  wpmTarget:68,  accuracy:75, color:"#4ade80", words:["gitcommit","gitpush","gitpull","gitclone","gitstatus","gitbranch","gitmerge","gitrebase","gitcheckout","npminstall","npmrun","npmbuild","npxcreate","yarninstall","yarnbuild","yarnstart","pipinstall","pythonrun","noderun","cargorun","makefile","dockerfile","kubernetes","kubectl","helminstall","dockerbuild","dockerpush","dockerpull","dockerrun","dockercompose","awscloud","gcpcloud","azurecloud","terraformapply","terraformdestroy","ansibleplaybook","jenkinsbuild","githubactions","circleci","travisci"] },

  // Ultimate challenge - long famous quotes
  { id:64, name:"Long Quotes",           emoji:"📖", wpmTarget:75,  accuracy:75, color:"#f43f5e", words:["itisnotenoughtohaveagoodmindthemainistouseitwell","thegreatesttrickthedevileverDpulledwasconvincinghewasntreal","withgreatpowercomesgreatresponsibility","iamnotafailureifidontsuccessieamafailureonlyifigiveup","theultimatemeasureofamanisnotwherehestands","themostcommonwayPeoplgiveuptheirpowerisbyThinkingtheydontHaveany","wemustallsufferoneoftwoThingspainOfDisciplineorThepainOfregret","thebravemenaredefinednotbyTheirabilitytowinbuTtheircapacitytopersist","youCannotfindpeacebyavoidinglifeyoumustliveit","todayisalwaystheBeginningofthenextpart"] },

  // The Final Boss
  { id:65, name:"Grand Master",          emoji:"👑", wpmTarget:80,  accuracy:75, color:"#dc2626", words:["thequickbrownfoxjumpsoverthelazydog","packMyboxwithFiveDozenliquorjugs","howvexinglyquickdaftzebrasjump","thefiVeboxingwizardsjumPquickly","sphinxofblackquartzjudgeMyvow","fivequackingzephyrsjoltedmywaxbed","Blowzygumsjudgemyphiloxyvat","cwmfjordBankglyphs Vex quiz","jockyvwzsgumphdlFiXqrt","grypHfonwdjumpsVexquiz","waltzBadnymphForquixoticjigs","HeavenlyZephyrsquicklyVexjumP","Vexingfuzzyquackpotjumbled","Brownjugscramquick","Packfiveboxeswith","QUickJumpingfoxes","GlyphsquizzingVex","Waltzjumpsquick","Sphinx Judges vow","Blackquartzjudge"] },

  // ── LEVELS 66-165 ──────────────────────────────────────────────────────────
  { id:66,  name:"Word Flow",          emoji:"🌊", wpmTarget:0, accuracy:75, color:"#06b6d4", words:["although","because","between","children","country","decided","develop","directly","discover","display","distance","division","economic","element","energy","enough","entire","exactly","example","explain"] },
  { id:67,  name:"Smooth Operator",    emoji:"🎷", wpmTarget:0, accuracy:75, color:"#8b5cf6", words:["failure","finally","follow","foreign","forward","freedom","general","getting","government","greater","growth","happen","having","history","however","hundred","important","increase","indeed","industry"] },
  { id:68,  name:"Key Climber",        emoji:"🧗", wpmTarget:0, accuracy:75, color:"#10b981", words:["instead","interest","involve","issues","itself","knowing","largely","letter","likely","limited","listen","living","looking","machine","making","market","matter","medium","method","modern"] },
  { id:69,  name:"Word Weaver",        emoji:"🧵", wpmTarget:0, accuracy:75, color:"#f59e0b", words:["moment","moving","national","nature","needed","neither","network","normal","notice","number","object","obtain","occur","offer","often","opinion","outside","overall","paper","passed"] },
  { id:70,  name:"Steady Stream",      emoji:"💧", wpmTarget:0, accuracy:75, color:"#3b82f6", words:["perhaps","period","person","physical","policy","political","position","possible","power","practice","prepare","present","previous","primary","private","process","produce","program","provide","purpose"] },
  { id:71,  name:"Rapid Rush",         emoji:"⚡", wpmTarget:0, accuracy:75, color:"#facc15", words:["quality","question","quickly","rather","reason","recent","record","remain","report","require","result","return","review","since","social","society","source","special","standard","start"] },
  { id:72,  name:"Precision Peak",     emoji:"🎯", wpmTarget:0, accuracy:75, color:"#ef4444", words:["state","still","structure","study","subject","success","suggest","support","system","taken","theory","though","thought","thousand","through","today","together","toward","travel","treatment"] },
  { id:73,  name:"Focus Fire",         emoji:"🔥", wpmTarget:0, accuracy:75, color:"#f97316", words:["tried","truly","understand","united","until","usually","various","version","view","whether","while","whole","within","without","world","would","write","young","above","across"] },
  { id:74,  name:"Type Storm",         emoji:"🌪️", wpmTarget:0, accuracy:75, color:"#a855f7", words:["action","activity","actual","addition","admit","adopted","advance","advantage","afraid","agency","agreement","ahead","aircraft","allowed","almost","already","also","although","amount","analysis"] },
  { id:75,  name:"Word Blitz",         emoji:"💥", wpmTarget:0, accuracy:75, color:"#ec4899", words:["ancient","animal","announced","another","anyway","apartment","apparently","appeal","applied","approach","appropriate","area","argue","army","around","article","artist","asked","attempt","attention"] },
  { id:76,  name:"Long Haul",          emoji:"🚛", wpmTarget:0, accuracy:75, color:"#34d399", words:["automobile","bibliography","catastrophe","choreography","collaboration","commissioner","commonwealth","comprehensive","congratulations","constitution","contradiction","controversial","conventional","cooperation","corporation","correspondence","deterioration","disappointment","discrimination","disorganization"] },
  { id:77,  name:"Big Words",          emoji:"📚", wpmTarget:0, accuracy:75, color:"#60a5fa", words:["documentation","electromagnetic","embarrassment","encouragement","entertainment","establishment","exaggeration","examination","expenditure","explanation","extraordinary","fundamental","generalization","geographical","hospitalization","identification","illustration","imagination","impersonation","implementation"] },
  { id:78,  name:"Mega Vocab",         emoji:"🧠", wpmTarget:0, accuracy:75, color:"#f472b6", words:["inappropriate","incorporation","independence","industrialization","infrastructure","initialization","instrumentation","interpretation","investigation","justification","liberalization","magnification","manipulation","manufacturing","marginalization","maximization","memorization","minimization","mobilization","modernization"] },
  { id:79,  name:"Word Mountain",      emoji:"⛰️", wpmTarget:0, accuracy:75, color:"#fbbf24", words:["multiplication","naturalization","normalization","notification","optimization","organization","orientation","originality","participation","personalization","polarization","popularization","precipitation","prioritization","privatization","professionalism","prohibition","pronunciation","qualification","rationalization"] },
  { id:80,  name:"Vocab Vault",        emoji:"🔐", wpmTarget:0, accuracy:75, color:"#818cf8", words:["realization","recommendation","reconciliation","regularization","reinterpretation","representation","responsibility","revitalization","simplification","specialization","standardization","subordination","summarization","supplementation","transformation","transportation","visualization","globalization","democratization","commercialization"] },
  { id:81,  name:"Lab Notes",          emoji:"🔬", wpmTarget:0, accuracy:75, color:"#38bdf8", words:["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome","combustion","covalent","cytoplasm","dendrite","dielectric","electrode","electrolyte","endoplasmic","enzyme","equilibrium"] },
  { id:82,  name:"Tech Talk",          emoji:"💻", wpmTarget:0, accuracy:75, color:"#4ade80", words:["fibonacci","frequency","germanium","graviton","greenhouse","gyroscope","hemoglobin","hydraulic","hydrogen","hypotenuse","infrared","insulator","integer","interface","ionosphere","isotope","javascript","kilowatt","kinetics","logarithm"] },
  { id:83,  name:"Science Sprint",     emoji:"⚗️", wpmTarget:0, accuracy:75, color:"#fb923c", words:["magnetism","membrane","metabolism","microwave","molecule","momentum","mutation","nanometer","neutron","nitrogen","nucleotide","oscillation","oxidation","particle","peptide","photon","plasma","polymer","potential","protein"] },
  { id:84,  name:"Data Drive",         emoji:"📊", wpmTarget:0, accuracy:75, color:"#c084fc", words:["proton","quantum","radiation","receptor","resistance","resonance","semiconductor","simulation","spectrum","synapse","synthesis","telescope","temperature","thermometer","transistor","ultraviolet","valence","velocity","wavelength","acceleration"] },
  { id:85,  name:"Code Breaker",       emoji:"🔓", wpmTarget:0, accuracy:75, color:"#2dd4bf", words:["biochemistry","bioinformatics","biotechnology","calcification","catalysis","cryptography","cybernetics","cytogenetics","decomposition","deformation","dehydration","electrolysis","fermentation","fluorescence","geochemistry","geophysics","hematology","hydrolysis","immunology","pharmacology"] },
  { id:86,  name:"Phrase Runner",      emoji:"🏃", wpmTarget:0, accuracy:75, color:"#f43f5e", words:["keepyoureyesontheprize","actionsspeaklouderthanwords","thepenismightierthanthesword","dontputallyoureggsinonebasket","everycloudhasasilverlin","betterlatethannever","twobirdsonestone","lookbeforeyouleap","nothingventurednothinggained","fortunefavorsthebrave"] },
  { id:87,  name:"Quote Dash",         emoji:"💬", wpmTarget:0, accuracy:75, color:"#a78bfa", words:["lifeiswhatyoumakeofit","youmissalltheshotsyoudontshoot","dreambigworkhard","stayhungrystayfoolish","doormattoorchestra","makeithappen","believeinyourself","nevergiveuP","hardworkpaysoff","successisajourney"] },
  { id:88,  name:"Sentence Sprint",    emoji:"🗣️", wpmTarget:0, accuracy:75, color:"#fb923c", words:["theearlybirddoesindeedcatchtheworm","asinglestepstillbeginsajourney","knowingisonestepbutdoingisanother","makeithappenshockeveryone","tomorrowisanewday","yesterdayisgone","todayisagiift","thatiswhyitiscalledthepresent"] },
  { id:89,  name:"Flow State",         emoji:"🌀", wpmTarget:0, accuracy:75, color:"#06b6d4", words:["breatheandletgoofwhatyoucannotcontrol","focusonwhatyoucanchange","everystepforwardisastepawayfrom","dothebestyoucanwithwhatyouhave","progressnotperfectionisthegoal","smallstepsbigdreams","keepmovingforward","onestepatime"] },
  { id:90,  name:"Mind Meld",          emoji:"🧘", wpmTarget:0, accuracy:75, color:"#8b5cf6", words:["patientconsistencybeatsimpatientintensity","slowdowntospeedup","themagichappensjustoutsideyourcomfortzone","bethechangeyouwishtosee","startwhereyouareusewhaty ouhave","embracetheprocess","trustyourjourney","buildyourlegacy"] },
  { id:91,  name:"Alpha Blitz",        emoji:"🔤", wpmTarget:0, accuracy:75, color:"#facc15", words:["abacus","abjure","abrupt","absurd","accrue","acquit","actual","adroit","adverb","affect","affirm","afford","afraid","agency","agenda","aghast","agreed","albeit","alcove","alight"] },
  { id:92,  name:"Beta Burst",         emoji:"💫", wpmTarget:0, accuracy:75, color:"#ef4444", words:["ballot","banish","banner","barely","barter","beacon","behalf","bestow","beyond","binary","bitter","blanch","blazon","blight","blotch","blouse","border","borrow","bought","bounce"] },
  { id:93,  name:"Gamma Grind",        emoji:"💪", wpmTarget:0, accuracy:75, color:"#10b981", words:["cancel","candid","canopy","carbon","casing","casual","caught","cavern","census","centric","chalet","charge","chosen","cipher","circle","citrus","clench","clergy","closet","cobalt"] },
  { id:94,  name:"Delta Drive",        emoji:"🔷", wpmTarget:0, accuracy:75, color:"#3b82f6", words:["dacron","damage","danger","dapper","dawdle","deacon","deadly","decant","decree","defeat","defect","define","degree","delete","deluge","demand","deploy","derive","desert","design"] },
  { id:95,  name:"Epsilon Edge",       emoji:"🎯", wpmTarget:0, accuracy:75, color:"#f59e0b", words:["earthy","edging","effect","effort","eighth","either","elapse","eleven","emerge","enable","encase","encode","endure","engage","engulf","enrich","ensure","entire","equals","escape"] },
  { id:96,  name:"Zeta Zone",          emoji:"🌟", wpmTarget:0, accuracy:75, color:"#c084fc", words:["factor","fading","famine","fashion","fasten","fathom","fierce","figure","filter","fiscal","fissure","fitful","flinch","fluent","flutter","forage","forbid","format","fossil","fringe"] },
  { id:97,  name:"Theta Thrust",       emoji:"🚀", wpmTarget:0, accuracy:75, color:"#34d399", words:["gallop","garble","garish","garner","garnet","gasket","gather","gauche","gentle","gifted","girder","goblin","gotten","govern","gravel","grieve","grovel","grudge","guzzle","hamlet"] },
  { id:98,  name:"Iota Impact",        emoji:"⚡", wpmTarget:0, accuracy:75, color:"#f472b6", words:["handle","happen","harbor","harden","hasten","haunch","hearth","hefted","herald","hiccup","hinder","hoarse","hornet","hostile","huddle","humble","hunger","hustle","hybrid","ignite"] },
  { id:99,  name:"Kappa King",         emoji:"👑", wpmTarget:0, accuracy:75, color:"#fbbf24", words:["impede","import","impose","incite","indeed","infect","inform","ingest","inject","insane","inside","insist","insult","intend","invade","invent","invest","invoke","island","isolate"] },
  { id:100, name:"Century Mark",       emoji:"💯", wpmTarget:0, accuracy:75, color:"#ef4444", words:["thequickbrownfoxjumpsoverthelazydog","packMyboxwithfiveDozenliquorjugs","howvexinglyquickdaftzebrasjump","sphinxofblackquartzjudgemyvow","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic","floccinaucinihilipilification","supercalifragilistic"] },
  { id:101, name:"Bonjour!",           emoji:"🇫🇷", wpmTarget:0, accuracy:75, color:"#3b82f6", words:["bonjour","merci","baguette","croissant","fromage","champagne","rendezvous","entrepreneur","silhouette","boulevard","chauffeur","cuisine","ballet","genre","naive","cliche","facade","fiancee","gauche","chic"] },
  { id:102, name:"Hola!",              emoji:"🇪🇸", wpmTarget:0, accuracy:75, color:"#ef4444", words:["hola","gracias","tortilla","siesta","fiesta","embargo","guerrilla","bonanza","cafeteria","patio","plaza","rodeo","sombrero","tango","tornado","vanilla","mosquito","alligator","avocado","chocolate"] },
  { id:103, name:"Ciao!",              emoji:"🇮🇹", wpmTarget:0, accuracy:75, color:"#10b981", words:["ciao","pizza","pasta","espresso","cappuccino","gelato","aria","crescendo","andante","forte","piano","soprano","bravo","casino","grotto","lagoon","malaria","studio","umbrella","volcano"] },
  { id:104, name:"Danke!",             emoji:"🇩🇪", wpmTarget:0, accuracy:75, color:"#f59e0b", words:["danke","kindergarten","hamburger","angst","wanderlust","zeitgeist","schadenfreude","gesundheit","doppelganger","poltergeist","kaput","rucksack","diesel","cobalt","nickel","quartz","pretzel","pumpernickel","sauerkraut","bratwurst"] },
  { id:105, name:"Konnichiwa!",        emoji:"🇯🇵", wpmTarget:0, accuracy:75, color:"#ec4899", words:["karate","karaoke","origami","tsunami","typhoon","tofu","anime","manga","ninja","samurai","sake","sushi","tempura","teriyaki","hibachi","ramen","wasabi","futon","tycoon","emoji"] },
  { id:106, name:"Annyeong!",          emoji:"🇰🇷", wpmTarget:0, accuracy:75, color:"#8b5cf6", words:["kimchi","bibimbap","bulgogi","japchae","doenjang","gochujang","banchan","galbi","samgyeopsal","sundubu","haemul","pajeon","makgeolli","soju","hanbok","taekwondo","hangul","Seoul","Busan","Incheon"] },
  { id:107, name:"Nihao!",             emoji:"🇨🇳", wpmTarget:0, accuracy:75, color:"#f97316", words:["typhoon","algebra","almanac","arsenal","assassin","caliber","cipher","coffee","cotton","crimson","damask","elixir","gauze","hazard","jasmine","lemon","magazine","mask","mattress","cotton"] },
  { id:108, name:"Salam!",             emoji:"🌙",  wpmTarget:0, accuracy:75, color:"#2dd4bf", words:["algebra","algorithm","almanac","arsenal","assassin","caliber","candy","cipher","coffee","cotton","crimson","damask","elixir","gauze","hazard","jasmine","lemon","magazine","mask","mattress"] },
  { id:109, name:"Namaste!",           emoji:"🇮🇳", wpmTarget:0, accuracy:75, color:"#fbbf24", words:["yoga","karma","nirvana","guru","mantra","avatar","jungle","bungalow","shampoo","loot","punch","bandana","calico","cot","dinghy","dungarees","juggernaut","khaki","pajamas","thug"] },
  { id:110, name:"G'day!",             emoji:"🇦🇺", wpmTarget:0, accuracy:75, color:"#84cc16", words:["boomerang","kangaroo","koala","wallaby","wombat","platypus","dingo","didgeridoo","outback","billabong","arvo","barbie","bludger","bonzer","chook","cobber","drongo","footy","galah","reckon"] },
  { id:111, name:"History Makers",     emoji:"🏛️", wpmTarget:0, accuracy:75, color:"#94a3b8", words:["abrahamlincoln","georgewashington","thomasjefferson","benjaminfranklin","alexanderhamilton","theodoreroosevelt","franklindelanoroosevelt","johnfkennedy","martinlutherking","nelsonmandela"] },
  { id:112, name:"Scientists",         emoji:"🔭", wpmTarget:0, accuracy:75, color:"#38bdf8", words:["alberteinstein","isaacnewton","charlesdarwin","mariecurie","galileogalilei","nikolatesla","stephenhawking","richardfeynman","erwinschrodinger","nielsbohr"] },
  { id:113, name:"Artists",            emoji:"🎨", wpmTarget:0, accuracy:75, color:"#f472b6", words:["leonardodavinci","michelangelo","vincentvangogh","pablopicasso","salvadordali","claudemonet","rembrandt","edvardmunch","jacksonpollock","andywarhol"] },
  { id:114, name:"Writers",            emoji:"✍️", wpmTarget:0, accuracy:75, color:"#c084fc", words:["williamshakespeare","janeausten","charlesdickens","marktwain","ernesthemingway","georgeorwell","fyodordostoevsky","levtolstoy","franzkafka","jamesjoyce"] },
  { id:115, name:"Musicians",          emoji:"🎵", wpmTarget:0, accuracy:75, color:"#fbbf24", words:["beethoven","mozart","bachjohannsebastian","chopinfrederic","tchaikovsky","debussyclaude","vivaldiantonio","brahms","handel","schubert"] },
  { id:116, name:"Home Row Hero II",   emoji:"⌨️", wpmTarget:0, accuracy:75, color:"#10b981", words:["asdfasdf","jkljkljkl","asdfjkl","fjdkslal","afjkdsla","jfkdlsaj","salfjdks","ldkfjsla","askdjfla","jsdlakfj","fladksjf","sdlakfjd","lakjdsff","dfjklsad","klasdfjl"] },
  { id:117, name:"Number Words II",    emoji:"🔢", wpmTarget:0, accuracy:75, color:"#f59e0b", words:["twentyone","twentytwo","twentythree","twentyfour","twentyfive","twentysix","twentyseven","twentyeight","twentynine","thirty","thirtyone","thirtytwo","thirtythree","thirtyfour","thirtyfive"] },
  { id:118, name:"Keyboard Row Mix",   emoji:"🎹", wpmTarget:0, accuracy:75, color:"#8b5cf6", words:["qwerty","asdfgh","zxcvbn","poiuyt","lkjhgf","mnbvcx","qazwsx","edcrfv","tgbyhn","qwertyuiop","asdfghjkl","zxcvbnm","poiuytrewq","lkjhgfdsa","mnbvcxz"] },
  { id:119, name:"Alternating Hands",  emoji:"🤝", wpmTarget:0, accuracy:75, color:"#06b6d4", words:["element","problem","visible","formula","bicycle","suspend","neurotic","penalty","stomach","blanket","captain","diagram","edition","fiction","general","hundred","journey","kingdom","laundry","maximum"] },
  { id:120, name:"Pinky Power",        emoji:"🤙", wpmTarget:0, accuracy:75, color:"#ef4444", words:["quiz","aqua","quick","quote","equal","liquid","queue","quest","queen","quiet","quite","quilt","quake","qualm","quaff","quasar","quarry","quarrel","quagmire","quintet"] },
  { id:121, name:"Monster Words",      emoji:"👾", wpmTarget:0, accuracy:75, color:"#a855f7", words:["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia","pseudopseudohypoparathyroidism","incomprehensibilities","honorificabilitudinitatibus","dichlorodiphenyltrichloroethane","electroencephalographically"] },
  { id:122, name:"Mega Phrases",       emoji:"💪", wpmTarget:0, accuracy:75, color:"#f43f5e", words:["itwasthebestoftimesitwastheworstoftimes","asknotwhatyourcountrycandoforyou","tobeornottobethatisthequestion","fourscoreandsevenyearsago","weholdthesetruthstobeselfevident"] },
  { id:123, name:"Speed Sentence",     emoji:"🏎️", wpmTarget:0, accuracy:75, color:"#facc15", words:["thequickbrownfoxjumpsoverthelazyunknowncreature","packingmyboxwithfivedozenliquorjugsandsomecheese","thefiveboxingwizardsjumpquicklyoverthebrownfox","sphinxoftheancientblackquartzjudgesmyvow"] },
  { id:124, name:"Long Quote",         emoji:"📜", wpmTarget:0, accuracy:75, color:"#818cf8", words:["inthebeginningwasthewordandthewordwaswithgodandthewordwasgod","donotgogentleintothatgoodnightrageinagethedyingofthelight","onesmallstepformanonegiantleapformankind"] },
  { id:125, name:"Tongue Tornado",     emoji:"🌪️", wpmTarget:0, accuracy:75, color:"#fb923c", words:["peterpiperpckedapeckofpickledpepperspeterpiperpcked","shesellsseashellsbytheseashoreandtheshellsshesellaretheshells","howmuchwoodwouldawoodchuckchuckifawoodchuckcouldchuckwood","bettyboterboterbutterbutterisbitter"] },
  { id:126, name:"Two Letter Blitz",   emoji:"⚡", wpmTarget:0, accuracy:75, color:"#34d399", words:["if","of","to","in","is","it","be","as","at","so","we","he","by","or","on","do","me","my","up","an","go","no","us","am","hi","ok","ex","ox","ax","id"] },
  { id:127, name:"Four Letter Frenzy", emoji:"💨", wpmTarget:0, accuracy:75, color:"#60a5fa", words:["able","also","area","back","ball","band","base","been","bill","book","both","call","came","card","care","case","city","come","dark","data","days","deal","dear","deep","door","down","draw","drop"] },
  { id:128, name:"Five Letter Fire",   emoji:"🔥", wpmTarget:0, accuracy:75, color:"#f97316", words:["about","above","abuse","actor","adapt","admit","adopt","adult","after","again","agent","agree","ahead","alarm","album","alert","alike","align","alive","alley","allow","along","alter","angel","anger","angle","angry","ankle"] },
  { id:129, name:"Six Letter Storm",   emoji:"⛈️", wpmTarget:0, accuracy:75, color:"#818cf8", words:["absent","absorb","accent","accept","access","accord","accuse","across","action","active","actual","adjust","admire","affect","afford","agency","almost","amount","amused","annual","answer","appeal","appear","around","arrive","artist","aspect"] },
  { id:130, name:"Seven Heaven",       emoji:"7️⃣",  wpmTarget:0, accuracy:75, color:"#fbbf24", words:["ability","absence","achieve","address","advance","against","amazing","ancient","another","anxiety","approve","arrange","attempt","attract","balance","because","beneath","between","belongs","capable","capture","careful","certain","chapter","classic","climate"] },
  { id:131, name:"Epic Sentences",     emoji:"📖", wpmTarget:0, accuracy:75, color:"#a855f7", words:["thequickbrownfoxjumpsoverthelazydog","itwasabrightcoldday","callmeishmael","tobeornottobe","inalandfarfar","weholdthesetruth","fourscoreandseven","onesmallstep","donotgogentle","stagethefinal"] },
  { id:132, name:"Philosophy",         emoji:"🧠", wpmTarget:0, accuracy:75, color:"#38bdf8", words:["thecaveisourmindsplato","godisdeadnietzsche","hellisotherpeoplesartre","existenceprecedesessence","iamcondemnedtobefree","theunexaminedlifeisnotworthliving","iknowthatiknownothing","beautyisintheeyeofthebeholder"] },
  { id:133, name:"Scripture",          emoji:"📿", wpmTarget:0, accuracy:75, color:"#fbbf24", words:["inthebeginningGodcreatedtheheavensandtheearth","forGodsolovedtheworld","iamthewayandthetruth","theLordismyshepherd","forthewagesofsinisdeath","inthebeginningwastheword","blessedare themeek","lovethelordyourgod"] },
  { id:134, name:"Shakespeare",        emoji:"🎭", wpmTarget:0, accuracy:75, color:"#ec4899", words:["tobeornottobethatisthequestion","alltheworldsastagehakespeare","thequalityofmercyisnotstrained","ifmusicbethefoodofloveplayo","whatsinananamerosebyanyothername"] },
  { id:135, name:"US History",         emoji:"🦅", wpmTarget:0, accuracy:75, color:"#3b82f6", words:["fourscoreandsevenyearsagoourforefathers","weholdthesetruthstobeselfevidentthatall","asknotwhatyourcountrycandoforyou","Ihaveadreamthatmyfourchildren","weshallovercomeweshallovercome"] },
  { id:136, name:"Finger Fury",        emoji:"👊", wpmTarget:0, accuracy:75, color:"#ef4444", words:["fjfjfjfjfj","dkdkdkdkdk","slslslslsl","aasdffdsa","jjklllkkj","asdfghjkl","qwertyuio","zxcvbnmzx","poiuytrewq","lkjhgfdsaz","mnbvcxzmnb","qazwsxedcr","rfvtgbyhnuj","fjdkfjdkfjdk","slafslafsla"] },
  { id:137, name:"Code Marathon",      emoji:"🖥️", wpmTarget:0, accuracy:75, color:"#4ade80", words:["functionreturnsundefined","asyncawaitpromise","trycatchfinallydone","useStateuseffect","reactcomponentprops","classextendscomponent","importexportdefault","constletvarscope","arraymapreducefilter","objectkeysvaluesentries"] },
  { id:138, name:"Emoji Words",        emoji:"😎", wpmTarget:0, accuracy:75, color:"#f472b6", words:["rollinglaughingcrying","facewithtearsofJoy","starstruck","thinkingface","explodinghead","hearteyesface","sunglassesface","grimacingface","fearfulface","confoundedface","wearyfacetired","flushedface","astonishedface","anguishedface","perseveringface"] },
  { id:139, name:"Hard Clusters",      emoji:"💎", wpmTarget:0, accuracy:75, color:"#818cf8", words:["strength","lengths","twelfths","scratched","stretched","scrunched","squelched","twitched","crunched","clenched","blanched","branched","breached","clenches","squelches","stretches","twitches","wrenches","trenches","benches"] },
  { id:140, name:"Suffix Surge",       emoji:"🏄", wpmTarget:0, accuracy:75, color:"#06b6d4", words:["thankfulness","gratefulness","mindfulness","hopefulness","usefulness","harmfulness","helpfulness","spitefulness","carelessness","hopelessness","uselessness","harmlessness","motionless","powerless","speechless","breathless","fearless","thoughtless","worthless","restless"] },
  { id:141, name:"Elite Typist",       emoji:"🏆", wpmTarget:0, accuracy:75, color:"#fbbf24", words:["antidisestablishmentarianismisaverylongword","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobiaisreal","floccinaucinihilipilificationmeansworthless"] },
  { id:142, name:"Master Class",       emoji:"🎓", wpmTarget:0, accuracy:75, color:"#a855f7", words:["extraordinarilyphilosophical","incomprehensiblydisproportionate","uncharacteristicallycounterintuitive","psychoneuroimmunologicaltesting","electroencephalographicallyderived","spectrophotometricallymeasured"] },
  { id:143, name:"Word God",           emoji:"👁️", wpmTarget:0, accuracy:75, color:"#f43f5e", words:["itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheageoffoolishness","tobeornottobethatisthequestionwhethertisnoblerinthemind","weholdthesetruthstobeselfevidentthatallmen"] },
  { id:144, name:"Transcendence",      emoji:"✨", wpmTarget:0, accuracy:75, color:"#c084fc", words:["thefastesthumantypistinhistorycouldtype216wordsperminuteconsistently","moderncomputerkeyboardsaredesignedforspeedaccuracyandcomfort","thetypewriterrevolutionizedbusinesscommunicationinthenineteenthcentury"] },
  { id:145, name:"The Summit",         emoji:"⛰️", wpmTarget:0, accuracy:75, color:"#38bdf8", words:["antidisestablishmentarianismisthepoliticalpositionthatopposesdisestablishment","floccinaucinihilipilificationisthenounform","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis"] },
  { id:146, name:"Speed God I",        emoji:"⚡", wpmTarget:0, accuracy:75, color:"#facc15", words:["thethe","andandand","forforfor","youyouyou","runrunrun","hothotho","bigbigbig","newnewnew","oldoldold","seesee","puttputt","saysay","trytry","gotgot","askask"] },
  { id:147, name:"Speed God II",       emoji:"⚡", wpmTarget:0, accuracy:75, color:"#ef4444", words:["waterwater","everyevery","firstfirst","placeplace","yearsyears","youngyoung","greatgreat","threethree","nevernever","worldworld","aboutabout","rightright","couldcould","stillstill","smallsmall"] },
  { id:148, name:"Speed God III",      emoji:"⚡", wpmTarget:0, accuracy:75, color:"#f97316", words:["practiceaccuracy","improvespeed","buildhabits","focusflow","typefast","neverleave","homerowalways","rhythmkeys","combostreak","fingermuscle","wristrelax","shouldersdown","eyesscreen","breathetype","flowwater"] },
  { id:149, name:"Speed God IV",       emoji:"⚡", wpmTarget:0, accuracy:75, color:"#a855f7", words:["development","environment","technology","information","understanding","experience","important","following","sometimes","something","everything","different","communication","international","organization"] },
  { id:150, name:"Speed God V",        emoji:"⚡", wpmTarget:0, accuracy:75, color:"#ec4899", words:["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia","pseudopseudohypoparathyroidism","incomprehensibilities","dichlorodiphenyltrichloroethane","electroencephalographically","psychoneuroimmunological"] },
  { id:151, name:"The Grind",          emoji:"⚙️", wpmTarget:0, accuracy:75, color:"#94a3b8", words:["consistencybeatsintensity","showupeverysingleday","progressoverperfection","embracethegrindeveryday","onehouradaychangesyourlife","nevermisstwodays","buildthesystem","trusttheprocess","compoundeffect","marginalgains"] },
  { id:152, name:"Iron Fingers",       emoji:"🦾", wpmTarget:0, accuracy:75, color:"#6366f1", words:["fjdkfjdkfjdk","slafslafsla","ksdjfksdjf","alskdjalskd","fjaslfjaslfj","dkfsdkfsdkfs","jflajflajfla","sdkfjsdkfjsdk","lfjalfjalfjal","akfjdakfjdak","sfjdlsfjdl","kadfjkadfjka","dlsfadlsfa","fjasldfjasld","kasjdkasjdkas"] },
  { id:153, name:"The Crucible",       emoji:"🔥", wpmTarget:0, accuracy:75, color:"#ef4444", words:["itwasthebestoftimesitwastheworst","tobeornottobe","callmeishmael","inthebeginning","fourscoreandseven","weholdthesetruth","asknotwhat","onesmallstep","donotgogentle","stagethefinal"] },
  { id:154, name:"Apex Predator",      emoji:"🦁", wpmTarget:0, accuracy:75, color:"#f59e0b", words:["extraordinarilyincredible","incomprehensiblybrilliant","uncharacteristicallyperfect","counterproductivelyefficient","simultaneouslymultitasking","acknowledgementreceived","straightforwardlycomplicated","unpredictablyroutine"] },
  { id:155, name:"Finger Lightning",   emoji:"⚡", wpmTarget:0, accuracy:75, color:"#fbbf24", words:["enenenenene","tototototo","lalalalalala","mememememe","nananananana","sisisisisi","tetetete","vovovovo","wiwiwiwi","pepepepep","kekekekek","rararararar","bububububu","cocococococ","dededededede"] },
  { id:156, name:"Legend I",           emoji:"👑", wpmTarget:0, accuracy:75, color:"#fbbf24", words:["thequickbrownfoxjumpsoverthelazydog","packMyboxwithfiveDozenliquorjugs","howvexinglyquickdaftzebrasjump","sphinxofblackquartzjudgemyvow","fivequackingzephyrsjoltedmywaxbed","blowzygumsjudgemyphiloxyvat","cwmfjordBankglyphsvexquiz"] },
  { id:157, name:"Legend II",          emoji:"👑", wpmTarget:0, accuracy:75, color:"#f43f5e", words:["antidisestablishmentarianismfloccinaucinihilipilification","supercalifragilisticexpialidociouspneumonoultramicroscopic","hippopotomonstrosesquippedaliophobiapseudopseudohypo","incomprehensibilitieshonorificabilitudinitatibus"] },
  { id:158, name:"Legend III",         emoji:"👑", wpmTarget:0, accuracy:75, color:"#a855f7", words:["itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomandfoolishness","tobeornottobethatisthequestionwhetheritisnobler","fourscoreandsevenyearsagoourforefathersbroughtforthupon"] },
  { id:159, name:"Legend IV",          emoji:"👑", wpmTarget:0, accuracy:75, color:"#06b6d4", words:["thefastesthumantypistinhistorycouldtype216wordsperminuteconsistently","moderncomputerkeyboardsaredesignedforspeedaccuracyandcomfort","thetypewriterrevolutionizedbusinesscommunicationinthenineteenthcentury"] },
  { id:160, name:"Legend V",           emoji:"👑", wpmTarget:0, accuracy:75, color:"#10b981", words:["practiceisthemotherof allskillsthemorey outypethemoreyouimprove","youdontneedtobeperfectyouneedtobepersistentandconsistent","thekeyboardisaninstrumentandlikeallinstrumentsitmustbepracticed"] },
  { id:161, name:"Legend VI",          emoji:"💀", wpmTarget:0, accuracy:75, color:"#ef4444", words:["antidisestablishmentarianismisthepoliticalpositionthatopposesdisestablishmentofthechurchofengland","floccinaucinihilipilificationisthenounformmeaning toregardorsomethingas worthless"] },
  { id:162, name:"Legend VII",         emoji:"💀", wpmTarget:0, accuracy:75, color:"#8b5cf6", words:["supercalifragilisticexpialidociousevenatthesoundofit somethingquiteatrociouswillalwaysoundprecocious","pneumonoultramicroscopicsilicovolcanoconiosisisthenamegiventoa lungdisease"] },
  { id:163, name:"Legend VIII",        emoji:"💀", wpmTarget:0, accuracy:75, color:"#f59e0b", words:["itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheageoffoolishnessitwastheepochofbelief","tobeornottobethatisthequestionwhethertisnoblerinthemindtosuffertheoutrangeousfortunes"] },
  { id:164, name:"Legend IX",          emoji:"💀", wpmTarget:0, accuracy:75, color:"#c084fc", words:["fourscoreandsevenyearsagoourforefathersbroughtforthuponthiscontinentanewnationconceivedinliberty","weholdthesetruthstobeselfevidentthatallmenarecreatedequalthattheyareendowedbytheirCreatorwithcertainunalienableRights"] },
  { id:165, name:"True Final Boss",    emoji:"☠️", wpmTarget:0, accuracy:75, color:"#dc2626", words:["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheageoffoolishnessitwastheepochofbelief","tobeornottobethatisthequestionwhetheritisnobler inthemindtosuffertheoutrangeousfortunes"] },
];

const T = { bg:"#0a0a0f",card:"#0f0f1a",border:"#1e1e30",purple:"#a78bfa",text:"#e0e0ff",muted:"#6b7280",faint:"#2e2e44",accent:"#34d399",danger:"#ef4444",warn:"#f59e0b",font:"'JetBrains Mono',monospace" };
const st = {
  page:{ minHeight:"100vh",background:T.bg,fontFamily:T.font,padding:"24px 16px",color:T.text },
  card:{ background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 18px",marginBottom:10 },
  tab:(a)=>({ padding:"7px 13px",borderRadius:8,border:"none",cursor:"pointer",fontFamily:T.font,fontSize:11,fontWeight:700,background:a?T.purple:"transparent",color:a?"#fff":T.muted,whiteSpace:"nowrap" }),
  btn:(c="#fff",bg=T.purple)=>({ padding:"6px 12px",borderRadius:7,border:"none",background:bg,color:c,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:T.font }),
  input:{ width:"100%",background:T.faint,border:`1px solid ${T.border}`,borderRadius:7,color:T.text,fontFamily:T.font,fontSize:12,padding:"8px 11px",outline:"none",boxSizing:"border-box" },
  label:{ color:T.muted,fontSize:9,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:5 },
};
const TABS = ["stats","users","bans","admins","keys","trials","warn","broadcast","levels","analytics","log","feedback","anticheat","birthday","settings"];

export default function AdminPage() {
  // adminDb is safe to create anywhere (no browser-only APIs). adminAuth uses
  // browser-only persistence, so it's only constructed client-side — this
  // component is "use client", but Next.js still prerenders its initial
  // shell server-side, so we can't call getAdminAuth() unconditionally here.
  const adminDb = getAdminDb();
  const adminAuth = typeof window !== 'undefined' ? getAdminAuth() : null;

  const [user,setUser]=useState(null);
  const [authChecked,setAuthChecked]=useState(false); // has onAuthStateChanged fired at least once
  const [adminOk,setAdminOk]=useState(false);
  const [adminSignInLoading,setAdminSignInLoading]=useState(false);
  const [adminSignInErr,setAdminSignInErr]=useState("");
  const [accountIsAdmin,setAccountIsAdmin]=useState(false); // account-level admins/{uid}
  const [adminProfiles,setAdminProfiles]=useState(null); // this account's profiles, once fetched
  const [chosenAdminProfile,setChosenAdminProfile]=useState(null); // the profile picked to act as
  const [tab,setTab]=useState("stats");
  const [users,setUsers]=useState([]);
  const [usersLoaded,setUsersLoaded]=useState(false);
  const [bans,setBans]=useState([]);
  const [admins,setAdmins]=useState([]);
  const [log,setLog]=useState([]);
  const [feedbackList,setFeedbackList]=useState([]);
  const [replyingTo,setReplyingTo]=useState(null); // feedback id
  const [replyText,setReplyText]=useState("");
  const [replySending,setReplySending]=useState(false);
  const [bdayReqList,setBdayReqList]=useState([]);
  const [coppaAudit,setCoppaAudit]=useState(null);
  const [coppaAuditLoading,setCoppaAuditLoading]=useState(false);
  const [coppaCleanupResult,setCoppaCleanupResult]=useState(null);
  const [coppaCleanupLoading,setCoppaCleanupLoading]=useState(false);
  async function runCoppaAudit() {
    setCoppaAuditLoading(true);
    try {
      const result = await getCoppaAuditSummary(adminDb);
      setCoppaAudit(result);
    } catch (e) {
      flash(e.message || "Audit failed");
    }
    setCoppaAuditLoading(false);
  }
  async function handleRunCoppaCleanup() {
    if (!confirm(`This will permanently strip photos, delete all session history, and delete daily-leaderboard entries (for accounts where every profile is restricted) for every currently-restricted (under 13) profile across the whole app. This cannot be undone. Continue?`)) return;
    setCoppaCleanupLoading(true);
    try {
      const result = await runCoppaCleanup(adminDb);
      setCoppaCleanupResult(result);
      await logActivity("coppa_cleanup", { adminUid: user.uid, detail: `${result.profilesCleaned} profiles cleaned, ${result.photosRemoved} photos removed, ${result.sessionsDeleted} sessions deleted` }, adminDb);
      flash(`Cleaned ${result.profilesCleaned} profile(s)`);
      runCoppaAudit();
    } catch (e) {
      flash(e.message || "Cleanup failed");
    }
    setCoppaCleanupLoading(false);
  }
  const [flaggedScores,setFlaggedScores]=useState([]);
  const [restoreRequests,setRestoreRequests]=useState([]);
  const [anticheatSubtab,setAnticheatSubtab]=useState("flagged"); // "flagged" | "requests"
  const [stats,setStats]=useState(null);
  const [loading,setLoading]=useState(false);
  const [msg,setMsg]=useState("");
  const [filter,setFilter]=useState("");

  // Modals
  const [banTarget,setBanTarget]=useState(null);
  const [banReason,setBanReason]=useState("");
  const [banExpiry,setBanExpiry]=useState("");
  const [skipTarget,setSkipTarget]=useState(null);
  const [skipLevel,setSkipLevel]=useState(1);
  const [noteTarget,setNoteTarget]=useState(null);
  const [noteText,setNoteText]=useState("");
  const [sessionTarget,setSessionTarget]=useState(null);
  const [sessionData,setSessionData]=useState([]);
  const [sessionLoading,setSessionLoading]=useState(false);
  const [warnTarget,setWarnTarget]=useState(null);
  const [warnMsg,setWarnMsg]=useState("");

  // Keys
  const [keysInput,setKeysInput]=useState("");
  const [keysProfiles,setKeysProfiles]=useState([]);
  const [keysTargetUid,setKeysTargetUid]=useState(null);
  const [trialsAmount,setTrialsAmount]=useState({});
  const [trialsMsgs,setTrialsMsgs]=useState({});
  const [keysAmount,setKeysAmount]=useState({});
  const [keysLoading,setKeysLoading]=useState(false);
  const [keysMsgs,setKeysMsgs]=useState({});

  // Search
  const [searchInput,setSearchInput]=useState("");
  const [searchResult,setSearchResult]=useState(null);
  const [searchLoading,setSearchLoading]=useState(false);

  // Broadcast
  const [broadcastMsg,setBroadcastMsg]=useState("");
  const [currentBroadcast,setCurrentBroadcast]=useState(null);

  // Maintenance
  const [maintEnabled,setMaintEnabled]=useState(false);
  const [maintMsg,setMaintMsg]=useState("");
  const [maintTriggers,setMaintTriggers]=useState({admins:false,users:true});

  // Level editor
  const [levelOverrides,setLevelOverrides]=useState({});
  const [editingLevel,setEditingLevel]=useState(null);
  const [editWords,setEditWords]=useState("");

  // Grant
  const [grantInput,setGrantInput]=useState("");
  const [profileAdminInput,setProfileAdminInput]=useState("");
  const [profileAdminLookupUid,setProfileAdminLookupUid]=useState(null);
  const [profileAdminProfiles,setProfileAdminProfiles]=useState([]);
  const [profileAdminLoading,setProfileAdminLoading]=useState(false);
  const [showSwitcher,setShowSwitcher]=useState(false);
  const [switcherMode,setSwitcherMode]=useState("menu"); // "menu" | "account"

  const flash = m => { setMsg(m); setTimeout(()=>setMsg(""),3000); };

  useEffect(()=>{ return onAuthStateChanged(adminAuth, async u => {
    setUser(u);
    setAdminProfiles(null); setChosenAdminProfile(null); setAccountIsAdmin(false);
    if(!u){ setAdminOk(false); setAuthChecked(true); return; }
    const accountOk = await isAdmin(u.uid,adminDb).catch(()=>false);
    setAccountIsAdmin(accountOk);
    const profiles = await getProfilesForAdmin(u.uid,adminDb).catch(()=>[]);
    setAdminProfiles(profiles||[]);
    if(accountOk){
      // Account-level admin: in immediately, default the switcher to the first profile.
      setChosenAdminProfile(profiles?.[0]||null);
      setAdminOk(true); setAuthChecked(true); return;
    }
    // Not an account-level admin — check if any profile under this account
    // is a Profile Admin, so the person can pick which profile to act as.
    setAdminOk(false); // no profile chosen yet; picking one (if eligible) flips this to true
    setAuthChecked(true);
  }); },[]);

  // Once a profile is chosen, confirm it's actually a Profile Admin before granting access.
  const chooseAdminProfile = (p) => {
    setChosenAdminProfile(p);
    setAdminOk(accountIsAdmin || p?.isProfileAdmin === true);
    flash(`Acting as ${p?.name || "this profile"}`);
  };

  // Sign in directly from the admin page. onAuthStateChanged above reacts
  // automatically once sign-in succeeds — no manual redirect needed, the
  // page just re-renders into the admin panel (or the profile picker) once
  // the new auth state resolves.
  const handleAdminSignIn = async (providerName) => {
    setAdminSignInErr(""); setAdminSignInLoading(true);
    try {
      const provider = providerName === "github" ? new GithubAuthProvider() : new GoogleAuthProvider();
      const result = await signInWithPopup(adminAuth, provider);
      if (!result?.user) setAdminSignInErr("Sign in failed — try again.");
    } catch (e) {
      if (e?.code === "auth/popup-closed-by-user" || e?.code === "auth/cancelled-popup-request") {
        setAdminSignInErr("Popup was closed. Tap the button to try again.");
      } else {
        setAdminSignInErr(e?.message || "Sign in failed.");
      }
    }
    setAdminSignInLoading(false);
  };

  // Switch-account/profile bar. IMPORTANT: this shares the same `auth` as the
  // main game (there's only one Firebase Auth session per browser), so
  // switching the signed-in account here WILL also change which account is
  // signed into the game in any open tab. We confirm before doing it so
  // that's never a surprise.
  const [switchEmail,setSwitchEmail]=useState("");
  const [switchPass,setSwitchPass]=useState("");
  const [switchErr,setSwitchErr]=useState("");
  const [switchLoading,setSwitchLoading]=useState(false);

  const doSwitchAccount = async (action) => {
    // action: () => Promise<...> — the actual sign-in call to run after sign-out
    setSwitchErr(""); setSwitchLoading(true);
    try {
      await signOut(adminAuth);
      await action();
      setShowSwitcher(false); setSwitcherMode("menu");
      setSwitchEmail(""); setSwitchPass(""); setConfirmSwitchAccount(null);
    } catch (e) {
      setSwitchErr(e?.message || "Sign in failed.");
    }
    setSwitchLoading(false);
  };

  useEffect(()=>{ if(adminOk) loadBansAndAdmins(); },[adminOk]);
  useEffect(()=>{ if(adminOk&&tab==="log") getActivityLog(100,adminDb).then(setLog).catch(()=>{}); },[tab,adminOk]);
  const [failStats, setFailStats] = useState(null);
  const [failStatsLoading, setFailStatsLoading] = useState(false);
  useEffect(()=>{ if(adminOk&&tab==="feedback") getAdminFeedback(50,adminDb).then(setFeedbackList).catch(()=>{}); },[tab,adminOk]);
  useEffect(()=>{ if(adminOk&&tab==="anticheat"){ getFlaggedScores(adminDb).then(setFlaggedScores).catch(()=>{}); getRestoreRequests(adminDb).then(setRestoreRequests).catch(()=>{}); } },[tab,adminOk]);
  useEffect(()=>{ if(adminOk&&tab==="birthday") getAdminBirthdayRequests(adminDb).then(setBdayReqList).catch(()=>{}); },[tab,adminOk]);
  useEffect(()=>{ if(adminOk&&tab==="settings") getMaintenanceMode().then(m=>{setMaintEnabled(m.enabled);setMaintMsg(m.message||"");if(m.triggers)setMaintTriggers(m.triggers);}); },[tab,adminOk]);
  useEffect(()=>{ if(adminOk&&tab==="analytics"&&!failStats){setFailStatsLoading(true);getLevelFailStats(adminDb).then(d=>{setFailStats(d);setFailStatsLoading(false);}).catch(()=>setFailStatsLoading(false));} },[tab,adminOk]);
  useEffect(()=>{ if(adminOk&&tab==="broadcast") getBroadcast().then(b=>{if(b)setCurrentBroadcast(b);}); },[tab,adminOk]);
  useEffect(()=>{ if(adminOk&&tab==="levels") getLevelOverrides().then(setLevelOverrides).catch(()=>{}); },[tab,adminOk]);
  useEffect(()=>{ if(adminOk&&tab==="stats") getAppStats(adminDb).then(setStats).catch(()=>{}); },[tab,adminOk]);

  // COPPA: getAllUsers() returns every account AND every profile under every
  // account, including child profiles' real names and birthdays. This used
  // to load unconditionally the instant the admin panel opened, with no
  // search term or reason required, and rendered every email/username/child
  // name in plain text by default. There is no COPPA exception that covers
  // standing visibility into a full directory like that - the internal
  // operations/security exceptions only cover a bare persistent identifier,
  // not a full profile, and explicitly cannot be used to amass a profile on
  // a specific individual. bans/admins still load automatically since those
  // are already moderation-scoped lists (only people already banned or made
  // admin appear there), which is the narrow, purpose-tied access that's fine.
  async function loadBansAndAdmins() {
    setLoading(true);
    const [b,a] = await Promise.all([getAllBans(adminDb),getAllAdmins(adminDb)]);
    setBans(b); setAdmins(a); setLoading(false);
  }

  async function loadAllUsersIfNeeded() {
    if (usersLoaded) return;
    const u = await getAllUsers(adminDb);
    setUsers(u); setUsersLoaded(true);
  }

  const resolve = async (input) => {
    const raw = input.trim().replace(/^@/,'');
    if (!raw) return null;
    if (/^[A-Za-z0-9]{20,}$/.test(raw)) return { uid: raw, ...users.find(u=>u.uid===raw) };
    const found = await getUserByUsername(raw);
    if (!found) { flash("User not found: "+raw); return null; }
    return found;
  };

  async function handleBan() {
    if(!banTarget) return;
    const data = { reason: banReason||"No reason given", bannedBy: user.uid };
    if (banExpiry) { await tempBanUser(banTarget.uid, { ...data, expiresAt: new Date(banExpiry).toISOString() }, adminDb); }
    else { await banUser(banTarget.uid, data, adminDb); }
    await logActivity("ban", { adminUid:user.uid, targetUid:banTarget.uid, targetUsername:banTarget.username, detail:banReason+(banExpiry?` (expires ${banExpiry})` :"") }, adminDb);
    flash(`Banned ${banTarget.username||banTarget.email}`);
    setBanTarget(null); setBanReason(""); setBanExpiry(""); loadBansAndAdmins();
  }

  async function handleUnban(uid,username) {
    await unbanUser(uid,adminDb);
    await logActivity("unban",{adminUid:user.uid,targetUid:uid,targetUsername:username},adminDb);
    flash("Unbanned"); loadBansAndAdmins();
  }

  async function handleGrant() {
    const found = await resolve(grantInput); if(!found) return;
    await grantAdmin(found.uid, user.uid, adminDb);
    await logActivity("grant_admin",{adminUid:user.uid,targetUid:found.uid,targetUsername:found.username},adminDb);
    flash(`Admin granted`); setGrantInput(""); loadBansAndAdmins();
  }

  async function handleRevoke(uid,username) {
    if(uid===user.uid){flash("Can't revoke yourself");return;}
    await revokeAdmin(uid,adminDb);
    await logActivity("revoke_admin",{adminUid:user.uid,targetUid:uid,targetUsername:username},adminDb);
    flash("Revoked"); loadBansAndAdmins();
  }

  async function handleProfileAdminLookup() {
    const found = await resolve(profileAdminInput); if(!found) return;
    setProfileAdminLoading(true);
    const profiles = await getProfilesForAdmin(found.uid,adminDb);
    setProfileAdminProfiles(profiles||[]); setProfileAdminLookupUid(found.uid);
    setProfileAdminLoading(false);
  }

  async function handleToggleProfileAdmin(profileId,profileName,nextValue) {
    await adminSetProfileAdmin(profileAdminLookupUid,profileId,nextValue,adminDb);
    await logActivity(nextValue?"grant_profile_admin":"revoke_profile_admin",{adminUid:user.uid,targetUid:profileAdminLookupUid,detail:`Profile "${profileName}"`},adminDb);
    flash(nextValue?`Granted Profile Admin to "${profileName}"`:`Revoked Profile Admin from "${profileName}"`);
    const updated = await getProfilesForAdmin(profileAdminLookupUid,adminDb);
    setProfileAdminProfiles(updated);
  }

  async function handleSkip(profileId) {
    if(!skipTarget) return;
    await adminSkipLevel(skipTarget.uid, profileId, skipLevel, adminDb);
    await logActivity("skip_level",{adminUid:user.uid,targetUid:skipTarget.uid,targetUsername:skipTarget.username,detail:`level ${skipLevel}`},adminDb);
    flash(`Skipped to level ${skipLevel}`);
  }

  async function handleSaveNote() {
    if(!noteTarget) return;
    await setAdminNote(noteTarget.uid, noteText, user.uid, adminDb);
    flash("Note saved"); setNoteTarget(null); setNoteText("");
  }

  async function openNote(u) { const e=await getAdminNote(u.uid,adminDb); setNoteText(e?.note||""); setNoteTarget(u); }

  async function openSessions(u) {
    setSessionTarget(u); setSessionLoading(true); setSessionData([]);
    const s = await getUserSessions(u.uid,adminDb);
    setSessionData(s); setSessionLoading(false);
  }

  async function handleWarn() {
    if(!warnTarget||!warnMsg.trim()) return;
    await warnUser(warnTarget.uid,{message:warnMsg,warnedBy:user.uid},adminDb);
    await logActivity("warn",{adminUid:user.uid,targetUid:warnTarget.uid,targetUsername:warnTarget.username,detail:warnMsg},adminDb);
    flash(`Warned ${warnTarget.username||warnTarget.email}`);
    setWarnTarget(null); setWarnMsg("");
  }

  async function handleClearWarn(uid,username) {
    await clearWarning(uid);
    await logActivity("clear_warn",{adminUid:user.uid,targetUid:uid,targetUsername:username},adminDb);
    flash("Warning cleared");
  }

  async function handleKeysLookup() {
    const found = await resolve(keysInput); if(!found) return;
    setKeysLoading(true);
    const profiles = await getProfilesForAdmin(found.uid,adminDb);
    setKeysProfiles(profiles||[]); setKeysTargetUid(found.uid);
    setKeysLoading(false);
  }

  async function handleSetKeys(profileId,profileName) {
    const amount = parseInt(keysAmount[profileId]); if(isNaN(amount)||amount<0) return;
    await adminSetKeys(keysTargetUid,profileId,amount,adminDb);
    await logActivity("set_keys",{adminUid:user.uid,targetUid:keysTargetUid,detail:`Set to ${amount} keys for "${profileName}"`},adminDb);
    setKeysMsgs(p=>({...p,[profileId]:`Set to ${amount}!`}));
    setTimeout(()=>setKeysMsgs(p=>({...p,[profileId]:null})),3000);
    const updated = await getProfilesForAdmin(keysTargetUid,adminDb);
    setKeysProfiles(updated);
  }

  async function handleSetTrials(profileId,profileName) {
    const amount = parseInt(trialsAmount[profileId]); if(isNaN(amount)||amount<0||amount>99) return;
    await adminSetTrials(keysTargetUid,profileId,amount,adminDb);
    await logActivity("set_trials",{adminUid:user.uid,targetUid:keysTargetUid,detail:`Set trials to ${amount} for "${profileName}"`},adminDb);
    setTrialsMsgs(p=>({...p,[profileId]:`Trials set to ${amount}!`}));
    setTimeout(()=>setTrialsMsgs(p=>({...p,[profileId]:null})),3000);
  }

  async function handleSearch() {
    const raw = searchInput.trim().replace(/^@/,''); if(!raw) return;
    setSearchLoading(true); setSearchResult(null);
    let found = users.find(u=>u.uid===raw||u.username===raw.toLowerCase());
    if(!found) { const r=await getUserByUsername(raw); if(r) found=users.find(u=>u.uid===r.uid)||r; }
    setSearchResult(found||"not_found"); setSearchLoading(false);
  }

  async function handleBroadcast() {
    await setBroadcast(broadcastMsg, user.uid);
    await logActivity("broadcast",{adminUid:user.uid,detail:broadcastMsg},adminDb);
    setCurrentBroadcast(broadcastMsg ? {message:broadcastMsg,active:true} : null);
    flash(broadcastMsg?"Broadcast sent":"Broadcast cleared");
  }

  async function handleMaintenance() {
    await setMaintenanceMode(maintEnabled,maintMsg,maintTriggers,adminDb);
    await logActivity("maintenance",{adminUid:user.uid,detail:maintEnabled?`on: ${maintMsg}`:"off",triggers:maintTriggers},adminDb);
    flash(maintEnabled?"Maintenance ON":"Maintenance OFF");
  }

  async function handleSaveLevel() {
    if(!editingLevel) return;
    const words = editWords.split('\n').map(w=>w.trim()).filter(Boolean);
    if(!words.length) return;
    await updateLevelWords(editingLevel, words, adminDb);
    await logActivity("edit_level",{adminUid:user.uid,detail:`level ${editingLevel}: ${words.length} words`},adminDb);
    setLevelOverrides(p=>({...p,[String(editingLevel)]:words}));
    flash(`Level ${editingLevel} words updated`);
    setEditingLevel(null); setEditWords("");
  }

  const bannedUids = new Set(bans.map(b=>b.uid));
  const adminUids = new Set(admins.map(a=>a.uid));
  const filtered = !filter.trim() ? [] : users.filter(u => {
    const s=filter.toLowerCase();
    return u.email?.toLowerCase().includes(s)||u.username?.toLowerCase().includes(s)||u.uid.includes(s);
  });

  if(!authChecked) return <div style={{...st.page,display:"flex",alignItems:"center",justifyContent:"center"}}><div style={{color:T.muted}}>Checking...</div></div>;

  if(!user) return (
    <div style={{...st.page,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
      <div style={{fontSize:32}}>🔒</div>
      <div style={{color:T.text,fontWeight:700}}>Sign in to access admin</div>
      <div style={{display:"flex",gap:10}}>
        <button onClick={()=>handleAdminSignIn("google")} disabled={adminSignInLoading} style={{padding:"10px 22px",borderRadius:8,border:"none",background:T.purple,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",opacity:adminSignInLoading?0.6:1}}>
          {adminSignInLoading?"…":"Sign in with Google"}
        </button>
        <button onClick={()=>handleAdminSignIn("github")} disabled={adminSignInLoading} style={{padding:"10px 22px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.text,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit",opacity:adminSignInLoading?0.6:1}}>
          {adminSignInLoading?"…":"Sign in with GitHub"}
        </button>
      </div>
      {adminSignInErr && <div style={{color:T.danger,fontSize:11,maxWidth:280,textAlign:"center"}}>{adminSignInErr}</div>}
    </div>
  );

  // Signed in, not an account-level admin, and hasn't picked a profile yet —
  // let them choose which profile they're acting as. Only profiles with
  // isProfileAdmin will actually grant access once chosen.
  if(!accountIsAdmin && !chosenAdminProfile && adminProfiles) {
    const eligible = adminProfiles.filter(p=>p.isProfileAdmin===true);
    return (
      <div style={{...st.page,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14,padding:20}}>
        <div style={{fontSize:32}}>👤</div>
        <div style={{color:T.text,fontWeight:700}}>Choose your profile</div>
        {eligible.length===0 ? (
          <>
            <div style={{color:T.danger,fontSize:12,textAlign:"center",maxWidth:280}}>None of your profiles have admin access.</div>
            <div style={{color:T.faint,fontSize:11}}>UID: {user.uid}</div>
            <div style={{color:T.faint,fontSize:11}}>Signed in as: {user.email || "unknown"}</div>
            <button onClick={()=>signOut(adminAuth)} style={{marginTop:8,padding:"9px 20px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.text,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:"inherit"}}>
              Sign out
            </button>
          </>
        ) : (
          <div style={{display:"flex",flexDirection:"column",gap:8,width:"100%",maxWidth:300}}>
            {adminProfiles.map(p=>(
              <button key={p.id} onClick={()=>chooseAdminProfile(p)} disabled={!p.isProfileAdmin}
                style={{padding:"10px 16px",borderRadius:8,border:`1px solid ${p.isProfileAdmin?T.purple:T.border}`,background:p.isProfileAdmin?T.purple+"22":"transparent",color:p.isProfileAdmin?T.purple:T.faint,fontWeight:700,fontSize:13,cursor:p.isProfileAdmin?"pointer":"default",fontFamily:"inherit",textAlign:"left",opacity:p.isProfileAdmin?1:0.5}}>
                {p.name} {p.isProfileAdmin?"":"(not admin)"}
              </button>
            ))}
            <button onClick={()=>signOut(adminAuth)} style={{marginTop:4,padding:"8px 16px",borderRadius:8,border:"none",background:"transparent",color:T.faint,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
              Sign out / switch account
            </button>
          </div>
        )}
      </div>
    );
  }

  if(!adminOk) return <div style={{...st.page,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:12}}><div style={{fontSize:32}}>🔒</div><div style={{color:T.danger,fontWeight:700}}>Access denied</div><div style={{color:T.muted,fontSize:11}}>{user?`UID: ${user.uid}`:"Not logged in"}</div></div>;

  return (
    <div style={st.page}>
      <div style={{maxWidth:780,margin:"0 auto"}}>

        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:18,flexWrap:"wrap",gap:8}}>
          <div><div style={{fontSize:15,fontWeight:700,color:T.purple}}>AccuratKey Admin</div><div style={{fontSize:10,color:T.muted}}>{user?.email}{chosenAdminProfile?` · ${chosenAdminProfile.name}`:""}</div></div>
          <div style={{display:"flex",gap:10,alignItems:"center"}}>
            <button onClick={()=>{setShowSwitcher(true);setSwitcherMode("menu");setSwitchErr("");}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:7,color:T.muted,fontSize:11,padding:"5px 10px",cursor:"pointer",fontFamily:"inherit"}}>Switch account/profile</button>
            <a href="/game" style={{color:T.muted,fontSize:11,textDecoration:"none"}}>← Back</a>
          </div>
        </div>

        {showSwitcher && (
          <div onClick={()=>{setShowSwitcher(false);setSwitcherMode("menu");setConfirmSwitchAccount(null);}} style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
            <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:22,width:"100%",maxWidth:360,maxHeight:"80vh",overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <span style={{color:T.text,fontWeight:700,fontSize:14}}>{switcherMode==="account"?"Switch account":"Switch account/profile"}</span>
                <button onClick={()=>{setShowSwitcher(false);setSwitcherMode("menu");setConfirmSwitchAccount(null);}} style={{background:"none",border:"none",color:T.faint,fontSize:18,cursor:"pointer"}}>×</button>
              </div>

              {switcherMode==="menu" && (
                <>
                  <div style={{color:T.faint,fontSize:10,letterSpacing:1,marginBottom:8}}>SWITCH PROFILE (same account)</div>
                  {(adminProfiles||[]).length===0 && <div style={{color:T.muted,fontSize:12,marginBottom:12}}>No profiles found on this account.</div>}
                  <div style={{display:"flex",flexDirection:"column",gap:6,marginBottom:18}}>
                    {(adminProfiles||[]).map(p=>(
                      <button key={p.id} onClick={()=>{chooseAdminProfile(p);setShowSwitcher(false);}} style={{padding:"9px 12px",borderRadius:8,border:`1px solid ${chosenAdminProfile?.id===p.id?T.purple:T.border}`,background:chosenAdminProfile?.id===p.id?T.purple+"22":"transparent",color:chosenAdminProfile?.id===p.id?T.purple:T.text,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit",textAlign:"left"}}>
                        {p.name} {p.isProfileAdmin?"⭐":""}
                      </button>
                    ))}
                  </div>
                  <div style={{color:T.faint,fontSize:10,letterSpacing:1,marginBottom:8}}>SWITCH ACCOUNT</div>
                  <div style={{color:T.muted,fontSize:11,marginBottom:10}}>
                    Admin has its own separate login — switching accounts here won't affect your game session.
                  </div>
                  <button onClick={()=>setSwitcherMode("account")} style={{width:"100%",padding:"9px 12px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.text,fontWeight:600,fontSize:12,cursor:"pointer",fontFamily:"inherit"}}>
                    Sign in as a different account →
                  </button>
                </>
              )}

              {switcherMode==="account" && (
                <>
                  <div style={{display:"flex",gap:8,marginBottom:10}}>
                    <button onClick={()=>doSwitchAccount(()=>signInWithPopup(adminAuth,new GoogleAuthProvider()))} disabled={switchLoading} style={{flex:1,padding:"9px",borderRadius:8,border:"none",background:T.purple,color:"#fff",fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",opacity:switchLoading?0.6:1}}>{switchLoading?"…":"Google"}</button>
                    <button onClick={()=>doSwitchAccount(()=>signInWithPopup(adminAuth,new GithubAuthProvider()))} disabled={switchLoading} style={{flex:1,padding:"9px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.text,fontWeight:700,fontSize:12,cursor:"pointer",fontFamily:"inherit",opacity:switchLoading?0.6:1}}>{switchLoading?"…":"GitHub"}</button>
                  </div>
                  <div style={{color:T.faint,fontSize:10,letterSpacing:1,marginBottom:8}}>OR EMAIL</div>
                  <input type="email" value={switchEmail} onChange={e=>setSwitchEmail(e.target.value)} placeholder="Email" style={{...st.input,width:"100%",marginBottom:8,boxSizing:"border-box"}} />
                  <input type="password" value={switchPass} onChange={e=>setSwitchPass(e.target.value)} placeholder="Password" style={{...st.input,width:"100%",marginBottom:10,boxSizing:"border-box"}} />
                  <button onClick={()=>doSwitchAccount(()=>signInWithEmailAndPassword(adminAuth,switchEmail,switchPass))} disabled={!switchEmail||!switchPass||switchLoading} style={{width:"100%",padding:"9px",borderRadius:8,border:"none",background:(!switchEmail||!switchPass)?"#444":T.purple,color:"#fff",fontWeight:700,fontSize:12,cursor:(!switchEmail||!switchPass)?"default":"pointer",fontFamily:"inherit",opacity:switchLoading?0.6:1}}>{switchLoading?"Signing in…":"Sign in with email"}</button>
                  {switchErr && <div style={{color:T.danger,fontSize:11,marginTop:10}}>{switchErr}</div>}
                </>
              )}
            </div>
          </div>
        )}

        {msg && <div style={{background:T.purple+"22",border:`1px solid ${T.purple}44`,borderRadius:8,padding:"9px 13px",marginBottom:12,color:T.purple,fontSize:12}}>{msg}</div>}

        {/* Global search */}
        <div style={{display:"flex",gap:8,marginBottom:14}}>
          <input value={searchInput} onChange={e=>setSearchInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleSearch()} placeholder="Search @username or UID..." style={{...st.input,flex:1}} />
          <button onClick={handleSearch} style={st.btn()}>{searchLoading?"...":"Search"}</button>
        </div>
        {searchResult && searchResult!=="not_found" && (
          <div style={{...st.card,marginBottom:14,border:`1px solid ${T.purple}44`}}>
            <div style={{color:T.purple,fontSize:10,marginBottom:8,fontWeight:700}}>Search result</div>
            <UserRow u={searchResult} bannedUids={bannedUids} adminUids={adminUids} currentUid={user.uid}
              onBan={setBanTarget} onUnban={handleUnban} onSkip={setSkipTarget} onNote={openNote} onWarn={setWarnTarget} onSessions={openSessions} />
          </div>
        )}
        {searchResult==="not_found" && <div style={{color:T.danger,fontSize:12,marginBottom:12}}>Not found</div>}

        {/* Tabs */}
        <div style={{display:"flex",gap:4,marginBottom:16,background:T.card,borderRadius:10,padding:4,border:`1px solid ${T.border}`,flexWrap:"wrap"}}>
          {TABS.map(t=>(
            <button key={t} onClick={()=>setTab(t)} style={st.tab(tab===t)}>
              {t==="stats"?"📊 Stats":t==="users"?`👥 Users (${users.length})`:t==="bans"?`🔨 Bans (${bans.length})`:t==="admins"?`🔑 Admins`:t==="keys"?"💰 Keys":t==="trials"?"⏱ Trials":t==="warn"?"⚠️ Warn":t==="broadcast"?"📢 Broadcast":t==="levels"?"🗺️ Levels":t==="analytics"?"📈 Analytics":t==="log"?"📋 Log":t==="feedback"?"💬 Feedback":t==="anticheat"?`🚩 Anti-cheat (${flaggedScores.filter(f=>f.status==="pending").length+restoreRequests.filter(r=>r.status==="pending").length})`:t==="birthday"?`🎂 Birthdays (${bdayReqList.length})`:t==="settings"?"⚙️ Settings":""}
            </button>
          ))}
        </div>

        {loading && <div style={{color:T.muted,fontSize:12,textAlign:"center",padding:32}}>Loading...</div>}

        {/* STATS */}
        {tab==="stats" && (
          <div>
            {stats ? (
              <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:10,marginBottom:20}}>
                {[["👥 Total Users",stats.totalUsers],["🔨 Banned",stats.totalBans],["🔑 Admins",stats.totalAdmins],["📋 Log Entries",stats.totalLogEntries]].map(([label,val])=>(
                  <div key={label} style={st.card}>
                    <div style={{color:T.muted,fontSize:10}}>{label}</div>
                    <div style={{color:T.purple,fontSize:28,fontWeight:800,marginTop:4}}>{val}</div>
                  </div>
                ))}
              </div>
            ) : <div style={{color:T.muted,fontSize:12,padding:24,textAlign:"center"}}>Loading stats...</div>}

            <div style={{...st.card,marginTop:8}}>
              <div style={{color:T.text,fontWeight:700,fontSize:13,marginBottom:6}}>🧒 COPPA pre-existing data audit</div>
              <div style={{color:T.muted,fontSize:11,marginBottom:10,lineHeight:1.5}}>
                Scans every account's profiles and reports counts only — no names, emails, or UIDs are ever returned. Tells you how many existing profiles are already restricted (under 13) and whether any of them still have a photo, a public username, or session history that predates the privacy fixes.
              </div>
              <button onClick={runCoppaAudit} disabled={coppaAuditLoading} style={{...st.btn(),opacity:coppaAuditLoading?0.6:1}}>
                {coppaAuditLoading?"Scanning...":coppaAudit?"Re-scan":"Run audit"}
              </button>
              {coppaAudit && (
                <div style={{marginTop:14,display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))",gap:8}}>
                  {[
                    ["Accounts scanned",coppaAudit.totalAccounts,T.muted],
                    ["Profiles scanned",coppaAudit.totalProfiles,T.muted],
                    ["Restricted (under 13)",coppaAudit.restrictedProfiles,coppaAudit.restrictedProfiles>0?T.danger:T.accent],
                    ["...with a photo",coppaAudit.restrictedWithPhoto,coppaAudit.restrictedWithPhoto>0?T.danger:T.accent],
                    ["...with public username",coppaAudit.restrictedWithPublicUsername,coppaAudit.restrictedWithPublicUsername>0?T.danger:T.accent],
                    ["...with session history",coppaAudit.restrictedWithSessions,coppaAudit.restrictedWithSessions>0?T.danger:T.accent],
                  ].map(([label,val,color])=>(
                    <div key={label} style={{background:T.bg,borderRadius:8,padding:"8px 10px",border:`1px solid ${T.border}`}}>
                      <div style={{color:T.faint,fontSize:9,marginBottom:2}}>{label}</div>
                      <div style={{color,fontSize:20,fontWeight:800}}>{val}</div>
                    </div>
                  ))}
                  <div style={{gridColumn:"1/-1",color:T.faint,fontSize:10,marginTop:4}}>Scanned {new Date(coppaAudit.scannedAt).toLocaleString()}</div>
                </div>
              )}
              {coppaAudit && coppaAudit.restrictedProfiles > 0 && (
                <div style={{marginTop:10,color:T.danger,fontSize:11,lineHeight:1.5,background:T.danger+"11",border:`1px solid ${T.danger}33`,borderRadius:8,padding:"8px 10px"}}>
                  {coppaAudit.restrictedProfiles} existing profile(s) are already restricted. The privacy fixes already in place stop any NEW data collection for them. Public username exposure is already handled automatically (restricted profiles never appear on the public page regardless). Photo, session history, and daily-leaderboard entries can be cleaned up automatically below.
                </div>
              )}
              {coppaAudit && (coppaAudit.restrictedWithPhoto > 0 || coppaAudit.restrictedWithSessions > 0) && (
                <div style={{marginTop:10}}>
                  <button onClick={handleRunCoppaCleanup} disabled={coppaCleanupLoading} style={{...st.btn(T.danger,T.danger+"22"),opacity:coppaCleanupLoading?0.6:1}}>
                    {coppaCleanupLoading?"Cleaning...":"Remove photos + delete session history for all restricted profiles"}
                  </button>
                  <div style={{color:T.faint,fontSize:10,marginTop:6,lineHeight:1.5}}>
                    This permanently deletes data — it can't be undone. Daily-leaderboard entries are only removed for accounts where every single profile is restricted (no ambiguity about which profile a shared-account score belongs to); accounts with a mix of restricted and non-restricted profiles are skipped and reported separately.
                  </div>
                </div>
              )}
              {coppaCleanupResult && (
                <div style={{marginTop:10,color:T.accent,fontSize:11,background:T.accent+"11",border:`1px solid ${T.accent}33`,borderRadius:8,padding:"8px 10px",lineHeight:1.5}}>
                  Cleaned {coppaCleanupResult.profilesCleaned} profile(s): removed {coppaCleanupResult.photosRemoved} photo(s), deleted {coppaCleanupResult.sessionsDeleted} session record(s), deleted {coppaCleanupResult.dailyScoresDeleted||0} daily leaderboard entry(ies). {new Date(coppaCleanupResult.cleanedAt).toLocaleString()}
                  {coppaCleanupResult.mixedAccountsSkipped > 0 && (
                    <div style={{marginTop:6,color:T.accent2}}>
                      {coppaCleanupResult.mixedAccountsSkipped} account(s) have a mix of restricted and non-restricted profiles — their daily scores were left alone since it's not possible to tell which profile a score belongs to on a shared account. Search those accounts individually in the Users tab if you want to review them by hand.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* USERS */}
        {!loading&&tab==="users"&&(
          <div>
            <input value={filter} onChange={e=>{ setFilter(e.target.value); if(e.target.value.trim()) loadAllUsersIfNeeded(); }} placeholder="Filter — type a username, email, or UID to load matching accounts..." style={{...st.input,marginBottom:10}} />
            {filtered.length===0&&<div style={{color:T.muted,textAlign:"center",padding:24,fontSize:12}}>No users</div>}
            {!filter.trim() ? (
              <div style={{color:T.muted,fontSize:12,padding:24,textAlign:"center",lineHeight:1.6}}>Type a username, email, or UID above to look up an account. There's no default list of every user here on purpose.</div>
            ) : filtered.length === 0 ? (
              <div style={{color:T.muted,fontSize:12,padding:24,textAlign:"center"}}>No matching accounts.</div>
            ) : filtered.map(u=><UserRow key={u.uid} u={u} bannedUids={bannedUids} adminUids={adminUids} currentUid={user.uid} onBan={setBanTarget} onUnban={handleUnban} onSkip={setSkipTarget} onNote={openNote} onWarn={setWarnTarget} onSessions={openSessions} />)}
          </div>
        )}

        {/* BANS */}
        {!loading&&tab==="bans"&&(
          <div>
            {bans.length===0&&<div style={{color:T.muted,textAlign:"center",padding:24,fontSize:12}}>No bans</div>}
            {bans.map(b=>{const u=users.find(u=>u.uid===b.uid);return(
              <div key={b.uid} style={st.card}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:8}}>
                  <div>
                    <div style={{color:T.danger,fontWeight:700,fontSize:12}}>{u?.username?`@${u.username} · `:""}{u?.email||b.uid}</div>
                    <div style={{color:T.muted,fontSize:11,marginTop:2}}>Reason: {b.reason}</div>
                    {b.expiresAt&&<div style={{color:T.warn,fontSize:10}}>Expires: {new Date(b.expiresAt).toLocaleDateString()}</div>}
                    <div style={{color:T.faint,fontSize:10}}>By: {b.bannedBy?.slice(0,8)}... · {b.bannedAt?.seconds?new Date(b.bannedAt.seconds*1000).toLocaleDateString():""}</div>
                  </div>
                  <button onClick={()=>handleUnban(b.uid,u?.username)} style={st.btn(T.accent,T.accent+"22")}>Unban</button>
                </div>
              </div>
            );})}
          </div>
        )}

        {/* ADMINS */}
        {!loading&&tab==="admins"&&(
          <div>
            <div style={st.card}>
              <div style={st.label}>Grant account-level admin (@username or UID)</div>
              <div style={{display:"flex",gap:8}}>
                <input value={grantInput} onChange={e=>setGrantInput(e.target.value)} placeholder="@username or UID..." style={{...st.input,flex:1}} />
                <button onClick={handleGrant} style={st.btn()}>Grant</button>
              </div>
            </div>
            {admins.map(a=>{const u=users.find(u=>u.uid===a.uid);return(
              <div key={a.uid} style={st.card}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{color:T.purple,fontWeight:700,fontSize:12}}>{u?.username?`@${u.username} · `:""}{u?.email||a.uid}</div>
                    <div style={{color:T.faint,fontSize:9,marginTop:2}}>{a.uid}</div>
                  </div>
                  {a.uid!==user?.uid?<button onClick={()=>handleRevoke(a.uid,u?.username)} style={st.btn(T.danger,T.danger+"22")}>Revoke</button>:<span style={{color:T.faint,fontSize:11}}>you</span>}
                </div>
              </div>
            );})}

            <div style={{...st.card,marginTop:20}}>
              <div style={st.label}>Grant Profile Admin (look up account, then pick a profile)</div>
              <div style={{color:T.muted,fontSize:11,marginBottom:8}}>Profile Admin unlocks parental-gated features on that one profile, and lets it sign into this admin panel.</div>
              <div style={{display:"flex",gap:8}}>
                <input value={profileAdminInput} onChange={e=>setProfileAdminInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleProfileAdminLookup()} placeholder="@username or UID..." style={{...st.input,flex:1}} />
                <button onClick={handleProfileAdminLookup} style={st.btn()}>{profileAdminLoading?"...":"Look up"}</button>
              </div>
            </div>
            {profileAdminLookupUid&&profileAdminProfiles.length===0&&!profileAdminLoading&&<div style={{color:T.danger,fontSize:12,padding:"8px 0"}}>No profiles found</div>}
            {profileAdminProfiles.map(p=>(
              <div key={p.id} style={st.card}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <div style={{color:T.text,fontWeight:700,fontSize:12}}>{p.name}</div>
                    <div style={{color:p.isProfileAdmin?T.purple:T.faint,fontSize:10,marginTop:2}}>{p.isProfileAdmin?"Profile Admin":"Not admin"}</div>
                  </div>
                  {p.isProfileAdmin
                    ? <button onClick={()=>handleToggleProfileAdmin(p.id,p.name,false)} style={st.btn(T.danger,T.danger+"22")}>Revoke</button>
                    : <button onClick={()=>handleToggleProfileAdmin(p.id,p.name,true)} style={st.btn()}>Grant</button>
                  }
                </div>
              </div>
            ))}
          </div>
        )}

        {/* KEYS */}
        {tab==="keys"&&(
          <div>
            <div style={st.card}>
              <div style={st.label}>Look up by @username or UID</div>
              <div style={{display:"flex",gap:8}}>
                <input value={keysInput} onChange={e=>setKeysInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleKeysLookup()} placeholder="@username or UID..." style={{...st.input,flex:1}} />
                <button onClick={handleKeysLookup} style={st.btn()}>{keysLoading?"...":"Look up"}</button>
              </div>
            </div>
            {keysTargetUid&&keysProfiles.length===0&&!keysLoading&&<div style={{color:T.danger,fontSize:12,padding:"8px 0"}}>No profiles found</div>}
            {keysProfiles.map(p=>(
              <div key={p.id} style={st.card}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                  <div>
                    <div style={{color:T.text,fontWeight:700,fontSize:12,marginBottom:4}}>{p.name}</div>
                    <div style={{color:T.accent,fontSize:11}}>keys: {p.keys||0} · Lv {p.currentLevel||1}</div>
                    {keysMsgs[p.id]&&<div style={{color:T.accent,fontSize:11}}>{keysMsgs[p.id]}</div>}
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <input type="number" placeholder="set to..." value={keysAmount[p.id]||""} onChange={e=>setKeysAmount(prev=>({...prev,[p.id]:e.target.value}))} style={{...st.input,width:100}} />
                    <button onClick={()=>handleSetKeys(p.id,p.name)} style={st.btn()}>Set</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TRIALS */}
        {tab==="trials"&&(
          <div>
            <div style={st.card}>
              <div style={{color:T.text,fontSize:12,marginBottom:8}}>Set the number of shop trials a profile gets this week. Default is 5/week. Use this to grant extra trials as a reward or reset them.</div>
              <div style={st.label}>Look up by @username or UID</div>
              <div style={{display:"flex",gap:8}}>
                <input value={keysInput} onChange={e=>setKeysInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&handleKeysLookup()} placeholder="@username or UID..." style={{...st.input,flex:1}} />
                <button onClick={handleKeysLookup} style={st.btn()}>{keysLoading?"...":"Look up"}</button>
              </div>
            </div>
            {keysTargetUid&&keysProfiles.length===0&&!keysLoading&&<div style={{color:T.danger,fontSize:12,padding:"8px 0"}}>No profiles found</div>}
            {keysProfiles.map(p=>(
              <div key={p.id} style={st.card}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",flexWrap:"wrap",gap:10}}>
                  <div>
                    <div style={{color:T.text,fontWeight:700,fontSize:12,marginBottom:4}}>{p.name}</div>
                    <div style={{color:T.accent,fontSize:11,display:"flex",alignItems:"center",gap:3}}>Lv {p.currentLevel||1} · {p.keys||0} <KKey size={10}/></div>
                    {trialsMsgs[p.id]&&<div style={{color:T.accent,fontSize:11}}>{trialsMsgs[p.id]}</div>}
                  </div>
                  <div style={{display:"flex",gap:6,alignItems:"center"}}>
                    <input type="number" placeholder="set trials to..." min="0" max="99" value={trialsAmount[p.id]||""} onChange={e=>setTrialsAmount(prev=>({...prev,[p.id]:e.target.value}))} style={{...st.input,width:120}} />
                    <button onClick={()=>handleSetTrials(p.id,p.name)} style={st.btn()}>Set</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* WARN */}
        {tab==="warn"&&(
          <div>
            <div style={st.card}>
              <div style={{color:T.text,fontSize:12,marginBottom:12}}>Send a warning popup to a user. They'll see it on next login and must dismiss it.</div>
              <div style={st.label}>User (@username or UID)</div>
              <input placeholder="@username or UID..." style={{...st.input,marginBottom:8}}
                onKeyDown={async e=>{ if(e.key==="Enter"){ const f=await resolve(e.target.value); if(f) setWarnTarget(f); }}} />
              <div style={{color:T.faint,fontSize:10}}>Or click "Warn" on any user in the Users tab</div>
            </div>
            <div style={{color:T.muted,fontSize:11,marginBottom:8}}>Clear a warning by UID</div>
            <div style={{display:"flex",gap:8}}>
              <input placeholder="UID to clear warning..." style={{...st.input,flex:1}} id="clearWarnInput" />
              <button onClick={()=>{ const v=document.getElementById('clearWarnInput').value.trim(); if(v) handleClearWarn(v); }} style={st.btn(T.accent,T.accent+"22")}>Clear</button>
            </div>
          </div>
        )}

        {/* BROADCAST */}
        {tab==="broadcast"&&(
          <div>
            {currentBroadcast?.active&&(
              <div style={{...st.card,border:`1px solid ${T.warn}44`,marginBottom:14}}>
                <div style={{color:T.warn,fontSize:11,marginBottom:4}}>📢 Active broadcast</div>
                <div style={{color:T.text,fontSize:13}}>{currentBroadcast.message}</div>
              </div>
            )}
            <div style={st.card}>
              <div style={st.label}>Message (shows as banner to all users)</div>
              <textarea value={broadcastMsg} onChange={e=>setBroadcastMsg(e.target.value)} rows={3} placeholder="Announcement message..." style={{...st.input,resize:"vertical",marginBottom:10}} />
              <div style={{display:"flex",gap:8}}>
                <button onClick={handleBroadcast} style={{...st.btn(),flex:1,padding:"10px"}}>Send Broadcast</button>
                <button onClick={()=>{ setBroadcastMsg(""); setBroadcast("",user.uid); setCurrentBroadcast(null); flash("Cleared"); }} style={st.btn(T.muted,T.faint)}>Clear</button>
              </div>
            </div>
          </div>
        )}

        {/* LEVELS */}
        {tab==="levels"&&(
          <div>
            <div style={{color:T.muted,fontSize:11,marginBottom:12}}>Override word lists for any level. Leave as default to use built-in words.</div>
            {LEVELS.map(lv=>(
              <div key={lv.id} style={{...st.card,cursor:"pointer"}} onClick={()=>{ setEditingLevel(lv.id); setEditWords((levelOverrides[String(lv.id)]||lv.words).join('\n')); }}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <span style={{color:lv.color,fontWeight:700,fontSize:12}}>{lv.emoji} Lv {lv.id} — {lv.name}</span>
                    {levelOverrides[String(lv.id)]&&<span style={{marginLeft:8,background:T.warn+"22",color:T.warn,fontSize:9,padding:"1px 6px",borderRadius:6}}>CUSTOM</span>}
                  </div>
                  <span style={{color:T.faint,fontSize:10}}>{(levelOverrides[String(lv.id)]||lv.words).length} words</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ANALYTICS */}
        {tab==="analytics"&&(
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div style={{color:T.text,fontWeight:700,fontSize:13}}>📈 Level Fail Stats</div>
              <button onClick={()=>{
                const rows = [["Level","Fails"],...Object.entries(failStats||{}).sort((a,b)=>b[1]-a[1]).map(([k,v])=>[k,v])];
                const csv = rows.map(r=>r.join(",")).join("\n");
                const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="accuratkey_fail_stats.csv"; a.click();
              }} style={st.btn()}>Export CSV</button>
            </div>
            {failStatsLoading&&<div style={{color:T.muted,fontSize:12,textAlign:"center",padding:24}}>Loading... (may take a moment)</div>}
            {failStats&&!failStatsLoading&&(
              <div>
                <div style={{...st.card,marginBottom:14}}>
                  <div style={{color:T.muted,fontSize:10,marginBottom:8}}>Top failing levels</div>
                  {Object.entries(failStats).sort((a,b)=>b[1]-a[1]).slice(0,20).map(([level,count])=>(
                    <div key={level} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderBottom:`1px solid ${T.faint}`}}>
                      <div style={{color:T.text,fontSize:12,minWidth:60}}>{isNaN(Number(level)) ? level : `Level ${level}`}</div>
                      <div style={{flex:1,height:6,background:T.faint,borderRadius:3,overflow:"hidden"}}>
                        <div style={{height:"100%",background:T.danger,width:`${Math.min(100,(count/Math.max(...Object.values(failStats)))*100)}%`,borderRadius:3}} />
                      </div>
                      <div style={{color:T.danger,fontSize:12,fontWeight:700,minWidth:30,textAlign:"right"}}>{count}</div>
                    </div>
                  ))}
                </div>
                <div style={{...st.card}}>
                  <div style={{color:T.muted,fontSize:10,marginBottom:4}}>User Stats</div>
                  <div style={{color:T.text,fontSize:13}}>Total users: <strong>{users.length}</strong></div>
                  <div style={{color:T.text,fontSize:13,marginTop:4}}>Total fails tracked: <strong>{Object.values(failStats).reduce((a,b)=>a+b,0)}</strong></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* LOG */}
        {tab==="log"&&(
          <div>
            {log.length===0&&<div style={{color:T.muted,textAlign:"center",padding:24,fontSize:12}}>No activity</div>}
            {log.map(e=>(
              <div key={e.id} style={{...st.card,padding:"9px 13px"}}>
                <span style={{color:T.purple,fontWeight:700,fontSize:11}}>{e.action}</span>
                {e.targetUsername&&<span style={{color:T.muted,fontSize:11}}> · @{e.targetUsername}</span>}
                {e.detail&&<span style={{color:T.faint,fontSize:10}}> · {e.detail}</span>}
                <div style={{color:T.faint,fontSize:9,marginTop:2}}>by {e.adminUid?.slice(0,8)}... · {e.createdAt?.seconds?new Date(e.createdAt.seconds*1000).toLocaleString():""}</div>
              </div>
            ))}
          </div>
        )}

        {/* SETTINGS */}
        {tab==="feedback"&&(
          <div style={st.card}>
            <div style={{fontWeight:700,color:T.text,marginBottom:14,fontSize:13}}>💬 User Feedback ({feedbackList.length})</div>
            {feedbackList.length===0&&<div style={{color:T.muted,fontSize:12,textAlign:"center",padding:"20px 0"}}>No feedback yet.</div>}
            {feedbackList.map(f=>(
              <div key={f.id} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <div style={{display:"flex",alignItems:"center",gap:8}}>
                    {f.username
                      ? <button onClick={()=>{ setSearch(f.username); setTab("users"); }} style={{background:"none",border:"none",color:T.purple,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:0}}>@{f.username}</button>
                      : <span style={{color:T.muted,fontSize:10}}>{f.uid?.slice(0,8)}…</span>
                    }
                    {f.profileName && <span style={{color:T.faint,fontSize:10}}>· {f.profileName}</span>}
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"center"}}>
                    <span style={{color:T.faint,fontSize:10}}>{f.createdAt?new Date(f.createdAt).toLocaleString():"unknown time"}</span>
                    <button onClick={async()=>{
                      try{ await dismissFeedback(f.uid,f.id,adminDb); setFeedbackList(l=>l.filter(x=>x.id!==f.id)); }
                      catch(e){ alert("Failed to dismiss"); }
                    }} style={{background:"#ef444422",border:"1px solid #ef444444",borderRadius:6,color:"#ef4444",fontSize:10,fontWeight:700,padding:"2px 8px",cursor:"pointer"}}>
                      Dismiss
                    </button>
                  </div>
                </div>
                <div style={{color:T.text,fontSize:13,whiteSpace:"pre-wrap",lineHeight:1.5}}>{f.text}</div>
                {f.reply && <div style={{background:"#7c6af722",border:"1px solid #7c6af744",borderRadius:6,padding:"8px 10px",marginTop:8,fontSize:12,color:"#a78bfa"}}><span style={{fontWeight:700}}>Reply from {f.replyBy||"Admin"}:</span> {f.reply}</div>}
                {replyingTo===f.id ? (
                  <div style={{marginTop:10}}>
                    <textarea value={replyText} onChange={e=>setReplyText(e.target.value)} placeholder="Type your reply to the user..." rows={3}
                      style={{width:"100%",background:T.bg,border:"1px solid #7c6af7",borderRadius:7,color:T.text,fontSize:13,padding:"8px 10px",resize:"vertical",boxSizing:"border-box",fontFamily:"inherit"}}/>
                    <div style={{display:"flex",gap:8,marginTop:6}}>
                      <button disabled={!replyText.trim()||replySending} onClick={async()=>{
                        if(!replyText.trim()||!f.uid) return;
                        setReplySending(true);
                        try {
                          await replyToFeedback(f.id, f.uid, replyText.trim(), "AccuratKey Admin", adminDb);
                          setFeedbackList(l=>l.map(x=>x.id===f.id?{...x,reply:replyText.trim(),replyBy:"AccuratKey Admin"}:x));
                          setReplyingTo(null);setReplyText("");
                        } catch(e){ alert("Failed to send reply: " + (e?.message || "unknown error")); }
                        setReplySending(false);
                      }} style={{flex:1,padding:"7px",borderRadius:7,border:"none",background:"#7c6af7",color:"#fff",fontSize:12,fontWeight:700,cursor:!replyText.trim()?"default":"pointer",opacity:!replyText.trim()?0.5:1}}>
                        {replySending?"Sending...":"Send Reply"}
                      </button>
                      <button onClick={()=>{setReplyingTo(null);setReplyText("");}} style={{padding:"7px 14px",borderRadius:7,border:"1px solid #333",background:"transparent",color:"#888",fontSize:12,cursor:"pointer"}}>Cancel</button>
                    </div>
                  </div>
                ) : f.uid ? (
                  <button onClick={()=>{setReplyingTo(f.id);setReplyText("");}} style={{marginTop:8,padding:"5px 12px",borderRadius:6,border:"1px solid #7c6af744",background:"transparent",color:"#7c6af7",fontSize:11,cursor:"pointer",fontWeight:600}}>
                    {f.reply ? "Edit Reply" : "↩ Reply"}
                  </button>
                ) : (
                  <div style={{marginTop:8,fontSize:10,color:T.faint,fontStyle:"italic"}}>Submitted anonymously — no account to reply to</div>
                )}
              </div>
            ))}
          </div>
        )}

        {tab==="anticheat"&&(
          <div style={st.card}>
            <div style={{display:"flex",gap:8,marginBottom:14}}>
              <button onClick={()=>setAnticheatSubtab("flagged")} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${anticheatSubtab==="flagged"?"#ef4444":T.border}`,background:anticheatSubtab==="flagged"?"#ef444422":"transparent",color:anticheatSubtab==="flagged"?"#ef4444":T.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>🚩 Flagged Scores ({flaggedScores.filter(f=>f.status==="pending").length})</button>
              <button onClick={()=>setAnticheatSubtab("requests")} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${anticheatSubtab==="requests"?"#7c6af7":T.border}`,background:anticheatSubtab==="requests"?"#7c6af722":"transparent",color:anticheatSubtab==="requests"?"#7c6af7":T.muted,fontSize:11,fontWeight:700,cursor:"pointer"}}>📨 Restore Requests ({restoreRequests.filter(r=>r.status==="pending").length})</button>
            </div>

            {anticheatSubtab==="flagged" && (
              <>
                <div style={{fontWeight:700,color:T.text,marginBottom:14,fontSize:13}}>Auto-flagged Scores (WPM &gt; 250)</div>
                {flaggedScores.length===0&&<div style={{color:T.muted,fontSize:12,textAlign:"center",padding:"20px 0"}}>No flagged scores.</div>}
                {flaggedScores.map(f=>(
                  <div key={f.id} style={{background:T.bg,border:`1px solid ${f.status==="pending"?"#ef444444":T.border}`,borderRadius:8,padding:"12px 14px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <div style={{display:"flex",alignItems:"center",gap:8}}>
                        {f.username
                          ? <button onClick={()=>{ setFilter(f.username); setTab("users"); }} style={{background:"none",border:"none",color:T.purple,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",padding:0}}>@{f.username}</button>
                          : <span style={{color:T.muted,fontSize:10}}>{f.uid?.slice(0,8)}…</span>
                        }
                        <span style={{color:"#ef4444",fontSize:11,fontWeight:700}}>{f.wpm} WPM</span>
                        <span style={{color:T.faint,fontSize:10}}>· {f.accuracy}% acc</span>
                        <span style={{color:T.faint,fontSize:10}}>· {f.type==="daily"?`daily ${f.date}`:`level ${f.levelId}`}</span>
                      </div>
                      <span style={{color:T.faint,fontSize:10}}>{f.createdAt?.toDate?new Date(f.createdAt.toDate()).toLocaleString():""}</span>
                    </div>
                    <div style={{color:T.muted,fontSize:11,marginBottom:8}}>{f.reason}</div>
                    {f.status==="pending" ? (
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={async()=>{
                          try{
                            await approveFlaggedScore(f.id, { type:f.type, uid:f.uid, date:f.date, levelId:f.levelId }, adminDb);
                            setFlaggedScores(l=>l.map(x=>x.id===f.id?{...x,status:"approved"}:x));
                          }catch(e){ alert("Failed to approve"); }
                        }} style={{padding:"5px 12px",borderRadius:6,border:"1px solid #34d39944",background:"#34d39922",color:"#34d399",fontSize:11,fontWeight:700,cursor:"pointer"}}>✓ Restore (legit)</button>
                        <button onClick={async()=>{
                          try{
                            await dismissFlaggedScore(f.id,adminDb);
                            setFlaggedScores(l=>l.map(x=>x.id===f.id?{...x,status:"dismissed"}:x));
                          }catch(e){ alert("Failed to dismiss"); }
                        }} style={{padding:"5px 12px",borderRadius:6,border:"1px solid #ef444444",background:"#ef444422",color:"#ef4444",fontSize:11,fontWeight:700,cursor:"pointer"}}>✕ Keep removed</button>
                      </div>
                    ) : (
                      <span style={{fontSize:10,fontWeight:700,color:f.status==="approved"?"#34d399":T.faint}}>{f.status==="approved"?"✓ Restored":"✕ Dismissed"}</span>
                    )}
                  </div>
                ))}
              </>
            )}

            {anticheatSubtab==="requests" && (
              <>
                <div style={{fontWeight:700,color:T.text,marginBottom:14,fontSize:13}}>User Review Requests</div>
                {restoreRequests.length===0&&<div style={{color:T.muted,fontSize:12,textAlign:"center",padding:"20px 0"}}>No review requests.</div>}
                {restoreRequests.map(r=>(
                  <div key={r.id} style={{background:T.bg,border:`1px solid ${r.status==="pending"?"#7c6af744":T.border}`,borderRadius:8,padding:"12px 14px",marginBottom:8}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                      <span style={{color:T.muted,fontSize:10}}>{r.uid?.slice(0,8)}…</span>
                      <span style={{color:T.faint,fontSize:10}}>{r.createdAt?.toDate?new Date(r.createdAt.toDate()).toLocaleString():""}</span>
                    </div>
                    <div style={{color:T.text,fontSize:12,marginBottom:4}}>{r.context?.type==="daily"?`Daily challenge · ${r.context.date}`:r.context?.type==="level"?`Level ${r.context.levelId}`:"Unknown context"}</div>
                    {r.reason && <div style={{color:T.muted,fontSize:11,marginBottom:8}}>{r.reason}</div>}
                    {r.status==="pending" ? (
                      <div style={{display:"flex",gap:8}}>
                        <button onClick={async()=>{
                          try{ await resolveRestoreRequest(r.id,"acknowledged",adminDb); setRestoreRequests(l=>l.map(x=>x.id===r.id?{...x,status:"acknowledged"}:x)); }
                          catch(e){ alert("Failed to update"); }
                        }} style={{padding:"5px 12px",borderRadius:6,border:"1px solid #7c6af744",background:"#7c6af722",color:"#7c6af7",fontSize:11,fontWeight:700,cursor:"pointer"}}>Mark reviewed</button>
                      </div>
                    ) : (
                      <span style={{fontSize:10,fontWeight:700,color:T.faint}}>✓ {r.status}</span>
                    )}
                  </div>
                ))}
              </>
            )}
          </div>
        )}

        {tab==="birthday"&&(
          <div style={st.card}>
            <div style={{fontWeight:700,color:T.text,marginBottom:14,fontSize:13}}>🎂 Birthday Approval Requests ({bdayReqList.length})</div>
            {bdayReqList.length===0&&<div style={{color:T.muted,fontSize:12,textAlign:"center",padding:"20px 0"}}>No pending requests.</div>}
            {bdayReqList.map(r=>(
              <div key={r.id+r.uid} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"12px 14px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:6}}>
                  <div>
                    <span style={{color:T.text,fontSize:13,fontWeight:700}}>{r.profileName}</span>
                    <span style={{color:T.muted,fontSize:11,marginLeft:8}}>uid: {r.uid?.slice(0,10)}…</span>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button onClick={async()=>{
                      try{
                        await approveBirthdayRequest(r.uid,r.id,r.birthday,adminDb);
                        setBdayReqList(l=>l.filter(x=>!(x.id===r.id&&x.uid===r.uid)));
                      }catch(e){alert("Error: "+e.message);}
                    }} style={{background:"#34d39922",border:"1px solid #34d39944",borderRadius:6,color:"#34d399",fontSize:10,fontWeight:700,padding:"3px 10px",cursor:"pointer"}}>
                      ✓ Approve
                    </button>
                    <button onClick={async()=>{
                      try{
                        await rejectBirthdayRequest(r.uid,r.id,adminDb);
                        setBdayReqList(l=>l.filter(x=>!(x.id===r.id&&x.uid===r.uid)));
                      }catch(e){alert("Error: "+e.message);}
                    }} style={{background:"#ef444422",border:"1px solid #ef444444",borderRadius:6,color:"#ef4444",fontSize:10,fontWeight:700,padding:"3px 10px",cursor:"pointer"}}>
                      ✕ Reject
                    </button>
                  </div>
                </div>
                <div style={{color:T.muted,fontSize:12}}>Birthday: <span style={{color:T.text,fontWeight:700}}>{r.birthday}</span></div>
                {r.reason&&<div style={{color:T.faint,fontSize:11,marginTop:4}}>"{r.reason}"</div>}
              </div>
            ))}
          </div>
        )}

        {tab==="settings"&&(
          <div style={st.card}>
            <div style={{fontWeight:700,color:T.text,marginBottom:14,fontSize:13}}>🔧 Maintenance Mode</div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <button onClick={()=>setMaintEnabled(true)} style={st.tab(maintEnabled)}>ON</button>
              <button onClick={()=>setMaintEnabled(false)} style={st.tab(!maintEnabled)}>OFF</button>
            </div>
            <div style={st.label}>Message</div>
            <input value={maintMsg} onChange={e=>setMaintMsg(e.target.value)} placeholder="We'll be back soon..." style={{...st.input,marginBottom:16}} />
            <div style={st.label}>Who sees maintenance screen</div>
            <div style={{color:T.faint,fontSize:10,marginBottom:8}}>The owner account never sees the maintenance screen, regardless of these settings.</div>
            <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,overflow:"hidden",marginBottom:12}}>
              {[["admins","🔑 Admins","Admins also see it"],["users","👥 All users","Everyone sees it"]].map(([key,label,desc],i,arr)=>(
                <div key={key} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderBottom:i<arr.length-1?`1px solid ${T.border}`:"none"}}>
                  <div>
                    <div style={{color:T.text,fontSize:12,fontWeight:600}}>{label}</div>
                    <div style={{color:T.faint,fontSize:10}}>{desc}</div>
                  </div>
                  <button onClick={()=>setMaintTriggers(p=>({...p,[key]:!p[key]}))} style={{padding:"3px 14px",background:maintTriggers[key]?T.purple+"22":"transparent",border:`1px solid ${maintTriggers[key]?T.purple:T.border}`,borderRadius:20,color:maintTriggers[key]?T.purple:T.faint,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit",minWidth:48}}>{maintTriggers[key]?"ON":"OFF"}</button>
                </div>
              ))}
            </div>
            <button onClick={handleMaintenance} style={st.btn()}>Save</button>
          </div>
        )}


      </div>

      {/* BAN MODAL */}
      {banTarget&&(
        <Modal onClose={()=>{setBanTarget(null);setBanReason("");setBanExpiry("");}}>
          <div style={{color:T.danger,fontWeight:700,fontSize:14,marginBottom:4}}>Ban user</div>
          <div style={{color:T.muted,fontSize:11,marginBottom:14}}>{banTarget.username?`@${banTarget.username} · `:""}{banTarget.email}</div>
          <div style={st.label}>Reason</div>
          <input value={banReason} onChange={e=>setBanReason(e.target.value)} placeholder="Reason..." style={{...st.input,marginBottom:10}} autoFocus />
          <div style={st.label}>Expiry date (optional — leave blank for permanent)</div>
          <input type="date" value={banExpiry} onChange={e=>setBanExpiry(e.target.value)} style={{...st.input,marginBottom:14}} />
          <div style={{display:"flex",gap:8}}>
            <button onClick={handleBan} style={{...st.btn(T.danger,T.danger+"22"),flex:1,padding:"10px"}}>Confirm Ban</button>
            <button onClick={()=>{setBanTarget(null);setBanReason("");setBanExpiry("");}} style={{...st.btn(T.muted,T.faint),padding:"10px 14px"}}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* SKIP MODAL */}
      {skipTarget&&(
        <Modal onClose={()=>setSkipTarget(null)}>
          <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:4}}>Skip to Level</div>
          <div style={{color:T.muted,fontSize:11,marginBottom:14}}>{skipTarget.username?`@${skipTarget.username}`:skipTarget.email}</div>
          {skipTarget.profiles?.map(p=>(
            <div key={p.id} style={{background:T.faint,borderRadius:8,padding:"10px 12px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:8}}>
                <div><div style={{color:T.text,fontSize:12,fontWeight:700}}>{p.name}</div><div style={{color:T.muted,fontSize:10}}>Lv {p.currentLevel||1}</div></div>
                <div style={{display:"flex",gap:6,alignItems:"center"}}>
                  <input type="number" min={1} max={65} defaultValue={skipLevel} onChange={e=>setSkipLevel(Number(e.target.value))} style={{...st.input,width:60}} />
                  <button onClick={()=>handleSkip(p.id)} style={st.btn()}>Skip</button>
                </div>
              </div>
            </div>
          ))}
          <button onClick={()=>setSkipTarget(null)} style={{...st.btn(T.muted,T.faint),marginTop:8,width:"100%",padding:"9px"}}>Close</button>
        </Modal>
      )}

      {/* NOTE MODAL */}
      {noteTarget&&(
        <Modal onClose={()=>setNoteTarget(null)}>
          <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:4}}>Admin Note</div>
          <div style={{color:T.muted,fontSize:11,marginBottom:14}}>{noteTarget.username?`@${noteTarget.username}`:noteTarget.email}</div>
          <textarea value={noteText} onChange={e=>setNoteText(e.target.value)} rows={4} placeholder="Notes..." style={{...st.input,resize:"vertical",marginBottom:14}} />
          <div style={{display:"flex",gap:8}}>
            <button onClick={handleSaveNote} style={{...st.btn(),flex:1,padding:"10px"}}>Save</button>
            <button onClick={()=>setNoteTarget(null)} style={{...st.btn(T.muted,T.faint),padding:"10px 14px"}}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* WARN MODAL */}
      {warnTarget&&(
        <Modal onClose={()=>{setWarnTarget(null);setWarnMsg("");}}>
          <div style={{fontWeight:700,fontSize:14,color:T.warn,marginBottom:4}}>⚠️ Warn User</div>
          <div style={{color:T.muted,fontSize:11,marginBottom:14}}>{warnTarget.username?`@${warnTarget.username}`:warnTarget.email}</div>
          <div style={st.label}>Warning message (shown as popup)</div>
          <textarea value={warnMsg} onChange={e=>setWarnMsg(e.target.value)} rows={3} placeholder="Your account has received a warning for..." style={{...st.input,resize:"vertical",marginBottom:14}} autoFocus />
          <div style={{display:"flex",gap:8}}>
            <button onClick={handleWarn} style={{...st.btn(T.warn,T.warn+"22"),flex:1,padding:"10px"}}>Send Warning</button>
            <button onClick={()=>{setWarnTarget(null);setWarnMsg("");}} style={{...st.btn(T.muted,T.faint),padding:"10px 14px"}}>Cancel</button>
          </div>
        </Modal>
      )}

      {/* SESSIONS MODAL */}
      {sessionTarget&&(
        <Modal onClose={()=>{setSessionTarget(null);setSessionData([]);}}>
          <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:4}}>Session History</div>
          <div style={{color:T.muted,fontSize:11,marginBottom:14}}>{sessionTarget.username?`@${sessionTarget.username}`:sessionTarget.email}</div>
          {sessionLoading&&<div style={{color:T.muted,fontSize:12,padding:16,textAlign:"center"}}>Loading...</div>}
          {!sessionLoading&&sessionData.length===0&&<div style={{color:T.muted,fontSize:12,textAlign:"center",padding:16}}>No sessions</div>}
          <div style={{maxHeight:360,overflowY:"auto"}}>
            {sessionData.map((s,i)=>(
              <div key={i} style={{borderBottom:`1px solid ${T.faint}`,padding:"8px 0"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <div>
                    <span style={{color:T.text,fontSize:12,fontWeight:700}}>Lv {s.level}</span>
                    <span style={{color:T.muted,fontSize:11}}> · {s.profileName}</span>
                    {s.passed?<span style={{color:T.accent,fontSize:10,marginLeft:6}}>✓</span>:<span style={{color:T.danger,fontSize:10,marginLeft:6}}>✗</span>}
                  </div>
                  <div style={{textAlign:"right"}}>
                    <div style={{color:T.purple,fontSize:12,fontWeight:700}}>{s.wpm} WPM · {s.accuracy}%</div>
                    <div style={{color:T.faint,fontSize:9}}>{s.createdAt?.seconds?new Date(s.createdAt.seconds*1000).toLocaleString():""}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>{setSessionTarget(null);setSessionData([]);}} style={{...st.btn(T.muted,T.faint),marginTop:14,width:"100%",padding:"9px"}}>Close</button>
        </Modal>
      )}

      {/* LEVEL EDITOR MODAL */}
      {editingLevel&&(
        <Modal onClose={()=>{setEditingLevel(null);setEditWords("");}}>
          <div style={{fontWeight:700,fontSize:14,color:T.text,marginBottom:4}}>Edit Level {editingLevel} Words</div>
          <div style={{color:T.muted,fontSize:11,marginBottom:14}}>One word per line. No spaces within words.</div>
          <textarea value={editWords} onChange={e=>setEditWords(e.target.value)} rows={12} style={{...st.input,resize:"vertical",marginBottom:14,fontFamily:"monospace"}} />
          <div style={{display:"flex",gap:8}}>
            <button onClick={handleSaveLevel} style={{...st.btn(),flex:1,padding:"10px"}}>Save Words</button>
            <button onClick={()=>{ setLevelOverrides(p=>{const n={...p};delete n[String(editingLevel)];return n;}); updateLevelWords(editingLevel,LEVELS.find(l=>l.id===editingLevel)?.words||[],adminDb); flash("Reset to default"); setEditingLevel(null); }} style={st.btn(T.warn,T.warn+"22")}>Reset Default</button>
            <button onClick={()=>{setEditingLevel(null);setEditWords("");}} style={{...st.btn(T.muted,T.faint),padding:"10px 14px"}}>Cancel</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div style={{position:"fixed",inset:0,background:"#00000088",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999,padding:20}} onClick={e=>{if(e.target===e.currentTarget)onClose();}}>
      <div style={{background:"#0f0f1a",border:"1px solid #1e1e30",borderRadius:14,padding:24,width:"100%",maxWidth:420,maxHeight:"90vh",overflowY:"auto"}}>
        {children}
      </div>
    </div>
  );
}

function UserRow({ u, bannedUids, adminUids, currentUid, onBan, onUnban, onSkip, onNote, onWarn, onSessions }) {
  const isBanned = bannedUids.has(u.uid);
  const isAdm = adminUids.has(u.uid);
  return (
    <div style={{background:"#0f0f1a",border:"1px solid #1e1e30",borderRadius:10,padding:"11px 15px",marginBottom:8}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{color:"#e0e0ff",fontWeight:700,fontSize:12}}>
            {u.username&&<span style={{color:"#a78bfa"}}>@{u.username} · </span>}
            {u.email||"No email"}
            {isAdm&&<span style={{marginLeft:6,background:"#a78bfa33",color:"#a78bfa",fontSize:9,padding:"1px 6px",borderRadius:8}}>ADMIN</span>}
            {isBanned&&<span style={{marginLeft:5,background:"#ef444422",color:"#ef4444",fontSize:9,padding:"1px 6px",borderRadius:8}}>BANNED</span>}
          </div>
          <div style={{color:"#6b7280",fontSize:9,marginTop:2,wordBreak:"break-all"}}>{u.uid}</div>
          <div style={{color:"#2e2e44",fontSize:9,marginTop:1}}>{u.profiles?.length||0} profiles: {u.profiles?.map(p=>p.name).join(", ")}</div>
        </div>
        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
          {isBanned
            ?<button onClick={()=>onUnban(u.uid,u.username)} style={{padding:"4px 9px",borderRadius:6,border:"none",background:"#34d39922",color:"#34d399",fontSize:10,fontWeight:700,cursor:"pointer"}}>Unban</button>
            :<button onClick={()=>onBan(u)} style={{padding:"4px 9px",borderRadius:6,border:"none",background:"#ef444422",color:"#ef4444",fontSize:10,fontWeight:700,cursor:"pointer"}}>Ban</button>
          }
          <button onClick={()=>onWarn(u)} style={{padding:"4px 9px",borderRadius:6,border:"none",background:"#f59e0b22",color:"#f59e0b",fontSize:10,fontWeight:700,cursor:"pointer"}}>Warn</button>
          <button onClick={()=>onSkip(u)} style={{padding:"4px 9px",borderRadius:6,border:"none",background:"#a78bfa22",color:"#a78bfa",fontSize:10,fontWeight:700,cursor:"pointer"}}>Skip</button>
          <button onClick={()=>onSessions(u)} style={{padding:"4px 9px",borderRadius:6,border:"none",background:"#1e1e30",color:"#6b7280",fontSize:10,fontWeight:700,cursor:"pointer"}}>History</button>
          <button onClick={()=>onNote(u)} style={{padding:"4px 9px",borderRadius:6,border:"none",background:"#1e1e30",color:"#6b7280",fontSize:10,fontWeight:700,cursor:"pointer"}}>Note</button>
        </div>
      </div>
    </div>
  );
}
