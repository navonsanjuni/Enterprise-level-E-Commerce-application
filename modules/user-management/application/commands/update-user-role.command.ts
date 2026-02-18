import { IUserRepository } from "../../domain/repositories/iuser.repository";
import { UserRole } from "../../domain/entities/user.entity";
import { ICommand, ICommandHandler } from "./register-user.command";
import { UserId } from "../../domain/value-objects/user-id.vo";

export interface UpdateUserRoleCommand extends ICommand {
  userId: string;
  role: UserRole;
  reason?: string;
}

export type UpdateUserRoleResult = {
  success: boolean;
  error?: string;
  errors?: string[];
  userId?: string;
  newRole?: UserRole;
};

export class UpdateUserRoleHandler implements ICommandHandler<
  UpdateUserRoleCommand,
  UpdateUserRoleResult
> {
  constructor(private readonly userRepository: IUserRepository) {}

  async handle(command: UpdateUserRoleCommand): Promise<UpdateUserRoleResult> {
    try {
      // 1. Validate User ID
      let userId: UserId;
      try {
        userId = UserId.fromString(command.userId);
      } catch (error) {
        return {
          success: false,
          error: "Invalid User ID format",
          errors: ["userId"],
        };
      }

      // 2. Validate Role
      if (!Object.values(UserRole).includes(command.role)) {
        return {
          success: false,
          error: `Invalid role. Must be one of: ${Object.values(UserRole).join(
            ", ",
          )}`,
          errors: ["role"],
        };
      }

      // 3. Find User
      const user = await this.userRepository.findById(userId);
      if (!user) {
        return {
          success: false,
          error: "User not found",
          errors: ["userId"],
        };
      }

      // 4. Update Role
      user.updateRole(command.role);

      // 5. Save Changes
      await this.userRepository.update(user);

      return {
        success: true,
        userId: user.getId().getValue(),
        newRole: user.getRole(),
      };
    } catch (error) {
      console.error("[UpdateUserRoleHandler] Error:", error);
      if (error instanceof Error) {
        return {
          success: false,
          error: error.message,
        };
      }
      return {
        success: false,
        error: "An unexpected error occurred while updating user role",
      };
    }
  }
}
