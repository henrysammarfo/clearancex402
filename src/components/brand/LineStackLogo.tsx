import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  /** Pixel size (width & height). */
  size?: number;
  /** Dark mark on light UI, or light mark on dark UI. */
  variant?: "dark" | "light";
};

/**
 * Clearance402 mark — a shield (trust) with a checkmark (cleared).
 * Square, with safe padding for sidebar, header, and favicon.
 */
export function LineStackLogo({ className, size = 32, variant = "dark" }: LogoProps) {
  const bg = variant === "dark" ? "#4f46e5" : "#ffffff";
  const fg = variant === "dark" ? "#ffffff" : "#4f46e5";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-hidden
    >
      <rect width="32" height="32" rx={size >= 36 ? 10 : 8} fill={bg} />
      {/* Shield outline */}
      <path
        d="M16 6.5l6 2.1v4.8c0 3.9-2.5 7.2-6 8.6-3.5-1.4-6-4.7-6-8.6V8.6l6-2.1z"
        stroke={fg}
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Cleared checkmark */}
      <path
        d="M12.8 15.4l2.3 2.3 4.1-4.6"
        stroke={fg}
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
