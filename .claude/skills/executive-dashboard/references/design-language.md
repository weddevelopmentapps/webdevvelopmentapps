# Design language — "Editorial Government"

The system that survived an ex-Apple design-director review. It reads as designed, not
generated, because of restraint: paper, hairlines, light numerals, and one accent that
always means something.

## Contents
1. Tokens
2. Typography
3. Layout & shell
4. Components
5. Color discipline (the anti-AI-look core)
6. Motion
7. Mobile
8. Design-director checklist (run before declaring done)

## 1. Tokens

Derive the accent from the client's actual logo (sample the hex from the file — don't
guess). Build everything else as neutrals tinted faintly toward the accent's hue.

```css
:root{
  --paper:#F7F8F6; --surface:#FFFFFF;            /* page and card */
  --ink:#111815; --ink2:#39453F;                  /* text, secondary text */
  --mut:#6B7870; --faint:#95A19A;                 /* labels, hints */
  --hair:rgba(17,24,21,.09); --hair2:rgba(17,24,21,.05);  /* the ONLY borders */
  --accent:#098A4E; --accent2:#0AA35C; --deep:#0A3B27;    /* brand, brighter, dark */
  --accent-soft:#EDF5F0; --accent-softer:#F3F8F5;         /* tints */
  --gold:#B8963E;                                 /* RESERVED: targets/goals only */
  --ok:#0E8345; --warn:#B77A12; --bad:#B3402F; --info:#33628F;
  --shadow:0 1px 2px rgba(17,24,21,.03),0 10px 34px rgba(17,24,21,.05);  /* barely there */
  --r:18px; --r-sm:12px;
}
```

The tint direction matters: every gray, border, and shadow leans toward the brand hue, so
the page feels like one material instead of a theme applied to a template.

## 2. Typography

- Display/numbers: **IBM Plex Sans Arabic** — weights 300/400 for big numerals (the light
  weights are in this skill's `assets/vendor/fonts-light.css`; without them the hero looks
  bold and cheap), 600/700 for titles. Body: **Cairo** 400.
- Hero numeral: 64–76px, weight 300, `letter-spacing:-3px`. One per screen, maximum.
- Stat values: 30px weight 400, `letter-spacing:-.8px`. Labels: 11–11.5px weight 600 muted.
- Numerals are Latin digits with en-US thousands separators inside Arabic text; wrap signed
  or mixed-direction values in an isolator: `.ltr{direction:ltr;unicode-bidi:isolate}`.
  Use `font-variant-numeric:tabular-nums` in tables.
- Money: spell «مليون ريال» in headline positions; «م.ر» only inside dense tables/cards.

## 3. Layout & shell

- **White header** on paper — never a dark gradient masthead (the #1 template tell). Logo
  sits directly on white in its official colors; entity name as a small accent-colored
  kicker above the product title; date + demo-data note as quiet text; actions as
  monochrome text-buttons.
- Sticky nav below the header: text tabs, active = accent text + 2.5px accent underline,
  `backdrop-filter:blur(16px)` white at 86%.
- Content: max-width ~1560px, 28px gutters.
- Every tab except home opens with a **page head**: small accent kicker (the domain
  concept), 26px title, one-line muted description. Rendered generically from tab metadata
  so it costs one array entry per tab.
- Home opens with a **hero**: one dominant number + grade, a row of hairline-separated
  side cells, and a signature visual (see meter in components). Not four equal tiles.

## 4. Components

- **Stat strip** replaces boxed KPI tile rows: a grid with `border-block:1px solid var(--hair)`,
  cells separated by inline hairlines, NO boxes, NO icon chips. Label / value / quiet foot.
- **Cards** only where content needs a surface (charts, tables): white, hairline border,
  18px radius, near-invisible shadow. Titles 14px + 11.5px muted subtitle.
- **Status = dot + colored text**, no filled pill backgrounds:
  `.st::before{width:6px;height:6px;border-radius:50%;background:currentColor}`.
- **Journey meter** (signature hero visual, replaces gauges): horizontal track, fill
  anchored right (RTL), tinted goal zone with ONE dashed threshold edge at the target,
  markers below for each milestone (previous cycle → external assessment → current →
  target). Position = `(v-MIN)/(MAX-MIN)*100` with `right:X%` + `translateX(50%)`; zoom
  the scale (e.g., 2.5–5 instead of 0–5) for drama.
- **Segmented control** (iOS style) for mode switches: `background:var(--hair2)`, active
  pill white with a 1px shadow.
- **Buttons**: pill radius; one filled accent primary per view, everything else quiet
  text-buttons. Never four identical filled CTAs in a row.
- **Kanban**: transparent columns with hairline borders, white hairline cards. No gray wells.
- **Steppers**: numbered circles with hairline connectors; done = soft-accent, current =
  deep filled. In RTL the chain flows right→left naturally with flex.
- **Tables**: sticky header on white with hairline bottom border and muted 11px labels
  (never a filled header band); row hover = softest accent tint; last row borderless.
- **Drawers** (edit surfaces) from the inline-end side; **dark HUD tooltips** for charts
  (near-black ink background, white text, 13px radius) — the one dark element, so it reads
  as an overlay, not a theme.
- **Heat/maturity cells**: tint-on-paper, never solid fills with white bold text:
  `background:${color}1F; color:${color}; border:1px solid ${color}33`.

## 5. Color discipline — the anti-AI-look core

One sentence: **color never decorates; every color is a claim.**

- Accent = data series + interactive affordances. Bars in a category chart are ONE hue —
  a dark→light ramp by row position falsely implies a value scale and reads as template.
- Gold (or the client's second metal) appears ONLY at the goal: target marklines, the
  excellence zone, the top maturity grade. If gold also marks a historical series, a
  button, and a mid-level score, it means nothing. Neutralize the others (historical
  series → gray dashed).
- Red appears only for genuine trouble states — never on target labels ("المستهدف 92%"
  in red reads as failure), never as a delta color for an on-plan figure.
- The same figure must carry the same verdict everywhere (if 89.3% is amber on one
  screen, it cannot be green on another).
- Empty grid cells get a muted "—", not blank white (blank reads as broken).

## 6. Motion

Content entrance: 7px rise + fade, 340ms, `cubic-bezier(.22,.9,.3,1)`, 30ms stagger for
the first five children. Chart animation ≤300ms so screenshots and prints never catch
mid-animation values (a captured 3.7 next to a printed 3.8 is a credibility bug — set
`animation:false` on any hero-value chart). Honor `prefers-reduced-motion` globally.

## 7. Mobile

A real app, not a squeezed site:

- Hide the top tab bar ≤768px; show a fixed **bottom tab bar** (blur white, safe-area
  padding): 4 primary destinations + «المزيد» opening a bottom **sheet** (grab handle,
  rounded top, tile grid of remaining destinations + a second group for data actions).
- The product name never truncates: 2-line clamp, smaller size — never `text-overflow:ellipsis`
  on the platform's own identity.
- Grids collapse to 1 column (`.grid>*{min-width:0}` is load-bearing — without it, inner
  overflow containers can't engage and the page pans sideways); stat strips to 2 columns;
  horizontally scrollable rows get `flex:0 0 auto` cells + a fade mask affordance.
- The meter keeps numbers, hides text labels (`<span class="ml">` hidden ≤768px).
- Test: every tab `document.documentElement.scrollWidth ≤ 395` at 390px width. This is a
  hard gate; hunt overflow with a bounding-rect walker, fix the element, not the symptom.

## 8. Design-director checklist

Run against fresh screenshots (desktop full-page + mobile) before declaring done:

1. Is there exactly one hero number per screen, or four competing tiles?
2. Does any chart use position-based multi-hue ramps? (→ one hue)
3. Count gold appearances — is every one a target/goal?
4. Any red on a label that isn't a trouble state?
5. Any solid-fill heat cells with white text? Filled chip storms?
6. Any centered icon-card grids with repeated filled CTAs?
7. Does the same number carry different verdicts on different screens?
8. Mobile: identity truncated? content clipped mid-word with no affordance? overflow?
9. Print/screenshot: could any animated value be captured mid-count?
10. Would a native speaker find a single literally-translated label? (→ language pass)
