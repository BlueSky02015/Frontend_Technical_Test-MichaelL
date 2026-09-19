import { db } from "@/api/mock-db";
import { simulateNetwork } from "@/api/http/simulated-network";
import type {DashboardRepository} from "@/api/repositories/types";
import type { DashboardSummary, ProductWithStats } from "@/types/domain";
import type { RecentActivity } from "@/types/domain";
const LOW_STOCK_THRESHOLD = 20;

export class MockDashboardRepository implements DashboardRepository {
  getSummary(): Promise<DashboardSummary> {
    return simulateNetwork(() => {
      const {
        products,
        inventory,
        purchaseRequests,
        purchaseOrders,
        movements,
      } = db;

      const productsWithStats: ProductWithStats[] = products.map((product) => {
        const totalStock = inventory
          .filter((inv) => inv.productId === product.id)
          .reduce((sum, inv) => sum + inv.quantity, 0);

        const totalReceived = movements
          .filter(
            (m) => m.productId === product.id && m.type === "PURCHASE_RECEIPT"
          )
          .reduce((sum, m) => sum + m.quantityChange, 0);

        return { ...product, totalStock, totalReceived };
      });

      const totalItems = productsWithStats.length;
      const activeItems = productsWithStats.filter(
        (p) => p.totalStock > 0
      ).length;
      const lowStockItems = productsWithStats.filter(
        (p) => p.totalStock > 0 && p.totalStock < LOW_STOCK_THRESHOLD
      ).length;
      const unconfirmedItems = purchaseRequests.filter(
        (pr) => pr.status === "DRAFT"
      ).length;

      const itemGroups = new Set(
        products.map((p) => p.sku.split("-")[0] || "OTHER")
      );
      const allItemGroups = itemGroups.size;

      const totalStockInHand = productsWithStats.reduce(
        (sum, p) => sum + p.totalStock,
        0
      );

      const quantityToReceive = purchaseOrders
        .filter(
          (po) =>
            po.status === "ORDERED" || po.status === "PARTIALLY_RECEIVED"
        )
        .flatMap((po) => po.items)
        .reduce(
          (sum, item) => sum + (item.orderedQuantity - item.receivedQuantity),
          0
        );

      const topSellingItems = [...productsWithStats]
        .sort((a, b) => {
          if (b.totalReceived !== a.totalReceived) {
            return b.totalReceived - a.totalReceived;
          }
          return b.totalStock - a.totalStock;
        })
        .slice(0, 3);

      return {
   
        totalPurchaseRequests: purchaseRequests.length,
        waitingApproval: purchaseRequests.filter(
          (pr) => pr.status === "SUBMITTED"
        ).length,
        activePurchaseOrders: purchaseOrders.filter(
          (po) =>
            po.status === "ORDERED" || po.status === "PARTIALLY_RECEIVED"
        ).length,
        partiallyReceivedOrders: purchaseOrders.filter(
          (po) => po.status === "PARTIALLY_RECEIVED"
        ).length,

        totalItems,
        activeItems,
        lowStockItems,
        unconfirmedItems,
        allItemGroups,
        totalStockInHand,
        quantityToReceive,
        topSellingItems,
      };
    });
  }

  getRecentActivity() {
    return simulateNetwork(() => {
      const activities: RecentActivity[] = [];

      for (const pr of db.purchaseRequests) {
        activities.push({
          id: `activity-pr-${pr.id}`,
          entityType: "PURCHASE_REQUEST",
          referenceNumber: pr.requestNumber,
          description: describePrActivity(pr.status),
          warehouseId: pr.warehouseId,
          createdAt: pr.updatedAt,
        });
      }

      for (const po of db.purchaseOrders) {
        activities.push({
          id: `activity-po-${po.id}`,
          entityType: "PURCHASE_ORDER",
          referenceNumber: po.poNumber,
          description: describePoActivity(po.status),
          warehouseId: po.warehouseId,
          createdAt: po.updatedAt,
        });
      }

      for (const gr of db.goodsReceipts) {
        const order = db.purchaseOrders.find(
          (po) => po.id === gr.purchaseOrderId
        );
        activities.push({
          id: `activity-gr-${gr.id}`,
          entityType: "GOODS_RECEIPT",
          referenceNumber: gr.receiptNumber,
          description: "Goods receipt recorded",
          warehouseId: order?.warehouseId ?? "",
          createdAt: gr.createdAt,
        });
      }

      return activities
        .sort(
          (a, b) =>
            new Date(b.createdAt).getTime() -
            new Date(a.createdAt).getTime()
        )
        .slice(0, 8);
    });
  }
}

function describePrActivity(status: string): string {
  switch (status) {
    case "DRAFT":
      return "Purchase request drafted";
    case "SUBMITTED":
      return "Purchase request submitted for approval";
    case "APPROVED":
      return "Purchase request approved";
    case "REJECTED":
      return "Purchase request rejected";
    default:
      return "Purchase request updated";
  }
}

function describePoActivity(status: string): string {
  switch (status) {
    case "ORDERED":
      return "Purchase order placed";
    case "PARTIALLY_RECEIVED":
      return "Purchase order partially received";
    case "RECEIVED":
      return "Purchase order fully received";
    case "CANCELLED":
      return "Purchase order cancelled";
    default:
      return "Purchase order updated";
  }
}