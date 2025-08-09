import { Password } from '../password.vo';
import {
  InvalidPasswordException,
  PasswordRequiredException,
  PasswordTooWeakException,
  PasswordHashingException,
} from '../../exceptions/password.exception';

describe('Password Value Object', () => {
  describe('创建Password值对象', () => {
    it('应该成功创建有效的Password值对象', () => {
      const validPassword = 'ValidP@ssw0rd';
      const password = Password.create(validPassword);
      expect(password).toBeDefined();
      expect(password.getHash()).toBeDefined();
      expect(password.getHash()).not.toBe(validPassword); // 确保已经被哈希
    });

    it('当密码为空时应该抛出PasswordRequiredException', () => {
      expect(() => Password.create('')).toThrow(PasswordRequiredException);
    });

    it('当密码长度不足时应该抛出InvalidPasswordException', () => {
      expect(() => Password.create('Short1!')).toThrow(InvalidPasswordException);
    });

    it('当密码超过最大长度时应该抛出InvalidPasswordException', () => {
      const longPassword = 'A1!a'.repeat(30); // 120个字符
      expect(() => Password.create(longPassword)).toThrow(InvalidPasswordException);
    });

    it('当密码不包含必要的字符类型时应该抛出PasswordTooWeakException', () => {
      // 缺少大写字母
      expect(() => Password.create('password123!')).toThrow(PasswordTooWeakException);
      // 缺少小写字母
      expect(() => Password.create('PASSWORD123!')).toThrow(PasswordTooWeakException);
      // 缺少数字
      expect(() => Password.create('Password!@#')).toThrow(PasswordTooWeakException);
      // 缺少特殊字符
      expect(() => Password.create('Password123')).toThrow(PasswordTooWeakException);
    });

    it('当使用常见密码时应该抛出PasswordTooWeakException', () => {
      expect(() => Password.create('Password123!')).toThrow(PasswordTooWeakException);
    });
  });

  describe('密码验证', () => {
    it('应该正确验证匹配的密码', () => {
      const plainPassword = 'ValidP@ssw0rd';
      const password = Password.create(plainPassword);
      expect(password.verify(plainPassword)).toBe(true);
    });

    it('应该正确识别不匹配的密码', () => {
      const password = Password.create('ValidP@ssw0rd');
      expect(password.verify('WrongP@ssw0rd')).toBe(false);
    });
  });

  describe('从哈希创建', () => {
    it('应该能从有效的哈希值创建Password对象', () => {
      const plainPassword = 'ValidP@ssw0rd';
      const originalPassword = Password.create(plainPassword);
      const hash = originalPassword.getHash();

      const passwordFromHash = Password.createFromHash(hash);
      expect(passwordFromHash.getHash()).toBe(hash);
      expect(passwordFromHash.verify(plainPassword)).toBe(true);
    });
  });

  describe('相等性比较', () => {
    it('相同的密码哈希应该相等', () => {
      const hash = Password.create('ValidP@ssw0rd').getHash();
      const password1 = Password.createFromHash(hash);
      const password2 = Password.createFromHash(hash);
      expect(password1.equals(password2)).toBe(true);
    });

    it('不同的密码哈希不应该相等', () => {
      const password1 = Password.create('ValidP@ssw0rd1');
      const password2 = Password.create('ValidP@ssw0rd2');
      expect(password1.equals(password2)).toBe(false);
    });
  });
});
