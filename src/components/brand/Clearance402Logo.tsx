import { cn } from "@/lib/utils";
import { CLEARANCE402_BRAND } from "@/components/brand/brand";

type LogoProps = {
  className?: string;
  /** Pixel size (width & height). */
  size?: number;
  /** Dark mark on light UI, or light mark on dark UI. */
  variant?: "dark" | "light" | "mono";
  /** Accessible label; omit when decorative (paired with wordmark). */
  title?: string;
};

/**
 * Clearance402 brand mark — shield (trust) + check (cleared to pay).
 * Matches /public/favicon.svg and /public/logo.svg.
 */
export function Clearance402Logo({
  className,
  size = 32,
  variant = "dark",
  title,
}: LogoProps) {
  const id = `c402-${variant}-${size}`;
  const isLight = variant === "light";
  const isMono = variant === "mono";

  const gradStart = isLight ? CLEARANCE402_BRAND.white : CLEARANCE402_BRAND.indigo;
  const gradEnd = isLight ? "#f4f4f5" : CLEARANCE402_BRAND.indigoDark;
  const stroke = isLight ? CLEARANCE402_BRAND.indigo : CLEARANCE402_BRAND.white;
  const check = stroke;
  const badgeFill = isLight ? CLEARANCE402_BRAND.indigo : CLEARANCE402_BRAND.white;
  const badgeText = isLight ? CLEARANCE402_BRAND.white : CLEARANCE402_BRAND.indigo;

  if (isMono) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn("shrink-0", className)}
        role={title ? "img" : undefined}
        aria-hidden={title ? undefined : true}
        aria-label={title}
      >
        <rect width="32" height="32" rx={size >= 36 ? 10 : 8} fill={CLEARANCE402_BRAND.ink} />
        <path
          d="M16 6.25l5.75 2v4.65c0 3.55-2.35 6.65-5.75 8.1-3.4-1.45-5.75-4.55-5.75-8.1V8.25L16 6.25z"
          stroke={CLEARANCE402_BRAND.white}
          strokeWidth="1.85"
          strokeLinejoin="round"
        />
        <path
          d="M12.85 15.1l2.15 2.15 4.15-4.65"
          stroke={CLEARANCE402_BRAND.white}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <defs>
        <linearGradient id={`${id}-bg`} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor={gradStart} />
          <stop offset="1" stopColor={gradEnd} />
        </linearGradient>
      </defs>
      <rect width="32" height="32" rx={size >= 36 ? 10 : 8} fill={`url(#${id}-bg)`} />
      <path
        d="M16 6.25l5.75 2v4.65c0 3.55-2.35 6.65-5.75 8.1-3.4-1.45-5.75-4.55-5.75-8.1V8.25L16 6.25z"
        stroke={stroke}
        strokeWidth="1.85"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M12.85 15.1l2.15 2.15 4.15-4.65"
        stroke={check}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="11.5" y="19.25" width="9" height="4.25" rx="2.1" fill={badgeFill} />
      <text
        x="16"
        y="22.35"
        textAnchor="middle"
        fill={badgeText}
        fontSize="3.15"
        fontWeight="700"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        letterSpacing="-0.02em"
      >
        402
      </text>
    </svg>
  );
}

type BrandProps = {
  className?: string;
  logoSize?: number;
  variant?: "dark" | "light";
  /** Hide wordmark on narrow layouts */
  compact?: boolean;
};

/** Logo + wordmark lockup for headers and sidebars. */
export function Clearance402Brand({
  className,
  logoSize = 32,
  variant = "dark",
  compact = false,
}: BrandProps) {
  return (
    <span className={cn("inline-flex items-center gap-2 min-w-0", className)}>
      <Clearance402Logo size={logoSize} variant={variant} />
      {!compact && (
        <span
          className={cn(
            "text-[15px] font-semibold tracking-tight whitespace-nowrap",
            variant === "light" ? "text-white" : "text-zinc-900",
          )}
        >
          Clearance402
        </span>
      )}
    </span>
  );
}
