import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

const root = process.cwd();
const tempDirectory = mkdtempSync(path.join(tmpdir(), 'pistoslog-engagement-'));
const outputPath = path.join(tempDirectory, 'engagement.json');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function runFetch(args, options = {}) {
  return execFileSync(process.execPath, ['scripts/fetch-engagement.mjs', ...args], {
    cwd: root,
    stdio: options.stdio ?? 'pipe',
    encoding: 'utf8',
    env: {
      ...process.env,
      PUBLIC_GISCUS_CATEGORY: 'Announcements',
    },
  });
}

try {
  runFetch([
    '--fixture',
    'scripts/fixtures/engagement-discussions.json',
    '--output',
    outputPath,
    '--repo',
    'pistosmin/pistosmin.github.io',
  ]);

  const data = JSON.parse(readFileSync(outputPath, 'utf8'));
  const liquidGlass = data.posts['liquid-glass-blog-ui'];
  const retrospective = data.posts['pistoslog-astro-retrospective'];
  const welcome = data.posts.welcome;

  assert(data.source === 'github-discussions', 'source should be github-discussions');
  assert(data.repo === 'pistosmin/pistosmin.github.io', 'repo should match the configured source repo');
  assert(liquidGlass.comments === 2, 'liquid-glass-blog-ui should have 2 comments');
  assert(liquidGlass.reactions === 4, 'liquid-glass-blog-ui should have 4 reactions');
  assert(liquidGlass.score === 6, 'liquid-glass-blog-ui should have score 6');
  assert(retrospective.comments === 1, 'pistoslog-astro-retrospective should have 1 comment');
  assert(retrospective.reactions === 2, 'pistoslog-astro-retrospective should have 2 reactions');
  assert(welcome.comments === 0 && welcome.reactions === 0, 'unmatched posts should keep zero counts');
  assert(welcome.score === 0, 'body-only path mentions should not match posts by default');

  const sorted = Object.entries(data.posts)
    .sort(([, left], [, right]) => right.score - left.score)
    .map(([id]) => id);

  assert(sorted[0] === 'liquid-glass-blog-ui', 'highest engagement post should sort first in fixture data');

  runFetch([
    '--fixture',
    'scripts/fixtures/engagement-discussions.json',
    '--output',
    outputPath,
    '--repo',
    'pistosmin/pistosmin.github.io',
  ]);
  const unchangedData = JSON.parse(readFileSync(outputPath, 'utf8'));
  assert(unchangedData.generatedAt === data.generatedAt, 'generatedAt should not churn when engagement records are unchanged');

  const duplicateFixturePath = path.join(tempDirectory, 'duplicate-discussions.json');
  writeFileSync(
    duplicateFixturePath,
    JSON.stringify(
      [
        {
          title: '/posts/liquid-glass-blog-ui/',
          body: '',
          url: 'https://github.com/pistosmin/pistosmin.github.io/discussions/10',
          updatedAt: '2026-05-07T04:00:00.000Z',
          category: { name: 'Announcements' },
          comments: { totalCount: 1 },
          reactionGroups: [],
        },
        {
          title: '/posts/liquid-glass-blog-ui/',
          body: '',
          url: 'https://github.com/pistosmin/pistosmin.github.io/discussions/11',
          updatedAt: '2026-05-07T05:00:00.000Z',
          category: { name: 'Announcements' },
          comments: { totalCount: 1 },
          reactionGroups: [],
        },
      ],
      null,
      2,
    ),
  );

  try {
    runFetch(['--fixture', duplicateFixturePath, '--output', outputPath, '--repo', 'pistosmin/pistosmin.github.io']);
    throw new Error('duplicate discussion fixture should fail');
  } catch (error) {
    assert(
      error.status !== 0 && String(error.stderr ?? error.message).includes('matched multiple discussions'),
      'duplicate discussion fixture should report multiple discussion matches',
    );
  }

  console.log('Engagement verification passed.');
} finally {
  rmSync(tempDirectory, { recursive: true, force: true });
}
