import { MapPin, Phone, Shield } from 'lucide-react';
import { OFFICIAL_LOGO_URL } from '../../constants/defaults';
import type { SiteSettings } from '../../types/portal';
import { formatDateVi } from '../../utils/formatters';

interface PublicFooterProps {
  settings: SiteSettings;
  lastUpdatedAt?: string;
  onNavigate: (path: string) => void;
}

export function PublicFooter({ settings, lastUpdatedAt, onNavigate }: PublicFooterProps) {
  const year = new Date().getFullYear();

  const footerLinks = [
    { label: 'Trang chủ', path: '/' },
    { label: 'Thủ tục GPLX', path: '/thu-tuc' },
    { label: 'Tra cứu thủ tục', path: '/tra-cuu' },
    { label: 'Văn bản pháp luật', path: '/van-ban' },
    { label: 'Hỏi đáp', path: '/hoi-dap' },
    { label: 'Liên hệ', path: '/lien-he' },
  ];

  return (
    <footer className="bg-[#0B1F3A] text-slate-200 border-t border-[#16345E] no-print">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/10">
          {/* Agency Info */}
          <div className="md:col-span-6 space-y-4">
            <div className="flex items-center gap-3.5">
              <img
                src={settings.logoUrl || OFFICIAL_LOGO_URL}
                alt="Phù hiệu Cảnh sát giao thông"
                referrerPolicy="no-referrer"
                className="h-12 w-12 object-contain shrink-0"
              />
              <div>
                <p className="text-xs font-semibold tracking-wider text-blue-200 uppercase">
                  {settings.agencyName}
                </p>
                <p className="text-base font-bold text-white uppercase">
                  {settings.departmentName}
                </p>
              </div>
            </div>
            <p className="text-xs font-bold tracking-wider text-blue-100 uppercase">
              {settings.siteTitle}
            </p>
            <p className="text-sm text-slate-300 leading-relaxed max-w-lg">
              {settings.footerNote}
            </p>
            <div className="space-y-2 text-sm text-slate-300 pt-1">
              <div className="flex items-start gap-2.5">
                <MapPin className="h-4 w-4 text-blue-300 shrink-0 mt-0.5" />
                <span>{settings.address}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-blue-300 shrink-0" />
                <a
                  href={`tel:${settings.phone.replace(/\s+/g, '')}`}
                  className="hover:text-white transition-colors font-mono tabular-nums"
                >
                  {settings.phone}
                </a>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-blue-200 uppercase">
              Chuyên mục cổng thông tin
            </h3>
            <ul className="space-y-2.5 text-sm">
              {footerLinks.map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.path);
                    }}
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Official Links & Admin Portal */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="text-xs font-semibold tracking-wider text-blue-200 uppercase">
              Kênh thông tin & Quản trị
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a
                  href="https://dichvucong.gov.vn/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-300 hover:text-white transition-colors"
                >
                  Cổng Dịch vụ công Quốc gia
                </a>
              </li>
              {settings.facebookUrl && (
                <li>
                  <a
                    href={settings.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Facebook Phòng CSGT Đà Nẵng
                  </a>
                </li>
              )}
              {settings.websiteUrl && (
                <li>
                  <a
                    href={settings.websiteUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-300 hover:text-white transition-colors"
                  >
                    Trang thông tin điện tử đơn vị
                  </a>
                </li>
              )}
              <li>
                <a
                  href="/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/admin');
                  }}
                  className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white transition-colors"
                >
                  <Shield className="h-3.5 w-3.5 text-blue-300" />
                  <span>Cổng cán bộ quản trị</span>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-400">
          <p>
            © {year} {settings.departmentName} – {settings.agencyName}. Cổng hướng dẫn thủ tục hành chính về Giấy phép lái xe.
          </p>
          <p className="font-mono tabular-nums">
            Cập nhật thông tin: {lastUpdatedAt ? formatDateVi(lastUpdatedAt) : formatDateVi(new Date())}
          </p>
        </div>
      </div>
    </footer>
  );
}
