export function RegistrySyncBanner({ syncing, error }: { syncing?: boolean; error?: string | null }) {
  if (!syncing && !error) return null;
  return (
    <div className="mb-4 text-xs rounded-lg border px-3 py-2 bg-muted/40">
      {syncing && <span className="text-muted-foreground">Syncing registry with server…</span>}
      {error && (
        <span className={syncing ? " ml-2 text-chain-failed" : "text-chain-failed"}>
          {error}
        </span>
      )}
    </div>
  );
}
