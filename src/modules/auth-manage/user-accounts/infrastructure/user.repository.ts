import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../core/database/database.service';
import { User } from '../domain/user.entity';
import { DomainException } from '../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../core/exceptions/domain-exception-codes';
import { CreateUserDomainDto } from '../domain/dto/create-user.domain.dto';
import { UpdateUserInputDto } from '../api/input-dto/update-user.input.dto';
import {
  FindByConfirmationCodeDto,
  FindByEmailDto,
  FindByIdDto,
  FindByLoginOrEmailDto,
  FindByRecoveryDto,
} from './dto/repoDto';
import { RawUserRow } from '../../../../core/database/types/sql.types';

@Injectable()
export class UsersRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async findById(dto: FindByIdDto): Promise<User | null> {
    const query = `
      SELECT * FROM users 
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      dto.id,
    ]);
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }

  async findOrNotFoundFail(dto: FindByIdDto): Promise<User> {
    const user = await this.findById(dto);

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found!',
        field: 'User',
      });
    }

    return user;
  }

  async findByEmail(dto: FindByEmailDto): Promise<User | null> {
    const query = `
      SELECT * FROM users
      WHERE email = $1 AND deleted_at IS NULL
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      dto.email,
    ]);
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }

  async findByLoginOrEmail(dto: FindByLoginOrEmailDto): Promise<User | null> {
    const query = `
      SELECT * FROM users
      WHERE (login = $1 OR email = $1) AND deleted_at IS NULL
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      dto.loginOrEmail,
    ]);
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }

  async findByRecoveryCode(dto: FindByRecoveryDto): Promise<User | null> {
    const query = `
      SELECT * FROM users
      WHERE password_recovery->>'recoveryCode' = $1 AND deleted_at IS NULL
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      dto.recoveryCode,
    ]);
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }

  async findByConfirmationCode(
    dto: FindByConfirmationCodeDto,
  ): Promise<User | null> {
    const query = `
      SELECT * FROM users
      WHERE email_confirmation->>'confirmationCode' = $1 AND deleted_at IS NULL
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      dto.confirmationCode,
    ]);
    return result.rows[0] ? this.mapToUser(result.rows[0]) : null;
  }

  async createUser(dto: CreateUserDomainDto): Promise<User> {
    const user = User.createUser(dto);
    const query = `
      INSERT INTO users (
        id, login, password_hash, email, is_email_confirmed,
        email_confirmation, password_recovery, created_at, updated_at, deleted_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, NOW(), NOW(), $8
      )
      RETURNING *
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      user.id,
      user.login,
      user.passwordHash,
      user.email,
      user.isEmailConfirmed,
      user.emailConfirmation,
      user.passwordRecovery,
      user.deletedAt,
    ]);
    return this.mapToUser(result.rows[0]);
  }

  async updateUser(id: string, dto: UpdateUserInputDto): Promise<User> {
    const query = `
      UPDATE users 
      SET email = $2, login = $3, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      id,
      dto.email,
      dto.login,
    ]);
    return this.mapToUser(result.rows[0]);
  }

  async deleteUser(id: string): Promise<User> {
    const query = `
      UPDATE users 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [id]);
    return this.mapToUser(result.rows[0]);
  }

  async updateUserPassword(id: string, passwordHash: string): Promise<User> {
    const query = `
      UPDATE users 
      SET password_hash = $2, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      id,
      passwordHash,
    ]);
    return this.mapToUser(result.rows[0]);
  }

  async updateUserRecovery(id: string, passwordRecovery: any): Promise<User> {
    const query = `
      UPDATE users 
      SET password_recovery = $2, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      id,
      passwordRecovery,
    ]);
    return this.mapToUser(result.rows[0]);
  }

  async updateUserConfirmation(
    id: string,
    emailConfirmation: any,
  ): Promise<User> {
    const query = `
      UPDATE users 
      SET email_confirmation = $2, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      id,
      emailConfirmation,
    ]);

    return this.mapToUser(result.rows[0]);
  }

  async updateUserEmailConfirmed(
    id: string,
    isEmailConfirmed: boolean,
  ): Promise<User> {
    const query = `
      UPDATE users 
      SET is_email_confirmed = $2, updated_at = NOW()
      WHERE id = $1 AND deleted_at IS NULL
      RETURNING *
    `;
    const result = await this.databaseService.query<RawUserRow>(query, [
      id,
      isEmailConfirmed,
    ]);
    return this.mapToUser(result.rows[0]);
  }

  private mapToUser(row: RawUserRow): User {
    const user = new User();
    user.id = row.id;
    user.login = row.login;
    user.email = row.email;
    user.passwordHash = row.password_hash;
    user.isEmailConfirmed = row.is_email_confirmed;
    user.createdAt = row.created_at;
    user.updatedAt = row.updated_at;
    user.deletedAt = row.deleted_at;
    user.emailConfirmation = row.email_confirmation || undefined;
    user.passwordRecovery = row.password_recovery || undefined;
    return user;
  }
}
