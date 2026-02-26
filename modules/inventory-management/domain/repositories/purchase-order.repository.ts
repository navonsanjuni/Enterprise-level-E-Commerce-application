import { PurchaseOrder } from "../entities/purchase-order.entity";
import { PurchaseOrderId } from "../value-objects/purchase-order-id.vo";
import { SupplierId } from "../value-objects/supplier-id.vo";
import { PurchaseOrderStatus } from "../value-objects/purchase-order-status.vo";

export interface IPurchaseOrderRepository {
  // Basic CRUD
  save(purchaseOrder: PurchaseOrder): Promise<void>;
  findById(poId: PurchaseOrderId): Promise<PurchaseOrder | null>;
  delete(poId: PurchaseOrderId): Promise<void>;

  // Queries
  findBySupplier(supplierId: SupplierId): Promise<PurchaseOrder[]>;
  findByStatus(status: PurchaseOrderStatus): Promise<PurchaseOrder[]>;

  findAll(options?: {
    limit?: number;
    offset?: number;
    status?: PurchaseOrderStatus;
    supplierId?: string;
    sortBy?: "createdAt" | "updatedAt" | "eta";
    sortOrder?: "asc" | "desc";
  }): Promise<{ purchaseOrders: PurchaseOrder[]; total: number }>;

  // Specific queries
  findOverduePurchaseOrders(): Promise<PurchaseOrder[]>;
  findPendingReceival(): Promise<PurchaseOrder[]>;

  // Existence checks
  exists(poId: PurchaseOrderId): Promise<boolean>;
}
