import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const root = process.cwd();
const defaultOutputPath = path.join(root, 'src/data/engagement.json');
const defaultRepo = 'pistosmin/pistosmin.github.io';
const graphQlEndpoint = 'https://api.github.com/graphql';

function parseArgs(argv) {
  const args = {
    allowBodyMatch: false,
    fixture: undefined,
    output: defaultOutputPath,
    repo: undefined,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--allow-body-match') {
      args.allowBodyMatch = true;
    } else if (arg === '--fixture') {
      args.fixture = argv[index + 1];
      index += 1;
    } else if (arg === '--output') {
      args.output = path.resolve(root, argv[index + 1]);
      index += 1;
    } else if (arg === '--repo') {
      args.repo = argv[index + 1];
      index += 1;
    }
  }

  return args;
}

function loadEnvFile(file) {
  const envPath = path.join(root, file);
  if (!existsSync(envPath)) return;

  readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .forEach((line) => {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) return;

      const separator = trimmed.indexOf('=');
      if (separator === -1) return;

      const key = trimmed.slice(0, separator).trim();
      const value = trimmed.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '');
      if (key && process.env[key] === undefined) {
        process.env[key] = value;
      }
    });
}

function walkFiles(directory) {
  const absoluteDirectory = path.join(root, directory);
  const entries = readdirSync(absoluteDirectory);

  return entries.flatMap((entry) => {
    const relativePath = path.join(directory, entry);
    const absolutePath = path.join(root, relativePath);
    const stats = statSync(absolutePath);

    return stats.isDirectory() ? walkFiles(relativePath) : [relativePath];
  });
}

function parseFrontmatter(source) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  return match ? parse(match[1]) ?? {} : {};
}

function entryId(file, collectionDirectory) {
  const relativePath = path.relative(collectionDirectory, file);
  return relativePath.replace(/\.(md|mdx)$/i, '').split(path.sep).join('/');
}

function loadPosts() {
  const collectionDirectory = 'src/content/posts';

  return walkFiles(collectionDirectory)
    .filter((file) => /\.(md|mdx)$/i.test(file))
    .map((file) => {
      const data = parseFrontmatter(readFileSync(path.join(root, file), 'utf8'));
      return {
        id: entryId(file, collectionDirectory),
        pathname: `/posts/${entryId(file, collectionDirectory)}/`,
        draft: Boolean(data.draft),
      };
    })
    .filter((post) => !post.draft);
}

function splitRepo(repo) {
  const [owner, name] = String(repo ?? '').split('/');
  if (!owner || !name) {
    throw new Error(`Invalid GitHub repository: ${repo}`);
  }

  return { owner, name };
}

function normalizeText(value) {
  return String(value ?? '').trim();
}

function countReactions(reactionGroups = []) {
  return reactionGroups.reduce((total, group) => total + (group?.reactors?.totalCount ?? 0), 0);
}

function emptyRecord() {
  return {
    comments: 0,
    reactions: 0,
    score: 0,
    discussionUrl: null,
    updatedAt: null,
  };
}

function getDiscussionNodes(payload) {
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.nodes)) return payload.nodes;
  if (Array.isArray(payload?.data?.repository?.discussions?.nodes)) {
    return payload.data.repository.discussions.nodes;
  }

  throw new Error('Fixture does not contain discussion nodes.');
}

function matchDiscussionToPosts(discussion, posts, { allowBodyMatch = false } = {}) {
  const title = normalizeText(discussion.title);
  const titleMatches = posts.filter((post) => title.includes(post.pathname));
  if (titleMatches.length > 0) {
    return { method: 'title', posts: titleMatches };
  }

  if (!allowBodyMatch) {
    return { method: 'none', posts: [] };
  }

  const body = normalizeText(discussion.body);
  return {
    method: 'body',
    posts: posts.filter((post) => body.includes(post.pathname)),
  };
}

function buildEngagementData({ discussions, posts, repo, category, allowBodyMatch = false }) {
  const records = Object.fromEntries(posts.map((post) => [post.id, emptyRecord()]));
  const matchedByPost = new Map();
  const unmatchedDiscussions = [];
  const bodyFallbackMatches = [];

  discussions
    .filter((discussion) => !category || discussion?.category?.name === category)
    .forEach((discussion) => {
      const match = matchDiscussionToPosts(discussion, posts, { allowBodyMatch });
      if (match.posts.length === 0) {
        unmatchedDiscussions.push(discussion.title);
        return;
      }

      if (match.posts.length > 1) {
        throw new Error(
          `Discussion "${discussion.title}" matched multiple posts: ${match.posts.map((post) => post.id).join(', ')}`,
        );
      }

      const [post] = match.posts;
      if (matchedByPost.has(post.id)) {
        throw new Error(
          `Post "${post.id}" matched multiple discussions: "${matchedByPost.get(post.id)}" and "${discussion.title}"`,
        );
      }

      if (match.method === 'body') {
        bodyFallbackMatches.push(post.id);
      }

      const comments = discussion.comments?.totalCount ?? 0;
      const reactions = countReactions(discussion.reactionGroups);
      records[post.id] = {
        comments,
        reactions,
        score: comments + reactions,
        discussionUrl: discussion.url ?? null,
        updatedAt: discussion.updatedAt ?? null,
      };
      matchedByPost.set(post.id, discussion.title);
    });

  return {
    data: {
      generatedAt: new Date().toISOString(),
      source: 'github-discussions',
      repo,
      posts: records,
    },
    summary: {
      matched: matchedByPost.size,
      unmatchedPosts: posts.length - matchedByPost.size,
      unmatchedDiscussions: unmatchedDiscussions.length,
      bodyFallbackMatches,
    },
  };
}

async function fetchGraphQl({ token, owner, name, after }) {
  const query = `
    query EngagementDiscussions($owner: String!, $name: String!, $after: String) {
      repository(owner: $owner, name: $name) {
        discussions(first: 100, after: $after, orderBy: { field: UPDATED_AT, direction: DESC }) {
          pageInfo {
            hasNextPage
            endCursor
          }
          nodes {
            title
            body
            url
            updatedAt
            category {
              name
            }
            comments {
              totalCount
            }
            reactionGroups {
              content
              reactors {
                totalCount
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(graphQlEndpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'User-Agent': 'pistoslog-engagement-fetch',
    },
    body: JSON.stringify({
      query,
      variables: { owner, name, after },
    }),
  });

  if (!response.ok) {
    throw new Error(`GitHub GraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const payload = await response.json();
  if (payload.errors?.length) {
    throw new Error(`GitHub GraphQL errors: ${payload.errors.map((error) => error.message).join('; ')}`);
  }

  return payload.data.repository.discussions;
}

async function fetchDiscussions({ token, repo }) {
  const { owner, name } = splitRepo(repo);
  const discussions = [];
  let after;

  do {
    const page = await fetchGraphQl({ token, owner, name, after });
    discussions.push(...page.nodes);
    after = page.pageInfo.hasNextPage ? page.pageInfo.endCursor : undefined;
  } while (after);

  return discussions;
}

function writeJson(file, data) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(data, null, 2)}\n`);
}

function readExistingData(file) {
  if (!existsSync(file)) return undefined;

  return JSON.parse(readFileSync(file, 'utf8'));
}

function comparableData(data) {
  const { generatedAt, ...rest } = data;
  return rest;
}

function isSameEngagementData(left, right) {
  if (!left || !right) return false;

  return JSON.stringify(comparableData(left)) === JSON.stringify(comparableData(right));
}

async function main() {
  loadEnvFile('.env');
  loadEnvFile('.env.local');

  const args = parseArgs(process.argv.slice(2));
  const repo = args.repo ?? process.env.PUBLIC_GISCUS_REPO ?? defaultRepo;
  const category = process.env.PUBLIC_GISCUS_CATEGORY;
  const token = process.env.GH_ENGAGEMENT_TOKEN || process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  const posts = loadPosts();

  if (!args.fixture && !token) {
    if (!existsSync(args.output)) {
      writeJson(args.output, {
        generatedAt: null,
        source: 'static-fallback',
        repo,
        posts: Object.fromEntries(posts.map((post) => [post.id, emptyRecord()])),
      });
    }
    console.log('No GitHub token found. Existing engagement data was left unchanged.');
    return;
  }

  const discussions = args.fixture
    ? getDiscussionNodes(JSON.parse(readFileSync(path.resolve(root, args.fixture), 'utf8')))
    : await fetchDiscussions({ token, repo });
  const { data, summary } = buildEngagementData({
    discussions,
    posts,
    repo,
    category,
    allowBodyMatch: args.allowBodyMatch,
  });
  const existingData = readExistingData(args.output);

  if (isSameEngagementData(existingData, data)) {
    console.log(`Engagement data unchanged at ${path.relative(root, args.output)}`);
    console.log(`- matched posts: ${summary.matched}`);
    console.log(`- unmatched posts: ${summary.unmatchedPosts}`);
    console.log(`- unmatched discussions: ${summary.unmatchedDiscussions}`);
    if (summary.bodyFallbackMatches.length > 0) {
      console.log(`- body fallback matches: ${summary.bodyFallbackMatches.join(', ')}`);
    }
    return;
  }

  writeJson(args.output, data);

  console.log(`Engagement data written to ${path.relative(root, args.output)}`);
  console.log(`- matched posts: ${summary.matched}`);
  console.log(`- unmatched posts: ${summary.unmatchedPosts}`);
  console.log(`- unmatched discussions: ${summary.unmatchedDiscussions}`);
  if (summary.bodyFallbackMatches.length > 0) {
    console.log(`- body fallback matches: ${summary.bodyFallbackMatches.join(', ')}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
