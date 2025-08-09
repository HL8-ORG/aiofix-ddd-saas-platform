import '@nestjs/testing'

// 全局测试设置
beforeAll(() => {
  // 设置测试环境变量
  process.env.NODE_ENV = 'test'
})

afterAll(() => {
  // 清理测试环境
  jest.clearAllMocks()
})

// 全局测试工具函数
global.testUtils = {
  createMockUser: (overrides = {}) => ({
    id: 'user-1',
    username: {
      getValue: jest.fn().mockReturnValue('testuser'),
    },
    email: {
      getValue: jest.fn().mockReturnValue('test@example.com'),
    },
    firstName: 'Test',
    lastName: 'User',
    status: {
      getValue: jest.fn().mockReturnValue('ACTIVE'),
      isActive: jest.fn().mockReturnValue(true),
      canDelete: jest.fn().mockReturnValue(true),
      isDeleted: jest.fn().mockReturnValue(false),
    },
    tenantId: 'tenant-1',
    adminUserId: 'admin-1',
    passwordHash: 'hashedPassword123',
    phone: {
      getValue: jest.fn().mockReturnValue('13812345678'),
    },
    displayName: 'Test User',
    avatar: 'https://example.com/avatar.jpg',
    organizationIds: ['org-1', 'org-2'],
    roleIds: ['role-1', 'role-2'],
    preferences: { theme: 'dark' },
    updateInfo: jest.fn(),
    updateContactInfo: jest.fn(),
    removeFromOrganization: jest.fn(),
    assignToOrganization: jest.fn(),
    removeRole: jest.fn(),
    assignRole: jest.fn(),
    updatePreferences: jest.fn(),
    activate: jest.fn(),
    suspend: jest.fn(),
    markAsDeleted: jest.fn(),
    restore: jest.fn(),
    getEmail: jest.fn().mockReturnValue('test@example.com'),
    ...overrides,
  }),

  createMockUserRepository: () => ({
    findById: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
    hardDelete: jest.fn(),
    restore: jest.fn(),
    findWithPagination: jest.fn(),
    findActive: jest.fn(),
    findSuspended: jest.fn(),
    findDeleted: jest.fn(),
    findAll: jest.fn(),
    findByOrganizationId: jest.fn(),
    findByRoleId: jest.fn(),
    findByUsernameString: jest.fn(),
    findByEmailString: jest.fn(),
    findByPhoneString: jest.fn(),
    findBySearch: jest.fn(),
    findRecent: jest.fn(),
    findByDateRange: jest.fn(),
    findLocked: jest.fn(),
    findWithFailedLoginAttempts: jest.fn(),
    existsByUsernameString: jest.fn(),
    existsByEmailString: jest.fn(),
    existsByPhoneString: jest.fn(),
    count: jest.fn(),
    countByStatus: jest.fn(),
    countByOrganization: jest.fn(),
    countByRole: jest.fn(),
    countByDateRange: jest.fn(),
    countByTenant: jest.fn(),
    getActiveUserCount: jest.fn(),
    getNewUserCount: jest.fn(),
    getDeletedUserCount: jest.fn(),
  }),

  createMockUserStatus: (status = 'ACTIVE') => ({
    getValue: jest.fn().mockReturnValue(status),
    isActive: jest.fn().mockReturnValue(status === 'ACTIVE'),
    canDelete: jest
      .fn()
      .mockReturnValue(['PENDING', 'ACTIVE'].includes(status)),
    isDeleted: jest.fn().mockReturnValue(status === 'DELETED'),
  }),
}

// 扩展全局类型
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        createMockUser: (overrides?: any) => any
        createMockUserRepository: () => any
        createMockUserStatus: (status?: string) => any
      }
    }
  }
}
