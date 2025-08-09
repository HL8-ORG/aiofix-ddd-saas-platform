import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { Public } from 'src/common/decorators/metadata/auth.decorator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { LoggedUser } from 'src/common/decorators/requests/logged-user.decorator';
import { User } from 'src/entities/user.entity';
import { Throttle } from '@nestjs/throttler';
import { UsersService } from 'src/users/users.service';

/**
 * @class AuthController
 * @description
 * 认证控制器，负责处理用户认证与授权相关的接口，包括登录、注册、获取当前用户信息等。
 *
 * 代码原理与机制说明：
 * 1. 该控制器通过依赖注入AuthService和UsersService，实现认证与用户数据的解耦。
 * 2. 采用@Public装饰器标记无需认证的接口（如登录、注册），配合全局认证守卫实现灵活的权限控制。
 * 3. 登录接口结合@UseGuards(LocalAuthGuard)实现本地策略校验，只有认证通过的用户才能获取Token。
 * 4. 注册接口通过@Throttle限流，防止恶意刷注册，提升系统安全性。
 * 5. 获取用户信息接口通过@LoggedUser装饰器自动注入当前登录用户，简化参数传递。
 */
@Controller('auth')
export class AuthController {
  /**
   * @constructor
   * @param authService 认证服务，负责登录、注册等核心逻辑
   * @param usersService 用户服务，负责用户数据的查询与管理
   */
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  /**
   * @method login
   * @description
   * 用户登录接口，校验用户凭证并返回访问令牌（access token）。
   *
   * 代码原理与机制说明：
   * 1. 通过@Public装饰器声明为公开接口，无需登录即可访问。
   * 2. 使用@UseGuards(LocalAuthGuard)启用本地认证守卫，自动校验用户名和密码。
   * 3. @LoggedUser装饰器自动注入认证通过的用户对象。
   * 4. 调用authService.login生成并返回JWT等令牌信息。
   *
   * @param user 认证通过的用户对象
   * @returns Promise<{ access_token: string }> 登录成功后的令牌信息
   */
  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@LoggedUser() user: User) {
    return this.authService.login(user);
  }

  /**
   * @method getProfile
   * @description
   * 获取当前登录用户的详细信息。
   *
   * 代码原理与机制说明：
   * 1. 通过@LoggedUser装饰器自动注入当前请求的用户对象。
   * 2. 调用usersService.findOne根据用户ID查询完整的用户资料。
   * 3. 该接口默认需要认证，只有登录用户才能访问。
   *
   * @param user 当前登录用户对象
   * @returns Promise<User> 用户详细信息
   */
  @Get('profile')
  getProfile(@LoggedUser() user: User) {
    return this.usersService.findOne({
      id: user.id,
    });
  }

  /**
   * @method register
   * @description
   * 用户注册接口，创建新用户并返回访问令牌，实现注册即登录体验。
   *
   * 代码原理与机制说明：
   * 1. 通过@Public装饰器声明为公开接口，允许未登录用户访问。
   * 2. 使用@Throttle装饰器限制单位时间内的注册请求次数，防止恶意刷注册。
   * 3. @Body自动解析请求体为CreateUserDto，进行参数校验。
   * 4. 调用authService.register完成用户注册并返回令牌。
   *
   * @param body 用户注册数据传输对象
   * @returns Promise<{ access_token: string }> 注册成功后的令牌信息
   */
  @Public()
  @Post('register')
  @Throttle({ default: { limit: 3, ttl: 60000 } })
  async register(@Body() body: CreateUserDto) {
    return this.authService.register(body);
  }
}
