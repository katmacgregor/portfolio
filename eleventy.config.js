// Eleventy config. Source lives in preview/ (pages, _includes/), output goes to dist/.
// Pages keep their file names and URLs (doodles.html, work/mux.html, ...); nothing is renamed to pretty URLs.
module.exports = function (eleventyConfig) {
  // Copied through untouched.
  eleventyConfig.addPassthroughCopy({
    "preview/assets": "assets",
    "preview/CNAME": "CNAME",
    "preview/robots.txt": "robots.txt",
    "preview/.nojekyll": ".nojekyll",
  });
  eleventyConfig.ignores.add("preview/assets/**");

  // "/work/mux.html" -> "../", "/doodles.html" -> "". Keeps asset links relative,
  // exactly like the hand-written pages were.
  eleventyConfig.addFilter("relroot", function (url) {
    var depth = (url || "/").split("/").length - 2;
    return "../".repeat(Math.max(0, depth));
  });

  // 1 -> "01"
  eleventyConfig.addFilter("padStart", function (n) { return String(n).padStart(2, "0"); });

  // Neighbours of a case study in the ordered list (_data/work.json): { num, prev, next }, num as "01".
  eleventyConfig.addFilter("workNeighbors", function (list, slug) {
    var i = list.findIndex(function (w) { return w.slug === slug; });
    return { self: list[i], num: String(i + 1).padStart(2, "0"), prev: list[i - 1], next: list[i + 1],
             prevNum: String(i).padStart(2, "0"), nextNum: String(i + 2).padStart(2, "0") };
  });

  return {
    dir: { input: "preview", output: "dist", includes: "_includes" },
    templateFormats: ["html", "njk"],
    htmlTemplateEngine: "njk",
  };
};
