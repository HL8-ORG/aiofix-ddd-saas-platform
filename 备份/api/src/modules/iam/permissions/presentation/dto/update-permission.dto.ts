import { PartialType } from '@nestjs/mapped-types'
import { CreatePermissionDto } from './create-permission.dto'

/**
 * @class UpdatePermissionDto
 * @description
 * 更新权限的DTO，继承自CreatePermissionDto但所有字段都是可选的。
 * 
 * 主要原理与机制：
 * 1. 使用PartialType装饰器，自动将所有字段设为可选
 * 2. 支持部分更新，只更新提供的字段
 * 3. 保持与创建DTO相同的验证规则
 * 4. 支持增量更新，提高API灵活性
 */
export class UpdatePermissionDto extends PartialType(CreatePermissionDto) { } 