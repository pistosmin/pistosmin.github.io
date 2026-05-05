import { convex, lip, refractive } from '@hashintel/refractive';
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  CSSProperties,
  HTMLAttributes,
  PointerEventHandler,
  ReactNode,
} from 'react';

const RefractiveDiv = refractive.div;
const RefractiveAnchor = refractive.a;
const RefractiveButtonElement = refractive.button;

type SurfaceFn = (x: number) => number;

type RefractiveSettings = {
  radius: number;
  blur?: number;
  bezelWidth?: number;
  glassThickness?: number;
  refractiveIndex?: number;
  specularOpacity?: number;
  specularAngle?: number;
  bezelHeightFn?: SurfaceFn;
};

const presets = {
  bar: {
    radius: 30,
    blur: 2.4,
    bezelWidth: 9,
    glassThickness: 58,
    refractiveIndex: 1.38,
    specularOpacity: 0.32,
    specularAngle: Math.PI * 0.72,
    bezelHeightFn: lip,
  },
  pill: {
    radius: 999,
    blur: 2.1,
    bezelWidth: 8,
    glassThickness: 58,
    refractiveIndex: 1.42,
    specularOpacity: 0.42,
    specularAngle: Math.PI * 0.72,
    bezelHeightFn: lip,
  },
  icon: {
    radius: 21,
    blur: 1.9,
    bezelWidth: 7,
    glassThickness: 52,
    refractiveIndex: 1.4,
    specularOpacity: 0.4,
    specularAngle: Math.PI * 0.72,
    bezelHeightFn: lip,
  },
  chip: {
    radius: 18,
    blur: 1.5,
    bezelWidth: 6,
    glassThickness: 44,
    refractiveIndex: 1.36,
    specularOpacity: 0.3,
    specularAngle: Math.PI * 0.7,
    bezelHeightFn: convex,
  },
  panel: {
    radius: 26,
    blur: 2,
    bezelWidth: 10,
    glassThickness: 66,
    refractiveIndex: 1.36,
    specularOpacity: 0.24,
    specularAngle: Math.PI * 0.72,
    bezelHeightFn: lip,
  },
} satisfies Record<string, RefractiveSettings>;

type PresetName = keyof typeof presets;

function refractionFor(preset: PresetName, override?: Partial<RefractiveSettings>) {
  return { ...presets[preset], ...override };
}

function cx(...names: Array<string | false | null | undefined>) {
  return names.filter(Boolean).join(' ');
}

function setPointerPosition(element: HTMLElement, clientX: number, clientY: number) {
  const rect = element.getBoundingClientRect();
  element.style.setProperty('--liquid-x', `${clientX - rect.left}px`);
  element.style.setProperty('--liquid-y', `${clientY - rect.top}px`);
}

function composePointerMove<T extends HTMLElement>(
  handler?: PointerEventHandler<T>,
): PointerEventHandler<T> {
  return (event) => {
    setPointerPosition(event.currentTarget, event.clientX, event.clientY);
    handler?.(event);
  };
}

function composePointerLeave<T extends HTMLElement>(
  handler?: PointerEventHandler<T>,
): PointerEventHandler<T> {
  return (event) => {
    event.currentTarget.style.removeProperty('--liquid-x');
    event.currentTarget.style.removeProperty('--liquid-y');
    handler?.(event);
  };
}

export function RefractiveSurface({
  children,
  className,
  preset = 'panel',
  refraction,
  style,
  onPointerMove,
  onPointerLeave,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  preset?: PresetName;
  refraction?: Partial<RefractiveSettings>;
  style?: CSSProperties;
}) {
  return (
    <RefractiveDiv
      className={cx('refractive-control', className)}
      onPointerLeave={composePointerLeave(onPointerLeave)}
      onPointerMove={composePointerMove(onPointerMove)}
      refraction={refractionFor(preset, refraction)}
      style={style}
      {...props}
    >
      {children}
    </RefractiveDiv>
  );
}

export function RefractiveLink({
  children,
  className,
  preset = 'pill',
  refraction,
  style,
  onPointerMove,
  onPointerLeave,
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  preset?: PresetName;
  refraction?: Partial<RefractiveSettings>;
  style?: CSSProperties;
}) {
  return (
    <RefractiveAnchor
      className={cx('refractive-control', className)}
      onPointerLeave={composePointerLeave(onPointerLeave)}
      onPointerMove={composePointerMove(onPointerMove)}
      refraction={refractionFor(preset, refraction)}
      style={style}
      {...props}
    >
      {children}
    </RefractiveAnchor>
  );
}

export function RefractiveButton({
  children,
  className,
  preset = 'pill',
  refraction,
  style,
  onPointerMove,
  onPointerLeave,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  preset?: PresetName;
  refraction?: Partial<RefractiveSettings>;
  style?: CSSProperties;
}) {
  return (
    <RefractiveButtonElement
      className={cx('refractive-control', className)}
      onPointerLeave={composePointerLeave(onPointerLeave)}
      onPointerMove={composePointerMove(onPointerMove)}
      refraction={refractionFor(preset, refraction)}
      style={style}
      {...props}
    >
      {children}
    </RefractiveButtonElement>
  );
}
