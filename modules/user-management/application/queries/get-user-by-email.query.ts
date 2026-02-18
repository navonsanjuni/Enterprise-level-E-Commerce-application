import { AuthenticationService } from "../services/authentication.service";

export interface GetUserByEmailQuery {
  email: string;
  timestamp: Date;
}

export interface GetUserByEmailResult {
  success: boolean;
  data?: {
    userId: string;
    emailVerified: boolean;
  } | null;
  error?: string;
  errors?: string[];
}

export class GetUserByEmailHandler {
  constructor(private readonly authService: AuthenticationService) {}

  async handle(query: GetUserByEmailQuery): Promise<GetUserByEmailResult> {
    try {
      // Validate query
      if (!query.email) {
        return {
          success: false,
          error: "Email is required",
          errors: ["email"],
        };
      }

      // Delegate to authentication service
      const user = await this.authService.getUserByEmail(query.email);

      return {
        success: true,
        data: user,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Failed to get user by email",
        errors: [],
      };
    }
  }
}
