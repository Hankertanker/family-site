import { NextRequest, NextResponse } from 'next/server';
import { queryAll, queryOne, run } from './db';
import { requireAuth } from './auth';

type ParamsArg = { params: Promise<{ id: string }> };

// ─── GET /api/:resource ────────────────────────────────────────────────

interface ListConfig {
  table: string;
  orderBy?: string;
  baseWhere?: string;
  /** Map URL query param names to SQL column names for filtering */
  paramFilters?: Record<string, string>;
  /** Pagination with page/limit query params */
  pagination?: { defaultLimit?: number; maxLimit?: number };
  responseKey?: string;
}

export function createList(config: ListConfig) {
  const { table, orderBy, baseWhere, paramFilters, pagination, responseKey } = config;

  return async (request: NextRequest) => {
    const { searchParams } = request.nextUrl;

    // Build WHERE clause
    const whereParts: string[] = [];
    const params: unknown[] = [];
    if (baseWhere) whereParts.push(baseWhere);

    if (paramFilters) {
      for (const [param, column] of Object.entries(paramFilters)) {
        const value = searchParams.get(param);
        if (value) {
          whereParts.push(`${column} >= ? AND ${column} <= ?`);
          params.push(value);
        }
      }
    }

    const whereClause = whereParts.length > 0 ? ` WHERE ${whereParts.join(' AND ')}` : '';
    const orderClause = orderBy ? ` ORDER BY ${orderBy}` : '';

    if (pagination) {
      const defaultLimit = pagination.defaultLimit ?? 50;
      const maxLimit = pagination.maxLimit ?? 100;
      const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
      const limit = Math.min(maxLimit, Math.max(1, parseInt(searchParams.get('limit') || String(defaultLimit))));
      const offset = (page - 1) * limit;

      const totalRow = queryOne<{ count: number }>(
        `SELECT COUNT(*) as count FROM ${table}${whereClause}`,
        params
      );
      const total = totalRow?.count ?? 0;

      const items = queryAll(
        `SELECT * FROM ${table}${whereClause}${orderClause} LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      const key = responseKey || 'items';
      return NextResponse.json({ [key]: items, total, page, totalPages: Math.ceil(total / limit) });
    }

    const items = queryAll(`SELECT * FROM ${table}${whereClause}${orderClause}`, params);
    const key = responseKey || table;
    return NextResponse.json({ [key]: items });
  };
}

// ─── GET /api/:resource/[id] ───────────────────────────────────────────

interface ItemConfig {
  table: string;
  idField?: string;
  notFoundMessage?: string;
  responseKey?: string;
}

export function createItem(config: ItemConfig) {
  const { table, idField = 'id', notFoundMessage = '资源不存在', responseKey } = config;

  return async (_request: NextRequest, { params }: ParamsArg) => {
    const { id } = await params;
    const item = queryOne(`SELECT * FROM ${table} WHERE ${idField} = ?`, [id]);
    if (!item) {
      return NextResponse.json({ error: notFoundMessage }, { status: 404 });
    }
    const key = responseKey || table.replace(/_/g, '');
    return NextResponse.json({ [key]: item });
  };
}

// ─── POST /api/:resource ───────────────────────────────────────────────

interface InsertConfig {
  table: string;
  fields: string[];
  requiredFields?: string[];
  defaults?: Record<string, unknown>;
  authRequired?: boolean;
  responseKey?: string;
}

export function createInsert(config: InsertConfig) {
  const { table, fields, requiredFields = [], defaults = {}, authRequired = false, responseKey } = config;

  return async (request: NextRequest) => {
    if (authRequired) {
      try { await requireAuth(request); } catch {
        return NextResponse.json({ error: '请先登录' }, { status: 401 });
      }
    }

    const body = await request.json();

    // Validate required fields
    for (const f of requiredFields) {
      if (body[f] === undefined || body[f] === null || body[f] === '') {
        return NextResponse.json({ error: `${f} 为必填项` }, { status: 400 });
      }
    }

    const placeholders = fields.map(() => '?').join(', ');
    const values = fields.map((f) => {
      if (body[f] !== undefined && body[f] !== null) return body[f];
      if (defaults[f] !== undefined) return defaults[f];
      return null;
    });

    const result = run(`INSERT INTO ${table} (${fields.join(', ')}) VALUES (${placeholders})`, values);
    const item = queryOne(`SELECT * FROM ${table} WHERE id = ?`, [result.lastInsertRowid]);
    const key = responseKey || table.replace(/_/g, '');
    return NextResponse.json({ [key]: item }, { status: 201 });
  };
}

// ─── PUT /api/:resource/[id] ───────────────────────────────────────────

interface UpdateConfig {
  table: string;
  fields: string[];
  isPartial?: boolean;    // true: keep existing values for undefined fields
  authRequired?: boolean;
  responseKey?: string;
}

export function createUpdate(config: UpdateConfig) {
  const { table, fields, isPartial = false, authRequired = false, responseKey } = config;

  return async (request: NextRequest, { params }: ParamsArg) => {
    if (authRequired) {
      try { await requireAuth(request); } catch {
        return NextResponse.json({ error: '请先登录' }, { status: 401 });
      }
    }

    const { id } = await params;
    const body = await request.json();

    const existing = queryOne(`SELECT * FROM ${table} WHERE id = ?`, [id]) as Record<string, unknown> | undefined;
    if (!existing) {
      return NextResponse.json({ error: '资源不存在' }, { status: 404 });
    }

    const setClauses = fields.map((f) => `${f} = ?`);
    const values = fields.map((f) => {
      if (isPartial) {
        // For partial updates, use ?? to fall back to existing value
        // But handle null/undefined distinction: explicit null sets to null
        if (body[f] !== undefined) return body[f];
        return existing[f] ?? null;
      }
      // Full update: use provided value or fall back to existing
      if (body[f] !== undefined) return body[f];
      return existing[f] ?? null;
    });

    run(`UPDATE ${table} SET ${setClauses.join(', ')} WHERE id = ?`, [...values, id]);
    const item = queryOne(`SELECT * FROM ${table} WHERE id = ?`, [id]);
    const key = responseKey || table.replace(/_/g, '');
    return NextResponse.json({ [key]: item });
  };
}

// ─── DELETE /api/:resource/[id] ────────────────────────────────────────

interface DeleteConfig {
  table: string;
  authRequired?: boolean;
  /** Hook to run before delete (e.g., file cleanup). Return a response to abort. */
  beforeDelete?: (id: string) => Promise<NextResponse | void>;
}

export function createDelete(config: DeleteConfig) {
  const { table, authRequired = false, beforeDelete } = config;

  return async (request: NextRequest, { params }: ParamsArg) => {
    if (authRequired) {
      try { await requireAuth(request); } catch {
        return NextResponse.json({ error: '请先登录' }, { status: 401 });
      }
    }

    const { id } = await params;

    if (beforeDelete) {
      const abort = await beforeDelete(id);
      if (abort) return abort;
    }

    run(`DELETE FROM ${table} WHERE id = ?`, [id]);
    return NextResponse.json({ success: true });
  };
}
