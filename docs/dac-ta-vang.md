# Đặc tả: App quản lý vàng

> Trạng thái: **đã làm (`index.html`)**, gồm các mục 🆕 sửa sau buổi dùng thử (ticket #2–#11). Các mục 🔧 là sửa sau buổi review, **chờ duyệt, chưa làm code** · Ngày: 2026-10-11

## Sửa sau buổi review 🔧

Review lại code bản 🆕 và giả lập 15 tình huống dùng thật: lần đầu dùng, nhập giá hằng ngày, bán, giữ, mua thêm, cần tiền, nhập bù giá, mở 2 tab, điện thoại, dữ liệu 20 năm. Kết quả chia ba nhóm.

**A. Lỗi**

| # | Lỗi | Cách sửa | Mục |
|---|---|---|---|
| A1 | Mở app ở 2 tab, hoặc để tab cũ mở trên máy khác: tab cũ ghi đè file, mất lần bán ghi ở tab/máy kia, không báo gì | Tab khác vừa lưu thì tab này tự nạp lại; khi quay lại tab và trước mỗi lần ghi file, kiểm tra file có bị sửa ở nơi khác không | 0 |
| A2 | Nhấn Enter trong hộp Thêm lô / Bán thì hộp đóng mà không lưu | Enter = nút chính (Lưu, Xác nhận bán), Esc = Hủy | 2 |
| A3 | Giá gõ dở (chưa bấm Cập nhật) bị mất khi Bán… hay Mua… rồi lưu; hộp Bán điền giá cũ; lô vừa mua bị tính theo giá hôm qua | Giá gõ dở được giữ qua mọi thao tác; bấm Bán… / Giữ… / Mua… / + Thêm lô khi đang có giá gõ dở thì app lưu giá trước | 2.1a |
| A4 | File dữ liệu hỏng (JSON lỗi) → trang trắng, không còn nút nào | Mở file lỗi thì quay về màn chờ, báo lý do, có Mở file khác… | 0 |
| A5 | Bộ nhớ trình duyệt đầy mà file vẫn ghi được → mốc đồng bộ sai → lần mở sau bản cũ trong trình duyệt ghi đè file | Mốc chỉ cập nhật khi cả bộ nhớ trình duyệt lẫn file đều lưu được; bộ nhớ lỗi thì xóa mốc để file thắng | 0 |
| A6 | Form Sửa lô cho đặt mức nhắc cao hơn mức lời → lô +2,7% bị báo "lời tụt dưới mức nhắc 10%" dù chưa từng lên 10%; mức 0% không bao giờ nhắc | Mức nhắc chỉ bắt đầu chạy sau khi lời đã từng chạm mức đó; mức nhắc phải > 0 | 2.1b, 3.4 |
| A7 | Lô lời đúng +15,0% không vào Nên chốt (máy tính ra 14,999…%) | So sánh bỏ qua sai số tính toán | 3.4 |
| A8 | Xóa ô Ngày lúc đang gõ giá → lỗi, cột Mua thêm? ngừng cập nhật | Ô Ngày trống thì gợi ý tạm tính theo hôm nay | 2.1a |
| A9 | Màn chờ: "Tạo file mới…" mà chọn trùng `tai-san.json` cũ → ghi đè file bằng bản cũ trong trình duyệt | Chọn trúng file đã có dữ liệu thì coi như mở file đó, đối chiếu, không ghi đè | 0 |
| A10 | Chế độ xem: "Xem với giá này" không tính lại phương án Cần tiền đang mở | Tính lại cả phương án | 2.8 |

**B. Gợi ý chưa thông minh**

| # | Vấn đề | Cách sửa | Mục |
|---|---|---|---|
| B1 | Cùng loại SJC vừa Nên chốt (lô cũ +22,5%) vừa 🟢 Vùng mua; làm theo cả hai là bán rồi mua lại, mất chênh lệch 2 lần | Kết quả mới 🟡 **Cân nhắc**: "đang có lô nên chốt cùng loại" | 2.1e, 3.5 |
| B2 | Thẻ 🔁 Có thể mua lại hiện, mà cột Mua thêm? cùng loại ghi ⚪ Chưa tới | Mua thêm? xét luôn giá muốn mua lại bạn đặt khi bán: chạm thì 🟢 **Mua lại** | 2.1e, 3.5 |
| B3 | Tiệm nới chênh lệch (hạ mua vào, giữ bán ra): lô lỗ −4,8% vẫn bị coi là "lỗ chênh lệch", nằm trong nhóm Giữ thu gọn, trong khi cột Mua thêm? cùng lúc báo chênh lệch cao bất thường | Chỉ coi là lỗ chênh lệch khi chênh lệch hôm nay bình thường | 2.1b, 3.4 |
| B4 | Hạn mức: 🟢 "còn 47tr ≈ 3 chỉ" dù quen mua miếng 1 lượng 149,5tr; mua vượt hạn mức (852tr / 600tr) không cảnh báo | 🟢 chỉ khi còn đủ tiền cho 1 món quen; lưu lô vượt hạn mức thì hỏi lại; dòng tổng hiện vốn / hạn mức | 2.1d, 2.1e, 2.2 |
| B5 | Nhắc tụt không biết giá lên hay xuống: rơi xuống lỗ rồi hồi lên +20% vẫn ghi "lời tụt về +20%"; rơi thẳng từ +30% xuống dưới 0 thì bỏ qua nhắc | Dòng nhắc ghi rõ đỉnh lời đã đạt; vẫn nhắc khi đã tụt xuống lỗ | 2.1b, 3.4 |
| B6 | Mấy ngày đầu, ô Mua thêm? không cho biết dữ liệu còn ít (mới 1 ngày giá đã ghi "còn cách 5%") | Ghi "(mới có N ngày giá)" ngay trong ô | 2.1e |
| B7 | Mốc rải tính cả lô đã bán hết | Chỉ xét lô còn đang giữ | 3.5 |

**C. Luồng chưa hiệu quả**

| # | Vấn đề | Cách sửa | Mục |
|---|---|---|---|
| C1 | Nhập bù giá nhiều ngày: sau mỗi lần Cập nhật ô Ngày nhảy về hôm nay; ô giá điền giá mới nhất chứ không phải giá trước ngày đó; loại có giá trùng bị bỏ qua mà ô Không đổi không hiện cho ngày cũ | Ô Ngày giữ ngày vừa nhập (kèm dòng vàng, nút Về hôm nay); ô giá điền theo ngày đang chọn; ô Không đổi hiện cả cho ngày cũ | 2.1a |
| C2 | Cột Mua thêm? tính theo giá vừa gõ, còn nhóm lô vẫn theo giá đã lưu: một màn hình, hai giá | Đang gõ giá thì nhóm lô và dòng tổng cũng tính lại theo giá vừa gõ, ghi rõ "chưa lưu" | 2.1a, 2.1b |
| C3 | Dữ liệu 20 năm: mỗi lần vẽ lại mất ~180 ms, phần lớn để vẽ các dòng trong nhóm đang thu gọn | Nhóm thu gọn chỉ vẽ khi bấm mở | 2.1b |

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

- **Một file `index.html` duy nhất**, mở bằng Chrome/Edge trên máy tính là chạy. Không build, không cài đặt, không server.
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

🆕 **Mở lại file mỗi lần dùng.** App nhớ file đã chọn, nhưng mỗi lần mở, trình duyệt thường hỏi lại quyền. Trong lúc chưa mở được file, app **không hiện số liệu**, chỉ hiện nút lớn **Mở lại tai-san.json** (kèm Mở file khác… / Tạo file mới…). Lý do: bản trong trình duyệt có thể cũ hơn file (vừa sửa trên máy khác); xem số cũ dễ quyết định sai, sửa trên số cũ thì dễ ghi đè.

🆕 **Đối chiếu khi mở file.** Trình duyệt nhớ thời điểm lần cuối đọc hoặc ghi file thành công (mốc đồng bộ, lưu trong trình duyệt, không nằm trong file). Khi mở file, app tự xử lý, **không hỏi OK/Hủy**:

| Bản trong trình duyệt | File | App làm gì |
|---|---|---|
| Không có thay đổi sau mốc đồng bộ | (bất kỳ) | Dùng dữ liệu trong file |
| Có thay đổi chưa ghi vào file (ví dụ lần trước ghi file bị lỗi) | Không đổi kể từ mốc đồng bộ | Ghi bản trình duyệt vào file |
| Có thay đổi chưa ghi vào file | Cũng đã đổi (sửa ở máy khác) | Dùng dữ liệu trong file; bản trình duyệt tự tải về thành `ban-trinh-duyet-<ngày>-<giờ>.json` và báo một dòng. Cần lấy lại thì dùng **Khôi phục từ bản sao lưu** |

Bỏ hộp hỏi cũ "Dữ liệu trong trình duyệt MỚI HƠN… OK = ghi đè vào file": bấm OK theo phản xạ là mất các thay đổi ở máy kia.

🔧 **Nhiều tab, nhiều máy.** Đối chiếu lúc mở file chưa đủ: một tab (hay một máy) để mở từ trước vẫn giữ bản cũ, ghi vào là đè mất thay đổi ở nơi khác. Thêm ba chốt:

- **Cùng trình duyệt, nhiều tab**: tab nào vừa lưu thì các tab khác của app **tự nạp lại** dữ liệu mới, báo một dòng "Dữ liệu vừa được cập nhật ở tab khác". Hộp thoại đang mở ở tab kia thì đóng lại (kèm báo), vì nó dựa trên dữ liệu cũ.
- **Quay lại tab** sau khi rời đi (chuyển cửa sổ, mở máy lên lại): app xem file có bị sửa ở nơi khác kể từ mốc đồng bộ không; có thì nạp lại file trước khi bạn thao tác, đối chiếu như bảng trên.
- **Trước mỗi lần ghi file**: kiểm tra như trên. File đã bị sửa ở nơi khác thì **không ghi đè**: app dùng dữ liệu trong file, tải bản trình duyệt về như dòng cuối bảng trên, và báo "Thay đổi vừa rồi chưa được lưu vì file đã được sửa ở nơi khác. App đã nạp dữ liệu mới, hãy làm lại thao tác."

🔧 **Mốc đồng bộ chỉ cập nhật khi lưu trọn vẹn**: cả bản trong trình duyệt lẫn file đều ghi thành công. Bộ nhớ trình duyệt đầy (ghi lỗi) thì app xóa mốc, để lần mở sau dùng dữ liệu trong file, và báo một lần "Bộ nhớ trình duyệt đầy; dữ liệu vẫn được lưu vào file."

🔧 **Mở file lỗi không bao giờ để trang trắng**: file không đọc được, không phải JSON, hoặc không đúng dữ liệu của app thì quay về màn chờ mở file, báo lý do ngay trên màn chờ, kèm Mở file khác… / Tạo file mới…. Lỗi xảy ra lúc khởi động cũng vậy.

🔧 **Tạo file mới… mà chọn trúng một file đã có dữ liệu** (ví dụ chọn lại đúng `tai-san.json`): app coi như **mở** file đó và đối chiếu như bảng trên, không ghi đè.

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

🔧 **Bàn phím trong hộp thoại**: Enter ở bất kỳ ô nào = bấm nút chính (Lưu, Xác nhận bán, Lưu mục tiêu mới); Esc = Hủy. Trước đây Enter bấm nhầm nút Hủy (nút đứng trước) nên hộp đóng mà không lưu gì.

### 2.1 Tab "Hôm nay" (màn hình chính)

**a) Bảng nhập giá**: mỗi loại vàng một dòng.

| Loại | Đơn vị niêm yết | Tiệm mua vào | Tiệm bán ra | Mua hôm nay cần tăng để hòa vốn | 🆕 Mua thêm? | 🆕 Không đổi |
|---|---|---|---|---|---|---|
| SJC miếng | lượng | `[ ô nhập ]` | `[ ô nhập ]` | +1,6% (= bán ra ÷ mua vào − 1) | ⚪ mua khi bán ra ≤ 149,6tr | ☐ |

- Ngày mặc định là hôm nay, sửa được (để nhập lại giá ngày cũ hoặc nhập bù).
  - 🔧 Đang chọn ngày khác hôm nay thì ô Ngày có nền vàng, kèm dòng "Đang nhập giá cho ngày 09/10 (không phải hôm nay)" và nút **Về hôm nay**.
  - 🔧 Cập nhật xong một ngày cũ, ô Ngày **giữ nguyên** ngày đó (trước đây nhảy về hôm nay), để nhập bù nhiều ngày khỏi chọn lại từ đầu.
  - 🔧 Ô Ngày đang trống hoặc chưa hợp lệ thì cột Mua thêm? và các nhóm lô tạm tính theo hôm nay; bấm Cập nhật thì báo "Chưa nhập ngày".
- Ô giá tự điền sẵn giá lần nhập gần nhất, bạn chỉ sửa chỗ thay đổi. 🔧 Chính xác là: giá **của ngày đang chọn** nếu ngày đó đã có giá; chưa có thì giá gần nhất **trước** ngày đó (chọn ngày cũ để nhập bù thì không bị điền giá mới hơn). Việc xét "giá có thay đổi không" và kiểm tra lệch 15% đều so với giá điền sẵn này. Loại nào giá chưa cập nhật hôm nay thì dòng "giá ngày …" hiện màu vàng.
- Bấm **Cập nhật**: **chỉ lưu những loại có giá thay đổi** 🆕 **hoặc được tick Không đổi**, loại không sửa, không tick vẫn giữ ngày cũ (để không tưởng nhầm giá cũ là giá hôm nay). Không loại nào thay đổi hay được tick thì hỏi có ghi nhận "giá không đổi" cho ngày đó không.
- 🆕 **Không đổi**: dòng nào giá chưa phải của ngày đang chọn thì có ô tick ở cuối dòng (🔧 kể cả khi đang chọn ngày cũ; tick là ghi nhận giá đang điền sẵn cho ngày đó). Xem giá tiệm thấy không đổi thì tick, bấm Cập nhật là dòng đó được ghi nhận cho ngày đang chọn và hết màu vàng. Trước đây phải bấm Cập nhật lần thứ hai mới ghi nhận được, không ai đoán ra.
- 🆕 **Mua thêm?**: gợi ý có nên mua thêm loại này không, tính lại ngay khi gõ giá (chưa cần bấm Cập nhật). Quy tắc ở mục e). Dưới bảng có dòng **Vì sao? · Biểu đồ 90 ngày**, thu gọn mặc định.
- 🔧 **Giá gõ dở được giữ lại**: giá đã gõ mà chưa bấm Cập nhật không mất khi chuyển tab, mở hộp thoại hay làm thao tác khác; chỉ bỏ khi bấm Cập nhật (đã lưu), đổi ô Ngày, hoặc tải lại trang. Dòng có giá gõ dở ghi "chưa lưu".
- 🔧 **Xem trước theo giá vừa gõ**: đang có giá gõ dở thì sau khi ngừng gõ chừng nửa giây, các nhóm lô (mục b) và dòng tổng (mục d) tính lại theo giá vừa gõ; trên các nhóm có dòng "Đang tính theo giá vừa gõ, chưa lưu · **Cập nhật giá**". Trước đây chỉ cột Mua thêm? đổi theo giá vừa gõ, còn nhóm lô vẫn theo giá cũ: một màn hình, hai giá.
- 🔧 **Thao tác khi có giá gõ dở**: bấm **Bán…, Giữ…, Mua…, + Thêm lô** thì app **lưu giá gõ dở trước** (như bấm Cập nhật, cùng các kiểm tra), rồi mới mở hộp thoại. Bạn đang hành động theo giá hôm nay; trước đây lưu lô xong thì giá vừa gõ mất, lô vừa mua bị tính theo giá hôm qua, hộp Bán điền sẵn giá cũ.
- **Giá tiệm bán ra tự theo**: sửa giá mua vào thì giá bán ra tự cộng theo chênh lệch của lần nhập trước; sửa tay giá bán ra thì app không đụng vào nữa.
- **Chống gõ nhầm**: giá mua vào lệch quá 15% so với lần trước (thừa/thiếu số 0, nhầm giá lượng với giá chỉ) thì hỏi lại trước khi lưu.

**b) Gợi ý theo lô**: chia 4 nhóm, mỗi nhóm là một bảng.

| Nhóm | Điều kiện | Hiển thị thêm |
|---|---|---|
| 🟢 **Nên chốt** | `% lời ≥ % kỳ vọng`, 🆕 hoặc **lời tụt dưới mức nhắc** (lô đã giữ, nâng mục tiêu; 🔧 chỉ sau khi lời đã từng chạm mức nhắc, và vẫn nhắc khi nay đã lỗ) | Nút **Bán…** (mở hộp thoại bán, có sẵn nút Bán hết / Lấy lại vốn / Bán một nửa) và **Giữ, nâng mục tiêu**. 🆕 Lô tụt ghi rõ mức nhắc, 🔧 kèm đỉnh lời đã đạt: "lời tụt từ +30,0% (02/09) về +16,7%, dưới mức nhắc 25%"; nút thứ hai là **Giữ tiếp** |
| 🟡 **Sắp đạt** | Chưa đạt, đang lời, và **giá chỉ còn cần tăng ≤ mức báo sắp đạt** | Giá cần tăng bao nhiêu % (lên bao nhiêu) |
| ⚪ **Giữ** | Đang lời mà chưa sắp đạt, 🆕 hoặc **lỗ chỉ do chênh lệch mua–bán** (giá tiệm bán ra hôm nay vẫn ≥ giá vốn của lô, 🔧 và chênh lệch hôm nay không cao bất thường) | Giá cần tăng bao nhiêu % để đạt mục tiêu. 🆕 Lô lỗ chênh lệch ghi thêm "chưa qua chênh lệch mua–bán" |
| 🔴 **Đang lỗ** | `% lời < 0` 🆕 và **giá tiệm bán ra hôm nay < giá vốn của lô** (giá đã giảm so với lúc mua), 🔧 hoặc `% lời < 0` khi **chênh lệch hôm nay cao bất thường** | Lỗ bao nhiêu, giá cần tăng bao nhiêu % để hòa vốn. 🔧 Lỗ vì chênh lệch cao thì ghi thêm "tiệm đang nới chênh lệch: 5,3%, thường 1,6%" |

Cột chung cho mọi lô (giữ gọn, chỉ những gì cần để quyết định): số lô và loại, còn lại (món × trọng lượng), vốn còn lại, giá trị hôm nay, lời/lỗ (đ và %), mục tiêu, **so với gửi ngân hàng**.

Số ngày giữ, % quy ra năm và lãi thực sau lạm phát xem ở **Chi tiết** của lô (tab Lô vàng). Nhóm ⚪ **Giữ** thu gọn mặc định vì không cần làm gì; 🆕 tên nhóm đổi thành "Giữ — chưa đạt mục tiêu" vì có cả lô lỗ chênh lệch. 🔧 Nhóm đang thu gọn (Giữ, Đang chờ giá mua lại) chỉ vẽ bảng khi bấm mở, để dữ liệu nhiều năm vẫn mượt (với dữ liệu 20 năm, mỗi lần vẽ lại đang mất khoảng 180 ms, phần lớn cho các dòng không ai nhìn).

🆕 **Vì sao tách lỗ chênh lệch**: mua xong là lỗ ngay bằng chênh lệch giữa giá tiệm bán ra và mua vào (khoảng 1,5–2,5%). Xếp vào nhóm đỏ thì lô nào mới mua cũng đỏ, nhìn mãi thành quen và bỏ sót lô lỗ thật. Giá tiệm bán ra hôm nay còn ≥ giá vốn nghĩa là mua lại y hệt lô đó hôm nay cũng không rẻ hơn, tức giá chưa giảm; phần lỗ chỉ là chênh lệch, không có gì phải làm. 🔧 Ngoại lệ: tiệm **nới chênh lệch bất thường** (hạ giá mua vào mà giữ giá bán ra, hay gặp lúc thị trường biến động). Khi đó phần lỗ là thật: bán lúc này thiệt hơn hẳn mọi khi. Ví dụ lô mua 157,5tr, tiệm hạ mua vào 155 → 150 nhưng bán ra vẫn 158: lỗ −4,8%, gấp ba chênh lệch thường ngày. Lô như vậy vào Đang lỗ.

**Giữ, nâng mục tiêu**: khi quyết định giữ một lô đã đạt mục tiêu, hộp thoại có 2 ô, dưới mỗi ô app hiện giá tiệm mua vào tương ứng:

| Ô | Mặc định | Ví dụ: lô đang +30%, mục tiêu cũ 15% |
|---|---|---|
| Mục tiêu mới | Mức lời hiện tại làm tròn lên bội số 5%, cao hơn ít nhất 1 điểm (+42,5% → 45%) | 35% |
| 🆕 Nhắc chốt nếu lời tụt về | Mức lời hiện tại làm tròn xuống bội số 5%, thấp hơn ít nhất 1 điểm, không thấp hơn mục tiêu cũ. Để trống = không nhắc | 25% |

Lô chuyển sang nhóm Giữ, không bị nhắc lại mỗi ngày. 🆕 Lô quay lại nhóm **Nên chốt** khi lời đạt mục tiêu mới, **hoặc khi lời tụt dưới mức nhắc**. Lý do: khi dùng thử, lô SJC đang +30% được giữ để chờ 35%, giá rơi còn +16,7% thì lô nằm im trong nhóm Giữ đang thu gọn, 32 triệu lời mất mà app không nhắc gì.

🆕 **Giữ tiếp** (lô đang tụt dưới mức nhắc): cùng hộp thoại; mục tiêu giữ nguyên, mức nhắc mặc định tính lại theo mức lời hiện tại (lúc này được thấp hơn mục tiêu cũ), để trống thì thôi nhắc.

🔧 **Mức nhắc chạy khi nào**:
- Mức nhắc chỉ **bắt đầu chạy** sau khi lời đã từng chạm mức đó kể từ ngày đặt. Lô giữ từ nhóm Nên chốt thì chạy ngay, vì lời lúc đặt đã cao hơn mức nhắc. Đặt mức cao hơn lời hiện tại (ở form Sửa lô) thì app chờ lời lên tới mức đó rồi mới theo dõi tụt.
- Đã chạy thì lời dưới mức nhắc là nhắc, **kể cả khi nay đã lỗ** (giá có thể rơi mạnh giữa hai lần bạn mở app). Nhắc cho tới khi bạn Bán, Giữ tiếp, hoặc bỏ mức nhắc.
- Dòng nhắc ghi **đỉnh lời** đã đạt kể từ ngày đặt (theo giá đã nhập), để khỏi nhầm khi giá đang hồi lên: "lời tụt từ +30,0% (02/09) về +20,0%".

**c) Nhắc mua lại**:
- **🔁 Có thể mua lại**: các lần bán có `giá tiệm bán ra ≤ giá muốn mua lại`. Nút **Mua lại…** mở form thêm lô điền sẵn loại, số món, trọng lượng, mục tiêu của lô cũ và đơn giá hôm nay; lưu xong thì nhắc tự tắt. Nút **Bỏ nhắc**.
- **Đang chờ giá mua lại**: các lần bán chưa tới giá, thu gọn mặc định.

**d) Dòng tổng**: tổng vốn đang giữ, tổng giá trị hôm nay, lời tạm tính, lời đã chốt (từ trước đến nay), tổng lời. 🔧 Có hạn mức vốn thì ô Vốn đang giữ ghi thêm "/ hạn mức 600tr · còn 47tr".

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
| 🟠 **Đợi, chênh lệch cao** | Chênh lệch mua–bán hôm nay > 1,5 lần mức thường ngày | "mua hôm nay cần tăng 3,5% mới hòa vốn, thường 1,6%" |
| 🔧 🟡 **Cân nhắc** | Giá đã vào vùng mua hoặc chạm giá mua lại, nhưng loại này đang có lô ở nhóm Nên chốt | "đang có lô V-2025-001 nên chốt: chốt lô đó, hoặc giữ nó thay cho mua thêm". Không có nút Mua… |
| 🔧 🟢 **Mua lại** | Giá tiệm bán ra ≤ giá muốn mua lại của một lần bán loại này (đang chờ, chưa bỏ nhắc) | "chạm giá bạn đặt khi bán B-0001 (16,0tr)", nút **Mua lại…** như ở thẻ 🔁 |
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
  | 🆕 Nhắc chốt nếu lời tụt về (%) | | Thường đặt qua nút **Giữ, nâng mục tiêu**; để trống = không nhắc. 🔧 Nhập thì phải > 0. Cao hơn lời hiện tại thì dưới ô ghi "sẽ nhắc sau khi lời lên tới mức này rồi tụt xuống" |
  | Ghi chú | | Nơi mua, số seri... |

- **Số lô tự sinh**: `V-<năm mua>-<số thứ tự 3 chữ số>`, ví dụ `V-2026-001`. Số thứ tự đánh theo năm mua, không dùng lại khi xóa, và luôn lớn hơn mọi mã đang có (kể cả khi khôi phục file thiếu bộ đếm).
- **Mặc định để nhập ít nhất**: loại vàng = loại của lô nhập gần nhất; trọng lượng mỗi món = của lô gần nhất cùng loại, 🆕 loại chưa có lô nào (kể cả loại mới tạo ngay trong form) thì là **1 đơn vị niêm yết** của loại (lượng → `1 lượng`, chỉ → `1 chỉ`); đổi loại hoặc đổi đơn vị niêm yết của loại mới thì trọng lượng đổi theo, trừ khi đã sửa tay; đơn giá = giá tiệm bán ra hôm nay. Mua đúng loại quen thì chỉ cần nhập **số món** rồi Lưu.
- 🆕 **Trọng lượng điền sẵn là một khối**: lần đầu gõ vào một ô trọng lượng thì các ô khác đang mang số điền sẵn tự xóa trắng. Ví dụ đang điền sẵn `1 chỉ`, gõ `1` vào ô lượng → `1 lượng`. Cần ghép nhiều đơn vị (trang sức `1 chỉ 2 phân`) thì gõ tiếp vào các ô kia như thường. Áp dụng cho lô mới (Thêm lô, Mua lại…); form Sửa lô giữ cách cũ vì trọng lượng ở đó là số thật đã lưu.
- 🆕 Ngay dưới 5 ô trọng lượng hiện **chữ đậm** `Mỗi món 1 lượng · cả lô 2 lượng`, thay cho dòng chữ xám nhỏ, để thấy ngay app hiểu đúng chưa.
- 🆕 Lý do hai điều trên: khi dùng thử, form lô đầu tiên điền sẵn `1 chỉ` trong khi loại mới niêm yết theo lượng; gõ `1` vào ô lượng thành `1 lượng 1 chỉ`. Với 2 miếng SJC vốn 300 triệu, giá 156 triệu/lượng, app báo lời +14,4% và "sắp đạt, cần tăng 0,5%", trong khi thật chỉ +4%, cần tăng 10,6%. Kiểm tra lệch 15% không bắt được vì loại mới chưa có giá, còn thừa 1 chỉ trên 1 lượng chỉ lệch khoảng 9%.
- Ô ít dùng (mức báo sắp đạt, 🆕 mức nhắc tụt, ghi chú) nằm trong **"Tùy chọn khác"**, thu gọn mặc định.
- 🔧 **Vượt hạn mức**: lưu lô mới mà tổng vốn đang giữ vượt hạn mức thì hỏi lại "Vốn đang giữ sẽ lên 852tr, vượt hạn mức 600tr. Vẫn lưu?".
- Một lần mua có nhiều loại món (ví dụ 1 miếng 1 lượng và 1 miếng 5 chỉ) thì nhập thành **2 lô**.
- Danh sách lô: lọc theo **Đang giữ / Đã đóng / Tất cả** và theo loại vàng.
- **Sửa lô**: sửa được mọi ô. **Xóa lô**: xóa được cả lô đã bán; khi đó các lần bán của lô bị xóa theo (app hỏi rõ số lần bán sẽ mất).
- Bấm vào một lô: xem chi tiết và lịch sử bán của lô đó.

### 2.3 Hộp thoại "Bán"

Mở từ nút bán ở tab Hôm nay, tab Lô vàng hoặc tab Cần tiền.

- Hiện sẵn chỉ 2 ô: **Số món bán** và **Giá bán**. Ngày bán (mặc định hôm nay), giá muốn mua lại, ghi chú nằm trong **"Tùy chọn khác"** (tự mở khi sửa lần bán).
- **Số món bán** (tối đa bằng số món còn lại). Các nút gợi ý điền sẵn: Bán hết · Bán lấy lại vốn · Bán một nửa.
- **Giá bán** (mặc định là giá tiệm mua vào hôm nay, sửa được theo giá thực tế). 🔧 Bảng giá đang có giá gõ dở thì app lưu giá đó trước khi mở hộp Bán (mục 2.1a), nên giá điền sẵn là giá vừa gõ.
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
| Giá hôm nay | Nhập lại ở tab Hôm nay → Cập nhật giá (đè lên giá cùng ngày) |
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
  - Gõ giá vào bảng giá rồi bấm **Xem với giá này** để biết ngay tại tiệm lô nào nên chốt, có nên mua thêm không. Không lưu gì; mọi ghi chép (giá, mua, bán) làm trên máy tính. 🔧 Bấm xong thì tính lại cả các nhóm lô, cột Mua thêm? và phương án Cần tiền đang mở.
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
           🆕 hoặc (mức nhắc tụt đã chạy và g < mức nhắc tụt)        🔧 trước đây: 0 ≤ g < mức nhắc, không cần "đã chạy"
Đang lỗ  : g < 0 và (Q < giá vốn mỗi đơn vị                         (giá đã giảm so với lúc mua; thiếu Q thì coi là lỗ)
                     🔧 hoặc chênh lệch cao)                         (tiệm đang nới chênh lệch bất thường)
Sắp đạt  : g ≥ 0 và Giá cần tăng để đạt ≤ mức báo sắp đạt
Giữ      : còn lại (đang lời mà chưa sắp đạt, 🆕 hoặc lỗ chỉ do chênh lệch mua–bán)
```

🔧 Định nghĩa dùng ở trên:

```
% lời tại một ngày cũ  = giá tiệm mua vào ngày đó / giá vốn mỗi đơn vị − 1        (không phụ thuộc số món còn lại)
Mức nhắc đã chạy       : từ ngày đặt mức nhắc, có ngày % lời ≥ mức nhắc tụt
Đỉnh lời               = % lời cao nhất từ ngày đặt mức nhắc tới nay (theo giá đã nhập), hiện trong dòng nhắc
Chênh lệch cao         : như mục 3.5 (chênh lệch hôm nay > 1,5 × trung vị 90 ngày; dưới 10 dòng giá thì không xét)
```

🔧 So sánh % lời với mục tiêu và mức nhắc **bỏ qua sai số tính toán** của máy (lệch dưới 0,0001 điểm %). Ví dụ lô vốn 100tr, giá 115tr: máy tính ra 14,999…%, trước đây không vào Nên chốt.

Mọi con số "cần tăng" trong app (sắp đạt, giữ, hòa vốn, mua hôm nay) đều là **% giá tiệm mua vào cần tăng**, nên so sánh trực tiếp với nhau được.

### 3.5 Gợi ý mua thêm 🆕

Cho một loại vàng. `Q`, `P` là giá tiệm bán ra, mua vào của ngày đang xét (giá vừa gõ cũng tính). **Cửa sổ** là 90 ngày tính tới ngày đó, chỉ lấy các dòng giá có giá bán ra. `X` là "Mua thêm khi giá giảm từ đỉnh" trong Tham số.

```
Đỉnh 90 ngày           = giá tiệm bán ra cao nhất trong cửa sổ
Mốc đỉnh               = Đỉnh 90 ngày × (1 − X)
Mốc rải                = đơn giá lần mua gần nhất của loại trong cửa sổ × (1 − X)   (chưa mua trong cửa sổ thì bỏ; 🔧 chỉ xét lô còn đang giữ)
Giá vào vùng mua       = min(Mốc đỉnh, Mốc rải)
🔧 Mốc mua lại          = giá muốn mua lại cao nhất trong các lần bán loại này đang chờ (chưa bỏ nhắc)
🔧 Mốc gần nhất          = max(Giá vào vùng mua, Mốc mua lại)                     (dùng cho dòng "mua khi bán ra ≤ …")
🔧 Có lô nên chốt        : loại này có lô đang ở nhóm Nên chốt (mục 3.4)
🔧 Món quen              = trọng lượng mỗi món của lô gần nhất cùng loại (chưa có lô thì 1 đơn vị niêm yết)
Còn cách               = 1 − Giá vào vùng mua / Q                  (giá tiệm bán ra cần giảm bấy nhiêu % nữa)
Chênh lệch hôm nay     = Q / P − 1
Chênh lệch thường ngày = trung vị của (bán ra / mua vào − 1) các dòng giá trong cửa sổ
Chênh lệch cao         : Chênh lệch hôm nay > 1,5 × Chênh lệch thường ngày   (cửa sổ dưới 10 dòng giá thì bỏ kiểm tra này)
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
| Đơn giá lô mới (mua từ ngày có giá trở đi) | Lệch > 15% so với giá tiệm bán ra → hỏi lại |
| Giá bán | Lệch > 15% so với giá tiệm mua vào gần nhất → hỏi lại |
| % kỳ vọng | Phải > 0; mức báo sắp đạt không âm |
| 🆕 Giữ, nâng mục tiêu / Giữ tiếp | Mục tiêu mới > mức lời hiện tại; mức nhắc tụt để trống được, nếu nhập thì 🔧 > 0 và < mức lời hiện tại |
| 🔧 Mức nhắc ở form Thêm / Sửa lô | Để trống được; nếu nhập thì > 0 (được cao hơn lời hiện tại, xem 2.1b) |
| 🔧 Lưu lô mới vượt hạn mức | Hỏi lại, ghi rõ vốn sẽ lên bao nhiêu |
| 🔧 Ô Ngày ở bảng giá trống hoặc chưa hợp lệ | Gợi ý tạm tính theo hôm nay; bấm Cập nhật thì báo "Chưa nhập ngày" |
| 🆕 Tham số mua thêm | % giảm từ đỉnh phải > 0; hạn mức để trống hoặc > 0 |
| Sửa lô đã có lần bán | Không đổi sang loại vàng có đơn vị niêm yết khác (giá các lần bán đã tính theo đơn vị cũ) |
| Ghi file lỗi | Báo một lần bằng hộp thoại; dữ liệu vẫn còn trong trình duyệt |
| 🔧 Ghi bộ nhớ trình duyệt lỗi (đầy) | Báo một lần; xóa mốc đồng bộ để lần mở sau dùng dữ liệu trong file (mục 0) |
| 🔧 File bị sửa ở nơi khác lúc sắp ghi | Không ghi đè; nạp file, tải bản trình duyệt về, báo làm lại thao tác (mục 0) |

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
        "nhac_tut_tu": null,
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
- 🔧 `nhac_tut_tu`: ngày đặt mức nhắc (ngày bấm Giữ / Giữ tiếp, hoặc ngày sửa mức nhắc ở form lô), dùng để biết mức nhắc đã chạy chưa và tính đỉnh lời. Lô có mức nhắc mà thiếu trường này (file từ bản 🆕) thì coi như mức nhắc đã chạy, đỉnh lời tính từ ngày mua.
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
| 🔧 Khóa, chỉ cho một tab dùng | Phiền khi lỡ mở 2 tab; tự nạp lại khi tab khác lưu đã đủ an toàn |

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
