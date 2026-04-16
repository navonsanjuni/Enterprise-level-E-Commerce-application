import { IQuery, IQueryHandler, QueryResult } from "../../../../packages/core/src/application/cqrs";
import { EditorialLookManagementService } from "../services/editorial-look-management.service";

export interface ValidateEditorialLookForPublicationQuery extends IQuery {
  readonly id: string;
}

export interface EditorialLookPublicationValidationResult {
  readonly isValid: boolean;
  readonly errors: string[];
}

export class ValidateEditorialLookForPublicationHandler implements IQueryHandler<ValidateEditorialLookForPublicationQuery, QueryResult<EditorialLookPublicationValidationResult>> {
  constructor(private readonly editorialLookManagementService: EditorialLookManagementService) {}

  async handle(query: ValidateEditorialLookForPublicationQuery): Promise<QueryResult<EditorialLookPublicationValidationResult>> {
    try {
    return QueryResult.success(await this.editorialLookManagementService.validateLookForPublication(query.id));
      } catch (error: unknown) {
      return QueryResult.fromError(error);
    }
  }
}
