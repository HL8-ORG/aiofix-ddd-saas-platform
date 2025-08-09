import { Module } from '@nestjs/common'
import { AuthorizationService } from './domain/services/authorization.service'
import { InMemoryAuthorizationPolicyProvider } from './domain/services/authorization.policy.memory'
import { UserAuthenticationService } from './application/services/user-authentication.service'

/**
 * @module AuthModule
 * @description
 * 认证/授权模块骨架：
 * - 提供授权领域服务 `AuthorizationService`
 * - 采用内存版策略提供者 `InMemoryAuthorizationPolicyProvider`（后续可替换持久化实现）
 * - 认证（登录/Token/MFA）后续将迁移至此模块的应用层
 */
@Module({
  providers: [
    UserAuthenticationService,
    {
      provide: 'AUTHZ_POLICY_PROVIDER',
      useClass: InMemoryAuthorizationPolicyProvider,
    },
    {
      provide: AuthorizationService,
      useFactory: (policy: InMemoryAuthorizationPolicyProvider) => new AuthorizationService(policy),
      inject: ['AUTHZ_POLICY_PROVIDER'],
    },
  ],
  exports: [AuthorizationService, 'AUTHZ_POLICY_PROVIDER', UserAuthenticationService],
})
export class AuthModule { }


