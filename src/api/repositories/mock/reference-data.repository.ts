import { db } from "@/api/mock-db";
import { simulateNetwork } from "@/api/http/simulated-network";
import type { ProductRepository, WarehouseRepository } from "@/api/repositories/types";

export class MockWarehouseRepository implements WarehouseRepository {
  list() {
    return simulateNetwork(() => [...db.warehouses]);
  }
}

export class MockProductRepository implements ProductRepository {
  list() {
    return simulateNetwork(() => [...db.products]);
  }
}
