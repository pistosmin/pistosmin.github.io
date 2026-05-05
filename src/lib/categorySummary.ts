import type { CollectionEntry } from 'astro:content';
import { categoryMeta, formatCompactDate, type CategoryKey } from './site';

type PostEntry = CollectionEntry<'posts'>;

const RECENT_WINDOW_DAYS = 7;
const DAY_IN_MS = 24 * 60 * 60 * 1000;

function getPostFreshnessDate(post: PostEntry) {
  return post.data.updated ?? post.data.published;
}

export type CategorySummary = {
  key: CategoryKey;
  label: string;
  description: string;
  href: string;
  count: number;
  countLabel: string;
  disabled: boolean;
  latestTitle: string;
  latestDate?: Date;
  latestDateLabel: string;
  statusLabel: 'NEW' | '최근' | '준비 중';
  isNew: boolean;
};

export function getCategorySummaries(posts: PostEntry[]): CategorySummary[] {
  const newestDate = posts.reduce<Date | undefined>((latest, post) => {
    const date = getPostFreshnessDate(post);
    return !latest || date > latest ? date : latest;
  }, undefined);

  return Object.entries(categoryMeta).map(([key, meta]) => {
    const categoryKey = key as CategoryKey;
    const categoryPosts = posts
      .filter((post) => post.data.category === categoryKey)
      .sort((left, right) => getPostFreshnessDate(right).valueOf() - getPostFreshnessDate(left).valueOf());
    const latestPost = categoryPosts[0];
    const latestDate = latestPost ? getPostFreshnessDate(latestPost) : undefined;
    const isNew = Boolean(
      latestDate && newestDate && newestDate.valueOf() - latestDate.valueOf() <= RECENT_WINDOW_DAYS * DAY_IN_MS,
    );

    return {
      key: categoryKey,
      label: meta.label,
      description: meta.description,
      href: `/writing/#${categoryKey}`,
      count: categoryPosts.length,
      countLabel: categoryPosts.length > 0 ? `아티클 ${categoryPosts.length}개` : '아티클 없음',
      disabled: categoryPosts.length === 0,
      latestTitle: latestPost?.data.title ?? '첫 글 준비 중',
      latestDate,
      latestDateLabel: latestDate ? formatCompactDate(latestDate) : '업데이트 대기',
      statusLabel: latestPost ? (isNew ? 'NEW' : '최근') : '준비 중',
      isNew,
    };
  });
}
