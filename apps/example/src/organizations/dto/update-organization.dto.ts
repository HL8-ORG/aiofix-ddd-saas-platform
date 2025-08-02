import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizationDto } from './create-organization.dto';

/**
 * @class UpdateOrganizationDto
 * @extends PartialType(CreateOrganizationDto)
 * @description
 * 更新组织（Organization）数据传输对象（DTO），用于接收和校验前端提交的组织更新请求数据。
 *
 * 代码原理与机制说明：
 * 1. 该DTO继承自PartialType(CreateOrganizationDto)，自动将CreateOrganizationDto中的所有字段变为可选（Partial），
 *    以适配“部分更新”场景，符合RESTful PATCH语义。
 * 2. PartialType是NestJS提供的辅助类型工具，能够动态生成所有属性为可选的DTO类型，避免重复定义字段和校验规则，
 *    提升代码复用性与维护性。
 * 3. 通过继承PartialType后的DTO，后端可自动校验仅提交的字段，未提交的字段不会被强制校验，
 *    保证更新接口的灵活性与健壮性。
 */
export class UpdateOrganizationDto extends PartialType(CreateOrganizationDto) {}
