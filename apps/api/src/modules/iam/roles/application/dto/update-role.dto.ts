import { PartialType } from '@nestjs/swagger';
import { CreateRoleDto } from './create-role.dto';

/**
 * @class UpdateRoleDto
 * @description
 * 更新角色DTO，继承自CreateRoleDto，所有字段都是可选的。
 * 
 * 主要原理与机制：
 * 1. 使用PartialType继承CreateRoleDto的所有验证规则
 * 2. 所有字段都变为可选，支持部分更新
 * 3. 保持与CreateRoleDto相同的验证和转换逻辑
 * 4. 支持多租户隔离
 */
export class UpdateRoleDto extends PartialType(CreateRoleDto) { } 