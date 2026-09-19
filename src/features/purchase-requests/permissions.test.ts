import { describe, expect, it } from "vitest";
import { purchaseRequestPermissions } from "@/features/purchase-requests/permissions";

describe("purchaseRequestPermissions", () => {
  it("does not allow USER to see the approval action", () => {
    expect(purchaseRequestPermissions.canApprove("USER", "SUBMITTED")).toBe(false);
    expect(purchaseRequestPermissions.canReject("USER", "SUBMITTED")).toBe(false);
  });

  it("allows APPROVER to approve or reject a SUBMITTED request", () => {
    expect(purchaseRequestPermissions.canApprove("APPROVER", "SUBMITTED")).toBe(true);
    expect(purchaseRequestPermissions.canReject("APPROVER", "SUBMITTED")).toBe(true);
  });

  it("does not allow APPROVER to approve a request that isn't SUBMITTED", () => {
    expect(purchaseRequestPermissions.canApprove("APPROVER", "DRAFT")).toBe(false);
    expect(purchaseRequestPermissions.canApprove("APPROVER", "APPROVED")).toBe(false);
    expect(purchaseRequestPermissions.canApprove("APPROVER", "REJECTED")).toBe(false);
  });

  it("only allows USER to edit or submit a request while it is DRAFT", () => {
    expect(purchaseRequestPermissions.canEdit("USER", "DRAFT")).toBe(true);
    expect(purchaseRequestPermissions.canSubmit("USER", "DRAFT")).toBe(true);
    expect(purchaseRequestPermissions.canEdit("USER", "SUBMITTED")).toBe(false);
    expect(purchaseRequestPermissions.canSubmit("USER", "SUBMITTED")).toBe(false);
  });

  it("does not allow APPROVER to create or edit requests", () => {
    expect(purchaseRequestPermissions.canCreate("APPROVER")).toBe(false);
    expect(purchaseRequestPermissions.canEdit("APPROVER", "DRAFT")).toBe(false);
  });
});
