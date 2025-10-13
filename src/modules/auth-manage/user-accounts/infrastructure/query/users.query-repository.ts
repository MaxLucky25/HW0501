import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../../../core/database/database.service';
import { UserViewDto } from '../../api/view-dto/users.view-dto';
import { GetUsersQueryParams } from '../../api/input-dto/get-users-query-params.input-dto';
import { PaginatedViewDto } from '../../../../../core/dto/base.paginated.view-dto';
import { DomainException } from '../../../../../core/exceptions/domain-exceptions';
import { DomainExceptionCode } from '../../../../../core/exceptions/domain-exception-codes';
import { FindByIdDto } from '../dto/repoDto';

@Injectable()
export class UsersQueryRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  async getByIdOrNotFoundFail(dto: FindByIdDto): Promise<UserViewDto> {
    const query = `
      SELECT * FROM users 
      WHERE id = $1 AND deleted_at IS NULL
    `;
    const result = await this.databaseService.query(query, [dto.id]);
    const user = result.rows[0];

    if (!user) {
      throw new DomainException({
        code: DomainExceptionCode.NotFound,
        message: 'User not found!',
        field: 'User',
      });
    }

    return UserViewDto.mapToView(user);
  }

  async getAll(
    query: GetUsersQueryParams,
  ): Promise<PaginatedViewDto<UserViewDto[]>> {
    const searchLoginTerm = query.searchLoginTerm || null;
    const searchEmailTerm = query.searchEmailTerm || null;

    // Маппинг полей для PostgreSQL
    const orderBy = query.sortBy === 'createdAt' ? 'created_at' : query.sortBy;
    const direction = query.sortDirection.toUpperCase();

    const limit = query.pageSize;
    const offset = query.calculateSkip();

    // Строим WHERE условия динамически
    let whereConditions = 'WHERE deleted_at IS NULL';
    const queryParams: any[] = [];
    let paramIndex = 1;

    if (searchLoginTerm) {
      whereConditions += ` AND login ILIKE $${paramIndex}`;
      queryParams.push(`%${searchLoginTerm}%`);
      paramIndex++;
    }

    if (searchEmailTerm) {
      whereConditions += ` AND email ILIKE $${paramIndex}`;
      queryParams.push(`%${searchEmailTerm}%`);
      paramIndex++;
    }

    const usersQuery = `
      SELECT * FROM users 
      ${whereConditions}
      ORDER BY ${orderBy} ${direction}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
    `;

    const countQuery = `
      SELECT COUNT(*) FROM users 
      ${whereConditions}
    `;

    // Добавляем limit и offset к параметрам для usersQuery
    const usersQueryParams = [...queryParams, limit, offset];

    const [usersResult, countResult] = await Promise.all([
      this.databaseService.query(usersQuery, usersQueryParams),
      this.databaseService.query(countQuery, queryParams),
    ]);

    const users = usersResult.rows;
    const totalCount = parseInt(countResult.rows[0].count);

    const items = users.map((user) => UserViewDto.mapToView(user));

    return PaginatedViewDto.mapToView({
      items,
      totalCount,
      page: query.pageNumber,
      size: query.pageSize,
    });
  }
}
