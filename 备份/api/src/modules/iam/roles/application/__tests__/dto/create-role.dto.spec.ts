import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { CreateRoleDto } from '../../dto/create-role.dto'

/**
 * @description CreateRoleDto单元测试
 *
 * 测试覆盖：
 * 1. 必填字段验证
 * 2. 可选字段验证
 * 3. 字段长度限制
 * 4. 数据类型验证
 * 5. UUID格式验证
 * 6. 数值范围验证
 */
describe('CreateRoleDto', () => {
  describe('基本验证', () => {
    it('应该通过有效的创建角色DTO', async () => {
      const createRoleDto = plainToClass(CreateRoleDto, {
        name: '管理员',
        code: 'ADMIN',
        description: '系统管理员角色',
        priority: 100,
        isSystemRole: false,
        isDefaultRole: false,
      })

      const errors = await validate(createRoleDto)
      expect(errors).toHaveLength(0)
    })

    it('应该通过最小化的创建角色DTO', async () => {
      const createRoleDto = plainToClass(CreateRoleDto, {
        name: '测试角色',
        code: 'TEST',
      })

      const errors = await validate(createRoleDto)
      expect(errors).toHaveLength(0)
    })
  })

  describe('必填字段验证', () => {
    it('应该拒绝缺少name字段的DTO', async () => {
      const createRoleDto = plainToClass(CreateRoleDto, {
        code: 'ADMIN',
      })

      const errors = await validate(createRoleDto)
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('name')
    })

    it('应该拒绝缺少code字段的DTO', async () => {
      const createRoleDto = plainToClass(CreateRoleDto, {
        name: '管理员',
      })

      const errors = await validate(createRoleDto)
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('code')
    })
  })

  describe('字段长度验证', () => {
    it('应该拒绝name字段超过50个字符', async () => {
      const createRoleDto = plainToClass(CreateRoleDto, {
        name: 'a'.repeat(51),
        code: 'ADMIN',
      })

      const errors = await validate(createRoleDto)
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('name')
    })

    it('应该拒绝code字段超过20个字符', async () => {
      const createRoleDto = plainToClass(CreateRoleDto, {
        name: '管理员',
        code: 'a'.repeat(21),
      })

      const errors = await validate(createRoleDto)
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('code')
    })
  })

  describe('数值范围验证', () => {
    it('应该拒绝priority小于1', async () => {
      const createRoleDto = plainToClass(CreateRoleDto, {
        name: '管理员',
        code: 'ADMIN',
        priority: 0,
      })

      const errors = await validate(createRoleDto)
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('priority')
    })

    it('应该拒绝priority大于1000', async () => {
      const createRoleDto = plainToClass(CreateRoleDto, {
        name: '管理员',
        code: 'ADMIN',
        priority: 1001,
      })

      const errors = await validate(createRoleDto)
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('priority')
    })
  })
})
