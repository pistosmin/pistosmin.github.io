import { RefractiveLink } from './Refractive';
import BrandIcon, { type BrandIconName } from './BrandIcon';

type ActionLink = {
  href: string;
  icon?: BrandIconName;
  label: string;
  variant?: 'primary' | 'ghost';
  enableRefractive?: boolean;
};

export default function RefractiveActionLinks({
  enableRefractive = false,
  items,
}: {
  enableRefractive?: boolean;
  items: readonly ActionLink[];
}) {
  return (
    <>
      {items.map((item) => (
        <RefractiveLink
          className={`button button--${item.variant ?? 'ghost'}`}
          enableRefractive={item.enableRefractive ?? enableRefractive}
          href={item.href}
          key={`${item.href}-${item.label}`}
          preset="pill"
        >
          {item.icon && <BrandIcon name={item.icon} />}
          {item.label}
        </RefractiveLink>
      ))}
    </>
  );
}
