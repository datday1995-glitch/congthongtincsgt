import { useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  ChevronRight,
  Download,
  FileText,
  Info,
  MapPin,
  Phone,
  Printer,
  Share2,
} from 'lucide-react';
import { DEFAULT_PROCEDURE_COVER } from '../../constants/defaults';
import type { Article, SiteSettings } from '../../types/portal';
import { formatBytes, formatDateVi, sanitizeRichHtml } from '../../utils/formatters';
import { useToast } from '../ui/Feedback';
import { SafeImage } from '../ui/SafeImage';

interface PublicArticleDetailProps {
  article: Article | null;
  loading: boolean;
  settings: SiteSettings;
  onBackToList: () => void;
}

export function PublicArticleDetail({
  article,
  loading,
  settings,
  onBackToList,
}: PublicArticleDetailProps) {
  const { showToast } = useToast();

  const sanitizedContent = useMemo(
    () => (article ? sanitizeRichHtml(article.contentHtml) : ''),
    [article]
  );

  const handleShare = async () => {
    const shareUrl = window.location.href;
    if (navigator.share && article) {
      try {
        await navigator.share({
          title: article.title,
          text: article.shortDescription,
          url: shareUrl,
        });
        return;
      } catch {
        // User cancelled or fallback to clipboard
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      showToast('success', 'Đã sao chép liên kết bài viết', shareUrl);
    } catch {
      showToast('info', 'Liên kết bài viết', shareUrl);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-12 animate-pulse space-y-6">
        <div className="h-4 w-64 bg-slate-200 rounded" />
        <div className="h-10 w-5/6 bg-slate-200 rounded" />
        <div className="aspect-[16/9] bg-slate-200 rounded-xl" />
        <div className="space-y-3">
          <div className="h-4 w-full bg-slate-200 rounded" />
          <div className="h-4 w-11/12 bg-slate-200 rounded" />
          <div className="h-4 w-4/5 bg-slate-200 rounded" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="rounded-xl border border-slate-200 bg-white p-8 sm:p-12">
          <FileText className="h-10 w-10 text-slate-400 mx-auto" />
          <h1 className="mt-4 text-xl font-bold text-[#0B1F3A]">
            Không tìm thấy thủ tục hành chính
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Nội dung này có thể đã được gỡ bỏ, tạm ẩn hoặc đường dẫn không tồn tại.
          </p>
          <button
            type="button"
            onClick={onBackToList}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại danh sách thủ tục</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <article className="bg-white py-8 sm:py-12 print-container">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Đường dẫn"
          className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-500 mb-6 no-print"
        >
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onBackToList();
            }}
            className="hover:text-[#0B1F3A] transition-colors"
          >
            Trang chủ
          </a>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <a
            href="/thu-tuc"
            onClick={(e) => {
              e.preventDefault();
              onBackToList();
            }}
            className="hover:text-[#0B1F3A] transition-colors"
          >
            Thủ tục hành chính
          </a>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-slate-800 font-medium truncate max-w-xs sm:max-w-md">
            {article.title}
          </span>
        </nav>

        {/* Sample Data Notice (if marked isSample) */}
        {article.isSample && (
          <div className="mb-6 flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 no-print">
            <Info className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Bài viết minh họa mẫu</p>
              <p className="text-xs text-amber-800 mt-0.5">
                Nội dung này được đánh dấu là tài liệu tham khảo mẫu trên hệ thống. Vui lòng đối chiếu văn bản chính thức của cơ quan có thẩm quyền.
              </p>
            </div>
          </div>
        )}

        {/* Header */}
        <header className="pb-6 border-b border-slate-200">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm text-slate-500">
            <span className="font-semibold text-blue-700 uppercase tracking-wide">
              {article.categoryName}
            </span>
            <span aria-hidden="true">·</span>
            <span className="inline-flex items-center gap-1.5 tabular-nums">
              <Calendar className="h-3.5 w-3.5" />
              Ngày đăng: {formatDateVi(article.publishedDate || article.createdAtIso)}
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              Cập nhật gần nhất: {formatDateVi(article.updatedAtIso || article.publishedDate)}
            </span>
          </div>

          <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0B1F3A] leading-tight text-balance">
            {article.title}
          </h1>

          {article.shortDescription && (
            <p className="mt-4 text-base sm:text-lg text-slate-700 leading-relaxed font-medium">
              {article.shortDescription}
            </p>
          )}

          {/* Action Toolbar */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5 no-print">
            <button
              type="button"
              onClick={handleShare}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Share2 className="h-4 w-4 text-blue-700" />
              <span>Chia sẻ bài viết</span>
            </button>
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4 text-slate-600" />
              <span>In nội dung</span>
            </button>
            <button
              type="button"
              onClick={onBackToList}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer sm:ml-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại danh sách thủ tục</span>
            </button>
          </div>
        </header>

        {/* High-res Cover Image */}
        <div className="mt-8 overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
          <SafeImage
            src={article.coverImage || DEFAULT_PROCEDURE_COVER}
            alt={article.title}
            lazy={false}
            fallbackTitle={article.title}
            className="w-full max-h-[460px] object-cover"
          />
        </div>

        {/* Rich Editorial Body */}
        <div
          className="portal-prose mt-8 max-w-none"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />

        {/* Attachments Section */}
        {article.attachments && article.attachments.length > 0 && (
          <section className="mt-10 rounded-xl border border-slate-200 bg-slate-50 p-6">
            <h2 className="text-base sm:text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-700" />
              <span>Tài liệu & Biểu mẫu đính kèm ({article.attachments.length})</span>
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-slate-600">
              Quý người dân nhấn nút tải về để xem hoặc in biểu mẫu trước khi nộp hồ sơ.
            </p>
            <ul className="mt-4 divide-y divide-slate-200 rounded-lg border border-slate-200 bg-white">
              {article.attachments.map((att, idx) => (
                <li
                  key={`${att.url}-${idx}`}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3.5"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {att.name}
                    </p>
                    <p className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                      {att.mimeType ? att.mimeType.split('/').pop()?.toUpperCase() : 'TỆP'}
                      {att.sizeBytes ? ` · ${formatBytes(att.sizeBytes)}` : ''}
                    </p>
                  </div>
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={att.name}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0"
                  >
                    <Download className="h-4 w-4" />
                    <span>Tải tài liệu</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Official Support Contact Box */}
        <section className="mt-10 rounded-xl border border-slate-200 bg-[#F8FAFC] p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-blue-700">
            Thông tin hỗ trợ giải quyết thủ tục
          </p>
          <h3 className="mt-1 text-base sm:text-lg font-bold text-[#0B1F3A]">
            {settings.departmentName} – {settings.agencyName}
          </h3>
          <div className="mt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-slate-700">
            <div className="space-y-1.5">
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-blue-700 shrink-0" />
                <span>{settings.address}</span>
              </p>
              <p className="flex items-center gap-2 font-mono tabular-nums">
                <Phone className="h-4 w-4 text-blue-700 shrink-0" />
                <span>Điện thoại hỗ trợ: {settings.phone}</span>
              </p>
            </div>
            <a
              href={`tel:${settings.phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#14335E] transition-colors whitespace-nowrap shrink-0 no-print"
            >
              <Phone className="h-4 w-4" />
              <span>Gọi hỗ trợ</span>
            </a>
          </div>
        </section>
      </div>
    </article>
  );
}
