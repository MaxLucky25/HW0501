import { Module } from '@nestjs/common';
import { UsersRepository } from '../infrastructure/user.repository';

// модуль для инжекта в пост лайк для получения логина в последних лайках

@Module({
  providers: [UsersRepository],
  exports: [UsersRepository],
})
export class UserPersistenceModule {}
