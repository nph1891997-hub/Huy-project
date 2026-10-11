// ===================== Tab: Hôm nay =====================
function viewHomNay() {
  if (!D.vang.loai.length && VIEW) return card('', '<p class="muted">File này chưa có loại vàng nào.</p>');
  if (!D.vang.loai.length) return card('Bắt đầu', (hasFSA && !fileHandle && !pendingHandle ? `<p><b>Đã dùng app trên máy khác</b> (file tai-san.json nằm trong OneDrive/Google Drive): <button class="primary" data-act="file-open">Mở file có sẵn…</button></p>
    <p><b>Lần đầu dùng. Bước 1.</b> Tạo file lưu dữ liệu (nên đặt trong OneDrive/Google Drive): <button data-act="file-new">Tạo file dữ liệu…</button></p>
    <p><b>Bước 2.</b> ` : '<p>') + `Thêm lô vàng đầu tiên, loại vàng tạo ngay trong form: <button class="primary" data-act="lot-add">+ Thêm lô</button></p>`);
  const html = card('Giá vàng', `<form id="priceForm"><div class="row"><label class="field"><span>Ngày</span><input type="date" name="ngay" value="${ui.priceDate}" max="${today()}" required class="${ui.priceDate !== today() ? 'olddate' : ''}"></label><span id="dateNote" style="padding-bottom:6px">${dateNote()}</span></div>
    <div class="scroll"><table><tr class="hd"><th>Loại</th><th>Đơn vị</th><th>Tiệm mua vào (giá bạn bán được)</th><th>Tiệm bán ra (giá bạn phải mua)</th><th class="n" title="Mua vào hôm nay thì giá phải tăng bấy nhiêu mới bán ra hòa vốn">Mua hôm nay cần tăng<br>để hòa vốn</th><th title="Gợi ý theo quy tắc mua rải khi giá giảm (Tham số → Mua thêm)">Mua thêm?</th><th></th><th title="Đã xem giá tiệm, giá không đổi: tick để ghi nhận cho ngày đang chọn"></th></tr>${D.vang.loai.map(priceRow).join('')}</table></div>
    <div class="row" style="margin-top:10px"><button type="button" id="btnAllSame" data-act="all-same" class="${staleIds().length ? '' : 'hidden'}">Tất cả không đổi</button><span class="small muted">Gõ tắt: 118,5 hoặc 118.500 = 118.500.000. ${VIEW ? 'Chế độ xem: rời dòng là tính lại theo giá vừa gõ, không lưu.' : 'Sửa xong, rời dòng hoặc nhấn Enter là lưu.'} Sửa giá mua vào thì giá bán ra tự cộng theo chênh lệch lần trước.</span><span class="spacer"></span><button type="button" data-act="lot-add">+ Thêm lô</button></div></form>
    <details id="buyWhy" data-lazy="why"${ui.whyOpen ? ' open' : ''}><summary>Vì sao? · Biểu đồ 90 ngày</summary><div id="whyBody" class="lazy-body">${ui.whyOpen ? whyBody() : ''}</div></details>`);
  return html + `<div id="homRest">${homRest()}</div>`;
}
// Giá điền sẵn của một loại cho ngày đang chọn: giá của chính ngày đó, chưa có thì giá gần nhất trước ngày đó
function basePrice(id, ngay) {
  const c = cache(), k = id + '|' + ngay; c.bp ||= new Map();
  if (!c.bp.has(k)) { let best = null; for (const p of D.vang.gia) if (p.loai_id === id && p.ngay <= ngay && (!best || p.ngay > best.ngay)) best = p; c.bp.set(k, best); }
  return c.bp.get(k);
}
const validDate = v => /^\d{4}-\d{2}-\d{2}$/.test(v) && v >= '2000-01-01' && v <= today();
// Dòng dưới ô Ngày: đang nhập cho ngày cũ thì nhắc rõ, kèm nút Về hôm nay
const dateNote = () => ui.priceDate === today() ? '' : `<span class="old">Đang nhập giá cho ngày ${fmtD(ui.priceDate).slice(0, 5)} (không phải hôm nay)</span> <button type="button" class="sm" data-act="price-today">Về hôm nay</button>`;
// Đổi ô Ngày: vẽ lại các dòng giá theo ngày mới (con trỏ đang ở ô Ngày nên không mất gì)
function applyPriceDate(f) {
  _cache = null;
  for (const t of D.vang.loai) { const tr = f.querySelector(`tr.prow[data-id="${t.id}"]`); if (tr) tr.outerHTML = priceRow(t); }
  f.ngay.classList.toggle('olddate', ui.priceDate !== today());
  $('#dateNote').innerHTML = dateNote();
  $('#btnAllSame')?.classList.toggle('hidden', !staleIds().length);
  refreshBuy(f);
}
// Các loại chưa có giá của ngày đang chọn (để tick Không đổi / Tất cả không đổi)
const staleIds = () => D.vang.loai.filter(t => { const b = basePrice(t.id, ui.priceDate); return b && b.ngay < ui.priceDate; }).map(t => t.id);
function priceRow(t) {
  const p = basePrice(t.id, ui.priceDate), stale = p && p.ngay < ui.priceDate;
  const beMua = p && p.ban_ra ? p.ban_ra / p.mua_vao - 1 : null;
  return `<tr class="prow" data-id="${esc(t.id)}"><td class="c-ten">${esc(t.ten)}</td><td class="c-dv">${UNIT_NAME[t.don_vi_niem_yet]}</td>
      <td class="c-mv"><input class="money" name="mv_${esc(t.id)}" value="${p ? fmtIn(p.mua_vao) : ''}" placeholder="VD: 118,5"></td>
      <td class="c-br"><input class="money" name="br_${esc(t.id)}" value="${p && p.ban_ra ? fmtIn(p.ban_ra) : ''}" placeholder="VD: 120" data-spread="${p && p.ban_ra ? p.ban_ra - p.mua_vao : ''}"></td>
      <td class="n c-be">${beMua == null ? '—' : '+' + fmtP(beMua, false)}</td>
      <td class="c-buy" id="buy_${esc(t.id)}">${(v => buyCell(t, v.ngay, v.mv, v.br, v.fresh))(priceVals(t))}</td><td class="small c-note ${stale ? 'old' : 'muted'}">${p ? 'giá ngày ' + fmtD(p.ngay) + (stale ? (ui.priceDate === today() ? ' · chưa cập nhật hôm nay' : ` · chưa có giá ngày ${fmtD(ui.priceDate).slice(0, 5)}`) : '') : 'chưa có giá'}</td>
      <td class="c-kd">${p ? `<label class="small kd ${stale ? '' : 'hidden'}" data-pngay="${p.ngay}"><input type="checkbox" name="kd_${esc(t.id)}"> Không đổi</label>` : ''}</td></tr>`;
}
// Bảng giá: rời khỏi một dòng (hoặc Enter) là lưu dòng đó cho ngày đang chọn, cùng các kiểm tra chống gõ nhầm
const setPrice = row => { D.vang.gia = D.vang.gia.filter(p => !(p.ngay === row.ngay && p.loai_id === row.loai_id)); D.vang.gia.push(row); };
function resetRow(f, id) {
  const b = basePrice(id, ui.priceDate), br = f['br_' + id];
  f['mv_' + id].value = b ? fmtIn(b.mua_vao) : ''; br.value = b && b.ban_ra ? fmtIn(b.ban_ra) : ''; delete br.dataset.touched;
  refreshBuy(f);
}
function saveRow(id) {
  const f = $('#priceForm'); if (!f || !f['mv_' + id]) return;
  const rolled = rollForSave();   // tab để mở qua đêm: giá vừa gõ là giá của hôm nay mới
  const t = typeById(id), ngay = f.ngay.value, base = basePrice(id, validDate(ngay) ? ngay : ui.priceDate);
  const mv = parseM(f['mv_' + id].value), br = parseM(f['br_' + id].value) || null;
  if (!mv) return resetRow(f, id);
  if (base && base.mua_vao === mv && (base.ban_ra || null) === br) return;   // không đổi gì
  if (!ngay) return tell('Chưa nhập ngày.');
  if (ngay > today()) return tell('Ngày nhập giá không được sau hôm nay.');
  if (!validDate(ngay)) return tell('Ngày chưa hợp lệ.');
  if (br && br < mv) { tell(`${t.ten}: giá tiệm bán ra thấp hơn giá mua vào, kiểm tra lại.`); return resetRow(f, id); }
  // Chống gõ nhầm (cả ở chế độ xem: gõ thiếu số ở tiệm thì nhóm lô báo sai đúng lúc đang quyết định bán).
  // Loại chưa có giá lần nào thì so với đơn giá lô gần nhất của loại đó
  const lot0 = !base && D.vang.lo.filter(l => l.loai_id === id).sort((a, b) => b.ngay_mua.localeCompare(a.ngay_mua) || b.id.localeCompare(a.id))[0];
  const ref = base ? base.mua_vao : lot0 ? lot0.tong_tien_mua / (lot0.so_mon * lotW(lot0)) : 0;
  if (ref && Math.abs(mv / ref - 1) > 0.15 && !ask(base
    ? `${t.ten}: giá thay đổi nhiều so với lần trước: ${fmtM(ref)} → ${fmtM(mv)} (${fmtP(mv / ref - 1)}).\n\nGiá này có đúng không?`
    : `${t.ten}: giá ${fmtM(mv)} lệch ${fmtP(mv / ref - 1)} so với đơn giá lô ${lot0.id} (${fmtM(ref)}).\n\nGiá này có đúng không?`)) return resetRow(f, id);
  setPrice({ ngay, loai_id: id, mua_vao: mv, ban_ra: br });
  if (VIEW) ui.viewTemp = true;
  commit(`giá ${t.ten} ngày ${fmtD(ngay).slice(0, 5)}`, { soft: true });
  if (rolled && ngay === today()) setNotice(newDayNote());
}
// Tick Không đổi / Tất cả không đổi (ids trống = mọi dòng chưa có giá): ghi nhận giá điền sẵn cho ngày đang chọn
function markSame(ids) {
  const rolled = rollForSave();
  ids ||= staleIds();
  const v = $('#priceForm')?.ngay.value, ngay = validDate(v) ? v : ui.priceDate, rows = [];
  for (const id of ids) { const b = basePrice(id, ngay); if (b && b.ngay < ngay) rows.push({ ngay, loai_id: id, mua_vao: b.mua_vao, ban_ra: b.ban_ra }); }
  if (!rows.length) return;
  rows.forEach(setPrice); if (VIEW) ui.viewTemp = true;
  commit(rows.length > 1 ? `giá không đổi ngày ${fmtD(ngay).slice(0, 5)}` : `giá ${typeById(rows[0].loai_id).ten} không đổi ngày ${fmtD(ngay).slice(0, 5)}`, { soft: true });
  if (rolled && ngay === today()) setNotice(newDayNote());
}
function homRest() {
  let html = '';
  const sts = heldStates();
  const priced = sts.filter(s => s.hasPrice), noPrice = sts.filter(s => !s.hasPrice);
  // Vốn đang giữ tính mọi lô; giá trị và lời tạm tính chỉ tính lô có giá (lời = giá trị − vốn của các lô đó)
  const allV = sts.reduce((a, s) => a + s.V, 0), sumV = priced.reduce((a, s) => a + s.V, 0), sumG = priced.reduce((a, s) => a + s.G, 0), rz = realizedTotal();
  html += card('', `<div class="stats">
    <div class="stat"><span>Vốn đang giữ</span><b>${fmtM(allV)}</b>${(lim => lim ? (left => `<span>/ hạn mức ${fmtTr(lim)} · ${left >= 0 ? 'còn ' + fmtTr(left) : 'vượt ' + fmtTr(-left)}</span>`)(lim - allV) : '')(D.tham_so.vang_han_muc_von)}</div>
    <div class="stat"><span>Giá trị hôm nay</span><b>${fmtM(sumG)}</b>${noPrice.length ? `<span>chưa tính ${noPrice.map(s => esc(s.lot.id)).join(', ')} (chưa có giá)</span>` : ''}</div>
    <div class="stat"><span>Lời tạm tính</span><b class="${cls(sumG - sumV)}">${fmtMS(sumG - sumV)}</b><span>${fmtP(sumV ? sumG / sumV - 1 : null)}</span></div>
    <div class="stat"><span>Lời đã chốt (từ trước đến nay)</span><b class="${cls(rz)}">${fmtMS(rz)}</b></div>
    <div class="stat"><span>Tổng lời</span><b class="${cls(sumG - sumV + rz)}">${fmtMS(sumG - sumV + rz)}</b></div></div>`);

  for (let [g, title] of GROUPS) {
    const list = groupList(g);
    if (!list.length) continue;
    if (g === 'chot' && list.some(s => s.tut)) title = '🟢 Nên chốt — đạt mục tiêu hoặc lời tụt dưới mức nhắc';
    html += g === 'giu' ? lazyCard('giu', `${title} (${list.length})`) : card(`${title} (${list.length})`, groupTable(g, list), 'grp-' + g);
  }
  if (noPrice.length) html += card('Lô chưa có giá', `<p class="muted">Nhập giá cho loại vàng của các lô sau để xem gợi ý: ${noPrice.map(s => esc(s.lot.id)).join(', ')}</p>`);
  if (!sts.length) html += card('', `<p class="muted">Chưa có lô nào đang giữ.</p>`);
  const { hits, waiting } = rebuyLists();
  if (hits.length) html += card(`🔁 Có thể mua lại (${hits.length})`, rebuyTable(hits, true), 'grp-chot');
  if (waiting.length) html += lazyCard('wait', `🔁 Đang chờ giá mua lại (${waiting.length})`);
  return html;
}
// Tiệm đang hạ giá mua vào: ghi ở mọi nhóm (Nên chốt ghi riêng kèm lời nếu chênh lệch bình thường)
const cutSpan = s => s.cut ? `<span class="old">${cutText(s)}</span>; ` : '';
const GROUPS = [
  ['chot', '🟢 Nên chốt — đã đạt mục tiêu', s => (n => n ? `<span class="old">${n}</span> ` : '')([s.tut && tutText(s),
    s.cut && cutText(s) + (s.tut && s.cut.gNormal >= s.nt - EPS ? `; nếu chênh lệch như mọi khi, lời là ${fmtP(s.cut.gNormal)}, chưa dưới mức nhắc; không gấp thì đợi` : '')].filter(Boolean).join('; ')) +
    `<button class="sm primary" data-act="sell" data-id="${esc(s.lot.id)}">Bán…</button>
     <button class="sm" data-act="hold" data-id="${esc(s.lot.id)}">${s.tut ? 'Giữ tiếp' : 'Giữ, nâng mục tiêu'}</button>`],
  ['sap', '🟡 Sắp đạt — theo dõi', s => cutSpan(s) + `giá cần tăng ${fmtP(s.needUp, false)} (lên ${fmtM(s.targetPrice)}/${UNIT_NAME[s.t.don_vi_niem_yet]}) <button class="sm" data-act="sell" data-id="${esc(s.lot.id)}">Bán…</button>`],
  ['giu', '⚪ Giữ — chưa đạt mục tiêu', s => cutSpan(s) + (s.spreadLoss
    ? `<span class="muted">chưa qua chênh lệch mua–bán</span>, cần tăng ${fmtP(s.breakEven, false)} để hòa vốn`
    : `giá cần tăng ${fmtP(s.needUp, false)} (lên ${fmtM(s.targetPrice)}/${UNIT_NAME[s.t.don_vi_niem_yet]})`) +
    ` <button class="sm" data-act="sell" data-id="${esc(s.lot.id)}">Bán…</button>`],
  ['lo', '🔴 Đang lỗ — không nên bán, trừ khi cần tiền', s => (s.cut ? cutSpan(s) : s.wideLoss ? `<span class="old">tiệm đang nới chênh lệch: ${fmtP(s.spreadNow, false)}, thường ${fmtP(s.spreadUsual, false)}</span>, ` : '') + `cần giá tăng ${fmtP(s.breakEven, false)} để hòa vốn <button class="sm" data-act="sell" data-id="${esc(s.lot.id)}">Bán…</button>`]
];
const groupList = g => heldStates().filter(s => s.hasPrice && s.grp === g).sort((a, b) => b.g - a.g);
const groupTable = (g, list = groupList(g)) => `<div class="scroll">${lotStateTable(list, GROUPS.find(x => x[0] === g)[2])}</div>`;
function rebuyLists() {
  const rebuy = D.vang.ban.filter(b => b.gia_mua_lai > 0).map(b => {
    const lot = lotById(b.lo_id); const p = lot && latestPrice(lot.loai_id);
    return { b, lot, p, hit: p && p.ban_ra && p.ban_ra <= b.gia_mua_lai };
  }).filter(x => x.lot);
  return { hits: rebuy.filter(x => x.hit), waiting: rebuy.filter(x => !x.hit) };
}
const rebuyTable = (list, hit) => `<div class="scroll"><table class="cards"><tr class="hd"><th>Lô đã bán</th><th>Ngày bán</th><th>Đã bán</th><th class="n">Giá đã bán</th><th class="n">Giá muốn mua lại</th><th class="n">Tiệm bán ra hiện tại</th><th></th></tr>
    ${list.map(x => `<tr><td><b>${esc(x.lot.id)}</b> <span class="small muted">${esc(typeById(x.lot.loai_id)?.ten)}</span></td><td data-l="Ngày bán">${fmtD(x.b.ngay)}</td><td data-l="Đã bán">${x.b.so_mon} × ${fmtW(x.lot.trong_luong_mon_dem)}</td>
      <td class="n" data-l="Giá đã bán">${fmtM(x.b.gia_ban)}</td><td class="n" data-l="Giá muốn mua lại">${fmtM(x.b.gia_mua_lai)}</td><td class="n" data-l="Tiệm bán ra hiện tại">${x.p && x.p.ban_ra ? fmtM(x.p.ban_ra) + (x.p.ngay < today() ? ` <span class="small old">(giá ngày ${fmtD(x.p.ngay).slice(0, 5)})</span>` : '') : '—'}</td>
      <td>${hit ? `<button class="sm primary" data-act="rebuy" data-id="${esc(x.b.id)}">Mua lại…</button> ` : ''}<button class="sm" data-act="rebuy-clear" data-id="${esc(x.b.id)}">Bỏ nhắc</button></td></tr>`).join('')}</table></div>`;
// Phần thu gọn (nhóm Giữ, Đang chờ giá mua lại, Vì sao?): chỉ vẽ và chỉ tính khi đang mở; trạng thái mở nhớ trong ui
const LAZY = { giu: { flag: 'giuOpen', html: () => groupTable('giu') }, wait: { flag: 'waitOpen', html: () => rebuyTable(rebuyLists().waiting, false) },
  why: { flag: 'whyOpen', html: () => whyBody($('#priceForm')) } };
const lazyCard = (k, title) => `<section class="card${k === 'giu' ? ' grp-giu' : ''}"><details data-lazy="${k}"${ui[LAZY[k].flag] ? ' open' : ''}><summary><b>${title}</b> <span class="muted small">— bấm để xem</span></summary><div class="lazy-body">${ui[LAZY[k].flag] ? LAZY[k].html() : ''}</div></details></section>`;
function lotStateTable(list, extra) {
  return `<table class="lots"><tr class="hd"><th>Lô</th><th>Còn lại</th><th class="n">Vốn</th><th class="n">Giá trị hôm nay</th>
    <th class="n">Lời/lỗ</th><th class="n">%</th><th class="n">Mục tiêu</th><th class="n">So với gửi NH</th><th></th></tr>
    ${list.map(s => `<tr><td class="c-lo"><b>${esc(s.lot.id)}</b><br><span class="small muted">${esc(s.t?.ten)}</span></td><td class="c-con">${s.n} × ${fmtW(s.lot.trong_luong_mon_dem)}</td>
      <td class="n c-von">${fmtM(s.V)}</td><td class="n c-gt">${fmtM(s.G)}</td>
      <td class="n c-loi ${cls(s.L)}">${fmtMS(s.L)}</td><td class="n c-pct ${clsP(s.g)}"><b>${fmtP(s.g)}</b></td><td class="n c-kv">${fmtP(s.kv, false)}</td>
      <td class="n c-nh ${cls(s.vsBank)}">${fmtMS(s.vsBank)}</td><td class="c-act">${extra(s)}</td></tr>`).join('')}</table>`;
}
