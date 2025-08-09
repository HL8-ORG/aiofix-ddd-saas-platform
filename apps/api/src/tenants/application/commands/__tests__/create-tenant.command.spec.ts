import 'reflect-metadata'

/**
 * @file create-tenant.command.spec.ts
 * @description 创建租户命令的单元测试文件
 */
import { CreateTenantCommand, CreateTenantCommandDto } from '../create-tenant.command'

describe('CreateTenantCommand', () => {
  let validCommandData: any

  beforeEach(() => {
    validCommandData = {
      name: '测试租户',
      code: 'test_tenant',
      description: '这是一个测试租户',
      adminUserInfo: {
        username: 'admin',
        email: 'admin@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
      },
      settings: {
        maxUsers: 100,
        features: ['feature1', 'feature2'],
      },
      metadata: {
        source: 'web',
        ip: '192.168.1.1',
      },
      createdBy: 'system',
      requestId: 'req-123',
    }
  })

  describe('构造函数', () => {
    it('应该正确创建命令对象', () => {
      const command = new CreateTenantCommand(validCommandData)

      expect(command.commandId).toBeDefined()
      expect(command.commandId).toMatch(/^CreateTenant_[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/)
      expect(command.timestamp).toBeInstanceOf(Date)
      expect(command.data).toEqual(validCommandData)
    })

    it('应该生成唯一的命令ID', () => {
      const command1 = new CreateTenantCommand(validCommandData)
      const command2 = new CreateTenantCommand(validCommandData)

      expect(command1.commandId).not.toBe(command2.commandId)
    })
  })

  describe('validate方法', () => {
    it('应该验证有效的命令数据', () => {
      const command = new CreateTenantCommand(validCommandData)
      expect(() => command.validate()).not.toThrow()
    })

    it('应该拒绝空的租户名称', () => {
      const invalidData = { ...validCommandData, name: '' }
      const command = new CreateTenantCommand(invalidData)

      expect(() => command.validate()).toThrow('租户名称不能为空')
    })

    it('应该拒绝空的租户编码', () => {
      const invalidData = { ...validCommandData, code: '' }
      const command = new CreateTenantCommand(invalidData)

      expect(() => command.validate()).toThrow('租户编码不能为空')
    })

    it('应该拒绝无效的租户编码格式', () => {
      const invalidData = { ...validCommandData, code: '123invalid' }
      const command = new CreateTenantCommand(invalidData)

      expect(() => command.validate()).toThrow('租户编码必须以字母开头，只能包含字母、数字和下划线')
    })

    it('应该拒绝无效的邮箱格式', () => {
      const invalidData = {
        ...validCommandData,
        adminUserInfo: { ...validCommandData.adminUserInfo, email: 'invalid-email' },
      }
      const command = new CreateTenantCommand(invalidData)

      expect(() => command.validate()).toThrow('管理员邮箱格式不正确')
    })

    it('应该拒绝过短的密码', () => {
      const invalidData = {
        ...validCommandData,
        adminUserInfo: { ...validCommandData.adminUserInfo, password: '123' },
      }
      const command = new CreateTenantCommand(invalidData)

      expect(() => command.validate()).toThrow('管理员密码长度不能少于6个字符')
    })

    it('应该拒绝空的创建者ID', () => {
      const invalidData = { ...validCommandData, createdBy: '' }
      const command = new CreateTenantCommand(invalidData)

      expect(() => command.validate()).toThrow('创建者ID不能为空')
    })
  })

  describe('toJSON方法', () => {
    it('应该返回正确的JSON对象', () => {
      const command = new CreateTenantCommand(validCommandData)
      const json = command.toJSON()

      expect(json).toEqual({
        commandId: command.commandId,
        timestamp: command.timestamp,
        data: validCommandData,
      })
    })
  })

  describe('toString方法', () => {
    it('应该返回正确的字符串表示', () => {
      const command = new CreateTenantCommand(validCommandData)
      expect(command.toString()).toBe('CreateTenantCommand(测试租户, test_tenant)')
    })
  })
})

describe('CreateTenantCommandDto', () => {
  let validDtoData: any

  beforeEach(() => {
    validDtoData = {
      name: '测试租户',
      code: 'test_tenant',
      description: '这是一个测试租户',
      adminUserInfo: {
        username: 'admin',
        email: 'admin@test.com',
        password: 'password123',
        firstName: 'Admin',
        lastName: 'User',
      },
      settings: {
        maxUsers: 100,
      },
      metadata: {
        source: 'web',
      },
    }
  })

  describe('数据验证', () => {
    it('应该接受有效的DTO数据', () => {
      const dto = new CreateTenantCommandDto()
      Object.assign(dto, validDtoData)

      expect(dto.name).toBe('测试租户')
      expect(dto.code).toBe('test_tenant')
      expect(dto.description).toBe('这是一个测试租户')
      expect(dto.adminUserInfo.username).toBe('admin')
      expect(dto.adminUserInfo.email).toBe('admin@test.com')
      expect(dto.adminUserInfo.password).toBe('password123')
      expect(dto.adminUserInfo.firstName).toBe('Admin')
      expect(dto.adminUserInfo.lastName).toBe('User')
      expect(dto.settings).toEqual({ maxUsers: 100 })
      expect(dto.metadata).toEqual({ source: 'web' })
    })
  })
})
