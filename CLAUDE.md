# CLAUDE.md

Standing context for this repository. Read this before doing anything else.

## What this is

A personal one-page website for a data engineer. It is a static site. It has no
backend, no CMS, no user accounts, no analytics beyond whatever the host provides,
and no content that changes without a commit.

## Current state

The repo is mid-migration. What exists today is an older build that uses Sass,
gulp, and a compile step. It is being replaced, not upgraded — see `MIGRATION.md`
for the plan and the current phase.

Audited 2026-09-08. Keep these accurate:

- **Package manager and Node version in use today:** none. `package.json` was
  deleted in commit `21d4c6f` (April 2023) and never restored; there is no
  lockfile, no `node_modules/` and no `.nvmrc`. Nothing to install.
- **Command that currently builds the site:** none that works. `gulpfile.babel.js`
  declares a `scss->css` task, but with no manifest and no dependencies installed
  it cannot run. The build has been dead since April 2023.
- **Directory the current build outputs to:** `public/css/`, holding only
  `main.min.css`. It is committed, and it has been hand-edited since it was last
  compiled — it no longer matches the SCSS it supposedly came from.
- **Where the site is hosted today:** GitHub Pages, serving the `master` branch
  root directly. No Actions workflow, no `/docs` folder. A push to `master` is
  the deploy. The `gh-pages` branch is an abandoned 2015 site and is not served.
- **Live domain:** `chabros.dev`, via `CNAME`. `www.chabros.dev` and
  `matchabros.github.io` both 301 to it. "Enforce HTTPS" is currently **off** in
  the Pages settings and should be turned on.

Until the migration finishes, both the old toolchain and the new static files may
be present at once. Do not assume a file is dead because it looks unused. Check
`MIGRATION.md` before deleting anything.

## Target architecture

When the migration is done, the entire site is:

```
index.html      the page, hand-written HTML
styles.css      the stylesheet, hand-written CSS
fonts/          two self-hosted woff2 files, weight 400, one per family,
                plus OFL.txt — the SIL Open Font Licence requires the licence
                and copyright notices to travel with redistributed fonts
CNAME           binds chabros.dev to GitHub Pages
README.md       repo readme
LICENSE.txt     licence
DESIGN.md       the visual spec
CLAUDE.md       this file
```

Nothing else. No `package.json`, no `node_modules`, no lockfile, no config files,
no `src/` and `dist/` split. No `robots.txt` or `humans.txt` — both were dropped
during the migration — and no `favicon.ico`, which is a deliberate choice rather
than an omission; see `MIGRATION.md` for all three. The files in the repo are the
files the browser gets.

`CNAME` is not optional and is not decoration: deleting it drops the custom
domain and the site falls back to `matchabros.github.io`. It contains one line,
`chabros.dev`, and must stay committed and unchanged.

## Hard rules

These are not preferences. Breaking one means the change gets reverted.

- **No build step.** If a change requires running a command before the site works,
  it is the wrong change.
- **No npm.** Do not add `package.json`, do not install dependencies, do not
  suggest a bundler, a task runner, or a dev server as a dependency.
- **No CSS preprocessor.** `styles.css` is plain CSS. Custom properties and
  nesting are native CSS features and are fine; Sass syntax is not.
- **No framework.** No React, no Astro, no static site generator, no template
  engine.
- **No JavaScript.** The page has none and needs none. If you believe a change
  requires JS, stop and ask rather than adding it.
- **No third-party requests.** No CDN links, no Google Fonts, no analytics
  scripts, no external CSS. Fonts are self-hosted.

## Visual decisions

All of them live in `DESIGN.md` — palette, type scale, spacing, layout, and the
list of things the design deliberately excludes. Do not make visual judgement
calls that contradict it. If `DESIGN.md` seems wrong or incomplete, say so and
wait; do not improvise a fix.

Two rules from it that get broken most often:

- Every color is a CSS custom property declared once on `:root` and overridden
  only in the `prefers-color-scheme: dark` block. No hex values anywhere else.
- Only one font weight, 400, exists on this site. Two font files total, one per
  family. No `<strong>`, no `<b>`, no `font-weight` above 400 anywhere.

## Working on it

Serve locally with `python3 -m http.server 8000` from the repo root, or just open
`index.html` in a browser. There is nothing to install and nothing to compile.

Take screenshots at 1280px and 375px widths when a change affects layout, and
compare them against the wireframe in `DESIGN.md` section 5 rather than reading
the CSS to check the work.

Commit granularity: one logical change per commit. Do not bundle a toolchain
removal with a visual change — those need to be separately revertable.

## Ask, don't assume

Stop and ask before:

- Adding any file not listed in the target architecture above.
- Changing, adding, or removing a URL path, redirect, or filename that is publicly
  linked.
- Touching DNS, hosting configuration, or the deploy pipeline.
- Removing anything from the old build that you are not certain is dead.

## Scope

This is a short page with eleven lines of text on it. The most common failure mode
here is helpful addition: a skills grid, a tech-logo strip, a footer, a hero
image, an entrance animation. `DESIGN.md` section 8 lists what is deliberately
absent. Sparse is the intent, not an oversight.
