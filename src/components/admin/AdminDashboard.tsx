import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { signOut } from 'firebase/auth';
import {
  BookCheck,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FolderTree,
  HelpCircle,
  History,
  Image as ImageIcon,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Plus,
  Scale,
  Search,
  Settings,
  Trash2,
  X,
} from 'lucide-react';
import { OFFICIAL_LOGO_URL } from '../../constants/defaults';
import { auth } from '../../lib/firebase';
import {
  deleteArticle,
  fetchActivityLogs,
  fetchAllArticles,
  fetchAllCategories,
  fetchAllFaqs,
  fetchAllLegalDocuments,
  fetchAllProcedures,
  fetchAuthorizedAdmins,
  fetchMediaAssets,
  fetchPasscodes,
  saveArticle,
} from '../../services/portalService';
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
} from '../../types/portal';
import {
  formatDateTimeVi,
  formatDateVi,
  getTodayIsoDate,
  parseFirestoreErrorMessage,
} from '../../utils/formatters';
import { ConfirmModal, useToast } from '../ui/Feedback';
import { ActivityLogsView } from './ActivityLogsView';
import { ArticleEditor } from './ArticleEditor';
import { CategoryManager } from './CategoryManager';
import { FaqManager } from './FaqManager';
import { LegalDocManager } from './LegalDocManager';
import { MediaManager } from './MediaManager';
import { PasscodeManager } from './PasscodeManager';
import { ProcedureManager } from './ProcedureManager';
import { SiteSettingsManager } from './SiteSettingsManager';

type AdminSection =
  | 'overview'
  | 'procedures'
  | 'legalDocs'
  | 'faqs'
  | 'articles'
  | 'editor'
  | 'categories'
  | 'media'
  | 'passcodes'
  | 'settings'
  | 'logs';

interface AdminDashboardProps {
  session: AdminSession;
  settings: SiteSettings;
  onReloadPublicData: () => Promise<void>;
  onLogout: () => void;
  onOpenPublicPortal: () => void;
}

export function AdminDashboard({
  session,
  settings,
  onReloadPublicData,
  onLogout,
  onOpenPublicPortal,
}: AdminDashboardProps) {
  const { showToast } = useToast();
  const canEdit = !session.isReadOnly && session.role !== 'viewer';
  const [activeSection, setActiveSection] = useState<AdminSection>('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [procedures, setProcedures] = useState<ProcedureGuide[]>([]);
  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [mediaList, setMediaList] = useState<MediaAsset[]>([]);
  const [passcodes, setPasscodes] = useState<PasscodeAccount[]>([]);
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const hasLoadedOnceRef = useRef(false);

  const [adminSdkReady, setAdminSdkReady] = useState(false);
  const [adminSdkMessage, setAdminSdkMessage] = useState('');

  // Articles filters
  const [articleSearch, setArticleSearch] = useState('');
  const [articleStatusFilter, setArticleStatusFilter] = useState<'all' | 'published' | 'draft' | 'hidden'>('all');
  const [editingArticle, setEditingArticle] = useState<Article | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Article | null>(null);
  const [deletingArticle, setDeletingArticle] = useState(false);

  const loadAdminData = useCallback(async () => {
    if (!hasLoadedOnceRef.current) {
      setLoading(true);
    }
    try {
      const [arts, cats, med, healthRes] = await Promise.all([
        fetchAllArticles(session),
        fetchAllCategories(session),
        fetchMediaAssets(session),
        fetch('/api/health').then((r) => r.json()).catch(() => ({ adminSdkReady: false })),
      ]);
      setArticles(arts);
      setCategories(cats);
      setMediaList(med);
      setAdminSdkReady(Boolean(healthRes.adminSdkReady));
      setAdminSdkMessage(String(healthRes.adminSdkStatusMessage || ''));

      if (session.mode === 'google') {
        const [procRes, docRes, faqRes] = await Promise.allSettled([
          fetchAllProcedures(),
          fetchAllLegalDocuments(),
          fetchAllFaqs(),
        ]);
        if (procRes.status === 'fulfilled') setProcedures(procRes.value);
        if (docRes.status === 'fulfilled') setLegalDocs(docRes.value);
        if (faqRes.status === 'fulfilled') setFaqs(faqRes.value);
      }

      if (session.isSuperAdmin) {
        const [pcRes, admRes, logsRes] = await Promise.allSettled([
          fetchPasscodes(),
          fetchAuthorizedAdmins(),
          fetchActivityLogs(),
        ]);
        if (pcRes.status === 'fulfilled') setPasscodes(pcRes.value);
        if (admRes.status === 'fulfilled') setAdmins(admRes.value);
        if (logsRes.status === 'fulfilled') setLogs(logsRes.value);

        const firstFailure = [pcRes, admRes, logsRes].find(
          (r): r is PromiseRejectedResult => r.status === 'rejected'
        );
        if (firstFailure) {
          showToast(
            'error',
            'Không thể tải một phần dữ liệu quản trị',
            parseFirestoreErrorMessage(firstFailure.reason)
          );
        }
      }
      hasLoadedOnceRef.current = true;
    } catch (err) {
      showToast('error', 'Lỗi tải dữ liệu quản trị', parseFirestoreErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [session, showToast]);

  useEffect(() => {
    void loadAdminData();
  }, [loadAdminData]);

  const handleSignOut = async () => {
    if (session.mode === 'google') {
      await signOut(auth);
    } else {
      await fetch('/api/auth/passcode-logout', { method: 'POST' });
    }
    onLogout();
  };

  const handleToggleArticleStatus = async (art: Article) => {
    if (!canEdit) return;
    const nextStatus = art.status === 'published' ? 'hidden' : 'published';
    try {
      await saveArticle(
        session,
        {
          title: art.title,
          slug: art.slug,
          categoryId: art.categoryId,
          categoryName: art.categoryName,
          sectionType: art.sectionType,
          shortDescription: art.shortDescription,
          coverImage: art.coverImage,
          contentHtml: art.contentHtml,
          attachments: art.attachments,
          keywords: art.keywords,
          status: nextStatus,
          publishedDate: art.publishedDate || getTodayIsoDate(),
          isSample: art.isSample,
        },
        art.id
      );
      showToast(
        'success',
        nextStatus === 'published' ? 'Đã xuất bản bài viết' : 'Đã ẩn bài viết',
        art.title
      );
      await loadAdminData();
      await onReloadPublicData();
    } catch (err) {
      showToast('error', 'Không thể cập nhật trạng thái', parseFirestoreErrorMessage(err));
    }
  };

  const handleConfirmDeleteArticle = async () => {
    if (!deleteTarget || !canEdit) return;
    setDeletingArticle(true);
    try {
      await deleteArticle(session, deleteTarget);
      showToast('success', 'Đã xóa bài viết', deleteTarget.title);
      setDeleteTarget(null);
      await loadAdminData();
      await onReloadPublicData();
    } catch (err) {
      showToast('error', 'Xóa bài viết thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setDeletingArticle(false);
    }
  };

  const stats = useMemo(() => {
    const published = articles.filter((a) => a.status === 'published').length;
    const latestArticle = articles[0];
    return {
      totalProcedures: procedures.length,
      totalLegalDocs: legalDocs.length,
      totalFaqs: faqs.length,
      totalArticles: articles.length,
      publishedArticles: published,
      passcodesCount: passcodes.length,
      lastUpdated: latestArticle?.updatedAtIso || latestArticle?.publishedDate || '',
    };
  }, [procedures, legalDocs, faqs, articles, passcodes]);

  const filteredArticles = useMemo(() => {
    const q = articleSearch.trim().toLowerCase();
    return articles.filter((a) => {
      if (articleStatusFilter !== 'all' && a.status !== articleStatusFilter) return false;
      if (!q) return true;
      return (
        a.title.toLowerCase().includes(q) ||
        a.categoryName.toLowerCase().includes(q) ||
        a.authorName.toLowerCase().includes(q)
      );
    });
  }, [articles, articleSearch, articleStatusFilter]);

  const navItems: {
    id: AdminSection;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    superAdminOnly?: boolean;
  }[] = [
    { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
    { id: 'procedures', label: 'Thủ tục GPLX (15 mục)', icon: BookCheck },
    { id: 'legalDocs', label: 'Văn bản pháp luật', icon: Scale },
    { id: 'faqs', label: 'Hỏi đáp (FAQ)', icon: HelpCircle },
    { id: 'articles', label: 'Tin tức & Bài viết', icon: FileText },
    { id: 'categories', label: 'Quản lý danh mục', icon: FolderTree },
    { id: 'media', label: 'Hình ảnh & Tài liệu', icon: ImageIcon },
    { id: 'passcodes', label: 'Phân quyền & Passcode', icon: KeyRound, superAdminOnly: true },
    { id: 'settings', label: 'Cài đặt & Liên hệ', icon: Settings, superAdminOnly: true },
    { id: 'logs', label: 'Lịch sử cập nhật', icon: History, superAdminOnly: true },
  ];

  const visibleNavItems = navItems.filter(
    (item) => !item.superAdminOnly || session.isSuperAdmin
  );

  const roleDisplayName =
    session.role === 'super_admin'
      ? 'Quản trị viên'
      : session.role === 'viewer'
        ? 'Người xem (Chỉ đọc)'
        : 'Biên tập viên';

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#0B1F3A] text-slate-200 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={settings.logoUrl || OFFICIAL_LOGO_URL}
              alt="CSGT"
              referrerPolicy="no-referrer"
              className="h-9 w-9 object-contain shrink-0"
            />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-blue-200 uppercase truncate">
                Phòng CSGT Đà Nẵng
              </p>
              <p className="text-sm font-bold text-white truncate">Quản trị Cổng GPLX</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-300 hover:text-white p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon;
            const active =
              activeSection === item.id ||
              (activeSection === 'editor' && item.id === 'articles');
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveSection(item.id);
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  active
                    ? 'bg-blue-700 text-white font-semibold'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-3">
          <div className="rounded-lg bg-white/5 px-3 py-2.5 text-xs">
            <p className="font-semibold text-white truncate">{session.displayName}</p>
            <p className="text-blue-200 mt-0.5">{roleDisplayName}</p>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 rounded-lg border border-white/15 px-3 py-2 text-xs font-semibold text-slate-200 hover:bg-white/10 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Mở menu quản trị"
              className="lg:hidden rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="text-sm font-semibold text-slate-800 truncate">
              Cổng hướng dẫn thủ tục GPLX · Phân hệ Quản trị
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={onOpenPublicPortal}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer whitespace-nowrap"
            >
              <ExternalLink className="h-4 w-4 text-blue-700" />
              <span className="hidden sm:inline">Xem trang công khai</span>
              <span className="sm:hidden">Trang chủ</span>
            </button>
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  setEditingArticle(null);
                  setActiveSection('editor');
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F3A] px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer whitespace-nowrap"
              >
                <Plus className="h-4 w-4" />
                <span>Đăng bài mới</span>
              </button>
            )}
          </div>
        </header>

        {/* Viewport Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {!canEdit && (
            <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-xs sm:text-sm text-amber-900">
              Bạn đang đăng nhập với quyền <strong>Người xem (Chỉ đọc)</strong>. Hệ thống chỉ cho phép xem và kiểm tra dữ liệu; mọi thao tác thêm, sửa, xóa đều bị khóa.
            </div>
          )}

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-28 rounded-xl bg-white border border-slate-200" />
              ))}
            </div>
          ) : activeSection === 'overview' ? (
            <div className="space-y-8">
              <div>
                <h1 className="text-2xl font-bold text-[#0B1F3A]">Tổng quan hệ thống</h1>
                <p className="text-sm text-slate-600 mt-0.5">
                  Quản lý 8 thủ tục GPLX, văn bản pháp luật, hỏi đáp, bài viết chuyên đề và phân quyền quản trị.
                </p>
              </div>

              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-medium text-slate-500">Thủ tục GPLX trong DB</p>
                  <p className="mt-2 text-2xl font-extrabold text-[#0B1F3A] font-mono tabular-nums">
                    {stats.totalProcedures}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-medium text-slate-500">Văn bản pháp luật DB</p>
                  <p className="mt-2 text-2xl font-extrabold text-[#0B1F3A] font-mono tabular-nums">
                    {stats.totalLegalDocs}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-medium text-slate-500">Câu hỏi FAQ DB</p>
                  <p className="mt-2 text-2xl font-extrabold text-[#0B1F3A] font-mono tabular-nums">
                    {stats.totalFaqs}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-medium text-slate-500">Bài viết / Thông báo</p>
                  <p className="mt-2 text-2xl font-extrabold text-emerald-700 font-mono tabular-nums">
                    {stats.publishedArticles} / {stats.totalArticles}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-5">
                  <p className="text-xs font-medium text-slate-500">Cập nhật gần nhất</p>
                  <p className="mt-2 text-sm font-bold text-slate-800 font-mono tabular-nums">
                    {stats.lastUpdated ? formatDateVi(stats.lastUpdated) : 'Đang vận hành'}
                  </p>
                </div>
              </div>

              {/* Quick Actions + Recent Articles */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200">
                    <h2 className="text-sm font-bold text-[#0B1F3A]">Bài viết & Thông báo gần đây</h2>
                    <button
                      type="button"
                      onClick={() => setActiveSection('articles')}
                      className="text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                    >
                      Xem tất cả
                    </button>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {articles.length === 0 ? (
                      <div className="p-8 text-center text-sm text-slate-500">
                        Chưa có bài viết nào.
                      </div>
                    ) : (
                      articles.slice(0, 6).map((art) => (
                        <div
                          key={art.id}
                          className="flex items-center justify-between gap-4 px-5 py-3.5 hover:bg-slate-50"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 truncate">
                              {art.title}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {art.categoryName} · {art.status === 'published' ? 'Đã xuất bản' : art.status === 'draft' ? 'Bản nháp' : 'Đã ẩn'} · {formatDateVi(art.updatedAtIso || art.publishedDate)}
                            </p>
                          </div>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => {
                                setEditingArticle(art);
                                setActiveSection('editor');
                              }}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 shrink-0 cursor-pointer"
                            >
                              Chỉnh sửa
                            </button>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 space-y-4">
                  <h2 className="text-sm font-bold text-[#0B1F3A] border-b border-slate-100 pb-2.5">
                    Lối tắt quản trị
                  </h2>
                  <div className="space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setActiveSection('procedures')}
                      className="w-full flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-semibold text-[#0B1F3A] hover:bg-slate-50 cursor-pointer"
                    >
                      <span>Quản lý 8 thủ tục GPLX</span>
                      <BookCheck className="h-4 w-4 text-blue-700" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection('legalDocs')}
                      className="w-full flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <span>Quản lý văn bản pháp luật</span>
                      <Scale className="h-4 w-4 text-slate-500" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveSection('faqs')}
                      className="w-full flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <span>Quản lý Hỏi đáp (FAQ)</span>
                      <HelpCircle className="h-4 w-4 text-slate-500" />
                    </button>
                    {session.isSuperAdmin && (
                      <button
                        type="button"
                        onClick={() => setActiveSection('passcodes')}
                        className="w-full flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <span>Phân quyền & Passcode ({stats.passcodesCount})</span>
                        <KeyRound className="h-4 w-4 text-slate-500" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : activeSection === 'procedures' ? (
            <ProcedureManager
              session={session}
              procedures={procedures}
              onReload={async () => {
                await loadAdminData();
                await onReloadPublicData();
              }}
            />
          ) : activeSection === 'legalDocs' ? (
            <LegalDocManager
              session={session}
              documents={legalDocs}
              onReload={async () => {
                await loadAdminData();
                await onReloadPublicData();
              }}
            />
          ) : activeSection === 'faqs' ? (
            <FaqManager
              session={session}
              faqs={faqs}
              procedures={procedures}
              onReload={async () => {
                await loadAdminData();
                await onReloadPublicData();
              }}
            />
          ) : activeSection === 'articles' ? (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-[#0B1F3A]">Quản lý Tin tức & Bài viết</h2>
                  <p className="text-sm text-slate-600 mt-0.5">
                    Đăng tải thông báo, lịch kiểm tra phục hồi điểm hằng tháng và bài viết hướng dẫn.
                  </p>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingArticle(null);
                      setActiveSection('editor');
                    }}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Tạo bài viết mới</span>
                  </button>
                )}
              </div>

              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    placeholder="Tìm theo tiêu đề, danh mục, người đăng..."
                    className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-700 focus:outline-none"
                  />
                </div>
                <select
                  value={articleStatusFilter}
                  onChange={(e) =>
                    setArticleStatusFilter(
                      e.target.value as 'all' | 'published' | 'draft' | 'hidden'
                    )
                  }
                  className="rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800"
                >
                  <option value="all">Tất cả trạng thái</option>
                  <option value="published">Đã xuất bản</option>
                  <option value="draft">Bản nháp</option>
                  <option value="hidden">Đã ẩn</option>
                </select>
              </div>

              {/* Articles Table */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
                        <th className="py-3 px-4">Tiêu đề bài viết</th>
                        <th className="py-3 px-4">Danh mục</th>
                        <th className="py-3 px-4">Trạng thái</th>
                        <th className="py-3 px-4">Ngày cập nhật</th>
                        {canEdit && <th className="py-3 px-4 text-right">Thao tác</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {filteredArticles.length === 0 ? (
                        <tr>
                          <td colSpan={canEdit ? 5 : 4} className="py-12 text-center text-slate-500">
                            Không có bài viết nào phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredArticles.map((art) => (
                          <tr key={art.id} className="hover:bg-slate-50/70">
                            <td className="py-3.5 px-4 max-w-md">
                              <p className="font-semibold text-slate-900 line-clamp-1">
                                {art.title}
                              </p>
                              <p className="text-xs text-slate-500 mt-0.5 font-mono truncate">
                                /bai-viet/{art.slug} · Tác giả: {art.authorName}
                              </p>
                            </td>
                            <td className="py-3.5 px-4 text-xs font-medium text-slate-700">
                              {art.categoryName}
                            </td>
                            <td className="py-3.5 px-4 text-xs font-semibold">
                              {art.status === 'published' ? (
                                <span className="text-emerald-700">Đã xuất bản</span>
                              ) : art.status === 'draft' ? (
                                <span className="text-amber-700">Bản nháp</span>
                              ) : (
                                <span className="text-slate-500">Đã ẩn</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-xs font-mono tabular-nums text-slate-600 whitespace-nowrap">
                              {formatDateTimeVi(art.updatedAtIso || art.publishedDate)}
                            </td>
                            {canEdit && (
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    title={art.status === 'published' ? 'Ẩn bài viết' : 'Xuất bản công khai'}
                                    onClick={() => handleToggleArticleStatus(art)}
                                    className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                                  >
                                    {art.status === 'published' ? (
                                      <EyeOff className="h-3.5 w-3.5" />
                                    ) : (
                                      <Eye className="h-3.5 w-3.5 text-emerald-700" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    title="Chỉnh sửa"
                                    onClick={() => {
                                      setEditingArticle(art);
                                      setActiveSection('editor');
                                    }}
                                    className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                                  >
                                    <Pencil className="h-3.5 w-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    title="Xóa bài viết"
                                    onClick={() => setDeleteTarget(art)}
                                    className="p-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeSection === 'editor' && canEdit ? (
            <ArticleEditor
              session={session}
              categories={categories}
              editingArticle={editingArticle}
              onCategoriesReload={loadAdminData}
              onSaved={async () => {
                setEditingArticle(null);
                setActiveSection('articles');
                await loadAdminData();
                await onReloadPublicData();
              }}
              onCancel={() => {
                setEditingArticle(null);
                setActiveSection('articles');
              }}
            />
          ) : activeSection === 'categories' ? (
            <CategoryManager
              session={session}
              categories={categories}
              onReload={async () => {
                await loadAdminData();
                await onReloadPublicData();
              }}
            />
          ) : activeSection === 'media' ? (
            <MediaManager
              session={session}
              mediaList={mediaList}
              onReload={loadAdminData}
            />
          ) : activeSection === 'passcodes' && session.isSuperAdmin ? (
            <PasscodeManager
              session={session}
              passcodes={passcodes}
              admins={admins}
              adminSdkReady={adminSdkReady}
              onReload={loadAdminData}
            />
          ) : activeSection === 'settings' && session.isSuperAdmin ? (
            <SiteSettingsManager
              session={session}
              settings={settings}
              adminSdkReady={adminSdkReady}
              adminSdkMessage={adminSdkMessage}
              onSaved={async () => {
                await onReloadPublicData();
                await loadAdminData();
              }}
            />
          ) : activeSection === 'logs' && session.isSuperAdmin ? (
            <ActivityLogsView logs={logs} />
          ) : null}
        </main>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Xác nhận xóa bài viết"
        description={`Bạn có chắc chắn muốn xóa bài viết "${deleteTarget?.title}"? Dữ liệu sẽ bị xóa vĩnh viễn và không còn hiển thị cho người dân.`}
        confirmLabel="Xóa bài viết"
        loading={deletingArticle}
        onConfirm={handleConfirmDeleteArticle}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
