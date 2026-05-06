import BrandIcon, { type BrandIconName } from './BrandIcon';
import { SITE } from '../lib/site';

type SocialLink = {
  href: string;
  icon: BrandIconName;
  label: string;
  title: string;
};

const socialLinks: readonly SocialLink[] = [
  {
    href: SITE.github,
    icon: 'github',
    label: 'GitHub',
    title: 'pistosmin GitHub',
  },
  {
    href: SITE.instagram,
    icon: 'instagram',
    label: 'Instagram',
    title: 'pistosmin Instagram',
  },
  {
    href: SITE.linkedin,
    icon: 'linkedin',
    label: 'LinkedIn',
    title: 'pistosmin LinkedIn',
  },
];

export default function SocialProfileLinks({ className = '' }: { className?: string }) {
  return (
    <nav className={['profile-social-links', className].filter(Boolean).join(' ')} aria-label="프로필 소셜 링크">
      {socialLinks.map((item) => (
        <a
          aria-label={item.title}
          className="profile-social-link"
          href={item.href}
          key={item.href}
          rel="me noreferrer"
          target="_blank"
        >
          <BrandIcon name={item.icon} />
          <span>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}
