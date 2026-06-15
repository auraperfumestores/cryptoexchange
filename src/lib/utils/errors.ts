/**
 * Centralised error helpers for API routes.
 * Using a single shape keeps client-side error parsing trivial.
 */

import { NextResponse } from 'next/server';

export class HttpError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string[]>;

  constructor(message: string, status = 400, code?: string, fieldErrors?: Record<string, string[]>) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof HttpError) {
    return NextResponse.json(
      { error: err.message, code: err.code, fieldErrors: err.fieldErrors },
      { status: err.status },
    );
  }
  if (err instanceof Error) {
    console.error('[api]', err.message, err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
  console.error('[api] unknown error', err);
  return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: 'Not authenticated', code: 'UNAUTHENTICATED' }, { status: 401 });
}

export function forbidden(): NextResponse {
  return NextResponse.json({ error: 'Not allowed', code: 'FORBIDDEN' }, { status: 403 });
}

export function notFound(message = 'Not found'): NextResponse {
  return NextResponse.json({ error: message, code: 'NOT_FOUND' }, { status: 404 });
}

export function badRequest(message: string, fieldErrors?: Record<string, string[]>): NextResponse {
  return NextResponse.json({ error: message, code: 'BAD_REQUEST', fieldErrors }, { status: 400 });
}
