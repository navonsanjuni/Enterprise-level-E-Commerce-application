import { EmptyFieldError } from "../../../../packages/core/src/domain/domain-error";

export class BnplProvider {
  private constructor(private readonly value: string) {}

  static create(value: string): BnplProvider {
    if (!value || value.trim().length === 0) {
      throw new EmptyFieldError("BNPL provider");
    }
    return new BnplProvider(value.trim().toLowerCase());
  }

  static fromString(value: string): BnplProvider {
    return new BnplProvider(value);
  }

  static readonly KOKO = new BnplProvider("koko");
  static readonly MINTPAY = new BnplProvider("mintpay");

  getValue(): string {
    return this.value;
  }

  equals(other: BnplProvider): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
