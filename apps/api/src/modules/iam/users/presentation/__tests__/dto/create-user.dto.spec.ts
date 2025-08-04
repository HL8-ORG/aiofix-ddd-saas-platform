import { plainToClass } from 'class-transformer'
import { validate } from 'class-validator'
import { CreateUserDto } from '../../dto/create-user.dto'

/**
 * @description
 * CreateUserDto 测试套件
 * 测试用户创建DTO的验证和转换功能
 */
describe('CreateUserDto', () => {
  describe('验证规则', () => {
    it('应该通过有效的用户数据', async () => {
      const validData = {
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: 'StrongPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: '13800138000',
        displayName: 'John Doe',
        avatar: 'https://example.com/avatar.jpg',
        organizationIds: [
          '550e8400-e29b-41d4-a716-446655440000',
          '550e8400-e29b-41d4-a716-446655440001',
        ],
        roleIds: [
          '550e8400-e29b-41d4-a716-446655440002',
          '550e8400-e29b-41d4-a716-446655440003',
        ],
        preferences: { theme: 'dark' },
      }

      const dto = plainToClass(CreateUserDto, validData)
      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('应该拒绝无效的用户名', async () => {
      const invalidData = {
        username: '123invalid', // 以数字开头
        email: 'john.doe@example.com',
        password: 'StrongPassword123!',
        firstName: 'John',
        lastName: 'Doe',
      }

      const dto = plainToClass(CreateUserDto, invalidData)
      const errors = await validate(dto)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((error) => error.property === 'username')).toBe(true)
    })

    it('应该拒绝无效的邮箱', async () => {
      const invalidData = {
        username: 'john_doe',
        email: 'invalid-email',
        password: 'StrongPassword123!',
        firstName: 'John',
        lastName: 'Doe',
      }

      const dto = plainToClass(CreateUserDto, invalidData)
      const errors = await validate(dto)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((error) => error.property === 'email')).toBe(true)
    })

    it('应该拒绝弱密码', async () => {
      const invalidData = {
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: 'weak',
        firstName: 'John',
        lastName: 'Doe',
      }

      const dto = plainToClass(CreateUserDto, invalidData)
      const errors = await validate(dto)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((error) => error.property === 'password')).toBe(true)
    })

    it('应该拒绝空的必填字段', async () => {
      const invalidData = {
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: '',
      }

      const dto = plainToClass(CreateUserDto, invalidData)
      const errors = await validate(dto)

      expect(errors.length).toBeGreaterThan(0)
    })
  })

  describe('可选字段', () => {
    it('应该允许可选字段为空', async () => {
      const validData = {
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: 'StrongPassword123!',
        firstName: 'John',
        lastName: 'Doe',
      }

      const dto = plainToClass(CreateUserDto, validData)
      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('应该验证可选字段的格式', async () => {
      const invalidData = {
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: 'StrongPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        phone: 'invalid-phone',
      }

      const dto = plainToClass(CreateUserDto, invalidData)
      const errors = await validate(dto)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((error) => error.property === 'phone')).toBe(true)
    })
  })

  describe('数组字段', () => {
    it('应该验证UUID格式的组织ID', async () => {
      const invalidData = {
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: 'StrongPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        organizationIds: ['invalid-uuid'],
      }

      const dto = plainToClass(CreateUserDto, invalidData)
      const errors = await validate(dto)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((error) => error.property === 'organizationIds')).toBe(
        true,
      )
    })

    it('应该验证UUID格式的角色ID', async () => {
      const invalidData = {
        username: 'john_doe',
        email: 'john.doe@example.com',
        password: 'StrongPassword123!',
        firstName: 'John',
        lastName: 'Doe',
        roleIds: ['invalid-uuid'],
      }

      const dto = plainToClass(CreateUserDto, invalidData)
      const errors = await validate(dto)

      expect(errors.length).toBeGreaterThan(0)
      expect(errors.some((error) => error.property === 'roleIds')).toBe(true)
    })
  })

  describe('边界条件', () => {
    it('应该处理最小长度的用户名', async () => {
      const validData = {
        username: 'abc',
        email: 'john.doe@example.com',
        password: 'StrongPassword123!',
        firstName: 'John',
        lastName: 'Doe',
      }

      const dto = plainToClass(CreateUserDto, validData)
      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('应该处理最大长度的用户名', async () => {
      const validData = {
        username: 'a'.repeat(50),
        email: 'john.doe@example.com',
        password: 'StrongPassword123!',
        firstName: 'John',
        lastName: 'Doe',
      }

      const dto = plainToClass(CreateUserDto, validData)
      const errors = await validate(dto)

      expect(errors).toHaveLength(0)
    })

    it('应该拒绝过长的用户名', async () => {
      const invalidData = {
        username: 'a'.repeat(51),
        email: 'john.doe@example.com',
        password: 'StrongPassword123!',
        firstName: 'John',
        lastName: 'Doe',
      }

      const dto = plainToClass(CreateUserDto, invalidData)
      const errors = await validate(dto)

      expect(errors.length).toBeGreaterThan(0)
    })
  })
})
