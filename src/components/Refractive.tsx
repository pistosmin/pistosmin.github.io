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
  enableRefractive?: boolean;
};

function ignoreRefractiveRuntimeProps(
  preset?: PresetName,
  refraction?: Partial<RefractiveSettings>,
  enableRefractive?: boolean,
) {
  void preset;
  void refraction;
  void enableRefractive;
}

function refractiveAttrs(preset?: PresetName, enableRefractive?: boolean) {
  return {
    'data-refractive-preset': preset,
    'data-refractive-mode': enableRefractive ? 'candidate' : 'stable',
  };
}

export function RefractiveSurface({
  children,
  className,
  preset = 'panel',
  refraction,
  enableRefractive = false,
  ...props
}: HTMLAttributes<HTMLDivElement> & RefractiveProps) {
  ignoreRefractiveRuntimeProps(preset, refraction, enableRefractive);

  return (
    <div
      className={cx('refractive-control', className)}
      {...refractiveAttrs(preset, enableRefractive)}
      {...props}
    >
      {children}
    </div>
  );
}

export function RefractiveLink({
  children,
  className,
  preset = 'pill',
  refraction,
  enableRefractive = false,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & RefractiveProps) {
  ignoreRefractiveRuntimeProps(preset, refraction, enableRefractive);

  return (
    <a
      className={cx('refractive-control', className)}
      {...refractiveAttrs(preset, enableRefractive)}
      {...props}
    >
      {children}
    </a>
  );
}

export function RefractiveButton({
  children,
  className,
  preset = 'pill',
  refraction,
  enableRefractive = false,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & RefractiveProps) {
  ignoreRefractiveRuntimeProps(preset, refraction, enableRefractive);

  return (
    <button
      className={cx('refractive-control', className)}
      {...refractiveAttrs(preset, enableRefractive)}
      {...props}
    >
      {children}
    </button>
  );
}
