/**
 * @class DeleteUserCommand
 * @description
 * 删除用户命令，实现CQRS模式中的命令部分。该命令封装了删除用户所需的所有参数，
 * 并通过命令处理器执行具体的业务逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，命令操作修改系统状态
 * 2. 命令模式：封装命令请求为对象，支持验证、审计等操作
 * 3. 数据验证：在命令层面进行基础参数验证
 * 4. 权限控制：命令执行时需要考虑用户权限和数据隔离
 * 5. 审计日志：用于业务审计和操作追踪
 * 6. 软删除：采用软删除策略，保留数据完整性
 */
import { IsString, IsUUID, IsOptional, IsBoolean } from 'class-validator'
import { generateUuid } from '@/shared/utils/uuid.util'

export interface DeleteUserCommandDto {
  userId: string
  tenantId: string
  deletedBy: string
  reason?: string
  permanent?: boolean
}

export interface DeleteUserResult {
  success: boolean
  userId: string
  message?: string
  error?: string
  deletedAt?: Date
  permanent?: boolean
}

/**
 * @class DeleteUserCommand
 * @description 删除用户命令
 */
export class DeleteUserCommand {
  /**
   * @property commandId
   * @description 命令唯一标识符
   */
  readonly commandId: string

  /**
   * @property userId
   * @description 用户ID
   */
  @IsUUID('4', { message: '用户ID必须是有效的UUID v4格式' })
  readonly userId: string

  /**
   * @property tenantId
   * @description 租户ID
   */
  @IsUUID('4', { message: '租户ID必须是有效的UUID v4格式' })
  readonly tenantId: string

  /**
   * @property deletedBy
   * @description 删除者ID
   */
  @IsUUID('4', { message: '删除者ID必须是有效的UUID v4格式' })
  readonly deletedBy: string

  /**
   * @property reason
   * @description 删除原因
   */
  @IsOptional()
  @IsString({ message: '删除原因必须是字符串' })
  readonly reason?: string

  /**
   * @property permanent
   * @description 是否永久删除
   */
  @IsOptional()
  @IsBoolean({ message: '永久删除标志必须是布尔值' })
  readonly permanent?: boolean

  /**
   * @property createdAt
   * @description 命令创建时间
   */
  readonly createdAt: Date

  /**
   * @constructor
   * @description 创建删除用户命令
   * @param {DeleteUserCommandDto} data - 命令数据
   */
  constructor(data: DeleteUserCommandDto) {
    this.commandId = generateUuid()
    this.userId = data.userId
    this.tenantId = data.tenantId
    this.deletedBy = data.deletedBy
    this.reason = data.reason
    this.permanent = data.permanent || false
    this.createdAt = new Date()
  }

  /**
   * @method validate
   * @description 验证命令数据的有效性
   * @throws {Error} 当数据无效时抛出异常
   */
  validate(): void {
    // 基础验证由装饰器处理
    // 业务规则验证
    if (this.userId === this.deletedBy) {
      throw new Error('用户不能自己删除自己')
    }

    // 验证删除原因（如果是永久删除）
    if (this.permanent && (!this.reason || this.reason.trim() === '')) {
      throw new Error('永久删除必须提供删除原因')
    }
  }

  /**
   * @method toJSON
   * @description 将命令转换为JSON对象
   * @returns {object} JSON对象
   */
  toJSON(): object {
    return {
      commandId: this.commandId,
      userId: this.userId,
      tenantId: this.tenantId,
      deletedBy: this.deletedBy,
      reason: this.reason,
      permanent: this.permanent,
      createdAt: this.createdAt,
    }
  }

  /**
   * @method toString
   * @description 将命令转换为字符串
   * @returns {string} 字符串表示
   */
  toString(): string {
    return `DeleteUserCommand(userId=${this.userId}, tenantId=${this.tenantId}, permanent=${this.permanent})`
  }
}
