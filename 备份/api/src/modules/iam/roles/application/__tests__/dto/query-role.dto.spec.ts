import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { RoleStatus } from '../../../domain/value-objects/role-status.value-object'
import { QueryRoleDto } from '../../dto/query-role.dto'

describe('QueryRoleDto', () => {
  describe('基本验证', () => {
    it('应该通过空的查询DTO', async () => {
      const queryRoleDto = plainToClass(QueryRoleDto, {})

      const errors = await validate(queryRoleDto)
      expect(errors).toHaveLength(0)
    })

    it('应该通过基本查询参数', async () => {
      const queryRoleDto = plainToClass(QueryRoleDto, {
        page: 1,
        limit: 10,
        name: '管理员',
        code: 'ADMIN',
      })

      const errors = await validate(queryRoleDto)
      expect(errors).toHaveLength(0)
    })
  })

  describe('分页参数验证', () => {
    it('应该设置默认分页参数', async () => {
      const queryRoleDto = plainToClass(QueryRoleDto, {})

      expect(queryRoleDto.page).toBe(1)
      expect(queryRoleDto.limit).toBe(10)
    })

    it('应该拒绝page小于1', async () => {
      const queryRoleDto = plainToClass(QueryRoleDto, {
        page: 0,
      })

      const errors = await validate(queryRoleDto)
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('page')
    })

    it('应该拒绝limit大于100', async () => {
      const queryRoleDto = plainToClass(QueryRoleDto, {
        limit: 101,
      })

      const errors = await validate(queryRoleDto)
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('limit')
    })
  })

  describe('状态枚举验证', () => {
    it('应该通过有效的状态值', async () => {
      const queryRoleDto = plainToClass(QueryRoleDto, {
        status: RoleStatus.ACTIVE,
      })

      const errors = await validate(queryRoleDto)
      expect(errors).toHaveLength(0)
    })

    it('应该拒绝无效的状态值', async () => {
      const queryRoleDto = plainToClass(QueryRoleDto, {
        status: 'INVALID_STATUS',
      })

      const errors = await validate(queryRoleDto)
      expect(errors).toHaveLength(1)
      expect(errors[0].property).toBe('status')
    })
  })

  describe('布尔值转换验证', () => {
    it('应该转换字符串true为布尔值', async () => {
      const queryRoleDto = plainToClass(QueryRoleDto, {
        isSystemRole: 'true',
        isDefaultRole: 'false',
      })

      const errors = await validate(queryRoleDto)
      expect(errors).toHaveLength(0)
      expect(queryRoleDto.isSystemRole).toBe(true)
      expect(queryRoleDto.isDefaultRole).toBe(false)
    })
  })

  describe('排序参数验证', () => {
    it('应该设置默认排序参数', async () => {
      const queryRoleDto = plainToClass(QueryRoleDto, {})

      expect(queryRoleDto.sortBy).toBe('createdAt')
      expect(queryRoleDto.sortOrder).toBe('DESC')
    })

    it('应该通过自定义排序参数', async () => {
      const queryRoleDto = plainToClass(QueryRoleDto, {
        sortBy: 'name',
        sortOrder: 'ASC',
      })

      const errors = await validate(queryRoleDto)
      expect(errors).toHaveLength(0)
    })
  })
})
