// ===================== Tab: Lịch sử =====================
function salesTable(sales, withLot = true) {
  return `<div class="scroll"><table><tr><th>Mã</th><th>Ngày</th>${withLot ? '<th>Lô</th><th>Loại</th>' : ''}<th>Bán</th><th class="n">Giá bán</th><th class="n">Tiền thu</th><th class="n">Vốn</th>
    <th class="n">Lời/lỗ</th><th class="n">%</th><th class="n">So với gửi NH</th><th class="n">Muốn mua lại</th><th>Ghi chú</th><th></th></tr>
    ${sales.map(b => {
      const c = saleCalc(b); if (!c) return '';
      const t = typeById(c.lot.loai_id);
      return `<tr><td>${esc(b.id)}</td><td>${fmtD(b.ngay)}</td>${withLot ? `<td>${esc(b.lo_id)}</td><td>${esc(t?.ten)}</td>` : ''}
        <td>${b.so_mon} × ${fmtW(c.lot.trong_luong_mon_dem)}</td><td class="n">${fmtM(b.gia_ban)}/${UNIT_NAME[t?.don_vi_niem_yet] || ''}</td>
        <td class="n">${fmtM(c.thu)}</td><td class="n">${fmtM(c.von)}</td><td class="n ${cls(c.loi)}">${fmtMS(c.loi)}</td><td class="n ${clsP(c.g)}">${fmtP(c.g)}</td>
        <td class="n ${cls(c.vsBank)}">${fmtMS(c.vsBank)}</td><td class="n">${b.gia_mua_lai ? fmtM(b.gia_mua_lai) : ''}</td><td>${esc(b.ghi_chu)}</td>
        <td><button class="sm" data-act="sale-edit" data-id="${esc(b.id)}">Sửa</button> <button class="sm danger" data-act="sale-del" data-id="${esc(b.id)}">Xóa</button></td></tr>`;
    }).join('')}</table></div>`;
}
function viewLichSu() {
  const years = [...new Set(D.vang.ban.map(b => b.ngay.slice(0, 4)))].sort().reverse();
  const sales = D.vang.ban.filter(b => !ui.lsYear || b.ngay.startsWith(ui.lsYear)).sort((a, b) => b.ngay.localeCompare(a.ngay) || b.id.localeCompare(a.id));
  // Mọi lần bán đã tính (bỏ lần bán mất lô); saleCalc nhận (lần bán, lô) nên không gọi qua map(saleCalc)
  const calcs = saleCalcs();
  const byYear = years.map(y => {
    const list = calcs.filter(c => c.sale.ngay.startsWith(y));
    return `<tr><td>${y}</td><td class="n">${list.length}</td><td class="n">${fmtM(list.reduce((a, c) => a + c.thu, 0))}</td><td class="n ${cls(list.reduce((a, c) => a + c.loi, 0))}">${fmtMS(list.reduce((a, c) => a + c.loi, 0))}</td></tr>`;
  }).join('');
  let html = card('Lịch sử bán', `<div class="row"><select id="lsYear"><option value="">Tất cả các năm</option>${years.map(y => `<option ${ui.lsYear === y ? 'selected' : ''}>${y}</option>`).join('')}</select></div>
    ${sales.length ? salesTable(sales) : '<p class="muted">Chưa có lần bán nào.</p>'}
    ${years.length ? `<h3>Lời đã chốt theo năm</h3><div class="scroll"><table style="width:auto"><tr><th>Năm</th><th class="n">Số lần bán</th><th class="n">Tiền thu</th><th class="n">Lời/lỗ chốt</th></tr>${byYear}</table></div>` : ''}`);
  const typeRows = D.vang.loai.map(t => {
    const sts = D.vang.lo.filter(l => l.loai_id === t.id).map(l => lotState(l)).filter(s => s.n > 0);
    const V = sts.reduce((a, s) => a + s.V, 0), G = sts.every(s => s.hasPrice) ? sts.reduce((a, s) => a + s.G, 0) : null;
    const dem = sts.reduce((a, s) => a + s.n * s.lot.trong_luong_mon_dem, 0);
    const rz = calcs.filter(c => c.lot.loai_id === t.id).reduce((a, c) => a + c.loi, 0);
    const qty = sts.reduce((a, s) => a + s.n * s.w, 0);
    return `<tr><td>${esc(t.ten)}</td><td>${fmtW(dem)}</td><td class="n">${fmtM(V)}</td><td class="n">${qty ? fmtM(V / qty) + '/' + UNIT_NAME[t.don_vi_niem_yet] : '—'}</td><td class="n">${G == null ? '—' : fmtM(G)}</td>
      <td class="n ${cls(G - V)}">${G == null ? '—' : fmtMS(G - V)}</td><td class="n ${cls(rz)}">${fmtMS(rz)}</td></tr>`;
  }).join('');
  html += card('Thống kê theo loại vàng', `<div class="scroll"><table><tr><th>Loại</th><th>Đang giữ</th><th class="n">Vốn</th><th class="n">Giá vốn bình quân</th><th class="n">Giá trị hôm nay</th><th class="n">Lời tạm tính</th><th class="n">Lời đã chốt</th></tr>${typeRows}</table></div>`);
  // Lịch sử giá: lọc theo loại và năm (mặc định 30 dòng gần nhất). Dữ liệu nhiều năm có hàng chục nghìn dòng, vẽ hết thì chậm
  const pYears = [...new Set(D.vang.gia.map(p => p.ngay.slice(0, 4)))].sort().reverse();
  const allPrices = D.vang.gia.map((p, i) => ({ p, i })).filter(({ p }) => (!ui.lsPType || p.loai_id === ui.lsPType) && (!ui.lsPYear || p.ngay.startsWith(ui.lsPYear)))
    .sort((a, b) => b.p.ngay.localeCompare(a.p.ngay) || a.p.loai_id.localeCompare(b.p.loai_id));
  const prices = ui.lsPYear ? allPrices : allPrices.slice(0, 30);
  const pFilter = `<div class="row"><select id="lsPType">${typeOptions(ui.lsPType, true)}</select>
    <select id="lsPYear"><option value="">30 dòng gần nhất</option>${pYears.map(y => `<option ${ui.lsPYear === y ? 'selected' : ''}>${y}</option>`).join('')}</select>
    ${ui.lsPYear ? `<span class="small muted">${prices.length} dòng</span>` : ''}</div>`;
  html += card('Lịch sử giá', !D.vang.gia.length ? '<p class="muted">Chưa nhập giá lần nào.</p>' : pFilter + (prices.length ? `<div class="scroll"><table><tr><th>Ngày</th><th>Loại</th><th class="n">Tiệm mua vào</th><th class="n">Tiệm bán ra</th><th class="n">Mua cần tăng để hòa vốn</th><th></th></tr>
    ${prices.map(({ p, i }) => `<tr><td>${fmtD(p.ngay)}</td><td>${esc(typeById(p.loai_id)?.ten)}</td><td class="n">${fmtM(p.mua_vao)}</td><td class="n">${p.ban_ra ? fmtM(p.ban_ra) : '—'}</td>
      <td class="n">${p.ban_ra ? '+' + fmtP(p.ban_ra / p.mua_vao - 1, false) : '—'}</td><td><button class="sm danger" data-act="price-del" data-i="${i}">Xóa</button></td></tr>`).join('')}</table></div>` : '<p class="muted">Không có dòng giá nào.</p>'));
  return html;
}
