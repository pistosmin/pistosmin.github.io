export const SITE = {
  title: 'pistoslog',
  author: 'pistosmin',
  description: '일상과 생각, 기술 공부와 개인 작업물을 차분하게 쌓아두는 블로그.',
  url: 'https://pistosmin.github.io',
  github: 'https://github.com/pistosmin',
  locale: 'ko-KR',
};

export const navItems = [
  { label: 'Writing', href: '/writing/' },
  { label: 'Notes', href: '/notes/' },
  { label: 'Projects', href: '/projects/' },
  { label: 'About', href: '/about/' },
  { label: 'Now', href: '/now/' },
];

export const categoryMeta = {
  life: {
    label: '일상',
    description: '생활 속에서 남겨두고 싶은 장면과 감정.',
  },
  thought: {
    label: '생각',
    description: '조금 더 오래 붙잡고 싶은 질문과 관찰.',
  },
  tech: {
    label: '기술공부',
    description: '배운 것, 실험한 것, 다시 보고 싶은 코드의 맥락.',
  },
  work: {
    label: '작업기록',
    description: '만들고 고치고 운영하며 남기는 개인 프로젝트 기록.',
  },
} as const;

export type CategoryKey = keyof typeof categoryMeta;

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

export function formatCompactDate(date: Date) {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
    .format(date)
    .replace(/\.\s?/g, '.')
    .replace(/\.$/, '');
}

export function readingMinutes(text: string) {
  const normalized = text.replace(/\s+/g, ' ').trim();
  return Math.max(1, Math.ceil(normalized.length / 650));
}
