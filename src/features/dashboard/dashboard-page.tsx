import { StatusMetrics, metricIcons } from "./components/StatusMetrics";
import { Skeleton } from "@/components/shared/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { InventorySummary } from "./components/InventorySummary";
import { ProductDetails } from "./components/ProductDetails";
import { TopSellingItems } from "./components/TopSellingItems";
import { RecentActivityList } from "./components/recent-activity-list";
import { useDashboardSummary, useRecentActivity } from "./hooks/use-dashboard";


export function DashboardPage() {
  const { data: summary, isLoading } = useDashboardSummary();
  const activityQuery = useRecentActivity();

  return (
    <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
      {/* Row 1: Sales Activity + Inventory Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-gray-800">
            Sales Activity
          </h2>
          <StatusMetrics
            metrics={[
              {
                label: "TO BE PACKED",
                value: summary?.activePurchaseOrders ?? 0,
                unit: "Orders",
                color: "text-blue-600",
                icon: metricIcons.packed,
              },
              {
                label: "TO BE SHIPPED",
                value: summary?.partiallyReceivedOrders ?? 0,
                unit: "Orders",
                color: "text-red-500",
                icon: metricIcons.shipped,
              },
              {
                label: "TO BE DELIVERED",
                value: summary?.waitingApproval ?? 0,
                unit: "Requests",
                color: "text-emerald-500",
                icon: metricIcons.delivered,
              },
              {
                label: "TO BE INVOICED",
                value: summary?.totalPurchaseRequests ?? 0,
                unit: "Requests",
                color: "text-blue-500",
                icon: metricIcons.invoiced,
              },
            ]}
          />
        </div>
        <div className="lg:col-span-1">
          <InventorySummary
            inHand={summary?.totalStockInHand ?? 0}
            toReceive={summary?.quantityToReceive ?? 0}
          />
        </div>
      </div>

      {/* Row 2: Product Details + Top Selling */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProductDetails
          lowStock={summary?.lowStockItems ?? 0}
          allItemGroups={summary?.allItemGroups ?? 0}
          totalItems={summary?.totalItems ?? 0}
          activeItems={summary?.activeItems ?? 0}
          unconfirmedItems={summary?.unconfirmedItems ?? 0}
        />
        <TopSellingItems
          items={summary?.topSellingItems ?? []}
          loading={isLoading}
        />
      </div>
       <div className="mt-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="mb-4 text-sm font-semibold text-slate-900">Recent Activity</h2>
        {activityQuery.isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : activityQuery.isError || !activityQuery.data ? (
          <ErrorState
            title="Failed to load recent activity"
            description={activityQuery.error?.message}
            onRetry={() => activityQuery.refetch()}
          />
        ) : (
          <RecentActivityList activities={activityQuery.data} />
        )}
      </div>
    </main>
  );
}