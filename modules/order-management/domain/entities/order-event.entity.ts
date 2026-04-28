import { DomainValidationError } from "../errors/order-management.errors";

export interface OrderEventProps {
  eventId: number | null;
  orderId: string;
  eventType: string;
  payload: Record<string, unknown>;
  // Optional actor attribution. UUID for staff-logged events from the API;
  // free string (e.g. "system") for events emitted by internal sagas/handlers.
  // Absent for legacy rows written before this column existed.
  loggedBy?: string;
  createdAt: Date;
}

export interface OrderEventDTO {
  eventId: number | null;
  orderId: string;
  eventType: string;
  payload: Record<string, unknown>;
  loggedBy?: string;
  createdAt: string;
}

export class OrderEvent {
  private constructor(private props: OrderEventProps) {
    OrderEvent.validate(props);
  }

  static create(
    params: Omit<OrderEventProps, "eventId" | "createdAt">,
  ): OrderEvent {
    return new OrderEvent({
      ...params,
      eventId: null,
      payload: params.payload || {},
      createdAt: new Date(),
    });
  }

  static fromPersistence(props: OrderEventProps): OrderEvent {
    return new OrderEvent(props);
  }

  // Always-applicable invariants. Run on every construction path.
  private static validate(props: OrderEventProps): void {
    if (!props.orderId || props.orderId.trim().length === 0) {
      throw new DomainValidationError("Order ID is required");
    }
    if (!props.eventType || props.eventType.trim().length === 0) {
      throw new DomainValidationError("Event type is required");
    }
  }

  get eventId(): number | null {
    return this.props.eventId;
  }

  get orderId(): string {
    return this.props.orderId;
  }

  get eventType(): string {
    return this.props.eventType;
  }

  get payload(): Record<string, unknown> {
    return this.props.payload;
  }

  get loggedBy(): string | undefined {
    return this.props.loggedBy;
  }

  get createdAt(): Date {
    return this.props.createdAt;
  }

  equals(other: OrderEvent): boolean {
    if (this.props.eventId === null || other.props.eventId === null) {
      return false;
    }
    return this.props.eventId === other.props.eventId;
  }

  static toDTO(entity: OrderEvent): OrderEventDTO {
    return {
      eventId: entity.props.eventId,
      orderId: entity.props.orderId,
      eventType: entity.props.eventType,
      payload: entity.props.payload,
      loggedBy: entity.props.loggedBy,
      createdAt: entity.props.createdAt.toISOString(),
    };
  }
}
