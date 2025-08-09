import { Injectable } from '@nestjs/common'
import type { Tenant } from '../../domain/entities/tenant.entity'
import {
  TenantActivatedEvent,
  TenantCreatedEvent,
  TenantDeletedEvent,
  TenantSuspendedEvent,
} from '../../domain/events/tenant.events'

/**
 * @interface NotificationService
 * @description
 * 通知服务接口，定义发送通知的契约。
 */
export interface NotificationService {
  /**
   * @method sendWelcomeEmail
   * @description 发送欢迎邮件
   * @param tenant 租户信息
   * @returns {Promise<void>}
   */
  sendWelcomeEmail(tenant: Tenant): Promise<void>

  /**
   * @method sendActivationNotification
   * @description 发送激活通知
   * @param tenant 租户信息
   * @param activatedBy 激活者ID
   * @returns {Promise<void>}
   */
  sendActivationNotification(
    tenant: Tenant,
    activatedBy?: string,
  ): Promise<void>

  /**
   * @method sendSuspensionNotification
   * @description 发送暂停通知
   * @param tenant 租户信息
   * @param suspendedBy 暂停者ID
   * @param reason 暂停原因
   * @returns {Promise<void>}
   */
  sendSuspensionNotification(
    tenant: Tenant,
    suspendedBy?: string,
    reason?: string,
  ): Promise<void>

  /**
   * @method sendDeletionNotification
   * @description 发送删除通知
   * @param tenant 租户信息
   * @param deletedBy 删除者ID
   * @param reason 删除原因
   * @returns {Promise<void>}
   */
  sendDeletionNotification(
    tenant: Tenant,
    deletedBy?: string,
    reason?: string,
  ): Promise<void>
}

/**
 * @class TenantNotificationService
 * @description
 * 租户通知服务实现，负责处理租户相关的通知发送。
 *
 * 主要原理与机制：
 * 1. 实现NotificationService接口
 * 2. 处理各种租户事件的通知发送
 * 3. 集成外部邮件服务或消息队列
 * 4. 提供通知模板和个性化内容
 * 5. 支持异步通知处理
 */
@Injectable()
export class TenantNotificationService implements NotificationService {
  /**
   * @method sendWelcomeEmail
   * @description 发送欢迎邮件
   */
  async sendWelcomeEmail(tenant: Tenant): Promise<void> {
    // TODO: 集成实际的邮件服务
    console.log(`发送欢迎邮件给租户: ${tenant.getName()} (${tenant.getCode()})`)

    // 模拟邮件发送
    const emailContent = {
      to: `admin@${tenant.getCode()}.com`,
      subject: '欢迎加入我们的平台',
      body: `
        亲爱的 ${tenant.getName()} 管理员，
        
        欢迎您加入我们的多租户平台！
        
        您的租户信息：
        - 租户名称: ${tenant.getName()}
        - 租户编码: ${tenant.getCode()}
        - 管理员ID: ${tenant.adminUserId}
        
        请尽快激活您的租户以开始使用平台功能。
        
        如有任何问题，请联系我们的客服团队。
        
        祝您使用愉快！
      `,
    }

    console.log('邮件内容:', emailContent)
  }

  /**
   * @method sendActivationNotification
   * @description 发送激活通知
   */
  async sendActivationNotification(
    tenant: Tenant,
    activatedBy?: string,
  ): Promise<void> {
    console.log(`发送激活通知给租户: ${tenant.getName()} (${tenant.getCode()})`)

    const notificationContent = {
      tenantId: tenant.id,
      tenantName: tenant.getName(),
      tenantCode: tenant.getCode(),
      activatedBy: activatedBy || 'system',
      activatedAt: new Date().toISOString(),
      message: `租户 ${tenant.getName()} 已成功激活`,
    }

    console.log('激活通知内容:', notificationContent)
  }

  /**
   * @method sendSuspensionNotification
   * @description 发送暂停通知
   */
  async sendSuspensionNotification(
    tenant: Tenant,
    suspendedBy?: string,
    reason?: string,
  ): Promise<void> {
    console.log(`发送暂停通知给租户: ${tenant.getName()} (${tenant.getCode()})`)

    const notificationContent = {
      tenantId: tenant.id,
      tenantName: tenant.getName(),
      tenantCode: tenant.getCode(),
      suspendedBy: suspendedBy || 'system',
      suspendedAt: new Date().toISOString(),
      reason: reason || '未提供原因',
      message: `租户 ${tenant.getName()} 已被暂停`,
    }

    console.log('暂停通知内容:', notificationContent)
  }

  /**
   * @method sendDeletionNotification
   * @description 发送删除通知
   */
  async sendDeletionNotification(
    tenant: Tenant,
    deletedBy?: string,
    reason?: string,
  ): Promise<void> {
    console.log(`发送删除通知给租户: ${tenant.getName()} (${tenant.getCode()})`)

    const notificationContent = {
      tenantId: tenant.id,
      tenantName: tenant.getName(),
      tenantCode: tenant.getCode(),
      deletedBy: deletedBy || 'system',
      deletedAt: new Date().toISOString(),
      reason: reason || '未提供原因',
      message: `租户 ${tenant.getName()} 已被删除`,
    }

    console.log('删除通知内容:', notificationContent)
  }
}
