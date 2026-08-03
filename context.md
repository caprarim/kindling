# What Kindling is

Kindling helps vibe coders find a project worth building. Someone arrives with
no idea, a vague pull, or a half-formed thought, answers a short run of plain
questions, and leaves with three concrete project ideas they could start that
evening.

It is a fully static Next.js 16 app. Every page is client-rendered, all state
lives in the browser, and it is hosted on GitHub Pages with no server. An
optional Cloudflare Worker API backs cross-device sync through a recovery code;
without it the site runs guest-only and nothing breaks.

The heart of it is an adaptive question engine in `src/lib/engine`. There is no
fixed list of screens: `nextQuestion` reads everything answered so far and
derives the next question's wording, its options, and whether it is asked at
all. Three entry paths diverge sharply. Someone who describes an idea has it
parsed, and anything the words already settled is never asked. Someone with no
idea is routed sideways through annoyances and gut feel instead of a grid of
areas they cannot answer.

Ideas are assembled from a taxonomy of twelve domains, each with four focuses
(media has five), crossed with a shape and a constraint. Every idea carries a
deterministic fingerprint, so nothing is ever shown twice, and every card ends
with the first thing to actually build. That last line is what makes a card
worth more than the sentence someone arrived with.

A corner read out of a description is an anchor, not an instruction. Reading
"a habit tracker" as Daily habits and then serving three daily-habit ideas is
the description handed back in three fonts, which is exactly what a user
reported: "it just told me what I told it". So the first idea of every batch is
taken from the corner that was read, and the other two open out around it. A
corner someone tapped off the grid is left alone: that one is an answer.

Opening out is measured in the people a corner is for, never in which heading
it files under. The same user tried again and got a family photo tool and a
second clipping tool, because "Video, photo & audio" holds both the family
archivist and short-form video, which is livestreams under another name.
Sharing no audience makes a corner a stranger and it is dropped. Sharing every
audience makes it the same product twice and it is barred from the batch.
Sharing some, and not all, is the only distance worth showing. Where an area
cannot supply two of those, the corner names its own neighbours in other
areas: a streamer's are the Discord they run and the month's income. No corner
is left with fewer than two, which `scripts/distance.mts` checks.

Which shape, which audience and which constraint an idea gets is not a free
choice. Each corner names the shapes that suit it, the people it is actually
for, and the constraints that contradict it, so a tool for cutting up
livestreams is never offered to the family archivist and never ends in print.
A description also carries its own words through: the shape someone named
("a clipping tool") and the subject they named ("livestreams") both survive
into the ideas.
