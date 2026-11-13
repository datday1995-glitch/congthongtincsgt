import type { FaqItem, LegalDocument, ProcedureGuide } from '../types/portal';

export const ONLINE_DVC_URL = 'https://dichvucong.gov.vn/';

export const OVERDUE_CLASSIFICATION_ROWS = [
  {
    tier: 'Chưa quá hạn sử dụng',
    condition: 'Ngày nộp hồ sơ hợp lệ trước hoặc đúng ngày hết hạn ghi trên GPLX.',
    examRequired: 'Không phải sát hạch lại',
    procedureTitle: 'Đổi giấy phép lái xe',
    procedureSlug: 'doi-giay-phep-lai-xe',
    legalRef: 'Thông tư 108/2026/TT-BCA',
  },
  {
    tier: 'Quá hạn dưới 30 ngày',
    condition: 'Quá hạn từ 01 ngày đến dưới 30 ngày kể từ ngày hết hạn ghi trên GPLX và còn dữ liệu quản lý.',
    examRequired: 'Không phải sát hạch lại lý thuyết (theo quy định chuyển tiếp/ưu tiên mới tại Thông tư 108/2026/TT-BCA)',
    procedureTitle: 'Đổi giấy phép lái xe',
    procedureSlug: 'doi-giay-phep-lai-xe',
    legalRef: 'Thông tư 108/2026/TT-BCA',
  },
  {
    tier: 'Quá hạn từ đủ 30 ngày đến dưới 01 năm',
    condition: 'Quá thời hạn sử dụng từ đủ 30 ngày đến dưới 01 năm kể từ ngày hết hạn đến ngày nộp đủ hồ sơ hợp lệ.',
    examRequired: 'Phải sát hạch lại phần Lý thuyết',
    procedureTitle: 'Đăng ký sát hạch khi GPLX quá hạn',
    procedureSlug: 'dang-ky-sat-hach-khi-gplx-qua-han',
    legalRef: 'Thông tư 108/2026/TT-BCA',
  },
  {
    tier: 'Quá hạn từ đủ 01 năm trở lên',
    condition: 'Quá thời hạn sử dụng từ đủ 01 năm trở lên kể từ ngày hết hạn đến ngày nộp đủ hồ sơ hợp lệ.',
    examRequired: 'Phải sát hạch lại cả Lý thuyết và Thực hành (lái xe trong hình và trên đường giao thông)',
    procedureTitle: 'Đăng ký sát hạch khi GPLX quá hạn',
    procedureSlug: 'dang-ky-sat-hach-khi-gplx-qua-han',
    legalRef: 'Thông tư 108/2026/TT-BCA',
  },
];

export const PROCEDURE_GROUP_LABELS: Record<ProcedureGuide['groupKey'], string> = {
  'cap-lan-dau': '1. Cấp GPLX lần đầu',
  'doi-gplx': '2. Đổi GPLX',
  'cap-lai-gplx': '3. Cấp lại GPLX bị mất',
  'phuc-hoi-diem': '4. Kiểm tra phục hồi điểm GPLX',
  'sat-hach-qua-han': '5. Sát hạch khi GPLX quá hạn',
  'gplx-quoc-te': '6. Giấy phép lái xe quốc tế (IDP)',
};

export const LICENSE_CLASSES_INFO = [
  { code: 'A1', desc: 'Xe mô tô hai bánh đến 125 cm³ hoặc công suất động cơ điện đến 11 kW', minAge: 'Đủ 18 tuổi trở lên' },
  { code: 'A', desc: 'Xe mô tô hai bánh trên 125 cm³ hoặc công suất động cơ điện trên 11 kW và xe hạng A1', minAge: 'Đủ 18 tuổi trở lên' },
  { code: 'B1', desc: 'Xe mô tô ba bánh và các xe quy định cho hạng A1', minAge: 'Đủ 18 tuổi trở lên' },
  { code: 'B', desc: 'Ô tô chở người đến 08 chỗ (không kể chỗ lái); ô tô tải đến 3.500 kg', minAge: 'Đủ 18 tuổi trở lên' },
  { code: 'C1', desc: 'Ô tô tải, chuyên dùng trên 3.500 kg đến 7.500 kg', minAge: 'Đủ 18 tuổi trở lên' },
  { code: 'C', desc: 'Ô tô tải, chuyên dùng trên 7.500 kg', minAge: 'Đủ 21 tuổi trở lên' },
  { code: 'D1', desc: 'Ô tô chở người trên 08 chỗ đến 16 chỗ (không kể chỗ lái)', minAge: 'Đủ 24 tuổi trở lên' },
  { code: 'D2', desc: 'Ô tô chở người trên 16 chỗ đến 29 chỗ (không kể chỗ lái)', minAge: 'Đủ 24 tuổi trở lên' },
  { code: 'D', desc: 'Ô tô chở người trên 29 chỗ (không kể chỗ lái), ô tô chở người giường nằm', minAge: 'Đủ 27 tuổi trở lên (tối đa nam 57, nữ 55 tuổi)' },
  { code: 'BE / C1E / CE / D1E / D2E / DE', desc: 'Các hạng xe kéo rơ moóc trên 750 kg tương ứng', minAge: '21 – 27 tuổi theo Điều 59 Luật 36/2024/QH15' },
];

export const DEFAULT_PROCEDURE_GUIDES: ProcedureGuide[] = [
  {
    id: 'proc-cap-gplx-lan-dau',
    title: 'Cấp giấy phép lái xe lần đầu',
    slug: 'cap-giay-phep-lai-xe-lan-dau',
    cardOrder: 1,
    isCoreCard: true,
    iconKey: 'car',
    groupKey: 'cap-lan-dau',
    shortDescription:
      'Hướng dẫn điều kiện độ tuổi, sức khỏe, hồ sơ đăng ký đào tạo, sát hạch và quy trình cấp thẻ PET / tích hợp VNeID lần đầu theo Thông tư 108/2026/TT-BCA.',
    intro:
      'Thủ tục cấp giấy phép lái xe (GPLX) lần đầu áp dụng đối với công dân Việt Nam và người nước ngoài cư trú hợp pháp tại Việt Nam đáp ứng đủ điều kiện về độ tuổi, sức khỏe, hoàn thành chương trình đào tạo lái xe (hoặc tự học đối với một số hạng theo quy định) và đạt kỳ sát hạch do cơ quan Công an tổ chức.',
    targetAudience:
      'Công dân Việt Nam, người nước ngoài được phép cư trú hoặc đang làm việc, học tập tại Việt Nam đủ độ tuổi theo Điều 59 Luật Trật tự, an toàn giao thông đường bộ 36/2024/QH15 (từ đủ 18 tuổi đối với hạng A1, A, B1, B, C1; đủ 21 tuổi đối với C, BE; đủ 24 tuổi đối với D1, D2, C1E, CE; đủ 27 tuổi đối với D, D1E, D2E, DE).',
    conditions:
      '1. Đủ độ tuổi và điều kiện sức khỏe phù hợp với từng hạng xe dự thi theo quy định của Bộ Y tế.\n2. Có giấy tờ tùy thân hợp lệ (CCCD/Thẻ căn cước hoặc hộ chiếu còn giá trị).\n3. Hoàn thành khóa đào tạo và được cấp chứng chỉ đào tạo/chứng nhận hoàn thành khóa học tại cơ sở đào tạo lái xe được phép hoạt động (nếu thuộc diện bắt buộc đào tạo).\n4. Đạt đủ các phần thi sát hạch theo nguyên tắc "Đạt phần trước mới được thi phần sau" theo Thông tư 108/2026/TT-BCA.',
    dossierItems: [
      'Đơn đề nghị học, sát hạch để cấp giấy phép lái xe theo mẫu quy định (đối chiếu mẫu hiện hành tại cơ sở đào tạo/Phòng CSGT).',
      'Bản sao/xuất trình Căn cước công dân, Thẻ căn cước hoặc Hộ chiếu còn thời hạn (đối với người nước ngoài cần kèm giấy tờ cư trú hợp pháp).',
      'Giấy khám sức khỏe của người lái xe do cơ sở y tế đủ điều kiện cấp (ưu tiên sử dụng giấy khám sức khỏe điện tử kết nối liên thông).',
      'Ảnh chân dung nền trắng theo chuẩn quy định tại Thông tư 108/2026/TT-BCA (hoặc chụp trực tiếp tại hội đồng sát hạch/cơ quan tiếp nhận).',
      'Chứng chỉ sơ cấp hoặc chứng chỉ đào tạo đối với các hạng xe yêu cầu đào tạo tập trung (tùy hạng dự thi).',
    ],
    dossierQuantity: '01 bộ hồ sơ',
    submissionMethods: [
      'Nộp hồ sơ qua cơ sở đào tạo lái xe nơi đăng ký học để tổng hợp gửi Phòng Cảnh sát giao thông tổ chức sát hạch.',
      'Nộp trực tiếp tại điểm tiếp nhận của Phòng Cảnh sát giao thông hoặc đăng ký qua Cổng Dịch vụ công (đối với trường hợp thí sinh tự do/sát hạch lại theo quy định).',
    ],
    receivingLocation:
      'Phòng Cảnh sát giao thông – Công an thành phố Đà Nẵng (Số 18 Võ An Ninh, phường Hòa Xuân, TP. Đà Nẵng) và các điểm tiếp nhận, trung tâm sát hạch được phân công trên địa bàn thành phố.',
    steps: [
      {
        stepNumber: 1,
        title: 'Khám sức khỏe & Chuẩn bị hồ sơ đăng ký',
        description:
          'Người dân khám sức khỏe lái xe tại cơ sở y tế đủ thẩm quyền (lấy mã KSK điện tử), chuẩn bị giấy tờ tùy thân và ảnh chân dung nền trắng.',
      },
      {
        stepNumber: 2,
        title: 'Đăng ký đào tạo & Kiểm tra đủ điều kiện dự sát hạch',
        description:
          'Hoàn thành chương trình đào tạo lý thuyết và thực hành tại cơ sở đào tạo lái xe (hoặc chuẩn bị hồ sơ dự sát hạch theo hạng). Danh sách thí sinh đủ điều kiện được gửi về Phòng CSGT.',
      },
      {
        stepNumber: 3,
        title: 'Tham dự kỳ sát hạch theo nguyên tắc Thông tư 108/2026/TT-BCA',
        description:
          'Thực hiện tuần tự các phần thi: Lý thuyết (mô tô 40 câu đạt tối thiểu 36/40; ô tô hạng B 50 câu đạt tối thiểu 45/50) -> Thực hành lái xe trong hình (có bổ sung bài sa hình số 2 đối với mô tô; đã bãi bỏ phần thi mô phỏng ô tô) -> Thực hành trên đường (đối với ô tô). Đạt phần trước mới được dự thi phần sau.',
      },
      {
        stepNumber: 4,
        title: 'Hoàn tất lệ phí & Nhận kết quả',
        description:
          'Sau khi đạt sát hạch, dữ liệu GPLX được đồng bộ điện tử lên VNeID (từ 02 giờ đến 01 ngày làm việc) và cấp trả thẻ PET vật lý tại điểm tiếp nhận hoặc qua bưu chính công ích.',
      },
    ],
    processingTime:
      'Không quá 3,5 ngày làm việc kể từ ngày kết thúc kỳ sát hạch đối với việc cấp trả thẻ vật liệu PET; tích hợp hiển thị dữ liệu điện tử trên VNeID trong thời gian 02 giờ đến 01 ngày làm việc (Thông tư 108/2026/TT-BCA).',
    fees:
      'Lệ phí cấp GPLX tham khảo theo Thông tư 37/2023/TT-BTC: 135.000 đồng/lần. Phí sát hạch theo Thông tư 37/2023/TT-BTC (Lý thuyết mô tô 60.000đ, Thực hành mô tô 70.000đ; Lý thuyết ô tô 100.000đ, Thực hành trong hình ô tô 350.000đ, Thực hành trên đường 80.000đ). Lưu ý: Do Thông tư 108/2026/TT-BCA bãi bỏ phần thi mô phỏng ô tô từ 01/7/2026, mức điều chỉnh biểu phí mới nhất (nếu có): Đang cập nhật/xác minh.',
    result:
      'Giấy phép lái xe bằng vật liệu PET và thông tin GPLX điện tử được cập nhật trên hệ thống cơ sở dữ liệu quốc gia / ứng dụng VNeID.',
    legalBasis: [
      'Luật Trật tự, an toàn giao thông đường bộ số 36/2024/QH15 (Điều 57 Phân hạng GPLX, Điều 58 Điểm GPLX, Điều 59 Độ tuổi, sức khỏe của người điều khiển phương tiện).',
      'Thông tư số 108/2026/TT-BCA ngày 29/6/2026 của Bộ trưởng Bộ Công an quy định về sát hạch, cấp giấy phép lái xe; cấp, sử dụng giấy phép lái xe quốc tế (có hiệu lực từ 01/7/2026).',
      'Thông tư số 37/2023/TT-BTC của Bộ Tài chính quy định mức thu, chế độ thu, nộp, quản lý và sử dụng phí sát hạch lái xe; lệ phí cấp bằng, chứng chỉ được hoạt động trên các loại phương tiện (mức điều chỉnh mới năm 2026: Đang cập nhật/xác minh).',
    ],
    forms: [
      {
        name: 'Đơn đề nghị học, sát hạch để cấp giấy phép lái xe (theo phụ lục Thông tư 108/2026/TT-BCA)',
        code: 'Đang cập nhật/xác minh số hiệu phụ lục gốc',
        note: 'Nhận trực tiếp tại cơ sở đào tạo hoặc điểm tiếp nhận hồ sơ Phòng CSGT.',
        url: '',
        verificationStatus: 'verifying',
      },
    ],
    faqs: [
      {
        question: 'Từ ngày 01/7/2026 thi bằng lái xe ô tô có còn thi mô phỏng không?',
        answer:
          'Theo Thông tư 108/2026/TT-BCA có hiệu lực từ 01/7/2026, phần thi mô phỏng các tình huống giao thông đối với ô tô đã được bãi bỏ. Thí sinh thi tuần tự Lý thuyết -> Thực hành trong hình -> Thực hành trên đường.',
      },
      {
        question: 'Nếu trượt lý thuyết thì có được thi tiếp phần thực hành trong cùng kỳ sát hạch không?',
        answer:
          'Không. Thông tư 108/2026/TT-BCA áp dụng nguyên tắc "Đạt phần trước mới được thi phần sau". Nếu không đạt lý thuyết, thí sinh chưa được dự thi phần thực hành.',
      },
    ],
    subCases: [
      {
        title: 'Nhóm hạng xe mô tô (A1, A, B1)',
        summary: 'Áp dụng cho người từ đủ 18 tuổi trở lên; bài thi lý thuyết 40 câu (đạt từ 36/40 câu trở lên) và bài sa hình (bổ sung bài sa hình số 2 theo Thông tư 108/2026/TT-BCA).',
        conditions: 'Đủ 18 tuổi, đủ sức khỏe theo quy định, có CCCD/Thẻ căn cước.',
        extraDossier: 'Không yêu cầu nộp chứng chỉ đào tạo nghề dài hạn như ô tô tải nặng, thực hiện theo quy định sát hạch mô tô hiện hành.',
      },
      {
        title: 'Nhóm hạng xe ô tô (B, C1, C, D1, D2, D và các hạng kéo rơ moóc)',
        summary: 'Bắt buộc hoàn thành đào tạo tại cơ sở đào tạo được cấp phép; thi lý thuyết (hạng B là 50 câu, đạt từ 45/50 câu), thực hành trong hình và thực hành trên đường.',
        conditions: 'Đủ độ tuổi theo Điều 59 Luật 36/2024/QH15 (18 đến 27 tuổi tùy hạng) và chứng chỉ hoàn thành khóa đào tạo.',
        extraDossier: 'Bắt buộc có Giấy chứng nhận/Chứng chỉ hoàn thành chương trình đào tạo lái xe ô tô tương ứng.',
      },
    ],
    referenceNotes:
      'Thông tin chi tiết về mã số biểu mẫu gốc theo từng phụ lục của Thông tư 108/2026/TT-BCA và Quyết định công bố thủ tục hành chính mới nhất đang được cập nhật bản PDF chính thức để tải về.',
    onlinePortalUrl: ONLINE_DVC_URL,
    keywords: ['cấp lần đầu', 'thi bằng lái', 'sát hạch lần đầu', 'A1', 'hạng A', 'hạng B', 'Thông tư 108/2026'],
    status: 'published',
    isVerifiedSeed: true,
    authorId: 'system',
    authorName: 'Phòng CSGT CATP Đà Nẵng',
  },
  {
    id: 'proc-doi-gplx',
    title: 'Đổi giấy phép lái xe',
    slug: 'doi-giay-phep-lai-xe',
    cardOrder: 2,
    isCoreCard: true,
    iconKey: 'refresh',
    groupKey: 'doi-gplx',
    shortDescription:
      'Hướng dẫn cấp đổi GPLX bị hỏng, thay đổi thông tin cá nhân, sắp hết hạn hoặc quá hạn dưới 30 ngày, GPLX nước ngoài và GPLX Quân đội/Công an.',
    intro:
      'Thủ tục đổi giấy phép lái xe cho phép người đang có GPLX hợp lệ (còn thời hạn, quá hạn dưới 30 ngày hoặc thuộc diện được chuyển đổi) thực hiện cấp đổi sang thẻ PET mới hoặc đồng bộ thông tin định danh mới nhất.',
    targetAudience:
      'Người Việt Nam và người nước ngoài đang có GPLX do Việt Nam cấp bị hỏng, thay đổi thông tin, sắp hết hạn hoặc quá hạn dưới 30 ngày; người có GPLX nước ngoài hợp lệ (cư trú/visa từ 90 ngày trở lên); người có GPLX do Quân đội, Công an cấp chuyển sang dân sự.',
    conditions:
      '1. GPLX cũ phải có thông tin trong hệ thống dữ liệu quản lý của Cục Cảnh sát giao thông hoặc hồ sơ lưu hợp lệ.\n2. Không đang trong thời gian bị tước quyền sử dụng GPLX hoặc chưa chấp hành xong quyết định xử phạt vi phạm hành chính trong lĩnh vực giao thông.\n3. Có giấy khám sức khỏe hợp lệ theo hạng xe đề nghị đổi (theo Thông tư 108/2026/TT-BCA, cả đổi GPLX mô tô cũng bắt buộc có giấy khám sức khỏe, ưu tiên bản điện tử).\n4. Ảnh chân dung nền trắng đúng quy cách.',
    dossierItems: [
      'Đơn đề nghị đổi (cấp lại) giấy phép lái xe theo mẫu quy định.',
      'Giấy khám sức khỏe của người lái xe còn thời hạn (ưu tiên giấy khám sức khỏe điện tử liên thông trên hệ thống dịch vụ công).',
      'Bản chính GPLX hiện tại (trừ trường hợp đồng thời bị mất hoặc thực hiện nộp trực tuyến có đối chiếu dữ liệu) và CCCD/Thẻ căn cước/Hộ chiếu còn hạn.',
      'Ảnh chân dung nền trắng (chụp trực tiếp khi nộp tại quầy hoặc tải file chuẩn khi nộp trực tuyến).',
      'Giấy tờ chứng minh theo trường hợp đặc thù: Bản dịch công chứng GPLX nước ngoài & hộ chiếu/thẻ cư trú >= 90 ngày (nếu đổi GPLX nước ngoài); Quyết định ra quân/chuyển ngành & GPLX Quân sự/Công an (nếu đổi từ lực lượng vũ trang); Giấy tờ hộ tịch chứng minh thay đổi họ tên/ngày sinh (nếu thay đổi thông tin).',
    ],
    dossierQuantity: '01 bộ hồ sơ',
    submissionMethods: [
      'Trực tuyến (mức độ toàn trình/một phần) qua Cổng Dịch vụ công Quốc gia hoặc ứng dụng VNeID.',
      'Trực tiếp tại Bộ phận Một cửa / Điểm tiếp nhận hồ sơ của Phòng Cảnh sát giao thông hoặc Công an cấp xã được phân cấp tiếp nhận.',
    ],
    receivingLocation:
      'Phòng Cảnh sát giao thông – Công an thành phố Đà Nẵng (Số 18 Võ An Ninh, phường Hòa Xuân, TP. Đà Nẵng) hoặc trực tuyến qua Cổng Dịch vụ công Quốc gia.',
    steps: [
      {
        stepNumber: 1,
        title: 'Khám sức khỏe điện tử & Chuẩn bị giấy tờ',
        description:
          'Khám sức khỏe tại cơ sở y tế có liên thông dữ liệu KSK điện tử. Chuẩn bị bản chính GPLX, CCCD và ảnh chân dung nền trắng (hoặc chụp ảnh trực tiếp tại nơi tiếp nhận).',
      },
      {
        stepNumber: 2,
        title: 'Nộp hồ sơ trực tuyến hoặc trực tiếp',
        description:
          'Kê khai thông tin trên Cổng Dịch vụ công Quốc gia / VNeID (nhập mã KSK điện tử, tải ảnh nền trắng) hoặc nộp trực tiếp tại điểm tiếp nhận Phòng CSGT/Công an cấp xã.',
      },
      {
        stepNumber: 3,
        title: 'Kiểm tra tính hợp lệ & Nộp lệ phí',
        description:
          'Cơ quan Công an kiểm tra đối chiếu dữ liệu (nếu hồ sơ thiếu/sai sẽ thông báo bổ sung trong 02 ngày làm việc). Công dân thực hiện thanh toán lệ phí theo thông báo.',
      },
      {
        stepNumber: 4,
        title: 'Nhận thẻ PET & Cập nhật VNeID',
        description:
          'Dữ liệu mới được cập nhật lên VNeID trong 02 giờ – 01 ngày làm việc; thẻ PET mới được trả trong không quá 2,5 ngày làm việc (trực tiếp hoặc qua bưu chính).',
      },
    ],
    processingTime:
      'Không quá 2,5 ngày làm việc kể từ khi nhận đủ hồ sơ hợp lệ (Thông tư 108/2026/TT-BCA). Thông báo bổ sung nếu hồ sơ chưa hợp lệ trong tối đa 02 ngày làm việc.',
    fees:
      'Lệ phí cấp đổi GPLX tham khảo theo Thông tư 37/2023/TT-BTC: 135.000 đồng/lần cấp (mức ưu đãi nộp trực tuyến nếu áp dụng theo quy định Bộ Tài chính từng giai đoạn: Đang cập nhật/xác minh). Phí dịch vụ bưu chính tính theo cước quy định nếu chọn nhận tại nhà.',
    result:
      'Giấy phép lái xe vật liệu PET mới (bảo lưu số điểm hiện có trên GPLX theo Điều 58 Luật 36/2024/QH15) và cập nhật điện tử trên VNeID.',
    legalBasis: [
      'Luật Trật tự, an toàn giao thông đường bộ số 36/2024/QH15 (Điều 58, Điều 62 Cấp, đổi, cấp lại và thu hồi giấy phép lái xe).',
      'Thông tư số 108/2026/TT-BCA ngày 29/6/2026 của Bộ trưởng Bộ Công an (có hiệu lực từ 01/7/2026).',
      'Thông tư số 37/2023/TT-BTC của Bộ Tài chính (biểu phí trực tuyến giai đoạn từ 01/7/2026: Đang cập nhật/xác minh).',
    ],
    forms: [
      {
        name: 'Đơn đề nghị đổi (cấp lại) giấy phép lái xe',
        code: 'Đang cập nhật/xác minh số hiệu phụ lục gốc TT 108/2026/TT-BCA',
        note: 'Có thể kê khai trực tiếp trên biểu mẫu điện tử của Cổng Dịch vụ công Quốc gia.',
        url: '',
        verificationStatus: 'verifying',
      },
    ],
    faqs: [
      {
        question: 'Đổi bằng lái xe máy (A1/A) còn hạn có cần giấy khám sức khỏe không?',
        answer:
          'Có. Theo Thông tư 108/2026/TT-BCA, thủ tục đổi giấy phép lái xe mô tô yêu cầu phải có giấy khám sức khỏe hợp lệ (ưu tiên giấy khám sức khỏe điện tử).',
      },
      {
        question: 'Đổi GPLX có làm phục hồi lại 12 điểm nếu bằng đang bị trừ điểm không?',
        answer:
          'Không. Theo Điều 58 Luật 36/2024/QH15, khi đổi, cấp lại hoặc nâng hạng GPLX thì số điểm hiện tại của GPLX vẫn được giữ nguyên (bảo lưu).',
      },
    ],
    subCases: [
      {
        title: '1. Đổi GPLX bị hỏng không sử dụng được',
        summary: 'Thẻ PET bị gãy, rách, mờ thông tin nhận dạng hoặc hỏng chip.',
        conditions: 'Còn thời hạn sử dụng (hoặc quá hạn dưới 30 ngày), còn dữ liệu trong hệ thống CSGT.',
        extraDossier: 'Nộp kèm bản chính GPLX bị hỏng để đối chiếu và thu hồi/cắt góc theo quy định.',
      },
      {
        title: '2. Đổi GPLX do thay đổi thông tin cá nhân',
        summary: 'Thay đổi họ tên, ngày tháng năm sinh, số CMND cũ sang CCCD/Thẻ căn cước hoặc nơi thường trú.',
        conditions: 'Thông tin thay đổi đã được cập nhật trong Cơ sở dữ liệu quốc gia về dân cư.',
        extraDossier: 'Xuất trình CCCD/Thẻ căn cước mới và giấy tờ hộ tịch/xác nhận nhân thân (nếu thay đổi họ tên/ngày sinh).',
      },
      {
        title: '3. Đổi GPLX sắp hết hạn hoặc quá hạn dưới 30 ngày',
        summary: 'Áp dụng cho GPLX sắp hết hạn hoặc đã quá hạn dưới 30 ngày tính đến ngày nộp đủ hồ sơ hợp lệ.',
        conditions: 'Quá hạn dưới 30 ngày và có dữ liệu trong hệ thống CSGT — không phải sát hạch lại lý thuyết (Thông tư 108/2026/TT-BCA).',
        extraDossier: 'Giấy khám sức khỏe điện tử bắt buộc và ảnh chân dung nền trắng.',
      },
      {
        title: '4. Đổi GPLX do cơ quan khác cấp (chuyển đổi mẫu/cơ quan quản lý)',
        summary: 'Đổi GPLX bằng giấy bìa hoặc GPLX do ngành Giao thông vận tải cấp trước đây sang mẫu thẻ PET do ngành Công an quản lý.',
        conditions: 'Có tên trong hồ sơ lưu/hệ thống quản lý GPLX và đủ sức khỏe.',
        extraDossier: 'Nộp bản chính GPLX cũ để đối chiếu xác minh (nếu hồ sơ cũ chưa có trên hệ thống số hóa sẽ thực hiện xác minh theo quy định).',
      },
      {
        title: '5. Đổi GPLX nước ngoài sang GPLX Việt Nam',
        summary: 'Áp dụng cho người nước ngoài cư trú/làm việc/học tập tại Việt Nam với thời hạn thị thực (visa) từ 90 ngày trở lên hoặc công dân Việt Nam có GPLX nước ngoài hợp lệ.',
        conditions: 'GPLX nước ngoài còn thời hạn sử dụng, không có dấu hiệu tẩy xóa, đúng hạng xe tương ứng.',
        extraDossier: 'Bản chính GPLX nước ngoài kèm bản dịch tiếng Việt công chứng/chứng thực, Hộ chiếu và Thẻ tạm trú/Thường trú/Visa từ 90 ngày trở lên.',
      },
      {
        title: '6. Đổi GPLX Quân đội, Công an sang GPLX dân sự',
        summary: 'Áp dụng đối với quân nhân, cán bộ chiến sĩ Công an thôi phục vụ, xuất ngũ hoặc chuyển ngành có GPLX còn hạn.',
        conditions: 'GPLX Quân sự/Công an còn giá trị sử dụng và có quyết định xuất ngũ/chuyển ngành/nghỉ hưu hợp lệ trong thời hạn quy định.',
        extraDossier: 'Bản chính GPLX Quân sự/Công an, Quyết định ra quân/xuất ngũ/nghỉ hưu hoặc giấy xác nhận của đơn vị có thẩm quyền.',
      },
    ],
    referenceNotes:
      'Quy định về thời hạn đổi miễn sát hạch (< 30 ngày) và ảnh nền trắng căn cứ theo Thông tư 108/2026/TT-BCA (hiệu lực từ 01/7/2026). Trường hợp GPLX cũ chưa có trên hệ thống số hóa sẽ thực hiện xác minh theo Mẫu số 01 Phụ lục X.',
    onlinePortalUrl: ONLINE_DVC_URL,
    keywords: ['đổi bằng lái', 'gia hạn GPLX', 'GPLX hỏng', 'đổi GPLX nước ngoài', 'GPLX quân đội', 'quá hạn dưới 30 ngày'],
    status: 'published',
    isVerifiedSeed: true,
    authorId: 'system',
    authorName: 'Phòng CSGT CATP Đà Nẵng',
  },
  {
    id: 'proc-cap-lai-gplx-bi-mat',
    title: 'Cấp lại giấy phép lái xe bị mất',
    slug: 'cap-lai-giay-phep-lai-xe-bi-mat',
    cardOrder: 3,
    isCoreCard: true,
    iconKey: 'file-x',
    groupKey: 'cap-lai-gplx',
    shortDescription:
      'Hướng dẫn cấp lại GPLX bị mất theo từng tình huống: còn hạn, đã hết hạn, còn dữ liệu hệ thống, kèm đổi thông tin và các trường hợp không đủ điều kiện.',
    intro:
      'Thủ tục cấp lại giấy phép lái xe bị mất giúp công dân được cấp lại thẻ PET khi GPLX bị thất lạc, đồng thời phân tách rõ trường hợp được cấp lại trực tiếp với trường hợp phải qua sát hạch lại do GPLX đã hết thời hạn sử dụng.',
    targetAudience:
      'Người có giấy phép lái xe do Việt Nam cấp bị mất, có tên trong hệ thống thông tin quản lý GPLX của Cục Cảnh sát giao thông hoặc còn hồ sơ gốc/sổ quản lý hợp lệ.',
    conditions:
      '1. Thông tin GPLX bị mất được tra cứu xác thực trên hệ thống cơ sở dữ liệu của Cục CSGT hoặc có hồ sơ lưu hợp lệ.\n2. Không đang trong thời gian bị cơ quan có thẩm quyền tạm giữ, tước quyền sử dụng GPLX hoặc chưa chấp hành xong quyết định xử phạt vi phạm hành chính.\n3. Không thuộc trường hợp bị trừ hết 12 điểm mà chưa kiểm tra phục hồi điểm.\n4. Nếu tính đến ngày nộp đủ hồ sơ hợp lệ mà GPLX bị mất đã hết hạn từ đủ 30 ngày trở lên thì KHÔNG cấp lại trực tiếp mà phải thực hiện thủ tục Sát hạch lại theo quy định.',
    dossierItems: [
      'Đơn đề nghị cấp lại giấy phép lái xe theo mẫu quy định (ghi rõ lý do bị mất và cam kết chịu trách nhiệm trước pháp luật).',
      'Bản sao/xuất trình CCCD, Thẻ căn cước hoặc Hộ chiếu còn giá trị sử dụng.',
      'Giấy khám sức khỏe của người lái xe còn hiệu lực (ưu tiên giấy khám sức khỏe điện tử).',
      'Ảnh chân dung nền trắng theo tiêu chuẩn Thông tư 108/2026/TT-BCA (hoặc chụp trực tiếp tại nơi tiếp nhận).',
      'Hồ sơ gốc hoặc giấy tờ chứng minh thay đổi thông tin nhân thân (nếu mất đồng thời có thay đổi họ tên, ngày sinh, số định danh).',
    ],
    dossierQuantity: '01 bộ hồ sơ',
    submissionMethods: [
      'Nộp trực tuyến qua Cổng Dịch vụ công Quốc gia hoặc ứng dụng VNeID (nếu đủ điều kiện xác thực dữ liệu và KSK điện tử).',
      'Nộp trực tiếp tại Phòng Cảnh sát giao thông hoặc điểm tiếp nhận Công an cấp xã được phân cấp.',
    ],
    receivingLocation:
      'Phòng Cảnh sát giao thông – Công an thành phố Đà Nẵng (Số 18 Võ An Ninh, phường Hòa Xuân, TP. Đà Nẵng).',
    steps: [
      {
        stepNumber: 1,
        title: 'Kiểm tra tình trạng hạn sử dụng & Vi phạm',
        description:
          'Kiểm tra xem GPLX bị mất còn hạn hay đã hết hạn, có đang bị tạm giữ/tước bằng hoặc bị trừ hết điểm trên VNeID hay không.',
      },
      {
        stepNumber: 2,
        title: 'Khám sức khỏe & Lập hồ sơ đề nghị cấp lại',
        description:
          'Thực hiện khám sức khỏe điện tử, chuẩn bị đơn đề nghị cấp lại, CCCD và ảnh chân dung nền trắng.',
      },
      {
        stepNumber: 3,
        title: 'Nộp hồ sơ & Cơ quan Công an tra cứu xác minh',
        description:
          'Cơ quan tiếp nhận tra cứu hệ thống dữ liệu Cục CSGT (lập biên bản xác minh theo Mẫu số 01 Phụ lục X nếu cần đối chiếu hồ sơ lưu). Trường hợp hồ sơ thiếu sẽ thông báo trong 02 ngày làm việc.',
      },
      {
        stepNumber: 4,
        title: 'Nộp lệ phí & Nhận lại thẻ GPLX mới',
        description:
          'Sau thời gian tra cứu xác minh và xử lý hợp lệ, công dân nộp lệ phí và nhận thẻ PET mới (cùng dữ liệu cập nhật trên VNeID).',
      },
    ],
    processingTime:
      'Thời hạn cấp thẻ PET sau khi hoàn tất xác minh dữ liệu hợp lệ tham chiếu theo quy trình cấp lại Thông tư 108/2026/TT-BCA (trả thẻ thông thường 2,5 ngày làm việc nếu dữ liệu đồng bộ đầy đủ; trường hợp cần xác minh liên ngành/lưu trữ thời gian thực tế: Đang cập nhật/xác minh mốc thời gian xác minh tối đa).',
    fees:
      'Lệ phí cấp lại GPLX tham khảo theo Thông tư 37/2023/TT-BTC: 135.000 đồng/lần. Trường hợp GPLX bị mất đã hết hạn từ đủ 30 ngày trở lên phải nộp thêm phí sát hạch lại tương ứng.',
    result:
      'Giấy phép lái xe vật liệu PET cấp lại (bảo lưu số điểm GPLX hiện có) và đồng bộ trên VNeID.',
    legalBasis: [
      'Luật Trật tự, an toàn giao thông đường bộ số 36/2024/QH15 (Điều 58, Điều 62).',
      'Thông tư số 108/2026/TT-BCA ngày 29/6/2026 của Bộ trưởng Bộ Công an (bao gồm Mẫu số 01 Phụ lục X biên bản xác minh GPLX).',
      'Thông tư số 37/2023/TT-BTC của Bộ Tài chính.',
    ],
    forms: [
      {
        name: 'Đơn đề nghị đổi (cấp lại) giấy phép lái xe',
        code: 'Đang cập nhật/xác minh số hiệu phụ lục gốc TT 108/2026/TT-BCA',
        note: 'Người dân cam đoan mất GPLX và chịu trách nhiệm nếu khai báo gian dối.',
        url: '',
        verificationStatus: 'verifying',
      },
      {
        name: 'Biên bản xác minh giấy phép lái xe (Mẫu số 01 Phụ lục X - dành cho cơ quan giải quyết)',
        code: 'Mẫu số 01 Phụ lục X - TT 108/2026/TT-BCA',
        note: 'Sử dụng trong quá trình cơ quan Công an xác minh thông tin GPLX bị mất.',
        url: '',
        verificationStatus: 'verified',
      },
    ],
    faqs: [
      {
        question: 'Phân biệt giữa "Cấp lại GPLX bị mất" và "Sát hạch lại khi GPLX quá hạn" như thế nào?',
        answer:
          'Nếu GPLX bị mất nhưng vẫn CÒN HẠN (hoặc quá hạn dưới 30 ngày) và không bị tạm giữ/trừ hết điểm, bạn làm thủ tục Cấp lại GPLX mà không phải thi lại. Ngược lại, nếu GPLX bị mất tính đến ngày nộp hồ sơ đã QUÁ HẠN từ đủ 30 ngày trở lên, bạn KHÔNG được cấp lại ngay mà bắt buộc phải đăng ký Sát hạch lại lý thuyết (30 ngày đến dưới 1 năm) hoặc cả lý thuyết + thực hành (từ 1 năm trở lên).',
      },
      {
        question: 'Đang bị CSGT tạm giữ bằng hoặc đang bị trừ hết 12 điểm có xin cấp lại báo mất được không?',
        answer:
          'Tuyệt đối không. Hệ thống dữ liệu liên thông toàn quốc sẽ từ chối hồ sơ và hành vi khai báo gian dối để xin cấp lại GPLX khi đang bị giữ/tước bằng sẽ bị xử lý nghiêm theo pháp luật.',
      },
    ],
    subCases: [
      {
        title: '1. Mất GPLX còn thời hạn sử dụng',
        summary: 'Được giải quyết cấp lại không phải sát hạch lại nếu đủ điều kiện xác minh.',
        conditions: 'GPLX còn hạn trên hệ thống, không vi phạm/tạm giữ/trừ hết điểm.',
        extraDossier: 'Hồ sơ cơ bản (Đơn, KSK điện tử, CCCD, ảnh nền trắng).',
      },
      {
        title: '2. Mất GPLX đã hết hạn sử dụng',
        summary: 'Xử lý theo mốc thời gian quá hạn: Dưới 30 ngày được giải quyết không cần thi lý thuyết; từ 30 ngày đến dưới 1 năm phải thi lại lý thuyết; từ 1 năm trở lên phải thi lại cả lý thuyết và thực hành.',
        conditions: 'Phải tra cứu xác thực được thông tin GPLX cũ trên hệ thống Cục CSGT.',
        extraDossier: 'Nếu quá hạn >= 30 ngày, chuyển sang quy trình Đăng ký sát hạch khi GPLX quá hạn.',
      },
      {
        title: '3. Mất GPLX nhưng còn thông tin trong hệ thống dữ liệu',
        summary: 'Trường hợp đã tích hợp trên VNeID hoặc cơ sở dữ liệu quốc gia về GPLX.',
        conditions: 'Thông tin trùng khớp CCCD/Định danh điện tử.',
        extraDossier: 'Không cần nộp hồ sơ giấy cũ nếu hệ thống đã tra cứu và xác thực đầy đủ.',
      },
      {
        title: '4. Mất GPLX kèm thay đổi thông tin cá nhân',
        summary: 'Vừa bị mất GPLX vừa đổi từ CMND 9 số sang CCCD 12 số/Thẻ căn cước hoặc thay đổi họ tên.',
        conditions: 'Có giấy tờ chứng minh sự thay đổi nhân thân hợp pháp.',
        extraDossier: 'Bổ sung giấy xác nhận số định danh/CMND cũ hoặc trích lục hộ tịch liên quan.',
      },
      {
        title: '5. Trường hợp KHÔNG được cấp lại GPLX bị mất',
        summary: 'Không có thông tin trên hệ thống dữ liệu và không có hồ sơ lưu; đang bị tạm giữ/tước GPLX; chưa chấp hành xong quyết định xử phạt VPHC; hoặc đang bị trừ hết 12 điểm chưa kiểm tra phục hồi điểm.',
        conditions: 'Các trường hợp này sẽ bị từ chối cấp lại theo quy định pháp luật.',
        extraDossier: 'Phải hoàn thành nghĩa vụ xử phạt/phục hồi điểm trước khi thực hiện thủ tục liên quan.',
      },
    ],
    referenceNotes:
      'Người dân cần phân biệt chính xác giữa thủ tục Cấp lại GPLX bị mất và thủ tục Đăng ký sát hạch lại do quá hạn để tránh nộp sai loại hồ sơ.',
    onlinePortalUrl: ONLINE_DVC_URL,
    keywords: ['mất bằng lái', 'cấp lại GPLX', 'rơi mất giấy phép lái xe', 'không được cấp lại'],
    status: 'published',
    isVerifiedSeed: true,
    authorId: 'system',
    authorName: 'Phòng CSGT CATP Đà Nẵng',
  },
  {
    id: 'proc-phuc-hoi-diem-gplx',
    title: 'Đăng ký kiểm tra phục hồi điểm GPLX',
    slug: 'dang-ky-kiem-tra-phuc-hoi-diem-gplx',
    cardOrder: 4,
    isCoreCard: true,
    iconKey: 'award',
    groupKey: 'phuc-hoi-diem',
    shortDescription:
      'Quy định về hệ thống 12 điểm GPLX, điều kiện chờ đủ 06 tháng, hồ sơ đăng ký, nội dung thi trắc nghiệm máy tính và cơ chế phục hồi điểm theo Thông tư 105/2026/TT-BCA.',
    intro:
      'Từ ngày 01/01/2025 theo Điều 58 Luật Trật tự, an toàn giao thông đường bộ 36/2024/QH15, mỗi GPLX có 12 điểm/năm. Khi bị trừ hết 12 điểm, người lái xe không được phép điều khiển phương tiện và phải thực hiện thủ tục đăng ký kiểm tra kiến thức pháp luật về trật tự, an toàn giao thông đường bộ để được phục hồi điểm (thực hiện theo Thông tư 65/2024/TT-BCA và Thông tư 105/2026/TT-BCA có hiệu lực từ 01/7/2026).',
    targetAudience:
      'Người có giấy phép lái xe bị trừ hết 12 điểm và đã đủ thời hạn ít nhất 06 tháng kể từ ngày bị trừ hết điểm (phân biệt với người bị trừ một phần điểm — chỉ cần 12 tháng kể từ lần trừ điểm gần nhất không bị trừ thêm sẽ được tự động phục hồi đủ 12 điểm, không cần dự kiểm tra).',
    conditions:
      '1. Bị trừ hết 12 điểm trên hệ thống quản lý của lực lượng CSGT.\n2. Thời gian chờ: Đủ ít nhất 06 tháng kể từ ngày bị trừ hết điểm.\n3. Đã chấp hành xong toàn bộ các quyết định xử phạt vi phạm hành chính liên quan đến việc trừ điểm.\n4. Không thuộc trường hợp đang bị tước quyền sử dụng GPLX, bị thu hồi GPLX hoặc không đủ điều kiện sức khỏe theo quy định.',
    dossierItems: [
      'Đơn đề nghị kiểm tra kiến thức pháp luật về trật tự, an toàn giao thông đường bộ (theo mẫu ban hành kèm Thông tư 65/2024/TT-BCA và sửa đổi tại Thông tư 105/2026/TT-BCA).',
      'Giấy khám sức khỏe của người lái xe còn thời hạn (theo Thông tư 105/2026/TT-BCA, nếu người thi trượt đăng ký thi lại mà giấy KSK còn hạn thì không phải nộp lại).',
      'Bản sao/xuất trình CCCD, Thẻ căn cước hoặc Hộ chiếu còn giá trị sử dụng (đối chiếu thông tin định danh).',
    ],
    dossierQuantity: '01 bộ hồ sơ',
    submissionMethods: [
      'Nộp trực tuyến qua Cổng Dịch vụ công Quốc gia, Cổng Dịch vụ công Bộ Công an hoặc ứng dụng VNeID.',
      'Nộp trực tiếp tại Công an cấp xã, Phòng Cảnh sát giao thông Công an cấp tỉnh hoặc Cục Cảnh sát giao thông.',
      'Nộp thông qua dịch vụ bưu chính công ích.',
    ],
    receivingLocation:
      'Phòng Cảnh sát giao thông – Công an thành phố Đà Nẵng (Số 18 Võ An Ninh, phường Hòa Xuân, TP. Đà Nẵng), Công an cấp xã được phân cấp tiếp nhận hoặc Cục CSGT.',
    steps: [
      {
        stepNumber: 1,
        title: 'Theo dõi đủ 06 tháng & Xem kế hoạch kiểm tra',
        description:
          'Kiểm tra ngày bị trừ hết 12 điểm trên VNeID. Trước ngày 25 hằng tháng, cơ quan Công an công bố kế hoạch tổ chức kiểm tra kiến thức pháp luật của tháng kế tiếp.',
      },
      {
        stepNumber: 2,
        title: 'Nộp hồ sơ đăng ký kiểm tra',
        description:
          'Nộp Đơn đề nghị + Giấy khám sức khỏe còn hạn qua Cổng DVC/VNeID, dịch vụ bưu chính hoặc trực tiếp tại Phòng CSGT / Công an cấp xã.',
      },
      {
        stepNumber: 3,
        title: 'Tham dự kiểm tra trắc nghiệm trên máy tính',
        description:
          'Thi trắc nghiệm trên máy tính sử dụng bộ câu hỏi sát hạch lý thuyết lái xe tương ứng với hạng GPLX đang bị trừ hết điểm (nếu có cả GPLX mô tô và ô tô hoặc nhiều hạng, thực hiện kiểm tra theo hạng quy định). Nếu chưa đạt, được đăng ký kiểm tra lại sau 07 ngày làm việc.',
      },
      {
        stepNumber: 4,
        title: 'Phục hồi đủ 12 điểm trên hệ thống',
        description:
          'Khi có kết quả đạt yêu cầu, cơ quan có thẩm quyền cập nhật dữ liệu phục hồi đủ 12 điểm GPLX trên hệ thống quản lý và đồng bộ về VNeID.',
      },
    ],
    processingTime:
      'Theo kế hoạch kiểm tra được công bố trước ngày 25 hằng tháng. Nếu kết quả kiểm tra chưa đạt, công dân được đăng ký kiểm tra lại sau 07 ngày làm việc (Thông tư 105/2026/TT-BCA). Thời hạn trả thông báo/cập nhật điểm sau khi đạt: Đang cập nhật/xác minh số ngày chính xác theo Thông tư 105/2026/TT-BCA.',
    fees:
      'Mức phí/lệ phí kiểm tra kiến thức pháp luật để phục hồi điểm GPLX theo quy định tài chính hiện hành: Đang cập nhật/xác minh.',
    result:
      'Thông báo kết quả đạt kiểm tra và phục hồi đủ 12 điểm cho Giấy phép lái xe trên cơ sở dữ liệu quốc gia & VNeID.',
    legalBasis: [
      'Luật Trật tự, an toàn giao thông đường bộ số 36/2024/QH15 (Điều 58: Điểm của giấy phép lái xe).',
      'Thông tư số 65/2024/TT-BCA của Bộ trưởng Bộ Công an quy định kiểm tra kiến thức pháp luật về trật tự, an toàn giao thông đường bộ để được phục hồi điểm giấy phép lái xe.',
      'Thông tư số 105/2026/TT-BCA ngày 26/6/2026 của Bộ trưởng Bộ Công an sửa đổi, bổ sung một số điều của Thông tư 65/2024/TT-BCA (có hiệu lực từ 01/7/2026).',
    ],
    forms: [
      {
        name: 'Đơn đề nghị kiểm tra kiến thức pháp luật để phục hồi điểm GPLX',
        code: 'Phụ lục Thông tư 65/2024/TT-BCA & Thông tư 105/2026/TT-BCA',
        note: 'Có thể kê khai trực tuyến khi nộp qua Cổng Dịch vụ công Bộ Công an / VNeID.',
        url: '',
        verificationStatus: 'verifying',
      },
    ],
    faqs: [
      {
        question: 'Bị trừ 4 điểm hoặc 8 điểm (chưa hết 12 điểm) có cần đăng ký thi phục hồi điểm không?',
        answer:
          'Không. Theo khoản 2 Điều 58 Luật 36/2024/QH15, nếu GPLX chưa bị trừ hết điểm và không bị trừ điểm thêm trong thời hạn 12 tháng kể từ ngày bị trừ điểm gần nhất thì hệ thống sẽ tự động phục hồi đủ 12 điểm.',
      },
      {
        question: 'Thi phục hồi điểm bị trượt có phải chờ tiếp 6 tháng nữa không?',
        answer:
          'Không phải chờ 6 tháng. Theo Thông tư 105/2026/TT-BCA, nếu kết quả kiểm tra chưa đạt, bạn được đăng ký kiểm tra lại sau 07 ngày làm việc và không phải nộp lại giấy khám sức khỏe nếu giấy KSK đã nộp vẫn còn thời hạn.',
      },
    ],
    subCases: [
      {
        title: 'Phân biệt 1: Bị trừ hết 12 điểm (BẮT BUỘC kiểm tra)',
        summary: 'Không được lái xe; phải đợi tối thiểu 06 tháng từ ngày bị trừ hết điểm mới được đăng ký kiểm tra kiến thức pháp luật để phục hồi 12 điểm.',
        conditions: 'Đủ 06 tháng, đã chấp hành xong xử phạt, có KSK còn hạn.',
        extraDossier: 'Nộp hồ sơ đăng ký dự kiểm tra theo kế hoạch công bố trước ngày 25 hằng tháng.',
      },
      {
        title: 'Phân biệt 2: Bị trừ một phần điểm (KHÔNG cần thi)',
        summary: 'Vẫn được phép điều khiển phương tiện bình thường. Tự động phục hồi đủ 12 điểm nếu sau 12 tháng kể từ lần trừ điểm gần nhất không bị trừ thêm điểm.',
        conditions: 'Số điểm còn lại >= 1 điểm và không vi phạm bị trừ điểm mới trong 12 tháng.',
        extraDossier: 'Không cần nộp hồ sơ, hệ thống tự động cập nhật.',
      },
      {
        title: 'Trường hợp không được tham gia kiểm tra phục hồi điểm',
        summary: 'Chưa đủ 06 tháng kể từ ngày bị trừ hết 12 điểm; chưa chấp hành xong quyết định xử phạt VPHC; hoặc GPLX đã bị thu hồi theo quy định.',
        conditions: 'Hồ sơ sẽ không được duyệt vào danh sách kiểm tra.',
        extraDossier: 'Hoàn tất xử phạt và đợi đủ mốc thời gian 06 tháng.',
      },
    ],
    referenceNotes:
      'Lịch kiểm tra cụ thể tại thành phố Đà Nẵng được Phòng Cảnh sát giao thông công bố định kỳ trước ngày 25 hằng tháng cho tháng kế tiếp.',
    onlinePortalUrl: ONLINE_DVC_URL,
    keywords: ['phục hồi điểm', 'trừ hết 12 điểm', 'kiểm tra kiến thức pháp luật', 'Thông tư 105/2026', 'Thông tư 65/2024'],
    status: 'published',
    isVerifiedSeed: true,
    authorId: 'system',
    authorName: 'Phòng CSGT CATP Đà Nẵng',
  },
  {
    id: 'proc-sat-hach-gplx-qua-han',
    title: 'Đăng ký sát hạch khi GPLX quá hạn',
    slug: 'dang-ky-sat-hach-khi-gplx-qua-han',
    cardOrder: 5,
    isCoreCard: true,
    iconKey: 'clock-alert',
    groupKey: 'sat-hach-qua-han',
    shortDescription:
      'Chuyên mục trọng tâm phân loại chính xác các mốc quá hạn (< 30 ngày, 30 ngày – < 1 năm, >= 1 năm) và thủ tục dự sát hạch lại theo Thông tư 108/2026/TT-BCA.',
    intro:
      'Đây là nội dung được nhiều người dân quan tâm nhất khi giấy phép lái xe đã hết thời hạn ghi trên thẻ. Thông tư 108/2026/TT-BCA (hiệu lực từ 01/7/2026) quy định rành mạch 03 mốc quá hạn để xác định công dân được đổi thẳng hay phải thi sát hạch lại một phần hoặc toàn bộ.',
    targetAudience:
      'Người có giấy phép lái xe do Việt Nam cấp đã quá thời hạn sử dụng (tính từ ngày hết hạn ghi trên GPLX đến ngày nộp đủ hồ sơ hợp lệ tại cơ quan có thẩm quyền), còn dữ liệu trong hệ thống quản lý hoặc hồ sơ lưu.',
    conditions:
      '1. Còn dữ liệu GPLX trên hệ thống quản lý của Cục CSGT hoặc hồ sơ lưu theo quy định.\n2. Quá hạn dưới 30 ngày: Được giải quyết ĐỔI GPLX không phải thi sát hạch lại lý thuyết.\n3. Quá hạn từ đủ 30 ngày đến dưới 01 năm: Bắt buộc đăng ký SÁT HẠCH LẠI LÝ THUYẾT.\n4. Quá hạn từ đủ 01 năm trở lên: Bắt buộc đăng ký SÁT HẠCH LẠI CẢ LÝ THUYẾT VÀ THỰC HÀNH (lái xe trong hình và trên đường giao thông).\n5. Không đang bị tạm giữ/tước bằng hoặc bị trừ hết 12 điểm chưa phục hồi.',
    dossierItems: [
      'Đơn đề nghị đổi (cấp lại) và đăng ký sát hạch lại giấy phép lái xe theo mẫu quy định.',
      'Giấy khám sức khỏe của người lái xe còn hiệu lực (ưu tiên giấy khám sức khỏe điện tử).',
      'Bản sao/xuất trình CCCD, Thẻ căn cước hoặc Hộ chiếu còn giá trị.',
      'Bản chính GPLX đã quá hạn (trường hợp bị mất đồng thời thì ghi rõ trong đơn để đối chiếu xác minh dữ liệu).',
      'Ảnh chân dung nền trắng theo chuẩn Thông tư 108/2026/TT-BCA.',
    ],
    dossierQuantity: '01 bộ hồ sơ',
    submissionMethods: [
      'Nộp trực tiếp tại Điểm tiếp nhận hồ sơ của Phòng Cảnh sát giao thông để xếp lịch sát hạch lại.',
      'Đăng ký lịch trực tuyến qua Cổng Dịch vụ công (nếu địa phương triển khai tiếp nhận sát hạch lại trực tuyến).',
    ],
    receivingLocation:
      'Phòng Cảnh sát giao thông – Công an thành phố Đà Nẵng (Số 18 Võ An Ninh, phường Hòa Xuân, TP. Đà Nẵng) và các Trung tâm sát hạch lái xe được bố trí.',
    steps: [
      {
        stepNumber: 1,
        title: 'Tính chính xác số ngày quá hạn',
        description:
          'Đối chiếu ngày hết hạn trên GPLX với ngày dự kiến nộp đủ hồ sơ hợp lệ (sử dụng Công cụ Tra cứu thủ tục trên cổng thông tin này để phân loại nhanh mốc < 30 ngày, 30 ngày – < 1 năm hoặc >= 1 năm).',
      },
      {
        stepNumber: 2,
        title: 'Khám sức khỏe & Nộp hồ sơ đăng ký sát hạch',
        description:
          'Khám sức khỏe lái xe phù hợp với hạng GPLX quá hạn, nộp hồ sơ tại Phòng CSGT. Nếu quá hạn dưới 30 ngày, chuyển thẳng sang thủ tục Đổi GPLX không cần thi.',
      },
      {
        stepNumber: 3,
        title: 'Tham dự sát hạch lại theo mức quá hạn',
        description:
          'Từ 30 ngày đến dưới 01 năm: chỉ thi sát hạch Lý thuyết trên máy tính. Từ đủ 01 năm trở lên: thi Lý thuyết (đạt mới được thi tiếp) -> Thực hành trong hình -> Thực hành trên đường (không phải thi mô phỏng ô tô theo TT 108/2026/TT-BCA).',
      },
      {
        stepNumber: 4,
        title: 'Nộp lệ phí cấp bằng & Nhận GPLX mới',
        description:
          'Sau khi đạt sát hạch lại, dữ liệu GPLX mới được cập nhật lên VNeID (02 giờ – 01 ngày làm việc) và cấp thẻ PET mới trong không quá 3,5 ngày làm việc.',
      },
    ],
    processingTime:
      'Xếp lịch sát hạch theo kỳ tổ chức của Phòng CSGT; sau khi có kết quả đạt sát hạch, thời hạn cấp thẻ PET mới không quá 3,5 ngày làm việc (tích hợp VNeID 02 giờ – 01 ngày làm việc).',
    fees:
      'Lệ phí cấp GPLX tham khảo theo Thông tư 37/2023/TT-BTC: 135.000 đồng/lần. Phí sát hạch tính theo từng phần thi thực tế phải dự thi lại (Lý thuyết ô tô 100.000đ, Thực hành hình 350.000đ, Thực hành đường 80.000đ; mô tô: Lý thuyết 60.000đ, Thực hành 70.000đ — mức điều chỉnh mới nếu có: Đang cập nhật/xác minh).',
    result:
      'Giấy phép lái xe thẻ PET mới có thời hạn sử dụng mới và đồng bộ thông tin điện tử trên VNeID.',
    legalBasis: [
      'Luật Trật tự, an toàn giao thông đường bộ số 36/2024/QH15 (Điều 57, Điều 62).',
      'Thông tư số 108/2026/TT-BCA ngày 29/6/2026 của Bộ trưởng Bộ Công an (có hiệu lực từ 01/7/2026 — quy định mốc dưới 30 ngày, từ đủ 30 ngày đến dưới 01 năm, và từ đủ 01 năm trở lên).',
      'Thông tư số 37/2023/TT-BTC của Bộ Tài chính.',
    ],
    forms: [
      {
        name: 'Đơn đề nghị đổi (cấp lại) và dự sát hạch lại giấy phép lái xe',
        code: 'Đang cập nhật/xác minh số hiệu phụ lục gốc TT 108/2026/TT-BCA',
        note: 'Nộp trực tiếp tại điểm tiếp nhận hồ sơ Phòng CSGT.',
        url: '',
        verificationStatus: 'verifying',
      },
    ],
    faqs: [
      {
        question: 'Bằng lái xe ô tô quá hạn 10 ngày có phải thi lại lý thuyết không?',
        answer:
          'Không. Theo Thông tư 108/2026/TT-BCA (hiệu lực từ 01/7/2026), trường hợp GPLX quá hạn dưới 30 ngày tính đến ngày nộp đủ hồ sơ hợp lệ được giải quyết cấp đổi mà không phải sát hạch lại lý thuyết.',
      },
      {
        question: 'Nếu bằng quá hạn 29 ngày nhưng nộp hồ sơ thiếu giấy tờ, đến ngày thứ 32 mới bổ sung đủ thì tính thế nào?',
        answer:
          'Thời điểm tính quá hạn được căn cứ vào ngày nộp ĐỦ HỒ SƠ HỢP LỆ. Do đó nếu đến ngày nộp đủ hồ sơ hợp lệ đã đủ 30 ngày trở lên, công dân sẽ thuộc diện phải sát hạch lại lý thuyết. Hãy chuẩn bị đầy đủ hồ sơ (đặc biệt là KSK điện tử) trước khi đến hạn 30 ngày.',
      },
    ],
    subCases: [
      {
        title: 'Mốc 1: Chưa quá hạn',
        summary: 'Thực hiện thủ tục Đổi giấy phép lái xe thông thường, không phải sát hạch lại.',
        conditions: 'Ngày nộp đủ hồ sơ <= Ngày hết hạn trên GPLX.',
        extraDossier: 'Không cần hồ sơ đăng ký sát hạch.',
      },
      {
        title: 'Mốc 2: Quá hạn dưới 30 ngày',
        summary: 'Được cấp đổi GPLX mà không phải sát hạch lại lý thuyết theo Thông tư 108/2026/TT-BCA.',
        conditions: 'Quá hạn từ 01 ngày đến dưới 30 ngày tính đến ngày nộp đủ hồ sơ hợp lệ.',
        extraDossier: 'Thực hiện theo hồ sơ Đổi GPLX (bắt buộc KSK điện tử và ảnh nền trắng).',
      },
      {
        title: 'Mốc 3: Quá hạn từ đủ 30 ngày đến dưới 01 năm',
        summary: 'Phải tham dự sát hạch lại phần Lý thuyết.',
        conditions: 'Quá hạn >= 30 ngày và < 01 năm tính đến ngày nộp đủ hồ sơ hợp lệ.',
        extraDossier: 'Đơn đăng ký sát hạch lại lý thuyết + KSK còn hạn + bản sao CCCD + GPLX cũ.',
      },
      {
        title: 'Mốc 4: Quá hạn từ đủ 01 năm trở lên',
        summary: 'Phải tham dự sát hạch lại cả Lý thuyết và Thực hành (lái xe trong hình và trên đường giao thông).',
        conditions: 'Quá hạn >= 01 năm tính đến ngày nộp đủ hồ sơ hợp lệ.',
        extraDossier: 'Đơn đăng ký sát hạch lại toàn phần (lý thuyết + thực hành) + KSK + CCCD + GPLX cũ.',
      },
    ],
    referenceNotes:
      'Mốc tính số ngày quá hạn luôn tính từ ngày hết hạn ghi trên GPLX đến ngày CƠ QUAN TIẾP NHẬN NHẬN ĐỦ HỒ SƠ HỢP LỆ. Không tự ý điều khiển phương tiện khi GPLX đã hết hạn.',
    onlinePortalUrl: ONLINE_DVC_URL,
    keywords: ['quá hạn GPLX', 'hết hạn bằng lái', 'sát hạch lại', 'dưới 30 ngày', 'quá hạn 1 năm', 'Thông tư 108/2026'],
    status: 'published',
    isVerifiedSeed: true,
    authorId: 'system',
    authorName: 'Phòng CSGT CATP Đà Nẵng',
  },
  {
    id: 'proc-cap-gplx-quoc-te',
    title: 'Cấp giấy phép lái xe quốc tế',
    slug: 'cap-giay-phep-lai-xe-quoc-te',
    cardOrder: 6,
    isCoreCard: true,
    iconKey: 'globe',
    groupKey: 'gplx-quoc-te',
    shortDescription:
      'Thủ tục cấp mới Giấy phép lái xe quốc tế (IDP) theo Công ước Viên 1968 tại Điều 29 Thông tư 108/2026/TT-BCA, thời hạn xử lý tối đa 2,5 ngày làm việc.',
    intro:
      'Giấy phép lái xe quốc tế (IDP – International Driving Permit) do cơ quan Công an Việt Nam cấp theo mẫu quy định của Công ước Viên năm 1968 về giao thông đường bộ, giúp người có GPLX quốc gia Việt Nam bằng vật liệu PET lái xe hợp pháp tại các quốc gia tham gia Công ước Viên 1968.',
    targetAudience:
      'Người Việt Nam và người nước ngoài có thẻ thường trú tại Việt Nam đang có Giấy phép lái xe quốc gia do Việt Nam cấp bằng vật liệu PET còn giá trị sử dụng.',
    conditions:
      '1. Có Giấy phép lái xe quốc gia do Việt Nam cấp bằng vật liệu PET CÒN GIÁ TRỊ SỬ DỤNG và có thông tin trên hệ thống dữ liệu GPLX.\n2. Có Hộ chiếu còn giá trị sử dụng.\n3. Đối với người nước ngoài: có thêm Thẻ thường trú tại Việt Nam.\n4. GPLX quốc gia không đang bị tạm giữ, tước quyền sử dụng hoặc tẩy xóa hư hỏng không nhận dạng được.',
    dossierItems: [
      'Đơn đề nghị cấp giấy phép lái xe quốc tế theo mẫu quy định (hoặc kê khai trực tuyến trên Cổng Dịch vụ công Quốc gia).',
      'Bản chính Giấy phép lái xe quốc gia do Việt Nam cấp bằng vật liệu PET còn thời hạn (xuất trình khi nộp trực tiếp hoặc nhập số liệu đối chiếu khi nộp trực tuyến).',
      'Bản chính Hộ chiếu còn giá trị sử dụng.',
      'Thẻ thường trú tại Việt Nam (bắt buộc xuất trình nếu người đề nghị là công dân nước ngoài).',
      '01 ảnh chân dung nền trắng kích thước 3x4 cm (hoặc chụp ảnh trực tiếp tại cơ quan tiếp nhận).',
    ],
    dossierQuantity: '01 bộ hồ sơ',
    submissionMethods: [
      'Nộp trực tuyến qua Cổng Dịch vụ công Quốc gia (kê khai mẫu trực tuyến, đối chiếu dữ liệu quốc gia và thanh toán lệ phí trực tuyến).',
      'Nộp trực tiếp tại Cục Cảnh sát giao thông hoặc Phòng Cảnh sát giao thông Công an tỉnh, thành phố.',
    ],
    receivingLocation:
      'Phòng Cảnh sát giao thông – Công an thành phố Đà Nẵng (Số 18 Võ An Ninh, phường Hòa Xuân, TP. Đà Nẵng) hoặc Cục Cảnh sát giao thông / Cổng Dịch vụ công Quốc gia.',
    steps: [
      {
        stepNumber: 1,
        title: 'Kiểm tra GPLX quốc gia PET & Hộ chiếu',
        description:
          'Đảm bảo bạn đang sở hữu GPLX quốc gia bằng vật liệu PET (loại thẻ nhựa có mã QR/dữ liệu trên hệ thống) còn hạn sử dụng và Hộ chiếu còn hiệu lực.',
      },
      {
        stepNumber: 2,
        title: 'Nộp hồ sơ trực tiếp hoặc trực tuyến',
        description:
          'Kê khai thông tin trên Cổng Dịch vụ công Quốc gia kèm ảnh chân dung nền trắng 3x4 cm, hoặc đến trực tiếp Phòng CSGT xuất trình GPLX PET, Hộ chiếu (và Thẻ thường trú nếu là người nước ngoài).',
      },
      {
        stepNumber: 3,
        title: 'Kiểm tra tính hợp lệ & Thanh toán lệ phí',
        description:
          'Trường hợp hồ sơ chưa hợp lệ, cơ quan Công an thông báo bổ sung/sửa đổi trong tối đa 02 ngày làm việc. Người dân hoàn thành nộp lệ phí.',
      },
      {
        stepNumber: 4,
        title: 'Nhận sổ Giấy phép lái xe quốc tế (IDP)',
        description:
          'Nhận kết quả IDP trực tiếp tại nơi nộp hoặc qua dịch vụ bưu chính công ích trong thời hạn không quá 2,5 ngày làm việc.',
      },
    ],
    processingTime:
      'Không quá 2,5 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ (Điều 29 Thông tư 108/2026/TT-BCA). Thông báo bổ sung hồ sơ không hợp lệ trong thời hạn 02 ngày làm việc.',
    fees:
      'Lệ phí cấp GPLX quốc tế theo Thông tư 37/2023/TT-BTC: 135.000 đồng/lần cấp (mức thu ưu đãi trực tuyến nếu áp dụng theo Thông tư Bộ Tài chính từng giai đoạn: Đang cập nhật/xác minh). Phí bưu chính do người dân chi trả nếu nhận tại nhà.',
    result:
      'Sổ Giấy phép lái xe quốc tế (IDP) theo mẫu Công ước Viên 1968, có thời hạn không quá 03 năm kể từ ngày cấp và không vượt quá thời hạn còn lại của GPLX quốc gia.',
    legalBasis: [
      'Luật Trật tự, an toàn giao thông đường bộ số 36/2024/QH15.',
      'Thông tư số 108/2026/TT-BCA ngày 29/6/2026 của Bộ trưởng Bộ Công an (Điều 29: Cấp giấy phép lái xe quốc tế, hiệu lực từ 01/7/2026).',
      'Công ước quốc tế về Giao thông đường bộ năm 1968 (Công ước Viên).',
      'Thông tư số 37/2023/TT-BTC của Bộ Tài chính.',
    ],
    forms: [
      {
        name: 'Đơn đề nghị cấp giấy phép lái xe quốc tế (IDP)',
        code: 'Điều 29 Thông tư 108/2026/TT-BCA (số phụ lục gốc: Đang cập nhật/xác minh)',
        note: 'Có biểu mẫu kê khai trực tuyến ngay trên Cổng Dịch vụ công Quốc gia.',
        url: '',
        verificationStatus: 'verifying',
      },
    ],
    faqs: [
      {
        question: 'IDP do Việt Nam cấp có thời hạn tối đa bao lâu?',
        answer:
          'Thời hạn của IDP không quá 03 năm kể từ ngày cấp và phải phù hợp (không vượt quá) thời hạn còn hiệu lực của GPLX quốc gia Việt Nam tương ứng.',
      },
      {
        question: 'Tôi vẫn đang dùng bằng lái xe bằng giấy bìa cũ (chưa đổi sang thẻ PET) có làm được IDP không?',
        answer:
          'Không. Điều kiện bắt buộc để cấp IDP là phải có Giấy phép lái xe quốc gia do Việt Nam cấp bằng vật liệu PET còn giá trị sử dụng. Bạn cần làm thủ tục Đổi GPLX sang thẻ PET trước.',
      },
    ],
    subCases: [],
    referenceNotes:
      'Lưu ý quan trọng: IDP do Việt Nam cấp chỉ có giá trị sử dụng ở nước ngoài (tại các quốc gia tham gia Công ước Viên 1968) và phải luôn mang kèm bản chính GPLX quốc gia Việt Nam.',
    onlinePortalUrl: ONLINE_DVC_URL,
    keywords: ['GPLX quốc tế', 'IDP', 'cấp bằng lái quốc tế', 'Công ước Viên 1968', 'Điều 29 Thông tư 108'],
    status: 'published',
    isVerifiedSeed: true,
    authorId: 'system',
    authorName: 'Phòng CSGT CATP Đà Nẵng',
  },
  {
    id: 'proc-doi-gplx-quoc-te',
    title: 'Đổi giấy phép lái xe quốc tế',
    slug: 'doi-giay-phep-lai-xe-quoc-te',
    cardOrder: 7,
    isCoreCard: true,
    iconKey: 'globe-refresh',
    groupKey: 'gplx-quoc-te',
    shortDescription:
      'Hướng dẫn cấp đổi / cấp lại Giấy phép lái xe quốc tế (IDP) khi hết thời hạn, bị hư hỏng, mất hoặc cần cập nhật theo GPLX quốc gia/Hộ chiếu mới.',
    intro:
      'Theo Điều 29 Thông tư 108/2026/TT-BCA, thủ tục cấp đổi hoặc cấp lại Giấy phép lái xe quốc tế (IDP) do Việt Nam cấp được thực hiện thống nhất cùng quy trình tiếp nhận, đối chiếu GPLX quốc gia bằng vật liệu PET và hộ chiếu còn thời hạn khi sổ IDP cũ hết hạn, bị hỏng, bị mất hoặc có thay đổi thông tin hộ chiếu/GPLX quốc gia.',
    targetAudience:
      'Người Việt Nam hoặc người nước ngoài có thẻ thường trú tại Việt Nam đã từng được cấp IDP của Việt Nam nhưng nay hết hạn, hư hỏng, thất lạc hoặc vừa đổi GPLX quốc gia/Hộ chiếu mới.',
    conditions:
      '1. Giấy phép lái xe quốc gia do Việt Nam cấp bằng vật liệu PET vẫn còn giá trị sử dụng và có dữ liệu hợp lệ trên hệ thống CSGT.\n2. Hộ chiếu còn giá trị sử dụng (trùng khớp thông tin công dân).\n3. Người nước ngoài phải xuất trình Thẻ thường trú tại Việt Nam còn hiệu lực.\n4. Lưu ý: IDP do NƯỚC NGOÀI cấp không được đổi trực tiếp thành IDP của Việt Nam; nếu người nước ngoài hoặc công dân muốn lái xe lâu dài tại Việt Nam thì thực hiện thủ tục Đổi GPLX nước ngoài sang GPLX quốc gia Việt Nam.',
    dossierItems: [
      'Đơn đề nghị cấp đổi/cấp lại giấy phép lái xe quốc tế theo quy định tại Điều 29 Thông tư 108/2026/TT-BCA.',
      'Bản chính Giấy phép lái xe quốc gia do Việt Nam cấp bằng vật liệu PET còn giá trị sử dụng.',
      'Bản chính Hộ chiếu còn giá trị sử dụng.',
      'Thẻ thường trú tại Việt Nam (đối với người nước ngoài).',
      '01 ảnh chân dung nền trắng 3x4 cm (hoặc chụp trực tiếp tại cơ quan tiếp nhận).',
      'Bản chính sổ IDP cũ (nếu còn và đề nghị đổi do hết hạn/hư hỏng).',
    ],
    dossierQuantity: '01 bộ hồ sơ',
    submissionMethods: [
      'Nộp trực tuyến qua Cổng Dịch vụ công Quốc gia.',
      'Nộp trực tiếp tại Cục Cảnh sát giao thông hoặc Phòng Cảnh sát giao thông Công an tỉnh, thành phố.',
    ],
    receivingLocation:
      'Phòng Cảnh sát giao thông – Công an thành phố Đà Nẵng (Số 18 Võ An Ninh, phường Hòa Xuân, TP. Đà Nẵng) hoặc Cục Cảnh sát giao thông.',
    steps: [
      {
        stepNumber: 1,
        title: 'Kiểm tra hiệu lực GPLX quốc gia PET và Hộ chiếu mới',
        description:
          'Nếu GPLX quốc gia cũng sắp hết hạn hoặc mới đổi số hộ chiếu, cần hoàn tất đổi GPLX quốc gia trước để thời hạn IDP mới được cấp tối đa.',
      },
      {
        stepNumber: 2,
        title: 'Nộp hồ sơ đề nghị cấp đổi/cấp lại IDP',
        description:
          'Kê khai trực tuyến trên Cổng Dịch vụ công Quốc gia hoặc nộp trực tiếp tại Phòng CSGT kèm ảnh nền trắng 3x4 cm và giấy tờ đối chiếu.',
      },
      {
        stepNumber: 3,
        title: 'Kiểm tra dữ liệu & Nộp lệ phí',
        description:
          'Cơ quan Công an kiểm tra tính hợp lệ (thông báo bổ sung trong 02 ngày làm việc nếu thiếu/sai), sau đó thu lệ phí.',
      },
      {
        stepNumber: 4,
        title: 'Nhận sổ IDP mới',
        description:
          'Nhận sổ IDP mới trong thời hạn không quá 2,5 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ.',
      },
    ],
    processingTime:
      'Không quá 2,5 ngày làm việc kể từ ngày nhận đủ hồ sơ hợp lệ (Thông tư 108/2026/TT-BCA).',
    fees:
      'Lệ phí cấp đổi/cấp lại IDP tham khảo theo Thông tư 37/2023/TT-BTC: 135.000 đồng/lần cấp (biểu phí trực tuyến từ 01/7/2026: Đang cập nhật/xác minh).',
    result:
      'Sổ Giấy phép lái xe quốc tế (IDP) mới theo mẫu Công ước Viên 1968.',
    legalBasis: [
      'Luật Trật tự, an toàn giao thông đường bộ số 36/2024/QH15.',
      'Thông tư số 108/2026/TT-BCA ngày 29/6/2026 của Bộ trưởng Bộ Công an (Điều 29, hiệu lực từ 01/7/2026).',
      'Thông tư số 37/2023/TT-BTC của Bộ Tài chính.',
    ],
    forms: [
      {
        name: 'Đơn đề nghị cấp đổi/cấp lại giấy phép lái xe quốc tế',
        code: 'Điều 29 Thông tư 108/2026/TT-BCA (số phụ lục gốc: Đang cập nhật/xác minh)',
        note: 'Thực hiện kê khai trực tiếp trên Cổng Dịch vụ công Quốc gia hoặc tại quầy.',
        url: '',
        verificationStatus: 'verifying',
      },
    ],
    faqs: [
      {
        question: 'Có đổi được bằng lái xe quốc tế do nước ngoài cấp sang bằng lái quốc tế của Việt Nam không?',
        answer:
          'Không. IDP là bản dịch/giấy phép đi kèm với GPLX quốc gia. Cơ quan Công an Việt Nam chỉ cấp và cấp đổi IDP dựa trên GPLX quốc gia bằng vật liệu PET do Việt Nam cấp. Nếu bạn có GPLX quốc gia nước ngoài muốn lái xe lâu dài tại Việt Nam, hãy làm thủ tục "Đổi giấy phép lái xe" từ bằng nước ngoài sang GPLX Việt Nam.',
      },
    ],
    subCases: [],
    referenceNotes:
      'Điều 29 Thông tư 108/2026/TT-BCA quy định chung quy trình cấp lần đầu, cấp đổi, cấp lại IDP trong 2,5 ngày làm việc.',
    onlinePortalUrl: ONLINE_DVC_URL,
    keywords: ['đổi GPLX quốc tế', 'cấp lại IDP', 'IDP hết hạn', 'mất IDP'],
    status: 'published',
    isVerifiedSeed: true,
    authorId: 'system',
    authorName: 'Phòng CSGT CATP Đà Nẵng',
  },
  {
    id: 'proc-su-dung-gplx-quoc-te',
    title: 'Sử dụng giấy phép lái xe quốc tế',
    slug: 'su-dung-giay-phep-lai-xe-quoc-te',
    cardOrder: 8,
    isCoreCard: true,
    iconKey: 'shield-check',
    groupKey: 'gplx-quoc-te',
    shortDescription:
      'Quy định sử dụng IDP tại Điều 30 Thông tư 108/2026/TT-BCA: phạm vi Công ước Viên 1968, điều kiện mang kèm GPLX quốc gia, trường hợp không được dùng và so sánh IDP vs GPLX Việt Nam.',
    intro:
      'Khác với thủ tục nộp hồ sơ cấp đổi, đây là hướng dẫn pháp lý bắt buộc về quy tắc sử dụng Giấy phép lái xe quốc tế (IDP) theo Điều 30 Thông tư 108/2026/TT-BCA — áp dụng cho cả người Việt Nam mang IDP ra nước ngoài và người nước ngoài sử dụng IDP tại Việt Nam.',
    targetAudience:
      '1. Người có IDP do Việt Nam cấp khi điều khiển phương tiện tham gia giao thông ở nước ngoài.\n2. Người nước ngoài / người Việt Nam định cư ở nước ngoài có IDP do nước tham gia Công ước Viên 1968 cấp khi điều khiển xe trên lãnh thổ Việt Nam.',
    conditions:
      '1. Phải mang theo ĐỒNG THỜI cả Giấy phép lái xe quốc tế (IDP) và Giấy phép lái xe quốc gia tương ứng còn thời hạn hiệu lực.\n2. Chỉ được điều khiển đúng hạng xe được ghi nhận trên cả IDP và GPLX quốc gia.\n3. IDP do Việt Nam cấp KHÔNG có giá trị sử dụng trong phạm vi lãnh thổ Việt Nam (Khoản 1 Điều 30 Thông tư 108/2026/TT-BCA).\n4. IDP nước ngoài chỉ được công nhận tại Việt Nam khi do cơ quan có thẩm quyền của quốc gia thành viên Công ước Viên năm 1968 cấp (các nước chỉ tham gia Công ước Geneva 1949 mà không tham gia Công ước Viên 1968 không thuộc phạm vi công nhận mặc định này, trừ khi có điều ước song phương khác).',
    dossierItems: [
      'Không cần nộp hồ sơ hành chính — khi tham gia giao thông bắt buộc mang theo các giấy tờ sau:',
      'Bản chính Sổ Giấy phép lái xe quốc tế (IDP) còn thời hạn.',
      'Bản chính Giấy phép lái xe quốc gia tương ứng còn thời hạn sử dụng.',
      'Hộ chiếu và giấy tờ nhập cảnh/cư trú hợp pháp tại quốc gia lưu thông.',
    ],
    dossierQuantity: 'Mang theo bản chính khi tham gia giao thông',
    submissionMethods: [
      'Xuất trình trực tiếp khi lực lượng chức năng kiểm tra giao thông hoặc khi làm thủ tục thuê xe ở nước sở tại.',
    ],
    receivingLocation:
      'Áp dụng tại các quốc gia thành viên Công ước Viên 1968 (trên 85 quốc gia và vùng lãnh thổ tham gia Công ước Viên 1968; danh sách cập nhật từng thời kỳ cần đối chiếu trước khi xuất cảnh) và tại Việt Nam đối với IDP Công ước Viên 1968 nước ngoài.',
    steps: [
      {
        stepNumber: 1,
        title: 'Kiểm tra tư cách thành viên Công ước Viên 1968 của nước đến',
        description:
          'Trước khi ra nước ngoài, kiểm tra xem quốc gia điểm đến có công nhận IDP theo Công ước Viên 1968 hay yêu cầu quy định riêng của nước sở tại.',
      },
      {
        stepNumber: 2,
        title: 'Chuẩn bị đồng thời IDP + GPLX quốc gia bản chính',
        description:
          'Luôn mang theo cả hai loại giấy phép bản chính còn hạn. Nếu chỉ mang IDP mà không có GPLX quốc gia gốc thì IDP không có hiệu lực pháp lý độc lập.',
      },
      {
        stepNumber: 3,
        title: 'Tuân thủ đúng hạng xe & Luật giao thông nước sở tại',
        description:
          'Điều khiển đúng hạng phương tiện cho phép trên GPLX và chấp hành nghiêm quy tắc giao thông đường bộ tại nước lưu thông.',
      },
      {
        stepNumber: 4,
        title: 'Lưu ý chuyển đổi khi cư trú dài hạn tại Việt Nam',
        description:
          'Người nước ngoài cư trú/làm việc/học tập có thị thực từ 90 ngày trở lên tại Việt Nam nên thực hiện thủ tục Đổi GPLX nước ngoài sang GPLX Việt Nam để lưu thông lâu dài.',
      },
    ],
    processingTime: 'Áp dụng ngay trong thời hạn hiệu lực ghi trên IDP (tối đa 03 năm và không quá hạn GPLX quốc gia).',
    fees: 'Không phát sinh lệ phí hành chính khi sử dụng hợp lệ.',
    result: 'Lưu thông hợp pháp theo đúng quy định Điều 30 Thông tư 108/2026/TT-BCA và Công ước Viên 1968.',
    legalBasis: [
      'Luật Trật tự, an toàn giao thông đường bộ số 36/2024/QH15.',
      'Thông tư số 108/2026/TT-BCA ngày 29/6/2026 của Bộ trưởng Bộ Công an (Điều 30: Sử dụng giấy phép lái xe quốc tế, hiệu lực từ 01/7/2026).',
      'Công ước Viên năm 1968 về Giao thông đường bộ.',
    ],
    forms: [],
    faqs: [
      {
        question: 'Người Việt Nam cầm IDP do Việt Nam cấp lái xe tại Đà Nẵng có hợp lệ không?',
        answer:
          'Không. Khoản 1 Điều 30 Thông tư 108/2026/TT-BCA quy định rõ: IDP do Việt Nam cấp KHÔNG có giá trị sử dụng trong lãnh thổ Việt Nam. Trong nước phải sử dụng GPLX quốc gia Việt Nam (hoặc dữ liệu đã tích hợp trên VNeID).',
      },
      {
        question: 'Du khách nước ngoài mang IDP Công ước Viên 1968 vào Việt Nam có cần mang bằng gốc của nước họ không?',
        answer:
          'Có. Khi lái xe tại Việt Nam, người lái xe nước ngoài bắt buộc phải mang theo ĐỒNG THỜI cả IDP và GPLX quốc gia tương ứng còn giá trị sử dụng.',
      },
    ],
    subCases: [
      {
        title: 'Phân biệt IDP (Quốc tế) vs GPLX Việt Nam (Quốc gia)',
        summary:
          'GPLX Việt Nam dùng hợp pháp trên toàn lãnh thổ Việt Nam (có thể xuất trình qua VNeID); không thay thế IDP ở nước ngoài nếu nước đó không ký song phương. Ngược lại, IDP do Việt Nam cấp chỉ dùng tại các nước Công ước Viên 1968 (trừ Việt Nam) và bắt buộc kẹp chung GPLX Việt Nam bản gốc.',
        conditions: 'Xem chi tiết tại Khoản 1 và Khoản 2 Điều 30 Thông tư 108/2026/TT-BCA.',
        extraDossier: 'Không có.',
      },
      {
        title: 'Các trường hợp KHÔNG được sử dụng IDP',
        summary:
          '1) Sử dụng IDP do Việt Nam cấp để lái xe tại Việt Nam; 2) Không mang theo GPLX quốc gia bản chính đi kèm; 3) IDP hoặc GPLX quốc gia đã hết hạn sử dụng; 4) IDP không thuộc mẫu Công ước Viên 1968 (trừ trường hợp điều ước quốc tế khác có quy định); 5) Người vi phạm bị tước quyền sử dụng GPLX tại Việt Nam.',
        conditions: 'Vi phạm sẽ bị xử lý hành chính như hành vi không có GPLX phù hợp.',
        extraDossier: 'Không có.',
      },
    ],
    referenceNotes:
      'Danh sách đầy đủ từng quốc gia công nhận IDP Công ước Viên 1968 thay đổi theo điều ước quốc tế — người dân cần kiểm tra xác nhận trước chuyến đi nước ngoài (một số nước như Mỹ, Úc, Nhật, Anh, Trung Quốc có quy tắc riêng về Công ước 1949/không công nhận IDP 1968).',
    onlinePortalUrl: ONLINE_DVC_URL,
    keywords: ['sử dụng IDP', 'Công ước Viên 1968', 'người nước ngoài lái xe', 'Điều 30 Thông tư 108', 'phân biệt IDP'],
    status: 'published',
    isVerifiedSeed: true,
    authorId: 'system',
    authorName: 'Phòng CSGT CATP Đà Nẵng',
  },
];

export const DEFAULT_LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'doc-tt-108-2026-bca',
    docNumber: '108/2026/TT-BCA',
    title: 'Thông tư quy định về sát hạch, cấp giấy phép lái xe; cấp, sử dụng giấy phép lái xe quốc tế',
    docType: 'circular',
    issuedDate: '2026-06-29',
    effectiveDate: '2026-07-01',
    issuingAuthority: 'Bộ Công an',
    validityStatus: 'effective',
    summary:
      'Thay thế Thông tư 12/2025/TT-BCA. Quy định nguyên tắc sát hạch "đạt phần trước mới thi phần sau", bãi bỏ phần thi mô phỏng ô tô, bổ sung bài sa hình số 2 mô tô, phân loại mốc quá hạn GPLX (< 30 ngày, 30 ngày – < 1 năm, >= 1 năm), rút ngắn thời gian cấp thẻ PET (2,5 – 3,5 ngày làm việc) và cấp/sử dụng IDP tại Điều 29, Điều 30.',
    pdfUrl: '',
    relatedProcedureSlugs: [
      'cap-giay-phep-lai-xe-lan-dau',
      'doi-giay-phep-lai-xe',
      'cap-lai-giay-phep-lai-xe-bi-mat',
      'dang-ky-sat-hach-khi-gplx-qua-han',
      'cap-giay-phep-lai-xe-quoc-te',
      'doi-giay-phep-lai-xe-quoc-te',
      'su-dung-giay-phep-lai-xe-quoc-te',
    ],
    status: 'published',
    authorId: 'system',
  },
  {
    id: 'doc-tt-105-2026-bca',
    docNumber: '105/2026/TT-BCA',
    title: 'Thông tư sửa đổi, bổ sung một số điều của Thông tư 65/2024/TT-BCA quy định kiểm tra kiến thức pháp luật về trật tự, an toàn giao thông đường bộ để được phục hồi điểm giấy phép lái xe',
    docType: 'circular',
    issuedDate: '2026-06-26',
    effectiveDate: '2026-07-01',
    issuingAuthority: 'Bộ Công an',
    validityStatus: 'effective',
    summary:
      'Mở rộng tiếp nhận hồ sơ tại Công an cấp xã, Phòng CSGT, Cục CSGT, trực tuyến qua Cổng DVC/VNeID hoặc bưu chính; công bố kế hoạch kiểm tra trước ngày 25 hằng tháng; cho phép đăng ký thi lại sau 07 ngày làm việc và không phải nộp lại giấy KSK còn hạn.',
    pdfUrl: '',
    relatedProcedureSlugs: ['dang-ky-kiem-tra-phuc-hoi-diem-gplx'],
    status: 'published',
    authorId: 'system',
  },
  {
    id: 'doc-luat-36-2024-qh15',
    docNumber: '36/2024/QH15',
    title: 'Luật Trật tự, an toàn giao thông đường bộ',
    docType: 'law',
    issuedDate: '2024-06-27',
    effectiveDate: '2025-01-01',
    issuingAuthority: 'Quốc hội',
    validityStatus: 'effective',
    summary:
      'Luật nền tảng quy định 15 hạng GPLX (Điều 57), hệ thống 12 điểm GPLX & phục hồi điểm sau 06 tháng/12 tháng (Điều 58), độ tuổi, sức khỏe người lái xe (Điều 59) và cấp, đổi, cấp lại, thu hồi GPLX (Điều 62).',
    pdfUrl: '',
    relatedProcedureSlugs: [
      'cap-giay-phep-lai-xe-lan-dau',
      'doi-giay-phep-lai-xe',
      'cap-lai-giay-phep-lai-xe-bi-mat',
      'dang-ky-kiem-tra-phuc-hoi-diem-gplx',
      'dang-ky-sat-hach-khi-gplx-qua-han',
    ],
    status: 'published',
    authorId: 'system',
  },
  {
    id: 'doc-tt-65-2024-bca',
    docNumber: '65/2024/TT-BCA',
    title: 'Thông tư quy định kiểm tra kiến thức pháp luật về trật tự, an toàn giao thông đường bộ để được phục hồi điểm giấy phép lái xe',
    docType: 'circular',
    issuedDate: '2024-11-12',
    effectiveDate: '2025-01-01',
    issuingAuthority: 'Bộ Công an',
    validityStatus: 'amended',
    summary:
      'Văn bản gốc quy định trình tự kiểm tra kiến thức pháp luật về TTATGT đường bộ để phục hồi 12 điểm GPLX (được sửa đổi, bổ sung một số điều bởi Thông tư 105/2026/TT-BCA từ 01/7/2026).',
    pdfUrl: '',
    relatedProcedureSlugs: ['dang-ky-kiem-tra-phuc-hoi-diem-gplx'],
    status: 'published',
    authorId: 'system',
  },
  {
    id: 'doc-tt-37-2023-btc',
    docNumber: '37/2023/TT-BTC',
    title: 'Thông tư quy định mức thu, chế độ thu, nộp, quản lý và sử dụng phí sát hạch lái xe; lệ phí cấp bằng, chứng chỉ được hoạt động trên các loại phương tiện và lệ phí đăng ký, cấp biển xe máy chuyên dùng',
    docType: 'circular',
    issuedDate: '2023-06-07',
    effectiveDate: '2023-08-01',
    issuingAuthority: 'Bộ Tài chính',
    validityStatus: 'verifying',
    summary:
      'Quy định khung mức thu lệ phí cấp mới/đổi/cấp lại GPLX (135.000đ/lần) và phí sát hạch từng phần. Ghi chú: Mức điều chỉnh/cập nhật đối với phần thi theo Thông tư 108/2026/TT-BCA và ưu đãi trực tuyến sau 01/7/2026 đang được cập nhật/xác minh.',
    pdfUrl: '',
    relatedProcedureSlugs: [
      'cap-giay-phep-lai-xe-lan-dau',
      'doi-giay-phep-lai-xe',
      'cap-lai-giay-phep-lai-xe-bi-mat',
      'dang-ky-sat-hach-khi-gplx-qua-han',
      'cap-giay-phep-lai-xe-quoc-te',
    ],
    status: 'published',
    authorId: 'system',
  },
  {
    id: 'doc-qd-cong-bo-tthc',
    docNumber: 'Đang cập nhật/xác minh',
    title: 'Quyết định công bố thủ tục hành chính được sửa đổi, bổ sung trong lĩnh vực sát hạch, cấp giấy phép lái xe thuộc phạm vi chức năng quản lý của Bộ Công an (theo Thông tư 108/2026/TT-BCA)',
    docType: 'decision',
    issuedDate: 'Đang cập nhật/xác minh',
    effectiveDate: 'Đang cập nhật/xác minh',
    issuingAuthority: 'Bộ Công an',
    validityStatus: 'verifying',
    summary:
      'Số hiệu quyết định công bố TTHC chi tiết và bộ biểu mẫu điện tử đính kèm đang được cập nhật bản PDF chính thức từ Bộ Công an / UBND thành phố Đà Nẵng.',
    pdfUrl: '',
    relatedProcedureSlugs: [
      'cap-giay-phep-lai-xe-lan-dau',
      'doi-giay-phep-lai-xe',
      'cap-lai-giay-phep-lai-xe-bi-mat',
    ],
    status: 'published',
    authorId: 'system',
  },
];

export const DEFAULT_FAQS: FaqItem[] = [
  {
    id: 'faq-1',
    question: 'Giấy phép lái xe quá hạn dưới 30 ngày có phải thi lại lý thuyết không?',
    answer:
      'Không. Căn cứ Thông tư 108/2026/TT-BCA (hiệu lực từ ngày 01/7/2026), người có GPLX quá thời hạn sử dụng dưới 30 ngày (tính từ ngày hết hạn đến ngày nộp đủ hồ sơ hợp lệ) được giải quyết cấp đổi mà không phải sát hạch lại lý thuyết, nếu còn thông tin trong hệ thống dữ liệu quản lý GPLX của Cục Cảnh sát giao thông.',
    category: 'Sát hạch quá hạn',
    relatedProcedureSlug: 'dang-ky-sat-hach-khi-gplx-qua-han',
    legalRef: 'Thông tư 108/2026/TT-BCA (hiệu lực 01/7/2026)',
    order: 1,
    status: 'published',
    authorId: 'system',
  },
  {
    id: 'faq-2',
    question: 'Nếu GPLX quá hạn từ đủ 30 ngày đến dưới 01 năm hoặc từ 01 năm trở lên thì phải thi những phần nào?',
    answer:
      'Theo Thông tư 108/2026/TT-BCA: (1) Quá hạn từ đủ 30 ngày đến dưới 01 năm phải sát hạch lại phần Lý thuyết; (2) Quá hạn từ đủ 01 năm trở lên phải sát hạch lại cả Lý thuyết và Thực hành (lái xe trong hình và trên đường giao thông). Không còn thi phần mềm mô phỏng ô tô từ 01/7/2026.',
    category: 'Sát hạch quá hạn',
    relatedProcedureSlug: 'dang-ky-sat-hach-khi-gplx-qua-han',
    legalRef: 'Thông tư 108/2026/TT-BCA',
    order: 2,
    status: 'published',
    authorId: 'system',
  },
  {
    id: 'faq-3',
    question: 'Bị mất giấy phép lái xe nhưng bằng đó đã hết hạn thì giải quyết theo thủ tục Cấp lại hay Sát hạch lại?',
    answer:
      'Phải căn cứ vào số ngày quá hạn tính đến ngày nộp đủ hồ sơ hợp lệ: Nếu còn hạn hoặc quá hạn dưới 30 ngày (và có dữ liệu trên hệ thống, không bị tạm giữ/tước bằng/trừ hết điểm), được giải quyết Cấp lại GPLX bị mất không cần thi. Nếu đã quá hạn từ đủ 30 ngày trở lên, công dân bắt buộc phải thực hiện Sát hạch lại tương ứng (Lý thuyết hoặc cả Lý thuyết + Thực hành).',
    category: 'Cấp lại GPLX bị mất',
    relatedProcedureSlug: 'cap-lai-giay-phep-lai-xe-bi-mat',
    legalRef: 'Thông tư 108/2026/TT-BCA; Luật 36/2024/QH15',
    order: 3,
    status: 'published',
    authorId: 'system',
  },
  {
    id: 'faq-4',
    question: 'Khi nào bị trừ hết 12 điểm GPLX mới được đăng ký kiểm tra phục hồi điểm? Nếu mới bị trừ 6 điểm thì sao?',
    answer:
      'Theo Điều 58 Luật 36/2024/QH15: Nếu bị trừ hết 12 điểm, người lái xe không được lái xe và phải chờ ít nhất đủ 06 tháng kể từ ngày bị trừ hết điểm mới được đăng ký kiểm tra kiến thức pháp luật để phục hồi đủ 12 điểm. Nếu mới bị trừ một phần (ví dụ 6 điểm, còn 6 điểm), bạn không cần dự kiểm tra — sau 12 tháng kể từ lần trừ điểm gần nhất không bị trừ thêm điểm thì hệ thống tự động phục hồi đủ 12 điểm.',
    category: 'Phục hồi điểm GPLX',
    relatedProcedureSlug: 'dang-ky-kiem-tra-phuc-hoi-diem-gplx',
    legalRef: 'Điều 58 Luật 36/2024/QH15; Thông tư 105/2026/TT-BCA',
    order: 4,
    status: 'published',
    authorId: 'system',
  },
  {
    id: 'faq-5',
    question: 'Đổi GPLX hạng A1/A (xe máy) có cần giấy khám sức khỏe không và ảnh chân dung chụp nền màu gì?',
    answer:
      'Theo Thông tư 108/2026/TT-BCA, thủ tục đổi GPLX mô tô cũng bắt buộc có giấy khám sức khỏe hợp lệ (ưu tiên giấy khám sức khỏe điện tử). Ngoài ra, ảnh chân dung nộp hồ sơ quy định sử dụng nền trắng (thay cho nền xanh trước đây).',
    category: 'Đổi GPLX',
    relatedProcedureSlug: 'doi-giay-phep-lai-xe',
    legalRef: 'Thông tư 108/2026/TT-BCA',
    order: 5,
    status: 'published',
    authorId: 'system',
  },
  {
    id: 'faq-6',
    question: 'Giấy phép lái xe quốc tế (IDP) do Việt Nam cấp có dùng để lái xe trong nước được không?',
    answer:
      'Không. Khoản 1 Điều 30 Thông tư 108/2026/TT-BCA quy định rõ IDP do Việt Nam cấp theo Công ước Viên 1968 chỉ có giá trị sử dụng ở nước ngoài (tại các nước thành viên Công ước Viên 1968) và không có giá trị sử dụng trên lãnh thổ Việt Nam.',
    category: 'GPLX quốc tế',
    relatedProcedureSlug: 'su-dung-giay-phep-lai-xe-quoc-te',
    legalRef: 'Điều 30 Thông tư 108/2026/TT-BCA',
    order: 6,
    status: 'published',
    authorId: 'system',
  },
];
