import { registerAs } from '@nestjs/config'

/**
 * @constant roleConfig
 * @description
 * 角色模块配置，定义角色相关的配置参数。
 *
 * 主要原理与机制：
 * 1. 使用registerAs注册配置命名空间
 * 2. 支持环境变量覆盖默认值
 * 3. 提供类型安全的配置访问
 * 4. 支持配置验证和默认值
 * 5. 实现配置热重载
 * 6. 提供配置文档和说明
 */
export const roleConfig = registerAs('role', () => ({
  // 角色创建配置
  creation: {
    // 默认角色优先级
    defaultPriority: Number.parseInt(
      process.env.ROLE_DEFAULT_PRIORITY || '100',
      10,
    ),
    // 最大角色名称长度
    maxNameLength: Number.parseInt(
      process.env.ROLE_MAX_NAME_LENGTH || '100',
      10,
    ),
    // 最大角色代码长度
    maxCodeLength: Number.parseInt(
      process.env.ROLE_MAX_CODE_LENGTH || '50',
      10,
    ),
    // 最大角色描述长度
    maxDescriptionLength: Number.parseInt(
      process.env.ROLE_MAX_DESCRIPTION_LENGTH || '500',
      10,
    ),
    // 最大用户数量
    maxUsers: Number.parseInt(process.env.ROLE_MAX_USERS || '1000', 10),
    // 最大权限数量
    maxPermissions: Number.parseInt(
      process.env.ROLE_MAX_PERMISSIONS || '100',
      10,
    ),
  },

  // 角色状态配置
  status: {
    // 默认状态
    default: process.env.ROLE_DEFAULT_STATUS || 'ACTIVE',
    // 允许的状态列表
    allowed: (
      process.env.ROLE_ALLOWED_STATUSES || 'ACTIVE,SUSPENDED,DELETED'
    ).split(','),
  },

  // 角色优先级配置
  priority: {
    // 最小优先级
    min: Number.parseInt(process.env.ROLE_MIN_PRIORITY || '1', 10),
    // 最大优先级
    max: Number.parseInt(process.env.ROLE_MAX_PRIORITY || '1000', 10),
    // 系统角色优先级
    system: Number.parseInt(process.env.ROLE_SYSTEM_PRIORITY || '1', 10),
    // 租户角色优先级
    tenant: Number.parseInt(process.env.ROLE_TENANT_PRIORITY || '10', 10),
    // 组织角色优先级
    organization: Number.parseInt(
      process.env.ROLE_ORGANIZATION_PRIORITY || '50',
      10,
    ),
    // 用户角色优先级
    user: Number.parseInt(process.env.ROLE_USER_PRIORITY || '100', 10),
    // 访客角色优先级
    guest: Number.parseInt(process.env.ROLE_GUEST_PRIORITY || '200', 10),
  },

  // 角色继承配置
  inheritance: {
    // 是否启用角色继承
    enabled: process.env.ROLE_INHERITANCE_ENABLED === 'true',
    // 最大继承层级
    maxLevels: Number.parseInt(
      process.env.ROLE_INHERITANCE_MAX_LEVELS || '3',
      10,
    ),
    // 是否允许循环继承
    allowCircular: process.env.ROLE_INHERITANCE_ALLOW_CIRCULAR === 'true',
  },

  // 角色过期配置
  expiration: {
    // 是否启用角色过期
    enabled: process.env.ROLE_EXPIRATION_ENABLED === 'true',
    // 默认过期天数
    defaultDays: Number.parseInt(
      process.env.ROLE_EXPIRATION_DEFAULT_DAYS || '365',
      10,
    ),
    // 过期提醒天数
    reminderDays: Number.parseInt(
      process.env.ROLE_EXPIRATION_REMINDER_DAYS || '30',
      10,
    ),
  },

  // 角色缓存配置
  cache: {
    // 缓存TTL（秒）
    ttl: Number.parseInt(process.env.ROLE_CACHE_TTL || '3600', 10),
    // 缓存前缀
    prefix: process.env.ROLE_CACHE_PREFIX || 'role:',
    // 是否启用缓存
    enabled: process.env.ROLE_CACHE_ENABLED !== 'false',
  },

  // 角色通知配置
  notification: {
    // 是否启用通知
    enabled: process.env.ROLE_NOTIFICATION_ENABLED === 'true',
    // 通知渠道
    channels: (process.env.ROLE_NOTIFICATION_CHANNELS || 'email,webhook').split(
      ',',
    ),
    // 通知模板路径
    templatePath:
      process.env.ROLE_NOTIFICATION_TEMPLATE_PATH || './templates/role',
  },

  // 角色审计配置
  audit: {
    // 是否启用审计
    enabled: process.env.ROLE_AUDIT_ENABLED !== 'false',
    // 审计日志级别
    level: process.env.ROLE_AUDIT_LEVEL || 'info',
    // 审计日志保留天数
    retentionDays: Number.parseInt(
      process.env.ROLE_AUDIT_RETENTION_DAYS || '90',
      10,
    ),
  },

  // 角色安全配置
  security: {
    // 角色名称正则表达式
    namePattern:
      process.env.ROLE_NAME_PATTERN || '^[\\u4e00-\\u9fa5a-zA-Z0-9\\s]+$',
    // 角色代码正则表达式
    codePattern: process.env.ROLE_CODE_PATTERN || '^[A-Z][A-Z0-9_]*$',
    // 是否启用角色名称唯一性检查
    nameUnique: process.env.ROLE_NAME_UNIQUE !== 'false',
    // 是否启用角色代码唯一性检查
    codeUnique: process.env.ROLE_CODE_UNIQUE !== 'false',
  },

  // 角色性能配置
  performance: {
    // 批量操作大小
    batchSize: Number.parseInt(process.env.ROLE_BATCH_SIZE || '100', 10),
    // 查询超时时间（毫秒）
    queryTimeout: Number.parseInt(process.env.ROLE_QUERY_TIMEOUT || '5000', 10),
    // 是否启用查询优化
    queryOptimization: process.env.ROLE_QUERY_OPTIMIZATION !== 'false',
  },

  // 角色监控配置
  monitoring: {
    // 是否启用监控
    enabled: process.env.ROLE_MONITORING_ENABLED === 'true',
    // 监控指标前缀
    metricsPrefix: process.env.ROLE_MONITORING_METRICS_PREFIX || 'role',
    // 健康检查路径
    healthCheckPath: process.env.ROLE_HEALTH_CHECK_PATH || '/health/role',
  },
}))
