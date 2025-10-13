import { CreateUserInputDto } from '../../api/input-dto/users.input-dto';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { UserFactory } from '../user.factory';
import { UsersRepository } from '../../infrastructure/user.repository';

export class CreateUserCommand {
  constructor(public readonly dto: CreateUserInputDto) {}
}

@CommandHandler(CreateUserCommand)
export class CreateUserUseCase
  implements ICommandHandler<CreateUserCommand, UserViewDto>
{
  constructor(
    private userFactory: UserFactory,
    private usersRepository: UsersRepository,
  ) {}

  async execute(command: CreateUserCommand): Promise<UserViewDto> {
    const user = await this.userFactory.create(command.dto);
    // Зафиксировать подтверждение email в БД и очистить email_confirmation
    await this.usersRepository.updateUserEmailConfirmed(user.id, true);
    const updated = await this.usersRepository.updateUserConfirmation(
      user.id,
      null,
    );

    return UserViewDto.mapToView(updated);
  }
}
