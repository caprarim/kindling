/**
 * The raw material every idea is assembled from.
 *
 * The unit of specificity is the *focus*, not the domain. Each focus carries
 * the concrete material a project in that corner would actually handle, three
 * real problems worth solving, the first build step for that subject, and
 * product names that mean something. An idea is then a focus problem crossed
 * with a shape (mechanic) and a constraint (twist), which is what stops six
 * ideas from the same answers reading like one idea with six names.
 */

export type Focus = {
  id: string;
  label: string;
  hint: string;
  /** The concrete material the software works with. */
  subject: string;
  /** Real problems, phrased to follow "…helps <someone> ". */
  problems: string[];
  /** Product names, one per problem, in the same order. */
  names: string[];
  /** A first build step tied to this subject rather than to any shape. */
  build: string;
  /** Where it goes once the first version works. */
  stretch: string;
};

export type Audience = { id: string; label: string };

export type Domain = {
  id: string;
  label: string;
  blurb: string;
  focuses: Focus[];
  audiences: Audience[];
  /** Lowercase words looked for when reading a free-text description. */
  keywords: string[];
};

export const DOMAINS: Domain[] = [
  {
    id: "health",
    label: "Health & movement",
    blurb: "Bodies, habits, sleep, and feeling better day to day",
    focuses: [
      {
        id: "habits",
        label: "Daily habits",
        hint: "Streaks, routines, and the week they collapse",
        subject: "a habit that keeps getting abandoned",
        problems: [
          "keep a new habit alive past the second week",
          "see the pattern behind the days it collapses",
          "restart without treating a broken streak as a failure",
        ],
        names: ["Second Week", "Collapse Log", "Day Zero"],
        build:
          "Log two weeks of the habit by hand, including the days it did not happen, and design around that real data.",
        stretch: "Show the three conditions that most often come before a skipped day.",
      },
      {
        id: "training",
        label: "Training & strength",
        hint: "Programmes, progression, and what actually got lifted",
        subject: "a training programme and the sets actually completed",
        problems: [
          "follow a programme without carrying a notebook to the gym",
          "know when the weight is ready to go up",
          "get back into a routine after two weeks off",
        ],
        names: ["Next Set", "Add Five", "Two Weeks Off"],
        build:
          "Type in one real four-week programme and make it readable one set at a time, mid-workout, with sweaty hands.",
        stretch: "Adjust next week automatically from the sets that were missed or cut short.",
      },
      {
        id: "sleep",
        label: "Sleep & energy",
        hint: "Wind-downs, wake-ups, and the 3pm crash",
        subject: "when someone slept and how the next day felt",
        problems: [
          "connect a bad afternoon to what happened the night before",
          "keep a wind-down that survives one late night",
          "wake at the same time on a weekend without an alarm fight",
        ],
        names: ["Night Before", "Wind Down", "Same Time"],
        build:
          "Capture two numbers a day for a fortnight, bedtime and next-day energy, and check whether they correlate at all before building more.",
        stretch: "Name the one evening habit that most reliably ruins the following day.",
      },
      {
        id: "recovery",
        label: "Injury & rehab",
        hint: "Physio homework and coming back slowly",
        subject: "the rehab exercises nobody does at home",
        problems: [
          "do the boring rehab set daily with no physio watching",
          "notice progress that is too slow to feel",
          "know when it is safe to add load again",
        ],
        names: ["Home Set", "Too Slow To Feel", "Load Check"],
        build:
          "Put one real rehab plan on screen with its reps and rests, so a whole session runs without touching the phone again.",
        stretch: "Chart range of movement over six weeks, which is the only proof that convinces anyone.",
      },
    ],
    audiences: [
      { id: "beginners", label: "total beginners" },
      { id: "returners", label: "people restarting after a long gap" },
      { id: "desk", label: "desk workers" },
      { id: "chronic", label: "people managing a long-term injury or condition" },
    ],
    keywords: [
      "health", "fitness", "gym", "workout", "sleep", "run", "diet", "habit",
      "physio", "rehab", "wellness", "meditat", "stretch", "walk",
    ],
  },
  {
    id: "money",
    label: "Money & work",
    blurb: "Earning, spending, freelancing, and the admin around it",
    focuses: [
      {
        id: "spending",
        label: "Everyday spending",
        hint: "Where it went, and what is left",
        subject: "a month of ordinary transactions",
        problems: [
          "find the three habits that actually drain the month",
          "know on the twelfth whether the month is going badly",
          "stop reconstructing a month from bank statements",
        ],
        names: ["Three Leaks", "The Twelfth", "Plain Ledger"],
        build:
          "Import one real month as a CSV and categorise it by hand before automating a single rule.",
        stretch: "Compare a month against the same month last year, which is the only honest comparison.",
      },
      {
        id: "freelance",
        label: "Freelance & invoicing",
        hint: "Quotes, chasing payment, and rates",
        subject: "invoices, hours, and the ones that are late",
        problems: [
          "chase a late invoice without writing the awkward email",
          "price a job from what similar jobs actually earned",
          "see which clients are quietly unprofitable",
        ],
        names: ["Chase Note", "Rate Check", "Quiet Loss"],
        build:
          "Model one real client end to end: quote, hours logged, invoice sent, date paid. Everything else waits.",
        stretch: "Forecast the next eight weeks of income from what has already been invoiced.",
      },
      {
        id: "saving",
        label: "Saving for something",
        hint: "One goal with a real date on it",
        subject: "a single goal, its date, and what is going in",
        problems: [
          "see whether the date still holds at the current rate",
          "keep a slow goal interesting for eleven months",
          "choose between two goals honestly",
        ],
        names: ["Real Date", "Eleven Months", "Either Or"],
        build:
          "Start with one goal and one number a week. Whether the date still holds is the entire product.",
        stretch: "Show what one skipped week costs, measured in days added to the deadline.",
      },
      {
        id: "shared",
        label: "Shared money",
        hint: "Housemates, couples, and splitting things",
        subject: "who paid for what, between a few people",
        problems: [
          "settle up between four people without a spreadsheet argument",
          "split unevenly when incomes are uneven",
          "record a shared cost in the shop rather than that evening",
        ],
        names: ["Settle Up", "Uneven Split", "In The Shop"],
        build:
          "Get the arithmetic right for three people and one uneven split before designing any interface.",
        stretch: "Produce a plain summary anyone can check by hand without trusting the app.",
      },
    ],
    audiences: [
      { id: "freelancers", label: "freelancers" },
      { id: "students", label: "students" },
      { id: "irregular", label: "people on irregular income" },
      { id: "housemates", label: "housemates and couples sharing costs" },
    ],
    keywords: [
      "money", "budget", "finance", "invoice", "freelance", "job", "career",
      "salary", "expense", "saving", "business", "price", "rent", "client",
    ],
  },
  {
    id: "learning",
    label: "Learning & study",
    blurb: "Picking things up and making them stick",
    focuses: [
      {
        id: "language",
        label: "Learning a language",
        hint: "Vocabulary, speaking, and staying consistent",
        subject: "the words someone keeps forgetting",
        problems: [
          "review the twenty words that keep slipping, not the four hundred that stuck",
          "practise speaking with nobody to speak to",
          "keep going in week six, once novelty has worn off",
        ],
        names: ["Twenty Slips", "Say It Once", "Week Six"],
        build:
          "Load one real vocabulary list and get the review schedule right before adding anything else.",
        stretch: "Pull new words from whatever is being read right now, so review stays tied to real use.",
      },
      {
        id: "exams",
        label: "Exams & revision",
        hint: "Deadlines, past papers, and cramming",
        subject: "a syllabus and the weeks left before the date",
        problems: [
          "turn a syllabus and a deadline into what to do today",
          "revise the weak topics instead of the comfortable ones",
          "mark a past paper honestly",
        ],
        names: ["Today's Topic", "Weak First", "Honest Mark"],
        build:
          "Enter one real syllabus and produce a plan for a single week from it. One week is the whole first version.",
        stretch: "Reweight the plan after every practice score so weak areas keep resurfacing.",
      },
      {
        id: "selftaught",
        label: "Teaching yourself",
        hint: "Half-finished courses and hoarded tutorials",
        subject: "the courses and tutorials already started",
        problems: [
          "finish one course instead of starting a fourth",
          "turn twelve saved tutorials into one ordered path",
          "prove that six months of evenings added up to something",
        ],
        names: ["One Course", "Ordered Path", "Six Months"],
        build:
          "List everything already half-done with the minutes left in each. That list alone is useful before any feature.",
        stretch: "Generate a short portfolio page from what was genuinely completed.",
      },
      {
        id: "recall",
        label: "Remembering what was read",
        hint: "Notes, highlights, and retaining any of it",
        subject: "highlights and notes that never get reopened",
        problems: [
          "meet an old highlight again at the moment it becomes useful",
          "turn a book's notes into something explainable to a friend",
          "find the note that answers a question asked today",
        ],
        names: ["Old Highlight", "Explain It", "Find The Note"],
        build:
          "Import one book's highlights and make search across them genuinely fast. Speed is the feature.",
        stretch: "Surface one old note a day, chosen by what is being read or built right now.",
      },
    ],
    audiences: [
      { id: "selfstudy", label: "self-taught learners" },
      { id: "students", label: "school and university students" },
      { id: "switchers", label: "career switchers" },
      { id: "tutors", label: "tutors and study groups" },
    ],
    keywords: [
      "learn", "study", "language", "exam", "school", "course", "teach",
      "flashcard", "revision", "tutor", "read", "note", "memor", "book",
    ],
  },
  {
    id: "creative",
    label: "Making things",
    blurb: "Writing, music, drawing, craft, and getting unstuck",
    focuses: [
      {
        id: "writing",
        label: "Writing",
        hint: "Fiction, essays, and the blank page",
        subject: "drafts, notes, and the thing that stalled",
        problems: [
          "get back into a draft abandoned three weeks ago",
          "write daily without judging that day's output",
          "see the shape of a manuscript without rereading all of it",
        ],
        names: ["Back In", "No Verdict", "Shape Of It"],
        build:
          "Open on the last three sentences written plus one question about them. That single screen is the product.",
        stretch: "Track which times of day produced the writing that survived editing.",
      },
      {
        id: "music",
        label: "Music",
        hint: "Practice, recording, and unfinished loops",
        subject: "practice sessions and half-finished recordings",
        problems: [
          "practise the difficult bar instead of the fun intro",
          "find the good loop inside a folder of ninety takes",
          "hear six months of progress in one place",
        ],
        names: ["Bar Nine", "Good Take", "Six Months On"],
        build:
          "Record one real practice session and build the review around what was actually worth keeping.",
        stretch: "Auto-clip the ten seconds either side of every marked moment.",
      },
      {
        id: "visual",
        label: "Drawing & design",
        hint: "Sketching, style, and daily marks",
        subject: "daily sketches and the reference behind them",
        problems: [
          "draw something small on a day with no ideas",
          "practise the weak thing, usually hands or perspective",
          "see a year of sketches as a single page",
        ],
        names: ["No Ideas", "Weak Thing", "One Page Year"],
        build:
          "Build the daily prompt from a real list of fifty, then make photographing the result take one tap.",
        stretch: "Line the same subject up, drawn months apart, so improvement is undeniable.",
      },
      {
        id: "craft",
        label: "Craft & making",
        hint: "Knitting, woodwork, printing, physical things",
        subject: "a project, its materials, and where it stalled",
        problems: [
          "pick a project that fits the materials already in the cupboard",
          "return to a half-finished piece and recover the plan",
          "work out what a handmade thing actually cost to make",
        ],
        names: ["What's In Stock", "Where I Stopped", "True Cost"],
        build:
          "Model one real project's materials, offcuts and hours. The inventory is the hard part, so start there.",
        stretch: "Suggest the next project from the offcuts the last one left behind.",
      },
    ],
    audiences: [
      { id: "hobbyists", label: "hobbyists" },
      { id: "blocked", label: "people stuck mid-project" },
      { id: "nervous", label: "nervous beginners" },
      { id: "pros", label: "working creatives" },
    ],
    keywords: [
      "write", "writing", "music", "art", "draw", "design", "craft", "knit",
      "wood", "creative", "novel", "song", "paint", "sketch", "guitar",
    ],
  },
  {
    id: "media",
    label: "Video, photo & audio",
    blurb: "Capturing things, then doing something with them",
    focuses: [
      {
        id: "archive",
        label: "Photo & video libraries",
        hint: "Forty thousand files with no structure",
        subject: "an unsorted library of photos and clips",
        problems: [
          "find the clip that is definitely in there somewhere",
          "cut ten thousand near-duplicates down to the keepers",
          "rescue a decade of photos with meaningless filenames",
        ],
        names: ["Definitely In There", "Near Duplicate", "No Filenames"],
        build:
          "Point it at one real folder and get browsing and deleting fast before anything clever goes in.",
        stretch: "Group by event from timestamps and location, then let every grouping be corrected.",
      },
      {
        id: "shortform",
        label: "Short-form video",
        hint: "Clips, hooks, and posting consistently",
        subject: "long recordings and the clips buried in them",
        problems: [
          "pull three postable clips out of a two-hour recording",
          "post consistently without a full edit every time",
          "know which opening seconds actually held people",
        ],
        names: ["Three Clips", "No Edit Needed", "First Three Seconds"],
        build:
          "Take one real long recording and make marking a clip range a single key press.",
        stretch: "Rank past clips by retention and describe what the strong openings had in common.",
      },
      {
        id: "podcast",
        label: "Podcasts & audio",
        hint: "Recording, trimming, and publishing",
        subject: "an episode, from raw audio to published",
        problems: [
          "cut the ums and the long silences without a timeline editor",
          "publish an episode without a forty-step checklist",
          "find the moment in an old episode a listener is asking about",
        ],
        names: ["Cut The Silence", "Ship The Episode", "Which Episode"],
        build:
          "Get one real episode from raw file to trimmed file in the fewest possible clicks, then count them.",
        stretch: "Generate show notes and chapter marks from the transcript.",
      },
      {
        id: "familymedia",
        label: "Family & memory",
        hint: "Old tapes, shared albums, and who is in the photo",
        subject: "family media nobody has ever labelled",
        problems: [
          "get relatives to name the people in old photographs",
          "share an album with someone who refuses to install apps",
          "digitise a box of tapes without losing track halfway",
        ],
        names: ["Who's That", "No App Needed", "The Box"],
        build:
          "Make one shared album open from a plain link with nothing to install on the other end.",
        stretch: "Turn a year of contributions into something printable for one relative.",
      },
    ],
    audiences: [
      { id: "creators", label: "small creators" },
      { id: "hoarders", label: "people with an unsorted library" },
      { id: "podcasters", label: "podcasters" },
      { id: "archivists", label: "the family archivist" },
    ],
    keywords: [
      "video", "photo", "audio", "podcast", "edit", "film", "camera",
      "youtube", "clip", "record", "media", "album", "footage", "shorts",
    ],
  },
  {
    id: "games",
    label: "Games & play",
    blurb: "Playing, running, and building small games",
    focuses: [
      {
        id: "tabletop",
        label: "Tabletop & TTRPG",
        hint: "Campaigns, characters, and session prep",
        subject: "a campaign, its people, and last week's session",
        problems: [
          "prep a session in twenty minutes on a Thursday night",
          "remember what the party did to that village six weeks ago",
          "keep the table's notes somewhere everyone can see",
        ],
        names: ["Thursday Prep", "Six Weeks Ago", "Table Notes"],
        build:
          "Model one real campaign: people, places, open threads, and what changed last session.",
        stretch: "Surface the dangling threads tonight's session is most likely to run into.",
      },
      {
        id: "videogames",
        label: "Video games",
        hint: "Backlogs, co-op nights, and progress",
        subject: "a backlog and the evenings actually available",
        problems: [
          "pick tonight's game in under a minute",
          "find a game everyone in the group already owns",
          "finish one game before buying the next",
        ],
        names: ["Tonight's Game", "Everyone Owns It", "Finish First"],
        build:
          "Import one real library and make the question 'what fits ninety minutes tonight' answer instantly.",
        stretch: "Learn from what was actually played rather than what was planned.",
      },
      {
        id: "gamedev",
        label: "Making a small game",
        hint: "Prototypes, jams, one mechanic",
        subject: "one mechanic and whether it is fun yet",
        problems: [
          "test whether a mechanic is fun before building anything around it",
          "finish a jam game instead of polishing a menu screen",
          "get five strangers to play a prototype and say something useful",
        ],
        names: ["Is It Fun", "Jam Finish", "Five Strangers"],
        build:
          "Build the smallest playable loop, no menu and no art, and put it in front of someone the same day.",
        stretch: "Record playtests so the exact moment people quit is visible.",
      },
      {
        id: "party",
        label: "Games with people in a room",
        hint: "Party games, quizzes, and group nights",
        subject: "a group of people, one room, one evening",
        problems: [
          "run a quiz without an hour of preparation",
          "keep score for six people without arguments",
          "find something the whole room will actually accept",
        ],
        names: ["No Prep Quiz", "Six Scores", "Room Agrees"],
        build:
          "Design for one screen everyone can see and phones that only ever tap. Nothing to install.",
        stretch: "Let the room vote on the next round from those same phones.",
      },
    ],
    audiences: [
      { id: "gms", label: "game masters" },
      { id: "groups", label: "friend groups" },
      { id: "solo", label: "solo players" },
      { id: "families", label: "families with kids" },
    ],
    keywords: [
      "game", "gaming", "rpg", "dnd", "board", "puzzle", "quiz", "play",
      "arcade", "jam", "campaign", "co-op",
    ],
  },
  {
    id: "social",
    label: "People & community",
    blurb: "Friendships, groups, neighbours, and staying in touch on purpose",
    focuses: [
      {
        id: "keepintouch",
        label: "Keeping in touch",
        hint: "The friend everyone keeps meaning to message",
        subject: "people it has been far too long since speaking to",
        problems: [
          "message the friend it has now been four months with",
          "remember what someone said last time before replying",
          "keep up with twelve people without running a CRM",
        ],
        names: ["Four Months", "Last Time", "Twelve People"],
        build:
          "Start from a real list of people and last-contact dates. The ranking of who is overdue is the product.",
        stretch: "Draft an opening line from the last thing that was actually discussed.",
      },
      {
        id: "organising",
        label: "Organising things",
        hint: "Plans that survive contact with a group chat",
        subject: "a plan currently trapped in a group chat",
        problems: [
          "turn 'we should do something' into a date and a place",
          "get eight people to agree without forty messages",
          "chase the two who never reply, politely",
        ],
        names: ["A Real Date", "Eight People", "The Two"],
        build:
          "Make replying take one tap from a link, with no app and no login at the other end.",
        stretch: "Learn which days that particular group actually turns up on, and propose those first.",
      },
      {
        id: "community",
        label: "Running a community",
        hint: "Members, newcomers, and keeping it alive",
        subject: "a small community and the members drifting away",
        problems: [
          "welcome a newcomer before they go quiet",
          "notice which members are drifting off",
          "run an event without the same three people doing everything",
        ],
        names: ["First Week", "Drifting", "Not The Same Three"],
        build:
          "Track only the first fortnight of each new member. That window decides whether they stay.",
        stretch: "Show which welcome actions correlate with people still being around in month three.",
      },
      {
        id: "local",
        label: "Neighbourhood & local life",
        hint: "The street, the town, and the people running it",
        subject: "one neighbourhood and what is happening on it",
        problems: [
          "find out what is happening within a mile this week",
          "report a broken thing and see it actually tracked",
          "know whether a place is accessible before turning up",
        ],
        names: ["Within A Mile", "Still Broken", "Before Turning Up"],
        build:
          "Cover one postcode properly by hand before even thinking about a second one.",
        stretch: "Let neighbours confirm or correct each entry so it stays true without a maintainer.",
      },
    ],
    audiences: [
      { id: "organisers", label: "the one who always organises" },
      { id: "movers", label: "people who just moved somewhere new" },
      { id: "longdistance", label: "long-distance friends" },
      { id: "mods", label: "community organisers and moderators" },
    ],
    keywords: [
      "friend", "social", "community", "group", "event", "meetup", "family",
      "people", "gift", "party", "neighbour", "local", "council", "volunteer",
    ],
  },
  {
    id: "home",
    label: "Home & daily life",
    blurb: "The small logistics that quietly eat a week",
    focuses: [
      {
        id: "chores",
        label: "Chores & upkeep",
        hint: "Who does what, and when it was last done",
        subject: "a household's recurring jobs",
        problems: [
          "stop the weekly argument about whose turn it is",
          "split housework fairly when schedules are uneven",
          "hand the whole household over to someone else for a week",
        ],
        names: ["Whose Turn", "Fair Split", "Hand Over"],
        build:
          "Model one real household's week, including the jobs nobody has ever written down.",
        stretch: "Show who has done what over a month without turning it into a scoreboard fight.",
      },
      {
        id: "stuff",
        label: "Owning things",
        hint: "Warranties, manuals, and what is in the loft",
        subject: "the things a household owns and forgets about",
        problems: [
          "find the thing they definitely own somewhere",
          "produce a receipt or warranty at the moment it matters",
          "know when something was last serviced",
        ],
        names: ["Know I Own It", "Warranty Drawer", "Last Serviced"],
        build:
          "Make adding an item take one photo and nothing else, or the inventory will stay empty forever.",
        stretch: "Warn a fortnight before a warranty expires or a service falls due.",
      },
      {
        id: "repair",
        label: "Fixing & reusing",
        hint: "Repairs, spares, and keeping things out of the bin",
        subject: "broken things and whether they are worth fixing",
        problems: [
          "decide repair or replace with real numbers rather than a guess",
          "find the part and the guide for one specific model",
          "keep a record of what was fixed and how",
        ],
        names: ["Fix Or Bin", "This Exact Model", "Fixed Before"],
        build:
          "Do one appliance category properly, with real part numbers, before widening it by an inch.",
        stretch: "Total up what repairing rather than replacing has actually saved.",
      },
      {
        id: "plants",
        label: "Plants & pets",
        hint: "Watering, feeding, and keeping things alive",
        subject: "living things that need somebody to remember",
        problems: [
          "keep a plant alive past its first month",
          "leave instructions clear enough for whoever is covering",
          "work out why one particular plant keeps dying",
        ],
        names: ["First Month", "While I'm Away", "This One Dies"],
        build:
          "Start with five real plants and their actual light and watering, not a generic species table.",
        stretch: "Adjust the schedule by season and by the room each one actually lives in.",
      },
    ],
    audiences: [
      { id: "sharers", label: "people sharing a flat" },
      { id: "renters", label: "renters" },
      { id: "busy", label: "busy households" },
      { id: "carers", label: "people running a home for others" },
    ],
    keywords: [
      "home", "house", "chore", "clean", "plant", "pet", "diy", "repair",
      "declutter", "moving", "flat", "rent", "garden", "tool", "warranty",
    ],
  },
  {
    id: "food",
    label: "Food & cooking",
    blurb: "What is for dinner, and everything upstream of it",
    focuses: [
      {
        id: "weeknight",
        label: "Weeknight cooking",
        hint: "Fast, repeatable, and no extra shopping trip",
        subject: "dinner at eight on an ordinary weeknight",
        problems: [
          "decide dinner without a twenty-minute stalemate",
          "cook the same eight meals really well",
          "get something on the table in the time actually left",
        ],
        names: ["No Stalemate", "The Eight", "Time Left"],
        build:
          "Write down the eight meals genuinely cooked and build everything around those, not a recipe database.",
        stretch: "Rotate those eight so nothing lands twice in one week by accident.",
      },
      {
        id: "planning",
        label: "Planning a week",
        hint: "One decision instead of seven",
        subject: "a week of meals and a single shop",
        problems: [
          "plan a week in ten minutes rather than an hour",
          "shop once and not think about it again",
          "replan on Wednesday when everything has changed",
        ],
        names: ["Ten Minutes", "One Shop", "Wednesday Replan"],
        build:
          "Turn one real week's plan into a shopping list grouped by aisle, then test it in an actual shop.",
        stretch: "Carry forward whatever did not get cooked instead of quietly wasting it.",
      },
      {
        id: "waste",
        label: "Using things up",
        hint: "The sad drawer at the bottom of the fridge",
        subject: "what is already in the fridge",
        problems: [
          "cook whatever expires first",
          "turn six unrelated leftovers into one dinner",
          "buy less of the thing that always rots",
        ],
        names: ["Expires First", "Six Leftovers", "Always Rots"],
        build:
          "Start from twenty real fridge contents and the meals they can honestly make together.",
        stretch: "Report what still got thrown away, and let that reshape the shopping list.",
      },
      {
        id: "hosting",
        label: "Feeding people",
        hint: "Guests, timings, and batch cooking",
        subject: "cooking for more people than usual",
        problems: [
          "time four dishes to land at the same moment",
          "cook around one guest's allergy without a separate meal",
          "scale a recipe for nine without arithmetic mistakes",
        ],
        names: ["All At Once", "One Allergy", "Times Nine"],
        build:
          "Build the backwards timeline for one real menu, from serving time to the first prep task.",
        stretch: "Produce the day-before prep list, split by what keeps and what does not.",
      },
    ],
    audiences: [
      { id: "tired", label: "people who cook at 8pm exhausted" },
      { id: "budget", label: "people cooking on a tight budget" },
      { id: "allergy", label: "households working around an allergy" },
      { id: "hosts", label: "people who host often" },
    ],
    keywords: [
      "food", "cook", "recipe", "meal", "kitchen", "eat", "grocery", "dinner",
      "bake", "diet", "fridge", "shop", "leftover",
    ],
  },
  {
    id: "outdoors",
    label: "Travel & outdoors",
    blurb: "Going places, near and far",
    focuses: [
      {
        id: "trips",
        label: "Planning a trip",
        hint: "Ideas, logistics, and the actual booking",
        subject: "one trip and forty open browser tabs",
        problems: [
          "collapse forty tabs into one day-by-day plan",
          "hold three people's ideas for a trip in one place",
          "know what is booked and what is still a maybe",
        ],
        names: ["Forty Tabs", "Everyone's Ideas", "Booked Or Not"],
        build:
          "Model one real trip: days, places, what is paid for, and what is still undecided.",
        stretch: "Rework the plan around one cancelled day without unpicking the whole thing.",
      },
      {
        id: "nearby",
        label: "Exploring nearby",
        hint: "The town everyone stopped looking at",
        subject: "the two free hours available this Saturday",
        problems: [
          "find something worth doing within an hour of home",
          "stop going to the same three places",
          "decide fast when the weather turns",
        ],
        names: ["An Hour Away", "Not There Again", "Weather Turned"],
        build:
          "Fill one real area with eighty places by hand. The list is the moat, not the code.",
        stretch: "Weight suggestions by what the sky is doing and how much daylight is left.",
      },
      {
        id: "walking",
        label: "Walking, hiking & cycling",
        hint: "Routes, conditions, and pace",
        subject: "routes and how a body felt on them",
        problems: [
          "pick a route that matches today's energy honestly",
          "know whether a path is passable after a week of rain",
          "find a loop of exactly the right length from here",
        ],
        names: ["Today's Energy", "After The Rain", "Exact Loop"],
        build:
          "Get one real area's routes in with distance, climb and surface, then make the filters truthful.",
        stretch: "Learn a personal pace from finished routes and use it for the next estimate.",
      },
      {
        id: "nature",
        label: "Noticing nature",
        hint: "Birds, seasons, and what lives in the hedge",
        subject: "what is living on one street or one patch",
        problems: [
          "identify the same bird twice and actually remember it",
          "keep a record of one patch across a whole year",
          "notice what has changed since last spring",
        ],
        names: ["Same Bird", "One Patch", "Since Last Spring"],
        build:
          "Cover one small patch across four weeks and design the record around repeat visits.",
        stretch: "Compare this year's sightings against last year's on the same dates.",
      },
    ],
    audiences: [
      { id: "weekenders", label: "weekend travellers" },
      { id: "soloTravel", label: "solo travellers" },
      { id: "familyTrip", label: "families travelling with kids" },
      { id: "commuters", label: "daily commuters and cyclists" },
    ],
    keywords: [
      "travel", "trip", "hike", "outdoor", "bike", "cycling", "camp", "map",
      "walk", "explore", "nature", "commute", "bird", "weather", "route",
    ],
  },
  {
    id: "dev",
    label: "Developer tools",
    blurb: "Things that make building things less annoying",
    focuses: [
      {
        id: "onboarding",
        label: "Understanding a codebase",
        hint: "The repository nobody here wrote",
        subject: "an unfamiliar repository on day one",
        problems: [
          "find where a feature actually lives in an unfamiliar repo",
          "understand why a strange piece of code exists at all",
          "get a new contributor productive without a call",
        ],
        names: ["Where It Lives", "Why This Exists", "Day One"],
        build:
          "Run it against one real repository and make the first useful answer appear in under a minute.",
        stretch: "Track which files new contributors open first, and lead with those.",
      },
      {
        id: "debugging",
        label: "Debugging & logs",
        hint: "Reproducing the thing that broke",
        subject: "a bug that only happens sometimes",
        problems: [
          "reproduce an intermittent bug on purpose",
          "find the one line that matters in a wall of logs",
          "keep the context of an investigation between sittings",
        ],
        names: ["On Purpose", "One Line", "Where I Was"],
        build:
          "Capture one real failing run end to end, then make replaying it a single command.",
        stretch: "Diff a failing run against a passing one and show only what differed.",
      },
      {
        id: "shipping",
        label: "Shipping side projects",
        hint: "The graveyard of half-built repos",
        subject: "a side project that never got deployed",
        problems: [
          "get a project from working locally to a real URL",
          "remember how the last project was deployed",
          "restart a repo abandoned four months ago",
        ],
        names: ["Real URL", "How I Did It", "Four Months Cold"],
        build:
          "Take one real half-finished repo and write down every step needed to make it public.",
        stretch: "Keep a per-project runbook that updates itself from the commands actually run.",
      },
      {
        id: "workflow",
        label: "Everyday friction",
        hint: "Terminal, editor, the same fifteen keystrokes",
        subject: "the small tasks repeated every single day",
        problems: [
          "stop retyping the same setup for every new project",
          "keep scripts findable instead of scattered across machines",
          "hand a personal tool to someone else without writing a README",
        ],
        names: ["Same Setup", "Scattered Scripts", "No README"],
        build:
          "Automate exactly one daily task properly before generalising a single line of it.",
        stretch: "Suggest the next thing worth automating from the commands run most often.",
      },
    ],
    audiences: [
      { id: "soloDevs", label: "solo developers" },
      { id: "juniors", label: "junior developers" },
      { id: "smallteams", label: "small teams" },
      { id: "oss", label: "open source maintainers" },
    ],
    keywords: [
      "dev", "code", "coding", "programming", "developer", "cli", "api", "git",
      "debug", "terminal", "software", "repo", "deploy", "log",
    ],
  },
  {
    id: "ai",
    label: "AI & automation",
    blurb: "Handing off the parts nobody wants to do",
    focuses: [
      {
        id: "inbox",
        label: "Messages & inbox",
        hint: "Triage, drafts, and the pile",
        subject: "a pile of messages that all look urgent",
        problems: [
          "find the four messages that genuinely need a reply today",
          "draft the routine replies without sounding like a robot",
          "stop answering the same question from scratch every week",
        ],
        names: ["The Four", "Routine Reply", "Asked Again"],
        build:
          "Run it over one real week of messages and check every decision by hand before trusting any of it.",
        stretch: "Learn from the drafts that were edited before sending, not the ones sent untouched.",
      },
      {
        id: "reading",
        label: "Reading less of more",
        hint: "Long things made short and honest",
        subject: "documents nobody has time to read in full",
        problems: [
          "read the part of a long document that changes a decision",
          "compare five sources without reading all five",
          "keep a trail back to where each claim came from",
        ],
        names: ["The Part That Matters", "Five Sources", "Back To Source"],
        build:
          "Always show the original passage beside the summary. The trail back is the trustworthy part.",
        stretch: "Flag where two sources disagree instead of blending them into one confident answer.",
      },
      {
        id: "admin",
        label: "Repetitive admin",
        hint: "The same fifteen minutes every week",
        subject: "a task done identically every single week",
        problems: [
          "stop copy-pasting between the same two tools",
          "turn a fifteen-minute weekly ritual into one button",
          "let someone non-technical run it without help",
        ],
        names: ["Two Tools", "One Button", "Anyone Can Run It"],
        build:
          "Do the task manually once and write down every keystroke. That transcript is the specification.",
        stretch: "Report what it did each week in plain language, so trust is earned rather than assumed.",
      },
      {
        id: "personal",
        label: "A helper with real context",
        hint: "One that knows the actual situation",
        subject: "someone's own notes, files and history",
        problems: [
          "answer a question from personal notes rather than the internet",
          "keep private material private and still get useful answers",
          "recover a decision made months ago and the reasoning behind it",
        ],
        names: ["From My Notes", "Stays Private", "Why I Decided"],
        build:
          "Index one real folder locally and make retrieval good before adding any generation on top.",
        stretch: "Cite the exact note behind every answer, so a wrong answer is easy to correct.",
      },
    ],
    audiences: [
      { id: "overwhelmed", label: "people drowning in admin" },
      { id: "smallbiz", label: "one-person businesses" },
      { id: "researchers", label: "researchers" },
      { id: "sceptical", label: "people suspicious of AI hype" },
    ],
    keywords: [
      "ai", "automat", "assistant", "agent", "llm", "chatbot", "gpt",
      "workflow", "summar", "bot", "script", "inbox", "email",
    ],
  },
];

export type Mechanic = {
  id: string;
  label: string;
  /** Slots into "A {phrase} that helps …". */
  phrase: string;
  /** The same shape said in plain words, with no product jargon in it. */
  plain: string;
  /** How much building experience it wants, 0 (easy) – 3 (hard). */
  weight: number;
  /** Surfaces this shape is a natural fit for. */
  surfaces: string[];
  /** Why this shape suits a problem. Used in the reasoning paragraph. */
  rationale: string;
  /** One shape-specific build step. */
  step: string;
  /** Extra tooling this shape implies. */
  stack: string[];
  /** Fallback stretch goal when the focus one is already taken. */
  stretch: string;
};

export const MECHANICS: Mechanic[] = [
  {
    id: "tracker",
    label: "Tracker",
    phrase: "quiet tracker",
    plain: "It keeps a simple record of what happened, and shows the pattern back.",
    weight: 0,
    surfaces: ["web", "mobile", "cli"],
    rationale: "A tracker is the right shape because the hard part is noticing, not deciding.",
    step: "Make logging one entry take under five seconds, and make the summary readable at a glance.",
    stack: ["Local storage"],
    stretch: "Add a weekly review that names the single number which moved most.",
  },
  {
    id: "generator",
    label: "Generator",
    phrase: "generator",
    plain: "It hands over one good suggestion at a time.",
    weight: 0,
    surfaces: ["web", "mobile"],
    rationale: "A generator fits because the value is one good suggestion, not a long session.",
    step: "Write fifty outputs by hand first, then find the three dials that made them differ.",
    stack: [],
    stretch: "Let good outputs be saved, then generate more like a specific one.",
  },
  {
    id: "matcher",
    label: "Matcher",
    phrase: "matchmaker",
    plain: "It looks through what is already there and picks out the right one.",
    weight: 1,
    surfaces: ["web", "mobile"],
    rationale: "Matching is right when the answer already exists and finding it is the whole problem.",
    step: "Define a good match in one honest sentence, then do it by hand for ten people before automating.",
    stack: ["A small database"],
    stretch: "Show the reasoning behind each match so a wrong one can be corrected.",
  },
  {
    id: "planner",
    label: "Planner",
    phrase: "planner",
    plain: "It lays the whole thing out so the next decision is obvious.",
    weight: 1,
    surfaces: ["web", "mobile", "desktop"],
    rationale: "A planner works because the decision becomes easy once it is laid out in front of someone.",
    step: "Model one week, make rearranging feel physical, and build the 'it all fell apart' path early.",
    stack: ["Drag and drop"],
    stretch: "Learn from what actually happened and reshape next week around it.",
  },
  {
    id: "visualiser",
    label: "Visualiser",
    phrase: "visualiser",
    plain: "It turns the numbers into a picture you can read at a glance.",
    weight: 1,
    surfaces: ["web", "desktop", "data"],
    rationale: "The data already exists here and nobody can see its shape, which is a picture problem.",
    step: "Pick the one question the chart must answer and cut every element that does not serve it.",
    stack: ["A charting library"],
    stretch: "Export a single image worth putting in front of someone else.",
  },
  {
    id: "nudger",
    label: "Well-timed prompt",
    phrase: "well-timed prompt",
    plain: "It speaks up at the right moment, and stays quiet the rest of the time.",
    weight: 0,
    surfaces: ["web", "mobile"],
    rationale: "The timing is the product: this is a problem of remembering at the right moment.",
    step: "Decide exactly when it speaks, write ten messages by hand, and delete the smug ones.",
    stack: ["Notifications"],
    stretch: "Change the tone as a streak grows or collapses, rather than repeating one voice.",
  },
  {
    id: "library",
    label: "Library",
    phrase: "well-kept library",
    plain: "It keeps everything in one place you can actually search.",
    weight: 1,
    surfaces: ["web", "desktop"],
    rationale: "This is a findability problem, so search and structure are the entire product.",
    step: "Nail search and filtering first, and seed a hundred real entries so day one is not empty.",
    stack: ["Full-text search"],
    stretch: "Let a set of entries be shared as one link.",
  },
  {
    id: "capture",
    label: "Capture tool",
    phrase: "capture tool",
    plain: "It saves things in one tap, the moment they happen.",
    weight: 1,
    surfaces: ["mobile", "desktop", "cli"],
    rationale: "Capture wins when the moment is fleeting, because everything else can be tidied later.",
    step: "Cut the path from wanting to save to saved down to one action, offline included.",
    stack: ["An offline queue"],
    stretch: "Add a weekly sweep that turns loose captures into something ordered.",
  },
  {
    id: "digest",
    label: "Digest",
    phrase: "digest",
    plain: "It sends one short summary instead of a constant stream.",
    weight: 1,
    surfaces: ["web", "data"],
    rationale: "The information is fine here, it simply arrives at the wrong time and in the wrong volume.",
    step: "Write three editions by hand and send them to five people before automating a single line.",
    stack: ["A scheduled job"],
    stretch: "Shape each edition from what the reader actually opened last time.",
  },
  {
    id: "simulator",
    label: "What-if tool",
    phrase: "what-if tool",
    plain: "It lets you change one number and see what that would do.",
    weight: 2,
    surfaces: ["web", "desktop", "data"],
    rationale: "The real question is 'what happens if', which needs a model rather than a record.",
    step: "Start with three sliders and one output number, and put every assumption on screen.",
    stack: ["A model layer"],
    stretch: "Save two scenarios side by side so futures can be compared, not just imagined.",
  },
  {
    id: "challenge",
    label: "Structured challenge",
    phrase: "structured challenge",
    plain: "It sets a short challenge and keeps the score.",
    weight: 1,
    surfaces: ["web", "mobile"],
    rationale: "The blocker is motivation rather than information, and structure is what supplies it.",
    step: "Design one round that works for a single person on day one, with nobody else involved.",
    stack: [],
    stretch: "Let two people run the same challenge and compare quietly, without a leaderboard.",
  },
  {
    id: "annotator",
    label: "Annotation layer",
    phrase: "annotation layer",
    plain: "It lets you write notes directly on top of the thing itself.",
    weight: 2,
    surfaces: ["web", "desktop"],
    rationale: "The source material is fine; what is missing is somewhere to put thinking about it.",
    step: "Support one source type perfectly and make notes survive the source changing underneath.",
    stack: ["A viewer component"],
    stretch: "Turn a set of annotations into something a second person can read on its own.",
  },
  {
    id: "exchange",
    label: "Small exchange",
    phrase: "small exchange",
    plain: "It puts the two sides in touch with each other.",
    weight: 3,
    surfaces: ["web", "mobile"],
    rationale: "Two groups need each other here, which is matching with trust attached to it.",
    step: "Solve one side by hand in one neighbourhood, and settle the trust rules before payments.",
    stack: ["Accounts", "Messaging"],
    stretch: "Add a reputation signal that cannot be gamed within a week.",
  },
  {
    id: "remixer",
    label: "Transformer",
    phrase: "transformer",
    plain: "It takes one thing in and gives a better version back.",
    weight: 2,
    surfaces: ["web", "desktop", "mobile"],
    rationale: "The work is a transformation, so one input and one visible output is the entire interface.",
    step: "Get one input to one transformed output, show before and after together, and allow undo everywhere.",
    stack: ["File handling"],
    stretch: "Chain two transformations and save the chain as a reusable preset.",
  },
  {
    id: "companion",
    label: "Companion app",
    phrase: "companion app",
    plain: "It sits beside you while you are actually doing the thing.",
    weight: 1,
    surfaces: ["mobile", "web"],
    rationale: "It runs alongside the activity, so it has to work one-handed, in bad light, without signal.",
    step: "Design for big targets and one hand, and do a single job brilliantly rather than four adequately.",
    stack: ["Offline-first storage"],
    stretch: "Add a quiet summary afterwards, built from what happened during the session.",
  },
  {
    id: "directory",
    label: "Directory",
    phrase: "directory",
    plain: "It gathers everything worth knowing into one list.",
    weight: 0,
    surfaces: ["web"],
    rationale: "The information is scattered across places nobody checks, so gathering it well is the value.",
    step: "Gather the first eighty entries by hand and make one filter genuinely excellent.",
    stack: ["Static pages"],
    stretch: "Let the people listed claim and correct their own entries.",
  },
];

export type Twist = {
  id: string;
  label: string;
  /** A standalone sentence that closes the pitch. */
  sentence: string;
  /** Why the constraint helps. Used in the reasoning paragraph. */
  rationale: string;
  /** A build step the constraint forces. */
  step: string;
  weight: number;
  stack: string[];
};

export const TWISTS: Twist[] = [
  {
    id: "offline",
    label: "Offline-first",
    sentence: "It works with no connection at all, and nothing ever leaves the device.",
    rationale: "Offline is not a limitation here, it is the situation the thing gets used in.",
    step: "Make everything work with the network off, and treat syncing as a later extra.",
    weight: 1,
    stack: ["Local-first storage"],
  },
  {
    id: "sixtysec",
    label: "A minute a day",
    sentence: "Using it takes under a minute a day.",
    rationale: "A one-minute ceiling forces out every feature that is not genuinely essential.",
    step: "Time the core interaction with a stopwatch and cut whatever pushes it past sixty seconds.",
    weight: 0,
    stack: [],
  },
  {
    id: "noaccount",
    label: "No accounts",
    sentence: "Nobody signs up, and there is nothing to log into.",
    rationale: "Removing sign-up removes the single biggest reason people never try a small tool.",
    step: "Keep state on the device or in the URL, so a link is the only credential that exists.",
    weight: 0,
    stack: ["No backend"],
  },
  {
    id: "onefriend",
    label: "Shared with one person",
    sentence: "It is shared with exactly one other person, and no more than one.",
    rationale: "One other person supplies enough accountability to work without becoming a social network.",
    step: "Design the two-person case first: invite by link, no profiles, no feed, no followers.",
    weight: 1,
    stack: ["A share link"],
  },
  {
    id: "getsharder",
    label: "Escalating",
    sentence: "It quietly gets harder as the person gets better at it.",
    rationale: "Escalation keeps week four interesting, which is exactly where things like this usually die.",
    step: "Adapt difficulty from recent results, and cap how fast it is allowed to rise.",
    weight: 1,
    stack: [],
  },
  {
    id: "paper",
    label: "Ends in print",
    sentence: "Each week ends as one printed page.",
    rationale: "Ending on paper gives it a natural full stop and something physical worth keeping.",
    step: "Design the printed page first and let the screen exist to serve it.",
    weight: 1,
    stack: ["Print stylesheet"],
  },
  {
    id: "voice",
    label: "Voice-first",
    sentence: "You talk to it instead of typing.",
    rationale: "Hands are busy at the exact moment this gets used, so speech is the only free input.",
    step: "Get speech to text working against real background noise before designing anything else.",
    weight: 2,
    stack: ["Speech to text"],
  },
  {
    id: "camera",
    label: "Camera-driven",
    sentence: "Everything starts from a single photo.",
    rationale: "One photo carries more detail than anybody would ever be willing to type in.",
    step: "Make a single photo produce a usable result, even a rough one, with no other input.",
    weight: 2,
    stack: ["Camera", "On-device vision"],
  },
  {
    id: "local",
    label: "Neighbourhood-sized",
    sentence: "It covers one neighbourhood, deliberately, and no more.",
    rationale: "One neighbourhood can be covered properly by hand, which beats thin coverage everywhere.",
    step: "Pick one postcode and make it genuinely complete before considering a second.",
    weight: 1,
    stack: ["Map tiles"],
  },
  {
    id: "slow",
    label: "Deliberately slow",
    sentence: "It does one thing per day and refuses to do more.",
    rationale: "The restraint is the feature: it removes the binge-then-abandon cycle entirely.",
    step: "Hard-limit it to one action a day and make the empty state feel intentional rather than broken.",
    weight: 0,
    stack: [],
  },
  {
    id: "single",
    label: "One screen",
    sentence: "The whole thing lives on one screen.",
    rationale: "A single screen forces every hard decision about what actually matters to be made early.",
    step: "Fit everything at phone width on one screen, and delete whatever will not fit.",
    weight: 0,
    stack: [],
  },
  {
    id: "seasonal",
    label: "Seasonal",
    sentence: "It changes completely with the season.",
    rationale: "Seasonality gives it a reason to be reopened four times a year instead of once.",
    step: "Build one season fully, and make the season a parameter rather than a rewrite.",
    weight: 1,
    stack: [],
  },
  {
    id: "twoplayer",
    label: "Two-player",
    sentence: "It only does anything when two people are using it.",
    rationale: "Requiring two people is a real constraint, and it makes the thing get shared to work at all.",
    step: "Make the second person's first thirty seconds work with no explanation from the first.",
    weight: 2,
    stack: ["Realtime sync"],
  },
  {
    id: "retro",
    label: "Looks back",
    sentence: "It shows the same day, one year earlier.",
    rationale: "Looking back turns a log into something worth keeping, which is what fixes abandonment.",
    step: "Design the year-ago view before the logging view, because it is what makes logging worth doing.",
    weight: 1,
    stack: ["Date-indexed history"],
  },
];

export const SURFACES: { id: string; label: string; hint: string; stack: string[] }[] = [
  { id: "web", label: "A website", hint: "Opens in a browser, nothing to install", stack: ["Next.js", "TypeScript"] },
  { id: "mobile", label: "A phone app", hint: "Lives in a pocket, works one-handed", stack: ["React Native", "Expo"] },
  { id: "desktop", label: "A desktop app", hint: "A real window, real files, real folders", stack: ["Tauri", "React"] },
  { id: "cli", label: "A small tool run from the terminal", hint: "No interface to design, just text", stack: ["Node", "TypeScript"] },
  { id: "nocode", label: "Something with no code at all", hint: "Spreadsheets, forms, automations", stack: ["Airtable", "Zapier"] },
  { id: "data", label: "Something built around numbers", hint: "Charts, patterns, keeping score", stack: ["Python", "DuckDB"] },
];

export const MOTIVATIONS: { id: string; label: string; hint: string }[] = [
  { id: "scratch", label: "Fix my own annoyance", hint: "Built for exactly one user, me" },
  { id: "learn", label: "Learn something new", hint: "The project is an excuse to grow" },
  { id: "portfolio", label: "Have something to show", hint: "Interviews, clients, proof it was built" },
  { id: "income", label: "Maybe earn from it", hint: "Small and real, not a unicorn" },
  { id: "people", label: "Help someone specific", hint: "A real person already needs this" },
  { id: "fun", label: "Just for the fun of it", hint: "No further justification needed" },
];

export const FRUSTRATIONS: { id: string; label: string; domains: string[] }[] = [
  { id: "forget", label: "I forget things I meant to do", domains: ["home", "social", "learning"] },
  { id: "toomanytabs", label: "I drown in tabs, notes and saved links", domains: ["learning", "ai", "media"] },
  { id: "moneyleak", label: "Money disappears and I don't know where", domains: ["money"] },
  { id: "dinner", label: "Deciding what to eat is exhausting", domains: ["food"] },
  { id: "unfinished", label: "I start things and never finish them", domains: ["creative", "dev", "learning"] },
  { id: "lonely", label: "I don't see my friends enough", domains: ["social", "games"] },
  { id: "admin", label: "Admin eats my week", domains: ["ai", "money", "home"] },
  { id: "sitting", label: "I sit down far too much", domains: ["health", "outdoors"] },
  { id: "photos", label: "My photos and files are an unsorted mess", domains: ["media"] },
  { id: "bored", label: "My weekends blur into each other", domains: ["outdoors", "games", "social"] },
  { id: "waste", label: "I throw away too much food and stuff", domains: ["food", "home"] },
  { id: "stuck", label: "I want to get better at something and I'm stuck", domains: ["learning", "creative", "health"] },
];

export const VIBES: { id: string; label: string; hint: string; domains: string[]; twists: string[] }[] = [
  { id: "cosy", label: "Cosy and small", hint: "Something warm, used alone", domains: ["home", "food", "creative"], twists: ["slow", "single", "paper"] },
  { id: "useful", label: "Bluntly useful", hint: "Saves time, charm optional", domains: ["money", "ai", "dev"], twists: ["sixtysec", "noaccount", "offline"] },
  { id: "playful", label: "Playful and odd", hint: "Makes people smile first", domains: ["games", "creative", "media"], twists: ["getsharder", "twoplayer", "retro"] },
  { id: "outward", label: "Out in the world", hint: "Involves other people or places", domains: ["social", "outdoors", "games"], twists: ["local", "onefriend", "seasonal"] },
  { id: "quiet", label: "Quiet and reflective", hint: "Notices things, never shouts", domains: ["health", "learning", "outdoors"], twists: ["retro", "slow", "paper"] },
  { id: "technical", label: "Properly technical", hint: "The hard bit is the appeal", domains: ["dev", "ai", "media"], twists: ["voice", "camera", "offline"] },
];

/**
 * Shapes that genuinely suit each corner, keyed by `domain:focus`.
 *
 * Without this a "quiet tracker for deciding dinner" is as likely as a meal
 * planner, and the ideas read as randomly assembled. These are weighted up
 * rather than enforced, so a batch can still surprise.
 */
export const FOCUS_SHAPES: Record<string, string[]> = {
  "health:habits": ["tracker", "nudger", "challenge", "visualiser"],
  "health:training": ["tracker", "planner", "companion", "challenge"],
  "health:sleep": ["tracker", "visualiser", "digest", "nudger"],
  "health:recovery": ["companion", "tracker", "nudger", "challenge"],
  "money:spending": ["visualiser", "tracker", "digest", "simulator"],
  "money:freelance": ["tracker", "planner", "digest", "simulator"],
  "money:saving": ["simulator", "tracker", "visualiser", "challenge"],
  "money:shared": ["tracker", "planner", "visualiser", "exchange"],
  "learning:language": ["challenge", "tracker", "generator", "companion"],
  "learning:exams": ["planner", "challenge", "tracker", "digest"],
  "learning:selftaught": ["library", "planner", "tracker", "digest"],
  "learning:recall": ["library", "digest", "annotator", "capture"],
  "creative:writing": ["capture", "tracker", "annotator", "nudger"],
  "creative:music": ["capture", "library", "remixer", "tracker"],
  "creative:visual": ["generator", "challenge", "capture", "library"],
  "creative:craft": ["library", "planner", "simulator", "capture"],
  "media:archive": ["library", "remixer", "capture", "visualiser"],
  "media:shortform": ["remixer", "capture", "library", "visualiser"],
  "media:podcast": ["remixer", "planner", "library", "annotator"],
  "media:familymedia": ["library", "annotator", "capture", "digest"],
  "games:tabletop": ["generator", "library", "capture", "companion"],
  "games:videogames": ["matcher", "library", "tracker", "planner"],
  "games:gamedev": ["challenge", "generator", "capture", "simulator"],
  "games:party": ["generator", "companion", "challenge", "directory"],
  "social:keepintouch": ["nudger", "tracker", "capture", "digest"],
  "social:organising": ["planner", "matcher", "digest", "companion"],
  "social:community": ["tracker", "digest", "nudger", "directory"],
  "social:local": ["directory", "library", "capture", "digest"],
  "home:chores": ["planner", "tracker", "nudger", "visualiser"],
  "home:stuff": ["library", "capture", "directory", "tracker"],
  "home:repair": ["directory", "library", "simulator", "annotator"],
  "home:plants": ["nudger", "tracker", "companion", "planner"],
  "food:weeknight": ["generator", "matcher", "planner", "companion"],
  "food:planning": ["planner", "generator", "digest", "matcher"],
  "food:waste": ["matcher", "generator", "tracker", "capture"],
  "food:hosting": ["planner", "companion", "simulator", "generator"],
  "outdoors:trips": ["planner", "library", "capture", "digest"],
  "outdoors:nearby": ["matcher", "directory", "generator", "digest"],
  "outdoors:walking": ["matcher", "directory", "companion", "tracker"],
  "outdoors:nature": ["capture", "library", "tracker", "challenge"],
  "dev:onboarding": ["visualiser", "library", "annotator", "digest"],
  "dev:debugging": ["capture", "remixer", "visualiser", "annotator"],
  "dev:shipping": ["planner", "tracker", "library", "digest"],
  "dev:workflow": ["remixer", "library", "capture", "directory"],
  "ai:inbox": ["digest", "remixer", "nudger", "tracker"],
  "ai:reading": ["digest", "annotator", "remixer", "library"],
  "ai:admin": ["remixer", "planner", "digest", "tracker"],
  "ai:personal": ["library", "capture", "annotator", "digest"],
};

export const DOMAIN_BY_ID = new Map(DOMAINS.map((d) => [d.id, d]));
export const MECHANIC_BY_ID = new Map(MECHANICS.map((m) => [m.id, m]));
export const TWIST_BY_ID = new Map(TWISTS.map((t) => [t.id, t]));

/** Every `domain:focus` pair, for keyword matching against free text. */
export const ALL_FOCUSES = DOMAINS.flatMap((d) => d.focuses.map((f) => ({ domain: d, focus: f })));
