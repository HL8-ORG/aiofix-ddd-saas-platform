/**
 * @class UpdateUserProfileCommand
 * @description
 * 更新用户资料命令，实现CQRS模式中的命令部分。该命令封装了更新用户资料所需的所有参数，
 * 并通过命令处理器执行具体的业务逻辑。
 *
 * 主要原理与机制：
 * 1. CQRS模式：将命令和查询职责分离，命令操作修改系统状态
 * 2. 命令模式：封装命令请求为对象，支持验证、审计等操作
 * 3. 数据验证：在命令层面进行基础参数验证
 * 4. 权限控制：命令执行时需要考虑用户权限和数据隔离
 * 5. 审计日志：用于业务审计和操作追踪
 * 6. 多租户支持：确保数据隔离和权限控制
 */
import { IsString, IsOptional, IsUUID, MaxLength, IsUrl, IsObject } from 'class-validator'
import { generateUuid } from '@/shared/utils/uuid.util'

export interface UpdateUserProfileCommandDto {
  userId: string
  tenantId: string
  firstName?: string
  lastName?: string
  displayName?: string
  avatar?: string
  phone?: string
  preferences?: Record<string, any>
  updatedBy: string
}

export interface UpdateUserProfileResult {
  success: boolean
  userId: string
  message?: string
  error?: string
  updatedFields?: string[]
}

/**
 * @class UpdateUserProfileCommand
 * @description 更新用户资料命令
 */
export class UpdateUserProfileCommand {
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
   * @property firstName
   * @description 名
   */
  @IsOptional()
  @IsString({ message: '名必须是字符串' })
  @MaxLength(50, { message: '名不能超过50个字符' })
  readonly firstName?: string

  /**
   * @property lastName
   * @description 姓
   */
  @IsOptional()
  @IsString({ message: '姓必须是字符串' })
  @MaxLength(50, { message: '姓不能超过50个字符' })
  readonly lastName?: string

  /**
   * @property displayName
   * @description 显示名称
   */
  @IsOptional()
  @IsString({ message: '显示名称必须是字符串' })
  @MaxLength(100, { message: '显示名称不能超过100个字符' })
  readonly displayName?: string

  /**
   * @property avatar
   * @description 头像URL
   */
  @IsOptional()
  @IsUrl({}, { message: '头像URL必须是有效的URL格式' })
  @MaxLength(500, { message: '头像URL不能超过500个字符' })
  readonly avatar?: string

  /**
   * @property phone
   * @description 手机号码
   */
  @IsOptional()
  @IsString({ message: '手机号码必须是字符串' })
  @MaxLength(20, { message: '手机号码不能超过20个字符' })
  readonly phone?: string

  /**
   * @property preferences
   * @description 用户偏好设置
   */
  @IsOptional()
  @IsObject({ message: '偏好设置必须是对象' })
  readonly preferences?: Record<string, any>

  /**
   * @property updatedBy
   * @description 更新者ID
   */
  @IsUUID('4', { message: '更新者ID必须是有效的UUID v4格式' })
  readonly updatedBy: string

  /**
   * @property createdAt
   * @description 命令创建时间
   */
  readonly createdAt: Date

  /**
   * @constructor
   * @description 创建更新用户资料命令
   * @param {UpdateUserProfileCommandDto} data - 命令数据
   */
  constructor(data: UpdateUserProfileCommandDto) {
    this.commandId = generateUuid()
    this.userId = data.userId
    this.tenantId = data.tenantId
    this.firstName = data.firstName
    this.lastName = data.lastName
    this.displayName = data.displayName
    this.avatar = data.avatar
    this.phone = data.phone
    this.preferences = data.preferences
    this.updatedBy = data.updatedBy
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
    if (!this.firstName && !this.lastName && !this.displayName && !this.avatar && !this.phone && !this.preferences) {
      throw new Error('至少需要提供一个要更新的字段')
    }

    // 验证显示名称不能为空字符串
    if (this.displayName !== undefined && this.displayName.trim() === '') {
      throw new Error('显示名称不能为空')
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
      firstName: this.firstName,
      lastName: this.lastName,
      displayName: this.displayName,
      avatar: this.avatar,
      phone: this.phone,
      preferences: this.preferences,
      updatedBy: this.updatedBy,
      createdAt: this.createdAt,
    }
  }

  /**
   * @method toString
   * @description 将命令转换为字符串
   * @returns {string} 字符串表示
   */
  toString(): string {
    return `UpdateUserProfileCommand(userId=${this.userId}, tenantId=${this.tenantId})`
  }
}
