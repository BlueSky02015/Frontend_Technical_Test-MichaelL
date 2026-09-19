import type {
  DashboardSummary,
  GoodsReceiptInput,
  InventoryItem,
  InventoryMovement,
  Product,
  PurchaseOrder,
  PurchaseRequest,
  PurchaseRequestInput,
  RecentActivity,
  Warehouse,
} from "@/types/domain";

/**
 * Repository contracts.
 *
 * Every feature talks to these interfaces only — never to `mock-db.ts`
 * directly. That is what makes it possible to swap the mock
 * implementation (`MockXRepository`) for a real HTTP implementation
 * (`HttpXRepository`) later without touching hooks, components, or
 * pages. See `api/repositories/index.ts` for the composition point.
 */

export interface WarehouseRepository {
  list(): Promise<Warehouse[]>;
}

export interface ProductRepository {
  list(): Promise<Product[]>;
}

export interface PurchaseRequestRepository {
  list(): Promise<PurchaseRequest[]>;
  getById(id: string): Promise<PurchaseRequest | undefined>;
  create(input: PurchaseRequestInput, requestedBy: string): Promise<PurchaseRequest>;
  update(id: string, input: PurchaseRequestInput): Promise<PurchaseRequest>;
  submit(id: string): Promise<PurchaseRequest>;
  approve(id: string): Promise<PurchaseRequest>;
  reject(id: string, reason: string): Promise<PurchaseRequest>;
}

export interface PurchaseOrderRepository {
  list(): Promise<PurchaseOrder[]>;
  getById(id: string): Promise<PurchaseOrder | undefined>;
  receiveGoods(input: GoodsReceiptInput): Promise<PurchaseOrder>;
}

export interface InventoryRepository {
  list(): Promise<InventoryItem[]>;
  listMovements(productId: string, warehouseId: string): Promise<InventoryMovement[]>;
}

export interface DashboardRepository {
  getSummary(): Promise<DashboardSummary>;
  getRecentActivity(): Promise<RecentActivity[]>;
}
