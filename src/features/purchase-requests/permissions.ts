import type { PurchaseRequestStatus, UserRole } from "@/types/domain";

export const purchaseRequestPermissions = {
  canCreate: (role: UserRole) => role === "USER",
  canEdit: (role: UserRole, status: PurchaseRequestStatus) => role === "USER" && status === "DRAFT",
  canSubmit: (role: UserRole, status: PurchaseRequestStatus) => role === "USER" && status === "DRAFT",
  canApprove: (role: UserRole, status: PurchaseRequestStatus) =>
    role === "APPROVER" && status === "SUBMITTED",
  canReject: (role: UserRole, status: PurchaseRequestStatus) =>
    role === "APPROVER" && status === "SUBMITTED",
};
