import { RefractiveLink } from './Refractive';

type ActionLink = {
  href: string;
  label: string;
  variant?: 'primary' | 'ghost';
};

export default function RefractiveActionLinks({
  items,
}: {
  items: readonly ActionLink[];
}) {
  return (
    <>
      {items.map((item) => (
        <RefractiveLink
          className={`button button--${item.variant ?? 'ghost'}`}
          href={item.href}
          key={`${item.href}-${item.label}`}
          preset="pill"
        >
          {item.label}
        </RefractiveLink>
      ))}
    </>
  );
}
