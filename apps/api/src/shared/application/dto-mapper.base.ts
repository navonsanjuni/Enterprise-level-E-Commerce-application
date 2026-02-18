export interface DtoMapper<Entity, DTO> {
  toDto(entity: Entity): DTO;
  toDtoList(entities: Entity[]): DTO[];
}

export abstract class BaseDtoMapper<Entity, DTO> implements DtoMapper<Entity, DTO> {
  abstract toDto(entity: Entity): DTO;

  toDtoList(entities: Entity[]): DTO[] {
    return entities.map((entity) => this.toDto(entity));
  }
}

export interface PaginatedDto<T> {
  items: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export function createPaginatedDto<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
): PaginatedDto<T> {
  const totalPages = Math.ceil(total / pageSize);
  return {
    items,
    meta: {
      total,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export interface TimestampedDto {
  createdAt: string;
  updatedAt: string;
}

export interface IdentifiableDto {
  id: string;
}

export interface BaseEntityDto extends IdentifiableDto, TimestampedDto {}
