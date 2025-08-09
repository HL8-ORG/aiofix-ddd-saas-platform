import { UserName } from '../username.vo';
import {
  InvalidUsernameException,
  UsernameRequiredException,
  UsernameTooShortException,
  UsernameTooLongException,
  UsernameContainsInvalidCharactersException,
  UsernameReservedException,
} from '../../exceptions/username.exception';

describe('UserName Value Object', () => {
  describe('创建UserName值对象', () => {
    it('应该成功创建有效的UserName值对象', () => {
      const validUsernames = [
        'john123',
        'jane.doe',
        'user-name',
        'user_name',
        'john.doe123',
      ];

      validUsernames.forEach(username => {
        const userNameVO = new UserName(username);
        expect(userNameVO.getValue()).toBe(username.toLowerCase());
      });
    });

    it('应该将用户名转换为小写', () => {
      const username = 'JohnDoe';
      const userNameVO = new UserName(username);
      expect(userNameVO.getValue()).toBe('johndoe');
    });

    it('当用户名为空时应该抛出UsernameRequiredException', () => {
      expect(() => new UserName('')).toThrow(UsernameRequiredException);
    });

    it('当用户名长度小于最小长度时应该抛出UsernameTooShortException', () => {
      expect(() => new UserName('ab')).toThrow(UsernameTooShortException);
    });

    it('当用户名长度超过最大长度时应该抛出UsernameTooLongException', () => {
      const longUsername = 'a'.repeat(51);
      expect(() => new UserName(longUsername)).toThrow(UsernameTooLongException);
    });
  });

  describe('用户名字符验证', () => {
    it('应该允许使用字母、数字、点号、连字符和下划线', () => {
      const validUsernames = [
        'john123',
        'jane.doe',
        'user-name',
        'user_name',
        'a1b2c3',
      ];

      validUsernames.forEach(username => {
        expect(() => new UserName(username)).not.toThrow();
      });
    });

    it('当用户名包含非法字符时应该抛出UsernameContainsInvalidCharactersException', () => {
      const invalidUsernames = [
        'user name', // 空格
        'user@name', // @符号
        'user#name', // #符号
        'user$name', // $符号
        'user名字',   // 非ASCII字符
      ];

      invalidUsernames.forEach(username => {
        expect(() => new UserName(username)).toThrow(UsernameContainsInvalidCharactersException);
      });
    });

    it('当用户名包含连续的特殊字符时应该抛出UsernameContainsInvalidCharactersException', () => {
      const invalidUsernames = [
        'user..name',
        'user--name',
        'user__name',
        'user.-name',
        'user_.name',
      ];

      invalidUsernames.forEach(username => {
        expect(() => new UserName(username)).toThrow(UsernameContainsInvalidCharactersException);
      });
    });

    it('当用户名以特殊字符开头或结尾时应该抛出UsernameContainsInvalidCharactersException', () => {
      const invalidUsernames = [
        '.username',
        'username.',
        '-username',
        'username-',
        '_username',
        'username_',
      ];

      invalidUsernames.forEach(username => {
        expect(() => new UserName(username)).toThrow(UsernameContainsInvalidCharactersException);
      });
    });
  });

  describe('保留用户名验证', () => {
    it('当使用保留用户名时应该抛出UsernameReservedException', () => {
      const reservedUsernames = [
        'admin',
        'administrator',
        'system',
        'root',
        'superuser',
      ];

      reservedUsernames.forEach(username => {
        expect(() => new UserName(username)).toThrow(UsernameReservedException);
      });
    });

    it('保留用户名验证应该忽略大小写', () => {
      const reservedUsernames = [
        'Admin',
        'ADMINISTRATOR',
        'System',
        'ROOT',
        'SuperUser',
      ];

      reservedUsernames.forEach(username => {
        expect(() => new UserName(username)).toThrow(UsernameReservedException);
      });
    });
  });

  describe('相等性比较', () => {
    it('相同的用户名应该相等', () => {
      const username1 = new UserName('johndoe');
      const username2 = new UserName('johndoe');
      expect(username1.equals(username2)).toBe(true);
    });

    it('不同的用户名不应该相等', () => {
      const username1 = new UserName('johndoe');
      const username2 = new UserName('janedoe');
      expect(username1.equals(username2)).toBe(false);
    });

    it('大小写不同的相同用户名应该相等', () => {
      const username1 = new UserName('JohnDoe');
      const username2 = new UserName('johndoe');
      expect(username1.equals(username2)).toBe(true);
    });
  });

  describe('字符串转换', () => {
    it('toString方法应该返回正确的字符串表示', () => {
      const usernameStr = 'johndoe';
      const username = new UserName(usernameStr);
      expect(username.toString()).toBe(usernameStr);
    });
  });
});
