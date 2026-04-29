import { DomainValidationError } from "../errors/cart.errors";

// The canonical TS enum for checkout statuses lives in this file (alongside
// the Pattern D VO that wraps it) — not in a separate `enums/` directory.
// Persistence-side enum mapping uses Prisma's generated `CheckoutStatusEnum`
// from `@prisma/client`, which mirrors these values.
export enum CheckoutStatusValue {
  PENDING = "pending",
  COMPLETED = "completed",
  EXPIRED = "expired",
  CANCELLED = "cancelled",
}

// Pattern D (Enum-Like VO):
// Shared static instances per allowed value — `create()`/`fromString()`
// route through the private `ALL` array via `.find()`, returning the
// shared instance so reference equality matches between callers. The
// previous implementation returned a fresh instance on every factory
// call (e.g., `CheckoutStatus.pending()`), which broke `===` checks.
export class CheckoutStatus {
  static readonly PENDING = new CheckoutStatus(CheckoutStatusValue.PENDING);
  static readonly COMPLETED = new CheckoutStatus(CheckoutStatusValue.COMPLETED);
  static readonly EXPIRED = new CheckoutStatus(CheckoutStatusValue.EXPIRED);
  static readonly CANCELLED = new CheckoutStatus(CheckoutStatusValue.CANCELLED);

  private static readonly ALL: ReadonlyArray<CheckoutStatus> = [
    CheckoutStatus.PENDING,
    CheckoutStatus.COMPLETED,
    CheckoutStatus.EXPIRED,
    CheckoutStatus.CANCELLED,
  ];

  // Validation lives in the constructor so BOTH `create()` (input from a
  // service caller) and `fromString()` (raw, for repository reconstitution)
  // validate. Both factories route through `create()` to get shared-instance
  // reference equality on success.
  private constructor(private readonly value: CheckoutStatusValue) {
    if (!Object.values(CheckoutStatusValue).includes(value)) {
      throw new DomainValidationError(
        `Invalid checkout status: ${value}. Must be one of: ${Object.values(CheckoutStatusValue).join(", ")}`,
      );
    }
  }

  static create(value: string): CheckoutStatus {
    const normalized = value.trim().toLowerCase();
    return (
      CheckoutStatus.ALL.find((s) => s.value === normalized) ??
      new CheckoutStatus(normalized as CheckoutStatusValue)
    );
  }

  static fromString(value: string): CheckoutStatus {
    return CheckoutStatus.create(value);
  }

  getValue(): CheckoutStatusValue {
    return this.value;
  }

  isPending(): boolean { return this.value === CheckoutStatusValue.PENDING; }
  isCompleted(): boolean { return this.value === CheckoutStatusValue.COMPLETED; }
  isExpired(): boolean { return this.value === CheckoutStatusValue.EXPIRED; }
  isCancelled(): boolean { return this.value === CheckoutStatusValue.CANCELLED; }

  equals(other: CheckoutStatus): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
