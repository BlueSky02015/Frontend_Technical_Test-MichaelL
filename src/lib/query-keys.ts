export const queryKeys = {
  warehouses: ["warehouses"] as const,
  products: ["products"] as const,
  purchaseRequests: {
    all: ["purchase-requests"] as const,
    detail: (id: string) => ["purchase-requests", id] as const,
  },
  purchaseOrders: {
    all: ["purchase-orders"] as const,
    detail: (id: string) => ["purchase-orders", id] as const,
  },
  inventory: {
    all: ["inventory"] as const,
    movements: (productId: string, warehouseId: string) =>
      ["inventory", "movements", productId, warehouseId] as const,
  },
  dashboard: {
    summary: ["dashboard", "summary"] as const,
    recentActivity: ["dashboard", "recent-activity"] as const,
  },
};
