import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { EntityManager, FindOneOptions } from '@mikro-orm/postgresql';
import { Organization } from 'src/entities/organization.entity';
import { OrganizationRepository } from './organizations.repository';
import { Tenant } from 'src/entities/tenant.entity';

/**
 * @class OrganizationsService
 * @description
 * 组织（Organization）业务服务类，负责处理组织相关的业务逻辑，包括组织的增删改查（CRUD）操作，并结合多租户机制实现数据隔离。
 *
 * 代码原理与机制说明：
 * 1. 通过@Injectable装饰器声明为NestJS可注入服务，供控制器等依赖注入。
 * 2. 依赖注入OrganizationRepository（组织仓库）和EntityManager（MikroORM实体管理器），
 *    实现对组织实体的持久化操作和事务管理。
 * 3. 所有方法均结合MikroORM的ORM能力，自动带有租户隔离（由全局TenantInterceptor和订阅器实现），
 *    保证多租户场景下的数据安全。
 * 4. 通过Logger记录关键操作日志，便于后期审计和问题排查。
 */
@Injectable()
export class OrganizationsService {
  /** 日志记录器，便于追踪组织操作 */
  private readonly logger = new Logger(OrganizationsService.name);

  /**
   * 构造函数，注入组织仓库和实体管理器
   * @param repo 组织仓库，封装了组织实体的ORM操作
   * @param em MikroORM实体管理器，负责事务和持久化
   */
  constructor(
    private readonly repo: OrganizationRepository,
    private readonly em: EntityManager,
  ) {}

  /**
   * @method create
   * @description
   * 创建新的组织实体。通过仓库创建实体后，调用flush方法持久化到数据库。
   *
   * 原理说明：
   * - repo.create方法根据DTO创建新实体对象（未立即入库）。
   * - em.flush方法将所有挂起的更改（包括新建实体）同步到数据库。
   * - 日志记录新建组织信息，便于后续追踪。
   *
   * @param createOrganizationDto 创建组织的数据传输对象
   * @returns Promise<Organization> 新建的组织实体
   * @throws Error 创建失败时抛出异常
   */
  async create(
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<Organization> {
    try {
      const organization = this.repo.create({
        ...createOrganizationDto,
      });
      await this.em.flush();
      this.logger.log('新建组织成功', organization);
      return organization;
    } catch (error) {
      this.logger.error('创建组织失败', error);
      throw error;
    }
  }

  /**
   * @method findAll
   * @description
   * 查询所有组织实体。
   *
   * 原理说明：
   * - 直接调用仓库的findAll方法，返回当前租户下所有组织。
   * - 受全局租户拦截器影响，自动带有租户过滤。
   *
   * @returns Promise<Organization[]> 组织实体数组
   */
  findAll(): Promise<Organization[]> {
    return this.repo.findAll();
  }

  /**
   * @method findOne
   * @description
   * 根据ID查询单个组织实体，可选支持MikroORM的populate等查询选项。
   *
   * 原理说明：
   * - 支持传入options参数，灵活控制是否级联查询（如populate租户信息）。
   * - 受租户隔离机制影响，只能查到当前租户下的组织。
   *
   * @param params 查询参数，包含id和可选的options
   * @returns Promise<Organization | null> 查询到的组织实体或null
   */
  findOne({
    id,
    options,
  }: {
    id: number;
    options?: FindOneOptions<Organization>;
  }): Promise<Organization | null> {
    if (options) {
      return this.repo.findOne(id, options);
    }
    return this.repo.findOne(id);
  }

  /**
   * @method update
   * @description
   * 根据ID更新组织实体。
   *
   * 原理说明：
   * - 先通过ID查找组织，若不存在则抛出BadRequestException。
   * - 使用repo.assign方法将DTO属性赋值到实体对象。
   * - 调用em.flush持久化更改。
   * - 日志记录更新操作。
   *
   * @param params 更新参数，包含id和updateOrganizationDto
   * @returns Promise<Organization> 更新后的组织实体
   * @throws BadRequestException 未找到组织时抛出
   */
  async update({
    id,
    updateOrganizationDto,
  }: {
    id: number;
    updateOrganizationDto: UpdateOrganizationDto;
  }): Promise<Organization> {
    const organization = await this.repo.findOne(id);
    if (!organization) {
      throw new BadRequestException('未找到指定的组织');
    }
    this.repo.assign(organization, updateOrganizationDto);
    await this.em.flush();
    this.logger.log('组织信息已更新', organization);
    return organization;
  }

  /**
   * @method remove
   * @description
   * 根据ID删除组织实体。
   *
   * 原理说明：
   * - 先查找组织，若不存在则抛出BadRequestException。
   * - 调用em.remove标记实体为删除，flush后同步到数据库。
   * - 日志记录删除操作。
   *
   * @param params 删除参数，包含id
   * @returns Promise<Organization> 被删除的组织实体
   * @throws BadRequestException 未找到组织时抛出
   */
  async remove({ id }: { id: number }): Promise<Organization> {
    const organization = await this.repo.findOne(id);
    if (!organization) {
      throw new BadRequestException('未找到指定的组织');
    }
    this.em.remove(organization);
    await this.em.flush();
    this.logger.log('组织已删除', organization);
    return organization;
  }
}
