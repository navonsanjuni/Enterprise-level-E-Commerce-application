import { VALID_PROMO_TYPES, PROMO_MAX_PERCENTAGE } from "../constants";
import { DomainValidationError } from "../errors/cart.errors";

// Public data shape for the AppliedPromos VO. Exported from this file
// because consumers need it to call `addPromo(promo)` and to consume
// `getValue()` / `getPromo(id)`. It is intentionally NOT re-exported
// from the value-objects barrel so it isn't part of the cart module's
// public cross-module API.
export interface AppliedPromoData {
  id: string;
  code: string;
  type: "percentage" | "fixed_amount" | "free_shipping" | "buy_x_get_y";
  value: number;
  description?: string;
  appliedAt: Date;
}

// Backwards-compatibility alias. New code should import `AppliedPromoData`.
/** @deprecated Use `AppliedPromoData`. */
export type PromoData = AppliedPromoData;

export class AppliedPromos {
  // Validation lives in the private constructor so BOTH `fromArray()`
  // (input from a service caller) and `fromJSON()` (raw DB rebuild)
  // validate. Previously validation lived only in `fromArray()` and a
  // corrupt persisted promo could hydrate without checking.
  private constructor(private readonly value: AppliedPromoData[]) {
    value.forEach((promo, index) => AppliedPromos.validatePromo(promo, index));
  }

  private static validatePromo(promo: AppliedPromoData, index: number): void {
    if (!promo.id) {
      throw new DomainValidationError(`Promo at index ${index} must have an ID`);
    }
    if (!promo.code) {
      throw new DomainValidationError(`Promo at index ${index} must have a code`);
    }
    if (!(VALID_PROMO_TYPES as readonly string[]).includes(promo.type)) {
      throw new DomainValidationError(
        `Promo at index ${index} has invalid type: ${promo.type}`,
      );
    }
    if (typeof promo.value !== "number" || promo.value < 0) {
      throw new DomainValidationError(
        `Promo at index ${index} must have a non-negative numeric value`,
      );
    }
    if (promo.type === "percentage" && promo.value > PROMO_MAX_PERCENTAGE) {
      throw new DomainValidationError(
        `Percentage promo at index ${index} cannot exceed ${PROMO_MAX_PERCENTAGE}%`,
      );
    }
    if (!(promo.appliedAt instanceof Date)) {
      throw new DomainValidationError(
        `Promo at index ${index} must have a valid appliedAt date`,
      );
    }
  }

  private static removeDuplicates(promos: AppliedPromoData[]): AppliedPromoData[] {
    const seen = new Set<string>();
    return promos.filter((promo) => {
      if (seen.has(promo.id)) return false;
      seen.add(promo.id);
      return true;
    });
  }

  static empty(): AppliedPromos {
    return new AppliedPromos([]);
  }

  // Pattern C primary factory: takes the data shape and validates via the
  // constructor. Duplicate promo IDs are silently de-duplicated (last
  // occurrence kept) — this preserves prior behaviour where an upstream
  // re-application of the same promo wasn't a domain error.
  static create(promos: AppliedPromoData[]): AppliedPromos {
    return new AppliedPromos(AppliedPromos.removeDuplicates(promos));
  }

  // Backwards-compatibility alias for `create`.
  /** @deprecated Use `AppliedPromos.create(promos)`. */
  static fromArray(promos: AppliedPromoData[]): AppliedPromos {
    return AppliedPromos.create(promos);
  }

  // Repository reconstitution from a persisted JSON column. Constructor
  // validates the parsed shape, so a corrupt row throws here.
  static fromPersistence(promos: AppliedPromoData[]): AppliedPromos {
    return new AppliedPromos([...promos]);
  }

  static fromJSON(json: string): AppliedPromos {
    try {
      const parsed = JSON.parse(json);
      if (!Array.isArray(parsed)) {
        throw new DomainValidationError("JSON must represent an array of promos");
      }
      const promos: AppliedPromoData[] = parsed.map((promo) => ({
        ...promo,
        appliedAt: new Date(promo.appliedAt),
      }));
      return AppliedPromos.create(promos);
    } catch (error) {
      if (error instanceof DomainValidationError) throw error;
      throw new DomainValidationError(
        `Invalid promo JSON: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  }

  getValue(): AppliedPromoData[] {
    return [...this.value];
  }

  equals(other: AppliedPromos): boolean {
    if (this.value.length !== other.value.length) return false;
    return this.value.every((promo, index) => {
      const otherPromo = other.value[index];
      return (
        promo.id === otherPromo.id &&
        promo.code === otherPromo.code &&
        promo.type === otherPromo.type &&
        promo.value === otherPromo.value
      );
    });
  }

  toString(): string {
    return JSON.stringify(this.value);
  }

  isEmpty(): boolean {
    return this.value.length === 0;
  }

  count(): number {
    return this.value.length;
  }

  hasPromo(promoId: string): boolean {
    return this.value.some((promo) => promo.id === promoId);
  }

  getPromo(promoId: string): AppliedPromoData | undefined {
    return this.value.find((promo) => promo.id === promoId);
  }

  getPromoCodes(): string[] {
    return this.value.map((promo) => promo.code);
  }

  getTotalPercentageDiscount(): number {
    return this.value
      .filter((promo) => promo.type === "percentage")
      .reduce((total, promo) => total + promo.value, 0);
  }

  getTotalFixedDiscount(): number {
    return this.value
      .filter((promo) => promo.type === "fixed_amount")
      .reduce((total, promo) => total + promo.value, 0);
  }

  hasFreeShipping(): boolean {
    return this.value.some((promo) => promo.type === "free_shipping");
  }

  addPromo(promo: AppliedPromoData): AppliedPromos {
    if (this.hasPromo(promo.id)) {
      throw new DomainValidationError(`Promo with ID ${promo.id} is already applied`);
    }
    return new AppliedPromos([...this.value, promo]);
  }

  removePromo(promoId: string): AppliedPromos {
    const filtered = this.value.filter((promo) => promo.id !== promoId);
    if (filtered.length === this.value.length) {
      throw new DomainValidationError(`Promo with ID ${promoId} not found`);
    }
    return new AppliedPromos(filtered);
  }

  clear(): AppliedPromos {
    return new AppliedPromos([]);
  }
}
