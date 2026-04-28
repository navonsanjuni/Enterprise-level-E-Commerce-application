// ─── Pagination ───────────────────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

// ─── Stock ────────────────────────────────────────────────────────────────────
// Bounds enforced in `StockLevel` constructor.
export const STOCK_MIN_QUANTITY = 0;
export const STOCK_MAX_QUANTITY = 1_000_000;

// Business-policy fallback thresholds. NOT currently wired — `StockLevel.create`
// defaults both fields to `null` (meaning "this stock has no per-item threshold
// configured"). When a service-layer policy needs a global default — e.g.
// "any stock without a threshold should alert at 10 units" — read from these
// constants rather than hardcoding the magic numbers at the callsite.
//
// These exist as declared product policy. Do NOT delete without a policy
// decision; deletion would lose intent that's not encoded anywhere else.
export const STOCK_DEFAULT_LOW_STOCK_THRESHOLD = 10;
export const STOCK_DEFAULT_SAFETY_STOCK = 5;

// ─── Location ─────────────────────────────────────────────────────────────────
// MIN is implicit in `Location.validateName` (rejects empty/whitespace-only
// names via `trim().length === 0`). MAX enforced explicitly.
export const LOCATION_NAME_MIN_LENGTH = 1;
export const LOCATION_NAME_MAX_LENGTH = 255;

// ─── Supplier ─────────────────────────────────────────────────────────────────
export const SUPPLIER_NAME_MIN_LENGTH = 2;
export const SUPPLIER_NAME_MAX_LENGTH = 128;
export const SUPPLIER_LEAD_TIME_MIN_DAYS = 0;
export const SUPPLIER_LEAD_TIME_MAX_DAYS = 365;
export const SUPPLIER_MAX_CONTACTS = 20;

// ─── Purchase Order ───────────────────────────────────────────────────────────
// PO_ITEM_MIN/MAX_QTY enforced in `PurchaseOrderItem.validateQtys`.
// PO_MAX_ITEMS is currently NOT enforced — `PurchaseOrder` aggregate doesn't
// load/track its items (they live in their own repository). Wiring this would
// require either elevating PurchaseOrderItem to a true child of PurchaseOrder
// (eager-load on save) or a service-layer guard. Documented as deferred.
export const PO_ITEM_MIN_QTY = 1;
export const PO_ITEM_MAX_QTY = 10_000;
export const PO_MAX_ITEMS = 100;

// ─── Pickup Reservation ───────────────────────────────────────────────────────
// MIN/MAX_EXPIRY enforced in `PickupReservation.validateExpiresAtForCreate`.
// MIN_QTY enforced in `PickupReservation.validateQty`.
// DEFAULT_EXPIRY_MINUTES is a service/controller-layer concern (used when
// caller doesn't supply expiresAt). Domain doesn't reference it.
export const RESERVATION_DEFAULT_EXPIRY_MINUTES = 30;
export const RESERVATION_MIN_EXPIRY_MINUTES = 1;
export const RESERVATION_MAX_EXPIRY_MINUTES = 1440; // 24 hours
export const RESERVATION_MIN_QTY = 1;
