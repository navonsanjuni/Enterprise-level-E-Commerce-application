import { PaymentMethodService } from "../services/payment-method.service";
import { IQuery, IQueryHandler } from "./get-user-profile.query";
import { CommandResult } from "../commands/register-user.command";

export interface ListPaymentMethodsQuery extends IQuery {
  userId: string;
}

export interface PaymentMethodResult {
  paymentMethodId: string;
  type: string;
  brand?: string | null;
  last4?: string | null;
  expMonth?: number | null;
  expYear?: number | null;
  billingAddressId?: string | null;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethodsListResult {
  userId: string;
  paymentMethods: PaymentMethodResult[];
  totalCount: number;
}

export class ListPaymentMethodsHandler implements IQueryHandler<
  ListPaymentMethodsQuery,
  CommandResult<PaymentMethodsListResult>
> {
  constructor(private readonly paymentMethodService: PaymentMethodService) {}

  async handle(
    query: ListPaymentMethodsQuery,
  ): Promise<CommandResult<PaymentMethodsListResult>> {
    try {
      // Validate query
      if (!query.userId) {
        return CommandResult.failure<PaymentMethodsListResult>(
          "User ID is required",
          ["userId"],
        );
      }

      // Get payment methods through service
      const paymentMethods =
        await this.paymentMethodService.getUserPaymentMethods(query.userId);

      const paymentMethodResults: PaymentMethodResult[] = paymentMethods.map(
        (pm) => ({
          paymentMethodId: pm.id,
          type: pm.type,
          brand: pm.brand,
          last4: pm.last4,
          expMonth: pm.expMonth,
          expYear: pm.expYear,
          billingAddressId: pm.billingAddressId,
          isDefault: pm.isDefault,
          createdAt: pm.createdAt,
          updatedAt: pm.updatedAt,
        }),
      );

      const result: PaymentMethodsListResult = {
        userId: query.userId,
        paymentMethods: paymentMethodResults,
        totalCount: paymentMethodResults.length,
      };

      return CommandResult.success<PaymentMethodsListResult>(result);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<PaymentMethodsListResult>(
          "Failed to retrieve payment methods",
          [error.message],
        );
      }

      return CommandResult.failure<PaymentMethodsListResult>(
        "An unexpected error occurred while retrieving payment methods",
      );
    }
  }
}
