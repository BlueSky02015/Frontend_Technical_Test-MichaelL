import { useMemo } from "react";
import { useProducts, useWarehouses } from "@/hooks/use-reference-data";

/**
 * Resolves ids -> display entities for warehouses and products.
 * Centralised so every table/detail page renders the same fallback
 * ("Unknown warehouse") instead of duplicating that logic everywhere.
 */
export function useLookups() {
  const warehouses = useWarehouses();
  const products = useProducts();

  const warehouseById = useMemo(() => {
    const map = new Map(warehouses.data?.map((w) => [w.id, w]));
    return map;
  }, [warehouses.data]);

  const productById = useMemo(() => {
    const map = new Map(products.data?.map((p) => [p.id, p]));
    return map;
  }, [products.data]);

  return {
    isLoading: warehouses.isLoading || products.isLoading,
    getWarehouseName: (id: string) => warehouseById.get(id)?.name ?? "Unknown warehouse",
    getProduct: (id: string) => productById.get(id),
    warehouses: warehouses.data ?? [],
    products: products.data ?? [],
  };
}
