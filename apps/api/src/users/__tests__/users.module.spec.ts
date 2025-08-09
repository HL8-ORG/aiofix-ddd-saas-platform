/**
 * @file users.module.spec.ts
 * @description 用户模块测试
 */
import { Test } from '@nestjs/testing'
import { CqrsModule } from '@nestjs/cqrs'
import { UsersModule } from '../users.module'
import { UserLoginSuccessEventHandler } from '../domain/events/handlers/user-login-success.handler'
import { UserLoginFailureEventHandler } from '../domain/events/handlers/user-login-failure.handler'

describe('UsersModule', () => {
  let module: UsersModule

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile()

    module = moduleRef.get<UsersModule>(UsersModule)
  })

  it('应该成功创建用户模块', () => {
    expect(module).toBeDefined()
  })

  it('应该注册CQRS模块', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile()

    const cqrsModule = moduleRef.get(CqrsModule)
    expect(cqrsModule).toBeDefined()
  })

  it('应该注册用户登录成功事件处理器', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile()

    const handler = moduleRef.get(UserLoginSuccessEventHandler)
    expect(handler).toBeDefined()
    expect(handler).toBeInstanceOf(UserLoginSuccessEventHandler)
  })

  it('应该注册用户登录失败事件处理器', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile()

    const handler = moduleRef.get(UserLoginFailureEventHandler)
    expect(handler).toBeDefined()
    expect(handler).toBeInstanceOf(UserLoginFailureEventHandler)
  })

  it('应该提供审计服务', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile()

    const auditService = moduleRef.get('AUDIT_SERVICE')
    expect(auditService).toBeDefined()
    expect(typeof auditService.log).toBe('function')
  })

  it('审计服务应该能够记录日志', async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UsersModule],
    }).compile()

    const auditService = moduleRef.get('AUDIT_SERVICE')
    const consoleSpy = jest.spyOn(console, 'info').mockImplementation()

    await auditService.log({ message: 'test audit log' })

    expect(consoleSpy).toHaveBeenCalledWith('[AUDIT]', { message: 'test audit log' })
    consoleSpy.mockRestore()
  })
})
