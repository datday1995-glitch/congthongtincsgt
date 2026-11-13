import { useMemo, useState } from 'react';
import { ArrowRight, ChevronDown, HelpCircle, Search } from 'lucide-react';
import type { FaqItem } from '../../types/portal';

interface FaqPageProps {
  faqs: FaqItem[];
  loading: boolean;
  onNavigate: (path: string) => void;
}

export function FaqPage({ faqs, loading, onNavigate }: FaqPageProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [openId, setOpenId] = useState<string | null>(faqs[0]?.id || null);

  const categories = useMemo(() => {
    const set = new Set<string>();
    faqs.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [faqs]);

  const filteredFaqs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return faqs.filter((item) => {
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;
      if (!q) return true;
      return (
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.legalRef.toLowerCase().includes(q)
      );
    });
  }, [faqs, selectedCategory, searchQuery]);

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
        <header className="space-y-3 border-b border-slate-200 pb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-800">
            GIẢI ĐÁP VƯỚNG MẮC THƯỜNG GẶP
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">
            HỎI ĐÁP THỦ TỤC GIẤY PHÉP LÁI XE
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Giải đáp các thắc mắc phổ biến của người dân về sát hạch quá hạn, cấp lại bằng lái bị mất, kiểm tra phục hồi điểm GPLX và sử dụng GPLX quốc tế.
          </p>
        </header>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Tất cả ({faqs.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg border whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="relative w-full md:w-72 shrink-0">
            <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm câu hỏi, từ khóa..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm focus:border-blue-700 focus:outline-none"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3 animate-pulse">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 rounded-xl bg-white border border-slate-200" />
            ))}
          </div>
        ) : filteredFaqs.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <HelpCircle className="h-10 w-10 text-slate-400 mx-auto" />
            <p className="mt-3 text-base font-bold text-[#0B1F3A]">
              Không tìm thấy câu hỏi phù hợp
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="rounded-xl border border-slate-200 bg-white overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenId(isOpen ? null : faq.id)}
                    aria-expanded={isOpen}
                    className="w-full px-5 sm:px-6 py-4 text-left flex items-start justify-between gap-4 hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <div className="space-y-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                        {faq.category}
                      </span>
                      <h2 className="text-base font-bold text-[#0B1F3A] leading-snug">
                        {faq.question}
                      </h2>
                    </div>
                    <ChevronDown
                      className={`h-5 w-5 text-slate-500 shrink-0 mt-1 transition-transform ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {isOpen && (
                    <div className="px-5 sm:px-6 pb-5 pt-2 border-t border-slate-100 space-y-3 text-sm text-slate-700 leading-relaxed">
                      <p className="whitespace-pre-line">{faq.answer}</p>
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                        {faq.legalRef && (
                          <span className="font-mono text-slate-600">
                            Căn cứ: {faq.legalRef}
                          </span>
                        )}
                        {faq.relatedProcedureSlug && (
                          <button
                            type="button"
                            onClick={() => onNavigate(`/thu-tuc/${faq.relatedProcedureSlug}`)}
                            className="inline-flex items-center gap-1.5 font-semibold text-blue-700 hover:underline cursor-pointer"
                          >
                            <span>Xem trang thủ tục liên quan</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
