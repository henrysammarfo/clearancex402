import { createFileRoute } from "@tanstack/react-router";
import { getServerAutomataQuote } from "@/lib/storage/server-automata";

export const Route = createFileRoute("/api/automata/quote")({
  server: {
    handlers: {
      GET: async () => {
        const payload = getServerAutomataQuote();
        if (!payload.enabled || !payload.quote) {
          return Response.json(
            {
              enabled: false,
              error:
                "Automata DCAP quote required: set USE_AUTOMATA_DCAP_FIXTURE=1 or AUTOMATA_DCAP_QUOTE_HEX on the server.",
            },
            { status: 503 },
          );
        }
        return Response.json(payload);
      },
    },
  },
});
