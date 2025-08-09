import { Factory } from '@mikro-orm/seeder';
import { faker } from '@faker-js/faker';
import { User } from '../../entities/user.entity';
import * as bcrypt from 'bcrypt';
import { SALT_ROUNDS } from 'src/common/constants';

/**
 * @class UserFactory
 * @extends Factory<User>
 * @description
 * UserFactory用于批量生成User实体的模拟数据，主要用于数据库的种子填充与测试。
 *
 * 主要原理与机制如下：
 * 1. 继承自@mikro-orm/seeder的Factory基类，指定泛型为User，自动获得工厂方法能力。
 * 2. 通过重写definition方法，定义每个User实例的默认属性生成逻辑。
 * 3. username字段使用faker库的person.lastName()方法生成随机姓氏，保证数据多样性。
 * 4. email字段使用faker.internet.email()生成随机邮箱，模拟真实用户邮箱格式。
 * 5. password字段使用bcrypt.hashSync对固定字符串'password'进行同步加密，SALT_ROUNDS为加盐轮数，确保密码安全性。
 * 6. 该工厂可被Seeder自动调用，实现批量插入模拟用户数据，便于开发和测试环境初始化。
 */
export class UserFactory extends Factory<User> {
  /**
   * @property model
   * @description 指定当前工厂对应的实体模型为User
   */
  model = User;

  /**
   * @method definition
   * @description
   * 定义User实体的默认属性生成规则。每次调用会返回一组新的、随机的用户数据。
   *
   * @returns {Partial<User>} 随机生成的User属性对象
   */
  definition(): Partial<User> {
    return {
      username: faker.person.lastName(), // 随机生成用户名
      email: faker.internet.email(), // 随机生成邮箱
      password: bcrypt.hashSync('password', SALT_ROUNDS), // 加密后的默认密码
    };
  }
}
