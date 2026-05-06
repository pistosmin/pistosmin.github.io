# Archive Navigation Checklist

Date: 2026-05-06
Scope: Remove Notes and Now from the blog structure, then turn home tags and Writing categories into real archive navigation.

## Search Notes

- Astro reference: `src/pages/tags/[tag].astro` with `getStaticPaths()` is the recommended static route pattern for tag pages.
- Astro content collections need explicit dynamic routes when collection data should become pages.
- Reference blogs use stable category/tag archive URLs rather than inert chips or anchor-only navigation.
- Current diagnosis: home tags are `span` elements, so they do not navigate anywhere.
- Current diagnosis: Writing category cards point to `/writing/#category`, so they scroll within the full list instead of showing a filtered archive.

## Plan

- [x] Inspect current route, collection, and navigation structure.
- [x] Compare archive patterns from Astro docs and tech blogs.
- [x] Choose canonical URLs: `/writing/`, `/writing/[category]/`, `/tags/`, `/tags/[tag]/`.
- [x] Remove Notes and Now from nav, routes, content collection, generator script, and README.
- [x] Add taxonomy helpers for category and tag archive links.
- [x] Change home tag tokens into links.
- [x] Change article detail tags into links.
- [x] Change Writing category cards from hash anchors to category archive URLs.
- [x] Add category-specific Writing archive pages.
- [x] Add tag index and tag-specific archive pages.
- [x] Run type/build/architecture/whitespace verification.
- [x] Use Browser Use to test home tag links, Writing category links, and removed Notes/Now navigation.
- [x] Ask a review sub-agent to inspect the finished diff.
- [x] Apply or record review feedback.

## Acceptance Criteria

- The top navigation no longer contains Notes or Now.
- `/notes/` and `/now/` are no longer first-class blog routes.
- `/writing/` shows the full post list.
- Clicking a Writing category card opens only that category's posts.
- Clicking a home or article tag opens only posts with that tag.
- Tag labels may be Korean or contain spaces, while URLs remain stable and shareable.
- The implementation stays static-build friendly and does not add client-side filtering state.

## Feedback Log

- User feedback: Notes and Now do not seem necessary for this blog.
- User feedback: tags currently provide no function and should open the corresponding tagged post list.
- User feedback: Writing category cards should show category-specific post lists instead of jumping straight into articles or hash sections.
- Development note: archive URLs now use `/writing/[category]/`, `/tags/`, and `/tags/[tag]/`.
- Development note: tag labels and tag URL slugs are separated so Korean labels and tags with spaces can still render clean links.
- Review note: sub-agent found a tag slug collision risk; taxonomy now throws a build-time error when two distinct labels map to the same tag URL.
- Verification note: `npm run check`, `npm run build`, `npm run verify:architecture`, and `git diff --check` passed after review fixes.
- Browser note: Browser Use confirmed category navigation to `/writing/work/`, article tag navigation to `/tags/%ED%9A%8C%EA%B3%A0/`, `/writing/` full list, `/tags/` index, and 404s for `/notes/` and `/now/`.
