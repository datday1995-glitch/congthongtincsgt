import { useState } from 'react';
import { signInWithPopup, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { AlertCircle, ArrowLeft, Eye, EyeOff, KeyRound, Lock, ShieldCheck } from 'lucide-react';
import { OFFICIAL_LOGO_URL } from '../../constants/defaults';
import { auth, db, googleProvider, SUPER_ADMIN_EMAIL } from '../../lib/firebase';
import type { AdminRole, AdminSession } from '../../types/portal';
import { useToast } from '../ui/Feedback';

interface AdminLoginProps {
  onSuccessSession: (session: AdminSession) => void;
  onBackToPublic: () => void;
}

export function AdminLogin({ onSuccessSession, onBackToPublic }: AdminLoginProps) {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'google' | 'passcode'>('google');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [showPasscode, setShowPasscode] = useState(false);
  const [passcodeLoading, setPasscodeLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [setupHint, setSetupHint] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setErrorMsg(null);
    setSetupHint(null);
    setGoogleLoading(true);
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const user = cred.user;
      const email = (user.email || '').toLowerCase();

      if (!user.emailVerified) {
        await signOut(auth);
        setErrorMsg('Tài khoản Google chưa xác minh email.');
        return;
      }

      if (email === SUPER_ADMIN_EMAIL.toLowerCase()) {
        const session: AdminSession = {
          mode: 'google',
          uid: user.uid,
          email,
          displayName: user.displayName || 'Quản trị viên chính',
          role: 'super_admin',
          isSuperAdmin: true,
          isReadOnly: false,
        };
        showToast('success', 'Đăng nhập thành công', `Chào mừng ${session.displayName}`);
        onSuccessSession(session);
        return;
      }

      // Check admins/{email} authorization in Firestore
      const adminDoc = await getDoc(doc(db, 'admins', email));
      if (!adminDoc.exists() || adminDoc.data()?.status !== 'active') {
        await signOut(auth);
        setErrorMsg(
          `Tài khoản Gmail "${email}" chưa được Quản trị viên chính cấp quyền truy cập hệ thống.`
        );
        return;
      }

      const data = adminDoc.data();
      const role: AdminRole =
        data.role === 'super_admin'
          ? 'super_admin'
          : data.role === 'viewer'
            ? 'viewer'
            : 'editor';
      const session: AdminSession = {
        mode: 'google',
        uid: user.uid,
        email,
        displayName: data.displayName || user.displayName || email,
        role,
        isSuperAdmin: role === 'super_admin',
        isReadOnly: role === 'viewer',
      };
      showToast('success', 'Đăng nhập thành công', `Chào mừng ${session.displayName}`);
      onSuccessSession(session);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Không thể đăng nhập bằng Google.';
      if (!message.includes('popup-closed-by-user')) {
        setErrorMsg(message);
      }
    } finally {
      setGoogleLoading(false);
    }
  };

  const handlePasscodeLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSetupHint(null);
    if (!passcode.trim()) {
      setErrorMsg('Vui lòng nhập mã Passcode được cấp.');
      return;
    }

    setPasscodeLoading(true);
    try {
      const res = await fetch('/api/auth/passcode-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcode.trim() }),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error || 'Mã Passcode không hợp lệ.');
        if (json.instructions) {
          setSetupHint(json.instructions);
        }
        return;
      }
      showToast('success', 'Đăng nhập Passcode thành công', `Xin chào ${json.session.displayName}`);
      onSuccessSession(json.session as AdminSession);
    } catch {
      setErrorMsg('Không thể kết nối đến máy chủ xác thực Passcode.');
    } finally {
      setPasscodeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-md">
        <button
          type="button"
          onClick={onBackToPublic}
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-[#0B1F3A] transition-colors cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Quay lại cổng thông tin người dân</span>
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="bg-[#0B1F3A] px-6 py-7 text-center text-white">
            <img
              src={OFFICIAL_LOGO_URL}
              alt="Phù hiệu Cảnh sát giao thông"
              referrerPolicy="no-referrer"
              className="h-14 w-14 mx-auto object-contain"
            />
            <p className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-blue-200">
              Công an Thành phố Đà Nẵng · Phòng CSGT
            </p>
            <h1 className="mt-1 text-xl font-bold tracking-tight">
              Hệ Thống Quản Trị Nội Dung
            </h1>
          </div>

          <div className="p-6 sm:p-7">
            {/* Auth Method Switcher */}
            <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-slate-100 p-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('google');
                  setErrorMsg(null);
                  setSetupHint(null);
                }}
                className={`rounded-md py-2 px-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'google'
                    ? 'bg-white text-[#0B1F3A] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Gmail quản trị
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('passcode');
                  setErrorMsg(null);
                  setSetupHint(null);
                }}
                className={`rounded-md py-2 px-3 text-xs sm:text-sm font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                  activeTab === 'passcode'
                    ? 'bg-white text-[#0B1F3A] shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Mã Passcode
              </button>
            </div>

            {errorMsg && (
              <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3.5 text-sm text-red-800 flex items-start gap-2.5">
                <AlertCircle className="h-5 w-5 text-red-700 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-medium">{errorMsg}</p>
                  {setupHint && <p className="text-xs text-red-700">{setupHint}</p>}
                </div>
              </div>
            )}

            {activeTab === 'google' ? (
              <div className="mt-6 space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                    <ShieldCheck className="h-4 w-4 text-blue-700" />
                    Xác thực tài khoản Gmail được cấp quyền
                  </p>
                  Chỉ tài khoản Gmail của Quản trị viên chính hoặc các cán bộ đã được ủy quyền trong hệ thống mới có thể truy cập trang quản trị.
                </div>

                <button
                  type="button"
                  disabled={googleLoading}
                  onClick={handleGoogleLogin}
                  className="w-full inline-flex items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.37 24 12 24Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                    />
                  </svg>
                  <span>{googleLoading ? 'Đang xác thực...' : 'Đăng nhập với Google'}</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handlePasscodeLogin} className="mt-6 space-y-4">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 text-xs text-slate-600 leading-relaxed">
                  <p className="font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
                    <KeyRound className="h-4 w-4 text-blue-700" />
                    Đăng nhập dành cho cán bộ được cấp mã
                  </p>
                  Nhập mã Passcode riêng do Quản trị viên chính cấp. Mã được xác thực an toàn phía máy chủ và tự động khóa nếu nhập sai nhiều lần.
                </div>

                <div>
                  <label
                    htmlFor="passcode-input"
                    className="block text-sm font-semibold text-slate-800 mb-1.5"
                  >
                    Mã Passcode
                  </label>
                  <div className="relative">
                    <Lock className="h-4 w-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      id="passcode-input"
                      type={showPasscode ? 'text' : 'password'}
                      value={passcode}
                      onChange={(e) => setPasscode(e.target.value)}
                      placeholder="Nhập mã Passcode truy cập..."
                      autoComplete="current-password"
                      className="w-full rounded-lg border border-slate-300 bg-white pl-10 pr-10 py-2.5 text-sm text-slate-900 focus:border-blue-700 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasscode((prev) => !prev)}
                      aria-label={showPasscode ? 'Ẩn Passcode' : 'Hiện Passcode'}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPasscode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={passcodeLoading}
                  className="w-full rounded-lg bg-[#0B1F3A] px-4 py-3 text-sm font-semibold text-white hover:bg-[#14335E] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {passcodeLoading ? 'Đang kiểm tra...' : 'Đăng nhập'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
