import { UserDocument } from '../../domain/user.entity';
import { OmitType } from '@nestjs/swagger';

export class UserViewDto {
  id: string;
  login: string;
  email: string;
  createdAt: string;

  static mapToView(user: any): UserViewDto {
    return {
      id: user.id,
      email: user.email,
      login: user.login,
      createdAt: user.created_at
        ? new Date(user.created_at).toISOString()
        : new Date().toISOString(),
    };
  }
}

export class MeViewDto extends OmitType(UserViewDto, [
  'createdAt',
  'id',
] as const) {
  userId: string;

  static mapToView(user: any): MeViewDto {
    const dto = new MeViewDto();

    dto.email = user.email;
    dto.login = user.login;
    dto.userId = user.id;

    return dto;
  }
}
