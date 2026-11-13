import { useState } from 'react';
import { Database, Pencil, Plus, Scale, Trash2, X } from 'lucide-react';
import {
  deleteLegalDocument,
  saveLegalDocument,
  seedDefaultLegalDocsToFirestore,
  type SaveLegalDocInput,
} from '../../services/portalService';
import type {
  AdminSession,
  ArticleStatus,
  LegalDocType,
  LegalDocument,
  LegalValidityStatus,
} from '../../types/portal';
import { parseFirestoreErrorMessage } from '../../utils/formatters';
import { ConfirmModal, useToast } from '../ui/Feedback';

interface LegalDocManagerProps {
  session: AdminSession;
  documents: LegalDocument[];
  onReload: () => Promise<void>;
}

const DOC_TYPES: { value: LegalDocType; label: string }[] = [
  { value: 'law', label: 'Luật' },
  { value: 'decree', label: 'Nghị định' },
  { value: 'circular', label: 'Thông tư' },
  { value: 'decision', label: 'Quyết định công bố TTHC' },
  { value: 'form', label: 'Biểu mẫu' },
  { value: 'guide', label: 'Tài liệu hướng dẫn' },
];

export function LegalDocManager({ session, documents, onReload }: LegalDocManagerProps) {
  const { showToast } = useToast();
  const canEdit = !session.isReadOnly && session.role !== 'viewer';

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<LegalDocument | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<LegalDocument | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [docNumber, setDocNumber] = useState('');
  const [title, setTitle] = useState('');
  const [docType, setDocType] = useState<LegalDocType>('circular');
  const [issuedDate, setIssuedDate] = useState('');
  const [effectiveDate, setEffectiveDate] = useState('');
  const [issuingAuthority, setIssuingAuthority] = useState('Bộ Công an');
  const [validityStatus, setValidityStatus] = useState<LegalValidityStatus>('effective');
  const [summary, setSummary] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [relatedSlugs, setRelatedSlugs] = useState('');
  const [status, setStatus] = useState<ArticleStatus>('published');

  const openForm = (docItem: LegalDocument | null) => {
    setEditing(docItem);
    setShowForm(true);
    if (docItem) {
      setDocNumber(docItem.docNumber);
      setTitle(docItem.title);
      setDocType(docItem.docType);
      setIssuedDate(docItem.issuedDate);
      setEffectiveDate(docItem.effectiveDate);
      setIssuingAuthority(docItem.issuingAuthority);
      setValidityStatus(docItem.validityStatus);
      setSummary(docItem.summary);
      setPdfUrl(docItem.pdfUrl);
      setRelatedSlugs(docItem.relatedProcedureSlugs.join(', '));
      setStatus(docItem.status);
    } else {
      setDocNumber('');
      setTitle('');
      setDocType('circular');
      setIssuedDate('');
      setEffectiveDate('');
      setIssuingAuthority('Bộ Công an');
      setValidityStatus('effective');
      setSummary('');
      setPdfUrl('');
      setRelatedSlugs('');
      setStatus('published');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (docNumber.trim().length < 2 || title.trim().length < 3) {
      showToast('error', 'Vui lòng nhập đầy đủ Số hiệu và Tên văn bản');
      return;
    }
    const payload: SaveLegalDocInput = {
      docNumber: docNumber.trim(),
      title: title.trim(),
      docType,
      issuedDate: issuedDate.trim() || 'Đang cập nhật/xác minh',
      effectiveDate: effectiveDate.trim() || 'Đang cập nhật/xác minh',
      issuingAuthority: issuingAuthority.trim() || 'Đang cập nhật/xác minh',
      validityStatus,
      summary: summary.trim(),
      pdfUrl: pdfUrl.trim(),
      relatedProcedureSlugs: relatedSlugs.split(',').map((s) => s.trim()).filter(Boolean),
      status,
    };
    setSaving(true);
    try {
      await saveLegalDocument(session, payload, editing?.id);
      showToast('success', editing ? 'Đã cập nhật văn bản pháp luật' : 'Đã thêm văn bản pháp luật');
      setShowForm(false);
      setEditing(null);
      await onReload();
    } catch (err) {
      showToast('error', 'Lưu văn bản thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    if (!canEdit) return;
    setSeeding(true);
    try {
      const added = await seedDefaultLegalDocsToFirestore(session, documents);
      showToast('success', added > 0 ? `Đã đồng bộ ${added} văn bản pháp luật vào Firestore` : 'Các văn bản chuẩn đã tồn tại trong Firestore');
      await onReload();
    } catch (err) {
      showToast('error', 'Đồng bộ thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setSeeding(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || !canEdit) return;
    setDeleting(true);
    try {
      await deleteLegalDocument(session, deleteTarget);
      showToast('success', 'Đã xóa văn bản pháp luật', deleteTarget.docNumber);
      setDeleteTarget(null);
      await onReload();
    } catch (err) {
      showToast('error', 'Xóa thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A]">QUẢN LÝ VĂN BẢN PHÁP LUẬT</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Cập nhật Luật, Nghị định, Thông tư, Quyết định công bố TTHC, Biểu mẫu và đường dẫn file PDF gốc.
          </p>
        </div>
        {canEdit && (
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={seeding}
              onClick={handleSeed}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-300 bg-blue-50 px-3.5 py-2 text-xs sm:text-sm font-semibold text-blue-900 hover:bg-blue-100 cursor-pointer disabled:opacity-50"
            >
              <Database className="h-4 w-4" />
              <span>{seeding ? 'Đang đồng bộ...' : 'Đồng bộ văn bản chuẩn'}</span>
            </button>
            <button
              type="button"
              onClick={() => openForm(null)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm văn bản</span>
            </button>
          </div>
        )}
      </div>

      {showForm && canEdit && (
        <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#0B1F3A]">
              {editing ? 'Chỉnh sửa văn bản pháp luật' : 'Thêm văn bản pháp luật mới'}
            </h3>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Số hiệu văn bản *</label>
              <input
                type="text"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                placeholder="VD: 108/2026/TT-BCA"
                required
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Loại văn bản</label>
              <select
                value={docType}
                onChange={(e) => setDocType(e.target.value as LegalDocType)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                {DOC_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Tình trạng hiệu lực</label>
              <select
                value={validityStatus}
                onChange={(e) => setValidityStatus(e.target.value as LegalValidityStatus)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="effective">Còn hiệu lực</option>
                <option value="amended">Đã sửa đổi, bổ sung</option>
                <option value="expired">Hết hiệu lực</option>
                <option value="verifying">Đang cập nhật/xác minh</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tên văn bản *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Cơ quan ban hành</label>
              <input
                type="text"
                value={issuingAuthority}
                onChange={(e) => setIssuingAuthority(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày ban hành (YYYY-MM-DD)</label>
              <input
                type="text"
                value={issuedDate}
                onChange={(e) => setIssuedDate(e.target.value)}
                placeholder="2026-06-29"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Ngày có hiệu lực (YYYY-MM-DD)</label>
              <input
                type="text"
                value={effectiveDate}
                onChange={(e) => setEffectiveDate(e.target.value)}
                placeholder="2026-07-01"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Tóm tắt nội dung cốt lõi</label>
            <textarea
              rows={3}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Link PDF gốc / Tải về</label>
              <input
                type="url"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="https://... (hoặc copy link từ mục Hình ảnh & Tài liệu)"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Trạng thái hiển thị</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="published">Công khai</option>
                <option value="draft">Bản nháp</option>
                <option value="hidden">Đã ẩn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Slug thủ tục áp dụng (cách nhau dấu phẩy)</label>
            <input
              type="text"
              value={relatedSlugs}
              onChange={(e) => setRelatedSlugs(e.target.value)}
              placeholder="doi-giay-phep-lai-xe, dang-ky-sat-hach-khi-gplx-qua-han"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 cursor-pointer"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-[#0B1F3A] px-5 py-2 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : 'Lưu văn bản'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-bold uppercase text-slate-600">
                <th className="py-3 px-4">Số hiệu</th>
                <th className="py-3 px-4">Tên văn bản</th>
                <th className="py-3 px-4">Cơ quan ban hành</th>
                <th className="py-3 px-4">Hiệu lực</th>
                {canEdit && <th className="py-3 px-4 text-right">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {documents.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 5 : 4} className="py-12 text-center text-slate-500">
                    <Scale className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                    Chưa có văn bản pháp luật nào trong Firestore. Nhấn "Đồng bộ văn bản chuẩn" để nạp dữ liệu mặc định.
                  </td>
                </tr>
              ) : (
                documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 font-mono font-bold text-[#0B1F3A] whitespace-nowrap">
                      {doc.docNumber}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900 line-clamp-2">{doc.title}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Ban hành: {doc.issuedDate} · Hiệu lực: {doc.effectiveDate}
                      </p>
                    </td>
                    <td className="py-3 px-4 text-xs font-medium text-slate-700">
                      {doc.issuingAuthority}
                    </td>
                    <td className="py-3 px-4 text-xs font-semibold">
                      {doc.validityStatus === 'effective'
                        ? 'Còn hiệu lực'
                        : doc.validityStatus === 'amended'
                          ? 'Đã sửa đổi'
                          : doc.validityStatus === 'expired'
                            ? 'Hết hiệu lực'
                            : 'Đang xác minh'}
                    </td>
                    {canEdit && (
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => openForm(doc)}
                            className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(doc)}
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
        title="Xóa văn bản pháp luật"
        description={`Xác nhận xóa văn bản "${deleteTarget?.docNumber} – ${deleteTarget?.title}"?`}
        confirmLabel="Xóa văn bản"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
