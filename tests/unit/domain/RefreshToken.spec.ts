import { RefreshToken } from '../../../src/domain/entities/RefreshToken';

const buildProps = (
  overrides: Partial<Parameters<typeof RefreshToken.restore>[0]> = {},
) => ({
  id: 'rt-1',
  userId: 'user-1',
  tokenHash: 'hash',
  expiresAt: new Date(Date.now() + 60_000),
  revokedAt: null,
  userAgent: null,
  ip: null,
  createdAt: new Date(),
  ...overrides,
});

describe('RefreshToken entity', () => {
  it('esta ativo quando nao revogado e nao expirado', () => {
    const token = RefreshToken.restore(buildProps());
    expect(token.isActive()).toBe(true);
    expect(token.id).toBe('rt-1');
    expect(token.userId).toBe('user-1');
    expect(token.tokenHash).toBe('hash');
    expect(token.revokedAt).toBeNull();
    expect(token.expiresAt).toBeInstanceOf(Date);
  });

  it('nao esta ativo quando revogado', () => {
    const token = RefreshToken.restore(buildProps({ revokedAt: new Date() }));
    expect(token.isActive()).toBe(false);
  });

  it('nao esta ativo quando expirado', () => {
    const token = RefreshToken.restore(
      buildProps({ expiresAt: new Date(Date.now() - 1_000) }),
    );
    expect(token.isActive()).toBe(false);
  });
});
