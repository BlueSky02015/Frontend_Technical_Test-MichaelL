import type { PurchaseOrder, PurchaseOrderItem, PurchaseOrderStatus } from "@/types/domain";

/**
 * Derives the receiving status of a PO purely from its line items.
 * Centralised here so the mock repository and any UI preview logic
 * (e.g. "what will the status become after this receipt?") stay in sync.
 */
export function deriveReceivingStatus(
  items: PurchaseOrderItem[],
  currentStatus: PurchaseOrderStatus,
): PurchaseOrderStatus {
  // Terminal / not-yet-ordered statuses are never auto-derived.
  if (currentStatus === "DRAFT" || currentStatus === "CANCELLED") {
    return currentStatus;
  }

  const totalOrdered = items.reduce((sum, item) => sum + item.orderedQuantity, 0);
  const totalReceived = items.reduce((sum, item) => sum + item.receivedQuantity, 0);

  if (totalReceived <= 0) return "ORDERED";
  if (totalReceived >= totalOrdered) return "RECEIVED";
  return "PARTIALLY_RECEIVED";
}

export function getRemainingQuantity(item: PurchaseOrderItem): number {
  return Math.max(item.orderedQuantity - item.receivedQuantity, 0);
}

export function getOrderTotals(order: PurchaseOrder) {
  const ordered = order.items.reduce((sum, item) => sum + item.orderedQuantity, 0);
  const received = order.items.reduce((sum, item) => sum + item.receivedQuantity, 0);
  return { ordered, received, remaining: Math.max(ordered - received, 0) };
}

export function canReceiveGoods(status: PurchaseOrderStatus): boolean {
  return status === "ORDERED" || status === "PARTIALLY_RECEIVED";
}
