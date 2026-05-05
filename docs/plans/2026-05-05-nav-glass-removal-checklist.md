# Nav Glass Removal Checklist

Date: 2026-05-05
Scope: Remove the moving liquid-glass navigation indicator and keep the navigation treatment consistent with the rest of the UI.

## Plan

- [x] Document the requested correction and acceptance criteria.
- [x] Remove the moving navigation indicator state from `SiteHeader.astro`.
- [x] Replace the moving indicator CSS with static hover, focus, and active states.
- [x] Verify architecture, type checks, production build, and static asset safety.
- [x] Ask a review sub-agent to inspect the diff.
- [x] Address review feedback or record that no blocking issues were found.

## Acceptance Criteria

- Navigation no longer has a shared glass capsule moving between links.
- Inactive navigation links render as text-first controls without visible glass borders.
- Active, hover, and focus states are static emphasis only.
- Existing skip-link accessibility behavior remains intact.
- The build still has no Refractive runtime, backdrop blur, or global pointer tracking regression.

## Development Notes

- User feedback: the moving glass effect felt inconsistent with the rest of the components and should be removed.
- Removed `--nav-index`, `--nav-indicator-opacity`, `data-active-index`, `.nav-links::before`, and `:has()` hover-follow behavior.
- Kept navigation states static: inactive links are text-first; hover/focus/active states get local emphasis only.
- Verification passed: `npm run verify:architecture`, `npm run check`, `npm run build`, `git diff --check`.
- Static asset search found no moving nav indicator selectors or Refractive/backdrop/pointermove regressions in `dist`.
- Review sub-agent found no blocking issues. It confirmed static nav states, removed moving indicator selectors, preserved skip-link wiring, and no architecture safety regression.
