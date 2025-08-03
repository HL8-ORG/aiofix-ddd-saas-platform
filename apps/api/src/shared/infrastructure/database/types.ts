import { IsolationLevel } from '@mikro-orm/core';

/**
 * @description 数据库基础设施类型定义
 * 
 * 该文件定义了数据库基础设施模块中使用的所有类型，
 * 包括配置、服务、工具类等相关的类型定义。
 */

// 迁移选项类型
export interface MigrationOptions {
  from?: string;
  to?: string;
  dryRun?: boolean;
}

// 种子数据选项类型
export interface SeederOptions {
  seederName?: string;
  path?: string;
}

// 健康检查结果类型
export interface HealthCheckResult {
  status: string;
  details: {
    connection: boolean;
    version: string;
    poolStatus: any;
    lastCheck: Date;
  };
}

// 分页选项类型
export interface PaginationOptions {
  page?: number;
  limit?: number;
  maxLimit?: number;
  defaultLimit?: number;
}

// 排序选项类型
export interface SortingOptions {
  sortBy: string;
  sortOrder: 'ASC' | 'DESC';
  allowedFields?: string[];
}

// 搜索选项类型
export interface SearchOptions {
  searchTerm: string;
  searchFields: string[];
}

// 日期范围选项类型
export interface DateRangeOptions {
  startDate?: Date;
  endDate?: Date;
  dateField?: string;
}

// 查询结果类型
export interface QueryResult<T> {
  data: T[];
  metadata?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// 数据库统计信息类型
export interface DatabaseStats {
  tableCount: number;
  totalSize: string;
  activeConnections: number;
}

// 性能测试结果类型
export interface PerformanceTestResult {
  queryTime: number;
  connectionTime: number;
  overall: 'good' | 'acceptable' | 'poor';
}

// 连接池状态类型
export interface PoolStatus {
  totalCount?: number;
  idleCount?: number;
  waitingCount?: number;
  available?: boolean;
  note?: string;
}

// 事务选项类型
export interface TransactionOptions {
  isolationLevel?: IsolationLevel;
}

// 批量操作选项类型
export interface BatchOptions {
  batchSize?: number;
  idField?: string;
}

// 软删除选项类型
export interface SoftDeleteOptions {
  includeDeleted?: boolean;
  deletedAtField?: string;
}

// 数据库配置类型
export interface DatabaseConfig {
  host: string;
  port: number;
  dbName: string;
  user: string;
  password?: string;
  debug?: boolean;
  pool?: {
    min: number;
    max: number;
  };
  migrations?: {
    path: string;
    pathTs: string;
  };
  seeder?: {
    path: string;
    pathTs: string;
  };
}

// 迁移状态类型
export interface MigrationStatus {
  executed: string[];
  pending: string[];
}

// 数据库连接信息类型
export interface DatabaseConnectionInfo {
  host: string;
  port: number;
  database: string;
  user: string;
  version: string;
  connected: boolean;
}

// 查询构建器选项类型
export interface QueryBuilderOptions {
  pagination?: PaginationOptions;
  sorting?: SortingOptions;
  search?: SearchOptions;
  dateRange?: DateRangeOptions;
  softDelete?: SoftDeleteOptions;
}

// 数据库操作结果类型
export interface DatabaseOperationResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  affectedRows?: number;
  executionTime?: number;
}

// 数据库监控指标类型
export interface DatabaseMetrics {
  connectionCount: number;
  queryCount: number;
  averageQueryTime: number;
  slowQueries: number;
  errors: number;
  uptime: number;
}

// 数据库备份信息类型
export interface DatabaseBackupInfo {
  filename: string;
  size: number;
  createdAt: Date;
  status: 'completed' | 'failed' | 'in_progress';
  error?: string;
}

// 数据库恢复信息类型
export interface DatabaseRestoreInfo {
  filename: string;
  status: 'completed' | 'failed' | 'in_progress';
  startedAt: Date;
  completedAt?: Date;
  error?: string;
} 