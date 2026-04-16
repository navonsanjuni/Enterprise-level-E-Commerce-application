import { DomainValidationError } from "../errors/user-management.errors";

export class Address {
  private readonly _firstName?: string;
  private readonly _lastName?: string;
  private readonly _company?: string;
  private readonly _addressLine1: string;
  private readonly _addressLine2?: string;
  private readonly _city: string;
  private readonly _state?: string;
  private readonly _postalCode?: string;
  private readonly _country: string;
  private readonly _phone?: string;

  private constructor(data: AddressData) {
    // Validate required fields
    if (!data.addressLine1?.trim()) {
      throw new DomainValidationError("Address line 1 is required");
    }
    if (!data.city?.trim()) {
      throw new DomainValidationError("City is required");
    }
    if (!data.country?.trim()) {
      throw new DomainValidationError("Country is required");
    }

    // Validate field lengths
    if (data.firstName && data.firstName.length > 50) {
      throw new DomainValidationError("First name is too long (maximum 50 characters)");
    }
    if (data.lastName && data.lastName.length > 50) {
      throw new DomainValidationError("Last name is too long (maximum 50 characters)");
    }
    if (data.addressLine1.length > 100) {
      throw new DomainValidationError("Address line 1 is too long (maximum 100 characters)");
    }
    if (data.addressLine2 && data.addressLine2.length > 100) {
      throw new DomainValidationError("Address line 2 is too long (maximum 100 characters)");
    }

    // Validate postal code format by country
    if (
      data.postalCode &&
      !this.isValidPostalCode(data.postalCode, data.country)
    ) {
      throw new DomainValidationError(`Invalid postal code format for ${data.country}`);
    }

    // Assign values (trimmed and properly formatted)
    this._firstName = data.firstName?.trim();
    this._lastName = data.lastName?.trim();
    this._company = data.company?.trim();
    this._addressLine1 = data.addressLine1.trim();
    this._addressLine2 = data.addressLine2?.trim();
    this._city = data.city.trim();
    this._state = data.state?.trim();
    this._postalCode = data.postalCode?.trim().toUpperCase();
    this._country = data.country.trim().toUpperCase();
    this._phone = data.phone?.trim();
  }

  private isValidPostalCode(postalCode: string, country: string): boolean {
    const patterns: Record<string, RegExp> = {
      US: /^\d{5}(-\d{4})?$/,
      CA: /^[A-Za-z]\d[A-Za-z] ?\d[A-Za-z]\d$/,
      UK: /^[A-Za-z]{1,2}\d[A-Za-z\d]? ?\d[A-Za-z]{2}$/,
      FR: /^\d{5}$/,
      DE: /^\d{5}$/,
      AU: /^\d{4}$/,
      JP: /^\d{3}-?\d{4}$/,
      IN: /^\d{6}$/,
    };

    const pattern = patterns[country.toUpperCase()];
    return pattern ? pattern.test(postalCode) : true;
  }

  // Property accessors
  get firstName(): string | undefined { return this._firstName; }
  get lastName(): string | undefined { return this._lastName; }
  get company(): string | undefined { return this._company; }
  get addressLine1(): string { return this._addressLine1; }
  get addressLine2(): string | undefined { return this._addressLine2; }
  get city(): string { return this._city; }
  get state(): string | undefined { return this._state; }
  get postalCode(): string | undefined { return this._postalCode; }
  get country(): string { return this._country; }
  get phone(): string | undefined { return this._phone; }

  // Business methods
  getFullName(): string {
    const parts = [this._firstName, this._lastName].filter(Boolean);
    return parts.join(" ");
  }

  getFullAddress(): string {
    const parts = [
      this._addressLine1,
      this._addressLine2,
      this._city,
      this._state,
      this._postalCode,
      this._country,
    ].filter(Boolean);

    return parts.join(", ");
  }

  getFormattedAddress(): FormattedAddress {
    return {
      recipient: this._company || this.getFullName(),
      street: [this._addressLine1, this._addressLine2].filter(
        (line): line is string => Boolean(line)
      ),
      cityStateZip: [this._city, this._state, this._postalCode]
        .filter(Boolean)
        .join(", "),
      country: this._country,
    };
  }

  isSameCountry(other: Address): boolean {
    return this._country === other._country;
  }

  isInternational(fromCountry: string): boolean {
    return this._country !== fromCountry.toUpperCase();
  }

  isDomestic(fromCountry: string): boolean {
    return this._country === fromCountry.toUpperCase();
  }

  isComplete(): boolean {
    const requiredFields = [this._addressLine1, this._city, this._country];
    return requiredFields.every((field) => field && field.trim().length > 0);
  }

  isShippable(): boolean {
    return this.isComplete() && !!this._postalCode;
  }

  equals(other: Address): boolean {
    return (
      this._firstName === other._firstName &&
      this._lastName === other._lastName &&
      this._company === other._company &&
      this._addressLine1 === other._addressLine1 &&
      this._addressLine2 === other._addressLine2 &&
      this._city === other._city &&
      this._state === other._state &&
      this._postalCode === other._postalCode &&
      this._country === other._country &&
      this._phone === other._phone
    );
  }

  toString(): string {
    return this.getFullAddress();
  }

  static create(data: AddressData): Address {
    return new Address(data);
  }

  static fromData(data: AddressData): Address {
    return new Address(data);
  }

  getValue(): AddressData {
    return {
      firstName: this._firstName,
      lastName: this._lastName,
      company: this._company,
      addressLine1: this._addressLine1,
      addressLine2: this._addressLine2,
      city: this._city,
      state: this._state,
      postalCode: this._postalCode,
      country: this._country,
      phone: this._phone,
    };
  }
}

// Supporting interfaces
export interface AddressData {
  firstName?: string;
  lastName?: string;
  company?: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state?: string;
  postalCode?: string;
  country: string;
  phone?: string;
}

export interface FormattedAddress {
  recipient: string;
  street: string[];
  cityStateZip: string;
  country: string;
}

export class AddressType {
  static readonly BILLING = new AddressType('billing');
  static readonly SHIPPING = new AddressType('shipping');

  private constructor(private readonly value: string) {}

  static create(type: string): AddressType {
    const normalized = type.toLowerCase().trim();
    switch (normalized) {
      case 'billing':
        return AddressType.BILLING;
      case 'shipping':
        return AddressType.SHIPPING;
      default:
        throw new DomainValidationError(
          `Invalid address type: '${type}'. Must be 'billing' or 'shipping'`
        );
    }
  }

  static fromString(type: string): AddressType {
    return AddressType.create(type);
  }

  static isValid(type: string): boolean {
    try {
      AddressType.create(type);
      return true;
    } catch {
      return false;
    }
  }

  static getAllValues(): AddressType[] {
    return [AddressType.BILLING, AddressType.SHIPPING];
  }

  getValue(): string {
    return this.value;
  }

  getDisplayName(): string {
    switch (this.value) {
      case 'billing':
        return 'Billing Address';
      case 'shipping':
        return 'Shipping Address';
      default:
        return this.value;
    }
  }

  equals(other: AddressType): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}
