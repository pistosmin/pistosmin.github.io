import type { CollectionEntry } from 'astro:content';
import engagementData from '../data/engagement.json';
import { getEntryFreshnessDate } from './content';

type PostEntry = CollectionEntry<'posts'>;

export interface EngagementRecord {
  comments: number;
  reactions: number;
  score: number;
  discussionUrl: string | null;
  updatedAt: string | null;
}

interface EngagementData {
  posts?: Record<string, Partial<EngagementRecord> | undefined>;
}

const data = engagementData as EngagementData;

const emptyEngagement: EngagementRecord = {
  comments: 0,
  reactions: 0,
  score: 0,
  discussionUrl: null,
  updatedAt: null,
};

function toCount(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
}

export function getPostEngagement(postId: string): EngagementRecord {
  const record = data.posts?.[postId];
  if (!record) return emptyEngagement;

  const comments = toCount(record.comments);
  const reactions = toCount(record.reactions);

  return {
    comments,
    reactions,
    score: toCount(record.score) || comments + reactions,
    discussionUrl: typeof record.discussionUrl === 'string' ? record.discussionUrl : null,
    updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : null,
  };
}

export function formatEngagementLabel(record: EngagementRecord) {
  return `공감 ${record.reactions} · 댓글 ${record.comments}`;
}

export function getEngagementActivityDate(post: PostEntry) {
  const engagement = getPostEngagement(post.id);
  const activityDate = engagement.updatedAt ? new Date(engagement.updatedAt) : undefined;

  return activityDate && !Number.isNaN(activityDate.valueOf()) ? activityDate : getEntryFreshnessDate(post);
}

export function sortPostsByEngagement(posts: PostEntry[]) {
  return [...posts].sort((left, right) => {
    const leftEngagement = getPostEngagement(left.id);
    const rightEngagement = getPostEngagement(right.id);
    const leftHasEngagement = leftEngagement.score > 0 ? 1 : 0;
    const rightHasEngagement = rightEngagement.score > 0 ? 1 : 0;

    return (
      rightHasEngagement - leftHasEngagement ||
      rightEngagement.score - leftEngagement.score ||
      getEngagementActivityDate(right).valueOf() - getEngagementActivityDate(left).valueOf() ||
      getEntryFreshnessDate(right).valueOf() - getEntryFreshnessDate(left).valueOf() ||
      left.id.localeCompare(right.id, 'ko-KR')
    );
  });
}
