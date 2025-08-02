import { Inject, Injectable } from '@nestjs/common';
import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Tenant } from 'src/entities/tenant.entity';
import { ConfigType } from '@nestjs/config';
import tenantConfig from 'src/config/tenant.config';

/**
 * @class TenantSubscriber
 * @implements EventSubscriber<Tenant>
 * @description
 * MikroORM租户实体订阅器，用于在租户（Tenant）实体创建前自动处理其domain字段，实现多租户系统的统一域名后缀拼接。
 *
 * 代码原理与机制说明：
 * 1. 通过实现EventSubscriber<Tenant>接口，订阅Tenant实体相关的ORM事件。
 * 2. 在构造函数中，利用EntityManager的getEventManager().registerSubscriber(this)方法，将当前订阅器注册到MikroORM事件管理器中，
 *    保证相关事件（如beforeCreate）能够被正确触发。
 * 3. getSubscribedEntities方法返回本订阅器关注的实体类型（此处为Tenant），确保只对Tenant实体生效。
 * 4. beforeCreate方法会在Tenant实体被持久化到数据库前自动调用。该方法将租户的domain字段与全局配置的主域名（如"example.com"）拼接，
 *    形成完整的二级域名（如"foo.example.com"），实现租户域名的自动规范化。
 * 5. 通过@Inject注入租户配置服务（tenantConfigService），动态获取主域名配置，提升灵活性与可维护性。
 *
 * 该订阅器机制确保所有新建租户的domain字段都自动带有统一的主域名后缀，避免人为疏漏，提升多租户系统的域名一致性和安全性。
 */
@Injectable()
export class TenantSubscriber implements EventSubscriber<Tenant> {
  /**
   * @constructor
   * @param em MikroORM的EntityManager实例，用于注册订阅器
   * @param tenantConfigService 租户配置服务，提供主域名等配置信息
   */
  constructor(
    em: EntityManager,
    @Inject(tenantConfig.KEY)
    private readonly tenantConfigService: ConfigType<typeof tenantConfig>,
  ) {
    // 注册当前订阅器到MikroORM事件管理器
    em.getEventManager().registerSubscriber(this);
  }

  /**
   * @method getSubscribedEntities
   * @description
   * 返回本订阅器关注的实体类型（此处为Tenant），确保只对Tenant实体生效。
   * @returns EntityName<Tenant>[] 订阅的实体类型数组
   */
  getSubscribedEntities(): EntityName<Tenant>[] {
    return [Tenant];
  }

  /**
   * @method beforeCreate
   * @description
   * 在Tenant实体创建前自动拼接主域名，规范化domain字段。
   *
   * 代码原理与机制说明：
   * 1. 通过args.entity获取当前即将创建的Tenant实体对象。
   * 2. 将entity.domain与全局配置的主域名（如"example.com"）拼接，形成完整的二级域名。
   * 3. 该操作在ORM持久化前执行，确保数据库中存储的domain字段始终规范。
   *
   * @param args ORM事件参数，包含当前实体等信息
   */
  beforeCreate(args: EventArgs<Tenant>): void | Promise<void> {
    args.entity.domain =
      args.entity.domain + '.' + this.tenantConfigService.domain!;
  }
}
