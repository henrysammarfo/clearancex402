import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Check, Copy, Download, ExternalLink, RotateCcw, Search } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/states";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DEFAULT_EXPLORER_BASE_URL, useConnection } from "@/lib/connection";
import { cn } from "@/lib/utils";

export type AuditStatus = "success" | "failed" | "pending" | "unauthorized";
export type AuditEntry = {
  time: string;
  actor: string;
  action: string;
  target: string;
  txHash: string;
  status: AuditStatus;
};

type SortKey = "time" | "status";
type SortDir = "asc" | "desc";

type PersistedState = {
  q: string;
  action: string;
  target: string;
  status: "all" | AuditStatus;
  sortKey: SortKey;
  sortDir: SortDir;
  page: number;
  pageSize: number;
};

const PAGE_SIZES = [10, 25, 50];
const STATUS_TONE: Record<AuditStatus, string> = {
  success: "bg-chain-success/15 text-foreground border-chain-success/40",
  failed: "bg-chain-failed/15 text-foreground border-chain-failed/40",
  pending: "bg-chain-pending/15 text-foreground border-chain-pending/40",
  unauthorized: "bg-chain-unauthorized/15 text-foreground border-chain-unauthorized/40",
};

const DEFAULT_STATE: PersistedState = {
  q: "",
  action: "",
  target: "",
  status: "all",
  sortKey: "time",
  sortDir: "desc",
  page: 1,
  pageSize: 10,
};

function loadState(key: string): PersistedState {
  if (typeof window === "undefined") return DEFAULT_STATE;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return DEFAULT_STATE;
    return { ...DEFAULT_STATE, ...(JSON.parse(raw) as Partial<PersistedState>) };
  } catch {
    return DEFAULT_STATE;
  }
}

function csvEscape(v: string) {
  if (/[",\n\r]/.test(v)) return `"${v.replace(/"/g, '""')}"`;
  return v;
}

/** Audit times are stored UTC (ISO); show local time in the table. */
function formatAuditTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "medium" });
}

function downloadCsv(filename: string, rows: AuditEntry[]) {
  const header = ["time", "actor", "action", "target", "txHash", "status"];
  const lines = [header.join(",")];
  for (const r of rows) {
    lines.push([r.time, r.actor, r.action, r.target, r.txHash, r.status].map(csvEscape).join(","));
  }
  const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function vaultUuidFromTarget(target: string): string | undefined {
  const head = target.split("/")[0]?.trim();
  if (head && /^\d+$/.test(head)) return head;
  return undefined;
}

export function AuditLogTable({
  entries = [] as AuditEntry[],
  scope = "Clearance402",
  storageKey,
  product = "clearance",
}: {
  entries?: AuditEntry[];
  scope?: string;
  storageKey?: string;
  product?: "clearance";
}) {
  const key = storageKey ?? `clearance402.audit.${scope.toLowerCase()}.v1`;
  const initial = useMemo(() => loadState(key), [key]);

  const { config } = useConnection();
  const explorerBase = (config?.explorerBaseUrl ?? DEFAULT_EXPLORER_BASE_URL).replace(/\/?$/, "/");

  const [q, setQ] = useState(initial.q);
  const [action, setAction] = useState(initial.action);
  const [target, setTarget] = useState(initial.target);
  const [status, setStatus] = useState<"all" | AuditStatus>(initial.status);
  const [sortKey, setSortKey] = useState<SortKey>(initial.sortKey);
  const [sortDir, setSortDir] = useState<SortDir>(initial.sortDir);
  const [page, setPage] = useState(initial.page);
  const [pageSize, setPageSize] = useState(initial.pageSize);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        key,
        JSON.stringify({ q, action, target, status, sortKey, sortDir, page, pageSize } satisfies PersistedState),
      );
    } catch {
      /* ignore */
    }
  }, [key, q, action, target, status, sortKey, sortDir, page, pageSize]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const actionN = action.trim().toLowerCase();
    const targetN = target.trim().toLowerCase();
    let rows = entries.filter((e) => {
      if (status !== "all" && e.status !== status) return false;
      if (needle) {
        const hay = `${e.txHash} ${e.action} ${e.target} ${e.actor} ${e.time}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      if (actionN && !e.action.toLowerCase().includes(actionN)) return false;
      if (targetN && !e.target.toLowerCase().includes(targetN)) return false;
      return true;
    });
    rows = [...rows].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (sortKey === "time") return (a.time > b.time ? 1 : -1) * dir;
      return (a.status > b.status ? 1 : -1) * dir;
    });
    return rows;
  }, [entries, q, action, target, status, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageSafe = Math.min(page, totalPages);
  const slice = filtered.slice((pageSafe - 1) * pageSize, pageSafe * pageSize);

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
  }, [page, totalPages]);

  const toggleSort = (k: SortKey) => {
    if (sortKey === k) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else { setSortKey(k); setSortDir("desc"); }
  };

  const onExport = () => {
    const stamp = new Date().toISOString().replace(/[:.]/g, "-");
    downloadCsv(`${scope.toLowerCase()}-audit-${stamp}.csv`, filtered);
  };

  const onReset = () => {
    setQ(DEFAULT_STATE.q);
    setAction(DEFAULT_STATE.action);
    setTarget(DEFAULT_STATE.target);
    setStatus(DEFAULT_STATE.status);
    setSortKey(DEFAULT_STATE.sortKey);
    setSortDir(DEFAULT_STATE.sortDir);
    setPage(DEFAULT_STATE.page);
    setPageSize(DEFAULT_STATE.pageSize);
    try { window.localStorage.removeItem(key); } catch { /* ignore */ }
  };

  const isDirty =
    q !== DEFAULT_STATE.q ||
    action !== DEFAULT_STATE.action ||
    target !== DEFAULT_STATE.target ||
    status !== DEFAULT_STATE.status ||
    sortKey !== DEFAULT_STATE.sortKey ||
    sortDir !== DEFAULT_STATE.sortDir ||
    page !== DEFAULT_STATE.page ||
    pageSize !== DEFAULT_STATE.pageSize;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-md">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => { setQ(e.target.value); setPage(1); }}
            placeholder="Search tx, action, target, actor…"
            className="pl-9 font-mono text-xs"
            aria-label="Search audit log"
          />
        </div>
        <Input
          value={action}
          onChange={(e) => { setAction(e.target.value); setPage(1); }}
          placeholder="Action"
          className="w-[160px] font-mono text-xs"
          aria-label="Filter by action"
        />
        <Input
          value={target}
          onChange={(e) => { setTarget(e.target.value); setPage(1); }}
          placeholder="Target"
          className="w-[180px] font-mono text-xs"
          aria-label="Filter by target"
        />
        <Select value={status} onValueChange={(v) => { setStatus(v as typeof status); setPage(1); }}>
          <SelectTrigger className="w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="success">success</SelectItem>
            <SelectItem value="pending">pending</SelectItem>
            <SelectItem value="failed">failed</SelectItem>
            <SelectItem value="unauthorized">unauthorized</SelectItem>
          </SelectContent>
        </Select>
        <Select value={String(pageSize)} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
          <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {PAGE_SIZES.map((n) => <SelectItem key={n} value={String(n)}>{n} / page</SelectItem>)}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          size="sm"
          onClick={onExport}
          disabled={filtered.length === 0}
          className="gap-1.5"
        >
          <Download className="size-3.5" /> Export CSV
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          disabled={!isDirty}
          className="gap-1.5"
          title="Clear filters, sort, and pagination"
        >
          <RotateCcw className="size-3.5" /> Reset
        </Button>
        <div className="ml-auto text-xs text-muted-foreground">
          {filtered.length} of {entries.length} entr{entries.length === 1 ? "y" : "ies"}
        </div>
      </div>

      {entries.length === 0 ? (
        <EmptyState
          title={`No ${scope} audit entries`}
          description="Clearance events will appear here once tools are probed, payments are checked, or approvals are requested."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No entries match"
          description="Clear filters or pick All statuses to see the full Clearance402 audit trail."
        />
      ) : (
        <>
          <div className="rounded-2xl border overflow-hidden bg-card">
            <Table>
              <TableHeader>
                <TableRow>
                  <SortableHead label="Time" active={sortKey === "time"} dir={sortDir} onClick={() => toggleSort("time")} />
                  <TableHead>Actor</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Target</TableHead>
                  <TableHead>Tx hash</TableHead>
                  <SortableHead label="Status" active={sortKey === "status"} dir={sortDir} onClick={() => toggleSort("status")} />
                </TableRow>
              </TableHeader>
              <TableBody>
                {slice.map((e, i) => (
                  <TableRow key={i}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap" title={e.time}>
                      {formatAuditTime(e.time)}
                    </TableCell>
                    <TableCell className="font-mono text-xs">{e.actor}</TableCell>
                    <TableCell className="font-mono text-xs">{e.action}</TableCell>
                    <TableCell className="font-mono text-xs">
                      <TargetCell entry={e} product={product} />
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      <TxHashCell hash={e.txHash} explorerBase={explorerBase} />
                    </TableCell>
                    <TableCell>
                      <span className={cn("inline-flex text-[11px] px-2 py-0.5 rounded-full border capitalize", STATUS_TONE[e.status])}>{e.status}</span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Page {pageSafe} of {totalPages}</span>
            <div className="flex gap-1.5">
              <Button variant="outline" size="sm" disabled={pageSafe <= 1} onClick={() => setPage(pageSafe - 1)}>Previous</Button>
              <Button variant="outline" size="sm" disabled={pageSafe >= totalPages} onClick={() => setPage(pageSafe + 1)}>Next</Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function TargetCell({
  entry,
  product,
}: {
  entry: AuditEntry;
  product: "clearance";
}) {
  void product;
  return <span>{entry.target}</span>;
}

function TxHashCell({ hash, explorerBase }: { hash: string; explorerBase: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopied(true);
      toast.success("Tx hash copied", {
        description: `${hash.slice(0, 10)}…${hash.slice(-6)}`,
      });
      setTimeout(() => setCopied(false), 1200);
    } catch {
      toast.error("Couldn’t copy tx hash", { description: "Clipboard access was blocked." });
    }
  };
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-muted-foreground" title={hash}>{hash.slice(0, 10)}…</span>
      <button
        type="button"
        onClick={onCopy}
        className="inline-flex items-center justify-center size-5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        title={copied ? "Copied" : "Copy tx hash"}
        aria-label="Copy tx hash"
        aria-live="polite"
      >
        {copied ? <Check className="size-3 text-chain-success" /> : <Copy className="size-3" />}
        <span className="sr-only">{copied ? "Tx hash copied to clipboard" : "Copy tx hash"}</span>
      </button>
      <a
        href={`${explorerBase}${hash}`}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center size-5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"
        title="Open tx details"
        aria-label="Open tx details"
      >
        <ExternalLink className="size-3" />
      </a>
    </span>
  );
}

function SortableHead({ label, active, dir, onClick }: { label: string; active: boolean; dir: SortDir; onClick: () => void }) {
  return (
    <TableHead>
      <button onClick={onClick} className="inline-flex items-center gap-1 hover:text-foreground">
        {label}
        {active && (dir === "asc" ? <ArrowUp className="size-3" /> : <ArrowDown className="size-3" />)}
      </button>
    </TableHead>
  );
}
