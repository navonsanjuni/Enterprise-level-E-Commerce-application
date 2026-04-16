import { EmptyFieldError } from "../../../../packages/core/src/domain/domain-error";

export class PromotionStatus {
  private constructor(private readonly value: string) {}

  static create(value: string): PromotionStatus {
    if (!value || value.trim().length === 0) {
      throw new EmptyFieldError("Promotion status");
    }
    return new PromotionStatus(value.trim());
  }

  static fromString(value: string): PromotionStatus {
    return new PromotionStatus(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: PromotionStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  // Common status helpers
  static active(): PromotionStatus {
    return new PromotionStatus("active");
  }

  static inactive(): PromotionStatus {
    return new PromotionStatus("inactive");
  }

  static expired(): PromotionStatus {
    return new PromotionStatus("expired");
  }

  static scheduled(): PromotionStatus {
    return new PromotionStatus("scheduled");
  }

  isActive(): boolean {
    return this.value.toLowerCase() === "active";
  }

  isInactive(): boolean {
    return this.value.toLowerCase() === "inactive";
  }

  isExpired(): boolean {
    return this.value.toLowerCase() === "expired";
  }

  isScheduled(): boolean {
    return this.value.toLowerCase() === "scheduled";
  }
}
