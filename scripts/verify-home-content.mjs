import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { parse } from 'yaml';

const root = process.cwd();
const homePath = path.join(root, 'dist/index.html');

const limits = {
  posts: 3,
  tags: 10,
  reactions: 3,
  projects: 4,
};

function read(relativePath) {
  return readFileSync(path.join(root, relativePath), 'utf8');
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

function parseFrontmatter(source, file) {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  if (!match) {
    throw new Error(`Missing frontmatter in ${file}`);
  }

  return parse(match[1]) ?? {};
}

function toDate(value, file, field) {
  if (!value) return undefined;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.valueOf())) {
    throw new Error(`Invalid ${field} date in ${file}: ${value}`);
  }

  return date;
}

function entryId(file, collectionDirectory) {
  const relativePath = path.relative(collectionDirectory, file);
  return relativePath.replace(/\.(md|mdx)$/i, '').split(path.sep).join('/');
}

function loadCollection(collection) {
  const directory = `src/content/${collection}`;

  return walkFiles(directory)
    .filter((file) => /\.(md|mdx)$/i.test(file))
    .map((file) => {
      const data = parseFrontmatter(read(file), file);

      return {
        id: entryId(file, directory),
        file,
        data: {
          ...data,
          draft: Boolean(data.draft),
          featured: Boolean(data.featured),
          published: toDate(data.published, file, 'published'),
          updated: toDate(data.updated, file, 'updated'),
          tags: Array.isArray(data.tags) ? data.tags : [],
        },
      };
    })
    .filter((entry) => !entry.data.draft);
}

function freshnessDate(entry) {
  return entry.data.updated ?? entry.data.published;
}

function compareFreshness(left, right) {
  return (
    freshnessDate(right).valueOf() - freshnessDate(left).valueOf() ||
    right.data.published.valueOf() - left.data.published.valueOf() ||
    left.id.localeCompare(right.id, 'ko-KR')
  );
}

function normalizeTagLabel(tag) {
  return tag.normalize('NFKC').trim().toLocaleLowerCase('ko-KR');
}

function slugifyTag(tag) {
  const slug = normalizeTagLabel(tag)
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'tag';
}

function getTagSummaries(posts) {
  const summaries = new Map();

  posts.forEach((post) => {
    const seenPostTags = new Set();

    post.data.tags.forEach((rawTag) => {
      const label = String(rawTag).trim();
      if (!label) return;

      const slug = slugifyTag(label);
      const normalizedLabel = normalizeTagLabel(label);
      if (seenPostTags.has(slug)) return;
      seenPostTags.add(slug);

      const existing = summaries.get(slug);
      if (!existing) {
        summaries.set(slug, {
          slug,
          label,
          normalizedLabel,
          count: 1,
          latestDate: freshnessDate(post),
        });
        return;
      }

      if (existing.normalizedLabel !== normalizedLabel) {
        throw new Error(`Tag slug collision: "${existing.label}" and "${label}" both map to "${slug}".`);
      }

      existing.count += 1;
      if (freshnessDate(post) > existing.latestDate) {
        existing.latestDate = freshnessDate(post);
      }
    });
  });

  return Array.from(summaries.values()).sort(
    (left, right) =>
      right.latestDate.valueOf() - left.latestDate.valueOf() ||
      right.count - left.count ||
      left.label.localeCompare(right.label, 'ko-KR'),
  );
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function extractSection(html, startMarker, endMarker) {
  const start = html.indexOf(startMarker);
  if (start === -1) {
    throw new Error(`Could not find home section marker: ${startMarker}`);
  }

  const end = endMarker ? html.indexOf(endMarker, start + startMarker.length) : -1;
  return html.slice(start, end === -1 ? html.length : end);
}

function assertIncludes(section, expected, context) {
  if (!section.includes(expected)) {
    throw new Error(`${context} was not found in the built home page: ${expected}`);
  }
}

function assertEntryTitles(section, entries, context) {
  entries.forEach((entry) => assertIncludes(section, escapeHtml(entry.data.title), `${context} "${entry.data.title}"`));
}

function extractTagToken(section, tag) {
  const href = `href="/tags/${encodeURIComponent(tag.slug)}/"`;
  const hrefIndex = section.indexOf(href);
  if (hrefIndex === -1) {
    throw new Error(`tag href #${tag.label} was not found in the built home page: ${href}`);
  }

  const tokenStart = section.lastIndexOf('<a ', hrefIndex);
  const tokenEnd = section.indexOf('</a>', hrefIndex);
  if (tokenStart === -1 || tokenEnd === -1) {
    throw new Error(`Could not isolate tag token for #${tag.label}.`);
  }

  return section.slice(tokenStart, tokenEnd);
}

if (!existsSync(homePath)) {
  throw new Error('dist/index.html does not exist. Run npm run build:astro before npm run verify:home-content.');
}

const homeHtml = readFileSync(homePath, 'utf8');
const posts = loadCollection('posts').sort(compareFreshness);
const projects = loadCollection('projects').sort(compareFreshness);
const tags = getTagSummaries(posts);

const writingSection = extractSection(
  homeHtml,
  '<section class="content-band editorial-writing">',
  '<section class="home-lower">',
);
const tagSection = extractSection(homeHtml, '<div class="tag-index-section">', '<div class="reaction-panel">');
const reactionSection = extractSection(homeHtml, '<div class="reaction-panel">', '<div class="project-rail-section">');
const projectSection = extractSection(homeHtml, '<div class="project-rail-section">', '</section>');

const expectedPosts = posts.slice(0, limits.posts);
const expectedReactionTargets = posts.slice(0, limits.reactions);
const expectedProjects = projects.slice(0, limits.projects);
const expectedTags = tags.slice(0, limits.tags);

assertEntryTitles(writingSection, expectedPosts, 'latest post');
assertEntryTitles(reactionSection, expectedReactionTargets, 'reaction target');
assertEntryTitles(projectSection, expectedProjects, 'project');

expectedTags.forEach((tag) => {
  const tagToken = extractTagToken(tagSection, tag);
  assertIncludes(tagToken, `#${escapeHtml(tag.label)}`, `tag label #${tag.label}`);
  assertIncludes(tagToken, `아티클 ${tag.count}개`, `tag count #${tag.label}`);
});

console.log('Home content verification passed.');
console.log(`- Writing: ${expectedPosts.map((post) => post.data.title).join(' / ')}`);
console.log(`- Tags: ${expectedTags.map((tag) => `#${tag.label}(${tag.count})`).join(' / ')}`);
console.log(`- Reactions: ${expectedReactionTargets.map((post) => post.data.title).join(' / ')}`);
console.log(`- Projects: ${expectedProjects.map((project) => project.data.title).join(' / ')}`);
