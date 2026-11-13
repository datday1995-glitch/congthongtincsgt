import { History } from 'lucide-react';
import type { ActivityLog } from '../../types/portal';
import { formatDateTimeVi } from '../../utils/formatters';

interface ActivityLogsViewProps {
  logs: ActivityLog[];
}

export function ActivityLogsView({ logs }: ActivityLogsViewProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#0B1F3A]">Nhật ký hoạt động hệ thống</h2>
        <p className="text-sm text-slate-600 mt-0.5">
          Ghi nhận toàn bộ lịch sử đăng nhập và thao tác tạo, sửa, xuất bản, xóa nội dung hoặc phân quyền.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600 uppercase">
                <th className="py-3 px-4">Thời gian</th>
                <th className="py-3 px-4">Tài khoản thực hiện</th>
                <th className="py-3 px-4">Hành động</th>
                <th className="py-3 px-4">Đối tượng & Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-slate-500">
                    <History className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                    Chưa có nhật ký hoạt động nào được ghi nhận.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70">
                    <td className="py-3 px-4 text-xs font-mono tabular-nums text-slate-600 whitespace-nowrap">
                      {formatDateTimeVi(log.createdAtIso || log.createdAt)}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-semibold text-slate-900">{log.actorName}</p>
                      <p className="text-xs text-slate-500">
                        {log.actorType === 'passcode_officer' ? 'Cán bộ Passcode' : 'Quản trị Gmail'}
                      </p>
                    </td>
                    <td className="py-3 px-4 font-medium text-[#0B1F3A]">{log.action}</td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{log.targetTitle || '—'}</p>
                      {log.details && (
                        <p className="text-xs text-slate-500 mt-0.5">{log.details}</p>
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
  );
}
