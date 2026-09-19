import { createFileRoute } from "@tanstack/react-router";
import { PurchaseRequestCreatePage } from "@/features/purchase-requests/purchase-request-create-page";

export const Route = createFileRoute("/purchase-requests/new")({
  component: PurchaseRequestCreatePage,
});
