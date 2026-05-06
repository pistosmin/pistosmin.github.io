# Ralph Backlog 003-008 Spec

Date: 2026-05-06
Scope: Implement selected backlog items 004, 005, 008, 003, and 006 in small reviewable commits.

## 004 Mobile Social Links

### Goal

Fix the mobile profile-card social links so GitHub, Instagram, and LinkedIn stay compact on the home and About profile cards.

### Reference Notes

- Current source: `src/components/SocialProfileLinks.tsx`.
- Current mobile CSS likely forces `.profile-social-link` to full-width behavior under narrow breakpoints.
- Keep accessible names through `aria-label`; labels may be visually hidden on narrow screens if needed.

### Implementation Checklist

- [ ] Keep the shared `SocialProfileLinks` component reusable for home and About.
- [ ] Make mobile social controls compact and stable instead of full-width.
- [ ] Preserve visible labels on wider layouts.
- [ ] Preserve hover and focus-visible states.
- [ ] Avoid horizontal overflow at 390px and 360px widths.

### Acceptance Criteria

- [ ] Home profile-card social links no longer occupy full rows on mobile.
- [ ] About profile-card social links no longer occupy full rows on mobile.
- [ ] GitHub, Instagram, and LinkedIn links keep accessible labels.
- [ ] Desktop social links still look like labeled compact pills.

## 005 About Duplicate GitHub CTA

### Goal

Remove the duplicate GitHub CTA from the About hero. The About profile card remains the only GitHub social entry point on that page.

### Reference Notes

- Current source: `src/pages/about.astro`.
- User direction: remove the GitHub button that is paired with the Projects button.
- Keep a single clear internal CTA to projects.

### Implementation Checklist

- [ ] Remove `SITE.github` from About hero actions.
- [ ] Keep one primary `Projects` or `작업물 보기` action in the hero.
- [ ] Ensure `SocialProfileLinks` still appears in the About profile card.
- [ ] Remove now-unused imports.

### Acceptance Criteria

- [ ] About hero does not render a GitHub button.
- [ ] About profile card still renders GitHub, Instagram, and LinkedIn.
- [ ] About hero action layout is stable with one button.

## 008 Read Article Markers

### Goal

Use `localStorage` to mark posts the reader has opened before, then show that state on post cards across Writing, tag/category archives, home recent posts, and related posts.

### Reference Notes

- Store only minimal data: post slugs and a timestamp if needed.
- Storage access can throw in blocked or private contexts, so all reads and writes must be guarded.
- The site is static-build friendly; keep read history purely client-side.

### Implementation Checklist

- [ ] Add a small shared client script or component for read-history behavior.
- [ ] Mark the current post slug when a post detail page loads.
- [ ] Add stable `data-post-slug` markers to `PostCard`.
- [ ] Add a compact `읽음` badge or equivalent state inside post cards.
- [ ] Keep server-rendered pages readable when JavaScript or storage fails.
- [ ] Keep stored history bounded to avoid unbounded localStorage growth.

### Acceptance Criteria

- [ ] Opening `/posts/<slug>/` records the slug in localStorage.
- [ ] Returning to lists marks matching post cards as read.
- [ ] Related posts can show read state when applicable.
- [ ] Storage failure does not break rendering.
- [ ] Stored data contains only slug-level read history.

## 003 Tokenless GitHub Contributions

### Goal

Add a tokenless GitHub contribution section to `/projects/` without committing secrets or relying on GitHub GraphQL.

### Reference Notes

- GitHub GraphQL `ContributionsCollection` is useful for structured contribution data, but GraphQL calls require authentication, so do not use GraphQL in this static public site.
- Use a tokenless visual embed only. A third-party SVG image such as `https://ghchart.rshah.org/41584e/pistosmin` is acceptable if the UI degrades to a normal GitHub profile link when the image is unavailable.

### Implementation Checklist

- [ ] Add a compact contribution panel to `src/pages/projects/index.astro`.
- [ ] Do not add tokens, secrets, GraphQL clients, or build-time GitHub fetch code.
- [ ] Keep the contribution image inside a constrained scrolling-safe wrapper.
- [ ] Add clear alt text and a visible GitHub profile link.
- [ ] Ensure image failure does not hide the project grid.

### Acceptance Criteria

- [ ] `/projects/` shows recent GitHub contribution context before or near the project grid.
- [ ] The implementation uses no token and no secret.
- [ ] Mobile layout has no horizontal overflow.
- [ ] Project cards still render if the contribution image fails to load.

## 006 Article Series Bundles

### Goal

Add explicit article series support using frontmatter and show a compact series bundle near the top of post detail pages.

### Approved Frontmatter Direction

Use an optional object field:

```yaml
series:
  id: "pistoslog-build"
  title: "pistoslog 제작기"
  order: 1
```

Rationale:

- `id` is the stable grouping key.
- `title` is the Korean display label.
- `order` gives the author explicit reading order.
- The object shape avoids accidental tag/category grouping.

### Implementation Checklist

- [ ] Add optional `series` schema to `src/content.config.ts`.
- [ ] Add content helper logic to collect posts with the same `series.id`.
- [ ] Render a compact series block near the top of `src/pages/posts/[...slug].astro`.
- [ ] Mark the current post clearly inside the bundle.
- [ ] Do not render the block for posts without series or single-entry series.
- [ ] Add `series` frontmatter to a small real existing set of related pistoslog posts so the feature is visible.

### Acceptance Criteria

- [ ] Posts in the same series display the same bundle.
- [ ] Series order follows `series.order`, with stable tie-breakers.
- [ ] The current article is visually and semantically marked.
- [ ] Posts without series keep the current detail layout.
- [ ] Mobile layout stays compact and does not push the article start too far down.

## Final Verification And Retrospective

### Goal

Review the finished implementation, fix obvious UI/UX regressions, verify the build, and capture reusable lessons from the Ralph run.

### Checklist

- [ ] Run `npm run check`.
- [ ] Run `npm run build`.
- [ ] Run `npm run verify:architecture`.
- [ ] Run `git diff --check`.
- [ ] Inspect `/`, `/about/`, `/projects/`, `/writing/`, one tag archive, and one series post in generated HTML or a browser.
- [ ] Check `ralph.log` for failed attempts and summarize concrete failure causes if there were any.
- [ ] If failures or non-obvious fixes occurred, add a concise tracked retrospective at `docs/plans/2026-05-06-ralph-backlog-003-008-retro.md`.
- [ ] Keep `.context/`, `PROMPT.md`, `ralph.config.json`, `ralph.log`, and `DONE.md` uncommitted.
