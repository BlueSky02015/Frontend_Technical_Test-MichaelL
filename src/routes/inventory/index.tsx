import { createFileRoute } from "@tanstack/react-router";
import { InventoryListPage } from "@/features/inventory/inventory-list-page";

export const Route = createFileRoute("/inventory/")({
  component: InventoryListPage,
});
