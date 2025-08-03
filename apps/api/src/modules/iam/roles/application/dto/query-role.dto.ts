import { IsOptional, IsString, IsNumber, IsBoolean, IsUUID, IsEnum, IsDateString, Min, Max } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { RoleStatus } from '../../domain/value-objects/role-status.value-object';

/**
 * @class QueryRoleDto
 * @description
 * 查询角色DTO，用于角色列表查询的过滤和分页。
 * 
 * 主要原理与机制：
 * 1. 使用class-validator进行数据验证
 * 2. 使用class-transformer进行数据转换
 * 3. 支持多种查询条件和分页参数
 * 4. 支持多租户隔离
 */
export class QueryRoleDto {
  @ApiPropertyOptional({
    description: '页码',
    example: 1,
    minimum: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '页码必须是数字' })
  @Min(1, { message: '页码不能小于1' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    example: 10,
    minimum: 1,
    maximum: 100,
    default: 10,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '每页数量必须是数字' })
  @Min(1, { message: '每页数量不能小于1' })
  @Max(100, { message: '每页数量不能大于100' })
  limit?: number = 10;

  @ApiPropertyOptional({
    description: '角色名称（模糊查询）',
    example: '管理员',
  })
  @IsOptional()
  @IsString({ message: '角色名称必须是字符串' })
  name?: string;

  @ApiPropertyOptional({
    description: '角色代码（模糊查询）',
    example: 'ADMIN',
  })
  @IsOptional()
  @IsString({ message: '角色代码必须是字符串' })
  code?: string;

  @ApiPropertyOptional({
    description: '角色状态',
    enum: RoleStatus,
    example: RoleStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(RoleStatus, { message: '角色状态无效' })
  status?: RoleStatus;

  @ApiPropertyOptional({
    description: '组织ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID('4', { message: '组织ID必须是有效的UUID v4格式' })
  organizationId?: string;

  @ApiPropertyOptional({
    description: '是否为系统角色',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: '系统角色标识必须是布尔值' })
  isSystemRole?: boolean;

  @ApiPropertyOptional({
    description: '是否为默认角色',
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  @IsBoolean({ message: '默认角色标识必须是布尔值' })
  isDefaultRole?: boolean;

  @ApiPropertyOptional({
    description: '最小优先级',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '最小优先级必须是数字' })
  minPriority?: number;

  @ApiPropertyOptional({
    description: '最大优先级',
    example: 100,
    maximum: 1000,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: '最大优先级必须是数字' })
  maxPriority?: number;

  @ApiPropertyOptional({
    description: '创建开始时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '创建开始时间格式无效' })
  createdAtStart?: string;

  @ApiPropertyOptional({
    description: '创建结束时间',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '创建结束时间格式无效' })
  createdAtEnd?: string;

  @ApiPropertyOptional({
    description: '更新开始时间',
    example: '2024-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '更新开始时间格式无效' })
  updatedAtStart?: string;

  @ApiPropertyOptional({
    description: '更新结束时间',
    example: '2024-12-31T23:59:59.000Z',
  })
  @IsOptional()
  @IsDateString({}, { message: '更新结束时间格式无效' })
  updatedAtEnd?: string;

  @ApiPropertyOptional({
    description: '排序字段',
    example: 'createdAt',
    enum: ['name', 'code', 'status', 'priority', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsString({ message: '排序字段必须是字符串' })
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({
    description: '排序方向',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
  })
  @IsOptional()
  @IsString({ message: '排序方向必须是字符串' })
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
} 