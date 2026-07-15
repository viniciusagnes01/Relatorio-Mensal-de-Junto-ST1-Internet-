# Design QA — ST1 Relatório Trimestral B2C

- source visual truth paths:
  - `/workspace/scratch/6a829d1b9495/upload/Captura de tela 2026-07-14 155601(1).png`
  - `/workspace/scratch/6a829d1b9495/upload/Captura de tela 2026-07-14 155522(1).png`
  - `/workspace/scratch/6a829d1b9495/work/pdf/contact-sheet.png`
  - `/workspace/scratch/6a829d1b9495/upload/logo-ST1-03 (2).png`
  - `/workspace/scratch/6a829d1b9495/upload/FireShot Capture 044 - ST1 Internet - Relatório B2C — Junho 2026_ - [relatorio-mensal-de-junto-st-1-inte-eight.vercel.app].pdf`
- implementation screenshot paths:
  - `/workspace/scratch/6a829d1b9495/work/st1-v3-contact-sheet.png`
  - `/workspace/scratch/6a829d1b9495/work/qa-sections/01-hero.png`
  - `/workspace/scratch/6a829d1b9495/work/qa-sections/05-radar.png`
  - `/workspace/scratch/6a829d1b9495/work/qa-sections/07-csat.png`
  - `/workspace/scratch/6a829d1b9495/work/qa-sections/13-presenters.png`
- intended viewports: 1440 × 900 and 390 × 844
- state: landing page loaded, charts animated, presentation mode available

## Full-view comparison evidence

Completed with Chromium at 1440 × 900 and 390 × 844. The page was rendered with
local Poppins fonts, animated charts, bundled logo, bundled emoji graphics, and
all reveal states. Section captures cover the hero, PAP, Digital, CSAT, restriction
matrix, FCA, 90-day plan, closing copy, and presenters.

## Focused region comparison evidence

Completed. Focused screenshots were generated for 13 desktop regions and 13
mobile regions. The revisions specifically verified the user-provided print areas.

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
- Bundled emoji graphics render consistently without depending on the operating system.
- Desktop and 390 px mobile render without horizontal overflow.

## Findings

- No P0, P1, or P2 visual defects remain in the checked regions.
- One mobile presenter-title edge was found during QA and corrected by reducing
  the responsive title scale.

## Comparison history

- Iteration 1: build and static audit passed; browser capture blocked.
- Iteration 2: hierarchy, official logo, storytelling, seller scope, chart interaction,
  reduced-motion behavior, and responsive rules were revised; build passed.
- Iteration 3: print-guided layout, copy, effectiveness width, delta labels, full
  radar, CRM KPI hierarchy, CSAT stars, deadlines, animated FCA, automation flow,
  and presenter closing were rendered and reviewed in desktop and mobile.

## Primary interactions intended for browser test

- Sticky navigation between Visão, PAP, Digital, and Plano 90 dias.
- Modo apresentação and exit with Escape.
- Arrow/Page navigation while in presentation mode.
- Disclosure controls for data, methodology, and source caveats.
- Animated counters and canvas charts.
- Digital chart toggle between volume and conversion.
- Point-level tooltip on the Digital chart.
- Hero logo orbit, pointer parallax, staged story rail, and progressive funnel bars.
- CSAT explanation toggle.
- Automation flow, FCA animation, and presentation navigation through the closing.

## Console errors checked

No console errors or page errors in Chromium. Digital view toggle and CSAT details
toggle were exercised successfully.

## Final result

pass
