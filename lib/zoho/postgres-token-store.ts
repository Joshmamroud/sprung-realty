import "server-only";
import { Pool } from "pg";
import { OAuthToken } from "@zohocrm/typescript-sdk-8.0/dist/models/authenticator/oauth_token";
import type { Token } from "@zohocrm/typescript-sdk-8.0/dist/models/authenticator/token";
import type { TokenStore } from "@zohocrm/typescript-sdk-8.0/dist/models/authenticator/store/token_store";

/**
 * Persists Zoho OAuth tokens in Postgres so they survive Vercel cold starts.
 * Implements the same TokenStore contract as FileStore but backed by a single
 * row table in the existing Neon database.
 */
export class PostgresTokenStore implements TokenStore {
  private pool: Pool;
  private ready: Promise<void>;

  constructor(connectionString: string) {
    this.pool = new Pool({
      connectionString,
      max: 1,
      ssl: connectionString.includes("sslmode=") ? undefined : { rejectUnauthorized: false },
    });
    this.ready = this.ensureSchema();
  }

  private async ensureSchema(): Promise<void> {
    await this.pool.query(`
      CREATE TABLE IF NOT EXISTS zoho_tokens (
        id            TEXT PRIMARY KEY,
        user_mail     TEXT,
        client_id     TEXT,
        client_secret TEXT,
        refresh_token TEXT,
        access_token  TEXT,
        grant_token   TEXT,
        expiry_time   TEXT,
        redirect_url  TEXT,
        api_domain    TEXT,
        updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);
  }

  private async nextId(): Promise<string> {
    const { rows } = await this.pool.query<{ max: string | null }>(
      "SELECT MAX(CAST(id AS BIGINT))::TEXT AS max FROM zoho_tokens WHERE id ~ '^[0-9]+$'",
    );
    const max = rows[0]?.max ? Number(rows[0].max) : 0;
    return String(max + 1);
  }

  private merge(target: OAuthToken, row: Record<string, string | null>): void {
    if (target.getId() == null && row.id) target.setId(row.id);
    if ((target.getClientId() == null || target.getClientId() === "") && row.client_id) {
      target.setClientId(row.client_id);
    }
    if ((target.getClientSecret() == null || target.getClientSecret() === "") && row.client_secret) {
      target.setClientSecret(row.client_secret);
    }
    if (target.getRefreshToken() == null && row.refresh_token) {
      target.setRefreshToken(row.refresh_token);
    }
    if (target.getAccessToken() == null && row.access_token) {
      target.setAccessToken(row.access_token);
    }
    if (target.getGrantToken() == null && row.grant_token) {
      target.setGrantToken(row.grant_token);
    }
    if ((!target.getExpiresIn() || target.getExpiresIn() === "") && row.expiry_time) {
      target.setExpiresIn(row.expiry_time);
    }
    if (target.getRedirectURL() == null && row.redirect_url) {
      target.setRedirectURL(row.redirect_url);
    }
    if (target.getAPIDomain() == null && row.api_domain) {
      target.setAPIDomain(row.api_domain);
    }
  }

  private async findRow(token: OAuthToken): Promise<Record<string, string | null> | null> {
    await this.ready;

    const id = token.getId();
    if (id) {
      const byId = await this.pool.query("SELECT * FROM zoho_tokens WHERE id = $1 LIMIT 1", [id]);
      if (byId.rowCount) return byId.rows[0];
    }

    const grant = token.getGrantToken();
    if (grant) {
      const byGrant = await this.pool.query(
        "SELECT * FROM zoho_tokens WHERE grant_token = $1 LIMIT 1",
        [grant],
      );
      if (byGrant.rowCount) return byGrant.rows[0];
    }

    const refresh = token.getRefreshToken();
    if (refresh) {
      const byRefresh = await this.pool.query(
        "SELECT * FROM zoho_tokens WHERE refresh_token = $1 LIMIT 1",
        [refresh],
      );
      if (byRefresh.rowCount) return byRefresh.rows[0];
    }

    const access = token.getAccessToken();
    if (access && !token.getClientId() && !token.getClientSecret()) {
      const byAccess = await this.pool.query(
        "SELECT * FROM zoho_tokens WHERE access_token = $1 LIMIT 1",
        [access],
      );
      if (byAccess.rowCount) return byAccess.rows[0];
    }

    return null;
  }

  async findToken(token: Token): Promise<Token | null> {
    const oauth = token as OAuthToken;
    const row = await this.findRow(oauth);
    if (!row) return null;
    this.merge(oauth, row);
    return oauth;
  }

  async findTokenById(id: string): Promise<Token | null> {
    await this.ready;
    const { rows } = await this.pool.query<Record<string, string | null>>(
      "SELECT * FROM zoho_tokens WHERE id = $1 LIMIT 1",
      [id],
    );
    if (!rows.length) return null;

    const row = rows[0];
    const oauth = new OAuthToken(
      row.client_id ?? null,
      row.client_secret ?? null,
      row.grant_token ?? null,
      row.refresh_token ?? null,
      row.redirect_url ?? null,
      row.id ?? null,
      row.access_token ?? null,
      null,
    );
    if (row.expiry_time) oauth.setExpiresIn(row.expiry_time);
    if (row.api_domain) oauth.setAPIDomain(row.api_domain);
    return oauth;
  }

  async saveToken(token: Token): Promise<void> {
    await this.ready;
    const oauth = token as OAuthToken;
    const existing = await this.findRow(oauth);

    if (!existing) {
      const id = oauth.getId() ?? (await this.nextId());
      oauth.setId(id);
      await this.pool.query(
        `INSERT INTO zoho_tokens
          (id, user_mail, client_id, client_secret, refresh_token, access_token, grant_token, expiry_time, redirect_url, api_domain, updated_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())`,
        [
          id,
          null,
          oauth.getClientId(),
          oauth.getClientSecret(),
          oauth.getRefreshToken(),
          oauth.getAccessToken(),
          oauth.getGrantToken(),
          oauth.getExpiresIn(),
          oauth.getRedirectURL(),
          oauth.getAPIDomain(),
        ],
      );
      return;
    }

    this.merge(oauth, existing);
    await this.pool.query(
      `UPDATE zoho_tokens SET
         client_id     = COALESCE($2, client_id),
         client_secret = COALESCE($3, client_secret),
         refresh_token = COALESCE($4, refresh_token),
         access_token  = COALESCE($5, access_token),
         grant_token   = COALESCE($6, grant_token),
         expiry_time   = COALESCE($7, expiry_time),
         redirect_url  = COALESCE($8, redirect_url),
         api_domain    = COALESCE($9, api_domain),
         updated_at    = NOW()
       WHERE id = $1`,
      [
        existing.id,
        oauth.getClientId(),
        oauth.getClientSecret(),
        oauth.getRefreshToken(),
        oauth.getAccessToken(),
        oauth.getGrantToken(),
        oauth.getExpiresIn(),
        oauth.getRedirectURL(),
        oauth.getAPIDomain(),
      ],
    );
    oauth.setId(existing.id ?? null);
  }

  async deleteToken(id: string): Promise<void> {
    await this.ready;
    await this.pool.query("DELETE FROM zoho_tokens WHERE id = $1", [id]);
  }

  async getTokens(): Promise<Token[] | null> {
    await this.ready;
    const { rows } = await this.pool.query("SELECT * FROM zoho_tokens ORDER BY id");
    return rows.length ? (rows as unknown as Token[]) : null;
  }

  async deleteTokens(): Promise<void> {
    await this.ready;
    await this.pool.query("DELETE FROM zoho_tokens");
  }
}
