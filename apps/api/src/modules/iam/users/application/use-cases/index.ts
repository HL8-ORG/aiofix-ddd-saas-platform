/**
 * @file index.ts
 * @description 用户领域用例模块的索引文件，导出所有用例类
 *
 * 主要原理与机制：
 * 1. 集中管理所有用例的导出
 * 2. 便于应用层统一导入和使用
 * 3. 提供清晰的模块边界
 * 4. 支持依赖注入容器的自动发现
 */

// 基础用例
export { CreateUserUseCase } from './create-user.use-case'
export { GetUserUseCase } from './get-user.use-case'
export { GetUsersUseCase } from './get-users.use-case'
export { UpdateUserUseCase } from './update-user.use-case'
export { DeleteUserUseCase } from './delete-user.use-case'

// 状态管理用例
export { UpdateUserStatusUseCase } from './update-user-status.use-case'

// 分配管理用例
export { AssignUserToOrganizationUseCase } from './assign-user-to-organization.use-case'
export { AssignRoleToUserUseCase } from './assign-role-to-user.use-case'

// 搜索和统计用例
export { SearchUsersUseCase } from './search-users.use-case'
export { GetUserStatisticsUseCase } from './get-user-statistics.use-case'
