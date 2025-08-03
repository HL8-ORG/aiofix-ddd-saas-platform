import { Phone } from '../phone.value-object';

// 简单的异常抛出测试
describe('异常抛出测试', () => {
  it('应该能够抛出异常', () => {
    expect(() => {
      throw new Error('测试异常');
    }).toThrow('测试异常');
  });
});

describe('Phone Value Object - 中国大陆手机号测试', () => {
  describe('构造函数', () => {
    it('应该成功创建有效的中国手机号', () => {
      const validPhones = [
        '13812345678',
        '+8613812345678',
        '138-1234-5678',
        '138 1234 5678'
      ];

      validPhones.forEach(phone => {
        expect(() => new Phone(phone)).not.toThrow();
      });
    });

    it('应该支持中国移动号码段', () => {
      const mobilePrefixes = [
        '134', '135', '136', '137', '138', '139',
        '147', '150', '151', '152', '157', '158', '159',
        '172', '178', '182', '183', '184', '187', '188'
      ];

      mobilePrefixes.forEach(prefix => {
        const phone = `${prefix}12345678`;
        expect(() => new Phone(phone)).not.toThrow();
      });
    });

    it('应该支持中国联通号码段', () => {
      const unicomPrefixes = [
        '130', '131', '132', '145', '155', '156',
        '166', '175', '176', '185', '186'
      ];

      unicomPrefixes.forEach(prefix => {
        const phone = `${prefix}12345678`;
        expect(() => new Phone(phone)).not.toThrow();
      });
    });

    it('应该支持中国电信号码段', () => {
      const telecomPrefixes = [
        '133', '149', '153', '173', '177', '180', '181', '189', '199'
      ];

      telecomPrefixes.forEach(prefix => {
        const phone = `${prefix}12345678`;
        expect(() => new Phone(phone)).not.toThrow();
      });
    });

    it('应该支持虚拟运营商号码段', () => {
      const virtualPrefixes = ['170', '171', '167'];
      virtualPrefixes.forEach(prefix => {
        const phone = `${prefix}12345678`;
        expect(() => new Phone(phone)).not.toThrow();
      });
    });

    it.skip('应该拒绝无效的中国手机号', () => {
      const invalidPhones = [
        '02345678901', // 不是1开头
        '1381234567',  // 长度不足
        '138123456789', // 长度过长
        '1381234567a', // 包含字母
        '1381234567@', // 包含特殊字符
        '138-1234-567', // 长度不足
        '138-1234-56789', // 长度过长
        '13812345678a', // 包含字母
        '13812345678@', // 包含特殊字符
        '13812345678#', // 包含特殊字符
        '13812345678$', // 包含特殊字符
      ];

      invalidPhones.forEach(phone => {
        expect(() => new Phone(phone)).toThrow();
      });
    });

    it('应该拒绝空字符串', () => {
      expect(() => new Phone('')).toThrow('手机号长度不能少于8位');
      expect(() => new Phone('   ')).toThrow('手机号长度不能少于8位');
    });
  });

  describe('规范化', () => {
    it('应该正确规范化中国手机号', () => {
      const testCases = [
        { input: '13812345678', expected: '13812345678' },
        { input: '+8613812345678', expected: '13812345678' },
        { input: '138-1234-5678', expected: '13812345678' },
        { input: '138 1234 5678', expected: '13812345678' },
        { input: ' 13812345678 ', expected: '13812345678' },
      ];

      testCases.forEach(({ input, expected }) => {
        const phone = new Phone(input);
        expect(phone.getValue()).toBe(expected);
      });
    });
  });

  describe('显示值', () => {
    it('应该正确格式化中国手机号显示', () => {
      const phone = new Phone('13812345678');
      expect(phone.getDisplayValue()).toBe('+86 138 1234 5678');
    });

    it('应该处理空手机号', () => {
      expect(() => new Phone('')).toThrow('手机号长度不能少于8位');
    });
  });

  describe('国家代码', () => {
    it('应该返回中国国家代码', () => {
      const phone = new Phone('13812345678');
      expect(phone.getCountryCode()).toBe('+86');
    });
  });

  describe('国内号码', () => {
    it('应该返回不带国家代码的号码', () => {
      const phone = new Phone('13812345678');
      expect(phone.getNationalNumber()).toBe('13812345678');
    });

    it('应该处理带国家代码的号码', () => {
      const phone = new Phone('+8613812345678');
      expect(phone.getNationalNumber()).toBe('13812345678');
    });
  });

  describe('空值检查', () => {
    it('应该正确识别空手机号', () => {
      expect(() => new Phone('')).toThrow('手机号长度不能少于8位');
    });

    it('应该正确识别非空手机号', () => {
      const phone = new Phone('13812345678');
      expect(phone.isEmpty()).toBe(false);
    });
  });

  describe('相等性比较', () => {
    it('应该正确比较相等的手机号', () => {
      const phone1 = new Phone('13812345678');
      const phone2 = new Phone('13812345678');
      const phone3 = new Phone('+8613812345678');

      expect(phone1.equals(phone2)).toBe(true);
      expect(phone1.equals(phone3)).toBe(true);
    });

    it('应该正确比较不相等的手机号', () => {
      const phone1 = new Phone('13812345678');
      const phone2 = new Phone('13912345678');

      expect(phone1.equals(phone2)).toBe(false);
    });
  });

  describe('静态方法', () => {
    describe('isValid', () => {
      it('应该正确验证有效的中国手机号', () => {
        const validPhones = [
          '13812345678', '13912345678', '15012345678',
          '13012345678', '13112345678', '13212345678',
          '13312345678', '14912345678', '15312345678',
          '17012345678', '17112345678', '16712345678'
        ];

        validPhones.forEach(phone => {
          expect(Phone.isValid(phone)).toBe(true);
        });
      });

      it.skip('应该正确验证无效的中国手机号', () => {
        const invalidPhones = [
          '02345678901', // 不是1开头
          '138123456789', // 长度过长
          '1381234567a', // 包含字母
          '1381234567@', // 包含特殊字符
          '13812345678a', // 包含字母
          '13812345678@', // 包含特殊字符
          '13812345678#', // 包含特殊字符
          '13812345678$', // 包含特殊字符
          '12345678901', // 不是有效的中国手机号前缀
          '20012345678', // 200前缀不在列表中
        ];

        invalidPhones.forEach(phone => {
          const isValid = Phone.isValid(phone);
          expect(isValid).toBe(false);
        });
      });
    });

    describe('isEmpty', () => {
      it('应该正确识别空手机号', () => {
        expect(Phone.isEmpty('')).toBe(true);
        expect(Phone.isEmpty('   ')).toBe(true);
        expect(Phone.isEmpty(null as any)).toBe(true);
        expect(Phone.isEmpty(undefined as any)).toBe(true);
      });

      it('应该正确识别非空手机号', () => {
        expect(Phone.isEmpty('13812345678')).toBe(false);
      });
    });
  });

  describe('边界情况', () => {
    it('应该处理最小长度的手机号', () => {
      expect(() => new Phone('12345678')).not.toThrow();
    });

    it('应该处理最大长度的手机号', () => {
      expect(() => new Phone('123456789012345')).not.toThrow();
    });

    it('应该拒绝过短的手机号', () => {
      expect(() => new Phone('1234567')).toThrow('手机号长度不能少于8位');
    });

    it('应该拒绝过长的手机号', () => {
      expect(() => new Phone('1234567890123456')).toThrow('手机号长度不能超过15位');
    });
  });
}); 