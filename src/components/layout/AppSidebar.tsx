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
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tools", label: "Tool registry", icon: Vault },
  { to: "/tool-onboarding", label: "Onboard tool", icon: PlusCircle },
  { to: "/agent-clearance", label: "Agent clearance", icon: UploadCloud },
  { to: "/audit", label: "Audit log", icon: Activity },
];

const QUERYLINE: Item[] = [
  { to: "/payment-lab", label: "Payment lab", icon: Database },
  { to: "/venice-eval", label: "Venice eval", icon: PackagePlus },
  { to: "/a2a-lab", label: "A2A lab", icon: ListChecks },
  { to: "/permissions", label: "Permissions", icon: Send },
  { to: "/relayer", label: "Relayer", icon: FileSearch },
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
            {product === "vaultline" ? "Console" : "Labs"}
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
                  <Link to="/dashboard">
                    <Vault className="size-4" /> <span>Console</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/queryline")}>
                  <Link to="/payment-lab">
                    <LockKeyhole className="size-4" /> <span>Labs</span>
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
