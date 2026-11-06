import { describe, expect, it } from 'vitest';
import { isAuthBypassed, normalizeTeamDomain } from '../worker/auth';

describe('ログインの確認', () => {
  const env = { DEV_DISABLE_AUTH: 'true' } as never;
  it('localhost のときだけ省略できる', () => {
    expect(isAuthBypassed(env, 'http://localhost:5173/api/all')).toBe(true);
    expect(isAuthBypassed(env, 'http://127.0.0.1:8787/api/all')).toBe(true);
    expect(isAuthBypassed(env, 'https://mochimono.example.workers.dev/api/all')).toBe(false);
  });
  it('設定がなければ省略しない', () => {
    expect(isAuthBypassed({} as never, 'http://localhost:5173/api/all')).toBe(false);
  });
  it('チームドメインの書き方をそろえる', () => {
    expect(normalizeTeamDomain('https://abc.cloudflareaccess.com/')).toBe('abc.cloudflareaccess.com');
  });
});
