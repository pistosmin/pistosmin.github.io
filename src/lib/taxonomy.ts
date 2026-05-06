import type { CollectionEntry } from 'astro:content';
import { getEntryFreshnessDate } from './content';
import { formatCompactDate } from './site';

type PostEntry = CollectionEntry<'posts'>;

type MutableTagSummary = Omit<TagSummary, 'count' | 'countLabel' | 'latestDateLabel'> & {
  normalizedLabel: string;
};

type TagSummaryOptions = {
  hrefForTag?: (tag: { label: string; slug: string }) => string;
  sortBy?: 'count' | 'freshness';
};

export type TagSummary = {
  slug: string;
  label: string;
  href: string;
  count: number;
  countLabel: string;
  latestDate?: Date;
  latestDateLabel: string;
  posts: PostEntry[];
};

export function getPostFreshnessDate(post: PostEntry) {
  return getEntryFreshnessDate(post);
}

export function getCategoryHref(category: string) {
  return `/writing/${category}/`;
}

export function normalizeTagLabel(tag: string) {
  return tag.normalize('NFKC').trim().toLocaleLowerCase('ko-KR');
}

export function slugifyTag(tag: string) {
  const slug = normalizeTagLabel(tag)
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return slug || 'tag';
}

export function getTagHref(tag: string) {
  return `/tags/${encodeURIComponent(slugifyTag(tag))}/`;
}

export function getCategoryTagHref(category: string, tag: string) {
  return `/writing/${category}/tags/${encodeURIComponent(slugifyTag(tag))}/`;
}

export function getTagSummaries(posts: PostEntry[], options: TagSummaryOptions = {}): TagSummary[] {
  const summaries = new Map<string, MutableTagSummary>();

  posts.forEach((post) => {
    const freshnessDate = getPostFreshnessDate(post);
    const seenPostTags = new Set<string>();

    post.data.tags.forEach((rawTag) => {
      const label = rawTag.trim();
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
          href: options.hrefForTag?.({ label, slug }) ?? getTagHref(label),
          latestDate: freshnessDate,
          normalizedLabel,
          posts: [post],
        });
        return;
      }

      if (existing.normalizedLabel !== normalizedLabel) {
        throw new Error(
          `Tag slug collision: "${existing.label}" and "${label}" both map to "${slug}". Rename one tag so each tag archive has a unique URL.`,
        );
      }

      existing.posts.push(post);
      if (!existing.latestDate || freshnessDate > existing.latestDate) {
        existing.latestDate = freshnessDate;
      }
    });
  });

  const sortBy = options.sortBy ?? 'count';

  return Array.from(summaries.values())
    .map((summary) => {
      const { normalizedLabel, ...publicSummary } = summary;
      const sortedPosts = [...summary.posts].sort(
        (left, right) => getPostFreshnessDate(right).valueOf() - getPostFreshnessDate(left).valueOf(),
      );

      return {
        ...publicSummary,
        posts: sortedPosts,
        count: sortedPosts.length,
        countLabel: `아티클 ${sortedPosts.length}개`,
        latestDateLabel: summary.latestDate ? formatCompactDate(summary.latestDate) : '업데이트 대기',
      };
    })
    .sort((left, right) => {
      const freshnessSort =
        (right.latestDate?.valueOf() ?? 0) - (left.latestDate?.valueOf() ?? 0) ||
        right.count - left.count ||
        left.label.localeCompare(right.label, 'ko-KR');
      const countSort =
        right.count - left.count ||
        (right.latestDate?.valueOf() ?? 0) - (left.latestDate?.valueOf() ?? 0) ||
        left.label.localeCompare(right.label, 'ko-KR');

      return sortBy === 'freshness' ? freshnessSort : countSort;
    });
}
