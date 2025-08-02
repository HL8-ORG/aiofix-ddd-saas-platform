import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';

/**
 * @class UpdateUserDto
 * @description
 * 用户更新数据传输对象（DTO），用于接收和校验前端提交的用户更新数据。
 *
 * 代码原理与机制说明：
 * 1. 该类继承自`PartialType(CreateUserDto)`，自动将`CreateUserDto`中的所有字段变为可选（Partial），
 *    以适应用户更新场景下的“部分字段更新”需求，避免强制要求所有字段都必须传递。
 * 2. `PartialType`是NestJS提供的辅助类型工具，能够基于已有DTO快速生成所有属性可选的新DTO类型，
 *    保证类型一致性和校验逻辑的复用，提升开发效率。
 * 3. 该DTO常用于PATCH/PUT等更新接口，配合class-validator装饰器，实现灵活且安全的数据校验。
 */
export class UpdateUserDto extends PartialType(CreateUserDto) {}
