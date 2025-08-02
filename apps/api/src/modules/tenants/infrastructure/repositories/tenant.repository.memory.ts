import { Injectable } from '@nestjs/common';
import { Tenant } from '../../domain/entities/tenant.entity';
import { TenantCode } from '../../domain/value-objects/tenant-code.value-object';
import { TenantStatus, TenantStatusValue } from '../../domain/value-objects/tenant-status.value-object';
import { TenantRepository } from '../../domain/repositories/tenant.repository';

/**
 * @class TenantRepositoryImpl
 * @description
 * 租户仓储抽象类的实现类，属于基础设施层。
 * 负责具体的数据库操作和外部服务集成。
 * 
 * 主要原理与机制：
 * 1. 继承TenantRepository抽象类，实现所有抽象方法
 * 2. 处理领域对象与数据库之间的转换
 * 3. 提供数据持久化和查询功能
 * 4. 遵循依赖倒置原则，领域层不依赖基础设施层
 * 5. 可以添加基础设施层特有的功能
 */
@Injectable()
export class TenantRepositoryMemory extends TenantRepository {
  // 临时使用内存存储，后续会替换为真实的数据库实现
  private tenants: Map<string, Tenant> = new Map();

  /**
   * @method save
   * @description 保存租户实体
   */
  async save(tenant: Tenant): Promise<Tenant> {
    this.tenants.set(tenant.id, tenant);
    return tenant;
  }

  /**
   * @method findById
   * @description 根据ID查找租户
   */
  async findById(id: string): Promise<Tenant | null> {
    return this.tenants.get(id) || null;
  }

  /**
   * @method findByCode
   * @description 根据租户编码查找租户
   */
  async findByCode(code: TenantCode): Promise<Tenant | null> {
    for (const tenant of this.tenants.values()) {
      if (tenant.getCode() === code.value) {
        return tenant;
      }
    }
    return null;
  }

  /**
   * @method findByCodeString
   * @description 根据租户编码字符串查找租户
   */
  async findByCodeString(code: string): Promise<Tenant | null> {
    for (const tenant of this.tenants.values()) {
      if (tenant.getCode() === code) {
        return tenant;
      }
    }
    return null;
  }

  /**
   * @method findByName
   * @description 根据名称查找租户
   */
  async findByName(name: string): Promise<Tenant[]> {
    return Array.from(this.tenants.values()).filter(
      tenant => tenant.getName().toLowerCase().includes(name.toLowerCase())
    );
  }

  /**
   * @method findByStatus
   * @description 根据状态查找租户
   */
  async findByStatus(status: TenantStatus): Promise<Tenant[]> {
    return Array.from(this.tenants.values()).filter(
      tenant => tenant.getStatus() === status
    );
  }

  /**
   * @method findByAdminUserId
   * @description 根据管理员用户ID查找租户
   */
  async findByAdminUserId(adminUserId: string): Promise<Tenant[]> {
    return Array.from(this.tenants.values()).filter(
      tenant => tenant.adminUserId === adminUserId
    );
  }

  /**
   * @method findActive
   * @description 查找所有激活状态的租户
   */
  async findActive(): Promise<Tenant[]> {
    return Array.from(this.tenants.values()).filter(
      tenant => tenant.getStatus() === TenantStatus.ACTIVE
    );
  }

  /**
   * @method findPending
   * @description 查找所有待审核状态的租户
   */
  async findPending(): Promise<Tenant[]> {
    return Array.from(this.tenants.values()).filter(
      tenant => tenant.getStatus() === TenantStatus.PENDING
    );
  }

  /**
   * @method findSuspended
   * @description 查找所有暂停状态的租户
   */
  async findSuspended(): Promise<Tenant[]> {
    return Array.from(this.tenants.values()).filter(
      tenant => tenant.getStatus() === TenantStatus.SUSPENDED
    );
  }

  /**
   * @method findDeleted
   * @description 查找所有已删除的租户
   */
  async findDeleted(): Promise<Tenant[]> {
    return Array.from(this.tenants.values()).filter(
      tenant => tenant.isDeleted()
    );
  }

  /**
   * @method findAll
   * @description 查找所有未删除的租户
   */
  async findAll(): Promise<Tenant[]> {
    return Array.from(this.tenants.values()).filter(
      tenant => !tenant.isDeleted()
    );
  }

  /**
   * @method findAllWithDeleted
   * @description 查找所有租户（包括已删除的）
   */
  async findAllWithDeleted(): Promise<Tenant[]> {
    return Array.from(this.tenants.values());
  }

  /**
   * @method exists
   * @description 检查租户是否存在
   */
  async exists(id: string): Promise<boolean> {
    const tenant = this.tenants.get(id);
    return tenant !== undefined && !tenant.isDeleted();
  }

  /**
   * @method existsByCode
   * @description 根据编码检查租户是否存在
   */
  async existsByCode(code: TenantCode): Promise<boolean> {
    for (const tenant of this.tenants.values()) {
      if (tenant.getCode() === code.value && !tenant.isDeleted()) {
        return true;
      }
    }
    return false;
  }

  /**
   * @method existsByCodeString
   * @description 根据编码字符串检查租户是否存在
   */
  async existsByCodeString(code: string): Promise<boolean> {
    for (const tenant of this.tenants.values()) {
      if (tenant.getCode() === code && !tenant.isDeleted()) {
        return true;
      }
    }
    return false;
  }

  /**
   * @method count
   * @description 统计租户总数
   */
  async count(): Promise<number> {
    return Array.from(this.tenants.values()).filter(
      tenant => !tenant.isDeleted()
    ).length;
  }

  /**
   * @method countByStatus
   * @description 根据状态统计租户数量
   */
  async countByStatus(status: TenantStatus): Promise<number> {
    return Array.from(this.tenants.values()).filter(
      tenant => tenant.getStatus() === status && !tenant.isDeleted()
    ).length;
  }

  /**
   * @method delete
   * @description 软删除租户
   */
  async delete(id: string): Promise<boolean> {
    const tenant = this.tenants.get(id);
    if (tenant && !tenant.isDeleted()) {
      tenant.softDelete();
      return true;
    }
    return false;
  }

  /**
   * @method hardDelete
   * @description 硬删除租户
   */
  async hardDelete(id: string): Promise<boolean> {
    return this.tenants.delete(id);
  }

  /**
   * @method restore
   * @description 恢复已删除的租户
   */
  async restore(id: string): Promise<boolean> {
    const tenant = this.tenants.get(id);
    if (tenant && tenant.isDeleted()) {
      tenant.restore();
      return true;
    }
    return false;
  }

  /**
   * @method updateStatus
   * @description 更新租户状态
   */
  async updateStatus(id: string, status: TenantStatus): Promise<boolean> {
    const tenant = this.tenants.get(id);
    if (tenant) {
      tenant.status = new TenantStatusValue(status);
      return true;
    }
    return false;
  }

  /**
   * @method updateSettings
   * @description 更新租户配置
   */
  async updateSettings(id: string, settings: Record<string, any>): Promise<boolean> {
    const tenant = this.tenants.get(id);
    if (tenant) {
      tenant.updateSettings(settings);
      return true;
    }
    return false;
  }

  /**
   * @method findWithPagination
   * @description 分页查询租户
   */
  async findWithPagination(
    page: number,
    limit: number,
    filters?: { status?: TenantStatus; adminUserId?: string; search?: string; },
    sort?: { field: 'name' | 'code' | 'status' | 'createdAt' | 'updatedAt'; order: 'asc' | 'desc'; }
  ): Promise<{ tenants: Tenant[]; total: number; page: number; limit: number; totalPages: number; }> {
    let tenants = Array.from(this.tenants.values()).filter(tenant => !tenant.isDeleted());

    // 应用过滤器
    if (filters) {
      if (filters.status) {
        tenants = tenants.filter(tenant => tenant.getStatus() === filters.status);
      }
      if (filters.adminUserId) {
        tenants = tenants.filter(tenant => tenant.adminUserId === filters.adminUserId);
      }
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        tenants = tenants.filter(tenant =>
          tenant.getName().toLowerCase().includes(searchLower) ||
          tenant.getCode().toLowerCase().includes(searchLower)
        );
      }
    }

    // 应用排序
    if (sort) {
      tenants.sort((a, b) => {
        let aValue: any, bValue: any;

        switch (sort.field) {
          case 'name':
            aValue = a.getName();
            bValue = b.getName();
            break;
          case 'code':
            aValue = a.getCode();
            bValue = b.getCode();
            break;
          case 'status':
            aValue = a.getStatus();
            bValue = b.getStatus();
            break;
          case 'createdAt':
            aValue = a.createdAt;
            bValue = b.createdAt;
            break;
          case 'updatedAt':
            aValue = a.updatedAt;
            bValue = b.updatedAt;
            break;
          default:
            return 0;
        }

        if (sort.order === 'asc') {
          return aValue > bValue ? 1 : -1;
        } else {
          return aValue < bValue ? 1 : -1;
        }
      });
    }

    const total = tenants.length;
    const totalPages = Math.ceil(total / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTenants = tenants.slice(startIndex, endIndex);

    return {
      tenants: paginatedTenants,
      total,
      page,
      limit,
      totalPages
    };
  }

  /**
   * @method findBySearch
   * @description 根据搜索关键词查找租户
   */
  async findBySearch(search: string, limit?: number): Promise<Tenant[]> {
    const searchLower = search.toLowerCase();
    let tenants = Array.from(this.tenants.values()).filter(tenant =>
      !tenant.isDeleted() && (
        tenant.getName().toLowerCase().includes(searchLower) ||
        tenant.getCode().toLowerCase().includes(searchLower)
      )
    );

    if (limit) {
      tenants = tenants.slice(0, limit);
    }

    return tenants;
  }

  /**
   * @method findRecent
   * @description 查找最近创建的租户
   */
  async findRecent(limit?: number): Promise<Tenant[]> {
    let tenants = Array.from(this.tenants.values())
      .filter(tenant => !tenant.isDeleted())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    if (limit) {
      tenants = tenants.slice(0, limit);
    }

    return tenants;
  }

  /**
   * @method findByDateRange
   * @description 根据日期范围查找租户
   */
  async findByDateRange(startDate: Date, endDate: Date): Promise<Tenant[]> {
    return Array.from(this.tenants.values()).filter(tenant =>
      !tenant.isDeleted() &&
      tenant.createdAt >= startDate &&
      tenant.createdAt <= endDate
    );
  }
} 