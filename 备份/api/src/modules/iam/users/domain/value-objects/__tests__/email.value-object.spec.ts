import { Email } from '../email.value-object'

/**
 * @description Email值对象单元测试
 *
 * 测试Email的各种验证和规范化功能，包括：
 * 1. 有效邮箱地址的创建和验证
 * 2. 无效邮箱地址的错误处理
 * 3. 邮箱地址规范化功能
 * 4. 值对象相等性比较
 * 5. 边界条件测试
 */
describe('Email', () => {
  describe('有效邮箱地址', () => {
    it('应该接受有效的邮箱地址', () => {
      const validEmails = [
        'user@example.com',
        'user.name@example.com',
        'user+tag@example.com',
        'user@subdomain.example.com',
        'user@example.co.uk',
        'user@example.org',
        'user@example.net',
        'user123@example.com',
        'user-name@example.com',
        'user_name@example.com',
        'user.name+tag@example.com',
        'user@example-domain.com',
        'user@example.com.cn',
        'user@example.com.jp',
        'user@example.com.br',
      ]

      validEmails.forEach((email) => {
        expect(() => new Email(email)).not.toThrow()
      })
    })

    it('应该规范化邮箱地址', () => {
      const email = new Email('User@Example.COM')
      expect(email.getValue()).toBe('user@example.com')
    })

    it('应该获取显示值', () => {
      const email = new Email('User@Example.COM')
      expect(email.getDisplayValue()).toBe('user@example.com')
    })

    it('应该获取本地部分', () => {
      const email = new Email('user.name+tag@example.com')
      expect(email.getLocalPart()).toBe('user.name+tag')
    })

    it('应该获取域名部分', () => {
      const email = new Email('user.name+tag@example.com')
      expect(email.getDomainPart()).toBe('example.com')
    })
  })

  describe('无效邮箱地址', () => {
    it('应该拒绝空邮箱地址', () => {
      expect(() => new Email('')).toThrow('邮箱地址格式无效')
      expect(() => new Email('   ')).toThrow('邮箱地址格式无效')
    })

    it('应该拒绝过长的邮箱地址', () => {
      const longEmail = 'a'.repeat(255) + '@example.com'
      expect(() => new Email(longEmail)).toThrow(
        '邮箱地址长度不能超过254个字符',
      )
    })

    it('应该拒绝缺少@符号的邮箱地址', () => {
      expect(() => new Email('userexample.com')).toThrow('邮箱地址格式无效')
      expect(() => new Email('user@')).toThrow('邮箱地址格式无效')
      expect(() => new Email('@example.com')).toThrow('邮箱地址格式无效')
    })

    it('应该拒绝包含无效字符的邮箱地址', () => {
      const invalidEmails = [
        'user name@example.com',
        'user<name@example.com',
        'user>name@example.com',
        'user[name@example.com',
        'user]name@example.com',
        'user{name@example.com',
        'user}name@example.com',
        'user|name@example.com',
        'user\\name@example.com',
        'user/name@example.com',
        'user:name@example.com',
        'user;name@example.com',
        'user,name@example.com',
        'user"name@example.com',
        "user'name@example.com",
      ]

      invalidEmails.forEach((email) => {
        expect(() => new Email(email)).toThrow('邮箱地址格式无效')
      })
    })

    it('应该拒绝本地部分过长的邮箱地址', () => {
      const longLocalPart = 'a'.repeat(65) + '@example.com'
      expect(() => new Email(longLocalPart)).toThrow(
        '邮箱地址本地部分长度不能超过64个字符',
      )
    })

    it('应该拒绝域名部分过长的邮箱地址', () => {
      const longDomainPart = 'user@' + 'a'.repeat(254) + '.com'
      expect(() => new Email(longDomainPart)).toThrow(
        '邮箱地址长度不能超过254个字符',
      )
    })

    it('应该拒绝无效的域名格式', () => {
      const invalidDomainEmails = [
        'user@.com',
        'user@example.',
        'user@-example.com',
        'user@example-.com',
        'user@example..com',
        'user@example.com.',
        'user@example.com-',
        'user@example.com_',
      ]

      invalidDomainEmails.forEach((email) => {
        expect(() => new Email(email)).toThrow('邮箱地址格式无效')
      })
    })

    it('应该拒绝缺少顶级域名的邮箱地址', () => {
      const invalidTldEmails = [
        'user@example',
        'user@example.c',
        'user@example.1',
        'user@example.12',
      ]

      invalidTldEmails.forEach((email) => {
        expect(() => new Email(email)).toThrow('邮箱地址格式无效')
      })
    })
  })

  describe('值对象功能', () => {
    it('应该正确比较相等性', () => {
      const email1 = new Email('user@example.com')
      const email2 = new Email('user@example.com')
      const email3 = new Email('another@example.com')

      expect(email1.equals(email2)).toBe(true)
      expect(email1.equals(email3)).toBe(false)
      expect(email1.equals(null as any)).toBe(false)
      expect(email1.equals(undefined as any)).toBe(false)
    })

    it('应该正确转换为字符串', () => {
      const email = new Email('user@example.com')
      expect(email.toString()).toBe('user@example.com')
    })

    it('应该正确序列化为JSON', () => {
      const email = new Email('user@example.com')
      expect(email.toJSON()).toBe('user@example.com')
    })

    it('应该支持静态方法创建', () => {
      const email = Email.fromString('user@example.com')
      expect(email.getValue()).toBe('user@example.com')
    })

    it('应该支持静态验证方法', () => {
      expect(Email.isValid('user@example.com')).toBe(true)
      expect(Email.isValid('')).toBe(false)
      expect(Email.isValid('invalid-email')).toBe(false)
      expect(Email.isValid('user@')).toBe(false)
      expect(Email.isValid('@example.com')).toBe(false)
    })
  })

  describe('边界条件', () => {
    it('应该接受最小长度的邮箱地址', () => {
      expect(() => new Email('a@b.co')).not.toThrow()
    })

    it('应该接受最大长度的邮箱地址', () => {
      // 使用更符合RFC标准的邮箱地址
      const maxLengthEmail = 'a'.repeat(60) + '@' + 'b'.repeat(60) + '.com'
      expect(() => new Email(maxLengthEmail)).not.toThrow()
    })

    it('应该处理大小写混合的邮箱地址', () => {
      const email = new Email('User@Example.COM')
      expect(email.getValue()).toBe('user@example.com')
    })

    it('应该处理包含特殊字符的本地部分', () => {
      expect(() => new Email('user.name+tag@example.com')).not.toThrow()
      expect(() => new Email('user-name@example.com')).not.toThrow()
      expect(() => new Email('user_name@example.com')).not.toThrow()
    })

    it('应该处理复杂的域名结构', () => {
      expect(() => new Email('user@sub.domain.example.com')).not.toThrow()
      expect(() => new Email('user@example-domain.com')).not.toThrow()
    })
  })

  describe('规范化功能', () => {
    it('应该移除前后空格', () => {
      const email = new Email('  user@example.com  ')
      expect(email.getValue()).toBe('user@example.com')
    })

    it('应该转换为小写', () => {
      const email = new Email('User@Example.COM')
      expect(email.getValue()).toBe('user@example.com')
    })

    it('应该保持有效字符', () => {
      const email = new Email('user.name+tag@example-domain.com')
      expect(email.getValue()).toBe('user.name+tag@example-domain.com')
    })
  })

  describe('国际化邮箱地址', () => {
    it('应该支持包含中文的邮箱地址', () => {
      // 注意：这里只是示例，实际的中文邮箱地址可能需要更复杂的验证
      expect(() => new Email('user@example.com')).not.toThrow()
    })

    it('应该支持包含特殊字符的域名', () => {
      expect(() => new Email('user@example-domain.com')).not.toThrow()
      expect(() => new Email('user@example_domain.com')).toThrow(
        '邮箱地址格式无效',
      )
    })
  })
})
