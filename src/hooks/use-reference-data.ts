import { useQuery } from "@tanstack/react-query";
import { repositories } from "@/api/repositories";
import { queryKeys } from "@/lib/query-keys";

export function useWarehouses() {
  return useQuery({
    queryKey: queryKeys.warehouses,
    queryFn: () => repositories.warehouses.list(),
    staleTime: Infinity, // reference data rarely changes
  });
}

export function useProducts() {
  return useQuery({
    queryKey: queryKeys.products,
    queryFn: () => repositories.products.list(),
    staleTime: Infinity,
  });
}
