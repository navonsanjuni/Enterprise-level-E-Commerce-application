import { ICommand, ICommandHandler, CommandResult } from "../../../../packages/core/src/application/cqrs";
import { PurchaseOrderDTO } from "../../domain/entities/purchase-order.entity";
import { PurchaseOrderItemDTO } from "../../domain/entities/purchase-order-item.entity";
import { PurchaseOrderManagementService } from "../services/purchase-order-management.service";

export interface CreatePurchaseOrderWithItemsCommand extends ICommand {
  readonly supplierId: string;
  readonly eta?: Date;
  readonly items: Array<{ variantId: string; orderedQty: number }>;
}

export interface CreatePurchaseOrderWithItemsResult {
  readonly purchaseOrder: PurchaseOrderDTO;
  readonly items: PurchaseOrderItemDTO[];
}

export class CreatePurchaseOrderWithItemsHandler implements ICommandHandler<
  CreatePurchaseOrderWithItemsCommand,
  CommandResult<CreatePurchaseOrderWithItemsResult>
> {
  constructor(private readonly poService: PurchaseOrderManagementService) {}

  async handle(
    command: CreatePurchaseOrderWithItemsCommand,
  ): Promise<CommandResult<CreatePurchaseOrderWithItemsResult>> {
    const purchaseOrder = await this.poService.createPurchaseOrder(
      command.supplierId,
      command.eta,
    );

    // Use the batch method to load + mutate + save the aggregate once.
    // The previous parallel `addPurchaseOrderItem` per item was a race
    // condition: each call loaded a stale PO and last-write-wins.
    const items = await this.poService.addPurchaseOrderItems(
      purchaseOrder.poId,
      [...command.items],
    );

    return CommandResult.success({ purchaseOrder, items });
  }
}
