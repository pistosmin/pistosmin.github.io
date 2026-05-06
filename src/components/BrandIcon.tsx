import type { SVGProps } from 'react';

export type BrandIconName = 'github' | 'instagram' | 'linkedin';

type BrandIconProps = SVGProps<SVGSVGElement> & {
  name: BrandIconName;
};

export default function BrandIcon({ name, className, ...props }: BrandIconProps) {
  const iconClassName = ['brand-icon', className].filter(Boolean).join(' ');

  if (name === 'github') {
    return (
      <svg
        aria-hidden="true"
        className={iconClassName}
        focusable="false"
        viewBox="0 0 24 24"
        {...props}
      >
        <path
          d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56v-2.16c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.69 1.24 3.34.95.1-.74.4-1.24.73-1.53-2.55-.29-5.23-1.28-5.23-5.68 0-1.25.45-2.28 1.18-3.08-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.16 1.18A10.88 10.88 0 0 1 12 6.04c.98 0 1.96.13 2.88.39 2.19-1.49 3.15-1.18 3.15-1.18.63 1.58.24 2.75.12 3.04.74.8 1.18 1.83 1.18 3.08 0 4.41-2.69 5.38-5.25 5.67.42.36.78 1.07.78 2.16v3.15c0 .31.21.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z"
          fill="currentColor"
        />
      </svg>
    );
  }

  if (name === 'instagram') {
    return (
      <svg
        aria-hidden="true"
        className={iconClassName}
        fill="none"
        focusable="false"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
        viewBox="0 0 24 24"
        {...props}
      >
        <rect height="18" rx="5" width="18" x="3" y="3" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
        <path d="M17.5 6.5h.01" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      className={iconClassName}
      focusable="false"
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S.02 4.88.02 3.5 1.13 1 2.5 1s2.48 1.12 2.48 2.5ZM.4 8h4.2v13.5H.4V8Zm7.04 0h4.02v1.84h.06c.56-1.06 1.94-2.18 3.99-2.18 4.27 0 5.06 2.81 5.06 6.47v7.37h-4.2v-6.53c0-1.56-.03-3.56-2.17-3.56-2.17 0-2.5 1.7-2.5 3.45v6.64H7.44V8Z"
        fill="currentColor"
      />
    </svg>
  );
}
