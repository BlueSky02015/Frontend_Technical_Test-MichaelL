import type {
  AppUser,
  GoodsReceipt,
  InventoryItem,
  InventoryMovement,
  Product,
  PurchaseOrder,
  PurchaseRequest,
  Warehouse,
} from "@/types/domain";

/**
 * A single in-memory "database" shared by every mock repository.
 *
 * This exists purely to simulate a persistence layer for the take-home
 * test. It is intentionally the ONLY place that holds mutable server-like
 * state — repositories read/write here, everything above them (hooks,
 * components) only ever sees plain data returned from a repository method.
 *
 * Swapping this for a real backend later means replacing the repository
 * implementations in `api/repositories/*`; nothing else in the app needs
 * to change because they all depend on the repository interfaces only.
 */
class MockDatabase {
  warehouses: Warehouse[] = [
    { id: "wh-1", name: "Jakarta Warehouse", code: "JKT", city: "Jakarta" },
    { id: "wh-2", name: "Surabaya Warehouse", code: "SBY", city: "Surabaya" },
    { id: "wh-3", name: "Bandung Warehouse", code: "BDG", city: "Bandung" },
  ];

  users: AppUser[] = [
    { id: "user-1", name: "John Doe", role: "USER" },
    { id: "user-2", name: "Sarah Lin", role: "APPROVER" },
  ];

  products: Product[] = [
    { id: "prod-1", sku: "OIL-001", name: "Industrial Oil", unit: "PCS", imageUrl: "https://images.unsplash.com/photo-1615486364163-4d6b2c2c2e9b?w=200&h=200&fit=crop" },
    { id: "prod-2", sku: "SAFE-001", name: "Safety Gloves", unit: "BOX", imageUrl: "https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=200&h=200&fit=crop"},
    { id: "prod-3", sku: "HLM-002", name: "Safety Helmet", unit: "PCS", imageUrl: "https://images.unsplash.com/photo-1595246140625-573b715d11dc?w=200&h=200&fit=crop"},
    { id: "prod-4", sku: "PAP-010", name: "A4 Paper Ream", unit: "PACK", imageUrl: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=200&h=200&fit=crop" },
    { id: "prod-5", sku: "CLN-004", name: "Floor Cleaner", unit: "LITER", imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&h=200&fit=crop" },
    { id: "prod-6", sku: "BLT-007", name: "Conveyor Belt", unit: "UNIT", imageUrl: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=200&h=200&fit=crop" },
  ];

  purchaseRequests: PurchaseRequest[] = [];
  purchaseOrders: PurchaseOrder[] = [];
  goodsReceipts: GoodsReceipt[] = [];
  inventory: InventoryItem[] = [];
  movements: InventoryMovement[] = [];

  private prSequence = 0;
  private poSequence = 0;
  private grSequence = 0;

  nextRequestNumber(): string {
    this.prSequence += 1;
    return `PR-2026-${String(this.prSequence).padStart(6, "0")}`;
  }

  nextPoNumber(): string {
    this.poSequence += 1;
    return `PO-2026-${String(this.poSequence).padStart(6, "0")}`;
  }

  nextReceiptNumber(): string {
    this.grSequence += 1;
    return `GR-2026-${String(this.grSequence).padStart(6, "0")}`;
  }

  resetSequences(): void {
    this.prSequence = 0;
    this.poSequence = 0;
    this.grSequence = 0;
  }
}

export const db = new MockDatabase();

/* ------------------------------------------------------------------ */
/* Seed data                                                            */
/* ------------------------------------------------------------------ */

function iso(daysAgo: number, hoursAgo = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  date.setHours(date.getHours() - hoursAgo);
  return date.toISOString();
}

function seed() {
  // ---- Inventory starting stock ----
  db.inventory = [
    { id: "inv-1", productId: "prod-1", warehouseId: "wh-1", quantity: 120 },
    { id: "inv-2", productId: "prod-2", warehouseId: "wh-1", quantity: 45 },
    { id: "inv-3", productId: "prod-3", warehouseId: "wh-1", quantity: 30 },
    { id: "inv-4", productId: "prod-4", warehouseId: "wh-2", quantity: 200 },
    { id: "inv-5", productId: "prod-5", warehouseId: "wh-2", quantity: 15 },
    { id: "inv-6", productId: "prod-6", warehouseId: "wh-3", quantity: 4 },
    { id: "inv-7", productId: "prod-1", warehouseId: "wh-3", quantity: 10 },
  ];

  // ---- Purchase Requests ----
  db.purchaseRequests = [
    {
      id: "pr-1",
      requestNumber: db.nextRequestNumber(),
      warehouseId: "wh-1",
      requestedBy: "John Doe",
      status: "DRAFT",
      items: [
        { id: "pri-1", productId: "prod-1", quantity: 100 },
        { id: "pri-2", productId: "prod-2", quantity: 20 },
      ],
      createdAt: iso(0, 2),
      updatedAt: iso(0, 2),
    },
    {
      id: "pr-2",
      requestNumber: db.nextRequestNumber(),
      warehouseId: "wh-2",
      requestedBy: "John Doe",
      status: "SUBMITTED",
      items: [{ id: "pri-3", productId: "prod-4", quantity: 50 }],
      createdAt: iso(1),
      updatedAt: iso(1),
    },
    {
      id: "pr-3",
      requestNumber: db.nextRequestNumber(),
      warehouseId: "wh-1",
      requestedBy: "John Doe",
      status: "APPROVED",
      items: [
        { id: "pri-4", productId: "prod-3", quantity: 40 },
        { id: "pri-5", productId: "prod-1", quantity: 60 },
      ],
      createdAt: iso(4),
      updatedAt: iso(3),
    },
    {
      id: "pr-4",
      requestNumber: db.nextRequestNumber(),
      warehouseId: "wh-3",
      requestedBy: "John Doe",
      status: "REJECTED",
      items: [{ id: "pri-6", productId: "prod-6", quantity: 2 }],
      createdAt: iso(6),
      updatedAt: iso(5),
      rejectionReason: "Budget for this quarter has already been allocated.",
    },
    {
      id: "pr-5",
      requestNumber: db.nextRequestNumber(),
      warehouseId: "wh-2",
      requestedBy: "John Doe",
      status: "SUBMITTED",
      items: [
        { id: "pri-7", productId: "prod-5", quantity: 30 },
        { id: "pri-8", productId: "prod-4", quantity: 15 },
      ],
      createdAt: iso(0, 6),
      updatedAt: iso(0, 6),
    },
  ];

  // ---- Purchase Orders (derived from the APPROVED PR above) ----
  db.purchaseOrders = [
    {
      id: "po-1",
      poNumber: db.nextPoNumber(),
      purchaseRequestId: "pr-3",
      supplier: "PT Sinar Abadi Supplies",
      warehouseId: "wh-1",
      status: "PARTIALLY_RECEIVED",
      items: [
        { id: "poi-1", productId: "prod-3", orderedQuantity: 40, receivedQuantity: 15 },
        { id: "poi-2", productId: "prod-1", orderedQuantity: 60, receivedQuantity: 60 },
      ],
      createdAt: iso(3),
      updatedAt: iso(1),
    },
    {
      id: "po-2",
      poNumber: db.nextPoNumber(),
      purchaseRequestId: "pr-3",
      supplier: "CV Maju Bersama",
      warehouseId: "wh-2",
      status: "ORDERED",
      items: [{ id: "poi-3", productId: "prod-4", orderedQuantity: 100, receivedQuantity: 0 }],
      createdAt: iso(2),
      updatedAt: iso(2),
    },
    {
      id: "po-3",
      poNumber: db.nextPoNumber(),
      purchaseRequestId: "pr-3",
      supplier: "PT Sinar Abadi Supplies",
      warehouseId: "wh-3",
      status: "RECEIVED",
      items: [{ id: "poi-4", productId: "prod-6", orderedQuantity: 5, receivedQuantity: 5 }],
      createdAt: iso(10),
      updatedAt: iso(8),
    },
    {
      id: "po-4",
      poNumber: db.nextPoNumber(),
      purchaseRequestId: "pr-3",
      supplier: "UD Cahaya Kimia",
      warehouseId: "wh-2",
      status: "CANCELLED",
      items: [{ id: "poi-5", productId: "prod-5", orderedQuantity: 25, receivedQuantity: 0 }],
      createdAt: iso(12),
      updatedAt: iso(11),
    },
  ];

  // ---- Goods receipts + resulting movements for the partially received PO ----
  db.goodsReceipts = [
    {
      id: "gr-1",
      receiptNumber: db.nextReceiptNumber(),
      purchaseOrderId: "po-1",
      lines: [{ productId: "prod-1", receivedQuantity: 60 }],
      createdAt: iso(2),
    },
    {
      id: "gr-2",
      receiptNumber: db.nextReceiptNumber(),
      purchaseOrderId: "po-1",
      lines: [{ productId: "prod-3", receivedQuantity: 15 }],
      createdAt: iso(1),
    },
  ];

  db.movements = [
    {
      id: "mov-1",
      productId: "prod-1",
      warehouseId: "wh-1",
      type: "PURCHASE_RECEIPT",
      quantityChange: 60,
      referenceNumber: "GR-2026-000001",
      createdAt: iso(2),
    },
    {
      id: "mov-2",
      productId: "prod-3",
      warehouseId: "wh-1",
      type: "PURCHASE_RECEIPT",
      quantityChange: 15,
      referenceNumber: "GR-2026-000002",
      createdAt: iso(1),
    },
  ];
}

seed();

/** Test-only helper: reseeds the mock database so each test file starts clean. */
export function resetDb() {
  db.resetSequences();
  seed();
}
