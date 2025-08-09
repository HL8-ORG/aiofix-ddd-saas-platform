/**
 * @file index.ts
 * @description 共享工具类索引文件，统一导出所有工具函数
 * 
 * 主要功能：
 * 1. 统一管理所有共享工具函数
 * 2. 提供清晰的导入接口
 * 3. 便于模块间的工具函数复用
 */

// UUID工具函数
export {
  generateUuid,
  isValidUuid,
  isValidUuidV4,
  generateShortUuid,
} from './uuid.util'

// 可以在这里添加更多工具函数的导出
// export { ... } from './other.util'
