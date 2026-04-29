import { IQuery, IQueryHandler } from "../../../../packages/core/src/application/cqrs";
import { ReservationService, ReservationDto } from "../services/reservation.service";
import { ReservationNotFoundError } from "../../domain/errors";

export interface GetReservationByVariantQuery extends IQuery {
  readonly cartId: string;
  readonly variantId: string;
}

export class GetReservationByVariantHandler implements IQueryHandler<GetReservationByVariantQuery, ReservationDto> {
  constructor(private readonly reservationService: ReservationService) {}

  async handle(query: GetReservationByVariantQuery): Promise<ReservationDto> {
    const reservations = await this.reservationService.getCartReservations(query.cartId);
    const reservation = reservations.find((r) => r.variantId === query.variantId);
    if (!reservation) {
      throw new ReservationNotFoundError(`cart=${query.cartId}, variant=${query.variantId}`);
    }
    return reservation;
  }
}
