import { cn } from '@/lib/cn';
import React from 'react';

type FeatureType = {
  title: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description: string;
};

type FeatureCardProps = React.ComponentProps<'div'> & {
  feature: FeatureType;
};

// Pre-generated fixed patterns to avoid SSR/client mismatch
const fixedPatterns: number[][][] = [
  [[8, 3], [9, 5], [10, 1], [7, 4], [9, 2]],
  [[7, 1], [10, 3], [8, 5], [9, 6], [7, 2]],
  [[9, 4], [8, 1], [10, 6], [7, 3], [8, 5]],
  [[10, 2], [7, 5], [9, 1], [8, 4], [10, 6]],
  [[8, 6], [10, 2], [7, 4], [9, 3], [8, 1]],
  [[7, 2], [9, 5], [10, 3], [8, 6], [7, 1]],
];

let patternIndex = 0;

export function FeatureCard({ feature, className, ...props }: FeatureCardProps) {
  const p = fixedPatterns[patternIndex++ % fixedPatterns.length];

  return (
    <div className={cn('relative overflow-hidden p-6 bg-background', className)} {...props}>
      <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
        <div className="from-foreground/5 to-foreground/1 absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-100">
          <GridPattern
            width={20}
            height={20}
            x="-12"
            y="4"
            squares={p}
            className="fill-foreground/5 stroke-foreground/25 absolute inset-0 h-full w-full mix-blend-overlay"
          />
        </div>
      </div>
      <feature.icon className="text-emerald-600 dark:text-emerald-400 size-6" strokeWidth={1} aria-hidden />
      <h3 className="mt-10 text-sm font-semibold text-foreground md:text-base">{feature.title}</h3>
      <p className="text-muted-fg relative z-20 mt-2 text-xs font-light leading-relaxed">{feature.description}</p>
    </div>
  );
}

function GridPattern({
  width,
  height,
  x,
  y,
  squares,
  ...props
}: React.ComponentProps<'svg'> & { width: number; height: number; x: string; y: string; squares?: number[][] }) {
  const patternId = React.useId();

  return (
    <svg aria-hidden="true" {...props}>
      <defs>
        <pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
          <path d={`M.5 ${height}V.5H${width}`} fill="none" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([sx, sy], index) => (
            <rect strokeWidth="0" key={index} width={width + 1} height={height + 1} x={sx * width} y={sy * height} />
          ))}
        </svg>
      )}
    </svg>
  );
}

function genRandomPattern(length?: number): number[][] {
  length = length ?? 5;
  return Array.from({ length }, () => [
    Math.floor(Math.random() * 4) + 7,
    Math.floor(Math.random() * 6) + 1,
  ]);
}
