import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/queryline/results")({
  component: () => <Outlet />,
});
