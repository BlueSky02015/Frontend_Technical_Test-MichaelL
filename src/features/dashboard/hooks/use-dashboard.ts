import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/api/repositories";
import { queryKeys } from "@/lib/query-keys";

export function useDashboardSummary() {
  return useQuery({
    queryKey: queryKeys.dashboard.summary,
    queryFn: () => repositories.dashboard.getSummary(),
  });
}

export function useRecentActivity() {
  return useQuery({
    queryKey: queryKeys.dashboard.recentActivity,
    queryFn: () => repositories.dashboard.getRecentActivity(),
  });
}
