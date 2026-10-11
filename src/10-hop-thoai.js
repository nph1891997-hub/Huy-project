// ===================== Hộp thoại =====================
const dlg = $('#dlg');
let dlgSubmit = null;
// Hộp mở trước nửa đêm, xác nhận sau nửa đêm: ô Ngày còn là ngày mặc định lúc mở thì lấy hôm nay (đã chủ động đổi ngày thì giữ)
let dlgDay = '';
const dlgDate = f => { if (f.ngay.value === dlgDay && today() !== dlgDay) f.ngay.value = today(); return f.ngay.value; };
function openDlg(html, onSubmit, onInput) {
  dlg.innerHTML = `<form id="dlgForm" novalidate>${html}</form>`;
  dlgSubmit = onSubmit; dlgDay = today();
  const f = $('#dlgForm');
  if (onInput) { f.addEventListener('input', e => onInput(f, e)); onInput(f, {}); }
  // Enter ở bất kỳ ô nào = nút chính (nút Hủy đứng trước nên trình duyệt hay lấy nhầm nút Hủy); Esc = Hủy (sẵn có của hộp thoại)
  f.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.isComposing && e.target.matches('input')) { e.preventDefault(); f.querySelector('.dlg-actions button.primary')?.click(); }
  });
  dlg.showModal();
}
dlg.addEventListener('submit', e => {
  e.preventDefault();
  if (e.submitter && e.submitter.value === 'cancel') return dlg.close();
  if (dlgSubmit && dlgSubmit($('#dlgForm')) !== false) dlg.close();
});

function wInputs(prefix, dem) {
  const o = splitW(dem);
  return UNITS.map(([k, , n]) => `<label class="field"><span>${n}</span><input class="w" type="number" min="0" name="${prefix}_${k}" value="${o[k] || ''}"></label>`).join('');
}
const readW = (f, prefix) => UNITS.reduce((a, [k, v]) => a + Math.max(0, Math.floor(parseN(f[prefix + '_' + k].value))) * v, 0);

function dlgLot(lot, prefill) {
  const isEdit = !!lot;
  const T = D.tham_so;
  const fromSale = prefill && prefill.fromSale;
  // Lô mới: mặc định loại của lô nhập gần nhất, trọng lượng mỗi món của lô gần nhất cùng loại;
  // loại chưa có lô nào (kể cả loại mới tạo trong form) thì 1 đơn vị niêm yết của loại
  const lastW = (typeId, newUnit = 'luong') => [...D.vang.lo].reverse().find(l => l.loai_id === typeId)?.trong_luong_mon_dem ||
    UNIT_DEM[typeId === '__new' ? newUnit : typeById(typeId)?.don_vi_niem_yet || 'chi'];
  const defType = prefill?.loai_id || D.vang.lo.at(-1)?.loai_id || D.vang.loai[0]?.id || '__new';
  lot = lot || Object.assign({ ngay_mua: today(), loai_id: defType, so_mon: 1, trong_luong_mon_dem: lastW(defType), tong_tien_mua: 0, ky_vong_pct: T.vang_ky_vong_mac_dinh, sap_dat_pct: T.vang_sap_dat_mac_dinh, ghi_chu: '' }, prefill || {});
  // wTouched: đã gõ trọng lượng, không tự đổi theo loại nữa. wPrefill: trọng lượng đang là số điền sẵn,
  // lần đầu gõ vào một ô thì xóa các ô còn lại (tránh 1 chỉ điền sẵn + gõ 1 lượng = 1 lượng 1 chỉ)
  let last = prefill?.don_gia ? 'dg' : 'tong', autoPrice = !isEdit && !prefill?.don_gia, wTouched = isEdit || !!(prefill && prefill.trong_luong_mon_dem), wPrefill = !isEdit;
  openDlg(`<h2>${isEdit ? 'Sửa lô ' + esc(lot.id) : fromSale ? 'Mua lại (từ lần bán ' + esc(fromSale) + ')' : 'Thêm lô vàng'}</h2>
    <div class="row"><label class="field"><span>Ngày mua</span><input type="date" name="ngay" value="${lot.ngay_mua}" max="${today()}" required></label>
      <label class="field"><span>Loại vàng</span><select name="loai">${typeOptions(lot.loai_id)}<option value="__new" ${lot.loai_id === '__new' ? 'selected' : ''}>➕ Loại mới…</option></select></label></div>
    <div class="row" id="newType"><label class="field"><span>Tên loại mới</span><input name="ten_moi" placeholder="VD: SJC miếng"></label>
      <label class="field"><span>Đơn vị niêm yết giá</span><select name="dv_moi">${unitOptions('luong')}</select></label></div>
    <div class="row"><label class="field"><span>Số món</span><input type="number" min="1" name="so_mon" value="${lot.so_mon}" style="width:70px"></label>
      <span style="padding-bottom:6px">×</span> ${wInputs('w', lot.trong_luong_mon_dem)}</div>
    <p id="wInfo"></p>
    <div class="row"><label class="field"><span id="dgLabel">Đơn giá</span><input class="money" name="don_gia" value="${fmtIn(prefill?.don_gia)}"></label>
      <label class="field"><span>Tổng tiền mua</span><input class="money" name="tong" value="${fmtIn(lot.tong_tien_mua)}"></label></div>
    <div class="row"><label class="field"><span>% kỳ vọng</span><input type="number" step="0.1" name="kv" value="${lot.ky_vong_pct}"></label></div>
    <details${lot.ghi_chu || lot.sap_dat_pct !== T.vang_sap_dat_mac_dinh || typeof lot.nhac_tut_pct === 'number' ? ' open' : ''}><summary>Tùy chọn khác: mức báo sắp đạt, nhắc khi lời tụt, ghi chú</summary>
      <div class="row"><label class="field"><span>Báo "sắp đạt" khi giá còn cần tăng ≤ (%)</span><input type="number" step="0.1" name="sd" value="${lot.sap_dat_pct}"></label>
      <label class="field" id="ntField"><span>Nhắc chốt nếu lời tụt về (%)</span><input type="number" step="0.1" name="nt" value="${lot.nhac_tut_pct ?? ''}" placeholder="trống = không nhắc"${latestPrice(lot.loai_id) ? '' : ' disabled title="Loại này chưa có giá, chưa đặt được mức nhắc"'}></label>
      <label class="field" style="flex:1"><span>Ghi chú</span><input name="ghi_chu" value="${esc(lot.ghi_chu)}" placeholder="Nơi mua, số seri…"></label></div></details>
    <div class="dlg-actions"><button value="cancel" type="submit" formnovalidate>Hủy</button><button class="primary" type="submit">Lưu</button></div>`,
    f => {
      const n = Math.floor(parseN(f.so_mon.value)), wd = readW(f, 'w'), tong = parseM(f.tong.value);
      let loai = f.loai.value;
      if (!isEdit) dlgDate(f);
      if (!f.ngay.value) return tell('Chưa nhập ngày mua.'), false;
      if (n < 1) return tell('Số món phải từ 1 trở lên.'), false;
      if (wd < 1) return tell('Chưa nhập trọng lượng mỗi món.'), false;
      if (tong <= 0) return tell('Chưa nhập giá mua.'), false;
      if (loai === '__new' && !f.ten_moi.value.trim()) return tell('Chưa nhập tên loại vàng mới.'), false;
      if (isEdit && n < soldMon(lot.id)) return tell('Lô đã bán ' + soldMon(lot.id) + ' món, số món không được nhỏ hơn.'), false;
      if (isEdit && D.vang.ban.some(b => b.lo_id === lot.id && b.ngay < f.ngay.value)) return tell('Ngày mua không được sau ngày của các lần bán.'), false;
      if (f.ngay.value > today()) return tell('Ngày mua không được sau hôm nay.'), false;
      if (!(parseN(f.kv.value) > 0)) return tell('% kỳ vọng phải lớn hơn 0.'), false;
      if (parseN(f.sd.value) < 0) return tell('Mức báo sắp đạt không được âm.'), false;
      const unitSel = loai === '__new' ? f.dv_moi.value : typeById(loai)?.don_vi_niem_yet;
      const ntRaw = f.nt.disabled || $('#ntField').classList.contains('hidden') ? String(lot.nhac_tut_pct ?? '') : f.nt.value.trim();
      if (ntRaw !== '' && (!isEdit || parseN(ntRaw) !== lot.nhac_tut_pct)) {   // chỉ xét khi đặt mức mới
        const nt = parseN(ntRaw), p = loai === '__new' ? null : latestPrice(loai);
        if (!(nt > 0)) return tell('Mức nhắc khi lời tụt phải lớn hơn 0, hoặc để trống.'), false;
        if (!p) return tell('Loại vàng này chưa có giá, chưa đặt được mức nhắc.'), false;
        const g = p.mua_vao / (tong / (n * wd / UNIT_DEM[unitSel])) - 1;
        if (nt >= g * 100) return tell(`Mức nhắc phải thấp hơn lời hiện tại (${fmtP(g)}), hoặc để trống.`), false;
      }
      if (isEdit && soldMon(lot.id) > 0 && loai !== '__new' && typeById(loai)?.don_vi_niem_yet !== typeById(lot.loai_id)?.don_vi_niem_yet)
        return tell('Lô đã có lần bán tính giá theo ' + UNIT_NAME[typeById(lot.loai_id)?.don_vi_niem_yet] + ', không đổi sang loại vàng có đơn vị niêm yết khác được.'), false;
      if (isEdit && soldMon(lot.id) > 0 && loai === '__new' && f.dv_moi.value !== typeById(lot.loai_id)?.don_vi_niem_yet)
        return tell('Lô đã có lần bán, loại mới phải cùng đơn vị niêm yết với loại cũ.'), false;
      { // chống gõ nhầm đơn giá (nhầm giá lượng/chỉ, thừa/thiếu số 0) với lô mua gần đây
        const unit = loai === '__new' ? f.dv_moi.value : typeById(loai)?.don_vi_niem_yet, p = loai === '__new' ? null : latestPrice(loai);
        const dg = tong / (n * wd / UNIT_DEM[unit]);
        if (p && p.ban_ra && f.ngay.value >= p.ngay && Math.abs(dg / p.ban_ra - 1) > 0.15 &&
          !ask(`Đơn giá ${fmtM(dg)}/${UNIT_NAME[unit]} lệch ${fmtP(dg / p.ban_ra - 1)} so với giá tiệm bán ra ngày ${fmtD(p.ngay)} (${fmtM(p.ban_ra)}). Giá này có đúng không?`)) return false;
      }
      const lim = D.tham_so.vang_han_muc_von;
      if (lim) {   // thêm lô, hoặc sửa lô làm vốn đang giữ tăng lên: hỏi khi vượt hạn mức
        const held = openLots().reduce((a, l) => a + lotState(l).V, 0), left = n - (isEdit ? soldMon(lot.id) : 0);
        const before = isEdit ? lotState(lot).V : 0, after = held - before + left * tong / n;
        if (after > lim && after > held + 0.5 && !ask(`Vốn đang giữ sẽ lên ${fmtTr(after)}, vượt hạn mức ${fmtTr(lim)}. Vẫn lưu?`)) return false;
      }
      if (loai === '__new') {
        loai = 't' + Date.now().toString(36);
        D.vang.loai.push({ id: loai, ten: f.ten_moi.value.trim(), don_vi_niem_yet: f.dv_moi.value });
      }
      const data = { loai_id: loai, ngay_mua: f.ngay.value, so_mon: n, trong_luong_mon_dem: wd, tong_tien_mua: tong, ky_vong_pct: parseN(f.kv.value), sap_dat_pct: parseN(f.sd.value), nhac_tut_pct: ntRaw === '' ? null : parseN(ntRaw), ghi_chu: f.ghi_chu.value.trim() };
      if (isEdit) Object.assign(lotById(lot.id), data);
      else {
        D.vang.lo.push(Object.assign({ id: nextLotId(data.ngay_mua.slice(0, 4)) }, data));
      }
      if (fromSale) { const b = D.vang.ban.find(x => x.id === fromSale); if (b) b.gia_mua_lai = null; }
      // Đã mua lô cùng loại sau khi bán (bằng + Thêm lô, Mua…): các nhắc mua lại của loại này coi như xong, như khi bấm Mua lại…
      const off = isEdit ? [] : D.vang.ban.filter(b => b.gia_mua_lai > 0 && b.ngay <= data.ngay_mua && lotById(b.lo_id)?.loai_id === loai).map(b => ({ id: b.id, gia: b.gia_mua_lai }));
      for (const x of off) D.vang.ban.find(b => b.id === x.id).gia_mua_lai = null;
      const newId = D.vang.lo.at(-1).id;
      commit(isEdit ? 'sửa lô ' + lot.id : 'thêm lô ' + newId);
      if (off.length) {
        ui.rebuyOff = off;
        setNotice(`Đã tắt nhắc mua lại ${off.map(x => `${esc(x.id)} (${fmtTr(x.gia)})`).join(', ')} vì vừa mua ${esc(newId)} cùng loại. <button class="sm" data-act="rebuy-keep">Giữ lại nhắc</button>`);
      }
    },
    (f, e) => {
      const isNew = f.loai.value === '__new';
      $('#newType').classList.toggle('hidden', !isNew);
      f.nt.disabled = isNew || !latestPrice(f.loai.value);
      if (e.target && /^w_/.test(e.target.name)) {
        if (wPrefill) for (const [k] of UNITS) if ('w_' + k !== e.target.name) f['w_' + k].value = '';
        wTouched = true; wPrefill = false;
      }
      if (e.target && (e.target.name === 'loai' || e.target.name === 'dv_moi') && !wTouched) {
        const o = splitW(lastW(f.loai.value, f.dv_moi.value)); for (const [k] of UNITS) f['w_' + k].value = o[k] || '';
      }
      const unit = isNew ? f.dv_moi.value : typeById(f.loai.value)?.don_vi_niem_yet || 'chi';
      const n = Math.floor(parseN(f.so_mon.value)), wd = readW(f, 'w'), qty = n * wd / UNIT_DEM[unit];
      $('#dgLabel').textContent = 'Đơn giá (mỗi ' + UNIT_NAME[unit] + ')';
      const qtyStr = qty.toLocaleString('vi-VN', { maximumFractionDigits: 4 }) + ' ' + UNIT_NAME[unit];
      $('#wInfo').innerHTML = n > 0 && wd > 0 ? `Mỗi món <b>${fmtW(wd)}</b> · cả lô <b>${fmtW(n * wd)}</b>${fmtW(n * wd) !== qtyStr ? ' = ' + qtyStr : ''}` : '';
      const tgt = e.target && e.target.name;
      if (tgt === 'don_gia') last = 'dg'; else if (tgt === 'tong') last = 'tong';
      // Lô mới: tự điền đơn giá = giá tiệm bán ra mới nhất của loại, cho tới khi bạn tự gõ giá
      if (tgt === 'don_gia' || tgt === 'tong') autoPrice = false;
      if (autoPrice && !isNew) { const p = latestPrice(f.loai.value); f.don_gia.value = p && p.ban_ra && f.ngay.value >= p.ngay ? fmtIn(p.ban_ra) : ''; last = 'dg'; }
      if (qty) {
        if (last === 'dg') f.tong.value = fmtIn(parseM(f.don_gia.value) * qty);
        else if (tgt !== 'don_gia') f.don_gia.value = fmtIn(parseM(f.tong.value) / qty);
      }
      // Lô mới: ô mức nhắc chỉ hiện khi lô đang lời (thường là nhập lại lô mua từ lâu);
      // lô vừa mua đang lỗ chênh lệch thì nhập mức nào cũng bị từ chối, nên ẩn đi
      if (!isEdit) {
        const p = !isNew && latestPrice(f.loai.value), unitCost = qty ? parseM(f.tong.value) / qty : 0;
        $('#ntField').classList.toggle('hidden', !(p && unitCost && p.mua_vao / unitCost - 1 > EPS));
      }
    });
}

function dlgSale(lotId, sale) {
  const lot = lotById(lotId), s = lotState(lot), t = s.t;
  const maxN = s.n + (sale ? sale.so_mon : 0);   // khi sửa: số món của chính lần bán này được tính lại vào
  if (maxN <= 0) return;
  const unit = UNIT_NAME[t.don_vi_niem_yet];
  const priceNote = !sale && s.p ? `<span class="small ${s.p.ngay < today() ? 'old' : 'muted'}">Giá tiệm mua vào ngày ${fmtD(s.p.ngay)}${s.p.ngay < today() ? ', nên kiểm tra giá thực tế' : ''}</span>` : '';
  openDlg(`<h2>${sale ? 'Sửa lần bán ' + esc(sale.id) : 'Bán lô ' + esc(lot.id)} · ${esc(t.ten)}</h2>
    <p class="muted">${sale ? 'Lô ' + esc(lot.id) + ' · ' : ''}Có thể bán ${maxN} món × ${fmtW(lot.trong_luong_mon_dem)} · mua ngày ${fmtD(lot.ngay_mua)}</p>
    <div class="row"><label class="field"><span>Số món bán (tối đa ${maxN})</span><input type="number" min="1" max="${maxN}" name="k" value="${sale ? sale.so_mon : 1}" style="width:80px"></label>
      <label class="field"><span>Giá bán (mỗi ${unit})</span><input class="money" name="gia" value="${sale ? fmtIn(sale.gia_ban) : s.hasPrice ? fmtIn(s.P) : ''}"></label></div>
    ${priceNote ? `<div class="row">${priceNote}</div>` : ''}
    ${!sale && s.cut ? '<div class="row"><span class="small old" id="cutNote"></span></div>' : ''}
    <div class="row"><button type="button" class="sm" data-fill="het">Bán hết</button><button type="button" class="sm" data-fill="von">Bán lấy lại vốn</button><button type="button" class="sm" data-fill="nua">Bán một nửa</button></div>
    <details${sale ? ' open' : ''}><summary>Tùy chọn khác: ngày bán khác hôm nay, giá muốn mua lại, ghi chú</summary>
      <div class="row"><label class="field"><span>Ngày bán</span><input type="date" name="ngay" value="${sale ? sale.ngay : today()}" min="${lot.ngay_mua}" max="${today()}" required></label>
      <label class="field"><span>Giá muốn mua lại (mỗi ${unit})</span><input class="money" name="mua_lai" value="${sale && sale.gia_mua_lai ? fmtIn(sale.gia_mua_lai) : ''}"></label>
      <label class="field" style="flex:1"><span>Ghi chú</span><input name="ghi_chu" value="${sale ? esc(sale.ghi_chu) : ''}"></label></div></details>
    <div class="preview" id="salePreview"></div>
    <div class="dlg-actions"><button value="cancel" type="submit">Hủy</button><button class="primary" type="submit">${sale ? 'Lưu' : 'Xác nhận bán'}</button></div>`,
    f => {
      const k = Math.floor(parseN(f.k.value)), gia = parseM(f.gia.value);
      if (!sale) dlgDate(f);
      if (!f.ngay.value) return tell('Chưa nhập ngày bán.'), false;
      if (f.ngay.value < lot.ngay_mua) return tell('Ngày bán không được trước ngày mua.'), false;
      if (f.ngay.value > today()) return tell('Ngày bán không được sau hôm nay.'), false;
      if (k < 1 || k > maxN) return tell('Số món bán phải từ 1 đến ' + maxN + '.'), false;
      if (gia <= 0) return tell('Chưa nhập giá bán.'), false;
      if (!sale && s.P && Math.abs(gia / s.P - 1) > 0.15 &&
        !ask(`Giá bán ${fmtM(gia)}/${unit} lệch ${fmtP(gia / s.P - 1)} so với giá tiệm mua vào gần nhất (${fmtM(s.P)}). Giá này có đúng không?`)) return false;
      const data = { ngay: f.ngay.value, so_mon: k, gia_ban: gia, gia_mua_lai: parseM(f.mua_lai.value) || null, ghi_chu: f.ghi_chu.value.trim() };
      if (sale) Object.assign(sale, data);
      else {
        D.vang.ban.push(Object.assign({ id: nextSaleId(), lo_id: lot.id }, data));
      }
      commit(sale ? 'sửa lần bán ' + sale.id : `bán ${k} món lô ${lot.id}`);
    },
    f => {
      const k = Math.floor(parseN(f.k.value)), gia = parseM(f.gia.value);
      const c = saleCalc({ lo_id: lot.id, ngay: f.ngay.value || today(), so_mon: k, gia_ban: gia });
      const left = maxN - k;
      if (!sale && s.cut) $('#cutNote').textContent = k >= 1 && k <= maxN ? 'T' + cutText(s, k, 'số món này').slice(1) : '';
      $('#salePreview').innerHTML = k >= 1 && k <= maxN && gia > 0 ? `<table>
        <tr><td>Tiền thu về</td><td class="n"><b>${fmtM(c.thu)}</b></td></tr>
        <tr><td>Vốn của phần bán</td><td class="n">${fmtM(c.von)}</td></tr>
        <tr><td>Lời/lỗ chốt</td><td class="n ${cls(c.loi)}"><b>${fmtMS(c.loi)} (${fmtP(c.g)})</b></td></tr>
        <tr><td>Nếu số vốn này gửi ngân hàng (${c.d} ngày)</td><td class="n">${fmtM(c.bank)} → <span class="${cls(c.vsBank)}">${c.vsBank >= 0 ? 'vàng hơn' : 'vàng thua'} ${fmtM(Math.abs(c.vsBank))}</span></td></tr>
        <tr><td>Lô còn lại sau khi bán</td><td class="n">${left} món${left > 0 ? ' · ' + fmtW(left * lot.trong_luong_mon_dem) + ' · vốn ' + fmtM(left * s.costMon) : ' · lô sẽ đóng'}</td></tr></table>`
        : '<span class="muted">Nhập số món và giá bán để xem trước.</span>';
    });
  $('#dlgForm').addEventListener('click', e => {
    const b = e.target.closest('[data-fill]'); if (!b) return;
    const f = $('#dlgForm'), gia = parseM(f.gia.value);
    const st = { n: maxN, V: maxN * s.costMon, valMon: s.w * (gia || s.P || 0) };
    if (b.dataset.fill === 'von' && !st.valMon) return tell('Nhập giá bán trước.');
    f.k.value = sellK[b.dataset.fill](st);
    f.dispatchEvent(new Event('input'));
  });
}

// Giữ, nâng mục tiêu (lô đã đạt mục tiêu) hoặc Giữ tiếp (lô đang tụt dưới mức nhắc)
function dlgHold(lotId) {
  const lot = lotById(lotId), s = lotState(lot), unit = UNIT_NAME[s.t.don_vi_niem_yet], gp = s.g * 100, tiep = s.tut;
  const defKv = tiep ? lot.ky_vong_pct : Math.ceil((gp + 1) / 5) * 5;
  const below = Math.floor((gp - 1) / 5) * 5;               // bội số 5% ngay dưới lời hiện tại (thấp hơn ít nhất 1 điểm)
  let defNt = below;
  if (!tiep && lot.ky_vong_pct < gp) defNt = Math.max(lot.ky_vong_pct, below);   // lần đầu giữ: không thấp hơn mục tiêu cũ, trừ khi lời vừa đúng bằng mục tiêu
  if (defNt <= 0 || defNt >= gp) defNt = '';
  const price = pct => fmtM(s.V * (1 + pct / 100) / (s.n * s.w)) + '/' + unit;
  openDlg(`<h2>${tiep ? 'Giữ tiếp' : 'Giữ'} lô ${esc(lot.id)} · ${esc(s.t.ten)}</h2>
    <p>${tiep ? `Lời đã tụt về <b>${fmtP(s.g)}</b>, dưới mức nhắc ${fmtP(s.nt, false)}. Giữ tiếp thì đặt mức nhắc mới, để trống nếu không muốn nhắc nữa.`
      : `Lô đang lời <b class="pos">${fmtP(s.g)}</b>, đã vượt mục tiêu ${fmtP(s.kv, false)}. Lô chuyển sang nhóm Giữ; app nhắc lại khi lời đạt mục tiêu mới, hoặc khi lời tụt về dưới mức nhắc.`}</p>
    <div class="row"><label class="field"><span>Mục tiêu mới (%)</span><input type="number" step="0.1" name="kv" value="${defKv}"><span id="kvInfo"></span></label>
      <label class="field"><span>Nhắc chốt nếu lời tụt về (%)</span><input type="number" step="0.1" name="nt" value="${defNt}" placeholder="trống = không nhắc"><span id="ntInfo"></span></label></div>
    <p class="small muted">Giá tiệm mua vào hiện tại: ${fmtM(s.P)}/${unit}.</p>
    <div class="dlg-actions"><button value="cancel" type="submit">Hủy</button><button class="primary" type="submit">${tiep ? 'Giữ tiếp' : 'Lưu mục tiêu mới'}</button></div>`,
    f => {
      const kv = parseN(f.kv.value), ntRaw = f.nt.value.trim(), nt = ntRaw === '' ? null : parseN(ntRaw);
      if (!(kv > gp)) return tell('Mục tiêu mới phải cao hơn mức lời hiện tại (' + fmtP(s.g) + ').'), false;
      if (nt != null && (!(nt > 0) || nt >= gp)) return tell('Mức nhắc phải lớn hơn 0 và thấp hơn mức lời hiện tại (' + fmtP(s.g) + '), hoặc để trống.'), false;
      lot.ky_vong_pct = kv; lot.nhac_tut_pct = nt;
      commit((tiep ? 'giữ tiếp lô ' : 'nâng mục tiêu lô ') + lot.id);
    },
    f => {
      $('#kvInfo').textContent = parseN(f.kv.value) > 0 ? 'giá tiệm mua vào ' + price(parseN(f.kv.value)) : '';
      $('#ntInfo').textContent = f.nt.value.trim() === '' ? 'không nhắc' : 'giá tiệm mua vào ' + price(parseN(f.nt.value));
    });
}
