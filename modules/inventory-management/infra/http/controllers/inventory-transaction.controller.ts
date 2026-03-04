import { FastifyRequest, FastifyReply } from "fastify";
import {
  GetTransactionsByVariantQuery,
  GetTransactionsByVariantHandler,
  ListTransactionsQuery,
  ListTransactionsHandler,
} from "../../../application";
import { StockManagementService } from "../../../application/services/stock-management.service";
import { ResponseHelper } from "@/api/src/shared/response.helper";

export interface TransactionsByVariantQuerystring {
  locationId?: string;
  limit?: number;
  offset?: number;
}

export interface ListTransactionsQuerystring {
  variantId?: string;
  locationId?: string;
  limit?: number;
  offset?: number;
}

export class InventoryTransactionController {
  private getTransactionsByVariantHandler: GetTransactionsByVariantHandler;
  private listTransactionsHandler: ListTransactionsHandler;

  constructor(private readonly stockService: StockManagementService) {
    this.getTransactionsByVariantHandler = new GetTransactionsByVariantHandler(
      stockService,
    );
    this.listTransactionsHandler = new ListTransactionsHandler(stockService);
  }

  async getTransactionsByVariant(
    request: FastifyRequest<{
      Params: { variantId: string };
      Querystring: TransactionsByVariantQuerystring;
    }>,
    reply: FastifyReply,
  ) {
    try {
      const { variantId } = request.params;
      const queryParams = request.query;
      const query: GetTransactionsByVariantQuery = {
        variantId,
        locationId: queryParams.locationId,
        limit: queryParams.limit ? Number(queryParams.limit) : undefined,
        offset: queryParams.offset ? Number(queryParams.offset) : undefined,
      };

      const result = await this.getTransactionsByVariantHandler.handle(query);
      return ResponseHelper.fromQuery(reply, result, "Transactions retrieved");
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }

  async listTransactions(
    request: FastifyRequest<{ Querystring: ListTransactionsQuerystring }>,
    reply: FastifyReply,
  ) {
    try {
      const queryParams = request.query;
      const query: ListTransactionsQuery = {
        variantId: queryParams.variantId,
        locationId: queryParams.locationId,
        limit: queryParams.limit ? Number(queryParams.limit) : undefined,
        offset: queryParams.offset ? Number(queryParams.offset) : undefined,
      };

      const result = await this.listTransactionsHandler.handle(query);
      return ResponseHelper.fromQuery(reply, result, "Transactions retrieved");
    } catch (error) {
      return ResponseHelper.error(reply, error);
    }
  }
}
