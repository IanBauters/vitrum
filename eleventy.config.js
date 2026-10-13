import site from "./src/_data/site.json" with { type: "json" };

const MAANDEN = [
  "januari", "februari", "maart", "april", "mei", "juni",
  "juli", "augustus", "september", "oktober", "november", "december",
];

// Kleuren voor soorten die (nog) niet in site.json staan.
const RESERVE = [
  { kleur: "#2F4BD8", tekst: "#FFFFFF" },
  { kleur: "#1E8C6E", tekst: "#FFFFFF" },
  { kleur: "#E5533D", tekst: "#FFFFFF" },
  { kleur: "#F0B429", tekst: "#1C1D24" },
  { kleur: "#6B5BD2", tekst: "#FFFFFF" },
];

export default function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy({ "src/assets": "assets" });

  eleventyConfig.addCollection("vondsten", (api) =>
    api.getFilteredByGlob("src/vondsten/*.md").sort((a, b) => b.date - a.date)
  );

  eleventyConfig.addFilter("domein", (url) => {
    try {
      return new URL(url).hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  });

  eleventyConfig.addFilter("datumNl", (d) => {
    const date = new Date(d);
    return `${date.getUTCDate()} ${MAANDEN[date.getUTCMonth()]} ${date.getUTCFullYear()}`;
  });

  eleventyConfig.addFilter("isoDatum", (d) => new Date(d).toISOString().slice(0, 10));

  eleventyConfig.addFilter("slug_soort", (s) =>
    String(s || "overig")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  );

  eleventyConfig.addFilter("soortStijl", (soort) => {
    const bekend = site.soorten?.[soort];
    if (bekend) return bekend;
    let h = 0;
    for (const c of String(soort || "")) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return RESERVE[h % RESERVE.length];
  });

  eleventyConfig.addFilter("uniekeSoorten", (items) => [
    ...new Set(items.map((i) => i.data.soort || "Overig")),
  ]);

  // Afbeeldingen mogen een volledige URL of een pad binnen de site zijn.
  eleventyConfig.addFilter("afbeeldingUrl", function (src) {
    if (!src) return "";
    if (/^https?:\/\//.test(src)) return src;
    return eleventyConfig.getFilter("url")(src.startsWith("/") ? src : "/" + src);
  });

  return {
    dir: { input: "src", output: "_site", includes: "_includes", data: "_data" },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
    // Op GitHub Pages staat de site onder /<repo-naam>/.
    pathPrefix: process.env.PATH_PREFIX || "/",
  };
}
