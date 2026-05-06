# Project About Writing Refresh Checklist

Date: 2026-05-06
Scope: Publish the archive-navigation work as a post, add category-scoped tags to Writing, fix project repo links, add project entries, and rewrite About from actual project/career evidence.

## Search Notes

- Astro content collections are the right fit for posts and project entries because they provide schemas, typed metadata, and build-time querying.
- Astro dynamic routes with `getStaticPaths()` are the right fit for tag/category archive pages.
- GitHub CLI `gh repo list/view --json` was used to verify public/private repo names and prevent broken GitHub links.
- Current repo evidence: `pistosmin/pistoslog` does not exist; the blog repo is `pistosmin/pistosmin.github.io`.
- Public/privacy boundary: keep private/company-specific source names generalized in public pages and avoid linking unavailable private repos.

## Plan

- [x] Inspect current Writing, Projects, project detail, About, and content collection structure.
- [x] Search official Astro and GitHub references.
- [x] Gather local repo and GitHub repo metadata for project/About copy.
- [x] Add category-scoped tag cloud under Writing category navigation.
- [x] Add category-scoped tag archive routes so category tag clicks keep the category context.
- [x] Fix project detail action labels and broken pistoslog repo URL.
- [x] Add missing project entries for project-related posts.
- [x] Publish a new post about removing Notes/Now and adding archive navigation.
- [x] Rewrite About around actual work: legacy systems, RDB safety, AI tooling, knowledge systems, and validation loops.
- [x] Run type/build/architecture/whitespace verification.
- [x] Use Browser Use to verify Writing tags, project links, projects list, and About.
- [x] Ask review sub-agents to inspect implementation and copy.
- [x] Apply or record review feedback.

## Acceptance Criteria

- `/writing/` shows all-post tags below category summaries.
- `/writing/[category]/` shows tags only from posts in that category.
- `/writing/[category]/tags/[tag]/` shows only posts that match both the category and the tag.
- Project detail `repo` links no longer point at nonexistent GitHub repositories.
- Project list includes entries matching the project-related posts already published.
- Private/local-only projects do not expose unavailable repo links as public buttons.
- About no longer lists Swift or Astro as core profile skills, and instead reflects the user's actual project history.
- The new post is natural Korean prose and records the decision, bug, implementation, and verification loop.

## Feedback Log

- User feedback: category pages need scoped tag discovery, not only home-level tags.
- User feedback: project repo link currently hits GitHub 404.
- User feedback: project posts exist but corresponding project entries are missing.
- User feedback: About should be based on career/projects, excluding Swift/Astro from the profile emphasis.
- Development note: Writing now reuses a tag token component and shows all-post tags on `/writing/`, category-scoped tags on `/writing/[category]/`.
- Development note: Category tag links now point to scoped archive pages such as `/writing/tech/tags/python/` instead of the global tag archive.
- Development note: `pistoslog` repo link now points to `pistosmin/pistosmin.github.io`, and project detail buttons use readable labels.
- Development note: project entries were added for gravity, querycreator, pistoswiki, restricted AI loop, legacy LLM wiki workbench, fresh-dbo, and the interview-prep app.
- Development note: a new post records the Notes/Now removal, tag/category archive redesign, Browser Use verification, and review feedback loop.
- Development note: About now emphasizes RDB safety, legacy documentation, AI workflow packaging, knowledge systems, and validation loops; Swift and Astro were removed from the core profile stack.
- Verification note: `npm run check`, `npm run build`, `npm run verify:architecture`, and `git diff --check` all passed after the content and navigation changes.
- Browser note: after restarting the Astro dev server, Browser Use confirmed `/writing/` and `/writing/tech/` tag summaries, scoped tag links such as `/writing/tech/tags/python/`, 8 project cards, corrected `pistoslog` and `querycreator` repo links, the new post page, the updated About stack, and the final copy clarifications for `gravity` and the restricted AI loop project.
- Review note: sub-agents found no functional route risk; copy review feedback led to clarifying category-scoped tag wording, the `gravity`/`base-one` repo naming mismatch, and the restricted AI loop repo's public-scope boundary.
