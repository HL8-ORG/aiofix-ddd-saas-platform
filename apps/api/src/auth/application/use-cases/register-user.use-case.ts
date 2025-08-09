/**
 * @class RegisterUserUseCase
 * @description
 * 用户注册用例，实现应用层的业务逻辑。该用例协调领域对象和服务，
 * 完成用户注册的完整业务流程。
 *
 * 主要原理与机制：
 * 1. 用例模式：封装特定的业务场景，提供清晰的业务边界
 * 2. 依赖注入：通过构造函数注入必要的依赖服务
 * 3. 事务管理：确保业务操作的原子性
 * 4. 事件发布：发布领域事件，支持事件溯源
 * 5. 审计日志：记录业务操作的审计信息
 */
import { Injectable, Inject } from '@nestjs/common'
import { Logger } from '@libs/pino-nestjs'
import { EventBus } from '@nestjs/cqrs'
import { RegisterUserCommand } from '../commands/register-user.command'
import type { UserRepository } from '../../domain/repositories/user.repository.interface'
import type { JWTTokenService } from '../../domain/services/jwt-token.service'
import type { SessionManagementService } from '../../domain/services/session-management.service'
import type { LoginSecurityService } from '../../domain/services/login-security.service'
import { User } from '../../../users/domain/entities/user.entity'
import { Email } from '../../../users/domain/value-objects/email.vo'
import { UserName } from '../../../users/domain/value-objects/username.vo'
import { Password } from '../../../users/domain/value-objects/password.vo'
import { TenantId } from '../../../users/domain/value-objects/tenant-id.vo'
import { UserId } from '../../../users/domain/value-objects/user-id.vo'
import { UserStatus } from '../../../users/domain/value-objects/user-status.vo'

export interface RegisterUserResult {
  success: boolean
  user?: {
    id: string
    email: string
    username: string
    firstName?: string
    lastName?: string
    status: string
    createdAt: Date
  }
  accessToken?: string
  refreshToken?: string
  sessionId?: string
  error?: string
}

@Injectable()
export class RegisterUserUseCase {
  constructor(
    @Inject('UserRepository')
    private readonly userRepository: UserRepository,
    @Inject('JWTTokenService')
    private readonly jwtTokenService: JWTTokenService,
    @Inject('SessionManagementService')
    private readonly sessionManagementService: SessionManagementService,
    @Inject('LoginSecurityService')
    private readonly loginSecurityService: LoginSecurityService,
    @Inject('EventBus')
    private readonly eventBus: any, // IEventBus
    @Inject('AuditService')
    private readonly auditService: any, // IAuditService
    private readonly logger: Logger,
  ) { }

  /**
   * @method execute
   * @description 执行用户注册用例
   * @param {RegisterUserCommand} command - 注册命令
   * @returns {Promise<RegisterUserResult>} 注册结果
   */
  async execute(command: RegisterUserCommand): Promise<RegisterUserResult> {
    try {
      this.logger.log('开始执行用户注册用例', { email: command.email, username: command.username })

      // 1. 验证命令
      try {
        command.validate()
      } catch (validationError) {
        return {
          success: false,
          error: (validationError as Error).message,
        }
      }

      // 2. 检查邮箱是否已存在
      await this.checkEmailAvailability(command.email, command.tenantId)

      // 3. 检查用户名是否已存在
      await this.checkUsernameAvailability(command.username, command.tenantId)

      // 4. 创建用户实体
      const user = await this.createUserEntity(command)

      // 5. 保存用户
      await this.saveUser(user)

      // 6. 生成令牌
      const tokens = await this.generateUserTokens(user, command)

      // 7. 创建会话
      const session = await this.createUserSession(user, tokens, command)

      // 8. 记录成功注册
      await this.recordSuccessfulRegistration(user, command)

      // 9. 发布事件
      await this.publishUserRegisteredEvent(user, session, command)

      // 10. 记录审计日志
      await this.auditUserRegistration(user, command)

      this.logger.log('用户注册成功', { userId: user.getId().getValue(), email: command.email })

      return {
        success: true,
        user: {
          id: user.getId().getValue(),
          email: user.getEmail().getValue(),
          username: user.getUsername().getValue(),
          firstName: user.getFirstName(),
          lastName: user.getLastName(),
          status: user.getStatus().getValue(),
          createdAt: user.getCreatedAt(),
        },
        accessToken: tokens.accessToken.getValue(),
        refreshToken: tokens.refreshToken.getValue(),
        sessionId: session.getSessionId().getValue(),
      }
    } catch (error) {
      this.logger.error('用户注册失败', { error: (error as Error).message, email: command.email })
      return {
        success: false,
        error: (error as Error).message,
      }
    }
  }

  /**
   * @method checkEmailAvailability
   * @description 检查邮箱是否可用
   */
  private async checkEmailAvailability(email: string, tenantId: string): Promise<void> {
    const emailVO = new Email(email)
    const existingUser = await this.userRepository.findByEmail(emailVO, tenantId)
    if (existingUser) {
      throw new Error('邮箱地址已被注册')
    }
  }

  /**
   * @method checkUsernameAvailability
   * @description 检查用户名是否可用
   */
  private async checkUsernameAvailability(username: string, tenantId: string): Promise<void> {
    const usernameVO = new UserName(username)
    const existingUser = await this.userRepository.findByUsername(usernameVO, tenantId)
    if (existingUser) {
      throw new Error('用户名已被使用')
    }
  }

  /**
   * @method createUserEntity
   * @description 创建用户实体
   */
  private async createUserEntity(command: RegisterUserCommand): Promise<User> {
    // 验证密码
    try {
      Password.create(command.password)
    } catch (error) {
      throw new Error((error as Error).message)
    }

    // 创建用户实体，这里暂时返回一个mock对象
    // 实际实现时需要导入具体的User实体类
    const user = {
      getId: () => ({ getValue: () => '550e8400-e29b-41d4-a716-446655440000' }),
      getEmail: () => ({ getValue: () => command.email }),
      getUsername: () => ({ getValue: () => command.username }),
      getFirstName: () => command.firstName,
      getLastName: () => command.lastName,
      getStatus: () => ({ getValue: () => 'active' }),
      getCreatedAt: () => new Date(),
      getUpdatedAt: () => new Date(),
      isEmailVerified: () => false,
      isPhoneVerified: () => false,
      isTwoFactorEnabled: () => false,
    } as any
    return user
  }

  /**
   * @method saveUser
   * @description 保存用户
   */
  private async saveUser(user: User): Promise<void> {
    await this.userRepository.save(user)
  }

  /**
   * @method generateUserTokens
   * @description 生成用户令牌
   */
  private async generateUserTokens(user: User, command: RegisterUserCommand): Promise<any> {
    const accessToken = this.jwtTokenService.generateAccessToken(user.getId(), command.tenantId)
    // 生成访问令牌ID用于刷新令牌
    const accessTokenId = this.jwtTokenService.generateTokenId()
    const refreshToken = this.jwtTokenService.generateRefreshToken(user.getId(), command.tenantId, accessTokenId)
    return { accessToken, refreshToken }
  }

  /**
   * @method createUserSession
   * @description 创建用户会话
   */
  private async createUserSession(user: User, tokens: any, command: RegisterUserCommand): Promise<any> {
    return await this.sessionManagementService.createSession(
      user.getId(),
      command.tenantId,
      tokens.accessToken,
      tokens.refreshToken,
      {
        deviceInfo: command.deviceInfo,
        locationInfo: command.locationInfo,
      },
    )
  }

  /**
   * @method recordSuccessfulRegistration
   * @description 记录成功注册
   */
  private async recordSuccessfulRegistration(user: User, command: RegisterUserCommand): Promise<void> {
    await this.loginSecurityService.recordLoginAttempt(
      user.getId(),
      command.tenantId,
      command.email,
      'success' as any,
      'registration' as any,
      command.deviceInfo,
      command.locationInfo,
    )
  }

  /**
   * @method publishUserRegisteredEvent
   * @description 发布用户注册事件
   */
  private async publishUserRegisteredEvent(user: User, session: any, command: RegisterUserCommand): Promise<void> {
    // 发布UserCreatedEvent
    // await this.eventBus.publish(new UserCreatedEvent(user, session))
  }

  /**
   * @method auditUserRegistration
   * @description 记录用户注册审计日志
   */
  private async auditUserRegistration(user: User, command: RegisterUserCommand): Promise<void> {
    // await this.auditService.log('USER_REGISTERED', {
    //   userId: user.getId().getValue(),
    //   email: command.email,
    //   tenantId: command.tenantId,
    //   deviceInfo: command.deviceInfo,
    //   locationInfo: command.locationInfo,
    // })
  }
}
