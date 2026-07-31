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
deterministic fingerprint, so nothing is ever shown twice.

Which shape, which audience and which constraint an idea gets is not a free
choice. Each corner names the shapes that suit it, the people it is actually
for, and the constraints that contradict it, so a tool for cutting up
livestreams is never offered to the family archivist and never ends in print.
A description also carries its own words through: the shape someone named
("a clipping tool") and the subject they named ("livestreams") both survive
into the ideas.
