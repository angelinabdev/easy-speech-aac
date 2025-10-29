
import { cn } from '@/lib/utils';
import * as React from 'react';

export function Logo({ className, ...props }: React.SVGProps<SVGSVGElement> & { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="256"
      height="256"
      role="img"
      aria-labelledby="logo-title logo-desc"
      className={cn('h-10 w-10', className)}
      {...props}
    >
      <title id="logo-title">Easy Speech AAC Logo</title>
      <desc id="logo-desc">
        Solid orange speech bubble with a white heart centered slightly higher and offset left for perfect balance.
      </desc>

      {/* One-piece speech bubble */}
      <path
        fill="hsl(var(--accent))"
        d="
    M64 48
    h128
    a24 24 0 0 1 24 24
    v88
    a24 24 0 0 1 -24 24
    h-70
    l-30 36
    a4 4 0 0 1 -7 -3
    v-33
    h-21
    a24 24 0 0 1 -24 -24
    v-88
    a24 24 0 0 1 24 -24
    z"
      />

      {/* Heart raised 14px and shifted 6px left */}
      <path
        fill="#FFFFFF"
        d="
    M122 104
    c6 -10 22 -10 28 0
    c4 7 3 16 -3 22
    l-20 18
    c-1.2 1.1 -3 1.1 -4.2 0
    l-20 -18
    c-6 -6 -7 -15 -3 -22
    c6 -10 22 -10 28 0
    z"
      />
    </svg>
  );
}

    