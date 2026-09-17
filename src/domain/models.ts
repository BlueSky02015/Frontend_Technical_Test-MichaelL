export type UserRole = 'USER' | 'APPROVER';

export type PRStatus = 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED';
export type POStatus = 'DRAFT' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';

export interface Warehouse {
  id: string;
  name: string;
  location: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  unit: string;
}

export interface PurchaseRequest {
  id: string;
  requestNumber: string;
  warehouse: Warehouse;
  requestedBy: string;
  status: PRStatus;
  totalItems: number;
  createdAt: string;
}

export interface DashboardSummary {
  totalPR: number;
  waitingApproval: number;
  activePO: number;
  partialReceipt: number;
}