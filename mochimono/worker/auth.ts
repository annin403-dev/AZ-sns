import { createRemoteJWKSet, jwtVerify } from 'jose';
import type { MiddlewareHandler } from 'hono';

export type AuthEnv = {
  DB: D1Database;
  /** 例: yourteam.cloudflareaccess.com（https:// は付けない） */
  ACCESS_TEAM_DOMAIN?: string;
  /** Access アプリの AUD タグ */
  ACCESS_AUD?: string;
  /** 任意。入れておくと、このメールアドレス以外は 401 */
  ALLOWED_EMAIL?: string;
  /** ローカル開発だけで使う。localhost 以外では無視される */
  DEV_DISABLE_AUTH?: string;
};

const jwksCache = new Map<string, ReturnType<typeof createRemoteJWKSet>>();

function getJwks(teamDomain: string) {
  let jwks = jwksCache.get(teamDomain);
  if (!jwks) {
    jwks = createRemoteJWKSet(new URL(`https://${teamDomain}/cdn-cgi/access/certs`));
    jwksCache.set(teamDomain, jwks);
  }
  return jwks;
}

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]', '::1']);

/** ローカル開発のときだけ確認を省略できる。本番のホスト名では必ず確認する */
export function isAuthBypassed(env: AuthEnv, url: string): boolean {
  if (env.DEV_DISABLE_AUTH !== 'true') return false;
  return LOCAL_HOSTS.has(new URL(url).hostname);
}

export function normalizeTeamDomain(v: string): string {
  return v.replace(/^https?:\/\//, '').replace(/\/+$/, '');
}

export const accessAuth: MiddlewareHandler<{ Bindings: AuthEnv }> = async (c, next) => {
  if (isAuthBypassed(c.env, c.req.url)) return next();

  const token = c.req.header('Cf-Access-Jwt-Assertion');
  const team = c.env.ACCESS_TEAM_DOMAIN;
  const aud = c.env.ACCESS_AUD;
  if (!token || !team || !aud) return c.json({ error: 'ログインが必要です' }, 401);

  const teamDomain = normalizeTeamDomain(team);
  try {
    const { payload } = await jwtVerify(token, getJwks(teamDomain), {
      issuer: `https://${teamDomain}`,
      audience: aud,
    });
    const allowed = c.env.ALLOWED_EMAIL?.trim().toLowerCase();
    if (allowed && String(payload.email ?? '').toLowerCase() !== allowed) {
      return c.json({ error: 'このアカウントでは使えません' }, 401);
    }
  } catch {
    return c.json({ error: 'ログインが必要です' }, 401);
  }
  return next();
};
