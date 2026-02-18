import { AuthenticationService } from "../services/authentication.service";

export interface InitiatePasswordResetCommand {
  email: string;
  timestamp: Date;
}

export interface InitiatePasswordResetResult {
  success: boolean;
  data?: {
    exists: boolean;
    token?: string;
    userId?: string;
    message: string;
  };
  error?: string;
  errors?: string[];
}

export class InitiatePasswordResetHandler {
  constructor(private readonly authService: AuthenticationService) {}

  async handle(
    command: InitiatePasswordResetCommand,
  ): Promise<InitiatePasswordResetResult> {
    try {
      // Validate command
      if (!command.email) {
        return {
          success: false,
          error: "Email is required",
          errors: ["email"],
        };
      }

      // Delegate to authentication service
      const result = await this.authService.initiatePasswordReset(
        command.email,
      );

      return {
        success: true,
        data: {
          exists: result.exists,
          token: result.token,
          userId: result.userId,
          message: result.exists
            ? "Password reset initiated successfully"
            : "If an account exists, reset instructions will be sent",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to initiate password reset",
        errors: [],
      };
    }
  }
}
