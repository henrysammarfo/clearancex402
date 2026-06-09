import { createFileRoute, Link, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/$")({
  beforeLoad: ({ location }) => {
    if (location.pathname.startsWith("/vaultline") || location.pathname.startsWith("/queryline")) {
      throw redirect({ to: "/dashboard", replace: true });
    }
  },
  component: NotFoundPage,
});

function NotFoundPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary">Clearance402</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-foreground">Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          This page is not part of the Clearance402 console. Open the tool registry, docs, or dashboard instead.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <Link to="/dashboard" className="inline-flex rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
            Open dashboard
          </Link>
          <Link to="/docs" className="inline-flex rounded-md border px-4 py-2 text-sm font-medium text-foreground">
            Read docs
          </Link>
        </div>
      </div>
    </div>
  );
}