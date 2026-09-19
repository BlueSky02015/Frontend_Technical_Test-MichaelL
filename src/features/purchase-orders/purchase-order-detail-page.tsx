import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, PackageCheck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { ErrorState } from "@/components/shared/error-state";
import { EmptyState } from "@/components/shared/empty-state";
import { StatusBadge } from "@/components/shared/status-badge";
import { Skeleton } from "@/components/shared/skeleton";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { usePurchaseOrder } from "@/features/purchase-orders/hooks/use-purchase-orders";
import { GoodsReceiptDialog } from "@/features/purchase-orders/components/goods-receipt-dialog";
import { ReceivingProgress } from "@/features/purchase-orders/components/receiving-progress";
import { canReceiveGoods, getOrderTotals, getRemainingQuantity } from "@/lib/purchase-order-rules";
import { useLookups } from "@/hooks/use-lookup";
import { useSession } from "@/context/session-context";
import { formatDateTime, formatNumber } from "@/lib/format";

export function PurchaseOrderDetailPage({ id }: { id: string }) {
  const navigate = useNavigate();
  const { role } = useSession();
  const { getWarehouseName, getProduct } = useLookups();
  const [receiptOpen, setReceiptOpen] = useState(false);

  const { data: order, isLoading, isError, error, refetch } = usePurchaseOrder(id);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorState
        title="Failed to load Purchase Order"
        description={error?.message}
        onRetry={() => refetch()}
      />
    );
  }

  if (!order) {
    return (
      <EmptyState
        title="Purchase Order not found"
        description="It may have been removed, or the link is incorrect."
        action={
          <Button size="sm" variant="secondary" onClick={() => navigate({ to: "/purchase-orders" })}>
            Back to list
          </Button>
        }
      />
    );
  }

  const totals = getOrderTotals(order);
  // Goods Receipt is a USER responsibility per the requirement doc.
  const canReceive = role === "USER" && canReceiveGoods(order.status);

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        to="/purchase-orders"
        className="mb-3 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800"
      >
        <ArrowLeft className="size-4" />
        Back to Purchase Orders
      </Link>

      <PageHeader
        title={order.poNumber}
        actions={
          canReceive ? (
            <Button onClick={() => setReceiptOpen(true)}>
              <PackageCheck />
              Receive Goods
            </Button>
          ) : undefined
        }
      />

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Field label="Status">
            <StatusBadge status={order.status} />
          </Field>
          <Field label="Supplier" value={order.supplier} />
          <Field label="Warehouse" value={getWarehouseName(order.warehouseId)} />
          <Field label="Created At" value={formatDateTime(order.createdAt)} />
        </div>

        <div className="mt-4">
          <ReceivingProgress ordered={totals.ordered} received={totals.received} />
        </div>

        <Separator className="my-5" />

        <h2 className="mb-3 text-sm font-semibold text-slate-900">Items</h2>

        {/* Desktop table */}
        <div className="hidden sm:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Ordered</TableHead>
                <TableHead>Received</TableHead>
                <TableHead>Remaining</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => {
                const product = getProduct(item.productId);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium text-slate-900">
                      {product?.name ?? "Unknown product"}
                      <span className="ml-2 text-xs font-normal text-slate-400">{product?.sku}</span>
                    </TableCell>
                    <TableCell>{formatNumber(item.orderedQuantity)}</TableCell>
                    <TableCell>{formatNumber(item.receivedQuantity)}</TableCell>
                    <TableCell>{formatNumber(getRemainingQuantity(item))}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>

        {/* Mobile cards */}
        <ul className="space-y-3 sm:hidden">
          {order.items.map((item) => {
            const product = getProduct(item.productId);
            return (
              <li key={item.id} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-medium text-slate-900">{product?.name ?? "Unknown product"}</p>
                <p className="text-xs text-slate-500">SKU: {product?.sku ?? "-"}</p>
                <dl className="mt-2 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <dt className="text-slate-400">Ordered</dt>
                    <dd className="font-medium text-slate-700">{formatNumber(item.orderedQuantity)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Received</dt>
                    <dd className="font-medium text-slate-700">{formatNumber(item.receivedQuantity)}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-400">Remaining</dt>
                    <dd className="font-medium text-slate-700">{formatNumber(getRemainingQuantity(item))}</dd>
                  </div>
                </dl>
              </li>
            );
          })}
        </ul>
      </div>

      <GoodsReceiptDialog order={order} open={receiptOpen} onOpenChange={setReceiptOpen} />
    </div>
  );
}

function Field({ label, value, children }: { label: string; value?: string; children?: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <div className="mt-1 text-sm font-medium text-slate-900">{children ?? value}</div>
    </div>
  );
}
