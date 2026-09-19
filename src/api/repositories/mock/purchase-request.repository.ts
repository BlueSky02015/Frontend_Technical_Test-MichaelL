import { db } from "@/api/mock-db";
import { simulateNetwork } from "@/api/http/simulated-network";
import { ApiError } from "@/types/api";
import type { PurchaseOrder, PurchaseRequest, PurchaseRequestInput } from "@/types/domain";
import type { PurchaseRequestRepository } from "@/api/repositories/types";

function findOrThrow(id: string): PurchaseRequest {
  const request = db.purchaseRequests.find((pr) => pr.id === id);
  if (!request) {
    throw new ApiError(`Purchase Request ${id} was not found.`, 404, "NOT_FOUND");
  }
  return request;
}

function validateInput(input: PurchaseRequestInput): void {
  if (!input.warehouseId) {
    throw new ApiError("Warehouse is required.", 422, "VALIDATION_ERROR");
  }
  if (input.items.length === 0) {
    throw new ApiError("At least one product is required.", 422, "VALIDATION_ERROR");
  }
  const seenProducts = new Set<string>();
  for (const item of input.items) {
    if (!item.productId) {
      throw new ApiError("Every item must have a product selected.", 422, "VALIDATION_ERROR");
    }
    if (item.quantity <= 0) {
      throw new ApiError("Quantity must be greater than 0.", 422, "VALIDATION_ERROR");
    }
    if (seenProducts.has(item.productId)) {
      throw new ApiError("A product has already been added to this request.", 422, "VALIDATION_ERROR");
    }
    seenProducts.add(item.productId);
  }
}

/**
 * Approving a Purchase Request is, in this domain, the moment a Purchase
 * Order gets created against a (mock) supplier. The technical test scope
 * does not include a manual "create PO" screen, so this is a documented
 * assumption — see README "Assumptions".
 */
function createPurchaseOrderFromRequest(request: PurchaseRequest): PurchaseOrder {
  const suppliers = ["PT Sinar Abadi Supplies", "CV Maju Bersama", "UD Cahaya Kimia"];
  const supplier = suppliers[Math.floor(Math.random() * suppliers.length)];

  const order: PurchaseOrder = {
    id: `po-${crypto.randomUUID()}`,
    poNumber: db.nextPoNumber(),
    purchaseRequestId: request.id,
    supplier,
    warehouseId: request.warehouseId,
    status: "ORDERED",
    items: request.items.map((item) => ({
      id: `poi-${crypto.randomUUID()}`,
      productId: item.productId,
      orderedQuantity: item.quantity,
      receivedQuantity: 0,
    })),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.purchaseOrders.push(order);
  return order;
}

export class MockPurchaseRequestRepository implements PurchaseRequestRepository {
  list() {
    return simulateNetwork(() =>
      [...db.purchaseRequests].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  }

  getById(id: string) {
    return simulateNetwork(() => db.purchaseRequests.find((pr) => pr.id === id));
  }

  create(input: PurchaseRequestInput, requestedBy: string) {
    return simulateNetwork(() => {
      validateInput(input);
      const now = new Date().toISOString();
      const request: PurchaseRequest = {
        id: `pr-${crypto.randomUUID()}`,
        requestNumber: db.nextRequestNumber(),
        warehouseId: input.warehouseId,
        requestedBy,
        status: "DRAFT",
        items: input.items.map((item) => ({
          id: `pri-${crypto.randomUUID()}`,
          productId: item.productId,
          quantity: item.quantity,
        })),
        createdAt: now,
        updatedAt: now,
      };
      db.purchaseRequests.unshift(request);
      return request;
    });
  }

  update(id: string, input: PurchaseRequestInput) {
    return simulateNetwork(() => {
      const request = findOrThrow(id);
      if (request.status !== "DRAFT") {
        throw new ApiError("Only DRAFT requests can be edited.", 409, "INVALID_STATUS");
      }
      validateInput(input);
      request.warehouseId = input.warehouseId;
      request.items = input.items.map((item) => ({
        id: `pri-${crypto.randomUUID()}`,
        productId: item.productId,
        quantity: item.quantity,
      }));
      request.updatedAt = new Date().toISOString();
      return request;
    });
  }

  submit(id: string) {
    return simulateNetwork(() => {
      const request = findOrThrow(id);
      if (request.status !== "DRAFT") {
        throw new ApiError("Only DRAFT requests can be submitted.", 409, "INVALID_STATUS");
      }
      request.status = "SUBMITTED";
      request.updatedAt = new Date().toISOString();
      return request;
    });
  }

  approve(id: string) {
    return simulateNetwork(() => {
      const request = findOrThrow(id);
      if (request.status !== "SUBMITTED") {
        throw new ApiError("Only SUBMITTED requests can be approved.", 409, "INVALID_STATUS");
      }
      request.status = "APPROVED";
      request.updatedAt = new Date().toISOString();
      createPurchaseOrderFromRequest(request);
      return request;
    });
  }

  reject(id: string, reason: string) {
    return simulateNetwork(() => {
      const request = findOrThrow(id);
      if (request.status !== "SUBMITTED") {
        throw new ApiError("Only SUBMITTED requests can be rejected.", 409, "INVALID_STATUS");
      }
      if (!reason || !reason.trim()) {
        throw new ApiError("Rejection reason is required.", 422, "VALIDATION_ERROR");
      }
      request.status = "REJECTED";
      request.rejectionReason = reason.trim();
      request.updatedAt = new Date().toISOString();
      return request;
    });
  }
}
