import { useState } from 'react';
import { Eye, EyeOff, FolderPlus, Pencil, Sparkles, Trash2 } from 'lucide-react';
import {
  deleteCategory,
  saveCategory,
  seedDefaultCategories,
} from '../../services/portalService';
import type { AdminSession, Category } from '../../types/portal';
import { parseFirestoreErrorMessage, toVietnameseSlug } from '../../utils/formatters';
import { ConfirmModal, useToast } from '../ui/Feedback';

interface CategoryManagerProps {
  session: AdminSession;
  categories: Category[];
  onReload: () => Promise<void>;
}

export function CategoryManager({ session, categories, onReload }: CategoryManagerProps) {
  const { showToast } = useToast();
  const canEdit = !session.isReadOnly && session.role !== 'viewer';
  const [editing, setEditing] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState<number>(categories.length + 1);
  const [isVisible, setIsVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const resetForm = () => {
    setEditing(null);
    setName('');
    setSlug('');
    setDescription('');
    setOrder(categories.length + 1);
    setIsVisible(true);
  };

  const startEdit = (cat: Category) => {
    setEditing(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description);
    setOrder(cat.order);
    setIsVisible(cat.isVisible);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      showToast('error', 'Tên danh mục cần ít nhất 2 ký tự');
      return;
    }
    setSaving(true);
    try {
      await saveCategory(
        session,
        {
          name: name.trim(),
          slug: slug.trim() || toVietnameseSlug(name),
          description: description.trim(),
          order: Number(order) || 0,
          isVisible,
        },
        editing?.id
      );
      showToast('success', editing ? 'Đã cập nhật danh mục' : 'Đã thêm danh mục mới');
      resetForm();
      await onReload();
    } catch (err) {
      showToast('error', 'Lưu danh mục thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleToggleVisibility = async (cat: Category) => {
    try {
      await saveCategory(
        session,
        {
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          order: cat.order,
          isVisible: !cat.isVisible,
        },
        cat.id
      );
      showToast('success', cat.isVisible ? 'Đã ẩn danh mục' : 'Đã hiển thị danh mục');
      await onReload();
    } catch (err) {
      showToast('error', 'Không thể đổi trạng thái', parseFirestoreErrorMessage(err));
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      const added = await seedDefaultCategories(session, categories);
      if (added === 0) {
        showToast('info', 'Tất cả danh mục theo Thông tư 108/2026/TT-BCA đã có sẵn');
      } else {
        showToast('success', `Đã bổ sung ${added} danh mục theo Thông tư 108/2026/TT-BCA`);
      }
      await onReload();
    } catch (err) {
      showToast('error', 'Không thể khởi tạo danh mục mẫu', parseFirestoreErrorMessage(err));
    } finally {
      setSeeding(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteCategory(session, deleteTarget);
      showToast('success', 'Đã xóa danh mục', deleteTarget.name);
      setDeleteTarget(null);
      if (editing?.id === deleteTarget.id) resetForm();
      await onReload();
    } catch (err) {
      showToast('error', 'Xóa danh mục thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A]">Quản lý danh mục thủ tục</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Thêm, chỉnh sửa, sắp xếp thứ tự và bật/tắt hiển thị các nhóm thủ tục hành chính.
          </p>
        </div>

        {canEdit && (
          <button
            type="button"
            disabled={seeding}
            onClick={handleSeed}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" />
            <span>
              {seeding
                ? 'Đang khởi tạo...'
                : categories.length === 0
                  ? 'Khởi tạo danh mục theo TT 108/2026/TT-BCA'
                  : 'Bổ sung danh mục TT 108/2026/TT-BCA'}
            </span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Form */}
        {canEdit && (
        <form
          onSubmit={handleSubmit}
          className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 space-y-4"
        >
          <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
            <FolderPlus className="h-4 w-4 text-blue-700" />
            <span>{editing ? 'Cập nhật danh mục' : 'Thêm danh mục mới'}</span>
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tên danh mục <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (!editing) setSlug(toVietnameseSlug(e.target.value));
              }}
              placeholder="VD: Cấp đổi giấy phép lái xe"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Slug URL
            </label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(toVietnameseSlug(e.target.value))}
              placeholder="cap-doi-giay-phep-lai-xe"
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono focus:border-blue-700 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Mô tả ngắn
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Thứ tự hiển thị
              </label>
              <input
                type="number"
                min={0}
                value={order}
                onChange={(e) => setOrder(Number(e.target.value))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div className="flex items-end pb-2">
              <label className="inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isVisible}
                  onChange={(e) => setIsVisible(e.target.checked)}
                />
                <span>Hiển thị công khai</span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer disabled:opacity-50"
            >
              {saving ? 'Đang lưu...' : editing ? 'Lưu thay đổi' : 'Thêm danh mục'}
            </button>
            {editing && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
            )}
          </div>
        </form>
        )}

        {/* Table */}
        <div
          className={`${
            canEdit ? 'lg:col-span-8' : 'lg:col-span-12'
          } rounded-xl border border-slate-200 bg-white overflow-hidden`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
                  <th className="py-3 px-4 w-16">Thứ tự</th>
                  <th className="py-3 px-4">Tên danh mục</th>
                  <th className="py-3 px-4">Hiển thị</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-500">
                      Chưa có danh mục nào. Hãy thêm danh mục mới hoặc khởi tạo danh mục mẫu.
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono tabular-nums text-slate-600">
                        {cat.order}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{cat.name}</p>
                        {cat.description && (
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                            {cat.description}
                          </p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          type="button"
                          disabled={!canEdit}
                          onClick={() => canEdit && void handleToggleVisibility(cat)}
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold ${
                            canEdit ? 'cursor-pointer' : 'cursor-default'
                          } ${
                            cat.isVisible ? 'text-emerald-700' : 'text-slate-500'
                          }`}
                        >
                          {cat.isVisible ? (
                            <>
                              <Eye className="h-3.5 w-3.5" />
                              <span>Đang hiện</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="h-3.5 w-3.5" />
                              <span>Đang ẩn</span>
                            </>
                          )}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {canEdit ? (
                          <div className="inline-flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => startEdit(cat)}
                              title="Sửa danh mục"
                              className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteTarget(cat)}
                              title="Xóa danh mục"
                              className="p-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Chỉ đọc</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Xác nhận xóa danh mục"
        description={`Bạn có chắc chắn muốn xóa danh mục "${deleteTarget?.name}"? Các bài viết đang thuộc danh mục này sẽ cần cập nhật lại danh mục mới.`}
        confirmLabel="Xóa danh mục"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
