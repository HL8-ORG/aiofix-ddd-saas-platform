import { Username } from '../username.value-object'

/**
 * @description Username值对象单元测试
 *
 * 测试Username的各种验证和规范化功能，包括：
 * 1. 有效用户名的创建和验证
 * 2. 无效用户名的错误处理
 * 3. 用户名规范化功能
 * 4. 值对象相等性比较
 * 5. 边界条件测试
 */
describe('Username', () => {
  describe('有效用户名', () => {
    it('应该接受有效的用户名', () => {
      const validUsernames = [
        'john',
        'john_doe',
        'john-doe',
        'john123',
        'john_doe123',
        'user123',
        'test_user',
        'test-user',
        'a123',
        'user_name_123',
      ]

      validUsernames.forEach((username) => {
        expect(() => new Username(username)).not.toThrow()
      })
    })

    it('应该规范化用户名', () => {
      const username = new Username('John_Doe')
      expect(username.getValue()).toBe('john_doe')
    })

    it('应该获取显示值', () => {
      const username = new Username('John_Doe')
      expect(username.getDisplayValue()).toBe('john_doe')
    })
  })

  describe('无效用户名', () => {
    it('应该拒绝空用户名', () => {
      expect(() => new Username('')).toThrow('用户名不能为空')
      expect(() => new Username('   ')).toThrow('用户名不能为空')
    })

    it('应该拒绝过短的用户名', () => {
      expect(() => new Username('ab')).toThrow('用户名长度不能少于3个字符')
      expect(() => new Username('a')).toThrow('用户名长度不能少于3个字符')
    })

    it('应该拒绝过长的用户名', () => {
      const longUsername = 'a'.repeat(51)
      expect(() => new Username(longUsername)).toThrow(
        '用户名长度不能超过50个字符',
      )
    })

    it('应该拒绝以数字开头的用户名', () => {
      expect(() => new Username('123user')).toThrow(
        '用户名格式无效：必须以字母开头，只能包含字母、数字、下划线、连字符，不能以特殊字符结尾',
      )
      expect(() => new Username('1user')).toThrow(
        '用户名格式无效：必须以字母开头，只能包含字母、数字、下划线、连字符，不能以特殊字符结尾',
      )
    })

    it('应该拒绝包含无效字符的用户名', () => {
      const invalidUsernames = [
        'user@name',
        'user name',
        'user.name',
        'user+name',
        'user=name',
        'user!name',
        'user#name',
        'user$name',
        'user%name',
        'user^name',
        'user&name',
        'user*name',
        'user(name)',
        'user[name]',
        'user{name}',
        'user<name>',
        'user/name',
        'user\\name',
        'user|name',
        'user:name',
        'user;name',
        'user,name',
        'user?name',
        'user~name',
      ]

      invalidUsernames.forEach((username) => {
        expect(() => new Username(username)).toThrow(
          '用户名格式无效：必须以字母开头，只能包含字母、数字、下划线、连字符，不能以特殊字符结尾',
        )
      })
    })

    it('应该拒绝包含连续特殊字符的用户名', () => {
      expect(() => new Username('user__name')).toThrow(
        '用户名不能包含连续的特殊字符',
      )
      expect(() => new Username('user--name')).toThrow(
        '用户名不能包含连续的特殊字符',
      )
      expect(() => new Username('user_-name')).toThrow(
        '用户名不能包含连续的特殊字符',
      )
      expect(() => new Username('user-_name')).toThrow(
        '用户名不能包含连续的特殊字符',
      )
    })

    it('应该拒绝以特殊字符结尾的用户名', () => {
      expect(() => new Username('username_')).toThrow(
        '用户名不能以特殊字符结尾',
      )
      expect(() => new Username('username-')).toThrow(
        '用户名不能以特殊字符结尾',
      )
    })
  })

  describe('值对象功能', () => {
    it('应该正确比较相等性', () => {
      const username1 = new Username('john_doe')
      const username2 = new Username('john_doe')
      const username3 = new Username('jane_doe')

      expect(username1.equals(username2)).toBe(true)
      expect(username1.equals(username3)).toBe(false)
      expect(username1.equals(null as any)).toBe(false)
      expect(username1.equals(undefined as any)).toBe(false)
    })

    it('应该正确转换为字符串', () => {
      const username = new Username('john_doe')
      expect(username.toString()).toBe('john_doe')
    })

    it('应该正确序列化为JSON', () => {
      const username = new Username('john_doe')
      expect(username.toJSON()).toBe('john_doe')
    })

    it('应该支持静态方法创建', () => {
      const username = Username.fromString('john_doe')
      expect(username.getValue()).toBe('john_doe')
    })

    it('应该支持静态验证方法', () => {
      expect(Username.isValid('john_doe')).toBe(true)
      expect(Username.isValid('')).toBe(false)
      expect(Username.isValid('123user')).toBe(false)
      expect(Username.isValid('user__name')).toBe(false)
    })
  })

  describe('边界条件', () => {
    it('应该接受最小长度的用户名', () => {
      expect(() => new Username('abc')).not.toThrow()
    })

    it('应该接受最大长度的用户名', () => {
      const maxLengthUsername = 'a'.repeat(50)
      expect(() => new Username(maxLengthUsername)).not.toThrow()
    })

    it('应该处理大小写混合的用户名', () => {
      const username = new Username('JohnDoe')
      expect(username.getValue()).toBe('johndoe')
    })

    it('应该处理包含多个下划线和连字符的用户名', () => {
      expect(() => new Username('user_name_test')).not.toThrow()
      expect(() => new Username('user-name-test')).not.toThrow()
    })
  })

  describe('规范化功能', () => {
    it('应该移除前后空格', () => {
      const username = new Username('  john_doe  ')
      expect(username.getValue()).toBe('john_doe')
    })

    it('应该转换为小写', () => {
      const username = new Username('JohnDoe')
      expect(username.getValue()).toBe('johndoe')
    })

    it('应该保持有效字符', () => {
      const username = new Username('John_Doe-123')
      expect(username.getValue()).toBe('john_doe-123')
    })
  })
})
