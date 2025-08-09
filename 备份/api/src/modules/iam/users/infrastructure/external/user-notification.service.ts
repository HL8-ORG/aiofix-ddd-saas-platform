import { Inject, Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import type { UserInfrastructureConfig } from '../config/user-infrastructure.config'

/**
 * @interface NotificationPayload
 * @description
 * 通知载荷接口，定义通知消息的结构。
 *
 * 主要字段：
 * 1. type: 通知类型
 * 2. title: 通知标题
 * 3. message: 通知内容
 * 4. data: 附加数据
 * 5. recipients: 接收者列表
 */
export interface NotificationPayload {
  type: string
  title: string
  message: string
  data?: Record<string, any>
  recipients: string[]
  tenantId: string
}

/**
 * @interface NotificationResult
 * @description
 * 通知结果接口，定义通知发送的结果。
 *
 * 主要字段：
 * 1. success: 是否成功
 * 2. messageId: 消息ID
 * 3. error?: 错误信息
 */
export interface NotificationResult {
  success: boolean
  messageId?: string
  error?: string
}

/**
 * @class UserNotificationService
 * @description
 * 用户通知服务，负责用户相关的通知发送。
 * 支持多种通知类型：用户创建、状态变更、密码重置等。
 *
 * 主要功能：
 * 1. 用户创建通知：新用户注册成功通知
 * 2. 状态变更通知：用户激活、暂停、删除等状态变更通知
 * 3. 密码重置通知：密码重置链接发送
 * 4. 安全通知：登录异常、账户锁定等安全相关通知
 * 5. 批量通知：支持批量发送通知
 *
 * 主要原理与机制：
 * 1. 通过HTTP客户端调用外部通知服务
 * 2. 支持异步通知发送，不阻塞主业务流程
 * 3. 提供通知发送重试机制
 * 4. 支持通知模板和个性化内容
 */
@Injectable()
export class UserNotificationService {
  private readonly logger = new Logger(UserNotificationService.name)
  private readonly config: UserInfrastructureConfig

  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {
    this.config =
      this.configService.get<UserInfrastructureConfig>('userInfrastructure')
  }

  /**
   * @method sendNotification
   * @description 发送通知
   * @param payload 通知载荷
   * @returns 通知发送结果
   */
  async sendNotification(
    payload: NotificationPayload,
  ): Promise<NotificationResult> {
    if (!this.config.external.notification.enabled) {
      this.logger.debug('通知服务已禁用，跳过通知发送')
      return { success: true, messageId: 'disabled' }
    }

    try {
      // 这里应该调用实际的通知服务
      // 目前使用模拟实现
      const result = await this.callNotificationService(payload)

      this.logger.log(
        `通知发送成功: ${payload.type} -> ${payload.recipients.join(', ')}`,
      )
      return result
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error)
      const errorStack = error instanceof Error ? error.stack : undefined
      this.logger.error(`通知发送失败: ${errorMessage}`, errorStack)
      return {
        success: false,
        error: errorMessage,
      }
    }
  }

  /**
   * @method notifyUserCreated
   * @description 发送用户创建通知
   * @param userId 用户ID
   * @param username 用户名
   * @param email 邮箱
   * @param tenantId 租户ID
   * @param adminUserId 创建者ID
   * @returns 通知结果
   */
  async notifyUserCreated(
    userId: string,
    username: string,
    email: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<NotificationResult> {
    const payload: NotificationPayload = {
      type: 'USER_CREATED',
      title: '用户创建成功',
      message: `用户 ${username} 已成功创建`,
      data: {
        userId,
        username,
        email,
        tenantId,
        adminUserId,
      },
      recipients: [adminUserId],
      tenantId,
    }

    return this.sendNotification(payload)
  }

  /**
   * @method notifyUserStatusChanged
   * @description 发送用户状态变更通知
   * @param userId 用户ID
   * @param username 用户名
   * @param oldStatus 原状态
   * @param newStatus 新状态
   * @param tenantId 租户ID
   * @param adminUserId 操作者ID
   * @returns 通知结果
   */
  async notifyUserStatusChanged(
    userId: string,
    username: string,
    oldStatus: string,
    newStatus: string,
    tenantId: string,
    adminUserId: string,
  ): Promise<NotificationResult> {
    const statusMessages = {
      ACTIVE: '用户已激活',
      SUSPENDED: '用户已暂停',
      DELETED: '用户已删除',
      RESTORED: '用户已恢复',
    }

    const payload: NotificationPayload = {
      type: 'USER_STATUS_CHANGED',
      title: '用户状态变更',
      message: `${username}: ${statusMessages[newStatus as keyof typeof statusMessages] || '状态已变更'}`,
      data: {
        userId,
        username,
        oldStatus,
        newStatus,
        tenantId,
        adminUserId,
      },
      recipients: [adminUserId, userId],
      tenantId,
    }

    return this.sendNotification(payload)
  }

  /**
   * @method notifyPasswordReset
   * @description 发送密码重置通知
   * @param userId 用户ID
   * @param username 用户名
   * @param email 邮箱
   * @param resetToken 重置令牌
   * @param tenantId 租户ID
   * @returns 通知结果
   */
  async notifyPasswordReset(
    userId: string,
    username: string,
    email: string,
    resetToken: string,
    tenantId: string,
  ): Promise<NotificationResult> {
    const payload: NotificationPayload = {
      type: 'PASSWORD_RESET',
      title: '密码重置请求',
      message: `您的密码重置链接已生成，请查收邮件`,
      data: {
        userId,
        username,
        email,
        resetToken,
        tenantId,
        resetUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`,
      },
      recipients: [userId],
      tenantId,
    }

    return this.sendNotification(payload)
  }

  /**
   * @method notifyLoginAttempt
   * @description 发送登录尝试通知
   * @param userId 用户ID
   * @param username 用户名
   * @param email 邮箱
   * @param success 是否成功
   * @param ipAddress IP地址
   * @param userAgent 用户代理
   * @param tenantId 租户ID
   * @returns 通知结果
   */
  async notifyLoginAttempt(
    userId: string,
    username: string,
    email: string,
    success: boolean,
    ipAddress: string,
    userAgent: string,
    tenantId: string,
  ): Promise<NotificationResult> {
    const payload: NotificationPayload = {
      type: success ? 'LOGIN_SUCCESS' : 'LOGIN_FAILED',
      title: success ? '登录成功' : '登录失败',
      message: success
        ? `用户 ${username} 登录成功`
        : `检测到用户 ${username} 的登录失败尝试`,
      data: {
        userId,
        username,
        email,
        success,
        ipAddress,
        userAgent,
        tenantId,
        timestamp: new Date().toISOString(),
      },
      recipients: success ? [userId] : [userId], // 失败时也通知用户
      tenantId,
    }

    return this.sendNotification(payload)
  }

  /**
   * @method notifyAccountLocked
   * @description 发送账户锁定通知
   * @param userId 用户ID
   * @param username 用户名
   * @param email 邮箱
   * @param reason 锁定原因
   * @param lockoutDuration 锁定持续时间
   * @param tenantId 租户ID
   * @returns 通知结果
   */
  async notifyAccountLocked(
    userId: string,
    username: string,
    email: string,
    reason: string,
    lockoutDuration: number,
    tenantId: string,
  ): Promise<NotificationResult> {
    const payload: NotificationPayload = {
      type: 'ACCOUNT_LOCKED',
      title: '账户已锁定',
      message: `您的账户因 ${reason} 已被锁定 ${lockoutDuration} 分钟`,
      data: {
        userId,
        username,
        email,
        reason,
        lockoutDuration,
        tenantId,
        unlockTime: new Date(
          Date.now() + lockoutDuration * 60 * 1000,
        ).toISOString(),
      },
      recipients: [userId],
      tenantId,
    }

    return this.sendNotification(payload)
  }

  /**
   * @method notifySecurityAlert
   * @description 发送安全警报通知
   * @param userId 用户ID
   * @param username 用户名
   * @param alertType 警报类型
   * @param details 详细信息
   * @param tenantId 租户ID
   * @returns 通知结果
   */
  async notifySecurityAlert(
    userId: string,
    username: string,
    alertType: string,
    details: Record<string, any>,
    tenantId: string,
  ): Promise<NotificationResult> {
    const alertMessages = {
      SUSPICIOUS_ACTIVITY: '检测到可疑活动',
      MULTIPLE_FAILED_LOGINS: '多次登录失败',
      UNUSUAL_LOCATION: '异常登录位置',
      PASSWORD_EXPIRING: '密码即将过期',
    }

    const payload: NotificationPayload = {
      type: 'SECURITY_ALERT',
      title: '安全警报',
      message: `${alertMessages[alertType as keyof typeof alertMessages] || '安全警报'}: ${username}`,
      data: {
        userId,
        username,
        alertType,
        details,
        tenantId,
        timestamp: new Date().toISOString(),
      },
      recipients: [userId],
      tenantId,
    }

    return this.sendNotification(payload)
  }

  /**
   * @method sendBulkNotification
   * @description 发送批量通知
   * @param payloads 通知载荷数组
   * @returns 批量通知结果
   */
  async sendBulkNotification(
    payloads: NotificationPayload[],
  ): Promise<NotificationResult[]> {
    const results: NotificationResult[] = []

    for (const payload of payloads) {
      try {
        const result = await this.sendNotification(payload)
        results.push(result)
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : String(error)
        this.logger.error(`批量通知发送失败: ${errorMessage}`)
        results.push({
          success: false,
          error: errorMessage,
        })
      }
    }

    return results
  }

  /**
   * @private
   * @method callNotificationService
   * @description 调用外部通知服务
   * @param payload 通知载荷
   * @returns 通知结果
   */
  private async callNotificationService(
    payload: NotificationPayload,
  ): Promise<NotificationResult> {
    // 模拟外部服务调用
    // 在实际实现中，这里应该使用HTTP客户端调用真实的通知服务
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          messageId: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        })
      }, 100) // 模拟网络延迟
    })
  }
}
