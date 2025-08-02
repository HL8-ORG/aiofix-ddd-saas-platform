import {
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  Validate,
} from 'class-validator';
import { IsUnique } from 'src/common/validators/is-unique.validator';

/**
 * @class CreateOrganizationDto
 * @description
 * 创建组织（Organization）数据传输对象（DTO），用于接收和校验前端提交的新建组织请求数据。
 *
 * 代码原理与机制说明：
 * 1. 该DTO通过class-validator装饰器实现字段级别的数据校验，确保数据完整性与安全性。
 * 2. name字段：
 *    - @IsNotEmpty()：保证组织名称不能为空。
 *    - @IsString()：保证类型为字符串，防止类型注入攻击。
 *    - @MinLength(2)：限制组织名称最小长度为2，提升数据规范性。
 *    - @Validate(IsUnique, ['Organization', 'name'])：自定义唯一性校验器，确保组织名称在数据库中唯一，防止重复创建。
 * 3. description字段：
 *    - @IsOptional()：该字段为可选，允许不填写描述。
 *    - @IsString()：如填写则必须为字符串类型。
 * 4. 通过DTO与装饰器的结合，后端可自动拦截并返回校验失败信息，提升接口健壮性与开发效率。
 */
export class CreateOrganizationDto {
  /**
   * @property name
   * @description
   * 组织名称，必填，需唯一且长度不少于2个字符。
   */
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @Validate(IsUnique, ['Organization', 'name'])
  name: string;

  /**
   * @property description
   * @description
   * 组织描述，可选，若填写则需为字符串类型。
   */
  @IsOptional()
  @IsString()
  description?: string;
}
