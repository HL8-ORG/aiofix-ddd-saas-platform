/**
 * @file email.service.interface.ts
 * @description 邮件服务接口
 * 
 * 该接口定义了邮件相关的服务，包括：
 * 1. 验证邮件发送
 * 2. 密码重置邮件
 * 3. 双因素认证邮件
 * 4. 通知邮件
 */
export interface EmailService {
  /**
   * 发送验证邮件
   * @param email 邮箱地址
   * @param token 验证令牌
   * @param tenantId 租户ID
   * @returns 是否发送成功
   */
  sendVerificationEmail(email: string, token: string, tenantId: string): Promise<boolean>

  /**
   * 发送欢迎邮件
   * @param email 邮箱地址
   * @param username 用户名
   * @param tenantId 租户ID
   * @returns 是否发送成功
   */
  sendWelcomeEmail(email: string, username: string, tenantId: string): Promise<boolean>

  /**
   * 发送密码重置邮件
   * @param email 邮箱地址
   * @param token 重置令牌
   * @param tenantId 租户ID
   * @returns 是否发送成功
   */
  sendPasswordResetEmail(email: string, token: string, tenantId: string): Promise<boolean>

  /**
   * 发送密码变更通知邮件
   * @param email 邮箱地址
   * @param tenantId 租户ID
   * @returns 是否发送成功
   */
  sendPasswordChangedEmail(email: string, tenantId: string): Promise<boolean>

  /**
   * 发送双因素认证设置邮件
   * @param email 邮箱地址
   * @param method 认证方法
   * @param tenantId 租户ID
   * @returns 是否发送成功
   */
  sendTwoFactorSetupEmail(email: string, method: string, tenantId: string): Promise<boolean>

  /**
   * 发送双因素认证验证邮件
   * @param email 邮箱地址
   * @param code 验证码
   * @param tenantId 租户ID
   * @returns 是否发送成功
   */
  sendTwoFactorVerificationEmail(email: string, code: string, tenantId: string): Promise<boolean>

  /**
   * 发送账户锁定通知邮件
   * @param email 邮箱地址
   * @param reason 锁定原因
   * @param tenantId 租户ID
   * @returns 是否发送成功
   */
  sendAccountLockedEmail(email: string, reason: string, tenantId: string): Promise<boolean>

  /**
   * 发送账户解锁通知邮件
   * @param email 邮箱地址
   * @param tenantId 租户ID
   * @returns 是否发送成功
   */
  sendAccountUnlockedEmail(email: string, tenantId: string): Promise<boolean>

  /**
   * 发送安全警报邮件
   * @param email 邮箱地址
   * @param alertType 警报类型
   * @param details 详细信息
   * @param tenantId 租户ID
   * @returns 是否发送成功
   */
  sendSecurityAlertEmail(
    email: string,
    alertType: string,
    details: any,
    tenantId: string
  ): Promise<boolean>

  /**
   * 发送通用通知邮件
   * @param email 邮箱地址
   * @param subject 邮件主题
   * @param content 邮件内容
   * @param tenantId 租户ID
   * @returns 是否发送成功
   */
  sendNotificationEmail(
    email: string,
    subject: string,
    content: string,
    tenantId: string
  ): Promise<boolean>

  /**
   * 验证邮箱地址
   * @param email 邮箱地址
   * @returns 是否有效
   */
  validateEmail(email: string): Promise<boolean>

  /**
   * 检查邮件发送状态
   * @param messageId 消息ID
   * @returns 发送状态
   */
  checkDeliveryStatus(messageId: string): Promise<{
    delivered: boolean
    status: string
    timestamp?: Date
  }>
}
