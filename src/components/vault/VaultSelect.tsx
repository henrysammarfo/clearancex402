import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "@tanstack/react-router";
import type { VaultRecord } from "@/lib/vault/registry";

export function VaultSelect({
  vaults,
  value,
  onChange,
  label = "Vault",
  syncing,
}: {
  vaults: VaultRecord[];
  value: string;
  onChange: (uuid: string) => void;
  label?: string;
  syncing?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Select value={value || undefined} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder={syncing && vaults.length === 0 ? "Loading vaults…" : "Select a vault"} />
        </SelectTrigger>
        <SelectContent>
          {vaults.length === 0 ? (
            <SelectItem value="__none" disabled>
              No vaults — create one first
            </SelectItem>
          ) : (
            vaults.map((v) => (
              <SelectItem key={v.uuid} value={v.uuid}>
                {v.name} (CDR {v.uuid})
              </SelectItem>
            ))
          )}
        </SelectContent>
      </Select>
      {vaults.length === 0 && (
        <p className="text-xs text-muted-foreground">
          <Link to="/vaultline/create-vault" className="underline">
            Create a vault
          </Link>{" "}
          to get a numeric CDR UUID on Story Aeneid.
        </p>
      )}
    </div>
  );
}
