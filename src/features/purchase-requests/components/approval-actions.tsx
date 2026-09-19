import { useState } from "react";
import { toast } from "sonner";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FormField } from "@/components/shared/form-field";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  useApprovePurchaseRequest,
  useRejectPurchaseRequest,
} from "@/features/purchase-requests/hooks/use-purchase-requests";
import type { PurchaseRequest } from "@/types/domain";

export function ApprovalActions({ request }: { request: PurchaseRequest }) {
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [reasonTouched, setReasonTouched] = useState(false);

  const approveMutation = useApprovePurchaseRequest();
  const rejectMutation = useRejectPurchaseRequest();

  const reasonError = reasonTouched && !reason.trim() ? "Rejection reason is required." : undefined;

  const handleApprove = () => {
    approveMutation.mutate(request.id, {
      onSuccess: () => {
        toast.success(`${request.requestNumber} approved`, {
          description: "A purchase order has been created for this request.",
        });
        setApproveOpen(false);
      },
      onError: (error) => toast.error("Failed to approve request", { description: error.message }),
    });
  };

  const handleReject = () => {
    setReasonTouched(true);
    if (!reason.trim()) return;
    rejectMutation.mutate(
      { id: request.id, reason },
      {
        onSuccess: () => {
          toast.success(`${request.requestNumber} rejected`);
          setRejectOpen(false);
          setReason("");
          setReasonTouched(false);
        },
        onError: (error) => toast.error("Failed to reject request", { description: error.message }),
      },
    );
  };

  return (
    <>
      <div className="flex gap-2">
        <Button variant="destructive" onClick={() => setRejectOpen(true)}>
          <X />
          Reject
        </Button>
        <Button onClick={() => setApproveOpen(true)}>
          <Check />
          Approve
        </Button>
      </div>

      <ConfirmDialog
        open={approveOpen}
        onOpenChange={setApproveOpen}
        title={`Approve ${request.requestNumber}?`}
        description="This will approve the request and automatically create a purchase order for the listed items."
        confirmLabel="Approve"
        isConfirming={approveMutation.isPending}
        onConfirm={handleApprove}
      />

      <ConfirmDialog
        open={rejectOpen}
        onOpenChange={(open) => {
          setRejectOpen(open);
          if (!open) {
            setReason("");
            setReasonTouched(false);
          }
        }}
        title={`Reject ${request.requestNumber}?`}
        description="Let the requester know why this request is being rejected."
        confirmLabel="Reject Request"
        confirmVariant="destructive"
        isConfirming={rejectMutation.isPending}
        onConfirm={handleReject}
        confirmDisabled={Boolean(reasonError)}
      >
        <FormField label="Rejection Reason" htmlFor="rejection-reason" required error={reasonError}>
          <Textarea
            id="rejection-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            onBlur={() => setReasonTouched(true)}
            placeholder="e.g. Budget for this quarter has already been allocated."
            aria-invalid={Boolean(reasonError)}
            rows={3}
          />
        </FormField>
      </ConfirmDialog>
    </>
  );
}
