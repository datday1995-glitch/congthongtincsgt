import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { deleteObject, getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { DEFAULT_SITE_SETTINGS, SUGGESTED_CATEGORIES } from '../constants/defaults';
import {
  DEFAULT_FAQS,
  DEFAULT_LEGAL_DOCUMENTS,
  DEFAULT_PROCEDURE_GUIDES,
  ONLINE_DVC_URL,
} from '../data/gplxData';
import { auth, db, handleFirestoreError, OperationType, storage } from '../lib/firebase';
import type {
  ActivityLog,
  AdminSession,
  AdminUser,
  Article,
  Category,
  FaqItem,
  LegalDocument,
  MediaAsset,
  PasscodeAccount,
  ProcedureGuide,
  SiteSettings,
} from '../types/portal';
import { compressImageFile, makeSafeId, sanitizeRichHtml, toVietnameseSlug } from '../utils/formatters';

function assertCanEdit(session: AdminSession) {
  if (session.isReadOnly || session.role === 'viewer') {
    throw new Error('Tài khoản Người xem chỉ có quyền tra cứu, không có quyền chỉnh sửa dữ liệu.');
  }
}

function timestampToIso(val: unknown): string | undefined {
  if (!val) return undefined;
  if (typeof val === 'string') return val;
  if (val instanceof Date) {
    return Number.isNaN(val.getTime()) ? undefined : val.toISOString();
  }
  if (typeof val === 'object' && val !== null) {
    const obj = val as { toDate?: () => Date; seconds?: number; _seconds?: number };
    if (typeof obj.toDate === 'function') {
      const d = obj.toDate();
      return d && !Number.isNaN(d.getTime()) ? d.toISOString() : undefined;
    }
    const sec = typeof obj.seconds === 'number' ? obj.seconds : obj._seconds;
    if (typeof sec === 'number') {
      return new Date(sec * 1000).toISOString();
    }
  }
  return undefined;
}

function mapArticleDoc(id: string, data: Record<string, unknown>): Article {
  return {
    id,
    title: String(data.title || ''),
    slug: String(data.slug || ''),
    categoryId: String(data.categoryId || ''),
    categoryName: String(data.categoryName || ''),
    sectionType: (data.sectionType as Article['sectionType']) || 'procedure',
    shortDescription: String(data.shortDescription || ''),
    coverImage: String(data.coverImage || ''),
    contentHtml: String(data.contentHtml || ''),
    attachments: Array.isArray(data.attachments) ? data.attachments : [],
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    status: (data.status as Article['status']) || 'draft',
    publishedDate: String(data.publishedDate || ''),
    authorId: String(data.authorId || ''),
    authorName: String(data.authorName || ''),
    isSample: Boolean(data.isSample),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdAtIso: timestampToIso(data.createdAt),
    updatedAtIso: timestampToIso(data.updatedAt),
  };
}

// ===========================
// PUBLIC PORTAL READ QUERIES
// ===========================

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const path = 'siteSettings/main';
  try {
    const snap = await getDoc(doc(db, 'siteSettings', 'main'));
    if (!snap.exists()) {
      return DEFAULT_SITE_SETTINGS;
    }
    const data = snap.data();
    const rawSiteTitle = String(data.siteTitle || '');
    const rawBannerTitle = String(data.bannerTitle || '');
    const rawBannerSubtitle = String(data.bannerSubtitle || '');
    const isLegacyTitle =
      !rawSiteTitle ||
      rawSiteTitle === 'Cổng Thông Tin Hướng Dẫn Thủ Tục Giải Quyết Hành Chính';
    const isLegacyBanner =
      !rawBannerTitle ||
      rawBannerTitle === 'HƯỚNG DẪN THỦ TỤC GIẢI QUYẾT HÀNH CHÍNH' ||
      rawBannerTitle === 'HƯỚNG DẪN GIẢI QUYẾT THỦ TỤC HÀNH CHÍNH';
    const isLegacySub =
      !rawBannerSubtitle ||
      rawBannerSubtitle.includes('thực hiện các thủ tục hành chính một cách thuận tiện');

    return {
      ...DEFAULT_SITE_SETTINGS,
      ...data,
      siteTitle: isLegacyTitle ? DEFAULT_SITE_SETTINGS.siteTitle : rawSiteTitle,
      bannerTitle: isLegacyBanner ? DEFAULT_SITE_SETTINGS.bannerTitle : rawBannerTitle,
      bannerSubtitle: isLegacySub ? DEFAULT_SITE_SETTINGS.bannerSubtitle : rawBannerSubtitle,
      logoUrl: data.logoUrl || DEFAULT_SITE_SETTINGS.logoUrl,
      bannerUrl: data.bannerUrl || DEFAULT_SITE_SETTINGS.bannerUrl,
      updatedAtIso: timestampToIso(data.updatedAt),
    };
  } catch (err) {
    // Public visitors fall back cleanly if siteSettings/main does not exist yet
    console.warn('Site settings fallback:', path, err);
    return DEFAULT_SITE_SETTINGS;
  }
}

export async function fetchPublicCategories(): Promise<Category[]> {
  const path = 'categories';
  try {
    const q = query(collection(db, path), where('isVisible', '==', true));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Category, 'id'>) }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function fetchPublishedArticles(): Promise<Article[]> {
  const path = 'articles';
  try {
    const q = query(collection(db, path), where('status', '==', 'published'));
    const snap = await getDocs(q);
    const list = snap.docs.map((d) => mapArticleDoc(d.id, d.data() as Record<string, unknown>));
    return list.sort((a, b) => {
      const da = b.publishedDate || b.createdAtIso || '';
      const dbStr = a.publishedDate || a.createdAtIso || '';
      return da.localeCompare(dbStr);
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function fetchPublishedArticleBySlug(slug: string): Promise<Article | null> {
  const path = 'articles';
  try {
    const q = query(
      collection(db, path),
      where('status', '==', 'published'),
      where('slug', '==', slug),
      limit(1)
    );
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return mapArticleDoc(d.id, d.data() as Record<string, unknown>);
  } catch (err) {
    handleFirestoreError(err, OperationType.GET, `${path}/${slug}`);
  }
}

// ===========================
// ADMIN ACTIVITY LOGGER
// ===========================

export async function logActivity(
  session: AdminSession,
  entry: { action: string; targetType: string; targetTitle: string; details: string }
): Promise<void> {
  if (session.mode === 'passcode') return; // Logged server-side by officer routes
  const currentUid = auth.currentUser?.uid || session.uid;
  if (!currentUid) return;
  const id = makeSafeId('log');
  const path = `activityLogs/${id}`;
  try {
    await setDoc(doc(db, 'activityLogs', id), {
      actorName: (session.displayName || session.email || 'Quản trị viên').trim().slice(0, 120) || 'Quản trị viên',
      actorType: 'google_admin',
      actorId: currentUid,
      action: entry.action.slice(0, 120),
      targetType: entry.targetType.slice(0, 60),
      targetTitle: entry.targetTitle.slice(0, 240),
      details: entry.details.slice(0, 600),
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Activity log write skipped:', path, err);
  }
}

// ===========================
// ADMIN: ARTICLES
// ===========================

export async function fetchAllArticles(session: AdminSession): Promise<Article[]> {
  if (session.mode === 'passcode') {
    const res = await fetch('/api/officer/articles');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Không thể tải bài viết.');
    return json.items as Article[];
  }
  const path = 'articles';
  try {
    const snap = await getDocs(collection(db, path));
    const list = snap.docs.map((d) => mapArticleDoc(d.id, d.data() as Record<string, unknown>));
    return list.sort((a, b) => (b.updatedAtIso || '').localeCompare(a.updatedAtIso || ''));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export interface SaveArticleInput {
  title: string;
  slug: string;
  categoryId: string;
  categoryName: string;
  sectionType: Article['sectionType'];
  shortDescription: string;
  coverImage: string;
  contentHtml: string;
  attachments: Article['attachments'];
  keywords: string[];
  status: Article['status'];
  publishedDate: string;
  isSample: boolean;
}

export async function saveArticle(
  session: AdminSession,
  input: SaveArticleInput,
  existingId?: string
): Promise<string> {
  assertCanEdit(session);
  const cleanHtml = sanitizeRichHtml(input.contentHtml);
  const cleanSlug = toVietnameseSlug(input.slug || input.title) || `thu-tuc-${Date.now()}`;

  if (session.mode === 'passcode') {
    const url = existingId ? `/api/officer/articles/${existingId}` : '/api/officer/articles';
    const method = existingId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, slug: cleanSlug, contentHtml: cleanHtml }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Không thể lưu bài viết.');
    return json.id;
  }

  const id = existingId || makeSafeId('art');
  const path = `articles/${id}`;
  try {
    if (existingId) {
      await updateDoc(doc(db, 'articles', id), {
        title: input.title.trim().slice(0, 240),
        slug: cleanSlug.slice(0, 180),
        categoryId: input.categoryId,
        categoryName: input.categoryName.trim().slice(0, 120),
        sectionType: input.sectionType,
        shortDescription: input.shortDescription.trim().slice(0, 600),
        coverImage: input.coverImage.trim().slice(0, 2048),
        contentHtml: cleanHtml.slice(0, 500000),
        attachments: input.attachments.slice(0, 20),
        keywords: input.keywords.slice(0, 15),
        status: input.status,
        publishedDate: input.publishedDate,
        isSample: Boolean(input.isSample),
        updatedAt: serverTimestamp(),
      });
      await logActivity(session, {
        action: input.status === 'published' ? 'Cập nhật & Xuất bản bài viết' : 'Cập nhật bài viết',
        targetType: 'article',
        targetTitle: input.title,
        details: `Trạng thái: ${input.status} · Danh mục: ${input.categoryName}`,
      });
    } else {
      await setDoc(doc(db, 'articles', id), {
        title: input.title.trim().slice(0, 240),
        slug: cleanSlug.slice(0, 180),
        categoryId: input.categoryId,
        categoryName: input.categoryName.trim().slice(0, 120),
        sectionType: input.sectionType,
        shortDescription: input.shortDescription.trim().slice(0, 600),
        coverImage: input.coverImage.trim().slice(0, 2048),
        contentHtml: cleanHtml.slice(0, 500000),
        attachments: input.attachments.slice(0, 20),
        keywords: input.keywords.slice(0, 15),
        status: input.status,
        publishedDate: input.publishedDate,
        authorId: session.uid,
        authorName: session.displayName.slice(0, 120),
        isSample: Boolean(input.isSample),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await logActivity(session, {
        action: input.status === 'published' ? 'Đăng tải bài viết mới' : 'Lưu bản nháp bài viết',
        targetType: 'article',
        targetTitle: input.title,
        details: `Trạng thái: ${input.status} · Danh mục: ${input.categoryName}`,
      });
    }
    return id;
  } catch (err) {
    handleFirestoreError(err, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteArticle(session: AdminSession, article: Article): Promise<void> {
  assertCanEdit(session);
  if (session.mode === 'passcode') {
    const res = await fetch(`/api/officer/articles/${article.id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Không thể xóa bài viết.');
    return;
  }
  const path = `articles/${article.id}`;
  try {
    await deleteDoc(doc(db, 'articles', article.id));
    await logActivity(session, {
      action: 'Xóa bài viết',
      targetType: 'article',
      targetTitle: article.title,
      details: `ID: ${article.id}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ===========================
// ADMIN: CATEGORIES
// ===========================

export async function fetchAllCategories(session: AdminSession): Promise<Category[]> {
  if (session.mode === 'passcode') {
    const res = await fetch('/api/officer/categories');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Không thể tải danh mục.');
    return json.items as Category[];
  }
  const path = 'categories';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs
      .map((d) => ({ id: d.id, ...(d.data() as Omit<Category, 'id'>) }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveCategory(
  session: AdminSession,
  input: { name: string; slug: string; description: string; order: number; isVisible: boolean },
  existingId?: string
): Promise<string> {
  assertCanEdit(session);
  const cleanSlug = toVietnameseSlug(input.slug || input.name) || `danh-muc-${Date.now()}`;
  if (session.mode === 'passcode') {
    const url = existingId ? `/api/officer/categories/${existingId}` : '/api/officer/categories';
    const method = existingId ? 'PUT' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...input, slug: cleanSlug }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Không thể lưu danh mục.');
    return json.id;
  }

  const id = existingId || makeSafeId('cat');
  const path = `categories/${id}`;
  try {
    if (existingId) {
      await updateDoc(doc(db, 'categories', id), {
        name: input.name.trim().slice(0, 120),
        slug: cleanSlug.slice(0, 120),
        description: input.description.trim().slice(0, 400),
        order: Number(input.order) || 0,
        isVisible: Boolean(input.isVisible),
        updatedAt: serverTimestamp(),
      });
      await logActivity(session, {
        action: 'Cập nhật danh mục',
        targetType: 'category',
        targetTitle: input.name,
        details: `Hiển thị: ${input.isVisible ? 'Có' : 'Ẩn'}`,
      });
    } else {
      await setDoc(doc(db, 'categories', id), {
        name: input.name.trim().slice(0, 120),
        slug: cleanSlug.slice(0, 120),
        description: input.description.trim().slice(0, 400),
        order: Number(input.order) || 0,
        isVisible: Boolean(input.isVisible),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await logActivity(session, {
        action: 'Thêm danh mục mới',
        targetType: 'category',
        targetTitle: input.name,
        details: `Slug: ${cleanSlug}`,
      });
    }
    return id;
  } catch (err) {
    handleFirestoreError(err, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteCategory(session: AdminSession, category: Category): Promise<void> {
  assertCanEdit(session);
  if (session.mode === 'passcode') {
    const res = await fetch(`/api/officer/categories/${category.id}`, { method: 'DELETE' });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Không thể xóa danh mục.');
    return;
  }
  const path = `categories/${category.id}`;
  try {
    await deleteDoc(doc(db, 'categories', category.id));
    await logActivity(session, {
      action: 'Xóa danh mục',
      targetType: 'category',
      targetTitle: category.name,
      details: `ID: ${category.id}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function seedDefaultCategories(
  session: AdminSession,
  existingCategories: Category[] = []
): Promise<number> {
  const existingSlugs = new Set(existingCategories.map((c) => c.slug));
  let added = 0;
  for (const cat of SUGGESTED_CATEGORIES) {
    if (existingSlugs.has(cat.slug)) continue;
    await saveCategory(session, cat);
    added += 1;
  }
  return added;
}

// ===========================
// ADMIN: MEDIA & FILE UPLOADS
// ===========================

export async function uploadMediaFile(
  session: AdminSession,
  file: File,
  kind: 'image' | 'document'
): Promise<MediaAsset> {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const folder = kind === 'image' ? 'uploads/images' : 'uploads/documents';
  const storagePath = `${folder}/${Date.now()}-${safeName}`;

  let uploadBlob: Blob = file;
  if (kind === 'image') {
    try {
      uploadBlob = await compressImageFile(file);
    } catch {
      uploadBlob = file;
    }
  }

  let downloadUrl = '';
  try {
    const storageRef = ref(storage, storagePath);
    const snap = await uploadBytes(storageRef, uploadBlob, {
      contentType: uploadBlob.type || file.type || 'application/octet-stream',
    });
    downloadUrl = await getDownloadURL(snap.ref);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Không thể tải tệp lên Firebase Storage (${msg}). Vui lòng kiểm tra mục Storage trong Firebase Console đã được khởi tạo và cấp quyền ghi, hoặc dán trực tiếp liên kết tệp.`
    );
  }

  const assetMeta = {
    name: file.name.slice(0, 240),
    url: downloadUrl.slice(0, 2048),
    storagePath: storagePath.slice(0, 512),
    mimeType: (uploadBlob.type || file.type || 'application/octet-stream').slice(0, 120),
    sizeBytes: uploadBlob.size,
    kind,
  };

  if (session.mode === 'passcode') {
    const res = await fetch('/api/officer/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetMeta),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Không thể lưu thông tin tài nguyên.');
    return json as MediaAsset;
  }

  const id = makeSafeId('med');
  const path = `media/${id}`;
  try {
    await setDoc(doc(db, 'media', id), {
      ...assetMeta,
      uploadedBy: session.uid,
      uploadedByName: session.displayName.slice(0, 120),
      createdAt: serverTimestamp(),
    });
    return {
      id,
      ...assetMeta,
      uploadedBy: session.uid,
      uploadedByName: session.displayName,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function registerExternalMedia(
  session: AdminSession,
  input: { name: string; url: string; kind: 'image' | 'document' }
): Promise<MediaAsset> {
  const assetMeta = {
    name: input.name.trim().slice(0, 240),
    url: input.url.trim().slice(0, 2048),
    storagePath: '',
    mimeType: input.kind === 'image' ? 'image/external' : 'application/external',
    sizeBytes: 0,
    kind: input.kind,
  };

  if (session.mode === 'passcode') {
    const res = await fetch('/api/officer/media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(assetMeta),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Không thể lưu liên kết tài nguyên.');
    return json as MediaAsset;
  }

  const id = makeSafeId('med');
  const path = `media/${id}`;
  try {
    await setDoc(doc(db, 'media', id), {
      ...assetMeta,
      uploadedBy: session.uid,
      uploadedByName: session.displayName.slice(0, 120),
      createdAt: serverTimestamp(),
    });
    return {
      id,
      ...assetMeta,
      uploadedBy: session.uid,
      uploadedByName: session.displayName,
    };
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function fetchMediaAssets(session: AdminSession): Promise<MediaAsset[]> {
  if (session.mode === 'passcode') {
    const res = await fetch('/api/officer/media');
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Không thể tải danh sách tệp.');
    return json.items as MediaAsset[];
  }
  const path = 'media';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<MediaAsset, 'id'>) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function deleteMediaAsset(session: AdminSession, asset: MediaAsset): Promise<void> {
  if (session.mode === 'passcode') {
    throw new Error('Chỉ Quản trị viên chính hoặc biên tập viên Gmail mới được xóa tài nguyên khỏi kho lưu trữ.');
  }
  const path = `media/${asset.id}`;
  try {
    if (asset.storagePath) {
      try {
        await deleteObject(ref(storage, asset.storagePath));
      } catch {
        // Storage object may already be removed
      }
    }
    await deleteDoc(doc(db, 'media', asset.id));
    await logActivity(session, {
      action: 'Xóa tài nguyên hình ảnh/tài liệu',
      targetType: 'media',
      targetTitle: asset.name,
      details: `Loại: ${asset.kind}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ===========================
// SUPER ADMIN: SITE SETTINGS
// ===========================

export async function saveSiteSettings(
  session: AdminSession,
  settings: SiteSettings
): Promise<void> {
  const path = 'siteSettings/main';
  try {
    await setDoc(doc(db, 'siteSettings', 'main'), {
      siteTitle: settings.siteTitle.trim().slice(0, 200),
      agencyName: settings.agencyName.trim().slice(0, 160),
      departmentName: settings.departmentName.trim().slice(0, 160),
      logoUrl: settings.logoUrl.trim().slice(0, 2048),
      bannerUrl: settings.bannerUrl.trim().slice(0, 2048),
      bannerTitle: settings.bannerTitle.trim().slice(0, 200),
      bannerSubtitle: settings.bannerSubtitle.trim().slice(0, 500),
      address: settings.address.trim().slice(0, 300),
      phone: settings.phone.trim().slice(0, 40),
      facebookUrl: settings.facebookUrl.trim().slice(0, 500),
      websiteUrl: settings.websiteUrl.trim().slice(0, 500),
      introContent: settings.introContent.trim().slice(0, 5000),
      footerNote: settings.footerNote.trim().slice(0, 500),
      mapEmbedUrl: settings.mapEmbedUrl.trim().slice(0, 1000),
      updatedBy: session.uid,
      updatedAt: serverTimestamp(),
    });
    await logActivity(session, {
      action: 'Cập nhật cấu hình website',
      targetType: 'settings',
      targetTitle: settings.siteTitle,
      details: 'Cập nhật thông tin đơn vị, giao diện và liên hệ công khai.',
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ===========================
// SUPER ADMIN: PASSCODES
// ===========================

export async function fetchPasscodes(): Promise<PasscodeAccount[]> {
  const path = 'passcodes';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<PasscodeAccount, 'id'>) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

async function hashPasscodeClientPbkdf2(passcode: string): Promise<string> {
  if (typeof window === 'undefined' || !window.crypto?.subtle) {
    throw new Error('Trình duyệt không hỗ trợ mã hóa bảo mật Web Crypto.');
  }
  const salt = window.crypto.getRandomValues(new Uint8Array(16));
  const iterations = 100000;
  const keyMaterial = await window.crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(passcode),
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );
  const derivedBits = await window.crypto.subtle.deriveBits(
    { name: 'PBKDF2', salt, iterations, hash: 'SHA-256' },
    keyMaterial,
    256
  );
  return `pbkdf2$${iterations}$${bytesToHex(salt)}$${bytesToHex(new Uint8Array(derivedBits))}`;
}

async function hashPasscodeResilient(rawPasscode: string): Promise<string> {
  const trimmed = rawPasscode.trim();
  if (trimmed.length < 6) {
    throw new Error('Mã Passcode phải có ít nhất 6 ký tự.');
  }

  try {
    const hashRes = await fetch('/api/security/hash-passcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ passcode: trimmed }),
    });
    const rawText = await hashRes.text();
    let hashJson: { passcodeHash?: string; error?: string } | null = null;
    try {
      hashJson = JSON.parse(rawText) as { passcodeHash?: string; error?: string };
    } catch {
      hashJson = null;
    }

    if (hashRes.ok && hashJson?.passcodeHash) {
      return hashJson.passcodeHash;
    }
    if (hashRes.status === 400 && hashJson?.error) {
      throw new Error(hashJson.error);
    }
  } catch (err) {
    if (err instanceof Error && err.message.includes('ít nhất 6 ký tự')) {
      throw err;
    }
  }

  return hashPasscodeClientPbkdf2(trimmed);
}

export async function createPasscodeAccount(
  session: AdminSession,
  input: { ownerName: string; passcode: string; note: string; status: 'active' | 'locked' }
): Promise<string> {
  const firebaseUser = auth.currentUser;
  if (!firebaseUser) {
    throw new Error(
      'Phiên đăng nhập Google với Firebase chưa sẵn sàng hoặc đã hết hạn. Vui lòng đăng xuất và đăng nhập lại bằng Google.'
    );
  }

  const passcodeHash = await hashPasscodeResilient(input.passcode);
  const id = makeSafeId('pc');
  const path = `passcodes/${id}`;
  try {
    await setDoc(doc(db, 'passcodes', id), {
      ownerName: input.ownerName.trim().slice(0, 120),
      passcodeHash,
      note: input.note.trim().slice(0, 500),
      status: input.status,
      failedAttempts: 0,
      lockedUntil: '',
      lastLoginAt: '',
      createdBy: firebaseUser.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    await logActivity(session, {
      action: 'Tạo tài khoản Passcode mới',
      targetType: 'passcode',
      targetTitle: input.ownerName,
      details: `Trạng thái: ${input.status === 'active' ? 'Hoạt động' : 'Tạm khóa'}`,
    });
    return id;
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function updatePasscodeAccount(
  session: AdminSession,
  account: PasscodeAccount,
  updates: {
    ownerName?: string;
    newPasscode?: string;
    note?: string;
    status?: 'active' | 'locked';
  }
): Promise<void> {
  if (!auth.currentUser) {
    throw new Error(
      'Phiên đăng nhập Google với Firebase chưa sẵn sàng hoặc đã hết hạn. Vui lòng đăng xuất và đăng nhập lại bằng Google.'
    );
  }

  let passcodeHash = account.passcodeHash;
  if (updates.newPasscode && updates.newPasscode.trim().length > 0) {
    passcodeHash = await hashPasscodeResilient(updates.newPasscode);
  }

  const path = `passcodes/${account.id}`;
  try {
    await updateDoc(doc(db, 'passcodes', account.id), {
      ownerName: (updates.ownerName ?? account.ownerName).trim().slice(0, 120),
      passcodeHash,
      note: (updates.note ?? account.note).trim().slice(0, 500),
      status: updates.status ?? account.status,
      failedAttempts: updates.status === 'active' ? 0 : account.failedAttempts,
      lockedUntil: updates.status === 'active' ? '' : account.lockedUntil,
      lastLoginAt: account.lastLoginAt || '',
      updatedAt: serverTimestamp(),
    });
    await logActivity(session, {
      action: updates.newPasscode
        ? 'Đổi mã Passcode'
        : updates.status && updates.status !== account.status
          ? updates.status === 'locked'
            ? 'Khóa tài khoản Passcode'
            : 'Mở khóa tài khoản Passcode'
          : 'Cập nhật thông tin tài khoản Passcode',
      targetType: 'passcode',
      targetTitle: updates.ownerName ?? account.ownerName,
      details: `ID: ${account.id}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.UPDATE, path);
  }
}

export async function deletePasscodeAccount(
  session: AdminSession,
  account: PasscodeAccount
): Promise<void> {
  const path = `passcodes/${account.id}`;
  try {
    await deleteDoc(doc(db, 'passcodes', account.id));
    await logActivity(session, {
      action: 'Xóa tài khoản Passcode',
      targetType: 'passcode',
      targetTitle: account.ownerName,
      details: `Đã thu hồi và xóa vĩnh viễn (${account.id})`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

// ===========================
// SUPER ADMIN: GMAIL ADMINS & LOGS
// ===========================

export async function fetchAuthorizedAdmins(): Promise<AdminUser[]> {
  const path = 'admins';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<AdminUser, 'id'>) }));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export async function saveAuthorizedAdmin(
  session: AdminSession,
  input: { email: string; displayName: string; role: 'super_admin' | 'editor' | 'viewer'; status: 'active' | 'revoked' },
  isUpdate = false
): Promise<void> {
  assertCanEdit(session);
  const emailKey = input.email.trim().toLowerCase();
  const path = `admins/${emailKey}`;
  try {
    if (isUpdate) {
      await updateDoc(doc(db, 'admins', emailKey), {
        displayName: input.displayName.trim().slice(0, 120),
        role: input.role,
        status: input.status,
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(doc(db, 'admins', emailKey), {
        email: emailKey,
        displayName: input.displayName.trim().slice(0, 120),
        role: input.role,
        status: input.status,
        addedBy: session.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
    await logActivity(session, {
      action: isUpdate ? 'Cập nhật quyền tài khoản Gmail' : 'Cấp quyền quản trị Gmail',
      targetType: 'admin',
      targetTitle: emailKey,
      details: `Vai trò: ${input.role} · Trạng thái: ${input.status}`,
    });
  } catch (err) {
    handleFirestoreError(err, isUpdate ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteAuthorizedAdmin(session: AdminSession, emailKey: string): Promise<void> {
  const path = `admins/${emailKey}`;
  try {
    await deleteDoc(doc(db, 'admins', emailKey));
    await logActivity(session, {
      action: 'Thu hồi tài khoản Gmail quản trị',
      targetType: 'admin',
      targetTitle: emailKey,
      details: 'Đã xóa khỏi danh sách ủy quyền',
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function fetchActivityLogs(): Promise<ActivityLog[]> {
  const path = 'activityLogs';
  try {
    const q = query(collection(db, path), orderBy('createdAt', 'desc'), limit(150));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        actorName: String(data.actorName || ''),
        actorType: data.actorType === 'passcode_officer' ? 'passcode_officer' : 'google_admin',
        actorId: String(data.actorId || ''),
        action: String(data.action || ''),
        targetType: String(data.targetType || ''),
        targetTitle: String(data.targetTitle || ''),
        details: String(data.details || ''),
        createdAt: data.createdAt,
        createdAtIso: timestampToIso(data.createdAt),
      };
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

// ===========================
// GPLX PROCEDURES (STRUCTURED 15-FIELD GUIDES)
// ===========================

function mapProcedureDoc(id: string, data: Record<string, unknown>): ProcedureGuide {
  return {
    id,
    title: String(data.title || ''),
    slug: String(data.slug || ''),
    cardOrder: Number(data.cardOrder ?? 99),
    isCoreCard: Boolean(data.isCoreCard),
    iconKey: (data.iconKey as ProcedureGuide['iconKey']) || 'car',
    groupKey: (data.groupKey as ProcedureGuide['groupKey']) || 'cap-lan-dau',
    shortDescription: String(data.shortDescription || ''),
    intro: String(data.intro || ''),
    targetAudience: String(data.targetAudience || ''),
    conditions: String(data.conditions || ''),
    dossierItems: Array.isArray(data.dossierItems) ? data.dossierItems.map(String) : [],
    dossierQuantity: String(data.dossierQuantity || '01 bộ hồ sơ'),
    submissionMethods: Array.isArray(data.submissionMethods) ? data.submissionMethods.map(String) : [],
    receivingLocation: String(data.receivingLocation || ''),
    steps: Array.isArray(data.steps) ? (data.steps as ProcedureGuide['steps']) : [],
    processingTime: String(data.processingTime || ''),
    fees: String(data.fees || ''),
    result: String(data.result || ''),
    legalBasis: Array.isArray(data.legalBasis) ? data.legalBasis.map(String) : [],
    forms: Array.isArray(data.forms) ? (data.forms as ProcedureGuide['forms']) : [],
    faqs: Array.isArray(data.faqs) ? (data.faqs as ProcedureGuide['faqs']) : [],
    subCases: Array.isArray(data.subCases) ? (data.subCases as ProcedureGuide['subCases']) : [],
    referenceNotes: String(data.referenceNotes || ''),
    onlinePortalUrl: String(data.onlinePortalUrl || ONLINE_DVC_URL),
    keywords: Array.isArray(data.keywords) ? data.keywords.map(String) : [],
    status: (data.status as ProcedureGuide['status']) || 'published',
    isVerifiedSeed: Boolean(data.isVerifiedSeed),
    authorId: String(data.authorId || ''),
    authorName: String(data.authorName || ''),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdAtIso: timestampToIso(data.createdAt),
    updatedAtIso: timestampToIso(data.updatedAt),
  };
}

export async function fetchPublishedProcedures(): Promise<ProcedureGuide[]> {
  try {
    const q = query(collection(db, 'procedures'), where('status', '==', 'published'));
    const snap = await getDocs(q);
    const firestoreItems = snap.docs.map((d) => mapProcedureDoc(d.id, d.data() as Record<string, unknown>));
    if (firestoreItems.length === 0) {
      return DEFAULT_PROCEDURE_GUIDES;
    }
    const bySlug = new Map(firestoreItems.map((p) => [p.slug, p]));
    const merged: ProcedureGuide[] = [...firestoreItems];
    for (const seed of DEFAULT_PROCEDURE_GUIDES) {
      if (!bySlug.has(seed.slug)) {
        merged.push(seed);
      }
    }
    return merged.sort((a, b) => (a.cardOrder ?? 99) - (b.cardOrder ?? 99));
  } catch {
    return DEFAULT_PROCEDURE_GUIDES;
  }
}

export async function fetchAllProcedures(): Promise<ProcedureGuide[]> {
  const path = 'procedures';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs
      .map((d) => mapProcedureDoc(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => (a.cardOrder ?? 99) - (b.cardOrder ?? 99));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export type SaveProcedureInput = Omit<
  ProcedureGuide,
  'id' | 'authorId' | 'authorName' | 'createdAt' | 'updatedAt' | 'createdAtIso' | 'updatedAtIso'
>;

export async function saveProcedureGuide(
  session: AdminSession,
  input: SaveProcedureInput,
  existingId?: string
): Promise<string> {
  assertCanEdit(session);
  const cleanSlug = toVietnameseSlug(input.slug || input.title) || `thu-tuc-${Date.now()}`;
  const id = existingId || makeSafeId('proc');
  const path = `procedures/${id}`;
  const payload = {
    title: input.title.trim().slice(0, 240),
    slug: cleanSlug.slice(0, 180),
    cardOrder: Number(input.cardOrder) || 0,
    isCoreCard: Boolean(input.isCoreCard),
    iconKey: input.iconKey || 'car',
    groupKey: input.groupKey,
    shortDescription: input.shortDescription.trim().slice(0, 600),
    intro: input.intro.trim().slice(0, 4000),
    targetAudience: input.targetAudience.trim().slice(0, 4000),
    conditions: input.conditions.trim().slice(0, 6000),
    dossierItems: input.dossierItems.slice(0, 30),
    dossierQuantity: input.dossierQuantity.trim().slice(0, 300),
    submissionMethods: input.submissionMethods.slice(0, 15),
    receivingLocation: input.receivingLocation.trim().slice(0, 1200),
    steps: input.steps.slice(0, 20),
    processingTime: input.processingTime.trim().slice(0, 1200),
    fees: input.fees.trim().slice(0, 1200),
    result: input.result.trim().slice(0, 1200),
    legalBasis: input.legalBasis.slice(0, 30),
    forms: input.forms.slice(0, 20),
    faqs: input.faqs.slice(0, 30),
    subCases: input.subCases.slice(0, 20),
    referenceNotes: input.referenceNotes.trim().slice(0, 4000),
    onlinePortalUrl: (input.onlinePortalUrl || ONLINE_DVC_URL).trim().slice(0, 1000),
    keywords: input.keywords.slice(0, 25),
    status: input.status,
    isVerifiedSeed: Boolean(input.isVerifiedSeed),
  };

  try {
    if (existingId) {
      await updateDoc(doc(db, 'procedures', id), {
        ...payload,
        updatedAt: serverTimestamp(),
      });
      await logActivity(session, {
        action: 'Cập nhật thủ tục GPLX',
        targetType: 'procedure',
        targetTitle: payload.title,
        details: `Slug: ${payload.slug} · Trạng thái: ${payload.status}`,
      });
    } else {
      await setDoc(doc(db, 'procedures', id), {
        ...payload,
        authorId: session.uid,
        authorName: session.displayName.slice(0, 120),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await logActivity(session, {
        action: 'Thêm thủ tục GPLX mới',
        targetType: 'procedure',
        targetTitle: payload.title,
        details: `Slug: ${payload.slug} · Trạng thái: ${payload.status}`,
      });
    }
    return id;
  } catch (err) {
    handleFirestoreError(err, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteProcedureGuide(session: AdminSession, item: ProcedureGuide): Promise<void> {
  assertCanEdit(session);
  const path = `procedures/${item.id}`;
  try {
    await deleteDoc(doc(db, 'procedures', item.id));
    await logActivity(session, {
      action: 'Xóa thủ tục GPLX',
      targetType: 'procedure',
      targetTitle: item.title,
      details: `ID: ${item.id}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function seedDefaultProceduresToFirestore(
  session: AdminSession,
  existing: ProcedureGuide[]
): Promise<number> {
  assertCanEdit(session);
  const existingSlugs = new Set(existing.map((p) => p.slug));
  let added = 0;
  for (const seed of DEFAULT_PROCEDURE_GUIDES) {
    if (existingSlugs.has(seed.slug)) continue;
    await saveProcedureGuide(session, seed);
    added += 1;
  }
  return added;
}

// ===========================
// LEGAL DOCUMENTS
// ===========================

function mapLegalDoc(id: string, data: Record<string, unknown>): LegalDocument {
  return {
    id,
    docNumber: String(data.docNumber || ''),
    title: String(data.title || ''),
    docType: (data.docType as LegalDocument['docType']) || 'circular',
    issuedDate: String(data.issuedDate || ''),
    effectiveDate: String(data.effectiveDate || ''),
    issuingAuthority: String(data.issuingAuthority || ''),
    validityStatus: (data.validityStatus as LegalDocument['validityStatus']) || 'effective',
    summary: String(data.summary || ''),
    pdfUrl: String(data.pdfUrl || ''),
    relatedProcedureSlugs: Array.isArray(data.relatedProcedureSlugs) ? data.relatedProcedureSlugs.map(String) : [],
    status: (data.status as LegalDocument['status']) || 'published',
    authorId: String(data.authorId || ''),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdAtIso: timestampToIso(data.createdAt),
    updatedAtIso: timestampToIso(data.updatedAt),
  };
}

export async function fetchPublishedLegalDocuments(): Promise<LegalDocument[]> {
  try {
    const q = query(collection(db, 'legalDocuments'), where('status', '==', 'published'));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => mapLegalDoc(d.id, d.data() as Record<string, unknown>));
    if (items.length === 0) return DEFAULT_LEGAL_DOCUMENTS;
    const seen = new Set(items.map((d) => d.docNumber));
    return [...items, ...DEFAULT_LEGAL_DOCUMENTS.filter((d) => !seen.has(d.docNumber))];
  } catch {
    return DEFAULT_LEGAL_DOCUMENTS;
  }
}

export async function fetchAllLegalDocuments(): Promise<LegalDocument[]> {
  const path = 'legalDocuments';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs.map((d) => mapLegalDoc(d.id, d.data() as Record<string, unknown>));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export type SaveLegalDocInput = Omit<
  LegalDocument,
  'id' | 'authorId' | 'createdAt' | 'updatedAt' | 'createdAtIso' | 'updatedAtIso'
>;

export async function saveLegalDocument(
  session: AdminSession,
  input: SaveLegalDocInput,
  existingId?: string
): Promise<string> {
  assertCanEdit(session);
  const id = existingId || makeSafeId('doc');
  const path = `legalDocuments/${id}`;
  const payload = {
    docNumber: input.docNumber.trim().slice(0, 100),
    title: input.title.trim().slice(0, 400),
    docType: input.docType,
    issuedDate: input.issuedDate.trim().slice(0, 80),
    effectiveDate: input.effectiveDate.trim().slice(0, 80),
    issuingAuthority: input.issuingAuthority.trim().slice(0, 200),
    validityStatus: input.validityStatus,
    summary: input.summary.trim().slice(0, 2000),
    pdfUrl: input.pdfUrl.trim().slice(0, 2048),
    relatedProcedureSlugs: input.relatedProcedureSlugs.slice(0, 20),
    status: input.status,
  };
  try {
    if (existingId) {
      await updateDoc(doc(db, 'legalDocuments', id), { ...payload, updatedAt: serverTimestamp() });
      await logActivity(session, {
        action: 'Cập nhật văn bản pháp luật',
        targetType: 'legalDocument',
        targetTitle: `${payload.docNumber} - ${payload.title}`,
        details: `Hiệu lực: ${payload.validityStatus}`,
      });
    } else {
      await setDoc(doc(db, 'legalDocuments', id), {
        ...payload,
        authorId: session.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await logActivity(session, {
        action: 'Thêm văn bản pháp luật',
        targetType: 'legalDocument',
        targetTitle: `${payload.docNumber} - ${payload.title}`,
        details: `Cơ quan ban hành: ${payload.issuingAuthority}`,
      });
    }
    return id;
  } catch (err) {
    handleFirestoreError(err, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteLegalDocument(session: AdminSession, docItem: LegalDocument): Promise<void> {
  assertCanEdit(session);
  const path = `legalDocuments/${docItem.id}`;
  try {
    await deleteDoc(doc(db, 'legalDocuments', docItem.id));
    await logActivity(session, {
      action: 'Xóa văn bản pháp luật',
      targetType: 'legalDocument',
      targetTitle: `${docItem.docNumber} - ${docItem.title}`,
      details: `ID: ${docItem.id}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function seedDefaultLegalDocsToFirestore(
  session: AdminSession,
  existing: LegalDocument[]
): Promise<number> {
  assertCanEdit(session);
  const existingKeys = new Set(existing.map((d) => `${d.docNumber}::${d.title}`));
  let added = 0;
  for (const seed of DEFAULT_LEGAL_DOCUMENTS) {
    if (existingKeys.has(`${seed.docNumber}::${seed.title}`)) continue;
    await saveLegalDocument(session, seed);
    added += 1;
  }
  return added;
}

// ===========================
// FAQS
// ===========================

function mapFaqDoc(id: string, data: Record<string, unknown>): FaqItem {
  return {
    id,
    question: String(data.question || ''),
    answer: String(data.answer || ''),
    category: String(data.category || ''),
    relatedProcedureSlug: String(data.relatedProcedureSlug || ''),
    legalRef: String(data.legalRef || ''),
    order: Number(data.order ?? 0),
    status: (data.status as FaqItem['status']) || 'published',
    authorId: String(data.authorId || ''),
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    createdAtIso: timestampToIso(data.createdAt),
    updatedAtIso: timestampToIso(data.updatedAt),
  };
}

export async function fetchPublishedFaqs(): Promise<FaqItem[]> {
  try {
    const q = query(collection(db, 'faqs'), where('status', '==', 'published'));
    const snap = await getDocs(q);
    const items = snap.docs.map((d) => mapFaqDoc(d.id, d.data() as Record<string, unknown>));
    if (items.length === 0) return DEFAULT_FAQS;
    const seen = new Set(items.map((f) => f.question.trim().toLowerCase()));
    const merged = [
      ...items,
      ...DEFAULT_FAQS.filter((f) => !seen.has(f.question.trim().toLowerCase())),
    ];
    return merged.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch {
    return DEFAULT_FAQS;
  }
}

export async function fetchAllFaqs(): Promise<FaqItem[]> {
  const path = 'faqs';
  try {
    const snap = await getDocs(collection(db, path));
    return snap.docs
      .map((d) => mapFaqDoc(d.id, d.data() as Record<string, unknown>))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  } catch (err) {
    handleFirestoreError(err, OperationType.LIST, path);
  }
}

export type SaveFaqInput = Omit<
  FaqItem,
  'id' | 'authorId' | 'createdAt' | 'updatedAt' | 'createdAtIso' | 'updatedAtIso'
>;

export async function saveFaqItem(
  session: AdminSession,
  input: SaveFaqInput,
  existingId?: string
): Promise<string> {
  assertCanEdit(session);
  const id = existingId || makeSafeId('faq');
  const path = `faqs/${id}`;
  const payload = {
    question: input.question.trim().slice(0, 500),
    answer: input.answer.trim().slice(0, 4000),
    category: input.category.trim().slice(0, 120),
    relatedProcedureSlug: input.relatedProcedureSlug.trim().slice(0, 180),
    legalRef: input.legalRef.trim().slice(0, 400),
    order: Number(input.order) || 0,
    status: input.status,
  };
  try {
    if (existingId) {
      await updateDoc(doc(db, 'faqs', id), { ...payload, updatedAt: serverTimestamp() });
      await logActivity(session, {
        action: 'Cập nhật câu hỏi thường gặp',
        targetType: 'faq',
        targetTitle: payload.question,
        details: `Chuyên mục: ${payload.category}`,
      });
    } else {
      await setDoc(doc(db, 'faqs', id), {
        ...payload,
        authorId: session.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await logActivity(session, {
        action: 'Thêm câu hỏi thường gặp mới',
        targetType: 'faq',
        targetTitle: payload.question,
        details: `Chuyên mục: ${payload.category}`,
      });
    }
    return id;
  } catch (err) {
    handleFirestoreError(err, existingId ? OperationType.UPDATE : OperationType.CREATE, path);
  }
}

export async function deleteFaqItem(session: AdminSession, item: FaqItem): Promise<void> {
  assertCanEdit(session);
  const path = `faqs/${item.id}`;
  try {
    await deleteDoc(doc(db, 'faqs', item.id));
    await logActivity(session, {
      action: 'Xóa câu hỏi thường gặp',
      targetType: 'faq',
      targetTitle: item.question,
      details: `ID: ${item.id}`,
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function seedDefaultFaqsToFirestore(
  session: AdminSession,
  existing: FaqItem[]
): Promise<number> {
  assertCanEdit(session);
  const existingQ = new Set(existing.map((f) => f.question.trim().toLowerCase()));
  let added = 0;
  for (const seed of DEFAULT_FAQS) {
    if (existingQ.has(seed.question.trim().toLowerCase())) continue;
    await saveFaqItem(session, seed);
    added += 1;
  }
  return added;
}
