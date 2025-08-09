import { Injectable } from '@nestjs/common';
import { User } from '../../../users/domain/entities/user.entity';
import { UserId } from '../../../users/domain/value-objects/user-id.vo';
import { Email } from '../../../users/domain/value-objects/email.vo';
import { Password } from '../../../users/domain/value-objects/password.vo';
import { UserName } from '../../../users/domain/value-objects/username.vo';
import { PhoneNumber } from '../../../users/domain/value-objects/phone-number.vo';
import { UserStatus } from '../../../users/domain/value-objects/user-status.vo';
import type { UserRepository } from '../../../users/domain/repositories/user.repository.interface';
import { JWTTokenService } from '../../domain/services/jwt-token.service';
import { SessionManagementService } from '../../domain/services/session-management.service';
import { LoginSecurityService } from '../../domain/services/login-security.service';
import { DuplicateUserException } from '../../../users/domain/exceptions/user.exception';

export interface RegisterUserDto {
  email: string;
  username: string;
  password: string;
  phoneNumber?: string;
  tenantId: string;
  firstName?: string;
  lastName?: string;
}

export interface RegisterUserResult {
  user: User;
  accessToken: string;
  refreshToken: string;
  sessionId: string;
}

export interface DeviceInfo {
  userAgent: string;
  ipAddress: string;
  deviceType?: string;
  browser?: string;
  os?: string;
}

export interface LocationInfo {
  country?: string;
  region?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
}

@Injectable()
export class UserRegistrationService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly jwtTokenService: JWTTokenService,
    private readonly sessionManagementService: SessionManagementService,
    private readonly loginSecurityService: LoginSecurityService,
  ) { }

  async registerUser(
    registerData: RegisterUserDto,
    deviceInfo: DeviceInfo,
    locationInfo?: LocationInfo,
  ): Promise<RegisterUserResult> {
    // 检查邮箱是否已存在
    const existingUserByEmail = await this.userRepository.findByEmail(
      new Email(registerData.email),
      registerData.tenantId,
    );
    if (existingUserByEmail) {
      throw new DuplicateUserException(`User with email ${registerData.email} already exists`);
    }

    // 检查用户名是否已存在
    const existingUserByUsername = await this.userRepository.findByUsername(
      new UserName(registerData.username),
      registerData.tenantId,
    );
    if (existingUserByUsername) {
      throw new DuplicateUserException(`User with username ${registerData.username} already exists`);
    }

    // 创建用户
    const user = User.create({
      email: new Email(registerData.email),
      username: new UserName(registerData.username),
      password: Password.create(registerData.password),
      phoneNumber: registerData.phoneNumber ? new PhoneNumber(registerData.phoneNumber) : undefined,
      tenantId: registerData.tenantId,
      status: UserStatus.pending(),
    });

    // 保存用户
    const savedUser = await this.userRepository.save(user);

    // 生成令牌
    const userId = savedUser.getId();
    const accessToken = this.jwtTokenService.generateAccessToken(userId, registerData.tenantId);
    const refreshToken = this.jwtTokenService.generateRefreshToken(
      userId,
      registerData.tenantId,
      accessToken.getValue(),
    );

    // 创建会话
    const session = await this.sessionManagementService.createSession(
      userId,
      registerData.tenantId,
      accessToken,
      refreshToken,
      {
        deviceInfo,
        locationInfo,
        maxSessionsPerUser: 5, // 每个用户最多5个活跃会话
      },
    );

    // 记录注册成功的登录尝试
    await this.loginSecurityService.recordLoginAttempt(
      userId,
      registerData.tenantId,
      registerData.email,
      'success' as any,
      'password' as any,
      deviceInfo,
      locationInfo,
    );

    return {
      user: savedUser,
      accessToken: accessToken.getValue(),
      refreshToken: refreshToken.getValue(),
      sessionId: session.getSessionId().getValue(),
    };
  }

  async registerUserWithVerification(
    registerData: RegisterUserDto,
    deviceInfo: DeviceInfo,
    locationInfo?: LocationInfo,
  ): Promise<{ user: User; verificationRequired: boolean }> {
    // 检查邮箱是否已存在
    const existingUserByEmail = await this.userRepository.findByEmail(
      new Email(registerData.email),
      registerData.tenantId,
    );
    if (existingUserByEmail) {
      throw new DuplicateUserException(`User with email ${registerData.email} already exists`);
    }

    // 检查用户名是否已存在
    const existingUserByUsername = await this.userRepository.findByUsername(
      new UserName(registerData.username),
      registerData.tenantId,
    );
    if (existingUserByUsername) {
      throw new DuplicateUserException(`User with username ${registerData.username} already exists`);
    }

    // 创建用户（待验证状态）
    const user = User.create({
      email: new Email(registerData.email),
      username: new UserName(registerData.username),
      password: Password.create(registerData.password),
      phoneNumber: registerData.phoneNumber ? new PhoneNumber(registerData.phoneNumber) : undefined,
      tenantId: registerData.tenantId,
      status: UserStatus.pending(),
    });

    // 保存用户
    const savedUser = await this.userRepository.save(user);

    return {
      user: savedUser,
      verificationRequired: true,
    };
  }

  async verifyUserEmail(
    userId: string,
    verificationCode: string,
    deviceInfo: DeviceInfo,
    locationInfo?: LocationInfo,
  ): Promise<RegisterUserResult> {
    const user = await this.userRepository.findById(UserId.fromString(userId));
    if (!user) {
      throw new Error('User not found');
    }

    // 这里应该验证验证码
    // 为了演示，我们假设验证码正确
    if (verificationCode !== '123456') {
      throw new Error('Invalid verification code');
    }

    // 激活用户
    user.activate();
    const savedUser = await this.userRepository.save(user);

    // 生成令牌
    const accessToken = this.jwtTokenService.generateAccessToken(savedUser.getId(), savedUser.getTenantId());
    const refreshToken = this.jwtTokenService.generateRefreshToken(
      savedUser.getId(),
      savedUser.getTenantId(),
      accessToken.getValue(),
    );

    // 创建会话
    const session = await this.sessionManagementService.createSession(
      savedUser.getId(),
      savedUser.getTenantId(),
      accessToken,
      refreshToken,
      {
        deviceInfo,
        locationInfo,
        maxSessionsPerUser: 5,
      },
    );

    // 记录验证成功的登录尝试
    await this.loginSecurityService.recordLoginAttempt(
      savedUser.getId(),
      savedUser.getTenantId(),
      savedUser.getEmail().getValue(),
      'success' as any,
      'password' as any,
      deviceInfo,
      locationInfo,
    );

    return {
      user: savedUser,
      accessToken: accessToken.getValue(),
      refreshToken: refreshToken.getValue(),
      sessionId: session.getSessionId().getValue(),
    };
  }

  async checkEmailAvailability(email: string, tenantId: string): Promise<boolean> {
    const existingUser = await this.userRepository.findByEmail(new Email(email), tenantId);
    return !existingUser;
  }

  async checkUsernameAvailability(username: string, tenantId: string): Promise<boolean> {
    const existingUser = await this.userRepository.findByUsername(new UserName(username), tenantId);
    return !existingUser;
  }
}
