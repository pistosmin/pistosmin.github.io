# Writing Mobile UI Checklist

Date: 2026-05-05
Scope: Fix mobile Writing layout, reduce heavy typography, align UI components after font changes, and make category summary components feel more intentional.

## Search Notes

- Toss Tech reference: category/list pages lead with a clear section label, then dense article cards with role/category metadata.
- Kakao Tech reference: recent content exposes type, author, and date together instead of only count-like metadata.
- Woowahan Tech reference: list items use visible publication dates and short summaries, making the list feel curated rather than generated.
- Mobile typography references: keep body text around 16px, avoid oversized mobile headings, and use line height to preserve scanability.

## Plan

- [x] Search current Korean tech blog and mobile typography references.
- [x] Capture the current `/writing/` mobile layout in Playwright before editing.
- [x] Reduce global heading and body typography scale so NanumSquareNeo does not feel oversized.
- [x] Fix component alignment affected by font change, especially nav, buttons, chips, and post/category cards.
- [x] Add richer category summary metadata: post count, latest/new status, latest title, and last update date.
- [x] Keep category summary usable on mobile without horizontal overflow.
- [x] Run architecture/type/build/static safety verification.
- [x] Capture `/writing/` mobile and desktop after editing.
- [x] Ask a review sub-agent to inspect the diff and screenshots/checklist.
- [x] Apply or record review feedback.

## Acceptance Criteria

- `/writing/` at 390px width has no horizontal overflow and no clipped nav/category/post text.
- Font scale feels calmer: mobile H1 is smaller, section headings are not oversized, body remains readable.
- Inactive navigation and category chips align visually with the current static emphasis style.
- Category summaries include count plus latest/new/update context in compact UI.
- The result does not introduce Refractive runtime, backdrop blur, global pointer tracking, or a large React shell.

## Development Feedback Log

- User feedback: previous mobile verification was insufficient and the current writing UI breaks on mobile.
- User feedback: font change made components feel misaligned and too large.
- User feedback: category cards with only post counts feel too empty and AI-generated.
- Development note: switched primary Korean font back to Pretendard and lowered heading/card font scale to make the UI calmer.
- Development note: category cards now expose count, NEW/recent status, latest title, and last updated date.
- Verification note: `npm run verify:architecture`, `npm run check`, `npm run build`, and `git diff --check` passed.
- Verification note: Playwright captured `/writing/` at 390px and 1440px, plus `/` at 390px after fixing the home editorial grid regression.
- Review note: sub-agent found no blocking issue. It confirmed `/writing/` mobile content stays inside the viewport, typography is calmer, category summaries are static-build safe, and the black floating toolbar in screenshots is Playwright MCP overlay rather than app UI.
