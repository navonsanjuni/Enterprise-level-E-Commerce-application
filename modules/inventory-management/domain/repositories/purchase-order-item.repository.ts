import { VariantId } from "../../../product-catalog/domain/value-objects/variant-id.vo";
import { PurchaseOrderItem } from "../entities/purchase-order-item.entity";
import { PurchaseOrderId } from "../value-objects/purchase-order-id.vo";

/**
 * Read-only cross-aggregate query repository for `PurchaseOrderItem`.
 *
 * `PurchaseOrderItem` is a child entity of the `PurchaseOrder` aggregate;
 * writes (`save`/`delete`) flow through the aggregate root via
 * `IPurchaseOrderRepository.save(po)`. This repository exposes only
 * queries that span aggregates (`findByVariant`) or do SQL-level
 * aggregation (`getTotalOrderedQty`/`getTotalReceivedQty`) — operations
 * where loading every PO and walking its items in memory would be
 * prohibitively expensive.
 *
 * Inventory consumes `VariantId` from product-catalog (Customer/Supplier
 * DDD pattern — inventory is downstream of product-catalog).
 */
export interface IPurchaseOrderItemRepository {
  findByVariant(variantId: VariantId): Promise<PurchaseOrderItem[]>;
  getTotalOrderedQty(poId: PurchaseOrderId): Promise<number>;
  getTotalReceivedQty(poId: PurchaseOrderId): Promise<number>;
}
