import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Send } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Skeleton } from "@/components/shared/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  usePurchaseRequest,
  useSubmitPurchaseRequest,
  useUpdatePurchaseRequest,
} from "@/features/purchase-requests/hooks/use-purchase-requests";
import { usePurchaseOrders } from "@/features/purchase-orders/hooks/use-purchase-orders";
import { purchaseRequestPermissions } from "@/features/purchase-requests/permissions";
import { ApprovalActions } from "@/features/purchase-requests/components/approval-actions";
import { PurchaseRequestItemsList } from "@/features/purchase-requests/components/purchase-request-items-list";
import { PurchaseRequestForm } from "@/features/purchase-requests/components/purchase-request-form";
import { useSession } from "@/context/session-context";
import { useLookups } from "@/hooks/use-lookup";
import { formatDateTime } from "@/lib/format";
import type { PurchaseRequestFormValues } from "@/features/purchase-requests/schema";

export function PurchaseRequestDetailPage({ id }: { id: string }) {
  const navigate = useNavigate();
  const { role } = useSession();
  const { getWarehouseName } = useLookups();
  const [isEditing, setIsEditing] = useState(false);
  const [submitOpen, setSubmitOpen] = useState(false);

  const { data: request, isLoading, isError, error, refetch } = usePurchaseRequest(id);
  const { data: relatedOrders } = usePurchaseOrders();
  const updateMutation = useUpdatePurchaseRequest(id);
  const submitMutation = useSubmitPurchaseRequest();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load Purchase Request"
        description={error?.message}
        onRetry={() => refetch()}
      />
    );
  }

  if (!request) {
    return (
      <EmptyState
        title="Purchase Request not found"
        description="It may have been removed, or the link is incorrect."
        action={
          <Button size="sm" variant="secondary" onClick={() => navigate({ to: "/purchase-requests" })}>
            Back to list
          </Button>
        }
      />
    );
  }

  const canEdit = purchaseRequestPermissions.canEdit(role, request.status);
  const canSubmit = purchaseRequestPermissions.canSubmit(role, request.status);
  const canApprove = purchaseRequestPermissions.canApprove(role, request.status);
  const canReject = purchaseRequestPermissions.canReject(role, request.status);
  const resultingOrders = relatedOrders?.filter((po) => po.purchaseRequestId === request.id) ?? [];

  const handleUpdate = (values: PurchaseRequestFormValues) => {
    updateMutation.mutate(
      { warehouseId: values.warehouseId, items: values.items },
      {
        onSuccess: () => {
          toast.success("Purchase request updated");
          setIsEditing(false);
        },
        onError: (err) => toast.error("Failed to update request", { description: err.message }),
      },
    );
  };

  const handleSubmitForApproval = () => {
    submitMutation.mutate(request.id, {
      onSuccess: () => {
        toast.success(`${request.requestNumber} submitted for approval`);
        setSubmitOpen(false);
      },
      onError: (err) => toast.error("Failed to submit request", { description: err.message }),
    });
  };

  if (isEditing) {
    return (
      <div className="mx-auto max-w-2xl">
        <PageHeader title={`Edit ${request.requestNumber}`} />
        <PurchaseRequestForm
          defaultValues={request}
          onSubmit={handleUpdate}
          onCancel={() => setIsEditing(false)}
          isSubmitting={updateMutation.isPending}
          submitLabel="Save Changes"
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <Link
        to="/purchase-requests"
        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="size-4" />
        Back to Purchase Requests
      </Link>

      <PageHeader
        title={request.requestNumber}
        actions={
          <div className="flex gap-2">
            {canEdit && (
              <Button variant="secondary" onClick={() => setIsEditing(true)}>
                <Pencil />
                Edit
              </Button>
            )}
            {canSubmit && (
              <Button onClick={() => setSubmitOpen(true)}>
                <Send />
                Submit for Approval
              </Button>
            )}
            {(canApprove || canReject) && <ApprovalActions request={request} />}
          </div>
        }
      />

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Status">
            <StatusBadge status={request.status} />
          </Field>
          <Field label="Warehouse" value={getWarehouseName(request.warehouseId)} />
          <Field label="Requested By" value={request.requestedBy} />
          <Field label="Created Date" value={formatDateTime(request.createdAt)} />
        </div>

        {request.status === "REJECTED" && request.rejectionReason && (
          <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <span className="font-medium">Rejection reason: </span>
            {request.rejectionReason}
          </div>
        )}

        <Separator className="my-5" />

        <h2 className="mb-2 text-sm font-semibold text-slate-900">
          Items <span className="font-normal text-slate-400">({request.items.length})</span>
        </h2>
        <PurchaseRequestItemsList items={request.items} />
      </div>

      {resultingOrders.length > 0 && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Resulting Purchase Order</h2>
          <ul className="space-y-2">
            {resultingOrders.map((po) => (
              <li key={po.id}>
                <Link
                  to="/purchase-orders/$id"
                  params={{ id: po.id }}
                  className="flex items-center justify-between rounded-md border border-slate-100 p-3 text-sm hover:bg-slate-50"
                >
                  <span className="font-medium text-brand-700">{po.poNumber}</span>
                  <StatusBadge status={po.status} />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}

      <ConfirmDialog
        open={submitOpen}
        onOpenChange={setSubmitOpen}
        title={`Submit ${request.requestNumber} for approval?`}
        description="Once submitted, you won't be able to edit this request unless it's rejected."
        confirmLabel="Submit"
        isConfirming={submitMutation.isPending}
        onConfirm={handleSubmitForApproval}
      />
    </div>
  );
}

function Field({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-900">{children ?? value}</div>
    </div>
  );
}
