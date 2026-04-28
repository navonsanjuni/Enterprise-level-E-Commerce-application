export * from "./entities";
export * from "./repositories";
export * from "./errors";
export * from "./enums";
export * from "./constants";

// Value objects — re-exported explicitly to avoid name collision with the
// Address entity (which is also called `Address`). The VO is exposed under
// the `AddressVO` alias for disambiguation.
export { UserId } from "./value-objects/user-id.vo";
export { AddressId } from "./value-objects/address-id.vo";
export { PaymentMethodId } from "./value-objects/payment-method-id.vo";
export { SocialLoginId } from "./value-objects/social-login-id.vo";
export { Email } from "./value-objects/email.vo";
export { Phone } from "./value-objects/phone.vo";
// Currency is a foundational concept shared across modules; re-exported from core.
export { Currency } from "../../../packages/core/src/domain/value-objects/currency.vo";
export { Locale } from "./value-objects/locale.vo";
export { Address as AddressVO } from "./value-objects/address.vo";
export { AddressType } from "./value-objects/address-type.vo";

// Domain services
export { AddressShippingService, type AddressLabel } from "./services/address-shipping.service";
