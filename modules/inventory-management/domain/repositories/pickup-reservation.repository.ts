import { PickupReservation } from "../entities/pickup-reservation.entity";
import { ReservationId } from "../value-objects/reservation-id.vo";

export interface IPickupReservationRepository {
  // Basic CRUD
  save(reservation: PickupReservation): Promise<void>;
  findById(reservationId: ReservationId): Promise<PickupReservation | null>;
  delete(reservationId: ReservationId): Promise<void>;

  // Queries
  findByOrder(orderId: string): Promise<PickupReservation[]>;
  findByVariant(variantId: string): Promise<PickupReservation[]>;
  findByLocation(locationId: string): Promise<PickupReservation[]>;
  findByVariantAndLocation(
    variantId: string,
    locationId: string,
  ): Promise<PickupReservation[]>;

  // Specific queries
  findExpiredReservations(): Promise<PickupReservation[]>;
  findActiveReservations(): Promise<PickupReservation[]>;
  findAllReservations(): Promise<PickupReservation[]>;
  findActiveByVariantAndLocation(
    variantId: string,
    locationId: string,
  ): Promise<PickupReservation[]>;

  // Aggregate queries
  getTotalReservedQty(variantId: string, locationId: string): Promise<number>;

  // Existence checks
  exists(reservationId: ReservationId): Promise<boolean>;
}
