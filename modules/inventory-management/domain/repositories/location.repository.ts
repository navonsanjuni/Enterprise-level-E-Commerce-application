import { PaginatedResult } from "../../../../packages/core/src/domain/interfaces/paginated-result.interface";
import { Location } from "../entities/location.entity";
import { LocationId } from "../value-objects/location-id.vo";
import { LocationName } from "../value-objects/location-name.vo";
import { LocationTypeVO } from "../value-objects/location-type.vo";

// Repository params standardise on VOs — typed IDs (`LocationId`), enum-like
// fields (`LocationTypeVO`), and named values (`LocationName`). Callers wrap
// raw strings at the service-layer boundary; impl extracts via `.getValue()`
// at the Prisma boundary.
export interface ILocationRepository {
  save(location: Location): Promise<void>;
  findById(locationId: LocationId): Promise<Location | null>;
  delete(locationId: LocationId): Promise<void>;
  findByType(type: LocationTypeVO): Promise<Location[]>;
  findByName(name: LocationName): Promise<Location | null>;
  findAll(options?: LocationQueryOptions): Promise<PaginatedResult<Location>>;
  exists(locationId: LocationId): Promise<boolean>;
  existsByName(name: LocationName): Promise<boolean>;
}

export interface LocationQueryOptions {
  limit?: number;
  offset?: number;
}
