import { createFileRoute } from "@tanstack/react-router";
import { LegacyWorkflowHandoff } from "@/routes/vaultline.index";

export const Route = createFileRoute("/queryline/$")({
  head: () => ({ meta: [{ title: "Legacy route moved · Clearance402" }] }),
  component: () => <LegacyWorkflowHandoff />,
});
