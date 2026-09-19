import { beforeEach, describe, expect, it } from "vitest";
import { db, resetDb } from "@/api/mock-db";
import { MockPurchaseOrderRepository } from "@/api/repositories/mock/purchase-order.repository";

describe("MockPurchaseOrderRepository.receiveGoods", () => {
  const repo = new MockPurchaseOrderRepository();

  beforeEach(() => {
    resetDb();
  });

  it("cannot receive more than the remaining quantity", async () => {
    // po-1 / prod-3 (Safety Helmet): ordered 40, received 15 -> remaining 25
    await expect(
      repo.receiveGoods({
        purchaseOrderId: "po-1",
        lines: [{ productId: "prod-3", receivedQuantity: 30 }],
      }),
    ).rejects.toThrow(/cannot exceed the remaining 25/i);
  });

  it("rejects a receive quantity of 0 or less on every line", async () => {
    await expect(
      repo.receiveGoods({
        purchaseOrderId: "po-1",
        lines: [{ productId: "prod-3", receivedQuantity: 0 }],
      }),
    ).rejects.toThrow(/enter a receive quantity/i);
  });

  it("a successful receipt updates received/remaining quantities and inventory", async () => {
    const beforeInventory = db.inventory.find(
      (row) => row.productId === "prod-3" && row.warehouseId === "wh-1",
    );
    const stockBefore = beforeInventory?.quantity ?? 0;

    const updated = await repo.receiveGoods({
      purchaseOrderId: "po-1",
      lines: [{ productId: "prod-3", receivedQuantity: 20 }],
    });

    const item = updated.items.find((it) => it.productId === "prod-3");
    expect(item?.receivedQuantity).toBe(35); // 15 already received + 20 now

    const afterInventory = db.inventory.find(
      (row) => row.productId === "prod-3" && row.warehouseId === "wh-1",
    );
    expect(afterInventory?.quantity).toBe(stockBefore + 20);
  });

  it("moves an ORDERED PO to PARTIALLY_RECEIVED, then to RECEIVED once fully received", async () => {
    // po-2 / prod-4 (A4 Paper Ream): ordered 100, received 0, status ORDERED
    const partial = await repo.receiveGoods({
      purchaseOrderId: "po-2",
      lines: [{ productId: "prod-4", receivedQuantity: 40 }],
    });
    expect(partial.status).toBe("PARTIALLY_RECEIVED");

    const full = await repo.receiveGoods({
      purchaseOrderId: "po-2",
      lines: [{ productId: "prod-4", receivedQuantity: 60 }],
    });
    expect(full.status).toBe("RECEIVED");
    expect(full.items[0].receivedQuantity).toBe(100);
  });

  it("cannot receive goods against a CANCELLED purchase order", async () => {
    await expect(
      repo.receiveGoods({
        purchaseOrderId: "po-4",
        lines: [{ productId: "prod-5", receivedQuantity: 5 }],
      }),
    ).rejects.toThrow(/ordered or partially_received/i);
  });
});
