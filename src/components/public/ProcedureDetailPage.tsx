import { useRef } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  BookOpen,
  Building2,
  CheckCircle2,
  ChevronRight,
  Clock,
  Coins,
  Download,
  ExternalLink,
  FileCheck2,
  FileText,
  FolderCheck,
  HelpCircle,
  Info,
  Printer,
  Scale,
  Users,
} from 'lucide-react';
import {
  LICENSE_CLASSES_INFO,
  ONLINE_DVC_URL,
  OVERDUE_CLASSIFICATION_ROWS,
  PROCEDURE_GROUP_LABELS,
} from '../../data/gplxData';
import type { ProcedureGuide, SiteSettings } from '../../types/portal';

interface ProcedureDetailPageProps {
  procedure: ProcedureGuide | null;
  loading: boolean;
  settings: SiteSettings;
  onNavigate: (path: string) => void;
}

export function ProcedureDetailPage({
  procedure,
  loading,
  settings,
  onNavigate,
}: ProcedureDetailPageProps) {
  const formsSectionRef = useRef<HTMLElement | null>(null);

  if (loading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-12 animate-pulse space-y-6">
        <div className="h-4 w-64 bg-slate-200 rounded" />
        <div className="h-10 w-3/4 bg-slate-200 rounded" />
        <div className="h-32 bg-slate-200 rounded-xl" />
        <div className="h-64 bg-slate-200 rounded-xl" />
      </div>
    );
  }

  if (!procedure) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-20 text-center">
        <div className="rounded-xl border border-slate-200 bg-white p-8 sm:p-12">
          <FileText className="h-10 w-10 text-slate-400 mx-auto" />
          <h1 className="mt-4 text-xl font-bold text-[#0B1F3A]">
            Không tìm thấy thủ tục giấy phép lái xe
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Thủ tục này hiện không tồn tại hoặc đang được tạm ẩn để rà soát nội dung.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/thu-tuc')}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại danh mục thủ tục</span>
          </button>
        </div>
      </div>
    );
  }

  const handleScrollToForms = () => {
    formsSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <article className="bg-slate-50 py-8 sm:py-12 print-container">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Breadcrumb */}
        <nav
          aria-label="Đường dẫn"
          className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-slate-500 no-print"
        >
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
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
              onNavigate('/thu-tuc');
            }}
            className="hover:text-[#0B1F3A] transition-colors"
          >
            Thủ tục GPLX
          </a>
          <ChevronRight className="h-3.5 w-3.5 shrink-0" />
          <span className="text-slate-800 font-semibold truncate max-w-xs sm:max-w-lg">
            {procedure.title}
          </span>
        </nav>

        {/* Main Header Card */}
        <header className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500 border-b border-slate-100 pb-4">
            <span className="font-bold uppercase tracking-wider text-blue-800">
              {PROCEDURE_GROUP_LABELS[procedure.groupKey]}
            </span>
            <span className="font-mono tabular-nums text-slate-500">
              Đơn vị: {settings.departmentName}
            </span>
          </div>

          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-[#0B1F3A] leading-tight">
              {procedure.title}
            </h1>
            <p className="mt-3 text-base text-slate-700 leading-relaxed">
              {procedure.intro}
            </p>
          </div>

          {/* Required 5 Action Buttons */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2.5 no-print">
            <button
              type="button"
              onClick={handleScrollToForms}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Download className="h-4 w-4 text-blue-700" />
              <span>Tải biểu mẫu</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/van-ban')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Scale className="h-4 w-4 text-blue-700" />
              <span>Xem văn bản pháp luật</span>
            </button>

            <a
              href={procedure.onlinePortalUrl || ONLINE_DVC_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Thực hiện thủ tục trực tuyến</span>
            </a>

            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <Printer className="h-4 w-4 text-slate-600" />
              <span>In hướng dẫn</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate('/thu-tuc')}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer sm:ml-auto"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Quay lại danh mục</span>
            </button>
          </div>
        </header>

        {/* Key Operational Summary Grid */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
              <Clock className="h-4 w-4 shrink-0" />
              <span>Thời hạn giải quyết</span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed">{procedure.processingTime}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
              <Coins className="h-4 w-4 shrink-0" />
              <span>Phí và lệ phí</span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed">{procedure.fees}</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-800">
              <FileCheck2 className="h-4 w-4 shrink-0" />
              <span>Kết quả thực hiện</span>
            </div>
            <p className="text-sm text-slate-800 leading-relaxed">{procedure.result}</p>
          </div>
        </section>

        {/* Visual Step-by-Step Flowchart */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <p className="text-xs font-bold uppercase tracking-wider text-blue-800">
              Quy trình thực hiện trực quan
            </p>
            <h2 className="mt-1 text-xl font-bold text-[#0B1F3A]">
              Trình tự thực hiện từng bước
            </h2>
          </div>

          <ol className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {procedure.steps.map((step) => (
              <li
                key={step.stepNumber}
                className="relative rounded-xl border border-slate-200 bg-slate-50/70 p-5 flex gap-4"
              >
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0B1F3A] text-white font-mono text-sm font-bold tabular-nums">
                  {String(step.stepNumber).padStart(2, '0')}
                </div>
                <div className="space-y-1.5 min-w-0">
                  <h3 className="text-base font-bold text-[#0B1F3A] leading-snug">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{step.description}</p>
                  {step.note && (
                    <p className="text-xs text-slate-500 pt-1 italic">{step.note}</p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </section>

        {/* Special Statutory Table for Overdue / First-time Classes */}
        {procedure.slug === 'dang-ky-sat-hach-khi-gplx-qua-han' && (
          <section className="rounded-xl border border-amber-300 bg-white overflow-hidden">
            <div className="bg-amber-50 border-b border-amber-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-amber-900">
                  Bảng phân loại quy định tại Thông tư 108/2026/TT-BCA
                </p>
                <h2 className="text-lg font-bold text-[#0B1F3A]">
                  Phân loại nghĩa vụ sát hạch theo thời gian quá hạn GPLX
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('/tra-cuu')}
                className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F3A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-blue-800 cursor-pointer no-print"
              >
                <span>Tính ngày quá hạn ngay</span>
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-600">
                    <th className="py-3 px-4">Mốc thời gian</th>
                    <th className="py-3 px-4">Điều kiện xác định</th>
                    <th className="py-3 px-4">Yêu cầu sát hạch</th>
                    <th className="py-3 px-4">Căn cứ</th>
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
                      <td className="py-3.5 px-4 text-xs font-mono text-slate-600 whitespace-nowrap">
                        {row.legalRef}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {procedure.slug === 'cap-giay-phep-lai-xe-lan-dau' && (
          <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
            <div className="border-b border-slate-200 bg-slate-50 px-6 py-4">
              <p className="text-xs font-bold uppercase tracking-wider text-blue-800">
                Điều 57 & Điều 59 Luật Trật tự, an toàn giao thông đường bộ 36/2024/QH15
              </p>
              <h2 className="text-lg font-bold text-[#0B1F3A]">
                Phân hạng Giấy phép lái xe và Độ tuổi tối thiểu
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-600">
                    <th className="py-3 px-4">Hạng GPLX</th>
                    <th className="py-3 px-4">Loại phương tiện điều khiển</th>
                    <th className="py-3 px-4">Độ tuổi quy định</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {LICENSE_CLASSES_INFO.map((cls) => (
                    <tr key={cls.code} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4 font-mono font-bold text-[#0B1F3A] whitespace-nowrap">
                        {cls.code}
                      </td>
                      <td className="py-3 px-4 text-slate-700">{cls.desc}</td>
                      <td className="py-3 px-4 text-slate-800 font-medium whitespace-nowrap">
                        {cls.minAge}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Unified Structured Specifications (All remaining 15 required sections) */}
        <section className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-200">
          {/* Đối tượng thực hiện */}
          <div className="p-6 sm:p-7 space-y-2.5">
            <h2 className="text-base sm:text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-700 shrink-0" />
              <span>Đối tượng thực hiện</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
              {procedure.targetAudience}
            </p>
          </div>

          {/* Điều kiện thực hiện */}
          <div className="p-6 sm:p-7 space-y-2.5">
            <h2 className="text-base sm:text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-blue-700 shrink-0" />
              <span>Điều kiện thực hiện</span>
            </h2>
            <p className="text-sm sm:text-base text-slate-700 leading-relaxed whitespace-pre-line">
              {procedure.conditions}
            </p>
          </div>

          {/* Thành phần hồ sơ & Số lượng */}
          <div className="p-6 sm:p-7 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
                <FolderCheck className="h-5 w-5 text-blue-700 shrink-0" />
                <span>Thành phần hồ sơ</span>
              </h2>
              <span className="text-xs font-semibold text-slate-700 bg-slate-100 border border-slate-200 rounded-md px-3 py-1">
                Số lượng hồ sơ: {procedure.dossierQuantity}
              </span>
            </div>
            <ul className="space-y-2.5">
              {procedure.dossierItems.map((item, idx) => (
                <li key={idx} className="flex items-start gap-3 text-sm sm:text-base text-slate-700">
                  <span className="font-mono text-xs font-bold text-blue-800 bg-blue-50 border border-blue-200 rounded px-1.5 py-0.5 mt-0.5 shrink-0 tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Cách thức & Nơi tiếp nhận */}
          <div className="p-6 sm:p-7 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-700 shrink-0" />
                <span>Cách thức thực hiện</span>
              </h2>
              <ul className="space-y-2 text-sm text-slate-700 leading-relaxed list-disc pl-5">
                {procedure.submissionMethods.map((m, idx) => (
                  <li key={idx}>{m}</li>
                ))}
              </ul>
            </div>

            <div className="space-y-2.5">
              <h2 className="text-base sm:text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
                <Building2 className="h-5 w-5 text-blue-700 shrink-0" />
                <span>Nơi tiếp nhận hồ sơ</span>
              </h2>
              <p className="text-sm text-slate-700 leading-relaxed">{procedure.receivingLocation}</p>
            </div>
          </div>

          {/* Sub-cases if any */}
          {procedure.subCases && procedure.subCases.length > 0 && (
            <div className="p-6 sm:p-7 space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-blue-700 shrink-0" />
                <span>Chi tiết từng trường hợp cụ thể</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {procedure.subCases.map((sc, idx) => (
                  <div
                    key={idx}
                    className="rounded-lg border border-slate-200 bg-slate-50/60 p-4 space-y-2"
                  >
                    <h3 className="text-sm font-bold text-[#0B1F3A]">{sc.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{sc.summary}</p>
                    <div className="pt-2 border-t border-slate-200/80 text-xs text-slate-600 space-y-1">
                      <p>
                        <strong>Điều kiện:</strong> {sc.conditions}
                      </p>
                      {sc.extraDossier && sc.extraDossier !== 'Không có.' && (
                        <p>
                          <strong>Lưu ý hồ sơ:</strong> {sc.extraDossier}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Căn cứ pháp lý (Statutory Rules vs Reference Notes) */}
          <div className="p-6 sm:p-7 space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
              <Scale className="h-5 w-5 text-blue-700 shrink-0" />
              <span>Căn cứ pháp lý</span>
            </h2>
            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Quy định pháp luật viện dẫn:
              </p>
              <ul className="space-y-2 text-sm text-slate-800 leading-relaxed list-disc pl-5">
                {procedure.legalBasis.map((basis, idx) => (
                  <li key={idx}>{basis}</li>
                ))}
              </ul>
            </div>

            {procedure.referenceNotes && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-xs sm:text-sm text-amber-950 flex items-start gap-2.5">
                <Info className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Ghi chú hướng dẫn & Trạng thái xác minh:</p>
                  <p className="mt-1 leading-relaxed">{procedure.referenceNotes}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Biểu mẫu tải về */}
        <section
          ref={formsSectionRef}
          id="bieu-mau-tai-ve"
          className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4"
        >
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-700" />
              <span>Biểu mẫu tải về</span>
            </h2>
            <a
              href="/van-ban"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/van-ban');
              }}
              className="text-xs font-semibold text-blue-700 hover:underline no-print"
            >
              Xem kho văn bản pháp luật
            </a>
          </div>

          {procedure.forms.length === 0 ? (
            <p className="text-sm text-slate-600">
              Thủ tục/quy định này không yêu cầu nộp mẫu đơn giấy riêng hoặc sử dụng tờ khai điện tử trực tiếp trên Cổng Dịch vụ công Quốc gia.
            </p>
          ) : (
            <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
              {procedure.forms.map((form, idx) => (
                <li
                  key={idx}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-slate-900">{form.name}</p>
                    <p className="text-xs font-mono text-slate-600">Mã hiệu: {form.code}</p>
                    <p className="text-xs text-slate-600">{form.note}</p>
                  </div>
                  {form.url ? (
                    <a
                      href={form.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={form.name}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap shrink-0"
                    >
                      <Download className="h-3.5 w-3.5" />
                      <span>Tải biểu mẫu</span>
                    </a>
                  ) : (
                    <span className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 rounded-md px-3 py-1.5 whitespace-nowrap shrink-0">
                      File tải trực tiếp: Đang cập nhật/xác minh
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Câu hỏi thường gặp riêng của thủ tục */}
        {procedure.faqs.length > 0 && (
          <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base sm:text-lg font-bold text-[#0B1F3A] flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-blue-700" />
                <span>Câu hỏi thường gặp</span>
              </h2>
              <a
                href="/hoi-dap"
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate('/hoi-dap');
                }}
                className="text-xs font-semibold text-blue-700 hover:underline no-print"
              >
                Xem toàn bộ Hỏi đáp
              </a>
            </div>
            <div className="divide-y divide-slate-200 border-t border-slate-200">
              {procedure.faqs.map((faq, idx) => (
                <div key={idx} className="py-4 space-y-1.5">
                  <h3 className="text-sm sm:text-base font-bold text-[#0B1F3A]">{faq.question}</h3>
                  <p className="text-sm text-slate-700 leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Bottom Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 no-print">
          <button
            type="button"
            onClick={() => onNavigate('/thu-tuc')}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại danh mục thủ tục</span>
          </button>
          <button
            type="button"
            onClick={() => onNavigate('/tra-cuu')}
            className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer"
          >
            <span>Mở công cụ tra cứu theo tình huống</span>
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </article>
  );
}
