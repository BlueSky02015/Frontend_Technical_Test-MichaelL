/**
 * Domain models for the Inventory Procurement application.
 *
 * These types represent the business entities as they would come back
 * from a real backend. UI-only concerns (form state, view state, etc.)
 * are intentionally kept OUT of this file — see `features/*` for those.
 */

export type UserRole = "USER" | "APPROVER";

export interface AppUser {
  id: string;
  name: string;
  role: UserRole;
}

export interface Warehouse {
  id: string;
  name: string;
  code: string;
  city: string;
}

export type UnitOfMeasure = "PCS" | "BOX" | "UNIT" | "LITER" | "PACK";

export interface Product {
  id: string;
  sku: string;
  name: string;
  unit: UnitOfMeasure;
  imageUrl?: string;
}

/* ---------------------------------- Purchase Request ---------------------------------- */

export type PurchaseRequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED";

export interface PurchaseRequestItem {
  id: string;
  productId: string;
  quantity: number;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  warehouseId: string;
  requestedBy: string;
  status: PurchaseRequestStatus;
  items: PurchaseRequestItem[];
  createdAt: string;
  updatedAt: string;
  rejectionReason?: string;
}

/** Payload shape for creating/editing a Purchase Request (UI -> API). */
export interface PurchaseRequestInput {
  warehouseId: string;
  items: Array<{ productId: string; quantity: number }>;
}

/* ---------------------------------- Purchase Order ---------------------------------- */

export type PurchaseOrderStatus =
  | "DRAFT"
  | "ORDERED"
  | "PARTIALLY_RECEIVED"
  | "RECEIVED"
  | "CANCELLED";

export interface PurchaseOrderItem {
  id: string;
  productId: string;
  orderedQuantity: number;
  receivedQuantity: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  purchaseRequestId: string;
  supplier: string;
  warehouseId: string;
  status: PurchaseOrderStatus;
  items: PurchaseOrderItem[];
  createdAt: string;
  updatedAt: string;
}

/* ---------------------------------- Goods Receipt ---------------------------------- */

export interface GoodsReceiptLine {
  productId: string;
  receivedQuantity: number;
}

export interface GoodsReceipt {
  id: string;
  receiptNumber: string;
  purchaseOrderId: string;
  lines: GoodsReceiptLine[];
  createdAt: string;
}

export interface GoodsReceiptInput {
  purchaseOrderId: string;
  lines: GoodsReceiptLine[];
}

/* ---------------------------------- Inventory ---------------------------------- */

export interface InventoryItem {
  id: string;
  productId: string;
  warehouseId: string;
  quantity: number;
}

export type InventoryMovementType = "PURCHASE_RECEIPT" | "ADJUSTMENT";

export interface InventoryMovement {
  id: string;
  productId: string;
  warehouseId: string;
  type: InventoryMovementType;
  quantityChange: number;
  referenceNumber: string;
  createdAt: string;
}

/* ---------------------------------- Dashboard ---------------------------------- */

export interface DashboardSummary {
  totalPurchaseRequests: number;
  waitingApproval: number;
  activePurchaseOrders: number;
  partiallyReceivedOrders: number;
  totalItems: number;
  activeItems: number;
  lowStockItems: number;
  unconfirmedItems: number;
  allItemGroups: number;
  totalStockInHand: number;
  quantityToReceive: number;
  topSellingItems: ProductWithStats[];
}

export type ActivityEntityType = "PURCHASE_REQUEST" | "PURCHASE_ORDER" | "GOODS_RECEIPT";

export interface RecentActivity {
  id: string;
  entityType: ActivityEntityType;
  referenceNumber: string;
  description: string;
  warehouseId: string;
  createdAt: string;
}

export interface ProductWithStats extends Product {
  totalStock: number;
  totalReceived: number;
}