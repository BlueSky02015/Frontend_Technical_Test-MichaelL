import { AlertCircle, ClipboardList, PackageCheck, ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { CardSkeleton, Skeleton } from "@/components/shared/skeleton";
import { ErrorState } from "@/components/shared/error-state";
import { SummaryCard } from "@/features/dashboard/components/summary-card";
import { RecentActivityList } from "@/features/dashboard/components/recent-activity-list";
import { useDashboardSummary, useRecentActivity } from "@/features/dashboard/hooks/use-dashboard";

export function DashboardPage() {
  const summaryQuery = useDashboardSummary();
  const activityQuery = useRecentActivity();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="A quick overview of your procurement pipeline."
      />

      {summaryQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : summaryQuery.isError || !summaryQuery.data ? (
        <ErrorState
          title="Failed to load summary"
          description={summaryQuery.error?.message}
          onRetry={() => summaryQuery.refetch()}
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Purchase Requests"
            value={summaryQuery.data.totalPurchaseRequests}
            icon={ClipboardList}
            tone="brand"
          />
          <SummaryCard
            label="Waiting Approval"
            value={summaryQuery.data.waitingApproval}
            icon={AlertCircle}
            tone="amber"
          />
          <SummaryCard
            label="Active Purchase Orders"
            value={summaryQuery.data.activePurchaseOrders}
            icon={ShoppingCart}
            tone="sky"
          />
          <SummaryCard
            label="Partially Received"
            value={summaryQuery.data.partiallyReceivedOrders}
            icon={PackageCheck}
            tone="emerald"
          />
        </div>
      )}

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
    </div>
  );
}
