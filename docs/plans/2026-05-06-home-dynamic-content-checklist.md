# Home Dynamic Content Checklist

Date: 2026-05-06
Scope: Make the home page automatically reflect new or updated posts, projects, reactions, and tags without manual feature pinning.

## Search Notes

- Current home Writing list puts `featured` posts before recency, so a new non-featured post can be hidden behind older featured posts.
- Current home project rail uses `featuredProjects` when any featured project exists, so new projects can be hidden behind a single pinned project.
- Current home tag list slices the count-sorted tag summary, so a new one-post tag often cannot appear on the home page.
- `getPosts()` and `getProjects()` sort by `published` only, while category and tag copy already describe freshness or latest updates.
- Existing verification covers architecture, type, and build output, but not whether home sections match the content collection data.

## Plan

- [x] Inspect current home, content collection, taxonomy, and project selection logic.
- [x] Reproduce the current home build output and confirm stale selection behavior.
- [x] Add one shared freshness sort for published/updated content entries.
- [x] Make home Writing, Reactions, and Projects use freshness-first content.
- [x] Make the home tag preview use freshness-first tag summaries so new tags can surface.
- [x] Add a build-output verification script that compares home HTML with content frontmatter.
- [x] Run type, build, architecture, home-data, and whitespace verification.
- [x] Record feedback and remaining limits.

## Acceptance Criteria

- Publishing a non-draft post is enough for the home Writing section and Recent Reactions list to include it when it is among the latest items.
- Adding or updating a project is enough for the home project rail to include it when it is among the latest projects.
- Adding a new tag to a fresh post can surface the tag on the home preview even if the tag has only one article.
- Tag count labels still reflect the full post collection.
- Full tag and writing archive pages keep their existing static URL behavior.
- Verification fails if the built home page drifts away from the expected latest posts, projects, reactions, or home tags.

## Feedback Log

- User feedback: home recent writing, projects, recent reactions, tag counts, and new tags should update automatically when new content is added.
- Development note: root cause is selection priority, not content collection discovery; Astro already generates the new post/tag routes.
- Development note: home Writing and Recent Reactions now use the latest non-draft posts directly instead of old featured priority.
- Development note: home Projects now uses freshness-sorted projects instead of falling back to a single featured rail item.
- Development note: home Tags now uses freshness-sorted tag summaries, while full tag archives keep the existing count-first behavior.
- Development note: `npm run verify:home-content` fails against the old build and passes after the dynamic home changes.
- Completed: `npm run check`, `npm run build`, `npm run verify:architecture`, `npm run verify:home-content`, and `git diff --check` pass before remote publish.
- Limit note: Recent Reactions still cannot read live Giscus discussion activity without GitHub API/build-time integration; it now stays aligned with the freshest post targets instead of stale featured ordering.
