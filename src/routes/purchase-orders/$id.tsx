import { createFileRoute } from "@tanstack/react-router";
import { PurchaseOrderDetailPage } from "@/features/purchase-orders/purchase-order-detail-page";

export const Route = createFileRoute("/purchase-orders/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <PurchaseOrderDetailPage id={id} />;
}
