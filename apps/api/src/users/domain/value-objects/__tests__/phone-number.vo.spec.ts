import { PhoneNumber } from '../phone-number.vo';
import {
  InvalidPhoneNumberException,
  PhoneNumberRequiredException,
  UnsupportedCountryCodeException,
  PhoneNumberParsingException,
} from '../../exceptions/phone-number.exception';

describe('PhoneNumber Value Object', () => {
  describe('创建PhoneNumber值对象', () => {
    it('应该成功创建有效的中国手机号', () => {
      const phoneNumbers = [
        '+8613812345678',
        '13812345678',
        '86-138-1234-5678',
      ];

      phoneNumbers.forEach(phone => {
        const phoneNumber = new PhoneNumber(phone, 'CN');
        expect(phoneNumber.getValue()).toBe('+8613812345678');
        expect(phoneNumber.getCountryCode()).toBe('CN');
      });
    });

    it('应该成功创建有效的美国手机号', () => {
      const phoneNumbers = [
        '+16025551234',
        '602-555-1234',
        '(602) 555-1234',
      ];

      phoneNumbers.forEach(phone => {
        const phoneNumber = new PhoneNumber(phone, 'US');
        expect(phoneNumber.getValue()).toBe('+16025551234');
        expect(phoneNumber.getCountryCode()).toBe('US');
      });
    });

    it('当手机号为空时应该抛出PhoneNumberRequiredException', () => {
      expect(() => new PhoneNumber('')).toThrow(PhoneNumberRequiredException);
    });

    it('当手机号格式无效时应该抛出InvalidPhoneNumberException或PhoneNumberParsingException', () => {
      const invalidPhones = [
        '123',
        'abc',
        '123-abc-4567',
        '+86123',
      ];

      invalidPhones.forEach(phone => {
        expect(() => new PhoneNumber(phone, 'CN')).toThrow();
      });
    });
  });

  describe('手机号格式化', () => {
    it('应该正确获取国际格式', () => {
      const phoneNumber = new PhoneNumber('+8613812345678');
      expect(phoneNumber.getInternationalFormat()).toBe('+86 138 1234 5678');
    });

    it('应该正确获取国内格式', () => {
      const phoneNumber = new PhoneNumber('+8613812345678');
      expect(phoneNumber.getNationalFormat()).toBe('138 1234 5678');
    });

    it('应该正确获取显示格式', () => {
      const phoneNumber = new PhoneNumber('+8613812345678');
      expect(phoneNumber.toDisplayFormat('international')).toBe('+86 138 1234 5678');
      expect(phoneNumber.toDisplayFormat('national')).toBe('138 1234 5678');
    });
  });

  describe('手机号验证', () => {
    it('应该正确验证有效的手机号', () => {
      expect(PhoneNumber.isValid('+8613812345678')).toBe(true);
      expect(PhoneNumber.isValid('13812345678', 'CN')).toBe(true);
      expect(PhoneNumber.isValid('+16025551234')).toBe(true);
    });

    it('应该正确识别无效的手机号', () => {
      expect(PhoneNumber.isValid('123')).toBe(false);
      expect(PhoneNumber.isValid('abc')).toBe(false);
      expect(PhoneNumber.isValid('')).toBe(false);
    });
  });

  describe('相等性比较', () => {
    it('相同的手机号应该相等', () => {
      const phone1 = new PhoneNumber('+8613812345678');
      const phone2 = new PhoneNumber('13812345678', 'CN');
      expect(phone1.equals(phone2)).toBe(true);
    });

    it('不同的手机号不应该相等', () => {
      const phone1 = new PhoneNumber('+8613812345678');
      const phone2 = new PhoneNumber('+8613812345679');
      expect(phone1.equals(phone2)).toBe(false);
    });

    it('不同格式的相同手机号应该相等', () => {
      const phone1 = new PhoneNumber('+8613812345678');
      const phone2 = new PhoneNumber('13812345678', 'CN');
      expect(phone1.equals(phone2)).toBe(true);
    });
  });

  describe('字符串转换', () => {
    it('toString方法应该返回E.164格式', () => {
      const phoneNumber = new PhoneNumber('13812345678', 'CN');
      expect(phoneNumber.toString()).toBe('+8613812345678');
    });
  });

  describe('国家代码处理', () => {
    it('应该正确处理不同国家的手机号', () => {
      // 中国手机号
      const cnPhone = new PhoneNumber('+8613812345678');
      expect(cnPhone.getCountryCode()).toBe('CN');

      // 美国手机号
      const usPhone = new PhoneNumber('+16025551234');
      expect(usPhone.getCountryCode()).toBe('US');

      // 日本手机号
      const jpPhone = new PhoneNumber('+819012345678');
      expect(jpPhone.getCountryCode()).toBe('JP');
    });
  });
});
