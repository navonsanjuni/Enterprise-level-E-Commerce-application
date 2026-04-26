import { AuthenticationService } from '../services/authentication.service';
import { ITokenBlacklistService } from '../services/itoken-blacklist.service';
import { ICommand, ICommandHandler, CommandResult } from '../../../../packages/core/src/application/cqrs';

export interface ResendVerificationCommand extends ICommand {
  readonly email: string;
}

export class ResendVerificationHandler
  implements ICommandHandler<ResendVerificationCommand, CommandResult<void>>
{
  constructor(
    private readonly authService: AuthenticationService,
    private readonly tokenBlacklistService: ITokenBlacklistService,
  ) {}

  async handle(command: ResendVerificationCommand): Promise<CommandResult<void>> {
    const result = await this.authService.resendEmailVerification(command.email);

    if (result.alreadyVerified) {
      return CommandResult.success();
    }

    this.tokenBlacklistService.storeVerificationToken(
      result.verificationToken,
      result.userId,
      command.email,
    );
    // TODO: trigger email notification event with the token

    return CommandResult.success();
  }
}
