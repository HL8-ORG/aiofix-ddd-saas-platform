import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { User } from 'src/entities/user.entity';
import { Logger } from '@nestjs/common';

/**
 * @class AuthService
 * @description
 * 认证服务，负责处理用户的身份校验、登录、注册等核心认证逻辑。
 *
 * 代码原理与机制说明：
 * 1. 依赖注入UsersService用于用户数据的查询与创建，JwtService用于生成和校验JWT令牌。
 * 2. 提供validateUser方法校验用户名和密码，login方法生成登录用户的JWT令牌，register方法注册新用户并返回令牌。
 * 3. 通过bcrypt对用户密码进行加密校验，保证认证安全性。
 * 4. 结合NestJS的异常体系，针对不同认证失败场景抛出BadRequestException和UnauthorizedException，提升接口友好性与安全性。
 */
@Injectable()
export class AuthService {
  /**
   * @property logger
   * @description
   * 日志记录器，用于记录认证相关操作日志，便于审计与排查问题。
   */
  private readonly logger = new Logger(AuthService.name);

  /**
   * @constructor
   * @param usersService 用户服务，负责用户数据的查询与管理
   * @param jwtService JWT服务，负责令牌的生成与校验
   */
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * @method validateUser
   * @description
   * 校验用户凭证（用户名和密码），用于本地认证流程。
   *
   * 代码原理与机制说明：
   * 1. 通过usersService.findOneWithUsername方法查询用户信息，并级联加载角色与权限数据，便于后续权限控制。
   * 2. 若用户不存在，抛出BadRequestException，提示用户未找到。
   * 3. 使用bcrypt.compare对明文密码与数据库加密密码进行比对，防止明文存储带来的安全风险。
   * 4. 密码不匹配时抛出UnauthorizedException，防止暴力破解。
   * 5. 校验通过后返回完整的用户对象（含角色与权限），供后续登录或权限校验使用。
   *
   * @param username 用户名
   * @param pass 密码
   * @returns Promise<User> 校验通过的用户对象
   * @throws BadRequestException 用户不存在
   * @throws UnauthorizedException 密码错误
   */
  async validateUser(username: string, pass: string): Promise<User> {
    const user = await this.usersService.findOneWithUsername({
      username,
      options: { populate: ['role', 'role.permissions'] as never },
    });
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    const isPasswordMatched = await bcrypt.compare(pass, user.password);
    if (!isPasswordMatched) {
      throw new UnauthorizedException('密码错误');
    }
    return user;
  }

  /**
   * @method login
   * @description
   * 用户登录，生成并返回JWT访问令牌。
   *
   * 代码原理与机制说明：
   * 1. 以用户的username和id（sub）为载荷生成JWT，便于后续接口通过解析令牌获取用户身份。
   * 2. 记录用户登录日志，便于安全审计。
   * 3. 返回标准格式的access_token，前端可用于后续接口鉴权。
   *
   * @param user 已认证的用户对象
   * @returns { access_token: string } JWT访问令牌
   */
  async login(user: User) {
    const payload = { username: user.username, sub: user.id };
    this.logger.log('用户登录', user);
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * @method register
   * @description
   * 用户注册，创建新用户并返回JWT访问令牌。
   *
   * 代码原理与机制说明：
   * 1. 调用usersService.create方法创建新用户，内部会自动进行密码加密等处理。
   * 2. 注册成功后记录日志，便于追踪注册来源。
   * 3. 以新用户的username和id为载荷生成JWT，注册即登录，提升用户体验。
   * 4. 返回access_token，前端可直接用于后续接口鉴权。
   *
   * @param user 用户注册数据（CreateUserDto）
   * @returns Promise<{ access_token: string }> 新用户的JWT访问令牌
   */
  async register(user: CreateUserDto) {
    const createdUser = await this.usersService.create(user);
    this.logger.log('用户注册', createdUser);
    const payload = { username: createdUser.username, sub: createdUser.id };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
