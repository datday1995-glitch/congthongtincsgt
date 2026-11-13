import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'motion/react';
import {
  ArrowRight,
  Award,
  BookOpen,
  Calendar,
  Car,
  Clock,
  FileSearch,
  FileText,
  FileX,
  Globe,
  HelpCircle,
  RefreshCw,
  RotateCcw,
  Scale,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { DEFAULT_BANNER_IMAGE, DEFAULT_PROCEDURE_COVER } from '../../constants/defaults';
import { OVERDUE_CLASSIFICATION_ROWS, PROCEDURE_GROUP_LABELS } from '../../data/gplxData';
import type {
  Article,
  Category,
  FaqItem,
  LegalDocument,
  ProcedureGuide,
  ProcedureIconKey,
  SiteSettings,
} from '../../types/portal';
import { formatDateVi } from '../../utils/formatters';
import { SafeImage } from '../ui/SafeImage';

interface PublicHomeProps {
  settings: SiteSettings;
  categories: Category[];
  procedures: ProcedureGuide[];
  legalDocuments: LegalDocument[];
  faqs: FaqItem[];
  articles: Article[];
  loading: boolean;
  proceduresOnlyView?: boolean;
  searchInputTrigger: number;
  onNavigate: (path: string) => void;
}

const PROCEDURE_ICONS: Record<ProcedureIconKey, React.ComponentType<{ className?: string }>> = {
  car: Car,
  refresh: RefreshCw,
  'file-x': FileX,
  award: Award,
  'clock-alert': Clock,
  globe: Globe,
  'globe-refresh': RefreshCw,
  'shield-check': ShieldCheck,
};

export function PublicHome({
  settings,
  categories,
  procedures,
  legalDocuments,
  faqs,
  articles,
  loading,
  proceduresOnlyView = false,
  searchInputTrigger,
  onNavigate,
}: PublicHomeProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGroup, setSelectedGroup] = useState<ProcedureGuide['groupKey'] | 'all'>('all');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');

  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const resultsRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (searchInputTrigger > 0 && searchInputRef.current) {
      searchInputRef.current.focus();
      searchInputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [searchInputTrigger]);

  const trimmedQuery = searchQuery.trim().toLowerCase();

  // Global search across Procedures, Legal Docs, FAQs, and Admin Articles
  const globalSearchResults = useMemo(() => {
    if (!trimmedQuery) return null;

    const matchedProcedures = procedures.filter((p) => {
      const hay = [
        p.title,
        p.shortDescription,
        p.intro,
        p.targetAudience,
        p.conditions,
        ...p.dossierItems,
        ...p.legalBasis,
        ...p.keywords,
      ]
        .join(' ')
        .toLowerCase();
      return hay.includes(trimmedQuery);
    });

    const matchedDocs = legalDocuments.filter((d) => {
      const hay = [d.docNumber, d.title, d.issuingAuthority, d.summary].join(' ').toLowerCase();
      return hay.includes(trimmedQuery);
    });

    const matchedFaqs = faqs.filter((f) => {
      const hay = [f.question, f.answer, f.category, f.legalRef].join(' ').toLowerCase();
      return hay.includes(trimmedQuery);
    });

    const matchedArticles = articles.filter((a) => {
      const plain = a.contentHtml.replace(/<[^>]*>/g, ' ');
      const hay = [a.title, a.shortDescription, a.categoryName, ...a.keywords, plain]
        .join(' ')
        .toLowerCase();
      return hay.includes(trimmedQuery);
    });

    return {
      procedures: matchedProcedures,
      docs: matchedDocs,
      faqs: matchedFaqs,
      articles: matchedArticles,
      total:
        matchedProcedures.length +
        matchedDocs.length +
        matchedFaqs.length +
        matchedArticles.length,
    };
  }, [trimmedQuery, procedures, legalDocuments, faqs, articles]);

  const visibleProcedures = useMemo(() => {
    const ordered = [...procedures].sort((a, b) => (a.cardOrder ?? 99) - (b.cardOrder ?? 99));
    if (selectedGroup === 'all') return ordered;
    return ordered.filter((p) => p.groupKey === selectedGroup);
  }, [procedures, selectedGroup]);

  const filteredArticles = useMemo(() => {
    return articles.filter((a) => {
      if (selectedCategoryId !== 'all' && a.categoryId !== selectedCategoryId) return false;
      return true;
    });
  }, [articles, selectedCategoryId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div>
      {/* 1. Banner trang chủ (shown on Home, compact header on /thu-tuc) */}
      {!proceduresOnlyView ? (
        <section className="relative overflow-hidden bg-[#07162B] text-white">
          <div className="absolute inset-0">
            <SafeImage
              src={settings.bannerUrl || DEFAULT_BANNER_IMAGE}
              alt="Cổng hướng dẫn thủ tục hành chính về giấy phép lái xe"
              lazy={false}
              className="h-full w-full object-cover opacity-40"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#07162B]/85 via-[#0B1F3A]/85 to-[#0B1F3A]/95" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="max-w-4xl"
            >
              <p className="text-xs sm:text-sm font-semibold uppercase tracking-widest text-blue-200">
                {settings.agencyName} · {settings.departmentName}
              </p>
              <h1 className="mt-3 text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-[1.16] text-balance">
                {settings.bannerTitle}
              </h1>
              <p className="mt-4 text-base sm:text-lg text-slate-200 leading-relaxed max-w-3xl">
                {settings.bannerSubtitle}
              </p>

              {/* Large Search Bar */}
              <form
                onSubmit={handleSearchSubmit}
                className="mt-8 flex flex-col sm:flex-row gap-2.5 rounded-xl bg-white p-2 shadow-xl border border-white/10"
              >
                <div className="relative flex-1 flex items-center">
                  <Search className="h-5 w-5 text-slate-400 ml-3 shrink-0" />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Bạn đang cần tìm thủ tục gì?"
                    aria-label="Bạn đang cần tìm thủ tục gì?"
                    className="w-full bg-transparent px-3 py-3 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <Search className="h-4 w-4" />
                  <span>Tìm kiếm thủ tục</span>
                </button>
              </form>

              {/* Quick Situational Shortcuts */}
              <div className="mt-5 flex flex-wrap items-center gap-2 text-xs text-slate-200">
                <span className="font-semibold text-blue-200">Tra cứu nhanh:</span>
                <button
                  type="button"
                  onClick={() => onNavigate('/tra-cuu')}
                  className="rounded-md bg-white/10 hover:bg-white/20 px-3 py-1.5 font-medium text-white transition-colors cursor-pointer"
                >
                  Kiểm tra GPLX quá hạn (&lt;30 ngày / 1 năm)
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/thu-tuc/dang-ky-kiem-tra-phuc-hoi-diem-gplx')}
                  className="rounded-md bg-white/10 hover:bg-white/20 px-3 py-1.5 font-medium text-white transition-colors cursor-pointer"
                >
                  Phục hồi điểm GPLX (TT 105/2026)
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/van-ban')}
                  className="rounded-md bg-white/10 hover:bg-white/20 px-3 py-1.5 font-medium text-white transition-colors cursor-pointer"
                >
                  Thông tư 108/2026/TT-BCA
                </button>
              </div>
            </motion.div>
          </div>
        </section>
      ) : (
        <section className="bg-[#0B1F3A] text-white py-10 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-200">
                {settings.departmentName}
              </p>
              <h1 className="mt-1.5 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
                DANH MỤC THỦ TỤC HÀNH CHÍNH VỀ GIẤY PHÉP LÁI XE
              </h1>
              <p className="mt-2 text-sm sm:text-base text-slate-200 max-w-3xl">
                Mỗi thủ tục được thiết kế thành một trang hướng dẫn độc lập với đầy đủ 15 mục chuẩn: đối tượng, điều kiện, hồ sơ, quy trình từng bước, thời hạn, lệ phí và căn cứ pháp lý.
              </p>
            </div>
            <form
              onSubmit={handleSearchSubmit}
              className="flex flex-col sm:flex-row gap-2 rounded-xl bg-white p-1.5 max-w-2xl"
            >
              <div className="relative flex-1 flex items-center">
                <Search className="h-4 w-4 text-slate-400 ml-3 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Bạn đang cần tìm thủ tục gì?"
                  className="w-full bg-transparent px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-lg bg-blue-700 px-5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer whitespace-nowrap"
              >
                Tìm kiếm
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Global Search Results Panel (appears immediately when typing) */}
      {globalSearchResults && (
        <section
          ref={resultsRef}
          className="bg-blue-50/70 border-b border-blue-200 py-8"
        >
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#0B1F3A]">
                  Kết quả tìm kiếm toàn trang cho "{searchQuery.trim()}"
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 mt-0.5 tabular-nums">
                  Tìm thấy {globalSearchResults.total} kết quả từ danh mục thủ tục, hồ sơ, điều kiện, văn bản pháp luật và hỏi đáp.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Xóa tìm kiếm</span>
              </button>
            </div>

            {globalSearchResults.total === 0 ? (
              <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
                <FileSearch className="h-8 w-8 text-slate-400 mx-auto" />
                <p className="mt-3 text-sm font-semibold text-slate-800">
                  Không tìm thấy thủ tục hoặc văn bản phù hợp với từ khóa "{searchQuery.trim()}".
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('/tra-cuu')}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 cursor-pointer"
                >
                  <span>Thử công cụ Tra cứu theo tình huống</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {globalSearchResults.procedures.map((proc) => (
                  <div
                    key={proc.id}
                    className="rounded-xl border border-blue-200 bg-white p-5 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                        Thủ tục GPLX · {PROCEDURE_GROUP_LABELS[proc.groupKey]}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-[#0B1F3A]">{proc.title}</h3>
                      <p className="mt-1 text-xs sm:text-sm text-slate-600 line-clamp-2">
                        {proc.shortDescription}
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => onNavigate(`/thu-tuc/${proc.slug}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        <span>Xem hướng dẫn thủ tục</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {globalSearchResults.docs.map((doc) => (
                  <div
                    key={doc.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">
                        Văn bản pháp luật · {doc.docNumber}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-[#0B1F3A]">{doc.title}</h3>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">{doc.summary}</p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => onNavigate('/van-ban')}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        <Scale className="h-3.5 w-3.5" />
                        <span>Mở mục Văn bản pháp luật</span>
                      </button>
                    </div>
                  </div>
                ))}

                {globalSearchResults.faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">
                        Hỏi đáp · {faq.category}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-[#0B1F3A]">{faq.question}</h3>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">{faq.answer}</p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() =>
                          onNavigate(
                            faq.relatedProcedureSlug
                              ? `/thu-tuc/${faq.relatedProcedureSlug}`
                              : '/hoi-dap'
                          )
                        }
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        <HelpCircle className="h-3.5 w-3.5" />
                        <span>Xem giải đáp & thủ tục liên quan</span>
                      </button>
                    </div>
                  </div>
                ))}

                {globalSearchResults.articles.map((art) => (
                  <div
                    key={art.id}
                    className="rounded-xl border border-slate-200 bg-white p-5 flex flex-col justify-between gap-3"
                  >
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        Bài viết hướng dẫn · {art.categoryName}
                      </span>
                      <h3 className="mt-1 text-base font-bold text-[#0B1F3A]">{art.title}</h3>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">
                        {art.shortDescription}
                      </p>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => onNavigate(`/bai-viet/${art.slug}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        <BookOpen className="h-3.5 w-3.5" />
                        <span>Đọc chi tiết</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* 2. Danh mục thủ tục chính (8 Required Functional Cards) */}
      <section id="danh-muc-thu-tuc" className="bg-slate-50 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-slate-200 pb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-blue-800">
                HỆ THỐNG THỦ TỤC HÀNH CHÍNH VỀ GIẤY PHÉP LÁI XE
              </p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1F3A]">
                DANH MỤC THỦ TỤC CHÍNH
              </h2>
              <p className="mt-2 text-sm sm:text-base text-slate-600 max-w-2xl">
                {settings.introContent}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('/tra-cuu')}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <FileSearch className="h-4 w-4" />
              <span>Không biết chọn thủ tục nào? Tra cứu ngay</span>
            </button>
          </div>

          {/* 6-Group Filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedGroup('all')}
              className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border whitespace-nowrap shrink-0 cursor-pointer ${
                selectedGroup === 'all'
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tất cả nhóm thủ tục ({procedures.length})
            </button>
            {(Object.keys(PROCEDURE_GROUP_LABELS) as ProcedureGuide['groupKey'][]).map((gk) => (
              <button
                key={gk}
                type="button"
                onClick={() => setSelectedGroup(gk)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedGroup === gk
                    ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {PROCEDURE_GROUP_LABELS[gk]}
              </button>
            ))}
          </div>

          {/* 8 Procedure Cards Grid */}
          {loading && procedures.length === 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 animate-pulse">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="h-56 rounded-xl bg-white border border-slate-200" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {visibleProcedures.map((proc) => {
                const Icon = PROCEDURE_ICONS[proc.iconKey] || FileText;
                const isFeaturedOverdue = proc.slug === 'dang-ky-sat-hach-khi-gplx-qua-han';
                return (
                  <article
                    key={proc.id}
                    className={`group flex flex-col justify-between rounded-xl border bg-white p-5 sm:p-6 transition-all duration-150 ${
                      isFeaturedOverdue
                        ? 'border-blue-300 ring-1 ring-blue-100 hover:border-blue-500'
                        : 'border-slate-200 hover:border-blue-400'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-blue-50 text-[#0B1F3A] border border-blue-100">
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-slate-400 tabular-nums">
                          #{String(proc.cardOrder).padStart(2, '0')}
                        </span>
                      </div>

                      <h3 className="text-base sm:text-[17px] font-bold text-[#0B1F3A] leading-snug group-hover:text-blue-700 transition-colors">
                        <a
                          href={`/thu-tuc/${proc.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate(`/thu-tuc/${proc.slug}`);
                          }}
                        >
                          {proc.title}
                        </a>
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3">
                        {proc.shortDescription}
                      </p>
                    </div>

                    <div className="mt-5 pt-4 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => onNavigate(`/thu-tuc/${proc.slug}`)}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors cursor-pointer"
                      >
                        <span>Xem hướng dẫn</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* 3. Chuyên mục nổi bật: Đăng ký sát hạch khi GPLX quá hạn */}
      {!proceduresOnlyView && (
        <section className="bg-white border-y border-slate-200 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
              <div className="max-w-3xl">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-800">
                  CHUYÊN MỤC TRỌNG TÂM · THÔNG TƯ 108/2026/TT-BCA (HIỆU LỰC 01/7/2026)
                </p>
                <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-[#0B1F3A]">
                  ĐĂNG KÝ SÁT HẠCH KHI GIẤY PHÉP LÁI XE QUÁ HẠN
                </h2>
                <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
                  Phân loại nghĩa vụ thi sát hạch lại căn cứ vào khoảng thời gian từ ngày hết hạn ghi trên GPLX đến ngày nộp đủ hồ sơ hợp lệ tại cơ quan Công an.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => onNavigate('/tra-cuu')}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer"
                >
                  <Clock className="h-4 w-4" />
                  <span>Tính ngày quá hạn</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigate('/thu-tuc/dang-ky-sat-hach-khi-gplx-qua-han')}
                  className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#0B1F3A] hover:bg-slate-50 cursor-pointer"
                >
                  <span>Xem hướng dẫn thủ tục</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 overflow-hidden bg-white">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-600">
                      <th className="py-3.5 px-4">Trường hợp</th>
                      <th className="py-3.5 px-4">Điều kiện thời hạn</th>
                      <th className="py-3.5 px-4">Sát hạch lại</th>
                      <th className="py-3.5 px-4 text-right">Thủ tục áp dụng</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {OVERDUE_CLASSIFICATION_ROWS.map((row) => (
                      <tr key={row.tier} className="hover:bg-slate-50/70">
                        <td className="py-3.5 px-4 font-bold text-[#0B1F3A] whitespace-nowrap">
                          {row.tier}
                        </td>
                        <td className="py-3.5 px-4 text-slate-700">{row.condition}</td>
                        <td className="py-3.5 px-4 font-semibold text-blue-900">
                          {row.examRequired}
                        </td>
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => onNavigate(`/thu-tuc/${row.procedureSlug}`)}
                            className="inline-flex items-center gap-1 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                          >
                            <span>{row.procedureTitle}</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 4. Bài viết & Thông báo từ Cơ quan quản lý (Firestore Articles) */}
      {!proceduresOnlyView && articles.length > 0 && (
        <section className="bg-slate-50 py-12 sm:py-16 border-b border-slate-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-blue-800">
                  THÔNG BÁO & HƯỚNG DẪN BỔ SUNG
                </p>
                <h2 className="mt-1 text-2xl font-bold text-[#0B1F3A]">
                  Tin tức – Thông báo chuyên đề
                </h2>
              </div>

              {categories.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategoryId('all')}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg border whitespace-nowrap shrink-0 cursor-pointer ${
                      selectedCategoryId === 'all'
                        ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                        : 'bg-white text-slate-700 border-slate-200'
                    }`}
                  >
                    Tất cả
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategoryId(cat.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border whitespace-nowrap shrink-0 cursor-pointer ${
                        selectedCategoryId === cat.id
                          ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.slice(0, 6).map((article) => (
                <article
                  key={article.id}
                  className="group flex flex-col rounded-xl border border-slate-200 bg-white overflow-hidden hover:border-blue-300 transition-colors"
                >
                  <a
                    href={`/bai-viet/${article.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/bai-viet/${article.slug}`);
                    }}
                    className="block aspect-[16/9] w-full overflow-hidden bg-slate-100 border-b border-slate-100"
                  >
                    <SafeImage
                      src={article.coverImage || DEFAULT_PROCEDURE_COVER}
                      alt={article.title}
                      fallbackTitle={article.title}
                      className="h-full w-full object-cover group-hover:scale-[1.02] transition-transform duration-200"
                    />
                  </a>
                  <div className="flex flex-1 flex-col justify-between p-5">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-slate-500">
                        <span className="font-semibold text-blue-700">{article.categoryName}</span>
                        <span aria-hidden="true">·</span>
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          <Calendar className="h-3 w-3" />
                          {formatDateVi(article.publishedDate || article.createdAtIso)}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-bold text-[#0B1F3A] leading-snug group-hover:text-blue-700">
                        <a
                          href={`/bai-viet/${article.slug}`}
                          onClick={(e) => {
                            e.preventDefault();
                            onNavigate(`/bai-viet/${article.slug}`);
                          }}
                        >
                          {article.title}
                        </a>
                      </h3>
                      <p className="mt-2 text-xs sm:text-sm text-slate-600 line-clamp-2">
                        {article.shortDescription}
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => onNavigate(`/bai-viet/${article.slug}`)}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 hover:underline cursor-pointer"
                      >
                        <span>Xem chi tiết</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
