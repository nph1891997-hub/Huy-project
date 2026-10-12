# Quản lý vàng

App một file HTML để quản lý vàng theo lô: nhập giá mỗi ngày, xem lô nào đạt mục tiêu, chốt lời, có nên mua thêm không, cần tiền thì gợi ý bán lô nào.

## Cách dùng

1. Mở `index.html` bằng **Chrome** hoặc **Edge** (bấm đúp vào file). Không cần cài gì.
2. Lần đầu: bấm **Tạo file dữ liệu…**, lưu `tai-san.json` vào thư mục bạn muốn (nên để trong OneDrive/Google Drive). Từ đó mọi thay đổi tự lưu vào file này.
   **Máy thứ hai** (đã có `tai-san.json` từ máy khác): bấm **Mở tai-san.json có sẵn…** và chọn file đó. Đừng chọn file có sẵn ở hộp Tạo file: Chrome xóa trắng file đó.
3. Những lần sau: bấm **Mở lại tai-san.json**. Trước khi mở file, app không hiện số liệu để khỏi xem nhầm bản cũ. Nếu Chrome/Edge hỏi quyền và có lựa chọn "Cho phép mỗi lần truy cập", chọn nó để khỏi phải bấm lại.
4. Dùng chung file trên 2 máy (qua OneDrive/Drive): app tự đối chiếu khi mở file. Nếu cả máy này lẫn file đều có thay đổi, app dùng dữ liệu trong file và tự tải bản của trình duyệt về để không mất.

Nhập giá hằng ngày ở bảng **Giá vàng** (tab Hôm nay): sửa giá xong, **rời dòng hoặc nhấn Enter là lưu**, không cần bấm nút. Gõ giá như bảng niêm yết của tiệm cũng được: `148.500` (nghìn đồng) hay `148,5` (triệu) đều là 148.500.000. Ô tiền cũng hiểu chữ: `2 tỷ`, `150 triệu`, `500 nghìn`; gõ chữ khác thì app báo chứ không đoán. Loại nào giá không đổi thì tick **Không đổi**, hoặc bấm **Tất cả không đổi**. Muốn nhập bù ngày cũ thì đổi ô Ngày; ô Ngày giữ ngày đó cho tới khi bấm **Về hôm nay**. Để app mở qua đêm thì sáng hôm sau app tự chuyển sang ngày mới.

Mở app ở 2 tab hoặc 2 máy cùng lúc: trước mỗi lần lưu, khi quay lại tab và mỗi phút một lần, app kiểm tra file có bị sửa ở nơi khác không. Có thì app nạp bản mới và báo cho bạn; thay đổi vừa làm ở tab này mà chưa kịp lưu thì được tải về thành file để không mất.

Gợi ý mua thêm nằm ở cột **Mua thêm?** trong bảng giá; quy tắc (giảm bao nhiêu % từ đỉnh 90 ngày thì mua, hạn mức vốn) chỉnh ở tab **Tham số → Mua thêm**.

Trên điện thoại (hoặc Safari, Firefox), trình duyệt không ghi thẳng vào file được nên app ở **chế độ xem**: mở `tai-san.json` để xem lô nào nên chốt, có nên mua thêm không, gõ thử giá của tiệm; không lưu gì.

Sao lưu và khôi phục nằm ở tab **Tham số → Dữ liệu**. File `tai-san.json` hỏng hoặc rỗng thì app không ghi gì vào file; màn chờ chỉ cách lấy lại: lịch sử phiên bản của OneDrive/Drive, **Khôi phục từ bản sao lưu…** (ghi vào đúng `tai-san.json`), hoặc **Dùng bản trong trình duyệt**. Muốn tạo file mới thì đặt tên khác `tai-san.json` đang dùng: Chrome xóa trắng file được chọn ở hộp Lưu. File bị thay bằng một file không có dữ liệu (thường do máy khác bấm Tạo file dữ liệu… rồi chọn trùng tên) thì app cũng không nạp mà về màn chờ đó, có **Dùng bản trong trình duyệt** để ghi lại.

Đặc tả chi tiết: [`docs/dac-ta-vang.md`](docs/dac-ta-vang.md).
