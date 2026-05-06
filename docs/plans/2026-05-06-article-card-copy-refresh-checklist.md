# Article Card Copy Refresh Checklist

Scope: Rewrite Writing article card titles and descriptions so they reveal each post's actual argument instead of compressing implementation summaries into AI-like labels.

## Copy Rules

- [x] Title states a tension, lesson, or claim rather than "what I built."
- [x] Description explains why the post matters to a reader.
- [x] Avoid generic endings like "기록", "과정", "만들며" unless the phrase carries a specific point.
- [x] Preserve existing slugs and article bodies unless body copy must match metadata.
- [x] Keep public/privacy boundaries conservative.

## Target Changes

- [x] Replace `liquid-glass-blog-ui` card copy around the real lesson: GitHub Pages/static blogs should stay light.
- [x] Replace project retrospectives that sound like work logs with thesis-led titles.
- [x] Replace tool posts that list implementation with risk/decision-led descriptions.
- [x] Keep first-post and study-log cards simple but less generic.

## Verification

- [x] Run metadata grep for old AI-like phrasing.
- [x] Run `npm run check`.
- [x] Run `npm run build`.
- [x] Run `git diff --check`.
