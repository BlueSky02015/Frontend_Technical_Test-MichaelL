import type { PurchaseRequest } from '@/domain/models';
import { mockPurchaseRequests, mockWarehouses } from '@/domain/mock-data';

// Interface untuk abstraction (OOP)
export interface IPurchaseRequestService {
  getAll(): Promise<PurchaseRequest[]>;
  create(data: CreatePRPayload): Promise<PurchaseRequest>;
}

export interface CreatePRPayload {
  warehouseId: string;
  items: { productId: string; quantity: number }[];
}

// Concrete Class
export class PurchaseRequestService implements IPurchaseRequestService {
  // Simulasi network delay
  private delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async getAll(): Promise<PurchaseRequest[]> {
    await this.delay(500); 
    return mockPurchaseRequests;
  }

  async create(payload: CreatePRPayload): Promise<PurchaseRequest> {
    await this.delay(800); // Simulasi loading

    const warehouse = mockWarehouses.find((w) => w.id === payload.warehouseId);
    if (!warehouse) throw new Error('Warehouse tidak ditemukan');

    const newPR: PurchaseRequest = {
      id: Date.now().toString(),
      requestNumber: `PR-2026-${String(mockPurchaseRequests.length + 1).padStart(6, '0')}`,
      warehouse,
      requestedBy: 'Current User', // Simulasi user login
      status: 'DRAFT',
      totalItems: payload.items.length,
      createdAt: new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }),
    };

    // Simpan ke mock data (dalam real app ini dihandle backend)
    mockPurchaseRequests.unshift(newPR);
    return newPR;
  }
}

// Singleton instance
export const purchaseRequestService = new PurchaseRequestService();