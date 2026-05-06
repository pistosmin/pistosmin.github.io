import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

type FreshContentEntry = CollectionEntry<'posts'> | CollectionEntry<'projects'>;
type PostEntry = CollectionEntry<'posts'>;

export function getEntryFreshnessDate(entry: FreshContentEntry) {
  return entry.data.updated ?? entry.data.published;
}

export function compareByFreshness(left: FreshContentEntry, right: FreshContentEntry) {
  return (
    getEntryFreshnessDate(right).valueOf() - getEntryFreshnessDate(left).valueOf() ||
    right.data.published.valueOf() - left.data.published.valueOf() ||
    left.id.localeCompare(right.id, 'ko-KR')
  );
}

export function sortByFreshness<Entry extends FreshContentEntry>(entries: Entry[]) {
  return [...entries].sort(compareByFreshness);
}

export async function getPosts() {
  const posts = await getCollection('posts', ({ data }) => !data.draft);
  return sortByFreshness(posts);
}

export function sortBySeriesOrder(posts: PostEntry[]) {
  return [...posts].sort(
    (left, right) =>
      (left.data.series?.order ?? Number.MAX_SAFE_INTEGER) - (right.data.series?.order ?? Number.MAX_SAFE_INTEGER) ||
      left.data.published.valueOf() - right.data.published.valueOf() ||
      left.id.localeCompare(right.id, 'ko-KR'),
  );
}

export function getSeriesPosts(posts: PostEntry[], post: PostEntry) {
  const series = post.data.series;
  if (!series) return [];

  const seriesPosts = sortBySeriesOrder(posts.filter((item) => item.data.series?.id === series.id));
  return seriesPosts.length > 1 ? seriesPosts : [];
}

export async function getProjects() {
  const projects = await getCollection('projects', ({ data }) => !data.draft);
  return sortByFreshness(projects);
}
