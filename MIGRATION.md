# MIGRATION.md

Temporary document. Delete it when phase 5 is signed off.

## Goal

Replace a Sass and gulp build pipeline with two hand-written files, `index.html`
and `styles.css`, matching the spec in `DESIGN.md`.

## Approach

Build the replacement alongside the old site, then cut over. Do not incrementally
de-gulp the existing pipeline.

The reasoning matters, so that nobody re-litigates it halfway through: the target
is a page with eleven lines of text, no JavaScript, and one stylesheet. There is
nothing left for a build system to do, so migrating gulp to a newer bundler buys
nothing. Untangling compiled Sass into hand-written CSS is also slower and riskier
than writing the CSS fresh from the design spec, because the compiled output
carries years of rules for elements the new page does not have.

The old build stays untouched and working until the new page is verified. That
keeps a rollback available at every point.

## Must not break

Filled in from the phase 0 audit, 2026-09-08. Confirm each of these is preserved
before phase 3 and again after phase 5:

- **Public URLs** — `https://chabros.dev/` is the only route that must survive.
  Two redirects must keep working: `www.chabros.dev` → apex (301) and
  `matchabros.github.io` → apex (301). `/public/css/main.min.css` dies with the
  old build; it has no known inbound links and needs no redirect.
- **Domain and certificate** — `chabros.dev` on GitHub Pages, served from the
  `master` branch root, Let's Encrypt certificate auto-renewed. The `CNAME` file
  at the repo root is what binds them: it must stay committed and unchanged.
  ⚠️ "Enforce HTTPS" is currently **off** — `http://chabros.dev/` returns 200
  instead of redirecting. Turn it on during phase 3.
- **Form endpoints** — none exist. The site has no forms and no backend.
- **Analytics and verification tags** — both present today, both deliberately
  dropped rather than migrated. See "Deliberately dropped" below.
- **`robots.txt` / `sitemap.xml` / `favicon.ico` / `.well-known`** — `robots.txt`
  is committed rather than generated, and is deliberately dropped (below). The
  other three have never existed and 404 today, so there is nothing to preserve.
  Nothing on this list was ever produced by the build.
- **Known inbound links** — the apex domain only. Separately, email must keep
  working: `chabros.dev` carries Google Workspace MX records, so
  `contact@chabros.dev` is a live mailbox and the `mailto:` must point at it
  exactly.

### Deliberately dropped

Decided 2026-09-08. All four exist on the live site today and are **not** being
carried across. Recorded here so a later "where did that go?" has an answer.

- **`robots.txt`** — its body is `User-agent: *` / `Disallow:`, which grants
  exactly the access a missing `robots.txt` already grants; crawlers read a 404
  as "crawl everything". The file is a no-op. If AI-crawler blocking is ever
  wanted, it comes back as four lines.
- **`humans.txt`** — never linked from the page (no `rel="author"`), so nothing
  has ever discovered it. Contents are stale: a dead Twitter URL, a misspelling
  of the owner's name, and a "CSS3, HTML5" colophon.
- **Google Analytics** — inline Universal Analytics snippet for `UA-61069917-1`,
  pulling 52 KB of `analytics.js`. Universal Analytics stopped processing data in
  July 2023, so it has collected nothing for years. No replacement is added.
- **`google-site-verification` meta tag** —
  `ETYvrwKlyckG2YUa86Mj-oTfAxXQiI_rAG-DHGY8dxQ`. Removing it un-verifies the
  Search Console property. If that access is wanted later, re-verify by DNS TXT
  record rather than a meta tag, so the page carries nothing that exists for a
  third party.

---

## Phase 0 — audit, change nothing

Report findings; do not edit, move, or delete any file in this phase.

1. List every file in the repo and mark each as: source, build output, build
   config, or asset.
2. Identify what the gulp pipeline actually does — Sass compilation, autoprefixer,
   minification, concatenation, image processing, live reload, deployment, or
   anything else. Name each task and what it produces.
3. Identify what is deployed today: which directory, by what mechanism, to what
   host.
4. List every route the current site serves.
5. Flag anything that would be lost by moving to two static files and that is not
   covered by `DESIGN.md`.

_Done when:_ the audit is written up and the "must not break" list above is filled
in with real values.

**Status: done, 2026-09-08.** Audit findings that change the plan are in Notes.

## Phase 1 — capture the baseline

**Status: done, 2026-09-08.** Screenshots committed in `9431ea2`; annotated tag
`pre-migration` created on `0a8df6e`.

1. Screenshot the current live site at 1280px and 375px. Commit the images to a
   temporary `baseline/` directory.
   → `baseline/live-1280.png`, `baseline/live-375.png`, headless Chrome 152.
   The 1280 shot uses `--window-size`; the 375 shot must use CDP device
   emulation, because bare `--window-size` below 500px silently lies. See Notes.

2. Record the current page weight and Lighthouse scores.

   **Page weight — two figures, and phase 5 must compare like with like:**

   | Measure | Value |
   |---|---|
   | Uncompressed, as authored | ~75 KB over 5 requests |
   | Transferred, as Lighthouse measures it | 48 KiB over 7 requests |

   Uncompressed breakdown: `index.html` 15,633 B, `main.min.css` 4,186 B, Google
   Fonts CSS 172 B, Lato woff2 2,988 B, `analytics.js` 52,310 B. Lighthouse sees
   two requests the file audit could not: the browser's automatic `/favicon.ico`,
   which 404s and pulls 5,500 B of GitHub's error page, and an analytics beacon.
   Three origins are third-party. The 60 KB budget in `DESIGN.md` section 7 is an
   **uncompressed** figure — compare it against the 75 KB row, never the 48 KiB
   one.

   **Lighthouse 12.8.2, mobile preset, simulated throttling, 2026-09-08:**

   | Category | Score |
   |---|---|
   | Performance | 79 |
   | Accessibility | 89 |
   | Best Practices | 96 |
   | SEO | 100 |

   FCP, LCP, Speed Index and TTI all 3.9 s. TBT 0 ms, CLS 0.

   Every deduction is already scheduled for removal, which is the useful part:

   - **Performance 79** — the sole render-blocking request is
     `fonts.googleapis.com/css?family=Lato`, costing 775 ms. Self-hosting deletes
     it. Also flagged: no `font-display`, no preconnect, weak cache lifetimes.
   - **Accessibility 89** — one failure, `html-lang-valid`: `lang="eng"` is not a
     valid language tag. `DESIGN.md` section 9 task 3 already requires a correct
     `lang`, so this closes itself.
   - **Best Practices 96** — one console error, the `/favicon.ico` 404.
     **Decided 2026-09-08: no favicon is added**, so this deduction is expected
     to survive into phase 5. Do not treat a Best Practices score of 96 after the
     migration as a regression; treat anything below it as one.
   - **SEO 100** — already perfect; do not regress it. Task 3's `<title>` and
     meta description are what hold it up.

   Phase 5 must re-run Lighthouse identically — `npx lighthouse <url>` with
   default mobile settings — or the comparison means nothing.

3. Tag the current commit `pre-migration` so the old state is retrievable by name.
   → annotated tag on `0a8df6e`, which is also `origin/master` and byte-identical
   to what production serves. ⚠️ **Local only. Push it before phase 4 begins
   deleting files**, or the restore point exists on one laptop.

_Done when:_ the tag exists and the screenshots are committed. ✓

## Phase 2 — build the replacement

Follow tasks 1 to 3 in `DESIGN.md` section 9. Build into the repo root as
`index.html` and `styles.css`.

Do not touch `gulpfile.js`, `package.json`, the Sass sources, or the old build
output during this phase. If a filename collides with existing build output, build
the new files in a temporary directory and note the collision for phase 3.

_Done when:_ the new page passes all three "done when" criteria in `DESIGN.md`,
and both themes render correctly served locally over `python3 -m http.server`.

**Status: done, 2026-09-09.** All three tasks complete and verified over
`python3 -m http.server` in both themes.

- **Task 1** — wireframe matched at 1280 and 375; all seven colour tokens on
  `:root`; zero hex literals elsewhere.
- **Task 2** — dark palette redeclares the seven tokens and nothing else; no
  selector other than `:root` branches on theme; `scrollWidth`/`scrollHeight`
  identical across themes, so no layout shift.
- **Task 3** — Lighthouse 12.8.2: **Performance 100, Accessibility 100 with zero
  violations, Best Practices 96, SEO 100.** Focus ring verified by dispatching a
  real Tab keypress and asserting `:focus-visible` matched with
  `outline: solid 2px` in `--accent`; a programmatic `.focus()` does not trigger
  Chrome's heuristic and gives a false reading.

Page weight **43.0 KB uncompressed over 4 requests, all same-origin**, against
the 60 KB budget in `DESIGN.md` section 7. The only non-200 is the
`/favicon.ico` 404, which is the accepted decision and the sole reason Best
Practices is 96 rather than 100.

**Collision noted for phase 3:** `index.html` at the repo root was replaced with
the new page. It was old *source*, not build output, so the phase 2 rule about
building into a temporary directory did not apply; the previous page remains
retrievable at `pre-migration:index.html` and on `master`. The old build output
`public/css/main.min.css` was left untouched and is still served by the live
site.

## Phase 3 — cut over

1. Resolve any filename collisions found in phase 2.
2. Point the deploy at the repo root instead of the old build output directory.
3. Preserve everything on the "must not break" list. Nothing on it was generated
   by the build, so there is nothing to copy across — but confirm `CNAME` is
   still present at the repo root, and turn on "Enforce HTTPS" in the Pages
   settings while you are there.
4. Add redirects for any old URL that no longer exists. Only three paths go away
   — `/public/css/main.min.css`, `/robots.txt`, `/humans.txt` — and all three are
   accepted 404s recorded under "Deliberately dropped". Nothing beyond those
   three may be dropped silently.
5. Deploy to a preview URL, not production.

_Done when:_ the preview URL serves the new page, every item on the "must not
break" list is verified against it, and no request in the network tab goes to a
third-party origin — specifically, no `fonts.googleapis.com`, no
`fonts.gstatic.com`, and no `google-analytics.com`. View source and confirm the
analytics snippet and the `google-site-verification` meta tag are both absent.

**Status: partially done, 2026-09-09.** Everything verifiable without hosting
access is done and passing. Three items are blocked on the owner.

**Step 1, collisions — resolved.** The only collision was `index.html`, which was
old *source*, not build output, so the phase 2 temp-directory rule never applied.
The old page stays retrievable at `pre-migration:index.html` and on `master`.
`public/css/main.min.css` is untouched and still serving live, so rollback is
intact.

**Step 2, "point the deploy at the repo root" — no-op, written on a false
premise.** This is a GitHub Pages *user site*; it has always served the repo root
of the default branch. `public/css/` was never a publish directory, just a folder
inside the served root. There is nothing to repoint.

**Step 3, must-not-break — verified against the working tree:**

| Item | Result |
|---|---|
| `CNAME` present and unchanged | yes, `chabros.dev` |
| `mailto:` target | `mat@chabros.dev`, and `chabros.dev` MX still resolves |
| Form endpoints | none, as before |
| Google Analytics in page | 0 occurrences |
| `google-site-verification` | 0 occurrences |
| Outbound links live | GitHub 200, LinkedIn 200 |
| Third-party origins | none — 4 requests, all same-origin |

**Step 4, redirects — none needed.** Three paths go away, all recorded under
"Deliberately dropped": `/robots.txt`, `/humans.txt`, `/public/css/main.min.css`.
No inbound links are known to any of them.

**Blocked, needs the owner:**

1. **No preview URL exists.** A GitHub Pages user site serves the default branch
   root and offers no deploy previews or branch previews. Step 5 as written
   assumes Netlify-style previews and cannot be satisfied on this host. Options
   are: accept the local `python3 -m http.server` verification as the gate and
   merge straight to production; stand up a second host purely for a preview; or
   host the preview in a separate repo. Local serving is byte-identical to what
   Pages will return — Pages adds gzip, cache headers and TLS but does not
   transform files — so the only things local testing cannot exercise are the
   custom domain, HTTPS and real-network font loading.
2. **"Enforce HTTPS" is still off** and needs the GitHub web UI (Settings →
   Pages → Enforce HTTPS). No `gh` CLI is installed, so it cannot be toggled from
   here.
3. **Nothing is committed or pushed.** The owner asked on 2026-09-08 that nothing
   be pushed. Phase 3 cannot complete without it.

**Trap found while checking this — read before committing.** The *committed*
`.gitignore` contains `*.css`, which ignores `styles.css`. The working tree has
an uncommitted edit removing that line. **That edit is load-bearing:** commit
`styles.css` without it and the stylesheet is silently never tracked, and the
deployed site ships with no CSS at all. The `.gitignore` change must land in the
same commit as `styles.css`, or before it.

## Phase 4 — delete what the new page replaces

Only after phase 3 is verified. **Two commits, in this order**, nothing else in
either — one changes no served bytes and one does, so they must be separately
revertable.

**Commit 1 — the toolchain.** Remove `gulpfile.babel.js`, `.eslintrc`, the
`assets/scss/` source directory, and the `public/` build output directory. Remove
the now-dead entries from `.gitignore` (`node_modules`, `*.map`). There is no
`package.json`, lockfile, `node_modules/`, `.nvmrc` or CI build step to remove —
the phase 0 audit found the manifest was deleted in April 2023, which is why the
build has been unrunnable ever since.

**Commit 2 — the dropped public files.** Remove `robots.txt` and `humans.txt`,
per "Deliberately dropped" above. Kept separate from commit 1 because this commit
changes what the site serves and commit 1 does not.

Do not remove: `CNAME`, `README.md`, `LICENSE.txt`, anything else on the "must
not break" list, the `baseline/` directory (that goes in phase 5), or `.git`.
All three named files are now listed in `CLAUDE.md`'s target architecture, so the
done-when below can be followed literally without stranding the domain.

_Done when:_ `git status` is clean, the repo contains only the files listed in the
target architecture in `CLAUDE.md`, and the site still serves correctly from a
fresh clone with no install step.

**Status: done in the working tree, 2026-09-09, not yet committed.** Brought
forward at the owner's request, ahead of the phase 3 deploy rather than after it.
Safe to do in that order because this is a feature branch: `master` still serves
the old site untouched, and `pre-migration` still tags it.

Removed: `gulpfile.babel.js`, `.eslintrc`, `assets/scss/` (14 files), `public/`
(the old build output), `robots.txt`, `humans.txt`. `.gitignore` reduced to
`.DS_Store` alone — `node_modules`, `*.map`, `.Rhistory` and `*.css` were all
dead. There was no `package.json`, lockfile, `node_modules/`, `.nvmrc` or CI step
to remove, as the phase 0 audit predicted.

Verified after deletion: nothing in `index.html` or `styles.css` referenced any
removed path, and the page renders unchanged at 1280px.

Recovery for anything wanted back: `git checkout pre-migration -- <path>`.

When these are committed they should still be split as described above — the
toolchain removal changes no served bytes, the `robots.txt`/`humans.txt` removal
does.

## Phase 5 — verify and finish

1. Clone the repo fresh into a new directory and confirm the site works with no
   commands run.
2. Deploy to production. Verify both themes on a real phone.
3. Compare against the phase 1 baseline screenshots and Lighthouse scores.
   Expect roughly **55 KB across 4 requests, none third-party**, against a
   baseline of 75 KB across 5 requests of which 3 were third-party. The 40 KB
   font budget in `DESIGN.md` section 7 is measured, not estimated, so a total
   materially above 60 KB means the fonts were shipped unsubset or still carry a
   weight axis — check that before looking anywhere else.
4. Delete `baseline/` and delete this file.

_Done when:_ production serves the new page, and `MIGRATION.md` no longer exists.

---

## Notes

Anything discovered mid-migration that changes the plan goes here, dated, rather
than being silently absorbed into a phase.

**2026-09-08 — phase 0 audit.** Findings that change the plan:

- **The SCSS does not produce the deployed CSS.** `assets/scss/` and
  `public/css/main.min.css` have drifted. The deployed CSS contains
  `.contact__github`, `.header__jobtitle` and a `max-width: 600px` media query
  that appear nowhere in the SCSS, and the SCSS still styles a
  `.contact__twitter--svg` the page no longer has. The minified file was
  hand-edited. This makes the build-fresh decision in "Approach" safer than
  stated — the SCSS is not stale source, it is abandoned source — and it means
  the only record of the current design is the minified CSS plus the phase 1
  screenshots. Do not delete either before those screenshots exist.
- **The gulp build cannot run.** `package.json` was deleted in commit `21d4c6f`
  (April 2023) and never restored, so there is nothing to install. Phase 4 has
  less to delete than it originally assumed.
- **`CLAUDE.md`'s target architecture omitted `CNAME`, `README.md` and
  `LICENSE.txt`.** `CNAME` is what binds the custom domain to GitHub Pages, so
  reading "nothing else" literally in phase 4 would have dropped the domain.
  **Resolved 2026-09-08:** all three stay in the repo, and `CLAUDE.md` now lists
  them, so phase 4's done-when is safe as written. The `Current state` TODOs in
  `CLAUDE.md` were filled from this audit at the same time.
- **Hosting defects found while auditing**, both out of scope for a file
  migration but worth fixing alongside it: "Enforce HTTPS" is off in the Pages
  settings, and the apex domain publishes only one of GitHub's four A records.
- **`origin/gh-pages` is a dead 2015 branch** holding an unrelated jQuery site.
  It is not what serves the domain. Leave it alone until Pages is confirmed to
  be reading `master`.

**2026-09-08 — favicon and contact address.** Two decisions taken after the
phase 1 Lighthouse run:

- **No favicon.** Worth recording the correction that prompted this: GitHub Pages
  supplies no default favicon. `/favicon.ico` 404s on both `chabros.dev` and
  `matchabros.github.io`, returning a 9,379 B HTML error page that itself links
  no icon, so there is no "GitHub default" to inherit — the choice is between
  adding a file and having none. None was chosen. Cost: a blank tab icon, one
  console error, and Best Practices capped at 96.
- **Contact address is `mat@chabros.dev`**, replacing the `contact@chabros.dev`
  the live page advertises today. The old mailbox keeps working; it just stops
  being published. Anything that links `contact@chabros.dev` from outside the
  site is unaffected, since this changes a `mailto:` and not a route.

**2026-09-08 — RETRACTED: the live site is not broken at 375px.** An earlier
entry here claimed the live page overflowed horizontally on mobile. That was
wrong, and the cause was the measuring instrument, not the page.

**The trap.** Headless Chrome on this machine clamps the layout viewport to a
minimum of **500 CSS px**. `--window-size=375,812` renders the page at 500px wide
and then crops the screenshot to 375px, which looks exactly like horizontal
overflow: content sliced off at the right edge. A probe page reporting
`window.innerWidth` under `--window-size=375,812` returned **500**, which is how
this was caught.

**The measurement that counts.** Driving Chrome over the DevTools Protocol with
`Emulation.setDeviceMetricsOverride` at `width: 375, mobile: true` gives a real
375px viewport. Under that, `https://chabros.dev/` reports
`innerWidth 375, scrollWidth 375, overflow false` — the live page fits. Its
mobile layout is cramped and centred, but it is not broken.

**Consequences.** `baseline/live-375.png` has been recaptured at a true 375px
viewport and is a legitimate comparison target after all. Any phase 5 screenshot
work must use CDP device emulation, never bare `--window-size` below 500px, or it
will manufacture the same phantom defect. The helper used is
`scratchpad/shot.py`; the essential flags are `--remote-debugging-port` with
`--remote-allow-origins=*`, plus `suppress_origin=True` on the websocket client.

**2026-09-08 — scope decisions.** `robots.txt`, `humans.txt`, Google Analytics
and the `google-site-verification` meta tag are dropped rather than migrated;
reasoning for each is under "Deliberately dropped". The page-weight constraint in
`DESIGN.md` section 7 was rewritten the same day to account for self-hosted
fonts.

**2026-09-08 — one font weight, not two.** `DESIGN.md` section 3 claimed weights
400 and 500 both exist, but every row of its own type scale specifies 400 and
nothing on the page uses 500. Resolved in favour of **400 only**, which also
makes section 3 agree with `CLAUDE.md`'s "two self-hosted woff2 files" — one
static instance per family. Both files were corrected. Consequence for phase 2:
no `<strong>` or `<b>` may appear in the markup, because with no 500 or 700 face
self-hosted the browser would synthesize fake bold. The section 7 page-weight
budget was tightened from 100 KB to 60 KB on the strength of the measurements
recorded there.
