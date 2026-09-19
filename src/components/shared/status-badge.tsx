import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { PurchaseOrderStatus, PurchaseRequestStatus } from "@/types/domain";

type AnyStatus = PurchaseRequestStatus | PurchaseOrderStatus;

const STATUS_CONFIG: Record<AnyStatus, { label: string; variant: BadgeProps["variant"] }> = {
  DRAFT: { label: "Draft", variant: "neutral" },
  SUBMITTED: { label: "Submitted", variant: "info" },
  APPROVED: { label: "Approved", variant: "success" },
  REJECTED: { label: "Rejected", variant: "danger" },
  ORDERED: { label: "Ordered", variant: "info" },
  PARTIALLY_RECEIVED: { label: "Partially Received", variant: "warning" },
  RECEIVED: { label: "Received", variant: "success" },
  CANCELLED: { label: "Cancelled", variant: "danger" },
};

export function StatusBadge({ status, className }: { status: AnyStatus; className?: string }) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant={config.variant} className={className}>
      <span className="size-1.5 rounded-full bg-current opacity-70" aria-hidden="true" />
      {config.label}
    </Badge>
  );
}
