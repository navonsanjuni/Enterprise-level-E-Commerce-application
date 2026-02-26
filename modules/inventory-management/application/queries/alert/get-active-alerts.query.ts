import { IQuery, IQueryHandler, CommandResult } from "@/api/src/shared/application";
import { StockAlertService } from "../../services/stock-alert.service";
import { StockAlertResult } from "./get-stock-alert.query";

export interface GetActiveAlertsQuery extends IQuery {}

export class GetActiveAlertsQueryHandler implements IQueryHandler<
  GetActiveAlertsQuery,
  CommandResult<StockAlertResult[]>
> {
  constructor(private readonly stockAlertService: StockAlertService) {}

  async handle(
    query: GetActiveAlertsQuery,
  ): Promise<CommandResult<StockAlertResult[]>> {
    try {
      const alerts = await this.stockAlertService.getActiveAlerts();

      const results: StockAlertResult[] = alerts.map((alert) => ({
        alertId: alert.getAlertId().getValue(),
        variantId: alert.getVariantId(),
        type: alert.getType().getValue(),
        triggeredAt: alert.getTriggeredAt(),
        resolvedAt: alert.getResolvedAt() ?? undefined,
        isResolved: alert.isResolved(),
      }));

      return CommandResult.success(results);
    } catch (error) {
      return CommandResult.failure<StockAlertResult[]>(
        error instanceof Error ? error.message : "Unknown error occurred",
        [error instanceof Error ? error.message : "Unknown error"],
      );
    }
  }
}

export { GetActiveAlertsQueryHandler as GetActiveAlertsHandler };
