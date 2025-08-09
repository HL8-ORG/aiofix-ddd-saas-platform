/**
 * @class DeactivateUserCommand
 * @description
 * 停用用户命令，实现CQRS模式中的命令部分。该命令封装了停用用户所需的所有参数，
 * 并通过命令处理器执行具体的业务逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，命令操作修改系统状态
 * 2. 命令模式：封装命令请求为对象，支持验证、审计等操作
 * 3. 数据验证：在命令层面进行基础参数验证
 * 4. 权限控制：命令执行时需要考虑用户权限和数据隔离
 * 5. 审计日志：用于业务审计和操作追踪
 * 6. 状态管理：确保用户状态转换的正确性
 */
import { IsString, IsUUID, IsOptional } from 'class-validator'
import { generateUuid } from '@/shared/utils/uuid.util'

export interface DeactivateUserCommandDto {
  userId: string
  tenantId: string
  deactivatedBy: string
  reason?: string
}

export interface DeactivateUserResult {
  success: boolean
  userId: string
  message?: string
  error?: string
  deactivatedAt?: Date
}

/**
 * @class DeactivateUserCommand
 * @description 停用用户命令
 */
export class DeactivateUserCommand {
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
   * @property deactivatedBy
   * @description 停用者ID
   */
  @IsUUID('4', { message: '停用者ID必须是有效的UUID v4格式' })
  readonly deactivatedBy: string

  /**
   * @property reason
   * @description 停用原因
   */
  @IsOptional()
  @IsString({ message: '停用原因必须是字符串' })
  readonly reason?: string

  /**
   * @property createdAt
   * @description 命令创建时间
   */
  readonly createdAt: Date

  /**
   * @constructor
   * @description 创建停用用户命令
   * @param {DeactivateUserCommandDto} data - 命令数据
   */
  constructor(data: DeactivateUserCommandDto) {
    this.commandId = generateUuid()
    this.userId = data.userId
    this.tenantId = data.tenantId
    this.deactivatedBy = data.deactivatedBy
    this.reason = data.reason
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
    if (this.userId === this.deactivatedBy) {
      throw new Error('用户不能自己停用自己')
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
      deactivatedBy: this.deactivatedBy,
      reason: this.reason,
      createdAt: this.createdAt,
    }
  }

  /**
   * @method toString
   * @description 将命令转换为字符串
   * @returns {string} 字符串表示
   */
  toString(): string {
    return `DeactivateUserCommand(userId=${this.userId}, tenantId=${this.tenantId})`
  }
}
