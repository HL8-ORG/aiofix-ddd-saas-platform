/**
 * @interface IAuthService
 * @description
 * 认证服务接口，定义认证相关的业务操作。该接口定义了用户认证、
 * 会话管理、安全策略等核心功能。
 *
 * 主要功能：
 * 1. 用户注册和验证
 * 2. 用户登录和登出
 * 3. 令牌管理和刷新
 * 4. 会话管理
 * 5. 安全策略实施
 * 6. 多因素认证
 */
export interface IAuthService {
  /**
   * @method registerUser
   * @description 用户注册
   * @param {RegisterUserCommand} command - 注册命令
   * @returns {Promise<RegisterUserResult>} 注册结果
   */
  registerUser(command: RegisterUserCommand): Promise<RegisterUserResult>

  /**
   * @method registerUserWithVerification
   * @description 用户注册（需要验证）
   * @param {RegisterUserCommand} command - 注册命令
   * @returns {Promise<RegisterUserWithVerificationResult>} 注册结果
   */
  registerUserWithVerification(command: RegisterUserCommand): Promise<RegisterUserWithVerificationResult>

  /**
   * @method verifyUserEmail
   * @description 验证用户邮箱
   * @param {VerifyUserEmailCommand} command - 验证命令
   * @returns {Promise<VerifyUserEmailResult>} 验证结果
   */
  verifyUserEmail(command: VerifyUserEmailCommand): Promise<VerifyUserEmailResult>

  /**
   * @method loginUser
   * @description 用户登录
   * @param {LoginUserCommand} command - 登录命令
   * @returns {Promise<LoginUserResult>} 登录结果
   */
  loginUser(command: LoginUserCommand): Promise<LoginUserResult>

  /**
   * @method logoutUser
   * @description 用户登出
   * @param {LogoutUserCommand} command - 登出命令
   * @returns {Promise<LogoutUserResult>} 登出结果
   */
  logoutUser(command: LogoutUserCommand): Promise<LogoutUserResult>

  /**
   * @method refreshToken
   * @description 刷新访问令牌
   * @param {RefreshTokenCommand} command - 刷新令牌命令
   * @returns {Promise<RefreshTokenResult>} 刷新结果
   */
  refreshToken(command: RefreshTokenCommand): Promise<RefreshTokenResult>

  /**
   * @method validateSession
   * @description 验证会话
   * @param {ValidateSessionCommand} command - 验证会话命令
   * @returns {Promise<ValidateSessionResult>} 验证结果
   */
  validateSession(command: ValidateSessionCommand): Promise<ValidateSessionResult>

  /**
   * @method revokeSession
   * @description 撤销会话
   * @param {RevokeSessionCommand} command - 撤销会话命令
   * @returns {Promise<RevokeSessionResult>} 撤销结果
   */
  revokeSession(command: RevokeSessionCommand): Promise<RevokeSessionResult>

  /**
   * @method getUserSessions
   * @description 获取用户会话列表
   * @param {GetUserSessionsQuery} query - 查询参数
   * @returns {Promise<GetUserSessionsResult>} 查询结果
   */
  getUserSessions(query: GetUserSessionsQuery): Promise<GetUserSessionsResult>

  /**
   * @method checkLoginSecurity
   * @description 检查登录安全策略
   * @param {CheckLoginSecurityQuery} query - 查询参数
   * @returns {Promise<CheckLoginSecurityResult>} 检查结果
   */
  checkLoginSecurity(query: CheckLoginSecurityQuery): Promise<CheckLoginSecurityResult>

  /**
   * @method resetPassword
   * @description 重置密码
   * @param {ResetPasswordCommand} command - 重置密码命令
   * @returns {Promise<ResetPasswordResult>} 重置结果
   */
  resetPassword(command: ResetPasswordCommand): Promise<ResetPasswordResult>

  /**
   * @method changePassword
   * @description 修改密码
   * @param {ChangePasswordCommand} command - 修改密码命令
   * @returns {Promise<ChangePasswordResult>} 修改结果
   */
  changePassword(command: ChangePasswordCommand): Promise<ChangePasswordResult>

  /**
   * @method enableTwoFactorAuth
   * @description 启用双因素认证
   * @param {EnableTwoFactorAuthCommand} command - 启用双因素认证命令
   * @returns {Promise<EnableTwoFactorAuthResult>} 启用结果
   */
  enableTwoFactorAuth(command: EnableTwoFactorAuthCommand): Promise<EnableTwoFactorAuthResult>

  /**
   * @method verifyTwoFactorAuth
   * @description 验证双因素认证
   * @param {VerifyTwoFactorAuthCommand} command - 验证双因素认证命令
   * @returns {Promise<VerifyTwoFactorAuthResult>} 验证结果
   */
  verifyTwoFactorAuth(command: VerifyTwoFactorAuthCommand): Promise<VerifyTwoFactorAuthResult>
}

// 命令和查询接口定义
export interface RegisterUserCommand {
  email: string
  username: string
  password: string
  phoneNumber?: string
  tenantId: string
  firstName?: string
  lastName?: string
  deviceInfo: DeviceInfo
  locationInfo?: LocationInfo
}

export interface RegisterUserResult {
  success: boolean
  user?: any
  accessToken?: string
  refreshToken?: string
  sessionId?: string
  error?: string
}

export interface RegisterUserWithVerificationResult {
  success: boolean
  user?: any
  verificationRequired: boolean
  error?: string
}

export interface VerifyUserEmailCommand {
  userId: string
  verificationCode: string
  deviceInfo: DeviceInfo
  locationInfo?: LocationInfo
}

export interface VerifyUserEmailResult {
  success: boolean
  user?: any
  accessToken?: string
  refreshToken?: string
  sessionId?: string
  error?: string
}

export interface LoginUserCommand {
  email: string
  password: string
  tenantId: string
  deviceInfo: DeviceInfo
  locationInfo?: LocationInfo
  rememberMe?: boolean
}

export interface LoginUserResult {
  success: boolean
  user?: any
  accessToken?: string
  refreshToken?: string
  sessionId?: string
  requiresTwoFactor?: boolean
  error?: string
}

export interface LogoutUserCommand {
  sessionId: string
  userId: string
  tenantId: string
}

export interface LogoutUserResult {
  success: boolean
  error?: string
}

export interface RefreshTokenCommand {
  refreshToken: string
  deviceInfo: DeviceInfo
}

export interface RefreshTokenResult {
  success: boolean
  accessToken?: string
  refreshToken?: string
  error?: string
}

export interface ValidateSessionCommand {
  sessionId: string
  accessToken: string
}

export interface ValidateSessionResult {
  success: boolean
  isValid: boolean
  user?: any
  session?: any
  error?: string
}

export interface RevokeSessionCommand {
  sessionId: string
  userId: string
  tenantId: string
}

export interface RevokeSessionResult {
  success: boolean
  error?: string
}

export interface GetUserSessionsQuery {
  userId: string
  tenantId: string
  includeExpired?: boolean
}

export interface GetUserSessionsResult {
  success: boolean
  sessions?: any[]
  error?: string
}

export interface CheckLoginSecurityQuery {
  email: string
  tenantId: string
  ipAddress: string
}

export interface CheckLoginSecurityResult {
  success: boolean
  isAllowed: boolean
  reason?: string
  remainingAttempts?: number
  lockoutEndTime?: Date
  requiresCaptcha: boolean
  error?: string
}

export interface ResetPasswordCommand {
  email: string
  tenantId: string
}

export interface ResetPasswordResult {
  success: boolean
  error?: string
}

export interface ChangePasswordCommand {
  userId: string
  tenantId: string
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResult {
  success: boolean
  error?: string
}

export interface EnableTwoFactorAuthCommand {
  userId: string
  tenantId: string
  password: string
}

export interface EnableTwoFactorAuthResult {
  success: boolean
  qrCode?: string
  secret?: string
  error?: string
}

export interface VerifyTwoFactorAuthCommand {
  userId: string
  tenantId: string
  code: string
}

export interface VerifyTwoFactorAuthResult {
  success: boolean
  error?: string
}

export interface DeviceInfo {
  userAgent: string
  ipAddress: string
  deviceType?: string
  browser?: string
  os?: string
}

export interface LocationInfo {
  country?: string
  region?: string
  city?: string
  latitude?: number
  longitude?: number
}
