# Home Project CTA Checklist

Date: 2026-05-06
Scope: Move the home Projects "전체 보기" link from the section heading to a centered CTA below the latest project cards.

## Search Notes

- Home project markup lives in `src/pages/index.astro`.
- Current project section heading includes a small `전체 보기` link beside the `작업물` heading.
- The project cards use a fixed grid rail, so a CTA should sit below the rail in the content column rather than in the left heading column.
- The live site currently uses `project-rail-hover-fix.css` as a home-only cache override, so CTA styles should be mirrored there and its query version should be bumped for Pages freshness.

## Plan

- [x] Inspect current project section markup and CSS.
- [x] Remove the heading-level `전체 보기` link.
- [x] Add a centered CTA below the 4-card rail.
- [x] Style the CTA so it feels like a light continuation of the card rail, not a loud marketing button.
- [x] Mirror the CTA style in the home cache override stylesheet and bump its version.
- [x] Run build and home content verification.
- [x] Visually check desktop/mobile layout.

## Acceptance Criteria

- The project section no longer implies that only four projects exist.
- The CTA sits centered under the latest 4 project cards.
- The CTA reads as `작업물 전체 보기`.
- Desktop and mobile layouts have no overflow or awkward spacing.
- The live Pages cache path changes so the new CTA styling is fetched.

## Feedback Log

- User feedback: 4 visible cards make it look like there are only 4 projects.
- User direction: move the existing project `전체 보기` affordance below the cards and make it fit the UI.
- Development note: `작업물 전체 보기` now sits centered under the home project rail.
- Development note: the home cache override stylesheet version moved to `20260506-3`.
- Feedback pass: desktop measurement showed the CTA initially flowed into the left heading column, so the cards and CTA are now grouped in the project-card content column.
- Feedback pass: wrapped the rail and CTA in `project-rail-content` so the CTA spacing is controlled directly below the cards instead of inheriting the parent grid row gap.
- Verification note: `npm run build`, `npm run verify:home-content`, and `git diff --check` passed.
- Verification note: desktop and mobile measurements report the CTA centered under the project rail with a 14px gap and no horizontal overflow.
