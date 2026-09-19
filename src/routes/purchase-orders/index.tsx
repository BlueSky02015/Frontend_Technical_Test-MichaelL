import { createFileRoute } from "@tanstack/react-router";
import { PurchaseOrderListPage } from "@/features/purchase-orders/purchase-order-list-page";

export const Route = createFileRoute("/purchase-orders/")({
  component: PurchaseOrderListPage,
});
