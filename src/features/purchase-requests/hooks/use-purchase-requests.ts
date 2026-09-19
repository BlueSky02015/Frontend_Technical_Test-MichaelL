import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { repositories } from "@/api/repositories";
import { queryKeys } from "@/lib/query-keys";
import { useSession } from "@/context/session-context";
import type { PurchaseRequestInput } from "@/types/domain";

export function usePurchaseRequests() {
  return useQuery({
    queryKey: queryKeys.purchaseRequests.all,
    queryFn: () => repositories.purchaseRequests.list(),
  });
}

export function usePurchaseRequest(id: string) {
  return useQuery({
    queryKey: queryKeys.purchaseRequests.detail(id),
    queryFn: () => repositories.purchaseRequests.getById(id),
    enabled: Boolean(id),
  });
}

function useInvalidatePurchaseRequests() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.purchaseRequests.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.summary });
    queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.recentActivity });
  };
}

export function useCreatePurchaseRequest() {
  const invalidate = useInvalidatePurchaseRequests();
  const { user } = useSession();
  return useMutation({
    mutationFn: (input: PurchaseRequestInput) => repositories.purchaseRequests.create(input, user.name),
    onSuccess: invalidate,
  });
}

export function useUpdatePurchaseRequest(id: string) {
  const invalidate = useInvalidatePurchaseRequests();
  return useMutation({
    mutationFn: (input: PurchaseRequestInput) => repositories.purchaseRequests.update(id, input),
    onSuccess: invalidate,
  });
}

export function useSubmitPurchaseRequest() {
  const invalidate = useInvalidatePurchaseRequests();
  return useMutation({
    mutationFn: (id: string) => repositories.purchaseRequests.submit(id),
    onSuccess: invalidate,
  });
}

export function useApprovePurchaseRequest() {
  const queryClient = useQueryClient();
  const invalidate = useInvalidatePurchaseRequests();
  return useMutation({
    mutationFn: (id: string) => repositories.purchaseRequests.approve(id),
    onSuccess: () => {
      invalidate();
      // Approving creates a Purchase Order, so that list needs refreshing too.
      queryClient.invalidateQueries({ queryKey: queryKeys.purchaseOrders.all });
    },
  });
}

export function useRejectPurchaseRequest() {
  const invalidate = useInvalidatePurchaseRequests();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      repositories.purchaseRequests.reject(id, reason),
    onSuccess: invalidate,
  });
}
