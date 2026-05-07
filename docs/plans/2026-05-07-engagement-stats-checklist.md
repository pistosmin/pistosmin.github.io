# Engagement Stats Checklist

Date: 2026-05-07
Scope: Add build-time `공감 수` and `댓글 수` stats from GitHub Discussions/giscus to post cards, writing lists, article pages, and the home recent reactions panel.

## Context

`pistoslog` already renders giscus on post detail pages and uses `PostCard.astro` across the home latest posts, Writing archive, category archives, tag archives, and related posts. The current home `최근 반응` panel points to fresh posts and only shows whether giscus is configured. This work should turn that surface into a real engagement preview while keeping the static GitHub Pages deployment model.

## External References

- GitHub Discussions GraphQL API exposes `Repository.discussions`, `Discussion.comments.totalCount`, and `Discussion.reactionGroups`.
- giscus maps a page to a GitHub Discussion using `pathname` and can show reactions for the main discussion post.
- GitHub Actions scheduled workflows can refresh generated static data on a cron schedule.
- Astro can import JSON as static data during build.

## Decisions

- Use GitHub Discussions/giscus as the source of truth for engagement.
- Use `pistosmin/pistosmin.github.io` as the default engagement source repository because it is the current public remote and GitHub Pages repo.
- Track only aggregate `reactions` and `comments`; do not store visitor identity, read counts, IP addresses, or client-side event logs.
- Generate `src/data/engagement.json` at build/update time. The site reads this file statically.
- Match discussions by `/posts/<slug>/` in the discussion title because the current giscus mapping is `pathname`; keep body matching disabled by default and fail on duplicate matches.
- Define the data contract explicitly: `generatedAt`, `source`, `repo`, and per-post `comments`, `reactions`, `score`, `discussionUrl`, and `updatedAt`.
- Keep the display compact: `공감 n · 댓글 n`.
- Show zero counts when no discussion exists yet, so the UI is stable and the feature is visible.
- Sort the home `최근 반응` panel by engagement score and latest discussion activity; fall back to latest posts when all counts are zero.

## UI Plan

### Blog Cards And Writing Lists

- `PostCard.astro` reads post engagement by slug.
- Add one compact meta token after date/tags: `공감 n · 댓글 n`.
- Keep the existing `읽음` badge in the top line.
- No new card nesting, no large decorative block, no layout shift on mobile.

### Article Detail

- Article header shows the same compact engagement label near existing metadata.
- The giscus panel remains the actual interaction surface for comments and reactions.
- If a matching discussion URL exists, the label can link or point users down to `#comments`; otherwise it stays plain text.

### Home Recent Reactions

- Replace the current `giscusEnabled ? 댓글·공감 : 연동 대기` label with actual `공감 n · 댓글 n`.
- Sort candidates by:
  1. nonzero engagement first,
  2. total score (`reactions + comments`) descending,
  3. discussion `updatedAt` descending,
  4. content freshness fallback.
- Keep three rows.
- Keep each row linking to `/posts/<slug>/#comments`.

### Data Refresh

- Add `scripts/fetch-engagement.mjs`.
- Add an `npm` script for manual refresh.
- Add a scheduled GitHub Actions workflow that refreshes `src/data/engagement.json`, commits it only when changed, then builds and deploys GitHub Pages in the same workflow run.
- Use `GITHUB_TOKEN` in Actions first with explicit `contents`, `discussions`, `pages`, and `id-token` permissions; support `GH_ENGAGEMENT_TOKEN`, `GITHUB_TOKEN`, or `GH_TOKEN` locally.
- Do not rely on a `GITHUB_TOKEN` commit to trigger the existing push-based Pages workflow, because GitHub does not create follow-up workflow runs or Pages builds from those pushes.

## Implementation Checklist

- [x] Add tracked fallback data file at `src/data/engagement.json`.
- [x] Add `src/lib/engagement.ts` helper for lookup, labels, and sorting.
- [x] Update `PostCard.astro` to render compact engagement meta.
- [x] Update `src/pages/posts/[...slug].astro` article header to show engagement.
- [x] Update `src/pages/index.astro` recent reactions selection and labels.
- [x] Add `scripts/fetch-engagement.mjs` to fetch GitHub Discussions stats and generate JSON.
- [x] Include GraphQL pagination, category filtering, duplicate match detection, and unmatched post summary in the fetch script.
- [x] Add `npm run engagement:fetch`.
- [x] Add scheduled/manual workflow at `.github/workflows/update-engagement.yml`.
- [x] Make the scheduled workflow refresh engagement data, commit changed JSON, build, and deploy Pages in one run.
- [x] Extend `scripts/verify-home-content.mjs` to check engagement labels in the home Writing and Reactions sections.
- [x] Add fixture-driven verification for engagement sorting/labels.
- [x] Keep local builds passing without GitHub token or giscus setup.
- [x] Run verification: `npm run check`, `npm run build`, `npm run verify:architecture`, `npm run verify:home-content`, `git diff --check`.
- [x] Browser-check home, Writing archive, one tag archive, and one post page on desktop/mobile.
- [x] Ask review/QA sub-agents to inspect plan, implementation, and UI risk.
- [x] Apply or record feedback.
- [ ] Commit and push to `origin/main`.

## Risks And Mitigations

- GitHub token may not have Discussions read permission in Actions. Mitigation: workflow supports a secret token fallback and documents required setup in `.env.example`.
- Existing discussions may not match slugs. Mitigation: match titles first, report unmatched posts, and keep zeros for unmatched posts.
- Multiple discussions may match one post. Mitigation: fail the fetch script so the mismatch is visible instead of silently choosing one.
- New counts may clutter small cards. Mitigation: use the existing meta row and wrap safely on mobile.
- Scheduled workflow may commit too often. Mitigation: commit only when `src/data/engagement.json` changes.
- Scheduled workflow may not trigger the existing deploy workflow. Mitigation: deploy Pages in the same scheduled workflow run.

## Review Feedback Applied

- Plan review: confirmed the scheduled workflow must deploy Pages in the same run instead of relying on a bot commit to trigger the existing push workflow.
- Plan review: corrected the default source repository to `pistosmin/pistosmin.github.io`, matching the public remote.
- Implementation QA: stopped `generatedAt` from causing six-hourly no-op commits by skipping writes when engagement records are unchanged.
- Implementation QA: moved giscus public environment variables into the scheduled and push deploy build jobs.
- Implementation QA: disabled body fallback matching by default so unrelated discussions that merely link to a post cannot donate stats.
- Implementation QA: updated home verification to follow engagement-based reaction sorting.

## QA Checklist

- [x] Home latest cards show `공감 n · 댓글 n`.
- [x] Writing archive list cards show `공감 n · 댓글 n`.
- [x] Category/tag archive cards inherit the same display via `PostCard`.
- [x] Article detail header shows compact engagement info.
- [x] Home `최근 반응` rows show count labels and keep links to `#comments`.
- [x] With all-zero data, the UI stays stable and does not imply fake activity.
- [x] With sample nonzero data, home reaction rows sort by engagement first.
- [x] Build succeeds without any token.
- [x] Engagement fetch script exits clearly when token/repo is missing and does not break normal local development.
- [x] Fixture data covers duplicate path, unmatched post, body-only mismatch, generated timestamp stability, and all-zero fallback behavior.
