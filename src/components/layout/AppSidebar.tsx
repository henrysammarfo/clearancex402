import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Boxes,
  Code2,
  Database,
  FileCode,
  FileSearch,
  LayoutDashboard,
  ListChecks,
  LockKeyhole,
  PackagePlus,
  PlayCircle,
  PlusCircle,
  Send,
  Settings as SettingsIcon,
  ShieldCheck,
  Tag,
  Terminal,
  Unlock,
  UploadCloud,
  Vault,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LineStackLogo } from "@/components/brand/LineStackLogo";
import { ConnectionFooter } from "@/components/layout/ConnectionFooter";

type Item = { to: string; label: string; icon: React.ComponentType<{ className?: string }> };

const VAULTLINE: Item[] = [
  { to: "/vaultline/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/vaultline/vaults", label: "Vaults", icon: Vault },
  { to: "/vaultline/create-vault", label: "Create vault", icon: PlusCircle },
  { to: "/vaultline/upload", label: "Upload", icon: UploadCloud },
  { to: "/vaultline/ip-register", label: "Register IP", icon: ShieldCheck },
  { to: "/vaultline/listings", label: "Listings", icon: Tag },
  { to: "/vaultline/unlock", label: "Unlock", icon: Unlock },
  { to: "/vaultline/audit", label: "Audit log", icon: Activity },
  { to: "/vaultline/developer-console", label: "Developer console", icon: Terminal },
];

const QUERYLINE: Item[] = [
  { to: "/queryline/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/queryline/datasets", label: "Datasets", icon: Database },
  { to: "/queryline/create-dataset", label: "Create dataset", icon: PackagePlus },
  { to: "/queryline/query-templates", label: "Query templates", icon: ListChecks },
  { to: "/queryline/request-query", label: "Request query", icon: Send },
  { to: "/queryline/results", label: "Results", icon: FileSearch },
  { to: "/queryline/audit", label: "Audit log", icon: Activity },
  { to: "/queryline/developer-console", label: "Developer console", icon: Terminal },
];

const SHARED: Item[] = [
  { to: "/docs", label: "Docs", icon: FileCode },
  { to: "/sdk", label: "SDK", icon: Code2 },
  { to: "/cli", label: "CLI", icon: Terminal },
  { to: "/mcp", label: "MCP", icon: Boxes },
  { to: "/agent-runbook", label: "Agent runbook", icon: PlayCircle },
  { to: "/status", label: "Status", icon: Activity },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppSidebar({ product }: { product: "vaultline" | "queryline" }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const items = product === "vaultline" ? VAULTLINE : QUERYLINE;
  const Icon = product === "vaultline" ? Vault : LockKeyhole;
  const accentClass = product === "vaultline" ? "text-vault" : "text-query";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2 px-2 py-2 min-w-0">
          <LineStackLogo size={32} className="shrink-0" />
          <span className="font-semibold tracking-tight whitespace-nowrap group-data-[collapsible=icon]:hidden">
            Clearance402
          </span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="flex items-center gap-2">
            <Icon className={`size-3.5 ${accentClass}`} />
            {product === "vaultline" ? "Vaultline" : "Queryline"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((it) => (
                <SidebarMenuItem key={it.to}>
                  <SidebarMenuButton asChild isActive={pathname === it.to}>
                    <Link to={it.to}>
                      <it.icon className="size-4" />
                      <span>{it.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Switch product</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/vaultline")}>
                  <Link to="/vaultline/dashboard">
                    <Vault className="size-4" /> <span>Vaultline</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/queryline")}>
                  <Link to="/queryline/dashboard">
                    <LockKeyhole className="size-4" /> <span>Queryline</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Platform</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SHARED.map((it) => (
                <SidebarMenuItem key={it.to}>
                  <SidebarMenuButton asChild isActive={pathname === it.to}>
                    <Link to={it.to}>
                      <it.icon className="size-4" />
                      <span>{it.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <ConnectionFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
