// ===================== Tab: Tham số =====================
function viewThamSo() {
  const T = D.tham_so;
  const ro = VIEW ? ' disabled' : '';
  const f = (k, label, step = '0.1') => `<label class="field"><span>${label}</span><input type="number" step="${step}" data-set="${k}" value="${T[k]}"${ro}></label>`;
  const used = id => D.vang.lo.some(l => l.loai_id === id) || D.vang.gia.some(p => p.loai_id === id);
  return card('Tham số chung', `<div class="row">${f('lai_suat_ngan_hang', 'Lãi suất ngân hàng tham chiếu (%/năm)')}${f('lam_phat', 'Lạm phát (%/năm)')}
      ${f('vang_ky_vong_mac_dinh', '% kỳ vọng mặc định cho lô mới')}${f('vang_sap_dat_mac_dinh', 'Báo sắp đạt khi giá còn cần tăng ≤ (%)')}</div>
    <p class="muted small">So sánh với ngân hàng dùng lãi đơn và lãi suất hiện tại cho toàn bộ thời gian giữ, nên chỉ mang tính tham khảo với lô giữ lâu.</p>`) +
    card('Mua thêm', `<div class="row">${f('vang_mua_giam_pct', 'Mua thêm khi giá giảm từ đỉnh 90 ngày ≥ (%)')}
      <label class="field"><span>Hạn mức vốn cho vàng (để trống = không giới hạn)</span><input class="money" data-set-money="vang_han_muc_von" value="${fmtIn(T.vang_han_muc_von)}" placeholder="không giới hạn" style="width:200px"${ro}></label></div>
    <p class="muted small">App không đoán giá. Vùng mua: giá tiệm bán ra thấp hơn đỉnh 90 ngày ít nhất bấy nhiêu %; đã mua loại đó trong 90 ngày thì lần sau phải rẻ hơn lần mua gần nhất bấy nhiêu % nữa. Chênh lệch mua–bán cao bất thường thì gợi ý đợi; vốn đang giữ chạm hạn mức thì thôi gợi ý mua.</p>`) +
    card('Loại vàng', `<div class="scroll"><table style="width:auto"><tr><th>Tên</th><th>Đơn vị niêm yết giá</th><th></th></tr>
      ${D.vang.loai.map(t => `<tr><td><input data-type-name="${esc(t.id)}" value="${esc(t.ten)}"${ro}></td>
        <td><select data-type-unit="${esc(t.id)}" ${used(t.id) || VIEW ? 'disabled title="Loại đã có lô hoặc giá, không đổi đơn vị được"' : ''}>
          ${unitOptions(t.don_vi_niem_yet)}</select></td>
        <td><button class="sm danger" data-act="type-del" data-id="${esc(t.id)}" ${D.vang.lo.some(l => l.loai_id === t.id) ? 'disabled title="Loại đã có lô, không xóa được"' : ''}>Xóa</button></td></tr>`).join('')}</table></div>
      <form id="typeForm"><div class="row" style="margin-top:10px"><label class="field"><span>Tên loại mới</span><input name="ten" required placeholder="VD: Nhẫn 9999"></label>
        <label class="field"><span>Đơn vị niêm yết</span><select name="dv">${unitOptions('chi')}</select></label>
        <button type="submit">+ Thêm loại</button></div></form>`) +
    card('Dữ liệu', VIEW ? `<p>Chế độ xem: trình duyệt này không ghi thẳng vào file được, không lưu gì. Ghi chép làm trên máy tính bằng Chrome hoặc Edge.</p><div class="row">${viewDataBtns()}</div>` : ((hasFSA
      ? `<p>${fileHandle ? `Đang lưu vào file <b>${esc(fileHandle.name)}</b>.` : 'Chưa kết nối file, dữ liệu đang lưu tạm trong trình duyệt.'}</p>
        <div class="row"><button data-act="file-new">Tạo file mới…</button><button data-act="file-open">Mở file khác…</button></div>`
      : `<p>Trình duyệt này không ghi trực tiếp vào file được, dữ liệu lưu trong trình duyệt. Nên dùng Chrome hoặc Edge.</p>`) +
      `<div class="row"><button data-act="export-json">Tải bản sao lưu</button><button data-act="import-json">Khôi phục từ bản sao lưu…</button></div>`));
}
