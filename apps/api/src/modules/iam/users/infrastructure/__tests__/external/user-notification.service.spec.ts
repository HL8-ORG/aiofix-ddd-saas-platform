import { ConfigService } from '@nestjs/config'
import { Test, type TestingModule } from '@nestjs/testing'
import {
  type NotificationPayload,
  UserNotificationService,
} from '../../external/user-notification.service'

describe('UserNotificationService', () => {
  let service: UserNotificationService
  let configService: ConfigService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserNotificationService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue({
              cache: {
                enabled: true,
                ttl: 3600,
                maxSize: 1000,
              },
              database: {
                connectionTimeout: 5000,
                queryTimeout: 30000,
                maxConnections: 10,
              },
              external: {
                notification: {
                  enabled: true,
                  endpoint: 'http://localhost:3001/notifications',
                  timeout: 5000,
                },
                email: {
                  enabled: false,
                  provider: 'smtp',
                  templatePath: './templates/emails',
                },
              },
              security: {
                passwordMinLength: 8,
                passwordMaxLength: 128,
                passwordRequireSpecialChar: true,
                maxLoginAttempts: 5,
                lockoutDuration: 30,
                sessionTimeout: 1440,
              },
            }),
          },
        },
      ],
    }).compile()

    service = module.get<UserNotificationService>(UserNotificationService)
    configService = module.get<ConfigService>(ConfigService)
  })

  it('应该被定义', () => {
    expect(service).toBeDefined()
  })

  describe('sendNotification', () => {
    it('应该能够发送通知', async () => {
      const payload: NotificationPayload = {
        type: 'TEST',
        title: '测试通知',
        message: '这是一个测试通知',
        recipients: ['user-1'],
        tenantId: 'tenant-1',
      }

      const result = await service.sendNotification(payload)

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })

    it('当通知服务被禁用时应该跳过发送', async () => {
      // 重新创建服务实例以应用新的配置
      const disabledModule: TestingModule = await Test.createTestingModule({
        providers: [
          UserNotificationService,
          {
            provide: ConfigService,
            useValue: {
              get: jest.fn().mockReturnValue({
                external: {
                  notification: {
                    enabled: false,
                    endpoint: 'http://localhost:3001/notifications',
                    timeout: 5000,
                  },
                },
              }),
            },
          },
        ],
      }).compile()

      const disabledService = disabledModule.get<UserNotificationService>(
        UserNotificationService,
      )

      const payload: NotificationPayload = {
        type: 'TEST',
        title: '测试通知',
        message: '这是一个测试通知',
        recipients: ['user-1'],
        tenantId: 'tenant-1',
      }

      const result = await disabledService.sendNotification(payload)

      expect(result.success).toBe(true)
      expect(result.messageId).toBe('disabled')
    })
  })

  describe('notifyUserCreated', () => {
    it('应该能够发送用户创建通知', async () => {
      const userId = 'user-1'
      const username = 'john_doe'
      const email = 'john.doe@example.com'
      const tenantId = 'tenant-1'
      const adminUserId = 'admin-1'

      const result = await service.notifyUserCreated(
        userId,
        username,
        email,
        tenantId,
        adminUserId,
      )

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })
  })

  describe('notifyUserStatusChanged', () => {
    it('应该能够发送用户状态变更通知', async () => {
      const userId = 'user-1'
      const username = 'john_doe'
      const oldStatus = 'PENDING'
      const newStatus = 'ACTIVE'
      const tenantId = 'tenant-1'
      const adminUserId = 'admin-1'

      const result = await service.notifyUserStatusChanged(
        userId,
        username,
        oldStatus,
        newStatus,
        tenantId,
        adminUserId,
      )

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })

    it('应该能够处理不同的状态变更', async () => {
      const statusChanges = [
        { old: 'PENDING', new: 'ACTIVE' },
        { old: 'ACTIVE', new: 'SUSPENDED' },
        { old: 'SUSPENDED', new: 'DELETED' },
        { old: 'DELETED', new: 'ACTIVE' },
      ]

      for (const change of statusChanges) {
        const result = await service.notifyUserStatusChanged(
          'user-1',
          'john_doe',
          change.old,
          change.new,
          'tenant-1',
          'admin-1',
        )

        expect(result.success).toBe(true)
      }
    })
  })

  describe('notifyPasswordReset', () => {
    it('应该能够发送密码重置通知', async () => {
      const userId = 'user-1'
      const username = 'john_doe'
      const email = 'john.doe@example.com'
      const resetToken = 'reset-token-123'
      const tenantId = 'tenant-1'

      const result = await service.notifyPasswordReset(
        userId,
        username,
        email,
        resetToken,
        tenantId,
      )

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })
  })

  describe('notifyLoginAttempt', () => {
    it('应该能够发送登录成功通知', async () => {
      const userId = 'user-1'
      const username = 'john_doe'
      const email = 'john.doe@example.com'
      const success = true
      const ipAddress = '192.168.1.1'
      const userAgent = 'Mozilla/5.0'
      const tenantId = 'tenant-1'

      const result = await service.notifyLoginAttempt(
        userId,
        username,
        email,
        success,
        ipAddress,
        userAgent,
        tenantId,
      )

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })

    it('应该能够发送登录失败通知', async () => {
      const userId = 'user-1'
      const username = 'john_doe'
      const email = 'john.doe@example.com'
      const success = false
      const ipAddress = '192.168.1.1'
      const userAgent = 'Mozilla/5.0'
      const tenantId = 'tenant-1'

      const result = await service.notifyLoginAttempt(
        userId,
        username,
        email,
        success,
        ipAddress,
        userAgent,
        tenantId,
      )

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })
  })

  describe('notifyAccountLocked', () => {
    it('应该能够发送账户锁定通知', async () => {
      const userId = 'user-1'
      const username = 'john_doe'
      const email = 'john.doe@example.com'
      const reason = '多次登录失败'
      const lockoutDuration = 30
      const tenantId = 'tenant-1'

      const result = await service.notifyAccountLocked(
        userId,
        username,
        email,
        reason,
        lockoutDuration,
        tenantId,
      )

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })
  })

  describe('notifySecurityAlert', () => {
    it('应该能够发送安全警报通知', async () => {
      const userId = 'user-1'
      const username = 'john_doe'
      const alertType = 'SUSPICIOUS_ACTIVITY'
      const details = { ipAddress: '192.168.1.1', location: 'Unknown' }
      const tenantId = 'tenant-1'

      const result = await service.notifySecurityAlert(
        userId,
        username,
        alertType,
        details,
        tenantId,
      )

      expect(result.success).toBe(true)
      expect(result.messageId).toBeDefined()
    })

    it('应该能够处理不同类型的安全警报', async () => {
      const alertTypes = [
        'SUSPICIOUS_ACTIVITY',
        'MULTIPLE_FAILED_LOGINS',
        'UNUSUAL_LOCATION',
        'PASSWORD_EXPIRING',
      ]

      for (const alertType of alertTypes) {
        const result = await service.notifySecurityAlert(
          'user-1',
          'john_doe',
          alertType,
          { test: 'data' },
          'tenant-1',
        )

        expect(result.success).toBe(true)
      }
    })
  })

  describe('sendBulkNotification', () => {
    it('应该能够发送批量通知', async () => {
      const payloads: NotificationPayload[] = [
        {
          type: 'TEST1',
          title: '测试通知1',
          message: '这是第一个测试通知',
          recipients: ['user-1'],
          tenantId: 'tenant-1',
        },
        {
          type: 'TEST2',
          title: '测试通知2',
          message: '这是第二个测试通知',
          recipients: ['user-2'],
          tenantId: 'tenant-1',
        },
      ]

      const results = await service.sendBulkNotification(payloads)

      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(true)
    })

    it('应该能够处理批量通知中的部分失败', async () => {
      const payloads: NotificationPayload[] = [
        {
          type: 'TEST1',
          title: '测试通知1',
          message: '这是第一个测试通知',
          recipients: ['user-1'],
          tenantId: 'tenant-1',
        },
        {
          type: 'TEST2',
          title: '测试通知2',
          message: '这是第二个测试通知',
          recipients: ['user-2'],
          tenantId: 'tenant-1',
        },
      ]

      // 模拟部分失败
      jest
        .spyOn(service, 'sendNotification')
        .mockResolvedValueOnce({ success: true, messageId: 'msg-1' })
        .mockRejectedValueOnce(new Error('发送失败'))

      const results = await service.sendBulkNotification(payloads)

      expect(results).toHaveLength(2)
      expect(results[0].success).toBe(true)
      expect(results[1].success).toBe(false)
      expect(results[1].error).toBe('发送失败')
    })
  })
})
