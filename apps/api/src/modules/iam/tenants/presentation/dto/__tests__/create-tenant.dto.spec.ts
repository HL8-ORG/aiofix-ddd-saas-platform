import { validate } from 'class-validator'
import { CreateTenantDto } from '../create-tenant.dto'

/**
 * @test CreateTenantDto测试
 * @description 测试租户创建DTO的验证规则
 */
describe('CreateTenantDto', () => {
  describe('验证规则', () => {
    it('应该通过有效的创建租户数据', async () => {
      const dto = new CreateTenantDto()
      dto.name = '测试租户'
      dto.code = 'test-tenant'
      dto.adminUserId = '550e8400-e29b-41d4-a716-446655440000'
      dto.description = '这是一个测试租户'
      dto.settings = { theme: 'dark', language: 'zh-CN' }

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('应该拒绝空的租户名称', async () => {
      const dto = new CreateTenantDto()
      dto.name = ''
      dto.code = 'test-tenant'
      dto.adminUserId = '550e8400-e29b-41d4-a716-446655440000'

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.isNotEmpty).toBe('租户名称不能为空')
    })

    it('应该拒绝过长的租户名称', async () => {
      const dto = new CreateTenantDto()
      dto.name = 'a'.repeat(101) // 101个字符，超过100的限制
      dto.code = 'test-tenant'
      dto.adminUserId = '550e8400-e29b-41d4-a716-446655440000'

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.maxLength).toBe('租户名称不能超过100个字符')
    })

    it('应该拒绝空的租户编码', async () => {
      const dto = new CreateTenantDto()
      dto.name = '测试租户'
      dto.code = ''
      dto.adminUserId = '550e8400-e29b-41d4-a716-446655440000'

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.isNotEmpty).toBe('租户编码不能为空')
    })

    it('应该拒绝过长的租户编码', async () => {
      const dto = new CreateTenantDto()
      dto.name = '测试租户'
      dto.code = 'a'.repeat(51) // 51个字符，超过50的限制
      dto.adminUserId = '550e8400-e29b-41d4-a716-446655440000'

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.maxLength).toBe('租户编码不能超过50个字符')
    })

    it('应该拒绝无效的管理员用户ID', async () => {
      const dto = new CreateTenantDto()
      dto.name = '测试租户'
      dto.code = 'test-tenant'
      dto.adminUserId = 'invalid-uuid'

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.isUuid).toBe('管理员用户ID必须是有效的UUID v4格式')
    })

    it('应该拒绝过长的租户描述', async () => {
      const dto = new CreateTenantDto()
      dto.name = '测试租户'
      dto.code = 'test-tenant'
      dto.adminUserId = '550e8400-e29b-41d4-a716-446655440000'
      dto.description = 'a'.repeat(501) // 501个字符，超过500的限制

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.maxLength).toBe('租户描述不能超过500个字符')
    })

    it('应该拒绝非对象的设置', async () => {
      const dto = new CreateTenantDto()
      dto.name = '测试租户'
      dto.code = 'test-tenant'
      dto.adminUserId = '550e8400-e29b-41d4-a716-446655440000'
        ; (dto as any).settings = 'not-an-object'

      const errors = await validate(dto)
      expect(errors).toHaveLength(1)
      expect(errors[0].constraints?.isObject).toBe('租户配置必须是对象')
    })
  })

  describe('可选字段', () => {
    it('应该允许没有描述和设置的创建', async () => {
      const dto = new CreateTenantDto()
      dto.name = '测试租户'
      dto.code = 'test-tenant'
      dto.adminUserId = '550e8400-e29b-41d4-a716-446655440000'

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('应该允许有效的设置对象', async () => {
      const dto = new CreateTenantDto()
      dto.name = '测试租户'
      dto.code = 'test-tenant'
      dto.adminUserId = '550e8400-e29b-41d4-a716-446655440000'
      dto.settings = { theme: 'dark', language: 'zh-CN', notifications: true }

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })
  })

  describe('边界条件', () => {
    it('应该接受最小长度的名称', async () => {
      const dto = new CreateTenantDto()
      dto.name = 'ab' // 2个字符，最小长度
      dto.code = 'test-tenant'
      dto.adminUserId = '550e8400-e29b-41d4-a716-446655440000'

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('应该接受最大长度的名称', async () => {
      const dto = new CreateTenantDto()
      dto.name = 'a'.repeat(100) // 100个字符，最大长度
      dto.code = 'test-tenant'
      dto.adminUserId = '550e8400-e29b-41d4-a716-446655440000'

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('应该接受最小长度的编码', async () => {
      const dto = new CreateTenantDto()
      dto.name = '测试租户'
      dto.code = 'abc' // 3个字符，最小长度
      dto.adminUserId = '550e8400-e29b-41d4-a716-446655440000'

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })

    it('应该接受最大长度的编码', async () => {
      const dto = new CreateTenantDto()
      dto.name = '测试租户'
      dto.code = 'a'.repeat(50) // 50个字符，最大长度
      dto.adminUserId = '550e8400-e29b-41d4-a716-446655440000'

      const errors = await validate(dto)
      expect(errors).toHaveLength(0)
    })
  })
})
