import { useMemo, useState } from "react";
import { Boxes } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useInventory } from "@/features/inventory/hooks/use-inventory";
import { InventoryMovementDialog } from "@/features/inventory/components/inventory-movement-dialog";
import { useLookups } from "@/hooks/use-lookup";
import { formatNumber } from "@/lib/format";
import type { InventoryItem } from "@/types/domain";

export function InventoryListPage() {
  const { data, isLoading, isError, error, refetch } = useInventory();
  const { getWarehouseName, getProduct, warehouses } = useLookups();
  const [search, setSearch] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((row) => {
      const matchesWarehouse = warehouseFilter === "ALL" || row.warehouseId === warehouseFilter;
      const product = getProduct(row.productId);
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        product?.name.toLowerCase().includes(query) ||
        product?.sku.toLowerCase().includes(query);
      return matchesWarehouse && matchesSearch;
    });
  }, [data, search, warehouseFilter, getProduct]);

  return (
    <div>
      <PageHeader title="Inventory" description="Current stock levels across all warehouses." />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by product name or SKU..."
          className="sm:max-w-sm"
        />
        <Select value={warehouseFilter} onValueChange={setWarehouseFilter}>
          <SelectTrigger className="sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All warehouses</SelectItem>
            {warehouses.map((wh) => (
              <SelectItem key={wh.id} value={wh.id}>
                {wh.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState title="Failed to load Inventory" description={error?.message} onRetry={() => refetch()} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title={data && data.length === 0 ? "No inventory recorded yet" : "No matching products"}
          description={
            data && data.length === 0
              ? "Stock will appear here once goods receipts are recorded."
              : "Try a different search term or warehouse filter."
          }
        />
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Current Stock</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((row) => {
                  const product = getProduct(row.productId);
                  return (
                    <TableRow
                      key={row.id}
                      clickable
                      onClick={() => setSelectedItem(row)}
                      tabIndex={0}
                      onKeyDown={(e) => e.key === "Enter" && setSelectedItem(row)}
                    >
                      <TableCell className="font-medium text-slate-900">
                        {product?.name ?? "Unknown product"}
                      </TableCell>
                      <TableCell>{product?.sku ?? "-"}</TableCell>
                      <TableCell>{getWarehouseName(row.warehouseId)}</TableCell>
                      <TableCell className="font-medium">{formatNumber(row.quantity)}</TableCell>
                      <TableCell>{product?.unit ?? "-"}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <ul className="space-y-3 md:hidden">
            {filtered.map((row) => {
              const product = getProduct(row.productId);
              return (
                <li key={row.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedItem(row)}
                    className="block w-full rounded-lg border border-slate-200 bg-white p-4 text-left shadow-sm active:bg-slate-50"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-medium text-slate-900">{product?.name ?? "Unknown product"}</span>
                      <span className="text-sm font-semibold text-slate-900">
                        {formatNumber(row.quantity)} {product?.unit}
                      </span>
                    </div>
                    <dl className="mt-2 space-y-1 text-sm text-slate-500">
                      <div className="flex justify-between">
                        <dt>SKU</dt>
                        <dd className="text-slate-700">{product?.sku ?? "-"}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt>Warehouse</dt>
                        <dd className="text-slate-700">{getWarehouseName(row.warehouseId)}</dd>
                      </div>
                    </dl>
                  </button>
                </li>
              );
            })}
          </ul>
        </>
      )}

      <InventoryMovementDialog
        item={selectedItem}
        product={selectedItem ? getProduct(selectedItem.productId) : undefined}
        warehouseName={selectedItem ? getWarehouseName(selectedItem.warehouseId) : ""}
        onOpenChange={(open) => !open && setSelectedItem(null)}
      />
    </div>
  );
}
