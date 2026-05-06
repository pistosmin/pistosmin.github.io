import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

type FreshContentEntry = CollectionEntry<'posts'> | CollectionEntry<'projects'>;

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

export async function getProjects() {
  const projects = await getCollection('projects', ({ data }) => !data.draft);
  return sortByFreshness(projects);
}
