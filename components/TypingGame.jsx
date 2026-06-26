"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import TypingTest from "./TypingTest";
import GamesTab from "./GamesTab";
import { TugOfWar } from "./GamesNew3";
import { KKey } from "./icons/KKey";
import { FOUNDATIONS_ICONS, PRECISION_FLOW_ICONS, WORD_POWER_ICONS, KEYBOARD_MASTERY_ICONS, SPEED_SURGE_ICONS, FREE_RUN_ICONS, CENTURY_CLUB_ICONS, ENDURANCE_ICONS, LITERATURE_ICONS, MACHINE_MODE_ICONS, LEGEND_TIER_ICONS, IconStar } from "./icons/LevelIcons";
import { formatKeys } from "@/lib/format";
import { CertificateModal } from "./Certificates";
import { onAuthStateChanged, signOut, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, GithubAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { auth, isAdmin, getAccount, createAccount, getProfiles, getProfile, createProfile, updateProfile, deleteProfile, saveSession, saveSessionLocal, addBonusKeysLocal, updateProfileLocal, getProfileLocal, getRecentSessionsLocal, addBonusKeys, getRecentSessions, calcAge, isBirthdayToday, isProfileRestricted, checkAndUpdateBirthday, createPhotoUploadToken, listenForPhotoUpload, deletePhotoUploadToken, getBan, claimUsername, changeUsername, getUsername, checkUsernameAvailable, getMaintenanceMode, logActivity, getWarning, clearWarning, getBroadcast, getLevelOverrides, updateStreak, getFriends, getIncomingRequests, getUserByUsername, getUserByUid, sendFriendRequest, acceptFriendRequest, declineFriendRequest, getDailyChallenge, submitDailyScore, requestScoreRestore, getETDateStr, getDailyLeaderboard, purchaseTheme, setActiveTheme, purchaseFont, setActiveFont, purchaseSound, setActiveSound, getSessionDates, submitFeedback, submitBirthdayRequest, getBirthdayRequestStatus, approveBirthdayRequest, rejectBirthdayRequest, getAdminBirthdayRequests, sendChallengeEx, declineChallenge, submitChallengeResult, getPendingChallenges, getWeeklySessions, getPendingNotifications, markNotificationRead, replyToFeedback, startGameChallenge } from "@/lib/firebase";

export 
// ─── Custom Date Picker ───────────────────────────────────────────────────────
function DatePicker({ value, onChange, T }) {
  const today = new Date();
  const maxDate = today.toISOString().slice(0,10); // no future dates
  const minDate = `${today.getFullYear()-120}-01-01`;
  const parsed = value ? new Date(value + "T12:00:00") : null;
  const FULL_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const displayStr = parsed
    ? `🎂 ${FULL_MONTHS[parsed.getMonth()]} ${parsed.getDate()}, ${parsed.getFullYear()}`
    : "🎂 Select birthday";

  return (
    <div style={{marginBottom:18}}>
      <div style={{position:"relative",display:"flex",alignItems:"center",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 14px",overflow:"hidden"}}>
        <span style={{flex:1,color:parsed?T.text:T.faint,fontFamily:T.font,fontSize:14,pointerEvents:"none",userSelect:"none"}}>{displayStr}</span>
        <input
          type="date"
          value={value||""}
          min={minDate}
          max={maxDate}
          onChange={e=>{
            const v = e.target.value;
            if(!v){ onChange(""); return; }
            const d = new Date(v+"T12:00:00");
            if(d > today || d.getFullYear() < today.getFullYear()-120) return;
            onChange(v);
          }}
          style={{position:"absolute",top:0,left:0,width:"100%",height:"100%",opacity:0.011,cursor:"pointer",zIndex:2,fontSize:16}}
        />
      </div>
      {parsed && (
        <button onClick={()=>onChange("")} style={{marginTop:4,background:"none",border:"none",color:T.faint,fontSize:11,cursor:"pointer",fontFamily:T.font,padding:0}}>
          Clear birthday
        </button>
      )}
    </div>
  );
}

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
  { id:13, name:"Lightning Fingers",     emoji:"⚡", wpmTarget:70,  accuracy:75, color:"#facc15", words:["sprint","rhythm","motion","fluent","reflex","impact","driven","signal","strong","finish","active","launch","charge","quartz","oxygen","breeze","bronze","frozen","figure","golden"] },
  { id:14, name:"Speed Demon",           emoji:"👹", wpmTarget:80,  accuracy:75, color:"#f43f5e", words:["system","planet","source","sample","matrix","factor","garden","bridge","master","mirror","silver","purple","gentle","fabric","radius","canyon","sector","vessel","tunnel","symbol"] },
  { id:15, name:"Legend",                emoji:"🏆", wpmTarget:90,  accuracy:75, color:"#fbbf24", words:["achieve","balance","captain","dynamic","explore","forward","gradient","harmony","inspire","journey","kingdom","liberty","mission","natural","outcome","perfect","quantum","respond","success","triumph"] },


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
  { id:30, name:"Classic Lines",         emoji:"📚", wpmTarget:52,  accuracy:75, color:"#c084fc", words:["tobeornottobethatisthequestion","callmoishmael","itwasthebestoftimes","itisatruthuniversallyacknowledged","inthebeginningwastheword","onceupona timeinafarawayland","theonlywaytodogreatworkistoloveit","whoknowsthemindofgodbutilonglongtoshare","aneyeforaneyemakesthewholeworldblind","thejourneyofathousandmiles","weholdthesetruthstobeselfevident","fourscoreandsevenyearsago","asknotwhatyourcountrycan","tobeornottobe","adatewhichwillliveininfamy","watsonthegameisafoot","franklyitsofnoconcernofmine","themoreyouknowthestrangerlifebecomes"] },

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
  { id:87,  name:"Quote Dash",         emoji:"💬", wpmTarget:0, accuracy:75, color:"#a78bfa", words:["lifeiswhatyoumakeofit","youmissalltheshotsyoudontshoot","dreambigworkhard","actionsspeaklouderthanwords","doormattoorchestra","makeithappen","believeinyourself","nevergiveuP","hardworkpaysoff","successisajourney"] },
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
  { id:131, name:"Famous Lines",     emoji:"📖", wpmTarget:0, accuracy:75, color:"#a855f7", words:["thequickbrownfoxjumpsoverthelazydog","itwasabrightcoldday","callmeishmael","tobeornottobe","inalandfarfar","weholdthesetruth","fourscoreandseven","onesmallstep","donotgogentle","stagethefinal"] },
  { id:132, name:"Philosophy",         emoji:"🧠", wpmTarget:0, accuracy:75, color:"#38bdf8", words:["thecaveisourmindsplato","godisdeadnietzsche","hellisotherpeoplesartre","existenceprecedesessence","iamcondemnedtobefree","theunexaminedlifeisnotworthliving","iknowthatiknownothing","beautyisintheeyeofthebeholder"] },
  { id:133, name:"Scripture",          emoji:"📿", wpmTarget:0, accuracy:75, color:"#fbbf24", words:["inthebeginningGodcreatedtheheavensandtheearth","forGodsolovedtheworld","iamthewayandthetruth","theLordismyshepherd","forthewagesofsinisdeath","inthebeginningwastheword","blessedare themeek","lovethelordyourgod"] },
  { id:134, name:"Shakespeare",        emoji:"🎭", wpmTarget:0, accuracy:75, color:"#ec4899", words:["tobeornottobethatisthequestion","alltheworldsastagehakespeare","thequalityofmercyisnotstrained","ifmusicbethefoodofloveplayo","whatsinananamerosebyanyothername"] },
  { id:135, name:"US History",         emoji:"🦅", wpmTarget:0, accuracy:75, color:"#3b82f6", words:["fourscoreandsevenyearsagoourforefathers","weholdthesetruthstobeselfevidentthatall","asknotwhatyourcountrycandoforyou","adatewhichwillliveininfamy","weshallovercomeweshallovercome"] },
  { id:136, name:"Hand Stretches",        emoji:"🤲", wpmTarget:0, accuracy:75, color:"#ef4444", words:["fjfjfjfjfj","dkdkdkdkdk","slslslslsl","aasdffdsa","jjklllkkj","asdfghjkl","qwertyuio","zxcvbnmzx","poiuytrewq","lkjhgfdsaz","mnbvcxzmnb","qazwsxedcr","rfvtgbyhnuj","fjdkfjdkfjdk","slafslafsla"] },
  { id:137, name:"Code Marathon",      emoji:"🖥️", wpmTarget:0, accuracy:75, color:"#4ade80", words:["functionreturnsundefined","asyncawaitpromise","trycatchfinallydone","useStateuseffect","reactcomponentprops","classextendscomponent","importexportdefault","constletvarscope","arraymapreducefilter","objectkeysvaluesentries"] },
  { id:138, name:"Emoji Names",        emoji:"😎", wpmTarget:0, accuracy:75, color:"#f472b6", words:["rollinglaughingcrying","facewithtearsofJoy","starstruck","thinkingface","explodinghead","hearteyesface","sunglassesface","grimacingface","fearfulface","confoundedface","wearyfacetired","flushedface","astonishedface","anguishedface","perseveringface"] },
  { id:139, name:"Hard Clusters",      emoji:"💎", wpmTarget:0, accuracy:75, color:"#818cf8", words:["strength","lengths","twelfths","scratched","stretched","scrunched","squelched","twitched","crunched","clenched","blanched","branched","breached","clenches","squelches","stretches","twitches","wrenches","trenches","benches"] },
  { id:140, name:"Suffix Surge",       emoji:"🏄", wpmTarget:0, accuracy:75, color:"#06b6d4", words:["thankfulness","gratefulness","mindfulness","hopefulness","usefulness","harmfulness","helpfulness","spitefulness","carelessness","hopelessness","uselessness","harmlessness","motionless","powerless","speechless","breathless","fearless","thoughtless","worthless","restless"] },
  { id:141, name:"Long Words",       emoji:"📏", wpmTarget:0, accuracy:75, color:"#fbbf24", words:["antidisestablishmentarianismisaverylongword","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobiaisreal","floccinaucinihilipilificationmeansworthless"] },
  { id:142, name:"Big Words",       emoji:"📚", wpmTarget:0, accuracy:75, color:"#a855f7", words:["extraordinarilyphilosophical","incomprehensiblydisproportionate","uncharacteristicallycounterintuitive","psychoneuroimmunologicaltesting","electroencephalographicallyderived","spectrophotometricallymeasured"] },
  { id:143, name:"Classic Quotes",           emoji:"💬", wpmTarget:0, accuracy:75, color:"#f43f5e", words:["itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheageoffoolishness","tobeornottobethatisthequestionwhethertisnoblerinthemind","weholdthesetruthstobeselfevidentthatallmen"] },
  { id:144, name:"Typing Facts",      emoji:"📊", wpmTarget:0, accuracy:75, color:"#c084fc", words:["thefastesthumantypistinhistorycouldtype216wordsperminuteconsistently","moderncomputerkeyboardsaredesignedforspeedaccuracyandcomfort","thetypewriterrevolutionizedbusinesscommunicationinthenineteenthcentury"] },
  { id:145, name:"Tricky Spelling",        emoji:"📝", wpmTarget:0, accuracy:75, color:"#38bdf8", words:["antidisestablishmentarianismisthepoliticalpositionthatopposesdisestablishment","floccinaucinihilipilificationisthenounform","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis"] },
  { id:146, name:"Sprint I",        emoji:"⚡", wpmTarget:0, accuracy:75, color:"#facc15", words:["thethe","andandand","forforfor","youyouyou","runrunrun","hothotho","bigbigbig","newnewnew","oldoldold","seesee","puttputt","saysay","trytry","gotgot","askask"] },
  { id:147, name:"Sprint II",       emoji:"⚡", wpmTarget:0, accuracy:75, color:"#ef4444", words:["waterwater","everyevery","firstfirst","placeplace","yearsyears","youngyoung","greatgreat","threethree","nevernever","worldworld","aboutabout","rightright","couldcould","stillstill","smallsmall"] },
  { id:148, name:"Sprint III",      emoji:"⚡", wpmTarget:0, accuracy:75, color:"#f97316", words:["practiceaccuracy","improvespeed","buildhabits","focusflow","typefast","neverleave","homerowalways","rhythmkeys","combostreak","fingermuscle","wristrelax","shouldersdown","eyesscreen","breathetype","flowwater"] },
  { id:149, name:"Sprint IV",       emoji:"⚡", wpmTarget:0, accuracy:75, color:"#a855f7", words:["development","environment","technology","information","understanding","experience","important","following","sometimes","something","everything","different","communication","international","organization"] },
  { id:150, name:"Sprint V",        emoji:"⚡", wpmTarget:0, accuracy:75, color:"#ec4899", words:["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia","pseudopseudohypoparathyroidism","incomprehensibilities","dichlorodiphenyltrichloroethane","electroencephalographically","psychoneuroimmunological"] },
  { id:151, name:"Daily Practice",          emoji:"📅", wpmTarget:0, accuracy:75, color:"#94a3b8", words:["consistencybeatsintensity","showupeverysingleday","progressoverperfection","embracethegrindeveryday","onehouradaychangesyourlife","nevermisstwodays","buildthesystem","trusttheprocess","compoundeffect","marginalgains"] },
  { id:152, name:"Finger Drills",       emoji:"🤲", wpmTarget:0, accuracy:75, color:"#6366f1", words:["fjdkfjdkfjdk","slafslafsla","ksdjfksdjf","alskdjalskd","fjaslfjaslfj","dkfsdkfsdkfs","jflajflajfla","sdkfjsdkfjsdk","lfjalfjalfjal","akfjdakfjdak","sfjdlsfjdl","kadfjkadfjka","dlsfadlsfa","fjasldfjasld","kasjdkasjdkas"] },
  { id:153, name:"Mixed Phrases",       emoji:"📝", wpmTarget:0, accuracy:75, color:"#ef4444", words:["itwasthebestoftimesitwastheworst","tobeornottobe","callmeishmael","inthebeginning","fourscoreandseven","weholdthesetruth","asknotwhat","onesmallstep","donotgogentle","stagethefinal"] },
  { id:154, name:"Word Mashups",      emoji:"🔀", wpmTarget:0, accuracy:75, color:"#f59e0b", words:["extraordinarilyincredible","incomprehensiblybrilliant","uncharacteristicallyperfect","counterproductivelyefficient","simultaneouslymultitasking","acknowledgementreceived","straightforwardlycomplicated","unpredictablyroutine"] },
  { id:155, name:"Letter Repeats",  emoji:"🔁", wpmTarget:0, accuracy:75, color:"#fbbf24", words:["enenenenene","tototototo","lalalalalala","mememememe","nananananana","sisisisisi","tetetete","vovovovo","wiwiwiwi","pepepepep","kekekekek","rararararar","bububububu","cocococococ","dededededede"] },
  { id:156, name:"Tongue Twisters",    emoji:"👅", wpmTarget:0, accuracy:75, color:"#fbbf24", words:["shesellsseashellsbytheseashore","peterpiperpickedapeckofpickledpeppers","howmuchwoodwouldawoodchuckchuck","redleatherryellowleather","unique New York"] },
  { id:157, name:"Word Pairs",          emoji:"🔗", wpmTarget:0, accuracy:75, color:"#f43f5e", words:["saltandpepper","thunderandlightning","blackandwhite","sweetandsour","ups anddowns","trialanderror","painandgain","cause andeffect","leadandfollow","oddsandends"] },
  { id:158, name:"Quote Practice",      emoji:"💬", wpmTarget:0, accuracy:75, color:"#a855f7", words:["itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomandfoolishness","tobeornottobethatisthequestionwhetheritisnobler","fourscoreandsevenyearsagoourforefathersbroughtforthupon"] },
  { id:159, name:"Build Speed",          emoji:"📈", wpmTarget:0, accuracy:75, color:"#06b6d4", words:["thefastesthumantypistinhistorycouldtype216wordsperminuteconsistently","moderncomputerkeyboardsaredesignedforspeedaccuracyandcomfort","thetypewriterrevolutionizedbusinesscommunicationinthenineteenthcentury"] },
  { id:160, name:"Final Stretch",           emoji:"🧘", wpmTarget:0, accuracy:75, color:"#10b981", words:["practiceisthemotherof allskillsthemorey outypethemoreyouimprove","youdontneedtobeperfectyouneedtobepersistentandconsistent","thekeyboardisaninstrumentandlikeallinstrumentsitmustbepracticed"] },
  { id:161, name:"Legend I",          emoji:"👑", wpmTarget:0, accuracy:75, color:"#ef4444", words:["antidisestablishmentarianismisthepoliticalpositionthatopposesdisestablishmentofthechurchofengland","floccinaucinihilipilificationisthenounformmeaning toregardorsomethingas worthless"] },
  { id:162, name:"Legend II",         emoji:"👑", wpmTarget:0, accuracy:75, color:"#8b5cf6", words:["supercalifragilisticexpialidociousevenatthesoundofit somethingquiteatrociouswillalwaysoundprecocious","pneumonoultramicroscopicsilicovolcanoconiosisisthenamegiventoa lungdisease"] },
  { id:163, name:"Legend III",        emoji:"👑", wpmTarget:0, accuracy:75, color:"#f59e0b", words:["itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheageoffoolishnessitwastheepochofbelief","tobeornottobethatisthequestionwhethertisnoblerinthemindtosuffertheoutrangeousfortunes"] },
  { id:164, name:"Legend IV",          emoji:"👑", wpmTarget:0, accuracy:75, color:"#c084fc", words:["fourscoreandsevenyearsagoourforefathersbroughtforthuponthiscontinentanewnationconceivedinliberty","weholdthesetruthstobeselfevidentthatallmenarecreatedequalthattheyareendowedbytheirCreatorwithcertainunalienableRights"] },
  { id:165, name:"Legend V",    emoji:"👑", wpmTarget:0, accuracy:75, color:"#dc2626", words:["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheageoffoolishnessitwastheepochofbelief","tobeornottobethatisthequestionwhetheritisnobler inthemindtosuffertheoutrangeousfortunes"] },
  { id:166, name:"Legend VI",           emoji:"💀", wpmTarget:0, accuracy:75, color:"#fbbf24", words:["thequickbrownfoxjumpsoverthelazydog","packMyboxwithfiveDozenliquorjugs","howvexinglyquickdaftzebrasjump","sphinxofblackquartzjudgemyvow","fivequackingzephyrsjoltedmywaxbed","blowzygumsjudgemyphiloxyvat","cwmfjordBankglyphsvexquiz"] },
  { id:167, name:"Legend VII",          emoji:"💀", wpmTarget:0, accuracy:75, color:"#f43f5e", words:["antidisestablishmentarianismfloccinaucinihilipilification","supercalifragilisticexpialidociouspneumonoultramicroscopic","hippopotomonstrosesquippedaliophobiapseudopseudohypo","incomprehensibilitieshonorificabilitudinitatibus"] },
  { id:168, name:"Legend VIII",         emoji:"💀", wpmTarget:0, accuracy:75, color:"#a855f7", words:["itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomandfoolishness","tobeornottobethatisthequestionwhetheritisnobler","fourscoreandsevenyearsagoourforefathersbroughtforthupon"] },
  { id:169, name:"Legend IX",           emoji:"💀", wpmTarget:0, accuracy:75, color:"#06b6d4", words:["thefastesthumantypistinhistorycouldtype216wordsperminuteconsistently","moderncomputerkeyboardsaredesignedforspeedaccuracyandcomfort","thetypewriterrevolutionizedbusinesscommunicationinthenineteenthcentury"] },
  { id:170, name:"True Final Boss",     emoji:"☠️", wpmTarget:0, accuracy:75, color:"#10b981", words:["practiceisthemotherof allskillsthemorey outypethemoreyouimprove","youdontneedtobeperfectyouneedtobepersistentandconsistent","thekeyboardisaninstrumentandlikeallinstrumentsitmustbepracticed"] },
];


const LEVEL_TIPS = {
  beginner: ["Place fingers on home row: A S D F (left) J K L ; (right)","Feel the F and J bumps — index fingers go there","Don't look at your hands. Eyes on screen!","Accuracy first, speed comes later."],
  1: ["Home row only: A S D F J K L ;","Feel the F and J bumps","Don't look down!"],
  2: ["Reach up from home row with correct fingers","Keep wrists off the desk"],
  3: ["Full keyboard — trust your muscle memory","Don't rush, accuracy first"],
  4: ["Smooth rhythm, not burst typing","Combo streaks reward consistent speed"],
  5: ["Building real speed now","Relax your shoulders and arms"],
  6: ["Rhythm over raw speed","Keep a steady beat as you type"],
  default: ["Stay focused. Accuracy unlocks the next level.","No corrections — commit to each keystroke."],
};

const LAYOUTS = {
  qwerty:   { label:"QWERTY",   rows:[["q","w","e","r","t","y","u","i","o","p"],["a","s","d","f","g","h","j","k","l",";"],[  "z","x","c","v","b","n","m",",",".","/"]],  homeRow:["a","s","d","f","j","k","l",";"],  bumps:["f","j"] },
  qwertz:   { label:"QWERTZ",   rows:[["q","w","e","r","t","z","u","i","o","p"],["a","s","d","f","g","h","j","k","l","ö"],["y","x","c","v","b","n","m",",",".","-"]],  homeRow:["a","s","d","f","j","k","l","ö"], bumps:["f","j"] },
  azerty:   { label:"AZERTY",   rows:[["a","z","e","r","t","y","u","i","o","p"],["q","s","d","f","g","h","j","k","l","m"],["w","x","c","v","b","n",",",";",":","!"]],  homeRow:["q","s","d","f","j","k","l","m"], bumps:["f","j"] },
  colemak:  { label:"Colemak",  rows:[["q","w","f","p","g","j","l","u","y",";"],["a","r","s","t","d","h","n","e","i","o"],["z","x","c","v","b","k","m",",",".","/"]],  homeRow:["a","r","s","t","n","e","i","o"], bumps:["t","n"] },
  dvorak:   { label:"Dvorak",   rows:[["'",",",".","p","y","f","g","c","r","l"],["a","o","e","u","i","d","h","t","n","s"],[";","q","j","k","x","b","m","w","v","z"]],  homeRow:["a","o","e","u","d","h","t","n"], bumps:["u","h"] },
  workman:  { label:"Workman",  rows:[["q","d","r","w","b","j","f","u","p",";"],["a","s","h","t","g","y","n","e","o","i"],["z","x","m","c","v","k","l",",",".","/"]],  homeRow:["a","s","h","t","n","e","o","i"], bumps:["t","n"] },
  norman:   { label:"Norman",   rows:[["q","w","d","f","k","j","u","r","l",";"],["a","s","e","t","g","y","n","i","o","h"],["z","x","c","v","b","p","m",",",".","/"]],  homeRow:["a","s","e","t","n","i","o","h"], bumps:["t","n"] },
  halmak:   { label:"Halmak",   rows:[["w","l","r","b","z",";","q","u","d","j"],["s","h","n","t",",",".","a","e","o","i"],["f","m","v","c","/","g","p","x","k","y"]],  homeRow:["s","h","n","t","a","e","o","i"], bumps:["t","a"] },
  neo2:     { label:"Neo 2",    rows:[["x","v","l","c","w","k","h","g","f","q"],["u","i","a","e","o","s","n","r","t","d"],["ü","ö","ä",",",".","-","b","p","m","j"]],  homeRow:["u","i","a","e","s","n","r","t"], bumps:["e","n"] },
  dvorak_l: { label:"Dvorak L", rows:[["/","[","{","}","(","=","*",")","+","]"],["a","o","e","u","i","d","h","t","n","s"],[";","q","j","k","x","b","m","w","v","z"]],  homeRow:["a","o","e","u","d","h","t","n"], bumps:["u","h"] },
};

const LAYOUT_FLAGS={qwerty:"🇺🇸",qwertz:"🇩🇪",azerty:"🇫🇷",colemak:"🇬🇧",dvorak:"⌨️",workman:"💪",norman:"🔡",halmak:"🔬",neo2:"🇩🇪²",dvorak_l:"🤚"};

const FC={pinky:"#a78bfa",ring:"#60a5fa",middle:"#34d399",index:"#fbbf24",rindex:"#fb923c",thumb:"#94a3b8"};
const _FR=["pinky","ring","middle","index","index","rindex","rindex","middle","ring","pinky"];
const FINGER_MAP=[_FR,_FR,_FR];
function buildKeyFinger(rows){const m={};rows.forEach((r,ri)=>r.forEach((k,ci)=>{if(ci<10)m[k]=FINGER_MAP[ri][ci];}));m[" "]="thumb";return m;}

const AVATARS=[{id:"key",e:"⌨️"},{id:"rocket",e:"🚀"},{id:"fire",e:"🔥"},{id:"lightning",e:"⚡"},{id:"brain",e:"🧠"},{id:"trophy",e:"🏆"},{id:"cat",e:"🐱"},{id:"robot",e:"🤖"},{id:"star",e:"⭐"},{id:"gem",e:"💎"},{id:"target",e:"🎯"},{id:"ghost",e:"👻"},{id:"dragon",e:"🐉"},{id:"unicorn",e:"🦄"},{id:"dino",e:"🦕"},{id:"penguin",e:"🐧"}];
const AV = Object.fromEntries(AVATARS.map(a => [a.id, a.e]));

// KKey icon and formatKeys imported from shared modules (see top imports)

const isTeen=p=>((p?.age??0)||0)>=13,isKid=p=>{const a=p?.age;return a!=null&&a>0&&a<13;};
const KID_FEATURES=["keys","friends","shop","daily","test","skip","sounds"];
const canUse=(p,feat)=>{if(!p)return false;if(p.isProfileAdmin)return true;return p.features?.[feat]!==false;};

const QRCanvas=({url,size=160})=>{const r=useRef(null);useEffect(()=>{if(url&&r.current)import("qrcode").then(Q=>Q.toCanvas(r.current,url,{width:size,margin:1,color:{dark:"#000",light:"#fff"}})).catch(()=>{});},[url,size]);return <canvas ref={r} style={{borderRadius:8,display:"block"}}/>;};

function getTheme(age){const base={accent:"#fb923c",accent2:"#34d399",bg:"#0a0a0f",card:"#13131f",border:"#1e1e30",font:"'JetBrains Mono',monospace",bigEmoji:false,simpleWords:false,maxLevel:15};if(age<7)return{...base,bg:"#0d0b1a",card:"#1a1030",border:"#2d1f50",purple:"#c084fc",text:"#f0e8ff",muted:"#a78bfa",faint:"#7c5cbf",font:"'Comic Sans MS','Chalkboard SE',cursive",bigEmoji:true,simpleWords:true,maxLevel:5};if(age<10)return{...base,bg:"#0a0a18",card:"#141428",border:"#2a2050",purple:"#a78bfa",accent:"#f472b6",text:"#e8e0ff",muted:"#8b78d0",faint:"#5a4898",bigEmoji:true,simpleWords:true,maxLevel:10};if(age<13)return{...base,purple:"#818cf8",text:"#e2e8ff",muted:"#6b72a0",faint:"#454870"};return{...base,purple:"#7c6af7",text:"#e0e0ff",muted:"#555",faint:"#444"};}

function genLine(levelId,overrideWords){const lv=LEVELS.find(l=>l.id===levelId)||LEVELS[0];const pool=overrideWords||lv.words;if(pool[0]&&pool[0].length>20)return pool[Math.floor(Math.random()*pool.length)];let r="",n=0;while(n<25){const w=pool[Math.floor(Math.random()*pool.length)];r+=w;n+=w.length;}return r;}

// Skip challenge — unique word set per target level
const SKIP_CHALLENGES = {
  1:  ["asdf","jkl","fj","dk","sl","aa","ff","jj","kk","ll","ss","dd","asd","jkl","fdk","slj","dks","laf","jsd","kfl"],
  2:  ["quit","trip","prop","your","tower","query","wrote","power","petty","outer","worry","trout","quote","wiped","tutor","repot","tower","upper","outdo","prior"],
  3:  ["the","big","and","for","hot","map","key","ask","say","put","old","new","see","try","run","own","two","way","how","get"],
  4:  ["water","every","first","place","years","young","great","three","never","world","about","right","could","still","small","found","study","often","those","light"],
  5:  ["people","before","should","between","through","because","without","another","against","thought","looking","children","problem","school","always","around","family","having"],
  6:  ["practice","keyboard","fingers","accuracy","improve","achieve","journey","forward","perfect","balance","channel","chapter","combine","concern","connect","control"],
  7:  ["development","environment","technology","information","understand","experience","important","following","sometimes","something","everything","different"],
  8:  ["communication","international","organization","understanding","professional","relationship","immediately","particularly","responsibility","approximately"],
  9:  ["implementation","administration","circumstances","representative","accomplishment","infrastructure","simultaneously","recommendations","acknowledgment"],
  10: ["thequickbrownfox","shesellsseashells","howmuchwoodcould","packmyboxwithfive","thefiveboxingwizards","jackdawslovemybig","fixingquartz","jumpingquickly"],
  11: ["extraordinary","indistinguishable","miscommunication","uncharacteristically","counterproductive","straightforwardness","unpredictability","incomprehensible"],
  12: ["practiceisthekeytomastery","focusonaccuracybeforespeed","typingisaskillbuiltovertime","keepyoureyesonthescreen","smoothrhythmbeatsbursttyping"],
  13: ["weholdthesetruthstobeselfevident","inthemiddleofeverydifficultyliesopportunity","successisnotfinalfailureisnotfatal"],
  14: ["tobeornottobethatisthequestion","allthatglittersisnotgold","thereisnothingeithergoodorbadbutthinkingmakesitso"],
  15: ["itwasthebestoftimesitwastheworstoftimes","asknotwhatyourcountrycandoforyou","fourscoreandsevenyearsago"],
  16: ["cardiovascular","hypertension","electromagnetic","spectroscopy","thermodynamics","photosynthesis","chromosome","biochemistry","neuroscience"],
  17: ["function","return","const","async","await","promise","callback","closure","prototype","recursion","iteration","algorithm","variable","boolean","undefined"],
  18: ["peterpiperpckedapeckofpickledpeppers","shesellsseashellsbytheseashore","howmuchwoodwouldawoodchuckchuck","sixslipperysnailsslidslowly"],
  19: ["bethechangeyouwishtoSeeintheworld","theonlywaytodomadworkistolovewhatyoudo","imaginationismoreimportantthanknoWledge"],
  20: ["seventeen","fourteen","nineteen","thirteen","thousand","million","billion","hundred","quarter","twelfth","fortieth","sixtieth","seventieth","eightieth"],
  21: ["elephant","rhinoceros","hippopotamus","chimpanzee","orangutan","crocodile","alligator","salamander","chameleon","porcupine","wolverine","armadillo"],
  22: ["Afghanistan","Bangladesh","Kazakhstan","Madagascar","Mozambique","Philippines","Switzerland","Netherlands","Azerbaijan","Kyrgyzstan","Guatemala","Venezuela"],
  23: ["mitochondria","deoxyribonucleic","electromagnetic","spectroscopy","chromatography","electrochemistry","crystallography","nanotechnology","epidemiology"],
  24: ["symphony","crescendo","diminuendo","fortissimo","pianissimo","allegretto","accelerando","ritardando","syncopation","counterpoint","polyphony","arpeggiate"],
  25: ["spaghetti","carbonara","guacamole","quesadilla","enchilada","bruschetta","bolognese","fettuccine","prosciutto","mozzarella","mascarpone","tiramisu"],
  26: ["groundbreaking","overwhelming","uncomfortable","internationally","misrepresentation","straightforward","underestimated","overcomplicating","misunderstanding"],
  27: ["unconstitutional","disenfranchised","counterintuitive","underdeveloped","interconnected","multidimensional","extraordinarily","unenthusiastically","hypersensitivity"],
  28: ["thefastesttypistsneverlookdown","buildingspeedtakesdailycommitment","everykeystrokebringsyoucloser","thegoalisnotperfectionbutprogress"],
  29: ["gitcommit","gitpush","dockerbuild","npminstall","asyncfunction","trycatchfinally","usestatehook","useeffecthook","arrayreduce","objectentries"],
  30: ["callmoishmael","itwasthebestoftimes","itisatruthuniversallyacknowledged","inthebeginningwastheword","tobeornottobe"],
  31: ["appendicitis","cholecystitis","pancreatitis","gastroenteritis","cardiovascular","hypertension","arrhythmia","tachycardia","angioplasty","electrocardiogram"],
  32: ["quarterback","linebacker","cornerback","defenseman","goalkeeper","midfielder","tournament","championship","qualification","substitution","threepointline"],
  33: ["thunderstorm","precipitation","evaporation","condensation","atmospheric","stratosphere","troposphere","biodiversity","photosynthesis","decomposition","deforestation"],
  34: ["synergy","leverage","paradigm","scalable","disruption","stakeholder","deliverable","milestone","roadmap","iteration","agile","scrum","kanban","retrospective"],
  35: ["Prometheus","Persephone","Hephaestus","Dionysus","Aphrodite","Poseidon","Artemis","Hermes","Odysseus","Achilles","Agamemnon","Patroclus","Penelope"],
  36: ["peterpiperpckedapeckofpickledpeppers","bettyboterboterbutterbutterisbitter","rubberbabybuggybumpers","uniquenewyork","toyboatoyboat","thirtythreethiefs"],
  37: ["extraordinary","indistinguishable","miscommunication","phenomenologically","philosophically","catastrophically","uncharacteristically","counterproductive"],
  38: ["believeinyourself","nevergiveuP","hardworkpaysoff","dreambigworkhardstayhumble","successisajourney","pushingyourlimits","disciplinebeatstalent"],
  39: ["Canberra","Brasilia","Reykjavik","Kathmandu","Montevideo","Tashkent","Ulaanbaatar","Ouagadougou","Antananarivo","Yamoussoukro","Naypyidaw","Dushanbe"],
  40: ["cryptocurrency","blockchain","machinelearning","artificialintelligence","deeplearning","neuralnetwork","virtualization","containerization","microservices","kubernetes"],
  41: ["their","there","they're","your","you're","its","it's","whose","who's","affect","effect","accept","except","principal","principle","stationary","stationery","complement","compliment"],
  42: ["sunflower","moonlight","thunderstorm","butterfly","grasshopper","dragonfly","butterscotch","honeybee","toadstool","nightfall","daybreak","heartbeat","brainwave"],
  43: ["absolutely","accidentally","approximately","carefully","completely","constantly","correctly","deliberately","efficiently","eventually","fortunately","immediately","incredibly"],
  44: ["predetermined","preposterous","prerequisite","premonition","prehistoric","predominant","preliminary","supernatural","superimposed","superconductor","superstitious"],
  45: ["pneumonia","mnemonic","acquiesce","cacophony","egregious","ephemeral","perfidious","sycophant","ubiquitous","verisimilitude","perspicacious","loquacious","magnanimous"],
  46: ["napoleon","cleopatra","charlemagne","genghiskhan","alexanderthegreat","juliuscaesar","leonardodavinci","galileogalilei","isaacnewton","benjaminfranklin","abrahamlincoln"],
  47: ["accommodate","definitely","embarrass","exhilarate","fluorescent","guarantee","maintenance","maneuver","mischievous","necessary","noticeable","occurrence","parallel","perseverance"],
  48: ["thequickbrownfoxjumpsoverthelazydog","packMyboxwithfiveDozenliquorjugs","howvexinglyquickdaftzebrasjump","sphinxofblackquartzjudgemyvow"],
  49: ["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pseudopseudohypoparathyroidism","pneumonoultramicroscopicsilicovolcanoconiosis"],
  50: ["iknowthatiknownothing","hellisotherpeoplesartre","godisdeadnietzsche","cogitoegosum","theunexaminedlifeisnotworth","knowledgeispowerfrancisbacon","timewaitsfornoone"],
  51: ["thefastesttypistsneverlookdowntheyknowtheirkeyboardbyheart","buildingspeedtakesdailycommitmentandpracticeneverstops","everykeystrokebringsyouclosertobecomingalegendtypist"],
  52: ["itwasthebestoftimesitwastheworstoftimesitwastheageofwisdom","asknotwhatyourcountrycandoforyouaskwhatyoucandoforyourcountry","fourscoreandsevenyearsagoourforefathersbroughtforthuponthiscontinent"],
  53: ["weholdthesetruthstobeselfevidentthatallmenarecreatedequal","tobeornottobethatisthequestionwhethertisnoblerinthemindtosuffer","inthebeginningwasthewordandthewordwaswithgodandthewordwasgod"],
  54: ["themanwhomovesacannotsinglehandledlymovedthemountainbutbegancarryingsmallstones","onesmallstepformanonegiantleapformankind","donotgogentleintothatgoodnightrageinagethedyingofthelight"],
  55: ["pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia","dichlorodiphenyltrichloroethane","electroencephalographically","psychoneuroimmunological","spectrophotometrically","radioimmunoelectrophoresis"],
  56: ["thequickbrownfoxjumpsoverthelazydog","packMyboxwithfiveDozenliquorjugs","howvexinglyquickdaftzebrasjump","sphinxofblackquartzjudgemyvow","fivequackingzephyrsjoltedmywaxbed","blowzygumsjudgemyphiloxyvat","cwmfjordBankglyphsvexquiz"],
  57: ["extraordinarilyincomprehensibleuncharacteristically","counterproductivepseudoscientificunconstitutional","phenomenologicallyandphilosophicallyspeaking","catastrophicallyoverwhelminglydisastrous"],
  58: ["itwasadarkanstormynightwhenthedetectivearrivedatthesceneofthcrime","shecouldhavechosenanypathinlifebutthechoiceshehadmadeledherhere","thekeyboardisnotjustatoolitisthegatewaytoeveryideaeverthought"],
  59: ["loremipsumdolorsitametconsecteturadipiscingelitseddoeiusmodtemporincididuntutlaboreetdolore","thequickbrownfoxjumpsoverthelazyunicornwhilethewindblowsgentlythroughthetrees"],
  60: ["antidisestablishmentarianismisthepoliticalpositionthatopposesdisestablishment","floccinaucinihilipilificationisthehabi tofregardingsomethingas worthless","supercalifragilisticexpialidociousevenatthesoundofit somethingquiteaatrocious"],
  61: ["thefastestrecordedtypingspeedisover200wordsperminuteachievedbyspeciallytrained","practiceandpersistencearetheonlytruepathstomasteringthekeyboardcompletely"],
  62: ["onetwothreefourfivesixseveneightnineteneleventwelvethirteenfourteenfifteensixteenseventeeneighteennineteentwenty","abcdefghijklmnopqrstuvwxyzabcdefghijklmnopqrstuvwxyz"],
  63: ["thebravemendefinednotbytheirabilitytowinsidsbythecapacitytopersistwhenfacedwithobstacles","youcannotfindpeacebyavoidinglifeyoumustliveitthatistheonlywaytoachievetrueserenity"],
  64: ["itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheageoffoolishnessitwastheepochofbeliefit","asknotwhatyourcountrycandoforyouaskwhatyoucandoforyourcountryforthenationdependsontheeffortsofitscitizenry"],
  65: ["pneumonoultramicroscopicsilicovolcanoconiosisantidisestablishmentarianismfloccinaucinihilipilification","supercalifragilisticexpialidociouslyextraordinaryandabsolutelyincomprehensibleinitsentiretywithoutdoubt"],
  66: ["although","between","children","decided","develop","discover","display","element","energy","explain"],
  67: ["although","between","children","decided","develop","discover","display","element","energy","explain"],
  68: ["although","between","children","decided","develop","discover","display","element","energy","explain"],
  69: ["although","between","children","decided","develop","discover","display","element","energy","explain"],
  70: ["although","between","children","decided","develop","discover","display","element","energy","explain"],
  71: ["although","between","children","decided","develop","discover","display","element","energy","explain"],
  72: ["although","between","children","decided","develop","discover","display","element","energy","explain"],
  73: ["although","between","children","decided","develop","discover","display","element","energy","explain"],
  74: ["although","between","children","decided","develop","discover","display","element","energy","explain"],
  75: ["although","between","children","decided","develop","discover","display","element","energy","explain"],
  76: ["although","between","children","decided","develop","discover","display","element","energy","explain"],
  77: ["although","between","children","decided","develop","discover","display","element","energy","explain"],
  78: ["although","between","children","decided","develop","discover","display","element","energy","explain"],
  79: ["although","between","children","decided","develop","discover","display","element","energy","explain"],
  80: ["although","between","children","decided","develop","discover","display","element","energy","explain"],
  81: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  82: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  83: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  84: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  85: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  86: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  87: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  88: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  89: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  90: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  91: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  92: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  93: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  94: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  95: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  96: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  97: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  98: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  99: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  100: ["automobile","bibliography","catastrophe","collaboration","commissioner","comprehensive","congratulations","constitution","contradiction","conventional"],
  101: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  102: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  103: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  104: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  105: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  106: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  107: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  108: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  109: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  110: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  111: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  112: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  113: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  114: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  115: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  116: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  117: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  118: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  119: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  120: ["adenosine","algorithm","allotrope","antioxidant","asymptote","atmosphere","biosphere","capacitor","centrifuge","chromosome"],
  121: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  122: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  123: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  124: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  125: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  126: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  127: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  128: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  129: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  130: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  131: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  132: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  133: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  134: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  135: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  136: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  137: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  138: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  139: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  140: ["thequickbrownfoxjumpsoverthelazydog","extraordinarily","incomprehensible","antidisestablishmentarianism","pneumonoultramicroscopic"],
  141: ["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia"],
  142: ["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia"],
  143: ["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia"],
  144: ["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia"],
  145: ["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia"],
  146: ["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia"],
  147: ["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia"],
  148: ["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia"],
  149: ["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia"],
  150: ["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia"],
  151: ["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia"],
  152: ["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia"],
  153: ["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia"],
  154: ["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia"],
  155: ["antidisestablishmentarianism","floccinaucinihilipilification","supercalifragilisticexpialidocious","pneumonoultramicroscopicsilicovolcanoconiosis","hippopotomonstrosesquippedaliophobia"],
  156: ["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheepochofbelief"],
  157: ["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheepochofbelief"],
  158: ["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheepochofbelief"],
  159: ["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheepochofbelief"],
  160: ["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheepochofbelief"],
  161: ["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheepochofbelief"],
  162: ["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheepochofbelief"],
  163: ["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheepochofbelief"],
  164: ["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheepochofbelief"],
  165: ["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheepochofbelief"],
  166: ["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheepochofbelief"],
  167: ["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheepochofbelief"],
  168: ["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheepochofbelief"],
  169: ["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheepochofbelief"],
  170: ["antidisestablishmentarianismfloccinaucinihilipilificationsupercalifragilisticexpialidociouspneumonoultramicroscopicsilicovolcanoconiosis","itwasthebestoftimesitwastheworstoftimesitwastheageofwisdomitwastheepochofbelief"],
};

function generateSkipChallenge(targetLevelId) {
  const words = SKIP_CHALLENGES[targetLevelId] || SKIP_CHALLENGES[65];
  return [...words].sort(() => Math.random() - 0.5);
}

function suggestLevel(age, skill) {
  if (skill === "beginner" || age < 8) return 1;
  if (skill === "intermediate") return age < 12 ? 3 : 4;
  if (skill === "advanced") return age < 14 ? 6 : 7;
  return 1;
}

function resizeToBase64(file, maxPx = 200) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(maxPx / img.width, maxPx / img.height, 1);
      const canvas = document.createElement("canvas");
      canvas.width = Math.round(img.width * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", 0.82));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function cleanErr(e) {
  const m = { "auth/invalid-credential":"Wrong email or password.", "auth/user-not-found":"No account found.", "auth/email-already-in-use":"Email already in use.", "auth/weak-password":"Password needs 6+ characters." };
  return m[e.code] || (e.code || e.message || "Something went wrong.");
}

// MAIN COMPONENT

// Sound
// Reuse a single AudioContext - creating one per keypress hits browser limits
let _audioCtx = null;
const getAudioCtx = () => {
  if (!_audioCtx || _audioCtx.state === "closed") {
    _audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_audioCtx.state === "suspended") _audioCtx.resume();
  return _audioCtx;
};
const playSound = (type, soundTheme = "default") => {
  try {
    const ctx = getAudioCtx();
    const g = ctx.createGain();
    g.connect(ctx.destination);
    const t = ctx.currentTime;

    if (soundTheme === "mechanical") {
      // Clicky mechanical keyboard
      if (type === "correct") {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.04, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.exp(-i/(ctx.sampleRate*0.015));
        const s = ctx.createBufferSource(); s.buffer = buf; s.connect(g);
        g.gain.setValueAtTime(0.3, t); s.start(t);
      } else if (type === "wrong") {
        const buf = ctx.createBuffer(1, ctx.sampleRate * 0.06, ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.exp(-i/(ctx.sampleRate*0.04)) * 0.5;
        const s = ctx.createBufferSource(); s.buffer = buf; s.connect(g);
        g.gain.setValueAtTime(0.2, t); s.start(t);
      } else if (type === "complete") {
        [0,0.1,0.2].forEach(dt => {
          const buf = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate);
          const d = buf.getChannelData(0);
          for (let i = 0; i < d.length; i++) d[i] = (Math.random()*2-1) * Math.exp(-i/(ctx.sampleRate*0.02));
          const s = ctx.createBufferSource(); s.buffer = buf; s.connect(g);
          g.gain.setValueAtTime(0.4, t); s.start(t + dt);
        });
      }
    } else if (soundTheme === "typewriter") {
      if (type === "correct") {
        const o = ctx.createOscillator(); o.connect(g); o.type = "square";
        o.frequency.setValueAtTime(800, t); o.frequency.exponentialRampToValueAtTime(200, t+0.05);
        g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.05);
        o.start(t); o.stop(t+0.05);
      } else if (type === "wrong") {
        const o = ctx.createOscillator(); o.connect(g); o.type = "square";
        o.frequency.setValueAtTime(150, t); g.gain.setValueAtTime(0.1, t);
        g.gain.exponentialRampToValueAtTime(0.001, t+0.08); o.start(t); o.stop(t+0.08);
      } else if (type === "complete") {
        [400,600,800,1000].forEach((f,i) => {
          const o = ctx.createOscillator(); o.connect(g); o.type = "square"; o.frequency.value = f;
          o.start(t+i*0.07); o.stop(t+i*0.07+0.06);
        }); g.gain.setValueAtTime(0.06, t);
      }
    } else if (soundTheme === "soft") {
      if (type === "correct") {
        const o = ctx.createOscillator(); o.connect(g); o.type = "sine"; o.frequency.value = 660;
        g.gain.setValueAtTime(0.03, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.15);
        o.start(t); o.stop(t+0.15);
      } else if (type === "wrong") {
        const o = ctx.createOscillator(); o.connect(g); o.type = "sine"; o.frequency.value = 220;
        g.gain.setValueAtTime(0.04, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.2);
        o.start(t); o.stop(t+0.2);
      } else if (type === "complete") {
        [523,659,784,1047].forEach((f,i) => {
          const o = ctx.createOscillator(); o.connect(g); o.type = "sine"; o.frequency.value = f;
          g.gain.setValueAtTime(0.04, t+i*0.12); o.start(t+i*0.12); o.stop(t+i*0.12+0.2);
        });
      }
    } else if (soundTheme === "arcade") {
      if (type === "correct") {
        const o = ctx.createOscillator(); o.connect(g); o.type = "square"; o.frequency.value = 440;
        o.frequency.setValueAtTime(440, t); o.frequency.setValueAtTime(880, t+0.03);
        g.gain.setValueAtTime(0.06, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.07);
        o.start(t); o.stop(t+0.07);
      } else if (type === "wrong") {
        const o = ctx.createOscillator(); o.connect(g); o.type = "square";
        o.frequency.setValueAtTime(220, t); o.frequency.exponentialRampToValueAtTime(55, t+0.15);
        g.gain.setValueAtTime(0.08, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.15);
        o.start(t); o.stop(t+0.15);
      } else if (type === "complete") {
        [262,330,392,523,659,784].forEach((f,i) => {
          const o = ctx.createOscillator(); o.connect(g); o.type = "square"; o.frequency.value = f;
          g.gain.setValueAtTime(0.05, t+i*0.06); o.start(t+i*0.06); o.stop(t+i*0.06+0.08);
        });
      }
    } else if (soundTheme === "nature") {
      if (type === "correct") {
        const o = ctx.createOscillator(); o.connect(g); o.type = "sine";
        o.frequency.setValueAtTime(1200, t); o.frequency.exponentialRampToValueAtTime(800, t+0.1);
        g.gain.setValueAtTime(0.04, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.12);
        o.start(t); o.stop(t+0.12);
      } else if (type === "wrong") {
        const o = ctx.createOscillator(); o.connect(g); o.type = "sine"; o.frequency.value = 300;
        g.gain.setValueAtTime(0.05, t); g.gain.exponentialRampToValueAtTime(0.001, t+0.2);
        o.start(t); o.stop(t+0.2);
      } else if (type === "complete") {
        [800,1000,1200,1500].forEach((f,i) => {
          const o = ctx.createOscillator(); o.connect(g); o.type = "sine";
          o.frequency.setValueAtTime(f, t+i*0.1); o.frequency.exponentialRampToValueAtTime(f*0.7, t+i*0.1+0.15);
          g.gain.setValueAtTime(0.04, t+i*0.1); o.start(t+i*0.1); o.stop(t+i*0.1+0.18);
        });
      }
    } else {
      // Default synthesized sounds
      if (type === "correct") {
        const o = ctx.createOscillator();
        o.connect(g); o.type = "sine"; o.frequency.value = 880;
        g.gain.setValueAtTime(0.07, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.08);
        o.start(t); o.stop(t + 0.08);
      } else if (type === "wrong") {
        const o = ctx.createOscillator();
        o.connect(g); o.type = "sawtooth"; o.frequency.value = 160;
        g.gain.setValueAtTime(0.1, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.1);
        o.start(t); o.stop(t + 0.1);
      } else if (type === "complete") {
        [523, 659, 784].forEach((f, i) => {
          const o2 = ctx.createOscillator();
          o2.connect(g); o2.frequency.value = f;
          o2.start(t + i * 0.1); o2.stop(t + i * 0.1 + 0.15);
        });
      }
    }
  } catch(e) {}
};

function SendChallengeForm({ T, friends, LEVELS, onSend, onSendGame, highestUnlocked }) {
  const [toFriend, setToFriend] = React.useState(null);
  const [levelId, setLevelId] = React.useState(1);
  const [mode, setMode] = React.useState("level"); // "level" | "tugofwar"
  const [sending, setSending] = React.useState(false);
  const maxLevel = Math.min(60, highestUnlocked || 1);
  return (
    <div style={{display:"flex",flexDirection:"column",gap:8}}>
      <div style={{display:"flex",gap:6}}>
        <button onClick={()=>setMode("level")} style={{flex:1,padding:"6px",borderRadius:6,border:`1px solid ${mode==="level"?"#ef4444":"#2a2050"}`,background:mode==="level"?"#ef444422":"transparent",color:mode==="level"?"#ef4444":"#888",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>Level Challenge</button>
        <button onClick={()=>setMode("tugofwar")} style={{flex:1,padding:"6px",borderRadius:6,border:`1px solid ${mode==="tugofwar"?"#10b981":"#2a2050"}`,background:mode==="tugofwar"?"#10b98122":"transparent",color:mode==="tugofwar"?"#10b981":"#888",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:"inherit"}}>🪢 Tug of War</button>
      </div>
      <select value={toFriend?.uid||""} onChange={e=>{const f=friends.find(fr=>fr.uid===e.target.value);setToFriend(f||null);}} style={{background:"#1a1030",border:"1px solid #2a2050",borderRadius:7,color:"#e0e0ff",fontSize:12,padding:"6px 10px",fontFamily:"inherit",outline:"none"}}>
        <option value="">Select friend…</option>
        {friends.map(f=><option key={f.uid} value={f.uid}>@{f.username}</option>)}
      </select>
      {mode==="level" && (
        <select value={levelId} onChange={e=>setLevelId(Number(e.target.value))} style={{background:"#1a1030",border:"1px solid #2a2050",borderRadius:7,color:"#e0e0ff",fontSize:12,padding:"6px 10px",fontFamily:"inherit",outline:"none"}}>
          {LEVELS.filter(l=>l.id>0&&l.id<=maxLevel).map(l=><option key={l.id} value={l.id}>{l.emoji} Level {l.id}: {l.name}</option>)}
        </select>
      )}
      <button disabled={!toFriend||sending} onClick={async()=>{
        setSending(true);
        try{
          if (mode==="tugofwar") await onSendGame(toFriend, "tugofwar");
          else await onSend(toFriend,levelId);
        } finally {setSending(false);setToFriend(null);}
      }} style={{padding:"7px",borderRadius:7,border:"none",background:toFriend?(mode==="tugofwar"?"#10b981":"#ef4444"):"#333",color:"#fff",fontSize:12,fontWeight:700,cursor:toFriend?"pointer":"default",fontFamily:"inherit",opacity:sending?0.6:1}}>
        {sending?"Sending…":(mode==="tugofwar"?"🪢 Challenge to Tug of War":"⚔️ Send Challenge")}
      </button>
    </div>
  );
}

export default function AccuratKey() {
  const router = useRouter();
  const [screen, setScreen] = useState("loading");

  // Screen to URL mapping
  const SCREEN_URLS = {
    auth: "/signin",
    profilePicker: "/profiles",
    createProfile: "/profiles/new",
    levelMap: "/game",
    game: "/game/play",
    tips: "/game/level",
    result: "/game/result",
    fail: "/game/fail",
    birthday: "/game/birthday",
    loading: "/game",
    maintenance: "/maintenance",
    multiplayerGame: "/game/duel",
    // tabs (used when on levelMap)
    "tab-games": "/game",
    "tab-map": "/game/map",
    "tab-daily": "/game/daily",
    "tab-test": "/game/test",
  };

  // Tab click also updates URL
  const [testMountKey, setTestMountKey] = React.useState(0);
  const setActiveTabWithUrl = React.useCallback((tab) => {
    setActiveTab(tab);
    if (tab === "test") setTestMountKey(k => k + 1);
    const tabUrls = { games: "/game", map: "/game/map", daily: "/game/daily", test: "/game/test" };
    const url = tabUrls[tab] || "/game";
    if (typeof window !== "undefined" && window.location.pathname !== url) {
      // Use history.replaceState directly, same as setScreenWithUrl below —
      // router.replace can silently fail or lag on same-origin navigation in
      // the App Router, which was contributing to the reactive pathname
      // effect firing with a stale/inconsistent URL.
      window.history.replaceState({}, "", url);
    }
  }, []);

  // Sync screen to URL (replace so back button works naturally)
  const STANDALONE_PAGES = ["/about", "/help", "/faq", "/how-to-play"];
  const setScreenWithUrl = React.useCallback((s) => {
    setScreen(s);
    // Don't redirect if on a standalone content page
    if (typeof window !== "undefined" && STANDALONE_PAGES.includes(window.location.pathname)) return;
    const url = SCREEN_URLS[s] || "/game";
    if (typeof window !== "undefined" && window.location.pathname !== url) {
      // Use history.replaceState directly — Next.js router.replace can silently fail
      // on same-origin page-to-page navigation in the App Router
      window.history.replaceState({}, "", url);
    }
  }, [router]);
  // Embed mode: tqak's showcase site previews AccuratKey in an iframe with
  // ?embed=1. Without this, a preview visitor could sign in and play with a
  // fully real, persisted account from inside what's meant to be a
  // sandboxed preview - same fix already applied to TrivQuic.
  const isEmbed = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("embed") === "1";
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);

  // Optimistic profile patch — updates UI instantly without waiting for Firestore
  const patchProfile = (patch) => setActiveProfile(p => p ? {...p, ...patch} : p);
  const saveCustomLists = (lists) => {
    setCustomLists(lists);
    patchProfile({ customLists: lists });
    if (user && activeProfile) {
      if (isProfileRestricted(activeProfile)) {
        updateProfileLocal(activeProfile.id, activeProfile, { customLists: lists });
      } else {
        updateProfile(user.uid, activeProfile.id, { customLists: lists }).catch(() => {});
      }
    }
  };
  const _age = activeProfile?.isProfileAdmin ? 20 : (activeProfile?.age ?? (activeProfile?.birthday ? calcAge(activeProfile.birthday) : 20));
  const _baseT = getTheme(_age);
  const THEME_COLORS = {
    dark:{},
    midnight:{purple:"#818cf8",bg:"#060614",card:"#0d0d24",border:"#14143a",text:"#c8d0ff",muted:"#4a4a7a",faint:"#333360",accent:"#a78bfa"},
    slate:{purple:"#818cf8",bg:"#0b0f1a",card:"#111827",border:"#1f2937",text:"#e2e8f0",muted:"#64748b",faint:"#374151",accent:"#38bdf8"},
    carbon:{purple:"#cc5500",bg:"#0a0a0a",card:"#111111",border:"#222222",text:"#e8e8e8",muted:"#666666",faint:"#333333",accent:"#ff6b35"},
    forest:{purple:"#34d399",bg:"#0a1410",card:"#0f1f18",border:"#1a3020",text:"#d4f0d0",muted:"#4a7060",faint:"#2a4a38",accent:"#86efac"},
    ocean:{purple:"#06b6d4",bg:"#050d14",card:"#0a1820",border:"#0f2535",text:"#bae6fd",muted:"#2a6080",faint:"#0f3a55",accent:"#38bdf8"},
    sakura:{purple:"#f472b6",bg:"#160a10",card:"#201218",border:"#3a1a28",text:"#ffd6e8",muted:"#804060",faint:"#501a30",accent:"#f9a8d4"},
    desert:{purple:"#d97706",bg:"#120d08",card:"#1e1408",border:"#2e2010",text:"#fde68a",muted:"#785028",faint:"#4a3018",accent:"#fbbf24"},
    aurora:{purple:"#2dd4bf",bg:"#070d12",card:"#0c1620",border:"#122030",text:"#d0f0e0",muted:"#2a6050",faint:"#0f3030",accent:"#5eead4"},
    neon:{purple:"#00ff88",bg:"#050505",card:"#0a0f0a",border:"#0a2010",text:"#e0ffe0",muted:"#00aa44",faint:"#004422",accent:"#00ff88"},
    hacker:{purple:"#00cc33",bg:"#000000",card:"#001200",border:"#003300",text:"#00ff41",muted:"#007a1f",faint:"#003d0f",accent:"#00ff41",font:"'Courier New',Courier,monospace"},
    cyberpunk:{purple:"#e879f9",bg:"#0a0010",card:"#130020",border:"#1e0035",text:"#f0e0ff",muted:"#7a3090",faint:"#3d0060",accent:"#f0abfc"},
    synthwave:{purple:"#c084fc",bg:"#0a0018",card:"#100025",border:"#200040",text:"#f8d8ff",muted:"#9a30c0",faint:"#4d0070",accent:"#f472b6"},
    vaporwave:{purple:"#d070ff",bg:"#0f0520",card:"#1a0a30",border:"#2d1050",text:"#ffe8ff",muted:"#9050a0",faint:"#4a1060",accent:"#ff70d0"},
    lavender:{purple:"#a78bfa",bg:"#0e0b18",card:"#180f28",border:"#281840",text:"#ede0ff",muted:"#7060a0",faint:"#3a2860",accent:"#c4b5fd"},
    peach:{purple:"#fb923c",bg:"#140a08",card:"#201410",border:"#342018",text:"#ffe8d8",muted:"#906040",faint:"#4a2818",accent:"#fdba74"},
    mint:{purple:"#34d399",bg:"#080e10",card:"#0e1a1c",border:"#162830",text:"#d0f4e8",muted:"#306860",faint:"#143830",accent:"#6ee7b7"},
    sunset:{purple:"#f472b6",bg:"#150a0f",card:"#201018",border:"#301820",text:"#ffeedd",muted:"#9a4060",faint:"#4d1430",accent:"#fda4af"},
    galaxy:{purple:"#6366f1",bg:"#040410",card:"#08081c",border:"#10102e",text:"#e0e8ff",muted:"#404088",faint:"#202050",accent:"#818cf8"},
    obsidian:{purple:"#7c3aed",bg:"#030305",card:"#07070c",border:"#100f1c",text:"#d8d8f0",muted:"#404060",faint:"#1c1c30",accent:"#8b5cf6"},
    bloodmoon:{purple:"#ef4444",bg:"#0f0000",card:"#1a0000",border:"#2e0000",text:"#ffe8e8",muted:"#8a2020",faint:"#4a0808",accent:"#f87171"},
    gold:{purple:"#eab308",bg:"#0a0800",card:"#140e00",border:"#241800",text:"#fff8d0",muted:"#9a7000",faint:"#4a3000",accent:"#fde047"},
    coffee:{purple:"#d97706",bg:"#120d08",card:"#1e1408",border:"#2e2010",text:"#fde68a",muted:"#785028",faint:"#4a3018",accent:"#fbbf24"},
  };
  const _shopOverride = THEME_COLORS[activeProfile?.activeTheme] || {};
  const T = {..._baseT, ..._shopOverride};
  // Apply active font from shop
  const FONT_MAP = {"firacode":"'Fira Code',monospace","sourcecodepro":"'Source Code Pro',monospace","robototmono":"'Roboto Mono',monospace","spacemono":"'Space Mono',monospace","inconsolata":"'Inconsolata',monospace","ptmono":"'PT Mono',monospace","cousine":"'Cousine',monospace","inter":"'Inter',sans-serif","outfit":"'Outfit',sans-serif","nunito":"'Nunito',sans-serif","poppins":"'Poppins',sans-serif","quicksand":"'Quicksand',sans-serif","dmsans":"'DM Sans',sans-serif","lexend":"'Lexend',sans-serif","orbitron":"'Orbitron',sans-serif","rajdhani":"'Rajdhani',sans-serif","exo2":"'Exo 2',sans-serif","audiowide":"'Audiowide',sans-serif","nasalization":"'Russo One',sans-serif","ubuntu":"'Ubuntu Mono',monospace","comicsans":"'Comic Neue',cursive","fredoka":"'Fredoka',sans-serif","boogaloo":"'Boogaloo',cursive","pressstart":"'Press Start 2P',cursive","vt323":"'VT323',monospace","silkscreen":"'Silkscreen',monospace","playfair":"'Playfair Display',serif","cormorant":"'Cormorant Garamond',serif","crimsonpro":"'Crimson Pro',serif","eb_garamond":"'EB Garamond',serif","lora":"'Lora',serif","ibmplexmono":"'IBM Plex Mono',monospace","cascadia":"'Roboto Mono',monospace","notosamono":"'Noto Sans Mono',monospace","overpassmono":"'Overpass Mono',monospace","sharetechmono":"'Share Tech Mono',monospace","anonymouspro":"'Anonymous Pro',monospace","manrope":"'Manrope',sans-serif","plusjakarta":"'Plus Jakarta Sans',sans-serif","syne":"'Syne',sans-serif","figtree":"'Figtree',sans-serif","onest":"'Onest',sans-serif","geist":"'Geist',sans-serif","jura":"'Jura',sans-serif","quantico":"'Quantico',sans-serif","oxanium":"'Oxanium',sans-serif","tektur":"'Tektur',sans-serif","tourney":"'Tourney',sans-serif","blender":"'Blinker',sans-serif","chewy":"'Chewy',cursive","rubikbubbles":"'Rubik Bubbles',cursive","permanentmarker":"'Permanent Marker',cursive","creepster":"'Creepster',cursive","domine":"'Domine',serif","ultra":"'Ultra',serif"};
  const _activeFont = activeProfile?.activeFont;
  const _fontFamily = (_activeFont && FONT_MAP[_activeFont]) ? FONT_MAP[_activeFont] : T.font;
  // Shop font always wins - override age-based theme font
  if (_fontFamily) T.font = _fontFamily;
  // Inject font into document so elements without explicit fontFamily pick it up
  // Only when a profile is actually selected (not during profile picker)
  if (typeof document !== "undefined" && _fontFamily && activeProfile) {
    document.documentElement.style.setProperty("--ak-font", _fontFamily);
  } else if (typeof document !== "undefined" && !activeProfile) {
    // Reset to default when no profile selected (profile picker screen)
    document.documentElement.style.removeProperty("--ak-font");
  }
  // Font scale: pixel/display fonts need smaller sizes to not break layout
  // Only scale fonts that actually render oversized at normal px values
  const BIG_FONTS = ["pressstart","rubikbubbles","permanentmarker","audiowide","orbitron"];
  const MED_FONTS = ["rajdhani","exo2","tourney"];
  const _fs = BIG_FONTS.includes(_activeFont) ? 0.7 : MED_FONTS.includes(_activeFont) ? 0.85 : 1;
  const fs = (size) => _fs < 1 ? Math.round(size * _fs) : size;
  // Load Google Font if needed
  if (typeof window !== "undefined" && _activeFont && _activeFont !== "jetbrains") {
    const GOOGLE_FONTS = {"firacode":"Fira+Code:wght@400;700","sourcecodepro":"Source+Code+Pro:wght@400;700","robototmono":"Roboto+Mono:wght@400;700","spacemono":"Space+Mono:wght@400;700","inconsolata":"Inconsolata:wght@400;700","ptmono":"PT+Mono","cousine":"Cousine:wght@400;700","inter":"Inter:wght@400;700","outfit":"Outfit:wght@400;700","nunito":"Nunito:wght@400;700","poppins":"Poppins:wght@400;700","quicksand":"Quicksand:wght@400;700","dmsans":"DM+Sans:wght@400;700","lexend":"Lexend:wght@400;700","orbitron":"Orbitron:wght@400;700","rajdhani":"Rajdhani:wght@400;700","exo2":"Exo+2:wght@400;700","audiowide":"Audiowide","nasalization":"Russo+One","ubuntu":"Ubuntu+Mono:wght@400;700","comicsans":"Comic+Neue:wght@400;700","fredoka":"Fredoka:wght@400;700","boogaloo":"Boogaloo","pressstart":"Press+Start+2P","vt323":"VT323","silkscreen":"Silkscreen","playfair":"Playfair+Display:wght@400;700","cormorant":"Cormorant+Garamond:wght@400;700","crimsonpro":"Crimson+Pro:wght@400;700","eb_garamond":"EB+Garamond:wght@400;700","lora":"Lora:wght@400;700","ibmplexmono":"IBM+Plex+Mono:wght@400;700","cascadia":"Roboto+Mono:wght@400;700","notosamono":"Noto+Sans+Mono:wght@400;700","overpassmono":"Overpass+Mono:wght@400;700","sharetechmono":"Share+Tech+Mono","anonymouspro":"Anonymous+Pro:wght@400;700","manrope":"Manrope:wght@400;700","plusjakarta":"Plus+Jakarta+Sans:wght@400;700","syne":"Syne:wght@400;700","figtree":"Figtree:wght@400;700","onest":"Onest:wght@400;700","geist":"Geist:wght@400;700","jura":"Jura:wght@400;700","quantico":"Quantico:wght@400;700","oxanium":"Oxanium:wght@400;700","tektur":"Tektur:wght@400;700","tourney":"Tourney:wght@400;700","blender":"Blinker:wght@400;700","chewy":"Chewy","rubikbubbles":"Rubik+Bubbles","permanentmarker":"Permanent+Marker","creepster":"Creepster","domine":"Domine:wght@400;700","ultra":"Ultra"};
    const gf = GOOGLE_FONTS[_activeFont];
    if (gf && !document.getElementById("gf-"+_activeFont)) {
      const l=document.createElement("link");l.id="gf-"+_activeFont;l.rel="stylesheet";l.href="https://fonts.googleapis.com/css2?family="+gf+"&display=swap";document.head.appendChild(l);
    }
  }

  const [authMode, setAuthMode] = useState("login");
  const [authEmail, setAuthEmail] = useState("");
  const [authPass, setAuthPass] = useState("");
  const [authErr, setAuthErr] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const profileRoutedRef = useRef(false);

  const [newName, setNewName] = useState("");
  const [newBirthday, setNewBirthday] = useState("");
  const [newAvatar, setNewAvatar] = useState("key");
  const [newSkill, setNewSkill] = useState("beginner");
  const [newLayout, setNewLayout] = useState("qwerty");
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);
  const [profilePhotoB64, setProfilePhotoB64] = useState(null);
  const photoRef = useRef(null);

  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showFeatureAccess, setShowFeatureAccess] = useState(false);
  const [trial, setTrial] = useState(null); // {type:"theme"|"font", id, prevId, endAt, used}
  const trialTimerRef = useRef(null);
  const [editName, setEditName] = useState("");
  const [editAvatar, setEditAvatar] = useState("key");
  const [editBirthday, setEditBirthday] = useState("");
  const [bdayRequest, setBdayRequest] = useState(null);
  // Challenges
  const [challenges, setChallenges] = useState([]);
  const [showChallenges, setShowChallenges] = useState(false);
  const [challengeMsg, setChallengeMsg] = useState("");
  const [activeChallengeId, setActiveChallengeId] = useState(null);
  const [activeGameChallenge, setActiveGameChallenge] = useState(null); // {challengeId, gameMode, isFromSide, opponentName, opponentUid}
  // Accuracy mode — custom pass threshold per-session
  const [accuracyTarget, setAccuracyTarget] = useState(75); // 75 | 85 | 95 | 100
  // Weekly summary
  const [showWeeklySummary, setShowWeeklySummary] = useState(false);
  const [showCertificates, setShowCertificates] = useState(false);
  const [weeklySessions, setWeeklySessions] = useState([]);
  const [weeklyLoading, setWeeklyLoading] = useState(false); // playing a challenge // {status, birthday, reason}
  const [bdayReqReason, setBdayReqReason] = useState("");
  const [showBdayReqForm, setShowBdayReqForm] = useState(false);
  const [bdayReqMsg, setBdayReqMsg] = useState("");
  const [editPhoto, setEditPhoto] = useState(null);
  const [editPhotoPreview, setEditPhotoPreview] = useState(null);
  const [editPhotoB64, setEditPhotoB64] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveMsg, setSaveMsg] = useState("");
  const editPhotoRef = useRef(null);
  const [sessions, setSessions] = useState([]);

  // QR photo upload state
  const [qrToken, setQrToken] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [qrListening, setQrListening] = useState(false);
  const [qrContext, setQrContext] = useState(null); // "create" | "edit"
  const qrUnsubRef = useRef(null);

  const [hoveredProfileId, setHoveredProfileId] = useState(null);
  const [pendingOpenSettings, setPendingOpenSettings] = useState(false);

  // Delete confirm state
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [showDeleteProfile, setShowDeleteProfile] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [deleteAccConfirmText, setDeleteAccConfirmText] = useState("");

  const [playingLevel, setPlayingLevel] = useState(1);
  const [isSkipChallenge, setIsSkipChallenge] = useState(false);
  const [skipChallengeWords, setSkipChallengeWords] = useState(null);
  const [skipTargetLevel, setSkipTargetLevel] = useState(null);
  const [layoutKey, setLayoutKey] = useState("qwerty");
  const [lines, setLines] = useState([]);
  const [lineIdx, setLineIdx] = useState(0);
  const [typed, setTyped] = useState("");
  const [totalChars, setTotalChars] = useState(0);
  const totalCharsRef = useRef(0);
  const [totalCorrectChars, setTotalCorrectChars] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const startTimeRef = useRef(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [activeKey, setActiveKey] = useState(null);
  // (ghost mode removed - was confusing/unreliable, replay cursor during
  // typing showing your previous best run)
  const [combo, setCombo] = useState(0);
  const [keyMistakes, setKeyMistakes] = useState({});
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [resultData, setResultData] = useState(null);
  const [keysEarned, setKeysEarned] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [sectionUnlockName, setSectionUnlockName] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [hasKeyboard, setHasKeyboard] = useState(false);
  const [birthdayProfile, setBirthdayProfile] = useState(null);

  // Tips screen state
  const [showTips, setShowTips] = useState(false);
  const [pendingLevelId, setPendingLevelId] = useState(null);
  const [pendingIsSkip, setPendingIsSkip] = useState(false);
  const [pendingSkipTarget, setPendingSkipTarget] = useState(null);
  const [isFirstPlay, setIsFirstPlay] = useState(false);

  // Fail screen
  const [failReason, setFailReason] = useState("");
  const [banInfo, setBanInfo] = useState(null);
  const [showUsernamePrompt, setShowUsernamePrompt] = useState(false);
  const [usernameInput, setUsernameInput] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);
  const [currentUsername, setCurrentUsername] = useState(null);
  const [showChangeUsername, setShowChangeUsername] = useState(false);
  const [newUsernameInput, setNewUsernameInput] = useState("");
  const [maintenance, setMaintenance] = useState(null);
  const [pinModal, setPinModal] = useState(null);
  const [pinInput, setPinInput] = useState('');
  const [pinErr, setPinErr] = useState('');
  const [pinCb, setPinCb] = useState(null);
  const [newPin, setNewPin] = useState("");
  const [editPin, setEditPin] = useState("");
  const [warning, setWarning] = useState(null);
  const [broadcast, setBroadcast] = useState(null);
  const [levelOverrides, setLevelOverrides] = useState({});
  const [activeTab, setActiveTab] = useState("map");

  const pathname = usePathname();
  // Reverse mapping: URL → screen, built once from SCREEN_URLS so the two
  // directions can never drift out of sync with each other.
  const URL_TO_SCREEN = React.useMemo(() => {
    const map = {};
    // "loading" and "levelMap" both map to "/game" in SCREEN_URLS (loading
    // is just the initial-mount placeholder before a real screen is picked).
    // Object.entries iteration order meant whichever was declared LAST in
    // SCREEN_URLS silently won the reverse-lookup slot for "/game" — and
    // since "loading" comes after "levelMap" there, every tab click that
    // set the URL to "/game" (the Games tab) was incorrectly resolving back
    // to the loading screen instead of the level map, which is what was
    // causing the "click a button → flash to loading → back to map" bug.
    // "loading" is never a real navigation target, so it's excluded here
    // entirely rather than relying on declaration order.
    for (const [screenName, url] of Object.entries(SCREEN_URLS)) {
      if (screenName.startsWith("tab-") || screenName === "loading") continue;
      if (map[url] !== undefined) continue; // first one wins, don't let a later duplicate clobber it
      map[url] = screenName;
    }
    return map;
  }, []);
  const URL_TO_TAB = { "/game": "games", "/game/map": "map", "/game/daily": "daily", "/game/test": "test" };
  const hasMountedRef = React.useRef(false);
  useEffect(() => {
    // Skip the very first run — the initial screen is decided by the
    // auth-state effect elsewhere, which needs to know whether a user/profile
    // already exists before picking a screen. This effect only handles
    // navigations AFTER that initial decision: clicking a link to /signin
    // while already on another screen, browser back/forward, or any other
    // client-side route change that doesn't go through setScreenWithUrl.
    if (!hasMountedRef.current) { hasMountedRef.current = true; return; }
    if (STANDALONE_PAGES.includes(pathname)) return;

    let targetScreen = URL_TO_SCREEN[pathname];
    // /signin only makes sense for a signed-out visitor; if already signed
    // in, send them to their level map instead of showing a login form.
    if (targetScreen === "auth" && user) targetScreen = "levelMap";
    // /profiles and /profiles/new only make sense once signed in.
    if ((targetScreen === "profilePicker" || targetScreen === "createProfile") && !user) targetScreen = "auth";

    if (targetScreen && targetScreen !== screen) setScreen(targetScreen);

    const targetTab = URL_TO_TAB[pathname];
    if (targetTab && targetScreen === "levelMap") setActiveTab(targetTab);
  }, [pathname, user]);

  const [customLists, setCustomLists] = useState([]); // [{name, words:[]}]
  const [activeListIdx, setActiveListIdx] = useState(null); // which list is selected for typing
  const [showListEditor, setShowListEditor] = useState(false);
  const [listEditorName, setListEditorName] = useState("");
  const [listEditorWords, setListEditorWords] = useState(""); // raw textarea
  const [listEditorIdx, setListEditorIdx] = useState(null); // null=new, number=edit
  const [showFriends, setShowFriends] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendReqs, setFriendReqs] = useState([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [friendIdInput, setFriendIdInput] = useState("");
  const [copiedFriendId, setCopiedFriendId] = useState(false);
  const [friendMsg, setFriendMsg] = useState("");
  const [showShop, setShowShop] = useState(false);
  const [shopTab, setShopTab] = useState("themes"); // "themes" | "sounds" | "fonts"
  const [shopMsg, setShopMsg] = useState("");
  const [confirmBuy, setConfirmBuy] = useState(null); // { th } | null
  const currentLevelNodeRef = useRef(null);
  const levelMapScrolledRef = useRef(false); // only auto-scroll once per tab visit
  const [dailyWords, setDailyWords] = useState(null);
  const [dailyBoard, setDailyBoard] = useState([]);
  const [dailyDone, setDailyDone] = useState(false);
  const [sessionDates, setSessionDates] = useState({});
  const [showFeedback, setShowFeedback] = useState(false);
  const [pendingNotifications, setPendingNotifications] = useState([]);
  const [activeNotification, setActiveNotification] = useState(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [feedbackSending, setFeedbackSending] = useState(false);
  const [feedbackScreenshot, setFeedbackScreenshot] = useState(null); // base64 data URL
  const [feedbackScreenshotName, setFeedbackScreenshotName] = useState("");
  const feedbackFileRef = useRef(null);
  const feedbackCameraRef = useRef(null);
  const [flaggedScorePopup, setFlaggedScorePopup] = useState(null); // { wpm, date } | null
  const [restoreRequestSent, setRestoreRequestSent] = useState(false);
  const [streak, setStreak] = useState(0);

  const SHOP_THEMES = [
    {id:"dark",label:"Dark",cost:0},{id:"midnight",label:"Midnight",cost:50},
    {id:"forest",label:"Forest",cost:50},{id:"coffee",label:"Coffee",cost:50},
    {id:"sunset",label:"Sunset",cost:75},{id:"ocean",label:"Ocean",cost:75},
    {id:"lavender",label:"Lavender",cost:75},{id:"neon",label:"Neon",cost:100},
  ];
  const SHOP_SOUNDS = [
    {id:"default",label:"Default",cost:0},{id:"mechanical",label:"Mechanical",cost:50},
    {id:"typewriter",label:"Typewriter",cost:50},{id:"soft",label:"Soft",cost:50},
    {id:"arcade",label:"Arcade",cost:75},{id:"nature",label:"Nature",cost:75},
  ];
  const SHOP_FONTS = [
    {id:"jetbrains",label:"JetBrains Mono (Default)",cost:0},
    {id:"firacode",label:"Fira Code",cost:30},
    {id:"sourcecodepro",label:"Source Code Pro",cost:30},
    {id:"robototmono",label:"Roboto Mono",cost:30},
    {id:"spacemono",label:"Space Mono",cost:30},
    {id:"inconsolata",label:"Inconsolata",cost:30},
    {id:"ptmono",label:"PT Mono",cost:30},
    {id:"cousine",label:"Cousine",cost:30},
    {id:"ibmplexmono",label:"IBM Plex Mono",cost:30},
    {id:"cascadia",label:"Cascadia",cost:30},
    {id:"notosamono",label:"Noto Sans Mono",cost:30},
    {id:"overpassmono",label:"Overpass Mono",cost:30},
    {id:"sharetechmono",label:"Share Tech Mono",cost:30},
    {id:"anonymouspro",label:"Anonymous Pro",cost:30},
    {id:"ubuntu",label:"Ubuntu Mono",cost:30},
    {id:"inter",label:"Inter",cost:40},
    {id:"outfit",label:"Outfit",cost:40},
    {id:"nunito",label:"Nunito",cost:40},
    {id:"poppins",label:"Poppins",cost:40},
    {id:"quicksand",label:"Quicksand",cost:40},
    {id:"dmsans",label:"DM Sans",cost:40},
    {id:"lexend",label:"Lexend",cost:40},
    {id:"manrope",label:"Manrope",cost:40},
    {id:"plusjakarta",label:"Plus Jakarta Sans",cost:40},
    {id:"syne",label:"Syne",cost:40},
    {id:"figtree",label:"Figtree",cost:40},
    {id:"onest",label:"Onest",cost:40},
    {id:"geist",label:"Geist",cost:40},
    {id:"playfair",label:"Playfair Display",cost:50},
    {id:"cormorant",label:"Cormorant Garamond",cost:50},
    {id:"crimsonpro",label:"Crimson Pro",cost:50},
    {id:"eb_garamond",label:"EB Garamond",cost:50},
    {id:"lora",label:"Lora",cost:50},
    {id:"domine",label:"Domine",cost:50},
    {id:"orbitron",label:"Orbitron",cost:60},
    {id:"rajdhani",label:"Rajdhani",cost:60},
    {id:"exo2",label:"Exo 2",cost:60},
    {id:"jura",label:"Jura",cost:60},
    {id:"quantico",label:"Quantico",cost:60},
    {id:"oxanium",label:"Oxanium",cost:60},
    {id:"tektur",label:"Tektur",cost:60},
    {id:"tourney",label:"Tourney",cost:60},
    {id:"audiowide",label:"Audiowide",cost:75},
    {id:"nasalization",label:"Russo One",cost:75},
    {id:"comicsans",label:"Comic Neue",cost:75},
    {id:"fredoka",label:"Fredoka",cost:75},
    {id:"boogaloo",label:"Boogaloo",cost:75},
    {id:"pressstart",label:"Press Start 2P",cost:75},
    {id:"vt323",label:"VT323",cost:75},
    {id:"silkscreen",label:"Silkscreen",cost:75},
    {id:"chewy",label:"Chewy",cost:75},
    {id:"rubikbubbles",label:"Rubik Bubbles",cost:75},
    {id:"permanentmarker",label:"Permanent Marker",cost:75},
    {id:"creepster",label:"Creepster",cost:75},
    {id:"ultra",label:"Ultra",cost:75},
    {id:"blender",label:"Blinker",cost:75},
  ];

  // Username handlers
  const handleClaimUsername = async () => {
    const val = usernameInput.trim();
    if (!val) return;
    if (val.length < 3) { setUsernameError("Min 3 characters"); return; }
    if (val.length > 20) { setUsernameError("Max 20 characters"); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(val)) { setUsernameError("Letters, numbers, underscores only"); return; }
    setUsernameLoading(true);
    setUsernameError("");
    try {
      await claimUsername(user.uid, val);
      setCurrentUsername(val.toLowerCase());
      setShowUsernamePrompt(false);
      await logActivity("username_claim", { adminUid: user.uid, targetUid: user.uid, targetUsername: val.toLowerCase() });
    } catch(e) {
      setUsernameError(e.message || "Error");
    }
    setUsernameLoading(false);
  };

  const handleChangeUsername = async () => {
    const val = newUsernameInput.trim();
    if (!val) return;
    if (val.length < 3) { setUsernameError("Min 3 characters"); return; }
    if (!/^[a-zA-Z0-9_]+$/.test(val)) { setUsernameError("Letters, numbers, underscores only"); return; }
    setUsernameLoading(true);
    setUsernameError("");
    try {
      const keys = activeProfile?.keys || 0;
      await changeUsername(user.uid, currentUsername, val, keys);
      if (isProfileRestricted(activeProfile)) {
        const updated = updateProfileLocal(activeProfile.id, activeProfile, { keys: keys - 5 });
        setActiveProfile(updated);
      } else {
        await updateProfile(user.uid, activeProfile.id, { keys: keys - 5 });
        const updated = await getProfile(user.uid, activeProfile.id);
        setActiveProfile(updated);
      }
      setCurrentUsername(val.toLowerCase());
      setShowChangeUsername(false);
      setNewUsernameInput("");
      await logActivity("username_change", { adminUid: user.uid, targetUid: user.uid, targetUsername: val.toLowerCase(), detail: `from: ${currentUsername}` });
    } catch(e) {
      setUsernameError(e.message || "Error");
    }
    setUsernameLoading(false);
  };

  const requirePin = (mode, cb) => {
    if (!activeProfile?.pin) { cb(); return; }
    setPinModal(mode); setPinCb(()=>cb); setPinInput(''); setPinErr('');
  };
  const handlePin = () => {
    if (pinInput===activeProfile?.pin) { setPinModal(null); pinCb?.(); }
    else { setPinErr('Wrong PIN'); setPinInput(''); }
  };

  const handleDismissWarning = async () => {
    await clearWarning(user.uid);
    setWarning(null);
  };

  const inputRef = useRef(null);

  // Check maintenance, broadcast, level overrides on load
  useEffect(() => {
    getMaintenanceMode().then(m => {
      setMaintenance(m);
      // Initial check before auth - only block if users trigger is on
      if (m.enabled && (m.triggers?.users !== false) && screen === "loading") setScreen("maintenance");
    }).catch(() => {});
    getBroadcast().then(b => { if (b?.active && b?.message) setBroadcast(b); }).catch(()=>{});
    getLevelOverrides().then(setLevelOverrides).catch(()=>{});
  }, []);

  useEffect(() => {
    if(activeTab==="daily"&&!dailyWords){
      getDailyChallenge().then(d=>setDailyWords(d.words||["typefast","accuracy","keyboard","practice","daily"])).catch(()=>{});
      getDailyLeaderboard().then(setDailyBoard).catch(()=>{});
    }
    if(activeTab==="daily"&&user&&activeProfile&&!isProfileRestricted(activeProfile)){
      getSessionDates(user.uid, activeProfile.id, 90).then(setSessionDates).catch(()=>{});
    }
  }, [activeTab]);

  // Auto-scroll the level map to the current level when the Map tab opens.
  useEffect(() => {
    if (activeTab === "map") {
      if (!levelMapScrolledRef.current && currentLevelNodeRef.current) {
        levelMapScrolledRef.current = true;
        // Small delay lets the tab's layout settle before measuring scroll position.
        const t = setTimeout(() => {
          currentLevelNodeRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 150);
        return () => clearTimeout(t);
      }
    } else {
      // Reset so switching back to the Map tab scrolls again.
      levelMapScrolledRef.current = false;
    }
  }, [activeTab, activeProfile?.currentLevel]);

  
  const akTimer = useRef(null);
  const TOTAL_LINES = 5;
  const layout = LAYOUTS[layoutKey] || LAYOUTS.qwerty;
  const keyFinger = buildKeyFinger(layout.rows);

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(pointer: coarse) and (hover: none)").matches);
    check();
    window.addEventListener("resize", check);
    // Detect physical keyboard — if they press a real key, let them through
    let lastKeyTime = 0;
    const onKey = (e) => {
      // Ignore if it's a software keyboard (mobile virtual)
      // Physical keyboards fire events even on touch devices
      if (e.key && e.key.length === 1 || ['Backspace','Enter','Tab','Shift','Control','Alt','CapsLock','ArrowLeft','ArrowRight'].includes(e.key)) {
        lastKeyTime = Date.now();
        setHasKeyboard(true);
      }
    };
    window.addEventListener("keydown", onKey);
    // hasKeyboard previously only ever flipped true once, on the first
    // keypress, and never back - so disconnecting a Bluetooth keyboard (or
    // unplugging a wired one) after that first keypress never re-triggered
    // the block screen, even though there's genuinely no keyboard present
    // anymore. There's no universal "keyboard disconnected" browser event
    // to hook into directly, so this checks for prolonged silence instead:
    // if it's been a long while since the last real keypress while still
    // on mobile, treat it the same as never having had a keyboard, so the
    // block screen can re-appear and require proving a keyboard is present
    // again.
    const staleCheck = setInterval(() => {
      if (lastKeyTime && Date.now() - lastKeyTime > 5 * 60 * 1000) {
        setHasKeyboard(false);
        lastKeyTime = 0;
      }
    }, 30000);
    return () => { window.removeEventListener("resize", check); window.removeEventListener("keydown", onKey); clearInterval(staleCheck); };
  }, []);

  useEffect(() => {
    // Handle redirect result from OAuth (GitHub/Google mobile redirect)
    getRedirectResult(auth).then(result => {
      if (result?.user) {
        // onAuthStateChanged will fire automatically, but set loading state
        setAuthLoading(true);
      }
    }).catch(e => {
      if (e?.code) setAuthErr(cleanErr(e));
    });

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      setAuthReady(true);
      if (u) {
        // Check maintenance mode
        const maint = await getMaintenanceMode();
        setMaintenance(maint);
        if (maint.enabled) {
          const triggers = maint.triggers || {admins:false,users:true};
          const isOwner = u.uid === "qM3qeYBLwvRXy8D0gOKGCQbGuA12";
          const isAdminUser = !isOwner && await isAdmin(u.uid).catch(()=>false);
          // The owner account is never blocked by maintenance mode, regardless
          // of the saved trigger settings — there's no toggle for this because
          // an owner who locks themselves out of their own app isn't a real
          // use case, and would require a second account just to turn it off.
          const shouldBlock = !isOwner && (triggers.users || (triggers.admins && isAdminUser));
          if (shouldBlock) { setScreen("maintenance"); return; }
        }
        // Check if banned
        const ban = await getBan(u.uid);
        if (ban) { setBanInfo(ban); return; }
        // Check username
        const uname = await getUsername(u.uid);
        setCurrentUsername(uname);
        if (!uname) setShowUsernamePrompt(true);
        // Check warning
        const warn = await getWarning(u.uid);
        if (warn && !warn.seen) setWarning(warn);
        // Handle signout param even if still logged in
        if (typeof window !== "undefined" && window.location.search.includes("signout=1")) {
          localStorage.removeItem("ak_profileName");
          localStorage.removeItem("ak_uid");
          localStorage.removeItem("ak_username");
          signOut(auth);
          setCurrentUsername(null);
          return;
        }
        await createAccount(u.uid, u.email);
        const profs = await getProfiles(u.uid);
        setProfiles(profs);
        if (profs.length === 0) {
          setScreenWithUrl("createProfile");
        } else {
          // Only route to profile picker once per session
          if (!profileRoutedRef.current) {
            profileRoutedRef.current = true;
            const returnScreen = typeof window !== "undefined" ? localStorage.getItem("ak_returnScreen") : null;
            const lastProfileId = typeof window !== "undefined" ? localStorage.getItem("ak_lastProfile_" + u.uid) : null;
            const lastProf = lastProfileId ? profs.find(p => p.id === lastProfileId) : null;
            const returnProfileId = typeof window !== "undefined" ? localStorage.getItem("ak_returnProfileId") : null;
            const returnProf = returnProfileId ? profs.find(p => p.id === returnProfileId) : lastProf;
            // Restore whenever we have a profile to restore to — not just when
            // ak_returnScreen happens to be set (that was only ever written by
            // the Shop button's "leave and come back" flow, so a hard reload
            // anywhere else — e.g. a mini-game route — always missed it and
            // bounced to the profile picker even though we knew who the
            // last-active profile was via ak_lastProfile_<uid>).
            if (returnProf || lastProf) {
              const prof = returnProf || lastProf;
              localStorage.removeItem("ak_returnScreen");
              localStorage.removeItem("ak_returnProfileId");
              setActiveProfile(prof);
              setLayoutKey(prof.favoriteLayout || "qwerty");
              if (prof.streak) setStreak(prof.streak);
              // Only a small allowlist of screens are safe to restore to
              // directly without other state (like playingLevel) also being
              // restored alongside them - "game"/"tips"/"result"/"fail" all
              // depend on in-memory state that's never persisted, so jumping
              // straight to them from a stored string (which is also
              // user-writable via DevTools, not just app-controlled) would
              // either crash or show a broken screen. Anything not on this
              // list falls back to the level map, which is always safe.
              const SAFE_RETURN_SCREENS = ["levelMap", "profilePicker"];
              setScreen(SAFE_RETURN_SCREENS.includes(returnScreen) ? returnScreen : "levelMap");
            } else {
              // Only show picker if no profile active — prevents flash on token refresh
              setScreenWithUrl("profilePicker");
            }
          }
        }
      } else {
        // Not logged in
        if (typeof window !== "undefined") {
          if (window.location.search.includes("signout=1")) {
            localStorage.removeItem("ak_profileName");
            localStorage.removeItem("ak_uid");
            localStorage.removeItem("ak_username");
            signOut(auth);
            setCurrentUsername(null);
            setScreenWithUrl("levelMap");
          } else if (window.location.search.includes("auth=1")) {
            setScreenWithUrl("auth");
          } else if (screen === "loading") {
            // Restore screen from URL on refresh
            const p = typeof window !== "undefined" ? window.location.pathname : "/game";
            if (p === "/signin") setScreenWithUrl("auth");
            else if (p === "/profiles") setScreenWithUrl("profilePicker");
            else if (p === "/profiles/new") setScreenWithUrl("createProfile");
            else {
              setScreenWithUrl("levelMap");
              // Restore tab from URL
              if (p === "/game/daily") setActiveTab("daily");
              else if (p === "/game/test") setActiveTab("test");
              else if (p === "/game/map" || p === "/game") setActiveTab("map");
            }
          }
        }
      }
    });
    return unsub;
  }, []);

  const reloadProfiles = async () => {
    if (!user) return;
    const profs = await getProfiles(user.uid);
    setProfiles(profs);
    return profs;
  };

  const selectProfile = async (profile) => {
    profileRoutedRef.current = true;
    setActiveProfile(profile);
    setLayoutKey(profile.favoriteLayout || "qwerty");
    if(profile.streak) setStreak(profile.streak);
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("ak_lastProfile_" + user.uid, profile.id);
      localStorage.setItem("ak_profileName", profile.name);
      if (currentUsername) localStorage.setItem("ak_username", currentUsername);
      localStorage.setItem("ak_uid", user.uid);
    }
    try {
      const isBday = await checkAndUpdateBirthday(user.uid, profile.id, profile);
      if (isBday) {
        const updated = await getProfile(user.uid, profile.id);
        setActiveProfile(updated);
        setBirthdayProfile(updated);
        setScreen("birthday");
        return;
      }
    } catch(e) { /* birthday check failed, proceed normally */ }
    // Restore screen if returning from shop or other external page
    const returnScreen = typeof window !== "undefined" ? localStorage.getItem("ak_returnScreen") : null;
    const SAFE_RETURN_SCREENS = ["levelMap", "profilePicker"];
    if (returnScreen && returnScreen !== "profilePicker" && SAFE_RETURN_SCREENS.includes(returnScreen)) {
      localStorage.removeItem("ak_returnScreen");
      setScreen(returnScreen);
    } else {
      localStorage.removeItem("ak_returnScreen");
      setScreenWithUrl("levelMap");
    }
  };

  const handleAuth = async () => {
    setAuthErr(""); setAuthLoading(true);
    try {
      if (authMode === "login") {
        await signInWithEmailAndPassword(auth, authEmail, authPass);
      } else {
        const cred = await createUserWithEmailAndPassword(auth, authEmail, authPass);
        await createAccount(cred.user.uid, cred.user.email);
      }
    } catch (e) { setAuthErr(cleanErr(e)); }
    setAuthLoading(false);
  };

  const handleOAuth = async (provider) => {
    setAuthErr(""); setAuthLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      if (!result?.user) setAuthErr("Sign in failed — try again.");
    }
    catch (e) {
      if (e?.code === "auth/popup-closed-by-user" || e?.code === "auth/cancelled-popup-request") {
        setAuthErr("Popup was closed. Tap the button to try again.");
      } else if (e?.code === "auth/web-storage-unsupported" || e?.code === "auth/operation-not-supported-in-this-environment" || /storage|cookie/i.test(e?.message || "")) {
        // Known Firebase limitation: signInWithPopup needs third-party
        // storage access between this app's domain and the Firebase auth
        // relay domain. Private/incognito browsing blocks that by default
        // in most modern browsers, so sign-in genuinely cannot complete
        // there without a different setup (proxying auth through a custom
        // domain). This is not a bug in the app - it's expected behavior
        // for this Firebase configuration in a private browsing context.
        setAuthErr("Sign in doesn't work in private/incognito browsing on this setup — please use a regular browser window.");
      } else {
        setAuthErr(cleanErr(e));
      }
    }
    setAuthLoading(false);
  };

  const [creatingProfile, setCreatingProfile] = useState(false);
  const handleCreateProfile = async () => {
    if (!newName.trim() || !newBirthday || creatingProfile) return;
    setCreatingProfile(true);
    const age = calcAge(newBirthday);
    const startLevel = suggestLevel(age, newSkill);
    // Defensive check (mirrors the UI gate above): never persist a photo for
    // a profile that computes as under 13, even if profilePhotoB64/profilePhoto
    // somehow got set before the birthday field was filled in.
    let photoURL = null;
    if (age >= 13) {
      if (profilePhotoB64) photoURL = profilePhotoB64;
      else if (profilePhoto) photoURL = await resizeToBase64(profilePhoto, 200);
    }
    const id = await createProfile(user.uid, {
      name: newName.trim(),
      birthday: newBirthday,
      avatar: newAvatar,
      photoURL,
      startLevel,
      layout: newLayout,
      pin: newPin.trim()||null,
    });
    const prof = await getProfile(user.uid, id);
    await reloadProfiles();
    setNewName(""); setNewBirthday(""); setNewAvatar("key"); setNewSkill("beginner");
    setProfilePhoto(null); setProfilePhotoPreview(null); setProfilePhotoB64(null);
    // Show beginner tips on first play
    if (newSkill === "beginner") {
      setIsFirstPlay(true);
      setPendingLevelId(startLevel);
      setPendingIsSkip(false);
      setPendingSkipTarget(null);
      setActiveProfile(prof);
      setLayoutKey(newLayout);
      setShowTips(true);
      setScreenWithUrl("tips");
    } else {
      setCreatingProfile(false);
      await selectProfile(prof);
    }
  };

  const initGame = useCallback((levelId, customWords) => {
    const ov = customWords || levelOverrides[String(levelId)] || null;
    setLines(Array.from({ length: TOTAL_LINES }, () => genLine(levelId, ov)));
    setLineIdx(0); setTyped(""); setTotalChars(0); totalCharsRef.current = 0; setTotalCorrectChars(0);
    setStartTime(null); startTimeRef.current = null; setWpm(0); setAccuracy(100); setCombo(0); setKeyMistakes({}); setShowHeatmap(false);
  }, []);

  const startLevel = (levelId, isSkip = false, skipTarget = null) => {
    setPlayingLevel(levelId);
    setIsSkipChallenge(isSkip);
    if (isSkip) {
      const words = generateSkipChallenge(skipTarget);
      setSkipChallengeWords(words);
      initGame(levelId, words);
    } else if (levelId === -1) {
      setSkipChallengeWords(null);
      initGame(1, dailyWords || ["typefast","accuracy","keyboard","practice","daily"]);
    } else {
      setSkipChallengeWords(null);
      initGame(levelId);
    }
    setSkipTargetLevel(skipTarget);
    setScreenWithUrl("game");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Show tips before starting a level
  const requestStartLevel = (levelId, isSkip = false, skipTarget = null) => {
    // Enforced HERE, not just at each button's onClick, so every path that
    // can ever call this - including challenge-accept buttons whose levelId
    // comes from a Firestore document, not from the level map UI itself -
    // is covered by the same check. A button being disabled or hidden in
    // the UI never actually stops a locked level from starting if the
    // function underneath it doesn't also refuse; this is the actual fix
    // rather than relying on each call site remembering to check first.
    // -1 is the daily challenge, always allowed; the skip-challenge flow
    // (isSkip) targets the next level specifically and is itself already
    // gated by being offered only one level ahead, so it's allowed through.
    const highestUnlocked = activeProfile?.highestUnlocked || 1;
    const isValidSkip = isSkip && levelId === highestUnlocked + 1;
    if (levelId !== -1 && !isValidSkip && levelId > highestUnlocked) {
      return;
    }
    setPendingLevelId(levelId);
    setPendingIsSkip(isSkip);
    setPendingSkipTarget(skipTarget);
    setIsFirstPlay(false);
    setScreenWithUrl("tips");
  };

  useEffect(() => {
    if (screen === "game") setTimeout(() => inputRef.current?.focus(), 100);
  }, [screen]);

  // Tick WPM every second so it updates without typing
  useEffect(() => {
    if (screen !== "game") return;
    let tick = 0;
    const iv = setInterval(() => {
      const st = startTimeRef.current;
      if (!st) return;
      const elMs = Date.now() - st;
      if (elMs < 3000) return;
      const w = Math.round((totalCharsRef.current / 5) / (elMs / 60000));
      setWpm(w);
      tick++;
    }, 1000);
    return () => clearInterval(iv);
  }, [screen]);

  useEffect(() => {
    if (pendingOpenSettings && screen === "levelMap") {
      setPendingOpenSettings(false);
      openSettings();
    }
  }, [screen, pendingOpenSettings]);

  const handleType = (e) => {
    const val = e.target.value;
    const current = lines[lineIdx] || "";

    // Block backspace / deletion
    if (val.length <= typed.length) return;

    // Only take the newest char
    // Handle multi-char (fast typing / mobile) - process each new char
    const newTyped = val.slice(0, current.length); // cap at line length
    if (newTyped === typed) return; // no actual change
    const ch = newTyped[newTyped.length - 1];

    if (!startTime) { const now = Date.now(); setStartTime(now); startTimeRef.current = now; }

    if (ch) {
      setActiveKey(ch.toLowerCase());
      clearTimeout(akTimer.current);
      akTimer.current = setTimeout(() => setActiveKey(null), 120);
    }

    // Track mistakes
    const pos = newTyped.length - 1;
    if (ch && ch !== current[pos]) {
      const k = ch.toLowerCase();
      setKeyMistakes(p => ({ ...p, [k]: (p[k] || 0) + 1 }));
      if(canUse(activeProfile,"sounds"))playSound("wrong", activeProfile?.activeSound||"default");
    } else if (ch) {
      if(canUse(activeProfile,"sounds"))playSound("correct", activeProfile?.activeSound||"default");
    }

    setTyped(newTyped);

    // Update live accuracy
    const correct = newTyped.split("").filter((c, i) => c === current[i]).length;
    const tot = totalChars + newTyped.length;
    const newAcc = tot > 0 ? Math.round(((totalCorrectChars + correct) / tot) * 100) : 100;
    setAccuracy(newAcc);

    const _st = startTimeRef.current;
    if (_st) {
      const elMs = Date.now() - _st;
      if (elMs >= 3000) {
        setWpm(Math.round(((totalChars + newTyped.length) / 5) / (elMs / 60000)));
      }
    }

    // Line complete when typed length equals current line length
    if (newTyped.length === current.length) {
      const lv = LEVELS.find(l => l.id === playingLevel);
      const nt = totalChars + current.length;
      const nc = totalCorrectChars + current.split("").filter((c, i) => c === newTyped[i]).length;
      setTotalChars(nt); totalCharsRef.current = nt;
      setTotalCorrectChars(nc);
      setCombo(c => c + 1);
      const ni = lineIdx + 1;

      if (ni >= TOTAL_LINES) {
        const el = startTimeRef.current ? (Date.now() - startTimeRef.current) / 60000 : 0.01;
        const fw = Math.round((nt / 5) / Math.max(el, 0.01));
        const passed = newAcc >= accuracyTarget;
        if (!passed && newAcc < accuracyTarget) {
          setFailReason(`You got ${newAcc}% accuracy. Need ${accuracyTarget}%.`);
        }
        const rd = { wpm: fw, accuracy: newAcc, passed, level: playingLevel, chars: nt, isSkipChallenge, skipTargetLevel };
        setResultData(rd);
        // If this was a challenge, auto-submit result. activeChallengeId
        // should never be set for a restricted profile since the Challenges
        // modal is already blocked for them, but checked here too for
        // defense in depth.
        if (activeChallengeId && user && !isProfileRestricted(activeProfile)) {
          submitChallengeResult(activeChallengeId, user.uid, fw, newAcc, passed).catch(() => {});
          setActiveChallengeId(null);
          getPendingChallenges(user.uid).then(setChallenges).catch(() => {});
        }
        setWpm(fw);
        if (user && activeProfile) {
          const sessionData = { wpm: fw, accuracy: newAcc, layout: layoutKey, level: playingLevel, chars: nt, passed };
          if (isProfileRestricted(activeProfile)) {
            // COPPA: under-13 profile — keep progress entirely in this browser,
            // never write to Firestore. Same math/rewards as the normal path.
            const { actualEarned: earned, updatedProfile } = saveSessionLocal(activeProfile.id, activeProfile, sessionData);
            const multiplier = combo >= 20 ? 2 : combo >= 10 ? 1.5 : 1;
            const boosted = Math.round((earned || 0) * multiplier);
            const bonus = boosted - (earned || 0);
            const { actualEarned: bonusGranted, updatedProfile: finalProfile } = bonus > 0
              ? addBonusKeysLocal(activeProfile.id, updatedProfile, bonus)
              : { actualEarned: 0, updatedProfile };
            setKeysEarned((earned || 0) + bonusGranted);
            setActiveProfile(finalProfile);
          } else {
            saveSession(user.uid, activeProfile.id, sessionData)
              .then(async (earned) => {
                // Combo multiplier: 10+ combo = 1.5x, 20+ combo = 2x
                const multiplier = combo >= 20 ? 2 : combo >= 10 ? 1.5 : 1;
                const boosted = Math.round((earned || 0) * multiplier);
                const bonus = boosted - (earned || 0);
                // Bonus keys still respect the daily earning cap (addBonusKeys re-checks server-side)
                const bonusGranted = bonus > 0 && user && activeProfile ? await addBonusKeys(user.uid, activeProfile.id, bonus) : 0;
                setKeysEarned((earned || 0) + bonusGranted);
                const updated = await getProfile(user.uid, activeProfile.id);
                setActiveProfile(updated);
              }).catch(() => {});
          }
          if (passed) {
            // Save per-level best WPM + stars
            if (playingLevel > 0) {
              const lv = LEVELS.find(l => l.id === playingLevel);
              const stars = newAcc >= 95 ? 3 : (lv && fw >= lv.wpmTarget && lv.wpmTarget > 0) ? 2 : 1;
              const prevBest = activeProfile?.levelBests?.[playingLevel];
              const newBest = { wpm: Math.max(fw, prevBest?.wpm || 0), accuracy: Math.max(newAcc, prevBest?.accuracy || 0), stars: Math.max(stars, prevBest?.stars || 0) };
              if (isProfileRestricted(activeProfile)) {
                const updated = updateProfileLocal(activeProfile.id, activeProfile, { levelBests: { ...(activeProfile.levelBests||{}), [playingLevel]: newBest } });
                setActiveProfile(updated);
              } else {
                updateProfile(user.uid, activeProfile.id, { [`levelBests.${playingLevel}`]: newBest }).catch(() => {});
              }
            }
            if (isProfileRestricted(activeProfile)) {
              // Streak tracking is also profile-state that shouldn't sync server-side
              // for a restricted profile; kept entirely local instead.
              try {
                const today = new Date().toISOString().slice(0,10);
                const local = getProfileLocal(activeProfile.id, activeProfile);
                if (local.lastStreakDate !== today) {
                  const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0,10);
                  const newStreak = local.lastStreakDate === yesterday ? (local.streak || 0) + 1 : 1;
                  const updated = updateProfileLocal(activeProfile.id, activeProfile, { streak: newStreak, lastStreakDate: today });
                  setStreak(newStreak);
                  setActiveProfile(updated);
                }
              } catch {}
            } else {
              updateStreak(user.uid, activeProfile.id).then(s=>{ if(s) setStreak(s); }).catch(()=>{});
            }
            if (playingLevel === -1 && !isProfileRestricted(activeProfile)) {
              submitDailyScore(user.uid, currentUsername, activeProfile.avatar, {wpm:fw, accuracy:newAcc})
                .then(result => {
                  if (result?.suspicious) {
                    setFlaggedScorePopup({ wpm: fw, date: getETDateStr() });
                  }
                })
                .catch(()=>{});
              setDailyDone(true);
              getDailyLeaderboard().then(setDailyBoard).catch(()=>{});
            }
          }
        }
        if (!passed && newAcc < accuracyTarget) {
          setScreenWithUrl("fail");
        } else {
          if(canUse(activeProfile,"sounds"))playSound("complete", activeProfile?.activeSound||"default");
          if(passed){
            const SECTION_MAP={16:"Precision Flow",31:"Word Power",46:"Keyboard Mastery",61:"Speed Surge",66:"Free Run",100:"Century Club",116:"Endurance",131:"Literature",146:"Machine Mode",156:"Legend Tier"};
            const nextSec=SECTION_MAP[playingLevel+1]||null;
            setSectionUnlockName(nextSec);
            setShowConfetti(true);
            setTimeout(()=>{setShowConfetti(false);setSectionUnlockName(null);}, nextSec?6000:3500);
          }
          setScreenWithUrl("result");
        }
      } else {
        setLineIdx(ni);
        setTyped("");
        // Reset input field
        if (inputRef.current) inputRef.current.value = "";
      }
    }
  };

  const openSettings = () => {
    setEditName(activeProfile?.name || "");
    setEditAvatar(activeProfile?.avatar || "key");
    // Sanitize: only reject genuinely future dates (past today) or >120yrs
    const rawB = activeProfile?.birthday || "";
    let safeB = "";
    if (rawB) {
      const bd = new Date(rawB + "T12:00:00"); const now = new Date();
      if (bd <= now && bd.getFullYear() >= now.getFullYear() - 120) safeB = rawB;
    }
    setEditBirthday(safeB);
    setBdayRequest(null); setBdayReqMsg(""); setShowBdayReqForm(false);
    if (user && activeProfile?.id) {
      getBirthdayRequestStatus(user.uid, activeProfile.id).then(setBdayRequest).catch(()=>{});
    }
    setEditPin("");
    setEditPhoto(null); setEditPhotoPreview(null); setEditPhotoB64(null); setSaveMsg("");
    setDeleteConfirmText(""); setShowDeleteProfile(false);
    setDeleteAccConfirmText(""); setShowDeleteAccount(false);
    setShowSettingsModal(true);
  };

  const handleSettingsSave = async () => {
    if (!user || !activeProfile) return;
    setSaving(true); setSaveMsg("");
    try {
      // Validate birthday: only reject genuinely future dates
      const rawBday = editBirthday || "";
      let validBday = "";
      if (rawBday) {
        const bd = new Date(rawBday + "T12:00:00");
        const now = new Date();
        if (bd <= now && bd.getFullYear() >= now.getFullYear() - 120) validBday = rawBday;
      }
      const age = validBday ? calcAge(validBday) : 20;
      // Defensive check (mirrors the UI gate in the Edit Profile modal): never
      // persist a photo for a profile whose (possibly just-updated) birthday
      // computes as under 13 — covers both "this profile was always
      // restricted" and "this edit is what makes it restricted."
      let photoURL = activeProfile?.photoURL || null;
      if (editPhotoB64 === "remove") photoURL = null;
      else if (age < 13) photoURL = null;
      else if (editPhotoB64) photoURL = editPhotoB64;
      else if (editPhoto) photoURL = await resizeToBase64(editPhoto, 200);
      const patch = {
        name: editName.trim() || activeProfile.name,
        avatar: editAvatar,
        photoURL,
        birthday: validBday,
        age,
      };
      patchProfile(patch); // instant
      setSaveMsg("Saved!");
      await updateProfile(user.uid, activeProfile.id, patch); // sync in background
    } catch { setSaveMsg("Error saving."); }
    setSaving(false);
  };

  const handleDeleteProfile = async () => {
    if (deleteConfirmText.toLowerCase() !== "yes") return;
    if (!activeProfile?.id) return;
    const idToDelete = activeProfile.id;
    setShowSettingsModal(false);
    setActiveProfile(null);
    setDeleteConfirmText("");
    setShowDeleteProfile(false);
    await deleteProfile(user.uid, idToDelete);
    await reloadProfiles();
    setScreenWithUrl("profilePicker");
  };

  const handleDeleteAccount = async () => {
    if (deleteAccConfirmText.toLowerCase() !== "yes") return;
    try {
      const profs = await getProfiles(user.uid);
      for (const p of profs) await deleteProfile(user.uid, p.id);
      await deleteUser(auth.currentUser);
      localStorage.removeItem("ak_profileName");
      localStorage.removeItem("ak_uid");
      setUser(null);
      setProfiles([]);
      setActiveProfile(null);
      setShowSettingsModal(false);
      setScreenWithUrl("auth");
    } catch (e) {
      if (e?.code === "auth/requires-recent-login") {
        setSaveMsg("For security, please sign out and sign back in, then try deleting again.");
      } else {
        setSaveMsg("Error deleting account. Please try again.");
      }
    }
  };

  const startQrUpload = async (context) => {
    if (qrUnsubRef.current) qrUnsubRef.current();
    const token = await createPhotoUploadToken();
    const url = `${window.location.origin}/upload/${token}`;
    setQrToken(token);
    setQrUrl(url);
    setQrContext(context);
    setQrListening(true);
    qrUnsubRef.current = listenForPhotoUpload(
      token,
      (photoURL) => {
        if (context === "create") {
          setProfilePhotoPreview(photoURL);
          setProfilePhoto(null); // signal base64 already
          // store raw base64 directly
          setProfilePhotoB64(photoURL);
        } else if (context === "feedback") {
          setFeedbackScreenshot(photoURL);
          setFeedbackScreenshotName("Photo from phone");
        } else {
          setEditPhotoPreview(photoURL);
          setEditPhotoB64(photoURL);
        }
        setQrListening(false);
        setQrToken(null);
        deletePhotoUploadToken(token);
      },
      () => {
        setQrListening(false);
        setQrToken(null);
        deletePhotoUploadToken(token);
      }
    );
  };

  const cancelQr = () => {
    if (qrUnsubRef.current) qrUnsubRef.current();
    if (qrToken) deletePhotoUploadToken(qrToken);
    setQrListening(false);
    setQrToken(null);
  };

  const openProfileModal = () => {
    // Show modal immediately - no state changes before this
    setShowProfileModal(true);
    // Load data after modal is open (non-blocking, won't cause flash)
    if (user && activeProfile) {
      setTimeout(() => {
        setCustomLists(activeProfile.customLists || []);
        if (!activeProfile?.isGuest && !isProfileRestricted(activeProfile)) {
          getRecentSessions(user.uid, activeProfile.id, 10).then(setSessions).catch(() => {});
          getPendingNotifications(user.uid).then(notifs=>{ if(notifs.length>0){setPendingNotifications(notifs);setActiveNotification(notifs[0]);} }).catch(()=>{});
          if (canUse(activeProfile, 'challenges')) {
            getPendingChallenges(user.uid).then(setChallenges).catch(() => {});
          }
          if (new Date().getDay() === 1) {
            const seenKey = `ak_weekly_seen_${new Date().toLocaleDateString('en-CA',{timeZone:'America/New_York'})}`;
            if (!localStorage.getItem(seenKey)) {
              localStorage.setItem(seenKey, '1');
              getWeeklySessions(user.uid, activeProfile.id, 1).then(s => {
                if (s.length > 0) { setWeeklySessions(s); setShowWeeklySummary(true); }
              }).catch(() => {});
            }
          }
        } else if (isProfileRestricted(activeProfile)) {
          // Restricted profile: show whatever's in local storage instead of
          // querying Firestore — same UI, zero server reads for this profile.
          setSessions(getRecentSessionsLocal(activeProfile.id, activeProfile, 10));
        }
      }, 50);
    }
  };

  const AvatarImg = ({ profile, size = 36, style = {} }) => {
    if (!profile) return null;
    return profile.photoURL
      ? <img src={profile.photoURL} alt="avatar" style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0,...style}} />
      : <span style={{width:size,height:size,borderRadius:"50%",background:T.card,border:`2px solid ${T.border}`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:size*0.45,flexShrink:0,...style}}>{AV[profile.avatar||"key"]||"⌨️"}</span>;
  };

  const Overlay = ({ onClose, children, wide }) => (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:28,width: isMobile ? (wide?520:420) : (wide?760:620),maxWidth:"94vw",maxHeight:"90vh",overflowY:"auto",fontFamily:T.font}} onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );

  const ModalHeader = ({ title, onClose }) => (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:22}}>
      <span style={{fontWeight:700,fontSize:18,color:T.text}}>{title}</span>
      <button onClick={onClose} style={{background:"none",border:"none",color:T.faint,cursor:"pointer",fontSize:22,lineHeight:1}}>✕</button>
    </div>
  );



const PrivacyRow = ({privKey, label, desc, profile, T, onToggle}) => {
  const val = profile?.privacy?.[privKey] !== false;
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"9px 0",borderBottom:`1px solid ${T.faint}`}}>
      <div>
        <div style={{color:T.text,fontSize:12,fontWeight:700}}>{label}</div>
        <div style={{color:T.muted,fontSize:10,marginTop:2}}>{desc}</div>
      </div>
      <button onClick={()=>onToggle(privKey,!val)} style={{flexShrink:0,padding:"5px 12px",background:val?T.purple+"22":"transparent",border:`1px solid ${val?T.purple:T.border}`,borderRadius:7,color:val?T.purple:T.muted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:T.font,marginLeft:12}}>
        {val?"ON":"OFF"}
      </button>
    </div>
  );
};

const DAYS_SHORT = ["S","M","T","W","T","F","S"];
const ActivityCalendar = ({sessionDates, T}) => {
  const [tooltip, setTooltip] = useState(null);
  const today = new Date();
  const todayKey = today.toISOString().slice(0,10);
  // Build last 12 weeks (84 days) from today, aligned to full weeks starting Sunday
  const cells = [];
  for (let i = 83; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0,10);
    cells.push({key, date:d, data:sessionDates[key]||null});
  }
  // Pad front so first cell is a Sunday
  const firstDow = cells[0].date.getDay();
  const padded = Array(firstDow).fill(null).concat(cells);
  const weeks = [];
  for (let i=0;i<padded.length;i+=7) weeks.push(padded.slice(i,i+7));
  const maxCount = Math.max(1,...cells.map(c=>c.data?.count||0));
  const activeDays = cells.filter(c=>c.data).length;
  const totalSess = cells.reduce((s,c)=>s+(c.data?.count||0),0);
  // Month label: show month when first week of that month appears
  const monthLabels = {};
  weeks.forEach((week,wi)=>{
    const first = week.find(c=>c);
    if(first&&first.date.getDate()<=7) monthLabels[wi]=first.date.toLocaleString("default",{month:"short"});
  });
  const CELL=14, GAP=3;
  return (
    <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"14px 16px",marginBottom:16}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{color:T.text,fontWeight:700,fontSize:13}}>📆 Your Activity</div>
        <div style={{display:"flex",gap:14}}>
          <span style={{color:T.muted,fontSize:11}}><span style={{color:T.purple,fontWeight:700}}>{activeDays}</span> days played</span>
          <span style={{color:T.muted,fontSize:11}}><span style={{color:T.text,fontWeight:700}}>{totalSess}</span> sessions</span>
        </div>
      </div>
      {/* Day-of-week labels */}
      <div style={{display:"flex",gap:GAP,marginBottom:2}}>
        <div style={{width:20,flexShrink:0}}/>
        {weeks[0]?.map((_,di)=>(
          <div key={di} style={{width:CELL,textAlign:"center",fontSize:8,color:T.faint,flexShrink:0}}>{DAYS_SHORT[di]}</div>
        ))}
      </div>
      {/* Month label row */}
      <div style={{display:"flex",gap:GAP,marginBottom:4}}>
        <div style={{width:20,flexShrink:0}}/>
        {weeks.map((_,wi)=>(
          <div key={wi} style={{width:CELL,fontSize:8,color:monthLabels[wi]?T.muted:"transparent",flexShrink:0,textAlign:"center"}}>{monthLabels[wi]||"·"}</div>
        ))}
      </div>
      {/* Grid: rows=days of week, cols=weeks */}
      {[0,1,2,3,4,5,6].map(dow=>(
        <div key={dow} style={{display:"flex",gap:GAP,marginBottom:GAP}}>
          <div style={{width:20,fontSize:8,color:T.faint,display:"flex",alignItems:"center",justifyContent:"flex-end",paddingRight:4,flexShrink:0}}>
            {dow===1?"M":dow===3?"W":dow===5?"F":""}
          </div>
          {weeks.map((week,wi)=>{
            const cell = week[dow];
            if(!cell) return <div key={wi} style={{width:CELL,height:CELL,flexShrink:0}}/>;
            const isToday = cell.key===todayKey;
            const intensity = cell.data ? Math.max(0.25,cell.data.count/maxCount) : 0;
            const bg = cell.data?`rgba(139,92,246,${Math.min(1,intensity*0.75+0.25)})`:T.bg;
            const border = isToday?`2px solid ${T.purple}`:`1px solid ${cell.data?"transparent":T.border+"55"}`;
            return (
              <div key={wi}
                onMouseEnter={()=>cell.data&&setTooltip({key:cell.key,data:cell.data})}
                onMouseLeave={()=>setTooltip(null)}
                style={{width:CELL,height:CELL,borderRadius:3,background:bg,border,flexShrink:0,cursor:cell.data?"pointer":"default",position:"relative"}}
              />
            );
          })}
        </div>
      ))}
      {/* Tooltip */}
      {tooltip&&(
        <div style={{background:"#1a1a2e",border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 12px",marginTop:8,fontSize:12}}>
          <span style={{color:T.muted}}>{tooltip.key}</span>
          <span style={{color:T.text,fontWeight:700,marginLeft:10}}>{tooltip.data.count} session{tooltip.data.count>1?"s":""}</span>
          <span style={{color:T.purple,fontWeight:700,marginLeft:10}}>{tooltip.data.bestWpm} WPM best</span>
          {tooltip.data.passed&&<span style={{color:T.accent,marginLeft:10}}>✓ passed</span>}
        </div>
      )}
      {/* Legend */}
      <div style={{display:"flex",alignItems:"center",gap:4,marginTop:10,justifyContent:"flex-end"}}>
        <span style={{fontSize:9,color:T.faint}}>no sessions</span>
        <div style={{width:10,height:10,borderRadius:2,background:T.bg,border:`1px solid ${T.border}55`}}/>
        {[0.25,0.5,0.75,1].map(v=>(
          <div key={v} style={{width:10,height:10,borderRadius:2,background:`rgba(139,92,246,${v*0.75+0.25})`}}/>
        ))}
        <span style={{fontSize:9,color:T.faint}}>many sessions</span>
        <div style={{width:10,height:10,borderRadius:2,border:`2px solid ${T.purple}`,background:T.bg,marginLeft:6}}/>
        <span style={{fontSize:9,color:T.faint}}>today</span>
      </div>
    </div>
  );
};

const Confetti = ({ sectionName }) => {
  const colors = ["#a78bfa","#34d399","#f59e0b","#f472b6","#60a5fa","#fb923c","#facc15","#f43f5e","#06b6d4","#84cc16"];
  const count = sectionName ? 120 : 60;
  const pieces = React.useMemo(()=>Array.from({length:count},(_,i)=>({
    id:i, x:Math.random()*100, delay:Math.random()*1.2,
    color:colors[i%colors.length], size:Math.random()*10+4,
    drift:(Math.random()-0.5)*280, dur:2.5+Math.random()*2,
    tall: i%3===2, round: i%3===0,
  })),[]);
  return (
    <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:9999,overflow:"hidden"}}>
      {sectionName && (
        <div style={{position:"absolute",top:"22%",left:"50%",transform:"translateX(-50%)",
          background:"linear-gradient(135deg,#1a1a2e,#2a1a3e)",
          border:"2px solid #a78bfa88",borderRadius:16,padding:"18px 32px",
          textAlign:"center",zIndex:10000,boxShadow:"0 0 40px #a78bfa44",
          animation:"sectionPop 0.4s cubic-bezier(0.175,0.885,0.32,1.275) both",
          whiteSpace:"nowrap",
        }}>
          <div style={{color:"#a78bfa",fontSize:11,fontWeight:700,letterSpacing:2,textTransform:"uppercase",marginBottom:4}}>Section Unlocked</div>
          <div style={{color:"#fff",fontSize:20,fontWeight:900,letterSpacing:0.5}}>{sectionName}</div>
        </div>
      )}
      {pieces.map(p=>(
        <div key={p.id} style={{
          position:"absolute", left:`${p.x}%`, top:"-20px",
          width:p.size, height:p.tall?p.size*0.4:p.size,
          borderRadius:p.round?"50%":"2px",
          background:p.color, opacity:0.92,
          animation:`confettiFall ${p.dur}s ${p.delay}s ease-in forwards`,
          transform:`translateX(${p.drift}px) rotate(${Math.floor(Math.random()*360)}deg)`,
        }}/>
      ))}
      <style>{`@keyframes confettiFall{0%{top:-20px;opacity:1}100%{top:110vh;opacity:0}} @keyframes sectionPop{0%{opacity:0;transform:translateX(-50%) scale(0.7)}100%{opacity:1;transform:translateX(-50%) scale(1)}}`}</style>
    </div>
  );
};

const Nav = () => (<>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div>
        <span style={{fontWeight:800,fontSize:fs(16),color:T.text,fontFamily:T.font}}><span style={{color:T.purple}}>Accurat</span>Key</span>
        {currentUsername && <div style={{fontSize:9,color:T.muted,marginTop:1}}>@{currentUsername}</div>}
      </div>
      {activeProfile && (
        <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"nowrap",overflowX:"auto",maxWidth:"none"}}>
          {streak>0&&<span style={{color:"#f97316",fontWeight:700,fontSize:12}}>🔥{streak}</span>}
          <button onClick={e=>{e.stopPropagation();setShowFeedback(true);setFeedbackSent(false);setFeedbackText("");}} title="Send feedback" style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,color:T.muted,fontSize:12,padding:"3px 7px",cursor:"pointer",fontFamily:T.font,lineHeight:1}}>💬</button>
          {canUse(activeProfile,"keys")&&<span style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:"4px 10px",fontSize:fs(13),color:T.accent,fontWeight:700,display:"flex",alignItems:"center",gap:4}}><KKey size={14}/>{formatKeys(activeProfile.keys)}</span>}
                    {canUse(activeProfile,"friends")&&<button onClick={()=>{getFriends(user?.uid).then(setFriends);getIncomingRequests(user?.uid).then(setFriendReqs);setShowFriends(true);}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,color:T.muted,fontSize:fs(13),padding:"4px 7px",cursor:"pointer",fontFamily:T.font}} title="Friends">👥</button>}
          {canUse(activeProfile,"challenges")&&<button onClick={()=>{getPendingChallenges(user.uid).then(setChallenges);setShowChallenges(true);setChallengeMsg("");}} style={{background:challenges.some(c=>c.toUid===user?.uid&&c.status==="pending")?"#ef444422":"none",border:`1px solid ${challenges.some(c=>c.toUid===user?.uid&&c.status==="pending")?"#ef4444":T.border}`,borderRadius:6,color:challenges.some(c=>c.toUid===user?.uid&&c.status==="pending")?"#ef4444":T.muted,fontSize:fs(13),padding:"4px 7px",cursor:"pointer",fontFamily:T.font}} title="Challenges">⚔️</button>}
          {(canUse(activeProfile,"shop")||user?.uid==="qM3qeYBLwvRXy8D0gOKGCQbGuA12")&&!activeProfile?.isGuest&&<button onClick={()=>{
    localStorage.setItem('ak_returnScreen', screen||'levelMap');
    localStorage.setItem('ak_returnProfileId', activeProfile?.id||'');
    window.location.href='/shop';
  }} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,color:T.muted,fontSize:13,padding:"4px 7px",cursor:"pointer",fontFamily:T.font}} title="Shop">🛍️</button>}
          <button onClick={openProfileModal} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center",gap:7}} title="Profile">
            <AvatarImg profile={activeProfile} size={30} />
            <span style={{fontSize:12,color:T.muted,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{activeProfile.name}</span>
          </button>
          <button onClick={() => requirePin("switch", () => setScreenWithUrl("profilePicker"))} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,color:T.faint,fontSize:fs(11),padding:"4px 8px",cursor:"pointer",fontFamily:T.font}}>Switch</button>
        </div>
      )}
      {!activeProfile && (
        <button onClick={() => setScreenWithUrl("auth")} style={{background:T.purple,border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,padding:"7px 16px",cursor:"pointer",fontFamily:T.font}}>
          Sign in
        </button>
      )}
    </div>
  </>
  );

  // SCREENS

  if (isMobile && !hasKeyboard && authReady && screen !== "auth" && user?.uid !== "qM3qeYBLwvRXy8D0gOKGCQbGuA12") return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:T.font,padding:32,textAlign:"center"}}>
      <div style={{fontSize:64,marginBottom:20}}>⌨️</div>
      <h1 style={{color:T.text,fontSize:24,fontWeight:700,marginBottom:12}}>⌨️ Press any key</h1>
      <p style={{color:T.muted,fontSize:15,lineHeight:1.6,maxWidth:280}}>Click a key on your keyboard to access AccuratKey.</p>
      <p style={{color:T.faint,fontSize:12,marginTop:8,maxWidth:280}}>Have a Bluetooth keyboard? Connect it first, then press any key.</p>
      <a href="/keyboard" style={{color:"#a78bfa",fontSize:13,fontWeight:600,marginTop:20,display:"block",textDecoration:"none",cursor:"pointer",padding:"10px 20px",border:"1px solid #7c6af755",borderRadius:8,background:"#7c6af711"}}>⌨️ How to connect a keyboard →</a>
      <div style={{marginTop:24,display:"flex",flexDirection:"column",gap:10,width:"100%",maxWidth:280}}>
        {user ? (
          <button onClick={()=>{ if(typeof window!=="undefined"){localStorage.removeItem("ak_profileName");localStorage.removeItem("ak_uid");localStorage.removeItem("ak_lastProfile_"+(user?.uid||""));localStorage.removeItem("ak_username");} signOut(auth); setActiveProfile(null); setProfiles([]); setCurrentUsername(null); profileRoutedRef.current = false; setScreenWithUrl("auth"); }}
            style={{padding:"12px",borderRadius:10,border:"none",background:T.card,color:T.muted,fontSize:13,cursor:"pointer",fontFamily:T.font}}>
            Sign Out
          </button>
        ) : (
          <button onClick={()=>setScreenWithUrl("auth")} style={{padding:"12px",borderRadius:10,border:"none",background:T.purple,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>
            Sign In
          </button>
        )}
      </div>
    </div>
  );

  if (screen === "maintenance") return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",padding:24,textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:16}}>🔧</div>
      <div style={{color:"#a78bfa",fontSize:20,fontWeight:700,marginBottom:8}}>Under Maintenance</div>
      <div style={{color:"#6b7280",fontSize:13}}>{maintenance?.message || "We'll be back soon."}</div>
    </div>
  );

  const NotificationPopup = activeNotification ? (
    <div style={{position:"fixed",inset:0,background:"#000000aa",zIndex:2000,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
      <div style={{background:T.card,border:`1px solid ${T.purple}`,borderRadius:16,padding:28,maxWidth:420,width:"100%",fontFamily:T.font}}>
        <div style={{color:T.purple,fontWeight:800,fontSize:16,marginBottom:4}}>💬 Reply from {activeNotification.adminName}</div>
        <div style={{color:T.faint,fontSize:11,marginBottom:16}}>Response to your feedback</div>
        <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"14px 16px",color:T.text,fontSize:14,lineHeight:1.7,marginBottom:20}}>{activeNotification.reply}</div>
        <button onClick={async()=>{
          await markNotificationRead(user?.uid, activeNotification.id).catch(()=>{});
          const remaining = pendingNotifications.filter(n=>n.id!==activeNotification.id);
          setPendingNotifications(remaining);
          setActiveNotification(remaining[0]||null);
        }} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:T.purple,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>Got it ✓</button>
      </div>
    </div>
  ) : null;

  const BroadcastBanner = broadcast ? (
    <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"#1e1e30",border:`1px solid ${T.purple}`,borderRadius:12,padding:"12px 20px",zIndex:1002,maxWidth:480,width:"90%",display:"flex",alignItems:"center",gap:12,pointerEvents:"none"}}>
      <span style={{fontSize:18}}>📢</span>
      <div style={{color:"#e0e0ff",fontSize:13,flex:1}}>{broadcast.message}</div>
    </div>
  ) : null;

  if (banInfo) return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",padding:24,textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:16}}>🔨</div>
      <div style={{color:"#ef4444",fontSize:20,fontWeight:700,marginBottom:8}}>You have been banned</div>
      <div style={{color:"#6b7280",fontSize:13,marginBottom:4}}>Reason: {banInfo.reason}</div>
      <div style={{color:"#2e2e44",fontSize:11}}>Contact support if you think this is a mistake.</div>
    </div>
  );

  if (showFeatureAccess) {
    const ALL_FEATURES = [
      {group:"⌨️ Gameplay", items:[
        ["sounds","🔊 Sound effects","Play sounds on correct/wrong keypress"],
        ["skip","⏭ Level skip","Allow skipping ahead to the next level"],
        ["keyboard","⌨️ On-screen keyboard","Show keyboard diagram while typing"],
        ["combo","🔥 Combo counter","Show combo streak during a game"],
        ["wpmLive","📊 Live WPM","Show words-per-minute counter while typing"],
        ["accuracyLive","🎯 Live accuracy","Show accuracy percentage while typing"],
        ["progressBar","⬜ Progress bar","Show level progress bar during game"],
        ["linePreview","👁 Next line preview","Show upcoming line while typing"],
        ["restartShortcut","↩ Quick restart","Press Esc to restart current level"],
        ["autoAdvance","▶ Auto-advance","Automatically move to next level on pass"],
        ["mistakeHighlight","❌ Mistake highlight","Flash red on wrong keypress"],
        ["capsWarning","⚠️ Caps Lock warning","Warn when Caps Lock is on"],
        ["wpmGoal","🏁 WPM goal tracker","Show progress toward WPM goal"],
      ]},
      {group:"🗺️ Navigation", items:[
        ["daily","📅 Daily challenge","Access the daily challenge tab"],
        ["test","⌨️ Typing test","Access the free typing test tab"],
        ["customWords","📝 Custom word lists","Create and use custom word lists in Test tab"],
        ["leaderboard","🏆 Leaderboard","View global leaderboards"],
        ["levelMap","🗺 Level map","See full level progression map"],
        ["sessionHistory","📋 Session history","View past typing sessions"],
        ["achievements","🏅 Achievements","Access achievements panel"],
        ["stats","📊 Stats page","View detailed personal stats"],
        ["tips","💡 Tips & tricks","Show typing tips between levels"],
      ]},
      {group:"👥 Social", items:[
        ["keys","Keys display","Show Keys count in nav bar"],
        ["streak","🔥 Streak display","Show 🔥 streak count in nav bar"],
        ["friends","👥 Friends","Access friends panel and requests"],
        ["publicProfile","🌐 Public profile","Profile visible to other users"],
        ["chat","💬 Chat & messaging","Messaging with friends"],
        ["challenges","⚔️ Level challenges","Challenge friends to typing duels"],
        ["sendKeys","🎁 Send keys","Send Keys to friends"],
        ["spectate","👀 Spectate","Watch friends play in real time"],
        ["friendLeaderboard","📊 Friend leaderboard","See how you rank vs friends"],
      ]},
      {group:"🛍️ Shop & Customization", items:[
        ["shop","🛍️ Shop access","Navigate to the shop page"],
        ["customTheme","🎨 Custom themes","Buy and equip color themes"],
        ["customFont","✏️ Custom fonts","Buy and equip fonts"],
        ["customAvatar","🖼 Custom avatar","Change emoji avatar"],
        ["profilePhoto","📸 Profile photo","Upload a custom profile photo"],
        ["bio","📝 Profile bio","Set a public bio on your profile"],
        ["keyboardLayout","⌨️ Layout switcher","Switch between QWERTY/DVORAK/etc"],
        ["purchaseKeys","💰 Buy keys","Purchase Keys"],
      ]},
      {group:"🔒 Privacy & Safety", items:[
        ["shareStats","📈 Share stats","Stats visible on public profile"],
        ["showOnline","🟢 Online status","Show when you are online"],
        ["allowRequests","📩 Friend requests","Allow others to send friend requests"],
        ["allowChallenges","⚔️ Accept challenges","Allow challenge requests from others"],
        ["discoverableSearch","🔍 Searchable","Profile appears in user search"],
        ["activityFeed","📰 Activity feed","Your activity shows in friends' feeds"],
        ["twoFactor","🔐 Extra PIN required","Require PIN on every login to this profile"],
      ]},
      {group:"🎓 Learning & Accessibility", items:[
        ["slowMode","🐢 Slow mode","No time pressure, focus on accuracy"],
        ["wordHints","💡 Word hints","Highlight difficult words before typing"],
        ["fingerGuide","🖐 Finger guide","Color-code keys by which finger to use"],
        ["highContrast","♿ High contrast","Increase contrast for readability"],
        ["largeText","🔡 Large text mode","Bigger typing text size"],
        ["reducedMotion","🚫 Reduce motion","Disable animations"],
        ["dyslexicFont","📖 Dyslexia-friendly font","Use OpenDyslexic font option"],
        ["pauseBetweenLines","⏸ Pause between lines","Auto-pause at end of each line"],
      ]},
    ];
    const toggle = (feat) => {
      const on = (activeProfile?.features||{})[feat] !== false;
      const f = {...(activeProfile?.features||{}), [feat]: !on};
      patchProfile({features:f});
      updateProfile(user.uid, activeProfile.id, {features:f});
    };
    return (
      <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.7)",zIndex:200,display:"flex",alignItems:"center",justifyContent:"center",padding:"16px"}} onClick={()=>{setShowFeatureAccess(false);setShowSettingsModal(true);}}>
        <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,width:"100%",maxWidth:480,maxHeight:"90vh",overflowY:"auto",fontFamily:T.font}}>
          {/* Header */}
          <div style={{display:"flex",alignItems:"center",gap:12,padding:"16px 20px",borderBottom:`1px solid ${T.border}`,position:"sticky",top:0,background:T.card,zIndex:10}}>
            <button onClick={()=>{setShowFeatureAccess(false);setShowSettingsModal(true);}} style={{background:"none",border:"none",color:T.muted,fontSize:13,cursor:"pointer",fontFamily:T.font,padding:"4px 8px",borderRadius:6,border:`1px solid ${T.border}`}}>← Settings</button>
            <div>
              <div style={{color:T.text,fontWeight:700,fontSize:15}}>Feature Access</div>
              <div style={{color:T.muted,fontSize:11}}>{activeProfile?.name} · toggle features on/off</div>
            </div>
          </div>
          {/* Groups */}
          <div style={{padding:"12px 20px 24px"}}>
            {ALL_FEATURES.map(({group,items})=>(
              <div key={group} style={{marginBottom:20}}>
                <div style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:8,marginTop:4}}>{group}</div>
                <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,overflow:"hidden"}}>
                  {items.map(([feat,label,desc],i)=>{
                    const on=(activeProfile?.features||{})[feat]!==false;
                    return (
                      <div key={feat} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",borderBottom:i<items.length-1?`1px solid ${T.border}`:"none"}}>
                        <div>
                          <div style={{color:T.text,fontSize:13}}>{label}</div>
                          <div style={{color:T.faint,fontSize:10,marginTop:2}}>{desc}</div>
                        </div>
                        <button onClick={()=>toggle(feat)} style={{flexShrink:0,marginLeft:12,padding:"4px 14px",background:on?T.purple+"22":"transparent",border:`1px solid ${on?T.purple:T.border}`,borderRadius:20,color:on?T.purple:T.faint,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:T.font,minWidth:48}}>{on?"ON":"OFF"}</button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }


  if (screen === "loading") return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",alignItems:"center",justifyContent:"center"}}>
      {activeProfile && <style>{`* { font-family: ${T.font} !important; } body { background: ${T.bg}; }`}</style>}
      <div style={{color:"#7c6af7",fontSize:20,fontFamily:"'JetBrains Mono',monospace"}}>
        <span style={{color:"#e0e0ff"}}>Accurat</span><span style={{color:"#7c6af7"}}>Key</span>
        <span style={{animation:"blink 1s infinite",marginLeft:4}}>_</span>
      </div>
      <style>{`@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}`}</style>
    {NotificationPopup}
    {BroadcastBanner}
    </div>
  );

  if (screen === "auth" && isEmbed) return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",padding:20,textAlign:"center"}}>
      <div>
        <div style={{fontSize:48,marginBottom:12}}>⌨️</div>
        <h1 style={{color:"#e0e0ff",fontSize:22,fontWeight:700,marginBottom:10}}><span style={{color:"#7c6af7"}}>Accurat</span>Key</h1>
        <p style={{color:"#555",fontSize:13,maxWidth:280}}>This is a preview. Visit accuratkey.vercel.app to sign in and play.</p>
      </div>
    </div>
  );

  if (screen === "auth") return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",padding:20}}>
      <div style={{width:"100%",maxWidth:400}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{fontSize:48,marginBottom:12}}>⌨️</div>
          <h1 style={{color:"#e0e0ff",fontSize:26,fontWeight:700,marginBottom:6}}><span style={{color:"#7c6af7"}}>Accurat</span>Key</h1>
          <p style={{color:"#555",fontSize:14}}>Train smarter. Type faster.</p>
        </div>
        <div style={{background:"#13131f",border:"1px solid #1e1e30",borderRadius:16,padding:28}}>
          <div style={{display:"flex",gap:8,marginBottom:20}}>
            {["login","signup"].map(m => (
              <button key={m} onClick={() => { setAuthMode(m); setAuthErr("");}}
                style={{flex:1,padding:"10px",borderRadius:8,border:`2px solid ${authMode===m?"#7c6af7":"#1e1e30"}`,background:authMode===m?"#7c6af722":"transparent",color:authMode===m?"#c4baff":"#555",fontFamily:"'JetBrains Mono',monospace",fontSize:13,fontWeight:700,cursor:"pointer"}}>
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>
          {/* Google */}
          <button onClick={() => handleOAuth(new GoogleAuthProvider())} disabled={authLoading}
            style={{width:"100%",background:"#0a0a0f",border:"1px solid #2a2a4a",borderRadius:8,color:"#e0e0ff",fontFamily:"'JetBrains Mono',monospace",fontSize:13,padding:"11px",cursor:"pointer",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#7c6af7"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#2a2a4a"}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.2l6.7-6.7C35.6 2.4 30.1 0 24 0 14.6 0 6.5 5.5 2.7 13.5l7.8 6C12.4 13.2 17.7 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.9-2.2 5.4-4.7 7l7.3 5.7c4.3-4 6.7-9.8 7.2-16.7z"/>
              <path fill="#FBBC05" d="M10.5 28.5A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.1.8-4.5l-7.8-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.7 10.7l7.8-6.2z"/>
              <path fill="#34A853" d="M24 48c6.1 0 11.2-2 14.9-5.4l-7.3-5.7c-2 1.4-4.6 2.1-7.6 2.1-6.3 0-11.6-3.7-13.5-9l-7.8 6.2C6.5 42.5 14.6 48 24 48z"/>
            </svg>
            Continue with Google
          </button>
          {/* GitHub */}
          <button onClick={() => handleOAuth(new GithubAuthProvider())} disabled={authLoading}
            style={{width:"100%",background:"#0a0a0f",border:"1px solid #2a2a4a",borderRadius:8,color:"#e0e0ff",fontFamily:"'JetBrains Mono',monospace",fontSize:13,padding:"11px",cursor:"pointer",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:10}}
            onMouseEnter={e=>e.currentTarget.style.borderColor="#7c6af7"}
            onMouseLeave={e=>e.currentTarget.style.borderColor="#2a2a4a"}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#e0e0ff">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            Continue with GitHub
          </button>


          <div style={{display:"flex",alignItems:"center",gap:10,margin:"14px 0"}}>
            <div style={{flex:1,height:1,background:"#1e1e30"}} />
            <span style={{color:"#444",fontSize:11}}>or email</span>
            <div style={{flex:1,height:1,background:"#1e1e30"}} />
          </div>
          <input type="email" value={authEmail} onChange={e=>setAuthEmail(e.target.value)} placeholder="Email"
            style={{width:"100%",background:"#0a0a0f",border:"1px solid #1e1e30",borderRadius:8,color:"#e0e0ff",fontFamily:"'JetBrains Mono',monospace",fontSize:14,padding:"10px 14px",marginBottom:10,outline:"none",boxSizing:"border-box"}}
            onKeyDown={e=>e.key==="Enter"&&handleAuth()} />
          <input type="password" value={authPass} onChange={e=>setAuthPass(e.target.value)} placeholder="Password"
            style={{width:"100%",background:"#0a0a0f",border:"1px solid #1e1e30",borderRadius:8,color:"#e0e0ff",fontFamily:"'JetBrains Mono',monospace",fontSize:14,padding:"10px 14px",marginBottom:12,outline:"none",boxSizing:"border-box"}}
            onKeyDown={e=>e.key==="Enter"&&handleAuth()} />
          {authErr && <p style={{color:"#ef4444",fontSize:12,marginBottom:10}}>{authErr}</p>}
          <button onClick={handleAuth} disabled={authLoading}
            style={{width:"100%",padding:"13px",borderRadius:9,border:"none",background:"#7c6af7",color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace",opacity:authLoading?0.6:1}}>
            {authLoading ? "..." : authMode === "login" ? "Log in" : "Sign up"}
          </button>
          <button onClick={() => setScreenWithUrl("levelMap")} style={{width:"100%",marginTop:12,background:"transparent",border:"none",color:"#444",fontSize:12,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>
            Continue without signing in
          </button>
        </div>
      </div>
    {NotificationPopup}
    {BroadcastBanner}
    </div>
  );

  if (screen === "profilePicker") return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",padding:24}}>
      <h1 style={{color:T.text,fontSize:fs(28),fontWeight:800,marginBottom:8,textAlign:"center"}}>Who's playing?</h1>
      <p style={{color:T.muted,fontSize:14,marginBottom:36,textAlign:"center"}}>Pick your profile to continue</p>
      <div style={{display:"flex",flexWrap:"wrap",gap:16,justifyContent:"center",maxWidth:600}}>
        {profiles.map(p => (
          <div key={p.id} style={{position:"relative",width:140,flexShrink:0}}
            onMouseEnter={() => setHoveredProfileId(p.id)}
            onMouseLeave={() => setHoveredProfileId(null)}
          >
            <div onClick={() => selectProfile(p)}
              style={{background:T.card,border:`2px solid ${hoveredProfileId===p.id?T.purple:T.border}`,borderRadius:16,padding:"24px 20px",width:140,cursor:"pointer",textAlign:"center",fontFamily:T.font,overflow:"hidden",display:"block",transition:"border-color 0.15s",boxSizing:"border-box"}}>
              <div style={{marginBottom:10}}>
                {p.photoURL
                  ? <img src={p.photoURL} style={{width:60,height:60,borderRadius:"50%",objectFit:"cover",margin:"0 auto"}} />
                  : <span style={{fontSize:44,display:"block"}}>{AV[p.avatar||"key"]||"⌨️"}</span>
                }
              </div>
              <div style={{color:T.text,fontWeight:700,fontSize:14,marginBottom:4,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
              <div style={{color:T.muted,fontSize:11}}>Level {p.currentLevel || 1}</div>
              <div style={{color:T.accent,fontSize:11,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}><KKey size={11}/>{formatKeys(p.keys)}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); const prof = p; setActiveProfile(prof); setLayoutKey(prof.favoriteLayout||"qwerty"); setEditName(prof.name||""); setEditAvatar(prof.avatar||"key"); setEditBirthday(prof.birthday||""); setEditPhoto(null); setEditPhotoPreview(null); setEditPhotoB64(null); setSaveMsg(""); setDeleteConfirmText(""); setShowDeleteProfile(false); setDeleteAccConfirmText(""); setShowDeleteAccount(false); setScreenWithUrl("levelMap"); setShowSettingsModal(true);}}
              style={{position:"absolute",top:6,right:6,background:T.purple,border:"none",borderRadius:8,padding:"4px 8px",display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:11,fontWeight:700,color:"#fff",zIndex:10,opacity:hoveredProfileId===p.id?1:0,pointerEvents:hoveredProfileId===p.id?"all":"none",transition:"opacity 0.15s",fontFamily:T.font,whiteSpace:"nowrap"}}>
              ✏️ Edit
            </button>
          </div>
        ))}
        <button onClick={() => setScreenWithUrl("createProfile")}
          style={{background:"transparent",border:`2px dashed ${T.border}`,borderRadius:16,padding:"24px 20px",width:140,cursor:"pointer",textAlign:"center",fontFamily:T.font}}>
          <span style={{fontSize:36,display:"block",marginBottom:10}}>➕</span>
          <div style={{color:T.faint,fontSize:13}}>Add Profile</div>
        </button>
      </div>
      <button onClick={() => { if(typeof window !== "undefined"){localStorage.removeItem("ak_profileName");localStorage.removeItem("ak_uid");localStorage.removeItem("ak_lastProfile_"+(user?.uid||""));localStorage.removeItem("ak_username");} signOut(auth); setActiveProfile(null); setProfiles([]); setCurrentUsername(null); setScreenWithUrl("levelMap");}} style={{marginTop:32,background:"none",border:"none",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font}}>
        Sign out
      </button>
    {NotificationPopup}
    {BroadcastBanner}
    </div>
  );

  if (screen === "createProfile") return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,padding:24}}>
      <div style={{width:"100%",maxWidth:isMobile?460:760}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:42,marginBottom:8}}>👤</div>
          <h2 style={{color:T.text,fontSize:24,fontWeight:700,marginBottom:6}}>Create a profile</h2>
          <p style={{color:T.muted,fontSize:14}}>Each profile tracks its own progress</p>
        </div>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:28}}>
          <label style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:6}}>Name</label>
          <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Your name"
            style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:T.font,fontSize:15,padding:"11px 14px",marginBottom:14,outline:"none",boxSizing:"border-box"}} />
          <label style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:6}}>Birthday</label>
          <DatePicker value={newBirthday} onChange={setNewBirthday} T={T} />

          <div style={{display:"flex",alignItems:"center",gap:14,marginTop:18,marginBottom:20}}>
            {profilePhotoPreview
              ? <img src={profilePhotoPreview} style={{width:60,height:60,borderRadius:"50%",objectFit:"cover",flexShrink:0}} />
              : <span style={{width:60,height:60,borderRadius:"50%",background:T.bg,border:`2px solid ${T.border}`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{AV[newAvatar]||"⌨️"}</span>
            }
            {/* Photo upload only offered once a birthday has been entered AND
                it indicates 13-plus — a profile we already know will be a
                child's never gets the option in the first place, rather than
                collecting a photo and removing it after the fact. */}
            {newBirthday && calcAge(newBirthday) < 13 ? (
              <div style={{color:T.faint,fontSize:11,maxWidth:220,lineHeight:1.5}}>Photo uploads aren't available for profiles under 13. Pick an avatar below instead.</div>
            ) : !newBirthday ? (
              <div style={{color:T.faint,fontSize:11,maxWidth:220,lineHeight:1.5}}>Enter a birthday above to enable photo upload.</div>
            ) : (
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <button onClick={()=>photoRef.current?.click()} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:7,color:T.muted,fontSize:12,padding:"6px 12px",cursor:"pointer",fontFamily:T.font}}>
                Upload photo
              </button>
              <button onClick={(e)=>{e.stopPropagation();startQrUpload("create");}} style={{background:"transparent",border:`1px solid ${T.purple}66`,borderRadius:7,color:T.purple,fontSize:12,padding:"6px 12px",cursor:"pointer",fontFamily:T.font}}>
                📱 Use phone
              </button>
            </div>
            )}
            <input ref={photoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){setProfilePhoto(f);setProfilePhotoPreview(URL.createObjectURL(f));setProfilePhotoB64(null);}}} />
          </div>
          {qrListening && qrContext === "create" && (
            <div style={{background:T.bg,border:`1px solid ${T.purple}44`,borderRadius:12,padding:16,marginBottom:16,textAlign:"center"}}>
              <p style={{color:T.muted,fontSize:12,marginBottom:10}}>Scan this QR code with your phone, then pick a photo.</p>
              <QRCanvas url={qrUrl} size={160} />
              <p style={{color:T.faint,fontSize:11,marginBottom:8,wordBreak:"break-all"}}>{qrUrl}</p>
              <button onClick={cancelQr} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:7,color:T.faint,fontSize:11,padding:"5px 12px",cursor:"pointer",fontFamily:T.font}}>Cancel</button>
            </div>
          )}
          <label style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:8}}>Pick an avatar</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:6,marginBottom:18}}>
            {AVATARS.map(a=><div key={a.id} onClick={()=>setNewAvatar(a.id)} style={{aspectRatio:"1",borderRadius:8,border:`2px solid ${newAvatar===a.id?T.purple:T.border}`,background:newAvatar===a.id?T.purple+"22":T.bg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:18}}>{a.e}</div>)}
          </div>
          <label style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:8}}>Starting skill</label>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:18}}>
            {[["beginner","🐣","Just starting"],["intermediate","🚀","Know basics"],["advanced","🔥","Type fast"]].map(([s,em,desc]) => (
              <button key={s} onClick={()=>setNewSkill(s)}
                style={{padding:"10px 6px",borderRadius:8,border:`2px solid ${newSkill===s?T.purple:T.border}`,background:newSkill===s?T.purple+"22":T.bg,cursor:"pointer",textAlign:"center",fontFamily:T.font}}>
                <div style={{fontSize:20,marginBottom:3}}>{em}</div>
                <div style={{color:newSkill===s?T.text:T.muted,fontSize:11,fontWeight:700,textTransform:"capitalize"}}>{s}</div>
                <div style={{color:T.faint,fontSize:10}}>{desc}</div>
              </button>
            ))}
          </div>
          <label style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:8}}>Keyboard layout</label>
          <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:6,marginBottom:20}}>
            {Object.entries(LAYOUTS).map(([k,v]) => (
              <button key={k} onClick={()=>setNewLayout(k)} style={{padding:"8px 4px",borderRadius:8,border:`2px solid ${newLayout===k?T.purple:T.border}`,background:newLayout===k?T.purple+"22":T.bg,cursor:"pointer",textAlign:"center",fontFamily:T.font,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}><span style={{fontSize:18}}>{LAYOUT_FLAGS[k]}</span><span style={{color:newLayout===k?T.text:T.muted,fontSize:10,fontWeight:700}}>{v.label}</span></button>
            ))}
          </div>
          <div style={{marginBottom:14}}>
            <label style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:6}}>PIN (optional)</label>
            <input type="password" value={newPin} onChange={e=>setNewPin(e.target.value)} maxLength={6} placeholder="PIN (optional)" style={{width:"100%",background:T.faint,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:T.font,fontSize:13,padding:"9px 12px",outline:"none",boxSizing:"border-box"}}/>
          </div>
          <button onClick={handleCreateProfile} disabled={!newName.trim()||!newBirthday}
            style={{width:"100%",padding:"14px",borderRadius:10,border:"none",background:newName.trim()&&newBirthday?T.purple:"#252530",color:newName.trim()&&newBirthday?"#fff":"#555",fontSize:15,fontWeight:700,cursor:newName.trim()&&newBirthday?"pointer":"not-allowed",fontFamily:T.font}}>
            Let's go! →
          </button>
          {profiles.length > 0 && (
            <button onClick={()=>setScreenWithUrl("profilePicker")} style={{width:"100%",marginTop:10,padding:"10px",borderRadius:8,background:"none",border:`1px solid ${T.border}`,color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font}}>
              Back to profiles
            </button>
          )}
        </div>
      </div>
    </div>
  );

  if (screen === "birthday") return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:T.font,padding:24,textAlign:"center"}}>
      <div style={{fontSize:80,marginBottom:16,animation:"bounce .6s infinite alternate"}}>🎂</div>
      <h1 style={{color:T.text,fontSize:32,fontWeight:800,marginBottom:10}}>Happy Birthday, {birthdayProfile?.name}!</h1>
      <p style={{color:T.muted,fontSize:16,marginBottom:8}}>You're now {birthdayProfile?.age} years old! 🎉</p>
      <p style={{color:T.accent2,fontSize:14,marginBottom:32}}>Keep up the great typing practice!</p>
      <button onClick={() => setScreenWithUrl("levelMap")}
        style={{padding:"14px 40px",borderRadius:12,border:"none",background:T.purple,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>
        Start Playing →
      </button>
      <style>{`@keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-14px)}}`}</style>
    </div>
  );

  if (screen === "tips") {
    const isDaily = pendingLevelId === -1;
    const lv = isDaily ? null : (LEVELS.find(l => l.id === pendingLevelId) || LEVELS[0]);
    const tips = isFirstPlay
      ? LEVEL_TIPS.beginner
      : (LEVEL_TIPS[pendingLevelId] || LEVEL_TIPS.default);

    return (
      <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:T.font,padding:24}}>
        <div style={{width:"100%",maxWidth:isMobile?460:760,textAlign:"center"}}>
          <div style={{fontSize:56,marginBottom:12}}>{isDaily ? "📅" : lv.emoji}</div>
          <h2 style={{color:T.text,fontSize:fs(24),fontWeight:800,marginBottom:4}}>{isDaily ? "Daily Challenge" : `Level ${lv.id}: ${lv.name}`}</h2>
          <p style={{color:T.muted,fontSize:13,marginBottom:28}}>{isDaily ? "New words today — everyone gets the same set" : `Target: ${lv.accuracy}% accuracy`}</p>
          <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:24,marginBottom:24,textAlign:"left"}}>
            <div style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:14}}>Tips</div>
            {tips.map((tip, i) => (
              <div key={i} style={{display:"flex",gap:12,marginBottom:12,alignItems:"flex-start"}}>
                <span style={{color:T.purple,fontWeight:700,fontSize:14,marginTop:1,flexShrink:0}}>{i+1}.</span>
                <span style={{color:T.text,fontSize:14,lineHeight:1.5}}>{tip}</span>
              </div>
            ))}
          </div>
          <div style={{background:"#1a0a2a",border:`1px solid ${T.purple}44`,borderRadius:10,padding:"12px 16px",marginBottom:24,fontSize:13,color:T.muted,textAlign:"left"}}>
            ⚠️ <strong style={{color:T.text}}>No corrections.</strong> Once you type a character, it's locked in. Focus on accuracy.
          </div>
          {!isDaily && (
          <div style={{marginBottom:14}}>
            <div style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Accuracy Target</div>
            <div style={{display:"flex",gap:6}}>
              {[75,85,95,100].map(n=>(
                <button key={n} onClick={()=>setAccuracyTarget(n)} style={{flex:1,padding:"7px 0",borderRadius:7,border:`1px solid ${accuracyTarget===n?T.purple:T.border}`,background:accuracyTarget===n?T.purple+"22":"transparent",color:accuracyTarget===n?T.purple:T.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>{n}%</button>
              ))}
            </div>
          </div>
          )}
          <button onClick={() => startLevel(pendingLevelId, pendingIsSkip, pendingSkipTarget)}
            style={{width:"100%",padding:"15px",borderRadius:12,border:"none",background:T.purple,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>
            Start Typing →
          </button>
          <button onClick={() => setScreenWithUrl("levelMap")} style={{marginTop:12,background:"none",border:"none",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font}}>
            ← Back to map
          </button>
        </div>
      </div>
    );
  }

  if (screen === "multiplayerGame" && activeGameChallenge) {
    const Comp = activeGameChallenge.gameMode === "tugofwar" ? TugOfWar : null;
    if (!Comp) { setScreenWithUrl("levelMap"); return null; }
    return (
      <div style={{minHeight:"100vh",background:T.bg,padding:"20px 16px",fontFamily:T.font}}>
        <div style={{maxWidth:480,margin:"0 auto"}}>
          <Comp
            T={T}
            onBack={()=>{ setActiveGameChallenge(null); setScreenWithUrl("levelMap"); }}
            settings={{}}
            multiplayer={activeGameChallenge}
          />
        </div>
      </div>
    );
  }

  if (screen === "fail") {
    const lv = LEVELS.find(l => l.id === playingLevel) || LEVELS[0];
    const lvWords = levelOverrides[String(playingLevel)] || lv.words;
    return (
      <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:T.font,padding:24,textAlign:"center"}}>
        <div style={{fontSize:64,marginBottom:16}}>❌</div>
        <h2 style={{color:"#ef4444",fontSize:28,fontWeight:800,marginBottom:8}}>Accuracy too low</h2>
        <p style={{color:T.muted,fontSize:15,marginBottom:6}}>{failReason}</p>
        <p style={{color:T.faint,fontSize:13,marginBottom:32}}>{lv.emoji} {lv.name} requires 75% accuracy.</p>
        <div style={{display:"flex",gap:10}}>
          <button onClick={() => requestStartLevel(playingLevel, isSkipChallenge, skipTargetLevel)}
            style={{padding:"14px 32px",borderRadius:12,border:"none",background:T.purple,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>
            Try Again
          </button>
          <button onClick={() => setScreenWithUrl("levelMap")}
            style={{padding:"14px 32px",borderRadius:12,border:`1px solid ${T.border}`,background:"transparent",color:T.muted,fontSize:15,cursor:"pointer",fontFamily:T.font}}>
            Level Map
          </button>
        </div>
      </div>
    );
  }

  if (screen === "levelMap") {
    const highestUnlocked = activeProfile?.highestUnlocked || 1;
    const currentLevel = activeProfile?.currentLevel || 1;

    return (
      <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.font,padding:isMobile?"10px 8px":"20px 16px",boxSizing:"border-box",overflowX:"hidden",width:"100%",maxWidth:"100vw"}}>
        {activeProfile && <style>{`* { font-family: ${T.font} !important; } body { background: ${T.bg}; }`}</style>}
        {showProfileModal && (
          <Overlay onClose={() => setShowProfileModal(false)}>
            <ModalHeader title="Profile" onClose={() => setShowProfileModal(false)} />
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20,padding:"14px 16px",background:T.bg,borderRadius:12,border:`1px solid ${T.border}`}}>
              <AvatarImg profile={activeProfile} size={56} />
              <div>
                <div style={{fontWeight:700,fontSize:16,color:T.text}}>{activeProfile?.name}</div>
                <div style={{color:T.muted,fontSize:12,marginTop:2}}>Level {activeProfile?.currentLevel || 1}</div>
                {activeProfile?.joinedAt && <div style={{color:T.faint,fontSize:11,marginTop:3}}>Joined {new Date(activeProfile.joinedAt.seconds*1000).toLocaleDateString("en-US",{month:"long",year:"numeric"})}</div>}
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:8,marginBottom:12}}>
              {[["Best WPM",activeProfile?.bestWpm||0,T.purple],["Sessions",activeProfile?.totalSessions||0,T.accent2],["Avg Accuracy",(activeProfile?.avgAccuracy||0)+"%",T.accent]].map(([l,v,c])=>(
                <div key={l} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"12px 8px",textAlign:"center"}}><div style={{color:c,fontSize:22,fontWeight:700}}>{v}</div><div style={{color:T.faint,fontSize:10,marginTop:3}}>{l}</div></div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {[["Keys",activeProfile?.keys||0],["Favorite Layout",activeProfile?.favoriteLayout||"—"]].map(([l,v])=>(
                <div key={l} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px"}}>
                  <div style={{color:T.faint,fontSize:10,marginBottom:3}}>{l}</div>
                  <div style={{fontWeight:700,fontSize:14,color:T.text}}>{v}</div>
                </div>
              ))}
            </div>
            {sessions.length > 0 && <>
              <div style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>📰 Activity Feed</div>
              <div style={{display:"flex",flexDirection:"column",gap:4,maxHeight:220,overflowY:"auto"}}>
                {sessions.map((s,i) => {
                  const lv = LEVELS.find(l => l.id === s.level);
                  const timeAgo = (() => {
                    if(!s.createdAt?.seconds) return "";
                    const secs = Math.floor(Date.now()/1000 - s.createdAt.seconds);
                    if(secs < 60) return "just now";
                    if(secs < 3600) return `${Math.floor(secs/60)}m ago`;
                    if(secs < 86400) return `${Math.floor(secs/3600)}h ago`;
                    if(secs < 604800) return `${Math.floor(secs/86400)}d ago`;
                    return new Date(s.createdAt.seconds*1000).toLocaleDateString();
                  })();
                  return (
                    <div key={s.id||i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 12px",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8}}>
                      <span style={{fontSize:16,flexShrink:0}}>{s.passed?"✅":"❌"}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{color:T.text,fontSize:12,fontWeight:600,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>
                          {s.passed?"Completed":"Attempted"} {lv?`${lv.emoji} ${lv.name}`:`Level ${s.level}`}
                        </div>
                        <div style={{display:"flex",gap:8,marginTop:2}}>
                          <span style={{color:T.purple,fontSize:11,fontWeight:700}}>{s.wpm} WPM</span>
                          <span style={{color:T.accent2,fontSize:11}}>{s.accuracy}%</span>
                        </div>
                      </div>
                      <span style={{color:T.faint,fontSize:10,flexShrink:0}}>{timeAgo}</span>
                    </div>
                  );
                })}
              </div>
            </>}
            <button onClick={()=>{
              setShowProfileModal(false);
              setWeeklyLoading(true); setShowWeeklySummary(true);
              getWeeklySessions(user.uid, activeProfile.id, 0).then(s=>{setWeeklySessions(s);setWeeklyLoading(false);}).catch(()=>setWeeklyLoading(false));
            }} style={{width:"100%",marginTop:12,padding:"10px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font}}>
              📈 This Week's Summary
            </button>
            <button onClick={()=>{setShowProfileModal(false);setShowCertificates(true);}} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font}}>
              🏆 Certificates
            </button>
            <button onClick={()=>{setShowProfileModal(false);openSettings();}} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font}}>
              Edit Profile
            </button>
            <button onClick={()=>{setShowProfileModal(false);setScreenWithUrl("profilePicker");}} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font}}>
              Switch Profile
            </button>
          </Overlay>
        )}

        {showSettingsModal && (
          <Overlay onClose={() => setShowSettingsModal(false)}>
            <ModalHeader title="Edit Profile" onClose={() => setShowSettingsModal(false)} />
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:18}}>
              {editPhotoPreview||activeProfile?.photoURL
                ? <img src={editPhotoPreview||activeProfile.photoURL} style={{width:56,height:56,borderRadius:"50%",objectFit:"cover"}} />
                : <span style={{width:56,height:56,borderRadius:"50%",background:T.bg,border:`2px solid ${T.border}`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:26}}>{AV[editAvatar]||"⌨️"}</span>
              }
              {isProfileRestricted(activeProfile) ? (
                <div style={{color:T.faint,fontSize:11,maxWidth:200,lineHeight:1.5}}>Photo uploads aren't available for this profile. Pick an avatar below instead.</div>
              ) : (
              <div>
                <button onClick={()=>editPhotoRef.current?.click()} style={{display:"block",background:"transparent",border:`1px solid ${T.border}`,borderRadius:6,color:T.muted,fontSize:12,padding:"6px 12px",cursor:"pointer",marginBottom:5,fontFamily:T.font}}>Upload photo</button>
                {!isMobile&&<button onClick={(e)=>{e.stopPropagation();startQrUpload("edit");}} style={{display:"block",background:"transparent",border:`1px solid ${T.purple}66`,borderRadius:6,color:T.purple,fontSize:12,padding:"6px 12px",cursor:"pointer",marginBottom:5,fontFamily:T.font}}>📱 Use phone</button>}
                {(editPhotoPreview||activeProfile?.photoURL) && <button onClick={()=>{setEditPhoto(null);setEditPhotoPreview(null);setEditPhotoB64("remove");}} style={{background:"transparent",border:"none",color:T.faint,fontSize:11,cursor:"pointer",fontFamily:T.font}}>Remove photo</button>}
                <input ref={editPhotoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){setEditPhoto(f);setEditPhotoPreview(URL.createObjectURL(f));setEditPhotoB64(null);}}} />
              </div>
              )}
            </div>
            {qrListening && qrContext === "edit" && (
              <div style={{background:T.bg,border:`1px solid ${T.purple}44`,borderRadius:10,padding:14,marginBottom:14,textAlign:"center"}}>
                <p style={{color:T.muted,fontSize:12,marginBottom:10}}>Scan with your phone, then pick a photo.</p>
                <QRCanvas url={qrUrl} size={140} />
                <p style={{color:T.faint,fontSize:10,wordBreak:"break-all",marginBottom:8}}>{qrUrl}</p>
                <button onClick={cancelQr} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:6,color:T.faint,fontSize:11,padding:"4px 10px",cursor:"pointer",fontFamily:T.font}}>Cancel</button>
              </div>
            )}
            <label style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:6}}>Avatar</label>
            <div style={{display:"grid",gridTemplateColumns:"repeat(8,1fr)",gap:5,marginBottom:14}}>
              {AVATARS.map(a=><div key={a.id} onClick={()=>setEditAvatar(a.id)} style={{aspectRatio:"1",borderRadius:7,border:`2px solid ${editAvatar===a.id?T.purple:T.border}`,background:editAvatar===a.id?T.purple+"22":T.bg,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:16}}>{a.e}</div>)}
            </div>
            <label style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:6}}>Name</label>
            <input value={editName} onChange={e=>setEditName(e.target.value)} style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:T.font,fontSize:14,padding:"10px 14px",marginBottom:14,outline:"none",boxSizing:"border-box"}} />
            <label style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:6}}>Birthday</label>
            <DatePicker value={editBirthday} onChange={v=>{setEditBirthday(v);setBdayReqMsg("");}} T={T} />
            {/* Birthday Approval Request */}
            <div style={{marginTop:-10,marginBottom:14}}>
              {bdayRequest?.status==="pending" && (
                <div style={{fontSize:11,color:"#facc15",padding:"6px 10px",background:"#facc1511",borderRadius:6,border:"1px solid #facc1533"}}>
                  ⏳ Birthday request pending admin review
                </div>
              )}
              {bdayRequest?.status==="approved" && (
                <div style={{fontSize:11,color:"#34d399",padding:"6px 10px",background:"#34d39911",borderRadius:6,border:"1px solid #34d39933"}}>
                  ✅ Birthday approved by admin
                </div>
              )}
              {bdayRequest?.status==="rejected" && (
                <div style={{fontSize:11,color:"#ef4444",padding:"6px 10px",background:"#ef444411",borderRadius:6,border:"1px solid #ef444433"}}>
                  ❌ Birthday request rejected
                </div>
              )}
              {!bdayRequest?.status && (
                <button onClick={()=>setShowBdayReqForm(v=>!v)} style={{background:"none",border:"none",color:T.faint,fontSize:11,cursor:"pointer",fontFamily:T.font,padding:0,textDecoration:"underline"}}>
                  Age outside normal range? Request birthday approval
                </button>
              )}
              {showBdayReqForm && !bdayRequest?.status && (
                <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:6}}>
                  <input
                    placeholder="Reason (optional — e.g. I am 85 years old)"
                    value={bdayReqReason}
                    onChange={e=>setBdayReqReason(e.target.value)}
                    maxLength={200}
                    style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:7,color:T.text,fontFamily:T.font,fontSize:12,padding:"7px 10px",outline:"none",boxSizing:"border-box"}}
                  />
                  <button onClick={async()=>{
                    if(!editBirthday){setBdayReqMsg("Select a birthday first");return;}
                    try{
                      await submitBirthdayRequest(user.uid, activeProfile.id, activeProfile.name||"unknown", editBirthday, bdayReqReason);
                      setBdayRequest({status:"pending",birthday:editBirthday});
                      setShowBdayReqForm(false); setBdayReqMsg("");
                    }catch(e){setBdayReqMsg("Error sending request");}
                  }} style={{alignSelf:"flex-start",padding:"6px 14px",background:T.purple,border:"none",borderRadius:7,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>
                    Submit Request
                  </button>
                  {bdayReqMsg && <div style={{color:"#ef4444",fontSize:11}}>{bdayReqMsg}</div>}
                </div>
              )}
            </div>
            {saveMsg && <p style={{color:saveMsg==="Saved!"?T.accent2:"#ef4444",fontSize:12,marginBottom:8}}>{saveMsg}</p>}

            <div style={{padding:"10px 0",borderTop:`1px solid ${T.faint}`}}>
              <button onClick={()=>{if(!activeProfile?.isProfileAdmin){setShowSettingsModal(false);setShowFeatureAccess(true);}}} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:"none",border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 14px",cursor:activeProfile?.isProfileAdmin?"default":"pointer",fontFamily:T.font,opacity:activeProfile?.isProfileAdmin?0.5:1}}>
                <span style={{color:T.text,fontSize:13,fontWeight:700}}>Feature Access</span>
                <span style={{color:T.muted,fontSize:14}}>{activeProfile?.isProfileAdmin?"(all unlocked via Admin)":"›"}</span>
              </button>
            </div>
            {/* Change PIN */}
            <div style={{padding:"10px 0",borderTop:`1px solid ${T.faint}`}}>
              <div style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:6}}>PIN</div>
              <input type="password" value={editPin} onChange={e=>setEditPin(e.target.value)} maxLength={6} placeholder={activeProfile?.pin?"Change PIN":"Set PIN (optional)"} style={{width:"100%",background:T.faint,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:T.font,fontSize:13,padding:"8px 12px",outline:"none",boxSizing:"border-box",marginBottom:6}}/>
              <button onClick={async()=>{const v=editPin.trim();patchProfile({pin:v||null});await updateProfile(user.uid,activeProfile.id,{pin:v||null});setEditPin("");setSaveMsg(v?"PIN set":"PIN removed");}} style={{padding:"6px 14px",background:T.faint,border:`1px solid ${T.border}`,borderRadius:7,color:T.muted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>Save PIN</button>
            </div>
            <button onClick={handleSettingsSave} disabled={saving} style={{width:"100%",padding:"13px",borderRadius:9,border:"none",background:T.purple,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:T.font,opacity:saving?0.6:1}}>{saving?"Saving...":"Save Changes"}</button>

            {/* Change Username */}
            <button onClick={() => { setShowChangeUsername(true); setShowSettingsModal(false);}} style={{width:"100%",padding:"9px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:T.font,marginTop:8,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>
              @{currentUsername || "Set username"} · Change username (5 <KKey size={11}/>)
            </button>

            {/* Privacy Settings */}
            <div style={{marginTop:16,borderTop:`1px solid ${T.border}`,paddingTop:14}}>
              <div style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>🔒 Privacy</div>
              {isProfileRestricted(activeProfile) ? (
                <div style={{color:T.muted,fontSize:12,lineHeight:1.6}}>
                  This profile never appears on a public page or leaderboard, so there's nothing to configure here.
                </div>
              ) : (
              [
                ["publicProfile","Public profile page","Your /u/username page is visible to anyone"],
                ["showStreak","Show streak publicly","Display 🔥 streak on your public profile"],
                ["showSessions","Show session history","Show recent sessions on your public profile"],
                ["showWpm","Show best WPM","Display your best WPM on your public profile"],
                ["showBadges","Show badges","Display earned badges on your public profile"],
              ].map(([key, label, desc]) => (
                <PrivacyRow key={key} privKey={key} label={label} desc={desc} profile={activeProfile} T={T} onToggle={(k,v)=>{
                  const np={...(activeProfile?.privacy||{}),[k]:v};
                  patchProfile({privacy:np});
                  updateProfile(user.uid,activeProfile.id,{privacy:np});
                }} />
              ))
              )}
            </div>

            {/* Delete Profile */}
            <div style={{marginTop:20,borderTop:`1px solid ${T.border}`,paddingTop:18}}>
              {!showDeleteProfile ? (
                <button onClick={()=>setShowDeleteProfile(true)} style={{width:"100%",padding:"10px",borderRadius:8,border:"1px solid #ef444466",background:"transparent",color:"#ef4444",fontSize:13,cursor:"pointer",fontFamily:T.font}}>
                  Delete Profile
                </button>
              ) : (
                <div>
                  <p style={{color:"#ef4444",fontSize:13,marginBottom:8}}>Type <strong>yes</strong> to confirm deleting this profile. This cannot be undone.</p>
                  <input
                    value={deleteConfirmText}
                    onChange={e=>setDeleteConfirmText(e.target.value)}
                    placeholder="yes"
                    autoFocus
                    style={{width:"100%",background:T.bg,border:"1px solid #ef444466",borderRadius:7,color:T.text,fontFamily:T.font,fontSize:14,padding:"9px 12px",marginBottom:8,outline:"none",boxSizing:"border-box"}} />
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={handleDeleteProfile} disabled={deleteConfirmText.toLowerCase()!=="yes"}
                      style={{flex:1,padding:"9px",borderRadius:7,border:"none",background:"#ef444422",color:"#ef4444",fontSize:13,fontWeight:700,cursor:"pointer",fontFamily:T.font,opacity:deleteConfirmText.toLowerCase()==="yes"?1:0.3}}>
                      Confirm Delete
                    </button>
                    <button onClick={()=>{setShowDeleteProfile(false);setDeleteConfirmText("");}} style={{padding:"9px 14px",borderRadius:7,border:`1px solid ${T.border}`,background:"transparent",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font}}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Delete Account */}
            <div style={{marginTop:12}}>
              {!showDeleteAccount ? (
                <button onClick={()=>setShowDeleteAccount(true)} style={{width:"100%",padding:"10px",borderRadius:8,border:"1px solid #ef444433",background:"transparent",color:"#ef444488",fontSize:12,cursor:"pointer",fontFamily:T.font}}>
                  Delete Account
                </button>
              ) : (
                <div>
                  <p style={{color:"#ef4444",fontSize:13,marginBottom:8}}>This deletes <strong>all profiles and your account permanently</strong>. Type <strong>yes</strong> to confirm.</p>
                  <input
                    value={deleteAccConfirmText}
                    onChange={e=>setDeleteAccConfirmText(e.target.value)}
                    placeholder="yes"
                    autoFocus
                    style={{width:"100%",background:T.bg,border:"1px solid #ef444466",borderRadius:7,color:T.text,fontFamily:T.font,fontSize:14,padding:"9px 12px",marginBottom:8,outline:"none",boxSizing:"border-box"}} />
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={handleDeleteAccount} disabled={deleteAccConfirmText.toLowerCase()!=="yes"}
                      style={{flex:1,padding:"9px",borderRadius:7,border:"none",background:deleteAccConfirmText.toLowerCase()==="yes"?"#ef4444":"#2a1a1a",color:deleteAccConfirmText.toLowerCase()==="yes"?"#fff":"#555",fontSize:13,fontWeight:700,cursor:deleteAccConfirmText.toLowerCase()==="yes"?"pointer":"not-allowed",fontFamily:T.font}}>
                      Delete Everything
                    </button>
                    <button onClick={()=>{setShowDeleteAccount(false);setDeleteAccConfirmText("");}} style={{padding:"9px 14px",borderRadius:7,border:`1px solid ${T.border}`,background:"transparent",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font}}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Overlay>
        )}

        <div style={{maxWidth:(activeTab==="map"&&!isMobile)?"min(1180px, 96%)":"min(860px, 100%)",margin:"0 auto",padding:"0 8px",transition:"max-width 0.2s"}}>
          <Nav />
          {/* Tabs */}
          <div style={{display:"flex",gap:6,marginBottom:16,background:T.card,borderRadius:10,padding:3,border:`1px solid ${T.border}`}}>
            {([
              ["games", (active) => (
                // Games — an arcade joystick: circular base with a shaft, round top, two action buttons beside it
                <svg width={active?22:18} height={active?22:18} viewBox="0 0 40 40" fill="none">
                  {/* base plate */}
                  <ellipse cx="20" cy="32" rx="13" ry="5" fill={active?"#fff":"currentColor"} opacity={active?0.15:0.12}/>
                  <ellipse cx="20" cy="32" rx="13" ry="5" fill="none" stroke={active?"#fff":"currentColor"} strokeWidth="1.6" opacity={active?0.6:0.4}/>
                  {/* shaft */}
                  <rect x="18" y="16" width="4" height="16" rx="2" fill={active?"#fff":"currentColor"} opacity={active?0.85:0.55}/>
                  {/* joystick ball top */}
                  <circle cx="20" cy="13" r="6" fill={active?"#fff":"currentColor"} opacity={active?0.9:0.6}/>
                  <circle cx="18" cy="11" r="2" fill={active?"#fff":"currentColor"} opacity={active?0.35:0.2}/>
                  {/* action button left */}
                  <circle cx="7" cy="24" r="4" fill={active?"#fff":"currentColor"} opacity={active?0.75:0.4}/>
                  <circle cx="7" cy="24" r="2" fill={active?"#fff":"currentColor"} opacity={active?0.3:0.15}/>
                  {/* action button right */}
                  <circle cx="33" cy="24" r="4" fill={active?"#fff":"currentColor"} opacity={active?0.75:0.4}/>
                  <circle cx="33" cy="24" r="2" fill={active?"#fff":"currentColor"} opacity={active?0.3:0.15}/>
                  {/* base grille lines */}
                  <line x1="11" y1="32" x2="29" y2="32" stroke={active?"#fff":"currentColor"} strokeWidth="1" opacity={active?0.2:0.1}/>
                </svg>
              ), true],
              ["map", (active) => (
                // Map — a winding path between three level nodes, with a flag at the top node
                <svg width={active?22:18} height={active?22:18} viewBox="0 0 40 40" fill="none">
                  {/* path line */}
                  <path d="M12 34 Q8 26 20 22 Q32 18 28 10" stroke={active?"#fff":"currentColor"} strokeWidth="2.2" strokeLinecap="round" fill="none" opacity={active?0.7:0.45}/>
                  {/* bottom node */}
                  <circle cx="12" cy="34" r="4" fill={active?"#fff":"currentColor"} opacity={active?0.85:0.55}/>
                  {/* mid node */}
                  <circle cx="20" cy="22" r="3.5" fill={active?"#fff":"currentColor"} opacity={active?0.7:0.4}/>
                  <circle cx="20" cy="22" r="1.5" fill={active?"#fff":"currentColor"} opacity={active?0.25:0.15}/>
                  {/* top node */}
                  <circle cx="28" cy="10" r="4" fill={active?"#fff":"currentColor"} opacity={active?0.9:0.6}/>
                  {/* flag pole */}
                  <line x1="28" y1="6" x2="28" y2="2" stroke={active?"#fff":"currentColor"} strokeWidth="1.5" strokeLinecap="round" opacity={active?0.8:0.5}/>
                  {/* flag */}
                  <path d="M28 2 L35 4 L28 6 Z" fill={active?"#fff":"currentColor"} opacity={active?0.85:0.55}/>
                  {/* completed checkmark on bottom node */}
                  <path d="M9.5 34 L11.5 36 L15 32" stroke={active?"#0a0a0f":"currentColor"} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={active?0.7:0}/>
                </svg>
              ), true],
              ["daily", (active) => (
                // Daily — a calendar page: outer frame, month-bar header, 3x3 dot grid for days, one highlighted cell
                <svg width={active?22:18} height={active?22:18} viewBox="0 0 40 40" fill="none">
                  {/* calendar body */}
                  <rect x="5" y="8" width="30" height="28" rx="4" fill={active?"#fff":"currentColor"} fillOpacity={active?0.1:0.06} stroke={active?"#fff":"currentColor"} strokeWidth="1.8" opacity={active?0.7:0.45}/>
                  {/* header bar */}
                  <rect x="5" y="8" width="30" height="8" rx="4" fill={active?"#fff":"currentColor"} opacity={active?0.25:0.12}/>
                  {/* ring pegs top */}
                  <rect x="13" y="5" width="3" height="7" rx="1.5" fill={active?"#fff":"currentColor"} opacity={active?0.7:0.45}/>
                  <rect x="24" y="5" width="3" height="7" rx="1.5" fill={active?"#fff":"currentColor"} opacity={active?0.7:0.45}/>
                  {/* day dots — 3 rows × 4 cols */}
                  {[0,1,2,3].map(c=>[0,1,2].map(r=>{
                    const x=11+c*6, y=22+r*5;
                    const isToday=c===1&&r===1;
                    return <circle key={`${c}${r}`} cx={x} cy={y} r={isToday?2.5:1.5}
                      fill={active?"#fff":"currentColor"}
                      opacity={isToday?(active?0.95:0.6):(active?0.35:0.2)}/>;
                  }))}
                  {/* today highlight ring */}
                  <circle cx="17" cy="27" r="5" fill="none" stroke={active?"#fff":"currentColor"} strokeWidth="1.4" opacity={active?0.6:0.3}/>
                </svg>
              ), canUse(activeProfile,"daily")],
              ["test", (active) => (
                // Test — a keyboard: outer shell, 3 key rows with varying widths, space bar at bottom
                <svg width={active?22:18} height={active?22:18} viewBox="0 0 40 40" fill="none">
                  {/* keyboard body */}
                  <rect x="3" y="10" width="34" height="22" rx="4" fill={active?"#fff":"currentColor"} fillOpacity={active?0.1:0.06} stroke={active?"#fff":"currentColor"} strokeWidth="1.8" opacity={active?0.7:0.45}/>
                  {/* top row keys — 5 small */}
                  {[7,12,17,22,27].map(x=>(
                    <rect key={x} x={x} y="14" width="4" height="4" rx="1.2" fill={active?"#fff":"currentColor"} opacity={active?0.55:0.3}/>
                  ))}
                  {/* middle row keys — 4, slightly offset */}
                  {[9,14.5,20,25.5].map(x=>(
                    <rect key={x} x={x} y="20" width="4" height="4" rx="1.2" fill={active?"#fff":"currentColor"} opacity={active?0.55:0.3}/>
                  ))}
                  {/* space bar */}
                  <rect x="11" y="26" width="18" height="4" rx="2" fill={active?"#fff":"currentColor"} opacity={active?0.7:0.4}/>
                </svg>
              ), canUse(activeProfile,"test")],
            ]).filter(t=>t[2]).map(([k,renderIcon])=>(
              <button key={k} onClick={()=>setActiveTabWithUrl(k)} style={{
                flex:1,padding:isMobile?"5px 0":"7px 0",borderRadius:7,border:"none",
                background:activeTab===k?T.purple:"transparent",
                color:activeTab===k?"#fff":T.faint,
                cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",gap:3,
              }}>
                {renderIcon(activeTab===k)}
                <span style={{fontSize:9,fontWeight:700,letterSpacing:0.5,textTransform:"uppercase",fontFamily:"monospace",opacity:activeTab===k?0.9:0.6}}>
                  {k==="games"?"Games":k==="map"?"Map":k==="daily"?"Daily":"Test"}
                </span>
              </button>
            ))}
          </div>

          {activeTab==="games" && <GamesTab T={T} />}

          {activeTab==="map" && <>
          {(() => {
            const ROW_H = 96;
            const NODE = (!isMobile) ? 60 : 52;
            const BANNER_H = 72; // height reserved for each section banner row
            const xFrac = (idx) => {
              const cycle = idx % 4;
              return cycle===0?0.22:cycle===1?0.5:cycle===2?0.78:0.5;
            };

            // Section definitions — banners appear BEFORE the first level in each section
            const SECTIONS = [
              { firstId:1,   label:"Foundations",     subtitle:"Home row, core keys, first speed targets",  color:"#10b981", icon:"F" },
              { firstId:16,  label:"Precision Flow",   subtitle:"Vocabulary, patterns, accuracy under pressure", color:"#818cf8", icon:"P" },
              { firstId:31,  label:"Word Power",       subtitle:"Medical, sports, mythology, compound mastery",  color:"#f59e0b", icon:"W" },
              { firstId:46,  label:"Keyboard Mastery", subtitle:"Spelling, rows, hand isolation, full sentences", color:"#06b6d4", icon:"K" },
              { firstId:61,  label:"Speed Surge",      subtitle:"Push WPM — sprint drills, patterns, grand mastery", color:"#facc15", icon:"S" },
              { firstId:66,  label:"Free Run",         subtitle:"No WPM targets — flow, fluency, exploration",      color:"#ec4899", icon:"R" },
              { firstId:100, label:"Century Club",     subtitle:"Level 100 and beyond — prestige territory",         color:"#ef4444", icon:"C" },
              { firstId:116, label:"Endurance",        subtitle:"Long-form sessions, rows, alternating, pinky work",  color:"#a855f7", icon:"E" },
              { firstId:131, label:"Literature",       subtitle:"Philosophy, scripture, Shakespeare, US history",     color:"#fbbf24", icon:"L" },
              { firstId:146, label:"Machine Mode",     subtitle:"Finger fury, code marathons, length-based gauntlets", color:"#f97316", icon:"M" },
              { firstId:156, label:"Legend Tier",      subtitle:"The final stretch — nine crowns and one last boss",          color:"#dc2626", icon:"X" },
            ];

            const sectionStartIds = new Set(SECTIONS.map(s => s.firstId));

            // Build layout: each level gets a y-position; banners insert extra height before their section's first level
            let rowItems = []; // { type:'banner'|'level', data, y }
            let y = 0;
            LEVELS.forEach((lv, idx) => {
              const sec = SECTIONS.find(s => s.firstId === lv.id);
              if (sec) {
                rowItems.push({ type:'banner', data:sec, y });
                y += BANNER_H;
              }
              rowItems.push({ type:'level', data:lv, idx, y });
              y += ROW_H;
            });
            const totalH = y + NODE;

            // SVG path only through level nodes
            const levelItems = rowItems.filter(r => r.type==='level');
            const pathD = levelItems.map((r,i) => {
              const x = xFrac(r.idx) * 100;
              const yc = r.y + NODE/2;
              return `${i===0?"M":"L"} ${x} ${yc}`;
            }).join(" ");
            const progressD = levelItems.slice(0, Math.max(highestUnlocked,1)).map((r,i) => {
              const x = xFrac(r.idx)*100, yc = r.y + NODE/2;
              return `${i===0?"M":"L"} ${x} ${yc}`;
            }).join(" ");

            return (
              <div style={{position:"relative",width:"100%",height:totalH,padding:"20px 0 60px"}}>
                <svg viewBox={`0 0 100 ${totalH}`} preserveAspectRatio="none" style={{position:"absolute",inset:0,width:"100%",height:"100%",pointerEvents:"none"}}>
                  <path d={pathD} fill="none" stroke={T.border} strokeWidth="0.6" vectorEffect="non-scaling-stroke"/>
                  <path d={progressD} fill="none" stroke={LEVELS.find(l=>l.id===currentLevel)?.color||T.purple} strokeWidth="0.8" strokeLinecap="round" vectorEffect="non-scaling-stroke" opacity={0.7}/>
                </svg>

                {rowItems.map((row, ri) => {
                  if (row.type === 'banner') {
                    const sec = row.data;
                    const sectionUnlocked = highestUnlocked >= sec.firstId;
                    const isCurrentSection = SECTIONS.find(s => s.firstId <= currentLevel) === sec ||
                      (SECTIONS.filter(s => s.firstId <= currentLevel).slice(-1)[0] === sec);
                    // scroll-to ref for skip button
                    const targetLevelItem = levelItems.find(r => r.data.id === sec.firstId);
                    return (
                      <div key={`sec-${sec.firstId}`} style={{
                        position:"absolute", top:row.y, left:0, right:0,
                        height:BANNER_H, display:"flex", alignItems:"center",
                        padding:"0 8px", zIndex:2,
                      }}>
                        {/* full-width banner bar */}
                        <div style={{
                          flex:1, height:48, borderRadius:12,
                          background:`linear-gradient(90deg, ${sec.color}18 0%, ${sec.color}08 100%)`,
                          border:`1.5px solid ${sec.color}${sectionUnlocked?"55":"22"}`,
                          display:"flex", alignItems:"center", gap:12, padding:"0 16px",
                          position:"relative", overflow:"hidden",
                        }}>
                          {/* left accent stripe */}
                          <div style={{position:"absolute",left:0,top:0,bottom:0,width:4,borderRadius:"12px 0 0 12px",background:sec.color,opacity:sectionUnlocked?0.9:0.3}}/>
                          {/* section badge */}
                          <div style={{
                            width:28,height:28,borderRadius:8,
                            background:sectionUnlocked?sec.color:sec.color+"33",
                            display:"flex",alignItems:"center",justifyContent:"center",
                            flexShrink:0, marginLeft:6,
                          }}>
                            <span style={{color:sectionUnlocked?"#fff":sec.color,fontWeight:900,fontSize:12,fontFamily:"monospace"}}>{sec.icon}</span>
                          </div>
                          {/* labels */}
                          <div style={{flex:1, minWidth:0}}>
                            <div style={{color:sectionUnlocked?sec.color:sec.color+"88",fontWeight:800,fontSize:13,letterSpacing:0.3,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{sec.label}</div>
                            <div style={{color:T.faint,fontSize:10,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis",opacity:0.8}}>{sec.subtitle}</div>
                          </div>
                          {/* skip-to button */}
                          {sectionUnlocked && (
                            <button onClick={()=>{
                              const el = document.getElementById(`lvl-${sec.firstId}`);
                              if(el) el.scrollIntoView({behavior:"smooth",block:"center"});
                            }} style={{
                              padding:"4px 10px",borderRadius:7,border:`1px solid ${sec.color}66`,
                              background:"transparent",color:sec.color,fontSize:10,fontWeight:700,
                              cursor:"pointer",fontFamily:"monospace",whiteSpace:"nowrap",flexShrink:0,
                            }}>Jump here</button>
                          )}
                          {!sectionUnlocked && (
                            <div style={{fontSize:10,color:T.faint,flexShrink:0,opacity:0.6}}>Locked</div>
                          )}
                        </div>
                      </div>
                    );
                  }

                  // ── Level node ──
                  const lv = row.data;
                  const idx = row.idx;
                  const unlocked=lv.id<=highestUnlocked,current=lv.id===currentLevel,completed=lv.id<highestUnlocked,locked=!unlocked,canSkipTo=lv.id===highestUnlocked+1;
                  const xPct = xFrac(idx)*100;
                  const topPx = row.y;
                  const IconComp = FOUNDATIONS_ICONS[lv.id]||PRECISION_FLOW_ICONS[lv.id]||WORD_POWER_ICONS[lv.id]||KEYBOARD_MASTERY_ICONS[lv.id]||SPEED_SURGE_ICONS[lv.id]||FREE_RUN_ICONS[lv.id]||CENTURY_CLUB_ICONS[lv.id]||ENDURANCE_ICONS[lv.id]||LITERATURE_ICONS[lv.id]||MACHINE_MODE_ICONS[lv.id]||LEGEND_TIER_ICONS[lv.id]||null;
                  return (
                    <div key={lv.id} id={`lvl-${lv.id}`} ref={current?currentLevelNodeRef:null} style={{position:"absolute",top:topPx,left:`${xPct}%`,transform:"translateX(-50%)",display:"flex",flexDirection:"column",alignItems:"center",zIndex:1}}>
                      <div onClick={()=>{
                          if(current||(!locked&&unlocked))requestStartLevel(lv.id);
                          else if(canSkipTo&&canUse(activeProfile,"skip")&&confirm(`Skip to Level ${lv.id}: ${lv.name}?

Custom challenge — 75%+ accuracy to unlock.`))requestStartLevel(lv.id,true,lv.id);
                        }} style={{width:NODE,height:NODE,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0,background:completed?lv.color+"22":current?lv.color+"33":locked?"#0a0a15":"#0d0d18",border:`3px solid ${completed?lv.color:current?lv.color:locked?"#1e1e30":"#2a2a3e"}`,boxShadow:current?`0 0 20px ${lv.color}77,0 0 40px ${lv.color}33`:"none",transition:"all 0.3s",position:"relative",cursor:locked&&!canSkipTo?"default":"pointer",opacity:locked&&!canSkipTo?0.45:1}}>
                        {locked
                          ? <svg width={Math.round(NODE*0.38)} height={Math.round(NODE*0.38)} viewBox="0 0 24 24" fill="none"><rect x="5" y="11" width="14" height="10" rx="2.5" fill="#2a2a3e"/><path d="M8 11V7.5a4 4 0 0 1 8 0V11" stroke="#3a3a5e" strokeWidth="2" strokeLinecap="round"/></svg>
                          : (IconComp ? React.createElement(IconComp, {size:Math.round(NODE*0.46), color:lv.color}) : lv.emoji)
                        }
                        {completed && <div style={{position:"absolute",bottom:-3,right:-3,width:16,height:16,borderRadius:"50%",background:lv.color,display:"flex",alignItems:"center",justifyContent:"center",border:"2px solid #0d0d18"}}><svg width="9" height="9" viewBox="0 0 10 10"><path d="M2 5.5L4.2 8 8 3" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none"/></svg></div>}
                        {current && <div style={{position:"absolute",inset:-6,borderRadius:"50%",border:`2px solid ${lv.color}44`}}/>}
                      </div>
                      <div style={{marginTop:6,maxWidth:128,textAlign:"center",pointerEvents:"none",overflowWrap:"break-word"}}>
                        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:4,marginBottom:1,flexWrap:"wrap"}}>
                          <span style={{color:T.faint,fontSize:fs(11),letterSpacing:0.5,fontWeight:600}}>Level {lv.id}</span>
                          {current&&<span style={{background:lv.color,color:"#fff",fontSize:fs(8),fontWeight:700,padding:"1px 5px",borderRadius:8}}>YOU</span>}
                          {canSkipTo&&<span style={{background:"#f59e0b22",color:"#f59e0b",fontSize:8,fontWeight:700,padding:"1px 5px",borderRadius:8}}>SKIP</span>}
                        </div>
                        <div style={{color:T.text,fontWeight:700,fontSize:12,lineHeight:1.3}}>{lv.name}</div>
                        {completed && (() => {
                          const lb = activeProfile?.levelBests?.[lv.id];
                          const s = Math.max(0, Math.min(3, lb?.stars || 1));
                          return <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:1,marginTop:3,color:lv.color,fontSize:10}}>
                            {[0,1,2].map(i => <IconStar key={i} size={11} color={lv.color} filled={i<s} />)}
                            {lb?.wpm>0 && <span style={{marginLeft:3}}>· {lb.wpm} WPM</span>}
                          </div>;
                        })()}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}
          <div style={{height:40}}/>
          </>}

          {activeTab==="daily" && <div style={{padding:"20px 0"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{color:T.text,fontWeight:800,fontSize:18,marginBottom:4}}>Daily Challenge</div>
              <div style={{color:T.muted,fontSize:13}}>New words every day — compete with everyone</div>
            </div>
            {!dailyWords&&<div style={{color:T.muted,textAlign:"center",padding:20}}>Loading…</div>}
            {dailyWords&&(dailyDone
              ?<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:20,textAlign:"center",marginBottom:16}}><div style={{color:T.accent2,fontWeight:700,fontSize:15,marginBottom:4}}>✓ Completed today!</div><div style={{color:T.muted,fontSize:12}}>Come back tomorrow for a new challenge.</div></div>
              :<button onClick={()=>requestStartLevel(-1)} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:T.purple,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:T.font,marginBottom:16}}>Start Daily Challenge →</button>
            )}

            {/* ── Leaderboard ── */}
            <div style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:10}}>Today's Leaderboard</div>
            {dailyBoard.length===0&&<div style={{color:T.faint,fontSize:13,textAlign:"center",padding:"20px 0"}}>No scores yet. Be first!</div>}
            {dailyBoard.map((s,i)=>(
              <div key={s.uid} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 14px",background:T.card,border:`1px solid ${T.border}`,borderRadius:8,marginBottom:6}}>
                <span style={{color:i<3?T.purple:T.faint,fontWeight:700,fontSize:13,width:20}}>#{i+1}</span>
                <span style={{color:T.text,fontSize:13,flex:1}}>@{s.username}</span>
                <span style={{color:T.purple,fontWeight:700,fontSize:13}}>{s.wpm} WPM</span>
                <span style={{color:T.accent2,fontSize:12}}>{s.accuracy}%</span>
              </div>
            ))}
          </div>}

          {activeTab==="test" && (
            <div style={{padding:"10px 0"}}>
              {/* Custom Word Lists */}
              <div style={{marginBottom:16}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10}}>
                  <span style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase"}}>Word Lists</span>
                  <button onClick={()=>{setListEditorIdx(null);setListEditorName("");setListEditorWords("");setShowListEditor(true);}} style={{background:T.purple,border:"none",borderRadius:6,color:"#fff",fontSize:11,fontWeight:700,padding:"4px 10px",cursor:"pointer",fontFamily:T.font}}>+ New List</button>
                </div>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:8}}>
                  <button onClick={()=>setActiveListIdx(null)} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${activeListIdx===null?T.purple:T.border}`,background:activeListIdx===null?T.purple+"22":"transparent",color:activeListIdx===null?T.purple:T.muted,fontSize:12,cursor:"pointer",fontFamily:T.font}}>
                    Default
                  </button>
                  {customLists.map((lst,i)=>(
                    <div key={i} style={{display:"flex",alignItems:"center",gap:2}}>
                      <button onClick={()=>setActiveListIdx(i)} style={{padding:"5px 12px",borderRadius:20,border:`1px solid ${activeListIdx===i?T.purple:T.border}`,background:activeListIdx===i?T.purple+"22":"transparent",color:activeListIdx===i?T.purple:T.muted,fontSize:12,cursor:"pointer",fontFamily:T.font}}>
                        {lst.name||"Untitled"} <span style={{opacity:.5,fontSize:10}}>({(lst.words||[]).length}w)</span>
                      </button>
                      <button onClick={()=>{setListEditorIdx(i);setListEditorName(lst.name||"");setListEditorWords((lst.words||[]).join("\n"));setShowListEditor(true);}} style={{background:"none",border:"none",color:T.faint,fontSize:11,cursor:"pointer",padding:"2px 4px"}}>✏️</button>
                    </div>
                  ))}
                </div>
                {/* List Editor */}
                {showListEditor && (
                  <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:14,marginBottom:12}}>
                    <div style={{color:T.text,fontSize:12,fontWeight:700,marginBottom:8}}>{listEditorIdx===null?"New List":"Edit List"}</div>
                    <input
                      placeholder="List name (e.g. Spanish vocab)"
                      value={listEditorName}
                      onChange={e=>setListEditorName(e.target.value)}
                      maxLength={30}
                      style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:7,color:T.text,fontFamily:T.font,fontSize:12,padding:"7px 10px",outline:"none",boxSizing:"border-box",marginBottom:8}}
                    />
                    <textarea
                      placeholder={"One word per line, or space-separated\nExamples:\nhola adios gracias\nOR\nhola\nadios\ngracias"}
                      value={listEditorWords}
                      onChange={e=>setListEditorWords(e.target.value)}
                      rows={6}
                      style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:7,color:T.text,fontFamily:T.font,fontSize:12,padding:"7px 10px",outline:"none",boxSizing:"border-box",resize:"vertical"}}
                    />
                    <div style={{color:T.faint,fontSize:10,marginTop:4,marginBottom:10}}>
                      {listEditorWords.trim().split(/[\s\n]+/).filter(Boolean).length} words
                    </div>
                    <div style={{display:"flex",gap:8}}>
                      <button onClick={()=>{
                        const words = listEditorWords.trim().split(/[\s\n]+/).filter(Boolean);
                        if(!listEditorName.trim()||words.length<2) return;
                        const newLists = [...customLists];
                        if(listEditorIdx===null) newLists.push({name:listEditorName.trim(),words});
                        else newLists[listEditorIdx]={name:listEditorName.trim(),words};
                        saveCustomLists(newLists);
                        if(listEditorIdx!==null) setActiveListIdx(listEditorIdx);
                        setShowListEditor(false);
                      }} style={{padding:"7px 16px",background:T.purple,border:"none",borderRadius:7,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>Save</button>
                      {listEditorIdx!==null && (
                        <button onClick={()=>{
                          const newLists=customLists.filter((_,i)=>i!==listEditorIdx);
                          saveCustomLists(newLists);
                          if(activeListIdx===listEditorIdx) setActiveListIdx(null);
                          setShowListEditor(false);
                        }} style={{padding:"7px 14px",background:"#ef444422",border:"1px solid #ef444444",borderRadius:7,color:"#ef4444",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>Delete</button>
                      )}
                      <button onClick={()=>setShowListEditor(false)} style={{padding:"7px 14px",background:"none",border:`1px solid ${T.border}`,borderRadius:7,color:T.muted,fontSize:12,cursor:"pointer",fontFamily:T.font}}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
              <TypingTest T={T} customWords={activeListIdx!==null&&customLists[activeListIdx]?customLists[activeListIdx].words:null} key={`${testMountKey}-${activeListIdx}`} />
            </div>
          )}

          <div style={{height:40}}/>
        </div>

        {showWeeklySummary && (() => {
          const sess = weeklySessions.filter(s => s.passed);
          const allSess = weeklySessions;
          const avgWpm = sess.length ? Math.round(sess.reduce((a,s)=>a+s.wpm,0)/sess.length) : 0;
          const bestWpm = sess.length ? Math.max(...sess.map(s=>s.wpm)) : 0;
          const avgAcc = sess.length ? Math.round(sess.reduce((a,s)=>a+s.accuracy,0)/sess.length) : 0;
          const levelsCompleted = new Set(sess.map(s=>s.level)).size;
          const totalSessions = allSess.length;
          // WPM by day of week
          const byDay = {};
          allSess.forEach(s => {
            if (!s.createdAt?.seconds) return;
            const d = new Date(s.createdAt.seconds*1000);
            const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
            if (!byDay[day]) byDay[day] = [];
            if (s.passed) byDay[day].push(s.wpm);
          });
          const days = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
          const dayAvgs = days.map(d => byDay[d] ? Math.round(byDay[d].reduce((a,b)=>a+b,0)/byDay[d].length) : 0);
          const maxBar = Math.max(...dayAvgs, 1);
          // WPM sparkline trend
          const wpmTrend = sess.slice(-10).map(s=>s.wpm);
          return (
            <div onClick={()=>setShowWeeklySummary(false)} style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1010,padding:20}}>
              <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,width:"100%",maxWidth:420}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                  <span style={{color:T.text,fontWeight:800,fontSize:16}}>📈 Weekly Summary</span>
                  <button onClick={()=>setShowWeeklySummary(false)} style={{background:"none",border:"none",color:T.faint,fontSize:20,cursor:"pointer"}}>×</button>
                </div>
                <div style={{color:T.faint,fontSize:11,marginBottom:16}}>
                  {new Date().toLocaleDateString("en-US",{month:"long",day:"numeric"})} week
                </div>

                {weeklyLoading ? (
                  <div style={{textAlign:"center",padding:"30px 0",color:T.muted}}>Loading…</div>
                ) : allSess.length === 0 ? (
                  <div style={{textAlign:"center",padding:"30px 0"}}>
                    <div style={{fontSize:36,marginBottom:8}}>😴</div>
                    <div style={{color:T.muted,fontSize:14}}>No sessions this week yet</div>
                    <div style={{color:T.faint,fontSize:12,marginTop:4}}>Start typing to see your stats!</div>
                  </div>
                ) : (<>
                  {/* Stat cards */}
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
                    {[
                      ["Best WPM", bestWpm, T.purple],
                      ["Avg WPM", avgWpm, T.accent],
                      ["Avg Accuracy", avgAcc+"%", T.accent2],
                      ["Levels Done", levelsCompleted, "#facc15"],
                    ].map(([l,v,c])=>(
                      <div key={l} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"12px 10px",textAlign:"center"}}>
                        <div style={{color:c,fontSize:22,fontWeight:800}}>{v}</div>
                        <div style={{color:T.faint,fontSize:10,marginTop:2}}>{l}</div>
                      </div>
                    ))}
                  </div>

                  {/* Bar chart by day */}
                  <div style={{marginBottom:16}}>
                    <div style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>WPM by Day</div>
                    <div style={{display:"flex",gap:4,alignItems:"flex-end",height:60}}>
                      {days.map((d,i)=>(
                        <div key={d} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                          <div style={{width:"100%",background:dayAvgs[i]>0?T.purple:T.border,borderRadius:"3px 3px 0 0",height:dayAvgs[i]>0?Math.max(4,Math.round((dayAvgs[i]/maxBar)*52)):3,transition:"height 0.4s ease"}}/>
                          <span style={{color:T.faint,fontSize:9}}>{d}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sessions count + encouragement */}
                  <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:"10px 14px",textAlign:"center"}}>
                    <span style={{color:T.text,fontSize:13}}>
                      {totalSessions} session{totalSessions!==1?"s":""} · {sess.length} passed
                      {bestWpm>=100?" 🔥 100+ WPM!":bestWpm>=60?" ⚡ Great speed!":bestWpm>=30?" 💪 Keep it up!":""}
                    </span>
                  </div>
                </>)}
              </div>
            </div>
          );
        })()}

        {showChallenges && (
          <div onClick={()=>setShowChallenges(false)} style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1010,padding:20}}>
            <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,width:"100%",maxWidth:440,maxHeight:"80vh",overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{color:T.text,fontWeight:800,fontSize:16}}>⚔️ Challenges</span>
                <button onClick={()=>setShowChallenges(false)} style={{background:"none",border:"none",color:T.faint,fontSize:20,cursor:"pointer"}}>×</button>
              </div>

              {isProfileRestricted(activeProfile) ? (
                <div style={{color:T.muted,fontSize:13,textAlign:"center",padding:"20px 10px",lineHeight:1.6}}>
                  Challenges aren't available for this profile.
                </div>
              ) : (<>
              {/* Send new challenge */}
              {canUse(activeProfile,"challenges") && friends.length > 0 && (
                <div style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:10,padding:12,marginBottom:14}}>
                  <div style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Challenge a Friend</div>
                  <SendChallengeForm
                    T={T} friends={friends} LEVELS={LEVELS} highestUnlocked={activeProfile?.highestUnlocked||1}
                    onSend={async(toFriend, levelId)=>{
                      const lv = LEVELS.find(l=>l.id===levelId);
                      await sendChallengeEx(user.uid, currentUsername, activeProfile.avatar||"key", toFriend.uid, toFriend.username, levelId, lv?.name||"");
                      getPendingChallenges(user.uid).then(setChallenges);
                      setChallengeMsg("Challenge sent! ⚔️");
                    }}
                    onSendGame={async(toFriend, gameMode)=>{
                      await sendChallengeEx(user.uid, currentUsername, activeProfile.avatar||"key", toFriend.uid, toFriend.username, null, null, gameMode);
                      getPendingChallenges(user.uid).then(setChallenges);
                      setChallengeMsg("Game challenge sent! 🪢");
                    }}
                  />
                  {challengeMsg && <div style={{color:T.accent2,fontSize:12,marginTop:6}}>{challengeMsg}</div>}
                </div>
              )}
              {friends.length === 0 && canUse(activeProfile,"challenges") && (
                <div style={{color:T.muted,fontSize:12,marginBottom:12,textAlign:"center"}}>Add friends first to send challenges</div>
              )}

              {/* Incoming challenges */}
              {challenges.filter(c=>c.toUid===user?.uid&&c.status==="pending").length > 0 && (
                <div style={{marginBottom:12}}>
                  <div style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Incoming</div>
                  {challenges.filter(c=>c.toUid===user?.uid&&c.status==="pending").map(c=>{
                    const isGame = !!c.gameMode;
                    const reachable = isGame || c.levelId <= (activeProfile?.highestUnlocked||1);
                    return (
                    <div key={c.id} style={{background:T.bg,border:"1px solid #ef444433",borderRadius:9,padding:"10px 12px",marginBottom:6}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                        <span style={{color:T.text,fontSize:13,fontWeight:700}}>@{c.fromUsername} challenged you!</span>
                        <span style={{color:T.faint,fontSize:10}}>{c.fromAvatar?AVATARS.find(a=>a.id===c.fromAvatar)?.e||"⌨️":"⌨️"}</span>
                      </div>
                      <div style={{color:T.muted,fontSize:12,marginBottom:8}}>{isGame ? "🪢 Tug of War" : `Level ${c.levelId}: ${c.levelName}`}</div>
                      {!reachable && (
                        <div style={{color:"#f59e0b",fontSize:11,marginBottom:8}}>You haven't unlocked this level yet — keep playing to reach it.</div>
                      )}
                      <div style={{display:"flex",gap:6}}>
                        {reachable ? (
                          <button onClick={async()=>{
                            setShowChallenges(false);
                            if (isGame) {
                              await startGameChallenge(c.id);
                              setActiveGameChallenge({ challengeId: c.id, gameMode: c.gameMode, isFromSide: false, opponentName: c.fromUsername, opponentUid: c.fromUid, user });
                              setScreenWithUrl("multiplayerGame");
                            } else {
                              setActiveChallengeId(c.id);
                              requestStartLevel(c.levelId);
                            }
                          }} style={{flex:1,padding:"7px",borderRadius:7,border:"none",background:isGame?"#10b981":"#ef4444",color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>{isGame?"🪢 Accept & Play":"⚔️ Accept & Play"}</button>
                        ) : (
                          <button disabled style={{flex:1,padding:"7px",borderRadius:7,border:"none",background:"#333",color:"#777",fontSize:12,fontWeight:700,cursor:"default",fontFamily:T.font}}>🔒 Locked</button>
                        )}
                        <button onClick={async()=>{await declineChallenge(c.id);getPendingChallenges(user.uid).then(setChallenges);}} style={{padding:"7px 12px",borderRadius:7,border:`1px solid ${T.border}`,background:"transparent",color:T.muted,fontSize:12,cursor:"pointer",fontFamily:T.font}}>Decline</button>
                      </div>
                    </div>
                  );})}
                </div>
              )}

              {/* Sent / completed */}
              {challenges.filter(c=>c.fromUid===user?.uid||c.status==="completed").length > 0 && (
                <div>
                  <div style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Recent</div>
                  {challenges.filter(c=>c.fromUid===user?.uid||c.status==="completed").slice(0,8).map(c=>{
                    const isSender = c.fromUid===user?.uid;
                    const myResult = isSender ? c.fromResult : c.toResult;
                    const theirResult = isSender ? c.toResult : c.fromResult;
                    const won = myResult&&theirResult&&myResult.wpm>theirResult.wpm;
                    const statusColor = c.status==="completed"?(won?"#34d399":"#ef4444"):c.status==="declined"?"#555":T.muted;
                    return (
                      <div key={c.id} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:9,padding:"10px 12px",marginBottom:6}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <span style={{color:T.text,fontSize:12}}>
                            {isSender ? `→ @${c.toUsername}` : `← @${c.fromUsername}`} · {c.gameMode ? "🪢 Tug of War" : `Lv ${c.levelId}`}
                          </span>
                          <span style={{color:statusColor,fontSize:11,fontWeight:700}}>
                            {c.status==="pending"?"⏳ Waiting":c.status==="accepted"?"🎮 In progress":c.status==="declined"?"❌ Declined":won?"🏆 Won":"💀 Lost"}
                          </span>
                        </div>
                        {c.status==="completed"&&myResult&&theirResult&&(
                          <div style={{display:"flex",gap:12,marginTop:6,fontSize:11,color:T.muted}}>
                            <span>You: <span style={{color:T.purple,fontWeight:700}}>{myResult.wpm} WPM</span></span>
                            <span>Them: <span style={{color:T.faint,fontWeight:700}}>{theirResult.wpm} WPM</span></span>
                          </div>
                        )}
                        {c.status==="accepted"&&c.gameMode&&isSender&&(
                          <button onClick={()=>{
                            setShowChallenges(false);
                            setActiveGameChallenge({ challengeId: c.id, gameMode: c.gameMode, isFromSide: true, opponentName: c.toUsername, opponentUid: c.toUid, user });
                            setScreenWithUrl("multiplayerGame");
                          }} style={{marginTop:6,width:"100%",padding:"6px",borderRadius:7,border:"none",background:"#10b981",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>🪢 Join Match</button>
                        )}
                        {c.status==="pending"&&!isSender&&(
                          <button onClick={async()=>{
                            setShowChallenges(false);
                            if (c.gameMode) {
                              await startGameChallenge(c.id);
                              setActiveGameChallenge({ challengeId: c.id, gameMode: c.gameMode, isFromSide: false, opponentName: c.fromUsername, opponentUid: c.fromUid, user });
                              setScreenWithUrl("multiplayerGame");
                            } else {
                              setActiveChallengeId(c.id);
                              requestStartLevel(c.levelId);
                            }
                          }} style={{marginTop:6,width:"100%",padding:"6px",borderRadius:7,border:"none",background:c.gameMode?"#10b981":"#ef4444",color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>{c.gameMode?"🪢 Play Now":"⚔️ Play Now"}</button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
              {challenges.length===0&&<div style={{color:T.muted,fontSize:12,textAlign:"center",padding:"20px 0"}}>No challenges yet</div>}
              </>)}
            </div>
          </div>
        )}

        {showFeedback && (
          <div onClick={()=>setShowFeedback(false)} style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1010,padding:20}}>
            <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,width:"100%",maxWidth:420}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{color:T.text,fontWeight:800,fontSize:16}}>💬 Feedback</span>
                <button onClick={()=>setShowFeedback(false)} style={{background:"none",border:"none",color:T.faint,fontSize:20,cursor:"pointer"}}>×</button>
              </div>
              {feedbackSent ? (
                <div style={{textAlign:"center",padding:"20px 0"}}>
                  <div style={{fontSize:36,marginBottom:8}}>🙏</div>
                  <div style={{color:T.text,fontWeight:700,fontSize:15,marginBottom:6}}>Thanks for your feedback!</div>
                  <div style={{color:T.muted,fontSize:13}}>We read every message.</div>
                  <button onClick={()=>{setShowFeedback(false);setFeedbackScreenshot(null);setFeedbackScreenshotName("");}} style={{marginTop:16,background:T.purple,border:"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:700,padding:"8px 20px",cursor:"pointer",fontFamily:T.font}}>Close</button>
                </div>
              ) : (
                <>
                  <div style={{color:T.muted,fontSize:13,marginBottom:12}}>AccuratKey is being built — tell us anything. Bug, idea, complaint, request. We're listening.</div>
                  <textarea
                    autoFocus
                    value={feedbackText}
                    onChange={e=>setFeedbackText(e.target.value)}
                    placeholder="Type anything here..."
                    rows={5}
                    style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:13,padding:"10px 12px",fontFamily:T.font,resize:"vertical",outline:"none",boxSizing:"border-box"}}
                  />
                  <input ref={feedbackFileRef} type="file" accept="image/*" style={{display:"none"}} onChange={async e=>{
                    const f=e.target.files[0];
                    if(!f) return;
                    try{
                      const dataUrl = await resizeToBase64(f, 1000);
                      setFeedbackScreenshot(dataUrl);
                      setFeedbackScreenshotName(f.name);
                    }catch(err){ console.error("Screenshot resize failed:", err); }
                  }} />
                  <input ref={feedbackCameraRef} type="file" accept="image/*" capture="environment" style={{display:"none"}} onChange={async e=>{
                    const f=e.target.files[0];
                    if(!f) return;
                    try{
                      const dataUrl = await resizeToBase64(f, 1000);
                      setFeedbackScreenshot(dataUrl);
                      setFeedbackScreenshotName(f.name||"Photo");
                    }catch(err){ console.error("Screenshot resize failed:", err); }
                  }} />
                  {feedbackScreenshot ? (
                    <div style={{display:"flex",alignItems:"center",gap:10,marginTop:10,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 10px"}}>
                      <img src={feedbackScreenshot} alt="Screenshot preview" style={{width:48,height:48,objectFit:"cover",borderRadius:6,border:`1px solid ${T.border}`}} />
                      <div style={{flex:1,color:T.muted,fontSize:11,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{feedbackScreenshotName||"Screenshot attached"}</div>
                      <button onClick={()=>{setFeedbackScreenshot(null);setFeedbackScreenshotName("");}} style={{background:"none",border:"none",color:T.faint,fontSize:16,cursor:"pointer",padding:"0 4px"}} title="Remove screenshot">×</button>
                    </div>
                  ) : (
                    <div style={{display:"flex",flexDirection:"column",gap:8,marginTop:10}}>
                      <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                        <button onClick={()=>feedbackFileRef.current?.click()} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,fontSize:12,padding:"7px 12px",cursor:"pointer",fontFamily:T.font,display:"flex",alignItems:"center",gap:6}}>
                          📎 Attach screenshot
                        </button>
                        {isMobile ? (
                          <button onClick={()=>feedbackCameraRef.current?.click()} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,fontSize:12,padding:"7px 12px",cursor:"pointer",fontFamily:T.font,display:"flex",alignItems:"center",gap:6}}>
                            📷 Use camera
                          </button>
                        ) : (
                          <button onClick={()=>startQrUpload("feedback")} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,fontSize:12,padding:"7px 12px",cursor:"pointer",fontFamily:T.font,display:"flex",alignItems:"center",gap:6}}>
                            📱 Use phone
                          </button>
                        )}
                      </div>
                      {qrListening && qrContext === "feedback" && (
                        <div style={{textAlign:"center",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"12px"}}>
                          <QRCanvas url={qrUrl} size={140} />
                          <p style={{color:T.faint,fontSize:10,wordBreak:"break-all",margin:"8px 0"}}>Scan with your phone to choose a photo</p>
                          <button onClick={cancelQr} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:6,color:T.faint,fontSize:11,padding:"4px 10px",cursor:"pointer",fontFamily:T.font}}>Cancel</button>
                        </div>
                      )}
                    </div>
                  )}
                  <div style={{display:"flex",justifyContent:"flex-end",marginTop:10,gap:8}}>
                    <button onClick={()=>{setShowFeedback(false);setFeedbackScreenshot(null);setFeedbackScreenshotName("");}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,fontSize:13,padding:"8px 16px",cursor:"pointer",fontFamily:T.font}}>Cancel</button>
                    <button disabled={!feedbackText.trim()||feedbackSending} onClick={async(e)=>{
                      e.stopPropagation();
                      if(!feedbackText.trim())return;
                      setFeedbackSending(true);
                      try{
                        const restricted = isProfileRestricted(activeProfile);
                        // COPPA: don't attach a child's real name or account
                        // username to a feedback record an admin can read.
                        // The report itself still goes through — uid/profileId
                        // are still useful for an admin to act on a bug report
                        // without exposing the profile's display name.
                        await submitFeedback(
                          user?.uid||null,
                          activeProfile?.id||null,
                          feedbackText.trim(),
                          restricted ? null : currentUsername,
                          restricted ? null : (activeProfile?.name||null),
                          feedbackScreenshot||null
                        );
                        setFeedbackSent(true);
                        setFeedbackScreenshot(null);
                        setFeedbackScreenshotName("");
                      } catch(err){
                        console.error("Feedback error:",err);
                        setFeedbackText(t => t + "\n\n[send failed — please screenshot and share]");
                      } finally{ setFeedbackSending(false); }
                    }} style={{background:feedbackText.trim()&&!feedbackSending?T.purple:"#444",border:"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:700,padding:"8px 20px",cursor:feedbackText.trim()&&!feedbackSending?"pointer":"default",fontFamily:T.font,opacity:feedbackSending?0.6:1}}>
                      {feedbackSending?"Sending…":"Send →"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {flaggedScorePopup && (
          <div onClick={()=>{setFlaggedScorePopup(null);setRestoreRequestSent(false);}} style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1012,padding:20}}>
            <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,width:"100%",maxWidth:380,textAlign:"center"}}>
              {restoreRequestSent ? (
                <>
                  <div style={{fontSize:32,marginBottom:8}}>📨</div>
                  <div style={{color:T.text,fontWeight:700,fontSize:15,marginBottom:6}}>Review requested</div>
                  <div style={{color:T.muted,fontSize:13,marginBottom:16}}>An admin will take a look. We'll restore it if it checks out.</div>
                  <button onClick={()=>{setFlaggedScorePopup(null);setRestoreRequestSent(false);}} style={{background:T.purple,border:"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:700,padding:"8px 20px",cursor:"pointer",fontFamily:T.font}}>Close</button>
                </>
              ) : (
                <>
                  <div style={{fontSize:32,marginBottom:8}}>🚩</div>
                  <div style={{color:T.text,fontWeight:700,fontSize:15,marginBottom:6}}>Score not added to leaderboard</div>
                  <div style={{color:T.muted,fontSize:13,marginBottom:16}}>Your {flaggedScorePopup.wpm} WPM result was unusually high and was automatically held back from the public leaderboard. If this was a genuine result, you can ask an admin to review it.</div>
                  <div style={{display:"flex",gap:8,justifyContent:"center"}}>
                    <button onClick={()=>{setFlaggedScorePopup(null);setRestoreRequestSent(false);}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,fontSize:13,padding:"8px 16px",cursor:"pointer",fontFamily:T.font}}>Dismiss</button>
                    <button onClick={async()=>{
                      try{
                        await requestScoreRestore(user.uid, { type:'daily', date: flaggedScorePopup.date }, `Player reports ${flaggedScorePopup.wpm} WPM is a genuine result.`);
                        setRestoreRequestSent(true);
                      }catch(e){ console.error("Restore request failed:", e); }
                    }} style={{background:T.purple,border:"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:700,padding:"8px 16px",cursor:"pointer",fontFamily:T.font}}>Request review</button>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {showCertificates && (
          <CertificateModal profile={activeProfile} T={T} onClose={()=>setShowCertificates(false)} />
        )}

        {showFriends && (
          <div onClick={()=>{setShowFriends(false);setFriendMsg("");}} style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1010,padding:20}}>
            <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,width:"100%",maxWidth:420,maxHeight:"80vh",overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{color:T.text,fontWeight:800,fontSize:16}}>👥 Friends</span>
                <button onClick={()=>{setShowFriends(false);setFriendMsg("");}} style={{background:"none",border:"none",color:T.faint,fontSize:20,cursor:"pointer"}}>×</button>
              </div>
              {isProfileRestricted(activeProfile) ? (
                <div style={{color:T.muted,fontSize:13,textAlign:"center",padding:"20px 10px",lineHeight:1.6}}>
                  Friends aren't available for this profile.
                </div>
              ) : (<>
              <div style={{display:"flex",alignItems:"center",gap:8,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 10px",marginBottom:16}}>
                <div style={{flex:1,overflow:"hidden"}}>
                  <div style={{color:T.faint,fontSize:9,letterSpacing:1,textTransform:"uppercase",marginBottom:1}}>Your Friend ID</div>
                  <div style={{color:T.text,fontSize:11,fontFamily:"monospace",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user?.uid}</div>
                </div>
                <button onClick={()=>{navigator.clipboard.writeText(user?.uid||"");setCopiedFriendId(true);setTimeout(()=>setCopiedFriendId(false),1500);}} title="Copy Friend ID" style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,color:copiedFriendId?T.accent2:T.muted,fontSize:12,padding:"6px 9px",cursor:"pointer",fontFamily:T.font,flexShrink:0}}>{copiedFriendId?"✓ Copied":"📋 Copy"}</button>
              </div>
              {friendReqs.length>0&&<>
                <div style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Requests</div>
                {friendReqs.map(r=>(
                  <div key={r.fromUid} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,marginBottom:6}}>
                    <span style={{color:T.text,fontSize:13,flex:1}}>@{r.fromUsername}</span>
                    <button onClick={async()=>{await acceptFriendRequest(user.uid,currentUsername,r.fromUid,r.fromUsername);const f=await getFriends(user.uid);setFriends(f);const rq=await getIncomingRequests(user.uid);setFriendReqs(rq);}} style={{padding:"5px 10px",background:T.purple,border:"none",borderRadius:6,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>✓</button>
                    <button onClick={async()=>{await declineFriendRequest(user.uid,r.fromUid);const rq=await getIncomingRequests(user.uid);setFriendReqs(rq);}} style={{padding:"5px 10px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:6,color:T.muted,fontSize:11,cursor:"pointer"}}>✕</button>
                  </div>
                ))}
              </>}
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:friendReqs.length?12:0,marginBottom:8}}>
                <span style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase"}}>Add Friend</span>
                <span style={{color:T.faint,fontSize:10}}>Requests: <button onClick={async()=>{const v=!activeProfile?.noFriendRequests;patchProfile({noFriendRequests:v});updateProfile(user.uid,activeProfile.id,{noFriendRequests:v});}} style={{background:"none",border:"none",color:activeProfile?.noFriendRequests?"#ef4444":T.accent2,fontSize:10,cursor:"pointer",fontFamily:T.font,padding:0,fontWeight:700}}>{activeProfile?.noFriendRequests?"OFF":"ON"}</button></span>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:8}}>
                <input value={friendSearch} onChange={e=>setFriendSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(async()=>{try{const res=await getUserByUsername(friendSearch.replace("@",""));if(!res)return setFriendMsg("User not found");await sendFriendRequest(user.uid,currentUsername,res.uid,friendSearch.replace("@","").toLowerCase());setFriendMsg("Request sent!");setFriendSearch("");}catch(e){setFriendMsg(e.message||"Error");}})()}  placeholder="@username" style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:T.font,fontSize:13,padding:"9px 12px",outline:"none"}}/>
                <button onClick={async()=>{try{const res=await getUserByUsername(friendSearch.replace("@",""));if(!res)return setFriendMsg("User not found");await sendFriendRequest(user.uid,currentUsername,res.uid,friendSearch.replace("@","").toLowerCase());setFriendMsg("Request sent!");setFriendSearch("");}catch(e){setFriendMsg(e.message||"Error");}}} style={{padding:"9px 14px",background:T.purple,border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>Add</button>
              </div>
              <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:14}}>
                <div style={{flex:1,height:1,background:T.border}}/>
                <span style={{color:T.faint,fontSize:9,letterSpacing:1,textTransform:"uppercase"}}>or by Friend ID</span>
                <div style={{flex:1,height:1,background:T.border}}/>
              </div>
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                <input value={friendIdInput} onChange={e=>setFriendIdInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(async()=>{const id=friendIdInput.trim();if(!id)return;try{const res=await getUserByUid(id);if(!res)return setFriendMsg("Friend ID not found");if(res.uid===user.uid)return setFriendMsg("That is your own Friend ID");await sendFriendRequest(user.uid,currentUsername,res.uid,res.username||"user");setFriendMsg("Request sent!");setFriendIdInput("");}catch(e){setFriendMsg(e.message||"Error");}})()} placeholder="Paste Friend ID" style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:T.font,fontSize:13,padding:"9px 12px",outline:"none"}}/>
                <button onClick={async()=>{const id=friendIdInput.trim();if(!id)return;try{const res=await getUserByUid(id);if(!res)return setFriendMsg("Friend ID not found");if(res.uid===user.uid)return setFriendMsg("That is your own Friend ID");await sendFriendRequest(user.uid,currentUsername,res.uid,res.username||"user");setFriendMsg("Request sent!");setFriendIdInput("");}catch(e){setFriendMsg(e.message||"Error");}}} style={{padding:"9px 14px",background:T.purple,border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>Add</button>
              </div>
              {friendMsg&&<div style={{color:T.accent2,fontSize:12,marginBottom:10}}>{friendMsg}</div>}
              <div style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Friends</div>
              {friends.length===0&&<div style={{color:T.faint,fontSize:13,textAlign:"center",padding:"16px 0"}}>No friends yet</div>}
              {friends.map(f=>(
                <div key={f.uid} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,marginBottom:6}}>
                  <span style={{color:T.text,fontSize:13,flex:1}}>@{f.username}</span>
                </div>
              ))}
              </>)}
            </div>
          </div>
        )}

        {showShop && (
          <div onClick={()=>{setShowShop(false);setShopMsg("");}} style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1010,padding:20}}>
            <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,width:"100%",maxWidth:420,maxHeight:"80vh",overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <span style={{color:T.text,fontWeight:800,fontSize:16}}>🛍️ Shop</span>
                <button onClick={()=>{setShowShop(false);setShopMsg("");}} style={{background:"none",border:"none",color:T.faint,fontSize:20,cursor:"pointer"}}>×</button>
              </div>
              <div style={{display:"flex",gap:6,marginBottom:14}}>
                {[["themes","🎨 Themes"],["sounds","🔊 Sounds"],["fonts","🔤 Fonts"]].map(([id,label])=>(
                  <button key={id} onClick={()=>{setShopTab(id);setShopMsg("");}} style={{flex:1,padding:"7px",borderRadius:8,border:`1px solid ${shopTab===id?T.purple:T.border}`,background:shopTab===id?T.purple+"22":"transparent",color:shopTab===id?T.purple:T.muted,fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>{label}</button>
                ))}
              </div>
              <div style={{color:T.muted,fontSize:12,marginBottom:16,display:"flex",alignItems:"center",gap:4}}>You have <strong style={{color:T.accent,display:"flex",alignItems:"center",gap:3}}>{formatKeys(activeProfile?.keys)} <KKey size={12}/></strong></div>
              {shopMsg&&<div style={{color:T.accent2,fontSize:12,marginBottom:12}}>{shopMsg}</div>}

              {shopTab==="themes" && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {SHOP_THEMES.map(th=>{
                  const owned=(activeProfile?.ownedThemes||[]).includes(th.id)||th.cost===0;
                  const active=activeProfile?.activeTheme===th.id||(th.id==="dark"&&!activeProfile?.activeTheme);const canCustomTheme=canUse(activeProfile,"customTheme");
                  const doBuyTheme=async()=>{
                    const prevKeys = activeProfile.keys||0;
                    const prevOwned = activeProfile.ownedThemes||[];
                    const prevActive = activeProfile.activeTheme;
                    const newKeys=prevKeys-th.cost;
                    if(newKeys<0){setShopMsg("Not enough Keys");return;}
                    patchProfile({keys:newKeys,ownedThemes:[...prevOwned,th.id],activeTheme:th.id});
                    setShopMsg(`${th.label} purchased!`);
                    try{
                      if(isProfileRestricted(activeProfile)){
                        updateProfileLocal(activeProfile.id,activeProfile,{keys:newKeys,ownedThemes:[...prevOwned,th.id],activeTheme:th.id});
                      }else{
                        await purchaseTheme(user.uid,activeProfile.id,th.id);
                        await setActiveTheme(user.uid,activeProfile.id,th.id);
                      }
                    }catch(e){
                      patchProfile({keys:prevKeys,ownedThemes:prevOwned,activeTheme:prevActive});
                      setShopMsg(e.message||"Purchase failed");
                    }
                  };
                  return (
                    <div key={th.id} style={{background:T.bg,border:`1px solid ${active?T.purple:T.border}`,borderRadius:10,padding:"12px",textAlign:"center"}}>
                      <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:4}}>{th.label}</div>
                      <div style={{color:T.faint,fontSize:11,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>{th.cost===0?"Free":<>{th.cost} <KKey size={10}/></>}</div>
                      {active?<div style={{color:T.purple,fontSize:11,fontWeight:700}}>Active</div>
                        :!canCustomTheme&&th.id!=="dark"?<div style={{color:T.faint,fontSize:11}}>🔒 Locked</div>
                        :owned?<button onClick={()=>{patchProfile({activeTheme:th.id});setShopMsg(`${th.label} activated!`);if(isProfileRestricted(activeProfile)){updateProfileLocal(activeProfile.id,activeProfile,{activeTheme:th.id});}else{setActiveTheme(user.uid,activeProfile.id,th.id);}}} style={{width:"100%",padding:"6px",background:"transparent",border:`1px solid ${T.purple}`,borderRadius:6,color:T.purple,fontSize:11,fontWeight:700,cursor:"pointer"}}>Equip</button>
                        :<button onClick={()=>setConfirmBuy({th,doBuy:doBuyTheme})} style={{width:"100%",padding:"6px",background:T.purple,border:"none",borderRadius:6,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Buy</button>
                      }
                    </div>
                  );
                })}
              </div>
              )}

              {shopTab==="sounds" && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {SHOP_SOUNDS.map(sd=>{
                  const owned=(activeProfile?.ownedSounds||[]).includes(sd.id)||sd.cost===0;
                  const active=activeProfile?.activeSound===sd.id||(sd.id==="default"&&!activeProfile?.activeSound);
                  const preview=()=>{ if(canUse(activeProfile,"sounds")) playSound("correct", sd.id); };
                  const doBuySound=async()=>{
                    const prevKeys = activeProfile.keys||0;
                    const prevOwned = activeProfile.ownedSounds||[];
                    const prevActive = activeProfile.activeSound;
                    const newKeys=prevKeys-sd.cost;
                    if(newKeys<0){setShopMsg("Not enough Keys");return;}
                    patchProfile({keys:newKeys,ownedSounds:[...prevOwned,sd.id],activeSound:sd.id});
                    setShopMsg(`${sd.label} purchased!`);
                    try{
                      if(isProfileRestricted(activeProfile)){
                        updateProfileLocal(activeProfile.id,activeProfile,{keys:newKeys,ownedSounds:[...prevOwned,sd.id],activeSound:sd.id});
                      }else{
                        await purchaseSound(user.uid,activeProfile.id,sd.id);
                        await setActiveSound(user.uid,activeProfile.id,sd.id);
                      }
                    }catch(e){
                      patchProfile({keys:prevKeys,ownedSounds:prevOwned,activeSound:prevActive});
                      setShopMsg(e.message||"Purchase failed");
                    }
                  };
                  return (
                    <div key={sd.id} style={{background:T.bg,border:`1px solid ${active?T.purple:T.border}`,borderRadius:10,padding:"12px",textAlign:"center"}}>
                      <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:4}}>{sd.label}</div>
                      <div style={{color:T.faint,fontSize:11,marginBottom:6,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>{sd.cost===0?"Free":<>{sd.cost} <KKey size={10}/></>}</div>
                      <button onClick={preview} style={{width:"100%",padding:"4px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:6,color:T.muted,fontSize:10,cursor:"pointer",marginBottom:6}}>🔊 Preview</button>
                      {active?<div style={{color:T.purple,fontSize:11,fontWeight:700}}>Active</div>
                        :owned?<button onClick={()=>{patchProfile({activeSound:sd.id});setShopMsg(`${sd.label} activated!`);if(isProfileRestricted(activeProfile)){updateProfileLocal(activeProfile.id,activeProfile,{activeSound:sd.id});}else{setActiveSound(user.uid,activeProfile.id,sd.id);}}} style={{width:"100%",padding:"6px",background:"transparent",border:`1px solid ${T.purple}`,borderRadius:6,color:T.purple,fontSize:11,fontWeight:700,cursor:"pointer"}}>Equip</button>
                        :<button onClick={()=>setConfirmBuy({th:sd,doBuy:doBuySound})} style={{width:"100%",padding:"6px",background:T.purple,border:"none",borderRadius:6,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Buy</button>
                      }
                    </div>
                  );
                })}
              </div>
              )}

              {shopTab==="fonts" && (
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {SHOP_FONTS.map(fd=>{
                  const owned=(activeProfile?.ownedFonts||[]).includes(fd.id)||fd.cost===0;
                  const active=activeProfile?.activeFont===fd.id||(fd.id==="default"&&!activeProfile?.activeFont);
                  const doBuyFont=async()=>{
                    const prevKeys = activeProfile.keys||0;
                    const prevOwned = activeProfile.ownedFonts||[];
                    const prevActive = activeProfile.activeFont;
                    const newKeys=prevKeys-fd.cost;
                    if(newKeys<0){setShopMsg("Not enough Keys");return;}
                    patchProfile({keys:newKeys,ownedFonts:[...prevOwned,fd.id],activeFont:fd.id});
                    setShopMsg(`${fd.label} purchased!`);
                    try{
                      if(isProfileRestricted(activeProfile)){
                        updateProfileLocal(activeProfile.id,activeProfile,{keys:newKeys,ownedFonts:[...prevOwned,fd.id],activeFont:fd.id});
                      }else{
                        await purchaseFont(user.uid,activeProfile.id,fd.id);
                        await setActiveFont(user.uid,activeProfile.id,fd.id);
                      }
                    }catch(e){
                      patchProfile({keys:prevKeys,ownedFonts:prevOwned,activeFont:prevActive});
                      setShopMsg(e.message||"Purchase failed");
                    }
                  };
                  return (
                    <div key={fd.id} style={{background:T.bg,border:`1px solid ${active?T.purple:T.border}`,borderRadius:10,padding:"12px",textAlign:"center"}}>
                      <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:4}}>{fd.label}</div>
                      <div style={{color:T.faint,fontSize:11,marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>{fd.cost===0?"Free":<>{fd.cost} <KKey size={10}/></>}</div>
                      {active?<div style={{color:T.purple,fontSize:11,fontWeight:700}}>Active</div>
                        :owned?<button onClick={()=>{patchProfile({activeFont:fd.id});setShopMsg(`${fd.label} activated!`);if(isProfileRestricted(activeProfile)){updateProfileLocal(activeProfile.id,activeProfile,{activeFont:fd.id});}else{setActiveFont(user.uid,activeProfile.id,fd.id);}}} style={{width:"100%",padding:"6px",background:"transparent",border:`1px solid ${T.purple}`,borderRadius:6,color:T.purple,fontSize:11,fontWeight:700,cursor:"pointer"}}>Equip</button>
                        :<button onClick={()=>setConfirmBuy({th:fd,doBuy:doBuyFont})} style={{width:"100%",padding:"6px",background:T.purple,border:"none",borderRadius:6,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Buy</button>
                      }
                    </div>
                  );
                })}
              </div>
              )}
            </div>
          </div>
        )}

        {confirmBuy && (
          <div style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1011,padding:20}} onClick={()=>setConfirmBuy(null)}>
            <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:24,width:"100%",maxWidth:320,textAlign:"center"}}>
              <div style={{color:T.text,fontWeight:700,fontSize:15,marginBottom:8}}>Confirm Purchase</div>
              <div style={{color:T.muted,fontSize:13,marginBottom:20,display:"flex",alignItems:"center",justifyContent:"center",gap:5,flexWrap:"wrap"}}>
                Spend <strong style={{color:T.accent,display:"flex",alignItems:"center",gap:3}}>{confirmBuy.th.cost} <KKey size={12}/></strong> on {confirmBuy.th.label}?
              </div>
              <div style={{display:"flex",gap:8}}>
                <button onClick={()=>{confirmBuy.doBuy();setConfirmBuy(null);}} style={{flex:1,padding:"10px",background:T.purple,border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:T.font}}>Confirm</button>
                <button onClick={()=>setConfirmBuy(null)} style={{flex:1,padding:"10px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:T.font}}>Cancel</button>
              </div>
            </div>
          </div>
        )}

        {pinModal && (
          <div style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1003,padding:20}}>
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:24,width:"100%",maxWidth:320,textAlign:"center"}}>
              <div style={{fontSize:28,marginBottom:8}}>🔒</div>
              <div style={{color:T.muted,fontSize:12,marginBottom:12}}>Enter parental PIN to {pinModal==="switch"?"switch profile":"sign out"}</div>
              <input type="password" maxLength={6} value={pinInput} onChange={e=>{setPinInput(e.target.value);setPinErr('');}} onKeyDown={e=>e.key==='Enter'&&handlePin()} autoFocus placeholder="••••" style={{width:"100%",background:T.faint,border:`1px solid ${pinErr?"#ef4444":T.border}`,borderRadius:8,color:T.text,fontFamily:T.font,fontSize:20,padding:"10px",outline:"none",textAlign:"center",letterSpacing:8,marginBottom:8,boxSizing:"border-box"}}/>
              {pinErr&&<div style={{color:"#ef4444",fontSize:11,marginBottom:8}}>{pinErr}</div>}
              <div style={{display:"flex",gap:8}}>
                <button onClick={handlePin} style={{flex:1,padding:"10px",background:T.purple,border:"none",borderRadius:8,color:"#fff",fontWeight:700,cursor:"pointer",fontFamily:T.font}}>OK</button>
                <button onClick={()=>setPinModal(null)} style={{padding:"10px 14px",background:"none",border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,cursor:"pointer",fontFamily:T.font}}>Cancel</button>
              </div>
            </div>
          </div>
        )}
        {/* Warning overlay */}
        {warning && (
          <div style={{position:"fixed",inset:0,background:"#00000099",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1001,padding:20}}>
            <div style={{background:"#0f0f1a",border:`1px solid #ef444466`,borderRadius:14,padding:24,width:"100%",maxWidth:380,textAlign:"center"}}>
              <div style={{fontSize:36,marginBottom:12}}>⚠️</div>
              <div style={{color:"#ef4444",fontWeight:700,fontSize:16,marginBottom:8}}>Warning from Admin</div>
              <div style={{color:"#e0e0ff",fontSize:13,marginBottom:20,lineHeight:1.6}}>{warning.message}</div>
              <button onClick={handleDismissWarning} style={{background:"#a78bfa",border:"none",borderRadius:9,color:"#fff",fontWeight:700,fontSize:14,padding:"11px 32px",cursor:"pointer",fontFamily:T.font}}>I understand</button>
            </div>
          </div>
        )}

        {/* Broadcast overlay - no dismiss, shows everywhere */}
        {broadcast && (
          <div style={{position:"fixed",bottom:20,left:"50%",transform:"translateX(-50%)",background:"#1e1e30",border:`1px solid ${T.purple}`,borderRadius:12,padding:"12px 20px",zIndex:1002,maxWidth:480,width:"90%",display:"flex",alignItems:"center",gap:12,pointerEvents:"none"}}>
            <span style={{fontSize:18}}>📢</span>
            <div style={{color:T.text,fontSize:13,flex:1}}>{broadcast.message}</div>
          </div>
        )}

        {/* Username prompt overlay */}
        {showUsernamePrompt && (
          <div style={{position:"fixed",inset:0,background:"#00000099",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
            <div style={{background:"#0f0f1a",border:"1px solid #1e1e30",borderRadius:14,padding:24,width:"100%",maxWidth:380}}>
              <div style={{fontSize:24,textAlign:"center",marginBottom:8}}>👋</div>
              <div style={{color:"#e0e0ff",fontWeight:700,fontSize:16,textAlign:"center",marginBottom:4}}>Choose your username</div>
              <div style={{color:"#6b7280",fontSize:12,textAlign:"center",marginBottom:20}}>Lowercase, letters/numbers/underscores only.</div>
              <input value={usernameInput} onChange={e=>{setUsernameInput(e.target.value);setUsernameError("");}} onKeyDown={e=>e.key==="Enter"&&handleClaimUsername()} placeholder="your_username" maxLength={20} autoFocus style={{width:"100%",background:"#1e1e30",border:"1px solid #2e2e44",borderRadius:8,color:"#e0e0ff",fontFamily:T.font,fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box",marginBottom:8}} />
              {usernameError && <div style={{color:"#ef4444",fontSize:11,marginBottom:8}}>{usernameError}</div>}
              <button onClick={handleClaimUsername} disabled={usernameLoading||!usernameInput.trim()} style={{width:"100%",padding:"11px",background:T.purple,border:"none",borderRadius:9,color:"#fff",fontWeight:700,fontSize:14,cursor:"pointer",fontFamily:T.font,opacity:usernameLoading?0.6:1}}>{usernameLoading?"Checking...":"Confirm"}</button>
            </div>
          </div>
        )}

        {/* Change username modal */}
        {showChangeUsername && (
          <div style={{position:"fixed",inset:0,background:"#00000099",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1000,padding:20}}>
            <div style={{background:"#0f0f1a",border:"1px solid #1e1e30",borderRadius:14,padding:24,width:"100%",maxWidth:380}}>
              <div style={{color:"#e0e0ff",fontWeight:700,fontSize:15,marginBottom:4}}>Change Username</div>
              <div style={{color:"#6b7280",fontSize:12,marginBottom:16,display:"flex",alignItems:"center",gap:4}}>Costs 5 <KKey size={11}/> Keys. Current: @{currentUsername}</div>
              <input value={newUsernameInput} onChange={e=>{setNewUsernameInput(e.target.value);setUsernameError("");}} onKeyDown={e=>e.key==="Enter"&&handleChangeUsername()} placeholder="new_username" maxLength={20} autoFocus style={{width:"100%",background:"#1e1e30",border:"1px solid #2e2e44",borderRadius:8,color:"#e0e0ff",fontFamily:T.font,fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box",marginBottom:8}} />
              {usernameError && <div style={{color:"#ef4444",fontSize:11,marginBottom:8}}>{usernameError}</div>}
              <div style={{display:"flex",gap:8}}>
                <button onClick={handleChangeUsername} disabled={usernameLoading||!newUsernameInput.trim()} style={{flex:1,padding:"10px",background:T.purple,border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:T.font,display:"flex",alignItems:"center",justifyContent:"center",gap:4}}>{usernameLoading?"...":<>Change (5 <KKey size={11}/>)</>}</button>
                <button onClick={()=>{setShowChangeUsername(false);setNewUsernameInput("");setUsernameError("");}} style={{padding:"10px 16px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,cursor:"pointer",fontFamily:T.font}}>Cancel</button>
              </div>
            </div>
          </div>
        )}

      </div>
    );
  }

  if (screen === "game") {
    const current = lines[lineIdx] || "";
    const progress = (lineIdx / TOTAL_LINES) * 100;
    const lv = LEVELS.find(l => l.id === playingLevel) || LEVELS[0];
    const lvWords = levelOverrides[String(playingLevel)] || lv.words;

    const Keyboard = () => {
      const nextChar = current[typed.length] || null;
      const maxErr = Math.max(1, ...Object.values(keyMistakes));
      const hasAnyMistakes = Object.keys(keyMistakes).length > 0;
      return (
        <div style={{width:"100%",maxWidth:isMobile?660:980,background:"#0d0d1a",border:"1px solid #1e1e30",borderRadius:14,padding:14,marginTop:12}}>
          <div style={{display:"flex",justifyContent:"flex-end",alignItems:"center",marginBottom:8,gap:6}}>
            {showHeatmap && hasAnyMistakes && (
              <div style={{display:"flex",alignItems:"center",gap:4,fontSize:9,color:"#666"}}>
                <span>few</span>
                {[0.15,0.35,0.55,0.75,1].map(v => (
                  <div key={v} style={{width:10,height:10,borderRadius:2,background:`rgba(239,68,68,${v})`}} />
                ))}
                <span>many</span>
              </div>
            )}
            <button onClick={e=>{e.stopPropagation();setShowHeatmap(h=>!h);}} style={{background:showHeatmap?"#ef4444":"#1a1a2e",border:`1px solid ${showHeatmap?"#ef4444":"#2a2a3e"}`,borderRadius:6,color:showHeatmap?"#fff":"#666",fontSize:10,padding:"2px 7px",cursor:"pointer",fontWeight:700,letterSpacing:0.5}}>
              {showHeatmap?"🔥 HEAT":"🔥 OFF"}
            </button>
          </div>
          {layout.rows.map((row, ri) => (
            <div key={ri} style={{display:"flex",justifyContent:"center",gap:4,marginBottom:4,paddingLeft:ri===1?10:ri===2?18:0}}>
              {row.map(k => {
                const finger = keyFinger[k];
                const color = FC[finger] || "#444";
                const isActive = activeKey === k;
                const isNext = nextChar === k;
                const errCount = keyMistakes[k] || 0;
                const heatIntensity = showHeatmap && errCount > 0 ? errCount / maxErr : 0;
                const heatBg = heatIntensity > 0
                  ? `rgba(239,68,68,${Math.min(0.85, heatIntensity * 0.7 + 0.15)})`
                  : null;
                const baseBg = isActive ? color : isNext ? color+"33" : "#1a1a2e";
                const finalBg = (!isActive && !isNext && heatBg) ? heatBg : baseBg;
                return (
                  <div key={k} title={showHeatmap && errCount > 0 ? `${k.toUpperCase()}: ${errCount} error${errCount>1?"s":""}` : undefined} style={{width:38,height:38,borderRadius:7,background:finalBg,border:isNext?`1px solid ${color}88`:"1px solid #2a2a3e",borderBottom:`3px solid ${isActive?color+"88":"#111"}`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",color:isActive?"#000":isNext?color:heatIntensity>0.4?"#fff":color+"99",fontSize:11,fontWeight:700,position:"relative",transition:"background 0.08s"}}>
                    {k.toUpperCase()}
                    {layout.bumps.includes(k) && <div style={{width:4,height:3,borderRadius:2,background:isActive?"#000":color,position:"absolute",bottom:3}} />}
                    {showHeatmap && errCount > 0 && (
                      <div style={{position:"absolute",top:1,right:2,fontSize:7,color:"#ffcdd2",fontWeight:900,lineHeight:1}}>{errCount}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          <div style={{display:"flex",justifyContent:"center",marginTop:4}}>
            <div style={{width:240,height:28,borderRadius:7,background:activeKey===" "?"#94a3b8":"#1a1a2e",border:"1px solid #2a2a3e",borderBottom:"3px solid #111",display:"flex",alignItems:"center",justifyContent:"center",color:activeKey===" "?"#000":"#444",fontSize:9,fontWeight:700,letterSpacing:2}}>SPACE</div>
          </div>
        </div>
      );
    };

    return (
      <div onClick={() => inputRef.current?.focus()} style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",padding:"20px 12px",fontFamily:T.font,userSelect:"none"}}>
        <div style={{width:"100%",maxWidth:isMobile?660:980,marginBottom:8}}><Nav /></div>
        <div style={{width:"100%",maxWidth:isMobile?660:980,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>{lv.emoji}</span>
            <div>
              <div style={{color:T.text,fontWeight:700,fontSize:14}}>{lv.name}</div>
              {isSkipChallenge && <div style={{color:"#f59e0b",fontSize:11}}>⚡ Skip challenge — custom hard words — pass to unlock Level {skipTargetLevel}</div>}
            </div>
          </div>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            {canUse(activeProfile,"wpmLive") && <span style={{color:T.purple,fontWeight:700,fontSize:14,display:"flex",alignItems:"center",gap:6}}>{wpm} WPM</span>}
            {canUse(activeProfile,"accuracyLive") && <span style={{color:T.accent2,fontWeight:700,fontSize:14}}>{accuracy}%</span>}
            {canUse(activeProfile,"combo") && combo > 1 && <span style={{color:T.accent,fontWeight:700,fontSize:13}}>×{combo}{combo>=20?" 🔥🔥":combo>=10?" 🔥":""}</span>}
            <span style={{color:T.faint,fontSize:12}}>{lineIdx}/{TOTAL_LINES}</span>
          </div>
        </div>
        {canUse(activeProfile,"progressBar") && <div style={{width:"100%",maxWidth:isMobile?660:980,height:4,background:"#1a1a2e",borderRadius:2,marginBottom:14}}>
          <div style={{height:"100%",background:lv.color,borderRadius:2,width:progress+"%",transition:"width 0.3s"}} />
        </div>}
        <div style={{width:"100%",maxWidth:isMobile?660:980,background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"20px 24px",marginBottom:12}}>
          {lines[lineIdx+1] && <div style={{fontSize:14,letterSpacing:1,marginBottom:10,color:"#2a2a3a",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",fontFamily:T.font}}>{lines[lineIdx+1]}</div>}
          <div style={{fontSize:20,letterSpacing:2,display:"flex",flexWrap:"wrap",lineHeight:1.8,fontFamily:T.font}}>
            {current.split("").map((ch,ci) => {
              let color=T.faint, underline="2px solid transparent";
              if (ci < typed.length) color = typed[ci]===ch ? T.accent2 : "#ef4444";
              else if (ci === typed.length) { color=T.purple; underline=`2px solid ${T.purple}`; }
              return <span key={ci} style={{color, borderBottom: underline, background: "transparent"}}>{ch}</span>;
            })}
          </div>
        </div>
        <input ref={inputRef} value={typed} onChange={handleType} onKeyDown={e=>{ if(e.key==="Backspace") e.preventDefault();}} style={{position:"absolute",opacity:0,pointerEvents:"none"}} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
        {canUse(activeProfile,"keyboard") && <Keyboard />}
        <button onClick={() => setScreenWithUrl("levelMap")} style={{marginTop:20,background:"none",border:"none",color:T.faint,fontSize:12,cursor:"pointer",fontFamily:T.font}}>
          ← Back to map
        </button>
      </div>
    );
  }

  if (screen === "result" && resultData) {
    const lv = LEVELS.find(l => l.id === resultData.level) || LEVELS[0];
    const { passed, wpm: rWpm, accuracy: rAcc, isSkipChallenge: rSkip } = resultData;
    const worstKeys = Object.entries(keyMistakes).sort((a,b) => b[1]-a[1]).slice(0,5);
    const stars = rAcc >= 95 ? 3 : (lv && rWpm >= lv.wpmTarget && lv.wpmTarget > 0) ? 2 : 1;

    const downloadCertificate = () => {
      const W = 1200, H = 720;
      const DPR = window.devicePixelRatio || 2;
      const canvas = document.createElement("canvas");
      canvas.width = W * DPR; canvas.height = H * DPR;
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      const ctx = canvas.getContext("2d");
      ctx.scale(DPR, DPR);

      // Background gradient
      const grad = ctx.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0d0b1e");
      grad.addColorStop(1, "#0a0a0f");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, W, H);

      // Decorative corner accents
      const drawCorner = (x, y, dx, dy) => {
        ctx.strokeStyle = "#7c6af7";
        ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(x, y + dy*30); ctx.lineTo(x, y); ctx.lineTo(x + dx*30, y); ctx.stroke();
      };
      drawCorner(24, 24, 1, 1); drawCorner(W-24, 24, -1, 1);
      drawCorner(24, H-24, 1, -1); drawCorner(W-24, H-24, -1, -1);

      // Outer border
      ctx.strokeStyle = "#7c6af733";
      ctx.lineWidth = 1;
      ctx.strokeRect(30, 30, W-60, H-60);

      // Header badge
      ctx.fillStyle = "#7c6af711";
      ctx.beginPath(); ctx.roundRect(W/2 - 90, 44, 180, 30, 15); ctx.fill();
      ctx.strokeStyle = "#7c6af733"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = "#a78bfa";
      ctx.font = "bold 12px 'JetBrains Mono', monospace";
      ctx.textAlign = "center";
      ctx.fillText("⌨  ACCURATKEY", W/2, 65);

      // Title
      ctx.fillStyle = "#e0e0ff";
      ctx.font = "bold 42px 'JetBrains Mono', monospace";
      ctx.fillText("Certificate of Completion", W/2, 140);

      // Divider with glow
      const divGrad = ctx.createLinearGradient(100, 0, W-100, 0);
      divGrad.addColorStop(0, "transparent");
      divGrad.addColorStop(0.5, "#7c6af755");
      divGrad.addColorStop(1, "transparent");
      ctx.strokeStyle = divGrad;
      ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(100, 162); ctx.lineTo(W-100, 162); ctx.stroke();

      // Certifies that
      ctx.fillStyle = "#4a4870";
      ctx.font = "16px 'JetBrains Mono', monospace";
      ctx.fillText("This certifies that", W/2, 205);

      // Name
      const profileName = activeProfile?.name || currentUsername || "Typist";
      ctx.fillStyle = "#fb923c";
      ctx.font = "bold 36px 'JetBrains Mono', monospace";
      ctx.fillText(profileName, W/2, 255);

      // Successfully completed
      ctx.fillStyle = "#4a4870";
      ctx.font = "16px 'JetBrains Mono', monospace";
      ctx.fillText("successfully completed", W/2, 295);

      // Level chip
      ctx.fillStyle = (lv.color || "#7c6af7") + "22";
      const lvText = `${lv.emoji}  Level ${lv.id}: ${lv.name}`;
      ctx.font = "bold 26px 'JetBrains Mono', monospace";
      const lvW = ctx.measureText(lvText).width + 40;
      ctx.beginPath(); ctx.roundRect(W/2 - lvW/2, 318, lvW, 44, 22); ctx.fill();
      ctx.strokeStyle = (lv.color || "#7c6af7") + "55"; ctx.lineWidth = 1; ctx.stroke();
      ctx.fillStyle = lv.color || "#7c6af7";
      ctx.fillText(lvText, W/2, 348);

      // Stats row
      const stats = [
        { label: "WPM", value: String(rWpm), color: "#7c6af7" },
        { label: "Accuracy", value: rAcc + "%", color: "#34d399" },
      ];
      const statsTop = 390;
      const colW = (W - 200) / stats.length;
      stats.forEach((s, i) => {
        const x = 100 + colW * i + colW / 2;
        ctx.fillStyle = "#13131f";
        ctx.beginPath(); ctx.roundRect(x - colW/2 + 10, statsTop, colW - 20, 88, 12); ctx.fill();
        ctx.strokeStyle = "#1e1e30"; ctx.lineWidth = 1; ctx.stroke();
        ctx.fillStyle = s.color;
        ctx.font = `bold 34px 'JetBrains Mono', monospace`;
        ctx.fillText(s.value, x, statsTop + 52);
        ctx.fillStyle = "#444";
        ctx.font = "13px 'JetBrains Mono', monospace";
        ctx.fillText(s.label, x, statsTop + 74);
      });

      // Bottom divider
      ctx.strokeStyle = divGrad;
      ctx.beginPath(); ctx.moveTo(100, 502); ctx.lineTo(W-100, 502); ctx.stroke();

      // Date + footer
      const dateStr = new Date().toLocaleDateString("en-US", { year:"numeric", month:"long", day:"numeric" });
      ctx.fillStyle = "#3a3860";
      ctx.font = "14px 'JetBrains Mono', monospace";
      ctx.fillText(dateStr, W/2, 535);
      ctx.fillStyle = "#252545";
      ctx.font = "12px 'JetBrains Mono', monospace";
      ctx.fillText("accuratkey.vercel.app", W/2, 560);

      // Download
      const a = document.createElement("a");
      a.download = `accuratkey-level${lv.id}-certificate.png`;
      a.href = canvas.toDataURL("image/png");
      a.click();
    };

    return (
      <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:T.font,padding:20}}>
        {showConfetti && passed && <Confetti sectionName={sectionUnlockName} />}
        <div style={{width:"100%",maxWidth:isMobile?460:760,textAlign:"center"}}>
          <div style={{fontSize:64,marginBottom:10}}>{passed ? "🎉" : "💪"}</div>
          <h2 style={{color:T.text,fontSize:28,fontWeight:800,margin:0}}>
            {passed ? (rSkip ? "Level Skipped!" : "Level Complete!") : "Not quite!"}
          </h2>
          <p style={{color:T.muted,fontSize:14,marginTop:6,marginBottom:20}}>{lv.emoji} {lv.name}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {[["WPM",rWpm,T.purple],["Accuracy",rAcc+"%",T.accent2],["Target",(lv.wpmTarget>0?lv.wpmTarget+" WPM":"—")+" / "+accuracyTarget+"%",passed?T.accent2:"#ef4444"],["Keys Earned","+"+(keysEarned||0)+(combo>=20?" (2× combo!)":combo>=10?" (1.5× combo!)":""),T.accent]].map(([l,v,c]) => (
              <div key={l} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:"14px 10px"}}><div style={{color:c,fontSize:26,fontWeight:800}}>{v}</div><div style={{color:T.faint,fontSize:11,marginTop:3}}>{l}</div></div>
            ))}
          </div>
          {passed && user && (
            <div style={{background:T.purple+"22",border:`1px solid ${T.purple}55`,borderRadius:10,padding:"10px 16px",marginBottom:14,fontSize:13,color:T.text}}>✓ Progress saved! <KKey size={13} style={{margin:"0 2px"}}/> {activeProfile?.keys || 0}</div>
          )}
          {passed && !user && (
            <div style={{background:"#1a1030",border:`1px solid ${T.purple}44`,borderRadius:10,padding:"12px 16px",marginBottom:14,fontSize:13,color:T.muted,textAlign:"left"}}>
              <div style={{color:T.text,fontWeight:700,marginBottom:4}}>Sign in to save your progress</div>
              <div style={{marginBottom:10,fontSize:12}}>Your results aren't saved yet.</div>
              <button onClick={() => setScreenWithUrl("auth")} style={{background:T.purple,border:"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:700,padding:"8px 18px",cursor:"pointer",fontFamily:T.font}}>
                Sign in / Sign up
              </button>
            </div>
          )}
          {worstKeys.length > 0 && (
            <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:10,padding:14,marginBottom:14,textAlign:"left"}}>
              <p style={{color:T.faint,fontSize:10,marginBottom:8,letterSpacing:1,textTransform:"uppercase"}}>Practice these keys</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {worstKeys.map(([k,n]) => (
                  <span key={k} style={{background:"#1a0a0a",border:"1px solid #ef444444",borderRadius:6,padding:"5px 10px",color:"#ef4444",fontSize:13,fontWeight:700}}>{k.toUpperCase()} <span style={{fontSize:10,opacity:.7}}>×{n}</span></span>
                ))}
              </div>
            </div>
          )}
          <div style={{display:"flex",gap:8}}>
            <button onClick={() => requestStartLevel(resultData.level)}
              style={{flex:1,padding:14,borderRadius:10,border:"none",background:T.purple,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>
              {passed ? "Play Again" : "Try Again"}
            </button>
            <button onClick={() => setScreenWithUrl("levelMap")}
              style={{flex:1,padding:14,borderRadius:10,border:`1px solid ${T.border}`,background:"transparent",color:T.muted,fontSize:14,cursor:"pointer",fontFamily:T.font}}>
              Level Map
            </button>
          </div>
          {passed && resultData.level < LEVELS.length && (
            <button onClick={() => requestStartLevel(resultData.level + 1)}
              style={{width:"100%",marginTop:10,padding:14,borderRadius:10,border:"none",background:lv.color,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>
              Next Level →
            </button>
          )}
          {passed && (
            <button onClick={downloadCertificate}
              style={{width:"100%",marginTop:10,padding:12,borderRadius:10,border:`1px solid ${T.purple}55`,background:T.purple+"18",color:T.purple,fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:T.font}}>
              🏆 Download Certificate
            </button>
          )}
        </div>
      </div>
    );
  }

  return null;
}
