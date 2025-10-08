
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <svg
      className={cn('h-10 w-10', className)}
      viewBox="0 0 100 100"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Easy Speech AAC Logo - Puzzle Piece"
    >
      <path
        fill="hsl(var(--accent))"
        stroke="hsl(var(--accent-foreground))"
        strokeWidth="3"
        d="M25,25 H43.75 C43.75,12.5 56.25,12.5 56.25,25 H75 V43.75 C87.5,43.75 87.5,56.25 75,56.25 V75 H56.25 C56.25,87.5 43.75,87.5 43.75,75 H25 V56.25 C12.5,56.25 12.5,43.75 25,43.75 V25 Z"
      />
    </svg>
  );
}
