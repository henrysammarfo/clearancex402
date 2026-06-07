import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  Boxes,
  Code2,
  CreditCard,
  FileCode,
  KeyRound,
  LayoutDashboard,
  Network,
  PackagePlus,
  Send,
  Settings as SettingsIcon,
  ShieldCheck,
  Sparkles,
  Terminal,
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

const CONSOLE: Item[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/tools", label: "Tool registry", icon: Boxes },
  { to: "/tool-onboarding", label: "Onboard tool", icon: PackagePlus },
  { to: "/agent-clearance", label: "Agent clearance", icon: ShieldCheck },
  { to: "/audit", label: "Audit log", icon: Activity },
];

const LABS: Item[] = [
  { to: "/payment-lab", label: "Payment lab", icon: CreditCard },
  { to: "/venice-eval", label: "Venice eval", icon: Sparkles },
  { to: "/a2a-lab", label: "A2A lab", icon: Network },
  { to: "/permissions", label: "Permissions", icon: KeyRound },
  { to: "/relayer", label: "Relayer", icon: Send },
];

const DEV: Item[] = [
  { to: "/docs", label: "Docs", icon: FileCode },
  { to: "/sdk", label: "SDK", icon: Code2 },
  { to: "/cli", label: "CLI", icon: Terminal },
  { to: "/mcp", label: "MCP", icon: Boxes },
  { to: "/agent-demo", label: "Agent demo", icon: Sparkles },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

function Group({ label, items, pathname }: { label: string; items: Item[]; pathname: string }) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
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
  );
}

export function ConsoleSidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
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
        <Group label="Console" items={CONSOLE} pathname={pathname} />
        <Group label="Labs" items={LABS} pathname={pathname} />
        <Group label="Developers" items={DEV} pathname={pathname} />
      </SidebarContent>
      <SidebarFooter>
        <ConnectionFooter />
      </SidebarFooter>
    </Sidebar>
  );
}
