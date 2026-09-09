# DESIGN.md

Implementation brief for a single-page personal site for a data engineer.

Anything marked `TODO` must be filled in by the owner before build starts. Do not
invent values for these — ask.

---

## 1. Brief

**Subject.** A one-page professional site for a senior data engineer. Not a
portfolio: there are no project write-ups, no case studies, no blog.

**Audience.** Hiring managers, prospective consulting clients, and engineers who
have been given this URL and want to know within ten seconds who this person is
and how to reach them.

**Primary job.** State what the person does, establish credibility through plain
specifics rather than decoration, and offer three ways to make contact.

**Consequence for the design.** The page is short by intent. It should read as
confident and finished, not as a site whose content is still being written. That
means generous space and typographic quality carry the whole page — there is no
imagery, no illustration, and no card grid to hide behind.

---

## 2. Content

Replace every `TODO` with real copy. The build should not ship placeholders.

| Slot | Value |
|---|---|
| Name | Mat Chabros |
| Eyebrow | Data engineering, Poznań |
| Headline | I build data platforms, and I teach the people who will build the next ones. |
| Body paragraph 1 | Six years of data engineering, on greenfield builds and on platforms already carrying production load. Python, SQL and Airflow, mostly on GCP and AWS. |
| Body paragraph 2 | I also lecture on advanced data engineering in Python at Adam Mickiewicz University in Poznań. |
| Email | mat@chabros.dev |
| GitHub URL | https://github.com/matchabros |
| LinkedIn URL | https://www.linkedin.com/in/matchabros/ |

Name, GitHub and LinkedIn are transcribed from the live site as it stands on
2026-09-08. The eyebrow, headline and both paragraphs were drafted 2026-09-08
from facts supplied by the owner: six years in data engineering, GCP and AWS,
Python/SQL/Airflow, both greenfield and established projects, and a lectureship
in advanced data engineering in Python at Adam Mickiewicz University. Copy is
drafted, not signed off — edit freely, it is prose in a table, nothing depends
on it.

Two things in it are worth checking before phase 2 ships:

- **Poznań is inferred**, not supplied — it is where Adam Mickiewicz University
  is. Correct it if the working base is elsewhere.
- **Body paragraph 2 carries no availability claim**, though the slot calls for
  one. Whether someone is open to work is not a fact to invent on their behalf,
  so the paragraph states the lectureship instead. Append or substitute one of
  these if an availability line is wanted:
  "Open to consulting work." / "Not looking for new work at the moment." /
  "Open to conversations about interesting data problems."

Note the eyebrow contains `ń`, so the Polish diacritics in the font subset
(section 7) are load-bearing on the very first line of the page, not a
contingency.

On the email: decided 2026-09-08 in favour of `mat@chabros.dev`. The current live
page advertises `contact@chabros.dev`; that mailbox still exists and still
receives, it simply stops being the address on the page. Both run on the same
Google Workspace domain.

Copy guidance for whoever fills these in: prefer concrete numbers over adjectives.
"Eight years" and "Spark, dbt and Airflow on AWS" do work that "passionate" and
"results-driven" do not. Sentence case throughout. No exclamation marks.

---

## 3. Typography

Two families, clearly distinct in role.

| Role | Family | Fallback stack |
|---|---|---|
| Headline, name in header | Source Serif 4 | `Georgia, 'Times New Roman', serif` |
| Body, eyebrow, links | IBM Plex Sans | `system-ui, -apple-system, sans-serif` |

Self-host both as woff2 rather than loading from Google Fonts — two files, no
third-party request, no layout shift. Subset to Latin plus Latin Extended-A if
Polish characters are needed.

Only one weight exists on this page: **400**. One static instance per family,
so the whole font set is two files. Do not introduce a second weight — not for
the headline, not for emphasis. Where something needs to stand out it does so
through size, color or space, which is what the scale below is for.

A consequence to respect: with no 500 or 700 face self-hosted, any `<strong>`,
`<b>`, or `font-weight` above 400 renders as browser-synthesized fake bold. The
page contains no such markup and none should be added.

### Type scale

| Element | Size | Line height | Weight | Letter spacing |
|---|---|---|---|---|
| Headline | `clamp(1.6rem, 5vw, 1.9rem)` | 1.25 | 400 | -0.01em |
| Body | 15px | 1.75 | 400 | normal |
| Name (header) | 16px | 1.4 | 400 | normal |
| Eyebrow | 12px | 1.4 | 400 | 0.04em |
| "Get in touch" | 17px | 1.4 | 400 | normal |
| Social links | 14px | 1.4 | 400 | normal |

Body measure caps at 450px, which lands around 60 characters. Do not widen it.

---

## 4. Color tokens

Implement as CSS custom properties on `:root`, overridden inside a
`prefers-color-scheme: dark` block. Every color on the page must come from this
table — no one-off hex values in component rules.

| Token | Light | Dark |
|---|---|---|
| `--bg` | `#F7F5EF` | `#1E1E1C` |
| `--rule` | `#D3D1C7` | `#444441` |
| `--ink` | `#2C2C2A` | `#F1EFE8` |
| `--body` | `#5F5E5A` | `#B4B2A9` |
| `--muted` | `#6E6D68` | `#888780` |
| `--accent` | `#993C1D` | `#5DCAA5` |
| `--accent-line` | `#D85A30` | `#1D9E75` |

`--ink` is for the headline and the name. `--body` is for paragraphs and social
links. `--muted` is for the eyebrow only. `--accent` appears exactly once, on
"Get in touch"; if it shows up anywhere else, that is a bug.

`--muted` was `#888780` in both themes until 2026-09-09. At 12px on `--bg` that
measured 3.31:1 in light mode — below WCAG AA for normal text, and enough to stop
section 9 task 3 reaching a clean accessibility report. The light value is now
darkened to 4.76:1. The dark value is unchanged at 4.63:1, which already passed.

Contrast to verify: `--body`, `--accent` and `--muted` on `--bg`, in both modes.
All six must clear WCAG AA for normal text (4.5:1), because every one of them
carries body-sized or smaller text. `--rule` and `--accent-line` are exempt: they
are not text. `--accent-line` still clears the 3:1 non-text threshold in both
modes.

---

## 5. Layout

Single column, left aligned, no centering. The page does not fill the viewport
vertically and should not try to.

```
+------------------------------------------------------+
|  Name                                                 |   header, 14px 32px
+------------------------------------------------------+   1px rule in --rule
|                                                       |
|  Eyebrow                                              |   48px top padding
|                                                       |
|  Headline, serif, wrapping to two or three lines      |   max-width 470px
|  across a measure that stays under 470px              |
|                                                       |
|  Body paragraph one, sans, sitting at a narrower       |   max-width 450px
|  measure than the headline above it.                  |
|                                                       |
|  Body paragraph two.                                  |
|                                                       |
+------------------------------------------------------+   1px rule in --rule
|                                                       |
|  Get in touch                                         |   accent, underlined
|                                                       |
|  [icon] GitHub    [icon] LinkedIn                     |   14px, --body
|                                                       |
+------------------------------------------------------+
```

Content is inset 32px from the left on desktop, 20px below 600px viewport width.
Vertical rhythm: 16px after the eyebrow, 20px after the headline, 14px between
paragraphs, 36px before the rule, 28px after it, 20px between "Get in touch" and
the social row, 48px below the social row to the foot of the page, and 24px
between the two social links. The last two were settled during the build on
2026-09-08; the page foot mirrors the 48px above the eyebrow.

The rule above the contact block is structural — it separates who this person is
from how to reach them. It is the only divider on the page besides the header.

---

## 6. Behavior

- **Theme.** Follows `prefers-color-scheme`. No manual toggle in v1.
- **"Get in touch"** is a `mailto:` link to the email above. Accept that the
  address is readable in source; obfuscation is out of scope for v1.
- **Social links** open in the same tab. No `target="_blank"`. They are
  underlined in `currentColor`, 1px, 3px offset, so that they are distinguishable
  from body text by something other than colour. The underline sits on the text
  label only — it must not run under the icon or the gap. Decided 2026-09-08,
  replacing an earlier unstated assumption that they were plain text.
- **Icons** for GitHub and LinkedIn are inline SVG, 18px, currentColor, marked
  `aria-hidden="true"` with the visible text label carrying the meaning.
- **Motion.** None. No entrance animations, no scroll effects. Link hover may
  change the underline color; that is the only state change on the page.
- **Keyboard focus** is the one sanctioned exception to both of the rules above:
  a 2px `--accent` outline at 3px offset, on `:focus-visible` only, so pointer
  clicks draw nothing. It is a transient state and never painted at rest, which
  is why it does not count against section 4's "`--accent` appears exactly once".
  Required by section 9 task 3.

---

## 7. Constraints

- Two files: `index.html` and `styles.css`, linked with a plain `<link>` tag. No
  build step, no framework, no bundler, no preprocessor, no dependencies, no npm.
- `styles.css` is hand-written CSS. No Sass, no Less, no PostCSS.
- Font files sit alongside them in `/fonts`.
- **Page weight: under 60 KB uncompressed on a cold load**, every byte served
  from this origin. Sub-budgets: the font set under 40 KB, `index.html` +
  `styles.css` together under 15 KB.
- **The fonts must be pinned to weight 400 and subset before they are
  committed.** Copying files straight from Google's CDN into `/fonts` does not
  meet this constraint. Measured on the real files:

  | Source | Source Serif 4 | IBM Plex Sans | Pair |
  |---|---|---|---|
  | Google CDN, Latin only (variable) | 50.9 KB | 40.2 KB | **89.1 KB** |
  | `wght=400` instance, Latin + Polish | 17.1 KB | 19.0 KB | **35.2 KB** |
  | `wght=400` instance, Latin + full Latin-Ext-A | 24.9 KB | 25.8 KB | 50.7 KB |

  Google's files are variable fonts carrying a whole weight axis this page does
  not use, which is where the 60% saving comes from. Take the middle row: the
  full Latin Extended-A range still fits the budget but buys several hundred
  glyphs this page will never render. Produce them with `fonttools
  varLib.instancer` to pin `wght=400` (and `opsz`/`wdth` to their defaults), then
  `pyftsubset --flavor=woff2 --layout-features=kern,liga,calt`. That is a
  one-time authoring step whose output is committed — it is not a build step, and
  nothing in the repo depends on fonttools being installed.
- **Zero third-party requests.** No CDN, no Google Fonts, no analytics, no tag
  manager, no search-engine verification tag. On a cold load the network panel
  shows requests to this origin and nothing else.
- Must render correctly with JavaScript disabled. There is no JavaScript.

---

## 8. Avoid

This palette and type pairing sits close to a very common look right now. Keeping
it distinctive comes down to restraint in a few specific places:

- No all-caps or heavily tracked-out eyebrow. Sentence case, 0.04em, nothing more.
- No arrow glyph appended to link text.
- No accent color on any element other than "Get in touch".
- No border-radius anywhere. There are no cards and no boxes on this page.
- No box shadows.
- No gradient on the headline or anywhere else.
- Do not add a hero image, an avatar, a skills grid, a tech-logo strip, or a
  footer with a copyright line. If the page looks sparse, that is correct.
- No favicon. Decided 2026-09-08. Note that GitHub Pages does not supply a
  default one — `/favicon.ico` returns a 404 HTML page — so the tab icon stays
  blank and the browser's automatic request stays a 404. This is accepted, not
  overlooked: it costs one console error and caps the Lighthouse Best Practices
  score at 96. If that ever becomes annoying, the fix that adds no file is a
  single `<link rel="icon" href="data:,">` in the head, which suppresses the
  request entirely.

---

## 9. Tasks

Work these in order. Stop after each and produce a screenshot at 1280px and at
375px viewport width for review before continuing.

**Task 1 — static page, light theme.** Build `index.html` and `styles.css` with
the real content from section 2, the type scale from section 3, the light column
of section 4, and the layout in section 5. Self-host the fonts. No dark theme yet.
_Done when:_ the page matches the wireframe, all tokens are CSS custom properties
declared once on `:root`, and no hardcoded hex appears anywhere else in
`styles.css`.

**Task 2 — dark theme.** Add the `prefers-color-scheme: dark` override. Only the
seven custom properties change; no other rule may branch on theme.
_Done when:_ toggling the OS setting swaps the palette with no layout shift and no
element becomes invisible.

**Task 3 — accessibility and quality floor.** Verify contrast ratios for the four
pairs in section 4. Add a visible keyboard focus style that uses `--accent`.
Confirm heading order (one `h1`, which is the headline — the name in the header is
not a heading). Add `lang`, `<title>`, meta description, and Open Graph tags.
Respect `prefers-reduced-motion` even though there is no motion.
_Done when:_ axe or Lighthouse reports no accessibility violations and Lighthouse
accessibility scores 100.

**Task 4 — deploy.** Publish to GitHub Pages or Netlify from the repo. Configure
the custom domain if one exists. Verify the live URL renders identically to local.
_Done when:_ the production URL loads over HTTPS and both themes work on a real
phone.
