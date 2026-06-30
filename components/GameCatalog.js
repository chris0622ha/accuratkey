// Shared game catalog - the single source of truth for which games exist.
// Previously GamesTab.jsx had its own GAMES array AND Roulette (in
// GamesNew2.jsx) had a completely separate, hand-typed ALL_GAME_IDS/
// GAME_NAMES list. The two drifted out of sync constantly - Roulette kept
// offering removed games (Zen Mode, Code Rain, Typewriter Story) and never
// picked up new ones (Tug of War, Word Bomb, Memory Edit, Wildcard Words,
// Freestyle, and others). Both files now import from here instead.
export const GAMES = [
  { id:"rain",        emoji:"🌧️", name:"Word Rain",      desc:"Type falling words before they hit the bottom",    cat:"arcade" },
  { id:"survival",    emoji:"💀", name:"Survival",        desc:"Endless typing — mistakes cost you time",          cat:"arcade" },
  { id:"burst",       emoji:"⚡", name:"Speed Burst",     desc:"Sprint for WPM — how fast are you?",              cat:"speed" },
  { id:"scramble",    emoji:"🔀", name:"Word Scramble",   desc:"Unscramble jumbled words against the clock",       cat:"puzzle" },
  { id:"suddendeath", emoji:"☠️", name:"Sudden Death",    desc:"One wrong key and it's all over",                  cat:"accuracy" },
  { id:"ladder",      emoji:"🪜", name:"Speed Ladder",    desc:"Each rung must be faster than the last",           cat:"speed" },
  { id:"tugofwar",    emoji:"🪢", name:"Tug of War",      desc:"Type accurately to pull the rope your way",        cat:"challenge" },
  { id:"wordbomb",    emoji:"💣", name:"Word Bomb",       desc:"Defuse the bomb before the fuse runs out",         cat:"challenge" },
  { id:"sniper",      emoji:"🎯", name:"Sniper",          desc:"100% accuracy required — any mistake resets",      cat:"accuracy" },
  { id:"mirror",      emoji:"🪞", name:"Mirror",           desc:"Words appear backwards — type them forwards",     cat:"accuracy" },
  { id:"flash",       emoji:"⚡", name:"Flash",            desc:"Memorize the word before it disappears",          cat:"memory" },
  { id:"echo",        emoji:"🔁", name:"Echo",             desc:"Repeat growing sequences from memory",            cat:"memory" },
  { id:"memoryedit",  emoji:"🧠", name:"Memory Edit",      desc:"Spot what changed and fix it from memory",        cat:"memory" },
  { id:"ghost",       emoji:"👻", name:"Ghost Words",      desc:"Type the word before it fades away",             cat:"accuracy" },
  { id:"boss",        emoji:"👾", name:"Boss Battle",      desc:"Deal damage by typing — dodge boss attacks",      cat:"arcade" },
  { id:"hundred",     emoji:"💯", name:"100 Words",         desc:"Type exactly 100 words as fast as possible",      cat:"challenge" },
  { id:"endurance",   emoji:"🏃", name:"Endurance",         desc:"Never stop typing or it's game over",             cat:"challenge" },
  { id:"roulette",    emoji:"🎰", name:"Roulette",          desc:"Spin for a random game mode",                     cat:"random" },
  { id:"wildcard",    emoji:"🎲", name:"Wildcard Words",    desc:"Each word gets a random surprise twist",          cat:"random" },
  { id:"wordchain",   emoji:"🔗", name:"Word Chain",        desc:"Each word must start with the last letter",       cat:"puzzle" },
  { id:"blitz",       emoji:"⚡", name:"Category Blitz",    desc:"Type as many words in a category as possible",    cat:"challenge" },
  { id:"vocab",       emoji:"📚", name:"Vocab Builder",     desc:"Read the definition — type the word",             cat:"educational" },
  { id:"spellingbee", emoji:"🐝", name:"Spelling Bee",      desc:"Not available right now",                          cat:"educational", unavailable:true },
  { id:"invaders",    emoji:"👾", name:"Typing Invaders",   desc:"Shoot invaders by typing their words",            cat:"arcade" },
  { id:"asteroid",    emoji:"☄️", name:"Asteroid Belt",     desc:"Destroy asteroids before they hit your ship",     cat:"arcade" },
  { id:"tower",       emoji:"🏰", name:"Tower Defense",     desc:"Stop enemies from reaching your base",            cat:"arcade" },
  { id:"mystery",     emoji:"🔮", name:"Mystery Words",     desc:"Symbols slowly reveal as letters — guess the word", cat:"puzzle" },
  { id:"rhyme",       emoji:"🎵", name:"Rhyme Time",        desc:"Type a word that rhymes with the one shown",      cat:"educational" },
  { id:"freestyle",   emoji:"✍️", name:"Freestyle",         desc:"Write your own rhyming lines, validated for real", cat:"creative" },
  { id:"speedtest",   emoji:"⏱️", name:"Speed Test",        desc:"Classic 1, 2, or 5 minute WPM benchmark",         cat:"speed" },
  { id:"missing",     emoji:"🔡", name:"Missing Letters",   desc:"Fill in the blanks — w_rd sh_wn l_ke th_s",       cat:"puzzle" },
  { id:"anagram",     emoji:"🔀", name:"Anagram",           desc:"Unscramble the letters to form a real word",       cat:"puzzle" },
  { id:"bricks",      emoji:"🧱", name:"Brick Breaker",     desc:"Type words to smash bricks in waves",              cat:"arcade" },
  { id:"synonyms",    emoji:"📖", name:"Synonyms",          desc:"Type any word that means the same thing",          cat:"educational" },
  { id:"antonyms",    emoji:"↔️", name:"Antonyms",          desc:"Type the opposite — any antonym accepted",         cat:"educational" },
];
