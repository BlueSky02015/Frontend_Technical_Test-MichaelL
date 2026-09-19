import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingCart } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePurchaseOrders } from "@/features/purchase-orders/hooks/use-purchase-orders";
import { getOrderTotals } from "@/lib/purchase-order-rules";
import { useLookups } from "@/hooks/use-lookup";
import { formatDate } from "@/lib/format";
import type { PurchaseOrderStatus } from "@/types/domain";

const STATUS_OPTIONS: Array<{ value: PurchaseOrderStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "ORDERED", label: "Ordered" },
  { value: "PARTIALLY_RECEIVED", label: "Partially Received" },
  { value: "RECEIVED", label: "Received" },
  { value: "CANCELLED", label: "Cancelled" },
];

export function PurchaseOrderListPage() {
  const { data, isLoading, isError, error, refetch } = usePurchaseOrders();
  const { getWarehouseName } = useLookups();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PurchaseOrderStatus | "ALL">("ALL");

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((po) => {
      const matchesStatus = statusFilter === "ALL" || po.status === statusFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        po.poNumber.toLowerCase().includes(query) ||
        po.supplier.toLowerCase().includes(query) ||
        getWarehouseName(po.warehouseId).toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [data, search, statusFilter, getWarehouseName]);

  return (
    <div>
      <PageHeader
        title="Purchase Orders"
        description="Orders placed with suppliers once a request has been approved."
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by PO number, supplier, or warehouse..."
          className="sm:max-w-sm"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="sm:w-52">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <TableSkeleton />
      ) : isError ? (
        <ErrorState
          title="Failed to load Purchase Orders"
          description={error?.message}
          onRetry={() => refetch()}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShoppingCart}
          title={data && data.length === 0 ? "No Purchase Orders yet" : "No matching orders"}
          description={
            data && data.length === 0
              ? "Purchase orders are created automatically once a request is approved."
              : "Try a different search term or status filter."
          }
        />
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Total Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((po) => {
                  const totals = getOrderTotals(po);
                  return (
                    <TableRow key={po.id}>
                      <TableCell className="font-medium text-slate-900">
                        <Link
                          to="/purchase-orders/$id"
                          params={{ id: po.id }}
                          className="hover:underline focus-visible:underline"
                        >
                          {po.poNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{po.supplier}</TableCell>
                      <TableCell>{getWarehouseName(po.warehouseId)}</TableCell>
                      <TableCell>
                        {po.items.length} Items
                        <span className="ml-1 text-xs text-slate-400">
                          ({totals.received}/{totals.ordered})
                        </span>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={po.status} />
                      </TableCell>
                      <TableCell>{formatDate(po.createdAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <ul className="space-y-3 md:hidden">
            {filtered.map((po) => (
              <li key={po.id}>
                <Link
                  to="/purchase-orders/$id"
                  params={{ id: po.id }}
                  className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm active:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-slate-900">{po.poNumber}</span>
                    <StatusBadge status={po.status} />
                  </div>
                  <dl className="mt-2 space-y-1 text-sm text-slate-500">
                    <div className="flex justify-between">
                      <dt>Supplier</dt>
                      <dd className="text-slate-700">{po.supplier}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Warehouse</dt>
                      <dd className="text-slate-700">{getWarehouseName(po.warehouseId)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Created</dt>
                      <dd className="text-slate-700">{formatDate(po.createdAt)}</dd>
                    </div>
                  </dl>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
