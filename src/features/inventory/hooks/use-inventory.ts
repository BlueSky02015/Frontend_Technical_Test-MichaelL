import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/api/repositories";
import { queryKeys } from "@/lib/query-keys";

export function useInventory() {
  return useQuery({
    queryKey: queryKeys.inventory.all,
    queryFn: () => repositories.inventory.list(),
  });
}

export function useInventoryMovements(productId: string, warehouseId: string, enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.inventory.movements(productId, warehouseId),
    queryFn: () => repositories.inventory.listMovements(productId, warehouseId),
    enabled,
  });
}
