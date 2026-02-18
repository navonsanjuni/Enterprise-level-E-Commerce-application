import { IUserRepository } from "../../domain/repositories/iuser.repository";
import { ICommand, ICommandHandler } from "./register-user.command";
import { UserId } from "../../domain/value-objects/user-id.vo";

export interface ToggleUserEmailVerifiedCommand extends ICommand {
  userId: string;
  isVerified: boolean;
  reason?: string;
}

export type ToggleUserEmailVerifiedResult = {
  success: boolean;
  error?: string;
  userId?: string;
  isVerified?: boolean;
};

export class ToggleUserEmailVerifiedHandler implements ICommandHandler<
  ToggleUserEmailVerifiedCommand,
  ToggleUserEmailVerifiedResult
> {
  constructor(private readonly userRepository: IUserRepository) {}

  async handle(
    command: ToggleUserEmailVerifiedCommand,
  ): Promise<ToggleUserEmailVerifiedResult> {
    try {
      // 1. Validate User ID
      let userId: UserId;
      try {
        userId = UserId.fromString(command.userId);
      } catch (error) {
        return {
          success: false,
          error: "Invalid User ID format",
        };
      }

      // 2. Find User
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return {
          success: false,
          error: "User not found",
        };
      }

      // 3. Update Verification Status
      user.setEmailVerified(command.isVerified);

      // 4. Save Changes
      await this.userRepository.update(user);

      return {
        success: true,
        userId: user.getId().getValue(),
        isVerified: user.isEmailVerified(),
      };
    } catch (error) {
      console.error("[ToggleUserEmailVerifiedHandler] Error:", error);
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: "An unexpected error occurred while toggling email verification",
      };
    }
  }
}
