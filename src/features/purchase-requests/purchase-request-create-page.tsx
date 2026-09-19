import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageHeader } from "@/components/shared/page-header";
import { PurchaseRequestForm } from "@/features/purchase-requests/components/purchase-request-form";
import { useCreatePurchaseRequest } from "@/features/purchase-requests/hooks/use-purchase-requests";
import type { PurchaseRequestFormValues } from "@/features/purchase-requests/schema";

export function PurchaseRequestCreatePage() {
  const navigate = useNavigate();
  const createMutation = useCreatePurchaseRequest();

  const handleSubmit = (values: PurchaseRequestFormValues) => {
    createMutation.mutate(
      { warehouseId: values.warehouseId, items: values.items },
      {
        onSuccess: (created) => {
          toast.success("Purchase request saved as draft", {
            description: `${created.requestNumber} is ready to be submitted for approval.`,
          });
          navigate({ to: "/purchase-requests/$id", params: { id: created.id } });
        },
        onError: (error) => {
          toast.error("Failed to save purchase request", { description: error.message });
        },
      },
    );
  };

  return (
    <div className="mx-auto max-w-2xl">
      <PageHeader
        title="New Purchase Request"
        description="Add the products and quantities you need. You can submit it for approval afterwards."
      />
      <PurchaseRequestForm
        onSubmit={handleSubmit}
        onCancel={() => navigate({ to: "/purchase-requests" })}
        isSubmitting={createMutation.isPending}
        submitLabel="Save as Draft"
      />
    </div>
  );
}
