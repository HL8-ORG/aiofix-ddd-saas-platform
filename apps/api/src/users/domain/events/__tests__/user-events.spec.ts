import { User } from '../../entities/user.entity';
import { UserId } from '../../value-objects/user-id.vo';
import { Email } from '../../value-objects/email.vo';
import { UserName } from '../../value-objects/username.vo';
import { Password } from '../../value-objects/password.vo';
import { UserCreatedEvent } from '../user-created.event';
import { UserActivatedEvent } from '../user-activated.event';
import { UserLockedEvent } from '../user-locked.event';
import { PasswordChangedEvent } from '../password-changed.event';
import { UserLoginSuccessEvent } from '../user-login-success.event';
import { UserLoginFailureEvent } from '../user-login-failure.event';

describe('User Domain Events', () => {
  let testUser: User;
  const tenantId = 'test-tenant';

  beforeEach(() => {
    testUser = User.create({
      email: new Email('test@example.com'),
      username: new UserName('testuser'),
      password: Password.create('ValidP@ssw0rd'),
      firstName: 'John',
      lastName: 'Doe',
      tenantId,
    });
  });

  describe('UserCreatedEvent', () => {
    it('应该正确创建用户创建事件', () => {
      const event = new UserCreatedEvent(testUser);

      expect(event.getEventName()).toBe('UserCreated');
      expect(event.aggregateId).toBe(testUser.getId().getValue());
      expect(event.email).toBe('test@example.com');
      expect(event.username).toBe('testuser');
      expect(event.tenantId).toBe(tenantId);
      expect(event.fullName).toBe('John Doe');
      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(event.eventId).toBeDefined();
    });

    it('应该包含正确的用户信息', () => {
      const event = new UserCreatedEvent(testUser);

      expect(event.email).toBe(testUser.getEmail().getValue());
      expect(event.username).toBe(testUser.getUsername().getValue());
      expect(event.tenantId).toBe(testUser.getTenantId());
      expect(event.fullName).toBe(testUser.getFullName());
    });
  });

  describe('UserActivatedEvent', () => {
    it('应该正确创建用户激活事件', () => {
      testUser.activate();
      const event = new UserActivatedEvent(testUser);

      expect(event.getEventName()).toBe('UserActivated');
      expect(event.aggregateId).toBe(testUser.getId().getValue());
      expect(event.email).toBe('test@example.com');
      expect(event.username).toBe('testuser');
      expect(event.tenantId).toBe(tenantId);
      expect(event.activatedAt).toBeInstanceOf(Date);
      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(event.eventId).toBeDefined();
    });

    it('应该记录正确的激活时间', () => {
      const beforeActivation = new Date();
      testUser.activate();
      const event = new UserActivatedEvent(testUser);
      const afterActivation = new Date();

      expect(event.activatedAt.getTime()).toBeGreaterThanOrEqual(beforeActivation.getTime());
      expect(event.activatedAt.getTime()).toBeLessThanOrEqual(afterActivation.getTime());
    });
  });

  describe('UserLockedEvent', () => {
    beforeEach(() => {
      testUser.activate();
    });

    it('应该正确创建用户锁定事件', () => {
      const reason = 'Too many failed login attempts';
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + 30);

      const event = new UserLockedEvent(testUser, reason, lockUntil);

      expect(event.getEventName()).toBe('UserLocked');
      expect(event.aggregateId).toBe(testUser.getId().getValue());
      expect(event.email).toBe('test@example.com');
      expect(event.username).toBe('testuser');
      expect(event.tenantId).toBe(tenantId);
      expect(event.reason).toBe(reason);
      expect(event.lockedUntil).toEqual(lockUntil);
      expect(event.loginAttempts).toBe(0); // 初始登录尝试次数
      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(event.eventId).toBeDefined();
    });

    it('应该处理没有锁定截止时间的情况', () => {
      const reason = 'Security violation';
      const event = new UserLockedEvent(testUser, reason);

      expect(event.reason).toBe(reason);
      expect(event.lockedUntil).toBeUndefined();
    });

    it('应该记录当前的登录尝试次数', () => {
      // 模拟多次失败的登录尝试
      for (let i = 0; i < 3; i++) {
        testUser.verifyPassword('WrongPassword');
      }

      const event = new UserLockedEvent(testUser, 'Test lock');
      expect(event.loginAttempts).toBe(3);
    });
  });

  describe('PasswordChangedEvent', () => {
    beforeEach(() => {
      testUser.activate();
    });

    it('应该正确创建密码变更事件（用户主动修改）', () => {
      const clientIp = '192.168.1.100';
      const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

      const event = new PasswordChangedEvent(testUser, 'user_initiated', clientIp, userAgent);

      expect(event.getEventName()).toBe('PasswordChanged');
      expect(event.aggregateId).toBe(testUser.getId().getValue());
      expect(event.email).toBe('test@example.com');
      expect(event.username).toBe('testuser');
      expect(event.tenantId).toBe(tenantId);
      expect(event.changeType).toBe('user_initiated');
      expect(event.clientIp).toBe(clientIp);
      expect(event.userAgent).toBe(userAgent);
      expect(event.changedAt).toBeInstanceOf(Date);
      expect(event.occurredAt).toBeInstanceOf(Date);
      expect(event.eventId).toBeDefined();
    });

    it('应该正确创建密码重置事件（管理员重置）', () => {
      const event = new PasswordChangedEvent(testUser, 'admin_reset');

      expect(event.changeType).toBe('admin_reset');
      expect(event.clientIp).toBeUndefined();
      expect(event.userAgent).toBeUndefined();
    });

    it('应该正确创建忘记密码重置事件', () => {
      const event = new PasswordChangedEvent(testUser, 'forgot_password');

      expect(event.changeType).toBe('forgot_password');
    });

    it('应该记录正确的变更时间', () => {
      const beforeChange = new Date();
      const event = new PasswordChangedEvent(testUser, 'user_initiated');
      const afterChange = new Date();

      expect(event.changedAt.getTime()).toBeGreaterThanOrEqual(beforeChange.getTime());
      expect(event.changedAt.getTime()).toBeLessThanOrEqual(afterChange.getTime());
    });
  });

  describe('事件在用户聚合根中的发布', () => {
    it('用户创建时应该发布UserCreatedEvent', () => {
      const user = User.create({
        email: new Email('newuser@example.com'),
        username: new UserName('newuser'),
        password: Password.create('ValidP@ssw0rd'),
        tenantId,
      });

      const events = user.getDomainEvents();
      expect(events).toHaveLength(1);
      expect(events[0]).toBeInstanceOf(UserCreatedEvent);
      expect(events[0].getEventName()).toBe('UserCreated');
    });

    it('用户激活时应该发布UserActivatedEvent', () => {
      testUser.activate();

      const events = testUser.getDomainEvents();
      expect(events).toHaveLength(2); // UserCreated + UserActivated
      const activatedEvent = events.find(event => event instanceof UserActivatedEvent);
      expect(activatedEvent).toBeInstanceOf(UserActivatedEvent);
      expect(activatedEvent?.getEventName()).toBe('UserActivated');
    });

    it('用户锁定时应该发布UserLockedEvent', () => {
      testUser.activate();
      testUser.lock('Security violation');

      const events = testUser.getDomainEvents();
      expect(events).toHaveLength(3); // UserCreated + UserActivated + UserLocked
      const lockedEvent = events.find(event => event instanceof UserLockedEvent);
      expect(lockedEvent).toBeInstanceOf(UserLockedEvent);
      expect(lockedEvent?.getEventName()).toBe('UserLocked');
    });

    it('密码变更时应该发布PasswordChangedEvent', () => {
      testUser.activate();
      const newPassword = Password.create('NewValidP@ssw0rd');
      testUser.changePassword('ValidP@ssw0rd', newPassword, '192.168.1.100', 'Test Agent');

      const events = testUser.getDomainEvents();
      expect(events).toHaveLength(3); // UserCreated + UserActivated + PasswordChanged
      const passwordEvent = events.find(event => event instanceof PasswordChangedEvent);
      expect(passwordEvent).toBeInstanceOf(PasswordChangedEvent);
      expect(passwordEvent?.getEventName()).toBe('PasswordChanged');
    });

    it('密码重置时应该发布PasswordChangedEvent', () => {
      testUser.activate();
      const newPassword = Password.create('ResetValidP@ssw0rd');
      testUser.resetPassword(newPassword, 'forgot_password');

      const events = testUser.getDomainEvents();
      expect(events).toHaveLength(3); // UserCreated + UserActivated + PasswordChanged
      const passwordEvent = events.find(event => event instanceof PasswordChangedEvent);
      expect(passwordEvent).toBeInstanceOf(PasswordChangedEvent);
      expect(passwordEvent?.getEventName()).toBe('PasswordChanged');
    });

    it('应该能够清除领域事件', () => {
      testUser.activate();
      expect(testUser.getDomainEvents()).toHaveLength(2);

      testUser.clearDomainEvents();
      expect(testUser.getDomainEvents()).toHaveLength(0);
    });
  });

  describe('UserLogin* Events', () => {
    beforeEach(() => {
      testUser.activate();
    });

    it('登录成功应发布 UserLoginSuccessEvent', () => {
      // 清空之前的事件以便只关注登录事件
      testUser.clearDomainEvents();

      const ok = testUser.verifyPassword('ValidP@ssw0rd');
      expect(ok).toBe(true);

      const events = testUser.getDomainEvents();
      expect(events.length).toBe(1);
      const loginSuccess = events[0];
      expect(loginSuccess).toBeInstanceOf(UserLoginSuccessEvent);
      expect(loginSuccess.getEventName()).toBe('UserLoginSuccess');
    });

    it('登录失败应发布 UserLoginFailureEvent 并增加尝试次数', () => {
      testUser.clearDomainEvents();

      const ok = testUser.verifyPassword('WrongPassword');
      expect(ok).toBe(false);
      expect(testUser.getLoginAttempts()).toBe(1);

      const events = testUser.getDomainEvents();
      expect(events.length).toBe(1);
      const loginFail = events[0];
      expect(loginFail).toBeInstanceOf(UserLoginFailureEvent);
      expect(loginFail.getEventName()).toBe('UserLoginFailure');
    });
  });
});
