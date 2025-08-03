import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { UpdateRoleDto } from '../../dto/update-role.dto';

describe('UpdateRoleDto', () => {
  describe('基本验证', () => {
    it('应该通过空的更新DTO', async () => {
      const updateRoleDto = plainToClass(UpdateRoleDto, {});

      const errors = await validate(updateRoleDto);
      expect(errors).toHaveLength(0);
    });

    it('应该通过部分字段更新', async () => {
      const updateRoleDto = plainToClass(UpdateRoleDto, {
        name: '更新后的角色名',
        description: '更新后的描述',
      });

      const errors = await validate(updateRoleDto);
      expect(errors).toHaveLength(0);
    });

    it('应该通过所有字段更新', async () => {
      const updateRoleDto = plainToClass(UpdateRoleDto, {
        name: '更新后的角色名',
        code: 'UPDATED_CODE',
        description: '更新后的描述',
        priority: 200,
        isSystemRole: true,
        isDefaultRole: false,
      });

      const errors = await validate(updateRoleDto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('字段验证', () => {
    it('应该拒绝name字段超过50个字符', async () => {
      const updateRoleDto = plainToClass(UpdateRoleDto, {
        name: 'a'.repeat(51),
      });

      const errors = await validate(updateRoleDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('name');
    });

    it('应该拒绝code字段超过20个字符', async () => {
      const updateRoleDto = plainToClass(UpdateRoleDto, {
        code: 'a'.repeat(21),
      });

      const errors = await validate(updateRoleDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('code');
    });

    it('应该拒绝priority小于1', async () => {
      const updateRoleDto = plainToClass(UpdateRoleDto, {
        priority: 0,
      });

      const errors = await validate(updateRoleDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('priority');
    });

    it('应该拒绝priority大于1000', async () => {
      const updateRoleDto = plainToClass(UpdateRoleDto, {
        priority: 1001,
      });

      const errors = await validate(updateRoleDto);
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('priority');
    });
  });

  describe('继承验证', () => {
    it('应该继承CreateRoleDto的所有验证规则', async () => {
      const updateRoleDto = plainToClass(UpdateRoleDto, {
        name: '测试角色',
        code: 'TEST',
        description: '测试描述',
        priority: 100,
        isSystemRole: false,
        isDefaultRole: false,
      });

      const errors = await validate(updateRoleDto);
      expect(errors).toHaveLength(0);
    });
  });
}); 