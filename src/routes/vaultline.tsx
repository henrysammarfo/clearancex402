import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/vaultline")({
  beforeLoad: () => {
    throw redirect({ to: "/dashboard", replace: true });
  },
});
