import { IQuery, IQueryHandler, CommandResult } from "@/api/src/shared/application";
import { StockManagementService } from "../../services/stock-management.service";
import { TransactionResult } from "./get-transaction.query";

export interface GetTransactionsByVariantQuery extends IQuery {
  variantId: string;
  locationId?: string;
  limit?: number;
  offset?: number;
}

export interface TransactionsByVariantResult {
  transactions: TransactionResult[];
  total: number;
}

export class GetTransactionsByVariantQueryHandler implements IQueryHandler<
  GetTransactionsByVariantQuery,
  CommandResult<TransactionsByVariantResult>
> {
  constructor(private readonly stockService: StockManagementService) {}

  async handle(
    query: GetTransactionsByVariantQuery,
  ): Promise<CommandResult<TransactionsByVariantResult>> {
    try {
      const errors: string[] = [];

      if (!query.variantId || query.variantId.trim().length === 0) {
        errors.push("variantId: Variant ID is required");
      }

      if (errors.length > 0) {
        return CommandResult.failure<TransactionsByVariantResult>(
          "Validation failed",
          errors,
        );
      }

      const result = await this.stockService.getTransactionHistory(
        query.variantId,
        query.locationId,
        {
          limit: query.limit,
          offset: query.offset,
        },
      );

      const transactions: TransactionResult[] = result.transactions.map(
        (txn) => ({
          invTxnId: txn.getInvTxnId().getValue(),
          variantId: txn.getVariantId(),
          locationId: txn.getLocationId(),
          qtyDelta: txn.getQtyDelta(),
          reason: txn.getReason().getValue(),

          referenceId: txn.getReferenceId() ?? undefined,
          createdAt: txn.getCreatedAt(),
        }),
      );

      return CommandResult.success({
        transactions,
        total: result.total,
      });
    } catch (error) {
      return CommandResult.failure<TransactionsByVariantResult>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"],
      );
    }
  }
}

export { GetTransactionsByVariantQueryHandler as GetTransactionsByVariantHandler };
