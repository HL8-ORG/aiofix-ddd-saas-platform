/**
 * @class TenantValidator
 * @description
 * 租户相关的验证器类，使用class-validator进行验证。该验证器实现了
 * 复杂的业务规则验证，确保数据的完整性和一致性。
 * 
 * 主要原理与机制：
 * 1. 使用class-validator：利用成熟的验证库进行数据验证
 * 2. 业务规则验证：验证租户相关的业务规则和约束
 * 3. 数据完整性：确保数据的完整性和一致性
 * 4. 权限验证：验证用户是否有权限执行特定操作
 * 5. 状态转换：验证租户状态转换的合法性
 * 6. 依赖注入：通过依赖注入获取必要的服务
 */
import { Injectable } from '@nestjs/common'
import { validate, ValidationError } from 'class-validator'
import { plainToClass } from 'class-transformer'
import { TenantStatus } from '../../domain/entities/tenant.entity'
import type { Tenant } from '../../domain/entities/tenant.entity'
import { CreateTenantCommandDto } from '../commands/create-tenant.command'
import { ActivateTenantCommandDto } from '../commands/activate-tenant.command'

/**
 * @interface ValidationResult
 * @description 验证结果接口
 */
export interface ValidationResult {
  /**
   * @property isValid
   * @description 验证是否通过
   */
  isValid: boolean

  /**
   * @property errors
   * @description 错误信息列表
   */
  errors: string[]

  /**
   * @property warnings
   * @description 警告信息列表
   */
  warnings: string[]
}

/**
 * @class TenantValidator
 * @description 租户验证器
 */
@Injectable()
export class TenantValidator {
  /**
   * @method validateCreateTenant
   * @description 验证创建租户的数据
   * @param data 创建租户的数据
   * @returns Promise<ValidationResult> 验证结果
   */
  async validateCreateTenant(data: {
    name: string
    code: string
    adminUserInfo: {
      username: string
      email: string
      password: string
      firstName: string
      lastName: string
    }
    description?: string
    settings?: Record<string, unknown>
    metadata?: Record<string, unknown>
  }): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    try {
      // 使用class-validator进行验证
      const dto = plainToClass(CreateTenantCommandDto, data)
      const validationErrors = await validate(dto)

      if (validationErrors.length > 0) {
        errors.push(...this.formatValidationErrors(validationErrors))
      }

      // 业务规则验证
      const businessValidation = this.validateCreateTenantBusinessRules(data)
      errors.push(...businessValidation.errors)
      warnings.push(...businessValidation.warnings)

    } catch (error) {
      errors.push(`验证过程中发生错误: ${(error as Error).message}`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * @method validateActivateTenant
   * @description 验证激活租户的数据
   * @param data 激活租户的数据
   * @returns Promise<ValidationResult> 验证结果
   */
  async validateActivateTenant(data: {
    tenantId: string
    reason?: string
    activatedBy: string
  }): Promise<ValidationResult> {
    const errors: string[] = []
    const warnings: string[] = []

    // 基本验证
    if (!data.tenantId || data.tenantId.trim().length === 0) {
      errors.push('租户ID不能为空')
    }

    if (!data.activatedBy || data.activatedBy.trim().length === 0) {
      errors.push('激活操作者ID不能为空')
    }

    if (data.reason && data.reason.length > 500) {
      errors.push('激活原因长度不能超过500个字符')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * @method validateActivateTenantBusinessRules
   * @description 验证激活租户的业务规则
   * @param tenant 租户实体
   * @param activatedBy 激活操作者ID
   * @returns ValidationResult 验证结果
   */
  validateActivateTenantBusinessRules(tenant: Tenant, activatedBy: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 验证租户是否存在
    if (!tenant) {
      errors.push('租户不存在')
      return { isValid: false, errors, warnings }
    }

    // 验证租户状态
    if (tenant.status !== TenantStatus.PENDING) {
      errors.push(`租户状态为 ${tenant.status}，无法激活。只有待激活状态的租户才能被激活`)
    }

    // 验证操作者权限
    if (!activatedBy || activatedBy.trim().length === 0) {
      errors.push('激活操作者ID不能为空')
    }

    // 检查租户是否已被删除
    if (tenant.isDeleted()) {
      errors.push('无法激活已删除的租户')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * @method validateSuspendTenantBusinessRules
   * @description 验证禁用租户的业务规则
   * @param tenant 租户实体
   * @param suspendedBy 禁用操作者ID
   * @returns ValidationResult 验证结果
   */
  validateSuspendTenantBusinessRules(tenant: Tenant, suspendedBy: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 验证租户是否存在
    if (!tenant) {
      errors.push('租户不存在')
      return { isValid: false, errors, warnings }
    }

    // 验证租户状态
    if (tenant.status !== TenantStatus.ACTIVE) {
      errors.push(`租户状态为 ${tenant.status}，无法禁用。只有激活状态的租户才能被禁用`)
    }

    // 验证操作者权限
    if (!suspendedBy || suspendedBy.trim().length === 0) {
      errors.push('禁用操作者ID不能为空')
    }

    // 检查租户是否已被删除
    if (tenant.isDeleted()) {
      errors.push('无法禁用已删除的租户')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * @method validateDeleteTenantBusinessRules
   * @description 验证删除租户的业务规则
   * @param tenant 租户实体
   * @param deletedBy 删除操作者ID
   * @returns ValidationResult 验证结果
   */
  validateDeleteTenantBusinessRules(tenant: Tenant, deletedBy: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 验证租户是否存在
    if (!tenant) {
      errors.push('租户不存在')
      return { isValid: false, errors, warnings }
    }

    // 验证操作者权限
    if (!deletedBy || deletedBy.trim().length === 0) {
      errors.push('删除操作者ID不能为空')
    }

    // 检查租户是否已被删除
    if (tenant.isDeleted()) {
      errors.push('租户已被删除')
    }

    // 检查租户状态
    if (tenant.status === TenantStatus.DELETED) {
      errors.push('租户已被删除')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * @method validateRestoreTenantBusinessRules
   * @description 验证恢复租户的业务规则
   * @param tenant 租户实体
   * @param restoredBy 恢复操作者ID
   * @returns ValidationResult 验证结果
   */
  validateRestoreTenantBusinessRules(tenant: Tenant, restoredBy: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 验证租户是否存在
    if (!tenant) {
      errors.push('租户不存在')
      return { isValid: false, errors, warnings }
    }

    // 验证操作者权限
    if (!restoredBy || restoredBy.trim().length === 0) {
      errors.push('恢复操作者ID不能为空')
    }

    // 检查租户是否已被删除
    if (!tenant.isDeleted()) {
      errors.push('租户未被删除，无需恢复')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * @method validateTenantAccess
   * @description 验证租户访问权限
   * @param tenant 租户实体
   * @param userId 用户ID
   * @returns ValidationResult 验证结果
   */
  validateTenantAccess(tenant: Tenant, userId: string): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 验证租户是否存在
    if (!tenant) {
      errors.push('租户不存在')
      return { isValid: false, errors, warnings }
    }

    // 验证用户ID
    if (!userId || userId.trim().length === 0) {
      errors.push('用户ID不能为空')
    }

    // 检查租户状态
    if (tenant.status !== TenantStatus.ACTIVE) {
      errors.push(`租户状态为 ${tenant.status}，无法访问`)
    }

    // 检查租户是否已被删除
    if (tenant.isDeleted()) {
      errors.push('租户已被删除，无法访问')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * @method validateTenantCodeUniqueness
   * @description 验证租户编码唯一性
   * @param code 租户编码
   * @param existingTenants 现有租户列表
   * @returns ValidationResult 验证结果
   */
  validateTenantCodeUniqueness(
    code: string,
    existingTenants: Tenant[],
  ): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 检查编码是否已存在
    const existingTenant = existingTenants.find(
      (tenant) => tenant.code.getValue().toLowerCase() === code.toLowerCase(),
    )

    if (existingTenant) {
      errors.push(`租户编码 ${code} 已存在`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * @method validateTenantNameUniqueness
   * @description 验证租户名称唯一性
   * @param name 租户名称
   * @param existingTenants 现有租户列表
   * @returns ValidationResult 验证结果
   */
  validateTenantNameUniqueness(
    name: string,
    existingTenants: Tenant[],
  ): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 检查名称是否已存在
    const existingTenant = existingTenants.find(
      (tenant) => tenant.name.getValue().toLowerCase() === name.toLowerCase(),
    )

    if (existingTenant) {
      errors.push(`租户名称 ${name} 已存在`)
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * @method validateCreateTenantBusinessRules
   * @description 验证创建租户的业务规则
   * @param data 创建租户的数据
   * @returns ValidationResult 验证结果
   * @private
   */
  private validateCreateTenantBusinessRules(data: {
    name: string
    code: string
    adminUserInfo: {
      username: string
      email: string
      password: string
    }
  }): ValidationResult {
    const errors: string[] = []
    const warnings: string[] = []

    // 业务规则验证
    if (data.name.length < 2) {
      errors.push('租户名称长度不能少于2个字符')
    }

    if (data.name.length > 100) {
      errors.push('租户名称长度不能超过100个字符')
    }

    if (data.code.length < 3) {
      errors.push('租户编码长度不能少于3个字符')
    }

    if (data.code.length > 20) {
      errors.push('租户编码长度不能超过20个字符')
    }

    // 编码格式验证
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(data.code)) {
      errors.push('租户编码必须以字母开头，只能包含字母、数字和下划线')
    }

    // 邮箱格式验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.adminUserInfo.email)) {
      errors.push('管理员邮箱格式不正确')
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    }
  }

  /**
   * @method formatValidationErrors
   * @description 格式化验证错误信息
   * @param errors 验证错误数组
   * @returns string[] 格式化后的错误信息
   * @private
   */
  private formatValidationErrors(errors: ValidationError[]): string[] {
    const formattedErrors: string[] = []

    const extractErrors = (validationErrors: ValidationError[]): void => {
      for (const error of validationErrors) {
        if (error.constraints) {
          formattedErrors.push(...Object.values(error.constraints))
        }
        if (error.children && error.children.length > 0) {
          extractErrors(error.children)
        }
      }
    }

    extractErrors(errors)
    return formattedErrors
  }
}
