// Zet een ingevuld "Nieuwe vondst"-formulier (GitHub issue) om in een bericht
// in src/vondsten/. Wordt uitgevoerd door .github/workflows/site.yml.
import { mkdir, writeFile, readdir } from "node:fs/promises";
import { appendFileSync } from "node:fs";

const body = process.env.ISSUE_BODY || "";
const aangemaakt = new Date(process.env.ISSUE_CREATED_AT || Date.now());

function velden(tekst) {
  const uit = {};
  const delen = tekst.replace(/\r\n/g, "\n").split(/^### /m).slice(1);
  for (const deel of delen) {
    const [kop, ...rest] = deel.split("\n");
    const waarde = rest.join("\n").trim();
    uit[kop.trim()] = waarde === "_No response_" ? "" : waarde;
  }
  return uit;
}

function slugify(s) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60) || "vondst";
}

function afbeeldingUrl(tekst) {
  if (!tekst) return "";
  const m =
    tekst.match(/src="(https?:\/\/[^"]+)"/) ||
    tekst.match(/\]\((https?:\/\/[^)\s]+)\)/) ||
    tekst.match(/(https?:\/\/\S+)/);
  return m ? m[1] : "";
}

const EXT = { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp", "image/gif": "gif", "image/avif": "avif" };

async function downloadAfbeelding(url, slug) {
  const pogingen = [{}];
  if (process.env.GITHUB_TOKEN) pogingen.push({ Authorization: `Bearer ${process.env.GITHUB_TOKEN}` });
  for (const headers of pogingen) {
    try {
      const res = await fetch(url, { headers, redirect: "follow" });
      const type = (res.headers.get("content-type") || "").split(";")[0];
      if (!res.ok || !EXT[type]) continue;
      const pad = `assets/img/${slug}.${EXT[type]}`;
      await mkdir("src/assets/img", { recursive: true });
      await writeFile(`src/${pad}`, Buffer.from(await res.arrayBuffer()));
      return pad;
    } catch {
      // probeer de volgende manier
    }
  }
  return url; // lukt downloaden niet, dan verwijzen we rechtstreeks naar de afbeelding
}

const v = velden(body);
const naam = v["Naam"];
const link = v["Link"];
if (!naam || !link || !/^https?:\/\//.test(link)) {
  console.error("Naam of link ontbreekt of is ongeldig.");
  process.exit(1);
}

// Datum in Belgische tijd, zodat een vondst van 's avonds laat de juiste dag krijgt.
const datum = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Brussels" }).format(aangemaakt);

let slug = slugify(naam);
let n = 2;
const basis = slug;
while (await zoekSlug(slug)) slug = `${basis}-${n++}`;

async function zoekSlug(s) {
  const bestanden = await readdir("src/vondsten");
  return bestanden.some((f) => f.replace(/^\d{4}-\d{2}-\d{2}-/, "") === `${s}.md`);
}

const fm = {
  title: naam,
  link,
  soort: v["Soort"] || "Overig",
  samenvatting: v["Korte beschrijving"].replace(/\s*\n\s*/g, " "),
  date: datum,
};

const img = afbeeldingUrl(v["Afbeelding"]);
if (img) fm.afbeelding = await downloadAfbeelding(img, slug);

// JSON-strings zijn geldige YAML, dus aanhalingstekens en dubbele punten zijn veilig.
const yaml = Object.entries(fm)
  .map(([k, w]) => `${k}: ${k === "date" ? w : JSON.stringify(w)}`)
  .join("\n");

const bestand = `src/vondsten/${datum}-${slug}.md`;
await writeFile(bestand, `---\n${yaml}\n---\n\n${(v["Meer uitleg"] || "").trim()}\n`);
console.log(`Geschreven: ${bestand}`);

if (process.env.GITHUB_OUTPUT) {
  appendFileSync(process.env.GITHUB_OUTPUT, `slug=${slug}\nbestand=${bestand}\n`);
}
