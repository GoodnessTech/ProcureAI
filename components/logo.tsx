import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
}

export function Logo({
  className,
  iconClassName,
  textClassName,
}: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground shadow-sm',
          iconClassName
        )}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 7L12 2L21 7M3 7V17L12 22M3 7L12 12M21 7V17L12 22M21 7L12 12M12 22V12"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span
        className={cn(
          'text-lg font-semibold tracking-tight',
          textClassName
        )}
      >
        ProcureAI
      </span>
    </div>
  );
}
