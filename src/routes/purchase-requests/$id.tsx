import { createFileRoute } from "@tanstack/react-router";
import { PurchaseRequestDetailPage } from "@/features/purchase-requests/purchase-request-detail-page";

export const Route = createFileRoute("/purchase-requests/$id")({
  component: RouteComponent,
});

function RouteComponent() {
  const { id } = Route.useParams();
  return <PurchaseRequestDetailPage id={id} />;
}
