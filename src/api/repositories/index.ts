import { MockDashboardRepository } from "@/api/repositories/mock/dashboard.repository";
import { MockInventoryRepository } from "@/api/repositories/mock/inventory.repository";
import { MockPurchaseOrderRepository } from "@/api/repositories/mock/purchase-order.repository";
import { MockPurchaseRequestRepository } from "@/api/repositories/mock/purchase-request.repository";
import { MockProductRepository, MockWarehouseRepository } from "@/api/repositories/mock/reference-data.repository";

/**
 * Single composition point for the data layer.
 *
 * Every hook/feature imports repositories from here, never from a
 * concrete `Mock*Repository` class directly. When a real backend is
 * ready, add `Http*Repository` classes that implement the same
 * interfaces from `./types` and swap the instantiation below — nothing
 * else in the codebase needs to change.
 */
export const repositories = {
  warehouses: new MockWarehouseRepository(),
  products: new MockProductRepository(),
  purchaseRequests: new MockPurchaseRequestRepository(),
  purchaseOrders: new MockPurchaseOrderRepository(),
  inventory: new MockInventoryRepository(),
  dashboard: new MockDashboardRepository(),
};

export * from "@/api/repositories/types";
