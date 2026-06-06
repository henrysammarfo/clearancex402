import { useEffect, useRef } from "react";

const COLS = [
  {
    title: "Product",
    links: [
      { label: "Tool registry", href: "/tools" },
      { label: "Onboard tool", href: "/tool-onboarding" },
      { label: "Agent clearance", href: "/agent-clearance" },
      { label: "Payment lab", href: "/payment-lab" },
      { label: "Audit log", href: "/audit" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Docs", href: "/docs" },
      { label: "SDK", href: "/sdk" },
      { label: "CLI", href: "/cli" },
      { label: "MCP", href: "/mcp" },
      { label: "Settings", href: "/settings" },
    ],
  },
];

const SOCIAL_PATHS = [
  // Discord
  "M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 13.85 13.85 0 0 0-.608 1.25 18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.74 19.74 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.1 13.1 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.3 12.3 0 0 1-1.873.892.077.077 0 0 0-.04.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.84 19.84 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z",
  // X
  "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  // LinkedIn
  "M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452z",
  // GitHub
  "M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.1-3.2.69-3.88-1.37-3.88-1.37-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.96.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.18-3.09-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .3.2.66.79.55C20.21 21.38 23.5 17.08 23.5 12 23.5 5.73 18.27.5 12 .5z",
];

export function SiteFooter() {
  const svgRef = useRef<SVGSVGElement>(null);
  const textRef = useRef<SVGTextElement>(null);

  useEffect(() => {
    const fit = () => {
      if (!svgRef.current || !textRef.current) return;
      try {
        const b = textRef.current.getBBox();
        svgRef.current.setAttribute("viewBox", `${b.x} ${b.y} ${b.width} ${b.height}`);
      } catch {}
    };
    fit();
    document.fonts?.ready?.then(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, []);

  return (
    <section className="bg-white px-4 sm:px-6 py-12">
      <div className="mx-auto max-w-[1150px] grid gap-4 lg:grid-cols-[350px_1fr] items-stretch">
        {/* LEFT */}
        <div className="relative min-h-[340px] rounded-[28px] p-8 overflow-hidden flex flex-col justify-between shadow-[0_12px_40px_rgba(21,76,189,0.25)] bg-[#1e4fc0]">
          <video
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            style={{ zIndex: 0 }}
          >
            <source
              src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260503_104800_bc43ae09-f494-43e3-97d7-2f8c1692cfd7.mp4"
              type="video/mp4"
            />
          </video>
          <div className="relative z-10 flex items-center gap-2.5">
            <div className="size-8 rounded-lg bg-white/15 border-[1.5px] border-white/85 flex items-center justify-center text-white text-[16px] font-bold tracking-tight">
              C
            </div>
            <span className="text-[22px] font-bold text-white tracking-tight">Clearance402</span>
          </div>
          <div className="relative z-10 mt-auto mb-7">
            <p className="text-[19px] text-white leading-[1.45]">
              CDR-native developer rails,
              <br />
              <span style={{ color: "rgba(255,255,255,0.65)" }}>built for Story testnet.</span>
            </p>
          </div>
          <div className="relative z-10 flex items-center justify-between gap-3">
            <span className="font-hand text-[17px] font-semibold tracking-wide" style={{ color: "rgba(255,255,255,0.9)" }}>
              Stay in touch!
            </span>
            <div className="flex gap-1.5">
              {SOCIAL_PATHS.map((d, i) => (
                <a
                  key={i}
                  href="#"
                  className="size-9 rounded-[9px] bg-[#0e1014] flex items-center justify-center shadow-[0_6px_18px_rgba(0,0,0,0.35),0_2px_6px_rgba(0,0,0,0.2)] hover:bg-black hover:-translate-y-0.5 transition-all duration-200"
                >
                  <svg viewBox="0 0 24 24" className="size-[15px] fill-white">
                    <path d={d} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="relative rounded-[28px] p-10 bg-[#f0f1f5] overflow-visible flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.04)]">
          {/* Lucky badge */}
          <div className="absolute z-10 top-[-36px] right-10 flex flex-col items-start gap-1.5">
            <div
              className="size-24 rounded-[22px] flex items-center justify-center"
              style={{
                transform: "rotate(-10deg)",
                background: "linear-gradient(135deg,#5b9ffb 0%,#1e5dd7 55%,#1448be 100%)",
                boxShadow:
                  "inset 3px 3px 8px rgba(255,255,255,0.35), inset -3px -3px 12px rgba(0,0,0,0.18), 8px 14px 28px rgba(20,72,200,0.35)",
              }}
            >
              <span
                className="text-[42px] font-bold text-white leading-none"
                style={{ letterSpacing: "-0.04em", transform: "rotate(10deg)", textShadow: "0 3px 6px rgba(0,0,0,0.25)" }}
              >
                C
              </span>
            </div>
            <div className="flex gap-1.5 items-center" style={{ transform: "rotate(-4deg)", marginTop: 4 }}>
              <svg viewBox="0 0 24 24" className="size-[22px] text-zinc-400">
                <path d="M3 20 C 6 14, 10 9, 18 5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 5 L 12 5" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18 5 L 18 11" stroke="currentColor" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-hand text-[20px] font-semibold text-zinc-400 whitespace-nowrap">Feeling lucky?</span>
            </div>
          </div>

          <div className="pt-2 flex gap-12 sm:gap-[72px] flex-wrap">
            {COLS.map((col) => (
              <div key={col.title} className="flex flex-col">
                <h4 className="font-hand text-[24px] font-semibold italic text-zinc-400 mb-[18px]">{col.title}</h4>
                {col.links.map((l) => (
                  <a key={l.href} href={l.href} className="block text-[14px] font-semibold text-zinc-900 mb-[14px] hover:text-[#1f65d6] transition-colors duration-200">
                    {l.label}
                  </a>
                ))}
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <p className="text-[12.5px] font-medium text-zinc-400">© 2026 Clearance402. All rights reserved.</p>
            <div className="flex flex-col gap-3.5">
              <h4 className="text-[15px] text-zinc-500 leading-[1.45]">
                Live on Story Aeneid (1315).
                <br />
                <strong className="block text-[19px] font-bold text-zinc-900">
                  <a href="https://linestack.vercel.app" className="hover:underline pointer-events-auto">
                    linestack.vercel.app
                  </a>
                </strong>
              </h4>
              <a
                href="https://github.com/henrysammarfo/linestack"
                className="text-[13.5px] font-semibold text-zinc-900 hover:text-[#1f65d6] pointer-events-auto"
              >
                github.com/henrysammarfo/linestack
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-[1150px] -mt-[60px] pointer-events-none select-none relative z-0 leading-[0]">
        <svg ref={svgRef} viewBox="62 95 876 175" preserveAspectRatio="xMidYMid meet" className="block w-full h-auto overflow-visible">
          <text
            ref={textRef}
            x="500"
            y="240"
            textAnchor="middle"
            fontSize="320"
            style={{ fontFamily: "DM Sans, sans-serif", fontWeight: 700, letterSpacing: "-0.03em", fill: "rgba(0,0,0,0.04)" }}
          >
            Clearance402
          </text>
        </svg>
      </div>
    </section>
  );
}
