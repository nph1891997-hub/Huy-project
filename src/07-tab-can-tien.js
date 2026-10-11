// ===================== Tab: Cần tiền =====================
function cashPlans(X) {
  const sts = openLots().map(l => lotState(l)).filter(s => s.hasPrice && s.n > 0 && s.valMon > 0);
  const prof = sts.filter(s => s.g >= 0), loss = sts.filter(s => s.g < 0).sort((a, b) => b.g - a.g);
  const got = rows => rows.reduce((a, x) => a + x.k * x.s.valMon, 0);
  const fill = (order, rows = []) => {
    rows = rows.slice(); let have = got(rows);
    for (const s of order) {
      if (have >= X) break;
      const k = Math.min(s.n, Math.ceil((X - have) / s.valMon));
      rows.push({ s, k }); have += k * s.valMon;
    }
    return rows;
  };
  // Bỏ bớt món thừa: nếu bỏ một món mà vẫn đủ tiền thì không bán món đó (xét từ lô ít ưu tiên nhất)
  const prune = rows => {
    rows = rows.map(x => ({ ...x })); let have = got(rows);
    for (let i = rows.length - 1; i >= 0; i--) while (rows[i].k > 0 && have - rows[i].s.valMon >= X) { rows[i].k--; have -= rows[i].s.valMon; }
    return rows.filter(x => x.k > 0);
  };
  // A: lô ở nhóm Nên chốt trước (đạt mục tiêu, hoặc lời tụt dưới mức nhắc), như tab Hôm nay đang báo
  const A = prune(fill(loss, fill(prof.slice().sort((a, b) => (b.grp === 'chot') - (a.grp === 'chot') || b.g - a.g))));
  const single = prof.filter(s => s.n * s.valMon >= X).map(s => ({ s, k: Math.ceil(X / s.valMon) }))
    .sort((a, b) => (a.k * a.s.valMon - X) - (b.k * b.s.valMon - X));
  const B = single.length ? [single[0]] : prune(fill(loss, fill(prof.slice().sort((a, b) => b.n * b.valMon - a.n * a.valMon))));
  const C = prune(fill(loss, fill(prof.slice().sort((a, b) => a.g - b.g))));
  const toPlan = (name, desc, rows) => ({ name, desc, rows: rows.map(x => ({ id: x.s.lot.id, k: x.k })) });
  const plans = [
    toPlan('A. Chốt lời tốt nhất', 'Lô đang ở nhóm Nên chốt trước (đạt mục tiêu hoặc lời tụt dưới mức nhắc), rồi lô lời % cao nhất', A),
    toPlan('B. Ít lô nhất', 'Ưu tiên một lô bán vừa đủ, hạn chế cắt lẻ nhiều lô', B),
    toPlan('C. Giữ lô tốt', 'Bán lô lời ít trước, giữ lô lời nhiều cho chạy tiếp', C)
  ];
  const key = p => JSON.stringify(p.rows);
  plans.forEach((p, i) => { const j = plans.findIndex(q => key(q) === key(p)); if (j < i) p.same = plans[j].name.slice(0, 1); });
  return plans;
}
function planSummary(plan, X) {
  let thu = 0, von = 0, lossLoi = 0, lossVsBank = 0, cutLoss = 0, valid = true;
  const rows = plan.rows.map(r => {
    const lot = lotById(r.id); const s = lotState(lot);
    if (r.k > s.n || r.k < 0) valid = false;
    const t = r.k * s.valMon, v = r.k * s.costMon, bank = v * (1 + r_() * s.d / 365);
    thu += t; von += v; if (s.cut) cutLoss += r.k * s.cut.unitLoss;
    if (t - v < 0) { lossLoi += t - v; lossVsBank += t - bank; }
    return { r, s, t, v, loi: t - v };
  });
  const totalDem = openLots().reduce((a, l) => a + (l.so_mon - soldMon(l.id)) * l.trong_luong_mon_dem, 0) -
    rows.reduce((a, x) => a + x.r.k * x.s.lot.trong_luong_mon_dem, 0);
  const totalV = openLots().reduce((a, l) => a + lotState(l).V, 0) - von;
  return { rows, thu, von, loi: thu - von, du: thu - X, lossLoi, lossVsBank, cutLoss, totalDem, totalV, valid };
}
const r_ = () => r();
function viewCanTien() {
  let html = card('Cần tiền', `<form id="cashForm"><div class="row">
    <label class="field"><span>Số tiền cần</span><input class="money" name="x" value="${fmtIn(ui.cash)}" placeholder="VD: 200 (triệu), 1,5 tỷ" required style="width:200px"></label>
    <button class="primary" type="submit">Gợi ý</button></div></form>
    <p class="muted small">Tính theo giá tiệm mua vào gần nhất của từng loại. Không đụng lô lỗ nếu các lô lời đã đủ tiền; thiếu thì lấy lô lỗ ít % nhất trước. Bán theo từng món nên có thể dư một chút. Giá thực tế ở tiệm khác thì sửa lại lần bán ở tab Lịch sử.</p>`);
  if (!ui.plans) return html;
  const X = ui.cash;
  const totalAvail = openLots().map(l => lotState(l)).filter(s => s.hasPrice).reduce((a, s) => a + s.G, 0);
  if (totalAvail < X) html += `<div class="warn">⚠️ Bán hết tất cả các lô (có giá) cũng chỉ được ${fmtM(totalAvail)}, còn thiếu <b>${fmtM(X - totalAvail)}</b>.</div>`;
  const oldTypes = [...new Set(ui.plans.flatMap(p => p.rows.map(r => lotById(r.id)?.loai_id)))].map(id => ({ t: typeById(id), p: latestPrice(id) })).filter(x => x.t && x.p && x.p.ngay < today());
  if (oldTypes.length) html += `<div class="warn">⚠️ Đang dùng giá cũ: ${oldTypes.map(x => `${esc(x.t.ten)} (ngày ${fmtD(x.p.ngay)})`).join(', ')}. Nên cập nhật giá ở tab Hôm nay trước khi bán.</div>`;
  const cutTypes = new Map(openLots().map(l => lotState(l)).filter(s => s.cut).map(s => [s.lot.loai_id, s]));
  if (cutTypes.size) html += `<div class="warn">⚠️ Tiệm đang hạ giá mua vào: ${[...cutTypes.values()].map(s => `${esc(s.t.ten)}, chênh lệch ${fmtP(s.spreadNow, false)} (thường ${fmtP(s.spreadUsual, false)})`).join('; ')}. Bán lúc này được ít hơn ngày thường, không gấp thì đợi.</div>`;
  const dup = ui.plans.filter(p => p.same);
  if (dup.length) html += `<p class="muted small">${dup.map(p => 'Phương án ' + p.name.slice(0, 1) + ' giống ' + p.same).join(', ')}, nên không hiện lại.</p>`;
  html += '<div class="plans">' + ui.plans.map((p, pi_) => {
    if (p.same) return '';
    const S = planSummary(p, X);
    return `<section class="card"><h2>${esc(p.name)}</h2><p class="muted small">${esc(p.desc)}</p>
      <div class="scroll"><table class="plan"><tr class="hd"><th>Lô</th><th>Loại</th><th class="n">Bán (món)</th><th class="n">Còn</th><th class="n">Tiền thu</th><th class="n">Lời/lỗ</th></tr>
      ${S.rows.map((x, ri) => `<tr><td class="c-lo"><b>${esc(x.s.lot.id)}</b></td><td class="c-loai">${esc(x.s.t?.ten)}<br><span class="small muted">${fmtW(x.s.lot.trong_luong_mon_dem)}/món<span class="m-only"> · còn ${x.s.n} món</span></span></td>
        <td class="n c-k"><input type="number" min="0" max="${x.s.n}" value="${x.r.k}" data-plan="${pi_}" data-row="${ri}" style="width:64px"></td><td class="n c-con">${x.s.n}</td>
        <td class="n c-thu">${fmtM(x.t)}</td><td class="n c-loi ${cls(x.loi)}">${fmtMS(x.loi)}</td></tr>`).join('') || '<tr><td colspan="6" class="muted">Không có lô phù hợp.</td></tr>'}
      <tr class="total"><td colspan="4">Tổng thu</td><td class="n">${fmtM(S.thu)}</td><td class="n ${cls(S.loi)}">${fmtMS(S.loi)}</td></tr></table></div>
      <table class="preview" style="margin-top:8px">
        <tr><td>${S.du >= 0 ? 'Dư so với số cần' : 'Còn thiếu'}</td><td class="n ${S.du >= 0 ? '' : 'neg'}">${fmtM(Math.abs(S.du))}</td></tr>
        <tr><td>Vàng còn lại sau khi bán</td><td class="n">${fmtW(S.totalDem)}</td></tr>
        <tr><td>Vốn còn lại sau khi bán</td><td class="n">${fmtM(S.totalV)}</td></tr>
        ${S.cutLoss > 0 ? `<tr><td>Thiệt do tiệm hạ giá mua vào</td><td class="n neg">khoảng ${NFP.format(S.cutLoss / 1e6)}tr</td></tr>` : ''}</table>
      ${S.lossLoi < 0 ? `<div class="warn">⚠️ Có bán lỗ: lỗ chốt <b>${fmtM(-S.lossLoi)}</b>; so với nếu gửi ngân hàng thì thiệt <b>${fmtM(-S.lossVsBank)}</b>.</div>` : ''}
      ${S.valid ? '' : '<div class="warn">Số món bán vượt quá số món còn lại.</div>'}
      <div class="dlg-actions"><button class="primary" data-act="plan-confirm" data-plan="${pi_}" ${S.valid && S.thu > 0 ? '' : 'disabled'}>Xác nhận bán</button></div></section>`;
  }).join('') + '</div>';
  return html;
}
