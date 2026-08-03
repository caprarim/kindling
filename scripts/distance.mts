import { DOMAINS, FOCUS_AUDIENCES } from "../src/lib/engine/taxonomy";

const defOf = (id: string) => {
  const [d, f] = id.split(":");
  return DOMAINS.find((x) => x.id === d)?.focuses.find((x) => x.id === f);
};
const near = (a: string, b: string) => {
  if (a === b) return false;
  if (defOf(a)?.neighbours?.includes(b) || defOf(b)?.neighbours?.includes(a)) return true;
  const mine = FOCUS_AUDIENCES[a] ?? [];
  const theirs = FOCUS_AUDIENCES[b] ?? [];
  if (!mine.length || !theirs.length) return true;
  const shared = mine.filter((x) => theirs.includes(x));
  if (!shared.length) return false;
  return !(shared.length === mine.length && shared.length === theirs.length);
};

const all = DOMAINS.flatMap((d) => d.focuses.map((f) => `${d.id}:${f.id}`));
let thin = 0;
for (const id of all) {
  const n = all.filter((o) => near(id, o));
  if (n.length < 2) {
    thin++;
    console.log(`THIN ${id.padEnd(22)} ${n.length} [${n.join(",")}]`);
  }
}
console.log(`corners with fewer than 2 usable neighbours: ${thin} of ${all.length}`);
