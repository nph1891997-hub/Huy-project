// ===================== Tab: Lô vàng =====================
function viewLo() {
  let lots = D.vang.lo.slice().sort((a, b) => b.ngay_mua.localeCompare(a.ngay_mua) || b.id.localeCompare(a.id));
  lots = lots.filter(l => {
    const n = l.so_mon - soldMon(l.id);
    if (ui.loStatus === 'open' && n <= 0) return false;
    if (ui.loStatus === 'closed' && n > 0) return false;
    return !ui.loType || l.loai_id === ui.loType;
  });
  const rows = lots.map(l => {
    const n = l.so_mon - soldMon(l.id), sold = l.so_mon - n;
    const t = typeById(l.loai_id);
    let r = `<tr><td><b>${esc(l.id)}</b></td><td>${esc(t?.ten)}</td><td>${fmtD(l.ngay_mua)}</td><td>${l.so_mon} × ${fmtW(l.trong_luong_mon_dem)}</td>
      <td>${n > 0 ? n + ' món · ' + fmtW(n * l.trong_luong_mon_dem) : '—'}</td><td class="n">${fmtM(l.tong_tien_mua)}</td>
      <td class="n">${fmtM(l.tong_tien_mua / (l.so_mon * lotW(l)))}/${UNIT_NAME[t?.don_vi_niem_yet] || ''}</td>
      <td class="n">${fmtP(l.ky_vong_pct / 100, false)}</td><td>${n > 0 ? '<span class="tag">Đang giữ</span>' : '<span class="tag muted">Đã đóng</span>'}</td>
      <td>${n > 0 ? `<button class="sm" data-act="sell" data-id="${esc(l.id)}">Bán…</button> ` : ''}
        <button class="sm" data-act="lot-detail" data-id="${esc(l.id)}">${ui.loOpen === l.id ? 'Ẩn' : 'Chi tiết'}</button>
        <button class="sm" data-act="lot-edit" data-id="${esc(l.id)}">Sửa</button>
        <button class="sm danger" data-act="lot-del" data-id="${esc(l.id)}">Xóa</button></td></tr>`;
    if (ui.loOpen === l.id) r += `<tr><td colspan="10" style="background:#fafbfc;white-space:normal">${lotDetail(l)}</td></tr>`;
    return r;
  }).join('');
  return card('Lô vàng', `<div class="row">
      <button class="primary" data-act="lot-add">+ Thêm lô</button>
      <select id="loStatus">${[['open', 'Đang giữ'], ['closed', 'Đã đóng'], ['all', 'Tất cả']].map(([k, n]) => `<option value="${k}" ${ui.loStatus === k ? 'selected' : ''}>${n}</option>`).join('')}</select>
      <select id="loType">${typeOptions(ui.loType, true)}</select></div>
    <div class="scroll"><table><tr><th>Lô</th><th>Loại</th><th>Ngày mua</th><th>Lúc mua</th><th>Còn lại</th><th class="n">Tổng tiền mua</th><th class="n">Giá mua</th><th class="n">Kỳ vọng</th><th>Trạng thái</th><th></th></tr>
    ${rows || '<tr><td colspan="10" class="muted">Không có lô nào.</td></tr>'}</table></div>`);
}
function lotDetail(l) {
  const s = lotState(l);
  const sales = D.vang.ban.filter(b => b.lo_id === l.id).sort((a, b) => a.ngay.localeCompare(b.ngay));
  let h = l.ghi_chu ? `<p><b>Ghi chú:</b> ${esc(l.ghi_chu)}</p>` : '';
  if (s.n > 0 && s.hasPrice) h += `<p>Hôm nay: giá trị ${fmtM(s.G)}, lời/lỗ <span class="${cls(s.L)}">${fmtMS(s.L)} (${fmtP(s.g)})</span>, so với gửi ngân hàng <span class="${cls(s.vsBank)}">${fmtMS(s.vsBank)}</span>.<br>
    Đã giữ ${s.d} ngày · quy ra năm <span class="${clsP(s.annual)}">${fmtP(s.annual)}</span> · lãi thực sau lạm phát <span class="${clsP(s.real)}">${fmtP(s.real)}</span>.</p>`;
  h += sales.length ? `<b>Lịch sử bán</b>${salesTable(sales, false)}` : '<p class="muted">Chưa bán lần nào.</p>';
  return h;
}
