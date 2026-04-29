import { IQuery, IQueryHandler } from "../../../../packages/core/src/application/cqrs";
import { ReservationService, ReservationDto } from "../services/reservation.service";
import { ReservationNotFoundError } from "../../domain/errors";

export interface GetReservationQuery extends IQuery {
  readonly reservationId: string;
}

export class GetReservationHandler implements IQueryHandler<GetReservationQuery, ReservationDto> {
  constructor(private readonly reservationService: ReservationService) {}

  async handle(query: GetReservationQuery): Promise<ReservationDto> {
    const reservation = await this.reservationService.getReservation(query.reservationId);
    if (reservation === null) throw new ReservationNotFoundError(query.reservationId);
    return reservation;
  }
}
