import type { SectionType } from '../types/portal';

export interface TT108CategoryTemplate {
  name: string;
  slug: string;
  description: string;
  order: number;
  isVisible: boolean;
}

export interface TT108ProcedureTemplate {
  id: string;
  label: string;
  categorySlug: string;
  sectionType: SectionType;
  title: string;
  slug: string;
  shortDescription: string;
  keywords: string[];
  contentHtml: string;
}

export const TT108_CATEGORIES: TT108CategoryTemplate[] = [
  {
    name: 'Cấp đổi giấy phép lái xe',
    slug: 'cap-doi-giay-phep-lai-xe',
    description:
      'Đổi GPLX sắp hết hạn, hư hỏng, sai lệch thông tin, quá hạn dưới 30 ngày, GPLX nước ngoài/ngành sang dân sự theo TT 108/2026/TT-BCA.',
    order: 1,
    isVisible: true,
  },
  {
    name: 'Cấp lại giấy phép lái xe',
    slug: 'cap-lai-giay-phep-lai-xe',
    description:
      'Cấp lại GPLX bị mất (còn thời hạn hoặc quá hạn từ 30 ngày trở lên phải sát hạch lại) theo TT 108/2026/TT-BCA.',
    order: 2,
    isVisible: true,
  },
  {
    name: 'Cấp giấy phép lái xe quốc tế (IDP)',
    slug: 'cap-giay-phep-lai-xe-quoc-te-idp',
    description:
      'Thủ tục cấp và sử dụng Giấy phép lái xe quốc tế (IDP) theo Phụ lục Thông tư 108/2026/TT-BCA.',
    order: 3,
    isVisible: true,
  },
  {
    name: 'Sát hạch cấp mới & Phục hồi điểm GPLX',
    slug: 'sat-hach-cap-moi-phuc-hoi-diem-gplx',
    description:
      'Sát hạch cấp mới GPLX theo nguyên tắc đạt phần trước mới thi phần sau, và kiểm tra phục hồi điểm GPLX.',
    order: 4,
    isVisible: true,
  },
  {
    name: 'Các thủ tục liên quan đến phương tiện',
    slug: 'cac-thu-tuc-lien-quan-den-phuong-tien',
    description:
      'Đăng ký xe lần đầu, cấp đổi/cấp lại chứng nhận đăng ký, biển số, sang tên và thu hồi phương tiện.',
    order: 5,
    isVisible: true,
  },
  {
    name: 'Các thủ tục hành chính khác',
    slug: 'cac-thu-tuc-hanh-chinh-khac',
    description:
      'Các hướng dẫn thủ tục hành chính và quy định liên quan khác thuộc thẩm quyền Phòng CSGT.',
    order: 6,
    isVisible: true,
  },
];

export const TT108_PROCEDURE_TEMPLATES: TT108ProcedureTemplate[] = [
  {
    id: 'tt108-cap-doi-gplx',
    label: 'Cấp đổi Giấy phép lái xe (hết hạn, hỏng, quá hạn < 30 ngày)',
    categorySlug: 'cap-doi-giay-phep-lai-xe',
    sectionType: 'procedure',
    title: 'Hướng dẫn thủ tục Cấp đổi Giấy phép lái xe theo Thông tư 108/2026/TT-BCA',
    slug: 'huong-dan-cap-doi-giay-phep-lai-xe-tt-108-2026-tt-bca',
    shortDescription:
      'Quy định mới từ 01/7/2026 về đối tượng được cấp đổi GPLX, hồ sơ cần chuẩn bị (ảnh nền trắng, giấy khám sức khỏe điện tử), trình tự nộp trực tuyến/trực tiếp và thời gian trả thẻ PET rút ngắn.',
    keywords: ['cấp đổi GPLX', '108/2026/TT-BCA', 'đổi bằng lái xe', 'giấy khám sức khỏe', 'VNeID'],
    contentHtml: `
      <h2>1. Căn cứ pháp lý</h2>
      <p>Thực hiện theo <strong>Thông tư số 108/2026/TT-BCA</strong> ngày 29/6/2026 của Bộ trưởng Bộ Công an (có hiệu lực từ ngày <strong>01/7/2026</strong>, thay thế Thông tư 12/2025/TT-BCA) quy định về sát hạch, cấp, đổi, cấp lại, thu hồi và sử dụng giấy phép lái xe.</p>

      <h2>2. Đối tượng thực hiện thủ tục Cấp đổi GPLX</h2>
      <ul>
        <li>Công dân Việt Nam, người nước ngoài đang cư trú, làm việc, học tập hợp pháp tại Việt Nam có GPLX bằng vật liệu PET hoặc mẫu cũ còn thời hạn sử dụng có nhu cầu đổi.</li>
        <li>Người có GPLX <strong>bị hư hỏng, rách nát</strong> nhưng còn thông tin nhận diện, hoặc có nhu cầu <strong>thay đổi thông tin cá nhân</strong> (họ tên, ngày sinh, số định danh/CCCD) trên GPLX.</li>
        <li>Người có GPLX ô tô <strong>quá hạn sử dụng dưới 30 ngày</strong>: theo điểm mới của Thông tư 108/2026/TT-BCA, được làm thủ tục cấp đổi bình thường và <strong>không phải sát hạch lại lý thuyết</strong>.</li>
        <li>Người Việt Nam hoặc người nước ngoài có GPLX quốc gia còn thời hạn do nước ngoài cấp (không phải bằng tạm thời hoặc rách nát, tẩy xóa) có nhu cầu đổi sang GPLX Việt Nam.</li>
        <li>Quân nhân, Công an có GPLX ngành còn thời hạn khi thôi phục vụ hoặc chuyển đổi sang GPLX dân sự theo quy định.</li>
      </ul>

      <h2>3. Thành phần hồ sơ &amp; Biểu mẫu cần chuẩn bị</h2>
      <table>
        <thead>
          <tr>
            <th>STT</th>
            <th>Tên giấy tờ / Mẫu mã</th>
            <th>Yêu cầu chi tiết theo TT 108/2026/TT-BCA</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>1</td>
            <td><strong>Đơn đề nghị đổi Giấy phép lái xe</strong></td>
            <td>Theo mẫu quy định kèm theo Thông tư 108/2026/TT-BCA (kê khai trực tiếp trên Cổng DVC/VNeID hoặc bản giấy khi nộp trực tiếp; ghi rõ số CCCD/Định danh, hạng GPLX, lý do đổi và tình trạng vi phạm TTATGT).</td>
          </tr>
          <tr>
            <td>2</td>
            <td><strong>Giấy khám sức khỏe của người lái xe</strong></td>
            <td>Ưu tiên sử dụng <strong>Giấy khám sức khỏe điện tử</strong> liên thông trên hệ thống; chỉ nộp bản giấy khi hệ thống lỗi kỹ thuật. <em>Lưu ý: Thủ tục đổi GPLX mô tô theo quy định mới bắt buộc có giấy khám sức khỏe hợp lệ.</em></td>
          </tr>
          <tr>
            <td>3</td>
            <td><strong>Bản sao GPLX hiện có &amp; Giấy tờ tùy thân</strong></td>
            <td>Bản sao GPLX đang sử dụng, CCCD/thẻ Căn cước (hoặc Hộ chiếu còn thời hạn đối với người nước ngoài, người Việt Nam định cư ở nước ngoài). Mang bản chính để đối chiếu khi nộp trực tiếp.</td>
          </tr>
          <tr>
            <td>4</td>
            <td><strong>Ảnh chân dung</strong></td>
            <td>Ảnh chân dung <strong>phông nền trắng</strong> (chụp trực tiếp tại điểm tiếp nhận hoặc tải lên đúng chuẩn CSDLQG về dân cư khi nộp trực tuyến).</td>
          </tr>
          <tr>
            <td>5</td>
            <td><strong>Biên bản xác minh GPLX (nếu chưa có dữ liệu)</strong></td>
            <td><strong>Mẫu số 01 Phụ lục X</strong> (áp dụng trong trường hợp tra cứu hệ thống quản lý chưa có dữ liệu GPLX cũ cần xác minh).</td>
          </tr>
        </tbody>
      </table>

      <h2>4. Trình tự thực hiện thủ tục hành chính</h2>
      <ol>
        <li><strong>Bước 1 – Chuẩn bị hồ sơ &amp; Khám sức khỏe:</strong> Khám sức khỏe tại cơ sở y tế đủ điều kiện liên thông dữ liệu điện tử; chuẩn bị ảnh chân dung nền trắng và thông tin tài khoản VNeID mức 2 (nếu nộp trực tuyến).</li>
        <li><strong>Bước 2 – Nộp hồ sơ:</strong>
          <ul>
            <li><em>Trực tuyến:</em> Đăng nhập Cổng Dịch vụ công Quốc gia hoặc ứng dụng <strong>VNeID</strong>, chọn dịch vụ "Đổi Giấy phép lái xe", điền biểu mẫu điện tử, đính kèm mã giấy khám sức khỏe điện tử và ảnh nền trắng, nộp lệ phí trực tuyến.</li>
            <li><em>Trực tiếp:</em> Nộp hồ sơ tại Bộ phận tiếp nhận – <strong>Phòng Cảnh sát giao thông CATP Đà Nẵng</strong> (18 Võ An Ninh, phường Hòa Xuân) hoặc Công an cấp xã được phân công tiếp nhận; thực hiện chụp ảnh và đối chiếu bản chính.</li>
          </ul>
        </li>
        <li><strong>Bước 3 – Kiểm tra &amp; xử lý dữ liệu:</strong> Cán bộ tiếp nhận kiểm tra tính hợp lệ, tra cứu thông tin xử lý vi phạm hành chính về trật tự, an toàn giao thông và dữ liệu GPLX.</li>
        <li><strong>Bước 4 – Nhận kết quả:</strong> Tích hợp GPLX điện tử trên hệ thống/VNeID trong vòng <strong>02 giờ đến 01 ngày làm việc</strong>; in và trả thẻ GPLX vật liệu PET trong thời hạn rút ngắn còn <strong>2,5 ngày làm việc</strong> kể từ ngày nhận đủ hồ sơ hợp lệ.</li>
      </ol>

      <h2>5. Lưu ý quan trọng đối với người dân</h2>
      <ul>
        <li>Người dân phải hoàn thành việc chấp hành quyết định xử phạt vi phạm hành chính về TTATGT (nếu có) trước khi được giải quyết đổi GPLX.</li>
        <li>Không giải quyết đổi đối với GPLX giả, GPLX bị tẩy xóa, hư hỏng không còn yếu tố nhận diện hoặc GPLX nước ngoài tạm thời.</li>
      </ul>
    `,
  },
  {
    id: 'tt108-cap-lai-gplx',
    label: 'Cấp lại Giấy phép lái xe (bị mất, quá hạn từ 30 ngày trở lên)',
    categorySlug: 'cap-lai-giay-phep-lai-xe',
    sectionType: 'procedure',
    title: 'Hướng dẫn thủ tục Cấp lại Giấy phép lái xe theo Thông tư 108/2026/TT-BCA',
    slug: 'huong-dan-cap-lai-giay-phep-lai-xe-tt-108-2026-tt-bca',
    shortDescription:
      'Chi tiết đối tượng được cấp lại GPLX bị mất hoặc quá hạn từ 30 ngày trở lên, quy định sát hạch lại theo từng mốc thời gian, thành phần hồ sơ và biểu mẫu cần chuẩn bị.',
    keywords: ['cấp lại GPLX', 'mất bằng lái xe', 'quá hạn 30 ngày', '108/2026/TT-BCA', 'sát hạch lại'],
    contentHtml: `
      <h2>1. Căn cứ pháp lý</h2>
      <p>Căn cứ <strong>Thông tư số 108/2026/TT-BCA</strong> ngày 29/6/2026 của Bộ Công an (hiệu lực từ ngày <strong>01/7/2026</strong>) quy định về sát hạch, cấp, đổi, cấp lại giấy phép lái xe.</p>

      <h2>2. Đối tượng thực hiện thủ tục Cấp lại GPLX</h2>
      <table>
        <thead>
          <tr>
            <th>Nhóm đối tượng</th>
            <th>Điều kiện &amp; Yêu cầu sát hạch theo TT 108/2026/TT-BCA</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>GPLX bị mất, còn thời hạn sử dụng</strong></td>
            <td>Có tên trong hồ sơ/hệ thống quản lý của cơ quan có thẩm quyền, không thuộc trường hợp đang bị tước quyền sử dụng hoặc tạm giữ GPLX: Được xét cấp lại, <strong>không phải sát hạch lại</strong>.</td>
          </tr>
          <tr>
            <td><strong>GPLX quá hạn từ đủ 30 ngày đến dưới 01 năm</strong></td>
            <td>Bắt buộc thực hiện <strong>sát hạch lại lý thuyết</strong> theo hạng GPLX tương ứng; đạt mới được cấp lại GPLX.</td>
          </tr>
          <tr>
            <td><strong>GPLX quá hạn từ đủ 01 năm trở lên</strong></td>
            <td>Bắt buộc <strong>sát hạch lại cả lý thuyết và thực hành</strong> (đạt phần lý thuyết mới được thi thực hành trong hình và trên đường theo nguyên tắc đạt phần trước mới thi phần sau).</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Hồ sơ &amp; Biểu mẫu cần chuẩn bị</h2>
      <ul>
        <li><strong>Đơn đề nghị cấp lại Giấy phép lái xe</strong> theo mẫu quy định tại Thông tư 108/2026/TT-BCA.</li>
        <li><strong>Hồ sơ gốc lái xe phù hợp với GPLX</strong> (nếu còn lưu giữ hoặc cần đối chiếu khi dữ liệu hệ thống chưa đồng bộ).</li>
        <li><strong>Giấy khám sức khỏe của người lái xe</strong> (bản điện tử liên thông hoặc bản giấy hợp lệ): Bắt buộc đối với trường hợp GPLX quá hạn phải sát hạch lại hoặc cấp lại các hạng ô tô/mô tô theo quy định hiện hành.</li>
        <li><strong>CCCD / Thẻ Căn cước</strong> (hoặc Hộ chiếu còn hiệu lực đối với người nước ngoài).</li>
        <li><strong>Ảnh chân dung phông nền trắng</strong> đúng chuẩn đồng bộ Cơ sở dữ liệu quốc gia về dân cư.</li>
        <li><strong>Mẫu số 01 Phụ lục X</strong> (Biên bản xác minh GPLX) nếu hồ sơ chưa có trên hệ thống dữ liệu điện tử.</li>
      </ul>

      <h2>4. Trình tự thực hiện thủ tục hành chính</h2>
      <ol>
        <li><strong>Bước 1 – Tiếp nhận &amp; Tra cứu xác minh:</strong> Người dân nộp hồ sơ trực tuyến (Cổng DVC Quốc gia / VNeID mức 2 đối với trường hợp mất còn hạn) hoặc nộp trực tiếp tại <strong>Phòng CSGT CATP Đà Nẵng</strong> (18 Võ An Ninh, phường Hòa Xuân) đối với trường hợp cần đối chiếu hồ sơ gốc hoặc đăng ký sát hạch lại.</li>
        <li><strong>Bước 2 – Xác minh vi phạm &amp; tình trạng GPLX:</strong> Cơ quan Công an kiểm tra tình trạng tạm giữ/tước GPLX, dữ liệu vi phạm hành chính TTATGT và lịch sử cấp GPLX.</li>
        <li><strong>Bước 3 – Tham gia sát hạch lại (nếu quá hạn từ 30 ngày trở lên):</strong> Thí sinh dự thi theo trình tự nghiêm ngặt <em>"Đạt phần trước mới được thi phần sau"</em> (đã bãi bỏ phần thi mô phỏng tình huống đối với ô tô).</li>
        <li><strong>Bước 4 – Cấp lại &amp; Trả kết quả:</strong> Cập nhật GPLX điện tử lên VNeID và in trả thẻ vật liệu PET trong thời hạn quy định sau khi hoàn thành nghĩa vụ lệ phí và có kết quả đạt sát hạch (nếu có).</li>
      </ol>
    `,
  },
  {
    id: 'tt108-cap-idp',
    label: 'Cấp Giấy phép lái xe quốc tế (IDP)',
    categorySlug: 'cap-giay-phep-lai-xe-quoc-te-idp',
    sectionType: 'procedure',
    title: 'Hướng dẫn thủ tục Cấp Giấy phép lái xe quốc tế (IDP) theo Thông tư 108/2026/TT-BCA',
    slug: 'huong-dan-cap-giay-phep-lai-xe-quoc-te-idp-tt-108',
    shortDescription:
      'Điều kiện, đối tượng, thành phần hồ sơ và trình tự thực hiện thủ tục cấp Giấy phép lái xe quốc tế (IDP) theo Phụ lục Thông tư 108/2026/TT-BCA.',
    keywords: ['GPLX quốc tế', 'IDP', '108/2026/TT-BCA', 'cấp mới IDP'],
    contentHtml: `
      <h2>1. Đối tượng áp dụng</h2>
      <p>Công dân Việt Nam, người nước ngoài có thẻ thường trú tại Việt Nam đã có <strong>Giấy phép lái xe quốc gia do Việt Nam cấp bằng vật liệu PET còn giá trị sử dụng</strong> có nhu cầu lái xe ở các nước tham gia Công ước Viên 1968.</p>

      <h2>2. Thành phần hồ sơ cần chuẩn bị</h2>
      <ul>
        <li><strong>Đơn đề nghị cấp Giấy phép lái xe quốc tế (IDP)</strong> theo mẫu quy định tại Thông tư 108/2026/TT-BCA.</li>
        <li><strong>Bản chụp / Bản sao GPLX quốc gia Việt Nam</strong> (vật liệu PET, còn thời hạn).</li>
        <li><strong>Hộ chiếu</strong> còn giá trị sử dụng và <strong>Thẻ Căn cước / CCCD</strong> (hoặc thẻ thường trú đối với người nước ngoài).</li>
        <li><strong>Ảnh chân dung phông nền trắng</strong> theo quy chuẩn.</li>
      </ul>

      <h2>3. Cách thức thực hiện &amp; Thời hạn giải quyết</h2>
      <ol>
        <li>Nộp hồ sơ trực tuyến trên Cổng Dịch vụ công Quốc gia hoặc trực tiếp tại Phòng Cảnh sát giao thông Công an thành phố Đà Nẵng (18 Võ An Ninh, phường Hòa Xuân).</li>
        <li>Nộp lệ phí theo quy định hiện hành.</li>
        <li>Cơ quan có thẩm quyền kiểm tra, đối chiếu dữ liệu GPLX quốc gia và cấp sổ GPLX quốc tế theo mẫu quy định tại Phụ lục Thông tư 108/2026/TT-BCA.</li>
      </ol>
    `,
  },
  {
    id: 'tt108-sat-hach-cap-moi',
    label: 'Quy trình Sát hạch cấp mới & Bãi bỏ phần thi mô phỏng',
    categorySlug: 'sat-hach-cap-moi-phuc-hoi-diem-gplx',
    sectionType: 'guide',
    title: 'Quy định mới về Sát hạch cấp Giấy phép lái xe theo Thông tư 108/2026/TT-BCA',
    slug: 'quy-dinh-moi-sat-hach-cap-gplx-tt-108-2026-tt-bca',
    shortDescription:
      'Tổng hợp các điểm mới quan trọng trong kỳ sát hạch GPLX từ 01/7/2026: Nguyên tắc đạt phần trước mới thi phần sau, bãi bỏ thi mô phỏng ô tô, bộ đề thi lý thuyết mới và bài sa hình mô tô.',
    keywords: ['sát hạch lái xe', 'bãi bỏ mô phỏng', '108/2026/TT-BCA', 'thi lý thuyết', 'sa hình'],
    contentHtml: `
      <h2>1. Nguyên tắc sát hạch mới: "Đạt phần trước mới được thi phần sau"</h2>
      <p>Theo Thông tư số <strong>108/2026/TT-BCA</strong> (hiệu lực từ <strong>01/7/2026</strong>):</p>
      <ul>
        <li><strong>Đối với xe mô tô (hạng A1, A, B1):</strong> Thí sinh thi đạt phần <em>Lý thuyết</em> mới được thi <em>Bài sát hạch thực hành số 1</em>, đạt tiếp mới được thi <em>Bài sát hạch thực hành số 2</em>.</li>
        <li><strong>Đối với xe ô tô (hạng B, C1, C, D1, D2, D...):</strong> Thí sinh phải đạt phần <em>Lý thuyết</em> &rarr; đạt <em>Thực hành lái xe trong hình</em> &rarr; mới được thi <em>Thực hành lái xe trên đường</em>.</li>
      </ul>

      <h2>2. Bãi bỏ phần thi mô phỏng &amp; Cập nhật cấu trúc đề thi</h2>
      <ul>
        <li><strong>Chính thức bãi bỏ nội dung sát hạch lái xe mô phỏng các tình huống giao thông</strong> đối với các hạng ô tô.</li>
        <li><strong>Điều chỉnh số lượng câu hỏi lý thuyết:</strong> Tăng bộ đề và số câu hỏi thi lý thuyết (mô tô lên 40 câu đạt từ 36/40; ô tô hạng B lên 50 câu đạt từ 45/50 theo quy định cụ thể từng hạng).</li>
        <li><strong>Thực hành mô tô:</strong> Bổ sung thêm bài sát hạch thực hành số 2 nhằm nâng cao kỹ năng điều khiển phương tiện an toàn.</li>
        <li><strong>Thời gian cấp GPLX sau sát hạch:</strong> Dữ liệu điện tử tích hợp nhanh lên VNeID; thời gian in trả thẻ vật liệu PET rút ngắn còn <strong>3,5 ngày làm việc</strong>.</li>
      </ul>
    `,
  },
];
