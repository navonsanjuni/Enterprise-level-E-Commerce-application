import { IQuery, IQueryHandler, CommandResult } from "@/api/src/shared/application";
import { SupplierManagementService } from "../../services/supplier-management.service";
import { SupplierContact } from "../../../domain/entities/supplier.entity";

export interface GetSupplierQuery extends IQuery {
  supplierId: string;
}

export interface SupplierResult {
  supplierId: string;
  name: string;
  leadTimeDays?: number;
  contacts: SupplierContact[];
}

export class GetSupplierQueryHandler implements IQueryHandler<
  GetSupplierQuery,
  CommandResult<SupplierResult | null>
> {
  constructor(private readonly supplierService: SupplierManagementService) {}

  async handle(
    query: GetSupplierQuery,
  ): Promise<CommandResult<SupplierResult | null>> {
    try {
      const errors: string[] = [];

      if (!query.supplierId || query.supplierId.trim().length === 0) {
        errors.push("supplierId: Supplier ID is required");
      }

      if (errors.length > 0) {
        return CommandResult.failure<SupplierResult | null>(
          "Validation failed",
          errors,
        );
      }

      const supplier = await this.supplierService.getSupplier(query.supplierId);

      if (!supplier) {
        return CommandResult.success<SupplierResult | null>(null);
      }

      const result: SupplierResult = {
        supplierId: supplier.getSupplierId().getValue(),
        name: supplier.getName(),
        leadTimeDays: supplier.getLeadTimeDays(),
        contacts: supplier.getContacts(),
      };

      return CommandResult.success(result);
    } catch (error) {
      return CommandResult.failure<SupplierResult | null>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"],
      );
    }
  }
}

export { GetSupplierQueryHandler as GetSupplierHandler };
