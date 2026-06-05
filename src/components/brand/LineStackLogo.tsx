import { cn } from "@/lib/utils";

type LineStackLogoProps = {
  className?: string;
  /** Pixel size (width & height). */
  size?: number;
  /** Dark mark on light UI, or light mark on dark UI. */
  variant?: "dark" | "light";
};

/** Square mark — Cipherline "C" ring with safe padding for sidebar, header, favicon. */
export function LineStackLogo({ className, size = 32, variant = "dark" }: LineStackLogoProps) {
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
      {/* Open "C" ring */}
      <path
        d="M21.4 11.6 A 7 7 0 1 0 21.4 20.4"
        stroke={fg}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      {/* Center node — the "line" anchor */}
      <circle cx="16" cy="16" r="2.1" fill={fg} />
    </svg>
  );
}
