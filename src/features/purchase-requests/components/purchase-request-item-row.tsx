import { Controller, type Control, type FieldErrors } from "react-hook-form";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FormField } from "@/components/shared/form-field";
import type { Product } from "@/types/domain";
import type { PurchaseRequestFormValues } from "@/features/purchase-requests/schema";

interface PurchaseRequestItemRowProps {
  index: number;
  control: Control<PurchaseRequestFormValues>;
  errors: FieldErrors<PurchaseRequestFormValues>;
  products: Product[];
  selectedProductIds: string[];
  onRemove: () => void;
  canRemove: boolean;
}

export function PurchaseRequestItemRow({
  index,
  control,
  errors,
  products,
  selectedProductIds,
  onRemove,
  canRemove,
}: PurchaseRequestItemRowProps) {
  const itemErrors = errors.items?.[index];
  const currentProductId = selectedProductIds[index];

  return (
    <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 p-4 sm:grid-cols-[1fr_160px_auto] sm:items-start">
      <Controller
        control={control}
        name={`items.${index}.productId`}
        render={({ field }) => (
          <FormField label="Product" required error={itemErrors?.productId?.message}>
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger aria-invalid={Boolean(itemErrors?.productId)}>
                <SelectValue placeholder="Select a product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => {
                  const isTakenByAnotherRow =
                    selectedProductIds.includes(product.id) && product.id !== currentProductId;
                  return (
                    <SelectItem key={product.id} value={product.id} disabled={isTakenByAnotherRow}>
                      {product.name} ({product.sku})
                      {isTakenByAnotherRow ? " · already added" : ""}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </FormField>
        )}
      />

      <Controller
        control={control}
        name={`items.${index}.quantity`}
        render={({ field }) => (
          <FormField label="Quantity" required error={itemErrors?.quantity?.message}>
            <Input
              type="number"
              min={1}
              step={1}
              inputMode="numeric"
              aria-invalid={Boolean(itemErrors?.quantity)}
              value={field.value ?? ""}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </FormField>
        )}
      />

      <div className="flex items-end justify-end sm:h-full sm:pt-6">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onRemove}
          disabled={!canRemove}
          aria-label="Remove product"
        >
          <Trash2 className="size-4 text-slate-500" />
        </Button>
      </div>
    </div>
  );
}
