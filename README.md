# Portfolio (Eleventy)

Static site built with [Eleventy](https://www.11ty.dev). Source is in `preview/`, the built site goes to `dist/` (git-ignored).

```
npm install        # once
npm start          # dev server with live reload
npm run build      # writes dist/
npm run deploy     # build + publish dist/ to the gh-pages branch
```

## Layout

- `preview/_includes/base.njk` is the shared page shell (head, fonts, stylesheets, body). `nav.njk` and `footer.njk` are the navigation and footer.
- Each page is a normal HTML file with a small front-matter block at the top:

  ```yaml
  ---
  title: "Doodles"                 # tab reads "Doodles · Katrina MacGregor"
  css: ["assets/css/craft.css"]    # optional extra stylesheets
  scripts: [{"src": "assets/js/x.js", "defer": true}]   # optional extra scripts
  preload: ["assets/images/hp/parchment-bg.webp"]       # optional image preloads
  description: "..."               # optional meta description
  ---
  ```

  Use `fullTitle` instead of `title` to replace the whole tab title, and `bodyClass` / `bodyAttrs` to add attributes to `<body>`. Pages put `{% include "footer.njk" %}` where the footer belongs.
- `preview/assets/` is copied to `dist/assets/` unchanged. Pages keep their file names (`doodles.html`, `work/mux.html`), so URLs don't change.

## Local-only folders

`drafts/` (prototypes), `scripts/` (Python helpers) and `private/` (unstamped doodle originals, full `.ttf`/`.otf` font files) are git-ignored and never published. Only the `.woff2` web fonts and the stamped images live in `preview/assets/`.
