import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRepository } from './users.repository';
import { FindOneOptions } from '@mikro-orm/core';
import { User } from 'src/entities/user.entity';
import { EntityManager, EntityRepository } from '@mikro-orm/postgresql';
import { Role } from 'src/entities/role.entity';
import { Tenant } from 'src/entities/tenant.entity';
import { InjectRepository } from '@mikro-orm/nestjs';
import * as bcrypt from 'bcrypt';

/**
 * @service UsersService
 * @description
 * 用户服务层，负责处理与用户相关的业务逻辑，包括用户的增删改查（CRUD）、密码加密、默认角色分配、多租户租户信息管理等。
 *
 * 代码原理与机制说明：
 * 1. 依赖注入UserRepository、Role实体仓库和EntityManager，实现对用户、角色、租户等实体的数据库操作。
 * 2. 用户创建时自动为其分配默认角色（user），并对密码进行bcrypt加密，确保安全性。
 * 3. 支持通过ID、用户名等多种方式查询用户，支持MikroORM的高级查询选项（如关联加载）。
 * 4. 用户更新和删除操作均先校验用户是否存在，避免无效操作，并在操作后自动持久化到数据库。
 * 5. 所有关键操作均记录日志，便于审计和问题追踪。
 */
@Injectable()
export class UsersService {
  /**
   * @property logger
   * @description
   * 日志记录器，用于记录用户相关操作日志，便于后续审计和排查。
   */
  private readonly logger = new Logger(UsersService.name);

  /**
   * @constructor
   * @param repo 用户实体自定义仓库，封装了用户的数据库操作
   * @param roleRepo 角色实体仓库，用于查找和分配用户角色
   * @param em MikroORM的EntityManager，负责实体的持久化和事务管理
   */
  constructor(
    private readonly repo: UserRepository,
    @InjectRepository(Role)
    private readonly roleRepo: EntityRepository<Role>,
    private readonly em: EntityManager,
  ) {}

  /**
   * @method create
   * @description
   * 创建新用户。流程包括：
   * 1. 查找默认角色（user），若不存在则抛出服务器异常。
   * 2. 对明文密码进行bcrypt加密，提升安全性。
   * 3. 创建租户实体（Tenant），实现多租户隔离。
   * 4. 组装用户实体并持久化到数据库。
   * 5. 记录创建日志。
   *
   * @param createUserDto 用户注册数据
   * @returns Promise<User> 创建成功的用户实体
   * @throws InternalServerErrorException 默认角色不存在时抛出
   */
  async create(createUserDto: CreateUserDto) {
    // 查找默认角色
    const role = await this.roleRepo.findOne({ name: 'user' });
    const { password, domain, ...rest } = createUserDto;
    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);
    if (!role) {
      throw new InternalServerErrorException('默认角色不存在');
    }
    // 创建用户实体并关联租户
    const user = this.repo.create({
      ...rest,
      password: hashedPassword,
      role,
      tenant: this.em.create(Tenant, new Tenant(domain)),
    });
    // 持久化到数据库
    await this.em.flush();
    this.logger.log('新用户已创建', user);
    return user;
  }

  /**
   * @method findAll
   * @description
   * 查询系统内所有用户列表。
   *
   * @returns Promise<User[]> 用户实体数组
   */
  findAll() {
    return this.repo.findAll();
  }

  /**
   * @method findOne
   * @description
   * 根据用户ID查询用户信息，支持传入MikroORM的查询选项（如关联加载）。
   *
   * @param params 查询参数
   * @param params.id 用户ID
   * @param params.options 可选的MikroORM查询选项
   * @returns Promise<User> 查询到的用户实体
   */
  findOne({ id, options }: { id: number; options?: FindOneOptions<User> }) {
    if (options) {
      return this.repo.findOne(id, options);
    }
    return this.repo.findOne(id);
  }

  /**
   * @method findOneWithUsername
   * @description
   * 根据用户名查询用户信息，支持传入MikroORM的查询选项（如关联加载）。
   *
   * @param params 查询参数
   * @param params.username 用户名
   * @param params.options 可选的MikroORM查询选项
   * @returns Promise<User> 查询到的用户实体
   */
  findOneWithUsername({
    username,
    options,
  }: {
    username: string;
    options?: FindOneOptions<User>;
  }) {
    return this.repo.findOne({ username }, options);
  }

  /**
   * @method update
   * @description
   * 根据用户ID更新用户信息。流程包括：
   * 1. 校验用户是否存在，若不存在则抛出异常。
   * 2. 合并更新数据到用户实体。
   * 3. 持久化到数据库。
   * 4. 记录更新日志。
   *
   * @param params 更新参数
   * @param params.id 用户ID
   * @param params.updateUserDto 用户更新数据
   * @returns Promise<User> 更新后的用户实体
   * @throws BadRequestException 用户不存在时抛出
   */
  async update({
    id,
    updateUserDto,
  }: {
    id: number;
    updateUserDto: UpdateUserDto;
  }) {
    const user = await this.repo.findOne(id);
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    this.repo.assign(user, updateUserDto);
    await this.em.flush();
    this.logger.log('用户信息已更新', user);
    return user;
  }

  /**
   * @method remove
   * @description
   * 根据用户ID删除用户。流程包括：
   * 1. 校验用户是否存在，若不存在则抛出异常。
   * 2. 从数据库中移除用户实体。
   * 3. 持久化变更。
   * 4. 记录删除日志。
   *
   * @param params 删除参数
   * @param params.id 用户ID
   * @returns Promise<User> 被删除的用户实体
   * @throws BadRequestException 用户不存在时抛出
   */
  async remove({ id }: { id: number }) {
    const user = await this.repo.findOne(id);
    if (!user) {
      throw new BadRequestException('用户不存在');
    }
    this.em.remove(user);
    await this.em.flush();
    this.logger.log('用户已删除', user);
    return user;
  }
}
