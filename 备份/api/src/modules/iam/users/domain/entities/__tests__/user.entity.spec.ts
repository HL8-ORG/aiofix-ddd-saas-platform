import { generateUuid } from '@/shared/domain/utils/uuid.util'
import { UserStatusValue } from '../../value-objects/user-status.value-object'
import { User } from '../user.entity'

/**
 * @description 用户实体测试套件
 *
 * 主要测试内容：
 * 1. 用户创建和基本属性
 * 2. 用户状态管理
 * 3. 多组织功能
 * 4. 领域事件
 * 5. 业务方法
 */
describe('User Entity', () => {
  let user: User
  const tenantId = generateUuid()
  const adminUserId = generateUuid()

  beforeEach(() => {
    user = new User(
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

  describe('User Creation', () => {
    it('应该正确创建用户', () => {
      expect(user.getUsername()).toBe('testuser')
      expect(user.getEmail()).toBe('test@example.com')
      expect(user.firstName).toBe('Test')
      expect(user.lastName).toBe('User')
      expect(user.tenantId).toBe(tenantId)
      expect(user.adminUserId).toBe(adminUserId)
      expect(user.getStatus()).toBe('PENDING')
      expect(user.getOrganizationIds()).toEqual([])
    })

    it('应该正确设置显示名称', () => {
      expect(user.displayName).toBe('Test User')
    })

    it('应该支持自定义显示名称', () => {
      const customUser = new User(
        generateUuid(),
        'customuser',
        'custom@example.com',
        'Custom',
        'User',
        tenantId,
        adminUserId,
        'hashedPassword123',
        undefined,
        'Custom Display Name',
      )
      expect(customUser.displayName).toBe('Custom Display Name')
    })

    it('应该支持初始组织列表', () => {
      const organizationIds = [generateUuid(), generateUuid()]
      const userWithOrgs = new User(
        generateUuid(),
        'orguser',
        'org@example.com',
        'Org',
        'User',
        tenantId,
        adminUserId,
        'hashedPassword123',
        undefined,
        undefined,
        undefined,
        organizationIds,
      )
      expect(userWithOrgs.getOrganizationIds()).toEqual(organizationIds)
    })

    it('应该支持初始角色列表', () => {
      const roleIds = [generateUuid(), generateUuid()]
      const userWithRoles = new User(
        generateUuid(),
        'roleuser',
        'role@example.com',
        'Role',
        'User',
        tenantId,
        adminUserId,
        'hashedPassword123',
        undefined,
        undefined,
        undefined,
        undefined,
        roleIds,
      )
      expect(userWithRoles.getRoleIds()).toEqual(roleIds)
    })
  })

  describe('User Status Management', () => {
    it('应该正确激活用户', () => {
      user.activate()
      expect(user.getStatus()).toBe('ACTIVE')
      expect(user.isActive()).toBe(true)
    })

    it('应该正确禁用用户', () => {
      user.activate()
      user.suspend()
      expect(user.getStatus()).toBe('SUSPENDED')
      expect(user.isSuspended()).toBe(true)
    })

    it('应该正确删除用户', () => {
      user.activate()
      user.markAsDeleted()
      expect(user.getStatus()).toBe('DELETED')
      expect(user.isDeleted()).toBe(true)
    })

    it('应该正确恢复用户', () => {
      user.activate()
      user.markAsDeleted()
      user.restore()
      expect(user.getStatus()).toBe('SUSPENDED')
      expect(user.isDeleted()).toBe(false)
    })

    it('应该阻止无效的状态转换', () => {
      // 待激活状态可以激活，所以第一次调用不会抛出异常
      user.activate()
      // 激活状态不能再次激活
      expect(() => user.activate()).toThrow('用户当前状态为激活，无法激活')
    })
  })

  describe('Multi-Organization Management', () => {
    const org1 = generateUuid()
    const org2 = generateUuid()
    const org3 = generateUuid()

    it('应该正确分配用户到组织', () => {
      user.assignToOrganization(org1)
      expect(user.getOrganizationIds()).toEqual([org1])
      expect(user.isInOrganization(org1)).toBe(true)
      expect(user.isInOrganization(org2)).toBe(false)
    })

    it('应该支持分配到多个组织', () => {
      user.assignToOrganization(org1)
      user.assignToOrganization(org2)
      expect(user.getOrganizationIds()).toEqual([org1, org2])
      expect(user.isInOrganization(org1)).toBe(true)
      expect(user.isInOrganization(org2)).toBe(true)
    })

    it('应该避免重复分配', () => {
      user.assignToOrganization(org1)
      user.assignToOrganization(org1)
      expect(user.getOrganizationIds()).toEqual([org1])
    })

    it('应该正确从指定组织移除用户', () => {
      user.assignToOrganization(org1)
      user.assignToOrganization(org2)
      user.removeFromOrganization(org1)
      expect(user.getOrganizationIds()).toEqual([org2])
      expect(user.isInOrganization(org1)).toBe(false)
      expect(user.isInOrganization(org2)).toBe(true)
    })

    it('应该支持移除所有组织', () => {
      user.assignToOrganization(org1)
      user.assignToOrganization(org2)
      user.removeFromOrganization()
      expect(user.getOrganizationIds()).toEqual([])
      expect(user.isInOrganization(org1)).toBe(false)
      expect(user.isInOrganization(org2)).toBe(false)
    })

    it('应该正确处理不存在的组织移除', () => {
      user.assignToOrganization(org1)
      user.removeFromOrganization(org2)
      expect(user.getOrganizationIds()).toEqual([org1])
    })
  })

  describe('Role Management', () => {
    const role1 = generateUuid()
    const role2 = generateUuid()
    const role3 = generateUuid()

    it('应该正确分配角色给用户', () => {
      user.assignRole(role1)
      expect(user.getRoleIds()).toEqual([role1])
      expect(user.hasRole(role1)).toBe(true)
      expect(user.hasRole(role2)).toBe(false)
    })

    it('应该支持分配多个角色', () => {
      user.assignRole(role1)
      user.assignRole(role2)
      expect(user.getRoleIds()).toEqual([role1, role2])
      expect(user.hasRole(role1)).toBe(true)
      expect(user.hasRole(role2)).toBe(true)
    })

    it('应该避免重复分配角色', () => {
      user.assignRole(role1)
      user.assignRole(role1)
      expect(user.getRoleIds()).toEqual([role1])
    })

    it('应该正确移除指定角色', () => {
      user.assignRole(role1)
      user.assignRole(role2)
      user.removeRole(role1)
      expect(user.getRoleIds()).toEqual([role2])
      expect(user.hasRole(role1)).toBe(false)
      expect(user.hasRole(role2)).toBe(true)
    })

    it('应该支持移除所有角色', () => {
      user.assignRole(role1)
      user.assignRole(role2)
      user.removeRole()
      expect(user.getRoleIds()).toEqual([])
      expect(user.hasRole(role1)).toBe(false)
      expect(user.hasRole(role2)).toBe(false)
    })

    it('应该正确处理不存在的角色移除', () => {
      user.assignRole(role1)
      user.removeRole(role2)
      expect(user.getRoleIds()).toEqual([role1])
    })
  })

  describe('User Information Management', () => {
    it('应该正确更新用户信息', () => {
      user.updateInfo('New', 'Name', 'New Display Name', 'avatar.jpg')
      expect(user.firstName).toBe('New')
      expect(user.lastName).toBe('Name')
      expect(user.displayName).toBe('New Display Name')
      expect(user.avatar).toBe('avatar.jpg')
    })

    it('应该正确更新联系信息', () => {
      user.updateContactInfo('new@example.com', '13812345678')
      expect(user.getEmail()).toBe('new@example.com')
      expect(user.getPhone()).toBe('13812345678')
    })

    it('应该正确更新偏好设置', () => {
      user.updatePreferences({ theme: 'dark', language: 'zh-CN' })
      expect(user.preferences).toEqual({ theme: 'dark', language: 'zh-CN' })

      user.updatePreferences({ theme: 'light' })
      expect(user.preferences).toEqual({ theme: 'light', language: 'zh-CN' })
    })
  })

  describe('Security Features', () => {
    it('应该正确记录登录成功', () => {
      const beforeLogin = new Date()
      user.recordLoginSuccess()
      const afterLogin = new Date()

      expect(user.lastLoginAt).toBeInstanceOf(Date)
      expect(user.lastLoginAt!.getTime()).toBeGreaterThanOrEqual(
        beforeLogin.getTime(),
      )
      expect(user.lastLoginAt!.getTime()).toBeLessThanOrEqual(
        afterLogin.getTime(),
      )
      expect(user.loginAttempts).toBe(0)
      expect(user.lockedUntil).toBeUndefined()
    })

    it('应该正确记录登录失败', () => {
      user.recordLoginFailure()
      expect(user.loginAttempts).toBe(1)
      expect(user.isLocked()).toBe(false)

      // 连续失败5次后应该锁定
      for (let i = 0; i < 4; i++) {
        user.recordLoginFailure()
      }
      expect(user.loginAttempts).toBe(5)
      expect(user.isLocked()).toBe(true)
    })

    it('应该正确验证邮箱和手机号', () => {
      user.verifyEmail()
      expect(user.emailVerified).toBe(true)

      user.verifyPhone()
      expect(user.phoneVerified).toBe(true)
    })

    it('应该正确启用和禁用二步验证', () => {
      user.enableTwoFactor('secret123')
      expect(user.twoFactorEnabled).toBe(true)
      expect(user.twoFactorSecret).toBe('secret123')

      user.disableTwoFactor()
      expect(user.twoFactorEnabled).toBe(false)
      expect(user.twoFactorSecret).toBeUndefined()
    })
  })

  describe('Domain Events', () => {
    it('应该在用户创建时产生事件', () => {
      const events = user.getDomainEvents()
      expect(events).toHaveLength(1)
      expect(events[0].eventType).toBe('UserCreatedEvent')
    })

    it('应该在状态变更时产生事件', () => {
      user.clearDomainEvents()
      user.activate()

      const events = user.getDomainEvents()
      expect(events).toHaveLength(1)
      expect(events[0].eventType).toBe('UserActivatedEvent')
    })

    it('应该在组织分配时产生事件', () => {
      user.clearDomainEvents()
      user.assignToOrganization(generateUuid())

      const events = user.getDomainEvents()
      expect(events).toHaveLength(1)
      expect(events[0].eventType).toBe('UserAssignedToOrganizationEvent')
    })

    it('应该在组织移除时产生事件', () => {
      const orgId = generateUuid()
      user.assignToOrganization(orgId)
      user.clearDomainEvents()
      user.removeFromOrganization(orgId)

      const events = user.getDomainEvents()
      expect(events).toHaveLength(1)
      expect(events[0].eventType).toBe('UserRemovedFromOrganizationEvent')
    })

    it('应该在角色分配时产生事件', () => {
      user.clearDomainEvents()
      user.assignRole(generateUuid())

      const events = user.getDomainEvents()
      expect(events).toHaveLength(1)
      expect(events[0].eventType).toBe('UserRoleAssignedEvent')
    })

    it('应该在角色移除时产生事件', () => {
      const roleId = generateUuid()
      user.assignRole(roleId)
      user.clearDomainEvents()
      user.removeRole(roleId)

      const events = user.getDomainEvents()
      expect(events).toHaveLength(1)
      expect(events[0].eventType).toBe('UserRoleRemovedEvent')
    })

    it('应该支持清除领域事件', () => {
      user.activate()
      expect(user.hasDomainEvents()).toBe(true)

      user.clearDomainEvents()
      expect(user.hasDomainEvents()).toBe(false)
      expect(user.getDomainEvents()).toEqual([])
    })
  })

  describe('Login Capability', () => {
    it('待激活用户不能登录', () => {
      expect(user.canLogin()).toBe(false)
    })

    it('激活用户可以登录', () => {
      user.activate()
      expect(user.canLogin()).toBe(true)
    })

    it('锁定的用户不能登录', () => {
      user.activate()
      for (let i = 0; i < 5; i++) {
        user.recordLoginFailure()
      }
      expect(user.canLogin()).toBe(false)
    })

    it('已删除的用户不能登录', () => {
      user.activate()
      user.markAsDeleted()
      expect(user.canLogin()).toBe(false)
    })
  })

  describe('Utility Methods', () => {
    it('应该正确获取全名', () => {
      expect(user.getFullName()).toBe('Test User')
    })

    it('应该正确获取状态显示名称', () => {
      expect(user.getStatusDisplayName()).toBe('待激活')
      user.activate()
      expect(user.getStatusDisplayName()).toBe('激活')
    })

    it('应该正确获取状态描述', () => {
      expect(user.getStatusDescription()).toBe(
        '用户已注册但尚未激活，需要管理员激活或邮箱验证',
      )
      user.activate()
      expect(user.getStatusDescription()).toBe(
        '用户已激活，可以正常登录和使用系统',
      )
    })
  })
})
