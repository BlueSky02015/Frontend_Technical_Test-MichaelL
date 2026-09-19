import { db } from "@/api/mock-db";
import { simulateNetwork } from "@/api/http/simulated-network";
import { ApiError } from "@/types/api";
import { deriveReceivingStatus, canReceiveGoods, getRemainingQuantity } from "@/lib/purchase-order-rules";
import type { GoodsReceiptInput, PurchaseOrder } from "@/types/domain";
import type { PurchaseOrderRepository } from "@/api/repositories/types";

function findOrThrow(id: string): PurchaseOrder {
  const order = db.purchaseOrders.find((po) => po.id === id);
  if (!order) {
    throw new ApiError(`Purchase Order ${id} was not found.`, 404, "NOT_FOUND");
  }
  return order;
}

function applyInventoryEffects(order: PurchaseOrder, receiptNumber: string, lines: GoodsReceiptInput["lines"]) {
  for (const line of lines) {
    if (line.receivedQuantity <= 0) continue;

    let inventoryRow = db.inventory.find(
      (row) => row.productId === line.productId && row.warehouseId === order.warehouseId,
    );
    if (!inventoryRow) {
      inventoryRow = {
        id: `inv-${crypto.randomUUID()}`,
        productId: line.productId,
        warehouseId: order.warehouseId,
        quantity: 0,
      };
      db.inventory.push(inventoryRow);
    }
    inventoryRow.quantity += line.receivedQuantity;

    db.movements.unshift({
      id: `mov-${crypto.randomUUID()}`,
      productId: line.productId,
      warehouseId: order.warehouseId,
      type: "PURCHASE_RECEIPT",
      quantityChange: line.receivedQuantity,
      referenceNumber: receiptNumber,
      createdAt: new Date().toISOString(),
    });
  }
}

export class MockPurchaseOrderRepository implements PurchaseOrderRepository {
  list() {
    return simulateNetwork(() =>
      [...db.purchaseOrders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  }

  getById(id: string) {
    return simulateNetwork(() => db.purchaseOrders.find((po) => po.id === id));
  }

  receiveGoods(input: GoodsReceiptInput) {
    return simulateNetwork(() => {
      const order = findOrThrow(input.purchaseOrderId);

      if (!canReceiveGoods(order.status)) {
        throw new ApiError(
          "Goods can only be received against an ORDERED or PARTIALLY_RECEIVED order.",
          409,
          "INVALID_STATUS",
        );
      }

      const meaningfulLines = input.lines.filter((line) => line.receivedQuantity > 0);
      if (meaningfulLines.length === 0) {
        throw new ApiError("Enter a receive quantity for at least one product.", 422, "VALIDATION_ERROR");
      }

      for (const line of meaningfulLines) {
        const item = order.items.find((it) => it.productId === line.productId);
        if (!item) {
          throw new ApiError("Product does not belong to this purchase order.", 422, "VALIDATION_ERROR");
        }
        const remaining = getRemainingQuantity(item);
        if (line.receivedQuantity > remaining) {
          throw new ApiError(
            `Receive quantity for this product cannot exceed the remaining ${remaining}.`,
            422,
            "VALIDATION_ERROR",
          );
        }
      }

      const receiptNumber = db.nextReceiptNumber();

      for (const line of meaningfulLines) {
        const item = order.items.find((it) => it.productId === line.productId)!;
        item.receivedQuantity += line.receivedQuantity;
      }

      db.goodsReceipts.unshift({
        id: `gr-${crypto.randomUUID()}`,
        receiptNumber,
        purchaseOrderId: order.id,
        lines: meaningfulLines,
        createdAt: new Date().toISOString(),
      });

      applyInventoryEffects(order, receiptNumber, meaningfulLines);

      order.status = deriveReceivingStatus(order.items, order.status);
      order.updatedAt = new Date().toISOString();

      return order;
    });
  }
}
