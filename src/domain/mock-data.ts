import type { PurchaseRequest, Warehouse, Product } from './models';

export const mockWarehouses: Warehouse[] = [
  { id: 'WH-01', name: 'Jakarta Warehouse', location: 'Jakarta' },
  { id: 'WH-02', name: 'Surabaya Warehouse', location: 'Surabaya' },
];

export const mockProducts: Product[] = [
  { id: 'P-01', name: 'Industrial Oil', sku: 'OIL-001', unit: 'PCS' },
  { id: 'P-02', name: 'Safety Gloves', sku: 'SAFE-001', unit: 'BOX' },
  { id: 'P-03', name: 'Helmet', sku: 'HELM-001', unit: 'PCS' },
];

export const mockPurchaseRequests: PurchaseRequest[] = [
  {
    id: '1',
    requestNumber: 'PR-2026-000001',
    warehouse: mockWarehouses[0],
    requestedBy: 'John Doe',
    status: 'SUBMITTED',
    totalItems: 3,
    createdAt: '01 Sep 2026',
  },
  {
    id: '2',
    requestNumber: 'PR-2026-000002',
    warehouse: mockWarehouses[1],
    requestedBy: 'Jane Smith',
    status: 'DRAFT',
    totalItems: 1,
    createdAt: '02 Sep 2026',
  },
];