import { createFileRoute } from "@tanstack/react-router";
import { DocsPage } from "@/components/docs/DocsPage";

export const Route = createFileRoute("/docs")({
  head: () => ({ meta: [{ title: "Cipherline · Docs" }] }),
  component: DocsPage,
});
