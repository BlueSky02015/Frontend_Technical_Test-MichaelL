import type { LucideIcon } from "lucide-react";
import { LayoutDashboard, ClipboardList, ShoppingCart, Boxes } from "lucide-react";

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", to: "/", icon: LayoutDashboard },
  { label: "Purchase Requests", to: "/purchase-requests", icon: ClipboardList },
  { label: "Purchase Orders", to: "/purchase-orders", icon: ShoppingCart },
  { label: "Inventory", to: "/inventory", icon: Boxes },
];
