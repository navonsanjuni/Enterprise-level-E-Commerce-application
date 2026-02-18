import { PrismaClient } from "@prisma/client";

// User Management — Repositories
import { UserRepository } from "../../../modules/user-management/infrastructure/persistence/repositories/user.repository";
import { UserProfileRepository } from "../../../modules/user-management/infrastructure/persistence/repositories/user-profile.repository";
import { AddressRepository } from "../../../modules/user-management/infrastructure/persistence/repositories/address.repository";
import { PaymentMethodRepository } from "../../../modules/user-management/infrastructure/persistence/repositories/payment-method.repository";
import { VerificationTokenRepository } from "../../../modules/user-management/infrastructure/persistence/repositories/verification-token.repository";
import { VerificationRateLimitRepository } from "../../../modules/user-management/infrastructure/persistence/repositories/verification-rate-limit.repository";
import { VerificationAuditLogRepository } from "../../../modules/user-management/infrastructure/persistence/repositories/verification-audit-log.repository";

// User Management — Services
import { AuthenticationService } from "../../../modules/user-management/application/services/authentication.service";
import { UserProfileService } from "../../../modules/user-management/application/services/user-profile.service";
import { AddressManagementService } from "../../../modules/user-management/application/services/address-management.service";
import { PaymentMethodService } from "../../../modules/user-management/application/services/payment-method.service";
import { PasswordHasherService } from "../../../modules/user-management/application/services/password-hasher.service";
import { VerificationService } from "../../../modules/user-management/application/services/verification.service";

/**
 * Dependency Injection Container
 * Centralises all module wiring — repositories → services → ready to hand to routes.
 */
export class Container {
  private static instance: Container;
  private services: Map<string, unknown> = new Map();

  private constructor() {}

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  register(
    prisma: PrismaClient,
    config: {
      jwtSecret: string;
      jwtExpiresIn: string;
    },
  ): void {
    // ============================================
    // User Management Module
    // ============================================

    // Repositories
    const userRepository = new UserRepository(prisma);
    const userProfileRepository = new UserProfileRepository(prisma);
    const addressRepository = new AddressRepository(prisma);
    const paymentMethodRepository = new PaymentMethodRepository(prisma);
    const verificationTokenRepository = new VerificationTokenRepository(prisma);
    const verificationRateLimitRepository = new VerificationRateLimitRepository(prisma);
    const verificationAuditLogRepository = new VerificationAuditLogRepository(prisma);

    // Shared services
    const passwordHasher = new PasswordHasherService();

    // Services
    const authService = new AuthenticationService(
      userRepository,
      passwordHasher,
      {
        accessTokenSecret: config.jwtSecret,
        refreshTokenSecret: config.jwtSecret,
        accessTokenExpiresIn: "15m",
        refreshTokenExpiresIn: config.jwtExpiresIn,
      },
    );

    const profileService = new UserProfileService(
      userRepository,
      userProfileRepository,
      addressRepository,
      paymentMethodRepository,
    );

    const addressService = new AddressManagementService(addressRepository);

    const paymentMethodService = new PaymentMethodService(
      paymentMethodRepository,
      userRepository,
      addressRepository,
    );

    const verificationService = new VerificationService(
      userRepository,
      verificationTokenRepository,
      verificationRateLimitRepository,
      verificationAuditLogRepository,
    );

    // Store services
    this.services.set("authService", authService);
    this.services.set("profileService", profileService);
    this.services.set("addressService", addressService);
    this.services.set("paymentMethodService", paymentMethodService);
    this.services.set("verificationService", verificationService);
    this.services.set("prisma", prisma);
  }

  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service "${name}" not found in container`);
    }
    return service as T;
  }

  getUserManagementServices() {
    return {
      authService: this.get<AuthenticationService>("authService"),
      profileService: this.get<UserProfileService>("profileService"),
      addressService: this.get<AddressManagementService>("addressService"),
      paymentMethodService: this.get<PaymentMethodService>("paymentMethodService"),
      prisma: this.get<PrismaClient>("prisma"),
    };
  }
}

export const container = Container.getInstance();
