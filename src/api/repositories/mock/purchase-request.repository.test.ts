import { beforeEach, describe, expect, it } from "vitest";
import { resetDb } from "@/api/mock-db";
import { MockPurchaseRequestRepository } from "@/api/repositories/mock/purchase-request.repository";
import { MockPurchaseOrderRepository } from "@/api/repositories/mock/purchase-order.repository";

describe("MockPurchaseRequestRepository", () => {
  const repo = new MockPurchaseRequestRepository();

  beforeEach(() => {
    resetDb();
  });

  it("creates a new request as DRAFT", async () => {
    const created = await repo.create(
      { warehouseId: "wh-1", items: [{ productId: "prod-1", quantity: 10 }] },
      "Jane Doe",
    );

    expect(created.status).toBe("DRAFT");
    expect(created.requestedBy).toBe("Jane Doe");
    expect(created.items).toHaveLength(1);
  });

  it("rejects creating a request without items", async () => {
    await expect(
      repo.create({ warehouseId: "wh-1", items: [] }, "Jane Doe"),
    ).rejects.toThrow(/at least one product/i);
  });

  it("only allows submitting a request that is currently DRAFT", async () => {
    const created = await repo.create(
      { warehouseId: "wh-1", items: [{ productId: "prod-1", quantity: 10 }] },
      "Jane Doe",
    );
    const submitted = await repo.submit(created.id);
    expect(submitted.status).toBe("SUBMITTED");

    await expect(repo.submit(created.id)).rejects.toThrow(/only draft requests/i);
  });

  it("approving a SUBMITTED request creates a corresponding Purchase Order", async () => {
    const created = await repo.create(
      { warehouseId: "wh-1", items: [{ productId: "prod-1", quantity: 50 }] },
      "Jane Doe",
    );
    await repo.submit(created.id);
    const approved = await repo.approve(created.id);

    expect(approved.status).toBe("APPROVED");

    const orderRepo = new MockPurchaseOrderRepository();
    const orders = await orderRepo.list();
    const relatedOrder = orders.find((po) => po.purchaseRequestId === created.id);

    expect(relatedOrder).toBeDefined();
    expect(relatedOrder?.status).toBe("ORDERED");
    expect(relatedOrder?.items[0]).toMatchObject({ productId: "prod-1", orderedQuantity: 50 });
  });

  it("cannot approve a request that has not been submitted", async () => {
    const created = await repo.create(
      { warehouseId: "wh-1", items: [{ productId: "prod-1", quantity: 10 }] },
      "Jane Doe",
    );
    await expect(repo.approve(created.id)).rejects.toThrow(/only submitted requests/i);
  });

  it("requires a rejection reason when rejecting a request", async () => {
    const created = await repo.create(
      { warehouseId: "wh-1", items: [{ productId: "prod-1", quantity: 10 }] },
      "Jane Doe",
    );
    await repo.submit(created.id);

    await expect(repo.reject(created.id, "")).rejects.toThrow(/rejection reason is required/i);

    const rejected = await repo.reject(created.id, "Out of budget for this quarter.");
    expect(rejected.status).toBe("REJECTED");
    expect(rejected.rejectionReason).toBe("Out of budget for this quarter.");
  });
});
