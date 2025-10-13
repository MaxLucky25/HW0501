import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../core/database/database.service';
import { RawPasswordRecoveryRow } from '../../../../core/database/types/sql.types';
import {
  CreatePasswordRecoveryDto,
  FindByRecoveryCodeDto,
  UpdatePasswordRecoveryDto,
  ConfirmPasswordRecoveryDto,
} from './dto/password-recovery.dto';

@Injectable()
export class PasswordRecoveryRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async createPasswordRecovery(dto: CreatePasswordRecoveryDto): Promise<void> {
    const query = `
      INSERT INTO password_recoveries (
        user_id, recovery_code, expiration_date, is_confirmed, 
        created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, NOW(), NOW()
      )
    `;
    await this.databaseService.query(query, [
      dto.userId,
      dto.recoveryCode,
      dto.expirationDate,
      dto.isConfirmed,
    ]);
  }

  async findByRecoveryCode(
    dto: FindByRecoveryCodeDto,
  ): Promise<RawPasswordRecoveryRow | null> {
    const query = `
      SELECT * FROM password_recoveries
      WHERE recovery_code = $1
    `;
    const result = await this.databaseService.query<RawPasswordRecoveryRow>(
      query,
      [dto.recoveryCode],
    );
    return result.rows[0] || null;
  }

  async updatePasswordRecovery(dto: UpdatePasswordRecoveryDto): Promise<void> {
    const query = `
      UPDATE password_recoveries 
      SET 
        recovery_code = $2,
        expiration_date = $3,
        updated_at = NOW()
      WHERE user_id = $1
    `;
    await this.databaseService.query(query, [
      dto.userId,
      dto.recoveryCode,
      dto.expirationDate,
    ]);
  }

  async confirmPasswordRecovery(
    dto: ConfirmPasswordRecoveryDto,
  ): Promise<void> {
    const query = `
      UPDATE password_recoveries 
      SET 
        is_confirmed = true,
        updated_at = NOW()
      WHERE user_id = $1
    `;
    await this.databaseService.query(query, [dto.userId]);
  }

  async deletePasswordRecovery(userId: string): Promise<void> {
    const query = `
      DELETE FROM password_recoveries 
      WHERE user_id = $1
    `;
    await this.databaseService.query(query, [userId]);
  }
}
