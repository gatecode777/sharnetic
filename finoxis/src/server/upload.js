import 'server-only';
import path from 'node:path';
import fs from 'node:fs';
import { v4 as uuidv4 } from 'uuid';

/**
 * Disk storage for uploaded images.
 * Defaults to <project>/uploads, override with UPLOAD_DIR.
 * Files are served back by the /uploads/[...path] route handler.
 */
export const UPLOAD_ROOT = process.env.UPLOAD_DIR
  ? path.resolve(/*turbopackIgnore: true*/ process.env.UPLOAD_DIR)
  : path.join(/*turbopackIgnore: true*/ process.cwd(), 'uploads');

export const uploadPath = (folder, filename = '') => path.join(/*turbopackIgnore: true*/ UPLOAD_ROOT, folder, filename);

/** Delete a previously uploaded file; silently ignores missing files. */
export const deleteUpload = (folder, filename) => {
  if (!filename || typeof filename !== 'string') return;
  // Never allow path traversal out of the upload folder.
  const safeName = path.basename(filename);
  const filePath = uploadPath(folder, safeName);
  if (fs.existsSync(filePath)) {
    try {
      fs.unlinkSync(filePath);
    } catch (err) {
      console.error(`Error deleting file ${safeName}:`, err);
    }
  }
};

class MulterError extends Error {
  constructor(code, field) {
    const messages = {
      LIMIT_FILE_SIZE: 'File too large',
      LIMIT_FILE_COUNT: 'Too many files',
      LIMIT_UNEXPECTED_FILE: 'Unexpected field',
    };
    super(messages[code] || code);
    this.name = 'MulterError';
    this.code = code;
    this.field = field;
  }
}

const imageOnly = (file) => file.type?.startsWith('image/');

/**
 * multer-compatible upload middleware factory.
 *
 * @param {object}   opts
 * @param {string}   opts.folder      sub-folder inside UPLOAD_ROOT
 * @param {Function} opts.filename    (file) => stored filename
 * @param {Function} [opts.fileFilter] (file) => boolean
 * @param {string}   [opts.filterMessage]
 * @param {object}   [opts.limits]    { fileSize, files }
 */
export function createUpload({ folder, filename, fileFilter = imageOnly, filterMessage = 'Only image files are allowed', limits = {} }) {
  const middleware = (field, maxCount, mode) => async (req, res, next) => {
    const incoming = req._files || [];

    if (limits.files && incoming.length > limits.files) {
      throw new MulterError('LIMIT_FILE_COUNT');
    }

    const accepted = [];
    for (const { field: name, file } of incoming) {
      if (name !== field) throw new MulterError('LIMIT_UNEXPECTED_FILE', name);
      if (accepted.length >= maxCount) throw new MulterError('LIMIT_UNEXPECTED_FILE', name);
      if (limits.fileSize && file.size > limits.fileSize) throw new MulterError('LIMIT_FILE_SIZE', name);
      if (!fileFilter(file)) {
        const error = new Error(filterMessage);
        error.statusCode = 400;
        throw error;
      }
      accepted.push(file);
    }

    const dir = uploadPath(folder);
    if (accepted.length && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const stored = [];
    for (const file of accepted) {
      const storedName = filename(file);
      const destination = path.join(/*turbopackIgnore: true*/ dir, storedName);
      await fs.promises.writeFile(destination, Buffer.from(await file.arrayBuffer()));
      stored.push({
        fieldname: field,
        originalname: file.name,
        mimetype: file.type,
        size: file.size,
        destination: dir,
        filename: storedName,
        path: destination,
      });
    }

    if (mode === 'single') req.file = stored[0];
    else req.files = stored;

    next();
  };

  return {
    single: (field) => middleware(field, 1, 'single'),
    array: (field, maxCount = Infinity) => middleware(field, maxCount, 'array'),
  };
}

const ext = (file) => path.extname(file.name || '');

// ── Upload configurations (same rules as the old multer setups) ──────────────

// /api/admin/products  — max 4 images, 5MB each
export const productUpload = createUpload({
  folder: 'products',
  filename: (file) => `product-${uuidv4()}${ext(file)}`,
  limits: { fileSize: 5 * 1024 * 1024, files: 4 },
});

// /api/categories — single image, 5MB
export const categoryUpload = createUpload({
  folder: 'categories',
  filename: (file) => `category-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext(file).toLowerCase()}`,
  limits: { fileSize: 5 * 1024 * 1024 },
});

// /api/users/profile — single image, 3MB
export const profileUpload = createUpload({
  folder: 'profiles',
  filename: (file) => `profile-${uuidv4()}${ext(file)}`,
  filterMessage: 'Only image files allowed',
  limits: { fileSize: 3 * 1024 * 1024 },
});
