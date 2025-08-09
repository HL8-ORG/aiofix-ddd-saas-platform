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
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { CheckPolicies } from 'src/common/decorators/metadata/check-policy.decorator';
import { PoliciesGuard } from 'src/common/guards/policies.guard';
import { ReadOrganizationPolicyHandler } from './policies/read-organization.policy';
import { ReadAnyOrganizationPolicyHandler } from './policies/read-any-organization.policy';
import { UpdateOrganizationPolicyHandler } from './policies/update-organization.policy';
import { DeleteOrganizationPolicyHandler } from './policies/delete-organization.policy';

/**
 * @controller OrganizationsController
 * @description
 * 组织（Organization）管理控制器，负责处理组织实体的增删改查（CRUD）相关接口。
 *
 * 代码原理与机制说明：
 * 1. 通过@Controller('organizations')装饰器声明路由前缀，所有接口均以/organizations开头。
 * 2. 依赖注入OrganizationsService，实现具体的业务逻辑与数据操作。
 * 3. 每个接口方法均可结合@UseGuards(PoliciesGuard)和@CheckPolicies装饰器，实现基于CASL策略的细粒度权限控制。
 *    - PoliciesGuard：全局权限守卫，拦截请求并校验用户是否有访问权限。
 *    - CheckPolicies：结合具体的PolicyHandler（如ReadAnyOrganizationPolicyHandler等），
 *      动态判断当前用户是否具备对应操作的能力（Ability）。
 * 4. findOne、update、remove等接口均通过@Param('id')获取组织ID，并将其转换为数字类型，防止类型不一致。
 * 5. findOne接口通过options: { populate: ['tenant'] }，实现租户信息的级联查询，便于前端展示组织与租户的关联关系。
 * 6. 所有DTO参数均通过@Body装饰器自动校验和转换，提升接口安全性与健壮性。
 *
 * 该控制器结合策略守卫与能力工厂，实现了灵活、可扩展的组织管理与权限控制，适用于多租户SaaS系统的组织级资源管理场景。
 */
@Controller('organizations')
export class OrganizationsController {
  /**
   * 构造函数，注入组织服务
   * @param organizationsService 组织业务服务
   */
  constructor(private readonly organizationsService: OrganizationsService) {}

  /**
   * @method create
   * @description
   * 创建新的组织实体。
   *
   * 原理说明：
   * - 通过@Post()装饰器声明为POST /organizations接口。
   * - 接收CreateOrganizationDto参数，自动校验并传递给service层处理。
   *
   * @param createOrganizationDto 创建组织的数据传输对象
   * @returns Promise<Organization> 新建的组织实体
   */
  @Post()
  create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  /**
   * @method findAll
   * @description
   * 查询系统内所有组织实体。
   *
   * 原理说明：
   * - 通过@Get()声明为GET /organizations接口。
   * - 结合@UseGuards(PoliciesGuard)和@CheckPolicies，校验用户是否具备“读取任意组织”能力。
   *
   * @returns Promise<Organization[]> 组织实体数组
   */
  @Get()
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadAnyOrganizationPolicyHandler())
  findAll() {
    return this.organizationsService.findAll();
  }

  /**
   * @method findOne
   * @description
   * 根据ID查询指定组织实体，并级联查询其租户信息。
   *
   * 原理说明：
   * - 通过@Get(':id')声明为GET /organizations/:id接口。
   * - 结合@UseGuards和@CheckPolicies，校验用户是否具备“读取指定组织”能力。
   * - 参数id通过+id转换为数字，防止类型错误。
   * - options: { populate: ['tenant'] }实现租户信息的自动填充。
   *
   * @param id 组织ID
   * @returns Promise<Organization> 包含租户信息的组织实体
   */
  @Get(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new ReadOrganizationPolicyHandler())
  findOne(@Param('id') id: string) {
    return this.organizationsService.findOne({
      id: +id,
      options: { populate: ['tenant'] as never },
    });
  }

  /**
   * @method update
   * @description
   * 根据ID更新指定组织实体。
   *
   * 原理说明：
   * - 通过@Patch(':id')声明为PATCH /organizations/:id接口。
   * - 结合@UseGuards和@CheckPolicies，校验用户是否具备“更新组织”能力。
   * - 参数id通过+id转换为数字，updateOrganizationDto为更新数据。
   *
   * @param id 组织ID
   * @param updateOrganizationDto 组织更新数据
   * @returns Promise<Organization> 更新后的组织实体
   */
  @Patch(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new UpdateOrganizationPolicyHandler())
  update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update({
      id: +id,
      updateOrganizationDto,
    });
  }

  /**
   * @method remove
   * @description
   * 根据ID删除指定组织实体。
   *
   * 原理说明：
   * - 通过@Delete(':id')声明为DELETE /organizations/:id接口。
   * - 结合@UseGuards和@CheckPolicies，校验用户是否具备“删除组织”能力。
   * - 参数id通过+id转换为数字，传递给service层处理。
   *
   * @param id 组织ID
   * @returns Promise<Organization> 被删除的组织实体
   */
  @Delete(':id')
  @UseGuards(PoliciesGuard)
  @CheckPolicies(new DeleteOrganizationPolicyHandler())
  remove(@Param('id') id: string) {
    return this.organizationsService.remove({ id: +id });
  }
}
