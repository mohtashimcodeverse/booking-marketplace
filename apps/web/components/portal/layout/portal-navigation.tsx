import type { ReactNode } from "react";
import {
  Building2,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  LayoutDashboard,
  MessageSquare,
  Settings2,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";

export type PortalRole = "vendor" | "admin" | "customer";

export type PortalNavItem = {
  href: string;
  label: string;
  icon?: ReactNode;
  group?: string;
};

export function roleLabel(role?: PortalRole): string {
  if (role === "admin") return "Admin Portal";
  if (role === "vendor") return "Vendor Portal";
  if (role === "customer") return "Customer Portal";
  return "Portal";
}

export function getRoleNav(role?: PortalRole): PortalNavItem[] {
  if (role === "vendor") {
    return [
      { href: "/vendor", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, group: "Workspace" },
      { href: "/vendor/properties", label: "Properties", icon: <Building2 className="h-4 w-4" />, group: "Workspace" },
      { href: "/vendor/bookings", label: "Bookings", icon: <ClipboardCheck className="h-4 w-4" />, group: "Operations" },
      { href: "/vendor/calendar", label: "Calendar", icon: <CalendarDays className="h-4 w-4" />, group: "Operations" },
      { href: "/vendor/block-requests", label: "Block Requests", icon: <CalendarDays className="h-4 w-4" />, group: "Operations" },
      { href: "/vendor/messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" />, group: "Operations" },
      { href: "/vendor/ops-tasks", label: "Ops Tasks", icon: <Wrench className="h-4 w-4" />, group: "Operations" },
      { href: "/vendor/maintenance", label: "Maintenance", icon: <Wrench className="h-4 w-4" />, group: "Operations" },
      { href: "/vendor/work-orders", label: "Work Orders", icon: <Wrench className="h-4 w-4" />, group: "Operations" },
      { href: "/vendor/statements", label: "Statements", icon: <CreditCard className="h-4 w-4" />, group: "Finance" },
    ];
  }

  if (role === "admin") {
    return [
      { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, group: "Workspace" },
      { href: "/admin/review-queue", label: "Review Queue", icon: <ShieldCheck className="h-4 w-4" />, group: "Workspace" },
      { href: "/admin/reviews", label: "Guest Reviews", icon: <ShieldCheck className="h-4 w-4" />, group: "Workspace" },
      { href: "/admin/vendors", label: "Vendors", icon: <Users className="h-4 w-4" />, group: "Workspace" },
      { href: "/admin/properties", label: "Properties", icon: <Building2 className="h-4 w-4" />, group: "Workspace" },
      { href: "/admin/properties/new", label: "Create Property", icon: <Settings2 className="h-4 w-4" />, group: "Workspace" },
      { href: "/admin/contact-submissions", label: "Contact Submissions", icon: <MessageSquare className="h-4 w-4" />, group: "Workspace" },
      { href: "/admin/bookings", label: "Bookings", icon: <ClipboardCheck className="h-4 w-4" />, group: "Operations" },
      { href: "/admin/calendar", label: "Calendar", icon: <CalendarDays className="h-4 w-4" />, group: "Operations" },
      { href: "/admin/block-requests", label: "Block Requests", icon: <CalendarDays className="h-4 w-4" />, group: "Operations" },
      { href: "/admin/messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" />, group: "Operations" },
      { href: "/admin/ops-tasks", label: "Ops Tasks", icon: <Wrench className="h-4 w-4" />, group: "Operations" },
      { href: "/admin/properties/deletion-requests", label: "Deletion Requests", icon: <Wrench className="h-4 w-4" />, group: "Operations" },
      { href: "/admin/properties/unpublish-requests", label: "Unpublish Requests", icon: <Wrench className="h-4 w-4" />, group: "Operations" },
      { href: "/admin/payments", label: "Payments", icon: <CreditCard className="h-4 w-4" />, group: "Finance" },
      { href: "/admin/refunds", label: "Refunds", icon: <CreditCard className="h-4 w-4" />, group: "Finance" },
      { href: "/admin/customer-documents", label: "Guest Documents", icon: <ShieldCheck className="h-4 w-4" />, group: "Operations" },
      { href: "/admin/statements", label: "Statements", icon: <CreditCard className="h-4 w-4" />, group: "Finance" },
      { href: "/admin/payouts", label: "Payouts", icon: <CreditCard className="h-4 w-4" />, group: "Finance" },
    ];
  }

  if (role === "customer") {
    return [
      { href: "/account", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, group: "Account" },
      { href: "/account/bookings", label: "Bookings", icon: <ClipboardCheck className="h-4 w-4" />, group: "Account" },
      { href: "/account/documents", label: "Documents", icon: <ShieldCheck className="h-4 w-4" />, group: "Account" },
      { href: "/account/calendar", label: "Calendar", icon: <CalendarDays className="h-4 w-4" />, group: "Account" },
      { href: "/account/messages", label: "Messages", icon: <MessageSquare className="h-4 w-4" />, group: "Account" },
      { href: "/account/refunds", label: "Refunds", icon: <CreditCard className="h-4 w-4" />, group: "Account" },
    ];
  }

  return [];
}

export function groupNav(items: PortalNavItem[]): Array<{ group: string; items: PortalNavItem[] }> {
  const map = new Map<string, PortalNavItem[]>();
  for (const item of items) {
    const group = (item.group ?? "General").trim() || "General";
    const current = map.get(group) ?? [];
    current.push(item);
    map.set(group, current);
  }
  return Array.from(map.entries()).map(([group, groupedItems]) => ({ group, items: groupedItems }));
}
