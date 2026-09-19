import { z } from "zod";

export const purchaseRequestItemSchema = z.object({
  productId: z.string().min(1, "Select a product."),
  quantity: z.coerce
    .number({ message: "Enter a quantity." })
    .int("Quantity must be a whole number.")
    .gt(0, "Quantity must be greater than 0."),
});

export const purchaseRequestFormSchema = z.object({
  warehouseId: z.string().min(1, "Warehouse is required."),
  items: z
    .array(purchaseRequestItemSchema)
    .min(1, "Add at least one product.")
    .superRefine((items, ctx) => {
      const seen = new Map<string, number>();
      items.forEach((item, index) => {
        if (!item.productId) return;
        if (seen.has(item.productId)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "This product has already been added.",
            path: [index, "productId"],
          });
        } else {
          seen.set(item.productId, index);
        }
      });
    }),
});

export type PurchaseRequestFormValues = z.infer<typeof purchaseRequestFormSchema>;
