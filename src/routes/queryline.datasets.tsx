import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Layout: child routes (`index`, `$id`) render here. */
export const Route = createFileRoute("/queryline/datasets")({
  component: () => <Outlet />,
});
