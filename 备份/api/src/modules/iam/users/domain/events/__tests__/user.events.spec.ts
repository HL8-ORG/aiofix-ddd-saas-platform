import { generateUuid } from '@/shared/domain/utils/uuid.util'
import { User } from '../../entities/user.entity'
import {
  UserActivatedEvent,
  UserAssignedToOrganizationEvent,
  UserContactInfoUpdatedEvent,
  UserCreatedEvent,
  UserDeletedEvent,
  UserDomainEvent,
  UserEmailVerifiedEvent,
  UserInfoUpdatedEvent,
  UserLoginFailureEvent,
  UserLoginSuccessEvent,
  UserPasswordUpdatedEvent,
  UserPhoneVerifiedEvent,
  UserPreferencesUpdatedEvent,
  UserRemovedFromOrganizationEvent,
  UserRestoredEvent,
  UserRoleAssignedEvent,
  UserRoleRemovedEvent,
  UserSuspendedEvent,
  UserTwoFactorDisabledEvent,
  UserTwoFactorEnabledEvent,
} from '../user.events'

/**
 * @description 用户领域事件测试套件
 *
 * 主要测试内容：
 * 1. 事件基类功能测试
 * 2. 各种具体事件类型测试
 * 3. 事件序列化测试
 * 4. 事件数据完整性测试
 */
describe('UserDomainEvent', () => {
  let mockUser: User
  const tenantId = generateUuid()
  const adminUserId = generateUuid()

  beforeEach(() => {
    // 创建测试用户
    mockUser = new User(
      generateUuid(),
      'testuser',
      'test@example.com',
      'Test',
      'User',
      tenantId,
      adminUserId,
      'hashedPassword123',
    )
  })

  describe('UserDomainEvent Base Class', () => {
    it('应该正确创建基础事件属性', () => {
      const event = new UserCreatedEvent(mockUser)

      expect(event.eventId).toBeDefined()
      expect(event.eventId).toMatch(/^user_event_\d+_[a-z0-9]+$/)
      expect(event.occurredOn).toBeInstanceOf(Date)
      expect(event.userId).toBe(mockUser.id)
      expect(event.tenantId).toBe(tenantId)
      expect(event.eventType).toBe('UserCreatedEvent')
    })

    it('应该正确序列化事件', () => {
      const event = new UserCreatedEvent(mockUser)
      const json = event.toJSON() as any

      expect(json).toHaveProperty('eventId')
      expect(json).toHaveProperty('occurredOn')
      expect(json).toHaveProperty('userId')
      expect(json).toHaveProperty('tenantId')
      expect(json).toHaveProperty('eventType')
      expect(json.eventType).toBe('UserCreatedEvent')
    })
  })

  describe('UserCreatedEvent', () => {
    it('应该正确创建用户创建事件', () => {
      const event = new UserCreatedEvent(mockUser)

      expect(event.userData).toBeDefined()
      expect(event.userData.username).toBe('testuser')
      expect(event.userData.email).toBe('test@example.com')
      expect(event.userData.firstName).toBe('Test')
      expect(event.userData.lastName).toBe('User')
      expect(event.userData.adminUserId).toBe(adminUserId)
    })

    it('应该正确序列化用户创建事件', () => {
      const event = new UserCreatedEvent(mockUser)
      const json = event.toJSON() as any

      expect(json).toHaveProperty('userData')
      expect(json.userData).toHaveProperty('username', 'testuser')
      expect(json.userData).toHaveProperty('email', 'test@example.com')
    })
  })

  describe('UserActivatedEvent', () => {
    it('应该正确创建用户激活事件', () => {
      const activatedBy = generateUuid()
      const reason = '管理员手动激活'
      const event = new UserActivatedEvent(mockUser, activatedBy, reason)

      expect(event.activatedBy).toBe(activatedBy)
      expect(event.reason).toBe(reason)
    })

    it('应该支持可选参数', () => {
      const event = new UserActivatedEvent(mockUser)

      expect(event.activatedBy).toBeUndefined()
      expect(event.reason).toBeUndefined()
    })
  })

  describe('UserSuspendedEvent', () => {
    it('应该正确创建用户禁用事件', () => {
      const suspendedBy = generateUuid()
      const reason = '违反使用条款'
      const event = new UserSuspendedEvent(mockUser, suspendedBy, reason)

      expect(event.suspendedBy).toBe(suspendedBy)
      expect(event.reason).toBe(reason)
    })
  })

  describe('UserDeletedEvent', () => {
    it('应该正确创建用户删除事件', () => {
      const deletedBy = generateUuid()
      const reason = '用户请求删除'
      const event = new UserDeletedEvent(mockUser, deletedBy, reason)

      expect(event.deletedBy).toBe(deletedBy)
      expect(event.reason).toBe(reason)
    })
  })

  describe('UserRestoredEvent', () => {
    it('应该正确创建用户恢复事件', () => {
      const restoredBy = generateUuid()
      const reason = '误删恢复'
      const event = new UserRestoredEvent(mockUser, restoredBy, reason)

      expect(event.restoredBy).toBe(restoredBy)
      expect(event.reason).toBe(reason)
    })
  })

  describe('UserInfoUpdatedEvent', () => {
    it('应该正确创建用户信息更新事件', () => {
      const oldInfo = {
        firstName: 'Old',
        lastName: 'Name',
        displayName: 'Old Name',
        avatar: 'old-avatar.jpg',
      }
      const newInfo = {
        firstName: 'New',
        lastName: 'Name',
        displayName: 'New Name',
        avatar: 'new-avatar.jpg',
      }
      const updatedBy = generateUuid()
      const event = new UserInfoUpdatedEvent(
        mockUser,
        oldInfo,
        newInfo,
        updatedBy,
      )

      expect(event.oldInfo).toEqual(oldInfo)
      expect(event.newInfo).toEqual(newInfo)
      expect(event.updatedBy).toBe(updatedBy)
    })
  })

  describe('UserContactInfoUpdatedEvent', () => {
    it('应该正确创建用户联系信息更新事件', () => {
      const oldContactInfo = {
        email: 'old@example.com',
        phone: '1234567890',
      }
      const newContactInfo = {
        email: 'new@example.com',
        phone: '0987654321',
      }
      const updatedBy = generateUuid()
      const event = new UserContactInfoUpdatedEvent(
        mockUser,
        oldContactInfo,
        newContactInfo,
        updatedBy,
      )

      expect(event.oldContactInfo).toEqual(oldContactInfo)
      expect(event.newContactInfo).toEqual(newContactInfo)
      expect(event.updatedBy).toBe(updatedBy)
    })
  })

  describe('UserPasswordUpdatedEvent', () => {
    it('应该正确创建用户密码更新事件', () => {
      const updatedBy = generateUuid()
      const reason = '定期密码更新'
      const event = new UserPasswordUpdatedEvent(mockUser, updatedBy, reason)

      expect(event.updatedBy).toBe(updatedBy)
      expect(event.reason).toBe(reason)
    })
  })

  describe('UserLoginSuccessEvent', () => {
    it('应该正确创建用户登录成功事件', () => {
      const ipAddress = '192.168.1.1'
      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      const event = new UserLoginSuccessEvent(mockUser, ipAddress, userAgent)

      expect(event.loginAt).toBeInstanceOf(Date)
      expect(event.ipAddress).toBe(ipAddress)
      expect(event.userAgent).toBe(userAgent)
    })

    it('应该支持可选参数', () => {
      const event = new UserLoginSuccessEvent(mockUser)

      expect(event.ipAddress).toBeUndefined()
      expect(event.userAgent).toBeUndefined()
    })
  })

  describe('UserLoginFailureEvent', () => {
    it('应该正确创建用户登录失败事件', () => {
      const ipAddress = '192.168.1.1'
      const userAgent =
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      const failureReason = '密码错误'
      const event = new UserLoginFailureEvent(
        mockUser,
        ipAddress,
        userAgent,
        failureReason,
      )

      expect(event.failureAt).toBeInstanceOf(Date)
      expect(event.ipAddress).toBe(ipAddress)
      expect(event.userAgent).toBe(userAgent)
      expect(event.failureReason).toBe(failureReason)
      expect(event.loginAttempts).toBe(0) // 初始值
    })
  })

  describe('UserEmailVerifiedEvent', () => {
    it('应该正确创建用户邮箱验证事件', () => {
      const verifiedBy = generateUuid()
      const event = new UserEmailVerifiedEvent(mockUser, verifiedBy)

      expect(event.verifiedAt).toBeInstanceOf(Date)
      expect(event.verifiedBy).toBe(verifiedBy)
    })
  })

  describe('UserPhoneVerifiedEvent', () => {
    it('应该正确创建用户手机号验证事件', () => {
      const verifiedBy = generateUuid()
      const event = new UserPhoneVerifiedEvent(mockUser, verifiedBy)

      expect(event.verifiedAt).toBeInstanceOf(Date)
      expect(event.verifiedBy).toBe(verifiedBy)
    })
  })

  describe('UserTwoFactorEnabledEvent', () => {
    it('应该正确创建用户二步验证启用事件', () => {
      const enabledBy = generateUuid()
      const event = new UserTwoFactorEnabledEvent(mockUser, enabledBy)

      expect(event.enabledAt).toBeInstanceOf(Date)
      expect(event.enabledBy).toBe(enabledBy)
    })
  })

  describe('UserTwoFactorDisabledEvent', () => {
    it('应该正确创建用户二步验证禁用事件', () => {
      const disabledBy = generateUuid()
      const event = new UserTwoFactorDisabledEvent(mockUser, disabledBy)

      expect(event.disabledAt).toBeInstanceOf(Date)
      expect(event.disabledBy).toBe(disabledBy)
    })
  })

  describe('UserPreferencesUpdatedEvent', () => {
    it('应该正确创建用户偏好设置更新事件', () => {
      const oldPreferences = { theme: 'dark', language: 'zh-CN' }
      const newPreferences = { theme: 'light', language: 'en-US' }
      const updatedBy = generateUuid()
      const event = new UserPreferencesUpdatedEvent(
        mockUser,
        oldPreferences,
        newPreferences,
        updatedBy,
      )

      expect(event.oldPreferences).toEqual(oldPreferences)
      expect(event.newPreferences).toEqual(newPreferences)
      expect(event.updatedBy).toBe(updatedBy)
    })
  })

  describe('UserAssignedToOrganizationEvent', () => {
    it('应该正确创建用户分配到组织事件', () => {
      const organizationId = generateUuid()
      const assignedBy = generateUuid()
      const event = new UserAssignedToOrganizationEvent(
        mockUser,
        organizationId,
        assignedBy,
      )

      expect(event.organizationId).toBe(organizationId)
      expect(event.assignedBy).toBe(assignedBy)
      expect(event.assignedAt).toBeInstanceOf(Date)
    })
  })

  describe('UserRemovedFromOrganizationEvent', () => {
    it('应该正确创建用户从组织移除事件', () => {
      const organizationId = generateUuid()
      const removedBy = generateUuid()
      const event = new UserRemovedFromOrganizationEvent(
        mockUser,
        organizationId,
        removedBy,
      )

      expect(event.organizationId).toBe(organizationId)
      expect(event.removedBy).toBe(removedBy)
      expect(event.removedAt).toBeInstanceOf(Date)
    })
  })

  describe('UserRoleAssignedEvent', () => {
    it('应该正确创建用户角色分配事件', () => {
      const roleId = generateUuid()
      const assignedBy = generateUuid()
      const event = new UserRoleAssignedEvent(mockUser, roleId, assignedBy)

      expect(event.roleId).toBe(roleId)
      expect(event.assignedBy).toBe(assignedBy)
      expect(event.assignedAt).toBeInstanceOf(Date)
    })
  })

  describe('UserRoleRemovedEvent', () => {
    it('应该正确创建用户角色移除事件', () => {
      const roleId = generateUuid()
      const removedBy = generateUuid()
      const event = new UserRoleRemovedEvent(mockUser, roleId, removedBy)

      expect(event.roleId).toBe(roleId)
      expect(event.removedBy).toBe(removedBy)
      expect(event.removedAt).toBeInstanceOf(Date)
    })
  })

  describe('Event ID Generation', () => {
    it('应该生成唯一的事件ID', () => {
      const event1 = new UserCreatedEvent(mockUser)
      const event2 = new UserCreatedEvent(mockUser)

      expect(event1.eventId).not.toBe(event2.eventId)
      expect(event1.eventId).toMatch(/^user_event_\d+_[a-z0-9]+$/)
      expect(event2.eventId).toMatch(/^user_event_\d+_[a-z0-9]+$/)
    })
  })

  describe('Event Timestamps', () => {
    it('应该正确设置事件发生时间', () => {
      const beforeEvent = new Date()
      const event = new UserCreatedEvent(mockUser)
      const afterEvent = new Date()

      expect(event.occurredOn.getTime()).toBeGreaterThanOrEqual(
        beforeEvent.getTime(),
      )
      expect(event.occurredOn.getTime()).toBeLessThanOrEqual(
        afterEvent.getTime(),
      )
    })
  })

  describe('Event Inheritance', () => {
    it('所有事件都应该继承自UserDomainEvent', () => {
      const events = [
        new UserCreatedEvent(mockUser),
        new UserActivatedEvent(mockUser),
        new UserSuspendedEvent(mockUser),
        new UserDeletedEvent(mockUser),
        new UserRestoredEvent(mockUser),
        new UserInfoUpdatedEvent(
          mockUser,
          { firstName: 'Old', lastName: 'Name' },
          { firstName: 'New', lastName: 'Name' },
        ),
        new UserContactInfoUpdatedEvent(
          mockUser,
          { email: 'old@example.com' },
          { email: 'new@example.com' },
        ),
        new UserPasswordUpdatedEvent(mockUser),
        new UserLoginSuccessEvent(mockUser),
        new UserLoginFailureEvent(mockUser),
        new UserEmailVerifiedEvent(mockUser),
        new UserPhoneVerifiedEvent(mockUser),
        new UserTwoFactorEnabledEvent(mockUser),
        new UserTwoFactorDisabledEvent(mockUser),
        new UserPreferencesUpdatedEvent(mockUser, {}, {}),
        new UserAssignedToOrganizationEvent(mockUser, generateUuid()),
        new UserRemovedFromOrganizationEvent(mockUser),
        new UserRoleAssignedEvent(mockUser, generateUuid()),
        new UserRoleRemovedEvent(mockUser, generateUuid()),
      ]

      events.forEach((event) => {
        expect(event).toBeInstanceOf(UserDomainEvent)
        expect(event.userId).toBe(mockUser.id)
        expect(event.tenantId).toBe(tenantId)
      })
    })
  })
})
