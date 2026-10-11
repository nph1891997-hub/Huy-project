# Đặc tả: App quản lý vàng

> Trạng thái: **bản đầu tiên đã làm (`index.html`); các mục 🆕 là sửa sau buổi dùng thử, chờ duyệt, chưa làm code** · Ngày: 2026-10-11

## Sửa sau buổi dùng thử 🆕

Dùng thử app với 4 lô (SJC miếng và nhẫn 9999), nhập giá 2 ngày, giữ lô, bán, cần tiền, mở trên điện thoại. Sáu chỗ bị cấn:

| # | Chỗ cấn khi dùng thử | Cách sửa | Mục |
|---|---|---|---|
| 1 | Trọng lượng điền sẵn bị cộng dồn: ô chỉ có sẵn `1`, gõ `1` vào ô lượng thành **1 lượng 1 chỉ** mỗi món. Kiểm tra 15% không bắt được, lời hiện sai cả chục % | Loại chưa có lô thì điền sẵn 1 đơn vị niêm yết; gõ vào một ô thì phần điền sẵn ở các ô khác tự xóa; trọng lượng hiện chữ đậm | 2.2 |
| 2 | Giữ, nâng mục tiêu xong mà giá tụt thì lô lặng lẽ vào nhóm Giữ đang thu gọn, phần lời mất dần không ai nhắc | Thêm mức **nhắc chốt khi lời tụt về**; tụt dưới mức đó thì lô quay lại nhóm Nên chốt | 2.1b, 3.4 |
| 3 | Loại vàng giá không đổi vẫn bị báo "chưa cập nhật hôm nay", kéo theo cảnh báo giá cũ ở hộp Bán và tab Cần tiền | Ô tick **Không đổi** ở từng dòng giá | 2.1a |
| 4 | Lô vừa mua nằm trong nhóm 🔴 Đang lỗ (do chênh lệch mua–bán), nhóm đỏ lúc nào cũng có lô nên dễ quen mắt, bỏ sót lô lỗ thật | Lỗ chỉ do chênh lệch thì vào nhóm Giữ; nhóm Đang lỗ chỉ còn lô mà giá đã giảm so với lúc mua | 2.1b, 3.4 |
| 5 | Chưa mở lại file vẫn xem và sửa được trên bản cũ trong trình duyệt; dùng 2 máy thì dễ bấm OK ghi đè, mất các lần bán ghi ở máy kia | Chưa mở file thì không hiện số liệu; tự đối chiếu bản trình duyệt với file, không hỏi OK/Hủy, bản bị thay thì tự tải về | 0 |
| 6 | Ít thông tin khi định mua thêm; trên điện thoại phải cuộn ngang và không lưu được | Cột **30 ngày qua** ở bảng giá, **giá vốn bình quân** ở Thống kê; màn hình hẹp xếp dạng thẻ, điện thoại là chế độ xem | 2.1a, 2.5, 2.8 |

Điểm 6 đổi lại một phần quyết định cũ ở mục 5 (biểu đồ giá, giá vốn trung bình): chỉ thêm một cột số và một cột trong Thống kê, vẫn không làm biểu đồ.

**Còn phải chốt:** mở app trên điện thoại bằng cách nào. File HTML để trong OneDrive/Google Drive thường chỉ xem trước được trên điện thoại, không chạy app. Cách dễ nhất là đặt `index.html` lên một trang tĩnh (ví dụ GitHub Pages của repo này; repo riêng tư thì GitHub Pages cần tài khoản trả phí). Đó chỉ là trang app, dữ liệu vẫn nằm trong file của bạn, không gửi đi đâu.

## 0. Nguyên tắc chung

- **Một file `index.html` duy nhất**, mở bằng Chrome/Edge trên máy tính là chạy. Không build, không cài đặt, không server.
- **App không đoán giá.** Mọi gợi ý chỉ dựa trên mục tiêu bạn tự đặt và giá bạn tự nhập. Quyết định cuối cùng là của bạn.
- **Chỉ tập trung vào vàng.** Tiết kiệm và chứng chỉ tiền gửi đã có app ngân hàng theo dõi. So sánh với gửi ngân hàng dùng ô lãi suất trong Tham số.
- **Tiêu chí thêm tính năng:** chỉ thêm khi nó giúp luồng dùng hằng ngày (nhập giá → xem lô nên chốt → bán hoặc giữ → thỉnh thoảng mua thêm hoặc cần tiền) và không bắt người dùng nhập hay đọc thêm.

### Lưu dữ liệu

| Cách | Mô tả |
|---|---|
| **Chính** | Dữ liệu tự lưu vào một **file `tai-san.json`** do bạn chọn (có thể đặt trong OneDrive/Google Drive để có bản sao). Chrome/Edge hỗ trợ ghi trực tiếp vào file. |
| **Dự phòng** | Đồng thời lưu một bản trong trình duyệt, phòng khi chưa chọn file. |
| **Sao lưu** | Tab Tham số → thẻ **Dữ liệu**: Tạo file mới, Mở file khác, **Tải bản sao lưu**, **Khôi phục từ bản sao lưu**. |

Chưa từng chọn file thì đầu trang hiện **một dòng nhắc** kèm nút Tạo file dữ liệu / Mở file có sẵn. Đầu trang không đặt nút dữ liệu nào khác để giữ gọn.

🆕 **Mở lại file mỗi lần dùng.** App nhớ file đã chọn, nhưng mỗi lần mở, trình duyệt thường hỏi lại quyền. Trong lúc chưa mở được file, app **không hiện số liệu**, chỉ hiện nút lớn **Mở lại tai-san.json** (kèm Mở file khác… / Tạo file mới…). Lý do: bản trong trình duyệt có thể cũ hơn file (vừa sửa trên máy khác); xem số cũ dễ quyết định sai, sửa trên số cũ thì dễ ghi đè.

🆕 **Đối chiếu khi mở file.** Trình duyệt nhớ thời điểm lần cuối đọc hoặc ghi file thành công (mốc đồng bộ, lưu trong trình duyệt, không nằm trong file). Khi mở file, app tự xử lý, **không hỏi OK/Hủy**:

| Bản trong trình duyệt | File | App làm gì |
|---|---|---|
| Không có thay đổi sau mốc đồng bộ | (bất kỳ) | Dùng dữ liệu trong file |
| Có thay đổi chưa ghi vào file (ví dụ lần trước ghi file bị lỗi) | Không đổi kể từ mốc đồng bộ | Ghi bản trình duyệt vào file |
| Có thay đổi chưa ghi vào file | Cũng đã đổi (sửa ở máy khác) | Dùng dữ liệu trong file; bản trình duyệt tự tải về thành `ban-trinh-duyet-<ngày>-<giờ>.json` và báo một dòng. Cần lấy lại thì dùng **Khôi phục từ bản sao lưu** |

Bỏ hộp hỏi cũ "Dữ liệu trong trình duyệt MỚI HƠN… OK = ghi đè vào file": bấm OK theo phản xạ là mất các thay đổi ở máy kia.

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
- Bấm vào ô số thì nội dung được chọn sẵn, gõ là đè luôn, không phải xóa.

---

## 2. Các màn hình

Thanh tab ở đầu trang: **Hôm nay · Lô vàng · Cần tiền · Lịch sử · Tham số**. Góc phải: trạng thái lưu.

### 2.1 Tab "Hôm nay" (màn hình chính)

**a) Bảng nhập giá**: mỗi loại vàng một dòng.

| Loại | Đơn vị niêm yết | Tiệm mua vào | Tiệm bán ra | Mua hôm nay cần tăng để hòa vốn | 🆕 30 ngày qua | 🆕 Không đổi |
|---|---|---|---|---|---|---|
| SJC miếng | lượng | `[ ô nhập ]` | `[ ô nhập ]` | +1,7% (= bán ra ÷ mua vào − 1) | −2,3% | ☐ |

- Ngày mặc định là hôm nay, sửa được (để nhập lại giá ngày cũ).
- Ô giá tự điền sẵn giá lần nhập gần nhất, bạn chỉ sửa chỗ thay đổi. Loại nào giá chưa cập nhật hôm nay thì dòng "giá ngày …" hiện màu vàng.
- Bấm **Cập nhật**: **chỉ lưu những loại có giá thay đổi** 🆕 **hoặc được tick Không đổi**, loại không sửa, không tick vẫn giữ ngày cũ (để không tưởng nhầm giá cũ là giá hôm nay). Không loại nào thay đổi hay được tick thì hỏi có ghi nhận "giá không đổi" cho ngày đó không.
- 🆕 **Không đổi**: dòng nào giá chưa phải của ngày đang chọn thì có ô tick ở cuối dòng. Xem giá tiệm thấy không đổi thì tick, bấm Cập nhật là dòng đó được ghi nhận cho ngày đang chọn và hết màu vàng. Trước đây phải bấm Cập nhật lần thứ hai mới ghi nhận được, không ai đoán ra.
- 🆕 **30 ngày qua**: giá tiệm mua vào mới nhất so với 30 ngày trước (công thức ở 3.1). Chưa có giá đủ 30 ngày thì để `—`. Để biết nhanh giá đang ở vùng cao hay thấp khi định mua thêm, không cần biểu đồ.
- **Giá tiệm bán ra tự theo**: sửa giá mua vào thì giá bán ra tự cộng theo chênh lệch của lần nhập trước; sửa tay giá bán ra thì app không đụng vào nữa.
- **Chống gõ nhầm**: giá mua vào lệch quá 15% so với lần trước (thừa/thiếu số 0, nhầm giá lượng với giá chỉ) thì hỏi lại trước khi lưu.

**b) Gợi ý theo lô**: chia 4 nhóm, mỗi nhóm là một bảng.

| Nhóm | Điều kiện | Hiển thị thêm |
|---|---|---|
| 🟢 **Nên chốt** | `% lời ≥ % kỳ vọng`, 🆕 hoặc **lời tụt dưới mức nhắc** (lô đã giữ, nâng mục tiêu) | Nút **Bán…** (mở hộp thoại bán, có sẵn nút Bán hết / Lấy lại vốn / Bán một nửa) và **Giữ, nâng mục tiêu**. 🆕 Lô tụt ghi rõ "lời tụt về +18%, dưới mức nhắc 25%", nút thứ hai là **Giữ tiếp** |
| 🟡 **Sắp đạt** | Chưa đạt, đang lời, và **giá chỉ còn cần tăng ≤ mức báo sắp đạt** | Giá cần tăng bao nhiêu % (lên bao nhiêu) |
| ⚪ **Giữ** | Đang lời mà chưa sắp đạt, 🆕 hoặc **lỗ chỉ do chênh lệch mua–bán** (giá tiệm bán ra hôm nay vẫn ≥ giá vốn của lô) | Giá cần tăng bao nhiêu % để đạt mục tiêu. 🆕 Lô lỗ chênh lệch ghi thêm "chưa qua chênh lệch mua–bán" |
| 🔴 **Đang lỗ** | `% lời < 0` 🆕 và **giá tiệm bán ra hôm nay < giá vốn của lô** (giá đã giảm so với lúc mua) | Lỗ bao nhiêu, giá cần tăng bao nhiêu % để hòa vốn |

Cột chung cho mọi lô (giữ gọn, chỉ những gì cần để quyết định): số lô và loại, còn lại (món × trọng lượng), vốn còn lại, giá trị hôm nay, lời/lỗ (đ và %), mục tiêu, **so với gửi ngân hàng**.

Số ngày giữ, % quy ra năm và lãi thực sau lạm phát xem ở **Chi tiết** của lô (tab Lô vàng). Nhóm ⚪ **Giữ** thu gọn mặc định vì không cần làm gì; 🆕 tên nhóm đổi thành "Giữ — chưa đạt mục tiêu" vì có cả lô lỗ chênh lệch.

🆕 **Vì sao tách lỗ chênh lệch**: mua xong là lỗ ngay bằng chênh lệch giữa giá tiệm bán ra và mua vào (khoảng 1,5–2,5%). Xếp vào nhóm đỏ thì lô nào mới mua cũng đỏ, nhìn mãi thành quen và bỏ sót lô lỗ thật. Giá tiệm bán ra hôm nay còn ≥ giá vốn nghĩa là mua lại y hệt lô đó hôm nay cũng không rẻ hơn, tức giá chưa giảm; phần lỗ chỉ là chênh lệch, không có gì phải làm.

**Giữ, nâng mục tiêu**: khi quyết định giữ một lô đã đạt mục tiêu, hộp thoại có 2 ô, dưới mỗi ô app hiện giá tiệm mua vào tương ứng:

| Ô | Mặc định | Ví dụ: lô đang +30%, mục tiêu cũ 15% |
|---|---|---|
| Mục tiêu mới | Mức lời hiện tại làm tròn lên bội số 5%, cao hơn ít nhất 1 điểm (+42,5% → 45%) | 35% |
| 🆕 Nhắc chốt nếu lời tụt về | Mức lời hiện tại làm tròn xuống bội số 5%, thấp hơn ít nhất 1 điểm, không thấp hơn mục tiêu cũ. Để trống = không nhắc | 25% |

Lô chuyển sang nhóm Giữ, không bị nhắc lại mỗi ngày. 🆕 Lô quay lại nhóm **Nên chốt** khi lời đạt mục tiêu mới, **hoặc khi lời tụt dưới mức nhắc**. Lý do: khi dùng thử, lô SJC đang +30% được giữ để chờ 35%, giá rơi còn +16,7% thì lô nằm im trong nhóm Giữ đang thu gọn, 32 triệu lời mất mà app không nhắc gì.

🆕 **Giữ tiếp** (lô đang tụt dưới mức nhắc): cùng hộp thoại; mục tiêu giữ nguyên, mức nhắc mặc định tính lại theo mức lời hiện tại (lúc này được thấp hơn mục tiêu cũ), để trống thì thôi nhắc.

**c) Nhắc mua lại**:
- **🔁 Có thể mua lại**: các lần bán có `giá tiệm bán ra ≤ giá muốn mua lại`. Nút **Mua lại…** mở form thêm lô điền sẵn loại, số món, trọng lượng, mục tiêu của lô cũ và đơn giá hôm nay; lưu xong thì nhắc tự tắt. Nút **Bỏ nhắc**.
- **Đang chờ giá mua lại**: các lần bán chưa tới giá, thu gọn mặc định.

**d) Dòng tổng**: tổng vốn đang giữ, tổng giá trị hôm nay, lời tạm tính, lời đã chốt (từ trước đến nay), tổng lời.

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
  | 🆕 Nhắc chốt nếu lời tụt về (%) | | Thường đặt qua nút **Giữ, nâng mục tiêu**; để trống = không nhắc |
  | Ghi chú | | Nơi mua, số seri... |

- **Số lô tự sinh**: `V-<năm mua>-<số thứ tự 3 chữ số>`, ví dụ `V-2026-001`. Số thứ tự đánh theo năm mua, không dùng lại khi xóa, và luôn lớn hơn mọi mã đang có (kể cả khi khôi phục file thiếu bộ đếm).
- **Mặc định để nhập ít nhất**: loại vàng = loại của lô nhập gần nhất; trọng lượng mỗi món = của lô gần nhất cùng loại, 🆕 loại chưa có lô nào (kể cả loại mới tạo ngay trong form) thì là **1 đơn vị niêm yết** của loại (lượng → `1 lượng`, chỉ → `1 chỉ`); đổi loại hoặc đổi đơn vị niêm yết của loại mới thì trọng lượng đổi theo, trừ khi đã sửa tay; đơn giá = giá tiệm bán ra hôm nay. Mua đúng loại quen thì chỉ cần nhập **số món** rồi Lưu.
- 🆕 **Trọng lượng điền sẵn là một khối**: lần đầu gõ vào một ô trọng lượng thì các ô khác đang mang số điền sẵn tự xóa trắng. Ví dụ đang điền sẵn `1 chỉ`, gõ `1` vào ô lượng → `1 lượng`. Cần ghép nhiều đơn vị (trang sức `1 chỉ 2 phân`) thì gõ tiếp vào các ô kia như thường.
- 🆕 Ngay dưới 5 ô trọng lượng hiện **chữ đậm** `Mỗi món 1 lượng · cả lô 2 lượng`, thay cho dòng chữ xám nhỏ, để thấy ngay app hiểu đúng chưa.
- 🆕 Lý do hai điều trên: khi dùng thử, form lô đầu tiên điền sẵn `1 chỉ` trong khi loại mới niêm yết theo lượng; gõ `1` vào ô lượng thành `1 lượng 1 chỉ`. Với 2 miếng SJC vốn 300 triệu, giá 156 triệu/lượng, app báo lời +14,4% và "sắp đạt, cần tăng 0,5%", trong khi thật chỉ +4%, cần tăng 10,6%. Kiểm tra lệch 15% không bắt được vì loại mới chưa có giá, còn thừa 1 chỉ trên 1 lượng chỉ lệch khoảng 9%.
- Ô ít dùng (mức báo sắp đạt, 🆕 mức nhắc tụt, ghi chú) nằm trong **"Tùy chọn khác"**, thu gọn mặc định.
- Một lần mua có nhiều loại món (ví dụ 1 miếng 1 lượng và 1 miếng 5 chỉ) thì nhập thành **2 lô**.
- Danh sách lô: lọc theo **Đang giữ / Đã đóng / Tất cả** và theo loại vàng.
- **Sửa lô**: sửa được mọi ô. **Xóa lô**: xóa được cả lô đã bán; khi đó các lần bán của lô bị xóa theo (app hỏi rõ số lần bán sẽ mất).
- Bấm vào một lô: xem chi tiết và lịch sử bán của lô đó.

### 2.3 Hộp thoại "Bán"

Mở từ nút bán ở tab Hôm nay, tab Lô vàng hoặc tab Cần tiền.

- Hiện sẵn chỉ 2 ô: **Số món bán** và **Giá bán**. Ngày bán (mặc định hôm nay), giá muốn mua lại, ghi chú nằm trong **"Tùy chọn khác"** (tự mở khi sửa lần bán).
- **Số món bán** (tối đa bằng số món còn lại). Các nút gợi ý điền sẵn: Bán hết · Bán lấy lại vốn · Bán một nửa.
- **Giá bán** (mặc định là giá tiệm mua vào hôm nay, sửa được theo giá thực tế).
- **Xem trước** trước khi xác nhận: tiền thu về, vốn của phần bán, lời/lỗ chốt, so với gửi ngân hàng, lô còn lại bao nhiêu.

- Dưới ô giá ghi rõ giá đang điền sẵn là **giá ngày nào**; giá cũ thì nhắc kiểm tra giá thực tế.

Lô hết món thì tự chuyển sang **Đã đóng**. Mỗi lần bán **sửa được** (ngày, số món, giá, mua lại, ghi chú; dùng cùng hộp thoại) hoặc **xóa** (số món trả lại cho lô).

### 2.4 Tab "Cần tiền"

Nhập **số tiền cần** → app đưa ra 3 phương án đặt cạnh nhau:

| Phương án | Thứ tự chọn lô |
|---|---|
| **A. Chốt lời tốt nhất** | Lô đã đạt mục tiêu trước, rồi theo % lời **cao → thấp** |
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

> Ghi chú: "lỗ ít nhất" (phương án D ở buổi trao đổi trước) được gộp vào quy tắc 2, vì khi phải bán lỗ thì thứ tự "lỗ % ít nhất trước" chính là cách lỗ ít nhất.

### 2.5 Tab "Lịch sử"

- **Lịch sử bán**: lọc theo năm. Mỗi dòng có nút **Sửa** và **Xóa**. Tổng lời đã chốt theo năm.
- **Lịch sử giá**: hiện 30 dòng gần nhất, có nút xem tất cả. Xóa được từng dòng.
- **Thống kê theo loại vàng**: vốn đang giữ, giá trị, lời tạm tính, lời đã chốt, 🆕 **giá vốn bình quân** (theo đơn vị niêm yết, của phần đang giữ) để so với giá tiệm bán ra khi định mua thêm. Chỉ để xem, không nhắc mua.

### 2.6 Tab "Tham số"

| Tham số | Ví dụ |
|---|---|
| Lãi suất ngân hàng tham chiếu (%/năm) | 5,5 |
| Lạm phát (%/năm) | 3,5 |
| % kỳ vọng mặc định cho lô mới | 15 |
| Báo sắp đạt khi giá còn cần tăng ≤ (%) | 2 |
| Danh sách loại vàng | Tên, đơn vị niêm yết (lượng/chỉ/phân/ly/dem). Đổi tên được; chỉ xóa được loại chưa có lô nào |

---

### 2.7 Sửa, xóa và hoàn tác

| Nhập sai gì | Cách sửa |
|---|---|
| Thông tin lô (ngày, loại, số món, trọng lượng, giá mua, mục tiêu, ghi chú) | Tab Lô vàng → **Sửa** |
| Cả lô (nhập nhầm hẳn) | Tab Lô vàng → **Xóa** (kèm các lần bán của lô) |
| Lần bán (ngày, số món, giá, mua lại, ghi chú) | Tab Lịch sử (hoặc Chi tiết lô) → **Sửa** |
| Bán nhầm | Tab Lịch sử → **Xóa** lần bán, số món trả lại cho lô |
| Giá hôm nay | Nhập lại ở tab Hôm nay → Cập nhật giá (đè lên giá cùng ngày) |
| Giá một ngày cũ | Chọn ngày đó ở ô Ngày rồi nhập lại, hoặc tab Lịch sử → Lịch sử giá → **Xóa** |
| Nâng mục tiêu nhầm, 🆕 đặt mức nhắc tụt nhầm | Tab Lô vàng → Sửa → % kỳ vọng, mức nhắc tụt (trong Tùy chọn khác) |
| Tham số, tên loại vàng | Tab Tham số, sửa trực tiếp |

**Hoàn tác thao tác vừa làm**: sau mỗi thay đổi, đầu trang hiện nút **↶ Hoàn tác: <việc vừa làm>** (hoặc bấm Ctrl+Z khi không đang gõ trong ô). Nhớ tối đa 10 bước gần nhất, áp dụng cho mọi thay đổi kể cả xóa. Danh sách hoàn tác mất khi tải lại trang hoặc mở file dữ liệu khác.

### 2.8 Màn hình hẹp và điện thoại 🆕

Khi dùng thử trên điện thoại, bảng giá phải cuộn ngang mới thấy ô Tiệm bán ra, bảng lô phải cuộn ngang mới thấy lời/lỗ.

- **Không cuộn ngang** trên màn hình từ 360px trở lên.
- **Bảng giá**: mỗi loại một khối, ô Tiệm mua vào và Tiệm bán ra xếp chồng; các cột còn lại thành một dòng chữ nhỏ bên dưới.
- **Bảng lô ở Hôm nay**: mỗi lô một thẻ. Dòng 1: mã lô, loại, **% lời**. Dòng 2: lời/lỗ và giá trị hôm nay. Dòng 3: các nút. Vốn, mục tiêu, so với ngân hàng xem trong Chi tiết.
- **Dữ liệu**: trình duyệt điện thoại (và Safari, Firefox) không ghi thẳng vào file được. Nếu cho lưu riêng trong trình duyệt thì sẽ có hai bộ dữ liệu lệch nhau, nên ở các trình duyệt này app là **chế độ xem**:
  - Nút **Mở tai-san.json để xem**: chọn file từ OneDrive/Google Drive.
  - Gõ giá vào bảng giá rồi bấm **Xem với giá này** để biết lô nào nên chốt ngay tại tiệm. Không lưu gì; mọi ghi chép (giá, mua, bán) làm trên máy tính.
- Cách đưa app lên điện thoại: xem "Còn phải chốt" ở đầu tài liệu.

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
30 ngày qua        = P / P30 − 1      P30 = giá tiệm mua vào của dòng giá mới nhất có ngày ≤ (ngày của giá hiện tại − 30)
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
           🆕 hoặc (lô có mức nhắc tụt và 0 ≤ g < mức nhắc tụt)
Đang lỗ  : g < 0 🆕 và Q < giá vốn mỗi đơn vị      (giá đã giảm so với lúc mua; thiếu Q thì coi là lỗ)
Sắp đạt  : g ≥ 0 và Giá cần tăng để đạt ≤ mức báo sắp đạt
Giữ      : còn lại (đang lời mà chưa sắp đạt, 🆕 hoặc g < 0 nhưng Q ≥ giá vốn mỗi đơn vị: lỗ chỉ do chênh lệch mua–bán)
```

Mọi con số "cần tăng" trong app (sắp đạt, giữ, hòa vốn, mua hôm nay) đều là **% giá tiệm mua vào cần tăng**, nên so sánh trực tiếp với nhau được.

### 3.5 Kiểm tra chống nhập sai

| Chỗ nhập | Kiểm tra |
|---|---|
| Mọi ô ngày | Không được sau hôm nay; ngày bán không trước ngày mua; ngày mua không sau các lần bán |
| Giá hôm nay | Lệch > 15% so với lần trước → hỏi lại; giá bán ra < giá mua vào → báo lỗi |
| Đơn giá lô mới (mua từ ngày có giá trở đi) | Lệch > 15% so với giá tiệm bán ra → hỏi lại |
| Giá bán | Lệch > 15% so với giá tiệm mua vào gần nhất → hỏi lại |
| % kỳ vọng | Phải > 0; mức báo sắp đạt không âm |
| 🆕 Giữ, nâng mục tiêu / Giữ tiếp | Mục tiêu mới > mức lời hiện tại; mức nhắc tụt để trống được, nếu nhập thì ≥ 0 và < mức lời hiện tại |
| Sửa lô đã có lần bán | Không đổi sang loại vàng có đơn vị niêm yết khác (giá các lần bán đã tính theo đơn vị cũ) |
| Ghi file lỗi | Báo một lần bằng hộp thoại; dữ liệu vẫn còn trong trình duyệt |

Lô mới chỉ tự điền đơn giá khi ngày mua không cũ hơn ngày của giá mới nhất, để nhập lô cũ không lấy nhầm giá hôm nay.

### 3.6 Lưu ý về độ chính xác

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
    "vang_sap_dat_mac_dinh": 2
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
- `phien_ban` dùng để tự nâng cấp file khi app thêm tính năng.
- `tiet_kiem`, `cctg`, `dat` để trống, không dùng.

---

## 5. Đã cân nhắc và không làm

| Ý tưởng | Lý do không làm |
|---|---|
| Tiết kiệm, CCTG, Đất | App ngân hàng đã theo dõi; làm thêm là nhập hai lần |
| Phân tích vòng bán rồi mua lại | Thêm số liệu phải đọc; mua lại đã có nút Thêm lô và nhắc mua lại |
| Chốt lời theo nhiều bậc | Phải cài nhiều mốc mỗi lô; nút Lấy lại vốn / Bán một nửa đã đủ. 🆕 Mức nhắc tụt chỉ là một mức, đặt lúc bấm Giữ, không phải cài trước |
| Biểu đồ giá | Xem cho biết, không giúp ra quyết định. 🆕 Thay bằng một cột **30 ngày qua** ở bảng giá |
| Nhắc mua thêm | Trùng với nhắc mua lại. 🆕 Giá vốn bình quân thì có hiện ở Thống kê theo loại (2.5), chỉ để xem |
| Nhắc sao lưu | File đã nằm trong OneDrive/Drive; dòng trạng thái đã nhắc khi chưa chọn file |
| Tự lấy giá từ internet | Dễ hỏng, bị chặn khi mở file trên máy; nhập 2 ô giá chỉ mất vài giây |

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
