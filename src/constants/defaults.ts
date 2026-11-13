import heroDanangImg from '../assets/images/hero_danang_traffic_1794558454450.jpg';
import civicCenterImg from '../assets/images/danang_civic_center_1794558455060.jpg';
import procedureCoverImg from '../assets/images/procedure_guide_cover_1794558455755.jpg';
import type { SiteSettings } from '../types/portal';
import { TT108_CATEGORIES } from './tt108Templates';

export const OFFICIAL_LOGO_URL = '/assets/aistudio/Phu_hieu_canh_sat_giao_thong__1__b6c8b7fd.png';
export const DEFAULT_BANNER_IMAGE = heroDanangImg;
export const DEFAULT_CIVIC_IMAGE = civicCenterImg;
export const DEFAULT_PROCEDURE_COVER = procedureCoverImg;

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: 'CỔNG HƯỚNG DẪN THỦ TỤC HÀNH CHÍNH VỀ GIẤY PHÉP LÁI XE',
  agencyName: 'CÔNG AN THÀNH PHỐ ĐÀ NẴNG',
  departmentName: 'PHÒNG CẢNH SÁT GIAO THÔNG',
  logoUrl: OFFICIAL_LOGO_URL,
  bannerUrl: DEFAULT_BANNER_IMAGE,
  bannerTitle: 'TRA CỨU VÀ HƯỚNG DẪN THỦ TỤC GIẤY PHÉP LÁI XE',
  bannerSubtitle:
    'Cung cấp thông tin, hướng dẫn thành phần hồ sơ, trình tự thực hiện và các quy định pháp luật liên quan đến việc cấp, đổi, cấp lại và phục hồi điểm giấy phép lái xe.',
  address: '18 Võ An Ninh, phường Hòa Xuân, thành phố Đà Nẵng',
  phone: '0236 3821 306',
  facebookUrl: '',
  websiteUrl: '',
  introContent:
    'Tổng hợp đầy đủ 8 nhóm thủ tục hành chính về giấy phép lái xe theo Luật Trật tự, an toàn giao thông đường bộ 36/2024/QH15, Thông tư 108/2026/TT-BCA và Thông tư 105/2026/TT-BCA.',
  footerNote:
    'Cổng hướng dẫn thủ tục hành chính về Giấy phép lái xe – Phòng Cảnh sát giao thông, Công an thành phố Đà Nẵng.',
  mapEmbedUrl:
    'https://www.google.com/maps?q=18+V%C3%B5+An+Ninh,+H%C3%B2a+Xu%C3%A2n,+C%E1%BA%A9m+L%E1%BB%87,+%C4%90%C3%A0+N%E1%BA%B5ng&output=embed',
};

export const SUGGESTED_CATEGORIES = TT108_CATEGORIES;
