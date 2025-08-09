/**
 * @file audit.service.interface.ts
 * @description 审计服务接口
 * 
 * 该接口定义了审计相关的服务，包括：
 * 1. 用户行为审计
 * 2. 安全事件记录
 * 3. 操作日志管理
 * 4. 审计报告生成
 */
export interface AuditService {
  /**
   * 记录审计日志
   * @param params 审计参数
   * @returns 是否记录成功
   */
  log(params: {
    action: string
    userId?: string
    sessionId?: string
    tenantId?: string
    details?: any
    timestamp?: Date
  }): Promise<void>

  /**
   * 记录用户登录事件
   * @param params 登录参数
   * @returns 是否记录成功
   */
  logLogin(params: {
    userId: string
    sessionId: string
    tenantId: string
    deviceInfo: any
    ipAddress: string
    success: boolean
    failureReason?: string
  }): Promise<void>

  /**
   * 记录用户登出事件
   * @param params 登出参数
   * @returns 是否记录成功
   */
  logLogout(params: {
    userId: string
    sessionId: string
    tenantId: string
    reason: string
    deviceInfo: any
  }): Promise<void>

  /**
   * 记录密码变更事件
   * @param params 密码变更参数
   * @returns 是否记录成功
   */
  logPasswordChange(params: {
    userId: string
    tenantId: string
    deviceInfo: any
    ipAddress: string
    changeType: 'reset' | 'update'
  }): Promise<void>

  /**
   * 记录双因素认证事件
   * @param params 双因素认证参数
   * @returns 是否记录成功
   */
  logTwoFactorAuth(params: {
    userId: string
    tenantId: string
    action: 'enable' | 'disable' | 'verify'
    method: string
    success: boolean
    deviceInfo: any
  }): Promise<void>

  /**
   * 记录安全事件
   * @param params 安全事件参数
   * @returns 是否记录成功
   */
  logSecurityEvent(params: {
    userId?: string
    tenantId?: string
    eventType: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    description: string
    details: any
  }): Promise<void>

  /**
   * 获取用户审计日志
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 审计日志列表
   */
  getUserAuditLogs(
    userId: string,
    tenantId: string,
    limit?: number,
    offset?: number
  ): Promise<Array<{
    id: string
    action: string
    timestamp: Date
    details: any
  }>>

  /**
   * 获取租户审计日志
   * @param tenantId 租户ID
   * @param limit 限制数量
   * @param offset 偏移量
   * @returns 审计日志列表
   */
  getTenantAuditLogs(
    tenantId: string,
    limit?: number,
    offset?: number
  ): Promise<Array<{
    id: string
    action: string
    userId?: string
    timestamp: Date
    details: any
  }>>

  /**
   * 清理过期审计日志
   * @param daysToKeep 保留天数
   * @returns 清理的日志数量
   */
  cleanupExpiredLogs(daysToKeep: number): Promise<number>
}
