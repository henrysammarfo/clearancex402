import type { NavigateOptions } from "@tanstack/react-router";

type AppNavigate = (options: NavigateOptions) => void;

/** Current path + query string for post-login return (preserves ?vaultId= etc.). */
export function buildRedirectPath(pathname: string, searchStr?: string): string {
  return `${pathname}${searchStr ?? ""}`;
}

function parseRedirect(redirect: string): { pathname: string; search: Record<string, string> } {
  const trimmed = redirect.trim();
  if (!trimmed.startsWith("/")) {
    return { pathname: "/dashboard", search: {} };
  }
  const qIndex = trimmed.indexOf("?");
  const pathname = qIndex === -1 ? trimmed : trimmed.slice(0, qIndex);
  const search: Record<string, string> = {};
  if (qIndex !== -1) {
    const params = new URLSearchParams(trimmed.slice(qIndex + 1));
    params.forEach((value, key) => {
      search[key] = value;
    });
  }
  return { pathname, search };
}

/** Navigate to a stored redirect from RequireAuth (path may include search). */
export function navigateToRedirect(navigate: AppNavigate, redirect: string): void {
  const { pathname, search } = parseRedirect(redirect);
  navigate({
    to: pathname as NavigateOptions["to"],
    ...(Object.keys(search).length > 0 ? { search } : {}),
  });
}
