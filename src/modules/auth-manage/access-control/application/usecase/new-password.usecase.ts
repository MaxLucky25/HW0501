import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NewPasswordInputDto } from '../../api/input-dto/new-password.input.dto';
import { AuthService } from '../auth.service';
import { BcryptService } from '../helping-application/bcrypt.service';
import { UsersRepository } from '../../../user-accounts/infrastructure/user.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';

export class NewPasswordCommand {
  constructor(public readonly dto: NewPasswordInputDto) {}
}

@CommandHandler(NewPasswordCommand)
export class NewPasswordUseCase
  implements ICommandHandler<NewPasswordCommand, void>
{
  constructor(
    private authService: AuthService,
    private usersRepository: UsersRepository,
    private bcryptService: BcryptService,
  ) {}

  async execute(command: NewPasswordCommand): Promise<void> {
    const user = await this.usersRepository.findByRecoveryCode({
      recoveryCode: command.dto.recoveryCode,
    });
    if (
      !user?.passwordRecovery ||
      !this.authService.isCodeValid(user.passwordRecovery)
    ) {
      throw new DomainException({
        code: DomainExceptionCode.ConfirmationCodeInvalid,
        message: 'Recovery code is not valid',
        field: 'recoveryCode',
      });
    }

    const newPasswordHash = await this.bcryptService.generateHash({
      password: command.dto.newPassword,
    });

    // Обновляем пароль через репозиторий
    await this.usersRepository.updateUserPassword(user.id, newPasswordHash);
    return;
  }
}
