import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';
import { Exclude } from 'class-transformer';
import { IsUnique } from 'src/common/validators/is-unique.validator';
import { User } from 'src/entities/user.entity';
import { Tenant } from 'src/entities/tenant.entity';
import { IsDomainUnique } from '../validators/is-domain-unique.validator';

/**
 * @class CreateUserDto
 * @description
 * 用户创建数据传输对象（DTO），用于接收和校验前端提交的新用户注册数据。
 *
 * 代码原理与机制说明：
 * 1. 该DTO类通过class-validator装饰器对各字段进行格式、必填、唯一性等多重校验，确保数据合法性和一致性。
 * 2. username/email字段使用自定义IsUnique校验器，结合User实体，保证用户名和邮箱在数据库中唯一，防止重复注册。
 * 3. password字段要求最小长度6位，提升账户安全性。
 * 4. domain字段使用自定义IsDomainUnique校验器，确保用户域名在系统内唯一，支持多租户场景下的隔离。
 * 5. 所有字段均结合IsNotEmpty、IsString等基础校验，防止空值和类型错误。
 * 6. DTO作为控制器与服务层之间的数据契约，提升类型安全和开发效率。
 */
export class CreateUserDto {
  /**
   * @property username
   * @description
   * 用户名，必须为字符串且唯一，不允许为空。
   *
   * 校验机制：
   * - IsNotEmpty: 禁止空值
   * - IsString: 必须为字符串
   * - Validate(IsUnique): 通过自定义唯一性校验器，确保数据库中无重复用户名
   */
  @IsNotEmpty()
  @IsString()
  @Validate(IsUnique, [User.name, 'username'])
  username: string;

  /**
   * @property email
   * @description
   * 用户邮箱，必须为合法邮箱格式且唯一，不允许为空。
   *
   * 校验机制：
   * - IsNotEmpty: 禁止空值
   * - IsEmail: 必须为邮箱格式
   * - Validate(IsUnique): 通过自定义唯一性校验器，确保邮箱唯一
   */
  @IsNotEmpty()
  @IsEmail()
  @Validate(IsUnique, [User.name, 'email'])
  email: string;

  /**
   * @property password
   * @description
   * 用户密码，必须为字符串且长度不少于6位，不允许为空。
   *
   * 校验机制：
   * - IsNotEmpty: 禁止空值
   * - IsString: 必须为字符串
   * - MinLength(6): 最小长度6位，提升安全性
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  /**
   * @property domain
   * @description
   * 用户所属域名，必须为字符串且唯一，不允许为空。用于多租户场景下的租户隔离。
   *
   * 校验机制：
   * - IsString: 必须为字符串
   * - MinLength(3): 最小长度3位
   * - IsNotEmpty: 禁止空值
   * - Validate(IsDomainUnique): 通过自定义校验器，确保域名唯一
   */
  @IsString()
  @MinLength(3)
  @IsNotEmpty()
  @Validate(IsDomainUnique)
  domain: string;
}
