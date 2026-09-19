import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { FilePlus2, ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { SearchInput } from "@/components/shared/search-input";
import { EmptyState } from "@/components/shared/empty-state";
import { ErrorState } from "@/components/shared/error-state";
import { TableSkeleton } from "@/components/shared/skeleton";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePurchaseRequests } from "@/features/purchase-requests/hooks/use-purchase-requests";
import { purchaseRequestPermissions } from "@/features/purchase-requests/permissions";
import { useLookups } from "@/hooks/use-lookup";
import { useSession } from "@/context/session-context";
import { formatDate } from "@/lib/format";
import type { PurchaseRequestStatus } from "@/types/domain";

const STATUS_OPTIONS: Array<{ value: PurchaseRequestStatus | "ALL"; label: string }> = [
  { value: "ALL", label: "All statuses" },
  { value: "DRAFT", label: "Draft" },
  { value: "SUBMITTED", label: "Submitted" },
  { value: "APPROVED", label: "Approved" },
  { value: "REJECTED", label: "Rejected" },
];

export function PurchaseRequestListPage() {
  const { role } = useSession();
  const { data, isLoading, isError, error, refetch } = usePurchaseRequests();
  const { getWarehouseName } = useLookups();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PurchaseRequestStatus | "ALL">("ALL");

  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((pr) => {
      const matchesStatus = statusFilter === "ALL" || pr.status === statusFilter;
      const query = search.trim().toLowerCase();
      const matchesSearch =
        query.length === 0 ||
        pr.requestNumber.toLowerCase().includes(query) ||
        pr.requestedBy.toLowerCase().includes(query) ||
        getWarehouseName(pr.warehouseId).toLowerCase().includes(query);
      return matchesStatus && matchesSearch;
    });
  }, [data, search, statusFilter, getWarehouseName]);

  return (
    <div>
      <PageHeader
        title="Purchase Requests"
        description="Requests raised by warehouse staff for stock replenishment."
        actions={
          purchaseRequestPermissions.canCreate(role) ? (
            <Button asChild>
              <Link to="/purchase-requests/new">
                <FilePlus2 />
                New Request
              </Link>
            </Button>
          ) : undefined
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by request number, warehouse, or requester..."
          className="sm:max-w-sm"
        />
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}>
          <SelectTrigger className="sm:w-48">
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
          title="Failed to load Purchase Requests"
          description={error?.message}
          onRetry={() => refetch()}
        />
      ) : filtered.length === 0 ? (
        data && data.length === 0 ? (
          <EmptyState
            icon={ClipboardList}
            title="No Purchase Requests yet"
            description="Create your first purchase request to start requesting stock."
            action={
              purchaseRequestPermissions.canCreate(role) ? (
                <Button asChild size="sm">
                  <Link to="/purchase-requests/new">
                    <FilePlus2 />
                    New Request
                  </Link>
                </Button>
              ) : undefined
            }
          />
        ) : (
          <EmptyState
            icon={ClipboardList}
            title="No matching requests"
            description="Try a different search term or status filter."
          />
        )
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Request Number</TableHead>
                  <TableHead>Warehouse</TableHead>
                  <TableHead>Requested By</TableHead>
                  <TableHead>Total Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created At</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((pr) => (
                  <TableRow key={pr.id}>
                    <TableCell className="font-medium text-slate-900">
                      <Link
                        to="/purchase-requests/$id"
                        params={{ id: pr.id }}
                        className="hover:underline focus-visible:underline"
                      >
                        {pr.requestNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{getWarehouseName(pr.warehouseId)}</TableCell>
                    <TableCell>{pr.requestedBy}</TableCell>
                    <TableCell>{pr.items.length} Items</TableCell>
                    <TableCell>
                      <StatusBadge status={pr.status} />
                    </TableCell>
                    <TableCell>{formatDate(pr.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile cards */}
          <ul className="space-y-3 md:hidden">
            {filtered.map((pr) => (
              <li key={pr.id}>
                <Link
                  to="/purchase-requests/$id"
                  params={{ id: pr.id }}
                  className="block rounded-lg border border-slate-200 bg-white p-4 shadow-sm active:bg-slate-50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-slate-900">{pr.requestNumber}</span>
                    <StatusBadge status={pr.status} />
                  </div>
                  <dl className="mt-2 space-y-1 text-sm text-slate-500">
                    <div className="flex justify-between">
                      <dt>Warehouse</dt>
                      <dd className="text-slate-700">{getWarehouseName(pr.warehouseId)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Requested By</dt>
                      <dd className="text-slate-700">{pr.requestedBy}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Items</dt>
                      <dd className="text-slate-700">{pr.items.length} Items</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt>Created</dt>
                      <dd className="text-slate-700">{formatDate(pr.createdAt)}</dd>
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
