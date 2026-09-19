import { describe, expect, it } from "vitest";
import { purchaseRequestFormSchema } from "@/features/purchase-requests/schema";

describe("purchaseRequestFormSchema", () => {
  it("requires a warehouse to be selected", () => {
    const result = purchaseRequestFormSchema.safeParse({
      warehouseId: "",
      items: [{ productId: "prod-1", quantity: 10 }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => issue.path.includes("warehouseId"))).toBe(true);
    }
  });

  it("cannot be submitted without at least one item", () => {
    const result = purchaseRequestFormSchema.safeParse({
      warehouseId: "wh-1",
      items: [],
    });

    expect(result.success).toBe(false);
  });

  it("rejects a quantity that is not greater than 0", () => {
    const result = purchaseRequestFormSchema.safeParse({
      warehouseId: "wh-1",
      items: [{ productId: "prod-1", quantity: 0 }],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      const quantityIssue = result.error.issues.find((issue) => issue.path.includes("quantity"));
      expect(quantityIssue?.message).toMatch(/greater than 0/i);
    }
  });

  it("rejects the same product being added twice", () => {
    const result = purchaseRequestFormSchema.safeParse({
      warehouseId: "wh-1",
      items: [
        { productId: "prod-1", quantity: 10 },
        { productId: "prod-1", quantity: 5 },
      ],
    });

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((issue) => /already been added/i.test(issue.message))).toBe(true);
    }
  });

  it("accepts a valid request with multiple distinct products", () => {
    const result = purchaseRequestFormSchema.safeParse({
      warehouseId: "wh-1",
      items: [
        { productId: "prod-1", quantity: 100 },
        { productId: "prod-2", quantity: 20 },
      ],
    });

    expect(result.success).toBe(true);
  });
});
