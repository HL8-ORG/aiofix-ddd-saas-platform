/**
 * @file security.service.interface.ts
 * @description 安全服务接口
 * 
 * 该接口定义了安全相关的服务，包括：
 * 1. 密码验证和哈希
 * 2. 登录安全检查
 * 3. 速率限制检查
 * 4. 双因素认证
 * 5. 重置令牌管理
 */
export interface SecurityService {
  /**
   * 验证密码强度
   * @param password 密码
   * @returns 验证结果
   */
  validatePassword(password: string): Promise<{ success: boolean; error?: string }>

  /**
   * 验证邮箱格式
   * @param email 邮箱地址
   * @returns 验证结果
   */
  validateEmail(email: string): Promise<{ success: boolean; error?: string }>

  /**
   * 验证用户名格式
   * @param username 用户名
   * @returns 验证结果
   */
  validateUsername(username: string): Promise<{ success: boolean; error?: string }>

  /**
   * 哈希密码
   * @param password 明文密码
   * @returns 哈希后的密码
   */
  hashPassword(password: string): Promise<string>

  /**
   * 验证密码
   * @param password 明文密码
   * @param hashedPassword 哈希密码
   * @returns 是否匹配
   */
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>

  /**
   * 检查登录安全
   * @param params 登录参数
   * @returns 安全检查结果
   */
  checkLoginSecurity(params: {
    email: string
    ipAddress: string
    deviceInfo: any
    tenantId: string
  }): Promise<{
    success: boolean
    isSecure?: boolean
    riskLevel?: string
    error?: string
  }>

  /**
   * 检查速率限制
   * @param params 速率限制参数
   * @returns 检查结果
   */
  checkRateLimit(params: {
    email: string
    ipAddress: string
    tenantId: string
  }): Promise<{
    success: boolean
    allowed: boolean
    remainingTime?: number
    error?: string
  }>

  /**
   * 生成双因素认证密钥
   * @param method 认证方法
   * @returns 密钥
   */
  generateTwoFactorSecret(method: string): Promise<string>

  /**
   * 生成双因素认证二维码
   * @param secret 密钥
   * @param email 邮箱
   * @param username 用户名
   * @returns 二维码数据
   */
  generateTwoFactorQRCode(secret: string, email: string, username: string): Promise<string>

  /**
   * 生成备用码
   * @param count 数量
   * @returns 备用码列表
   */
  generateBackupCodes(count: number): Promise<string[]>

  /**
   * 验证双因素认证码
   * @param code 验证码
   * @param secret 密钥
   * @returns 是否有效
   */
  verifyTwoFactorCode(code: string, secret: string): Promise<boolean>

  /**
   * 生成重置令牌
   * @param userId 用户ID
   * @param email 邮箱
   * @returns 重置令牌
   */
  generateResetToken(userId: string, email: string): Promise<string>

  /**
   * 验证重置令牌
   * @param token 重置令牌
   * @returns 验证结果
   */
  verifyResetToken(token: string): Promise<{
    success: boolean
    userId?: string
    error?: string
  }>
}
