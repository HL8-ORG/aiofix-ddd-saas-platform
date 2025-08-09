/**
 * @file token.service.interface.ts
 * @description 令牌服务接口
 * 
 * 该接口定义了令牌相关的服务，包括：
 * 1. JWT令牌生成和验证
 * 2. 刷新令牌管理
 * 3. 会话管理
 * 4. 令牌撤销
 */
export interface TokenService {
  /**
   * 生成访问令牌
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 访问令牌
   */
  generateAccessToken(userId: string, tenantId: string): Promise<string>

  /**
   * 生成刷新令牌
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 刷新令牌
   */
  generateRefreshToken(userId: string, tenantId: string): Promise<string>

  /**
   * 验证访问令牌
   * @param token 访问令牌
   * @returns 验证结果
   */
  verifyAccessToken(token: string): Promise<{
    success: boolean
    userId?: string
    tenantId?: string
    error?: string
  }>

  /**
   * 验证刷新令牌
   * @param token 刷新令牌
   * @returns 验证结果
   */
  verifyRefreshToken(token: string): Promise<{
    success: boolean
    userId?: string
    sessionId?: string
    error?: string
  }>

  /**
   * 撤销访问令牌
   * @param token 访问令牌
   * @returns 是否撤销成功
   */
  revokeAccessToken(token: string): Promise<boolean>

  /**
   * 撤销刷新令牌
   * @param token 刷新令牌
   * @returns 是否撤销成功
   */
  revokeRefreshToken(token: string): Promise<boolean>

  /**
   * 创建会话
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @param deviceInfo 设备信息
   * @returns 会话ID
   */
  createSession(userId: string, tenantId: string, deviceInfo: any): Promise<string>

  /**
   * 验证会话
   * @param sessionId 会话ID
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 验证结果
   */
  validateSession(sessionId: string, userId: string, tenantId: string): Promise<{
    success: boolean
    session?: any
    error?: string
  }>

  /**
   * 撤销会话
   * @param sessionId 会话ID
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 是否撤销成功
   */
  revokeSession(sessionId: string, userId: string, tenantId: string): Promise<boolean>

  /**
   * 撤销用户所有会话
   * @param userId 用户ID
   * @param tenantId 租户ID
   * @returns 撤销的会话数量
   */
  revokeAllUserSessions(userId: string, tenantId: string): Promise<number>

  /**
   * 获取令牌信息
   * @param token 令牌
   * @returns 令牌信息
   */
  getTokenInfo(token: string): Promise<{
    userId: string
    tenantId: string
    issuedAt: Date
    expiresAt: Date
    type: string
  } | null>
}
