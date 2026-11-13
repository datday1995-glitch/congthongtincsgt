import { useState } from 'react';
import { Database, HelpCircle, Pencil, Plus, Trash2, X } from 'lucide-react';
import {
  deleteFaqItem,
  saveFaqItem,
  seedDefaultFaqsToFirestore,
  type SaveFaqInput,
} from '../../services/portalService';
import type { AdminSession, ArticleStatus, FaqItem, ProcedureGuide } from '../../types/portal';
import { parseFirestoreErrorMessage } from '../../utils/formatters';
import { ConfirmModal, useToast } from '../ui/Feedback';

interface FaqManagerProps {
  session: AdminSession;
  faqs: FaqItem[];
  procedures: ProcedureGuide[];
  onReload: () => Promise<void>;
}

export function FaqManager({ session, faqs, procedures, onReload }: FaqManagerProps) {
  const { showToast } = useToast();
  const canEdit = !session.isReadOnly && session.role !== 'viewer';

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<FaqItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<FaqItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [category, setCategory] = useState('Sát hạch quá hạn');
  const [relatedProcedureSlug, setRelatedProcedureSlug] = useState('');
  const [legalRef, setLegalRef] = useState('');
  const [order, setOrder] = useState(1);
  const [status, setStatus] = useState<ArticleStatus>('published');

  const openForm = (item: FaqItem | null) => {
    setEditing(item);
    setShowForm(true);
    if (item) {
      setQuestion(item.question);
      setAnswer(item.answer);
      setCategory(item.category);
      setRelatedProcedureSlug(item.relatedProcedureSlug);
      setLegalRef(item.legalRef);
      setOrder(item.order);
      setStatus(item.status);
    } else {
      setQuestion('');
      setAnswer('');
      setCategory('Sát hạch quá hạn');
      setRelatedProcedureSlug('');
      setLegalRef('Thông tư 108/2026/TT-BCA');
      setOrder(faqs.length + 1);
      setStatus('published');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canEdit) return;
    if (question.trim().length < 4 || answer.trim().length < 4) {
      showToast('error', 'Vui lòng nhập đầy đủ câu hỏi và câu trả lời');
      return;
    }
    const payload: SaveFaqInput = {
      question: question.trim(),
      answer: answer.trim(),
      category: category.trim() || 'Chung',
      relatedProcedureSlug: relatedProcedureSlug.trim(),
      legalRef: legalRef.trim(),
      order: Number(order) || 0,
      status,
    };
    setSaving(true);
    try {
      await saveFaqItem(session, payload, editing?.id);
      showToast('success', editing ? 'Đã cập nhật câu hỏi' : 'Đã thêm câu hỏi mới');
      setShowForm(false);
      setEditing(null);
      await onReload();
    } catch (err) {
      showToast('error', 'Lưu câu hỏi thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    if (!canEdit) return;
    setSeeding(true);
    try {
      const added = await seedDefaultFaqsToFirestore(session, faqs);
      showToast('success', added > 0 ? `Đã đồng bộ ${added} câu hỏi chuẩn vào Firestore` : 'Các câu hỏi chuẩn đã có trong Firestore');
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
      await deleteFaqItem(session, deleteTarget);
      showToast('success', 'Đã xóa câu hỏi', deleteTarget.question);
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
          <h2 className="text-xl font-bold text-[#0B1F3A]">QUẢN LÝ HỎI ĐÁP (FAQ)</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Biên tập câu hỏi thường gặp và liên kết tới trang chi tiết thủ tục GPLX tương ứng.
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
              <span>{seeding ? 'Đang đồng bộ...' : 'Đồng bộ câu hỏi chuẩn'}</span>
            </button>
            <button
              type="button"
              onClick={() => openForm(null)}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Thêm câu hỏi</span>
            </button>
          </div>
        )}
      </div>

      {showForm && canEdit && (
        <form onSubmit={handleSave} className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-base font-bold text-[#0B1F3A]">
              {editing ? 'Chỉnh sửa câu hỏi thường gặp' : 'Thêm câu hỏi thường gặp mới'}
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
              <label className="block text-xs font-bold text-slate-700 mb-1">Chuyên mục</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Thủ tục liên quan</label>
              <select
                value={relatedProcedureSlug}
                onChange={(e) => setRelatedProcedureSlug(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">-- Không chọn --</option>
                {procedures.map((p) => (
                  <option key={p.slug} value={p.slug}>
                    {p.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Thứ tự</label>
                <input
                  type="number"
                  value={order}
                  onChange={(e) => setOrder(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                />
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

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Câu hỏi *</label>
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Câu trả lời chi tiết *</label>
            <textarea
              rows={4}
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Căn cứ pháp lý trích dẫn</label>
            <input
              type="text"
              value={legalRef}
              onChange={(e) => setLegalRef(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
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
              {saving ? 'Đang lưu...' : 'Lưu câu hỏi'}
            </button>
          </div>
        </form>
      )}

      <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-200">
        {faqs.length === 0 ? (
          <div className="py-12 text-center text-slate-500">
            <HelpCircle className="h-8 w-8 text-slate-300 mx-auto mb-2" />
            Chưa có câu hỏi nào trong Firestore. Nhấn "Đồng bộ câu hỏi chuẩn" để nạp dữ liệu mặc định.
          </div>
        ) : (
          faqs.map((item) => (
            <div key={item.id} className="p-4 sm:p-5 flex items-start justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800">
                  #{item.order} · {item.category}
                </span>
                <p className="text-sm font-bold text-[#0B1F3A]">{item.question}</p>
                <p className="text-xs text-slate-600 line-clamp-2">{item.answer}</p>
              </div>
              {canEdit && (
                <div className="inline-flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => openForm(item)}
                    className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(item)}
                    className="p-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Xóa câu hỏi thường gặp"
        description={`Xác nhận xóa câu hỏi "${deleteTarget?.question}"?`}
        confirmLabel="Xóa câu hỏi"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
