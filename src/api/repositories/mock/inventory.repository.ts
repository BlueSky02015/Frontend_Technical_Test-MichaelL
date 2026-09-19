import { db } from "@/api/mock-db";
import { simulateNetwork } from "@/api/http/simulated-network";
import type { InventoryRepository } from "@/api/repositories/types";

export class MockInventoryRepository implements InventoryRepository {
  list() {
    return simulateNetwork(() => [...db.inventory]);
  }

  listMovements(productId: string, warehouseId: string) {
    return simulateNetwork(() =>
      db.movements
        .filter((m) => m.productId === productId && m.warehouseId === warehouseId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    );
  }
}
