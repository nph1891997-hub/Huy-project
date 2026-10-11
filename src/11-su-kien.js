// ===================== Sự kiện =====================
const act = {
  tab: d => { tab = d.k; render(); window.scrollTo(0, 0); },
  'lot-add': () => dlgLot(null),
  'lot-edit': d => dlgLot(lotById(d.id)),
  'lot-del': d => {
    const nb = D.vang.ban.filter(b => b.lo_id === d.id).length;
    if (!confirm(`Xóa lô ${d.id}${nb ? ` cùng ${nb} lần bán của nó (lời đã chốt của các lần bán này cũng mất)` : ''}?`)) return;
    D.vang.lo = D.vang.lo.filter(l => l.id !== d.id); D.vang.ban = D.vang.ban.filter(b => b.lo_id !== d.id);
    if (ui.loOpen === d.id) ui.loOpen = null;
    commit('xóa lô ' + d.id);
  },
  'lot-detail': d => { ui.loOpen = ui.loOpen === d.id ? null : d.id; render(); },
  sell: d => dlgSale(d.id),
  hold: d => dlgHold(d.id),
  'sale-edit': d => { const b = D.vang.ban.find(x => x.id === d.id); if (b) dlgSale(b.lo_id, b); },
  rebuy: d => {
    const b = D.vang.ban.find(x => x.id === d.id), lot = b && lotById(b.lo_id); if (!lot) return;
    dlgLot(null, { loai_id: lot.loai_id, trong_luong_mon_dem: lot.trong_luong_mon_dem, so_mon: b.so_mon, fromSale: b.id });
  },
  buy: d => { const f = $('#priceForm'); dlgLot(null, { loai_id: d.id, don_gia: (f && parseM(f['br_' + d.id].value)) || latestPrice(d.id)?.ban_ra }); },
  'sale-del': d => { if (confirm('Xóa lần bán ' + d.id + '? Số món sẽ được trả lại cho lô.')) { D.vang.ban = D.vang.ban.filter(b => b.id !== d.id); commit('xóa lần bán ' + d.id); } },
  // Bật lại các nhắc mua lại vừa tự tắt khi thêm lô (lô mới vẫn giữ)
  'rebuy-keep': () => {
    const off = (ui.rebuyOff || []).map(x => ({ x, b: D.vang.ban.find(b => b.id === x.id) })).filter(y => y.b);
    ui.rebuyOff = null; ui.notice = '';
    if (!off.length) return render();
    for (const { x, b } of off) b.gia_mua_lai = x.gia;
    commit('giữ lại nhắc mua lại ' + off.map(y => y.x.id).join(', '));
  },
  'rebuy-clear': d => { const b = D.vang.ban.find(x => x.id === d.id); if (b) { b.gia_mua_lai = null; commit('bỏ nhắc mua lại ' + b.id); } },
  'price-del': d => { const p = D.vang.gia[+d.i]; if (p && confirm('Xóa dòng giá ngày ' + fmtD(p.ngay) + '?')) { D.vang.gia.splice(+d.i, 1); commit('xóa giá ngày ' + fmtD(p.ngay)); } },
  'type-del': d => { if (confirm('Xóa loại vàng này cùng lịch sử giá của nó?')) { D.vang.loai = D.vang.loai.filter(t => t.id !== d.id); D.vang.gia = D.vang.gia.filter(p => p.loai_id !== d.id); commit('xóa loại vàng'); } },
  'plan-confirm': d => {
    const p = ui.plans[+d.plan], rows = p.rows.filter(x => x.k > 0);
    const S = planSummary({ rows }, ui.cash);
    if (!confirm(`Xác nhận bán theo ${p.name}?\n\n` + S.rows.map(x => `${x.s.lot.id}: ${x.r.k} món → ${fmtM(x.t)}`).join('\n') + `\n\nTổng thu: ${fmtM(S.thu)} · Lời/lỗ: ${fmtMS(S.loi)}`)) return;
    for (const x of S.rows) {
      D.vang.ban.push({ id: nextSaleId(), lo_id: x.s.lot.id, ngay: today(), so_mon: x.r.k, gia_ban: x.s.P, gia_mua_lai: null, ghi_chu: 'Cần tiền ' + fmtM(ui.cash) });
    }
    ui.plans = null; ui.cash = 0; tab = 'lichsu'; commit(`bán theo phương án ${p.name.slice(0, 1)} (${S.rows.length} lô)`);
  },
  undo: () => undo(),
  'all-same': () => markSame(),
  'price-today': () => { ui.priceDate = today(); const f = $('#priceForm'); f.ngay.value = ui.priceDate; applyPriceDate(f); },
  'view-open': () => { ui.importMode = 'view'; $('#importFile').click(); },
  'view-old': () => download(`${DL.cu}${today()}.json`, oldLocal, 'application/json'),
  'notice-close': () => setNotice(''),
  'export-json': () => download(`${DL.saoLuu}${today()}.json`, JSON.stringify(D, null, 2), 'application/json'),
  'import-json': () => $('#importFile').click(),
  'file-open': async () => {
    let h, errH;
    try {
      [h] = await showOpenFilePicker({ types: JSON_TYPES });
      const cur = fileHandle || pendingHandle, same = !!cur && await h.isSameEntry(cur);
      // Ở màn chờ mà chọn đúng file đang nhớ: lỗi báo như bấm Mở lại (file hỏng thì màn chờ hiện cách lấy lại)
      if (same && !fileHandle) errH = pendingHandle;
      // Mở nhầm bản sao lưu (file do app tải về) khi đã có file dữ liệu: hỏi khôi phục vào file dữ liệu thay vì chuyển sang ghi vào bản sao lưu
      if (cur && !same && isBackupName(h.name)) {
        if (!confirm(`${h.name} là bản sao lưu. Khôi phục nội dung này vào ${cur.name}?\n\n` + (fileHandle ? 'Dữ liệu đang mở sẽ được thay toàn bộ (Hoàn tác được).' : `Nội dung hiện tại của ${cur.name} sẽ được tải về trước.`))) return;
        const F = await readData(h);
        if (fileHandle) { D = F; ui.plans = null; return commit('khôi phục từ ' + h.name); }
        return await restoreInto(pendingHandle, F, h.name);
      }
      await useFile(h, false);
    } catch (e) { fileError(e, errH || h); }
  },
  'file-new': async () => {
    let h;
    const cur = fileHandle || pendingHandle;
    try {
      // Không gợi ý trùng tên file đang dùng: Chrome xóa trắng file được chọn trong hộp Lưu ngay lúc chọn
      h = await showSaveFilePicker({ suggestedName: !cur ? 'tai-san.json' : cur.name === 'tai-san-moi.json' ? 'tai-san-moi-2.json' : 'tai-san-moi.json', types: JSON_TYPES });
      if (cur && await h.isSameEntry(cur)) {
        if (fileHandle) {   // đang mở chính file đó: dữ liệu đang mở là của file, ghi lại vào đó
          const { mod, cap } = await fileSeen(h); await useFile(h, true, { mod, cap });
          return setNotice(`Đây là file đang dùng (<b>${esc(h.name)}</b>); dữ liệu đang mở đã được ghi lại vào đó.`);
        }
        // Ở màn chờ: nội dung file đã bị xóa trắng, chưa ghi gì vào; chỉ cách lấy lại
        Object.assign(ui, { gateError: `Bạn vừa chọn lại đúng file ${h.name} trong hộp Lưu. Chrome xóa trắng file được chọn ở hộp này nên file đang rỗng.`, gateBad: true, gateLost: false });
        return render();
      }
      // File khác (mới tinh, hoặc file có sẵn mà Chrome đã xóa trắng lúc chọn): ghi dữ liệu đang mở vào. Chọn nhầm file dữ liệu khác là mất nội dung file đó (mục 5 đặc tả)
      await useFile(h, true);
    } catch (e) { fileError(e, h); }
  },
  // Màn chờ, file đang nhớ hỏng hoặc rỗng: ghi bản trong trình duyệt vào file đó
  'gate-local': async () => {
    const h = pendingHandle; if (!h) return;
    try {
      if (await h.requestPermission({ mode: 'readwrite' }) !== 'granted') return fileError(new Error('Chưa được cho phép ghi file ' + h.name + '.'), h);
      await writeInto(h, D, 'Bản trong trình duyệt');
    } catch (e) { fileError(e, h); }
  },
  // Màn chờ: chọn bản sao lưu rồi ghi vào đúng file đang nhớ
  'gate-restore': async () => {
    let b;
    try { [b] = await showOpenFilePicker({ types: JSON_TYPES }); await restoreInto(pendingHandle, await readData(b), b.name); } catch (e) { fileError(e, b); }
  },
  'gate-restore-go': async () => {
    const r = ui.gateRestore, h = pendingHandle; if (!r || !h) return;
    try {
      if (await h.requestPermission({ mode: 'readwrite' }) !== 'granted') return fileError(new Error('Chưa được cho phép ghi file ' + h.name + '.'), h);
      await writeInto(h, r.F, 'Bản sao lưu ' + esc(r.name));
    } catch (e) { fileError(e, h); }
  },
  'file-reconnect': async () => {
    const h = pendingHandle || await idbGet('file').catch(() => null); if (!h) return;
    try {
      if (await h.requestPermission({ mode: 'readwrite' }) !== 'granted') return fileError(new Error('Chưa được cho phép mở file ' + h.name + '.'), h);
      await useFile(h, false);
    } catch (e) { fileError(e, h); }
  }
};
// Tham số nào nhận giá trị nào (tham số không có trong bảng thì nhận mọi số)
const PARAM_RULES = {
  vang_mua_giam_pct: [v => v > 0, '% giảm từ đỉnh phải lớn hơn 0.'],
  vang_ky_vong_mac_dinh: [v => v > 0, '% kỳ vọng mặc định phải lớn hơn 0.'],
  vang_sap_dat_mac_dinh: [v => v >= 0, 'Mức báo sắp đạt không được âm.'],
  lai_suat_ngan_hang: [v => v >= 0, 'Lãi suất không được âm.'],
  lam_phat: [v => v >= 0, 'Lạm phát không được âm.']
};
// Chế độ xem: các thao tác làm thay đổi dữ liệu bị ẩn (CSS body.view) và chặn luôn ở đây
const EDIT_ACTS = new Set(['lot-add', 'lot-edit', 'lot-del', 'sell', 'hold', 'sale-edit', 'sale-del', 'rebuy', 'rebuy-clear', 'price-del', 'type-del',
  'plan-confirm', 'buy', 'undo', 'export-json', 'import-json', 'file-new', 'file-open', 'file-reconnect', 'gate-local', 'gate-restore', 'gate-restore-go', 'rebuy-keep']);
document.addEventListener('click', e => { const b = e.target.closest('[data-act]'); if (b && !b.disabled && !(VIEW && EDIT_ACTS.has(b.dataset.act))) act[b.dataset.act](b.dataset, b); });
document.addEventListener('input', e => {
  const el = e.target, f = el.form;
  if (!f || f.id !== 'priceForm') return;
  if (el.name === 'ngay') {   // ngày hợp lệ: các dòng giá điền theo ngày đó; đang gõ dở (trống, chưa hợp lệ) thì để yên
    if (validDate(el.value) && el.value !== ui.priceDate) { ui.priceDate = el.value; return applyPriceDate(f); }
  }
  if (el.name.startsWith('br_')) el.dataset.touched = '1';
  if (el.name.startsWith('mv_')) {
    const br = f['br_' + el.name.slice(3)], mv = parseM(el.value);
    if (br && !br.dataset.touched && br.dataset.spread !== '' && mv) br.value = fmtIn(mv + Number(br.dataset.spread));
  }
  refreshBuy(f);
});
const onReturn = () => { tickDay(); checkOnReturn(); };
document.addEventListener('visibilitychange', onReturn);
window.addEventListener('focus', onReturn);
setInterval(tickDay, 60000);   // tab hiện suốt qua nửa đêm, hay máy vừa thức dậy, cũng kịp sang ngày mới
// Phần thu gọn: mở ra mới vẽ (vẽ sẵn rồi thì thôi), đóng lại thì bỏ nội dung.
// Bấm vào tiêu đề thì vẽ ngay lúc bấm (sự kiện toggle đến sau, có thể kịp hiện một khung trống)
const fillLazy = d => { const body = d.querySelector('.lazy-body'); if (!body.childElementCount) body.innerHTML = LAZY[d.dataset.lazy].html(); };
document.addEventListener('click', e => { const d = e.target.closest?.('details[data-lazy] > summary')?.parentNode; if (d && !d.open) fillLazy(d); }, true);
document.addEventListener('toggle', e => {
  const d = e.target, k = d.dataset?.lazy; if (!k) return;
  ui[LAZY[k].flag] = d.open;
  if (d.open) fillLazy(d); else d.querySelector('.lazy-body').innerHTML = '';
}, true);
for (const ev of ['pointermove', 'pointerdown']) document.addEventListener(ev, e => { const svg = e.target.closest && e.target.closest('svg.chart'); if (svg) chartHover(svg, e); });
document.addEventListener('pointerdown', () => { pointerIsDown = true; }, true);
for (const ev of ['pointerup', 'pointercancel']) document.addEventListener(ev, () => { pointerIsDown = false; if (softPending && !softTimer) softTimer = setTimeout(flushSoft, 0); }, true);
document.addEventListener('keydown', e => {
  // Bảng giá: Enter = lưu dòng này (rời dòng) và xuống ô mua vào của dòng dưới
  if (e.key === 'Enter' && e.target.matches('#priceForm input')) {
    e.preventDefault();
    const row = e.target.closest('tr.prow'); if (!row) return;
    const next = row.nextElementSibling?.querySelector('input[name^=mv_]');
    next ? next.focus() : e.target.blur();
    return;
  }
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.target.matches('input, textarea, select') && !dlg.open) { e.preventDefault(); undo(); }
});
document.addEventListener('focusin', e => { if (e.target.matches('input.money, input[type=number]')) e.target.select(); });
document.addEventListener('focusout', e => {
  const el = e.target;
  if (el.matches('input.money')) el.value = fmtIn(parseM(el.value));
  // Rời khỏi một dòng giá là lưu dòng đó (chuyển giữa ô mua vào và ô bán ra cùng dòng thì chưa)
  const row = el.closest && el.closest('#priceForm tr.prow');
  if (!row || !el.matches('input.money')) return;
  const to = e.relatedTarget;
  if (to && row.contains(to) && to.matches('input.money')) return;
  saveRow(row.dataset.id);
});
document.addEventListener('submit', e => {
  const f = e.target;
  if (f.id === 'priceForm') e.preventDefault();   // giá lưu khi rời dòng, không có nút gửi
  else if (f.id === 'cashForm') {
    e.preventDefault();
    ui.cash = parseM(f.x.value); ui.plans = ui.cash > 0 ? cashPlans(ui.cash) : null; render();
  } else if (f.id === 'typeForm') {
    e.preventDefault();
    D.vang.loai.push({ id: 't' + Date.now().toString(36), ten: f.ten.value.trim(), don_vi_niem_yet: f.dv.value }); commit('thêm loại vàng');
  }
});
document.addEventListener('change', e => {
  const el = e.target;
  if (el.id === 'loStatus') { ui.loStatus = el.value; render(); }
  else if (el.id === 'loType') { ui.loType = el.value; render(); }
  else if (el.id === 'lsYear') { ui.lsYear = el.value; render(); }
  else if (el.id === 'lsPType') { ui.lsPType = el.value; render(); }
  else if (el.id === 'lsPYear') { ui.lsPYear = el.value; render(); }
  else if (el.dataset.set) {
    const v = parseN(el.value), rule = PARAM_RULES[el.dataset.set];
    if (rule && !rule[0](v)) { alert(rule[1]); return render(); }   // sai thì báo và trả ô về giá trị cũ
    D.tham_so[el.dataset.set] = v; commit('sửa tham số');
  }
  else if (el.dataset.setMoney) { const v = parseM(el.value); D.tham_so[el.dataset.setMoney] = v > 0 ? v : null; commit('sửa hạn mức vốn'); }
  else if (el.dataset.typeName) { const t = typeById(el.dataset.typeName); if (t && el.value.trim()) { t.ten = el.value.trim(); commit('đổi tên loại vàng'); } }
  else if (el.dataset.typeUnit) { const t = typeById(el.dataset.typeUnit); if (t) { t.don_vi_niem_yet = el.value; commit('đổi đơn vị loại vàng'); } }
  else if (el.name && el.name.startsWith('kd_') && el.form?.id === 'priceForm') { if (el.checked) { const id = el.name.slice(3); saveRow(id); markSame([id]); } }
  else if (el.dataset.plan != null && el.dataset.row != null) {
    ui.plans[+el.dataset.plan].rows[+el.dataset.row].k = Math.max(0, Math.floor(parseN(el.value))); render();
  } else if (el.id === 'importFile') {
    const file = el.files[0]; el.value = ''; if (!file) return;
    const forView = ui.importMode === 'view'; ui.importMode = '';
    file.text().then(text => {
      let F; try { F = JSON.parse(text); } catch { return alert('File không phải JSON hợp lệ.'); }
      if (!F || !F.vang) return alert('File không đúng định dạng dữ liệu của app.');
      if (forView) { D = normalize(F); ui.viewLoaded = true; ui.viewTemp = false; ui.plans = null; _cache = null; tab = 'homnay'; return render(); }
      if (!confirm('Dữ liệu trong file sẽ THAY THẾ toàn bộ dữ liệu đang mở. Tiếp tục?')) return;
      D = normalize(F); ui.plans = null; commit('khôi phục từ bản sao lưu');
    });
  }
});

const fileErrMsg = (e, h) => e.name === 'NotFoundError' ? `Không tìm thấy file ${h ? h.name : ''} (có thể đã bị xóa hoặc chuyển chỗ). Dùng Mở file khác… hoặc Tạo file mới….` : e.message;
function fileError(e, h) {
  if (e.name === 'AbortError') return;   // bấm Hủy ở hộp chọn file
  if (!fileHandle && pendingHandle) {   // đang ở màn chờ: báo ngay trên màn chờ
    ui.gateError = fileErrMsg(e, h);
    // Cách lấy lại (khôi phục, dùng bản trình duyệt, tạo file mới) chỉ hiện khi chính file đang nhớ hỏng, rỗng hoặc mất;
    // lỗi khác (chưa cho quyền…) giữ nguyên các nút đang có
    if (h === pendingHandle && (e.bad || e.name === 'NotFoundError')) { ui.gateBad = !!e.bad; ui.gateLost = !e.bad; ui.gateRestore = null; }
    render();
  } else alert(fileErrMsg(e, h));
}
function download(name, text, type) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type }));
  a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}
