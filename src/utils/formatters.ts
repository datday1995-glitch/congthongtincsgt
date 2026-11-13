import DOMPurify from 'dompurify';

export function toVietnameseSlug(input: string): string {
  return input
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 160);
}

function parseUnknownDate(value?: unknown): Date | null {
  if (!value) return null;
  if (typeof value === 'string') {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value === 'object' && value !== null) {
    const obj = value as { toDate?: () => Date; seconds?: number; _seconds?: number };
    if (typeof obj.toDate === 'function') {
      const d = obj.toDate();
      return d && !Number.isNaN(d.getTime()) ? d : null;
    }
    const sec = typeof obj.seconds === 'number' ? obj.seconds : obj._seconds;
    if (typeof sec === 'number') {
      const d = new Date(sec * 1000);
      return Number.isNaN(d.getTime()) ? null : d;
    }
  }
  return null;
}

export function formatDateVi(value?: unknown): string {
  const date = parseUnknownDate(value);
  if (!date) return 'Chưa cập nhật';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

export function formatDateTimeVi(value?: unknown): string {
  const date = parseUnknownDate(value);
  if (!date) return '—';
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, '0');
  const min = String(date.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes <= 0) return '0 KB';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function sanitizeRichHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's',
      'ul', 'ol', 'li', 'blockquote', 'a', 'img', 'figure', 'figcaption',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'hr', 'div', 'span'
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel', 'src', 'alt', 'title', 'width', 'height',
      'style', 'class', 'colspan', 'rowspan', 'data-align'
    ],
    ALLOW_DATA_ATTR: false,
  });
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function compressImageFile(
  file: File,
  maxWidth = 1400,
  quality = 0.82
): Promise<Blob> {
  if (!file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }
  const bitmap = await createImageBitmap(file);
  const scale = bitmap.width > maxWidth ? maxWidth / bitmap.width : 1;
  const targetWidth = Math.round(bitmap.width * scale);
  const targetHeight = Math.round(bitmap.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    return file;
  }
  ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);
  bitmap.close();

  const outputType = file.type === 'image/png' ? 'image/png' : 'image/webp';
  return new Promise((resolve) => {
    canvas.toBlob(
      (blob) => {
        resolve(blob || file);
      },
      outputType,
      quality
    );
  });
}

export function makeSafeId(prefix = 'doc'): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}-${Date.now()}-${rand}`;
}

export function parseFirestoreErrorMessage(err: unknown): string {
  const raw = err instanceof Error ? err.message : String(err);
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.error === 'string') {
      const inner = parsed.error;
      if (
        inner.includes('Missing or insufficient permissions') ||
        inner.includes('PERMISSION_DENIED')
      ) {
        const email = parsed.authInfo?.email;
        if (!email) {
          return 'Phiên đăng nhập Google với Firebase chưa sẵn sàng hoặc đã hết hạn. Vui lòng đăng xuất và đăng nhập lại bằng Google.';
        }
        return `Không có quyền thực hiện thao tác này trên cơ sở dữ liệu (${email}). Vui lòng kiểm tra quyền quản trị hoặc tải lại trang.`;
      }
      if (inner.includes('Quota exceeded')) {
        return 'Hệ thống cơ sở dữ liệu đã đạt giới hạn đọc/ghi miễn phí trong ngày (Quota exceeded).';
      }
      return inner;
    }
  } catch {
    // not JSON
  }
  if (raw.includes('Missing or insufficient permissions') || raw.includes('PERMISSION_DENIED')) {
    return 'Không có quyền thực hiện thao tác này trên cơ sở dữ liệu (Firestore Permissions).';
  }
  return raw;
}
