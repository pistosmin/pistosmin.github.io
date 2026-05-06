# Home Project Rail Hover Checklist

Date: 2026-05-06
Scope: Fix home project rail hover clipping, layout jitter, and unstable status/stack pills.

## Search Notes

- Current home project rail lives in `src/pages/index.astro` and is styled by `.project-rail` / `.project-peek` in `src/styles/global.css`.
- The rail currently uses flex children and animates `flex-grow` on hover.
- Hover changes card width, which changes description line wrapping and stack pill wrapping.
- Description text is always clamped to two lines, so widening the card still cannot reveal longer descriptions.
- Status and stack pills use content-sized widths; when their parent width changes, wrapping and perceived pill size change with the hover state.

## Plan

- [x] Inspect home project markup and CSS.
- [x] Identify layout-affecting hover properties.
- [x] Replace flex-grow expansion with a stable grid rail.
- [x] Keep hover/focus emphasis to border, shadow, and description reveal only.
- [x] Reserve enough card and description space so hover does not move surrounding layout.
- [x] Make status and stack pills stable with fixed line-height, nowrap, and non-shrinking inline layout.
- [x] Run Astro/type/build verification.
- [x] Visually verify desktop and mobile home behavior.
- [x] Re-check feedback criteria and apply a second pass if needed.

## Acceptance Criteria

- Hovering a home project card does not resize neighboring cards or shift the page vertically.
- Hover/focus reveals enough description text to read the full home-card summaries.
- Status pills such as `공개됨`, `보관됨`, and `진행 중` do not stretch or compress during hover.
- Stack pills keep stable dimensions during hover.
- Mobile remains readable without requiring hover.

## Feedback Log

- User feedback: expanded project cards still clip descriptions.
- User feedback: hovering causes visible up/down layout shaking.
- User feedback: status and stack pills appear to grow and shrink during hover.
- Development note: project rail now uses fixed grid rows instead of `flex-grow` hover expansion.
- Development note: hover/focus changes no longer affect sibling card width; description reveal is capped inside the card.
- Development note: status and stack pills now use nowrap inline-flex sizing with fixed line-height and minimum block sizes.
- Feedback pass: removed the remaining `translateY(-1px)` from project hover so the card itself does not move vertically.
- Verification note: `npm run build`, `npm run verify:home-content`, and `git diff --check` passed.
- Verification note: Chrome CDP desktop hover measurement reported 0px change for card position, card size, status pills, stack pills, and description overflow.
- Verification note: mobile CDP measurement at 390px viewport reported `scrollWidth` 390px and 0px description overflow for all home project cards.
