import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/vaultline/listings/$id")({
  component: () => <Outlet />,
});
