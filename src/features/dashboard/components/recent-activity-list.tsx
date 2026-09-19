import { ClipboardList, PackageCheck, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { useLookups } from "@/hooks/use-lookup";
import { formatRelativeTime } from "@/lib/format";
import type { ActivityEntityType, RecentActivity } from "@/types/domain";

const ENTITY_ICON: Record<ActivityEntityType, typeof ClipboardList> = {
  PURCHASE_REQUEST: ClipboardList,
  PURCHASE_ORDER: ShoppingCart,
  GOODS_RECEIPT: PackageCheck,
};

export function RecentActivityList({ activities }: { activities: RecentActivity[] }) {
  const { getWarehouseName } = useLookups();

  if (activities.length === 0) {
    return (
      <EmptyState
        title="No recent activity yet"
        description="Once purchase requests, orders, or receipts happen, they'll show up here."
      />
    );
  }

  return (
    <ul className="divide-y divide-slate-100">
      {activities.map((activity) => {
        const Icon = ENTITY_ICON[activity.entityType];
        return (
          <li key={activity.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
            <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500">
              <Icon className="size-4" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">{activity.referenceNumber}</p>
              <p className="truncate text-sm text-slate-500">{activity.description}</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {getWarehouseName(activity.warehouseId)} · {formatRelativeTime(activity.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
