// Lifecycle states for an order. Transitions are enforced by OrderStatus.canTransitionTo().
export enum OrderStatusEnum {
  /** Cart-converted, not yet acknowledged by customer (transient). */
  CREATED = "created",
  /** Awaiting payment authorization. */
  PENDING = "pending",
  /** Customer confirmed, awaiting payment capture. */
  CONFIRMED = "confirmed",
  /** Payment captured. Ready for fulfillment. */
  PAID = "paid",
  /** Warehouse picking/packing. */
  PROCESSING = "processing",
  /** Handed to carrier; tracking active. */
  SHIPPED = "shipped",
  /** Carrier confirmed delivery. */
  DELIVERED = "delivered",
  /**
   * @deprecated Legacy combined "shipped+delivered" state. Use SHIPPED → DELIVERED instead.
   * Retained for historical orders; new orders should not transition into FULFILLED.
   */
  FULFILLED = "fulfilled",
  /** One or more items returned, others kept. */
  PARTIALLY_RETURNED = "partially_returned",
  /** Full refund issued (terminal). */
  REFUNDED = "refunded",
  /** Order cancelled before fulfillment (terminal). */
  CANCELLED = "cancelled",
}

// Channel the order originated from. Used for analytics and channel-specific business rules.
export enum OrderSourceEnum {
  WEB = "web",
  MOBILE = "mobile",
}
