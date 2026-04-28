import { OrderShipment } from "../entities/order-shipment.entity";
import { OrderId } from "../value-objects/order-id.vo";

export interface ShipmentQueryOptions {
  limit?: number;
  offset?: number;
  // "id" yields stable insertion-ordered results (no createdAt column on this table).
  sortBy?: "shippedAt" | "deliveredAt" | "id";
  sortOrder?: "asc" | "desc";
}

// NOTE: `shipmentId` stays `string` — no `ShipmentId` VO exists in this module
// yet. Adding one would be a separate refactor pass. `orderId` uses the typed
// `OrderId` VO (already exists).
export interface IOrderShipmentRepository {
  // Basic CRUD
  save(shipment: OrderShipment): Promise<void>;
  delete(shipmentId: string): Promise<void>;
  deleteByOrderId(orderId: OrderId): Promise<void>;

  // Finders
  findById(shipmentId: string): Promise<OrderShipment | null>;
  findByOrderId(
    orderId: OrderId,
    options?: ShipmentQueryOptions,
  ): Promise<OrderShipment[]>;
  findByTrackingNumber(trackingNumber: string): Promise<OrderShipment | null>;
  findByCarrier(
    carrier: string,
    options?: ShipmentQueryOptions,
  ): Promise<OrderShipment[]>;
  findShipped(options?: ShipmentQueryOptions): Promise<OrderShipment[]>;
  findDelivered(options?: ShipmentQueryOptions): Promise<OrderShipment[]>;
  findPending(options?: ShipmentQueryOptions): Promise<OrderShipment[]>;

  // Queries
  countByOrderId(orderId: OrderId): Promise<number>;
  countByCarrier(carrier: string): Promise<number>;
  countShipped(): Promise<number>;
  countDelivered(): Promise<number>;

  // Existence checks
  exists(shipmentId: string): Promise<boolean>;
  existsByTrackingNumber(trackingNumber: string): Promise<boolean>;
}
