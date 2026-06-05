import { cn } from "@/lib/utils";

type LineStackLogoProps = {
  className?: string;
  /** Pixel size (width & height). */
  size?: number;
  /** Dark mark on light UI, or light mark on dark UI. */
  variant?: "dark" | "light";
};

/** Square mark — LS centered with safe padding for sidebar, header, favicon. */
export function LineStackLogo({ className, size = 32, variant = "dark" }: LineStackLogoProps) {
  const bg = variant === "dark" ? "#18181b" : "#ffffff";
  const fg = variant === "dark" ? "#ffffff" : "#18181b";

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
      <path
        d="M9.5 10.5v11h2.1v-4.35l3.15 4.35h2.55l-3.45-4.65 3.6-6.35h-2.5l-2.35 4.2V10.5H9.5zm8.2 0c-2.35 0-3.85 1.45-3.85 3.55 0 1.55.85 2.45 2.65 2.95l1.35.35c.75.2 1.05.45 1.05.95 0 .6-.55 1-1.35 1-.95 0-1.6-.4-1.75-1.15h-2.1c.2 1.75 1.55 2.85 3.8 2.85 2.4 0 4-1.4 4-3.5 0-1.6-.8-2.55-2.7-3.05l-1.35-.35c-.7-.2-1-.4-1-.85 0-.55.5-.9 1.25-.9.8 0 1.35.35 1.45 1h2.05c-.15-1.65-1.4-2.7-3.55-2.7z"
        fill={fg}
      />
    </svg>
  );
}
