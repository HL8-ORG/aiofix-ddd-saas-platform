import { Test, TestingModule } from '@nestjs/testing';
import { TenantsController } from '../tenants.controller';
import { TenantsService } from '../../application/tenants.service';
import { Tenant } from '../../domain/entities/tenant.entity';
import { ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';

/**
 * @test TenantsController控制器测试
 * @description 测试租户控制器的HTTP接口和响应处理
 */
describe('TenantsController', () => {
  let controller: TenantsController;
  let mockTenantsService: jest.Mocked<TenantsService>;

  beforeEach(async () => {
    const mockService = {
      createTenant: jest.fn(),
      getTenantById: jest.fn(),
      getAllTenants: jest.fn(),
      activateTenant: jest.fn(),
      deleteTenant: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [TenantsController],
      providers: [
        {
          provide: TenantsService,
          useValue: mockService,
        },
      ],
    }).compile();

    controller = module.get<TenantsController>(TenantsController);
    mockTenantsService = module.get(TenantsService);
  });

  describe('createTenant', () => {
    it('应该成功创建租户', async () => {
      const createTenantDto = {
        name: '测试租户',
        code: 'test-tenant',
        adminUserId: 'admin-id',
        description: '测试描述',
        settings: { theme: 'dark' },
      };

      const tenant = new Tenant('test-id', '测试租户', 'test-tenant', 'admin-id');
      mockTenantsService.createTenant.mockResolvedValue(tenant);

      const result = await controller.createTenant(createTenantDto);

      expect(result).toEqual({
        success: true,
        data: tenant,
        message: '租户创建成功',
      });
      expect(mockTenantsService.createTenant).toHaveBeenCalledWith(
        '测试租户',
        'test-tenant',
        'admin-id',
        '测试描述',
        { theme: 'dark' }
      );
    });

    it('应该处理创建租户时的冲突异常', async () => {
      const createTenantDto = {
        name: '测试租户',
        code: 'existing-tenant',
        adminUserId: 'admin-id',
      };

      mockTenantsService.createTenant.mockRejectedValue(new ConflictException('租户编码已存在'));

      await expect(controller.createTenant(createTenantDto)).rejects.toThrow(ConflictException);
    });
  });

  describe('getTenantById', () => {
    it('应该成功获取租户', async () => {
      const tenant = new Tenant('test-id', '测试租户', 'test-tenant', 'admin-id');
      mockTenantsService.getTenantById.mockResolvedValue(tenant);

      const result = await controller.getTenantById('test-id');

      expect(result).toEqual({
        success: true,
        data: tenant,
        message: '获取租户成功',
      });
      expect(mockTenantsService.getTenantById).toHaveBeenCalledWith('test-id');
    });

    it('应该处理租户不存在的情况', async () => {
      mockTenantsService.getTenantById.mockRejectedValue(new NotFoundException('租户不存在'));

      await expect(controller.getTenantById('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('getAllTenants', () => {
    it('应该成功获取所有租户', async () => {
      const tenants = [
        new Tenant('test-1', '租户1', 'tenant-1', 'admin-1'),
        new Tenant('test-2', '租户2', 'tenant-2', 'admin-2'),
      ];
      mockTenantsService.getAllTenants.mockResolvedValue(tenants);

      const result = await controller.getAllTenants();

      expect(result).toEqual({
        success: true,
        data: tenants,
        message: '获取租户列表成功',
        total: 2,
      });
      expect(mockTenantsService.getAllTenants).toHaveBeenCalled();
    });

    it('应该处理空租户列表', async () => {
      mockTenantsService.getAllTenants.mockResolvedValue([]);

      const result = await controller.getAllTenants();

      expect(result).toEqual({
        success: true,
        data: [],
        message: '获取租户列表成功',
        total: 0,
      });
    });
  });

  describe('activateTenant', () => {
    it('应该成功激活租户', async () => {
      const tenant = new Tenant('test-id', '测试租户', 'test-tenant', 'admin-id');
      mockTenantsService.activateTenant.mockResolvedValue(tenant);

      const result = await controller.activateTenant('test-id');

      expect(result).toEqual({
        success: true,
        data: tenant,
        message: '租户激活成功',
      });
      expect(mockTenantsService.activateTenant).toHaveBeenCalledWith('test-id');
    });

    it('应该处理激活租户时的异常', async () => {
      mockTenantsService.activateTenant.mockRejectedValue(new BadRequestException('租户无法激活'));

      await expect(controller.activateTenant('test-id')).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteTenant', () => {
    it('应该成功删除租户', async () => {
      mockTenantsService.deleteTenant.mockResolvedValue(true);

      const result = await controller.deleteTenant('test-id');

      expect(result).toEqual({
        success: true,
        message: '租户删除成功',
      });
      expect(mockTenantsService.deleteTenant).toHaveBeenCalledWith('test-id');
    });

    it('应该处理删除租户时的异常', async () => {
      mockTenantsService.deleteTenant.mockRejectedValue(new NotFoundException('租户不存在'));

      await expect(controller.deleteTenant('non-existent-id')).rejects.toThrow(NotFoundException);
    });
  });
}); 