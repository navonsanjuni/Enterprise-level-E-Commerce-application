import { EmptyFieldError } from "../../../../packages/core/src/domain/domain-error";

export class LoyaltyTier {
  private constructor(private readonly value: string) {}

  static create(value: string): LoyaltyTier {
    if (!value || value.trim().length === 0) {
      throw new EmptyFieldError("Loyalty tier");
    }
    return new LoyaltyTier(value.trim());
  }

  static fromString(value: string): LoyaltyTier {
    return new LoyaltyTier(value);
  }

  getValue(): string {
    return this.value;
  }

  equals(other: LoyaltyTier): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }

  // Common tier helpers
  static bronze(): LoyaltyTier {
    return new LoyaltyTier("bronze");
  }

  static silver(): LoyaltyTier {
    return new LoyaltyTier("silver");
  }

  static gold(): LoyaltyTier {
    return new LoyaltyTier("gold");
  }

  static platinum(): LoyaltyTier {
    return new LoyaltyTier("platinum");
  }

  isBronze(): boolean {
    return this.value.toLowerCase() === "bronze";
  }

  isSilver(): boolean {
    return this.value.toLowerCase() === "silver";
  }

  isGold(): boolean {
    return this.value.toLowerCase() === "gold";
  }

  isPlatinum(): boolean {
    return this.value.toLowerCase() === "platinum";
  }
}
