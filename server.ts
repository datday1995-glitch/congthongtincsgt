import 'dotenv/config';
import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import cookieParser from 'cookie-parser';
import express from 'express';
import { cert, getApps, initializeApp, type ServiceAccount } from 'firebase-admin/app';
import {
  FieldValue,
  getFirestore as getAdminFirestore,
  type Firestore,
  type QueryDocumentSnapshot,
} from 'firebase-admin/firestore';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const firebaseConfigPath = path.join(__dirname, 'firebase-applet-config.json');
const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, 'utf-8'));

// --- Firebase Admin Initialization (for Passcode Auth & Officer API) ---
let adminDb: Firestore | null = null;
let adminSdkReady = false;
let adminSdkStatusMessage = 'Chưa cấu hình FIREBASE_SERVICE_ACCOUNT_KEY';

function initFirebaseAdmin() {
  try {
    const rawKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY?.trim();
    if (!rawKey) {
      adminSdkReady = false;
      adminSdkStatusMessage =
        'Chưa thiết lập biến môi trường FIREBASE_SERVICE_ACCOUNT_KEY trong Secrets để xác thực Passcode phía máy chủ.';
      return;
    }

    let credentialObj: ServiceAccount;
    if (rawKey.startsWith('{')) {
      credentialObj = JSON.parse(rawKey);
    } else if (fs.existsSync(rawKey)) {
      credentialObj = JSON.parse(fs.readFileSync(rawKey, 'utf-8'));
    } else {
      throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY không phải JSON hợp lệ.');
    }

    const existingApps = getApps();
    const app =
      existingApps.length > 0
        ? existingApps[0]!
        : initializeApp({
            credential: cert(credentialObj),
            projectId: firebaseConfig.projectId,
          });

    adminDb = getAdminFirestore(app, firebaseConfig.firestoreDatabaseId);
    adminSdkReady = true;
    adminSdkStatusMessage = 'Đã kết nối Firebase Admin SDK thành công.';
  } catch (err) {
    adminSdkReady = false;
    adminSdkStatusMessage =
      err instanceof Error ? err.message : 'Lỗi khởi tạo Firebase Admin SDK.';
    console.error('[Firebase Admin Init Error]', adminSdkStatusMessage);
  }
}

initFirebaseAdmin();

// --- Cryptographic Helpers (Passcode Hashing & Session Cookies) ---
const SESSION_COOKIE_NAME = 'csgt_officer_session';
const SESSION_SECRET =
  process.env.SESSION_SECRET?.trim() || crypto.randomBytes(32).toString('hex');

function hashPasscode(passcode: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(passcode, salt, 64).toString('hex');
  return `scrypt$${salt}$${derived}`;
}

function verifyPasscodeHash(passcode: string, storedHash: string): boolean {
  const parts = storedHash.split('$');
  if (parts[0] === 'scrypt' && parts.length === 3) {
    const [, salt, originalHex] = parts;
    const derivedBuf = crypto.scryptSync(passcode, salt, 64);
    const originalBuf = Buffer.from(originalHex, 'hex');
    if (derivedBuf.length !== originalBuf.length) return false;
    return crypto.timingSafeEqual(derivedBuf, originalBuf);
  }
  if (parts[0] === 'pbkdf2' && parts.length === 4) {
    const [, iterStr, saltHex, originalHex] = parts;
    const iterations = Number(iterStr);
    if (!Number.isFinite(iterations) || iterations < 10000) return false;
    const saltBuf = Buffer.from(saltHex, 'hex');
    const derivedBuf = crypto.pbkdf2Sync(passcode, saltBuf, iterations, 32, 'sha256');
    const originalBuf = Buffer.from(originalHex, 'hex');
    if (derivedBuf.length !== originalBuf.length) return false;
    return crypto.timingSafeEqual(derivedBuf, originalBuf);
  }
  return false;
}

function generateStrongPasscode(length = 10): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#';
  const bytes = crypto.randomBytes(length);
  let out = '';
  for (let i = 0; i < length; i++) {
    out += alphabet[bytes[i] % alphabet.length];
  }
  return out;
}

interface OfficerTokenPayload {
  passcodeId: string;
  ownerName: string;
  exp: number;
}

function signSessionToken(payload: OfficerTokenPayload): string {
  const data = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${sig}`;
}

function verifySessionToken(token: string | undefined): OfficerTokenPayload | null {
  if (!token) return null;
  const dotIdx = token.indexOf('.');
  if (dotIdx <= 0) return null;
  const data = token.slice(0, dotIdx);
  const sig = token.slice(dotIdx + 1);
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(data)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return null;
  }
  try {
    const parsed = JSON.parse(Buffer.from(data, 'base64url').toString('utf8')) as OfficerTokenPayload;
    if (!parsed.passcodeId || !parsed.exp || Date.now() > parsed.exp) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

// IP Rate Limiter for Passcode login
const loginAttemptsByIp = new Map<string, { count: number; resetAt: number }>();
const MAX_IP_ATTEMPTS = 12;
const IP_WINDOW_MS = 15 * 60 * 1000;

function checkIpRateLimit(ip: string): { allowed: boolean; retryAfterMin?: number } {
  const now = Date.now();
  const entry = loginAttemptsByIp.get(ip);
  if (!entry || now > entry.resetAt) {
    return { allowed: true };
  }
  if (entry.count >= MAX_IP_ATTEMPTS) {
    return { allowed: false, retryAfterMin: Math.ceil((entry.resetAt - now) / 60000) };
  }
  return { allowed: true };
}

function recordFailedIpAttempt(ip: string) {
  const now = Date.now();
  const entry = loginAttemptsByIp.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttemptsByIp.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
  } else {
    entry.count += 1;
  }
}

function resetIpAttempts(ip: string) {
  loginAttemptsByIp.delete(ip);
}

// --- Express App Setup ---
const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    adminSdkReady,
    adminSdkStatusMessage,
    projectId: firebaseConfig.projectId,
    databaseId: firebaseConfig.firestoreDatabaseId,
  });
});

// Server-side Passcode Hashing (so plaintext passcode never hits Firestore)
app.post('/api/security/hash-passcode', (req, res) => {
  const { passcode } = req.body as { passcode?: string };
  if (!passcode || typeof passcode !== 'string' || passcode.trim().length < 6) {
    res.status(400).json({ error: 'Mã Passcode phải có ít nhất 6 ký tự.' });
    return;
  }
  const passcodeHash = hashPasscode(passcode.trim());
  res.json({ passcodeHash });
});

app.post('/api/security/generate-passcode', (_req, res) => {
  const passcode = generateStrongPasscode(10);
  const passcodeHash = hashPasscode(passcode);
  res.json({ passcode, passcodeHash });
});

// Server-side Passcode Login
app.post('/api/auth/passcode-login', async (req, res) => {
  const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
  const rate = checkIpRateLimit(clientIp);
  if (!rate.allowed) {
    res.status(429).json({
      error: `Quá nhiều lần đăng nhập sai. Vui lòng thử lại sau ${rate.retryAfterMin} phút.`,
    });
    return;
  }

  const { passcode } = req.body as { passcode?: string };
  if (!passcode || typeof passcode !== 'string' || passcode.trim().length < 4) {
    res.status(400).json({ error: 'Vui lòng nhập mã Passcode hợp lệ.' });
    return;
  }

  if (!adminSdkReady || !adminDb) {
    res.status(503).json({
      code: 'FIREBASE_ADMIN_NOT_CONFIGURED',
      error:
        'Máy chủ chưa kết nối Firebase Admin SDK (FIREBASE_SERVICE_ACCOUNT_KEY) để xác thực Passcode với cơ sở dữ liệu.',
      instructions:
        'Quản trị viên chính vui lòng đăng nhập bằng Gmail, sau đó vào Cài đặt website → Hướng dẫn cấu hình hệ thống để thêm FIREBASE_SERVICE_ACCOUNT_KEY vào Secrets.',
    });
    return;
  }

  try {
    const snapshot = await adminDb.collection('passcodes').get();
    let matchedDoc: QueryDocumentSnapshot | null = null;

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();
      if (typeof data.passcodeHash === 'string' && verifyPasscodeHash(passcode.trim(), data.passcodeHash)) {
        matchedDoc = docSnap;
        break;
      }
    }

    if (!matchedDoc) {
      recordFailedIpAttempt(clientIp);
      res.status(401).json({ error: 'Mã Passcode không chính xác hoặc không tồn tại.' });
      return;
    }

    const account = matchedDoc.data();
    if (account.status === 'locked') {
      res.status(403).json({
        error: 'Tài khoản Passcode này đã bị tạm khóa. Vui lòng liên hệ Quản trị viên chính.',
      });
      return;
    }

    if (account.lockedUntil && typeof account.lockedUntil === 'string' && account.lockedUntil.length > 0) {
      const lockTime = new Date(account.lockedUntil).getTime();
      if (!Number.isNaN(lockTime) && Date.now() < lockTime) {
        res.status(403).json({
          error: 'Tài khoản đang bị tạm khóa do đăng nhập sai nhiều lần. Vui lòng thử lại sau.',
        });
        return;
      }
    }

    resetIpAttempts(clientIp);
    const nowIso = new Date().toISOString();
    await matchedDoc.ref.update({
      failedAttempts: 0,
      lockedUntil: '',
      lastLoginAt: nowIso,
      updatedAt: FieldValue.serverTimestamp(),
    });

    await adminDb.collection('activityLogs').add({
      actorName: account.ownerName || 'Cán bộ Passcode',
      actorType: 'passcode_officer',
      actorId: matchedDoc.id,
      action: 'Đăng nhập hệ thống bằng Passcode',
      targetType: 'auth',
      targetTitle: account.ownerName || matchedDoc.id,
      details: `Đăng nhập thành công qua Passcode (${matchedDoc.id})`,
      createdAt: FieldValue.serverTimestamp(),
    });

    const token = signSessionToken({
      passcodeId: matchedDoc.id,
      ownerName: account.ownerName || 'Cán bộ quản trị',
      exp: Date.now() + 12 * 60 * 60 * 1000, // 12 hours
    });

    res.cookie(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
      maxAge: 12 * 60 * 60 * 1000,
      path: '/',
    });

    res.json({
      session: {
        mode: 'passcode',
        uid: matchedDoc.id,
        displayName: account.ownerName || 'Cán bộ quản trị',
        role: 'officer',
        isSuperAdmin: false,
      },
    });
  } catch (err) {
    console.error('[Passcode Login Error]', err);
    res.status(500).json({ error: 'Lỗi hệ thống khi xác thực Passcode.' });
  }
});

// Middleware to verify active Passcode Officer session against Firestore
async function requireOfficerSession(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const token = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  const payload = verifySessionToken(token);
  if (!payload) {
    res.status(401).json({ error: 'Phiên đăng nhập Passcode đã hết hạn hoặc không hợp lệ.' });
    return;
  }
  if (!adminSdkReady || !adminDb) {
    res.status(503).json({ error: 'Firebase Admin SDK chưa sẵn sàng.' });
    return;
  }
  try {
    const docSnap = await adminDb.collection('passcodes').doc(payload.passcodeId).get();
    if (!docSnap.exists) {
      res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
      res.status(401).json({ error: 'Tài khoản Passcode đã bị thu hồi.' });
      return;
    }
    const data = docSnap.data()!;
    if (data.status !== 'active') {
      res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
      res.status(403).json({ error: 'Tài khoản Passcode đã bị khóa quyền truy cập.' });
      return;
    }
    (req as express.Request & { officer?: { id: string; ownerName: string } }).officer = {
      id: docSnap.id,
      ownerName: data.ownerName || payload.ownerName,
    };
    next();
  } catch (err) {
    console.error('[Officer Session Verification Error]', err);
    res.status(500).json({ error: 'Không thể xác minh phiên làm việc.' });
  }
}

app.get('/api/auth/passcode-session', async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  const payload = verifySessionToken(token);
  if (!payload || !adminSdkReady || !adminDb) {
    res.json({ session: null });
    return;
  }
  try {
    const docSnap = await adminDb.collection('passcodes').doc(payload.passcodeId).get();
    if (!docSnap.exists || docSnap.data()?.status !== 'active') {
      res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
      res.json({ session: null });
      return;
    }
    res.json({
      session: {
        mode: 'passcode',
        uid: docSnap.id,
        displayName: docSnap.data()?.ownerName || payload.ownerName,
        role: 'officer',
        isSuperAdmin: false,
      },
    });
  } catch {
    res.json({ session: null });
  }
});

app.post('/api/auth/passcode-logout', async (req, res) => {
  const token = req.cookies?.[SESSION_COOKIE_NAME] as string | undefined;
  const payload = verifySessionToken(token);
  res.clearCookie(SESSION_COOKIE_NAME, { path: '/' });
  if (payload && adminSdkReady && adminDb) {
    try {
      await adminDb.collection('activityLogs').add({
        actorName: payload.ownerName,
        actorType: 'passcode_officer',
        actorId: payload.passcodeId,
        action: 'Đăng xuất hệ thống',
        targetType: 'auth',
        targetTitle: payload.ownerName,
        details: 'Cán bộ chủ động đăng xuất phiên làm việc.',
        createdAt: FieldValue.serverTimestamp(),
      });
    } catch {
      // ignore log error on logout
    }
  }
  res.json({ ok: true });
});

// --- Server-Authorized Officer CMS Routes ---
app.get('/api/officer/articles', requireOfficerSession, async (_req, res) => {
  try {
    const snap = await adminDb!.collection('articles').orderBy('updatedAt', 'desc').get();
    const items = snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        ...data,
        createdAtIso: data.createdAt?.toDate ? data.createdAt.toDate().toISOString() : undefined,
        updatedAtIso: data.updatedAt?.toDate ? data.updatedAt.toDate().toISOString() : undefined,
      };
    });
    res.json({ items });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Lỗi tải danh sách bài viết.' });
  }
});

app.post('/api/officer/articles', requireOfficerSession, async (req, res) => {
  try {
    const officer = (req as express.Request & { officer: { id: string; ownerName: string } }).officer;
    const body = req.body;
    const id = `art-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const payload = {
      title: String(body.title || '').trim().slice(0, 240),
      slug: String(body.slug || '').trim().slice(0, 180),
      categoryId: String(body.categoryId || '').trim(),
      categoryName: String(body.categoryName || '').trim().slice(0, 120),
      sectionType: ['procedure', 'guide', 'news'].includes(body.sectionType) ? body.sectionType : 'procedure',
      shortDescription: String(body.shortDescription || '').trim().slice(0, 600),
      coverImage: String(body.coverImage || '').trim().slice(0, 2048),
      contentHtml: String(body.contentHtml || '').slice(0, 500000),
      attachments: Array.isArray(body.attachments) ? body.attachments.slice(0, 20) : [],
      keywords: Array.isArray(body.keywords) ? body.keywords.slice(0, 15) : [],
      status: ['draft', 'published', 'hidden'].includes(body.status) ? body.status : 'draft',
      publishedDate: String(body.publishedDate || new Date().toISOString().slice(0, 10)),
      authorId: officer.id,
      authorName: officer.ownerName,
      isSample: Boolean(body.isSample),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await adminDb!.collection('articles').doc(id).set(payload);
    await adminDb!.collection('activityLogs').add({
      actorName: officer.ownerName,
      actorType: 'passcode_officer',
      actorId: officer.id,
      action: payload.status === 'published' ? 'Đăng tải bài viết mới' : 'Tạo bản nháp bài viết',
      targetType: 'article',
      targetTitle: payload.title,
      details: `Trạng thái: ${payload.status} · Danh mục: ${payload.categoryName}`,
      createdAt: FieldValue.serverTimestamp(),
    });
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Lỗi tạo bài viết.' });
  }
});

app.put('/api/officer/articles/:id', requireOfficerSession, async (req, res) => {
  try {
    const officer = (req as express.Request & { officer: { id: string; ownerName: string } }).officer;
    const { id } = req.params;
    const body = req.body;
    const ref = adminDb!.collection('articles').doc(id);
    const snap = await ref.get();
    if (!snap.exists) {
      res.status(404).json({ error: 'Không tìm thấy bài viết.' });
      return;
    }
    const updatePayload = {
      title: String(body.title || '').trim().slice(0, 240),
      slug: String(body.slug || '').trim().slice(0, 180),
      categoryId: String(body.categoryId || '').trim(),
      categoryName: String(body.categoryName || '').trim().slice(0, 120),
      sectionType: ['procedure', 'guide', 'news'].includes(body.sectionType) ? body.sectionType : 'procedure',
      shortDescription: String(body.shortDescription || '').trim().slice(0, 600),
      coverImage: String(body.coverImage || '').trim().slice(0, 2048),
      contentHtml: String(body.contentHtml || '').slice(0, 500000),
      attachments: Array.isArray(body.attachments) ? body.attachments.slice(0, 20) : [],
      keywords: Array.isArray(body.keywords) ? body.keywords.slice(0, 15) : [],
      status: ['draft', 'published', 'hidden'].includes(body.status) ? body.status : 'draft',
      publishedDate: String(body.publishedDate || new Date().toISOString().slice(0, 10)),
      isSample: Boolean(body.isSample),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await ref.update(updatePayload);
    await adminDb!.collection('activityLogs').add({
      actorName: officer.ownerName,
      actorType: 'passcode_officer',
      actorId: officer.id,
      action: 'Cập nhật bài viết',
      targetType: 'article',
      targetTitle: updatePayload.title,
      details: `Trạng thái: ${updatePayload.status}`,
      createdAt: FieldValue.serverTimestamp(),
    });
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Lỗi cập nhật bài viết.' });
  }
});

app.delete('/api/officer/articles/:id', requireOfficerSession, async (req, res) => {
  try {
    const officer = (req as express.Request & { officer: { id: string; ownerName: string } }).officer;
    const { id } = req.params;
    const ref = adminDb!.collection('articles').doc(id);
    const snap = await ref.get();
    const title = snap.exists ? snap.data()?.title || id : id;
    await ref.delete();
    await adminDb!.collection('activityLogs').add({
      actorName: officer.ownerName,
      actorType: 'passcode_officer',
      actorId: officer.id,
      action: 'Xóa bài viết',
      targetType: 'article',
      targetTitle: title,
      details: `Đã xóa bài viết (${id})`,
      createdAt: FieldValue.serverTimestamp(),
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Lỗi xóa bài viết.' });
  }
});

app.get('/api/officer/categories', requireOfficerSession, async (_req, res) => {
  try {
    const snap = await adminDb!.collection('categories').orderBy('order', 'asc').get();
    res.json({ items: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Lỗi tải danh mục.' });
  }
});

app.post('/api/officer/categories', requireOfficerSession, async (req, res) => {
  try {
    const officer = (req as express.Request & { officer: { id: string; ownerName: string } }).officer;
    const body = req.body;
    const id = `cat-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const payload = {
      name: String(body.name || '').trim().slice(0, 120),
      slug: String(body.slug || '').trim().slice(0, 120),
      description: String(body.description || '').trim().slice(0, 400),
      order: Number(body.order || 0),
      isVisible: Boolean(body.isVisible ?? true),
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await adminDb!.collection('categories').doc(id).set(payload);
    await adminDb!.collection('activityLogs').add({
      actorName: officer.ownerName,
      actorType: 'passcode_officer',
      actorId: officer.id,
      action: 'Thêm danh mục mới',
      targetType: 'category',
      targetTitle: payload.name,
      details: `Slug: ${payload.slug}`,
      createdAt: FieldValue.serverTimestamp(),
    });
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Lỗi thêm danh mục.' });
  }
});

app.put('/api/officer/categories/:id', requireOfficerSession, async (req, res) => {
  try {
    const officer = (req as express.Request & { officer: { id: string; ownerName: string } }).officer;
    const { id } = req.params;
    const body = req.body;
    const payload = {
      name: String(body.name || '').trim().slice(0, 120),
      slug: String(body.slug || '').trim().slice(0, 120),
      description: String(body.description || '').trim().slice(0, 400),
      order: Number(body.order || 0),
      isVisible: Boolean(body.isVisible ?? true),
      updatedAt: FieldValue.serverTimestamp(),
    };
    await adminDb!.collection('categories').doc(id).update(payload);
    await adminDb!.collection('activityLogs').add({
      actorName: officer.ownerName,
      actorType: 'passcode_officer',
      actorId: officer.id,
      action: 'Cập nhật danh mục',
      targetType: 'category',
      targetTitle: payload.name,
      details: `Hiển thị: ${payload.isVisible ? 'Có' : 'Ẩn'}`,
      createdAt: FieldValue.serverTimestamp(),
    });
    res.json({ id });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Lỗi cập nhật danh mục.' });
  }
});

app.delete('/api/officer/categories/:id', requireOfficerSession, async (req, res) => {
  try {
    const officer = (req as express.Request & { officer: { id: string; ownerName: string } }).officer;
    const { id } = req.params;
    const ref = adminDb!.collection('categories').doc(id);
    const snap = await ref.get();
    const name = snap.exists ? snap.data()?.name || id : id;
    await ref.delete();
    await adminDb!.collection('activityLogs').add({
      actorName: officer.ownerName,
      actorType: 'passcode_officer',
      actorId: officer.id,
      action: 'Xóa danh mục',
      targetType: 'category',
      targetTitle: name,
      details: `ID: ${id}`,
      createdAt: FieldValue.serverTimestamp(),
    });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Lỗi xóa danh mục.' });
  }
});

app.get('/api/officer/media', requireOfficerSession, async (_req, res) => {
  try {
    const snap = await adminDb!.collection('media').orderBy('createdAt', 'desc').get();
    res.json({ items: snap.docs.map((d) => ({ id: d.id, ...d.data() })) });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Lỗi tải thư viện tài nguyên.' });
  }
});

app.post('/api/officer/media', requireOfficerSession, async (req, res) => {
  try {
    const officer = (req as express.Request & { officer: { id: string; ownerName: string } }).officer;
    const body = req.body;
    const id = `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const payload = {
      name: String(body.name || 'Tài liệu').slice(0, 240),
      url: String(body.url || '').slice(0, 2048),
      storagePath: String(body.storagePath || '').slice(0, 512),
      mimeType: String(body.mimeType || 'application/octet-stream').slice(0, 120),
      sizeBytes: Number(body.sizeBytes || 0),
      kind: body.kind === 'document' ? 'document' : 'image',
      uploadedBy: officer.id,
      uploadedByName: officer.ownerName,
      createdAt: FieldValue.serverTimestamp(),
    };
    await adminDb!.collection('media').doc(id).set(payload);
    res.json({ id, ...payload });
  } catch (err) {
    res.status(500).json({ error: err instanceof Error ? err.message : 'Lỗi lưu thông tin tài nguyên.' });
  }
});

// --- Vite / Static SPA Serving ---
const PORT = Number(process.env.PORT) || 3000;

async function startServer() {
  const httpServer = http.createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const hmrDisabled = process.env.DISABLE_HMR === 'true';
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        ws: { server: httpServer },
        hmr: hmrDisabled ? false : { server: httpServer },
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.join(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`[Portal Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
