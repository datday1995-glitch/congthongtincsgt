import { useRef, useState } from 'react';
import { Check, Copy, FileText, Image as ImageIcon, Link2, Trash2, Upload } from 'lucide-react';
import {
  deleteMediaAsset,
  registerExternalMedia,
  uploadMediaFile,
} from '../../services/portalService';
import type { AdminSession, MediaAsset } from '../../types/portal';
import { formatBytes, parseFirestoreErrorMessage } from '../../utils/formatters';
import { ConfirmModal, useToast } from '../ui/Feedback';
import { SafeImage } from '../ui/SafeImage';

interface MediaManagerProps {
  session: AdminSession;
  mediaList: MediaAsset[];
  onReload: () => Promise<void>;
}

export function MediaManager({ session, mediaList, onReload }: MediaManagerProps) {
  const { showToast } = useToast();
  const canEdit = !session.isReadOnly && session.role !== 'viewer';
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MediaAsset | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [extName, setExtName] = useState('');
  const [extUrl, setExtUrl] = useState('');
  const [extKind, setExtKind] = useState<'image' | 'document'>('image');
  const [addingExt, setAddingExt] = useState(false);

  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const docInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadFiles = async (files: File[], kind: 'image' | 'document') => {
    setUploading(true);
    try {
      for (const file of files) {
        await uploadMediaFile(session, file, kind);
      }
      showToast('success', `Đã tải lên ${files.length} tệp thành công`);
      await onReload();
    } catch (err) {
      showToast('error', 'Tải tệp thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const handleRegisterUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!extName.trim() || !extUrl.trim()) {
      showToast('error', 'Vui lòng nhập tên và đường dẫn URL');
      return;
    }
    setAddingExt(true);
    try {
      await registerExternalMedia(session, {
        name: extName.trim(),
        url: extUrl.trim(),
        kind: extKind,
      });
      setExtName('');
      setExtUrl('');
      showToast('success', 'Đã lưu liên kết tài nguyên');
      await onReload();
    } catch (err) {
      showToast('error', 'Lưu liên kết thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setAddingExt(false);
    }
  };

  const handleCopy = (asset: MediaAsset) => {
    void navigator.clipboard.writeText(asset.url);
    setCopiedId(asset.id);
    showToast('info', 'Đã sao chép đường dẫn tệp');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteMediaAsset(session, deleteTarget);
      showToast('success', 'Đã xóa tài nguyên', deleteTarget.name);
      setDeleteTarget(null);
      await onReload();
    } catch (err) {
      showToast('error', 'Không thể xóa tài nguyên', parseFirestoreErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A]">Quản lý hình ảnh & tài liệu</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Kho lưu trữ ảnh minh họa và biểu mẫu PDF/DOCX dùng chung cho toàn cổng thông tin.
          </p>
        </div>

        {canEdit && (
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              disabled={uploading}
              onClick={() => imageInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2 text-xs sm:text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer disabled:opacity-50"
            >
              <ImageIcon className="h-4 w-4" />
              <span>{uploading ? 'Đang tải...' : 'Tải hình ảnh (tự nén)'}</span>
            </button>
            <button
              type="button"
              disabled={uploading}
              onClick={() => docInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs sm:text-sm font-semibold text-slate-800 hover:bg-slate-50 cursor-pointer disabled:opacity-50"
            >
              <Upload className="h-4 w-4" />
              <span>Tải tài liệu (PDF/DOCX)</span>
            </button>
          </div>
        )}
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          if (files.length > 0) void handleUploadFiles(files, 'image');
          e.target.value = '';
        }}
      />
      <input
        ref={docInputRef}
        type="file"
        accept=".pdf,.doc,.docx,.xls,.xlsx,.zip"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files ? Array.from(e.target.files) : [];
          if (files.length > 0) void handleUploadFiles(files, 'document');
          e.target.value = '';
        }}
      />

      {/* Register External URL */}
      {canEdit && (
        <form
          onSubmit={handleRegisterUrl}
          className="rounded-xl border border-slate-200 bg-white p-4 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
        >
          <div className="sm:col-span-3 flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Link2 className="h-4 w-4 text-blue-700 shrink-0" />
            <span>Lưu liên kết tài nguyên ngoài:</span>
          </div>
          <input
            type="text"
            value={extName}
            onChange={(e) => setExtName(e.target.value)}
            placeholder="Tên hiển thị..."
            className="sm:col-span-3 rounded-lg border border-slate-300 px-3 py-2 text-xs"
          />
          <input
            type="url"
            value={extUrl}
            onChange={(e) => setExtUrl(e.target.value)}
            placeholder="https://..."
            className="sm:col-span-3 rounded-lg border border-slate-300 px-3 py-2 text-xs"
          />
          <select
            value={extKind}
            onChange={(e) => setExtKind(e.target.value as 'image' | 'document')}
            className="sm:col-span-1 rounded-lg border border-slate-300 bg-white px-2 py-2 text-xs"
          >
            <option value="image">Ảnh</option>
            <option value="document">Tài liệu</option>
          </select>
          <button
            type="submit"
            disabled={addingExt}
            className="sm:col-span-2 rounded-lg bg-blue-700 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-800 cursor-pointer disabled:opacity-50"
          >
            {addingExt ? 'Đang lưu...' : 'Lưu liên kết'}
          </button>
        </form>
      )}

      {/* Media Grid */}
      {mediaList.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          Chưa có hình ảnh hoặc tài liệu nào được tải lên.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {mediaList.map((asset) => (
            <div
              key={asset.id}
              className="rounded-xl border border-slate-200 bg-white overflow-hidden flex flex-col"
            >
              {asset.kind === 'image' ? (
                <div className="aspect-[16/10] bg-slate-100 border-b border-slate-100">
                  <SafeImage
                    src={asset.url}
                    alt={asset.name}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-[16/10] bg-slate-50 border-b border-slate-100 flex flex-col items-center justify-center p-4 text-center">
                  <FileText className="h-9 w-9 text-blue-700" />
                  <span className="mt-2 text-xs font-mono text-slate-500 uppercase">
                    {asset.mimeType.split('/').pop() || 'DOCUMENT'}
                  </span>
                </div>
              )}

              <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900 truncate" title={asset.name}>
                    {asset.name}
                  </p>
                  <p className="text-xs text-slate-500 font-mono tabular-nums mt-0.5">
                    {asset.sizeBytes ? formatBytes(asset.sizeBytes) : 'Liên kết ngoài'} · {asset.uploadedByName}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleCopy(asset)}
                    className="inline-flex items-center gap-1.5 rounded border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
                  >
                    {copiedId === asset.id ? (
                      <Check className="h-3.5 w-3.5 text-emerald-700" />
                    ) : (
                      <Copy className="h-3.5 w-3.5" />
                    )}
                    <span>{copiedId === asset.id ? 'Đã chép' : 'Chép URL'}</span>
                  </button>

                  {session.mode === 'google' && canEdit && (
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(asset)}
                      title="Xóa tài nguyên"
                      className="p-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Xác nhận xóa tài nguyên"
        description={`Bạn có chắc muốn xóa "${deleteTarget?.name}" khỏi thư viện? Nếu tệp đang được gắn trong bài viết, liên kết cũ có thể không hiển thị được nữa.`}
        confirmLabel="Xóa tệp"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}
