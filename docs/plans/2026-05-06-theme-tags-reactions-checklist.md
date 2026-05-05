# Theme Tags Reactions Checklist

Date: 2026-05-06
Scope: Bring category summary accents back into the main theme, replace the home Notes block with tags, add a recent reactions area, then commit and push to GitHub.

## Plan

- [x] Inspect current home/category/comment code and previous checklist state.
- [x] Replace hard-coded category accent/wash colors with theme-token-derived variants.
- [x] Remove the home Notes block.
- [x] Add a compact tag list component on the home page.
- [x] Add a recent reactions/comments area that links to post comment sections and reflects giscus availability.
- [x] Keep desktop and mobile density compact with no overflow.
- [x] Run type, build, architecture, and whitespace verification.
- [x] Capture browser screenshots after changes.
- [x] Ask a review sub-agent to inspect the diff and screenshots.
- [x] Apply or record review feedback.
- [ ] Commit and push to GitHub.

## Acceptance Criteria

- Category summary visuals stay inside the existing `--accent`, `--blue`, surface, and text token system.
- Home no longer surfaces Notes as a lower-section card/pill list.
- Tag list is useful without pretending tag-filter routes exist.
- Recent reactions area does not fake live comment counts; it honestly reflects whether giscus is configured.
- GitHub push succeeds after validation.

## Feedback Log

- User feedback: category accent/wash colors drifted from the main theme.
- User feedback: Notes can be removed from the home lower section.
- User feedback: replace that area with tags and add a recent comments/reactions area.
- Development note: category summary accents now derive from `--accent`, `--blue`, surfaces, and text tokens instead of standalone hard-coded category colors.
- Development note: home Notes was removed from the lower section and replaced with tag tokens.
- Development note: recent reaction rows link to each post's comment section and show giscus availability without inventing live counts.
- Development note: mobile reaction titles can wrap to two lines so the section stays readable at 390px.
- Verification note: `npm run check`, `npm run build`, `npm run verify:architecture`, and `git diff --check` passed.
- Verification note: Playwright captured home desktop/mobile and `/writing/` mobile after the revisions.
- Review note: sub-agent found no blocking issues before push and confirmed temporary Playwright artifacts should not be staged.
