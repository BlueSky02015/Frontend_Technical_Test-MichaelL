import { useEffect } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import { PurchaseRequestItemRow } from "@/features/purchase-requests/components/purchase-request-item-row";
import {
  purchaseRequestFormSchema,
  type PurchaseRequestFormValues,
} from "@/features/purchase-requests/schema";
import { useLookups } from "@/hooks/use-lookup";
import type { PurchaseRequest } from "@/types/domain";

interface PurchaseRequestFormProps {
  defaultValues?: PurchaseRequest;
  onSubmit: (values: PurchaseRequestFormValues) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel?: string;
}

function toFormValues(pr?: PurchaseRequest): PurchaseRequestFormValues {
  if (!pr) {
    return { warehouseId: "", items: [{ productId: "", quantity: 1 }] };
  }
  return {
    warehouseId: pr.warehouseId,
    items: pr.items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
  };
}

export function PurchaseRequestForm({
  defaultValues,
  onSubmit,
  onCancel,
  isSubmitting,
  submitLabel = "Save Purchase Request",
}: PurchaseRequestFormProps) {
  const { warehouses, products, isLoading: isLoadingLookups } = useLookups();

  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<PurchaseRequestFormValues>({
    resolver: zodResolver(purchaseRequestFormSchema),
    defaultValues: toFormValues(defaultValues),
  });

  // Reset once reference/edit data actually arrives (defaultValues starts undefined on first render).
  useEffect(() => {
    if (defaultValues) reset(toFormValues(defaultValues));
  }, [defaultValues, reset]);

  const { fields, append, remove } = useFieldArray({ control, name: "items" });
  const items = watch("items");
  const selectedProductIds = items?.map((item) => item.productId) ?? [];

  // Warn on accidental navigation away from a dirty form (spec: optional).
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
      e.returnValue = "";
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
    >
      <Controller
        control={control}
        name="warehouseId"
        render={({ field }) => (
          <FormField label="Warehouse" required error={errors.warehouseId?.message} className="max-w-sm">
            <Select value={field.value} onValueChange={field.onChange} disabled={isLoadingLookups}>
              <SelectTrigger aria-invalid={Boolean(errors.warehouseId)}>
                <SelectValue placeholder="Select warehouse" />
              </SelectTrigger>
              <SelectContent>
                {warehouses.map((wh) => (
                  <SelectItem key={wh.id} value={wh.id}>
                    {wh.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Items</h3>
        </div>

        {errors.items?.root?.message || errors.items?.message ? (
          <p className="mb-3 text-xs font-medium text-red-600" role="alert">
            {errors.items.root?.message ?? errors.items.message}
          </p>
        ) : null}

        <div className="space-y-3">
          {fields.map((field, index) => (
            <PurchaseRequestItemRow
              key={field.id}
              index={index}
              control={control}
              errors={errors}
              products={products}
              selectedProductIds={selectedProductIds}
              onRemove={() => remove(index)}
              canRemove={fields.length > 1}
            />
          ))}
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => append({ productId: "", quantity: 1 })}
          disabled={isLoadingLookups || selectedProductIds.length >= products.length}
        >
          <Plus />
          Add Product
        </Button>
      </div>

      <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
