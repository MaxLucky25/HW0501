// Типы для результатов SQL запросов
export interface TableInfo {
  table_name: string;
}

export interface TruncateResult {
  command: string;
  rowCount: number;
}

// Типы для JSON полей
export interface EmailConfirmationData {
  confirmationCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
}

export interface PasswordRecoveryData {
  recoveryCode: string;
  expirationDate: Date;
  isConfirmed: boolean;
}

// Типы для raw SQL данных (snake_case из PostgreSQL)
export interface RawUserRow {
  id: string;
  login: string;
  email: string;
  password_hash: string;
  is_email_confirmed: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
  email_confirmation: EmailConfirmationData | null;
  password_recovery: PasswordRecoveryData | null;
}

export interface RawSessionRow {
  id: string;
  token: string;
  user_id: string;
  device_id: string;
  ip: string;
  user_agent: string;
  created_at: Date;
  last_active_date: Date;
  expires_at: Date;
  is_revoked: boolean;
}
