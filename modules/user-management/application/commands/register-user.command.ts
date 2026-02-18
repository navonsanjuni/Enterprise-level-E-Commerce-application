import {
  AuthenticationService,
  RegisterUserData,
  AuthResult,
} from "../services/authentication.service";
import { UserRole } from "../../domain/entities/user.entity";

// Base interfaces
export interface ICommand {
  readonly commandId?: string;
  readonly timestamp?: Date;
}

export interface ICommandHandler<TCommand extends ICommand, TResult = void> {
  handle(command: TCommand): Promise<TResult>;
}

export class CommandResult<T = any> {
  constructor(
    public success: boolean,
    public data?: T,
    public error?: string,
    public errors?: string[],
  ) {}

  static success<T>(data?: T): CommandResult<T> {
    return new CommandResult(true, data);
  }

  static failure<T>(error: string, errors?: string[]): CommandResult<T> {
    return new CommandResult<T>(false, undefined, error, errors);
  }
}

export interface RegisterUserCommand extends ICommand {
  email: string;
  password: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  role?: UserRole; // Optional role assignment for creating admin/staff users
}

export class RegisterUserHandler implements ICommandHandler<
  RegisterUserCommand,
  CommandResult<AuthResult>
> {
  constructor(private readonly authService: AuthenticationService) {}

  async handle(
    command: RegisterUserCommand,
  ): Promise<CommandResult<AuthResult>> {
    try {
      // Validate command
      if (!command.email || !command.password) {
        return CommandResult.failure<AuthResult>(
          "Email and password are required",
          ["email", "password"],
        );
      }

      // Prepare registration data
      const registerData: RegisterUserData = {
        email: command.email,
        password: command.password,
        phone: command.phone,
        firstName: command.firstName,
        lastName: command.lastName,
        role: command.role,
      };

      // Register user through authentication service
      const authResult = await this.authService.register(registerData);

      return CommandResult.success<AuthResult>(authResult);
    } catch (error) {
      if (error instanceof Error) {
        return CommandResult.failure<AuthResult>("User registration failed", [
          error.message,
        ]);
      }

      return CommandResult.failure<AuthResult>(
        "An unexpected error occurred during registration",
      );
    }
  }
}
