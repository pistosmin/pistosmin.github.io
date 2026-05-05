import type { AnchorHTMLAttributes, ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';

type SurfaceFn = (x: number) => number;

type RefractiveSettings = {
  radius?: number;
  blur?: number;
  bezelWidth?: number;
  glassThickness?: number;
  refractiveIndex?: number;
  specularOpacity?: number;
  specularAngle?: number;
  bezelHeightFn?: SurfaceFn;
};

type PresetName = 'bar' | 'pill' | 'icon' | 'chip' | 'panel';

function cx(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(' ');
}

type RefractiveProps = {
  children: ReactNode;
  preset?: PresetName;
  refraction?: Partial<RefractiveSettings>;
};

function ignoreRefractiveRuntimeProps(preset?: PresetName, refraction?: Partial<RefractiveSettings>) {
  void preset;
  void refraction;
}

export function RefractiveSurface({
  children,
  className,
  preset = 'panel',
  refraction,
  ...props
}: HTMLAttributes<HTMLDivElement> & RefractiveProps) {
  ignoreRefractiveRuntimeProps(preset, refraction);

  return (
    <div className={cx('refractive-control', className)} {...props}>
      {children}
    </div>
  );
}

export function RefractiveLink({
  children,
  className,
  preset = 'pill',
  refraction,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & RefractiveProps) {
  ignoreRefractiveRuntimeProps(preset, refraction);

  return (
    <a className={cx('refractive-control', className)} {...props}>
      {children}
    </a>
  );
}

export function RefractiveButton({
  children,
  className,
  preset = 'pill',
  refraction,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & RefractiveProps) {
  ignoreRefractiveRuntimeProps(preset, refraction);

  return (
    <button className={cx('refractive-control', className)} {...props}>
      {children}
    </button>
  );
}
