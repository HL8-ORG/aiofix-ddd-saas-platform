import { Injectable } from '@nestjs/common';
import { Tenant } from '../../domain/entities/tenant.entity';

/**
 * @interface CacheService
 * @description 缓存服务接口，定义缓存操作的契约。
 */
export interface CacheService {
  get<T>(key: string): Promise<T | null>;
  set<T>(key: string, value: T, ttl?: number): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  exists(key: string): Promise<boolean>;
}

/**
 * @class TenantCacheService
 * @description
 * 租户缓存服务实现，负责管理租户数据的缓存。
 */
@Injectable()
export class TenantCacheService implements CacheService {
  private cache: Map<string, { value: any; expiresAt?: number }> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : undefined;
    this.cache.set(key, { value, expiresAt });
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  async exists(key: string): Promise<boolean> {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }

    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  async getTenant(id: string): Promise<Tenant | null> {
    return await this.get<Tenant>(`tenant:${id}`);
  }

  async setTenant(tenant: Tenant, ttl: number = 3600): Promise<void> {
    await this.set(`tenant:${tenant.id}`, tenant, ttl);
  }

  async deleteTenant(id: string): Promise<void> {
    await this.delete(`tenant:${id}`);
  }

  async getTenantByCode(code: string): Promise<Tenant | null> {
    return await this.get<Tenant>(`tenant:code:${code}`);
  }

  async setTenantByCode(tenant: Tenant, ttl: number = 3600): Promise<void> {
    await this.set(`tenant:code:${tenant.getCode()}`, tenant, ttl);
  }

  async deleteTenantByCode(code: string): Promise<void> {
    await this.delete(`tenant:code:${code}`);
  }

  async clearAllTenantCache(): Promise<void> {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.startsWith('tenant:')) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      await this.delete(key);
    }
  }
} 