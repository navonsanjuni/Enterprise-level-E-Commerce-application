import { IQuery, IQueryHandler, CommandResult } from "@/api/src/shared/application";
import { LocationManagementService } from "../../services/location-management.service";
import { Location } from "../../../domain/entities/location.entity";

export interface GetLocationQuery extends IQuery {
  locationId: string;
}

export interface LocationResult {
  locationId: string;
  type: string;
  name: string;
  address?: any;
}

export class GetLocationQueryHandler implements IQueryHandler<
  GetLocationQuery,
  CommandResult<LocationResult | null>
> {
  constructor(private readonly locationService: LocationManagementService) {}

  async handle(
    query: GetLocationQuery,
  ): Promise<CommandResult<LocationResult | null>> {
    try {
      const errors: string[] = [];

      if (!query.locationId || query.locationId.trim().length === 0) {
        errors.push("locationId: Location ID is required");
      }

      if (errors.length > 0) {
        return CommandResult.failure<LocationResult | null>(
          "Validation failed",
          errors,
        );
      }

      const location = await this.locationService.getLocation(query.locationId);

      if (!location) {
        return CommandResult.success<LocationResult | null>(null);
      }

      const result: LocationResult = {
        locationId: location.getLocationId().getValue(),
        type: location.getType().getValue(),
        name: location.getName(),
        address: location.getAddress(),
      };

      return CommandResult.success(result);
    } catch (error) {
      return CommandResult.failure<LocationResult | null>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"],
      );
    }
  }
}

export { GetLocationQueryHandler as GetLocationHandler };
