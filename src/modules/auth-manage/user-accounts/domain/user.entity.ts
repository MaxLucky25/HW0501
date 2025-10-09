import { CreateUserDomainDto } from './dto/create-user.domain.dto';
import { randomUUID } from 'crypto';
import { add } from 'date-fns';
import { UpdateUserInputDto } from '../api/input-dto/update-user.input.dto';

export class User {
  id: string; // UUID
  login: string;
  passwordHash: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  isEmailConfirmed: boolean;
  deletedAt: Date | null;
  emailConfirmation?: {
    confirmationCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };
  passwordRecovery?: {
    recoveryCode: string;
    expirationDate: Date;
    isConfirmed: boolean;
  };

  static createUser(dto: CreateUserDomainDto): User {
    const user = new this();
    user.id = randomUUID();
    user.email = dto.email;
    user.passwordHash = dto.passwordHash;
    user.login = dto.login;
    user.isEmailConfirmed = false;
    user.createdAt = new Date();
    user.updatedAt = new Date();
    user.deletedAt = null;

    return user;
  }

  update(dto: UpdateUserInputDto) {
    if (dto.email !== this.email) {
      this.isEmailConfirmed = false;
    }
    this.email = dto.email;
    this.updatedAt = new Date();
  }

  resetEmailConfirmation(expirationMinutes: number) {
    this.emailConfirmation = {
      confirmationCode: randomUUID(),
      expirationDate: add(new Date(), { minutes: expirationMinutes }),
      isConfirmed: false,
    };
  }

  resetPasswordRecovery(expirationMinutes: number) {
    this.passwordRecovery = {
      recoveryCode: randomUUID(),
      expirationDate: add(new Date(), { minutes: expirationMinutes }),
      isConfirmed: false,
    };
  }
}
// Убираем Mongoose типы - работаем с raw SQL
export type UserDocument = User; // Теперь просто User
