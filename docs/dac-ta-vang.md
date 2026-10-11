# Đặc tả: App quản lý vàng

> Trạng thái: **đã làm (`index.html`)**, gồm các mục 🆕 sửa sau buổi dùng thử (ticket #2–#11) và các mục 🔧 sửa sau buổi review (ticket #13–#22). Các mục 🧪 là sửa sau buổi review lần 2, **đã làm** (ticket #25–#32). Mục 🔬 là kết quả review lần 3 (sau ticket #25–#32), **đã làm** cùng với việc tách nguồn ra `src/` và thêm bộ kiểm thử `tests/`. Mục 🛠 là phần xử lý nốt các việc còn lại sau review lần 3, **đã làm** · Ngày: 2026-10-11

## Xử lý nốt sau review lần 3 🛠

Rà các việc còn lại sau review lần 3 và làm hết những gì làm được trong app. Lúc viết thêm kiểm thử tìm ra thêm 2 lỗi (A22, A23).

**A. Lỗi** (tìm ra khi viết thêm kiểm thử)

| # | Lỗi | Cách sửa | Mục |
|---|---|---|---|
| A22 | Gõ giá lệch hơn 15% rồi **bấm chuột ra chỗ khác** để rời dòng: hộp hỏi "giá thay đổi nhiều" hiện giữa lúc đang giữ chuột và nuốt mất sự kiện thả chuột. App đang chờ thả chuột mới vẽ lại (để cú bấm không rơi vào chỗ vừa vẽ), nên giá đã lưu vào file mà **màn hình vẫn hiện nhóm lô theo giá cũ** cho tới lần bấm chuột sau. Lộ ra vì kiểm thử chập chờn khi máy chậm | Mọi hộp hỏi, hộp báo đi qua hai hàm `ask` / `tell`; sau mỗi hộp coi như đã thả chuột và vẽ lại ngay. `node build.js --check` báo lỗi nếu code gọi thẳng `confirm` / `alert`. Có kiểm thử bấm chuột xuống mà không thả | 2.1a |
| A23 | Điện thoại (390 px): bảng phương án ở tab **Cần tiền** phải cuộn ngang, cột Tiền thu và Lời/lỗ bị khuất, đúng tab hay dùng khi đứng ở tiệm | Mỗi lô của phương án thành một thẻ: lô, loại, "còn N món" · ô số món bán · tiền thu · lời/lỗ. Kiểm thử: tab Hôm nay và Cần tiền không cuộn ngang ở 390 px | 2.8 |

**Các việc còn lại đã làm**

| Việc | Đã làm | Mục |
|---|---|---|
| Tạo file mới… chọn nhầm file dữ liệu có sẵn ở hộp Lưu (Chrome xóa trắng file đó, nhất là máy thứ hai đã có `tai-san.json` qua OneDrive) | Hỏi trước khi mở hộp Lưu: "Nếu đã có file tai-san.json (ví dụ từ máy khác), bấm Hủy rồi dùng Mở file có sẵn…". Màn Bắt đầu đưa **Đã dùng app trên máy khác → Mở file có sẵn…** lên trước, làm nút chính | 0 |
| OneDrive đồng bộ chậm (máy B sửa khi chưa kéo kịp bản mới) | Không chặn hết được trong app (không có máy chủ để so). Giảm rủi ro: mở file thì dòng trạng thái ghi **"Đã mở tai-san.json · sửa lần cuối 11/10 09:20"**, thấy ngay số liệu cũ trước khi sửa. README nhắc đợi OneDrive đồng bộ xong | 0 |
| Ngưỡng "chênh lệch cao" với loại có chênh lệch thường rất nhỏ | Chênh lệch cao = hơn **1,5 lần** mức thường **và** hơn mức thường ít nhất **0,5 điểm %** (thường 0,5% thì 0,8% chưa cao, 1,1% là cao). Hai con số đặt ở một chỗ (`SPREAD_X`, `SPREAD_MIN`), mọi chỗ xét chênh lệch cao dùng chung một hàm | 3.4, 3.5 |
| Dòng "tiệm đang hạ giá mua vào" chỉ ở Nên chốt | Ghi ở mọi nhóm: Sắp đạt, Giữ, Đang lỗ (thay cho "tiệm đang nới chênh lệch" khi biết là hạ giá mua vào) | 2.1b |
| Hạn mức chỉ kiểm tra khi thêm lô | Sửa lô làm vốn đang giữ tăng lên mà vượt hạn mức thì cũng hỏi; sửa không làm tăng vốn (ghi chú, mục tiêu) thì không hỏi | 2.2 |
| Thẻ Có thể mua lại không ghi ngày giá | Giá chưa phải của hôm nay thì ghi "(giá ngày 11/10)" | 2.1c |
| Thiếu kiểm thử | Thêm 2 ca: đối chiếu khi mở file (ghi bản trình duyệt vào file / cả hai cùng đổi), sửa và xóa loại vàng, kiểm tra form Sửa lô, Bán một nửa, xóa lô có lần bán, hoàn tác, biểu đồ, tải bản cũ ở chế độ xem; và các sửa vòng này. Tổng **10 ca**, khoảng 6 giây | — |
| Đo hiệu năng, xem bố cục điện thoại | `npm run perf` (dữ liệu 20 năm: mở app 0,5 s, gõ phím 2 ms, đổi tab 50–160 ms) và `npm run screens` (chụp ảnh 390 px vào `tests/screens/`). Chạy tay, không nằm trong `npm test` vì số đo và ảnh phụ thuộc máy | — |

**Chỉ thử được trên Chrome thật** (bộ kiểm thử dùng bản giả của File System Access): hộp xin quyền khi Mở lại; Chrome xóa trắng file ở hộp Lưu khi bấm Thay thế; hộp hỏi lúc rời dòng giá bằng cú bấm nuốt cú bấm đó (A22 đã sửa phần màn hình đứng; cú bấm vào nút có thể vẫn mất, bấm lại là được). Mỗi lần đổi phần mở/lưu file nên thử tay 3 việc này trên Chrome hoặc Edge.

## Review lần 3 🔬 (sau ticket #25–#32)

Review lại code bản 🧪 và giả lập 9 kịch bản trên chính `index.html` chạy trong Chromium (mock File System Access có mô phỏng Chrome xóa trắng file ở hộp Lưu, IndexedDB nhớ file giữa các lần tải lại, đĩa dùng chung giữa 2 máy, đồng hồ giả, ghi lại mọi hộp hỏi và file tải về): lần đầu dùng; để tab mở qua đêm (4 biến thể); 2 máy và 2 tab; file hỏng, rỗng, mất, Tạo file mới trùng tên, mở nhầm bản sao lưu; nhập tiền ở mọi ô và chế độ xem; tiệm hạ giá mua vào, nhắc mua lại tự tắt, hạn mức, Cần tiền, lọc Lịch sử giá; sửa và xóa lần bán, Bán lấy lại vốn, tham số lạ; dữ liệu 20 năm; phím Enter, Esc, Ctrl+Z, bấm Bán… khi dòng giá chưa lưu.

Tất cả 11 mục 🧪 chạy đúng như đặc tả: A11 (qua đêm), A12 (Tạo file mới), A13 (mở chỉ đọc, `cap_nhat` không đổi), A14 (`148.500`), A15 (chế độ xem hỏi lại), A16 (khôi phục vào đúng `tai-san.json`, từ chối quyền không mất nút), A17 (bộ nhớ đầy), A18 (vốn đang giữ), B8 (ghi rõ thiệt, không ghi khi tiệm nâng giá bán ra), B9 (tắt nhắc, Giữ lại nhắc, hoàn tác), B10 (Cần tiền A), B11 (ô mức nhắc), C4 (lọc năm 50–180 ms). Không có lỗi JS nào trong mọi kịch bản. Kết quả còn lại, đánh số tiếp theo bản 🧪:

**A. Lỗi** (đã tái hiện khi giả lập)

| # | Lỗi | Cách sửa | Mục |
|---|---|---|---|
| A19 | Tab Lịch sử: bảng **Lời đã chốt theo năm** và cột **Lời đã chốt** của Thống kê theo loại vàng luôn sai: 1 lần bán → 0; nhiều lần bán → bỏ lần đầu, các lần sau ra `NaN` (hiện "—"), số lần bán thiếu 1. Thẻ "Lời đã chốt" ở tab Hôm nay thì đúng. Nguyên nhân: ticket #22 thêm tham số thứ hai `lot` cho `saleCalc(sale, lot)`, nhưng hai chỗ này gọi `ban.map(saleCalc)` nên `lot` nhận chỉ số phần tử (0, 1, 2…) | Gọi `map(b => saleCalc(b))`; nên gom hai chỗ về dùng chung bản đồ lô như `realizedTotal` | 2.5 |
| A20 | Mở file khác… chọn file `tai-san-truoc-khoi-phuc-….json` (app tự tải về khi khôi phục) hay `du-lieu-cu-trong-trinh-duyet-….json` (chế độ xem tải về): không hỏi khôi phục, app chuyển sang **ghi vào file đó** và nhớ nó cho lần sau; `tai-san.json` vẫn hỏng. Đúng tình huống A16 nhưng với 2 tên file còn lại mà app tự đặt | Thêm 2 tiền tố này vào danh sách tên bản sao lưu (mục 0 "Mở nhầm bản sao lưu") | 0 |
| A21 | Tham số: "% kỳ vọng mặc định cho lô mới" nhận 0 hoặc âm, "Báo sắp đạt" nhận số âm. Sau đó mọi lần Thêm lô bị chặn "% kỳ vọng phải lớn hơn 0" mà không biết vì đâu | Kiểm tra như ô "% giảm từ đỉnh": kỳ vọng > 0, sắp đạt ≥ 0, sai thì báo và trả về giá trị cũ | 2.6, 3.6 |

**B. Gợi ý chưa thông minh**

| # | Vấn đề | Cách sửa | Mục |
|---|---|---|---|
| B12 | Giá chạm đúng mốc mua lại bạn đặt khi bán (150tr) nhưng lô còn lại cùng loại đang ở Nên chốt vì **lời tụt** (giá đang xuống): cột Mua thêm? báo 🟡 Cân nhắc "chốt lô đó, hoặc giữ nó thay cho mua thêm", không có nút Mua lại…, trong khi thẻ 🔁 Có thể mua lại ngay bên dưới vẫn có nút. Hai tín hiệu ngược nhau trên cùng màn hình, không nói rõ vì sao | Khi lô Nên chốt chỉ vì lời tụt (không phải đạt mục tiêu) và giá chạm mốc mua lại: cột ghi "chạm giá mua lại bạn đặt, nhưng lô V-2026-001 đang tụt dưới mức nhắc: muốn mua lại thì nên Giữ tiếp lô đó trước", giữ nút Mua lại… | 2.1c, 3.5 |
| B13 | Giữ, nâng mục tiêu đúng lúc lời **bằng** mục tiêu (15,0% / 15%): ô "Nhắc chốt nếu lời tụt về" mặc định trống vì quy tắc "không thấp hơn mục tiêu cũ" không còn mức nào hợp lệ; bấm Lưu theo phản xạ là lô không còn được nhắc khi tụt | Khi không có mức ≥ mục tiêu cũ thì lùi về bội số 5% ngay dưới lời hiện tại (ở đây 10%), như hộp Giữ tiếp | 2.1b |
| B14 | Sau khi Giữ, lô (+15,8%) nằm trong nhóm Giữ thu gọn, không có nút Bán…; muốn bán phải sang tab Lô vàng. Lô ở nhóm Sắp đạt và Đang lỗ lại có nút Bán… | Nhóm Giữ cũng có nút Bán… (nhỏ, như Sắp đạt) | 2.1b |

**C. Luồng chưa hiệu quả, chưa gọn**

| # | Vấn đề | Cách sửa | Mục |
|---|---|---|---|
| C5 | Qua nửa đêm **khi đang gõ dở** một dòng giá: ô Ngày tự nhảy sang hôm nay mới, giá rời dòng lưu cho ngày mới mà **không có dòng báo** (dòng "Đã sang ngày…" chỉ hiện khi sang ngày đúng lúc lưu). Hộp Bán mở trước nửa đêm, xác nhận sau nửa đêm thì ngày bán là hôm qua | Khi tự sang ngày lúc đang có con trỏ trong dòng giá thì cũng hiện dòng báo; hộp Bán/Thêm lô lấy ngày lúc xác nhận nếu ô Ngày còn là mặc định | 2.1a |
| C6 | Màn chờ khi file **mất**: cùng lúc ghi "Không tìm thấy file X" và "Dữ liệu nằm trong file X. Mở lại file để xem…", kèm nút Mở lại X không còn tác dụng | File mất thì bỏ đoạn "Dữ liệu nằm trong file…" và nút Mở lại, chỉ còn Mở file khác… / Tạo file mới… | 0 |
| C7 | Màn chờ, file hỏng, bấm Mở file khác… rồi chọn đúng file đang nhớ: chỉ báo lỗi, các nút lấy lại (Khôi phục từ bản sao lưu…, Dùng bản trong trình duyệt) không hiện; phải bấm Mở lại mới có | So file vừa chọn với file đang nhớ (`isSameEntry`), cùng file thì xử lý như Mở lại | 0 |
| C8 | `file-new`: nhánh "chọn trúng một file khác đã có dữ liệu thì coi như mở file đó, không ghi đè" không bao giờ chạy trên Chrome (file đã bị xóa trắng trước khi app đọc), ghi chú trong code nói ngược lại; chọn nhầm một file dữ liệu khác ở hộp Lưu là mất sạch, không có bản tải về | Bỏ nhánh chết và sửa ghi chú; rủi ro đã ghi ở mục 5 (không đọc trước file). Có thể báo rõ trong hộp xác nhận của chính Chrome không được, nên chỉ ghi vào README | 0 |
| C9 | Thông báo sau Thêm lô "Đã tắt nhắc mua lại… Giữ lại nhắc" vẫn còn sau khi Hoàn tác thêm lô; bấm Giữ lại nhắc lúc đó là một lần "thay đổi" vô nghĩa. Cần tiền ghi "Thiệt do tiệm hạ giá mua vào khoảng 20.046.512 đ" (số ước lượng mà ghi tới hàng đồng; dòng Nên chốt ghi "khoảng 20,0tr") | Hoàn tác thì xóa dòng báo; thiệt ước lượng dùng `fmtTr` | 2.1c, 2.4 |

**Đo trên dữ liệu 20 năm** (21.903 dòng giá, 60 lô, 40 lần bán, file 1,6 MB): mở app 0,4 s; gõ phím ở ô giá 3 ms; rời dòng giá (lưu cả file) dưới 0,5 s; mở Vì sao? 3 biểu đồ 0,18 s; đổi tab 60–100 ms; Lịch sử giá lọc một năm 50–180 ms; quay lại tab khi file không đổi 50 ms.

**Đã làm cả 11 mục** (A19–A21, B12–B14, C5–C9), kèm hai thay đổi về cách làm để lỗi không quay lại:

- **Nguồn tách ra `src/`** (CSS, khung HTML, 12 file JS theo mục: tiện ích, dữ liệu, tính toán, giao diện, từng tab, hộp thoại, sự kiện, khởi động); `node build.js` ghép thành `index.html`. Người dùng vẫn chỉ mở một file `index.html` như cũ, không cài gì. Sửa code thì sửa trong `src/` rồi ghép; `node build.js --check` báo nếu `index.html` chưa khớp.
- **Bộ kiểm thử `tests/`** (Playwright, `npm test`): bộ giả lập của buổi review này giữ lại thành 8 ca có kiểm tra tự động, mỗi ca là một kịch bản dùng thật (lần đầu dùng; qua đêm; 2 máy 2 tab; file hỏng/rỗng/mất; nhập tiền, bộ nhớ đầy, chế độ xem; gợi ý mua/bán/Cần tiền/tham số; sửa lần bán, Giữ, xác nhận Cần tiền; phím). Chạy khoảng 5 giây. Mỗi ticket sau phải xanh bộ này trước khi gộp; lỗi mới tìm ra thì thêm vào ca tương ứng.
- Cách sửa theo **quy tắc chung** thay vì thêm nhánh riêng: tên mọi file app tự tải về đặt ở một bảng `DL` (A20); tham số kiểm tra theo bảng `PARAM_RULES` (A21); mọi lần bán tính qua `saleCalcs()` (A19); thứ tự tín hiệu ở cột Mua thêm? ghi thành một dòng (B12).

## Sửa sau buổi review lần 2 🧪

Review lại code bản 🔧 và giả lập 12 tình huống trên chính `index.html` chạy trong Chromium: file `tai-san.json` dùng chung giữa 2 tab và 2 máy như qua OneDrive, đồng hồ giả để thử trường hợp tab mở qua đêm, ghi lại mọi hộp hỏi và file tải về. Các tình huống: lần đầu dùng, nhập giá hằng ngày, để tab mở qua đêm, 2 tab và 2 máy, giữ lô rồi giá tụt lúc tiệm nới chênh lệch, mua thêm và mua lại, hạn mức, nhập bù 3 ngày, điện thoại, chưa kết nối file mà bộ nhớ đầy, file hỏng, dữ liệu 20 năm.

Phần lớn bản 🔧 chạy đúng: 2 tab và 2 máy không ghi đè nhau, rời dòng là lưu, hộp Bán điền giá vừa gõ, nhập bù nhiều ngày, Enter trong hộp thoại, Mua lại / Đủ hạn mức / "(mới có N ngày giá)" ở cột Mua thêm?, lô lỗ vì tiệm nới chênh lệch vào Đang lỗ. Riêng A9 không chạy trên Chrome thật (xem A12). Kết quả, đánh số tiếp theo bản 🔧:

**A. Lỗi** (đã tái hiện khi giả lập)

| # | Lỗi | Cách sửa | Mục |
|---|---|---|---|
| A11 | Để tab mở qua đêm (gập laptop): sáng hôm sau ô Ngày vẫn là hôm qua, không nền vàng, không có nút Về hôm nay, lịch không cho chọn hôm nay. Gõ giá sáng nay thì **đè lên giá thật của hôm qua** (159,1 → 163tr), hôm nay không có giá; kiểm tra lệch 15% không bắt được vì so với chính giá hôm qua | Khi quay lại tab, mỗi phút một lần, và trước mỗi lần lưu giá: đã sang ngày mới mà ô Ngày còn là "hôm nay" cũ thì tự chuyển sang hôm nay, vẽ lại bảng giá; giá vừa gõ lưu cho hôm nay | 2.1a, 3.6 |
| A12 | "Tạo file mới…" chọn trùng `tai-san.json` (tên gợi ý sẵn): Chrome **xóa trắng file ngay lúc chọn**, trước khi app kịp đọc, nên cách sửa A9 không chạy. Máy A bán 1 món; máy B (bản trình duyệt từ tuần trước) bấm Tạo file mới… ở màn chờ → file còn 0 lần bán, không có bản nào tải về | Không gợi ý tên trùng file đang dùng; màn chờ chỉ hiện Tạo file mới… khi file cũ mất hoặc hỏng; gặp file rỗng thì không tự ghi bản trình duyệt vào mà chỉ cách lấy lại | 0, 3.6 |
| A13 | Chỉ bấm Mở lại `tai-san.json`, không sửa gì, app đã ghi lại file (đổi `cap_nhat`). Hai máy dùng OneDrive: máy B mở app lúc OneDrive chưa kéo kịp bản mới của máy A thì ghi bản cũ kèm giờ mới, dễ sinh file xung đột hoặc bản cũ đè bản mới; tab, máy khác nhận báo "vừa cập nhật ở nơi khác" dù không ai sửa | Mở file chỉ đọc; chỉ ghi khi đưa bản trình duyệt vào file hoặc khi tạo file mới | 0 |
| A14 | Gõ giá theo bảng niêm yết của tiệm (đơn vị nghìn đồng) `148.500` → app hiểu 148.500 đ, rời ô vẫn hiện `148.500` nên không thấy sai. Giá đầu tiên của loại mới không có giá cũ để so → lô báo **−99,9%, Đang lỗ**. Cùng lỗi ở ô đơn giá, Hạn mức, Cần tiền | `1.000`–`999.999` không kèm đơn vị hiểu là nghìn đồng (số nhỏ app điền sẵn thì kèm `đ`); giá đầu tiên của một loại so với đơn giá lô gần nhất của loại đó | 1, 3.6 |
| A15 | Chế độ xem bỏ kiểm tra lệch 15%: ở tiệm gõ thiếu số `16` → lô báo **Nên chốt −87,7%**, không hỏi lại, đúng lúc đang quyết định bán | Chế độ xem vẫn hỏi lại, chỉ không lưu | 2.8, 3.6 |
| A16 | File `tai-san.json` hỏng, màn chờ nhắc "Chọn file khác" → chọn bản sao lưu trong Downloads → từ đó app **ghi vào file sao lưu** (nằm ngoài OneDrive); `tai-san.json` vẫn hỏng, máy kia vẫn không mở được | File hỏng hoặc rỗng: màn chờ chỉ cách lấy lại, có **Khôi phục từ bản sao lưu…** (ghi vào đúng `tai-san.json`) và **Dùng bản trong trình duyệt**; mở một file sao lưu thì hỏi khôi phục | 0, 3.6 |
| A17 | Chưa kết nối file, bộ nhớ trình duyệt đầy: lần lưu thứ hai bị báo nhầm "dữ liệu đã được sửa ở nơi khác", app nạp lại bản cũ, giá vừa gõ chỉ còn trong file tải về | Lần ghi lỗi không tính là đã lưu; dữ liệu đang mở giữ nguyên, trạng thái báo đỏ | 0, 3.6 |
| A18 | Lô chưa có giá: dòng tổng ghi "Vốn đang giữ 0 đ" (vừa thêm lô 300tr) | Vốn đang giữ tính mọi lô; giá trị và lời tạm tính ghi rõ chưa tính lô nào | 2.1d |

**B. Gợi ý chưa thông minh**

| # | Vấn đề | Cách sửa | Mục |
|---|---|---|---|
| B8 | Tiệm nới chênh lệch (mua vào 170 → 158, bán ra giữ 170; chênh lệch 7,6%, thường 1,2%): 2 lô đang Giữ bị đẩy về **Nên chốt** "lời tụt", đúng lúc bán thiệt nhất; hộp Bán, Cần tiền không nhắc gì. Cùng lúc cột Mua thêm? biết báo 🟠 Đợi, chênh lệch cao | Lô vẫn theo quy tắc bạn đặt. Khi tiệm nới chênh lệch bằng cách **hạ giá mua vào**, dòng Nên chốt, hộp Bán, Cần tiền ghi rõ bán hôm nay thiệt hơn ngày thường bao nhiêu; tiệm nâng giá bán ra thì không ghi (bán không thiệt) | 2.1b, 2.3, 2.4, 3.4 |
| B9 | Chạm giá muốn mua lại 161tr, mua ở tiệm rồi nhập bằng **+ Thêm lô** (không bấm Mua lại…): nhắc không tắt, hôm sau vẫn 🟢 Mua lại và thẻ 🔁; nhắc này xét trước mốc rải nên vừa mua 160,5tr vẫn giục mua tiếp | Lưu lô mới bằng bất kỳ đường nào thì tự tắt các nhắc mua lại cùng loại, kèm nút Giữ lại nhắc | 2.1c, 2.2, 3.5 |
| B10 | Cần tiền, phương án "A. Chốt lời tốt nhất" bán lô +28% đang Giữ, để lại lô mà tab Hôm nay đang báo Nên chốt (lời tụt về +23,1%) | A ưu tiên lô ở nhóm Nên chốt, gồm cả lô tụt dưới mức nhắc | 2.4 |
| B11 | Ô "Nhắc chốt nếu lời tụt về" ở form lô mới: lô vừa mua luôn lỗ chênh lệch (khoảng −1%) nên nhập mức nào cũng bị từ chối | Form Thêm lô / Mua lại… chỉ hiện ô này khi lô đang lời (nhập lại lô mua từ lâu); lô vừa mua thì ẩn | 2.2, 3.6 |

**C. Luồng chưa hiệu quả**

| # | Vấn đề | Cách sửa | Mục |
|---|---|---|---|
| C4 | Dữ liệu 20 năm: thao tác hằng ngày đã mượt (gõ phím khoảng 5 ms, rời dòng giá 75–160 ms, đổi tab tối đa 135 ms); riêng Lịch sử giá → Xem tất cả vẽ 21.900 dòng mất khoảng 1,4 giây | Lọc Lịch sử giá theo loại và năm, thay cho Xem tất cả | 2.5 |

**Thứ tự làm đề xuất**: A11, A12 (sửa ít, chặn ghi sai và mất dữ liệu mà không báo) → A13, A14 → B8, B9, A15 → các mục còn lại.

## Sửa sau buổi review 🔧

Review lại code bản 🆕 và giả lập 15 tình huống dùng thật: lần đầu dùng, nhập giá hằng ngày, bán, giữ, mua thêm, cần tiền, nhập bù giá, mở 2 tab, điện thoại, dữ liệu 20 năm. Kết quả chia ba nhóm.

**A. Lỗi**

| # | Lỗi | Cách sửa | Mục |
|---|---|---|---|
| A1 | Mở app ở 2 tab, hoặc để tab cũ mở trên máy khác: tab cũ ghi đè file, mất lần bán ghi ở tab/máy kia, không báo gì | Một phép kiểm tra "nơi lưu có bị sửa ở nơi khác không", chạy lúc quay lại tab và trước mỗi lần lưu | 0 |
| A2 | Nhấn Enter trong hộp Thêm lô / Bán thì hộp đóng mà không lưu | Enter = nút chính (Lưu, Xác nhận bán), Esc = Hủy | 2 |
| A3 | Giá gõ dở (chưa bấm Cập nhật) bị mất khi Bán… hay Mua… rồi lưu; hộp Bán điền giá cũ; lô vừa mua bị tính theo giá hôm qua | **Lưu khi rời dòng giá**, bỏ nút Cập nhật: không còn giá gõ dở để mất | 2.1a |
| A4 | File dữ liệu hỏng (JSON lỗi) → trang trắng, không còn nút nào | Mở file lỗi thì quay về màn chờ, báo lý do, có Mở file khác… | 0 |
| A5 | Bộ nhớ trình duyệt đầy mà file vẫn ghi được → mốc đồng bộ sai → lần mở sau bản cũ trong trình duyệt ghi đè file | Mốc chỉ cập nhật khi cả bộ nhớ trình duyệt lẫn file đều lưu được; bộ nhớ lỗi thì xóa mốc để file thắng | 0 |
| A6 | Form Sửa lô cho đặt mức nhắc cao hơn mức lời → lô +2,7% bị báo "lời tụt dưới mức nhắc 10%" dù chưa từng lên 10%; mức 0% không bao giờ nhắc | Form lô kiểm tra giống hộp Giữ: mức nhắc > 0 và thấp hơn lời hiện tại | 2.2, 3.6 |
| A7 | Lô lời đúng +15,0% không vào Nên chốt (máy tính ra 14,999…%) | So sánh bỏ qua sai số tính toán | 3.4 |
| A8 | Xóa ô Ngày lúc đang gõ giá → lỗi, cột Mua thêm? ngừng cập nhật | Ô Ngày trống thì gợi ý tạm tính theo hôm nay | 2.1a |
| A9 | Màn chờ: "Tạo file mới…" mà chọn trùng `tai-san.json` cũ → ghi đè file bằng bản cũ trong trình duyệt | Chọn trúng file đã có dữ liệu thì coi như mở file đó, đối chiếu, không ghi đè. 🧪 Không chạy trên Chrome thật, xem A12 | 0 |
| A10 | Chế độ xem: "Xem với giá này" không tính lại phương án Cần tiền đang mở | Chế độ xem cũng "rời dòng là tính lại", tính lại mọi phần kể cả phương án | 2.8 |

**B. Gợi ý chưa thông minh**

| # | Vấn đề | Cách sửa | Mục |
|---|---|---|---|
| B1 | Cùng loại SJC vừa Nên chốt (lô cũ +22,5%) vừa 🟢 Vùng mua; làm theo cả hai là bán rồi mua lại, mất chênh lệch 2 lần | Kết quả mới 🟡 **Cân nhắc**: "đang có lô nên chốt cùng loại" | 2.1e, 3.5 |
| B2 | Thẻ 🔁 Có thể mua lại hiện, mà cột Mua thêm? cùng loại ghi ⚪ Chưa tới | Mua thêm? xét luôn giá muốn mua lại bạn đặt khi bán: chạm thì 🟢 **Mua lại** | 2.1e, 3.5 |
| B3 | Tiệm nới chênh lệch (hạ mua vào, giữ bán ra): lô lỗ −4,8% vẫn bị coi là "lỗ chênh lệch", nằm trong nhóm Giữ thu gọn, trong khi cột Mua thêm? cùng lúc báo chênh lệch cao bất thường | Chỉ coi là lỗ chênh lệch khi chênh lệch hôm nay bình thường | 2.1b, 3.4 |
| B4 | Hạn mức: 🟢 "còn 47tr ≈ 3 chỉ" dù quen mua miếng 1 lượng 149,5tr; mua vượt hạn mức (852tr / 600tr) không cảnh báo | 🟢 chỉ khi còn đủ tiền cho 1 món quen; lưu lô vượt hạn mức thì hỏi lại; dòng tổng hiện vốn / hạn mức | 2.1d, 2.1e, 2.2 |
| B5 | Nhắc tụt không biết giá lên hay xuống: rơi xuống lỗ rồi hồi lên +20% vẫn ghi "lời tụt về +20%"; rơi thẳng từ +30% xuống dưới 0 thì bỏ qua nhắc | Dòng nhắc ghi đỉnh lời kể từ khi mua; vẫn nhắc khi đã tụt xuống lỗ | 2.1b, 3.4 |
| B6 | Mấy ngày đầu, ô Mua thêm? không cho biết dữ liệu còn ít (mới 1 ngày giá đã ghi "còn cách 5%") | Ghi "(mới có N ngày giá)" ngay trong ô | 2.1e |
| B7 | Mốc rải tính cả lô đã bán hết | Chỉ xét lô còn đang giữ | 3.5 |

**C. Luồng chưa hiệu quả**

| # | Vấn đề | Cách sửa | Mục |
|---|---|---|---|
| C1 | Nhập bù giá nhiều ngày: sau mỗi lần Cập nhật ô Ngày nhảy về hôm nay; ô giá điền giá mới nhất chứ không phải giá trước ngày đó; loại có giá trùng bị bỏ qua mà ô Không đổi không hiện cho ngày cũ | Ô Ngày giữ ngày vừa nhập (kèm dòng vàng, nút Về hôm nay); ô giá điền theo ngày đang chọn; ô Không đổi hiện cả cho ngày cũ | 2.1a |
| C2 | Cột Mua thêm? tính theo giá vừa gõ, còn nhóm lô vẫn theo giá đã lưu: một màn hình, hai giá | Cùng cách sửa A3: rời dòng là lưu, mọi phần tính lại theo giá mới | 2.1a |
| C3 | Dữ liệu 20 năm: mỗi lần vẽ lại mất ~180 ms, phần lớn để vẽ các dòng trong nhóm đang thu gọn | Nhóm thu gọn và phần Vì sao? chỉ vẽ, chỉ tính khi bấm mở | 2.1a, 2.1b |

**Rà lại cho gọn.** Bản 🔧 đầu tiên vá từng lỗi riêng, nên có chỗ chồng cơ chế. Đã gộp lại:

| Chỗ | Bản đầu | Bản gọn | Vì sao |
|---|---|---|---|
| A3, C2, A10 | 3 cơ chế: giữ giá gõ dở, xem trước nhóm lô theo giá gõ dở, tự lưu giá trước khi mở hộp thoại | 1 quy tắc: **rời dòng giá là lưu**, bỏ nút Cập nhật | Hết hẳn khái niệm "giá gõ dở", nên cả ba lỗi không còn chỗ xảy ra; mỗi ngày bớt một lần bấm |
| A1 | 3 chốt: tự nạp lại khi tab khác lưu, kiểm tra khi quay lại tab, kiểm tra trước khi ghi file | 1 phép kiểm tra chạy ở 2 thời điểm: quay lại tab và trước mỗi lần lưu | Cùng một phép kiểm tra phủ cả nhiều tab lẫn nhiều máy, phủ luôn lúc chưa kết nối file; không cần cơ chế báo qua lại giữa các tab; không đóng ngang hộp thoại khi bạn đang thao tác trong tab, chỉ đóng hộp thoại để mở từ trước khi quay lại tab mà dữ liệu đã đổi |
| A6, B5 | Thêm khái niệm "mức nhắc đã chạy" và trường dữ liệu mới `nhac_tut_tu` | Kiểm tra mức nhắc < lời hiện tại ở mọi chỗ đặt; đỉnh lời tính từ ngày mua | Đặt đúng thì mức nhắc luôn "đã chạy" sẵn; không thêm trường dữ liệu, file không đổi cấu trúc |

## Sửa sau buổi dùng thử 🆕

Dùng thử app với 4 lô (SJC miếng và nhẫn 9999), nhập giá 2 ngày, giữ lô, bán, cần tiền, mở trên điện thoại. Sáu chỗ bị cấn:

| # | Chỗ cấn khi dùng thử | Cách sửa | Mục |
|---|---|---|---|
| 1 | Trọng lượng điền sẵn bị cộng dồn: ô chỉ có sẵn `1`, gõ `1` vào ô lượng thành **1 lượng 1 chỉ** mỗi món. Kiểm tra 15% không bắt được, lời hiện sai cả chục % | Loại chưa có lô thì điền sẵn 1 đơn vị niêm yết; gõ vào một ô thì phần điền sẵn ở các ô khác tự xóa; trọng lượng hiện chữ đậm | 2.2 |
| 2 | Giữ, nâng mục tiêu xong mà giá tụt thì lô lặng lẽ vào nhóm Giữ đang thu gọn, phần lời mất dần không ai nhắc | Thêm mức **nhắc chốt khi lời tụt về**; tụt dưới mức đó thì lô quay lại nhóm Nên chốt | 2.1b, 3.4 |
| 3 | Loại vàng giá không đổi vẫn bị báo "chưa cập nhật hôm nay", kéo theo cảnh báo giá cũ ở hộp Bán và tab Cần tiền | Ô tick **Không đổi** ở từng dòng giá | 2.1a |
| 4 | Lô vừa mua nằm trong nhóm 🔴 Đang lỗ (do chênh lệch mua–bán), nhóm đỏ lúc nào cũng có lô nên dễ quen mắt, bỏ sót lô lỗ thật | Lỗ chỉ do chênh lệch thì vào nhóm Giữ; nhóm Đang lỗ chỉ còn lô mà giá đã giảm so với lúc mua | 2.1b, 3.4 |
| 5 | Chưa mở lại file vẫn xem và sửa được trên bản cũ trong trình duyệt; dùng 2 máy thì dễ bấm OK ghi đè, mất các lần bán ghi ở máy kia | Chưa mở file thì không hiện số liệu; tự đối chiếu bản trình duyệt với file, không hỏi OK/Hủy, bản bị thay thì tự tải về | 0 |
| 6 | App chỉ quản lý lời lỗ, nhập giá hôm nay xong không biết **có nên mua thêm không**; trên điện thoại phải cuộn ngang | Cột **Mua thêm?** ở bảng giá theo quy tắc mua rải khi giá giảm (giảm từ đỉnh 90 ngày, cách lần mua trước, chênh lệch mua–bán, hạn mức vốn), kèm biểu đồ 90 ngày; màn hình hẹp xếp dạng thẻ | 2.1a, 2.1e, 3.5, 2.8 |

Điểm 6 đổi quyết định cũ ở mục 5: nay có gợi ý mua thêm và biểu đồ giá.

## 0. Nguyên tắc chung

- **Một file `index.html` duy nhất**, mở bằng Chrome/Edge trên máy tính là chạy. Không build, không cài đặt, không server. 🔬 Về phía người làm app: nguồn nằm trong `src/`, ghép thành `index.html` bằng `node build.js`; kiểm thử bằng `npm test` (xem mục review lần 3).
- **App không đoán giá.** Gợi ý bán dựa trên mục tiêu bạn tự đặt cho từng lô; 🆕 gợi ý mua dựa trên quy tắc mua rải bạn tự đặt (giảm bao nhiêu từ đỉnh thì mua, hạn mức vốn). Tất cả chỉ áp vào giá bạn tự nhập. Quyết định cuối cùng là của bạn.
- **Chỉ tập trung vào vàng.** Tiết kiệm và chứng chỉ tiền gửi đã có app ngân hàng theo dõi. So sánh với gửi ngân hàng dùng ô lãi suất trong Tham số.
- **Tiêu chí thêm tính năng:** chỉ thêm khi nó giúp luồng dùng hằng ngày (nhập giá → xem lô nên chốt → bán hoặc giữ → thỉnh thoảng mua thêm hoặc cần tiền) và không bắt người dùng nhập hay đọc thêm.

### Lưu dữ liệu

| Cách | Mô tả |
|---|---|
| **Chính** | Dữ liệu tự lưu vào một **file `tai-san.json`** do bạn chọn (có thể đặt trong OneDrive/Google Drive để có bản sao). Chrome/Edge hỗ trợ ghi trực tiếp vào file. |
| **Dự phòng** | Đồng thời lưu một bản trong trình duyệt, phòng khi chưa chọn file. |
| **Sao lưu** | Tab Tham số → thẻ **Dữ liệu**: Tạo file mới, Mở file khác, **Tải bản sao lưu**, **Khôi phục từ bản sao lưu**. |

Chưa từng chọn file thì đầu trang hiện **một dòng nhắc** kèm nút Tạo file dữ liệu / Mở file có sẵn. Đầu trang không đặt nút dữ liệu nào khác để giữ gọn.

🆕 **Mở lại file mỗi lần dùng.** App nhớ file đã chọn, nhưng mỗi lần mở, trình duyệt thường hỏi lại quyền. Trong lúc chưa mở được file, app **không hiện số liệu**, chỉ hiện nút lớn **Mở lại tai-san.json** (kèm Mở file khác…; 🧪 Tạo file mới… chỉ hiện khi file cũ không mở được, xem dưới; 🔬 file **mất** thì không còn nút Mở lại và đoạn "Dữ liệu nằm trong file…", chỉ còn Mở file khác… / Tạo file mới…; ở màn chờ mà Mở file khác… chọn đúng file đang nhớ thì xử lý như bấm Mở lại, file hỏng thì hiện ngay cách lấy lại). Lý do: bản trong trình duyệt có thể cũ hơn file (vừa sửa trên máy khác); xem số cũ dễ quyết định sai, sửa trên số cũ thì dễ ghi đè.

🆕 **Đối chiếu khi mở file.** Trình duyệt nhớ thời điểm lần cuối đọc hoặc ghi file thành công (mốc đồng bộ, lưu trong trình duyệt, không nằm trong file). Khi mở file, app tự xử lý, **không hỏi OK/Hủy**:

| Bản trong trình duyệt | File | App làm gì |
|---|---|---|
| Không có thay đổi sau mốc đồng bộ | (bất kỳ) | Dùng dữ liệu trong file (🧪 chỉ đọc, không ghi lại file) |
| Có thay đổi chưa ghi vào file (ví dụ lần trước ghi file bị lỗi) | Không đổi kể từ mốc đồng bộ | Ghi bản trình duyệt vào file |
| Có thay đổi chưa ghi vào file | Cũng đã đổi (sửa ở máy khác) | Dùng dữ liệu trong file (🧪 chỉ đọc); bản trình duyệt tự tải về thành `ban-trinh-duyet-<ngày>-<giờ>.json` và báo một dòng. Cần lấy lại thì dùng **Khôi phục từ bản sao lưu** |

Bỏ hộp hỏi cũ "Dữ liệu trong trình duyệt MỚI HƠN… OK = ghi đè vào file": bấm OK theo phản xạ là mất các thay đổi ở máy kia.

🧪 **Mở file chỉ đọc.** Hai dòng "Dùng dữ liệu trong file" ở bảng trên không ghi lại file. App vẫn thay **bản trong trình duyệt** bằng dữ liệu vừa đọc và cập nhật mốc đồng bộ (theo quy tắc 🔧 "chỉ cập nhật khi lưu trọn vẹn" bên dưới: bản trình duyệt ghi lỗi thì xóa mốc). Bỏ bước này thì lần mở sau app tưởng trình duyệt "có thay đổi chưa ghi vào file" và ghi bản cũ đè lên file. App chỉ ghi file khi đưa bản trình duyệt vào file (dòng giữa), khi tạo file mới, và khi bạn thay đổi dữ liệu. Lý do: trước đây mở file nào app cũng ghi lại ngay, đổi `cap_nhat` dù không ai sửa gì. Hai máy dùng OneDrive mà máy B mở app lúc OneDrive chưa kéo kịp bản mới của máy A thì máy B ghi bản cũ kèm giờ mới; OneDrive thấy cả hai phía cùng sửa nên dễ sinh file xung đột (`tai-san-<tên máy>.json`) hoặc lấy bản cũ đè bản mới. Tab và máy khác cũng nhận báo "vừa cập nhật ở nơi khác" vô cớ. Chỉ đọc khi mở không chặn hết trường hợp OneDrive chậm (sửa ngay lúc đó vẫn ghi), nhưng bỏ được lần ghi thừa hay gặp nhất: mở app chỉ để xem.

🔧 **Nhiều tab, nhiều máy.** Đối chiếu lúc mở file chưa đủ: một tab (hay một máy) để mở từ trước vẫn giữ bản cũ, ghi vào là đè mất thay đổi ở nơi khác. Sửa bằng **một phép kiểm tra**: "nơi lưu có bị sửa ở nơi khác kể từ lần tab này đọc hoặc ghi cuối không". Nơi lưu là file `tai-san.json`; chưa kết nối file thì là bản trong trình duyệt.

- **Cách kiểm tra cho nhẹ**: xem thời điểm sửa của file, không đọc lại cả file. Thời điểm khác thì mới đọc file để so dấu cập nhật bên trong (`cap_nhat`), tránh báo nhầm khi OneDrive/Drive chỉ chạm vào file lúc đồng bộ mà nội dung không đổi.
- **Chạy lúc quay lại tab hoặc cửa sổ** (chuyển tab, chuyển cửa sổ, mở máy lên lại): bị sửa thì nạp lại ngay, báo một dòng "Dữ liệu vừa được cập nhật ở nơi khác", trước khi bạn kịp thao tác trên số cũ. Hộp thoại để mở từ trước (dựa trên số cũ) thì đóng lại, kèm "hãy mở lại thao tác".
- **Chạy trước mỗi lần lưu**: phòng khi tab vẫn đang được chọn suốt mà máy khác đã sửa file. Bị sửa thì **không ghi đè**: app nạp dữ liệu trong file, tải bản trình duyệt về như dòng cuối bảng trên, và báo "Thay đổi vừa rồi chưa được lưu vì file đã được sửa ở nơi khác. App đã nạp dữ liệu mới, hãy làm lại thao tác."

🔧 **Mốc đồng bộ chỉ cập nhật khi lưu trọn vẹn**: cả bản trong trình duyệt lẫn file đều ghi thành công. Bộ nhớ trình duyệt đầy (ghi lỗi) thì app xóa mốc, để lần mở sau dùng dữ liệu trong file, và báo một lần "Bộ nhớ trình duyệt đầy; dữ liệu vẫn được lưu vào file."

🧪 **Chưa kết nối file mà bộ nhớ trình duyệt đầy**: lần ghi lỗi không được tính là đã lưu, nên lần lưu sau không bị báo nhầm "dữ liệu đã được sửa ở nơi khác". Dữ liệu đang mở giữ nguyên; trạng thái báo đỏ "Chưa lưu được: bộ nhớ trình duyệt đầy", dòng nhắc đầu trang vẫn có nút Tạo file dữ liệu…. Trước đây lần lưu thứ hai bị coi là "đã sửa ở nơi khác": app nạp lại bản cũ, giá vừa gõ chỉ còn trong file tải về.

🔧 **Mở file lỗi không bao giờ để trang trắng**: file không đọc được, không phải JSON, hoặc không đúng dữ liệu của app thì quay về màn chờ mở file, báo lý do ngay trên màn chờ, kèm Mở file khác… / Tạo file mới…. Lỗi xảy ra lúc khởi động cũng vậy.

🧪 **File hỏng hoặc rỗng**: file không đọc được, không phải JSON, không đúng dữ liệu của app, hoặc **rỗng** (0 byte, thường do bị xóa trắng, xem Tạo file mới… bên dưới). Áp dụng cả khi app tự mở file lúc khởi động. App **không tự ghi gì vào file** (trước đây gặp file rỗng thì ghi bản trình duyệt vào, mà bản đó có thể cũ hơn nội dung vừa mất), quay về màn chờ, báo lý do kèm các cách lấy lại:

- Lấy lại bản trước bằng **lịch sử phiên bản** của OneDrive/Google Drive (trên web: chuột phải vào file → Lịch sử phiên bản), rồi bấm **Mở lại**.
- **Khôi phục từ bản sao lưu…**: chọn file `sao-luu-vang-….json` hoặc `ban-trinh-duyet-….json`; app ghi nội dung đó vào **đúng `tai-san.json`** đang nhớ (Chrome hỏi quyền ghi) rồi mở như thường.
- **Dùng bản trong trình duyệt (sửa lần cuối 05/10 09:00)**: ghi bản trong trình duyệt vào `tai-san.json`. Trình duyệt không có dữ liệu thì không hiện nút này.
- **Mở file khác…**, **Tạo file mới…** như cũ.

Trước khi ghi đè một file hỏng (không rỗng), app tải nội dung cũ về thành `tai-san-truoc-khoi-phuc-<ngày>-<giờ>.json`, để còn gỡ tay nếu cần. Lý do: giả lập file hỏng, màn chờ chỉ nhắc "Chọn file khác"; làm theo mà chọn bản sao lưu trong Downloads thì từ đó app ghi vào chính file sao lưu (nằm ngoài OneDrive), `tai-san.json` vẫn hỏng, máy kia vẫn không mở được.

🧪 **Mở nhầm bản sao lưu**: Mở file khác… mà chọn file có tên bắt đầu bằng `sao-luu-vang-` hoặc `ban-trinh-duyet-` (🔬 hay `tai-san-truoc-khoi-phuc-`, `du-lieu-cu-trong-trinh-duyet-`: mọi tên app tự tải về, đặt ở một chỗ trong code) trong khi đã có file dữ liệu thì app hỏi "Đây là bản sao lưu. Khôi phục nội dung này vào tai-san.json?". OK thì làm như **Khôi phục từ bản sao lưu**: đang mở file thì thay toàn bộ dữ liệu, có Hoàn tác; ở màn chờ thì như nút Khôi phục ở trên. Hủy thì không làm gì.

🧪 **Tạo file mới… không được trùng file đang dùng.** Bản 🔧 cho rằng chọn trúng file đã có dữ liệu thì app coi như mở file đó. Thực tế Chrome **xóa trắng file được chọn trong hộp Lưu ngay lúc chọn** (khi bấm Thay thế), trước khi trả file cho app, nên app không còn gì để đọc. Giả lập: máy A bán 1 món; máy B, trình duyệt còn bản từ tuần trước, ở màn chờ bấm Tạo file mới… và giữ tên gợi ý `tai-san.json` → file còn 0 lần bán, không có bản nào tải về. Vì vậy phải chặn từ trước khi chọn:

- Tên gợi ý trong hộp Lưu không trùng tên file đang dùng: chưa từng có file dữ liệu thì `tai-san.json`; đã có (đang dùng, hoặc đang chờ Mở lại) thì `tai-san-moi.json`.
- Màn chờ chỉ có **Mở lại tai-san.json** và **Mở file khác…**; **Tạo file mới…** chỉ hiện khi file cũ không mở được (mất, hỏng, rỗng). Tab Tham số → Dữ liệu vẫn có Tạo file mới….
- Vẫn chọn trúng chính file đang dùng (app nhận ra là cùng một file): đang mở file đó thì dữ liệu đang mở chính là của file, app ghi lại và báo "Đây là file đang dùng". Ở màn chờ thì nội dung file đã bị xóa: xử lý như **file rỗng** ở trên.
- Tạo file mới tinh (tên chưa có) thì vẫn ghi bản trình duyệt vào như cũ.

Lần đầu mở app (chưa có dữ liệu): màn hình **Bắt đầu** hướng dẫn 2 bước: tạo file dữ liệu, rồi thêm lô đầu tiên.

---

## 1. Đơn vị và quy đổi

```
1 lượng = 10 chỉ · 1 chỉ = 10 phân · 1 phân = 10 ly · 1 ly = 10 dem
→ 1 lượng = 10.000 dem · 1 chỉ = 1.000 dem
```

- Trong dữ liệu, **mọi trọng lượng lưu bằng dem** (số nguyên), nên cộng trừ không bị sai số lẻ.
- **Khi nhập**: trọng lượng mỗi món nhập vào 5 ô **lượng · chỉ · phân · ly · dem** (bỏ trống ô không dùng).
- **Khi hiển thị**: luôn ghi dạng ghép, bỏ các thành phần bằng 0. Ví dụ `12.500 dem` → `1 lượng 2 chỉ 5 phân`.
- **Tiền**: số nguyên đồng, hiển thị có dấu chấm ngăn cách (`118.000.000 đ`).
- **Gõ tắt tiền** (mọi ô tiền): số nhỏ hơn 1.000 hiểu là **triệu**: `118,5` hoặc `118.5` → 118.500.000; `50` → 50.000.000. Cũng nhận `118,5tr`, `500k`, `118.500.000`. Rời ô thì số được viết đầy đủ để bạn thấy app hiểu đúng chưa.
- 🧪 Số từ `1.000` đến dưới `1.000.000` không kèm đơn vị hiểu là **nghìn đồng**: `148.500` (hay `148500`) → 148.500.000, đúng cách bảng giá các tiệm niêm yết (nghìn đồng/lượng, nghìn đồng/chỉ). Muốn đúng số đồng như gõ thì thêm `đ`: `500.000đ` (cũng là cách nhập giá cho loại hiếm hoi niêm yết theo ly, dem).
  - Ô tiền nào app điền sẵn hoặc viết lại một số dưới 1 triệu thì ghi kèm `đ` (`500.000đ`), để bấm Lưu lại không bị hiểu thành nghìn đồng.
  - Lý do: trước đây `148.500` hiểu là 148.500 đ, mà rời ô vẫn hiện `148.500` nên không thấy sai; giá đầu tiên của loại mới gõ như vậy làm lô báo −99,9%, Đang lỗ.
- Bấm vào ô số thì nội dung được chọn sẵn, gõ là đè luôn, không phải xóa.

---

## 2. Các màn hình

Thanh tab ở đầu trang: **Hôm nay · Lô vàng · Cần tiền · Lịch sử · Tham số**. Góc phải: trạng thái lưu.

🔧 **Bàn phím**: trong hộp thoại, Enter ở bất kỳ ô nào = bấm nút chính (Lưu, Xác nhận bán, Lưu mục tiêu mới), Esc = Hủy. Trước đây Enter bấm nhầm nút Hủy (nút đứng trước) nên hộp đóng mà không lưu gì. Ở bảng giá, Enter = lưu dòng đó và chuyển xuống ô mua vào của dòng dưới, nhập nhiều loại chỉ cần gõ số rồi Enter.

### 2.1 Tab "Hôm nay" (màn hình chính)

**a) Bảng nhập giá**: mỗi loại vàng một dòng.

| Loại | Đơn vị niêm yết | Tiệm mua vào | Tiệm bán ra | Mua hôm nay cần tăng để hòa vốn | 🆕 Mua thêm? | 🆕 Không đổi |
|---|---|---|---|---|---|---|
| SJC miếng | lượng | `[ ô nhập ]` | `[ ô nhập ]` | +1,6% (= bán ra ÷ mua vào − 1) | ⚪ mua khi bán ra ≤ 149,6tr | ☐ |

- Ngày mặc định là hôm nay, sửa được (để nhập lại giá ngày cũ hoặc nhập bù).
  - 🔧 Đang chọn ngày khác hôm nay thì ô Ngày có nền vàng, kèm dòng "Đang nhập giá cho ngày 09/10 (không phải hôm nay)" và nút **Về hôm nay**.
  - 🔧 Lưu xong giá một ngày cũ, ô Ngày **giữ nguyên** ngày đó (trước đây nhảy về hôm nay), để nhập bù nhiều ngày khỏi chọn lại từ đầu. Mở lại app thì ô Ngày luôn về hôm nay.
  - 🔧 Ô Ngày đang trống hoặc chưa hợp lệ thì cột Mua thêm? tạm tính theo hôm nay; rời dòng giá thì báo "Chưa nhập ngày", chưa lưu.
  - 🧪 **Sang ngày mới khi app đang mở** (để tab mở qua đêm, gập laptop): app xem đã sang ngày mới chưa vào ba lúc: khi quay lại tab, mỗi phút một lần khi tab đang mở (để tab hiện suốt đêm, hay máy vừa thức dậy, cũng kịp đổi), và ngay trước mỗi lần lưu giá (rời dòng, Enter, tick Không đổi, Tất cả không đổi). Ô Ngày còn là "hôm nay" cũ thì tự chuyển sang hôm nay mới và vẽ lại bảng giá: giá điền sẵn, dòng vàng "chưa cập nhật hôm nay", nút Tất cả không đổi, lịch cho chọn tới hôm nay. Giá vừa gõ lưu cho hôm nay, kèm một dòng "Đã sang ngày 12/10, giá vừa nhập lưu cho hôm nay" (muốn lưu cho ngày cũ thì Hoàn tác rồi chọn lại ngày). Đang chủ động nhập bù một ngày cũ khác thì giữ nguyên ngày đó; dòng giá đang gõ dở (con trỏ còn trong dòng) không bị vẽ lại; 🔬 lưu dòng đó xong vẫn hiện dòng "Đã sang ngày…" (ô Ngày đã đổi mà người gõ không thấy). Hộp Bán / Thêm lô mở trước nửa đêm, xác nhận sau nửa đêm: ô Ngày còn là ngày mặc định lúc mở thì lấy hôm nay. Lý do: giả lập để tab mở từ tối 11/10, sáng 12/10 gõ giá: ô Ngày vẫn là 11/10, không nền vàng, không có Về hôm nay, lịch không cho chọn 12/10; giá sáng nay đè lên giá thật của 11/10 (159,1 → 163tr), ngày 12/10 không có giá, kiểm tra lệch 15% không bắt được vì so với chính giá 11/10.
- Ô giá tự điền sẵn giá lần nhập gần nhất, bạn chỉ sửa chỗ thay đổi. 🔧 Chính xác là: giá **của ngày đang chọn** nếu ngày đó đã có giá; chưa có thì giá gần nhất **trước** ngày đó (chọn ngày cũ để nhập bù thì không bị điền giá mới hơn). Việc xét "giá có thay đổi không" và kiểm tra lệch 15% đều so với giá điền sẵn này. Loại nào giá chưa cập nhật hôm nay thì dòng "giá ngày …" hiện màu vàng.
- 🔧 **Lưu khi rời dòng** (thay nút Cập nhật giá):
  - Sửa giá xong, **rời khỏi dòng đó** (bấm sang dòng khác, bấm chỗ khác, mở hộp thoại, chuyển tab) hoặc nhấn Enter thì dòng được lưu cho ngày đang chọn, cùng các kiểm tra như trước (lệch 15%, bán ra thấp hơn mua vào). Chuyển giữa ô mua vào và ô bán ra trong cùng một dòng thì chưa lưu.
  - Chỉ lưu khi giá khác giá điền sẵn; loại không sửa vẫn giữ ngày cũ (để không tưởng nhầm giá cũ là giá hôm nay).
  - Kiểm tra hỏi lại mà bấm Hủy thì dòng trở về giá điền sẵn, không lưu. Mỗi dòng lưu là một bước hoàn tác ("↶ Hoàn tác: giá SJC ngày 11/10").
  - Lưu xong thì mọi phần tính lại theo giá mới: nhóm lô, dòng tổng, hộp Bán, form Thêm lô, tab Cần tiền.
  - Lý do: trước đây giá gõ mà chưa bấm Cập nhật nằm lơ lửng, gây ba lỗi một lúc: mất khi làm việc khác (A3), nhóm lô và cột Mua thêm? dùng hai giá khác nhau trên cùng màn hình (C2), hộp Bán và form Thêm lô điền giá cũ. Lưu khi rời dòng thì không còn giá lơ lửng, và mỗi ngày bớt một lần bấm. Không lưu theo từng phím vì sẽ lưu cả số đang gõ dở (gõ "15" trên đường tới "156") và hỏi lại liên tục.
- 🆕 **Không đổi**: dòng nào giá chưa phải của ngày đang chọn thì có ô tick ở cuối dòng (🔧 kể cả khi đang chọn ngày cũ). Xem giá tiệm thấy không đổi thì tick: 🔧 **lưu ngay** giá đang điền sẵn cho ngày đang chọn, dòng hết màu vàng.
- 🔧 Nút **Tất cả không đổi** (thay hộp hỏi "Giá không đổi so với lần nhập trước…"): hiện khi còn dòng chưa có giá của ngày đang chọn; bấm là ghi nhận giá điền sẵn của mọi dòng đó. Ngày giá đứng yên chỉ cần một lần bấm.
- 🆕 **Mua thêm?**: gợi ý có nên mua thêm loại này không, tính lại ngay khi gõ giá (🔧 chưa cần rời dòng, chỉ dòng đó đổi theo). Quy tắc ở mục e). Dưới bảng có dòng **Vì sao? · Biểu đồ 90 ngày**, thu gọn mặc định; 🔧 thu gọn thì chưa tính, mở ra mới tính.
- **Giá tiệm bán ra tự theo**: sửa giá mua vào thì giá bán ra tự cộng theo chênh lệch của lần nhập trước; sửa tay giá bán ra thì app không đụng vào nữa.
- **Chống gõ nhầm**: giá mua vào lệch quá 15% so với lần trước (thừa/thiếu số 0, nhầm giá lượng với giá chỉ) thì hỏi lại trước khi lưu. 🧪 Loại chưa có giá lần nào thì so với **đơn giá lô gần nhất** của loại đó (lô đầu tiên vừa nhập), để giá đầu tiên cũng được kiểm tra.

**b) Gợi ý theo lô**: chia 4 nhóm, mỗi nhóm là một bảng.

| Nhóm | Điều kiện | Hiển thị thêm |
|---|---|---|
| 🟢 **Nên chốt** | `% lời ≥ % kỳ vọng`, 🆕 hoặc **lời tụt dưới mức nhắc** (lô đã giữ, nâng mục tiêu; 🔧 vẫn nhắc khi nay đã lỗ) | Nút **Bán…** (mở hộp thoại bán, có sẵn nút Bán hết / Lấy lại vốn / Bán một nửa) và **Giữ, nâng mục tiêu**. 🆕 Lô tụt ghi rõ mức nhắc, 🔧 kèm đỉnh lời đã đạt: "lời tụt từ +30,0% (02/09) về +16,7%, dưới mức nhắc 25%"; nút thứ hai là **Giữ tiếp**. 🧪 Tiệm đang hạ giá mua vào (chênh lệch cao bất thường) thì ghi thêm bán hôm nay thiệt hơn ngày thường bao nhiêu (xem dưới) |
| 🟡 **Sắp đạt** | Chưa đạt, đang lời, và **giá chỉ còn cần tăng ≤ mức báo sắp đạt** | Giá cần tăng bao nhiêu % (lên bao nhiêu) |
| ⚪ **Giữ** | Đang lời mà chưa sắp đạt, 🆕 hoặc **lỗ chỉ do chênh lệch mua–bán** (giá tiệm bán ra hôm nay vẫn ≥ giá vốn của lô, 🔧 và chênh lệch hôm nay không cao bất thường) | Giá cần tăng bao nhiêu % để đạt mục tiêu. 🆕 Lô lỗ chênh lệch ghi thêm "chưa qua chênh lệch mua–bán". 🔬 Cũng có nút **Bán…** (lô vừa Giữ, nâng mục tiêu nằm ở đây; trước phải sang tab Lô vàng mới bán được) |
| 🔴 **Đang lỗ** | `% lời < 0` 🆕 và **giá tiệm bán ra hôm nay < giá vốn của lô** (giá đã giảm so với lúc mua), 🔧 hoặc `% lời < 0` khi **chênh lệch hôm nay cao bất thường** | Lỗ bao nhiêu, giá cần tăng bao nhiêu % để hòa vốn. 🔧 Lỗ vì chênh lệch cao thì ghi thêm "tiệm đang nới chênh lệch: 5,3%, thường 1,6%" |

Cột chung cho mọi lô (giữ gọn, chỉ những gì cần để quyết định): số lô và loại, còn lại (món × trọng lượng), vốn còn lại, giá trị hôm nay, lời/lỗ (đ và %), mục tiêu, **so với gửi ngân hàng**.

Số ngày giữ, % quy ra năm và lãi thực sau lạm phát xem ở **Chi tiết** của lô (tab Lô vàng). Nhóm ⚪ **Giữ** thu gọn mặc định vì không cần làm gì; 🆕 tên nhóm đổi thành "Giữ — chưa đạt mục tiêu" vì có cả lô lỗ chênh lệch. 🔧 Phần đang thu gọn (nhóm Giữ, Đang chờ giá mua lại, phần Vì sao?) chỉ vẽ, chỉ tính khi bấm mở, để dữ liệu nhiều năm vẫn mượt (với dữ liệu 20 năm, mỗi lần vẽ lại đang mất khoảng 180 ms, phần lớn cho các dòng không ai nhìn).

🆕 **Vì sao tách lỗ chênh lệch**: mua xong là lỗ ngay bằng chênh lệch giữa giá tiệm bán ra và mua vào (khoảng 1,5–2,5%). Xếp vào nhóm đỏ thì lô nào mới mua cũng đỏ, nhìn mãi thành quen và bỏ sót lô lỗ thật. Giá tiệm bán ra hôm nay còn ≥ giá vốn nghĩa là mua lại y hệt lô đó hôm nay cũng không rẻ hơn, tức giá chưa giảm; phần lỗ chỉ là chênh lệch, không có gì phải làm. 🔧 Ngoại lệ: tiệm **nới chênh lệch bất thường** (hạ giá mua vào mà giữ giá bán ra, hay gặp lúc thị trường biến động). Khi đó phần lỗ là thật: bán lúc này thiệt hơn hẳn mọi khi. Ví dụ lô mua 157,5tr, tiệm hạ mua vào 155 → 150 nhưng bán ra vẫn 158: lỗ −4,8%, gấp ba chênh lệch thường ngày. Lô như vậy vào Đang lỗ.

🧪 **Nên chốt lúc tiệm hạ giá mua vào**: khi chênh lệch cao bất thường **và** giá tiệm mua vào thấp hơn lần nhập gần nhất có chênh lệch bình thường (tức tiệm nới chênh lệch bằng cách hạ giá mua vào), lô vẫn vào Nên chốt theo quy tắc bạn đặt (đạt mục tiêu, hoặc lời tụt dưới mức nhắc), nhưng dòng của lô ghi thêm "tiệm đang hạ giá mua vào, chênh lệch 7,6% (thường 1,2%): bán hôm nay được ít hơn ngày thường khoảng 10,0tr". Lô tụt dưới mức nhắc mà nếu chênh lệch như mọi khi thì chưa tụt, ghi tiếp "nếu chênh lệch như mọi khi, lời là +29,2%, chưa dưới mức nhắc; không gấp thì đợi". Công thức ở mục 3.4.

- Chênh lệch cao vì tiệm **nâng giá bán ra** (hay gặp lúc giá tăng nóng; giá mua vào không giảm) thì phía bán không ghi gì: bán lúc đó không thiệt. Cột Mua thêm? vẫn báo 🟠 Đợi như cũ.

- Ví dụ (giả lập): lô mua 130tr/lượng, đã Giữ với mức nhắc 25%. Hôm qua tiệm mua vào 170, bán ra 172; hôm nay hạ mua vào xuống 158 nhưng bán ra vẫn 170 (chênh lệch 7,6%, thường 1,2%). Lời tụt về +21,5% nên lô vào Nên chốt; chênh lệch như mọi khi thì tiệm mua vào khoảng 168tr, lời +29,2%, chưa dưới mức nhắc.
- Lý do: trước đây cùng một màn hình, cột Mua thêm? biết báo 🟠 Đợi, chênh lệch cao, còn phía bán thì đẩy 2 lô đang Giữ về Nên chốt đúng lúc bán thiệt nhất mà không nhắc gì; hộp Bán, tab Cần tiền cũng im lặng. App không tự đổi nhóm của lô (mục 5): bạn quyết định bán hay đợi.

**Giữ, nâng mục tiêu**: khi quyết định giữ một lô đã đạt mục tiêu, hộp thoại có 2 ô, dưới mỗi ô app hiện giá tiệm mua vào tương ứng:

| Ô | Mặc định | Ví dụ: lô đang +30%, mục tiêu cũ 15% |
|---|---|---|
| Mục tiêu mới | Mức lời hiện tại làm tròn lên bội số 5%, cao hơn ít nhất 1 điểm (+42,5% → 45%) | 35% |
| 🆕 Nhắc chốt nếu lời tụt về | Mức lời hiện tại làm tròn xuống bội số 5%, thấp hơn ít nhất 1 điểm, không thấp hơn mục tiêu cũ (🔬 trừ khi lời vừa đúng bằng mục tiêu: lúc đó không có mức nào ≥ mục tiêu cũ mà < lời, nên lấy bội số 5% ngay dưới, 15,0% → 10%). Để trống = không nhắc | 25% |

Lô chuyển sang nhóm Giữ, không bị nhắc lại mỗi ngày. 🆕 Lô quay lại nhóm **Nên chốt** khi lời đạt mục tiêu mới, **hoặc khi lời tụt dưới mức nhắc**. Lý do: khi dùng thử, lô SJC đang +30% được giữ để chờ 35%, giá rơi còn +16,7% thì lô nằm im trong nhóm Giữ đang thu gọn, 32 triệu lời mất mà app không nhắc gì.

🆕 **Giữ tiếp** (lô đang tụt dưới mức nhắc): cùng hộp thoại; mục tiêu giữ nguyên, mức nhắc mặc định tính lại theo mức lời hiện tại (lúc này được thấp hơn mục tiêu cũ), để trống thì thôi nhắc.

🔧 **Mức nhắc**:
- Ở mọi chỗ đặt (hộp Giữ, form Thêm / Sửa lô), mức nhắc phải **> 0 và thấp hơn lời hiện tại**. Đặt như vậy thì lời đã ở trên mức nhắc ngay từ đầu, nên "lời tụt dưới mức nhắc" luôn có nghĩa là đã từng cao hơn rồi tụt xuống. Không cần thêm trường dữ liệu nào để nhớ "đã chạm mức nhắc chưa".
- Lời dưới mức nhắc là nhắc, **kể cả khi nay đã lỗ** (giá có thể rơi mạnh giữa hai lần bạn mở app). Nhắc cho tới khi bạn Bán, Giữ tiếp, hoặc bỏ mức nhắc.
- Dòng nhắc ghi **đỉnh lời kể từ khi mua** (theo giá đã nhập), để khỏi nhầm khi giá đang hồi lên: "lời tụt từ +30,0% (02/09) về +20,0%".

**c) Nhắc mua lại**:
- **🔁 Có thể mua lại**: các lần bán có `giá tiệm bán ra ≤ giá muốn mua lại`. Nút **Mua lại…** mở form thêm lô điền sẵn loại, số món, trọng lượng, mục tiêu của lô cũ và đơn giá hôm nay; lưu xong thì nhắc tự tắt. Nút **Bỏ nhắc**.
- **Đang chờ giá mua lại**: các lần bán chưa tới giá, thu gọn mặc định.
- 🧪 **Mua bằng đường khác cũng tắt nhắc**: lưu một lô mới bằng bất kỳ nút nào (**+ Thêm lô**, **Mua…** ở cột Mua thêm?, Mua lại…) thì các nhắc mua lại **cùng loại**, có ngày bán không sau ngày mua của lô mới, tự tắt. Đầu trang báo một dòng "Đã tắt nhắc mua lại B-0001 (161tr) vì vừa mua V-2026-004 cùng loại", kèm nút **Giữ lại nhắc** (bật lại các nhắc vừa tắt, lô mới vẫn giữ). Lý do: giả lập chạm giá muốn mua lại 161tr, mua ở tiệm rồi nhập bằng + Thêm lô (cách nhập tự nhiên nhất): nhắc không tắt, hôm sau cột Mua thêm? vẫn 🟢 Mua lại và thẻ 🔁 vẫn hiện. Nhắc này được xét trước mốc rải, nên vừa mua 160,5tr app vẫn giục mua tiếp, dễ mua hai lần.

**d) Dòng tổng**: tổng vốn đang giữ, tổng giá trị hôm nay, lời tạm tính, lời đã chốt (từ trước đến nay), tổng lời. 🔧 Có hạn mức vốn thì ô Vốn đang giữ ghi thêm "/ hạn mức 600tr · còn 47tr".

🧪 **Vốn đang giữ** tính mọi lô đang giữ, kể cả lô chưa có giá. Giá trị hôm nay và lời tạm tính chỉ tính các lô có giá (lời tạm tính = giá trị − vốn của các lô đó); có lô chưa có giá thì ghi thêm "chưa tính V-2026-001 (chưa có giá)". Trước đây vừa thêm lô 300tr mà ô Vốn đang giữ ghi 0 đ.

**e) Gợi ý mua thêm** 🆕

App không đoán giá lên hay xuống. Gợi ý mua là **quy tắc mua rải khi giá giảm** do bạn đặt ở Tham số, áp vào giá bạn nhập. Phía mua dùng **giá tiệm bán ra** (giá bạn phải trả); phía bán (các nhóm lô ở mục b) vẫn dùng giá tiệm mua vào như cũ.

- **Vùng mua**: giá tiệm bán ra thấp hơn **đỉnh 90 ngày** ít nhất X% (Tham số, mặc định 5%).
- **Mua rải, không dồn**: trong 90 ngày đã mua loại này rồi thì lần tiếp theo phải rẻ hơn lần mua gần nhất ít nhất X% nữa. Giá cứ giảm thì các lần mua cách nhau X%, không phải ngày nào cũng hiện "nên mua".
- **Không mua lúc chênh lệch cao bất thường**: lúc thị trường biến động, tiệm hay hạ giá mua vào mà giữ giá bán ra; mua lúc đó phải chờ giá tăng nhiều hơn mới hòa vốn.
- **Hạn mức vốn** (Tham số, để trống = không giới hạn): tổng vốn đang giữ trong vàng đã chạm hạn mức thì thôi gợi ý mua. 🔧 Phần còn lại không đủ mua **1 món quen** (trọng lượng mỗi món của lô gần nhất cùng loại) cũng tính là đủ hạn mức.
- 🔧 **Giá bạn đặt khi bán cũng là một mốc**: tiệm bán ra chạm "giá muốn mua lại" của một lần bán loại này thì là 🟢 **Mua lại**, khớp với thẻ 🔁 Có thể mua lại ở mục c.
- 🔧 **Không vừa bán vừa mua**: loại này đang có lô ở nhóm Nên chốt thì không báo 🟢. Bán lô cũ rồi mua lô mới cùng loại cùng lúc là mất chênh lệch mua–bán 2 lần mà số vàng vẫn vậy; nên chọn một: chốt lô cũ, hoặc giữ nó thay cho mua thêm.

Cột **Mua thêm?** hiện một kết quả (công thức ở 3.5), xét theo thứ tự, gặp điều kiện đúng đầu tiên thì dừng:

| Kết quả | Khi nào | Hiện thêm |
|---|---|---|
| `nhập giá hôm nay` (màu vàng) | Giá của loại chưa phải của ngày đang chọn (chưa gõ, chưa tick Không đổi) | — |
| ⛔ **Đủ hạn mức** | Có hạn mức và tổng vốn đang giữ ≥ hạn mức, 🔧 hoặc phần còn lại không đủ 1 món quen | Vốn đang giữ / hạn mức; 🔧 "còn 47tr, chưa đủ 1 món 1 lượng (149,5tr)" |
| 🟠 **Đợi, chênh lệch cao** | Chênh lệch mua–bán hôm nay > 1,5 lần mức thường ngày (🛠 và cao hơn mức thường ít nhất 0,5 điểm %) | "mua hôm nay cần tăng 3,5% mới hòa vốn, thường 1,6%" |
| 🔧 🟡 **Cân nhắc** | Giá đã vào vùng mua, nhưng loại này đang có lô ở nhóm Nên chốt (🔬 chạm giá mua lại thì là **Mua lại** ở dòng dưới, xét trước Cân nhắc) | "đang có lô V-2025-001 nên chốt: chốt lô đó, hoặc giữ nó thay cho mua thêm". Không có nút Mua… |
| 🔧 🟢 **Mua lại** | Giá tiệm bán ra ≤ giá muốn mua lại của một lần bán loại này (đang chờ, chưa bỏ nhắc, 🧪 chưa tự tắt vì đã mua lại, mục c) | "chạm giá bạn đặt khi bán B-0001 (16,0tr)", nút **Mua lại…** như ở thẻ 🔁. 🔬 Mốc mua lại là kế hoạch bạn đặt lúc bán nên thắng Cân nhắc; có lô cùng loại đang Nên chốt thì ghi kèm "lô V-2026-001 đang tụt dưới mức nhắc (hoặc: đã đạt mục tiêu) cũng ở Nên chốt: muốn mua lại thì Giữ tiếp (chốt) lô đó trước, đừng vừa bán vừa mua". Thứ tự xét: Đủ hạn mức → Đợi → Mua lại → Cân nhắc → Vùng mua → Chưa tới |
| 🟢 **Vùng mua** | Giá tiệm bán ra ≤ giá vào vùng mua | Nút **Mua…** (mở form Thêm lô chọn sẵn loại này). Có hạn mức thì ghi còn bao nhiêu, quy ra vàng |
| ⚪ **Chưa tới** | Còn lại | "mua khi bán ra ≤ 149,6tr (còn cách 5,6%)"; 🔧 mốc ghi ở đây là mốc gần nhất trong hai: giá vào vùng mua và giá muốn mua lại đang chờ |

🔧 Mới có dưới 14 ngày giá thì ô ghi thêm "(mới có N ngày giá)" ngay dưới kết quả, không chỉ trong phần Vì sao?.

Ví dụ SJC: đỉnh tiệm bán ra 90 ngày là 166,0tr (02/09), X = 5% → mốc đỉnh 157,7tr. Ngày 10/10 đã mua giá 157,5tr → mốc rải 149,6tr. Giá vào vùng mua lấy mốc thấp hơn: **149,6tr**. Hôm nay tiệm bán ra 158,5tr → ⚪ Chưa tới, còn cách 5,6%. Mua xong một lần trong vùng mua thì mốc rải tự hạ thêm X% cho lần sau.

**Vì sao? · Biểu đồ 90 ngày** (dưới bảng giá, thu gọn mặc định), mỗi loại một khối:

- **Biểu đồ** 90 ngày: đường giá tiệm bán ra (đậm) và mua vào (nhạt); đường ngang nét đứt là **giá vào vùng mua**, đường chấm là **giá vốn bình quân** đang giữ; ▲ là các lần mua (theo đơn giá lô), ▼ là các lần bán. Rê chuột hoặc chạm để xem giá từng ngày.
- **Các số dẫn tới kết quả**: đỉnh 90 ngày (ngày nào), giảm từ đỉnh bao nhiêu %, lần mua gần nhất trong 90 ngày (ngày, đơn giá), chênh lệch hôm nay và thường ngày, giá vốn bình quân, vốn đang giữ / hạn mức. 🔧 Thêm: giá muốn mua lại đang chờ (nếu có), lô cùng loại đang ở nhóm Nên chốt (nếu có), và giá 1 món quen khi có hạn mức.
- Mới có dưới 14 ngày giá thì ghi "mới có N ngày giá, đỉnh 90 ngày chưa đủ tin cậy". Có thể nhập bù giá các ngày trước bằng ô Ngày ở bảng giá.

Nhắc mua lại (mục c) vẫn giữ nguyên: đó là giá bạn tự đặt khi bán từng lô; gợi ý mua thêm là quy tắc chung cho cả loại.

### 2.2 Tab "Lô vàng"

- Nút **+ Thêm lô**, form gồm:

  | Ô | Bắt buộc | Ghi chú |
  |---|---|---|
  | Ngày mua | ✔ | |
  | Loại vàng | ✔ | Chọn trong danh sách, hoặc gõ tên mới để tạo loại mới |
  | Số món | ✔ | Ví dụ `2` |
  | Trọng lượng mỗi món | ✔ | Ví dụ `1 lượng` |
  | Giá mua | ✔ | Nhập **đơn giá** (theo đơn vị niêm yết của loại) **hoặc tổng tiền**, app tự tính ô còn lại. Lô mới: đơn giá tự điền giá tiệm bán ra mới nhất của loại |
  | % kỳ vọng | ✔ | Tự điền mặc định từ Tham số |
  | Báo sắp đạt khi giá còn cần tăng ≤ (%) | ✔ | Tự điền mặc định từ Tham số |
  | 🆕 Nhắc chốt nếu lời tụt về (%) | | Thường đặt qua nút **Giữ, nâng mục tiêu**; để trống = không nhắc. 🔧 Nhập thì phải > 0 và thấp hơn lời hiện tại, như hộp Giữ; lô chưa có giá thì chưa đặt được. 🧪 Form Thêm lô và Mua lại… **chỉ hiện ô này khi lô đang lời** theo giá mua và giá hiện tại (thường là khi nhập lại một lô mua từ lâu); lô vừa mua đang lỗ chênh lệch (khoảng −1%), nhập mức nào cũng bị từ chối, nên ẩn đi. Form Sửa lô giữ như cũ |
  | Ghi chú | | Nơi mua, số seri... |

- **Số lô tự sinh**: `V-<năm mua>-<số thứ tự 3 chữ số>`, ví dụ `V-2026-001`. Số thứ tự đánh theo năm mua, không dùng lại khi xóa, và luôn lớn hơn mọi mã đang có (kể cả khi khôi phục file thiếu bộ đếm).
- **Mặc định để nhập ít nhất**: loại vàng = loại của lô nhập gần nhất; trọng lượng mỗi món = của lô gần nhất cùng loại, 🆕 loại chưa có lô nào (kể cả loại mới tạo ngay trong form) thì là **1 đơn vị niêm yết** của loại (lượng → `1 lượng`, chỉ → `1 chỉ`); đổi loại hoặc đổi đơn vị niêm yết của loại mới thì trọng lượng đổi theo, trừ khi đã sửa tay; đơn giá = giá tiệm bán ra hôm nay. Mua đúng loại quen thì chỉ cần nhập **số món** rồi Lưu.
- 🆕 **Trọng lượng điền sẵn là một khối**: lần đầu gõ vào một ô trọng lượng thì các ô khác đang mang số điền sẵn tự xóa trắng. Ví dụ đang điền sẵn `1 chỉ`, gõ `1` vào ô lượng → `1 lượng`. Cần ghép nhiều đơn vị (trang sức `1 chỉ 2 phân`) thì gõ tiếp vào các ô kia như thường. Áp dụng cho lô mới (Thêm lô, Mua lại…); form Sửa lô giữ cách cũ vì trọng lượng ở đó là số thật đã lưu.
- 🆕 Ngay dưới 5 ô trọng lượng hiện **chữ đậm** `Mỗi món 1 lượng · cả lô 2 lượng`, thay cho dòng chữ xám nhỏ, để thấy ngay app hiểu đúng chưa.
- 🆕 Lý do hai điều trên: khi dùng thử, form lô đầu tiên điền sẵn `1 chỉ` trong khi loại mới niêm yết theo lượng; gõ `1` vào ô lượng thành `1 lượng 1 chỉ`. Với 2 miếng SJC vốn 300 triệu, giá 156 triệu/lượng, app báo lời +14,4% và "sắp đạt, cần tăng 0,5%", trong khi thật chỉ +4%, cần tăng 10,6%. Kiểm tra lệch 15% không bắt được vì loại mới chưa có giá, còn thừa 1 chỉ trên 1 lượng chỉ lệch khoảng 9%.
- Ô ít dùng (mức báo sắp đạt, 🆕 mức nhắc tụt, ghi chú) nằm trong **"Tùy chọn khác"**, thu gọn mặc định.
- 🔧 **Vượt hạn mức**: lưu lô mới mà tổng vốn đang giữ vượt hạn mức thì hỏi lại "Vốn đang giữ sẽ lên 852tr, vượt hạn mức 600tr. Vẫn lưu?".
- 🧪 Lưu lô mới thì các nhắc mua lại cùng loại tự tắt, kèm nút Giữ lại nhắc (mục 2.1c).
- Một lần mua có nhiều loại món (ví dụ 1 miếng 1 lượng và 1 miếng 5 chỉ) thì nhập thành **2 lô**.
- Danh sách lô: lọc theo **Đang giữ / Đã đóng / Tất cả** và theo loại vàng.
- **Sửa lô**: sửa được mọi ô. **Xóa lô**: xóa được cả lô đã bán; khi đó các lần bán của lô bị xóa theo (app hỏi rõ số lần bán sẽ mất).
- Bấm vào một lô: xem chi tiết và lịch sử bán của lô đó.

### 2.3 Hộp thoại "Bán"

Mở từ nút bán ở tab Hôm nay, tab Lô vàng hoặc tab Cần tiền.

- Hiện sẵn chỉ 2 ô: **Số món bán** và **Giá bán**. Ngày bán (mặc định hôm nay), giá muốn mua lại, ghi chú nằm trong **"Tùy chọn khác"** (tự mở khi sửa lần bán).
- **Số món bán** (tối đa bằng số món còn lại). Các nút gợi ý điền sẵn: Bán hết · Bán lấy lại vốn · Bán một nửa.
- **Giá bán** (mặc định là giá tiệm mua vào hôm nay, sửa được theo giá thực tế). 🔧 Giá vừa gõ ở bảng giá đã được lưu khi bấm sang nút Bán… (rời dòng là lưu, mục 2.1a), nên giá điền sẵn là giá vừa gõ.
- **Xem trước** trước khi xác nhận: tiền thu về, vốn của phần bán, lời/lỗ chốt, so với gửi ngân hàng, lô còn lại bao nhiêu.

- Dưới ô giá ghi rõ giá đang điền sẵn là **giá ngày nào**; giá cũ thì nhắc kiểm tra giá thực tế.
- 🧪 Tiệm đang hạ giá mua vào (mục 3.4) thì dưới ô giá ghi thêm "Tiệm đang hạ giá mua vào, chênh lệch 7,6% (thường 1,2%): bán số món này được ít hơn ngày thường khoảng 10,0tr", tính theo số món đang chọn.

Lô hết món thì tự chuyển sang **Đã đóng**. Mỗi lần bán **sửa được** (ngày, số món, giá, mua lại, ghi chú; dùng cùng hộp thoại) hoặc **xóa** (số món trả lại cho lô).

### 2.4 Tab "Cần tiền"

Nhập **số tiền cần** → app đưa ra 3 phương án đặt cạnh nhau:

| Phương án | Thứ tự chọn lô |
|---|---|
| **A. Chốt lời tốt nhất** | Lô đã đạt mục tiêu trước, rồi theo % lời **cao → thấp**. 🧪 Chính xác là: lô ở nhóm **Nên chốt** trước (đạt mục tiêu, hoặc lời tụt dưới mức nhắc), rồi theo % lời cao → thấp |
| **B. Ít lô nhất** | Ưu tiên **một lô** bán vừa đủ mà dư ít nhất; không có thì lấy lô có giá trị còn lại **lớn → nhỏ** |
| **C. Giữ lô tốt** | Theo % lời **thấp → cao** (chỉ trong các lô đang lời) |

Quy tắc chung cho cả 3 phương án:

1. **Không đụng lô lỗ** nếu các lô lời đã đủ tiền. 🆕 Lô lỗ ở đây là mọi lô có % lời < 0, kể cả lô lỗ chỉ do chênh lệch mua–bán (nằm trong nhóm Giữ ở tab Hôm nay), vì bán lúc này vẫn là chốt lỗ.
2. Thiếu tiền thì **bổ sung từ lô lỗ**, chọn lô **lỗ % ít nhất trước**, và gắn cảnh báo ⚠️.
3. Bán theo **từng món** nên tiền thu có thể **dư** một chút; app ghi rõ số dư.
4. Tổng tất cả các lô vẫn không đủ thì báo: còn thiếu bao nhiêu.

Mỗi phương án hiển thị: danh sách `lô → số món`, tổng tiền thu, **lời/lỗ chốt**, số tiền dư, tổng vàng và tổng vốn còn lại sau khi bán. Nếu có phần lỗ thì hiện thêm: lỗ bao nhiêu, thiệt so với gửi ngân hàng bao nhiêu.

Bạn chọn một phương án, **chỉnh số món nếu muốn**, rồi bấm **Xác nhận bán**. App tạo các lần bán tương ứng (giá = giá tiệm mua vào gần nhất; giá thực tế khác thì sửa lần bán ở tab Lịch sử).

- Phương án nào **giống hệt** phương án trước thì không hiện lại, chỉ ghi một dòng "Phương án C giống A".
- Giá đang dùng **không phải giá hôm nay** thì cảnh báo, nhắc cập nhật giá trước khi bán.
- 🧪 Loại nào tiệm đang hạ giá mua vào (mục 3.4) thì cảnh báo "Tiệm đang hạ giá mua vào: SJC miếng, chênh lệch 7,6% (thường 1,2%); bán lúc này được ít hơn ngày thường, không gấp thì đợi", và mỗi phương án ghi thêm "thiệt do tiệm hạ giá mua vào: khoảng 20,0tr" (🔬 số ước lượng, ghi một chữ số lẻ như dòng Nên chốt).
- 🧪 Lý do sửa phương án A: giả lập lô V-2026-001 đang ở Nên chốt (lời tụt về +23,1%), lô V-2026-002 đang Giữ (+28%, chưa đạt mục tiêu 35%); phương án "Chốt lời tốt nhất" bán V-2026-002, để lại đúng lô mà tab Hôm nay đang giục chốt.

> Ghi chú: "lỗ ít nhất" (phương án D ở buổi trao đổi trước) được gộp vào quy tắc 2, vì khi phải bán lỗ thì thứ tự "lỗ % ít nhất trước" chính là cách lỗ ít nhất.

### 2.5 Tab "Lịch sử"

- **Lịch sử bán**: lọc theo năm. Mỗi dòng có nút **Sửa** và **Xóa**. Tổng lời đã chốt theo năm.
- 🔬 **Lời đã chốt theo năm** và cột **Lời đã chốt** theo loại tính qua `saleCalcs()` (mọi lần bán kèm lô), cùng nguồn với thẻ Lời đã chốt ở tab Hôm nay.
- **Lịch sử giá**: hiện 30 dòng gần nhất, có nút xem tất cả. Xóa được từng dòng. 🧪 Thay nút xem tất cả bằng **lọc theo loại vàng và theo năm**: mặc định mọi loại, 30 dòng gần nhất; chọn một năm thì hiện cả năm đó. Với dữ liệu 20 năm, vẽ hết 21.900 dòng mất khoảng 1,4 giây, trong khi các thao tác khác đều dưới 0,2 giây.
- **Thống kê theo loại vàng**: vốn đang giữ, giá trị, lời tạm tính, lời đã chốt, 🆕 **giá vốn bình quân** (theo đơn vị niêm yết, của phần đang giữ).

### 2.6 Tab "Tham số"

| Tham số | Ví dụ |
|---|---|
| Lãi suất ngân hàng tham chiếu (%/năm) | 5,5 |
| Lạm phát (%/năm) | 3,5 |
| % kỳ vọng mặc định cho lô mới | 15 |
| Báo sắp đạt khi giá còn cần tăng ≤ (%) | 2 |
| 🆕 Mua thêm khi giá giảm từ đỉnh 90 ngày ≥ (%) | 5 |
| 🆕 Hạn mức vốn cho vàng (để trống = không giới hạn) | 800.000.000 |
| Danh sách loại vàng | Tên, đơn vị niêm yết (lượng/chỉ/phân/ly/dem). Đổi tên được; chỉ xóa được loại chưa có lô nào |

---

### 2.7 Sửa, xóa và hoàn tác

| Nhập sai gì | Cách sửa |
|---|---|
| Thông tin lô (ngày, loại, số món, trọng lượng, giá mua, mục tiêu, ghi chú) | Tab Lô vàng → **Sửa** |
| Cả lô (nhập nhầm hẳn) | Tab Lô vàng → **Xóa** (kèm các lần bán của lô) |
| Lần bán (ngày, số món, giá, mua lại, ghi chú) | Tab Lịch sử (hoặc Chi tiết lô) → **Sửa** |
| Bán nhầm | Tab Lịch sử → **Xóa** lần bán, số món trả lại cho lô |
| Giá hôm nay | Sửa lại ô giá ở tab Hôm nay, 🔧 rời dòng là lưu đè lên giá cùng ngày; hoặc ↶ Hoàn tác |
| Giá một ngày cũ | Chọn ngày đó ở ô Ngày rồi nhập lại, hoặc tab Lịch sử → Lịch sử giá → **Xóa** |
| Nâng mục tiêu nhầm, 🆕 đặt mức nhắc tụt nhầm | Tab Lô vàng → Sửa → % kỳ vọng, mức nhắc tụt (trong Tùy chọn khác) |
| Tham số, tên loại vàng | Tab Tham số, sửa trực tiếp |

**Hoàn tác thao tác vừa làm**: sau mỗi thay đổi, đầu trang hiện nút **↶ Hoàn tác: <việc vừa làm>** (hoặc bấm Ctrl+Z khi không đang gõ trong ô). Nhớ tối đa 10 bước gần nhất, áp dụng cho mọi thay đổi kể cả xóa. Danh sách hoàn tác mất khi tải lại trang hoặc mở file dữ liệu khác.

### 2.8 Màn hình hẹp và điện thoại 🆕

Khi dùng thử trên điện thoại, bảng giá phải cuộn ngang mới thấy ô Tiệm bán ra, bảng lô phải cuộn ngang mới thấy lời/lỗ.

- Áp dụng khi màn hình hẹp dưới 640px; rộng hơn thì giữ bảng như cũ.
- **Tab Hôm nay không cuộn ngang** trên màn hình từ 360px trở lên. Các tab khác: trang không cuộn ngang, bảng dài cuộn trong khung của nó.
- **Bảng giá**: mỗi loại một khối, ô Tiệm mua vào và Tiệm bán ra xếp chồng, dòng dưới là kết quả **Mua thêm?**; các cột còn lại thành một dòng chữ nhỏ.
- **Bảng lô ở Hôm nay**: mỗi lô một thẻ. Dòng 1: mã lô, loại, **% lời**. Dòng 2: lời/lỗ và giá trị hôm nay. Dòng 3: các nút. Vốn, mục tiêu, so với ngân hàng xem trong Chi tiết.
- **Biểu đồ** co theo bề ngang màn hình.
- **Dữ liệu**: trình duyệt nào không ghi thẳng vào file được (thường là trình duyệt điện thoại, Safari, Firefox) thì app là **chế độ xem**, vì nếu cho lưu riêng trong trình duyệt đó sẽ có hai bộ dữ liệu lệch nhau:
  - Nút **Mở tai-san.json để xem**: chọn file từ OneDrive/Google Drive.
  - Gõ giá vào bảng giá để biết ngay tại tiệm lô nào nên chốt, có nên mua thêm không. 🔧 Như máy tính, rời dòng là áp giá đó, nhưng **chỉ tính lại, không lưu**: tính lại mọi phần, kể cả phương án Cần tiền đang mở (bỏ nút "Xem với giá này"). Mọi ghi chép (giá, mua, bán) làm trên máy tính.
  - 🧪 Kiểm tra lệch 15% vẫn chạy ở chế độ xem: gõ thiếu hoặc thừa số thì hỏi lại, bấm Hủy là dòng về giá cũ. Trước đây chế độ xem bỏ kiểm tra này vì không lưu gì; giả lập gõ `16` thay cho `160` ở tiệm thì lô báo **Nên chốt −87,7%**, đúng lúc đang đứng ở tiệm quyết định bán.
- Cách mở `index.html` trên điện thoại do bạn tự lo; app vẫn là một file HTML.

---

## 3. Công thức

Ký hiệu cho một lô đang giữ:

| Ký hiệu | Ý nghĩa |
|---|---|
| `n0` | Số món lúc mua |
| `w` | Trọng lượng mỗi món, đổi ra **đơn vị niêm yết** của loại (chia số dem cho: lượng 10.000 · chỉ 1.000 · phân 100 · ly 10 · dem 1) |
| `T` | Tổng tiền mua lô |
| `n` | Số món còn lại = `n0 − tổng số món đã bán` |
| `P` | Giá **tiệm mua vào** hôm nay (theo đơn vị niêm yết) |
| `Q` | 🆕 Giá **tiệm bán ra** hôm nay (theo đơn vị niêm yết) |
| `d` | Số ngày giữ = hôm nay − ngày mua |
| `r` | Lãi suất ngân hàng (%/năm) · `π` là lạm phát (%/năm) |

### 3.1 Lô đang giữ

```
Vốn mỗi món        = T / n0
Vốn còn lại     V  = n × T / n0
Giá trị hôm nay G  = n × w × P
Lời/lỗ             = G − V
% lời           g  = G / V − 1
% quy ra năm       = (1 + g)^(365 / d) − 1          (chỉ hiện khi d ≥ 90; dưới 3 tháng quy ra năm bị phóng đại)
Nếu gửi ngân hàng  B = V × (1 + r × d / 365)         (lãi đơn, dùng lãi suất hiện tại)
Hơn/thua ngân hàng = G − B
Lãi thực           = (1 + g) / (1 + π)^(d / 365) − 1
Cần tăng để hòa vốn = V / G − 1                      (chỉ khi đang lỗ)
Giá cần để đạt mục tiêu = V × (1 + % kỳ vọng) / (n × w)
Giá cần tăng để đạt  = Giá cần để đạt mục tiêu / P − 1   (dùng cho nhóm Sắp đạt / Giữ)
Giá vốn mỗi đơn vị   = T / (n0 × w)                      🆕 (tách lỗ chênh lệch, mục 3.4)
Giá ứng với mức nhắc = V × (1 + mức nhắc tụt) / (n × w)   🆕 (hiện trong hộp thoại Giữ)
```

🆕 Theo loại vàng:

```
Giá vốn bình quân  = Σ V / Σ (n × w)  cộng các lô đang giữ của loại đó
```

### 3.2 Một lần bán `k` món với giá `S`

```
Tiền thu           = k × w × S
Vốn phần bán       = k × T / n0
Lời/lỗ chốt        = Tiền thu − Vốn phần bán
Nếu gửi ngân hàng  = Vốn phần bán × (1 + r × d / 365)   (d tính tới ngày bán)
```

### 3.3 Số món cho các nút gợi ý

```
Bán hết           k = n
Bán một nửa       k = làm tròn lên (n / 2)
Bán lấy lại vốn   k = làm tròn lên (V / (w × P)), tối đa n
```

### 3.4 Quy tắc phân nhóm

Xét theo thứ tự, gặp điều kiện đúng đầu tiên thì dừng:

```
Nên chốt : g ≥ % kỳ vọng
           🆕 hoặc (lô có mức nhắc tụt và g < mức nhắc tụt)          🔧 trước đây: 0 ≤ g < mức nhắc (bỏ qua lô đã tụt xuống lỗ)
Đang lỗ  : g < 0 và (Q < giá vốn mỗi đơn vị                         (giá đã giảm so với lúc mua; thiếu Q thì coi là lỗ)
                     🔧 hoặc chênh lệch cao)                         (tiệm đang nới chênh lệch bất thường)
Sắp đạt  : g ≥ 0 và Giá cần tăng để đạt ≤ mức báo sắp đạt
Giữ      : còn lại (đang lời mà chưa sắp đạt, 🆕 hoặc lỗ chỉ do chênh lệch mua–bán)
```

🔧 Định nghĩa dùng ở trên:

```
% lời tại một ngày cũ  = giá tiệm mua vào ngày đó / giá vốn mỗi đơn vị − 1        (không phụ thuộc số món còn lại)
Đỉnh lời               = % lời cao nhất từ ngày mua tới nay (theo giá đã nhập), hiện trong dòng nhắc
Chênh lệch cao         : như mục 3.5 (chênh lệch hôm nay > 1,5 × trung vị 90 ngày, 🛠 và > trung vị + 0,5 điểm %; dưới 10 dòng giá thì không xét)
```

🧪 Tiệm hạ giá mua vào, dùng cho dòng Nên chốt, hộp Bán, tab Cần tiền (mục 2.1b, 2.3, 2.4):

```
Pₘ                         = giá mua vào của lần nhập gần nhất trước ngày đang xét mà chênh lệch không cao
Tiệm hạ giá mua vào        : Chênh lệch cao và P < Pₘ                     (không có Pₘ thì không xét)
Mua vào ngày thường        P* = Q / (1 + chênh lệch thường ngày)          (giá tiệm mua vào nếu chênh lệch như mọi khi)
Thiệt do nới chênh lệch       = n × w × (P* − P)                          (hộp Bán: k món đang chọn thay cho n)
Lời nếu chênh lệch thường     = P* / giá vốn mỗi đơn vị − 1               (≥ mức nhắc thì ghi "chưa dưới mức nhắc; không gấp thì đợi")
```

Ví dụ: lô 1 lượng, vốn 130tr; hôm qua P = 170, Q = 172 (chênh lệch bình thường) nên Pₘ = 170tr; hôm nay Q = 170tr, P = 158tr < Pₘ, chênh lệch thường 1,2% → P* = 170 / 1,012 ≈ 168,0tr; thiệt ≈ 168,0 − 158 = 10,0tr; lời nếu chênh lệch thường = 168,0 / 130 − 1 ≈ +29,2%.

Điều kiện `P < Pₘ` để phân biệt hai cách nới chênh lệch: tiệm hạ giá mua vào (bán thiệt) hay nâng giá bán ra (bán không thiệt, P* tính theo Q lúc đó sẽ cao hơn thật).

Mức nhắc luôn được đặt thấp hơn lời lúc đặt (mục 3.6), nên không cần xét "đã từng chạm mức nhắc chưa".

🔧 So sánh % lời với mục tiêu và mức nhắc **bỏ qua sai số tính toán** của máy (lệch dưới 0,0001 điểm %). Ví dụ lô vốn 100tr, giá 115tr: máy tính ra 14,999…%, trước đây không vào Nên chốt.

Mọi con số "cần tăng" trong app (sắp đạt, giữ, hòa vốn, mua hôm nay) đều là **% giá tiệm mua vào cần tăng**, nên so sánh trực tiếp với nhau được.

### 3.5 Gợi ý mua thêm 🆕

Cho một loại vàng. `Q`, `P` là giá tiệm bán ra, mua vào của ngày đang xét (giá vừa gõ cũng tính). **Cửa sổ** là 90 ngày tính tới ngày đó, chỉ lấy các dòng giá có giá bán ra. `X` là "Mua thêm khi giá giảm từ đỉnh" trong Tham số.

```
Đỉnh 90 ngày           = giá tiệm bán ra cao nhất trong cửa sổ
Mốc đỉnh               = Đỉnh 90 ngày × (1 − X)
Mốc rải                = đơn giá lần mua gần nhất của loại trong cửa sổ × (1 − X)   (chưa mua trong cửa sổ thì bỏ; 🔧 chỉ xét lô còn đang giữ)
Giá vào vùng mua       = min(Mốc đỉnh, Mốc rải)
🔧 Mốc mua lại          = giá muốn mua lại cao nhất trong các lần bán loại này đang chờ (chưa bỏ nhắc; 🧪 chưa tự tắt vì đã mua lại, mục 2.1c)
🔧 Mốc gần nhất          = max(Giá vào vùng mua, Mốc mua lại)                     (dùng cho dòng "mua khi bán ra ≤ …")
🔧 Có lô nên chốt        : loại này có lô đang ở nhóm Nên chốt (mục 3.4)
🔧 Món quen              = trọng lượng mỗi món của lô gần nhất cùng loại (chưa có lô thì 1 đơn vị niêm yết)
Còn cách               = 1 − Giá vào vùng mua / Q                  (giá tiệm bán ra cần giảm bấy nhiêu % nữa)
Chênh lệch hôm nay     = Q / P − 1
Chênh lệch thường ngày = trung vị của (bán ra / mua vào − 1) các dòng giá trong cửa sổ
Chênh lệch cao         : Chênh lệch hôm nay > max(1,5 × Chênh lệch thường ngày, Chênh lệch thường ngày + 0,5 điểm %)   (🛠 thêm sàn 0,5 điểm; cửa sổ dưới 10 dòng giá thì bỏ kiểm tra này)
Còn trong hạn mức      = Hạn mức − Σ V                              (mọi lô đang giữ, mọi loại)
Quy ra vàng            = Còn trong hạn mức / Q, đổi ra trọng lượng, làm tròn xuống tới chỉ
🔧 Đủ hạn mức            : Còn trong hạn mức ≤ 0, hoặc Còn trong hạn mức < Món quen × Q
```

Đơn giá lần mua = `T / (n0 × w)` của lô có ngày mua gần nhất. Lô mua từ nút **Mua lại…** cũng tính là một lần mua. Mốc rải chỉ xét lần mua trong cửa sổ, để một lần mua giá thấp từ lâu không chặn mua mãi khi giá đã lên mặt bằng mới.

Thứ tự xét kết quả: nhập giá hôm nay → Đủ hạn mức → Đợi, chênh lệch cao → 🔧 Cân nhắc (`Có lô nên chốt` và `Q ≤ Mốc gần nhất`) → 🔧 Mua lại (`Q ≤ Mốc mua lại`) → Vùng mua (`Q ≤ Giá vào vùng mua`) → Chưa tới.

🔧 Mốc rải bỏ qua lô đã bán hết: đã chốt hết lô mua 10/10 giá 157,5tr thì lần mua sau không còn bị đòi rẻ hơn lô đó thêm X%. Lô còn món (kể cả đã bán bớt) vẫn tính.

### 3.6 Kiểm tra chống nhập sai

| Chỗ nhập | Kiểm tra |
|---|---|
| Mọi ô ngày | Không được sau hôm nay; ngày bán không trước ngày mua; ngày mua không sau các lần bán |
| Giá hôm nay | Lệch > 15% so với lần trước → hỏi lại; giá bán ra < giá mua vào → báo lỗi |
| 🧪 Giá đầu tiên của một loại (chưa có giá cũ) | Lệch > 15% so với đơn giá lô gần nhất của loại đó → hỏi lại; loại chưa có lô thì không có gì để so |
| 🧪 Giá gõ ở chế độ xem | Kiểm tra như trên máy tính (lệch 15%, bán ra < mua vào); chỉ khác là không lưu |
| 🧪 Lưu giá (rời dòng, Không đổi, Tất cả không đổi) khi đã sang ngày mới mà ô Ngày còn là hôm nay cũ (tab mở qua đêm) | Lưu cho hôm nay mới, vẽ lại bảng giá, báo một dòng (mục 2.1a) |
| 🧪 Số tiền `1.000`–`999.999` không kèm đơn vị | Hiểu là nghìn đồng, rời ô viết đầy đủ; thêm `đ` để giữ đúng như gõ; app điền sẵn số dưới 1 triệu thì kèm `đ` (mục 1) |
| Đơn giá lô mới (mua từ ngày có giá trở đi) | Lệch > 15% so với giá tiệm bán ra → hỏi lại |
| Giá bán | Lệch > 15% so với giá tiệm mua vào gần nhất → hỏi lại |
| % kỳ vọng | Phải > 0; mức báo sắp đạt không âm |
| 🆕 Giữ, nâng mục tiêu / Giữ tiếp | Mục tiêu mới > mức lời hiện tại; mức nhắc tụt để trống được, nếu nhập thì 🔧 > 0 và < mức lời hiện tại |
| 🔧 Mức nhắc ở form Thêm / Sửa lô | Để trống được; nếu nhập thì > 0 và < lời hiện tại (như hộp Giữ); lô chưa có giá thì chưa đặt được. 🧪 Form Thêm lô chỉ hiện ô này khi lô đang lời (mục 2.2) |
| 🔧 Lưu lô mới vượt hạn mức | Hỏi lại, ghi rõ vốn sẽ lên bao nhiêu. 🛠 Sửa lô làm vốn đang giữ tăng lên mà vượt hạn mức cũng hỏi |
| 🔧 Ô Ngày ở bảng giá trống hoặc chưa hợp lệ | Gợi ý tạm tính theo hôm nay; rời dòng giá thì báo "Chưa nhập ngày", chưa lưu |
| 🔧 Giá hỏi lại khi rời dòng (lệch 15%) mà bấm Hủy | Dòng trở về giá điền sẵn, không lưu |
| 🆕 Tham số mua thêm | % giảm từ đỉnh phải > 0; hạn mức để trống hoặc > 0 |
| 🔬 Tham số chung | % kỳ vọng mặc định > 0; mức báo sắp đạt ≥ 0; lãi suất, lạm phát ≥ 0. Sai thì báo và ô trở về giá trị cũ (bảng quy tắc `PARAM_RULES`, một chỗ) |
| Sửa lô đã có lần bán | Không đổi sang loại vàng có đơn vị niêm yết khác (giá các lần bán đã tính theo đơn vị cũ) |
| Ghi file lỗi | Báo một lần bằng hộp thoại; dữ liệu vẫn còn trong trình duyệt |
| 🔧 Ghi bộ nhớ trình duyệt lỗi (đầy) | Báo một lần; xóa mốc đồng bộ để lần mở sau dùng dữ liệu trong file (mục 0). 🧪 Chưa kết nối file: lần ghi lỗi không tính là đã lưu, dữ liệu đang mở giữ nguyên, không báo nhầm "sửa ở nơi khác" |
| 🔧 File bị sửa ở nơi khác lúc sắp ghi | Không ghi đè; nạp file, tải bản trình duyệt về, báo làm lại thao tác (mục 0) |
| 🧪 Mở file hỏng hoặc rỗng (kể cả lúc khởi động) | Không tự ghi gì vào file; màn chờ chỉ cách lấy lại: lịch sử phiên bản, Khôi phục từ bản sao lưu…, Dùng bản trong trình duyệt; ghi đè file hỏng thì tải nội dung cũ về trước (mục 0) |
| 🧪 Tạo file mới… | Không gợi ý tên trùng file đang dùng; chọn trúng chính file đang dùng ở màn chờ thì xử lý như file rỗng (mục 0) |
| 🧪 Mở file khác… chọn file `sao-luu-vang-…` / `ban-trinh-duyet-…` khi đã có file dữ liệu | Hỏi khôi phục nội dung vào `tai-san.json`; Hủy thì không làm gì (mục 0) |

Lô mới chỉ tự điền đơn giá khi ngày mua không cũ hơn ngày của giá mới nhất, để nhập lô cũ không lấy nhầm giá hôm nay.

### 3.7 Lưu ý về độ chính xác

- So với ngân hàng dùng **lãi đơn** và **lãi suất hiện tại cho toàn bộ thời gian giữ**, nên chỉ mang tính tham khảo với lô giữ lâu. 
- Tiền tính ra được làm tròn đến đồng khi hiển thị; bên trong giữ nguyên để cộng dồn không lệch.

---

## 4. Cấu trúc dữ liệu (`tai-san.json`)

```json
{
  "phien_ban": 1,
  "tham_so": {
    "lai_suat_ngan_hang": 5.5,
    "lam_phat": 3.5,
    "vang_ky_vong_mac_dinh": 15,
    "vang_sap_dat_mac_dinh": 2,
    "vang_mua_giam_pct": 5,
    "vang_han_muc_von": null
  },
  "vang": {
    "loai": [
      { "id": "sjc", "ten": "SJC miếng", "don_vi_niem_yet": "luong" }
    ],
    "gia": [
      { "ngay": "2026-10-11", "loai_id": "sjc", "mua_vao": 118000000, "ban_ra": 120000000 }
    ],
    "lo": [
      {
        "id": "V-2026-001",
        "loai_id": "sjc",
        "ngay_mua": "2026-01-15",
        "so_mon": 2,
        "trong_luong_mon_dem": 10000,
        "tong_tien_mua": 180000000,
        "ky_vong_pct": 15,
        "sap_dat_pct": 2,
        "nhac_tut_pct": null,
        "ghi_chu": ""
      }
    ],
    "ban": [
      {
        "id": "B-0001",
        "lo_id": "V-2026-001",
        "ngay": "2026-10-11",
        "so_mon": 1,
        "gia_ban": 118000000,
        "gia_mua_lai": 110000000,
        "ghi_chu": ""
      }
    ],
    "so_thu_tu": { "lo": { "2026": 1 }, "ban": 1 }
  },
  "tiet_kiem": [],
  "cctg": [],
  "dat": []
}
```

- Giá luôn lưu **theo đơn vị niêm yết** của loại vàng.
- Số món còn lại, trạng thái lô (đang giữ/đã đóng) **không lưu**, luôn tính lại từ `lo` và `ban`, để không bao giờ lệch nhau.
- 🆕 `nhac_tut_pct`: nhắc chốt khi lời tụt về mức này (%), `null` = không nhắc. File cũ chưa có trường này thì coi như `null`, không cần nâng `phien_ban`.
- 🔧 Bản 🔧 không thêm trường dữ liệu nào; file bản 🆕 dùng nguyên được.
- 🧪 Bản 🧪 cũng không thêm trường dữ liệu nào. Nhắc mua lại tự tắt (mục 2.1c) dùng lại trường `gia_mua_lai` như nút Bỏ nhắc (đặt về `null`).
- 🆕 `vang_mua_giam_pct`: % giảm từ đỉnh 90 ngày để vào vùng mua. `vang_han_muc_von`: hạn mức vốn cho vàng (đồng), `null` = không giới hạn. File cũ thiếu thì lấy mặc định (5 và `null`).
- `phien_ban` dùng để tự nâng cấp file khi app thêm tính năng.
- `tiet_kiem`, `cctg`, `dat` để trống, không dùng.

---

## 5. Đã cân nhắc và không làm

| Ý tưởng | Lý do không làm |
|---|---|
| Tiết kiệm, CCTG, Đất | App ngân hàng đã theo dõi; làm thêm là nhập hai lần |
| Phân tích vòng bán rồi mua lại | Thêm số liệu phải đọc; mua lại đã có nút Thêm lô và nhắc mua lại |
| Chốt lời theo nhiều bậc | Phải cài nhiều mốc mỗi lô; nút Lấy lại vốn / Bán một nửa đã đủ. 🆕 Mức nhắc tụt chỉ là một mức, đặt lúc bấm Giữ, không phải cài trước |
| 🆕 Dự báo giá, chỉ báo kỹ thuật (đường trung bình, RSI…) | App không đoán giá. Quy tắc mua rải khi giảm từ đỉnh đọc là hiểu, tự kiểm lại được bằng biểu đồ |
| 🆕 Kế hoạch tích lũy đều hằng tháng | Thêm tham số và phải theo dõi theo tháng; muốn mua đều thì cứ mua, hạn mức vốn đã chặn mua quá tay |
| 🆕 Gợi ý mua bao nhiêu | Tùy tiền có trong tay từng lúc; app chỉ ghi còn bao nhiêu trong hạn mức |
| Nhắc sao lưu | File đã nằm trong OneDrive/Drive; dòng trạng thái đã nhắc khi chưa chọn file |
| Tự lấy giá từ internet | Dễ hỏng, bị chặn khi mở file trên máy; nhập 2 ô giá chỉ mất vài giây |
| 🔧 Tự gộp thay đổi từ 2 nơi (2 tab, 2 máy) | Dễ gộp sai số món, số lần bán. App dùng dữ liệu trong file, tải bản còn lại về để bạn tự khôi phục nếu cần |
| 🔧 Khóa, chỉ cho một tab dùng | Phiền khi lỡ mở 2 tab; kiểm tra "nơi lưu có bị sửa ở nơi khác không" lúc quay lại tab và trước khi lưu đã đủ an toàn |
| 🔧 Báo qua lại giữa các tab để tự nạp lại tức thì | Thêm một cơ chế chỉ cho trường hợp cùng trình duyệt; phép kiểm tra lúc quay lại tab đã phủ, lại phủ luôn nhiều máy |
| 🔧 Lưu giá theo từng phím gõ | Sẽ lưu cả số đang gõ dở và hỏi lại liên tục; lưu khi rời dòng là đủ |
| 🔧 Đặt trước mức nhắc cao hơn lời hiện tại ("lên 20% rồi tụt về 15% thì nhắc") | Phải nhớ thêm trạng thái "đã chạm mức chưa" cho từng lô; luồng chính là bấm Giữ khi đã đạt mục tiêu, lúc đó lời luôn cao hơn mức nhắc |
| 🧪 Đọc trước file cũ rồi mới mở hộp Lưu, để Chrome có xóa trắng thì vẫn còn bản | Phải xin quyền đọc file thêm một lần trước hộp Lưu; không gợi ý tên trùng và ẩn Tạo file mới… ở màn chờ đã chặn được trường hợp hay gặp |
| 🧪 Lô tụt chỉ vì tiệm nới chênh lệch thì không đưa vào Nên chốt | Dễ bỏ sót lần giảm giá thật xảy ra cùng lúc tiệm nới chênh lệch. Vẫn nhắc theo quy tắc bạn đặt, ghi rõ thiệt bao nhiêu để bạn quyết |
| 🧪 Hỏi "lần mua này có phải mua lại cho B-0001?" mỗi khi thêm lô | Thêm một câu hỏi mỗi lần mua; tự tắt kèm nút Giữ lại nhắc là đủ, ít khi cần giữ |
| 🧪 Hiểu số theo đơn vị niêm yết của từng loại (loại theo ly, dem thì giữ số như gõ) | Mỗi ô tiền phải biết loại vàng đang chọn, dễ sai khi đổi loại trong form; loại niêm yết theo ly, dem hầu như không gặp, gõ kèm `đ` là đủ |
| 🧪 Ước "giá mua vào ngày thường" theo giá bán ra cả khi tiệm nâng giá bán ra | Lúc đó giá mua vào không giảm, bán không thiệt; ghi "thiệt 10tr" sẽ sai và khuyên đợi nhầm. Chỉ ghi khi giá mua vào thấp hơn lần nhập có chênh lệch bình thường (mục 3.4) |

Trước đây mục này có "Biểu đồ giá" và "Giá vốn trung bình, nhắc mua thêm". 🆕 Nay đã làm: biểu đồ 90 ngày và gợi ý mua thêm (2.1e), giá vốn bình quân (2.5).

## 6. Các quyết định đã chốt

1. **Lưu vào file `tai-san.json`**: đồng ý. Lần đầu bấm **Tạo file mới…**; những lần sau app nhớ file và chỉ cần bấm **Mở lại tai-san.json** một lần.
2. **"Bán một nửa" khi số món lẻ**: làm tròn **lên** (5 món → bán 3). Lý do: lô chỉ còn 1 món thì làm tròn xuống sẽ thành bán 0 món.
3. **Không cần loại trừ lô** ở tab Cần tiền.
4. **Phương án Cần tiền**: sau khi chọn lô theo thứ tự ưu tiên, app **bỏ bớt món thừa**: món nào bỏ đi mà vẫn đủ tiền thì không bán.

## 7. Dung lượng file JSON về lâu dài

| Loại dữ liệu | Ước tính 20 năm | Dung lượng |
|---|---|---|
| Lô vàng | ~1.000 lô | ~0,3 MB |
| Lần bán | ~2.000 lần | ~0,4 MB |
| Giá (3 loại, nhập mỗi ngày) | ~22.000 dòng | ~2 MB |
| **Tổng** | | **~3 MB** |

File vài MB trình duyệt đọc và ghi trong chưa tới 0,1 giây. JSON chỉ thành vấn đề khi lên hàng trăm MB, tức là gấp hàng trăm lần mức trên. Nếu một ngày nào đó lịch sử giá quá dài, có thể chuyển phần giá cũ sang file lưu trữ riêng mà không phải đổi app.
