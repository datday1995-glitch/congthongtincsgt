import React, { Component, useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { AdminLogin } from './components/admin/AdminLogin';
import { FaqPage } from './components/public/FaqPage';
import { LegalDocsPage } from './components/public/LegalDocsPage';
import { ProcedureDetailPage } from './components/public/ProcedureDetailPage';
import { PublicArticleDetail } from './components/public/PublicArticleDetail';
import { PublicContactSection } from './components/public/PublicContactSection';
import { PublicFooter } from './components/public/PublicFooter';
import { PublicHeader } from './components/public/PublicHeader';
import { PublicHome } from './components/public/PublicHome';
import { SmartLookupPage } from './components/public/SmartLookupPage';
import { ToastProvider } from './components/ui/Feedback';
import { DEFAULT_SITE_SETTINGS } from './constants/defaults';
import { DEFAULT_FAQS, DEFAULT_LEGAL_DOCUMENTS, DEFAULT_PROCEDURE_GUIDES } from './data/gplxData';
import { auth, db, SUPER_ADMIN_EMAIL, testFirestoreConnection } from './lib/firebase';
import {
  fetchPublicCategories,
  fetchPublishedArticleBySlug,
  fetchPublishedArticles,
  fetchPublishedFaqs,
  fetchPublishedLegalDocuments,
  fetchPublishedProcedures,
  fetchSiteSettings,
} from './services/portalService';
import type {
  AdminRole,
  AdminSession,
  Article,
  Category,
  FaqItem,
  LegalDocument,
  ProcedureGuide,
  SiteSettings,
} from './types/portal';

class PortalErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean; message: string }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, message: error.message };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full rounded-xl border border-red-200 bg-white p-6 text-center shadow-sm">
            <h1 className="text-lg font-bold text-[#0B1F3A]">
              Đã xảy ra lỗi hiển thị hệ thống
            </h1>
            <p className="mt-2 text-sm text-slate-600 break-words">
              {this.state.message}
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-5 rounded-lg bg-[#0B1F3A] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer"
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function PortalRoot() {
  const [pathname, setPathname] = useState<string>(() => window.location.pathname || '/');
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [categories, setCategories] = useState<Category[]>([]);
  const [procedures, setProcedures] = useState<ProcedureGuide[]>(DEFAULT_PROCEDURE_GUIDES);
  const [legalDocs, setLegalDocs] = useState<LegalDocument[]>(DEFAULT_LEGAL_DOCUMENTS);
  const [faqs, setFaqs] = useState<FaqItem[]>(DEFAULT_FAQS);
  const [articles, setArticles] = useState<Article[]>([]);
  const [publicLoading, setPublicLoading] = useState(true);

  const [detailArticle, setDetailArticle] = useState<Article | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const [adminSession, setAdminSession] = useState<AdminSession | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [searchTrigger, setSearchTrigger] = useState(0);

  const navigate = useCallback((to: string) => {
    if (to === '/lien-he') {
      if (window.location.pathname !== '/' && window.location.pathname !== '/lien-he') {
        window.history.pushState({}, '', '/');
        setPathname('/');
        setTimeout(() => {
          document.getElementById('lien-he')?.scrollIntoView({ behavior: 'smooth' });
        }, 120);
      } else {
        window.history.pushState({}, '', '/lien-he');
        setPathname('/lien-he');
        document.getElementById('lien-he')?.scrollIntoView({ behavior: 'smooth' });
      }
      return;
    }

    if (window.location.pathname !== to) {
      window.history.pushState({}, '', to);
    }
    setPathname(to);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onPopState = () => {
      setPathname(window.location.pathname || '/');
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const loadPublicPortalData = useCallback(async () => {
    setPublicLoading(true);
    try {
      await testFirestoreConnection();
      const [
        loadedSettings,
        loadedCats,
        loadedArticles,
        loadedProcedures,
        loadedLegalDocs,
        loadedFaqs,
      ] = await Promise.all([
        fetchSiteSettings(),
        fetchPublicCategories(),
        fetchPublishedArticles(),
        fetchPublishedProcedures(),
        fetchPublishedLegalDocuments(),
        fetchPublishedFaqs(),
      ]);
      setSettings(loadedSettings);
      setCategories(loadedCats);
      setArticles(loadedArticles);
      setProcedures(loadedProcedures);
      setLegalDocs(loadedLegalDocs);
      setFaqs(loadedFaqs);
    } catch (err) {
      console.error('Failed to load public portal data:', err);
    } finally {
      setPublicLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPublicPortalData();
  }, [loadPublicPortalData]);

  // Monitor Auth State (Google Admin/Editor/Viewer + Passcode Session)
  useEffect(() => {
    let active = true;
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!active) return;
      if (user && user.emailVerified && user.email) {
        const email = user.email.toLowerCase();
        if (email === SUPER_ADMIN_EMAIL.toLowerCase()) {
          setAdminSession({
            mode: 'google',
            uid: user.uid,
            email,
            displayName: user.displayName || 'Quản trị viên chính',
            role: 'super_admin',
            isSuperAdmin: true,
            isReadOnly: false,
          });
          setAuthReady(true);
          return;
        }
        try {
          const snap = await getDoc(doc(db, 'admins', email));
          if (snap.exists() && snap.data()?.status === 'active') {
            const rawRole = snap.data()?.role;
            const role: AdminRole =
              rawRole === 'super_admin'
                ? 'super_admin'
                : rawRole === 'viewer'
                  ? 'viewer'
                  : 'editor';
            setAdminSession({
              mode: 'google',
              uid: user.uid,
              email,
              displayName: snap.data()?.displayName || user.displayName || email,
              role,
              isSuperAdmin: role === 'super_admin',
              isReadOnly: role === 'viewer',
            });
            setAuthReady(true);
            return;
          }
          await signOut(auth);
        } catch {
          // unauthorized
        }
      }

      // Fallback: check server-side Passcode session cookie
      try {
        const res = await fetch('/api/auth/passcode-session');
        const json = await res.json();
        if (active && json.session) {
          setAdminSession(json.session as AdminSession);
          setAuthReady(true);
          return;
        }
      } catch {
        // ignore
      }

      if (active) {
        setAdminSession(null);
        setAuthReady(true);
      }
    });

    return () => {
      active = false;
      unsub();
    };
  }, []);

  const procedureSlug =
    pathname.startsWith('/thu-tuc/') && pathname.length > '/thu-tuc/'.length
      ? pathname.slice('/thu-tuc/'.length).split('/')[0]
      : null;

  const articleSlug =
    pathname.startsWith('/bai-viet/') && pathname.length > '/bai-viet/'.length
      ? pathname.slice('/bai-viet/'.length).split('/')[0]
      : null;

  const matchedProcedure = procedureSlug
    ? procedures.find((p) => p.slug === procedureSlug) || null
    : null;

  const fallbackArticleSlug =
    articleSlug || (procedureSlug && !matchedProcedure ? procedureSlug : null);

  useEffect(() => {
    if (!fallbackArticleSlug) {
      setDetailArticle(null);
      return;
    }
    const cached = articles.find((a) => a.slug === fallbackArticleSlug);
    if (cached) {
      setDetailArticle(cached);
      return;
    }
    let cancelled = false;
    setDetailLoading(true);
    fetchPublishedArticleBySlug(fallbackArticleSlug)
      .then((found) => {
        if (!cancelled) setDetailArticle(found);
      })
      .catch(() => {
        if (!cancelled) setDetailArticle(null);
      })
      .finally(() => {
        if (!cancelled) setDetailLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [fallbackArticleSlug, articles]);

  // Dynamic Document Title
  useEffect(() => {
    if (pathname.startsWith('/admin')) {
      document.title = `Quản trị hệ thống – ${settings.departmentName}`;
    } else if (matchedProcedure) {
      document.title = `${matchedProcedure.title} – ${settings.departmentName}`;
    } else if (detailArticle) {
      document.title = `${detailArticle.title} – ${settings.departmentName}`;
    } else if (pathname === '/tra-cuu') {
      document.title = `Tra cứu thủ tục theo tình huống – ${settings.departmentName}`;
    } else if (pathname === '/van-ban') {
      document.title = `Văn bản pháp luật – ${settings.departmentName}`;
    } else if (pathname === '/hoi-dap') {
      document.title = `Hỏi đáp thủ tục GPLX – ${settings.departmentName}`;
    } else {
      document.title = `${settings.siteTitle} – ${settings.departmentName}`;
    }
  }, [pathname, matchedProcedure, detailArticle, settings]);

  // 1. ADMIN PORTAL (/admin)
  if (pathname === '/admin' || pathname.startsWith('/admin/')) {
    if (!authReady) {
      return (
        <div className="min-h-screen bg-slate-100 flex items-center justify-center text-sm text-slate-600">
          Đang kiểm tra phiên đăng nhập...
        </div>
      );
    }

    if (!adminSession) {
      return (
        <AdminLogin
          onSuccessSession={(sess) => setAdminSession(sess)}
          onBackToPublic={() => navigate('/')}
        />
      );
    }

    return (
      <AdminDashboard
        session={adminSession}
        settings={settings}
        onReloadPublicData={loadPublicPortalData}
        onLogout={() => setAdminSession(null)}
        onOpenPublicPortal={() => navigate('/')}
      />
    );
  }

  // 2. PUBLIC PORTAL
  const latestArticleUpdatedAt =
    articles[0]?.updatedAtIso || articles[0]?.publishedDate || settings.updatedAtIso;

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <PublicHeader
        settings={settings}
        currentPath={pathname}
        onNavigate={navigate}
        onFocusSearch={() => {
          if (pathname !== '/' && pathname !== '/thu-tuc') {
            navigate('/');
            setTimeout(() => setSearchTrigger((n) => n + 1), 150);
          } else {
            setSearchTrigger((n) => n + 1);
          }
        }}
      />

      <main className="flex-1">
        {matchedProcedure ? (
          <ProcedureDetailPage
            procedure={matchedProcedure}
            loading={publicLoading && !matchedProcedure}
            settings={settings}
            onNavigate={navigate}
          />
        ) : fallbackArticleSlug ? (
          <PublicArticleDetail
            article={detailArticle}
            loading={detailLoading}
            settings={settings}
            onBackToList={() => navigate('/')}
          />
        ) : pathname === '/tra-cuu' ? (
          <SmartLookupPage procedures={procedures} onNavigate={navigate} />
        ) : pathname === '/van-ban' ? (
          <LegalDocsPage documents={legalDocs} loading={publicLoading} onNavigate={navigate} />
        ) : pathname === '/hoi-dap' ? (
          <FaqPage faqs={faqs} loading={publicLoading} onNavigate={navigate} />
        ) : (
          <>
            <PublicHome
              settings={settings}
              categories={categories}
              procedures={procedures}
              legalDocuments={legalDocs}
              faqs={faqs}
              articles={articles}
              loading={publicLoading}
              proceduresOnlyView={pathname === '/thu-tuc'}
              searchInputTrigger={searchTrigger}
              onNavigate={navigate}
            />
            <PublicContactSection settings={settings} />
          </>
        )}
      </main>

      <PublicFooter
        settings={settings}
        lastUpdatedAt={latestArticleUpdatedAt}
        onNavigate={navigate}
      />
    </div>
  );
}

export default function App() {
  return (
    <PortalErrorBoundary>
      <ToastProvider>
        <PortalRoot />
      </ToastProvider>
    </PortalErrorBoundary>
  );
}
