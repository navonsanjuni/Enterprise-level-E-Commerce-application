import { DomainValidationError } from "../errors/order-management.errors";
import { OrderSourceEnum } from "../enums";

export class OrderSource {
  private constructor(private readonly value: OrderSourceEnum) {
    OrderSource.validate(value);
  }

  static create(value: string): OrderSource {
    return new OrderSource(value.toLowerCase() as OrderSourceEnum);
  }

  static fromString(value: string): OrderSource {
    return OrderSource.create(value);
  }

  static web(): OrderSource {
    return new OrderSource(OrderSourceEnum.WEB);
  }

  static mobile(): OrderSource {
    return new OrderSource(OrderSourceEnum.MOBILE);
  }

  private static validate(value: string): void {
    if (!Object.values(OrderSourceEnum).includes(value as OrderSourceEnum)) {
      throw new DomainValidationError(`Invalid order source: ${value}`);
    }
  }

  getValue(): OrderSourceEnum {
    return this.value;
  }

  isWeb(): boolean {
    return this.value === OrderSourceEnum.WEB;
  }

  isMobile(): boolean {
    return this.value === OrderSourceEnum.MOBILE;
  }

  equals(other: OrderSource): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
