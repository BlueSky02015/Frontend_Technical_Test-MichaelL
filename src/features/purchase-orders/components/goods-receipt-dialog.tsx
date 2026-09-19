import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PackageCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FormField } from "@/components/shared/form-field";
import { useReceiveGoods } from "@/features/purchase-orders/hooks/use-purchase-orders";
import { getRemainingQuantity } from "@/lib/purchase-order-rules";
import { useLookups } from "@/hooks/use-lookup";
import { formatNumber } from "@/lib/format";
import type { PurchaseOrder } from "@/types/domain";

interface GoodsReceiptDialogProps {
  order: PurchaseOrder;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function buildSchema(order: PurchaseOrder) {
  const shape: Record<string, z.ZodTypeAny> = {};
  for (const item of order.items) {
    const remaining = getRemainingQuantity(item);
    shape[item.productId] = z.coerce
      .number()
      .int("Whole numbers only.")
      .min(0, "Cannot be negative.")
      .max(remaining, `Cannot exceed the remaining ${remaining}.`);
  }
  return z.object(shape).refine((values) => Object.values(values).some((v) => (v as number) > 0), {
    message: "Enter a receive quantity for at least one product.",
    path: ["_form"],
  });
}

export function GoodsReceiptDialog({ order, open, onOpenChange }: GoodsReceiptDialogProps) {
  const { getProduct } = useLookups();
  const receiveMutation = useReceiveGoods();
  const [resetKey, setResetKey] = useState(0);

  const schema = useMemo(() => buildSchema(order), [order]);
  type FormValues = Record<string, number>;

  const defaultValues = useMemo(
    () => Object.fromEntries(order.items.map((item) => [item.productId, 0])),
    [order],
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset, resetKey]);

  const onSubmit = (values: FormValues) => {
    const lines = order.items
      .map((item) => ({ productId: item.productId, receivedQuantity: Number(values[item.productId] ?? 0) }))
      .filter((line) => line.receivedQuantity > 0);

    receiveMutation.mutate(
      { purchaseOrderId: order.id, lines },
      {
        onSuccess: () => {
          toast.success("Goods receipt recorded", {
            description: `Inventory has been updated for ${order.poNumber}.`,
          });
          onOpenChange(false);
          setResetKey((k) => k + 1);
        },
        onError: (error) => toast.error("Failed to record goods receipt", { description: error.message }),
      },
    );
  };

  const formError = (errors as Record<string, { message?: string }>)._form?.message;

  return (
    <Dialog open={open} onOpenChange={(next) => !receiveMutation.isPending && onOpenChange(next)}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PackageCheck className="size-4.5 text-brand-600" />
            Record Goods Receipt
          </DialogTitle>
          <DialogDescription>
            {order.poNumber} · Enter how many units of each product arrived.
          </DialogDescription>
        </DialogHeader>

        <form id="goods-receipt-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <p className="rounded-md bg-red-50 px-3 py-2 text-xs font-medium text-red-600" role="alert">
              {formError}
            </p>
          )}
          {order.items.map((item) => {
            const product = getProduct(item.productId);
            const remaining = getRemainingQuantity(item);
            return (
              <div key={item.id} className="rounded-lg border border-slate-200 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{product?.name ?? "Unknown product"}</p>
                    <p className="text-xs text-slate-500">SKU: {product?.sku ?? "-"}</p>
                  </div>
                  {remaining === 0 && (
                    <span className="text-xs font-medium text-emerald-600">Fully received</span>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-slate-500">
                  <div>
                    <p className="text-slate-400">Ordered</p>
                    <p className="font-medium text-slate-700">{formatNumber(item.orderedQuantity)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Already Received</p>
                    <p className="font-medium text-slate-700">{formatNumber(item.receivedQuantity)}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Remaining</p>
                    <p className="font-medium text-slate-700">{formatNumber(remaining)}</p>
                  </div>
                </div>
                <FormField
                  label="Receive Now"
                  className="mt-3"
                  error={errors[item.productId]?.message as string | undefined}
                >
                  <Input
                    type="number"
                    min={0}
                    max={remaining}
                    step={1}
                    inputMode="numeric"
                    disabled={remaining === 0}
                    aria-invalid={Boolean(errors[item.productId])}
                    {...register(item.productId)}
                  />
                </FormField>
              </div>
            );
          })}
        </form>

        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)} disabled={receiveMutation.isPending}>
            Cancel
          </Button>
          <Button type="submit" form="goods-receipt-form" isLoading={receiveMutation.isPending}>
            Confirm Receipt
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
