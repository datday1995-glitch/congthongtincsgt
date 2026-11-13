import { useState } from 'react';
import {
  AlertCircle,
  Check,
  Copy,
  KeyRound,
  Lock,
  Mail,
  Pencil,
  Plus,
  RefreshCw,
  ShieldCheck,
  Trash2,
  Unlock,
} from 'lucide-react';
import {
  createPasscodeAccount,
  deleteAuthorizedAdmin,
  deletePasscodeAccount,
  saveAuthorizedAdmin,
  updatePasscodeAccount,
} from '../../services/portalService';
import type { AdminSession, AdminUser, PasscodeAccount } from '../../types/portal';
import { formatDateTimeVi, parseFirestoreErrorMessage } from '../../utils/formatters';
import { ConfirmModal, useToast } from '../ui/Feedback';

interface PasscodeManagerProps {
  session: AdminSession;
  passcodes: PasscodeAccount[];
  admins: AdminUser[];
  adminSdkReady: boolean;
  onReload: () => Promise<void>;
}

export function PasscodeManager({
  session,
  passcodes,
  admins,
  adminSdkReady,
  onReload,
}: PasscodeManagerProps) {
  const { showToast } = useToast();
  const [subTab, setSubTab] = useState<'passcodes' | 'gmail'>('passcodes');

  // Create Passcode Form
  const [ownerName, setOwnerName] = useState('');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [note, setNote] = useState('');
  const [status, setStatus] = useState<'active' | 'locked'>('active');
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [lastCreatedSecret, setLastCreatedSecret] = useState<{
    ownerName: string;
    passcode: string;
  } | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);

  // Edit / Change Passcode Modal
  const [editingAccount, setEditingAccount] = useState<PasscodeAccount | null>(null);
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editNote, setEditNote] = useState('');
  const [editNewPasscode, setEditNewPasscode] = useState('');
  const [editError, setEditError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Delete confirmation
  const [deleteTarget, setDeleteTarget] = useState<PasscodeAccount | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Gmail Admin Form
  const [gmailEmail, setGmailEmail] = useState('');
  const [gmailName, setGmailName] = useState('');
  const [gmailRole, setGmailRole] = useState<'editor' | 'super_admin' | 'viewer'>('editor');
  const [savingGmail, setSavingGmail] = useState(false);
  const [deleteGmailTarget, setDeleteGmailTarget] = useState<AdminUser | null>(null);

  const generateLocalRandomPasscode = (length = 10): string => {
    const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#';
    const bytes = new Uint8Array(length);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
  };

  const handleGenerateRandom = async () => {
    setFormError(null);
    let generated = '';
    try {
      const res = await fetch('/api/security/generate-passcode', { method: 'POST' });
      const rawText = await res.text();
      const json = JSON.parse(rawText) as { passcode?: string };
      if (res.ok && json.passcode) {
        generated = json.passcode;
      }
    } catch {
      // fallback below
    }
    if (!generated) {
      generated = generateLocalRandomPasscode(10);
    }
    setPasscode(generated);
    setConfirmPasscode(generated);
    showToast('info', 'Đã tạo mã Passcode ngẫu nhiên mạnh');
  };

  const handleCreatePasscode = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const cleanOwner = ownerName.trim();
    const cleanPasscode = passcode.trim();
    const cleanConfirm = confirmPasscode.trim();

    if (cleanOwner.length < 2) {
      const msg = 'Vui lòng nhập họ tên người sở hữu (tối thiểu 2 ký tự).';
      setFormError(msg);
      showToast('error', msg);
      return;
    }
    if (cleanPasscode.length < 6) {
      const msg = 'Mã Passcode phải có ít nhất 6 ký tự.';
      setFormError(msg);
      showToast('error', msg);
      return;
    }
    if (cleanPasscode.length > 128) {
      const msg = 'Mã Passcode không được vượt quá 128 ký tự.';
      setFormError(msg);
      showToast('error', msg);
      return;
    }
    if (cleanPasscode !== cleanConfirm) {
      const msg = 'Xác nhận Passcode không khớp. Vui lòng kiểm tra lại.';
      setFormError(msg);
      showToast('error', msg);
      return;
    }

    setCreating(true);
    try {
      await createPasscodeAccount(session, {
        ownerName: cleanOwner,
        passcode: cleanPasscode,
        note: note.trim(),
        status,
      });
      setLastCreatedSecret({ ownerName: cleanOwner, passcode: cleanPasscode });
      setOwnerName('');
      setPasscode('');
      setConfirmPasscode('');
      setNote('');
      setStatus('active');
      showToast('success', 'Đã tạo tài khoản Passcode thành công');
      await onReload();
    } catch (err) {
      const detail = parseFirestoreErrorMessage(err);
      setFormError(detail);
      showToast('error', 'Tạo Passcode thất bại', detail);
    } finally {
      setCreating(false);
    }
  };

  const openEditModal = (acc: PasscodeAccount) => {
    setEditingAccount(acc);
    setEditOwnerName(acc.ownerName);
    setEditNote(acc.note || '');
    setEditNewPasscode('');
    setEditError(null);
  };

  const handleUpdateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccount) return;
    setEditError(null);
    if (editOwnerName.trim().length < 2) {
      const msg = 'Họ và tên người sở hữu phải có ít nhất 2 ký tự.';
      setEditError(msg);
      showToast('error', msg);
      return;
    }
    if (editNewPasscode.trim() && editNewPasscode.trim().length < 6) {
      const msg = 'Passcode mới phải có ít nhất 6 ký tự.';
      setEditError(msg);
      showToast('error', msg);
      return;
    }
    setUpdating(true);
    try {
      await updatePasscodeAccount(session, editingAccount, {
        ownerName: editOwnerName.trim(),
        note: editNote.trim(),
        newPasscode: editNewPasscode.trim() || undefined,
      });
      showToast('success', 'Đã cập nhật tài khoản Passcode');
      setEditingAccount(null);
      await onReload();
    } catch (err) {
      const detail = parseFirestoreErrorMessage(err);
      setEditError(detail);
      showToast('error', 'Cập nhật thất bại', detail);
    } finally {
      setUpdating(false);
    }
  };

  const handleToggleLock = async (acc: PasscodeAccount) => {
    const nextStatus = acc.status === 'active' ? 'locked' : 'active';
    try {
      await updatePasscodeAccount(session, acc, { status: nextStatus });
      showToast(
        'success',
        nextStatus === 'locked' ? 'Đã khóa quyền truy cập' : 'Đã mở khóa tài khoản',
        acc.ownerName
      );
      await onReload();
    } catch (err) {
      showToast('error', 'Thao tác thất bại', parseFirestoreErrorMessage(err));
    }
  };

  const handleDeletePasscode = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePasscodeAccount(session, deleteTarget);
      showToast('success', 'Đã xóa tài khoản Passcode', deleteTarget.ownerName);
      setDeleteTarget(null);
      await onReload();
    } catch (err) {
      showToast('error', 'Xóa thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleAddGmailAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = gmailEmail.trim().toLowerCase();
    if (!cleanEmail.includes('@')) {
      showToast('error', 'Địa chỉ Gmail không hợp lệ');
      return;
    }
    setSavingGmail(true);
    try {
      await saveAuthorizedAdmin(session, {
        email: cleanEmail,
        displayName: gmailName.trim() || cleanEmail.split('@')[0],
        role: gmailRole,
        status: 'active',
      });
      setGmailEmail('');
      setGmailName('');
      showToast('success', 'Đã cấp quyền Gmail quản trị', cleanEmail);
      await onReload();
    } catch (err) {
      showToast('error', 'Cấp quyền thất bại', parseFirestoreErrorMessage(err));
    } finally {
      setSavingGmail(false);
    }
  };

  const handleDeleteGmail = async () => {
    if (!deleteGmailTarget) return;
    try {
      await deleteAuthorizedAdmin(session, deleteGmailTarget.id);
      showToast('success', 'Đã thu hồi quyền Gmail', deleteGmailTarget.email);
      setDeleteGmailTarget(null);
      await onReload();
    } catch (err) {
      showToast('error', 'Thu hồi thất bại', parseFirestoreErrorMessage(err));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#0B1F3A]">QUẢN LÝ TÀI KHOẢN TRUY CẬP</h2>
          <p className="text-sm text-slate-600 mt-0.5">
            Cấp phát mã Passcode riêng cho cán bộ và quản lý danh sách Gmail được phân quyền.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-lg bg-slate-200/70 p-1">
          <button
            type="button"
            onClick={() => setSubTab('passcodes')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'passcodes'
                ? 'bg-white text-[#0B1F3A] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tài khoản Passcode ({passcodes.length})
          </button>
          <button
            type="button"
            onClick={() => setSubTab('gmail')}
            className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              subTab === 'gmail'
                ? 'bg-white text-[#0B1F3A] shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Gmail quản trị ({admins.length})
          </button>
        </div>
      </div>

      {!adminSdkReady && subTab === 'passcodes' && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs sm:text-sm text-amber-900">
          <p className="font-bold">Lưu ý kích hoạt đăng nhập Passcode phía máy chủ</p>
          <p className="mt-1 leading-relaxed">
            Các mã Passcode vẫn được mã hóa bằng thuật toán <code className="font-mono">scrypt</code> và lưu an toàn vào Firestore ngay lúc này. Để cán bộ có thể sử dụng Passcode đăng nhập trên cổng <code className="font-mono">/admin</code>, Quản trị viên chính cần thêm <code className="font-mono">FIREBASE_SERVICE_ACCOUNT_KEY</code> vào mục Secrets (xem hướng dẫn chi tiết tại mục <strong>Cài đặt website</strong>).
          </p>
        </div>
      )}

      {subTab === 'passcodes' ? (
        <div className="space-y-6">
          {/* Copy-once banner */}
          {lastCreatedSecret && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="text-sm text-emerald-950">
                <p className="font-bold">
                  Đã tạo Passcode cho cán bộ: {lastCreatedSecret.ownerName}
                </p>
                <p className="text-xs text-emerald-800 mt-0.5">
                  Mã Passcode chỉ hiển thị một lần duy nhất vì lý do bảo mật (hệ thống chỉ lưu mã băm). Vui lòng sao chép để bàn giao cho cán bộ:
                </p>
                <p className="mt-1.5 font-mono text-base font-bold text-[#0B1F3A]">
                  {lastCreatedSecret.passcode}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    void navigator.clipboard.writeText(lastCreatedSecret.passcode);
                    setCopiedSecret(true);
                    setTimeout(() => setCopiedSecret(false), 2000);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-emerald-800 cursor-pointer"
                >
                  {copiedSecret ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span>{copiedSecret ? 'Đã chép' : 'Sao chép mã'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setLastCreatedSecret(null)}
                  className="rounded-lg border border-emerald-300 bg-white px-3 py-2 text-xs font-medium text-emerald-900 cursor-pointer"
                >
                  Đóng
                </button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Create Passcode Form */}
            <form
              onSubmit={handleCreatePasscode}
              className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
                  <KeyRound className="h-4 w-4 text-blue-700" />
                  <span>Cấp Passcode mới</span>
                </h3>
                <button
                  type="button"
                  onClick={handleGenerateRandom}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-700 hover:underline cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>Tạo ngẫu nhiên</span>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Họ và tên người được cấp quyền <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Passcode (tối thiểu 6 ký tự) <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Nhập hoặc tạo mã ngẫu nhiên"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Xác nhận Passcode <span className="text-red-600">*</span>
                </label>
                <input
                  type="text"
                  value={confirmPasscode}
                  onChange={(e) => setConfirmPasscode(e.target.value)}
                  placeholder="Nhập lại mã Passcode"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú (không bắt buộc)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Cán bộ Đội Đăng ký xe"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Trạng thái ban đầu
                </label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'active' | 'locked')}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
                >
                  <option value="active">Hoạt động</option>
                  <option value="locked">Tạm khóa</option>
                </select>
              </div>

              {formError && (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-700 shrink-0 mt-0.5" />
                  <span className="leading-relaxed break-words">{formError}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={creating}
                className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                <span>{creating ? 'Đang mã hóa & lưu...' : 'Tạo Passcode'}</span>
              </button>
            </form>

            {/* Passcode Management Table */}
            <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
                      <th className="py-3 px-4 w-12">STT</th>
                      <th className="py-3 px-4">Người sở hữu</th>
                      <th className="py-3 px-4">Trạng thái</th>
                      <th className="py-3 px-4">Đăng nhập gần nhất</th>
                      <th className="py-3 px-4 text-right">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-sm">
                    {passcodes.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-slate-500">
                          Chưa có tài khoản Passcode nào được cấp.
                        </td>
                      </tr>
                    ) : (
                      passcodes.map((acc, index) => (
                        <tr key={acc.id} className="hover:bg-slate-50/70">
                          <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                            {index + 1}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-slate-900">{acc.ownerName}</p>
                            {acc.note && (
                              <p className="text-xs text-slate-500 mt-0.5">{acc.note}</p>
                            )}
                          </td>
                          <td className="py-3 px-4">
                            {acc.status === 'active' ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                                <ShieldCheck className="h-3.5 w-3.5" />
                                <span>Hoạt động</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700">
                                <Lock className="h-3.5 w-3.5" />
                                <span>Đã khóa</span>
                              </span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-xs font-mono tabular-nums text-slate-600">
                            {acc.lastLoginAt ? formatDateTimeVi(acc.lastLoginAt) : 'Chưa đăng nhập'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="inline-flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => openEditModal(acc)}
                                title="Sửa tên / Đổi Passcode"
                                className="p-1.5 rounded border border-slate-200 text-slate-600 hover:bg-slate-100 cursor-pointer"
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleLock(acc)}
                                title={acc.status === 'active' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}
                                className={`p-1.5 rounded border cursor-pointer ${
                                  acc.status === 'active'
                                    ? 'border-amber-200 text-amber-700 hover:bg-amber-50'
                                    : 'border-emerald-200 text-emerald-700 hover:bg-emerald-50'
                                }`}
                              >
                                {acc.status === 'active' ? (
                                  <Lock className="h-3.5 w-3.5" />
                                ) : (
                                  <Unlock className="h-3.5 w-3.5" />
                                )}
                              </button>
                              <button
                                type="button"
                                onClick={() => setDeleteTarget(acc)}
                                title="Xóa tài khoản"
                                className="p-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Authorized Gmail Admins Tab */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <form
            onSubmit={handleAddGmailAdmin}
            className="lg:col-span-4 rounded-xl border border-slate-200 bg-white p-5 space-y-4"
          >
            <h3 className="text-sm font-bold text-[#0B1F3A] flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-700" />
              <span>Cấp quyền Gmail mới</span>
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Địa chỉ Gmail <span className="text-red-600">*</span>
              </label>
              <input
                type="email"
                value={gmailEmail}
                onChange={(e) => setGmailEmail(e.target.value)}
                placeholder="canbo.csgt@gmail.com"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên cán bộ
              </label>
              <input
                type="text"
                value={gmailName}
                onChange={(e) => setGmailName(e.target.value)}
                placeholder="VD: Trần Văn B"
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phân quyền
              </label>
              <select
                value={gmailRole}
                onChange={(e) => setGmailRole(e.target.value as 'editor' | 'super_admin' | 'viewer')}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-blue-700 focus:outline-none"
              >
                <option value="editor">Biên tập viên (Thêm, sửa, xuất bản, xóa nội dung)</option>
                <option value="viewer">Người xem (Chỉ tra cứu quản trị, không sửa/xóa)</option>
                <option value="super_admin">Quản trị viên (Toàn quyền hệ thống)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={savingGmail}
              className="w-full rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer disabled:opacity-50"
            >
              {savingGmail ? 'Đang lưu...' : 'Cấp quyền truy cập'}
            </button>
          </form>

          <div className="lg:col-span-8 rounded-xl border border-slate-200 bg-white overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
                  <th className="py-3 px-4">Tài khoản Gmail</th>
                  <th className="py-3 px-4">Vai trò</th>
                  <th className="py-3 px-4">Trạng thái</th>
                  <th className="py-3 px-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {admins.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-10 text-center text-slate-500">
                      Chưa thêm tài khoản Gmail ủy quyền nào khác ngoài Quản trị viên chính mặc định.
                    </td>
                  </tr>
                ) : (
                  admins.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-50/70">
                      <td className="py-3 px-4">
                        <p className="font-semibold text-slate-900">{adm.displayName}</p>
                        <p className="text-xs font-mono text-slate-500">{adm.email}</p>
                      </td>
                      <td className="py-3 px-4 text-xs font-medium text-slate-700">
                        {adm.role === 'super_admin'
                          ? 'Quản trị viên'
                          : adm.role === 'viewer'
                            ? 'Người xem (Chỉ đọc)'
                            : 'Biên tập viên'}
                      </td>
                      <td className="py-3 px-4 text-xs font-semibold text-emerald-700">
                        {adm.status === 'active' ? 'Đang hoạt động' : 'Đã thu hồi'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setDeleteGmailTarget(adm)}
                          className="p-1.5 rounded border border-red-200 text-red-700 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit / Change Passcode Modal */}
      {editingAccount && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4"
        >
          <form
            onSubmit={handleUpdateAccount}
            className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 space-y-4 shadow-xl"
          >
            <h3 className="text-lg font-bold text-[#0B1F3A]">
              Chỉnh sửa tài khoản Passcode
            </h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Họ và tên người sở hữu
              </label>
              <input
                type="text"
                value={editOwnerName}
                onChange={(e) => setEditOwnerName(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Ghi chú
              </label>
              <input
                type="text"
                value={editNote}
                onChange={(e) => setEditNote(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Đổi Passcode mới (để trống nếu giữ nguyên)
              </label>
              <input
                type="text"
                value={editNewPasscode}
                onChange={(e) => setEditNewPasscode(e.target.value)}
                placeholder="Nhập Passcode mới (>= 6 ký tự)..."
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-mono"
              />
            </div>
            {editError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-800 flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-red-700 shrink-0 mt-0.5" />
                <span className="leading-relaxed break-words">{editError}</span>
              </div>
            )}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingAccount(null)}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={updating}
                className="rounded-lg bg-[#0B1F3A] px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 cursor-pointer disabled:opacity-50"
              >
                {updating ? 'Đang lưu...' : 'Cập nhật'}
              </button>
            </div>
          </form>
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Xác nhận xóa tài khoản Passcode"
        description={`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của "${deleteTarget?.ownerName}"? Cán bộ này sẽ ngay lập tức mất quyền đăng nhập vào hệ thống.`}
        confirmLabel="Xóa tài khoản"
        loading={deleting}
        onConfirm={handleDeletePasscode}
        onCancel={() => setDeleteTarget(null)}
      />

      <ConfirmModal
        open={Boolean(deleteGmailTarget)}
        title="Thu hồi quyền Gmail"
        description={`Xác nhận thu hồi quyền quản trị của tài khoản "${deleteGmailTarget?.email}"?`}
        confirmLabel="Thu hồi quyền"
        onConfirm={handleDeleteGmail}
        onCancel={() => setDeleteGmailTarget(null)}
      />
    </div>
  );
}
