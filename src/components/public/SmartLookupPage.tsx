import { useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  Award,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  FileSearch,
  FileX,
  Globe,
  RefreshCw,
  Wrench,
} from 'lucide-react';
import type { ProcedureGuide } from '../../types/portal';

interface SmartLookupPageProps {
  procedures: ProcedureGuide[];
  onNavigate: (path: string) => void;
}

type ScenarioKey =
  | 'first_time'
  | 'expiring_soon'
  | 'expired'
  | 'lost'
  | 'damaged'
  | 'points_exhausted'
  | 'international';

const SCENARIOS: {
  id: ScenarioKey;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'first_time',
    title: 'Cấp GPLX lần đầu',
    subtitle: 'Chưa có GPLX, cần đăng ký học và dự sát hạch lần đầu.',
    icon: Car,
  },
  {
    id: 'expiring_soon',
    title: 'GPLX sắp hết hạn',
    subtitle: 'Bằng còn giá trị sử dụng hoặc chuẩn bị đến ngày hết hạn.',
    icon: RefreshCw,
  },
  {
    id: 'expired',
    title: 'GPLX đã hết hạn',
    subtitle: 'Kiểm tra mốc quá hạn dưới 30 ngày, 30 ngày – 1 năm hay trên 1 năm.',
    icon: Clock,
  },
  {
    id: 'lost',
    title: 'GPLX bị mất',
    subtitle: 'Thất lạc, rơi mất thẻ PET hoặc hồ sơ giấy cũ.',
    icon: FileX,
  },
  {
    id: 'damaged',
    title: 'GPLX bị hỏng',
    subtitle: 'Thẻ PET bị rách, mờ thông tin, gãy hoặc hỏng chip.',
    icon: Wrench,
  },
  {
    id: 'points_exhausted',
    title: 'GPLX bị trừ hết điểm',
    subtitle: 'Đã bị trừ hết 12 điểm hoặc bị trừ một phần điểm trên VNeID.',
    icon: Award,
  },
  {
    id: 'international',
    title: 'Muốn làm GPLX quốc tế',
    subtitle: 'Cấp mới, đổi GPLX quốc tế (IDP) hoặc kiểm tra điều kiện sử dụng.',
    icon: Globe,
  },
];

const LICENSE_CLASS_OPTIONS = ['A1', 'A', 'B1', 'B', 'C1', 'C', 'D1', 'D2', 'D', 'BE', 'C1E', 'CE', 'D1E', 'D2E', 'DE'];

function parseUtcDate(iso: string): Date | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (
    dt.getUTCFullYear() !== y ||
    dt.getUTCMonth() !== m - 1 ||
    dt.getUTCDate() !== d
  ) {
    return null;
  }
  return dt;
}

function addExactYearsUtc(date: Date, years: number): Date {
  const y = date.getUTCFullYear() + years;
  const m = date.getUTCMonth();
  const d = date.getUTCDate();
  const candidate = new Date(Date.UTC(y, m, d));
  if (candidate.getUTCMonth() !== m) {
    return new Date(Date.UTC(y, m + 1, 0));
  }
  return candidate;
}

function addExactMonthsUtc(date: Date, months: number): Date {
  const y = date.getUTCFullYear();
  const m = date.getUTCMonth() + months;
  const d = date.getUTCDate();
  const candidate = new Date(Date.UTC(y, m, 1));
  const lastDayOfTargetMonth = new Date(
    Date.UTC(candidate.getUTCFullYear(), candidate.getUTCMonth() + 1, 0)
  ).getUTCDate();
  return new Date(
    Date.UTC(candidate.getUTCFullYear(), candidate.getUTCMonth(), Math.min(d, lastDayOfTargetMonth))
  );
}

function formatIsoToVi(iso: string): string {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso;
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

export function SmartLookupPage({ procedures, onNavigate }: SmartLookupPageProps) {
  const todayIso = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [selectedScenario, setSelectedScenario] = useState<ScenarioKey>('expired');

  // State for Expired GPLX calculator
  const [licenseClass, setLicenseClass] = useState<string>('');
  const [expiryDate, setExpiryDate] = useState<string>('');
  const [lookupDate, setLookupDate] = useState<string>(todayIso);

  // State for Lost GPLX sub-question
  const [lostStatus, setLostStatus] = useState<'valid' | 'expired' | 'unknown'>('valid');

  // State for Points sub-question
  const [pointsStatus, setPointsStatus] = useState<'exhausted_12' | 'partial'>('exhausted_12');
  const [pointsDate, setPointsDate] = useState<string>('');

  const findProc = (slug: string) => procedures.find((p) => p.slug === slug);

  const expiredAnalysis = useMemo(() => {
    if (!licenseClass || !expiryDate || !lookupDate) {
      return {
        ready: false as const,
        reason:
          'Chưa đủ thông tin để kết luận điều kiện pháp lý. Vui lòng chọn Hạng GPLX, nhập Ngày hết hạn ghi trên GPLX và Ngày thực hiện tra cứu.',
      };
    }

    const exp = parseUtcDate(expiryDate);
    const ref = parseUtcDate(lookupDate);
    if (!exp || !ref) {
      return {
        ready: false as const,
        reason: 'Định dạng ngày không hợp lệ. Vui lòng kiểm tra lại.',
      };
    }

    const diffMs = ref.getTime() - exp.getTime();
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

    if (diffDays <= 0) {
      return {
        ready: true as const,
        diffDays: Math.abs(diffDays),
        tierLabel: 'Chưa quá hạn sử dụng',
        badgeTone: 'emerald' as const,
        examSummary: 'Không phải sát hạch lại lý thuyết hay thực hành.',
        targetSlug: 'doi-giay-phep-lai-xe',
        targetTitle: 'Đổi giấy phép lái xe',
        legalNote:
          `Tính đến ngày ${formatIsoToVi(lookupDate)}, GPLX hạng ${licenseClass} vẫn còn thời hạn sử dụng (còn ${Math.abs(diffDays)} ngày). Bạn thực hiện thủ tục Đổi giấy phép lái xe bình thường.`,
      };
    }

    const oneYearThreshold = addExactYearsUtc(exp, 1);

    if (diffDays < 30) {
      return {
        ready: true as const,
        diffDays,
        tierLabel: `Quá hạn dưới 30 ngày (${diffDays} ngày)`,
        badgeTone: 'blue' as const,
        examSummary: 'Không phải sát hạch lại lý thuyết (theo Thông tư 108/2026/TT-BCA).',
        targetSlug: 'doi-giay-phep-lai-xe',
        targetTitle: 'Đổi giấy phép lái xe',
        legalNote:
          `GPLX hạng ${licenseClass} đã quá hạn ${diffDays} ngày (dưới mốc 30 ngày). Theo Thông tư 108/2026/TT-BCA (hiệu lực từ 01/7/2026), nếu còn dữ liệu trên hệ thống quản lý của Cục CSGT, bạn được giải quyết cấp đổi không phải thi lại lý thuyết. Lưu ý: Hãy nộp đủ hồ sơ hợp lệ trước mốc 30 ngày để giữ quyền lợi này.`,
      };
    }

    if (ref.getTime() < oneYearThreshold.getTime()) {
      return {
        ready: true as const,
        diffDays,
        tierLabel: `Quá hạn từ đủ 30 ngày đến dưới 01 năm (${diffDays} ngày)`,
        badgeTone: 'amber' as const,
        examSummary: 'Bắt buộc phải sát hạch lại phần LÝ THUYẾT.',
        targetSlug: 'dang-ky-sat-hach-khi-gplx-qua-han',
        targetTitle: 'Đăng ký sát hạch khi GPLX quá hạn',
        legalNote:
          `GPLX hạng ${licenseClass} đã quá hạn ${diffDays} ngày (từ đủ 30 ngày đến trước ngày tròn 01 năm là ${formatIsoToVi(oneYearThreshold.toISOString().slice(0, 10))}). Theo Thông tư 108/2026/TT-BCA, bạn phải đăng ký dự sát hạch lại phần Lý thuyết để được cấp lại GPLX.`,
      };
    }

    return {
      ready: true as const,
      diffDays,
      tierLabel: `Quá hạn từ đủ 01 năm trở lên (${diffDays} ngày)`,
      badgeTone: 'red' as const,
      examSummary: 'Bắt buộc phải sát hạch lại CẢ LÝ THUYẾT VÀ THỰC HÀNH (trong hình và trên đường).',
      targetSlug: 'dang-ky-sat-hach-khi-gplx-qua-han',
      targetTitle: 'Đăng ký sát hạch khi GPLX quá hạn',
      legalNote:
        `GPLX hạng ${licenseClass} đã quá hạn từ đủ 01 năm trở lên (mốc 01 năm là ${formatIsoToVi(oneYearThreshold.toISOString().slice(0, 10))}). Theo Thông tư 108/2026/TT-BCA, bạn phải đăng ký dự sát hạch lại cả Lý thuyết và Thực hành (không thi mô phỏng ô tô).`,
    };
  }, [licenseClass, expiryDate, lookupDate]);

  const pointsAnalysis = useMemo(() => {
    if (!pointsDate) return null;
    const base = parseUtcDate(pointsDate);
    const ref = parseUtcDate(todayIso);
    if (!base || !ref) return null;
    const eligibleDate = addExactMonthsUtc(base, pointsStatus === 'exhausted_12' ? 6 : 12);
    const isEligible = ref.getTime() >= eligibleDate.getTime();
    return {
      eligibleDateVi: formatIsoToVi(eligibleDate.toISOString().slice(0, 10)),
      isEligible,
    };
  }, [pointsDate, pointsStatus, todayIso]);

  return (
    <div className="bg-slate-50 py-10 sm:py-14">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Page Header */}
        <header className="space-y-3 border-b border-slate-200 pb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-blue-800">
            CÔNG CỤ HỖ TRỢ PHÂN LOẠI THỦ TỤC
          </p>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#0B1F3A] tracking-tight">
            TRA CỨU THỦ TỤC THEO TÌNH HUỐNG
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-3xl leading-relaxed">
            Chọn tình huống thực tế bạn đang gặp để xác định đúng thủ tục hành chính cần thực hiện, điều kiện pháp lý và hồ sơ cần chuẩn bị theo Thông tư 108/2026/TT-BCA & Thông tư 105/2026/TT-BCA.
          </p>
        </header>

        {/* Step 1: Scenario Picker */}
        <section className="space-y-4">
          <h2 className="text-base sm:text-lg font-bold text-[#0B1F3A]">
            Bước 1: Bạn đang gặp trường hợp nào?
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {SCENARIOS.map((sc) => {
              const Icon = sc.icon;
              const active = selectedScenario === sc.id;
              return (
                <button
                  key={sc.id}
                  type="button"
                  onClick={() => setSelectedScenario(sc.id)}
                  className={`text-left rounded-xl border p-4 transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                    active
                      ? 'border-[#0B1F3A] bg-[#0B1F3A] text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-800 hover:border-blue-400'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`h-5 w-5 shrink-0 ${active ? 'text-blue-200' : 'text-blue-700'}`}
                    />
                    <span className="text-sm font-bold leading-snug">{sc.title}</span>
                  </div>
                  <p
                    className={`text-xs leading-relaxed ${
                      active ? 'text-slate-200' : 'text-slate-600'
                    }`}
                  >
                    {sc.subtitle}
                  </p>
                </button>
              );
            })}
          </div>
        </section>

        {/* Step 2: Interactive Assessment & Verified Recommendation */}
        <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-100 pb-4">
            <h2 className="text-lg sm:text-xl font-bold text-[#0B1F3A]">
              Bước 2: Kết quả đối chiếu & Khuyến nghị thủ tục
            </h2>
          </div>

          {selectedScenario === 'expired' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Hạng GPLX <span className="text-red-600">*</span>
                  </label>
                  <select
                    value={licenseClass}
                    onChange={(e) => setLicenseClass(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900 focus:border-blue-700 focus:outline-none"
                  >
                    <option value="">-- Chọn hạng GPLX --</option>
                    {LICENSE_CLASS_OPTIONS.map((cls) => (
                      <option key={cls} value={cls}>
                        Hạng {cls}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ngày hết hạn ghi trên GPLX <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Ngày dự kiến nộp đủ hồ sơ <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="date"
                    value={lookupDate}
                    onChange={(e) => setLookupDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900 focus:border-blue-700 focus:outline-none"
                  />
                </div>
              </div>

              {!expiredAnalysis.ready ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 flex items-start gap-3 text-sm text-amber-950">
                  <AlertCircle className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Chưa đủ dữ liệu để xác định kết quả pháp lý</p>
                    <p className="mt-1 leading-relaxed">{expiredAnalysis.reason}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-6 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-900">
                        Kết luận phân loại theo Thông tư 108/2026/TT-BCA
                      </span>
                      <span className="text-xs font-mono font-bold text-[#0B1F3A] bg-white border border-blue-200 rounded px-2.5 py-1 tabular-nums">
                        Hạng {licenseClass} · {expiredAnalysis.tierLabel}
                      </span>
                    </div>
                    <h3 className="text-xl font-extrabold text-[#0B1F3A]">
                      Thủ tục phù hợp: {expiredAnalysis.targetTitle}
                    </h3>
                    <p className="text-sm font-bold text-blue-900">
                      Yêu cầu sát hạch: {expiredAnalysis.examSummary}
                    </p>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {expiredAnalysis.legalNote}
                    </p>
                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => onNavigate(`/thu-tuc/${expiredAnalysis.targetSlug}`)}
                        className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer"
                      >
                        <span>Xem hướng dẫn thủ tục & hồ sơ</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Lưu ý kiểm chứng điều kiện bổ sung: Kết quả trên áp dụng khi GPLX còn thông tin trên hệ thống dữ liệu Cục CSGT và công dân không trong thời gian bị tước/tạm giữ bằng hoặc chưa chấp hành xong xử phạt VPHC.
                  </p>
                </div>
              )}
            </div>
          )}

          {selectedScenario === 'lost' && (
            <div className="space-y-5">
              <div className="space-y-2">
                <p className="text-sm font-bold text-[#0B1F3A]">
                  Giấy phép lái xe bị mất hiện đang ở tình trạng nào?
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {[
                    { id: 'valid', label: 'Vẫn còn thời hạn (hoặc quá hạn < 30 ngày)' },
                    { id: 'expired', label: 'Đã quá hạn từ đủ 30 ngày trở lên' },
                    { id: 'unknown', label: 'Không nhớ ngày hết hạn' },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => setLostStatus(opt.id as 'valid' | 'expired' | 'unknown')}
                      className={`rounded-lg border px-4 py-2 text-xs sm:text-sm font-semibold cursor-pointer ${
                        lostStatus === opt.id
                          ? 'bg-[#0B1F3A] text-white border-[#0B1F3A]'
                          : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {lostStatus === 'unknown' ? (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-950">
                  <p className="font-bold">Cần kiểm tra thời hạn GPLX trên VNeID hoặc tại Phòng CSGT</p>
                  <p className="mt-1 leading-relaxed">
                    Nếu chưa xác định được GPLX bị mất còn hạn hay đã quá hạn 30 ngày/1 năm, chưa thể kết luận được có phải sát hạch lại hay không. Bạn vui lòng tra cứu thông tin GPLX trên ứng dụng VNeID hoặc liên hệ Phòng CSGT (0236 3821 306) để kiểm tra dữ liệu gốc trước khi nộp hồ sơ.
                  </p>
                </div>
              ) : lostStatus === 'expired' ? (
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-6 space-y-3">
                  <h3 className="text-lg font-bold text-[#0B1F3A]">
                    Không được cấp lại trực tiếp — Phải thực hiện: Đăng ký sát hạch khi GPLX quá hạn
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Khi GPLX bị mất nhưng tính đến ngày nộp đủ hồ sơ đã quá hạn từ đủ 30 ngày trở lên, công dân phải đăng ký sát hạch lại (Lý thuyết nếu quá hạn 30 ngày – dưới 1 năm; Lý thuyết + Thực hành nếu quá hạn từ 1 năm trở lên).
                  </p>
                  <div className="flex flex-wrap gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() => onNavigate('/thu-tuc/dang-ky-sat-hach-khi-gplx-qua-han')}
                      className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer"
                    >
                      <span>Xem thủ tục Sát hạch quá hạn</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedScenario('expired')}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                    >
                      <Calendar className="h-4 w-4" />
                      <span>Tính mốc quá hạn chính xác</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-6 space-y-3">
                  <h3 className="text-lg font-bold text-[#0B1F3A]">
                    Thủ tục phù hợp: Cấp lại giấy phép lái xe bị mất
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Được cấp lại không phải thi nếu còn dữ liệu trong hệ thống CSGT, không đang bị tạm giữ/tước bằng và không bị trừ hết 12 điểm.
                  </p>
                  <button
                    type="button"
                    onClick={() => onNavigate('/thu-tuc/cap-lai-giay-phep-lai-xe-bi-mat')}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer"
                  >
                    <span>Xem chi tiết hồ sơ & các bước</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {selectedScenario === 'points_exhausted' && (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Tình trạng điểm GPLX hiện tại
                  </label>
                  <select
                    value={pointsStatus}
                    onChange={(e) => setPointsStatus(e.target.value as 'exhausted_12' | 'partial')}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-medium text-slate-900"
                  >
                    <option value="exhausted_12">Đã bị trừ hết cả 12 điểm (còn 0 điểm)</option>
                    <option value="partial">Mới bị trừ một phần (vẫn còn từ 1 đến 11 điểm)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    {pointsStatus === 'exhausted_12'
                      ? 'Ngày bị trừ hết 12 điểm (tùy chọn tính mốc 06 tháng)'
                      : 'Ngày bị trừ điểm gần nhất (tùy chọn tính mốc 12 tháng)'}
                  </label>
                  <input
                    type="date"
                    value={pointsDate}
                    onChange={(e) => setPointsDate(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900"
                  />
                </div>
              </div>

              {pointsStatus === 'partial' ? (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-6 space-y-2.5">
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Không phải thi kiểm tra phục hồi điểm</span>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Theo Khoản 2 Điều 58 Luật 36/2024/QH15, khi chưa bị trừ hết 12 điểm, bạn vẫn được điều khiển phương tiện bình thường. Nếu trong đủ 12 tháng kể từ lần trừ điểm gần nhất không bị trừ thêm điểm, hệ thống tự động phục hồi đủ 12 điểm.
                    {pointsAnalysis && ` (Mốc 12 tháng dự kiến: ${pointsAnalysis.eligibleDateVi}).`}
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-6 space-y-3">
                  <h3 className="text-lg font-bold text-[#0B1F3A]">
                    Thủ tục phù hợp: Đăng ký kiểm tra phục hồi điểm GPLX (Thông tư 105/2026/TT-BCA)
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed">
                    Khi bị trừ hết 12 điểm, bạn không được phép lái xe và phải chờ ít nhất 06 tháng kể từ ngày bị trừ hết điểm mới được đăng ký kiểm tra kiến thức pháp luật TTATGT để phục hồi điểm.
                  </p>
                  {pointsAnalysis && (
                    <p className="text-sm font-semibold text-[#0B1F3A]">
                      Ngày đủ điều kiện 06 tháng: <span className="font-mono">{pointsAnalysis.eligibleDateVi}</span>{' '}
                      ({pointsAnalysis.isEligible ? 'Đã đủ mốc 06 tháng để đăng ký kiểm tra' : 'Chưa đủ mốc 06 tháng theo quy định'}).
                    </p>
                  )}
                  <button
                    type="button"
                    onClick={() => onNavigate('/thu-tuc/dang-ky-kiem-tra-phuc-hoi-diem-gplx')}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer"
                  >
                    <span>Xem hồ sơ & lịch kiểm tra</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          )}

          {(selectedScenario === 'first_time' ||
            selectedScenario === 'expiring_soon' ||
            selectedScenario === 'damaged' ||
            selectedScenario === 'international') && (() => {
            const mapping: Record<string, { slug: string; note: string }> = {
              first_time: {
                slug: 'cap-giay-phep-lai-xe-lan-dau',
                note: 'Áp dụng cho công dân đủ điều kiện độ tuổi (Điều 59 Luật 36/2024/QH15) và sức khỏe đăng ký học, dự sát hạch lần đầu theo Thông tư 108/2026/TT-BCA.',
              },
              expiring_soon: {
                slug: 'doi-giay-phep-lai-xe',
                note: 'Nên thực hiện Đổi giấy phép lái xe trước khi hết hạn để không bị gián đoạn quyền lái xe và không phải sát hạch lại. Nhớ chuẩn bị giấy khám sức khỏe điện tử (áp dụng cho cả mô tô) và ảnh nền trắng.',
              },
              damaged: {
                slug: 'doi-giay-phep-lai-xe',
                note: 'Trường hợp thẻ PET bị hỏng, mờ thông tin, gãy hoặc hỏng chip thực hiện theo thủ tục Đổi giấy phép lái xe.',
              },
              international: {
                slug: 'cap-giay-phep-lai-xe-quoc-te',
                note: 'Bạn cần có sẵn GPLX quốc gia Việt Nam bằng vật liệu PET còn hạn và Hộ chiếu còn hạn. Xem cả 3 trang: Cấp GPLX quốc tế, Đổi GPLX quốc tế và Quy định sử dụng GPLX quốc tế.',
              },
            };
            const target = mapping[selectedScenario];
            const proc = findProc(target.slug);
            return (
              <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-6 space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900">
                  <FileSearch className="h-4 w-4" />
                  <span>Thủ tục hành chính phù hợp</span>
                </div>
                <h3 className="text-xl font-extrabold text-[#0B1F3A]">
                  {proc?.title || 'Hướng dẫn thủ tục'}
                </h3>
                <p className="text-sm text-slate-700 leading-relaxed">{target.note}</p>
                {proc && (
                  <div className="rounded-lg border border-blue-200 bg-white p-4 space-y-2">
                    <p className="text-xs font-bold uppercase text-slate-500">
                      Hồ sơ cơ bản cần chuẩn bị ({proc.dossierQuantity}):
                    </p>
                    <ul className="list-disc pl-5 text-sm text-slate-700 space-y-1">
                      {proc.dossierItems.slice(0, 4).map((item, idx) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={() => onNavigate(`/thu-tuc/${target.slug}`)}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer"
                  >
                    <span>Xem hướng dẫn chi tiết</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  {selectedScenario === 'international' && (
                    <>
                      <button
                        type="button"
                        onClick={() => onNavigate('/thu-tuc/doi-giay-phep-lai-xe-quoc-te')}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <span>Đổi GPLX quốc tế</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => onNavigate('/thu-tuc/su-dung-giay-phep-lai-xe-quoc-te')}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                      >
                        <span>Quy định sử dụng IDP</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })()}
        </section>
      </div>
    </div>
  );
}
