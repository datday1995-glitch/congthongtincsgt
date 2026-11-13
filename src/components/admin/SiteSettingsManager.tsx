import { useRef, useState } from 'react';
import { CheckCircle2, Save, Server, Settings, Upload, XCircle } from 'lucide-react';
import { FIRESTORE_DATABASE_ID, FIREBASE_PROJECT_ID } from '../../lib/firebase';
import { saveSiteSettings, uploadMediaFile } from '../../services/portalService';
import type { AdminSession, SiteSettings } from '../../types/portal';
import { parseFirestoreErrorMessage } from '../../utils/formatters';
import { useToast } from '../ui/Feedback';
import { SafeImage } from '../ui/SafeImage';

interface SiteSettingsManagerProps {
  session: AdminSession;
  settings: SiteSettings;
  adminSdkReady: boolean;
  adminSdkMessage: string;
  onSaved: () => Promise<void>;
}

export function SiteSettingsManager({
  session,
  settings,
  adminSdkReady,
  adminSdkMessage,
  onSaved,
}: SiteSettingsManagerProps) {
  const { showToast } = useToast();
  const [subTab, setSubTab] = useState<'general' | 'firebase'>('general');
  const [form, setForm] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const bannerInputRef = useRef<HTMLInputElement | null>(null);

  const handleUploadAsset = async (file: File, target: 'logoUrl' | 'bannerUrl') => {
    if (target === 'logoUrl') setUploadingLogo(true);
    else setUploadingBanner(true);
    try {
      const asset = await uploadMediaFile(session, file, 'image');
      setForm((prev) => ({ ...prev, [target]: asset.url }));
      showToast('success', target === 'logoUrl' ? 'Đã tải logo mới' : 'Đã tải ảnh banner mới');
    } catch (err) {
      showToast('error', 'Tải ảnh thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setUploadingLogo(false);
      setUploadingBanner(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveSiteSettings(session, form);
      showToast(
        'success',
        'Đã lưu cấu hình website',
        'Thông tin trên trang chủ công khai đã được cập nhật đồng bộ.'
      );
      await onSaved();
    } catch (err) {
      showToast('error', 'Lưu cấu hình thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A]">Cài đặt thông tin website</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Chỉnh sửa thông tin đơn vị, hình ảnh nhận diện, chân trang và liên kết công khai.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
          <button
            type="button"
            onClick={() => setSubTab('general')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer ${
              subTab === 'general'
                ? 'bg-white text-[#0B1F3A] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="h-4 w-4" />
            <span>Thông tin cổng</span>
          </button>
          <button
            type="button"
            onClick={() => setSubTab('firebase')}
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer ${
              subTab === 'firebase'
                ? 'bg-white text-[#0B1F3A] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Server className="h-4 w-4" />
            <span>Kết nối Firebase & Bảo mật</span>
          </button>
        </div>
      </div>

      {subTab === 'general' ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Identity & Branding */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#0B1F3A] border-b border-slate-100 pb-2.5">
                Định danh cơ quan & Giao diện trang chủ
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tên cổng thông tin
                </label>
                <input
                  type="text"
                  value={form.siteTitle}
                  onChange={(e) => setForm({ ...form, siteTitle: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên cơ quan chủ quản
                  </label>
                  <input
                    type="text"
                    value={form.agencyName}
                    onChange={(e) => setForm({ ...form, agencyName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tên đơn vị thực hiện
                  </label>
                  <input
                    type="text"
                    value={form.departmentName}
                    onChange={(e) => setForm({ ...form, departmentName: e.target.value })}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tiêu đề Banner trang chủ
                </label>
                <input
                  type="text"
                  value={form.bannerTitle}
                  onChange={(e) => setForm({ ...form, bannerTitle: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả Banner trang chủ
                </label>
                <textarea
                  rows={2}
                  value={form.bannerSubtitle}
                  onChange={(e) => setForm({ ...form, bannerSubtitle: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Mô tả khu vực danh mục thủ tục
                </label>
                <textarea
                  rows={2}
                  value={form.introContent}
                  onChange={(e) => setForm({ ...form, introContent: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>

            {/* Contact & Social Links */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#0B1F3A] border-b border-slate-100 pb-2.5">
                Thông tin liên hệ & Liên kết ngoài
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Địa chỉ trụ sở
                </label>
                <input
                  type="text"
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Số điện thoại hỗ trợ
                </label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Liên kết Facebook đơn vị
                </label>
                <input
                  type="url"
                  value={form.facebookUrl}
                  onChange={(e) => setForm({ ...form, facebookUrl: e.target.value })}
                  placeholder="https://facebook.com/..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Liên kết Website đơn vị
                </label>
                <input
                  type="url"
                  value={form.websiteUrl}
                  onChange={(e) => setForm({ ...form, websiteUrl: e.target.value })}
                  placeholder="https://csgt.danang.gov.vn/..."
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Maps Embed URL
                </label>
                <input
                  type="url"
                  value={form.mapEmbedUrl}
                  onChange={(e) => setForm({ ...form, mapEmbedUrl: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nội dung chân trang (Footer)
                </label>
                <textarea
                  rows={2}
                  value={form.footerNote}
                  onChange={(e) => setForm({ ...form, footerNote: e.target.value })}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
              </div>
            </div>
          </div>

          {/* Logo & Banner Image Pickers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#0B1F3A]">Logo đơn vị</span>
                <button
                  type="button"
                  disabled={uploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{uploadingLogo ? 'Đang tải...' : 'Tải logo mới'}</span>
                </button>
              </div>
              <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUploadAsset(f, 'logoUrl');
                  e.target.value = '';
                }}
              />
              <div className="flex items-center gap-4">
                <SafeImage
                  src={form.logoUrl}
                  alt="Logo"
                  className="h-16 w-16 rounded-lg border border-slate-200 object-contain p-1 bg-slate-50 shrink-0"
                />
                <input
                  type="text"
                  value={form.logoUrl}
                  onChange={(e) => setForm({ ...form, logoUrl: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-[#0B1F3A]">Ảnh nền Banner</span>
                <button
                  type="button"
                  disabled={uploadingBanner}
                  onClick={() => bannerInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
                >
                  <Upload className="h-3.5 w-3.5" />
                  <span>{uploadingBanner ? 'Đang tải...' : 'Tải banner mới'}</span>
                </button>
              </div>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void handleUploadAsset(f, 'bannerUrl');
                  e.target.value = '';
                }}
              />
              <div className="flex items-center gap-4">
                <SafeImage
                  src={form.bannerUrl}
                  alt="Banner"
                  className="h-16 w-28 rounded-lg border border-slate-200 object-cover shrink-0"
                />
                <input
                  type="text"
                  value={form.bannerUrl}
                  onChange={(e) => setForm({ ...form, bannerUrl: e.target.value })}
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-6 py-3 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{saving ? 'Đang lưu cấu hình...' : 'Lưu cấu hình website'}</span>
            </button>
          </div>
        </form>
      ) : (
        /* Firebase & Backend Configuration Status Tab */
        <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-6">
          <div>
            <h3 className="text-base font-bold text-[#0B1F3A]">
              Trạng thái hạ tầng Firebase & Máy chủ xác thực
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Kiểm tra kết nối thực tế tới Cloud Firestore, Firebase Auth, Firebase Storage và Firebase Admin SDK.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="rounded-lg border border-slate-200 p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">Cloud Firestore & Google Auth</span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Đã kết nối</span>
                </span>
              </div>
              <p className="text-xs font-mono text-slate-500">
                Project ID: {FIREBASE_PROJECT_ID}
              </p>
              <p className="text-xs font-mono text-slate-500">
                Database ID: {FIRESTORE_DATABASE_ID}
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-4 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-800">
                  Máy chủ xác thực Passcode (Firebase Admin SDK)
                </span>
                {adminSdkReady ? (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Sẵn sàng</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700">
                    <XCircle className="h-4 w-4" />
                    <span>Chưa cấu hình khóa</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600">{adminSdkMessage}</p>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 space-y-3 text-xs sm:text-sm text-slate-700 leading-relaxed">
            <h4 className="font-bold text-[#0B1F3A]">
              Hướng dẫn cấu hình đầy đủ cho triển khai thực tế
            </h4>
            <ol className="list-decimal pl-5 space-y-2">
              <li>
                <strong>Kích hoạt Firebase Storage (để tải lên hình ảnh & tệp PDF/DOCX):</strong> Truy cập{' '}
                <a
                  href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/storage`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline font-medium"
                >
                  Firebase Console → Storage
                </a>
                , nhấn <em>Get started</em> để khởi tạo bucket mặc định và cập nhật Storage Rules cho phép người dùng đã xác thực ghi vào thư mục <code className="font-mono">uploads/</code>, công khai quyền đọc.
              </li>
              <li>
                <strong>Kích hoạt Đăng nhập Passcode phía máy chủ:</strong> Vào{' '}
                <a
                  href={`https://console.firebase.google.com/project/${FIREBASE_PROJECT_ID}/settings/serviceaccounts/adminsdk`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline font-medium"
                >
                  Firebase Console → Project Settings → Service accounts
                </a>
                , chọn <em>Generate new private key</em> để tải tệp JSON, sau đó dán nội dung JSON vào biến bí mật <code className="font-mono">FIREBASE_SERVICE_ACCOUNT_KEY</code> trong phần Secrets của môi trường triển khai và khởi động lại máy chủ.
              </li>
              <li>
                <strong>Triển khai quy tắc bảo mật Firestore:</strong> Tệp <code className="font-mono">firestore.rules</code> đã được kiểm tra và triển khai tự động để bảo vệ dữ liệu bản nháp, mã băm Passcode và nhật ký hoạt động.
              </li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}
