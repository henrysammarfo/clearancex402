import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/queryline")({
  component: () => <Outlet />,
});
