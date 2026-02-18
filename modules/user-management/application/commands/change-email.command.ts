import { AuthenticationService } from "../services/authentication.service";

export interface ChangeEmailCommand {
  userId: string;
  newEmail: string;
  password: string;
  timestamp: Date;
}

export interface ChangeEmailResult {
  success: boolean;
  data?: {
    userId: string;
    newEmail: string;
    message: string;
  };
  error?: string;
  errors?: string[];
}

export class ChangeEmailHandler {
  constructor(private readonly authService: AuthenticationService) {}

  async handle(command: ChangeEmailCommand): Promise<ChangeEmailResult> {
    try {
      // Validate command
      if (!command.userId) {
        return {
          success: false,
          error: "User ID is required",
          errors: ["userId"],
        };
      }

      if (!command.newEmail) {
        return {
          success: false,
          error: "New email is required",
          errors: ["newEmail"],
        };
      }

      if (!command.password) {
        return {
          success: false,
          error: "Password is required for verification",
          errors: ["password"],
        };
      }

      // Delegate to authentication service
      await this.authService.changeEmail(
        command.userId,
        command.newEmail,
        command.password,
      );

      return {
        success: true,
        data: {
          userId: command.userId,
          newEmail: command.newEmail,
          message:
            "Email changed successfully. Please verify your new email address.",
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to change email",
        errors: [],
      };
    }
  }
}
