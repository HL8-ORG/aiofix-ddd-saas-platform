import { Email } from '../email.vo';
import { InvalidEmailException, EmailRequiredException } from '../../exceptions/email.exception';

describe('Email Value Object', () => {
  describe('创建Email值对象', () => {
    it('应该成功创建有效的Email值对象', () => {
      const emailAddress = 'test@example.com';
      const email = new Email(emailAddress);
      expect(email.getValue()).toBe(emailAddress);
    });

    it('应该将邮箱地址转换为小写', () => {
      const emailAddress = 'Test@Example.com';
      const email = new Email(emailAddress);
      expect(email.getValue()).toBe('test@example.com');
    });

    it('当邮箱地址为空时应该抛出EmailRequiredException', () => {
      expect(() => new Email('')).toThrow(EmailRequiredException);
    });

    it('当邮箱地址格式无效时应该抛出InvalidEmailException', () => {
      const invalidEmails = [
        'test',
        'test@',
        '@example.com',
        'test@example',
        'test@.com',
        'test@example.',
        'test@exam ple.com',
      ];

      invalidEmails.forEach(invalidEmail => {
        expect(() => new Email(invalidEmail)).toThrow(InvalidEmailException);
      });
    });
  });

  describe('Email格式验证', () => {
    it('应该正确验证有效的邮箱格式', () => {
      const validEmails = [
        'test@example.com',
        'test.name@example.com',
        'test+name@example.com',
        'test@subdomain.example.com',
        'test@example-domain.com',
        '123@example.com',
        'test@123.com',
      ];

      validEmails.forEach(validEmail => {
        expect(Email.isValid(validEmail)).toBe(true);
      });
    });

    it('应该正确识别无效的邮箱格式', () => {
      const invalidEmails = [
        '',
        '@',
        'test@',
        '@example.com',
        'test@example',
        'test@.com',
        'test@example.',
        'test@exam ple.com',
      ];

      invalidEmails.forEach(invalidEmail => {
        expect(Email.isValid(invalidEmail)).toBe(false);
      });
    });
  });

  describe('相等性比较', () => {
    it('相同的邮箱地址应该相等', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('test@example.com');
      expect(email1.equals(email2)).toBe(true);
    });

    it('不同的邮箱地址不应该相等', () => {
      const email1 = new Email('test1@example.com');
      const email2 = new Email('test2@example.com');
      expect(email1.equals(email2)).toBe(false);
    });

    it('大小写不同的相同邮箱地址应该相等', () => {
      const email1 = new Email('test@example.com');
      const email2 = new Email('TEST@EXAMPLE.COM');
      expect(email1.equals(email2)).toBe(true);
    });
  });

  describe('字符串转换', () => {
    it('toString方法应该返回正确的字符串表示', () => {
      const emailAddress = 'test@example.com';
      const email = new Email(emailAddress);
      expect(email.toString()).toBe(emailAddress);
    });
  });
});
