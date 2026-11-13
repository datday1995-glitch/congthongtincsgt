import { Clock, ExternalLink, Globe, MapPin, Phone } from 'lucide-react';
import type { SiteSettings } from '../../types/portal';

interface PublicContactSectionProps {
  settings: SiteSettings;
}

export function PublicContactSection({ settings }: PublicContactSectionProps) {
  const cleanTel = settings.phone.replace(/\s+/g, '');
  const mapsDirectionsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    settings.address
  )}`;

  return (
    <section
      id="lien-he"
      className="border-t border-slate-200 bg-white py-14 sm:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mb-10">
          <p className="text-xs font-semibold uppercase tracking-widest text-blue-700">
            Thông tin liên hệ chính thức
          </p>
          <h2 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-[#0B1F3A]">
            Tiếp nhận & Hướng dẫn trực tiếp
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 leading-relaxed">
            Người dân cần giải đáp thắc mắc về hồ sơ, trình tự thực hiện thủ tục hành chính có thể liên hệ qua đường dây nóng hoặc đến trực tiếp trụ sở đơn vị.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Contact Details Column */}
          <div className="lg:col-span-5 flex flex-col justify-between rounded-xl border border-slate-200 bg-slate-50 overflow-hidden">
            <div className="p-6 sm:p-7 flex-1 flex flex-col justify-between gap-6">
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    {settings.agencyName}
                  </p>
                  <h3 className="mt-0.5 text-lg font-bold text-[#0B1F3A]">
                    {settings.departmentName}
                  </h3>
                </div>

                <dl className="space-y-3.5 text-sm text-slate-700 pt-2 border-t border-slate-200">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 text-blue-700 shrink-0 mt-1" />
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Địa chỉ trụ sở</dt>
                      <dd className="font-medium text-slate-900 mt-0.5">{settings.address}</dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 text-blue-700 shrink-0 mt-1" />
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Điện thoại trực ban / Hướng dẫn</dt>
                      <dd className="font-semibold text-[#0B1F3A] font-mono tabular-nums mt-0.5">
                        {settings.phone}
                      </dd>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="h-4 w-4 text-blue-700 shrink-0 mt-1" />
                    <div>
                      <dt className="text-xs font-medium text-slate-500">Thời gian tiếp công dân</dt>
                      <dd className="text-slate-700 mt-0.5">
                        Thứ 2 – Thứ 6 (Sáng: 07:30 – 11:30 · Chiều: 13:30 – 17:00) · Sáng Thứ 7 (theo lịch tiếp nhận)
                      </dd>
                    </div>
                  </div>

                  {(settings.facebookUrl || settings.websiteUrl) && (
                    <div className="flex items-start gap-3">
                      <Globe className="h-4 w-4 text-blue-700 shrink-0 mt-1" />
                      <div className="space-y-1">
                        <dt className="text-xs font-medium text-slate-500">Kênh thông tin trực tuyến</dt>
                        {settings.facebookUrl && (
                          <dd>
                            <a
                              href={settings.facebookUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-700 hover:underline font-medium"
                            >
                              <span>Facebook Phòng CSGT thành phố Đà Nẵng</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </dd>
                        )}
                        {settings.websiteUrl && (
                          <dd>
                            <a
                              href={settings.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-blue-700 hover:underline font-medium"
                            >
                              <span>Website Phòng Cảnh sát giao thông</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                          </dd>
                        )}
                      </div>
                    </div>
                  )}
                </dl>
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <a
                  href={`tel:${cleanTel}`}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-[#0B1F3A] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#14335E] transition-colors whitespace-nowrap"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>Gọi ngay {settings.phone}</span>
                </a>
                <a
                  href={mapsDirectionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-slate-100 transition-colors whitespace-nowrap"
                >
                  <MapPin className="h-4 w-4 shrink-0 text-blue-700" />
                  <span>Chỉ đường</span>
                </a>
              </div>
            </div>
          </div>

          {/* Interactive Google Maps Column */}
          <div className="lg:col-span-7 flex flex-col rounded-xl border border-slate-200 bg-slate-100 overflow-hidden min-h-[360px]">
            <iframe
              title="Bản đồ vị trí Phòng Cảnh sát giao thông Công an TP Đà Nẵng"
              src={settings.mapEmbedUrl}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full h-full min-h-[360px] lg:min-h-full border-0 flex-1"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
