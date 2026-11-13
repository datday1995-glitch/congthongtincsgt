import { useState } from 'react';
import {
  CheckCircle2,
  Database,
  Eye,
  EyeOff,
  FileText,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from 'lucide-react';
import { ONLINE_DVC_URL, PROCEDURE_GROUP_LABELS } from '../../data/gplxData';
import {
  deleteProcedureGuide,
  saveProcedureGuide,
  seedDefaultProceduresToFirestore,
  type SaveProcedureInput,
} from '../../services/portalService';
import type {
  AdminSession,
  ArticleStatus,
  ProcedureGroupKey,
  ProcedureGuide,
  ProcedureIconKey,
} from '../../types/portal';
import { formatDateTimeVi, parseFirestoreErrorMessage, toVietnameseSlug } from '../../utils/formatters';
import { ConfirmModal, useToast } from '../ui/Feedback';

interface ProcedureManagerProps {
  session: AdminSession;
  procedures: ProcedureGuide[];
  onReload: () => Promise<void>;
}

const ICON_OPTIONS: { value: ProcedureIconKey; label: string }[] = [
  { value: 'car', label: 'Xe / Cấp mới' },
  { value: 'refresh', label: 'Đổi GPLX' },
  { value: 'file-x', label: 'Cấp lại bị mất' },
  { value: 'award', label: 'Phục hồi điểm' },
  { value: 'clock-alert', label: 'Quá hạn sát hạch' },
  { value: 'globe', label: 'Cấp GPLX quốc tế' },
  { value: 'globe-refresh', label: 'Đổi GPLX quốc tế' },
  { value: 'shield-check', label: 'Sử dụng GPLX quốc tế' },
];

export function ProcedureManager({ session, procedures, onReload }: ProcedureManagerProps) {
  const { showToast } = useToast();
  const canEdit = !session.isReadOnly && session.role !== 'viewer';

  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<ProcedureGuide | null>(null);
  const [creatingNew, setCreatingNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ProcedureGuide | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Editor state
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [cardOrder, setCardOrder] = useState(1);
  const [isCoreCard, setIsCoreCard] = useState(true);
  const [iconKey, setIconKey] = useState<ProcedureIconKey>('car');
  const [groupKey, setGroupKey] = useState<ProcedureGroupKey>('cap-lan-dau');
  const [shortDescription, setShortDescription] = useState('');
  const [intro, setIntro] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [conditions, setConditions] = useState('');
  const [dossierText, setDossierText] = useState('');
  const [dossierQuantity, setDossierQuantity] = useState('01 bộ hồ sơ');
  const [submissionText, setSubmissionText] = useState('');
  const [receivingLocation, setReceivingLocation] = useState('');
  const [stepsText, setStepsText] = useState('');
  const [processingTime, setProcessingTime] = useState('');
  const [fees, setFees] = useState('');
  const [result, setResult] = useState('');
  const [legalBasisText, setLegalBasisText] = useState('');
  const [formsText, setFormsText] = useState('');
  const [faqsText, setFaqsText] = useState('');
  const [referenceNotes, setReferenceNotes] = useState('');
  const [onlinePortalUrl, setOnlinePortalUrl] = useState(ONLINE_DVC_URL);
  const [keywordsText, setKeywordsText] = useState('');
  const [status, setStatus] = useState<ArticleStatus>('published');

  const openEditor = (proc: ProcedureGuide | null) => {
    if (proc) {
      setEditing(proc);
      setCreatingNew(false);
      setTitle(proc.title);
      setSlug(proc.slug);
      setCardOrder(proc.cardOrder);
      setIsCoreCard(proc.isCoreCard);
      setIconKey(proc.iconKey);
      setGroupKey(proc.groupKey);
      setShortDescription(proc.shortDescription);
      setIntro(proc.intro);
      setTargetAudience(proc.targetAudience);
      setConditions(proc.conditions);
      setDossierText(proc.dossierItems.join('\n'));
      setDossierQuantity(proc.dossierQuantity);
      setSubmissionText(proc.submissionMethods.join('\n'));
      setReceivingLocation(proc.receivingLocation);
      setStepsText(
        proc.steps.map((s) => `${s.title} | ${s.description}`).join('\n')
      );
      setProcessingTime(proc.processingTime);
      setFees(proc.fees);
      setResult(proc.result);
      setLegalBasisText(proc.legalBasis.join('\n'));
      setFormsText(
        proc.forms.map((f) => `${f.name} | ${f.code} | ${f.url} | ${f.note}`).join('\n')
      );
      setFaqsText(
        proc.faqs.map((f) => `${f.question} | ${f.answer}`).join('\n')
      );
      setReferenceNotes(proc.referenceNotes);
      setOnlinePortalUrl(proc.onlinePortalUrl || ONLINE_DVC_URL);
      setKeywordsText(proc.keywords.join(', '));
      setStatus(proc.status);
    } else {
      setEditing(null);
      setCreatingNew(true);
      setTitle('');
      setSlug('');
      setCardOrder(procedures.length + 1);
      setIsCoreCard(false);
      setIconKey('car');
      setGroupKey('cap-lan-dau');
      setShortDescription('');
      setIntro('');
      setTargetAudience('');
      setConditions('');
      setDossierText('');
      setDossierQuantity('01 bộ hồ sơ');
      setSubmissionText('Nộp trực tuyến qua Cổng Dịch vụ công Quốc gia\nNộp trực tiếp tại Phòng CSGT');
      setReceivingLocation('Phòng Cảnh sát giao thông – Công an TP Đà Nẵng (18 Võ An Ninh, phường Hòa Xuân, TP. Đà Nẵng)');
      setStepsText('Chuẩn bị hồ sơ | Kiểm tra điều kiện và giấy tờ cần thiết\nNộp hồ sơ | Nộp trực tiếp hoặc trực tuyến\nNhận kết quả | Nhận thẻ PET / VNeID');
      setProcessingTime('Đang cập nhật/xác minh');
      setFees('Đang cập nhật/xác minh');
      setResult('');
      setLegalBasisText('Thông tư số 108/2026/TT-BCA ngày 29/6/2026 của Bộ trưởng Bộ Công an');
      setFormsText('');
      setFaqsText('');
      setReferenceNotes('');
      setOnlinePortalUrl(ONLINE_DVC_URL);
      setKeywordsText('');
      setStatus('published');
    }
  };

  const closeEditor = () => {
    setEditing(null);
    setCreatingNew(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (title.trim().length < 3) {
      showToast('error', 'Tên thủ tục phải có ít nhất 3 ký tự');
      return;
    }

    const parsedSteps = stepsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line, idx) => {
        const [stTitle, ...rest] = line.split('|');
        return {
          stepNumber: idx + 1,
          title: (stTitle || `Bước ${idx + 1}`).trim(),
          description: rest.join('|').trim() || (stTitle || '').trim(),
        };
      });

    const parsedForms = formsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, code, url, note] = line.split('|').map((s) => (s || '').trim());
        return {
          name: name || 'Biểu mẫu',
          code: code || 'Đang cập nhật/xác minh',
          url: url || '',
          note: note || '',
          verificationStatus: url ? ('verified' as const) : ('verifying' as const),
        };
      });

    const parsedFaqs = faqsText
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [question, ...ans] = line.split('|');
        return {
          question: (question || '').trim(),
          answer: ans.join('|').trim(),
        };
      })
      .filter((f) => f.question && f.answer);

    const payload: SaveProcedureInput = {
      title: title.trim(),
      slug: toVietnameseSlug(slug || title),
      cardOrder: Number(cardOrder) || 1,
      isCoreCard,
      iconKey,
      groupKey,
      shortDescription: shortDescription.trim(),
      intro: intro.trim(),
      targetAudience: targetAudience.trim(),
      conditions: conditions.trim(),
      dossierItems: dossierText.split('\n').map((s) => s.trim()).filter(Boolean),
      dossierQuantity: dossierQuantity.trim() || '01 bộ hồ sơ',
      submissionMethods: submissionText.split('\n').map((s) => s.trim()).filter(Boolean),
      receivingLocation: receivingLocation.trim(),
      steps: parsedSteps,
      processingTime: processingTime.trim(),
      fees: fees.trim(),
      result: result.trim(),
      legalBasis: legalBasisText.split('\n').map((s) => s.trim()).filter(Boolean),
      forms: parsedForms,
      faqs: parsedFaqs,
      subCases: editing?.subCases || [],
      referenceNotes: referenceNotes.trim(),
      onlinePortalUrl: onlinePortalUrl.trim() || ONLINE_DVC_URL,
      keywords: keywordsText.split(',').map((s) => s.trim()).filter(Boolean),
      status,
      isVerifiedSeed: editing?.isVerifiedSeed ?? false,
    };

    setSaving(true);
    try {
      await saveProcedureGuide(session, payload, editing?.id);
      showToast('success', editing ? 'Đã cập nhật thủ tục GPLX' : 'Đã tạo thủ tục GPLX mới');
      closeEditor();
      await onReload();
    } catch (err) {
      showToast('error', 'Lưu thủ tục thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (proc: ProcedureGuide) => {
    if (!canEdit) return;
    try {
      const nextStatus: ArticleStatus = proc.status === 'published' ? 'hidden' : 'published';
      await saveProcedureGuide(session, { ...proc, status: nextStatus }, proc.id);
      showToast('success', nextStatus === 'published' ? 'Đã công khai thủ tục' : 'Đã ẩn thủ tục', proc.title);
      await onReload();
    } catch (err) {
      showToast('error', 'Cập nhật trạng thái thất bại', parseFirestoreErrorMessage(err));
    }
  };

  const handleSeedDefaults = async () => {
    if (!canEdit) return;
    setSeeding(true);
    try {
      const count = await seedDefaultProceduresToFirestore(session, procedures);
      showToast(
        'success',
        count > 0 ? `Đã đồng bộ ${count} thủ tục GPLX chuẩn vào Firestore` : 'Tất cả 8 thủ tục chuẩn đã tồn tại trong Firestore'
      );
      await onReload();
    } catch (err) {
      showToast('error', 'Đồng bộ dữ liệu thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setSeeding(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !canEdit) return;
    setDeleting(true);
    try {
      await deleteProcedureGuide(session, deleteTarget);
      showToast('success', 'Đã xóa thủ tục khỏi Firestore', deleteTarget.title);
      setDeleteTarget(null);
      await onReload();
    } catch (err) {
      showToast('error', 'Xóa thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const filtered = procedures.filter((p) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return p.title.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
  });

  if (creatingNew || editing) {
    return (
      <form onSubmit={handleSave} className="space-y-6 rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-xl font-bold text-[#0B1F3A]">
              {editing ? `Chỉnh sửa thủ tục: ${editing.title}` : 'Thêm thủ tục GPLX mới'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Cấu trúc chuẩn 15 mục cho mỗi trang chi tiết thủ tục (/thu-tuc/:slug).
            </p>
          </div>
          <button
            type="button"
            onClick={closeEditor}
            className="rounded-lg border border-slate-300 p-2 text-slate-600 hover:bg-slate-50 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên thủ tục *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!editing) setSlug(toVietnameseSlug(e.target.value));
              }}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Đường dẫn (Slug) *</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nhóm thủ tục</label>
            <select
              value={groupKey}
              onChange={(e) => setGroupKey(e.target.value as ProcedureGroupKey)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {(Object.keys(PROCEDURE_GROUP_LABELS) as ProcedureGroupKey[]).map((k) => (
                <option key={k} value={k}>
                  {PROCEDURE_GROUP_LABELS[k]}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thứ tự</label>
              <input
                type="number"
                value={cardOrder}
                onChange={(e) => setCardOrder(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Biểu tượng</label>
              <select
                value={iconKey}
                onChange={(e) => setIconKey(e.target.value as ProcedureIconKey)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
              >
                {ICON_OPTIONS.map((i) => (
                  <option key={i.value} value={i.value}>
                    {i.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm"
              >
                <option value="published">Công khai</option>
                <option value="draft">Bản nháp</option>
                <option value="hidden">Đã ẩn</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Mô tả ngắn trên thẻ trang chủ</label>
            <textarea
              rows={2}
              value={shortDescription}
              onChange={(e) => setShortDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Giới thiệu thủ tục</label>
            <textarea
              rows={3}
              value={intro}
              onChange={(e) => setIntro(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Đối tượng thực hiện</label>
              <textarea
                rows={3}
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Điều kiện thực hiện</label>
              <textarea
                rows={3}
                value={conditions}
                onChange={(e) => setConditions(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Thành phần hồ sơ (mỗi dòng 1 mục)
              </label>
              <textarea
                rows={4}
                value={dossierText}
                onChange={(e) => setDossierText(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Số lượng hồ sơ</label>
                <input
                  type="text"
                  value={dossierQuantity}
                  onChange={(e) => setDossierQuantity(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cách thức thực hiện (mỗi dòng 1 cách)
                </label>
                <textarea
                  rows={2}
                  value={submissionText}
                  onChange={(e) => setSubmissionText(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Nơi tiếp nhận hồ sơ</label>
            <input
              type="text"
              value={receivingLocation}
              onChange={(e) => setReceivingLocation(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Trình tự thực hiện từng bước (Mỗi dòng: Tiêu đề bước | Mô tả chi tiết)
            </label>
            <textarea
              rows={4}
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thời hạn giải quyết</label>
              <textarea
                rows={3}
                value={processingTime}
                onChange={(e) => setProcessingTime(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phí và lệ phí</label>
              <textarea
                rows={3}
                value={fees}
                onChange={(e) => setFees(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Kết quả thực hiện</label>
              <textarea
                rows={3}
                value={result}
                onChange={(e) => setResult(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Căn cứ pháp lý (mỗi dòng 1 văn bản / điều khoản)
              </label>
              <textarea
                rows={3}
                value={legalBasisText}
                onChange={(e) => setLegalBasisText(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Biểu mẫu tải về (Mỗi dòng: Tên mẫu | Mã hiệu | Link PDF/DOCX | Ghi chú)
              </label>
              <textarea
                rows={3}
                value={formsText}
                onChange={(e) => setFormsText(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Câu hỏi thường gặp riêng (Mỗi dòng: Câu hỏi | Câu trả lời)
              </label>
              <textarea
                rows={3}
                value={faqsText}
                onChange={(e) => setFaqsText(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ghi chú tham khảo / Xác minh
                </label>
                <textarea
                  rows={2}
                  value={referenceNotes}
                  onChange={(e) => setReferenceNotes(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Link Dịch vụ công</label>
                  <input
                    type="url"
                    value={onlinePortalUrl}
                    onChange={(e) => setOnlinePortalUrl(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Từ khóa (cách nhau dấu phẩy)</label>
                  <input
                    type="text"
                    value={keywordsText}
                    onChange={(e) => setKeywordsText(e.target.value)}
                    className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          <label className="inline-flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={isCoreCard}
              onChange={(e) => setIsCoreCard(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span>Hiển thị trong Danh mục thủ tục chính trên Trang chủ</span>
          </label>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-slate-200 pt-4">
          <button
            type="button"
            onClick={closeEditor}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-[#0B1F3A] px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer disabled:opacity-50"
          >
            {saving ? 'Đang lưu...' : 'Lưu thủ tục GPLX'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A]">QUẢN LÝ 8 THỦ TỤC GPLX (CẤU TRÚC 15 MỤC)</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Chỉnh sửa nội dung pháp lý, hồ sơ, thời hạn, lệ phí, biểu mẫu và trạng thái hiển thị của từng trang thủ tục GPLX.
          </p>
        </div>
        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={seeding}
              onClick={handleSeedDefaults}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-900 hover:bg-blue-100 cursor-pointer disabled:opacity-50"
            >
              <Database className="h-4 w-4" />
              <span>{seeding ? 'Đang đồng bộ...' : 'Đồng bộ 8 thủ tục chuẩn vào Firestore'}</span>
            </button>
            <button
              type="button"
              onClick={() => openEditor(null)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm thủ tục mới</span>
            </button>
          </div>
        )}
      </div>

      {procedures.length === 0 && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-sm text-blue-950 flex items-start gap-3">
          <CheckCircle2 className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Chưa có bản ghi thủ tục tùy chỉnh trong Firestore</p>
            <p className="mt-1 leading-relaxed">
              Trang công khai hiện đang hiển thị đầy đủ 8 trang thủ tục chuẩn đã được kiểm chứng theo Thông tư 108/2026/TT-BCA & 105/2026/TT-BCA. Nhấn nút <strong>"Đồng bộ 8 thủ tục chuẩn vào Firestore"</strong> ở trên nếu bạn muốn lưu vào Firestore để chỉnh sửa trực tiếp từng trường.
            </p>
          </div>
        </div>
      )}

      <div className="relative max-w-md">
        <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên thủ tục hoặc slug..."
          className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-4 py-2 text-sm"
        />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-600">
                <th className="py-3 px-4 w-14">STT</th>
                <th className="py-3 px-4">Tên thủ tục</th>
                <th className="py-3 px-4">Nhóm</th>
                <th className="py-3 px-4">Trạng thái</th>
                <th className="py-3 px-4">Cập nhật</th>
                {canEdit && <th className="py-3 px-4 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="py-12 text-center text-slate-500">
                    Chưa có thủ tục nào trong cơ sở dữ liệu Firestore.
                  </td>
                </tr>
              ) : (
                filtered.map((proc) => (
                  <tr key={proc.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                      #{proc.cardOrder}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-blue-700 shrink-0" />
                        <span className="font-semibold text-[#0B1F3A]">{proc.title}</span>
                      </div>
                      <p className="text-xs font-mono text-slate-500 mt-0.5">/thu-tuc/{proc.slug}</p>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-700">
                      {PROCEDURE_GROUP_LABELS[proc.groupKey]}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold">
                      {proc.status === 'published' ? (
                        <span className="text-emerald-700">Công khai</span>
                      ) : proc.status === 'draft' ? (
                        <span className="text-amber-700">Bản nháp</span>
                      ) : (
                        <span className="text-slate-500">Đã ẩn</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-xs font-mono tabular-nums text-slate-600">
                      {proc.updatedAtIso ? formatDateTimeVi(proc.updatedAtIso) : 'Mới tạo'}
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(proc)}
                            title={proc.status === 'published' ? 'Ẩn' : 'Công khai'}
                            className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            {proc.status === 'published' ? (
                              <EyeOff className="h-3.5 w-3.5" />
                            ) : (
                              <Eye className="h-3.5 w-3.5 text-emerald-700" />
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditor(proc)}
                            title="Chỉnh sửa 15 mục"
                            className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(proc)}
                            title="Xóa"
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

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Xác nhận xóa thủ tục GPLX"
        description={`Xóa thủ tục "${deleteTarget?.title}" khỏi Firestore?`}
        confirmLabel="Xóa thủ tục"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
