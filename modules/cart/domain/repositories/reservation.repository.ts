import { Reservation } from "../entities/reservation.entity";
import { ReservationId } from "../value-objects/reservation-id.vo";
import { CartId } from "../value-objects/cart-id.vo";
import { VariantId } from "../../../product-catalog/domain/value-objects/variant-id.vo";

/**
 * Reservation lifecycle changes (`create`, `extend`, `renew`,
 * `release`, `adjust`) flow through the `Reservation` aggregate root
 * via its domain methods followed by `save(reservation)` (or `delete()`
 * for release). Direct lifecycle methods previously on this interface
 * were removed to enforce the aggregate boundary.
 *
 * Reporting/analytics methods (`getReservationStatistics`,
 * `getReservationsByTimeframe`, `searchReservations`) and background-job
 * batch hooks (`getReservationsFor{Cleanup,Extension,Notification}`,
 * `archiveOldReservations`) are query-side responsibilities kept here
 * for now; consider splitting into `IReservationQueryRepository` if
 * more accumulate.
 *
 * `reserveInventory` orchestrates a stock-service call + persistence;
 * it remains because the orchestration touches an external port
 * (`IExternalStockService`) and is awkward to express purely on the
 * aggregate. A dedicated domain service would be the cleaner home.
 */
export interface IReservationRepository {
  // ── Aggregate persistence ──────────────────────────────────────────
  save(reservation: Reservation): Promise<void>;
  findById(reservationId: ReservationId): Promise<Reservation | null>;
  delete(reservationId: ReservationId): Promise<void>;

  // ── Lookups by alternate key ───────────────────────────────────────
  findByCartId(cartId: CartId): Promise<Reservation[]>;
  findActiveByCartId(cartId: CartId): Promise<Reservation[]>;
  findByCartAndVariant(
    cartId: CartId,
    variantId: VariantId,
  ): Promise<Reservation | null>;
  findByVariantId(variantId: VariantId): Promise<Reservation[]>;
  findByStatus(
    status: "active" | "expiring_soon" | "expired" | "recently_expired",
  ): Promise<Reservation[]>;

  // ── Bulk delete (cart cleanup) ─────────────────────────────────────
  deleteByCartId(cartId: CartId): Promise<number>;
  deleteByCartAndVariant(
    cartId: CartId,
    variantId: VariantId,
  ): Promise<boolean>;

  // ── Quantity aggregates ────────────────────────────────────────────
  getTotalReservedQuantity(variantId: VariantId): Promise<number>;
  getActiveReservedQuantity(variantId: VariantId): Promise<number>;

  // ── Stock-orchestration hook ───────────────────────────────────────
  // Calls the external stock service to atomically reserve inventory
  // and create a reservation row. Kept because the orchestration spans
  // a port boundary; a dedicated domain service would be the cleaner
  // home if more such operations accumulate.
  reserveInventory(
    cartId: CartId,
    variantId: VariantId,
    quantity: number,
    durationMinutes?: number,
  ): Promise<Reservation>;

  // ── Availability / capacity / conflict checks ──────────────────────
  checkAvailability(
    variantId: VariantId,
    requestedQuantity: number,
  ): Promise<{
    available: boolean;
    totalReserved: number;
    activeReserved: number;
    availableForReservation: number;
  }>;
  validateReservationCapacity(
    variantId: VariantId,
    requestedQuantity: number,
  ): Promise<boolean>;
  canCreateReservation(
    cartId: CartId,
    variantId: VariantId,
    quantity: number,
  ): Promise<boolean>;
  isReservationExtendable(reservationId: ReservationId): Promise<boolean>;
  findConflictingReservations(
    variantId: VariantId,
    quantity: number,
    excludeCartId?: CartId,
  ): Promise<Reservation[]>;
  resolveReservationConflicts(variantId: VariantId): Promise<{
    resolved: number;
    conflicts: number;
    actions: Array<{
      action: "extended" | "reduced" | "cancelled";
      reservationId: string;
      details: string;
    }>;
  }>;

  // ── Analytics / reporting ──────────────────────────────────────────
  searchReservations(criteria: {
    cartId?: string;
    variantId?: string;
    status?: "active" | "expiring_soon" | "expired" | "recently_expired";
    minQuantity?: number;
    maxQuantity?: number;
    createdAfter?: Date;
    createdBefore?: Date;
    expiresAfter?: Date;
    expiresBefore?: Date;
    limit?: number;
    offset?: number;
  }): Promise<Reservation[]>;
  getReservationStatistics(): Promise<{
    totalReservations: number;
    activeReservations: number;
    expiredReservations: number;
    expiringSoonReservations: number;
    averageDurationMinutes: number;
    totalQuantityReserved: number;
    mostReservedVariants: Array<{
      variantId: string;
      totalQuantity: number;
      reservationCount: number;
    }>;
  }>;
  getReservationsByTimeframe(
    timeframe: "hour" | "day" | "week" | "month",
    count?: number,
  ): Promise<
    Array<{
      period: string;
      reservationCount: number;
      totalQuantity: number;
      uniqueVariants: number;
      uniqueCarts: number;
    }>
  >;

  // ── Background-job batch hooks ─────────────────────────────────────
  archiveOldReservations(olderThanDays: number): Promise<number>;
  getReservationsForCleanup(batchSize?: number): Promise<Reservation[]>;
  getReservationsForExtension(
    thresholdMinutes: number,
    batchSize?: number,
  ): Promise<Reservation[]>;
  getReservationsForNotification(
    thresholdMinutes: number,
    batchSize?: number,
  ): Promise<Reservation[]>;
}
