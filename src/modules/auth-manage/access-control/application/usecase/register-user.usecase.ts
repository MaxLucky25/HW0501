import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateUserInputDto } from '../../../user-accounts/api/input-dto/users.input-dto';
import { UserFactory } from '../../../user-accounts/application/user.factory';
import { UsersRepository } from '../../../user-accounts/infrastructure/user.repository';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { EmailService } from '../helping-application/email.service';

export class RegistrationUserCommand {
  constructor(public readonly dto: CreateUserInputDto) {}
}

@CommandHandler(RegistrationUserCommand)
export class RegistrationUserUseCase
  implements ICommandHandler<RegistrationUserCommand, void>
{
  constructor(
    private userFactory: UserFactory,
    private usersRepository: UsersRepository,
    private emailService: EmailService,
  ) {}

  async execute(command: RegistrationUserCommand): Promise<void> {
    const createdUser = await this.userFactory.create(command.dto);

    if (!createdUser.emailConfirmation) {
      throw new DomainException({
        code: DomainExceptionCode.EmailNotConfirmed,
        message: 'emailConfirmation is not set',
        field: 'email',
      });
    }

    // Обновляем пользователя с confirmation кодом
    await this.usersRepository.updateUserConfirmation(
      createdUser.id,
      createdUser.emailConfirmation,
    );

    await this.emailService
      .sendConfirmationEmail(
        createdUser.email,
        createdUser.emailConfirmation.confirmationCode,
      )
      .catch(() => {
        // Логирование для удобства тестирования
        console.error('Email sending failed');
      });
  }
}
