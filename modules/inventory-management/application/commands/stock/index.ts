// Base Command Types
export type { ICommand, ICommandHandler } from "@/api/src/shared/application";
export { CommandResult } from "@/api/src/shared/application";

// Stock Commands - export interfaces as types and classes normally
export type { AddStockCommand } from "./add-stock.command";
export { AddStockCommandHandler } from "./add-stock.command";
export type { AdjustStockCommand } from "./adjust-stock.command";
export { AdjustStockCommandHandler } from "./adjust-stock.command";
export type { TransferStockCommand } from "./transfer-stock.command";
export { TransferStockCommandHandler } from "./transfer-stock.command";
export type { ReserveStockCommand } from "./reserve-stock.command";
export { ReserveStockCommandHandler } from "./reserve-stock.command";
export type { FulfillReservationCommand } from "./fulfill-reservation.command";
export { FulfillReservationCommandHandler } from "./fulfill-reservation.command";
export type { SetStockThresholdsCommand } from "./set-stock-thresholds.command";
export { SetStockThresholdsCommandHandler } from "./set-stock-thresholds.command";
