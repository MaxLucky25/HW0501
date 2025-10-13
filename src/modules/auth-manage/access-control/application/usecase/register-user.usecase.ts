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
    console.log('=== REGISTRATION FLOW START ===');
    console.log('Input DTO:', command.dto);

    const createdUser = await this.userFactory.create(command.dto);
    console.log('Created user ID:', createdUser.id);
    console.log('User emailConfirmation:', createdUser.emailConfirmation);

    if (!createdUser.emailConfirmation) {
      console.log('ERROR: emailConfirmation is null/undefined');
      throw new DomainException({
        code: DomainExceptionCode.EmailNotConfirmed,
        message: 'emailConfirmation is not set',
        field: 'email',
      });
    }

    console.log(
      'Confirmation code before DB update:',
      createdUser.emailConfirmation.confirmationCode,
    );

    // Обновляем пользователя с confirmation кодом
    await this.usersRepository.updateUserConfirmation(
      createdUser.id,
      createdUser.emailConfirmation,
    );
    console.log('User confirmation updated in DB');

    console.log(
      'Sending email with code:',
      createdUser.emailConfirmation.confirmationCode,
    );
    this.emailService
      .sendConfirmationEmail(
        createdUser.email,
        createdUser.emailConfirmation.confirmationCode,
      )
      .then(() => {
        console.log('Email sent successfully');
      })
      .catch((error) => {
        console.error('Email sending failed:', error);
      });

    console.log('=== REGISTRATION FLOW END ===');
  }
}
