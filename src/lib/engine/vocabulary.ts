export const DOMAIN_TERMS: Record<string, string[]> = {
  health: [
    "health", "healthy", "fitness", "exercise", "body", "wellbeing", "wellness",
    "mental health", "weight", "calories", "steps", "yoga", "energy", "tired",
    "burnout", "mindfulness", "meditation", "symptom", "medication", "doctor",
    "self improvement", "self care", "get in shape", "feel better",
  ],
  money: [
    "money", "budget", "budgeting", "spending", "income", "salary", "wage",
    "invoice", "freelance", "freelancing", "client", "tax", "bill", "subscription",
    "price", "pricing", "saving", "debt", "bank", "finance", "financial", "cost",
    "afford", "pension", "investment", "business", "side income", "get paid",
  ],
  learning: [
    "learn", "learning", "study", "studying", "student", "school", "university",
    "college", "course", "tutorial", "teacher", "teaching", "exam", "revision",
    "knowledge", "skill", "memorise", "memorize", "flashcard", "lesson",
    "curriculum", "textbook", "understand", "practise", "practice",
  ],
  creative: [
    "creative", "creativity", "art", "artist", "writing", "writer", "music",
    "musician", "drawing", "design", "craft", "hobby", "poem", "poetry", "novel",
    "painting", "sketch", "guitar", "knitting", "woodwork", "pottery",
    "make things", "creative block",
  ],
  media: [
    "video", "photo", "photography", "camera", "audio", "podcast", "editing",
    "youtube", "tiktok", "instagram", "reels", "shorts", "footage", "recording",
    "stream", "streaming", "twitch", "clip", "thumbnail", "subtitle", "media",
    "content creation", "creator",
  ],
  games: [
    "game", "games", "gaming", "gamer", "player", "board game", "video game",
    "rpg", "dnd", "dungeons and dragons", "quiz", "puzzle", "arcade", "steam",
    "console", "minecraft", "game jam", "level", "mechanic", "playing",
  ],
  social: [
    "friend", "friends", "friendship", "community", "group", "club", "meetup",
    "event", "neighbour", "neighbor", "neighbourhood", "family", "social",
    "together", "volunteer", "group chat", "catch up", "loneliness", "lonely",
    "staying in touch", "relationship",
  ],
  home: [
    "home", "house", "flat", "apartment", "household", "chore", "cleaning",
    "tidy", "declutter", "moving house", "diy", "repair", "appliance",
    "warranty", "manual", "garden", "plant", "pet", "dog", "cat", "laundry",
    "bins", "landlord",
  ],
  food: [
    "food", "cooking", "cook", "recipe", "meal", "kitchen", "dinner", "lunch",
    "breakfast", "eating", "grocery", "groceries", "shopping list", "fridge",
    "freezer", "leftovers", "baking", "restaurant", "ingredient", "diet",
    "vegan", "vegetarian", "batch cook", "takeaway",
  ],
  outdoors: [
    "travel", "trip", "holiday", "flight", "hotel", "itinerary", "hiking",
    "walking", "cycling", "bike", "camping", "outdoors", "outside", "nature",
    "weather", "map", "park", "mountain", "beach", "commute", "explore",
    "wildlife", "adventure",
  ],
  dev: [
    "code", "coding", "programming", "developer", "software", "engineer",
    "repo", "repository", "github", "git", "api", "cli", "terminal", "bug",
    "debug", "deploy", "framework", "library", "typescript", "python",
    "javascript", "react", "database", "devtools", "side project", "open source",
  ],
  ai: [
    "ai", "artificial intelligence", "llm", "gpt", "chatgpt", "claude", "model",
    "prompt", "agent", "chatbot", "automation", "automate", "script", "bot",
    "summarise", "summarize", "transcribe", "classify", "zapier",
    "does it for me", "saves me time",
  ],
};

export const FOCUS_TERMS: Record<string, string[]> = {
  "health:habits": [
    "habit", "habits", "streak", "routine", "daily", "consistency", "discipline",
    "willpower", "stick to", "keep it up", "resolution", "self improvement",
    "better version of myself", "accountability", "motivation", "productive",
    "productivity", "self control", "morning",
    "procrastination", "morning routine", "track my day",
  ],
  "health:training": [
    "workout", "gym", "lifting", "weights", "strength", "reps", "sets",
    "programme", "program", "training", "running", "marathon", "couch to 5k",
    "progressive overload", "personal best", "exercise plan", "cardio", "fitness plan",
  ],
  "health:sleep": [
    "sleep", "sleeping", "bedtime", "insomnia", "tired", "nap", "wake up",
    "alarm", "circadian", "rest", "fatigue", "energy levels", "wind down",
    "screen time at night", "oversleeping",
  ],
  "health:recovery": [
    "injury", "injured", "rehab", "physio", "physiotherapy", "recovery", "pain",
    "back pain", "knee", "stretching", "mobility", "chronic pain", "posture",
    "flare up", "range of motion",
  ],
  "money:spending": [
    "spending", "expense", "expenses", "transaction", "bank statement",
    "where my money goes", "overspending", "subscription", "direct debit",
    "track spending", "outgoings", "cost of living",
  ],
  "money:freelance": [
    "freelance", "invoice", "invoicing", "client", "quote", "rate", "contract",
    "chase payment", "late payment", "self employed", "hourly rate", "timesheet",
    "proposal", "billable", "day rate",
  ],
  "money:saving": [
    "saving", "save up", "savings goal", "deposit", "house deposit", "target",
    "emergency fund", "sinking fund", "saving for", "put money aside", "nest egg",
  ],
  "money:shared": [
    "split", "splitting", "shared", "housemate", "flatmate", "roommate",
    "couple", "who owes", "settle up", "group expense", "shared bill",
    "split the bill", "owes me",
  ],
  "learning:language": [
    "language", "vocabulary", "vocab", "spanish", "french", "japanese", "german",
    "italian", "fluent", "fluency", "speaking practice", "translation",
    "duolingo", "conversation practice", "grammar", "native speaker",
  ],
  "learning:exams": [
    "exam", "revision", "revise", "past paper", "gcse", "a level", "sat",
    "test prep", "syllabus", "cram", "cramming", "study plan", "grades",
    "coursework", "finals",
  ],
  "learning:selftaught": [
    "self taught", "online course", "tutorial", "udemy", "bootcamp",
    "learning path", "roadmap", "unfinished course", "skill up", "upskill",
    "teach myself", "never finish a course", "youtube tutorials",
  ],
  "learning:recall": [
    "notes", "note taking", "highlight", "highlights", "kindle", "retention",
    "remember what i read", "spaced repetition", "second brain", "obsidian",
    "notion", "zettelkasten", "reading list", "book notes", "forget what i read",
  ],
  "creative:writing": [
    "writing", "write", "writer", "novel", "fiction", "essay", "blog", "blog post",
    "draft", "blank page", "word count", "nanowrimo", "screenplay", "poetry",
    "journal", "journalling", "storytelling", "manuscript",
  ],
  "creative:music": [
    "music", "song", "songwriting", "guitar", "piano", "drums", "band",
    "recording", "mixing", "ableton", "chords", "scales", "riff", "loop",
    "practice sessions", "producing", "beat",
  ],
  "creative:visual": [
    "drawing", "sketch", "sketching", "illustration", "art style", "digital art",
    "procreate", "daily drawing", "colour palette", "color palette",
    "reference photo", "figure drawing", "graphic design", "logo",
  ],
  "creative:craft": [
    "craft", "knitting", "crochet", "sewing", "woodwork", "pottery", "ceramics",
    "3d print", "laser cut", "handmade", "materials", "pattern", "workshop",
    "maker", "resin",
  ],
  "media:archive": [
    "photo library", "unsorted photos", "backup", "duplicate photos",
    "google photos", "organise photos", "organize photos", "tagging", "metadata",
    "hard drive", "archive", "thousands of photos", "camera roll",
  ],
  "media:shortform": [
    "short form", "tiktok", "reels", "shorts", "clip", "clipping", "hook",
    "posting schedule", "viral", "captions", "vertical video", "editing clips",
    "content calendar", "repurpose",
  ],
  "media:podcast": [
    "podcast", "episode", "audio editing", "transcript", "rss", "interview",
    "microphone", "trimming silence", "publishing", "show notes", "guest",
  ],
  "media:familymedia": [
    "family photos", "old tapes", "vhs", "scanning", "album", "memories",
    "grandparents", "shared album", "home video", "who is in the photo",
    "childhood photos",
  ],
  "games:tabletop": [
    "dnd", "dungeons and dragons", "ttrpg", "tabletop", "campaign", "session",
    "dungeon master", "character sheet", "encounter", "dice", "lore", "npc",
    "pathfinder", "warhammer",
  ],
  "games:videogames": [
    "backlog", "steam", "console", "co-op", "multiplayer", "achievements",
    "playtime", "what to play next", "game library", "playstation", "xbox",
    "switch", "speedrun",
  ],
  "games:gamedev": [
    "game dev", "make a game", "godot", "unity", "unreal", "prototype",
    "game jam", "game mechanic", "level design", "pixel art", "playtest",
    "small game", "roguelike",
  ],
  "games:party": [
    "party game", "quiz", "group game", "pub quiz", "icebreaker", "family game",
    "trivia", "game night", "one room", "drinking game",
  ],
  "social:keepintouch": [
    "keep in touch", "stay in touch", "message friends", "catch up", "birthday",
    "reach out", "lost touch", "long distance", "check in on", "old friends",
    "remember to message", "distant friends",
  ],
  "social:organising": [
    "organise", "organize", "plan a meetup", "group chat", "scheduling",
    "who is free", "rsvp", "doodle", "decide a date", "getting everyone together",
    "arranging", "invite",
  ],
  "social:community": [
    "community", "members", "discord", "forum", "newcomers", "moderation",
    "engagement", "society", "volunteer rota", "membership", "running a group",
    "server", "subreddit",
  ],
  "social:local": [
    "neighbourhood", "neighborhood", "local", "street", "town", "council",
    "noticeboard", "community garden", "local events", "parish", "high street",
    "village", "what is happening near me",
  ],
  "home:chores": [
    "chore", "chores", "cleaning rota", "tidy", "washing up", "laundry", "bins",
    "who does what", "household jobs", "cleaning schedule", "hoovering",
    "shared housework",
  ],
  "home:stuff": [
    "warranty", "manual", "inventory", "loft", "storage", "what i own",
    "receipts", "insurance", "serial number", "declutter", "belongings",
    "possessions", "clutter",
  ],
  "home:repair": [
    "repair", "fix", "broken", "spare parts", "right to repair", "ifixit",
    "restore", "mend", "worth fixing", "maintenance", "diy fix", "landfill",
  ],
  "home:plants": [
    "plant", "plants", "houseplant", "watering", "garden", "gardening",
    "seedling", "pet", "dog", "cat", "feeding", "aquarium", "keep alive",
    "repotting", "vet",
  ],
  "food:weeknight": [
    "weeknight", "quick dinner", "what to cook tonight", "simple recipe",
    "midweek", "after work", "twenty minutes", "easy meals", "cook tonight",
  ],
  "food:planning": [
    "meal plan", "meal planning", "weekly shop", "shopping list", "batch cook",
    "menu", "meal prep", "plan the week", "big shop", "what to buy",
  ],
  "food:waste": [
    "food waste", "leftovers", "use up", "expiry", "best before", "fridge",
    "throwing away food", "wilting", "scraps", "gone off", "wasting food",
    "bottom of the fridge",
  ],
  "food:hosting": [
    "hosting", "guests", "dinner party", "cooking for a crowd", "timings",
    "potluck", "feed people", "portions", "having people over", "christmas dinner",
  ],
  "outdoors:trips": [
    "trip", "holiday", "itinerary", "booking", "flight", "hotel", "packing",
    "travel plan", "city break", "open tabs", "vacation", "backpacking",
    "where to go",
  ],
  "outdoors:nearby": [
    "nearby", "day out", "weekend plan", "what to do today", "free hours",
    "hidden gems", "my town", "local spots", "afternoon out", "somewhere new",
  ],
  "outdoors:walking": [
    "walk", "walking", "hike", "hiking", "cycling", "bike ride", "route",
    "trail", "gpx", "pace", "elevation", "distance", "strava", "footpath",
    "ordnance survey",
  ],
  "outdoors:nature": [
    "nature", "birds", "birdwatching", "wildlife", "seasons", "foraging",
    "trees", "insects", "pond", "garden wildlife", "spotting", "identify a plant",
    "hedgerow",
  ],
  "dev:onboarding": [
    "codebase", "new repo", "unfamiliar code", "onboarding", "documentation",
    "legacy code", "understand the code", "architecture", "first day",
    "inherited a project", "reading code",
  ],
  "dev:debugging": [
    "bug", "debug", "debugging", "error", "stack trace", "logs", "reproduce",
    "flaky", "crash", "exception", "tracing", "root cause", "intermittent",
    "it works on my machine", "failing test", "unit test", "test suite",
  ],
  "dev:shipping": [
    "side project", "ship", "shipping", "deploy", "launch", "half finished",
    "never finished", "hosting", "domain", "vercel", "first users",
    "graveyard of projects", "get it live",
  ],
  "dev:workflow": [
    "workflow", "terminal", "shortcut", "cli tool", "keystrokes", "editor",
    "dotfiles", "boilerplate", "scaffold", "repetitive", "same commands",
    "developer experience", "tooling",
  ],
  "ai:inbox": [
    "inbox", "email", "emails", "triage", "unread", "reply",
    "draft reply", "whatsapp", "slack", "notifications", "pile of messages",
    "message overload", "unanswered",
  ],
  "ai:reading": [
    "summarise", "summarize", "summary", "long document", "pdf",
    "research paper", "article", "tldr", "skim", "reading pile", "report",
    "too much to read", "condense",
  ],
  "ai:admin": [
    "admin", "paperwork", "repetitive task", "forms", "data entry",
    "every week", "copy paste", "manual process", "boring task", "same thing again",
    "filling in",
  ],
  "ai:personal": [
    "personal assistant", "my notes", "my files", "context", "knows me",
    "personal ai", "my own data", "second brain", "remembers everything",
    "on my behalf",
  ],
};

export const SURFACE_TERMS: Record<string, string[]> = {
  web: ["website", "web app", "web page", "browser", "in a browser", "landing page", "extension", "chrome extension", "saas"],
  mobile: ["phone app", "mobile app", "ios", "android", "iphone", "on my phone", "pocket", "app store"],
  desktop: ["desktop app", "windows app", "mac app", "electron", "a real window", "on my computer", "tauri"],
  cli: ["cli", "command line", "terminal", "shell", "script", "npx", "run it from the terminal"],
  nocode: ["no code", "nocode", "spreadsheet", "google sheets", "airtable", "notion", "zapier", "automation", "form"],
  data: ["dashboard", "chart", "charts", "graph", "numbers", "statistics", "analytics", "data", "visualise", "visualize"],
};

export const MOTIVATION_TERMS: Record<string, string[]> = {
  scratch: ["for myself", "my own annoyance", "annoys me", "i keep", "my problem", "scratch my own itch", "for me"],
  learn: ["learn", "learning", "practice", "get better at", "teach myself", "an excuse to learn"],
  portfolio: ["portfolio", "interview", "show off", "cv", "resume", "prove", "employer", "recruiter"],
  income: ["earn", "money from it", "sell", "paid", "revenue", "customers", "monetise", "monetize", "business", "saas"],
  people: ["help people", "helps people", "help others", "for my friends", "for my mum", "for my dad", "someone i know", "improve their lives", "make life easier for"],
  fun: ["fun", "for fun", "silly", "just because", "enjoy", "play around"],
};

export const TIME_TERMS: Record<string, string[]> = {
  weekend: ["weekend", "a day", "one sitting", "quick build", "few hours"],
  "few-weeks": ["few weeks", "couple of weeks", "evenings", "a month"],
  "few-months": ["few months", "long project", "several months"],
  open: ["no deadline", "no rush", "whenever", "ongoing", "forever project"],
};

export const SELF_TERMS = [
  "for me", "for myself", "just me", "my own", "nobody else", "only i",
  "personal use", "i need", "i want", "my life",
];

export const FILLER = [
  "app", "application", "website", "site", "tool", "platform", "thing", "things",
  "project", "build", "building", "make", "making", "create", "creating", "help",
  "helps", "helping", "people", "person", "someone", "something", "better",
  "easier", "simple", "simply", "user", "users", "improve", "improving",
  "improvement", "life", "lives", "want", "wants", "need", "needs", "idea",
  "system", "software", "service", "small", "good", "great", "nice", "cool",
  "really", "actually", "basically", "kind", "sort", "stuff", "way", "ways",
  "would", "could", "should", "maybe", "like", "about", "that", "this", "with",
  "from", "into", "have", "having", "there", "their", "them", "they", "your",
  "you", "and", "the", "for", "but", "not", "all", "any", "one", "get", "got",
  "let", "lets", "its", "our", "who", "what", "when", "where", "why", "how",
  "some", "more", "most", "much", "many", "very", "just", "still", "also",
  "then", "than", "will", "can", "does", "doing", "done", "use", "using", "used",
  "work", "works", "working", "new", "old", "own", "put", "keep", "keeps",
  "take", "takes", "give", "gives", "show", "shows", "made", "sure", "every",
];
