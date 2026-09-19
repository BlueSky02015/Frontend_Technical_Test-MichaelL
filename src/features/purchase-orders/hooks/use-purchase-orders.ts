import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/api/repositories";
import { queryKeys } from "@/lib/query-keys";
import type { GoodsReceiptInput } from "@/types/domain";

export function usePurchaseOrders() {
  return useQuery({
    queryKey: queryKeys.purchaseOrders.all,
    queryFn: () => repositories.purchaseOrders.list(),
  });
}

export function usePurchaseOrder(id: string) {
  return useQuery({
    queryKey: queryKeys.purchaseOrders.detail(id),
    queryFn: () => repositories.purchaseOrders.getById(id),
    enabled: Boolean(id),
  });
}

export function useReceiveGoods() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: GoodsReceiptInput) => repositories.purchaseOrders.receiveGoods(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.inventory.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.recentActivity });
    },
  });
}
