import { useEffect, useRef, useState } from 'react';
import {
  ArrowLeft,
  BookOpen,
  Eye,
  FilePlus2,
  Image as ImageIcon,
  Link2,
  Plus,
  Save,
  Send,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { DEFAULT_PROCEDURE_COVER } from '../../constants/defaults';
import { TT108_CATEGORIES, TT108_PROCEDURE_TEMPLATES } from '../../constants/tt108Templates';
import { saveArticle, saveCategory, uploadMediaFile } from '../../services/portalService';
import type {
  AdminSession,
  Article,
  ArticleStatus,
  AttachmentItem,
  Category,
  SectionType,
} from '../../types/portal';
import {
  formatBytes,
  getTodayIsoDate,
  parseFirestoreErrorMessage,
  sanitizeRichHtml,
  toVietnameseSlug,
} from '../../utils/formatters';
import { useToast } from '../ui/Feedback';
import { SafeImage } from '../ui/SafeImage';
import { RichTextEditor } from './RichTextEditor';

interface ArticleEditorProps {
  session: AdminSession;
  categories: Category[];
  editingArticle: Article | null;
  onCategoriesReload: () => Promise<void>;
  onSaved: () => Promise<void>;
  onCancel: () => void;
}

export function ArticleEditor({
  session,
  categories,
  editingArticle,
  onCategoriesReload,
  onSaved,
  onCancel,
}: ArticleEditorProps) {
  const { showToast } = useToast();

  const [title, setTitle] = useState(editingArticle?.title || '');
  const [slug, setSlug] = useState(editingArticle?.slug || '');
  const [slugTouched, setSlugTouched] = useState(Boolean(editingArticle));
  const [categoryId, setCategoryId] = useState(
    editingArticle?.categoryId || categories[0]?.id || ''
  );
  const [sectionType, setSectionType] = useState<SectionType>(
    editingArticle?.sectionType || 'procedure'
  );
  const [shortDescription, setShortDescription] = useState(
    editingArticle?.shortDescription || ''
  );
  const [coverImage, setCoverImage] = useState(editingArticle?.coverImage || '');
  const [contentHtml, setContentHtml] = useState(editingArticle?.contentHtml || '');
  const [attachments, setAttachments] = useState<AttachmentItem[]>(
    editingArticle?.attachments || []
  );
  const [keywordsText, setKeywordsText] = useState(
    editingArticle?.keywords?.join(', ') || ''
  );
  const [publishedDate, setPublishedDate] = useState(
    editingArticle?.publishedDate || getTodayIsoDate()
  );
  const [status, setStatus] = useState<ArticleStatus>(editingArticle?.status || 'published');
  const [isSample, setIsSample] = useState(Boolean(editingArticle?.isSample));

  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingAttachment, setUploadingAttachment] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Quick inline category creator
  const [quickCatOpen, setQuickCatOpen] = useState(false);
  const [quickCatName, setQuickCatName] = useState('');
  const [creatingCat, setCreatingCat] = useState(false);

  // Manual attachment URL input
  const [attUrlOpen, setAttUrlOpen] = useState(false);
  const [attNameInput, setAttNameInput] = useState('');
  const [attUrlInput, setAttUrlInput] = useState('');

  // TT108 template picker
  const [selectedTemplateId, setSelectedTemplateId] = useState(
    TT108_PROCEDURE_TEMPLATES[0]?.id || ''
  );
  const [applyingTemplate, setApplyingTemplate] = useState(false);

  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const attInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!categoryId && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugTouched) {
      setSlug(toVietnameseSlug(val));
    }
  };

  const handleCoverUpload = async (file: File) => {
    setUploadingCover(true);
    try {
      const asset = await uploadMediaFile(session, file, 'image');
      setCoverImage(asset.url);
      showToast('success', 'Đã tải ảnh bìa lên thành công');
    } catch (err) {
      showToast('error', 'Tải ảnh bìa thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setUploadingCover(false);
    }
  };

  const handleAttachmentUpload = async (files: File[]) => {
    setUploadingAttachment(true);
    try {
      const added: AttachmentItem[] = [];
      for (const file of files) {
        const asset = await uploadMediaFile(session, file, 'document');
        added.push({
          name: asset.name,
          url: asset.url,
          sizeBytes: asset.sizeBytes,
          mimeType: asset.mimeType,
        });
      }
      setAttachments((prev) => [...prev, ...added]);
      showToast('success', `Đã đính kèm ${added.length} tài liệu`);
    } catch (err) {
      showToast('error', 'Tải tài liệu đính kèm thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setUploadingAttachment(false);
    }
  };

  const handleAddManualAttachment = () => {
    if (!attNameInput.trim() || !attUrlInput.trim()) {
      showToast('error', 'Vui lòng nhập đầy đủ tên và đường dẫn tài liệu');
      return;
    }
    setAttachments((prev) => [
      ...prev,
      { name: attNameInput.trim(), url: attUrlInput.trim(), mimeType: 'application/pdf' },
    ]);
    setAttNameInput('');
    setAttUrlInput('');
    setAttUrlOpen(false);
  };

  const handleQuickCreateCategory = async () => {
    if (quickCatName.trim().length < 2) {
      showToast('error', 'Tên danh mục phải có ít nhất 2 ký tự');
      return;
    }
    setCreatingCat(true);
    try {
      const newId = await saveCategory(session, {
        name: quickCatName.trim(),
        slug: toVietnameseSlug(quickCatName),
        description: '',
        order: categories.length + 1,
        isVisible: true,
      });
      await onCategoriesReload();
      setCategoryId(newId);
      setQuickCatName('');
      setQuickCatOpen(false);
      showToast('success', 'Đã thêm danh mục mới');
    } catch (err) {
      showToast('error', 'Không thể tạo danh mục', parseFirestoreErrorMessage(err));
    } finally {
      setCreatingCat(false);
    }
  };

  const handleApplyTT108Template = async () => {
    const tpl = TT108_PROCEDURE_TEMPLATES.find((t) => t.id === selectedTemplateId);
    if (!tpl) return;

    setApplyingTemplate(true);
    try {
      let targetCatId = categories.find((c) => c.slug === tpl.categorySlug)?.id || '';
      if (!targetCatId) {
        const catDef = TT108_CATEGORIES.find((c) => c.slug === tpl.categorySlug);
        if (catDef) {
          targetCatId = await saveCategory(session, catDef);
          await onCategoriesReload();
        }
      }
      if (targetCatId) {
        setCategoryId(targetCatId);
      }
      setSectionType(tpl.sectionType);
      setTitle(tpl.title);
      setSlug(tpl.slug);
      setSlugTouched(true);
      setShortDescription(tpl.shortDescription);
      setKeywordsText(tpl.keywords.join(', '));
      setContentHtml(tpl.contentHtml.trim());
      setIsSample(false);
      showToast(
        'success',
        'Đã nạp mẫu thủ tục theo Thông tư 108/2026/TT-BCA',
        'Vui lòng kiểm tra, bổ sung biểu mẫu đính kèm (nếu có) và nhấn ĐĂNG TẢI.'
      );
    } catch (err) {
      showToast('error', 'Không thể nạp mẫu thủ tục', parseFirestoreErrorMessage(err));
    } finally {
      setApplyingTemplate(false);
    }
  };

  const handleSave = async (targetStatus: ArticleStatus) => {
    if (title.trim().length < 3) {
      showToast('error', 'Thiếu tiêu đề bài viết', 'Tiêu đề cần ít nhất 3 ký tự.');
      return;
    }
    if (!categoryId) {
      showToast('error', 'Chưa chọn danh mục', 'Vui lòng chọn hoặc tạo mới danh mục thủ tục.');
      return;
    }
    const catObj = categories.find((c) => c.id === categoryId);
    const keywords = keywordsText
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 15);

    setSaving(true);
    try {
      await saveArticle(
        session,
        {
          title: title.trim(),
          slug: slug.trim() || toVietnameseSlug(title),
          categoryId,
          categoryName: catObj?.name || 'Thủ tục hành chính',
          sectionType,
          shortDescription: shortDescription.trim(),
          coverImage: coverImage.trim(),
          contentHtml,
          attachments,
          keywords,
          status: targetStatus,
          publishedDate: publishedDate || getTodayIsoDate(),
          isSample,
        },
        editingArticle?.id
      );

      showToast(
        'success',
        targetStatus === 'published'
          ? 'Đã đăng tải bài viết công khai!'
          : targetStatus === 'draft'
            ? 'Đã lưu bản nháp bài viết'
            : 'Đã cập nhật bài viết (Trạng thái ẩn)'
      );
      await onSaved();
    } catch (err) {
      showToast('error', 'Lưu bài viết thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Quay lại</span>
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-[#0B1F3A]">
              {editingArticle ? 'Chỉnh sửa bài viết' : 'Soạn thảo bài viết mới'}
            </h2>
            <p className="text-xs text-slate-500">
              Nội dung sau khi đăng tải sẽ xuất hiện ngay trên cổng thông tin người dân.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setPreviewOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
          >
            <Eye className="h-4 w-4" />
            <span>Xem trước</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave('draft')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            <span>Lưu bản nháp</span>
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => handleSave(status === 'hidden' ? 'hidden' : 'published')}
            className="inline-flex items-center gap-1.5 rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span>
              {saving
                ? 'Đang lưu...'
                : status === 'hidden'
                  ? 'Lưu (Đang ẩn)'
                  : 'ĐĂNG TẢI'}
            </span>
          </button>
        </div>
      </div>

      {/* TT108 Template Quick Loader (for new articles) */}
      {!editingArticle && (
        <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <BookOpen className="h-5 w-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-[#0B1F3A]">
                Mẫu hướng dẫn chuẩn theo Thông tư 108/2026/TT-BCA (Hiệu lực 01/7/2026)
              </p>
              <p className="text-xs text-slate-600 mt-0.5">
                Nạp sẵn đối tượng, thành phần hồ sơ, biểu mẫu và quy trình thực hiện để biên tập nhanh.
              </p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
            <select
              aria-label="Chọn mẫu Thông tư 108/2026/TT-BCA"
              value={selectedTemplateId}
              onChange={(e) => setSelectedTemplateId(e.target.value)}
              className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs sm:text-sm text-slate-800 max-w-xs"
            >
              {TT108_PROCEDURE_TEMPLATES.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.label}
                </option>
              ))}
            </select>
            <button
              type="button"
              disabled={applyingTemplate}
              onClick={handleApplyTT108Template}
              className="rounded-lg bg-blue-700 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer disabled:opacity-50 whitespace-nowrap"
            >
              {applyingTemplate ? 'Đang nạp...' : 'Nạp mẫu hướng dẫn'}
            </button>
          </div>
        </div>
      )}

      {/* Main Editor Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Main Content Column */}
        <div className="xl:col-span-8 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Tiêu đề bài viết <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Ví dụ: Hướng dẫn thủ tục cấp đổi Giấy phép lái xe trực tuyến"
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm sm:text-base font-medium text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Đường dẫn URL thân thiện (Slug)
              </label>
              <div className="flex items-center rounded-lg border border-slate-300 bg-slate-50 overflow-hidden">
                <span className="px-3 py-2 text-xs font-mono text-slate-500 border-r border-slate-200">
                  /thu-tuc/
                </span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => {
                    setSlugTouched(true);
                    setSlug(toVietnameseSlug(e.target.value));
                  }}
                  placeholder="doi-cap-lai-giay-phep-lai-xe"
                  className="flex-1 bg-white px-3 py-2 text-xs sm:text-sm font-mono text-slate-800 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1.5">
                Mô tả ngắn (hiển thị trên thẻ bài viết)
              </label>
              <textarea
                rows={3}
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                maxLength={600}
                placeholder="Tóm tắt ngắn gọn mục đích thủ tục, đối tượng áp dụng và thời gian giải quyết..."
                className="w-full rounded-lg border border-slate-300 px-3.5 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>
          </div>

          {/* Rich Text Editor */}
          <div>
            <label className="block text-sm font-semibold text-slate-800 mb-2">
              Nội dung hướng dẫn chi tiết (Hỗ trợ bảng biểu, chèn nhiều ảnh & kéo thả)
            </label>
            <RichTextEditor value={contentHtml} onChange={setContentHtml} session={session} />
          </div>

          {/* Attachments Section */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-[#0B1F3A]">
                  Tài liệu đính kèm (PDF, DOCX, XLSX...)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Biểu mẫu tờ khai hoặc văn bản quy định để người dân tải xuống.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={uploadingAttachment}
                  onClick={() => attInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-800 hover:bg-blue-100 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{uploadingAttachment ? 'Đang tải...' : 'Tải tệp lên'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAttUrlOpen((p) => !p)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Link2 className="h-3.5 w-3.5" />
                  <span>Thêm URL tệp</span>
                </button>
              </div>
            </div>

            <input
              ref={attInputRef}
              type="file"
              multiple
              accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
              className="hidden"
              onChange={(e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                if (files.length > 0) void handleAttachmentUpload(files);
                e.target.value = '';
              }}
            />

            {attUrlOpen && (
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                <input
                  type="text"
                  value={attNameInput}
                  onChange={(e) => setAttNameInput(e.target.value)}
                  placeholder="Tên tài liệu (VD: Mẫu đơn đề nghị.pdf)"
                  className="sm:col-span-5 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                />
                <input
                  type="url"
                  value={attUrlInput}
                  onChange={(e) => setAttUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="sm:col-span-5 rounded border border-slate-300 bg-white px-2.5 py-1.5 text-xs"
                />
                <button
                  type="button"
                  onClick={handleAddManualAttachment}
                  className="sm:col-span-2 rounded bg-[#0B1F3A] px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-800 cursor-pointer"
                >
                  Thêm
                </button>
              </div>
            )}

            {attachments.length === 0 ? (
              <p className="text-xs text-slate-500 italic">Chưa có tài liệu đính kèm.</p>
            ) : (
              <ul className="divide-y divide-slate-200 rounded-lg border border-slate-200">
                {attachments.map((att, idx) => (
                  <li
                    key={`${att.url}-${idx}`}
                    className="flex items-center justify-between gap-3 px-3.5 py-2.5 text-xs"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{att.name}</p>
                      <p className="text-slate-500 font-mono truncate">
                        {att.sizeBytes ? `${formatBytes(att.sizeBytes)} · ` : ''}
                        {att.url}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setAttachments((prev) => prev.filter((_, i) => i !== idx))
                      }
                      aria-label="Gỡ tài liệu"
                      className="text-red-600 hover:text-red-800 p-1 cursor-pointer shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right Metadata Sidebar */}
        <div className="xl:col-span-4 space-y-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
            <h3 className="text-sm font-bold text-[#0B1F3A] border-b border-slate-100 pb-2.5">
              Phân loại & Xuất bản
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Chuyên mục cổng thông tin
              </label>
              <select
                value={sectionType}
                onChange={(e) => setSectionType(e.target.value as SectionType)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              >
                <option value="procedure">Thủ tục giải quyết hành chính</option>
                <option value="guide">Hướng dẫn thực hiện</option>
                <option value="news">Tin tức – Thông báo</option>
              </select>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700">
                  Danh mục thủ tục <span className="text-red-600">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setQuickCatOpen((p) => !p)}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Thêm danh mục</span>
                </button>
              </div>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              >
                {categories.length === 0 ? (
                  <option value="">— Chưa có danh mục nào —</option>
                ) : (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))
                )}
              </select>

              {quickCatOpen && (
                <div className="mt-2 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 p-2">
                  <input
                    type="text"
                    value={quickCatName}
                    onChange={(e) => setQuickCatName(e.target.value)}
                    placeholder="Tên danh mục mới..."
                    className="flex-1 rounded border border-slate-300 bg-white px-2.5 py-1 text-xs"
                  />
                  <button
                    type="button"
                    disabled={creatingCat}
                    onClick={handleQuickCreateCategory}
                    className="rounded bg-[#0B1F3A] px-2.5 py-1 text-xs font-semibold text-white cursor-pointer"
                  >
                    {creatingCat ? '...' : 'Tạo'}
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ngày đăng hiển thị
              </label>
              <input
                type="date"
                value={publishedDate}
                onChange={(e) => setPublishedDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono tabular-nums text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Trạng thái bài viết
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ArticleStatus)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
              >
                <option value="published">Đã xuất bản (Hiển thị công khai)</option>
                <option value="draft">Bản nháp (Chỉ Admin xem)</option>
                <option value="hidden">Đã ẩn (Tạm ngừng hiển thị)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Từ khóa tìm kiếm (cách nhau bởi dấu phẩy)
              </label>
              <input
                type="text"
                value={keywordsText}
                onChange={(e) => setKeywordsText(e.target.value)}
                placeholder="gplx, cấp đổi, bằng lái, hồ sơ"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-700 focus:outline-none"
              />
            </div>

            <label className="flex items-start gap-2.5 pt-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isSample}
                onChange={(e) => setIsSample(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-[#0B1F3A]"
              />
              <span className="text-xs text-slate-600 leading-relaxed">
                Đánh dấu là <strong>nội dung tham khảo mẫu</strong> (hiển thị nhãn phân biệt với văn bản chính thức).
              </span>
            </label>
          </div>

          {/* Cover Image Manager */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#0B1F3A]">Ảnh bìa bài viết</h3>
              <button
                type="button"
                disabled={uploadingCover}
                onClick={() => coverInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-200 cursor-pointer disabled:opacity-50"
              >
                <ImageIcon className="h-3.5 w-3.5" />
                <span>{uploadingCover ? 'Đang tải...' : 'Tải ảnh bìa'}</span>
              </button>
            </div>

            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleCoverUpload(f);
                e.target.value = '';
              }}
            />

            <div className="aspect-[16/10] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              <SafeImage
                src={coverImage || DEFAULT_PROCEDURE_COVER}
                alt="Xem trước ảnh bìa"
                className="h-full w-full object-cover"
              />
            </div>

            <input
              type="url"
              value={coverImage}
              onChange={(e) => setCoverImage(e.target.value)}
              placeholder="Hoặc dán đường dẫn URL ảnh bìa..."
              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs text-slate-800 focus:border-blue-700 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Article Preview Modal */}
      {previewOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4"
        >
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0B1F3A]">
                <FilePlus2 className="h-4 w-4 text-blue-700" />
                <span>Xem trước hiển thị bài viết</span>
              </div>
              <button
                type="button"
                onClick={() => setPreviewOpen(false)}
                className="rounded-lg border border-slate-200 p-1.5 text-slate-500 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 sm:p-10">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B1F3A]">
                {title || 'Chưa nhập tiêu đề bài viết'}
              </h1>
              {shortDescription && (
                <p className="mt-3 text-base text-slate-600 font-medium">{shortDescription}</p>
              )}
              <div className="mt-6 overflow-hidden rounded-xl border border-slate-200">
                <SafeImage
                  src={coverImage || DEFAULT_PROCEDURE_COVER}
                  alt={title}
                  className="w-full max-h-[380px] object-cover"
                />
              </div>
              <div
                className="portal-prose mt-8"
                dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(contentHtml) }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
