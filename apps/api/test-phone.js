// 简单的Phone验证测试
const Phone = require('./src/modules/iam/users/domain/value-objects/phone.value-object.js').Phone;

console.log('Testing Phone validation...');

// 测试无效的中国手机号
const testPhone = '12345678901';
console.log(`Testing: ${testPhone}`);

try {
  const phone = new Phone(testPhone);
  console.log('VALID - but should be INVALID!');
  console.log('Prefix:', testPhone.substring(0, 3));
  console.log('Available prefixes:', Phone.CHINESE_MOBILE_PREFIXES);
} catch (error) {
  console.log('INVALID (correct):', error.message);
}

// 测试有效的中国手机号
const validPhone = '13812345678';
console.log(`\nTesting: ${validPhone}`);

try {
  const phone = new Phone(validPhone);
  console.log('VALID (correct):', phone.toString());
} catch (error) {
  console.log('INVALID (wrong):', error.message);
} 