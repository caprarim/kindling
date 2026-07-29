/**
 * The raw material every idea is assembled from.
 *
 * An idea is a combination of five slots — domain, focus, audience, mechanic,
 * twist — so the reachable space is the product of all of them (hundreds of
 * thousands of distinct combinations). That is what makes "never show me the
 * same idea twice" a promise the app can actually keep.
 */

export type Focus = { id: string; label: string; hint: string };
export type Audience = { id: string; label: string };

export type Domain = {
  id: string;
  label: string;
  blurb: string;
  /** Concrete nouns from this world, used to synthesise product names. */
  nouns: string[];
  focuses: Focus[];
  audiences: Audience[];
  /** Outcome phrases: "…so they can {pain}". */
  pains: string[];
  /** Lowercase words we look for when reading someone's free-text idea. */
  keywords: string[];
};

export const DOMAINS: Domain[] = [
  {
    id: "health",
    label: "Health & movement",
    blurb: "Bodies, habits, sleep, and feeling better day to day",
    nouns: ["pulse", "stride", "rest", "reps", "vital", "pace", "breath"],
    focuses: [
      { id: "habits", label: "Daily habits", hint: "Streaks, routines, small consistent wins" },
      { id: "sleep", label: "Sleep & energy", hint: "Wind-downs, wake-ups, the 3pm crash" },
      { id: "strength", label: "Training & strength", hint: "Programmes, progression, lifting" },
      { id: "recovery", label: "Injury & recovery", hint: "Rehab, physio homework, coming back slowly" },
      { id: "mind", label: "Headspace", hint: "Stress, mood, journaling, quiet minutes" },
      { id: "care", label: "Care & appointments", hint: "Meds, check-ups, looking after someone else" },
    ],
    audiences: [
      { id: "beginners", label: "total beginners" },
      { id: "returners", label: "people restarting after a long gap" },
      { id: "desk", label: "desk workers" },
      { id: "parents", label: "parents with no spare hour" },
      { id: "older", label: "people over sixty" },
      { id: "chronic", label: "people managing a long-term condition" },
    ],
    pains: [
      "keep something going past the second week",
      "see progress that a scale refuses to show",
      "stop starting over every January",
      "notice the pattern behind a bad week",
      "do the boring rehab work without a nag",
      "make a plan that survives a chaotic schedule",
    ],
    keywords: ["health", "fitness", "gym", "workout", "sleep", "run", "diet", "mental", "habit", "wellness", "meditat"],
  },
  {
    id: "money",
    label: "Money & work",
    blurb: "Earning, spending, freelancing, and the admin around it",
    nouns: ["ledger", "float", "tally", "runway", "invoice", "purse", "margin"],
    focuses: [
      { id: "budget", label: "Everyday spending", hint: "Where it went, what's left" },
      { id: "freelance", label: "Freelance & invoicing", hint: "Quotes, chasing payment, rates" },
      { id: "saving", label: "Saving toward something", hint: "A goal with a real date on it" },
      { id: "shared", label: "Shared money", hint: "Housemates, couples, splitting things" },
      { id: "career", label: "Job hunting & career", hint: "Applications, interviews, portfolios" },
      { id: "smallbiz", label: "Running something small", hint: "Stock, orders, one-person operations" },
    ],
    audiences: [
      { id: "students", label: "students" },
      { id: "freelancers", label: "freelancers" },
      { id: "firstjob", label: "people in their first real job" },
      { id: "housemates", label: "housemates" },
      { id: "sidehustle", label: "people with a side project that earns a little" },
      { id: "irregular", label: "people on irregular income" },
    ],
    pains: [
      "find out where the money actually goes",
      "stop dreading the end of the month",
      "chase an invoice without feeling rude",
      "split things fairly without a spreadsheet fight",
      "know whether this month was good or bad",
      "price their work without guessing",
    ],
    keywords: ["money", "budget", "finance", "invoice", "freelance", "job", "career", "salary", "expense", "saving", "business"],
  },
  {
    id: "learning",
    label: "Learning & study",
    blurb: "Picking things up and actually making them stick",
    nouns: ["recall", "drill", "syllabus", "deck", "margin", "primer", "atlas"],
    focuses: [
      { id: "language", label: "Languages", hint: "Vocabulary, speaking, staying consistent" },
      { id: "exams", label: "Exams & revision", hint: "Deadlines, past papers, cramming" },
      { id: "selftaught", label: "Teaching yourself", hint: "Courses half-finished, tutorials hoarded" },
      { id: "reading", label: "Reading better", hint: "Notes, highlights, remembering any of it" },
      { id: "practice", label: "Deliberate practice", hint: "Drills, reps, feedback loops" },
      { id: "teaching", label: "Explaining to others", hint: "Tutoring, notes for a friend, study groups" },
    ],
    audiences: [
      { id: "selfstudy", label: "self-taught learners" },
      { id: "school", label: "school students" },
      { id: "uni", label: "university students" },
      { id: "switchers", label: "career switchers" },
      { id: "tutors", label: "tutors" },
      { id: "curious", label: "curious hobbyists" },
    ],
    pains: [
      "remember something a week later, not an hour later",
      "finish a course they actually paid for",
      "turn twelve open tabs into one plan",
      "practise the hard part instead of the fun part",
      "study when motivation has left the building",
      "prove to themselves that they improved",
    ],
    keywords: ["learn", "study", "language", "exam", "school", "course", "teach", "flashcard", "revision", "tutor", "read"],
  },
  {
    id: "creative",
    label: "Making things",
    blurb: "Writing, music, art, craft, and getting unstuck",
    nouns: ["draft", "sketch", "chord", "loom", "scrap", "verse", "palette"],
    focuses: [
      { id: "writing", label: "Writing", hint: "Fiction, essays, the blank page" },
      { id: "music", label: "Music", hint: "Practice, recording, unfinished loops" },
      { id: "visual", label: "Drawing & design", hint: "Sketching, style, daily marks" },
      { id: "craft", label: "Craft & making", hint: "Knitting, woodwork, 3D printing" },
      { id: "photo", label: "Photography", hint: "Shooting, culling, actually printing" },
      { id: "publish", label: "Putting work out", hint: "Sharing, feedback, an audience of nine" },
    ],
    audiences: [
      { id: "hobbyists", label: "hobbyists" },
      { id: "blocked", label: "people who are stuck mid-project" },
      { id: "beginners2", label: "nervous beginners" },
      { id: "pros", label: "working creatives" },
      { id: "collectors", label: "people with a hard drive full of unfinished work" },
      { id: "duos", label: "pairs who make things together" },
    ],
    pains: [
      "finish one thing instead of starting five",
      "make something small every single day",
      "get honest feedback that isn't just 'nice'",
      "find their way back into a project they abandoned",
      "see how far their work has come",
      "share work without the dread",
    ],
    keywords: ["write", "writing", "music", "art", "draw", "design", "craft", "photo", "creative", "novel", "song", "paint"],
  },
  {
    id: "games",
    label: "Games & play",
    blurb: "Playing, running, and building small games",
    nouns: ["dice", "quest", "board", "token", "arcade", "campaign", "tile"],
    focuses: [
      { id: "tabletop", label: "Tabletop & TTRPG", hint: "Campaigns, characters, session prep" },
      { id: "videogames", label: "Video games", hint: "Backlogs, progress, co-op nights" },
      { id: "puzzles", label: "Puzzles & word games", hint: "Daily little brain snacks" },
      { id: "gamedev", label: "Making a small game", hint: "Prototypes, jams, one mechanic" },
      { id: "party", label: "Party & group games", hint: "Things to play with people in a room" },
      { id: "sports", label: "Local leagues & sport", hint: "Fixtures, teams, five-a-side chaos" },
    ],
    audiences: [
      { id: "gms", label: "game masters" },
      { id: "groups", label: "friend groups" },
      { id: "solo", label: "solo players" },
      { id: "families", label: "families with kids" },
      { id: "jammers", label: "game-jam first-timers" },
      { id: "clubs", label: "local clubs" },
    ],
    pains: [
      "stop the group chat from killing plans",
      "prep a session in twenty minutes",
      "finally finish a game in the backlog",
      "make something playable in a weekend",
      "keep score without arguments",
      "find a game everyone in the room will accept",
    ],
    keywords: ["game", "gaming", "rpg", "dnd", "board", "puzzle", "quiz", "play", "sport", "team", "arcade"],
  },
  {
    id: "social",
    label: "People & community",
    blurb: "Friendships, groups, and staying in touch on purpose",
    nouns: ["circle", "signal", "roster", "hearth", "table", "thread", "bell"],
    focuses: [
      { id: "keepintouch", label: "Keeping in touch", hint: "The friend you keep meaning to message" },
      { id: "events", label: "Organising things", hint: "Plans that survive contact with a group chat" },
      { id: "newpeople", label: "Meeting people", hint: "New city, new hobby, no one to go with" },
      { id: "community", label: "Running a community", hint: "Members, newcomers, keeping it alive" },
      { id: "family", label: "Family", hint: "Distant relatives, shared memory, logistics" },
      { id: "gifts", label: "Gifts & occasions", hint: "Birthdays that ambush you" },
    ],
    audiences: [
      { id: "movers", label: "people who just moved somewhere new" },
      { id: "organisers", label: "the one who always organises" },
      { id: "shy", label: "people who find messaging first hard" },
      { id: "longdistance", label: "long-distance friends" },
      { id: "mods", label: "community moderators" },
      { id: "bigfamilies", label: "large scattered families" },
    ],
    pains: [
      "message the friend they keep meaning to message",
      "turn 'we should do something' into a date",
      "remember what someone told them last time",
      "make a group decision in under a week",
      "welcome a newcomer properly",
      "never be ambushed by a birthday again",
    ],
    keywords: ["friend", "social", "community", "group", "event", "meetup", "family", "chat", "people", "gift", "party"],
  },
  {
    id: "home",
    label: "Home & daily life",
    blurb: "The small logistics that eat a week",
    nouns: ["shelf", "drawer", "hearth", "attic", "keyring", "inventory", "chore"],
    focuses: [
      { id: "chores", label: "Chores & upkeep", hint: "Who does what, and when it was last done" },
      { id: "stuff", label: "Owning things", hint: "Warranties, manuals, what's in the loft" },
      { id: "moving", label: "Moving & setting up", hint: "Boxes, addresses, the first week" },
      { id: "plants", label: "Plants & pets", hint: "Watering, feeding, keeping things alive" },
      { id: "repair", label: "Fixing & maintaining", hint: "Repairs, servicing, small DIY" },
      { id: "declutter", label: "Getting rid of things", hint: "Selling, donating, the slow purge" },
    ],
    audiences: [
      { id: "sharers", label: "people sharing a flat" },
      { id: "newhome", label: "first-time homeowners" },
      { id: "renters", label: "renters" },
      { id: "busyfamilies", label: "busy households" },
      { id: "minimal", label: "people trying to own less" },
      { id: "carers", label: "people running a household for others" },
    ],
    pains: [
      "stop asking whose turn it is",
      "find the thing they know they own",
      "keep a plant alive for longer than a month",
      "remember when it was last serviced",
      "clear one shelf without a whole Saturday",
      "hand the household over when they're away",
    ],
    keywords: ["home", "house", "chore", "clean", "plant", "pet", "diy", "repair", "declutter", "moving", "flat", "rent"],
  },
  {
    id: "food",
    label: "Food & cooking",
    blurb: "What's for dinner, and everything upstream of it",
    nouns: ["pantry", "larder", "batch", "recipe", "crumb", "simmer", "market"],
    focuses: [
      { id: "weeknight", label: "Weeknight cooking", hint: "Fast, repeatable, no shopping trip" },
      { id: "planning", label: "Meal planning", hint: "A week decided in ten minutes" },
      { id: "waste", label: "Using things up", hint: "The sad vegetable drawer" },
      { id: "skills", label: "Getting better at cooking", hint: "Technique, not just recipes" },
      { id: "diets", label: "Eating around a constraint", hint: "Allergies, budgets, preferences" },
      { id: "hosting", label: "Feeding people", hint: "Guests, batch cooking, timing everything" },
    ],
    audiences: [
      { id: "cantcook", label: "people who genuinely can't cook yet" },
      { id: "tired", label: "people who cook at 8pm exhausted" },
      { id: "budgetcooks", label: "people cooking on a tight budget" },
      { id: "allergy", label: "households with an allergy to work around" },
      { id: "batchers", label: "batch cookers" },
      { id: "hosts", label: "people who host a lot" },
    ],
    pains: [
      "decide dinner without a twenty-minute stalemate",
      "use what's already in the fridge",
      "cook the same six things really well",
      "shop once and not think again",
      "throw away less food",
      "time four dishes to land together",
    ],
    keywords: ["food", "cook", "recipe", "meal", "kitchen", "eat", "restaurant", "grocery", "dinner", "bake", "diet"],
  },
  {
    id: "outdoors",
    label: "Travel & outdoors",
    blurb: "Going places, near and far",
    nouns: ["trail", "compass", "harbor", "waypoint", "lantern", "detour", "ridge"],
    focuses: [
      { id: "trips", label: "Planning trips", hint: "Ideas, logistics, the actual booking" },
      { id: "local", label: "Exploring nearby", hint: "The town you've stopped looking at" },
      { id: "hiking", label: "Hiking & walking", hint: "Routes, conditions, pace" },
      { id: "cycling", label: "Cycling & commuting", hint: "Routes, maintenance, weather" },
      { id: "camping", label: "Camping & gear", hint: "Kit lists, weight, what you forgot" },
      { id: "memory", label: "Remembering trips", hint: "Photos, notes, the good bits" },
    ],
    audiences: [
      { id: "weekenders", label: "weekend travellers" },
      { id: "soloTravel", label: "solo travellers" },
      { id: "familyTrip", label: "families travelling with kids" },
      { id: "commuters", label: "daily commuters" },
      { id: "hikers", label: "hikers" },
      { id: "vanlife", label: "people who live on the move" },
    ],
    pains: [
      "plan a trip without forty open tabs",
      "find something worth doing this Saturday",
      "pack without forgetting the one thing",
      "pick a route that matches how they feel today",
      "keep the memory of a trip after the photos scatter",
      "decide fast when the weather changes",
    ],
    keywords: ["travel", "trip", "hike", "outdoor", "bike", "cycling", "camp", "map", "walk", "explore", "nature", "commute"],
  },
  {
    id: "climate",
    label: "Nature & climate",
    blurb: "The world outside and your footprint in it",
    nouns: ["canopy", "tide", "sprout", "meadow", "carbon", "bloom", "compost"],
    focuses: [
      { id: "footprint", label: "Personal footprint", hint: "Energy, travel, what actually moves the needle" },
      { id: "wildlife", label: "Wildlife & noticing", hint: "Birds, bugs, what's in the hedge" },
      { id: "growing", label: "Growing things", hint: "Allotments, balconies, seasons" },
      { id: "repair2", label: "Repair & reuse", hint: "Keeping things out of the bin" },
      { id: "localnature", label: "Local nature", hint: "Rivers, parks, litter, tree cover" },
      { id: "weather", label: "Weather & seasons", hint: "Planning around what the sky is doing" },
    ],
    audiences: [
      { id: "curiousGreen", label: "people who want to help but don't know where" },
      { id: "gardeners", label: "balcony gardeners" },
      { id: "birders", label: "casual bird watchers" },
      { id: "schools", label: "school classes" },
      { id: "volunteers", label: "local volunteers" },
      { id: "sceptics", label: "people tired of vague green advice" },
    ],
    pains: [
      "know which change is actually worth making",
      "notice what's living on their street",
      "keep a balcony garden going through a season",
      "repair something instead of replacing it",
      "get a neighbourhood to do one thing together",
      "plan around the weather instead of against it",
    ],
    keywords: ["climate", "nature", "green", "garden", "plant", "bird", "environment", "sustain", "recycle", "weather", "carbon"],
  },
  {
    id: "dev",
    label: "Tools for developers",
    blurb: "Things that make building things less annoying",
    nouns: ["pipe", "lint", "commit", "trace", "stack", "diff", "harness"],
    focuses: [
      { id: "debug", label: "Debugging & logs", hint: "Finding the thing that broke" },
      { id: "docs", label: "Docs & onboarding", hint: "Understanding a codebase you didn't write" },
      { id: "workflow", label: "Daily workflow", hint: "Terminal, editor, the tiny frictions" },
      { id: "review", label: "Code review", hint: "Reading diffs like a human" },
      { id: "deploy", label: "Shipping & releases", hint: "Getting it live without fear" },
      { id: "sideprojects", label: "Side projects", hint: "The graveyard of half-built repos" },
    ],
    audiences: [
      { id: "juniors", label: "junior developers" },
      { id: "soloDevs", label: "solo developers" },
      { id: "smallteams", label: "small teams" },
      { id: "oss", label: "open source maintainers" },
      { id: "bootcamp", label: "bootcamp graduates" },
      { id: "hobbyDevs", label: "people who code for fun after work" },
    ],
    pains: [
      "understand a codebase on day one",
      "stop rewriting the same setup every project",
      "see what changed and why it matters",
      "ship a side project instead of shelving it",
      "reproduce a bug reliably",
      "keep the good parts of a dead project",
    ],
    keywords: ["dev", "code", "coding", "programming", "developer", "cli", "api", "git", "debug", "terminal", "software"],
  },
  {
    id: "ai",
    label: "AI & automation",
    blurb: "Handing off the parts nobody wants to do",
    nouns: ["agent", "relay", "sift", "loop", "oracle", "conveyor", "sieve"],
    focuses: [
      { id: "inbox", label: "Inbox & messages", hint: "Triage, drafts, the pile" },
      { id: "summarise", label: "Reading less", hint: "Long things made short and honest" },
      { id: "repetitive", label: "Repetitive admin", hint: "The same fifteen minutes every day" },
      { id: "research", label: "Research & gathering", hint: "Finding, comparing, keeping track" },
      { id: "personal", label: "A personal assistant", hint: "One that knows your actual context" },
      { id: "creativeAI", label: "Creative helper", hint: "A collaborator, not a replacement" },
    ],
    audiences: [
      { id: "overwhelmed", label: "people drowning in admin" },
      { id: "nontech", label: "people who don't code" },
      { id: "researchers", label: "researchers" },
      { id: "smallbizAI", label: "one-person businesses" },
      { id: "writers", label: "writers" },
      { id: "sceptical", label: "people suspicious of AI hype" },
    ],
    pains: [
      "get an hour back from admin every week",
      "read the important part and skip the rest",
      "keep a decision trail they can actually check",
      "automate something without learning to code",
      "stop copy-pasting between the same two apps",
      "trust the output enough to send it",
    ],
    keywords: ["ai", "automat", "assistant", "agent", "llm", "chatbot", "gpt", "workflow", "summar", "bot"],
  },
  {
    id: "media",
    label: "Video, photo & audio",
    blurb: "Capturing things and doing something with them afterwards",
    nouns: ["reel", "frame", "cut", "archive", "shutter", "waveform", "negative"],
    focuses: [
      { id: "editing", label: "Editing", hint: "The long middle bit" },
      { id: "library", label: "Libraries & archives", hint: "Forty thousand photos, zero structure" },
      { id: "shortform", label: "Short-form video", hint: "Hooks, clips, posting consistently" },
      { id: "podcast", label: "Podcasts & audio", hint: "Recording, trimming, publishing" },
      { id: "family2", label: "Family media", hint: "Old tapes, shared albums, memory" },
      { id: "learn2", label: "Learning the craft", hint: "Getting better at shooting" },
    ],
    audiences: [
      { id: "creators", label: "small creators" },
      { id: "hoarders", label: "people with an unsorted photo library" },
      { id: "podcasters", label: "podcasters" },
      { id: "documenters", label: "people documenting a project" },
      { id: "familyArchivists", label: "the family archivist" },
      { id: "students2", label: "film students" },
    ],
    pains: [
      "find the clip they know exists",
      "cut a rough edit in one sitting",
      "post consistently without burning out",
      "rescue a decade of unsorted photos",
      "turn a long recording into something watchable",
      "see their own work improve over time",
    ],
    keywords: ["video", "photo", "audio", "podcast", "edit", "film", "camera", "youtube", "clip", "record", "media"],
  },
  {
    id: "civic",
    label: "Local life",
    blurb: "The street, the town, and the people running it",
    nouns: ["ward", "notice", "bench", "parish", "hall", "beacon", "register"],
    focuses: [
      { id: "localinfo", label: "Knowing what's happening", hint: "Events, closures, decisions" },
      { id: "volunteering", label: "Volunteering", hint: "Finding it, doing it, keeping it going" },
      { id: "smallbizLocal", label: "Local businesses", hint: "Supporting the ones that stay" },
      { id: "reporting", label: "Reporting problems", hint: "Potholes, lights, the thing nobody fixes" },
      { id: "transit", label: "Getting around", hint: "Buses, timetables, actual reality" },
      { id: "access", label: "Access & inclusion", hint: "Whether a place actually works for everyone" },
    ],
    audiences: [
      { id: "newresidents", label: "new residents" },
      { id: "councillors", label: "local organisers" },
      { id: "smallshops", label: "independent shop owners" },
      { id: "wheelchair", label: "wheelchair users" },
      { id: "commuters2", label: "bus commuters" },
      { id: "neighbours", label: "neighbours who've never spoken" },
    ],
    pains: [
      "find out what's happening on their street",
      "report something and see it actually tracked",
      "know if a place is accessible before turning up",
      "support a local business more than once",
      "get five neighbours to agree on one thing",
      "understand a decision that affects them",
    ],
    keywords: ["local", "city", "town", "council", "neighbour", "civic", "volunteer", "transport", "bus", "accessib", "community"],
  },
];

export type Mechanic = {
  id: string;
  label: string;
  /** Slots into "A {phrase} that helps …". */
  phrase: string;
  /** Weight by how much building experience it wants, 0 (easy) – 3 (hard). */
  weight: number;
  /** Surfaces this mechanic is a natural fit for. */
  surfaces: string[];
  /** Step templates. {focus} {audience} {noun} {domain} are substituted. */
  steps: string[];
  stretch: string;
};

export const MECHANICS: Mechanic[] = [
  {
    id: "tracker",
    label: "Tracker",
    phrase: "quiet tracker",
    weight: 0,
    surfaces: ["web", "mobile", "cli"],
    steps: [
      "Design one screen that answers 'how am I doing?' in a single glance.",
      "Make logging an entry take under five seconds — one tap, no forms.",
      "Store everything locally first so it works before any account exists.",
    ],
    stretch: "Add a weekly review that shows the one number that moved most.",
  },
  {
    id: "generator",
    label: "Generator",
    phrase: "generator",
    weight: 0,
    surfaces: ["web", "mobile"],
    steps: [
      "Write out fifty real examples by hand before writing any code.",
      "Find the three or four dials that make an output feel different.",
      "Ship a single button that produces something good, then add controls.",
    ],
    stretch: "Let people save favourites and generate 'more like this one'.",
  },
  {
    id: "matcher",
    label: "Matcher",
    phrase: "matchmaker",
    weight: 1,
    surfaces: ["web", "mobile"],
    steps: [
      "Define what a good match means in one honest sentence.",
      "Build the input side first — a form that captures what someone needs.",
      "Fake the matching by hand for ten users before you automate it.",
    ],
    stretch: "Show the reasoning behind each match so people can correct it.",
  },
  {
    id: "planner",
    label: "Planner",
    phrase: "planner",
    weight: 1,
    surfaces: ["web", "mobile", "desktop"],
    steps: [
      "Model one week, not one year — the short horizon is the whole product.",
      "Make rearranging feel physical: drag, drop, undo.",
      "Add a 'this went wrong' path, because plans always break.",
    ],
    stretch: "Learn from what actually happened and adjust next week's plan.",
  },
  {
    id: "visualiser",
    label: "Visualiser",
    phrase: "visualiser",
    weight: 1,
    surfaces: ["web", "desktop", "data"],
    steps: [
      "Pick one question the picture must answer, and cut everything else.",
      "Get real data in early, even if you paste it from a spreadsheet.",
      "Make the default view readable on a phone with no zooming.",
    ],
    stretch: "Let people export a single image worth sharing.",
  },
  {
    id: "nudger",
    label: "Nudger",
    phrase: "gentle coach",
    weight: 0,
    surfaces: ["web", "mobile"],
    steps: [
      "Decide exactly when it speaks — the timing is the product.",
      "Write ten messages by hand and read them out loud. Cut the smug ones.",
      "Give people one tap to say 'not now' and have it genuinely listen.",
    ],
    stretch: "Adapt the tone as someone's streak grows or collapses.",
  },
  {
    id: "library",
    label: "Library",
    phrase: "well-kept library",
    weight: 1,
    surfaces: ["web", "desktop"],
    steps: [
      "Nail search and filtering before anything else — that's the whole value.",
      "Make adding an item nearly free, or the library will stay empty.",
      "Seed it with a hundred real entries so day one doesn't feel dead.",
    ],
    stretch: "Add collections people can share as a single link.",
  },
  {
    id: "capture",
    label: "Capture tool",
    phrase: "capture tool",
    weight: 1,
    surfaces: ["mobile", "desktop", "cli"],
    steps: [
      "Cut the path from 'I want to save this' to saved down to one action.",
      "Handle the messy input first: half-typed, offline, mid-sentence.",
      "Give everything a home later, not at the moment of capture.",
    ],
    stretch: "Add a weekly sweep that turns loose captures into something ordered.",
  },
  {
    id: "digest",
    label: "Digest",
    phrase: "digest",
    weight: 1,
    surfaces: ["web", "data"],
    steps: [
      "Write three editions by hand and send them to five people.",
      "Only then automate the part that was boring to do manually.",
      "Keep it short enough to read standing up.",
    ],
    stretch: "Personalise each edition from what the reader actually opened.",
  },
  {
    id: "simulator",
    label: "Simulator",
    phrase: "what-if simulator",
    weight: 2,
    surfaces: ["web", "desktop", "data"],
    steps: [
      "Start with three sliders and one output number.",
      "Be explicit about the assumptions — show them on screen.",
      "Make a wrong answer obviously wrong, so people trust the right ones.",
    ],
    stretch: "Save scenarios side by side so two futures can be compared.",
  },
  {
    id: "challenge",
    label: "Challenge",
    phrase: "challenge",
    weight: 1,
    surfaces: ["web", "mobile"],
    steps: [
      "Design one round that works for a single player with no friends yet.",
      "Make the difficulty adapt, so week four still stings a little.",
      "Give people something to show for finishing.",
    ],
    stretch: "Let two people run the same challenge and compare quietly.",
  },
  {
    id: "annotator",
    label: "Annotator",
    phrase: "annotation layer",
    weight: 2,
    surfaces: ["web", "desktop"],
    steps: [
      "Pick one thing to annotate and support it perfectly before adding a second.",
      "Make notes survive the source changing underneath them.",
      "Let people read back their notes without the original open.",
    ],
    stretch: "Turn a set of annotations into a summary someone else can use.",
  },
  {
    id: "marketplace",
    label: "Small marketplace",
    phrase: "small marketplace",
    weight: 3,
    surfaces: ["web", "mobile"],
    steps: [
      "Solve one side of the market first, by hand, in one neighbourhood.",
      "Build listings and messaging; skip payments until people ask.",
      "Set the trust rules early — they're harder to add later.",
    ],
    stretch: "Add a light reputation signal that can't be gamed in a week.",
  },
  {
    id: "remixer",
    label: "Remixer",
    phrase: "remixer",
    weight: 2,
    surfaces: ["web", "desktop", "mobile"],
    steps: [
      "Get one input in and one transformed output back. Nothing else.",
      "Make the transformation visible — show before and after together.",
      "Allow undo everywhere; people experiment when it's safe to.",
    ],
    stretch: "Chain two transformations and save the chain as a preset.",
  },
  {
    id: "companion",
    label: "Companion",
    phrase: "companion app",
    weight: 1,
    surfaces: ["mobile", "web"],
    steps: [
      "Assume the person is mid-activity: big targets, one hand, bad light.",
      "Work offline, because the moment it's needed there's no signal.",
      "Do one job brilliantly rather than four adequately.",
    ],
    stretch: "Add a quiet after-the-fact summary of the session.",
  },
  {
    id: "directory",
    label: "Directory",
    phrase: "directory",
    weight: 0,
    surfaces: ["web"],
    steps: [
      "Gather the first eighty entries yourself. This is the unglamorous moat.",
      "Make one filter genuinely excellent instead of six that are vague.",
      "Give every entry a page worth linking to.",
    ],
    stretch: "Let the people listed claim and update their own entries.",
  },
];

export type Twist = {
  id: string;
  label: string;
  /** Appended to the pitch. */
  clause: string;
  weight: number;
};

export const TWISTS: Twist[] = [
  { id: "offline", label: "Offline-first", clause: "and works completely offline", weight: 1 },
  { id: "sixtysec", label: "Sixty seconds a day", clause: "in under a minute a day", weight: 0 },
  { id: "noaccount", label: "No accounts", clause: "without ever asking anyone to sign up", weight: 0 },
  { id: "onefriend", label: "Shared with one person", clause: "and is shared with exactly one other person", weight: 1 },
  { id: "getsharder", label: "Escalating", clause: "and quietly gets harder as they improve", weight: 1 },
  { id: "paper", label: "Ends in paper", clause: "and ends the week as something printed", weight: 1 },
  { id: "voice", label: "Voice-first", clause: "using nothing but their voice", weight: 2 },
  { id: "camera", label: "Camera-driven", clause: "starting from a single photo", weight: 2 },
  { id: "local", label: "Neighbourhood-sized", clause: "for one neighbourhood at a time", weight: 1 },
  { id: "slow", label: "Deliberately slow", clause: "on purpose, one thing per day, never more", weight: 0 },
  { id: "single", label: "One screen only", clause: "on a single screen with no navigation", weight: 0 },
  { id: "seasonal", label: "Seasonal", clause: "and changes completely with the season", weight: 1 },
  { id: "twoplayer", label: "Two-player", clause: "and only works when two people use it", weight: 2 },
  { id: "retro", label: "Looks back", clause: "and shows them this day one year ago", weight: 1 },
];

/** Suffixes used to build product names from domain nouns. */
export const NAME_SUFFIXES = [
  "loop", "nest", "mark", "kit", "well", "forge", "path", "bell",
  "drift", "harbor", "lane", "court", "keep", "span", "hold", "yard",
];

/** Adjectives for the occasional two-word name. */
export const NAME_ADJECTIVES = [
  "Slow", "Quiet", "Plain", "Small", "Steady", "Bright", "Second", "Open",
  "Daily", "Kind", "Sharp", "Near",
];

export const SURFACES: { id: string; label: string; hint: string; stack: string[] }[] = [
  { id: "web", label: "A website", hint: "Opens in a browser, nothing to install", stack: ["Next.js", "TypeScript", "Tailwind"] },
  { id: "mobile", label: "A phone app", hint: "Lives in a pocket", stack: ["React Native", "Expo"] },
  { id: "desktop", label: "A desktop app", hint: "A real window on a real computer", stack: ["Tauri", "React"] },
  { id: "cli", label: "A command-line tool", hint: "Fast, text, no interface to design", stack: ["Node", "TypeScript"] },
  { id: "nocode", label: "Something with no code", hint: "Spreadsheets, forms, automations", stack: ["Airtable", "Zapier"] },
  { id: "data", label: "Something data-shaped", hint: "Charts, analysis, notebooks", stack: ["Python", "DuckDB"] },
];

export const SKILL_AREAS: { id: string; label: string; hint: string; surfaces: string[] }[] = [
  { id: "frontend", label: "Building interfaces", hint: "HTML, CSS, React, design", surfaces: ["web", "mobile", "desktop"] },
  { id: "backend", label: "Servers & data", hint: "APIs, databases, the back end", surfaces: ["web", "data", "cli"] },
  { id: "scripting", label: "Scripting & automation", hint: "Small scripts that do a job", surfaces: ["cli", "data", "nocode"] },
  { id: "design", label: "Design & visuals", hint: "Layout, type, colour, taste", surfaces: ["web", "mobile"] },
  { id: "writing", label: "Writing", hint: "Words, docs, explaining things", surfaces: ["web", "nocode"] },
  { id: "data", label: "Data & analysis", hint: "Spreadsheets, stats, charts", surfaces: ["data", "nocode"] },
  { id: "spreadsheets", label: "Spreadsheets", hint: "Formulas, tables, quiet power", surfaces: ["nocode", "data"] },
  { id: "hardware", label: "Hardware & tinkering", hint: "Wires, printers, physical things", surfaces: ["desktop", "cli"] },
];

export const MOTIVATIONS: { id: string; label: string; hint: string }[] = [
  { id: "learn", label: "Learn something new", hint: "The project is an excuse to grow" },
  { id: "portfolio", label: "Have something to show", hint: "Interviews, clients, proof" },
  { id: "scratch", label: "Fix my own annoyance", hint: "Built for exactly one user: me" },
  { id: "income", label: "Maybe earn from it", hint: "Small, real, not a unicorn" },
  { id: "fun", label: "Just for the fun of it", hint: "No further justification needed" },
  { id: "people", label: "Help people I know", hint: "A real person already needs this" },
];

export const FRUSTRATIONS: { id: string; label: string; domains: string[] }[] = [
  { id: "forget", label: "I forget things I meant to do", domains: ["home", "social", "learning"] },
  { id: "toomanytabs", label: "I drown in tabs and notes", domains: ["learning", "ai", "media"] },
  { id: "moneyleak", label: "Money disappears and I don't know where", domains: ["money"] },
  { id: "dinner", label: "Deciding what to eat is exhausting", domains: ["food"] },
  { id: "unfinished", label: "I start things and never finish them", domains: ["creative", "dev", "learning"] },
  { id: "lonely", label: "I don't see my friends enough", domains: ["social", "games"] },
  { id: "admin", label: "Admin eats my week", domains: ["ai", "money", "home"] },
  { id: "sitting", label: "I sit down too much", domains: ["health", "outdoors"] },
  { id: "photos", label: "My photos are an unsorted mess", domains: ["media"] },
  { id: "bored", label: "My weekends blur together", domains: ["outdoors", "games", "civic"] },
  { id: "waste", label: "I throw away too much stuff", domains: ["climate", "food", "home"] },
  { id: "stuck", label: "I want to get better at something and I'm stuck", domains: ["learning", "creative", "health"] },
];

export const VIBES: { id: string; label: string; hint: string; domains: string[]; twists: string[] }[] = [
  { id: "cosy", label: "Cosy and small", hint: "Something warm you'd use alone", domains: ["home", "food", "creative"], twists: ["slow", "single", "paper"] },
  { id: "useful", label: "Bluntly useful", hint: "Saves time, no charm required", domains: ["money", "ai", "dev"], twists: ["sixtysec", "noaccount", "offline"] },
  { id: "playful", label: "Playful and odd", hint: "Makes people smile first", domains: ["games", "creative", "media"], twists: ["getsharder", "twoplayer", "retro"] },
  { id: "outward", label: "Out in the world", hint: "Involves other people or places", domains: ["social", "civic", "outdoors"], twists: ["local", "onefriend", "seasonal"] },
  { id: "quiet", label: "Quiet and reflective", hint: "Notices things, doesn't shout", domains: ["health", "climate", "learning"], twists: ["retro", "slow", "paper"] },
  { id: "technical", label: "Properly technical", hint: "You want the hard bit", domains: ["dev", "ai", "media"], twists: ["voice", "camera", "offline"] },
];

export const DOMAIN_BY_ID = new Map(DOMAINS.map((d) => [d.id, d]));
export const MECHANIC_BY_ID = new Map(MECHANICS.map((m) => [m.id, m]));
export const TWIST_BY_ID = new Map(TWISTS.map((t) => [t.id, t]));
