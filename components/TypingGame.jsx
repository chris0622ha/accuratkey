"use client";
import TypingTest from "./TypingTest";
import { useState, useEffect, useRef, useCallback } from "react";
import { onAuthStateChanged, signOut, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider, GithubAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword, deleteUser } from "firebase/auth";
import { auth, getAccount, createAccount, getProfiles, getProfile, createProfile, updateProfile, deleteProfile, saveSession, getRecentSessions, calcAge, isBirthdayToday, checkAndUpdateBirthday, createPhotoUploadToken, listenForPhotoUpload, deletePhotoUploadToken, getBan, claimUsername, changeUsername, getUsername, checkUsernameAvailable, getMaintenanceMode, logActivity, getWarning, clearWarning, getBroadcast, getLevelOverrides, updateStreak, getFriends, getIncomingRequests, getUserByUsername, sendFriendRequest, acceptFriendRequest, declineFriendRequest, getDailyChallenge, submitDailyScore, getDailyLeaderboard, purchaseTheme, setActiveTheme, purchaseFont, setActiveFont } from "@/lib/firebase";

export 
// ─── Custom Date Picker ───────────────────────────────────────────────────────
function DatePicker({ value, onChange, T }) {
  const today = new Date();
  const minYear = today.getFullYear() - 120;
  const maxYear = today.getFullYear();
  const parsed = value ? new Date(value + "T12:00:00") : null;
  const [month, setMonth] = React.useState(parsed ? parsed.getMonth() : today.getMonth());
  const [year, setYear] = React.useState(parsed ? parsed.getFullYear() : today.getFullYear());
  const [open, setOpen] = React.useState(false);

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const FULL_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
  const years = Array.from({length: maxYear - minYear + 1}, (_,i) => maxYear - i);

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDay = new Date(year, month, 1).getDay();
  const days = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const select = (d) => {
    const mm = String(month+1).padStart(2,"0");
    const dd = String(d).padStart(2,"0");
    const v = `${year}-${mm}-${dd}`;
    const picked = new Date(v+"T12:00:00");
    if (picked > today) return;
    onChange(v);
    setOpen(false);
  };

  const isSelected = (d) => {
    if (!parsed || !d) return false;
    return parsed.getFullYear()===year && parsed.getMonth()===month && parsed.getDate()===d;
  };
  const isFuture = (d) => {
    if (!d) return false;
    const dt = new Date(year, month, d);
    return dt > today;
  };

  const displayStr = parsed
    ? `${FULL_MONTHS[parsed.getMonth()]} ${parsed.getDate()}, ${parsed.getFullYear()}`
    : "Select birthday";

  return (
    <div style={{position:"relative",marginBottom:18,userSelect:"none"}}>
      <button onClick={()=>setOpen(o=>!o)} style={{width:"100%",background:T.bg,border:`1px solid ${open?T.purple:T.border}`,borderRadius:8,color:parsed?T.text:T.faint,fontFamily:T.font,fontSize:14,padding:"10px 14px",cursor:"pointer",textAlign:"left",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span>{displayStr}</span>
        <span style={{fontSize:10,color:T.muted}}>{open?"▲":"▼"}</span>
      </button>
      {open && (
        <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:T.card,border:`1px solid ${T.border}`,borderRadius:12,zIndex:500,padding:14,boxShadow:"0 8px 32px rgba(0,0,0,0.5)"}}>
          {/* Month/Year selectors */}
          <div style={{display:"flex",gap:6,marginBottom:12}}>
            <select value={month} onChange={e=>{setMonth(Number(e.target.value));}} style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontFamily:T.font,fontSize:12,padding:"5px 8px",cursor:"pointer"}}>
              {MONTHS.map((m,i)=><option key={i} value={i}>{m}</option>)}
            </select>
            <select value={year} onChange={e=>setYear(Number(e.target.value))} style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:6,color:T.text,fontFamily:T.font,fontSize:12,padding:"5px 8px",cursor:"pointer"}}>
              {years.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          {/* Day of week header */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2,marginBottom:4}}>
            {["S","M","T","W","T","F","S"].map((d,i)=>(
              <div key={i} style={{textAlign:"center",fontSize:10,color:T.faint,fontWeight:700,padding:"2px 0"}}>{d}</div>
            ))}
          </div>
          {/* Days grid */}
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gap:2}}>
            {days.map((d,i)=>(
              <button key={i} onClick={()=>d&&!isFuture(d)&&select(d)} disabled={!d||isFuture(d)} style={{padding:"6px 0",borderRadius:6,border:"none",background:isSelected(d)?T.purple:"transparent",color:isSelected(d)?"#fff":isFuture(d)?"#333":d?T.text:"transparent",fontSize:12,cursor:d&&!isFuture(d)?"pointer":"default",fontFamily:T.font,fontWeight:isSelected(d)?700:400}}>
                {d||""}
              </button>
            ))}
          </div>
          {/* Quick nav */}
          <div style={{display:"flex",justifyContent:"space-between",marginTop:10,paddingTop:8,borderTop:`1px solid ${T.border}`}}>
            <button onClick={()=>{const p=month===0?{m:11,y:year-1}:{m:month-1,y:year};if(p.y>=minYear){setMonth(p.m);setYear(p.y);}}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,color:T.muted,fontSize:11,padding:"3px 10px",cursor:"pointer",fontFamily:T.font}}>‹ Prev</button>
            <button onClick={()=>{setMonth(today.getMonth());setYear(today.getFullYear());}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,color:T.muted,fontSize:11,padding:"3px 10px",cursor:"pointer",fontFamily:T.font}}>Today</button>
            <button onClick={()=>{const n=month===11?{m:0,y:year+1}:{m:month+1,y:year};if(n.y<=maxYear){setMonth(n.m);setYear(n.y);}}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,color:T.muted,fontSize:11,padding:"3px 10px",cursor:"pointer",fontFamily:T.font}}>Next ›</button>
          </div>
        </div>
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
  { id:13, name:"Lightning Fingers",     emoji:"⚡", wpmTarget:70,  accuracy:75, color:"#facc15", words:["weholdthesetruthstobeselfevident","inthemiddleofeverydifficultyliesopportunity","successisnotfinalfailureisnotfatal","youmissonehandredpercentoftheshotsyoudontake","thebesttimetoplantatreewastwentyyearsago"] },
  { id:14, name:"Speed Demon",           emoji:"👹", wpmTarget:80,  accuracy:75, color:"#f43f5e", words:["tobeornottobethatisthequestion","allthatglittersisnotgold","thereisnothingeithergoodorbadbutthinkingmakesitso","itwasabrightcoldday","thecourseoftrueloveneverranunsmoothly"] },
  { id:15, name:"Legend",                emoji:"🏆", wpmTarget:90,  accuracy:75, color:"#fbbf24", words:["itwasthebestoftimesitwastheworstoftimes","asknotwhatyourcountrycandoforyouaskwhatyoucandoforyourcountry","fourscoreandsevenyearsagoourforefathersbroughtforthuponthiscontinent","onesmallstepformanonegiantleapformankind","donotgogentleintothatgoodnightrageinagethedyingofthelight"] },


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

const KKey=({size=16,style={}})=>(<svg width={size} height={size*1.1} viewBox="0 0 20 22" fill="none" style={{display:"inline-block",verticalAlign:"middle",...style}}><rect x="1" y="1" width="18" height="17" rx="3" fill="#2a2a3e" stroke="#5a5870" strokeWidth="1.2"/><rect x="1" y="15" width="18" height="5" rx="2" fill="#1a1a2e" stroke="#3a3850" strokeWidth="1"/><rect x="2.5" y="2" width="15" height="13" rx="2" fill="#1e1e30"/><text x="10" y="12" textAnchor="middle" fill="#c4baff" fontSize="9" fontWeight="bold" fontFamily="'JetBrains Mono',monospace">K</text></svg>);

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
  30: ["callmoishmael","itwasthebestoftimes","itisatruthuniversallyacknowledged","inthebeginningwastheword","stayhungrystayfoolish"],
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
  return m[e.code] || "Something went wrong.";
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
const playSound = (type) => {
  try {
    const ctx = getAudioCtx();
    const g = ctx.createGain();
    g.connect(ctx.destination);
    if (type === "correct") {
      const o = ctx.createOscillator();
      o.connect(g); o.type = "sine"; o.frequency.value = 880;
      g.gain.setValueAtTime(0.07, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.08);
    } else if (type === "wrong") {
      const o = ctx.createOscillator();
      o.connect(g); o.type = "sawtooth"; o.frequency.value = 160;
      g.gain.setValueAtTime(0.1, ctx.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      o.start(ctx.currentTime); o.stop(ctx.currentTime + 0.1);
    } else if (type === "complete") {
      const t = ctx.currentTime;
      [523, 659, 784].forEach((f, i) => {
        const o2 = ctx.createOscillator();
        o2.connect(g); o2.frequency.value = f;
        o2.start(t + i * 0.1); o2.stop(t + i * 0.1 + 0.15);
      });
    }
  } catch(e) {}
};

export default function AccuratKey() {
  const [screen, setScreen] = useState("loading");
  const [user, setUser] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [activeProfile, setActiveProfile] = useState(null);
  // Optimistic profile patch — updates UI instantly without waiting for Firestore
  const patchProfile = (patch) => setActiveProfile(p => p ? {...p, ...patch} : p);
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
  const [totalCorrectChars, setTotalCorrectChars] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const startTimeRef = useRef(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [activeKey, setActiveKey] = useState(null);
  const [ghostPos, setGhostPos] = useState(-1);
  const ghostTimings = useRef([]); // [{t: timestamp, pos: charIndex}]
  const ghostInterval = useRef(null);
  const [combo, setCombo] = useState(0);
  const [keyMistakes, setKeyMistakes] = useState({});
  const [resultData, setResultData] = useState(null);
  const [keysEarned, setKeysEarned] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
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
  const [showCount, setShowCount] = useState(12); // how many levels to show
  const [activeTab, setActiveTab] = useState("map");
  const [showFriends, setShowFriends] = useState(false);
  const [friends, setFriends] = useState([]);
  const [friendReqs, setFriendReqs] = useState([]);
  const [friendSearch, setFriendSearch] = useState("");
  const [friendMsg, setFriendMsg] = useState("");
  const [showShop, setShowShop] = useState(false);
  const [shopMsg, setShopMsg] = useState("");
  const [dailyWords, setDailyWords] = useState(null);
  const [dailyBoard, setDailyBoard] = useState([]);
  const [dailyDone, setDailyDone] = useState(false);
  const [streak, setStreak] = useState(0);

  const SHOP_THEMES = [
    {id:"dark",label:"Dark",cost:0},{id:"midnight",label:"Midnight",cost:50},
    {id:"forest",label:"Forest",cost:50},{id:"coffee",label:"Coffee",cost:50},
    {id:"sunset",label:"Sunset",cost:75},{id:"ocean",label:"Ocean",cost:75},
    {id:"lavender",label:"Lavender",cost:75},{id:"neon",label:"Neon",cost:100},
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
      await updateProfile(user.uid, activeProfile.id, { keys: keys - 5 });
      const updated = await getProfile(user.uid, activeProfile.id);
      setActiveProfile(updated);
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
      if (m.enabled && screen === "loading") setScreen("maintenance");
    }).catch(() => {});
    getBroadcast().then(b => { if (b?.active && b?.message) setBroadcast(b); }).catch(()=>{});
    getLevelOverrides().then(setLevelOverrides).catch(()=>{});
  }, []);

  useEffect(() => {
    if(activeTab==="daily"&&!dailyWords){
      getDailyChallenge().then(d=>setDailyWords(d.words||["typefast","accuracy","keyboard","practice","daily"])).catch(()=>{});
      getDailyLeaderboard().then(setDailyBoard).catch(()=>{});
    }
  }, [activeTab]);

  
  const akTimer = useRef(null);
  const TOTAL_LINES = 5;
  const layout = LAYOUTS[layoutKey] || LAYOUTS.qwerty;
  const keyFinger = buildKeyFinger(layout.rows);

  useEffect(() => {
    const check = () => setIsMobile(window.matchMedia("(pointer: coarse) and (hover: none)").matches);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    // Handle redirect result from OAuth (GitHub/Google)
    getRedirectResult(auth).catch(() => {});

    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Check maintenance mode
        const maint = await getMaintenanceMode();
        setMaintenance(maint);
        if (maint.enabled) { setScreen("maintenance"); return; }
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
          signOut(auth);
          return;
        }
        await createAccount(u.uid, u.email);
        const profs = await getProfiles(u.uid);
        setProfiles(profs);
        if (profs.length === 0) {
          setScreen("createProfile");
        } else {
          // If returning from shop or another page, auto-restore last profile
          const returnScreen = typeof window !== "undefined" ? localStorage.getItem("ak_returnScreen") : null;
          const lastProfileId = typeof window !== "undefined" ? localStorage.getItem("ak_lastProfile_" + u.uid) : null;
          const lastProf = lastProfileId ? profs.find(p => p.id === lastProfileId) : null;
          const returnProfileId = typeof window !== "undefined" ? localStorage.getItem("ak_returnProfileId") : null;
          const returnProf = returnProfileId ? profs.find(p => p.id === returnProfileId) : lastProf;
          if (returnScreen && (returnProf || lastProf)) {
            const prof = returnProf || lastProf;
            localStorage.removeItem("ak_returnScreen");
            localStorage.removeItem("ak_returnProfileId");
            setActiveProfile(prof);
            setLayoutKey(prof.favoriteLayout || "qwerty");
            if (prof.streak) setStreak(prof.streak);
            setShowCount((prof.currentLevel || 1) + 10);
            setScreen(returnScreen === "profilePicker" ? "levelMap" : returnScreen);
          } else {
            setScreen("profilePicker");
          }
        }
      } else {
        // Not logged in
        if (typeof window !== "undefined") {
          if (window.location.search.includes("signout=1")) {
            localStorage.removeItem("ak_profileName");
            localStorage.removeItem("ak_uid");
            signOut(auth);
            setScreen("levelMap");
          } else if (window.location.search.includes("auth=1")) {
            setScreen("auth");
          } else if (screen === "loading") {
            setScreen("levelMap");
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
    setActiveProfile(profile);
    setLayoutKey(profile.favoriteLayout || "qwerty");
    if(profile.streak) setStreak(profile.streak);
    setShowCount((profile.currentLevel||1)+10);
    if (typeof window !== "undefined" && user) {
      localStorage.setItem("ak_lastProfile_" + user.uid, profile.id);
      localStorage.setItem("ak_profileName", profile.name);
      if (currentUsername) localStorage.setItem("ak_username", currentUsername);
      localStorage.setItem("ak_uid", user.uid);
    }
    const isBday = await checkAndUpdateBirthday(user.uid, profile.id, profile);
    if (isBday) {
      const updated = await getProfile(user.uid, profile.id);
      setActiveProfile(updated);
      setBirthdayProfile(updated);
      setScreen("birthday");
    } else {
      // Restore screen if returning from shop or other external page
      const returnScreen = typeof window !== "undefined" ? localStorage.getItem("ak_returnScreen") : null;
      if (returnScreen && returnScreen !== "profilePicker") {
        localStorage.removeItem("ak_returnScreen");
        setScreen(returnScreen);
      } else {
        setScreen("levelMap");
      }
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

  const handleOAuth = async (Provider) => {
    setAuthErr(""); setAuthLoading(true);
    try { await signInWithPopup(auth, new Provider()); }
    catch (e) { setAuthErr(cleanErr(e)); }
    setAuthLoading(false);
  };

  const [creatingProfile, setCreatingProfile] = useState(false);
  const handleCreateProfile = async () => {
    if (!newName.trim() || !newBirthday || creatingProfile) return;
    setCreatingProfile(true);
    const age = calcAge(newBirthday);
    const startLevel = suggestLevel(age, newSkill);
    let photoURL = null;
    if (profilePhotoB64) photoURL = profilePhotoB64;
    else if (profilePhoto) photoURL = await resizeToBase64(profilePhoto, 200);
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
      setScreen("tips");
    } else {
      setCreatingProfile(false);
      await selectProfile(prof);
    }
  };

  const initGame = useCallback((levelId, customWords) => {
    const ov = customWords || levelOverrides[String(levelId)] || null;
    setLines(Array.from({ length: TOTAL_LINES }, () => genLine(levelId, ov)));
    setLineIdx(0); setTyped(""); setTotalChars(0); setTotalCorrectChars(0);
    setStartTime(null); startTimeRef.current = null; setWpm(0); setAccuracy(100); setCombo(0); setKeyMistakes({});
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
    setGhostPos(-1);
    ghostTimings.current = [];
    clearInterval(ghostInterval.current);
    // Load ghost for this level
    try {
      const g = JSON.parse(localStorage.getItem(`ak_ghost_${levelId}`) || "null");
      if (g?.timings?.length) {
        const t0 = Date.now();
        ghostInterval.current = setInterval(() => {
          const elapsed = Date.now() - t0;
          const frame = g.timings.findLast(x => x.t <= elapsed);
          setGhostPos(frame ? frame.pos : -1);
        }, 50);
      }
    } catch(e) {}
    setScreen("game");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // Show tips before starting a level
  const requestStartLevel = (levelId, isSkip = false, skipTarget = null) => {
    setPendingLevelId(levelId);
    setPendingIsSkip(isSkip);
    setPendingSkipTarget(skipTarget);
    setIsFirstPlay(false);
    setScreen("tips");
  };

  useEffect(() => {
    if (screen === "game") setTimeout(() => inputRef.current?.focus(), 100);
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
      if(canUse(activeProfile,"sounds"))playSound("wrong");
    } else if (ch) {
      if(canUse(activeProfile,"sounds"))playSound("correct");
    }

    setTyped(newTyped);
    ghostTimings.current.push({ t: startTimeRef.current ? Date.now() - startTimeRef.current : 0, pos: totalChars + newTyped.length });

    // Update live accuracy
    const correct = newTyped.split("").filter((c, i) => c === current[i]).length;
    const tot = totalChars + newTyped.length;
    const newAcc = tot > 0 ? Math.round(((totalCorrectChars + correct) / tot) * 100) : 100;
    setAccuracy(newAcc);

    const _st = startTimeRef.current;
    if (_st) {
      const el = (Date.now() - _st) / 60000;
      setWpm(Math.round(((totalChars + newTyped.length) / 5) / Math.max(el, 0.01)));
    }

    // Line complete when typed length equals current line length
    if (newTyped.length === current.length) {
      const lv = LEVELS.find(l => l.id === playingLevel);
      const nt = totalChars + current.length;
      const nc = totalCorrectChars + current.split("").filter((c, i) => c === newTyped[i]).length;
      setTotalChars(nt);
      setTotalCorrectChars(nc);
      setCombo(c => c + 1);
      const ni = lineIdx + 1;

      if (ni >= TOTAL_LINES) {
        const el = startTimeRef.current ? (Date.now() - startTimeRef.current) / 60000 : 0.01;
        const fw = Math.round((nt / 5) / Math.max(el, 0.01));
        const passed = newAcc >= 75;
        if (!passed && newAcc < 75) {
          setFailReason(`You got ${newAcc}% accuracy. Need 75%.`);
        }
        const rd = { wpm: fw, accuracy: newAcc, passed, level: playingLevel, chars: nt, isSkipChallenge, skipTargetLevel };
        setResultData(rd);
        setWpm(fw);
        if (user && activeProfile) {
          saveSession(user.uid, activeProfile.id, { wpm: fw, accuracy: newAcc, layout: layoutKey, level: playingLevel, chars: nt, passed })
            .then(async (earned) => {
              setKeysEarned(earned || 0);
              const updated = await getProfile(user.uid, activeProfile.id);
              setActiveProfile(updated);
            }).catch(() => {});
          if (passed) {
            clearInterval(ghostInterval.current);
            try {
              const prev = JSON.parse(localStorage.getItem(`ak_ghost_${playingLevel}`) || "null");
              if (!prev || fw > prev.wpm) {
                localStorage.setItem(`ak_ghost_${playingLevel}`, JSON.stringify({ wpm: fw, timings: ghostTimings.current }));
              }
            } catch(e) {}
            updateStreak(user.uid, activeProfile.id).then(s=>{ if(s) setStreak(s); }).catch(()=>{});
            if (playingLevel === -1) {
              submitDailyScore(user.uid, currentUsername, activeProfile.avatar, {wpm:fw, accuracy:newAcc}).catch(()=>{});
              setDailyDone(true);
              getDailyLeaderboard().then(setDailyBoard).catch(()=>{});
            }
          }
        }
        if (!passed && newAcc < 75) {
          setScreen("fail");
        } else {
          if(canUse(activeProfile,"sounds"))playSound("complete");
          setScreen("result");
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
    setEditBirthday(activeProfile?.birthday || "");
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
      let photoURL = activeProfile?.photoURL || null;
      if (editPhotoB64) photoURL = editPhotoB64;
      else if (editPhoto) photoURL = await resizeToBase64(editPhoto, 200);
      const age = calcAge(editBirthday || activeProfile.birthday);
      const patch = {
        name: editName.trim() || activeProfile.name,
        avatar: editAvatar,
        photoURL,
        birthday: editBirthday || activeProfile.birthday,
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
    setScreen("profilePicker");
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
      setScreen("auth");
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

  const openProfileModal = async () => {
    if (user && activeProfile) {
      getRecentSessions(user.uid, activeProfile.id, 10).then(setSessions).catch(() => {});
    }
    setShowProfileModal(true);
  };

  const AvatarImg = ({ profile, size = 36, style = {} }) => {
    if (!profile) return null;
    return profile.photoURL
      ? <img src={profile.photoURL} alt="avatar" style={{width:size,height:size,borderRadius:"50%",objectFit:"cover",flexShrink:0,...style}} />
      : <span style={{width:size,height:size,borderRadius:"50%",background:T.card,border:`2px solid ${T.border}`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:size*0.45,flexShrink:0,...style}}>{AV[profile.avatar||"key"]||"⌨️"}</span>;
  };

  const Overlay = ({ onClose, children, wide }) => (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:3000,backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:28,width:wide?520:420,maxWidth:"94vw",maxHeight:"90vh",overflowY:"auto",fontFamily:T.font}} onClick={e=>e.stopPropagation()}>
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

  const UidTag = () => user ? (
  <div style={{position:"fixed",bottom:8,left:10,fontSize:9,color:T.faint,fontFamily:T.font,zIndex:999,opacity:0.6,display:"flex",gap:4,alignItems:"center"}}>
    <span style={{userSelect:"none"}}>UID:</span>
    <span
      title="Click to select"
      style={{userSelect:"text",cursor:"text"}}
      onClick={e => { e.stopPropagation(); const r=document.createRange(); r.selectNodeContents(e.currentTarget); const s=window.getSelection(); s.removeAllRanges(); s.addRange(r);}}
    >{user.uid}</span>
  </div>
) : null;

const Nav = () => (<>
    <UidTag />
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
      <div>
        <span style={{fontWeight:800,fontSize:fs(16),color:T.text,fontFamily:T.font}}><span style={{color:T.purple}}>Accurat</span>Key</span>
        {currentUsername && <div style={{fontSize:9,color:T.muted,marginTop:1}}>@{currentUsername}</div>}
      </div>
      {activeProfile && (
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {streak>0&&<span style={{color:"#f97316",fontWeight:700,fontSize:12}}>🔥{streak}</span>}
          {canUse(activeProfile,"keys")&&<span style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:20,padding:"4px 10px",fontSize:fs(13),color:T.accent,fontWeight:700,display:"flex",alignItems:"center",gap:4}}><KKey size={14}/>{((k)=>k>=1e6?""+Math.round(k/1e6)+"M":k>=1e3?""+Math.round(k/1e3)+"k":k)(activeProfile.keys||0)}</span>}
                    {canUse(activeProfile,"friends")&&<button onClick={()=>{getFriends(user?.uid).then(setFriends);getIncomingRequests(user?.uid).then(setFriendReqs);setShowFriends(true);}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,color:T.muted,fontSize:fs(13),padding:"4px 7px",cursor:"pointer",fontFamily:T.font}} title="Friends">👥</button>}
          {canUse(activeProfile,"shop")&&<button onClick={()=>{
    localStorage.setItem('ak_returnScreen', screen||'levelMap');
    localStorage.setItem('ak_returnProfileId', activeProfile?.id||'');
    window.location.href='/shop';
  }} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,color:T.muted,fontSize:13,padding:"4px 7px",cursor:"pointer",fontFamily:T.font}} title="Shop">🛍️</button>}
          <button onClick={openSettings} style={{background:"none",border:"none",cursor:"pointer",padding:0,display:"flex",alignItems:"center",gap:7}} title="Edit profile">
            <AvatarImg profile={activeProfile} size={30} />
            <span style={{fontSize:12,color:T.muted,maxWidth:90,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{activeProfile.name}</span>
          </button>
          <button onClick={() => requirePin("switch", () => setScreen("profilePicker"))} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,color:T.faint,fontSize:fs(11),padding:"4px 8px",cursor:"pointer",fontFamily:T.font}}>
            Switch
          </button>
        </div>
      )}
      {!activeProfile && (
        <button onClick={() => setScreen("auth")} style={{background:T.purple,border:"none",borderRadius:8,color:"#fff",fontSize:12,fontWeight:700,padding:"7px 16px",cursor:"pointer",fontFamily:T.font}}>
          Sign in
        </button>
      )}
    </div>
  </>
  );

  // SCREENS

  if (isMobile && user?.uid !== "qM3qeYBLwvRXy8D0gOKGCQbGuA12") return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:T.font,padding:32,textAlign:"center"}}>
      <div style={{fontSize:64,marginBottom:20}}>⌨️</div>
      <h1 style={{color:T.text,fontSize:26,fontWeight:700,marginBottom:12}}>Desktop only</h1>
      <p style={{color:T.muted,fontSize:15,lineHeight:1.6,maxWidth:280}}>AccuratKey needs a physical keyboard. Open it on your computer to start practicing!</p>
    </div>
  );

  if (maintenance?.enabled && !screen.includes("auth")) return (
    <div style={{minHeight:"100vh",background:"#0a0a0f",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:"'JetBrains Mono',monospace",padding:24,textAlign:"center"}}>
      <div style={{fontSize:48,marginBottom:16}}>🔧</div>
      <div style={{color:"#a78bfa",fontSize:20,fontWeight:700,marginBottom:8}}>Under Maintenance</div>
      <div style={{color:"#6b7280",fontSize:13}}>{maintenance.message || "We'll be back soon."}</div>
    </div>
  );

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
        ["ghost","👻 Ghost mode","Show a ghost cursor from your best run"],
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
        ["leaderboard","🏆 Leaderboard","View global leaderboards"],
        ["levelMap","🗺 Level map","See full level progression map"],
        ["sessionHistory","📋 Session history","View past typing sessions"],
        ["achievements","🏅 Achievements","Access achievements panel"],
        ["stats","📊 Stats page","View detailed personal stats"],
        ["tips","💡 Tips & tricks","Show typing tips between levels"],
      ]},
      {group:"👥 Social", items:[
        ["keys","🔑 Keys display","Show 🔑 key count in nav bar"],
        ["streak","🔥 Streak display","Show 🔥 streak count in nav bar"],
        ["friends","👥 Friends","Access friends panel and requests"],
        ["publicProfile","🌐 Public profile","Profile visible to other users"],
        ["chat","💬 Chat & messaging","Messaging with friends"],
        ["challenges","⚔️ Level challenges","Challenge friends to typing duels"],
        ["sendKeys","🎁 Send keys","Send 🔑 keys to friends"],
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
        ["purchaseKeys","💰 Buy keys","Purchase 🔑 keys"],
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
    {BroadcastBanner}
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
          {[[GoogleAuthProvider,"🔵","Google"],[GithubAuthProvider,"⬛","GitHub"]].map(([Prov, icon, label]) => (
            <button key={label} onClick={() => handleOAuth(Prov)} disabled={authLoading}
              style={{width:"100%",background:"#0a0a0f",border:"1px solid #1e1e30",borderRadius:8,color:"#e0e0ff",fontFamily:"'JetBrains Mono',monospace",fontSize:13,padding:"11px",cursor:"pointer",marginBottom:8,display:"flex",alignItems:"center",justifyContent:"center",gap:8}}>
              {icon} Continue with {label}
            </button>
          ))}
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
          <button onClick={() => setScreen("levelMap")} style={{width:"100%",marginTop:12,background:"transparent",border:"none",color:"#444",fontSize:12,cursor:"pointer",fontFamily:"'JetBrains Mono',monospace"}}>
            Continue without signing in
          </button>
        </div>
      </div>
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
              <div style={{color:T.accent,fontSize:11,marginTop:2,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}><KKey size={11}/>{p.keys || 0}</div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); const prof = p; setActiveProfile(prof); setLayoutKey(prof.favoriteLayout||"qwerty"); setEditName(prof.name||""); setEditAvatar(prof.avatar||"key"); setEditBirthday(prof.birthday||""); setEditPhoto(null); setEditPhotoPreview(null); setEditPhotoB64(null); setSaveMsg(""); setDeleteConfirmText(""); setShowDeleteProfile(false); setDeleteAccConfirmText(""); setShowDeleteAccount(false); setScreen("levelMap"); setShowSettingsModal(true);}}
              style={{position:"absolute",top:6,right:6,background:T.purple,border:"none",borderRadius:8,padding:"4px 8px",display:"flex",alignItems:"center",gap:4,cursor:"pointer",fontSize:11,fontWeight:700,color:"#fff",zIndex:10,opacity:hoveredProfileId===p.id?1:0,pointerEvents:hoveredProfileId===p.id?"all":"none",transition:"opacity 0.15s",fontFamily:T.font,whiteSpace:"nowrap"}}>
              ✏️ Edit
            </button>
          </div>
        ))}
        <button onClick={() => setScreen("createProfile")}
          style={{background:"transparent",border:`2px dashed ${T.border}`,borderRadius:16,padding:"24px 20px",width:140,cursor:"pointer",textAlign:"center",fontFamily:T.font}}>
          <span style={{fontSize:36,display:"block",marginBottom:10}}>➕</span>
          <div style={{color:T.faint,fontSize:13}}>Add Profile</div>
        </button>
      </div>
      <button onClick={() => { if(typeof window !== "undefined"){localStorage.removeItem("ak_profileName");localStorage.removeItem("ak_uid");localStorage.removeItem("ak_lastProfile_"+(user?.uid||""));} signOut(auth); setActiveProfile(null); setProfiles([]); setScreen("levelMap");}} style={{marginTop:32,background:"none",border:"none",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font}}>
        Sign out
      </button>
    {BroadcastBanner}
    </div>
  );

  if (screen === "createProfile") return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:T.font,padding:24}}>
      <div style={{width:"100%",maxWidth:460}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:42,marginBottom:8}}>👤</div>
          <h2 style={{color:T.text,fontSize:24,fontWeight:700,marginBottom:6}}>Create a profile</h2>
          <p style={{color:T.muted,fontSize:14}}>Each profile tracks its own progress</p>
        </div>
        <div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:28}}>
          <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:20}}>
            {profilePhotoPreview
              ? <img src={profilePhotoPreview} style={{width:60,height:60,borderRadius:"50%",objectFit:"cover",flexShrink:0}} />
              : <span style={{width:60,height:60,borderRadius:"50%",background:T.bg,border:`2px solid ${T.border}`,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:28,flexShrink:0}}>{AV[newAvatar]||"⌨️"}</span>
            }
            <div style={{display:"flex",flexDirection:"column",gap:6}}>
              <button onClick={()=>photoRef.current?.click()} style={{background:"transparent",border:`1px solid ${T.border}`,borderRadius:7,color:T.muted,fontSize:12,padding:"6px 12px",cursor:"pointer",fontFamily:T.font}}>
                Upload photo
              </button>
              <button onClick={(e)=>{e.stopPropagation();startQrUpload("create");}} style={{background:"transparent",border:`1px solid ${T.purple}66`,borderRadius:7,color:T.purple,fontSize:12,padding:"6px 12px",cursor:"pointer",fontFamily:T.font}}>
                📱 Use phone
              </button>
            </div>
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
          <label style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:6}}>Name</label>
          <input value={newName} onChange={e=>setNewName(e.target.value)} placeholder="Your name"
            style={{width:"100%",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:T.font,fontSize:15,padding:"11px 14px",marginBottom:14,outline:"none",boxSizing:"border-box"}} />
          <label style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",display:"block",marginBottom:6}}>Birthday</label>
          <DatePicker value={newBirthday} onChange={setNewBirthday} T={T} />
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
            <button onClick={()=>setScreen("profilePicker")} style={{width:"100%",marginTop:10,padding:"10px",borderRadius:8,background:"none",border:`1px solid ${T.border}`,color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font}}>
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
      <button onClick={() => setScreen("levelMap")}
        style={{padding:"14px 40px",borderRadius:12,border:"none",background:T.purple,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>
        Start Playing →
      </button>
      <style>{`@keyframes bounce{from{transform:translateY(0)}to{transform:translateY(-14px)}}`}</style>
    </div>
  );

  if (screen === "tips") {
    const lv = LEVELS.find(l => l.id === pendingLevelId) || LEVELS[0];
    const tips = isFirstPlay
      ? LEVEL_TIPS.beginner
      : (LEVEL_TIPS[pendingLevelId] || LEVEL_TIPS.default);

    return (
      <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:T.font,padding:24}}>
        <div style={{width:"100%",maxWidth:460,textAlign:"center"}}>
          <div style={{fontSize:56,marginBottom:12}}>{lv.emoji}</div>
          <h2 style={{color:T.text,fontSize:fs(24),fontWeight:800,marginBottom:4}}>Level {lv.id}: {lv.name}</h2>
          <p style={{color:T.muted,fontSize:13,marginBottom:28}}>Target: {lv.accuracy}% accuracy</p>
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
          <button onClick={() => startLevel(pendingLevelId, pendingIsSkip, pendingSkipTarget)}
            style={{width:"100%",padding:"15px",borderRadius:12,border:"none",background:T.purple,color:"#fff",fontSize:16,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>
            Start Typing →
          </button>
          <button onClick={() => setScreen("levelMap")} style={{marginTop:12,background:"none",border:"none",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font}}>
            ← Back to map
          </button>
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
          <button onClick={() => setScreen("levelMap")}
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
      <div style={{minHeight:"100vh",background:T.bg,fontFamily:T.font,padding:"20px 16px"}}>
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
              {[["Best WPM",activeProfile?.bestWpm||0,T.purple],["Sessions",activeProfile?.totalSessions||0,T.accent2],["Avg Acc",(activeProfile?.avgAccuracy||0)+"%",T.accent]].map(([l,v,c])=>(
                <div key={l} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"12px 8px",textAlign:"center"}}><div style={{color:c,fontSize:22,fontWeight:700}}>{v}</div><div style={{color:T.faint,fontSize:10,marginTop:3}}>{l}</div></div>
              ))}
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              {[["Keys",activeProfile?.keys||0],["Fav Layout",activeProfile?.favoriteLayout||"—"]].map(([l,v])=>(
                <div key={l} style={{background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 12px"}}>
                  <div style={{color:T.faint,fontSize:10,marginBottom:3}}>{l}</div>
                  <div style={{fontWeight:700,fontSize:14,color:T.text}}>{v}</div>
                </div>
              ))}
            </div>
            {sessions.length > 0 && <>
              <div style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Recent Sessions</div>
              <div style={{display:"flex",flexDirection:"column",gap:5,maxHeight:180,overflowY:"auto"}}>
                {sessions.map((s,i) => (
                  <div key={s.id||i} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:T.bg,border:`1px solid ${T.border}`,borderRadius:7}}><div style={{display:"flex",gap:10}}><span style={{color:T.purple,fontWeight:700}}>{s.wpm} WPM</span><span style={{color:T.accent2,fontSize:12}}>{s.accuracy}%</span><span style={{color:T.faint,fontSize:11}}>Lv {s.level}</span></div><span style={{color:"#333",fontSize:10}}>{s.createdAt?.seconds?new Date(s.createdAt.seconds*1000).toLocaleDateString():""}</span></div>
                ))}
              </div>
            </>}
            <button onClick={()=>{setShowProfileModal(false);openSettings();}} style={{width:"100%",marginTop:16,padding:"10px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font}}>
              Edit Profile
            </button>
            <button onClick={()=>{setShowProfileModal(false);setScreen("profilePicker");}} style={{width:"100%",marginTop:8,padding:"10px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.faint,fontSize:13,cursor:"pointer",fontFamily:T.font}}>
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
              <div>
                <button onClick={()=>editPhotoRef.current?.click()} style={{display:"block",background:"transparent",border:`1px solid ${T.border}`,borderRadius:6,color:T.muted,fontSize:12,padding:"6px 12px",cursor:"pointer",marginBottom:5,fontFamily:T.font}}>Upload photo</button>
                <button onClick={(e)=>{e.stopPropagation();startQrUpload("edit");}} style={{display:"block",background:"transparent",border:`1px solid ${T.purple}66`,borderRadius:6,color:T.purple,fontSize:12,padding:"6px 12px",cursor:"pointer",marginBottom:5,fontFamily:T.font}}>📱 Use phone</button>
                {(editPhotoPreview||activeProfile?.photoURL) && <button onClick={()=>{setEditPhoto(null);setEditPhotoPreview(null);setEditPhotoB64(null);}} style={{background:"transparent",border:"none",color:T.faint,fontSize:11,cursor:"pointer",fontFamily:T.font}}>Remove</button>}
                <input ref={editPhotoRef} type="file" accept="image/*" style={{display:"none"}} onChange={e=>{const f=e.target.files[0];if(f){setEditPhoto(f);setEditPhotoPreview(URL.createObjectURL(f));setEditPhotoB64(null);}}} />
              </div>
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
            <DatePicker value={editBirthday} onChange={setEditBirthday} T={T} />
            {saveMsg && <p style={{color:saveMsg==="Saved!"?T.accent2:"#ef4444",fontSize:12,marginBottom:8}}>{saveMsg}</p>}
            {/* Profile Admin */}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderTop:`1px solid ${T.faint}`,marginTop:8}}>
              <div><div style={{color:T.text,fontSize:12,fontWeight:700}}>Profile Admin</div></div>
              <button onClick={async()=>{const v=!(activeProfile?.isProfileAdmin);patchProfile({isProfileAdmin:v});updateProfile(user.uid,activeProfile.id,{isProfileAdmin:v});}} style={{padding:"5px 12px",background:(activeProfile?.isProfileAdmin)?"#a78bfa22":"transparent",border:`1px solid ${(activeProfile?.isProfileAdmin)?"#a78bfa":T.border}`,borderRadius:7,color:(activeProfile?.isProfileAdmin)?"#a78bfa":T.muted,fontSize:11,fontWeight:700,cursor:"pointer",fontFamily:T.font}}>{activeProfile?.isProfileAdmin?"ON":"OFF"}</button>
                 </div>
            <div style={{padding:"10px 0",borderTop:`1px solid ${T.faint}`}}>
              <button onClick={()=>{if(!activeProfile?.isProfileAdmin){setShowSettingsModal(false);setShowFeatureAccess(true);}}} style={{width:"100%",display:"flex",alignItems:"center",justifyContent:"space-between",background:"none",border:`1px solid ${T.border}`,borderRadius:8,padding:"10px 14px",cursor:activeProfile?.isProfileAdmin?"default":"pointer",fontFamily:T.font,opacity:activeProfile?.isProfileAdmin?0.4:1}}>
                <span style={{color:T.text,fontSize:13,fontWeight:700}}>Feature Access</span>
                <span style={{color:T.muted,fontSize:14}}>{activeProfile?.isProfileAdmin?"(bypassed by Admin)":"›"}</span>
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
            <button onClick={() => { setShowChangeUsername(true); setShowSettingsModal(false);}} style={{width:"100%",padding:"9px",background:"transparent",border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:T.font,marginTop:8}}>
              @{currentUsername || "Set username"} · Change username (5 🔑)
            </button>

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

        <div style={{maxWidth:"min(860px, 100%)",margin:"0 auto",padding:"0 8px"}}>
          <Nav />
          {/* Tabs */}
          <div style={{display:"flex",gap:6,marginBottom:16,background:T.card,borderRadius:10,padding:3,border:`1px solid ${T.border}`}}>
            {([["map","🎮 Game",true],["daily","📅 Daily",canUse(activeProfile,"daily")],["test","⌨️ Test",canUse(activeProfile,"test")]]).filter(t=>t[2]).map(([k,l])=>(
              <button key={k} onClick={()=>setActiveTab(k)} style={{flex:1,padding:"8px 0",borderRadius:7,border:"none",background:activeTab===k?T.purple:"transparent",color:activeTab===k?"#fff":T.faint,fontWeight:700,fontSize:fs(12),cursor:"pointer",fontFamily:T.font}}>{l}</button>
            ))}
          </div>

          {activeTab==="map" && <>
          <div style={{display:"flex",flexDirection:"column",gap:10}}>
            {LEVELS.slice(0, Math.min(showCount, LEVELS.length)).map((lv,idx)=>{
              const unlocked=lv.id<=highestUnlocked,current=lv.id===currentLevel,completed=lv.id<highestUnlocked,locked=!unlocked,canSkipTo=lv.id===highestUnlocked+1;
              return (
                <div key={lv.id} style={{display:"flex",alignItems:"center",gap:12}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:40,flexShrink:0}}>
                    <div style={{width:3,height:idx===0?0:20,background:completed||current?lv.color:"#1e1e30",borderRadius:2}}/>
                    <div style={{width:40,height:40,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0,background:completed?"#0a3020":current?lv.color+"33":locked?"#0a0a15":"#0a0a15",border:`3px solid ${completed?lv.color:current?lv.color:locked?"#1e1e30":"#2a2a3e"}`,boxShadow:current?`0 0 16px ${lv.color}66`:"none"}}>{completed?"✓":locked?"🔒":lv.emoji}</div>
                  </div>
                  <div style={{flex:1,padding:"14px 16px",borderRadius:12,cursor:locked&&!canSkipTo?"default":"pointer",background:current?lv.color+"18":completed?"#0a180f":locked?"#0a0a12":T.card,border:`1px solid ${current?lv.color:completed?lv.color+"44":locked?"#1a1a28":T.border}`,opacity:locked&&!canSkipTo?0.45:1}}
                    onClick={()=>{
                      if(current||(!locked&&unlocked))requestStartLevel(lv.id);
                      else if(canSkipTo&&canUse(activeProfile,'skip')&&confirm(`Skip to Level ${lv.id}: ${lv.name}?\n\nCustom challenge — 75%+ accuracy to unlock.`))requestStartLevel(lv.id,true,lv.id);
                   }}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:3}}>
                          <span style={{color:T.faint,fontSize:fs(10),letterSpacing:1}}>LEVEL {lv.id}</span>
                          {current&&<span style={{background:lv.color,color:"#fff",fontSize:fs(9),fontWeight:700,padding:"1px 7px",borderRadius:10}}>CURRENT</span>}
                          {canSkipTo&&<span style={{background:"#f59e0b22",color:"#f59e0b",fontSize:9,fontWeight:700,padding:"1px 7px",borderRadius:10}}>SKIP?</span>}
                        </div>
                        <div style={{color:T.text,fontWeight:700,fontSize:15}}>{lv.name}</div>
                        <div style={{color:T.muted,fontSize:12,marginTop:2}}>{lv.accuracy}% accuracy</div>
                      </div>
                      <div style={{textAlign:"right"}}>{completed&&<div style={{color:lv.color,fontSize:11,marginTop:3}}>✓ Done</div>}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          {showCount < LEVELS.length && <button onClick={()=>setShowCount(c=>Math.min(c+10,LEVELS.length))} style={{width:"100%",marginTop:14,padding:"10px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.muted,fontSize:13,cursor:"pointer",fontFamily:T.font}}>Show 10 More ↓ ({LEVELS.length - showCount} remaining)</button>}
          {showCount > currentLevel+10 && <button onClick={()=>setShowCount(currentLevel+10)} style={{width:"100%",marginTop:8,padding:"8px",borderRadius:8,border:`1px solid ${T.border}`,background:"transparent",color:T.faint,fontSize:12,cursor:"pointer",fontFamily:T.font}}>Show Less ↑</button>}
          <div style={{height:40}}/>
          </>}

          {activeTab==="daily" && <div style={{padding:"20px 0"}}>
            <div style={{textAlign:"center",marginBottom:20}}>
              <div style={{fontSize:40,marginBottom:8}}>📅</div>
              <div style={{color:T.text,fontWeight:800,fontSize:18,marginBottom:4}}>Daily Challenge</div>
              <div style={{color:T.muted,fontSize:13}}>New words every day — compete with everyone</div>
            </div>
            {!dailyWords&&<div style={{color:T.muted,textAlign:"center",padding:20}}>Loading…</div>}
            {dailyWords&&(dailyDone
              ?<div style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:20,textAlign:"center",marginBottom:16}}><div style={{color:T.accent2,fontWeight:700,fontSize:15,marginBottom:4}}>✓ Completed today!</div><div style={{color:T.muted,fontSize:12}}>Come back tomorrow.</div></div>
              :<button onClick={()=>requestStartLevel(-1)} style={{width:"100%",padding:"14px",borderRadius:12,border:"none",background:T.purple,color:"#fff",fontSize:15,fontWeight:700,cursor:"pointer",fontFamily:T.font,marginBottom:16}}>Start Daily Challenge →</button>
            )}
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

          {activeTab==="test" && <TypingTest T={T}/>}

          <div style={{height:40}}/>
        </div>

        {showFriends && (
          <div onClick={()=>{setShowFriends(false);setFriendMsg("");}} style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1010,padding:20}}>
            <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,width:"100%",maxWidth:420,maxHeight:"80vh",overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{color:T.text,fontWeight:800,fontSize:16}}>👥 Friends</span>
                <button onClick={()=>{setShowFriends(false);setFriendMsg("");}} style={{background:"none",border:"none",color:T.faint,fontSize:20,cursor:"pointer"}}>×</button>
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
              <div style={{display:"flex",gap:8,marginBottom:14}}>
                <input value={friendSearch} onChange={e=>setFriendSearch(e.target.value)} onKeyDown={e=>e.key==="Enter"&&(async()=>{try{const res=await getUserByUsername(friendSearch.replace("@",""));if(!res)return setFriendMsg("User not found");await sendFriendRequest(user.uid,currentUsername,res.uid,friendSearch.replace("@","").toLowerCase());setFriendMsg("Request sent!");setFriendSearch("");}catch(e){setFriendMsg(e.message||"Error");}})()}  placeholder="@username" style={{flex:1,background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:T.font,fontSize:13,padding:"9px 12px",outline:"none"}}/>
                <button onClick={async()=>{try{const res=await getUserByUsername(friendSearch.replace("@",""));if(!res)return setFriendMsg("User not found");await sendFriendRequest(user.uid,currentUsername,res.uid,friendSearch.replace("@","").toLowerCase());setFriendMsg("Request sent!");setFriendSearch("");}catch(e){setFriendMsg(e.message||"Error");}}} style={{padding:"9px 14px",background:T.purple,border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>Add</button>
              </div>
              {friendMsg&&<div style={{color:T.accent2,fontSize:12,marginBottom:10}}>{friendMsg}</div>}
              <div style={{color:T.faint,fontSize:10,letterSpacing:2,textTransform:"uppercase",marginBottom:8}}>Friends</div>
              {friends.length===0&&<div style={{color:T.faint,fontSize:13,textAlign:"center",padding:"16px 0"}}>No friends yet</div>}
              {friends.map(f=>(
                <div key={f.uid} style={{display:"flex",alignItems:"center",gap:10,padding:"10px 12px",background:T.bg,border:`1px solid ${T.border}`,borderRadius:8,marginBottom:6}}>
                  <span style={{color:T.text,fontSize:13,flex:1}}>@{f.username}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {showShop && (
          <div onClick={()=>{setShowShop(false);setShopMsg("");}} style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:1010,padding:20}}>
            <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:16,padding:24,width:"100%",maxWidth:400,maxHeight:"80vh",overflowY:"auto"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
                <span style={{color:T.text,fontWeight:800,fontSize:16}}>🛍️ Theme Shop</span>
                <button onClick={()=>{setShowShop(false);setShopMsg("");}} style={{background:"none",border:"none",color:T.faint,fontSize:20,cursor:"pointer"}}>×</button>
              </div>
              <div style={{color:T.muted,fontSize:12,marginBottom:16}}>You have <strong style={{color:T.accent}}>{activeProfile?.keys||0} 🔑</strong></div>
              {shopMsg&&<div style={{color:T.accent2,fontSize:12,marginBottom:12}}>{shopMsg}</div>}
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
                {SHOP_THEMES.map(th=>{
                  const owned=(activeProfile?.ownedThemes||[]).includes(th.id)||th.cost===0;
                  const active=activeProfile?.activeTheme===th.id||(th.id==="dark"&&!activeProfile?.activeTheme);const canCustomTheme=canUse(activeProfile,"customTheme");
                  return (
                    <div key={th.id} style={{background:T.bg,border:`1px solid ${active?T.purple:T.border}`,borderRadius:10,padding:"12px",textAlign:"center"}}>
                      <div style={{fontWeight:700,fontSize:13,color:T.text,marginBottom:4}}>{th.label}</div>
                      <div style={{color:T.faint,fontSize:11,marginBottom:8}}>{th.cost===0?"Free":`${th.cost} 🔑`}</div>
                      {active?<div style={{color:T.purple,fontSize:11,fontWeight:700}}>Active</div>
                        :!canCustomTheme&&th.id!=="dark"?<div style={{color:T.faint,fontSize:11}}>🔒 Locked</div>
                        :owned?<button onClick={async()=>{patchProfile({activeTheme:th.id});setShopMsg(`${th.label} activated!`);setActiveTheme(user.uid,activeProfile.id,th.id);}} style={{width:"100%",padding:"6px",background:"transparent",border:`1px solid ${T.purple}`,borderRadius:6,color:T.purple,fontSize:11,fontWeight:700,cursor:"pointer"}}>Equip</button>
                        :<button onClick={async()=>{const newKeys=(activeProfile.keys||0)-th.cost;if(newKeys<0){setShopMsg("Not enough 🔑 Keys");return;}patchProfile({keys:newKeys,ownedThemes:[...(activeProfile.ownedThemes||[]),th.id],activeTheme:th.id});setShopMsg(`${th.label} purchased!`);try{await purchaseTheme(user.uid,activeProfile.id,th.id,th.cost);await setActiveTheme(user.uid,activeProfile.id,th.id);}catch(e){setShopMsg(e.message||"Error");}}} style={{width:"100%",padding:"6px",background:T.purple,border:"none",borderRadius:6,color:"#fff",fontSize:11,fontWeight:700,cursor:"pointer"}}>Buy</button>
                      }
                    </div>
                  );
                })}
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
              <div style={{color:"#6b7280",fontSize:12,marginBottom:16}}>Costs 5 🔑 keys. Current: @{currentUsername}</div>
              <input value={newUsernameInput} onChange={e=>{setNewUsernameInput(e.target.value);setUsernameError("");}} onKeyDown={e=>e.key==="Enter"&&handleChangeUsername()} placeholder="new_username" maxLength={20} autoFocus style={{width:"100%",background:"#1e1e30",border:"1px solid #2e2e44",borderRadius:8,color:"#e0e0ff",fontFamily:T.font,fontSize:14,padding:"10px 12px",outline:"none",boxSizing:"border-box",marginBottom:8}} />
              {usernameError && <div style={{color:"#ef4444",fontSize:11,marginBottom:8}}>{usernameError}</div>}
              <div style={{display:"flex",gap:8}}>
                <button onClick={handleChangeUsername} disabled={usernameLoading||!newUsernameInput.trim()} style={{flex:1,padding:"10px",background:T.purple,border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer",fontFamily:T.font}}>{usernameLoading?"...":"Change (5 🔑)"}</button>
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
      return (
        <div style={{width:"100%",maxWidth:660,background:"#0d0d1a",border:"1px solid #1e1e30",borderRadius:14,padding:14,marginTop:12}}>
          {layout.rows.map((row, ri) => (
            <div key={ri} style={{display:"flex",justifyContent:"center",gap:4,marginBottom:4,paddingLeft:ri===1?10:ri===2?18:0}}>
              {row.map(k => {
                const finger = keyFinger[k];
                const color = FC[finger] || "#444";
                const isActive = activeKey === k;
                const isNext = nextChar === k;
                return (
                  <div key={k} style={{width:38,height:38,borderRadius:7,background:isActive?color:isNext?color+"33":"#1a1a2e",border:isNext?`1px solid ${color}88`:"1px solid #2a2a3e",borderBottom:`3px solid ${isActive?color+"88":"#111"}`,display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",color:isActive?"#000":isNext?color:color+"99",fontSize:11,fontWeight:700,position:"relative",transition:"background 0.08s"}}>
                    {k.toUpperCase()}
                    {layout.bumps.includes(k) && <div style={{width:4,height:3,borderRadius:2,background:isActive?"#000":color,position:"absolute",bottom:3}} />}
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
        <div style={{width:"100%",maxWidth:660,marginBottom:8}}><Nav /></div>
        <div style={{width:"100%",maxWidth:660,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <span style={{fontSize:20}}>{lv.emoji}</span>
            <div>
              <div style={{color:T.text,fontWeight:700,fontSize:14}}>{lv.name}</div>
              {isSkipChallenge && <div style={{color:"#f59e0b",fontSize:11}}>⚡ Skip challenge — custom hard words — pass to unlock Level {skipTargetLevel}</div>}
            </div>
          </div>
          <div style={{display:"flex",gap:14,alignItems:"center"}}>
            <span style={{color:T.purple,fontWeight:700,fontSize:14}}>{wpm} WPM</span>
            <span style={{color:T.accent2,fontWeight:700,fontSize:14}}>{accuracy}%</span>
            {combo > 1 && <span style={{color:T.accent,fontWeight:700,fontSize:13}}>×{combo}</span>}
            {ghostPos >= 0 && <span style={{color:"#f59e0b",fontSize:11}}>👻</span>}
            <span style={{color:T.faint,fontSize:12}}>{lineIdx}/{TOTAL_LINES}</span>
          </div>
        </div>
        <div style={{width:"100%",maxWidth:660,height:4,background:"#1a1a2e",borderRadius:2,marginBottom:14}}>
          <div style={{height:"100%",background:lv.color,borderRadius:2,width:progress+"%",transition:"width 0.3s"}} />
        </div>
        <div style={{width:"100%",maxWidth:660,background:T.card,border:`1px solid ${T.border}`,borderRadius:12,padding:"20px 24px",marginBottom:12}}>
          {lines[lineIdx+1] && <div style={{fontSize:14,letterSpacing:1,marginBottom:10,color:"#2a2a3a",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis",fontFamily:T.font}}>{lines[lineIdx+1]}</div>}
          <div style={{fontSize:20,letterSpacing:2,display:"flex",flexWrap:"wrap",lineHeight:1.8,fontFamily:T.font}}>
            {current.split("").map((ch,ci) => {
              let color=T.faint, underline="2px solid transparent";
              if (ci < typed.length) color = typed[ci]===ch ? T.accent2 : "#ef4444";
              else if (ci === typed.length) { color=T.purple; underline=`2px solid ${T.purple}`; }
              const isGhost = ghostPos >= 0 && (ghostPos % current.length) === ci && ci >= typed.length;
              return <span key={ci} style={{color, borderBottom: isGhost ? "2px solid #f59e0b88" : underline, background: isGhost ? "#f59e0b11" : "transparent"}}>{ch}</span>;
            })}
          </div>
        </div>
        <input ref={inputRef} value={typed} onChange={handleType} onKeyDown={e=>{ if(e.key==="Backspace") e.preventDefault();}} style={{position:"absolute",opacity:0,pointerEvents:"none"}} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck={false} />
        <Keyboard />
        <button onClick={() => { clearInterval(ghostInterval.current); setScreen("levelMap"); }} style={{marginTop:20,background:"none",border:"none",color:T.faint,fontSize:12,cursor:"pointer",fontFamily:T.font}}>
          ← Back to map
        </button>
      </div>
    );
  }

  if (screen === "result" && resultData) {
    const lv = LEVELS.find(l => l.id === resultData.level) || LEVELS[0];
    const { passed, wpm: rWpm, accuracy: rAcc, isSkipChallenge: rSkip } = resultData;
    const worstKeys = Object.entries(keyMistakes).sort((a,b) => b[1]-a[1]).slice(0,5);

    return (
      <div style={{minHeight:"100vh",background:T.bg,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",fontFamily:T.font,padding:20}}>
        <div style={{width:"100%",maxWidth:460,textAlign:"center"}}>
          <div style={{fontSize:64,marginBottom:10}}>{passed ? "🎉" : "💪"}</div>
          <h2 style={{color:T.text,fontSize:28,fontWeight:800,margin:0}}>
            {passed ? (rSkip ? "Level Skipped!" : "Level Complete!") : "Not quite!"}
          </h2>
          <p style={{color:T.muted,fontSize:14,marginTop:6,marginBottom:20}}>{lv.emoji} {lv.name}</p>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:14}}>
            {[["WPM",rWpm,T.purple],["Accuracy",rAcc+"%",T.accent2],["Target",lv.wpmTarget+" WPM",passed?T.accent2:"#ef4444"],["Keys Earned","+"+(keysEarned||0),T.accent]].map(([l,v,c]) => (
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
              <button onClick={() => setScreen("auth")} style={{background:T.purple,border:"none",borderRadius:8,color:"#fff",fontSize:13,fontWeight:700,padding:"8px 18px",cursor:"pointer",fontFamily:T.font}}>
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
            <button onClick={() => setScreen("levelMap")}
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
        </div>
      </div>
    );
  }

  return null;
}
