import { useState } from 'react';
import { Menu, Search, X } from 'lucide-react';
import { OFFICIAL_LOGO_URL } from '../../constants/defaults';
import type { SiteSettings } from '../../types/portal';

interface PublicHeaderProps {
  settings: SiteSettings;
  currentPath: string;
  onNavigate: (path: string) => void;
  onFocusSearch: () => void;
}

const NAV_ITEMS = [
  { label: 'Trang chủ', path: '/' },
  { label: 'Thủ tục GPLX', path: '/thu-tuc' },
  { label: 'Tra cứu thủ tục', path: '/tra-cuu' },
  { label: 'Văn bản pháp luật', path: '/van-ban' },
  { label: 'Hỏi đáp', path: '/hoi-dap' },
  { label: 'Liên hệ', path: '/lien-he' },
];

export function PublicHeader({
  settings,
  currentPath,
  onNavigate,
  onFocusSearch,
}: PublicHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLinkClick = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    setMobileOpen(false);
    onNavigate(path);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md no-print">
      {/* Top Institutional Strip */}
      <div className="bg-[#0B1F3A] text-white border-b border-[#16345E]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2 text-[11px] sm:text-xs">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-semibold tracking-wide uppercase">
            <span className="text-blue-200">{settings.agencyName}</span>
            <span className="text-blue-400" aria-hidden="true">·</span>
            <span className="text-white">{settings.departmentName}</span>
          </div>
          <span className="hidden md:inline font-medium tracking-wider text-blue-100 uppercase">
            {settings.siteTitle}
          </span>
        </div>
      </div>

      {/* Main Navigation Row */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Brand Lockup */}
          <a
            href="/"
            onClick={(e) => handleLinkClick(e, '/')}
            className="flex items-center gap-3 min-w-0 shrink-0 group focus-visible:outline-2 focus-visible:outline-blue-700 rounded-md"
          >
            <img
              src={settings.logoUrl || OFFICIAL_LOGO_URL}
              alt="Phù hiệu Cảnh sát giao thông"
              referrerPolicy="no-referrer"
              className="h-10 w-10 object-contain shrink-0"
            />
            <div className="flex flex-col leading-tight min-w-0">
              <span className="text-[11px] font-bold tracking-wide text-blue-800 uppercase whitespace-nowrap truncate">
                {settings.departmentName}
              </span>
              <span className="text-xs sm:text-sm font-extrabold tracking-tight text-[#0B1F3A] uppercase whitespace-nowrap truncate max-w-[210px] sm:max-w-[290px] xl:max-w-none group-hover:text-blue-800 transition-colors">
                THỦ TỤC GIẤY PHÉP LÁI XE
              </span>
            </div>
          </a>

          {/* Primary Navigation Links */}
          <nav
            aria-label="Điều hướng chính"
            className="hidden lg:flex items-center gap-5 xl:gap-6 text-[13.5px] font-medium text-slate-700"
          >
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.path === '/'
                  ? currentPath === '/'
                  : currentPath === item.path || currentPath.startsWith(`${item.path}/`);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={`py-2 whitespace-nowrap shrink-0 border-b-2 transition-colors duration-150 ${
                    isActive
                      ? 'border-blue-700 text-[#0B1F3A] font-semibold'
                      : 'border-transparent hover:text-[#0B1F3A] hover:border-slate-300'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Search Button & Mobile Menu Toggle */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => {
                setMobileOpen(false);
                onFocusSearch();
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-[#0B1F3A] px-3.5 py-2 text-xs font-semibold text-white hover:bg-[#14335E] transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 shrink-0" />
              <span className="hidden sm:inline">Tìm kiếm</span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label={mobileOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={mobileOpen}
              className="lg:hidden inline-flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 py-3 shadow-md">
          <p className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-100 mb-1">
            {settings.siteTitle}
          </p>
          <nav className="flex flex-col gap-1" aria-label="Menu di động">
            {NAV_ITEMS.map((item) => {
              const isActive =
                item.path === '/'
                  ? currentPath === '/'
                  : currentPath === item.path || currentPath.startsWith(`${item.path}/`);
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => handleLinkClick(e, item.path)}
                  className={`rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-[#0B1F3A] font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
