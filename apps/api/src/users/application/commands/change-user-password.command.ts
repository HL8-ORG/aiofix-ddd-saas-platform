/**
 * @class ChangeUserPasswordCommand
 * @description
 * 修改用户密码命令，实现CQRS模式中的命令部分。该命令封装了修改用户密码所需的所有参数，
 * 并通过命令处理器执行具体的业务逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，命令操作修改系统状态
 * 2. 命令模式：封装命令请求为对象，支持验证、审计等操作
 * 3. 数据验证：在命令层面进行基础参数验证
 * 4. 权限控制：命令执行时需要考虑用户权限和数据隔离
 * 5. 审计日志：用于业务审计和操作追踪
 * 6. 安全策略：确保密码修改的安全性
 */
import { IsString, IsUUID, MinLength, MaxLength, Matches } from 'class-validator'
import { generateUuid } from '@/shared/utils/uuid.util'

export interface ChangeUserPasswordCommandDto {
  userId: string
  tenantId: string
  currentPassword: string
  newPassword: string
  changedBy: string
  clientIp?: string
  userAgent?: string
}

export interface ChangeUserPasswordResult {
  success: boolean
  userId: string
  message?: string
  error?: string
  passwordChangedAt?: Date
}

/**
 * @class ChangeUserPasswordCommand
 * @description 修改用户密码命令
 */
export class ChangeUserPasswordCommand {
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
   * @property currentPassword
   * @description 当前密码
   */
  @IsString({ message: '当前密码必须是字符串' })
  @MinLength(1, { message: '当前密码不能为空' })
  readonly currentPassword: string

  /**
   * @property newPassword
   * @description 新密码
   */
  @IsString({ message: '新密码必须是字符串' })
  @MinLength(8, { message: '新密码长度不能少于8个字符' })
  @MaxLength(128, { message: '新密码长度不能超过128个字符' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    { message: '新密码必须包含大小写字母、数字和特殊字符' }
  )
  readonly newPassword: string

  /**
   * @property changedBy
   * @description 修改者ID
   */
  @IsUUID('4', { message: '修改者ID必须是有效的UUID v4格式' })
  readonly changedBy: string

  /**
   * @property clientIp
   * @description 客户端IP地址
   */
  readonly clientIp?: string

  /**
   * @property userAgent
   * @description 用户代理
   */
  readonly userAgent?: string

  /**
   * @property createdAt
   * @description 命令创建时间
   */
  readonly createdAt: Date

  /**
   * @constructor
   * @description 创建修改用户密码命令
   * @param {ChangeUserPasswordCommandDto} data - 命令数据
   */
  constructor(data: ChangeUserPasswordCommandDto) {
    this.commandId = generateUuid()
    this.userId = data.userId
    this.tenantId = data.tenantId
    this.currentPassword = data.currentPassword
    this.newPassword = data.newPassword
    this.changedBy = data.changedBy
    this.clientIp = data.clientIp
    this.userAgent = data.userAgent
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
    if (this.currentPassword === this.newPassword) {
      throw new Error('新密码不能与当前密码相同')
    }

    // 验证新密码不能包含常见弱密码
    const weakPasswords = ['password', '123456', 'qwerty', 'admin']
    if (weakPasswords.includes(this.newPassword.toLowerCase())) {
      throw new Error('新密码不能使用常见弱密码')
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
      currentPassword: '[HIDDEN]',
      newPassword: '[HIDDEN]',
      changedBy: this.changedBy,
      clientIp: this.clientIp,
      userAgent: this.userAgent,
      createdAt: this.createdAt,
    }
  }

  /**
   * @method toString
   * @description 将命令转换为字符串
   * @returns {string} 字符串表示
   */
  toString(): string {
    return `ChangeUserPasswordCommand(userId=${this.userId}, tenantId=${this.tenantId})`
  }
}
