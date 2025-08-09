import { User } from '../../entities/user.entity';
import { Email } from '../../value-objects/email.vo';
import { UserName } from '../../value-objects/username.vo';
import { Password } from '../../value-objects/password.vo';
import { UserLoginSuccessEvent } from '../user-login-success.event';
import { UserLoginFailureEvent } from '../user-login-failure.event';
import { UserLoginSuccessEventHandler } from '../handlers/user-login-success.handler';
import { UserLoginFailureEventHandler } from '../handlers/user-login-failure.handler';

describe('User Login Handlers', () => {
  const tenantId = 'test-tenant';
  const audit = { log: jest.fn() };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('UserLoginSuccessEventHandler 应该写入成功审计日志', async () => {
    const user = User.create({
      email: new Email('success@example.com'),
      username: new UserName('success'),
      password: Password.create('ValidP@ssw0rd'),
      firstName: 'A',
      lastName: 'B',
      tenantId,
    });
    user.activate();
    const event = new UserLoginSuccessEvent(user, '127.0.0.1', 'UA');
    const handler = new UserLoginSuccessEventHandler(audit);

    await handler.handle(event);

    expect(audit.log).toHaveBeenCalledTimes(1);
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'USER_LOGIN_SUCCESS',
        userId: user.getId().getValue(),
        tenantId,
        metadata: expect.objectContaining({
          username: user.getUsername().getValue(),
          email: user.getEmail().getValue(),
          clientIp: '127.0.0.1',
          userAgent: 'UA',
        }),
      }),
    );
  });

  it('UserLoginFailureEventHandler 应该写入失败审计日志', async () => {
    const user = User.create({
      email: new Email('failure@example.com'),
      username: new UserName('failure'),
      password: Password.create('ValidP@ssw0rd'),
      firstName: 'A',
      lastName: 'B',
      tenantId,
    });
    user.activate();
    const event = new UserLoginFailureEvent(tenantId, 'failure', 'Incorrect password', user, '127.0.0.2', 'UA2');
    const handler = new UserLoginFailureEventHandler(audit);

    await handler.handle(event);

    expect(audit.log).toHaveBeenCalledTimes(1);
    expect(audit.log).toHaveBeenCalledWith(
      expect.objectContaining({
        action: 'USER_LOGIN_FAILURE',
        userId: user.getId().getValue(),
        tenantId,
        metadata: expect.objectContaining({
          usernameOrEmail: 'failure',
          reason: 'Incorrect password',
          clientIp: '127.0.0.2',
          userAgent: 'UA2',
        }),
      }),
    );
  });
});


