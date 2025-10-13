import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/user.repository';
import { User } from '../domain/user.entity';
import { CreateUserInputDto } from '../api/input-dto/users.input-dto';
import { CreateUserDomainDto } from '../domain/dto/create-user.domain.dto';
import { BcryptService } from '../../access-control/application/helping-application/bcrypt.service';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { Extension } from '../../../../core/exceptions/domain-exceptions';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserFactory {
  constructor(
    private readonly bcryptService: BcryptService,
    private readonly usersRepository: UsersRepository,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreateUserInputDto): Promise<User> {
    const [byLogin, byEmail, passwordHash] = await Promise.all([
      this.usersRepository.findByLoginOrEmail({ loginOrEmail: dto.login }),
      this.usersRepository.findByLoginOrEmail({ loginOrEmail: dto.email }),
      this.bcryptService.generateHash({
        password: dto.password,
      }),
    ]);

    if (byLogin || byEmail) {
      const extensions: Extension[] = [];
      if (byLogin) {
        extensions.push(new Extension('Login already exists', 'login'));
      }
      if (byEmail) {
        extensions.push(new Extension('Email already exists', 'email'));
      }
      throw new DomainException({
        code: DomainExceptionCode.AlreadyExists,
        message: 'Login or Email already exists!',
        field: extensions.length === 1 ? extensions[0].key : '',
        extensions,
      });
    }

    const user: CreateUserDomainDto = {
      ...dto,
      passwordHash,
    };

    const createdUser = await this.usersRepository.createUser(user);

    // Для регистрации создаем emailConfirmation
    const expirationMinutes = this.configService.get<number>(
      'EMAIL_CONFIRMATION_EXPIRATION',
    );

    if (!expirationMinutes) {
      throw new DomainException({
        code: DomainExceptionCode.InternalServerError,
        message: 'EMAIL_CONFIRMATION_EXPIRATION is not set',
        field: 'ConfigValue',
      });
    }

    createdUser.resetEmailConfirmation(expirationMinutes);

    return createdUser;
  }
}
