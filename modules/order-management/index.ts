// ── Domain errors ─────────────────────────────────────────────────────────────
export {
  DomainValidationError,
  OrderNotFoundError,
  OrderItemNotFoundError,
  OrderAddressNotFoundError,
  OrderShipmentNotFoundError,
  OrderStatusHistoryNotFoundError,
  OrderEventNotFoundError,
  BackorderNotFoundError,
  PreorderNotFoundError,
  BackorderAlreadyExistsError,
  PreorderAlreadyExistsError,
  InvalidOperationError,
  InvalidOrderStatusTransitionError,
  OrderNotEditableError,
  OrderCancellationError,
  OrderRefundError,
  ShipmentAlreadyShippedError,
  ShipmentAlreadyDeliveredError,
  OrderAddressRequiredError,
  ContactMismatchError,
} from "./domain/errors/order-management.errors";

// ── Domain value objects ──────────────────────────────────────────────────────
// Enums are folded into their Pattern D VO files (canonical pattern); the
// `OrderStatusEnum` / `OrderSourceEnum` aliases re-exported here are
// `@deprecated` shims kept for one release so external consumers can migrate
// to `OrderStatusValue` / `OrderSourceValue` without churn.
export { OrderStatusEnum, OrderStatusValue } from "./domain/value-objects/order-status.vo";
export { OrderSourceEnum, OrderSourceValue } from "./domain/value-objects/order-source.vo";
export { OrderId } from "./domain/value-objects/order-id.vo";

// ── External service interfaces ───────────────────────────────────────────────
export type {
  IExternalVariantService,
  IExternalProductService,
  IExternalProductMediaService,
  IExternalStockService,
  ExternalVariantData,
  ExternalProductData,
  ExternalMediaAsset,
  ExternalStockData,
} from "./domain/ports/external-services";

// ── Application layer ─────────────────────────────────────────────────────────
export * from "./application";
