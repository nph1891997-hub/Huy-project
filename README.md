# Quản lý vàng

App một file HTML để quản lý vàng theo lô: nhập giá mỗi ngày, xem lô nào đạt mục tiêu, chốt lời, có nên mua thêm không, cần tiền thì gợi ý bán lô nào.

## Cách dùng

1. Mở `index.html` bằng **Chrome** hoặc **Edge** (bấm đúp vào file). Không cần cài gì.
2. Lần đầu: bấm **Tạo file dữ liệu…**, lưu `tai-san.json` vào thư mục bạn muốn (nên để trong OneDrive/Google Drive). Từ đó mọi thay đổi tự lưu vào file này.
3. Những lần sau: bấm **Mở lại tai-san.json**. Trước khi mở file, app không hiện số liệu để khỏi xem nhầm bản cũ. Nếu Chrome/Edge hỏi quyền và có lựa chọn "Cho phép mỗi lần truy cập", chọn nó để khỏi phải bấm lại.
4. Dùng chung file trên 2 máy (qua OneDrive/Drive): app tự đối chiếu khi mở file. Nếu cả máy này lẫn file đều có thay đổi, app dùng dữ liệu trong file và tự tải bản của trình duyệt về để không mất.

Gợi ý mua thêm nằm ở cột **Mua thêm?** trong bảng giá; quy tắc (giảm bao nhiêu % từ đỉnh 90 ngày thì mua, hạn mức vốn) chỉnh ở tab **Tham số → Mua thêm**.

Trên điện thoại (hoặc Safari, Firefox), trình duyệt không ghi thẳng vào file được nên app ở **chế độ xem**: mở `tai-san.json` để xem lô nào nên chốt, có nên mua thêm không, gõ thử giá của tiệm; không lưu gì.

Sao lưu và khôi phục nằm ở tab **Tham số → Dữ liệu**.

Đặc tả chi tiết: [`docs/dac-ta-vang.md`](docs/dac-ta-vang.md).
