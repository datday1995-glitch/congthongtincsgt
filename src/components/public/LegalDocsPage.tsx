import { useMemo, useState } from 'react';
import { ArrowRight, ExternalLink, FileText, Scale, Search } from 'lucide-react';
import type { LegalDocType, LegalDocument, LegalValidityStatus } from '../../types/portal';
import { formatDateVi } from '../../utils/formatters';

interface LegalDocsPageProps {
  documents: LegalDocument[];
  loading: boolean;
  onNavigate: (path: string) => void;
}

const DOC_TYPE_LABELS: Record<LegalDocType, string> = {
  law: 'Luật',
  decree: 'Nghị định',
  circular: 'Thông tư',
  decision: 'Quyết định công bố TTHC',
  form: 'Biểu mẫu',
  guide: 'Tài liệu hướng dẫn',
};

const VALIDITY_LABELS: Record<LegalValidityStatus, { label: string; className: string }> = {
  effective: { label: 'Còn hiệu lực', className: 'text-emerald-800 bg-emerald-50 border-emerald-200' },
  amended: { label: 'Đã được sửa đổi, bổ sung', className: 'text-blue-800 bg-blue-50 border-blue-200' },
  expired: { label: 'Hết hiệu lực', className: 'text-slate-700 bg-slate-100 border-slate-200' },
  verifying: { label: 'Đang cập nhật/xác minh', className: 'text-amber-800 bg-amber-50 border-amber-200' },
};

export function LegalDocsPage({ documents, loading, onNavigate }: LegalDocsPageProps) {
  const [selectedType, setSelectedType] = useState<LegalDocType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredDocs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return documents.filter((doc) => {
      if (selectedType !== 'all' && doc.docType !== selectedType) return false;
      if (!q) return true;
      return (
        doc.docNumber.toLowerCase().includes(q) ||
        doc.title.toLowerCase().includes(q) ||
        doc.issuingAuthority.toLowerCase().includes(q) ||
        doc.summary.toLowerCase().includes(q)
      );
    });
  }, [documents, selectedType, searchQuery]);

  const formatDocDate = (val: string) => {
    if (!val || val === 'Đang cập nhật/xác minh') return 'Đang cập nhật/xác minh';
    if (/^\d{4}-\d{2}-\d{2}$/.test(val)) return formatDateVi(val);
    return val;
  };

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="space-y-3 border-b border-slate-200 pb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-800">
            CƠ SỞ PHÁP LÝ CHÍNH THỨC
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">
            VĂN BẢN PHÁP LUẬT & BIỂU MẪU
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Tổng hợp các Luật, Nghị định, Thông tư của Bộ Công an, Bộ Tài chính và Quyết định công bố thủ tục hành chính liên quan đến sát hạch, cấp, đổi, cấp lại và phục hồi điểm giấy phép lái xe.
          </p>
        </header>

        {/* Filter & Search Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border whitespace-nowrap shrink-0 cursor-pointer ${
                selectedType === 'all'
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tất cả ({documents.length})
            </button>
            {(Object.keys(DOC_TYPE_LABELS) as LegalDocType[]).map((typeKey) => (
              <button
                key={typeKey}
                type="button"
                onClick={() => setSelectedType(typeKey)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedType === typeKey
                    ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {DOC_TYPE_LABELS[typeKey]}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm số hiệu, tên văn bản..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-700 focus:outline-none"
            />
          </div>
        </div>

        {/* Documents Table / List */}
        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-xl bg-white border border-slate-200" />
            ))}
          </div>
        ) : filteredDocs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Scale className="h-10 w-10 text-slate-400 mx-auto" />
            <p className="mt-3 text-base font-bold text-[#0B1F3A]">
              Chưa có văn bản thuộc phân loại hoặc từ khóa này
            </p>
            <p className="mt-1 text-sm text-slate-600">
              Quý người dân có thể chọn lại bộ lọc "Tất cả" để xem toàn bộ văn bản đã công bố.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDocs.map((doc) => {
              const validity = VALIDITY_LABELS[doc.validityStatus] || VALIDITY_LABELS.verifying;
              return (
                <article
                  key={doc.id}
                  className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-bold uppercase tracking-wider text-blue-800">
                          {DOC_TYPE_LABELS[doc.docType]}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono font-bold text-[#0B1F3A]">
                          Số hiệu: {doc.docNumber}
                        </span>
                        <span aria-hidden="true">·</span>
                        <span className={`font-semibold border rounded px-2 py-0.5 ${validity.className}`}>
                          {validity.label}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-[#0B1F3A] leading-snug">
                        {doc.title}
                      </h2>
                    </div>

                    <div className="shrink-0">
                      {doc.pdfUrl ? (
                        <a
                          href={doc.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs font-semibold text-white hover:bg-blue-800 whitespace-nowrap"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          <span>Xem / Tải PDF gốc</span>
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-900 whitespace-nowrap">
                          <FileText className="h-3.5 w-3.5" />
                          <span>File PDF gốc: Đang cập nhật/xác minh</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm text-slate-700 leading-relaxed">{doc.summary}</p>

                  <div className="pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-600">
                    <div>
                      <span className="font-semibold text-slate-500">Cơ quan ban hành: </span>
                      <span className="font-semibold text-slate-800">{doc.issuingAuthority}</span>
                    </div>
                    <div className="font-mono tabular-nums">
                      <span className="font-sans font-semibold text-slate-500">Ngày ban hành: </span>
                      <span className="font-semibold text-slate-800">{formatDocDate(doc.issuedDate)}</span>
                    </div>
                    <div className="font-mono tabular-nums">
                      <span className="font-sans font-semibold text-slate-500">Ngày có hiệu lực: </span>
                      <span className="font-semibold text-slate-800">{formatDocDate(doc.effectiveDate)}</span>
                    </div>
                  </div>

                  {doc.relatedProcedureSlugs.length > 0 && (
                    <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                      <span className="font-semibold text-slate-500">Áp dụng cho thủ tục:</span>
                      {doc.relatedProcedureSlugs.map((slug) => (
                        <button
                          key={slug}
                          type="button"
                          onClick={() => onNavigate(`/thu-tuc/${slug}`)}
                          className="inline-flex items-center gap-1 text-blue-700 font-semibold hover:underline cursor-pointer"
                        >
                          <span>{slug.replace(/-/g, ' ')}</span>
                          <ArrowRight className="h-3 w-3" />
                        </button>
                      ))}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
