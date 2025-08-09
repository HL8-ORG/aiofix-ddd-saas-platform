import { EntityName, EventArgs, EventSubscriber } from '@mikro-orm/core';
import { EntityManager } from '@mikro-orm/postgresql';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import tenantConfig from 'src/config/tenant.config';
import { User } from 'src/entities/user.entity';
import { ClsService } from 'nestjs-cls';

/**
 * @class TenantAwareSubscriber
 * @implements EventSubscriber<any>
 * @description
 * 该订阅器用于实现多租户（Tenant）数据隔离机制。通过监听实体的创建事件（beforeCreate），
 * 自动为每个新建的实体对象注入当前上下文中的tenant信息，实现数据的租户隔离。
 *
 * 原理与机制说明：
 * 1. 通过构造函数将自身注册为MikroORM的事件订阅器（registerSubscriber），
 *    使其能够拦截和处理实体生命周期事件。
 * 2. getSubscribedEntities方法动态返回需要监听的实体类型（排除User实体），
 *    以便只对指定的多租户实体生效，提升灵活性和安全性。
 * 3. beforeCreate方法在实体持久化前触发，从CLS（Continuation Local Storage）上下文
 *    获取当前请求的tenant信息，并自动赋值到实体的tenant字段，实现租户自动注入。
 * 4. 日志记录机制：在订阅实体和注入tenant时均有详细日志，便于调试和追踪多租户数据流转。
 */
@Injectable()
export class TenantAwareSubscriber implements EventSubscriber<any> {
  /** 日志记录器，便于调试和追踪 */
  private readonly logger = new Logger(TenantAwareSubscriber.name);

  /**
   * 构造函数，注册订阅器并注入依赖
   * @param em MikroORM的EntityManager实例，用于注册事件订阅器
   * @param tenantConfigService 租户配置服务，提供多租户相关实体配置
   * @param cls CLS服务，用于获取当前请求上下文中的tenant信息
   */
  constructor(
    em: EntityManager,
    @Inject(tenantConfig.KEY)
    private readonly tenantConfigService: ConfigType<typeof tenantConfig>,
    private readonly cls: ClsService,
  ) {
    // 注册当前订阅器到MikroORM事件管理器
    em.getEventManager().registerSubscriber(this);
  }

  /**
   * 获取需要订阅的实体类型
   * @returns 需要监听的多租户实体数组（排除User实体）
   */
  getSubscribedEntities(): EntityName<any>[] {
    // 过滤掉User实体，仅对配置中的其他实体生效
    const entities = this.tenantConfigService.entities.filter(
      (entity) => entity !== User,
    );
    // 输出调试日志，记录订阅的实体类型
    this.logger.debug(
      `Subscribing to entities: ${entities.map((e) => e.name).join(', ')}`,
    );
    return entities;
  }

  /**
   * 在实体创建前自动注入tenant信息
   * @param args 实体事件参数，包含当前操作的实体对象
   */
  beforeCreate(args: EventArgs<any>): void | Promise<void> {
    // 记录日志，便于追踪tenant注入过程
    this.logger.log('Registering tenant for entity', {
      entity: args.entity,
      tenant: this.cls.get('tenant'),
    });
    // 从CLS上下文获取tenant并注入到实体
    args.entity.tenant = this.cls.get('tenant');
  }
}
