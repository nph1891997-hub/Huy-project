// ===================== Tính toán vàng =====================
const r = () => D.tham_so.lai_suat_ngan_hang / 100;
const pi = () => D.tham_so.lam_phat / 100;
const typeById = id => D.vang.loai.find(t => t.id === id);
const lotById = id => D.vang.lo.find(l => l.id === id);
// Bộ nhớ đệm: giá mới nhất theo loại và số món đã bán theo lô (tính lại mỗi khi dữ liệu đổi)
let _cache = null;
function cache() {
  if (!_cache) {
    const lp = new Map(), sold = new Map();
    for (const p of D.vang.gia) { const b = lp.get(p.loai_id); if (!b || p.ngay >= b.ngay) lp.set(p.loai_id, p); }
    for (const b of D.vang.ban) sold.set(b.lo_id, (sold.get(b.lo_id) || 0) + b.so_mon);
    _cache = { lp, sold };
  }
  return _cache;
}
const latestPrice = typeId => cache().lp.get(typeId) || null;
// Chênh lệch mua–bán thường ngày của một loại: trung vị 90 ngày trước `ngay` (không tính chính ngày đó); dưới 10 dòng giá thì không xét
function usualSpread(typeId, ngay) {
  const c = cache(), k = typeId + '|' + ngay; c.us ||= new Map();
  if (!c.us.has(k)) {
    const from = addDays(ngay, -90), sp = [];
    for (const r of D.vang.gia) if (r.loai_id === typeId && r.ban_ra && r.ngay > from && r.ngay < ngay) sp.push(r.ban_ra / r.mua_vao - 1);
    c.us.set(k, sp.length >= 10 ? median(sp) : null);
  }
  return c.us.get(k);
}
// Giá mua vào của lần nhập gần nhất trước `ngay` mà chênh lệch không cao: mốc để biết tiệm hạ giá mua vào hay nâng giá bán ra
function normalBuy(typeId, ngay, usual) {
  const c = cache(), k = typeId + '|' + ngay; c.nb ||= new Map();
  if (!c.nb.has(k)) {
    let best = null;
    for (const r of D.vang.gia) if (r.loai_id === typeId && r.ban_ra && r.ngay < ngay && !isHighSpread(r.ban_ra / r.mua_vao - 1, usual) && (!best || r.ngay > best.ngay)) best = r;
    c.nb.set(k, best ? best.mua_vao : null);
  }
  return c.nb.get(k);
}
// Chênh lệch mua–bán cao bất thường: hơn 1,5 lần mức thường ngày VÀ cao hơn mức thường ít nhất 0,5 điểm %
// (loại có chênh lệch thường rất nhỏ, 0,5%, thì 0,8% chưa tính là cao). Mọi chỗ xét "chênh lệch cao" dùng hàm này
const SPREAD_X = 1.5, SPREAD_MIN = 0.005;
const isHighSpread = (now, usual) => usual != null && now != null && now > Math.max(SPREAD_X * usual, usual + SPREAD_MIN);
const EPS = 1e-6;   // so sánh % lời bỏ qua sai số tính toán (lô vốn 100tr, giá 115tr: máy tính ra 14,999…%)
const soldMon = lotId => cache().sold.get(lotId) || 0;
function lotW(lot) { const t = typeById(lot.loai_id); return lot.trong_luong_mon_dem / UNIT_DEM[t ? t.don_vi_niem_yet : 'chi']; }
function lotState(lot, asOf = today()) {
  const t = typeById(lot.loai_id);
  const w = lotW(lot);
  const n = lot.so_mon - soldMon(lot.id);
  const costMon = lot.tong_tien_mua / lot.so_mon;
  const V = n * costMon;
  const d = Math.max(0, days(lot.ngay_mua, asOf));
  const p = latestPrice(lot.loai_id);
  const s = { lot, t, w, n, costMon, V, d, p, hasPrice: !!p, kv: lot.ky_vong_pct / 100, sd: lot.sap_dat_pct / 100,
    nt: typeof lot.nhac_tut_pct === 'number' ? lot.nhac_tut_pct / 100 : null };
  if (!p) return s;
  s.P = p.mua_vao; s.valMon = w * s.P;
  s.G = n * s.valMon; s.L = s.G - V; s.g = V > 0 ? s.G / V - 1 : 0;
  s.annual = d >= 90 ? Math.pow(1 + s.g, 365 / d) - 1 : null;
  s.B = V * (1 + r() * d / 365); s.vsBank = s.G - s.B;
  s.real = (1 + s.g) / Math.pow(1 + pi(), d / 365) - 1;
  s.targetPrice = n > 0 ? V * (1 + s.kv) / (n * w) : null;
  s.needUp = s.targetPrice / s.P - 1;              // giá cần tăng bao nhiêu % nữa để đạt mục tiêu
  s.breakEven = s.G > 0 ? V / s.G - 1 : null;       // giá cần tăng bao nhiêu % để hòa vốn
  s.reached = s.g >= s.kv - EPS;
  // Đã giữ, nâng mục tiêu mà lời tụt dưới mức nhắc, kể cả khi nay đã lỗ (mức nhắc luôn được đặt thấp hơn lời lúc đặt)
  s.tut = !s.reached && s.nt != null && s.g < s.nt - EPS;
  s.costUnit = lot.tong_tien_mua / (lot.so_mon * w);               // giá vốn mỗi đơn vị niêm yết
  // Chênh lệch hôm nay cao bất thường: tiệm hạ giá mua vào mà giữ giá bán ra (thường gặp lúc thị trường biến động)
  s.spreadNow = p.ban_ra ? p.ban_ra / p.mua_vao - 1 : null; s.spreadUsual = p.ban_ra ? usualSpread(lot.loai_id, p.ngay) : null;
  s.spreadHigh = isHighSpread(s.spreadNow, s.spreadUsual);
  // Lỗ chỉ do chênh lệch mua–bán: giá tiệm bán ra chưa thấp hơn giá vốn (giá chưa giảm) và chênh lệch đang bình thường.
  // Chênh lệch cao bất thường thì phần lỗ là thật: bán lúc này thiệt hơn hẳn mọi khi
  const notBelow = s.g < 0 && !!p.ban_ra && p.ban_ra >= s.costUnit - 0.5;
  s.spreadLoss = notBelow && !s.spreadHigh; s.wideLoss = notBelow && s.spreadHigh;
  // Tiệm hạ giá mua vào (chênh lệch cao và giá mua vào thấp hơn lần nhập gần nhất có chênh lệch bình thường): bán hôm nay thiệt hơn ngày thường.
  // Chênh lệch cao vì tiệm nâng giá bán ra thì giá mua vào không giảm, bán không thiệt: không ghi gì
  if (s.spreadHigh) {
    const pm = normalBuy(lot.loai_id, p.ngay, s.spreadUsual);
    if (pm && s.P < pm) { const Ps = p.ban_ra / (1 + s.spreadUsual); s.cut = { Ps, unitLoss: w * (Ps - s.P), gNormal: Ps / s.costUnit - 1 }; }
  }
  s.grp = s.reached || s.tut ? 'chot' : s.g < 0 && !s.spreadLoss ? 'lo' : s.g >= 0 && s.needUp <= s.sd + EPS ? 'sap' : 'giu';
  return s;
}
// Đỉnh lời kể từ ngày mua, theo giá đã nhập: lời tại một ngày = giá tiệm mua vào ngày đó / giá vốn mỗi đơn vị − 1
function peakSince(lot, costUnit) {
  let best = null;
  for (const p of D.vang.gia) if (p.loai_id === lot.loai_id && p.ngay >= lot.ngay_mua && (!best || p.mua_vao > best.mua_vao)) best = p;
  return best && { g: best.mua_vao / costUnit - 1, ngay: best.ngay };
}
// Tiệm đang hạ giá mua vào: bán k món hôm nay được ít hơn ngày thường bao nhiêu
const cutText = (s, k = s.n, what = 'hôm nay') => `tiệm đang hạ giá mua vào, chênh lệch ${fmtP(s.spreadNow, false)} (thường ${fmtP(s.spreadUsual, false)}): bán ${what} được ít hơn ngày thường khoảng ${NFP.format(k * s.cut.unitLoss / 1e6)}tr`;
const tutText = s => { const pk = peakSince(s.lot, s.costUnit);
  return `lời tụt ${pk ? `từ ${fmtP(pk.g)} (${fmtD(pk.ngay).slice(0, 5)}) ` : ''}về ${fmtP(s.g)}${s.g < 0 ? ' (đã lỗ)' : ''}, dưới mức nhắc ${fmtP(s.nt, false)}`; };
function saleCalc(sale, lot = lotById(sale.lo_id)) {
  if (!lot) return null;
  const w = lotW(lot), costMon = lot.tong_tien_mua / lot.so_mon, d = Math.max(0, days(lot.ngay_mua, sale.ngay));
  const thu = sale.so_mon * w * sale.gia_ban, von = sale.so_mon * costMon, loi = thu - von;
  const bank = von * (1 + r() * d / 365);
  return { lot, w, d, thu, von, loi, g: von > 0 ? loi / von : 0, bank, vsBank: thu - bank };
}
function nextLotId(y) {
  const used = D.vang.lo.filter(l => l.id.startsWith(`V-${y}-`)).map(l => parseInt(l.id.slice(7), 10) || 0);
  const seq = Math.max(D.vang.so_thu_tu.lo[y] || 0, ...used) + 1;
  D.vang.so_thu_tu.lo[y] = seq;
  return `V-${y}-${String(seq).padStart(3, '0')}`;
}
function nextSaleId() {
  const used = D.vang.ban.map(b => parseInt(b.id.slice(2), 10) || 0);
  D.vang.so_thu_tu.ban = Math.max(D.vang.so_thu_tu.ban || 0, ...used) + 1;
  return 'B-' + String(D.vang.so_thu_tu.ban).padStart(4, '0');
}
// Gợi ý mua thêm cho một loại (đặc tả mục 3.5). q, p: giá tiệm bán ra, mua vào của ngày `ngay` (giá vừa gõ cũng tính).
// Phía mua dùng giá tiệm bán ra (giá mình phải trả). Cửa sổ 90 ngày tính tới `ngay`.
function buyInfo(t, q, p, ngay) {
  if (!q) return null;
  const X = D.tham_so.vang_mua_giam_pct / 100, from = addDays(ngay, -90);
  const rows = D.vang.gia.filter(r => r.loai_id === t.id && r.ban_ra && r.ngay > from && r.ngay < ngay).map(r => ({ ngay: r.ngay, q: r.ban_ra, p: r.mua_vao }));
  const win = rows.concat({ ngay, q, p });
  const peak = win.reduce((a, r) => r.q > a.q ? r : a);
  // Mốc rải: lần mua gần nhất trong cửa sổ, chỉ xét lô còn đang giữ (lô đã bán hết không chặn lần mua sau)
  const lot = D.vang.lo.filter(l => l.loai_id === t.id && l.ngay_mua > from && l.ngay_mua <= ngay && l.so_mon - soldMon(l.id) > 0)
    .sort((a, b) => b.ngay_mua.localeCompare(a.ngay_mua) || b.id.localeCompare(a.id))[0];
  const lastUnit = lot ? lot.tong_tien_mua / (lot.so_mon * lotW(lot)) : null;
  const mDinh = peak.q * (1 - X), mRai = lastUnit ? lastUnit * (1 - X) : null;
  const entry = mRai != null ? Math.min(mDinh, mRai) : mDinh;
  const spread = p ? q / p - 1 : null, usual = usualSpread(t.id, ngay);
  const held = heldStates().reduce((a, s) => a + s.V, 0), limit = D.tham_so.vang_han_muc_von || null;
  const mine = heldStates().filter(s => s.lot.loai_id === t.id);
  const avg = mine.length ? mine.reduce((a, s) => a + s.V, 0) / mine.reduce((a, s) => a + s.n * s.w, 0) : null;
  // Mốc mua lại: giá muốn mua lại cao nhất bạn đặt khi bán loại này, còn đang chờ
  const rb = D.vang.ban.filter(x => x.gia_mua_lai > 0 && lotById(x.lo_id)?.loai_id === t.id).reduce((a, x) => !a || x.gia_mua_lai > a.gia_mua_lai ? x : a, null);
  const rebuyMark = rb ? rb.gia_mua_lai : null, near = rebuyMark != null ? Math.max(entry, rebuyMark) : entry;
  const chot = mine.filter(s => s.hasPrice && s.grp === 'chot');   // lô cùng loại đang ở nhóm Nên chốt
  const b = { t, q, p, ngay, X, win, peak, lot, lastUnit, mDinh, mRai, entry, gapEntry: 1 - entry / q, rb, rebuyMark, near, gap: 1 - near / q, chot,
    drop: q / peak.q - 1, spread, usual, held, limit, avg, days: new Set(win.map(r => r.ngay)).size };
  // Món quen: trọng lượng mỗi món của lô nhập gần nhất cùng loại (như form Thêm lô); chưa có lô thì 1 đơn vị niêm yết
  const unitDem = UNIT_DEM[t.don_vi_niem_yet];
  b.itemDem = [...D.vang.lo].reverse().find(l => l.loai_id === t.id)?.trong_luong_mon_dem || unitDem;
  b.itemPrice = q * b.itemDem / unitDem;
  // Mốc mua lại là kế hoạch bạn đặt lúc bán nên xét trước "Cân nhắc"; có lô cùng loại đang Nên chốt thì ghi kèm để bạn tự quyết
  b.kind = limit && (held >= limit || limit - held < b.itemPrice) ? 'full' : isHighSpread(spread, usual) ? 'wait'
    : rebuyMark != null && q <= rebuyMark ? 'rebuy'
    : chot.length && q <= near ? 'consider'          // vừa nên chốt vừa vùng mua: bán rồi mua lại là mất chênh lệch 2 lần
    : q <= entry ? 'buy' : 'notyet';
  if (limit) { b.left = limit - held; const dem = b.left / q * UNIT_DEM[t.don_vi_niem_yet]; b.leftDem = dem >= 1000 ? Math.floor(dem / 1000) * 1000 : Math.floor(dem / 100) * 100; }
  return b;
}
function buyCell(t, ngay, mv, br, fresh) {
  if (!br) return '<span class="muted">—</span>';
  if (!fresh) return `<span class="old">nhập giá ${ngay === today() ? 'hôm nay' : 'ngày ' + fmtD(ngay)}</span>`;
  const b = buyInfo(t, br, mv, ngay);
  const few = b.days < 14 ? `<br><span class="small old">(mới có ${b.days} ngày giá)</span>` : '';
  if (b.kind === 'full') return `⛔ <b>Đủ hạn mức</b><br><span class="small muted">${b.held >= b.limit ? `vốn đang giữ ${fmtTr(b.held)} / ${fmtTr(b.limit)}`
    : `còn ${fmtTr(b.left)}, chưa đủ 1 món ${fmtW(b.itemDem)} (${fmtTr(b.itemPrice)})`}</span>`;
  if (b.kind === 'wait') return `🟠 <b>Đợi, chênh lệch cao</b><br><span class="small muted">mua hôm nay cần tăng ${fmtP(b.spread, false)} mới hòa vốn, thường ${fmtP(b.usual, false)}</span>` + few;
  if (b.kind === 'consider') return `🟡 <b>Cân nhắc</b><br><span class="small muted">đang có lô ${b.chot.map(s => esc(s.lot.id)).join(', ')} nên chốt: chốt lô đó, hoặc giữ nó thay cho mua thêm</span>` + few;
  if (b.kind === 'rebuy') return `🟢 <b>Mua lại</b> <button type="button" class="sm primary" data-act="rebuy" data-id="${esc(b.rb.id)}">Mua lại…</button><br><span class="small muted">chạm giá bạn đặt khi bán ${esc(b.rb.id)} (${fmtTr(b.rebuyMark)})</span>` +
    (b.chot.length ? `<br><span class="small old">lô ${b.chot.map(s => esc(s.lot.id) + (s.reached ? ' đã đạt mục tiêu' : ' đang tụt dưới mức nhắc')).join(', ')} cũng ở Nên chốt: muốn mua lại thì ${b.chot.every(s => s.reached) ? 'chốt' : 'Giữ tiếp'} lô đó trước, đừng vừa bán vừa mua</span>` : '') + few;
  if (b.kind === 'buy') return `🟢 <b>Vùng mua</b> <button type="button" class="sm primary" data-act="buy" data-id="${esc(t.id)}">Mua…</button>` +
    (b.limit ? `<br><span class="small muted">còn ${fmtTr(b.left)} trong hạn mức ≈ ${fmtW(b.leftDem)}</span>` : '') + few;
  return `⚪ Chưa tới<br><span class="small muted">mua khi bán ra ≤ ${fmtTr(b.near)} (còn cách ${fmtP(b.gap, false)})</span>` + few;
}
// Giá dùng cho gợi ý mua của một loại: giá đang gõ trong bảng giá (f), hoặc giá đã lưu khi chưa có bảng.
// fresh: đã có giá của ngày đang chọn (đã lưu, vừa gõ khác giá cũ, hoặc tick Không đổi)
function priceVals(t, f) {
  const ngay = f ? (validDate(f.ngay.value) ? f.ngay.value : today()) : ui.priceDate, lp = basePrice(t.id, ngay);
  if (!f) return { lp, ngay, mv: lp?.mua_vao, br: lp?.ban_ra, fresh: !!lp && lp.ngay === ngay };
  const mv = parseM(f['mv_' + t.id].value), br = parseM(f['br_' + t.id].value);
  const changed = mv && (!lp || lp.mua_vao !== mv || (lp.ban_ra || 0) !== br);
  return { lp, ngay, mv, br, fresh: (!!lp && lp.ngay === ngay) || !!changed || !!f['kd_' + t.id]?.checked };
}
// Tính lại cột Mua thêm? và phần Vì sao? theo giá đang gõ (chưa cần bấm Cập nhật)
function refreshBuy(f) {
  for (const t of D.vang.loai) { const el = document.getElementById('buy_' + t.id); if (el) { const v = priceVals(t, f); el.innerHTML = buyCell(t, v.ngay, v.mv, v.br, v.fresh); } }
  const w = document.getElementById('whyBody'); if (w && w.parentNode.open) w.innerHTML = whyBody(f);   // thu gọn thì chưa tính
}
function whyBody(f) {
  return D.vang.loai.map(t => {
    const v = priceVals(t, f);
    if (v.fresh) return whyBlock(t, v.ngay, v.mv, v.br, true);
    return v.lp ? whyBlock(t, v.lp.ngay, v.lp.mua_vao, v.lp.ban_ra, false) : whyBlock(t, v.ngay, 0, 0, false);
  }).join('');
}
function whyBlock(t, ngay, mv, br, fresh) {
  const u = UNIT_NAME[t.don_vi_niem_yet];
  if (!br) return `<div class="why"><h3>${esc(t.ten)}</h3><p class="muted">Chưa có giá tiệm bán ra.</p></div>`;
  const b = buyInfo(t, br, mv, ngay);
  const li = [
    `Tiệm bán ra ${ngay === today() ? 'hôm nay' : 'ngày ' + fmtD(ngay)}: <b>${fmtTr(b.q)}</b>/${u} · đỉnh 90 ngày ${fmtTr(b.peak.q)} (${fmtD(b.peak.ngay)}) · ${b.drop < 0 ? 'giảm <b>' + fmtP(-b.drop, false) + '</b> từ đỉnh' : 'đang ở đỉnh'}`,
    `Mốc đỉnh (giảm ${fmtP(b.X, false)} từ đỉnh): ${fmtTr(b.mDinh)}` + (b.lot
      ? ` · lần mua gần nhất ${fmtD(b.lot.ngay_mua)} giá ${fmtTr(b.lastUnit)} (${esc(b.lot.id)}) → mốc rải ${fmtTr(b.mRai)}` : ' · chưa mua loại này trong 90 ngày'),
    `Giá vào vùng mua: <b>${fmtTr(b.entry)}</b>${b.q <= b.entry ? ' · đang trong vùng mua' : ' · còn cách ' + fmtP(b.gapEntry, false)}`,
    `Chênh lệch mua–bán: ${b.spread != null ? fmtP(b.spread, false) : '—'} · thường ngày ${b.usual != null ? fmtP(b.usual, false) : 'chưa đủ 10 ngày giá để so'}`,
    `Giá vốn bình quân đang giữ: ${b.avg ? fmtTr(b.avg) + '/' + u : 'chưa giữ lô nào'}`
  ];
  if (b.rb) li.push(`Giá muốn mua lại đang chờ: <b>${fmtTr(b.rebuyMark)}</b> (đặt khi bán ${esc(b.rb.id)} ngày ${fmtD(b.rb.ngay)})${b.q <= b.rebuyMark ? ' · đã chạm' : ''}`);
  if (b.chot.length) li.push(`Đang có lô nên chốt cùng loại: ${b.chot.map(s => `${esc(s.lot.id)} (${fmtP(s.g)})`).join(', ')}; vừa chốt vừa mua thêm là mất chênh lệch mua–bán 2 lần`);
  if (b.limit) li.push(`Vốn đang giữ / hạn mức: ${fmtTr(b.held)} / ${fmtTr(b.limit)}`);
  return `<div class="why"><h3>${esc(t.ten)}${fresh ? '' : ` <span class="small old">· theo giá ngày ${fmtD(ngay)}, chưa có giá ngày đang chọn</span>`}</h3>
    ${b.days < 14 ? `<p class="small old">Mới có ${b.days} ngày giá, đỉnh 90 ngày chưa đủ tin cậy. Có thể nhập bù giá các ngày trước bằng ô Ngày.</p>` : ''}
    <div class="legend"><span style="color:var(--accent)">━</span> tiệm bán ra · <span style="color:#b9c0c8">━</span> tiệm mua vào · <span style="color:var(--green)">╌</span> vùng mua · ┈ giá vốn bình quân · <span style="color:var(--green)">▲</span> lần mua · <span style="color:var(--red)">▼</span> lần bán</div>
    ${chartSvg(b)}<ul>${li.map(x => `<li>${x}</li>`).join('')}</ul></div>`;
}
// Biểu đồ 90 ngày (SVG tự vẽ, không dùng thư viện để app vẫn một file, mở offline được)
const CHARTS = {};
function chartSvg(b) {
  const W = 640, H = 200, L = 56, R = 10, T = 10, B = 22, x0 = addDays(b.ngay, -89), span = 89;
  const X = d => L + (W - L - R) * Math.max(0, Math.min(span, days(x0, d))) / span;
  const pts = b.win.slice().sort((a, c) => a.ngay.localeCompare(c.ngay));
  const buys = D.vang.lo.filter(l => l.loai_id === b.t.id && l.ngay_mua >= x0 && l.ngay_mua <= b.ngay)
    .map(l => ({ ngay: l.ngay_mua, v: l.tong_tien_mua / (l.so_mon * lotW(l)), id: l.id }));
  const ids = new Set(D.vang.lo.filter(l => l.loai_id === b.t.id).map(l => l.id));
  const sells = D.vang.ban.filter(x => ids.has(x.lo_id) && x.ngay >= x0 && x.ngay <= b.ngay).map(x => ({ ngay: x.ngay, v: x.gia_ban }));
  const vals = pts.flatMap(r => [r.q, r.p]).concat(b.entry, b.avg || [], b.rebuyMark || [], buys.map(z => z.v), sells.map(z => z.v)).filter(v => v > 0);
  const vmin = Math.min(...vals), vmax = Math.max(...vals), pad = (vmax - vmin) * 0.08 || vmax * 0.02, lo = vmin - pad, hi = vmax + pad;
  const Y = v => T + (H - T - B) * (hi - v) / (hi - lo);
  const line = k => pts.filter(r => r[k]).map(r => X(r.ngay).toFixed(1) + ',' + Y(r[k]).toFixed(1)).join(' ');
  const hline = (v, cls, label, left) => `<line x1="${L}" x2="${W - R}" y1="${Y(v).toFixed(1)}" y2="${Y(v).toFixed(1)}" class="${cls}"/>` +
    `<text x="${left ? L + 4 : W - R - 2}" y="${(Y(v) - 3).toFixed(1)}" text-anchor="${left ? 'start' : 'end'}" class="lbl">${label}</text>`;
  CHARTS[b.t.id] = { W, X, pts };
  return `<svg viewBox="0 0 ${W} ${H}" class="chart" data-chart="${esc(b.t.id)}" role="img" aria-label="Biểu đồ giá 90 ngày ${esc(b.t.ten)}">
    <line x1="${L}" x2="${L}" y1="${T}" y2="${H - B}" class="axis"/><line x1="${L}" x2="${W - R}" y1="${H - B}" y2="${H - B}" class="axis"/>
    <text x="${L - 6}" y="${(Y(vmax) + 4).toFixed(1)}" text-anchor="end" class="ax">${fmtTr(vmax)}</text>
    <text x="${L - 6}" y="${(Y(vmin) + 4).toFixed(1)}" text-anchor="end" class="ax">${fmtTr(vmin)}</text>
    <text x="${L}" y="${H - 6}" class="ax">${fmtD(x0).slice(0, 5)}</text><text x="${W - R}" y="${H - 6}" text-anchor="end" class="ax">${fmtD(b.ngay).slice(0, 5)}</text>
    ${hline(b.entry, 'l-entry', 'vùng mua ' + fmtTr(b.entry))}${b.avg ? hline(b.avg, 'l-avg', 'giá vốn bq ' + fmtTr(b.avg), true) : ''}${b.rebuyMark ? hline(b.rebuyMark, 'l-rebuy', 'mua lại ' + fmtTr(b.rebuyMark), true) : ''}
    <polyline points="${line('p')}" class="l-mv"/><polyline points="${line('q')}" class="l-br"/>
    ${buys.map(z => `<path d="M${X(z.ngay).toFixed(1)},${(Y(z.v) - 5).toFixed(1)}l5,9h-10z" class="m-buy"><title>Mua ${esc(z.id)} ${fmtD(z.ngay)}: ${fmtTr(z.v)}</title></path>`).join('')}
    ${sells.map(z => `<path d="M${X(z.ngay).toFixed(1)},${(Y(z.v) + 5).toFixed(1)}l5,-9h-10z" class="m-sell"><title>Bán ${fmtD(z.ngay)}: ${fmtTr(z.v)}</title></path>`).join('')}
    <line class="guide hidden" x1="0" x2="0" y1="${T}" y2="${H - B}"/>
  </svg><div class="small muted" id="tip_${esc(b.t.id)}">Rê chuột hoặc chạm vào biểu đồ để xem giá từng ngày.</div>`;
}
function chartHover(svg, e) {
  const c = CHARTS[svg.dataset.chart]; if (!c || !c.pts.length) return;
  const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * c.W / r.width;
  const p = c.pts.reduce((a, q) => Math.abs(c.X(q.ngay) - x) < Math.abs(c.X(a.ngay) - x) ? q : a);
  const g = svg.querySelector('.guide'); g.classList.remove('hidden'); g.setAttribute('x1', c.X(p.ngay)); g.setAttribute('x2', c.X(p.ngay));
  const tip = document.getElementById('tip_' + svg.dataset.chart);
  if (tip) tip.textContent = `${fmtD(p.ngay)}: tiệm bán ra ${fmtM(p.q)} · mua vào ${p.p ? fmtM(p.p) : '—'}`;
}
const openLots = () => D.vang.lo.filter(l => l.so_mon - soldMon(l.id) > 0);
// Trạng thái các lô đang giữ: tính một lần mỗi khi dữ liệu đổi (nhóm lô, gợi ý mua, hạn mức đều dùng); chỉ để đọc
const heldStates = () => { const c = cache(); return c.held ||= openLots().map(l => lotState(l)); };
// Kết quả của mọi lần bán (kèm lần bán), bỏ lần bán không còn lô; tra lô qua bản đồ để không quét danh sách lô mỗi lần
const saleCalcs = () => { const m = new Map(D.vang.lo.map(l => [l.id, l])); return D.vang.ban.map(b => { const c = saleCalc(b, m.get(b.lo_id)); return c && Object.assign(c, { sale: b }); }).filter(Boolean); };
const realizedTotal = () => saleCalcs().reduce((a, c) => a + c.loi, 0);
const sellK = { het: s => s.n, nua: s => Math.ceil(s.n / 2), von: s => Math.min(s.n, Math.max(1, Math.ceil(s.V / s.valMon))) };
