import { PaginatedResult } from "../../../../packages/core/src/domain/interfaces/paginated-result.interface";
import { PurchaseOrder } from "../entities/purchase-order.entity";
import { PurchaseOrderId } from "../value-objects/purchase-order-id.vo";
import { PurchaseOrderStatusVO } from "../value-objects/purchase-order-status.vo";
import { SupplierId } from "../value-objects/supplier-id.vo";

// Repository params standardise on VOs — typed IDs (`PurchaseOrderId`,
// `SupplierId`) and the status VO wrapper. Service callers wrap raw
// strings via `XxxId.fromString(...)` at the boundary; impl extracts via
// `.getValue()` at the Prisma boundary.
//
// `findById` and `save` operate on the full aggregate including its
// `PurchaseOrderItem` children. `save()` upserts the root and synchronises
// the items collection (adds new items, updates changed ones, removes
// dropped ones) in a single transaction. List methods (`findBySupplier`,
// `findByStatus`, `findAll`, etc.) return purchase orders WITHOUT items —
// callers needing items must `findById` to load the full aggregate.
export interface IPurchaseOrderRepository {
  save(purchaseOrder: PurchaseOrder): Promise<void>;
  findById(poId: PurchaseOrderId): Promise<PurchaseOrder | null>;
  delete(poId: PurchaseOrderId): Promise<void>;
  findBySupplier(supplierId: SupplierId): Promise<PurchaseOrder[]>;
  findByStatus(status: PurchaseOrderStatusVO): Promise<PurchaseOrder[]>;
  findAll(options?: PurchaseOrderQueryOptions): Promise<PaginatedResult<PurchaseOrder>>;
  findOverduePurchaseOrders(): Promise<PurchaseOrder[]>;
  findPendingReceival(): Promise<PurchaseOrder[]>;
  exists(poId: PurchaseOrderId): Promise<boolean>;
}

export interface PurchaseOrderQueryOptions {
  limit?: number;
  offset?: number;
  status?: PurchaseOrderStatusVO;
  supplierId?: SupplierId;
  sortBy?: "createdAt" | "updatedAt" | "eta";
  sortOrder?: "asc" | "desc";
}
