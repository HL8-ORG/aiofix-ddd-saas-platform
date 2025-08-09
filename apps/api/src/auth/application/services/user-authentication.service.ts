import { User } from 'src/users/domain/entities/user.entity'
import { UserRepository } from 'src/users/domain/repositories/user.repository.interface'
import { Password } from 'src/users/domain/value-objects/password.vo'
import { Email } from 'src/users/domain/value-objects/email.vo'
import { UserName } from 'src/users/domain/value-objects/username.vo'
import { UserId } from 'src/users/domain/value-objects/user-id.vo'

/**
 * @interface AuthenticationResult
 * @description 用户认证结果接口
 */
export interface AuthenticationResult {
  success: boolean
  user?: User
  error?: string
  requiresMFA?: boolean
  loginAttempts?: number
}

/**
 * @class UserAuthenticationService
 * @description
 * 认证编排服务（应用层）。负责登录验证流程的编排与边界校验，
 * 依赖用户聚合的领域能力（如 verifyPassword、状态检查），不关心持久化实现。
 *
 * 原理与机制：
 * 1. 读取用户（email/username）→ 校验状态（激活/锁定）→ 校验密码（聚合内）
 * 2. 管理登录尝试计数与锁定策略（通过聚合方法与持久化保存）
 * 3. 可插拔扩展 MFA、风控、审计等能力（后续在 Auth 模块内集成）
 */
export class UserAuthenticationService {
  private readonly userRepository: UserRepository
  private readonly maxLoginAttempts: number
  private readonly lockDurationMinutes: number

  constructor(userRepository: UserRepository, maxLoginAttempts: number = 5, lockDurationMinutes: number = 30) {
    this.userRepository = userRepository
    this.maxLoginAttempts = maxLoginAttempts
    this.lockDurationMinutes = lockDurationMinutes
  }

  async authenticateByEmail(email: string, password: string, tenantId: string): Promise<AuthenticationResult> {
    try {
      const user = await this.userRepository.findByEmail(new Email(email), tenantId)
      if (!user) {
        return { success: false, error: 'Invalid email or password' }
      }
      return await this.performAuthentication(user, password)
    } catch {
      return { success: false, error: 'Authentication failed' }
    }
  }

  async authenticateByUsername(username: string, password: string, tenantId: string): Promise<AuthenticationResult> {
    try {
      const user = await this.userRepository.findByUsername(new UserName(username), tenantId)
      if (!user) {
        return { success: false, error: 'Invalid username or password' }
      }
      return await this.performAuthentication(user, password)
    } catch {
      return { success: false, error: 'Authentication failed' }
    }
  }

  private async performAuthentication(user: User, password: string): Promise<AuthenticationResult> {
    if (!user.getStatus().isActive()) {
      return { success: false, error: 'User account is not activated' }
    }

    if (user.getStatus().isLocked()) {
      const lockUntil = user.getLockedUntil()
      if (lockUntil && lockUntil > new Date()) {
        return { success: false, error: `Account is locked until ${lockUntil.toISOString()}` }
      }
      user.unlock()
    }

    const loginAttempts = user.getLoginAttempts()
    if (loginAttempts >= this.maxLoginAttempts) {
      const lockUntil = new Date()
      lockUntil.setMinutes(lockUntil.getMinutes() + this.lockDurationMinutes)
      user.lock('Too many failed login attempts', lockUntil)
      await this.userRepository.save(user)
      return { success: false, error: `Account locked due to too many failed attempts. Try again after ${this.lockDurationMinutes} minutes.` }
    }

    if (!user.verifyPassword(password)) {
      await this.userRepository.save(user)
      return { success: false, error: 'Invalid email or password', loginAttempts: user.getLoginAttempts() }
    }

    await this.userRepository.save(user)
    const requiresMFA = false
    return { success: true, user, requiresMFA }
  }

  validatePassword(password: string): boolean {
    try {
      Password.create(password)
      return true
    } catch {
      return false
    }
  }

  checkUserStatus(user: User): AuthenticationResult {
    if (!user.getStatus().isActive()) {
      return { success: false, error: 'User account is not activated' }
    }

    if (user.getStatus().isLocked()) {
      const lockUntil = user.getLockedUntil()
      if (lockUntil && lockUntil > new Date()) {
        return { success: false, error: `Account is locked until ${lockUntil.toISOString()}` }
      }
    }

    return { success: true, user }
  }

  async getLoginAttempts(userId: string, tenantId: string): Promise<number> {
    try {
      const typedUserId = UserId.fromString(userId)
      const user = await this.userRepository.findById(typedUserId, tenantId)
      return user ? user.getLoginAttempts() : 0
    } catch {
      return 0
    }
  }

  async resetLoginAttempts(userId: string, tenantId: string): Promise<void> {
    try {
      const typedUserId = UserId.fromString(userId)
      const user = await this.userRepository.findById(typedUserId, tenantId)
      if (user) {
        await this.userRepository.save(user)
      }
    } catch {
      // ignore invalid userId
    }
  }
}


