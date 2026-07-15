# Design QA — ST1 Relatório Trimestral B2C

- source visual truth paths:
  - `/workspace/scratch/6a829d1b9495/upload/Captura de tela 2026-07-14 155601(1).png`
  - `/workspace/scratch/6a829d1b9495/upload/Captura de tela 2026-07-14 155522(1).png`
  - `/workspace/scratch/6a829d1b9495/work/pdf/contact-sheet.png`
  - `/workspace/scratch/6a829d1b9495/upload/logo-ST1-03 (2).png`
  - `/workspace/scratch/6a829d1b9495/upload/FireShot Capture 044 - ST1 Internet - Relatório B2C — Junho 2026_ - [relatorio-mensal-de-junto-st-1-inte-eight.vercel.app].pdf`
- implementation screenshot path: unavailable
- intended viewports: 1440 × 900 and 390 × 844
- state: landing page loaded, charts animated, presentation mode available

## Full-view comparison evidence

Blocked. The connected browser was unavailable and the local Playwright runtime
did not contain a browser executable. The permitted browser download endpoint
returned an invalid zero-byte archive, so no browser-rendered screenshot could
be captured for side-by-side comparison.

## Focused region comparison evidence

Blocked for the same reason. No pixel-level comparison was claimed.

## Static checks completed

- Production build succeeds with Vite.
- JavaScript syntax check succeeds.
- Official ST1 logo is bundled and referenced in hero, navigation, and footer.
- Digital performance contains only the five intended commercial owners.
- Digital chart has keyboard-accessible view buttons and updates its text alternative.
- Pointer tooltip exposes the selected month, series, and value.
- No duplicate element IDs.
- Every internal navigation target resolves.
- Every canvas has `role="img"` and a text alternative.
- All data tables have captions.
- Referenced images and local Poppins font files exist.
- No custom inline SVG, CSS gradient, or empty decorative image alternative was used.
- Responsive CSS includes explicit 1100 px, 840 px, 560 px, reduced-motion, and print paths.
- Dense seller data is inside a keyboard-focusable horizontal scroll container.
- Important chart values are repeated in visible summaries or accessible tables.
- `prefers-reduced-motion` removes decorative motion and preserves content.

## Findings

- P1 — Browser-rendered verification unavailable.
  - Evidence: neither the connected browser nor a Playwright browser executable
    was available.
  - Impact: visual overflow, real font rendering, focus order, full-screen behavior,
    and animation timing could not be proven in a real browser.
  - Fix: open the deployed page in Chrome/Opera and capture both target viewports.

## Comparison history

- Iteration 1: build and static audit passed; browser capture blocked.
- Iteration 2: hierarchy, official logo, storytelling, seller scope, chart interaction,
  reduced-motion behavior, and responsive rules were revised; build passed.
- No pixel-level match was claimed because no rendered comparison existed.

## Primary interactions intended for browser test

- Sticky navigation between Visão, PAP, Digital, and Plano 90 dias.
- Modo apresentação and exit with Escape.
- Arrow/Page navigation while in presentation mode.
- Disclosure controls for data, methodology, and source caveats.
- Animated counters and canvas charts.
- Digital chart toggle between volume and conversion.
- Point-level tooltip on the Digital chart.
- Hero logo orbit, pointer parallax, staged story rail, and progressive funnel bars.

## Console errors checked

Not available without a browser runtime.

## Final result

blocked
