# Ralph Backlog 003-008 Retrospective

Date: 2026-05-06
Scope: Backlog items 004, 005, 008, 003, and 006.

## Outcome

All five requested backlog items were implemented in reviewable commits after the Ralph child loop failed during preflight execution.

- `004 Mobile Social Links`: implemented in `ralph spec: §004 Mobile Social Links`.
- `005 About Duplicate GitHub CTA`: implemented in `ralph spec: §005 About Duplicate GitHub CTA`.
- `008 Read Article Markers`: implemented in `ralph spec: §008 Read Article Markers`.
- `003 Tokenless GitHub Contributions`: implemented in `ralph spec: §003 Tokenless GitHub Contributions`.
- `006 Article Series Bundles`: implemented in `ralph spec: §006 Article Series Bundles`.

## What Failed

The bash Ralph orchestrator started correctly, but each child session exited with:

```txt
Your organization does not have access to Claude. Please login again or contact your administrator.
```

After three consecutive child failures, Ralph stopped with `STOP consecutive_errors (3 in a row)`.

## Why It Failed

The local `claude` binary was available, but the account or organization backing `claude -p --dangerously-skip-permissions` did not have usable Claude access in this session. This was not a repository, prompt, or permission prompt issue. Running with a YOLO-style permission mode removed filesystem prompts, but it did not grant model access to the child CLI.

## What Changed In The Process

The parent session switched from unattended Ralph child sessions to a controlled direct implementation loop:

1. Keep the same tracked spec as the source of truth.
2. Implement one spec section at a time.
3. Run `npm run check` for each feature commit.
4. Commit each section with the same `ralph spec: §...` message format Ralph would have used.
5. Run full final verification after all sections.
6. Use Playwright snapshots for `/`, `/about/`, `/projects/`, `/writing/`, `/tags/회고/`, and `/posts/pistoslog-archive-navigation/`.

## Reusable Rule

For future Ralph runs, separate permission mode from model access:

- Permission mode controls whether the child can touch files without repeated prompts.
- Model access controls whether the child can run at all.
- Before an unattended run, execute a cheap child probe such as:

```sh
cd /Users/pistosmin/develop/pistoslog && claude -p --dangerously-skip-permissions -- "Reply with READY"
```

If the probe fails with an account or organization access error, do not start the Ralph loop. Either fix Claude CLI access first or use a different available child command in `ralph.config.json`.

## Final Verification

Completed checks:

- `npm run check`
- `npm run build`
- `npm run verify:architecture`
- `npm run verify:home-content`
- `git diff --check`

Manual/browser checks:

- 390px `/`: home profile social links rendered as compact controls, not full-width rows.
- 390px `/about/`: hero shows only `작업물 보기`; profile card keeps GitHub, Instagram, LinkedIn.
- 390px `/projects/`: tokenless GitHub contribution panel appears and project grid still renders.
- 390px `/posts/pistoslog-archive-navigation/`: series bundle appears near the top and marks the current article.
- 390px `/writing/` and `/tags/회고/`: after opening a post, matching post cards show `읽음`.
- Desktop `/projects/` and a series post: contribution panel, project grid, series bundle, and article layout remain aligned.
