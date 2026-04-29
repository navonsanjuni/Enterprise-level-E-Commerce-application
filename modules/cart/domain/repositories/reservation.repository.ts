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
 * Inventory-reservation orchestration (availability check + create +
 * save) lives in `ReservationOrchestrator` (application service) — it
 * spans the repo and a domain port and is not the repository's job.
 *
 * Reporting/analytics methods (`getReservationStatistics`,
 * `getReservationsByTimeframe`) and background-job batch hooks
 * (`getReservationsForCleanup`, `archiveOldReservations`) stay on this
 * interface in line with the codebase's unified-repo convention.
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

  // ── Availability / conflict checks ─────────────────────────────────
  checkAvailability(
    variantId: VariantId,
    requestedQuantity: number,
  ): Promise<{
    available: boolean;
    totalReserved: number;
    activeReserved: number;
    availableForReservation: number;
  }>;
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
}
