import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { SizeGuideDTO } from "../../domain/entities/size-guide.entity";
import { SizeGuideManagementService } from "../services/size-guide-management.service";

export interface GetSizeGuideQuery extends IQuery {
  readonly id: string;
}

export class GetSizeGuideHandler implements IQueryHandler<GetSizeGuideQuery, QueryResult<SizeGuideDTO>> {
  constructor(private readonly sizeGuideManagementService: SizeGuideManagementService) {}

  async handle(query: GetSizeGuideQuery): Promise<QueryResult<SizeGuideDTO>> {
    try {
    return QueryResult.success(await this.sizeGuideManagementService.getSizeGuideById(query.id));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
