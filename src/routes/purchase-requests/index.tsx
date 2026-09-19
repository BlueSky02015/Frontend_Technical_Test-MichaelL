import { createFileRoute } from "@tanstack/react-router";
import { PurchaseRequestListPage } from "@/features/purchase-requests/purchase-request-list-page";

export const Route = createFileRoute("/purchase-requests/")({
  component: PurchaseRequestListPage,
});
