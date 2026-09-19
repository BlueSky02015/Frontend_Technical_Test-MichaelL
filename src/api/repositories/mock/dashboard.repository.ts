import { db } from "@/api/mock-db";
import { simulateNetwork } from "@/api/http/simulated-network";
import type { DashboardRepository } from "@/api/repositories/types";
import type { RecentActivity } from "@/types/domain";

export class MockDashboardRepository implements DashboardRepository {
  getSummary() {
    return simulateNetwork(() => ({
      totalPurchaseRequests: db.purchaseRequests.length,
      waitingApproval: db.purchaseRequests.filter((pr) => pr.status === "SUBMITTED").length,
      activePurchaseOrders: db.purchaseOrders.filter(
        (po) => po.status === "ORDERED" || po.status === "PARTIALLY_RECEIVED",
      ).length,
      partiallyReceivedOrders: db.purchaseOrders.filter((po) => po.status === "PARTIALLY_RECEIVED")
        .length,
    }));
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
        const order = db.purchaseOrders.find((po) => po.id === gr.purchaseOrderId);
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
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
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
