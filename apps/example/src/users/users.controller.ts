import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CheckPolicies } from 'src/common/decorators/metadata/check-policy.decorator';
import { ReadUserPolicy } from './policies/read-user.policy';
import { PoliciesGuard } from 'src/common/guards/policies.guard';
import { ReadAnyUserPolicy } from './policies/read-any-user.policy';
import { UpdateUserPolicy } from './policies/update-user.policy';
import { DeleteUserPolicy } from './policies/delete-user.policy';

/**
 * @controller UsersController
 * @description
 * 用户管理控制器，负责处理用户相关的CRUD（增删改查）接口请求，并结合策略（Policy）实现细粒度的权限控制。
 *
 * 代码原理与机制说明：
 * 1. 通过`@Controller('users')`将该控制器的所有路由前缀设置为`/users`，实现RESTful风格的用户资源管理。
 * 2. 每个接口方法结合`@UseGuards(PoliciesGuard)`和`@CheckPolicies(...)`装饰器，实现基于CASL策略的访问控制。
 *    - PoliciesGuard会拦截请求，根据CheckPolicies注入的策略处理器判断当前用户是否有权限访问该接口。
 *    - 策略处理器（如ReadUserPolicyHandler等）封装了具体的权限判定逻辑，支持灵活扩展。
 * 3. 依赖注入UsersService，所有业务逻辑均委托给服务层，控制器只负责参数接收、权限校验和响应返回，保证单一职责。
 * 4. 支持用户的创建、查询（单个/全部）、更新、删除等常用操作，接口参数和返回值均通过DTO进行类型约束和校验。
 */
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  /**
   * @method create
   * @description
   * 创建新用户接口。接收前端传入的CreateUserDto数据，调用服务层完成用户注册。
   *
   * 机制说明：
   * - 通过@Post()装饰器映射POST /users路由。
   * - 参数通过@Body()自动解析为CreateUserDto实例，支持自动校验。
   *
   * @param createUserDto 新用户的注册数据
   * @returns Promise<User> 创建成功的用户实体
   */
  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  /**
   * @method findAll
   * @description
   * 查询系统内所有用户列表。需要通过策略守卫校验是否有“读取任意用户”权限。
   *
   * 机制说明：
   * - @Get()映射GET /users路由。
   * - @UseGuards(PoliciesGuard)启用策略守卫，@CheckPolicies注入ReadAnyUserPolicyHandler策略处理器。
   * - 只有具备相应权限的用户才能访问该接口。
   *
   * @returns Promise<User[]> 用户实体数组
   */
  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadAnyUserPolicy())
  findAll() {
    return this.usersService.findAll();
  }

  /**
   * @method findOne
   * @description
   * 根据用户ID查询单个用户详情。需要通过策略守卫校验是否有“读取指定用户”权限。
   *
   * 机制说明：
   * - @Get(':id')映射GET /users/:id路由。
   * - @UseGuards(PoliciesGuard)和@CheckPolicies(ReadUserPolicyHandler)实现权限校验。
   * - 查询时自动级联加载用户的角色及其权限（populate: ['role', 'role.permissions']）。
   *
   * @param id 用户ID（字符串类型，自动转为数字）
   * @returns Promise<User> 包含角色和权限信息的用户实体
   */
  @Get(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadUserPolicy())
  findOne(@Param('id') id: string) {
    return this.usersService.findOne({
      id: +id,
      options: { populate: ['role', 'role.permissions'] as never },
    });
  }

  /**
   * @method update
   * @description
   * 根据用户ID更新用户信息。需要通过策略守卫校验是否有“更新用户”权限。
   *
   * 机制说明：
   * - @Patch(':id')映射PATCH /users/:id路由。
   * - @UseGuards(PoliciesGuard)和@CheckPolicies(UpdateUserPolicyHandler)实现权限校验。
   * - 参数@Body()自动解析为UpdateUserDto，支持字段部分更新。
   *
   * @param id 用户ID（字符串类型，自动转为数字）
   * @param updateUserDto 用户更新数据
   * @returns Promise<User> 更新后的用户实体
   */
  @Patch(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new UpdateUserPolicy())
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update({ id: +id, updateUserDto });
  }

  /**
   * @method remove
   * @description
   * 根据用户ID删除用户。需要通过策略守卫校验是否有“删除用户”权限。
   *
   * 机制说明：
   * - @Delete(':id')映射DELETE /users/:id路由。
   * - @UseGuards(PoliciesGuard)和@CheckPolicies(DeleteUserPolicyHandler)实现权限校验。
   *
   * @param id 用户ID（字符串类型，自动转为数字）
   * @returns Promise<User> 被删除的用户实体
   */
  @Delete(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new DeleteUserPolicy())
  remove(@Param('id') id: string) {
    return this.usersService.remove({ id: +id });
  }
}
