import { useLookups } from "@/hooks/use-lookup";
import { formatQuantity } from "@/lib/format";
import type { PurchaseRequestItem } from "@/types/domain";

export function PurchaseRequestItemsList({ items }: { items: PurchaseRequestItem[] }) {
  const { getProduct } = useLookups();

  return (
    <ul className="divide-y divide-slate-100">
      {items.map((item) => {
        const product = getProduct(item.productId);
        return (
          <li key={item.id} className="flex items-center justify-between gap-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-900">
                {product?.name ?? "Unknown product"}
              </p>
              <p className="text-xs text-slate-500">SKU: {product?.sku ?? "-"}</p>
            </div>
            <p className="shrink-0 text-sm font-medium text-slate-700">
              {formatQuantity(item.quantity, product?.unit ?? "")}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
