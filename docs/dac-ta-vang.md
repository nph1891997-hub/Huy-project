# Đặc tả: App quản lý vàng

> Trạng thái: **đã duyệt, đã làm bản đầu tiên (`index.html`)** · Ngày: 2026-10-11

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

Chưa kết nối file thì đầu trang hiện **một dòng nhắc** kèm nút (Mở lại file / Tạo file dữ liệu). Đầu trang không đặt nút dữ liệu nào khác để giữ gọn.

Lần đầu mở app (chưa có dữ liệu): màn hình **Bắt đầu** hướng dẫn 2 bước: tạo file dữ liệu, rồi thêm lô đầu tiên.

---

## 1. Đơn vị và quy đổi

```
1 lượng = 10 chỉ · 1 chỉ = 10 phân · 1 phân = 10 ly · 1 ly = 10 dem
→ 1 lượng = 10.000 dem · 1 chỉ = 1.000 dem
```

- Trong dữ liệu, **mọi trọng lượng lưu bằng dem** (số nguyên), nên cộng trừ không bị sai số lẻ.
- **Khi nhập**: chọn đơn vị trong danh sách, hoặc nhập kiểu ghép `1 lượng 2 chỉ 5 phân`.
- **Khi hiển thị**: luôn ghi dạng ghép, bỏ các thành phần bằng 0. Ví dụ `12.500 dem` → `1 lượng 2 chỉ 5 phân`.
- **Tiền**: số nguyên đồng, hiển thị có dấu chấm ngăn cách (`118.000.000 đ`).

---

## 2. Các màn hình

Thanh tab ở đầu trang: **Hôm nay · Lô vàng · Cần tiền · Lịch sử · Tham số**. Góc phải: trạng thái lưu.

### 2.1 Tab "Hôm nay" (màn hình chính)

**a) Bảng nhập giá**: mỗi loại vàng một dòng.

| Loại | Đơn vị niêm yết | Tiệm mua vào | Tiệm bán ra | Mua hôm nay cần tăng để hòa vốn |
|---|---|---|---|---|
| SJC miếng | lượng | `[ ô nhập ]` | `[ ô nhập ]` | +1,7% (= bán ra ÷ mua vào − 1) |

- Ngày mặc định là hôm nay, sửa được (để nhập lại giá ngày cũ).
- Ô giá tự điền sẵn giá lần nhập gần nhất, bạn chỉ sửa chỗ thay đổi. Loại nào giá chưa cập nhật hôm nay thì dòng "giá ngày …" hiện màu vàng.
- Bấm **Cập nhật**: **chỉ lưu những loại có giá thay đổi**, loại không sửa vẫn giữ ngày cũ (để không tưởng nhầm giá cũ là giá hôm nay). Không loại nào thay đổi thì hỏi có ghi nhận "giá không đổi" cho ngày đó không.
- **Chống gõ nhầm**: giá mua vào lệch quá 15% so với lần trước (thừa/thiếu số 0, nhầm giá lượng với giá chỉ) thì hỏi lại trước khi lưu.

**b) Gợi ý theo lô**: chia 4 nhóm, mỗi nhóm là một bảng.

| Nhóm | Điều kiện | Hiển thị thêm |
|---|---|---|
| 🟢 **Nên chốt** | `% lời ≥ % kỳ vọng` | Nút **Bán…** (mở hộp thoại bán, có sẵn nút Bán hết / Lấy lại vốn / Bán một nửa) và **Giữ, nâng mục tiêu** |
| 🟡 **Sắp đạt** | `% kỳ vọng − % sắp đạt ≤ % lời < % kỳ vọng` | Còn cách mục tiêu bao nhiêu %, cần giá bao nhiêu |
| ⚪ **Giữ** | `0 ≤ % lời` và chưa sắp đạt | — |
| 🔴 **Đang lỗ** | `% lời < 0` | Lỗ bao nhiêu, giá cần tăng bao nhiêu % để hòa vốn |

Cột chung cho mọi lô (giữ gọn, chỉ những gì cần để quyết định): số lô và loại, còn lại (món × trọng lượng), vốn còn lại, giá trị hôm nay, lời/lỗ (đ và %), mục tiêu, **so với gửi ngân hàng**.

Số ngày giữ, % quy ra năm và lãi thực sau lạm phát xem ở **Chi tiết** của lô (tab Lô vàng). Nhóm ⚪ **Giữ** thu gọn mặc định vì không cần làm gì.

**Giữ, nâng mục tiêu**: khi quyết định giữ một lô đã đạt mục tiêu, nhập mục tiêu mới (mặc định: mức lời hiện tại làm tròn lên bội số 5%, ví dụ +42,5% → 45%; app hiện giá cần đạt). Lô chuyển sang nhóm Giữ, không bị nhắc lại mỗi ngày cho tới khi đạt mức mới.

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
  | % sắp đạt | ✔ | Tự điền mặc định từ Tham số |
  | Ghi chú | | Nơi mua, số seri... |

- **Số lô tự sinh**: `V-<năm mua>-<số thứ tự 3 chữ số>`, ví dụ `V-2026-001`. Số thứ tự đánh theo năm mua và không dùng lại khi xóa.
- Một lần mua có nhiều loại món (ví dụ 1 miếng 1 lượng và 1 miếng 5 chỉ) thì nhập thành **2 lô**.
- Danh sách lô: lọc theo **Đang giữ / Đã đóng / Tất cả** và theo loại vàng.
- **Sửa lô**: sửa được mọi ô. **Xóa lô**: chỉ được xóa khi lô chưa có lần bán nào.
- Bấm vào một lô: xem chi tiết và lịch sử bán của lô đó.

### 2.3 Hộp thoại "Bán"

Mở từ nút bán ở tab Hôm nay, tab Lô vàng hoặc tab Cần tiền.

- Ngày bán (mặc định hôm nay).
- **Số món bán** (tối đa bằng số món còn lại). Các nút gợi ý điền sẵn: Bán hết · Bán lấy lại vốn · Bán một nửa.
- **Giá bán** (mặc định là giá tiệm mua vào hôm nay, sửa được theo giá thực tế).
- Giá muốn mua lại (tùy chọn).
- Ghi chú.
- **Xem trước** trước khi xác nhận: tiền thu về, vốn của phần bán, lời/lỗ chốt, so với gửi ngân hàng, lô còn lại bao nhiêu.

- Dưới ô giá ghi rõ giá đang điền sẵn là **giá ngày nào**; giá cũ thì nhắc kiểm tra giá thực tế.

Lô hết món thì tự chuyển sang **Đã đóng**. Mỗi lần bán **sửa được** (ngày, số món, giá, mua lại, ghi chú; dùng cùng hộp thoại) hoặc **hoàn tác** (xóa lần bán đó).

### 2.4 Tab "Cần tiền"

Nhập **số tiền cần** → app đưa ra 3 phương án đặt cạnh nhau:

| Phương án | Thứ tự chọn lô |
|---|---|
| **A. Chốt lời tốt nhất** | Lô đã đạt mục tiêu trước, rồi theo % lời **cao → thấp** |
| **B. Ít lô nhất** | Ưu tiên **một lô** bán vừa đủ mà dư ít nhất; không có thì lấy lô có giá trị còn lại **lớn → nhỏ** |
| **C. Giữ lô tốt** | Theo % lời **thấp → cao** (chỉ trong các lô đang lời) |

Quy tắc chung cho cả 3 phương án:

1. **Không đụng lô lỗ** nếu các lô lời đã đủ tiền.
2. Thiếu tiền thì **bổ sung từ lô lỗ**, chọn lô **lỗ % ít nhất trước**, và gắn cảnh báo ⚠️.
3. Bán theo **từng món** nên tiền thu có thể **dư** một chút; app ghi rõ số dư.
4. Tổng tất cả các lô vẫn không đủ thì báo: còn thiếu bao nhiêu.

Mỗi phương án hiển thị: danh sách `lô → số món`, tổng tiền thu, **lời/lỗ chốt**, số tiền dư, tổng vàng và tổng vốn còn lại sau khi bán. Nếu có phần lỗ thì hiện thêm: lỗ bao nhiêu, thiệt so với gửi ngân hàng bao nhiêu.

Bạn chọn một phương án, **chỉnh số món nếu muốn**, rồi bấm **Xác nhận bán**. App tạo các lần bán tương ứng (giá = giá tiệm mua vào gần nhất; giá thực tế khác thì sửa lần bán ở tab Lịch sử).

- Phương án nào **giống hệt** phương án trước thì không hiện lại, chỉ ghi một dòng "Phương án C giống A".
- Giá đang dùng **không phải giá hôm nay** thì cảnh báo, nhắc cập nhật giá trước khi bán.

> Ghi chú: "lỗ ít nhất" (phương án D ở buổi trao đổi trước) được gộp vào quy tắc 2, vì khi phải bán lỗ thì thứ tự "lỗ % ít nhất trước" chính là cách lỗ ít nhất.

### 2.5 Tab "Lịch sử"

- **Lịch sử bán**: lọc theo năm. Mỗi dòng có nút **Sửa** và **Hoàn tác**. Tổng lời đã chốt theo năm.
- **Lịch sử giá**: hiện 30 dòng gần nhất, có nút xem tất cả. Xóa được từng dòng.
- **Thống kê theo loại vàng**: vốn đang giữ, giá trị, lời tạm tính, lời đã chốt.

### 2.6 Tab "Tham số"

| Tham số | Ví dụ |
|---|---|
| Lãi suất ngân hàng tham chiếu (%/năm) | 5,5 |
| Lạm phát (%/năm) | 3,5 |
| % kỳ vọng mặc định cho lô mới | 15 |
| % sắp đạt mặc định cho lô mới | 2 |
| Danh sách loại vàng | Tên, đơn vị niêm yết (lượng/chỉ/phân/ly/dem). Đổi tên được; chỉ xóa được loại chưa có lô nào |

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
| `d` | Số ngày giữ = hôm nay − ngày mua |
| `r` | Lãi suất ngân hàng (%/năm) · `π` là lạm phát (%/năm) |

### 3.1 Lô đang giữ

```
Vốn mỗi món        = T / n0
Vốn còn lại     V  = n × T / n0
Giá trị hôm nay G  = n × w × P
Lời/lỗ             = G − V
% lời           g  = G / V − 1
% quy ra năm       = (1 + g)^(365 / d) − 1          (chỉ hiện khi d ≥ 30, tránh số ảo)
Nếu gửi ngân hàng  B = V × (1 + r × d / 365)         (lãi đơn, dùng lãi suất hiện tại)
Hơn/thua ngân hàng = G − B
Lãi thực           = (1 + g) / (1 + π)^(d / 365) − 1
Cần tăng để hòa vốn = V / G − 1                      (chỉ khi đang lỗ)
Giá cần để đạt mục tiêu = V × (1 + % kỳ vọng) / (n × w)
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

### 3.4 Lưu ý về độ chính xác

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
- `phien_ban` dùng để tự nâng cấp file khi app thêm tính năng.
- `tiet_kiem`, `cctg`, `dat` để trống, không dùng.

---

## 5. Đã cân nhắc và không làm

| Ý tưởng | Lý do không làm |
|---|---|
| Tiết kiệm, CCTG, Đất | App ngân hàng đã theo dõi; làm thêm là nhập hai lần |
| Phân tích vòng bán rồi mua lại | Thêm số liệu phải đọc; mua lại đã có nút Thêm lô và nhắc mua lại |
| Chốt lời theo nhiều bậc | Phải cài nhiều mốc mỗi lô; nút Lấy lại vốn / Bán một nửa đã đủ |
| Biểu đồ giá | Xem cho biết, không giúp ra quyết định |
| Giá vốn trung bình, nhắc mua thêm | Trùng với nhắc mua lại |
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
