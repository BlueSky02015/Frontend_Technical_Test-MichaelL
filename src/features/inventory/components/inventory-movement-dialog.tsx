import { ArrowUpRight, History } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/shared/skeleton";
import { useInventoryMovements } from "@/features/inventory/hooks/use-inventory";
import { formatDateTime, formatNumber } from "@/lib/format";
import type { InventoryItem, Product } from "@/types/domain";

interface InventoryMovementDialogProps {
  item: InventoryItem | null;
  product?: Product;
  warehouseName: string;
  onOpenChange: (open: boolean) => void;
}

export function InventoryMovementDialog({
  item,
  product,
  warehouseName,
  onOpenChange,
}: InventoryMovementDialogProps) {
  const open = Boolean(item);
  const { data, isLoading } = useInventoryMovements(
    item?.productId ?? "",
    item?.warehouseId ?? "",
    open,
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="size-4.5 text-brand-600" />
            {product?.name ?? "Movement History"}
          </DialogTitle>
          <DialogDescription>
            {warehouseName} · Current stock: {item ? formatNumber(item.quantity) : "-"} {product?.unit}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : !data || data.length === 0 ? (
          <EmptyState title="No movements yet" description="Stock changes will appear here once goods are received." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {data.map((movement) => (
              <li key={movement.id} className="flex items-center justify-between gap-3 py-3">
                <div className="flex items-center gap-2">
                  <span className="flex size-7 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <ArrowUpRight className="size-3.5" />
                  </span>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{movement.referenceNumber}</p>
                    <p className="text-xs text-slate-500">{movement.type.replace("_", " ")}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-emerald-600">
                    +{formatNumber(movement.quantityChange)}
                  </p>
                  <p className="text-xs text-slate-400">{formatDateTime(movement.createdAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </DialogContent>
    </Dialog>
  );
}
