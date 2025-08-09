import { Global, Module } from '@nestjs/common';
import { CaslAbilityFactory } from 'src/common/factories/casl-ability.factory';

/**
 * @module CaslModule
 * @description
 * 全局CASL权限模块，负责在NestJS应用中集成CASL能力工厂，实现基于能力的访问控制（Ability-based Access Control）。
 *
 * 代码原理与机制说明：
 * 1. 通过@Global()装饰器声明为全局模块，确保CaslAbilityFactory在整个应用范围内单例可用，无需在每个模块单独导入。
 * 2. @Module装饰器中，providers注册了CaslAbilityFactory，负责根据当前用户及其角色动态生成CASL能力对象（Ability）。
 * 3. exports导出CaslAbilityFactory，允许其他模块通过依赖注入方式获取并使用CASL能力工厂，实现细粒度的权限校验。
 * 4. 该模块通常配合守卫、装饰器等机制，灵活实现资源级、操作级的权限控制，提升系统安全性与可维护性。
 */
@Global()
@Module({
  providers: [CaslAbilityFactory],
  exports: [CaslAbilityFactory],
})
export class CaslModule {}
