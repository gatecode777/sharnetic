import 'server-only';
import { NextResponse } from 'next/server';
import connectDB from './db';
import { isCatalogWrite, refreshCatalog } from './revalidate';

/**
 * Small Express-compatible layer for Next.js Route Handlers.
 *
 * The original backend was written as Express controllers/middleware with the
 * `(req, res, next)` signature. Rather than rewriting (and risking subtle
 * behaviour changes in) every controller, each Route Handler composes the same
 * middleware + controller functions through `handle(...)`:
 *
 *   export const GET = handle(protect, getAllProducts);
 *
 * `req` exposes body / query / params / headers / file / files exactly like
 * Express + multer did, and `res` supports status() / json() / send() / set().
 */

export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
}

class ApiResponse {
  constructor() {
    this.statusCode = 200;
    this.headers = new Headers();
    this.body = null;
    this.headersSent = false;
  }

  status(code) {
    this.statusCode = code;
    return this;
  }

  set(name, value) {
    this.headers.set(name, value);
    return this;
  }

  setHeader(name, value) {
    return this.set(name, value);
  }

  json(data) {
    this.headers.set('Content-Type', 'application/json; charset=utf-8');
    this.body = JSON.stringify(data);
    this.headersSent = true;
    return this;
  }

  send(data) {
    if (data !== null && typeof data === 'object' && !(data instanceof Uint8Array)) {
      return this.json(data);
    }
    this.body = data ?? null;
    this.headersSent = true;
    return this;
  }

  toResponse() {
    return new NextResponse(this.body, { status: this.statusCode, headers: this.headers });
  }
}

const safeDecode = (value) => {
  if (typeof value !== 'string' || !value.includes('%')) return value;
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

// Mirror Express/qs behaviour: repeated keys become arrays.
const appendValue = (target, key, value) => {
  if (Object.prototype.hasOwnProperty.call(target, key)) {
    target[key] = [].concat(target[key], value);
  } else {
    target[key] = value;
  }
};

async function buildRequest(request, ctx) {
  const url = new URL(request.url);

  const query = {};
  for (const [key, value] of url.searchParams) appendValue(query, key, value);

  const rawParams = ctx?.params ? await ctx.params : {};
  const params = {};
  for (const [key, value] of Object.entries(rawParams || {})) {
    params[key] = Array.isArray(value) ? value.map(safeDecode) : safeDecode(value);
  }

  const headers = {};
  request.headers.forEach((value, key) => {
    headers[key] = value;
  });

  let body = {};
  const files = [];
  const method = request.method.toUpperCase();

  if (method !== 'GET' && method !== 'HEAD') {
    const contentType = (request.headers.get('content-type') || '').toLowerCase();

    if (contentType.includes('application/json')) {
      const text = await request.text();
      if (text.trim()) {
        try {
          body = JSON.parse(text);
        } catch {
          throw new HttpError(400, 'Invalid JSON body');
        }
      }
    } else if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      for (const [key, value] of form.entries()) {
        if (typeof value === 'string') {
          appendValue(body, key, value);
        } else if (value && value.name) {
          // Ignore empty file inputs (no file selected), just like multer/busboy.
          files.push({ field: key, file: value });
        }
      }
    } else if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await request.text();
      for (const [key, value] of new URLSearchParams(text)) appendValue(body, key, value);
    }
  }

  return {
    method,
    url: url.pathname + url.search,
    originalUrl: url.pathname + url.search,
    path: url.pathname,
    query,
    params,
    headers,
    body,
    // Raw multipart files; consumed by the upload middleware (see ./upload.js).
    _files: files,
    // Populated by the upload middleware, same shape as multer.
    file: undefined,
    files: undefined,
  };
}

function errorResponse(err) {
  console.error('Error:', err);

  if (err?.name === 'MulterError') {
    let message = err.message;
    if (err.code === 'LIMIT_FILE_SIZE') message = 'File size too large. Maximum size is 5MB per file.';
    if (err.code === 'LIMIT_FILE_COUNT') message = 'Too many files. Maximum is 10 images.';
    return NextResponse.json({ success: false, message }, { status: 400 });
  }

  return NextResponse.json(
    {
      success: false,
      message: err?.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && err?.stack ? { stack: err.stack } : {}),
    },
    { status: err?.statusCode || 500 }
  );
}

/**
 * Compose Express-style middleware/controllers into a Next.js Route Handler.
 * Every handler gets a live MongoDB connection before the chain runs.
 */
export function handle(...chain) {
  return async function routeHandler(request, ctx) {
    const res = new ApiResponse();
    let catalogWrite = false;

    try {
      const req = await buildRequest(request, ctx);
      await connectDB();

      for (const fn of chain) {
        // Reaching the last function (the controller) means auth passed; it may change catalog data.
        if (fn === chain[chain.length - 1]) catalogWrite = isCatalogWrite(req.method, req.path);

        let nextCalled = false;
        let nextError;

        await fn(req, res, (error) => {
          nextCalled = true;
          nextError = error;
        });

        if (nextError) throw nextError;
        if (res.headersSent || !nextCalled) break;
      }

      if (!res.headersSent) {
        throw new HttpError(500, 'No response was sent by the route handler');
      }
    } catch (err) {
      return errorResponse(err);
    } finally {
      // Also after a failure: a bulk import can save some rows before it stops.
      if (catalogWrite) refreshCatalog();
    }

    return res.toResponse();
  };
}
