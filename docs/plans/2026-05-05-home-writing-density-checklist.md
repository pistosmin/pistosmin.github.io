# Home Writing Density Checklist

Date: 2026-05-05
Scope: Make category summaries less generic, fix desktop Writing alignment, reduce component bulk, and clarify the role of Notes and Projects on the home page.

## Search Notes

- Apple HIG reference: prioritize content, hierarchy, consistency, and alignment over decorative weight.
- Toss/Woowahan references: blog lists expose metadata in compact rows/cards instead of making every item a large hero card.
- Current UI feedback: category backgrounds are too similar and look decorative rather than semantic.

## Plan

- [x] Search current UI/layout references.
- [x] Capture current home and `/writing/` desktop/mobile before editing.
- [x] Replace repeated category-card background blobs with restrained category-specific accents.
- [x] Replace `편` count wording with a blog-appropriate label.
- [x] Fix desktop `/writing/` section heading/card alignment.
- [x] Make home Writing cards equal-density instead of oversized mosaic cards.
- [x] Rework Notes into compact note pills rather than a standalone card panel.
- [x] Rework Projects into a compact rail that can later expand on hover.
- [x] Reduce component spacing and minimum heights on desktop and mobile.
- [x] Run architecture/type/build/static verification.
- [x] Capture home and `/writing/` mobile/desktop after editing.
- [x] Ask a review sub-agent to inspect layout and code quality.
- [x] Apply or record review feedback.

## Acceptance Criteria

- Category summary cards have distinct but restrained visual identities without decorative blobs.
- Count copy reads like blog metadata, not serialized chapters.
- Desktop `/writing/` category sections align their heading metadata with the post card width.
- Home Notes no longer looks like an unrelated large card section.
- Home Projects is compact now and structurally ready for hover expansion later.
- Mobile stays compact with no horizontal overflow or clipped category/project/note text.

## Development Feedback Log

- User feedback: category summary backgrounds are identical and look dated.
- User feedback: `~편` sounds like chapters of the same topic; use article/posting-like wording.
- User feedback: desktop Writing components are misaligned.
- User feedback: Notes and Projects have unclear hierarchy and too much visual bulk.
- Observation: desktop `/writing/` section metadata is aligned to the full page width while the article card is narrower, which creates the visible mismatch.
- Observation: home Writing still uses a large editorial mosaic, while Notes and Projects read as unrelated oversized panels.
- Development note: category summary cards now use per-category accent variables and no decorative blob background.
- Development note: count copy now uses `아티클 N개` / `아티클 없음`.
- Development note: Notes moved into compact pill rows; Projects moved into a compact hover-expandable rail structure.
- Development note: hero and post-card density were reduced so the first viewport is not consumed by oversized components.
- Verification note: `npm run check`, `npm run build`, `npm run verify:architecture`, and `git diff --check` passed.
- Verification note: Playwright captured home desktop/mobile and `/writing/` desktop/mobile after the density revisions.
- Review note: sub-agent found two P2 issues: Notes markup escaped its intended grid and category card washes needed dark-theme overrides. Both were fixed.
