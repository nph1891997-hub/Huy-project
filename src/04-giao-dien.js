// ===================== Giao diện chung =====================
let tab = 'homnay';
const ui = { gateError: '', gateBad: false, gateLost: false, gateRestore: null, priceDate: today(), viewLoaded: false, viewTemp: false, importMode: '', whyOpen: false, giuOpen: false, waitOpen: false, notice: '', loStatus: 'open', loType: '', loOpen: null, lsYear: '', lsPType: '', lsPYear: '', cash: 0, plans: null };
// "Hôm nay" mà bảng giá đang hiển thị: để tab mở qua đêm thì today() đã sang ngày mới mà bảng vẫn là ngày cũ
let shownDay = today();
// Sang ngày mới: ô Ngày đang là hôm nay cũ thì chuyển sang hôm nay (đang nhập bù một ngày khác thì giữ). Trả về ngày cũ nếu vừa sang ngày
function rollDay() {
  const t = today(); if (t === shownDay) return null;
  const old = shownDay; shownDay = t;
  if (ui.priceDate === old) ui.priceDate = t;
  const f = $('#priceForm'); if (f && f.ngay.value === old) f.ngay.value = ui.priceDate;
  return old;
}
// Quay lại tab và mỗi phút: sang ngày mới thì vẽ lại (bảng giá giữ nguyên dòng đang gõ).
// Đang gõ dở một dòng giá thì nhớ lại, để lần lưu dòng đó vẫn báo "Đã sang ngày…" (ô Ngày đã đổi mà người gõ không thấy)
let rolledWhileTyping = false;
function tickDay() {
  if (!rollDay()) return;
  _cache = null;
  if (tab === 'homnay' && $('#priceForm')) { rolledWhileTyping = !!document.activeElement?.closest?.('#priceForm tr.prow'); softRender(); } else render();
}
// Lần lưu giá: vừa sang ngày (ngay lúc lưu, hoặc lúc đang gõ dở dòng này) thì báo
const rollForSave = () => { const r = rollDay(); if (r) softRender(); const was = rolledWhileTyping; rolledWhileTyping = false; return r || was; };
const newDayNote = () => `Đã sang ngày ${fmtD(today()).slice(0, 5)}, giá vừa nhập lưu cho hôm nay. Muốn lưu cho ngày cũ thì bấm Hoàn tác rồi chọn lại ngày.`;
const noticeHtml = () => ui.notice ? `<div class="warn">${ui.notice} <button class="sm" data-act="notice-close">Đóng</button></div>` : '';
// Đổi dòng báo đầu trang mà không vẽ lại cả trang (giữ ô đang gõ)
function setNotice(html) { ui.notice = html; const s = $('#noticeSlot'); if (s) s.innerHTML = noticeHtml(); }
function render() {
  document.body.classList.toggle('view', VIEW);
  if (VIEW && !ui.viewLoaded) { $('#tabs').innerHTML = ''; $('#app').innerHTML = viewGate(); return; }
  // Đã nhớ file mà chưa mở được: không hiện số liệu, bản trong trình duyệt có thể cũ hơn file
  if (booting || (hasFSA && !fileHandle && pendingHandle)) {
    $('#tabs').innerHTML = ''; $('#btnUndo').classList.add('hidden');
    $('#app').innerHTML = booting ? '' : gateView();
    return;
  }
  $('#tabs').innerHTML = TABS.map(([k, n]) => `<button class="${k === tab ? 'on' : ''}" data-act="tab" data-k="${k}">${n}</button>`).join('');
  const v = { homnay: viewHomNay, lo: viewLo, cantien: viewCanTien, lichsu: viewLichSu, thamso: viewThamSo }[tab];
  _cache = null;
  $('#app').innerHTML = (VIEW ? `<div class="note" id="viewNote">${viewNote()}</div>` : '') + `<div id="noticeSlot">${noticeHtml()}</div>` + fileBanner() + v();
  updateUndoBtn();
}
function updateUndoBtn() { const u = undoStack.at(-1), bu = $('#btnUndo'); bu.classList.toggle('hidden', !u); if (u) bu.textContent = '↶ Hoàn tác: ' + u.label; }
// Vẽ lại sau khi lưu một dòng giá: giữ nguyên bảng giá (con trỏ, ô đang gõ), chỉ vẽ lại phần còn lại của tab Hôm nay.
// Đang giữ chuột (vừa bấm một nút) thì đợi thả chuột mới vẽ, để cú bấm không rơi vào chỗ vừa bị vẽ lại.
// Vẽ sau khi con trỏ chuyển xong (lưu do rời dòng xảy ra giữa lúc con trỏ đang chuyển sang ô khác).
let pointerIsDown = false, softPending = false, softTimer = 0;
function softRender() { softPending = true; if (!pointerIsDown && !softTimer) softTimer = setTimeout(flushSoft, 0); }
function afterDialog() { pointerIsDown = false; if (softPending && !softTimer) softTimer = setTimeout(flushSoft, 0); }
function flushSoft() {
  clearTimeout(softTimer); softTimer = 0;
  if (!softPending) return;
  softPending = false;
  const f = $('#priceForm'), rest = $('#homRest');
  if (tab !== 'homnay' || !f || !rest) return render();
  _cache = null;
  for (const t of D.vang.loai) {   // dòng không có con trỏ thì vẽ lại theo giá đã lưu
    const tr = f.querySelector(`tr.prow[data-id="${t.id}"]`), a = document.activeElement;
    if (tr && !(tr.contains(a) && a.matches('input.money'))) tr.outerHTML = priceRow(t);
  }
  f.ngay.max = today(); f.ngay.classList.toggle('olddate', ui.priceDate !== today()); $('#dateNote').innerHTML = dateNote();
  $('#btnAllSame')?.classList.toggle('hidden', !staleIds().length);
  rest.innerHTML = homRest();
  if (VIEW) $('#viewNote').innerHTML = viewNote();
  refreshBuy(f); updateUndoBtn();
}
const viewNote = () => `👁 <b>Chế độ xem</b>: không lưu gì, mọi ghi chép làm trên máy tính.${ui.viewTemp ? ' Đang xem với giá vừa gõ.' : ''}
    <button class="sm" data-act="view-open">Mở file khác để xem</button>`;
const viewDataBtns = () => `<button class="primary" data-act="view-open">Mở tai-san.json để xem</button>` +
  (oldLocal ? ` <button data-act="view-old">Tải bản dữ liệu cũ trong trình duyệt</button>` : '');
function viewGate() {
  return card('👁 Chế độ xem', `<p>Trình duyệt này không ghi thẳng vào file được, nên app chỉ để <b>xem</b>: mở file <b>tai-san.json</b> (từ OneDrive/Google Drive) để biết lô nào nên chốt, có nên mua thêm không. Không lưu gì; mọi ghi chép làm trên máy tính bằng Chrome hoặc Edge.</p>
    <div class="row">${viewDataBtns()}</div>
    ${oldLocal ? '<p class="small muted">Trình duyệt này còn dữ liệu do bản cũ của app lưu. Tải về để không mất, rồi mở bằng Khôi phục từ bản sao lưu trên máy tính.</p>' : ''}`);
}
const fmtWhen = iso => { const d = new Date(iso), p = x => String(x).padStart(2, '0'); return iso && !isNaN(d) ? `${p(d.getDate())}/${p(d.getMonth() + 1)} ${p(d.getHours())}:${p(d.getMinutes())}` : ''; };
// Màn chờ mở file. File đang nhớ hỏng hoặc rỗng (gateBad): chỉ cách lấy lại, không tự ghi gì vào file.
// Tạo file mới… chỉ hiện khi file cũ không mở được, để khỏi chọn nhầm đúng file cũ (Chrome xóa trắng file chọn ở hộp Lưu)
function gateView() {
  const n = esc(pendingHandle.name), when = fmtWhen(D.cap_nhat);
  const fix = ui.gateRestore
    ? `<div class="row"><button class="primary" data-act="gate-restore-go">Ghi bản sao lưu ${esc(ui.gateRestore.name)} vào ${n}</button></div>`
    : ui.gateBad ? `<p>Lấy lại bản trước bằng <b>lịch sử phiên bản</b> của OneDrive/Google Drive (trên web: chuột phải vào file → Lịch sử phiên bản) rồi bấm Mở lại, hoặc:</p>
      <div class="row"><button data-act="gate-restore">Khôi phục từ bản sao lưu…</button>${hasData(D) ? `<button data-act="gate-local">Dùng bản trong trình duyệt${when ? ` (sửa lần cuối ${when})` : ''}</button>` : ''}</div>` : '';
  return card('📂 Mở dữ liệu', `${ui.gateError ? `<div class="warn">${esc(ui.gateError)}</div>` : ''}${fix}
    ${ui.gateBad || ui.gateLost ? '' : `<p>Dữ liệu nằm trong file <b>${n}</b>. Mở lại file để xem số liệu mới nhất; bản lưu trong trình duyệt có thể cũ hơn (ví dụ khi vừa sửa trên máy khác).</p>`}
    <div class="row">${ui.gateLost ? '' : `<button class="${ui.gateBad ? '' : 'primary'}" data-act="file-reconnect" style="font-size:16px;padding:9px 18px">Mở lại ${n}</button>`}
      <button data-act="file-open">Mở file khác…</button>${ui.gateBad || ui.gateLost ? '<button data-act="file-new">Tạo file mới…</button>' : ''}</div>`);
}
function fileBanner() {
  if (!hasFSA || fileHandle) return '';
  if (!D.vang.loai.length && !D.vang.lo.length) return '';
  return `<div class="note">Dữ liệu đang lưu tạm trong trình duyệt. Lưu vào file để không mất:
    <button class="primary" data-act="file-new">Tạo file dữ liệu…</button> <button data-act="file-open">Mở file có sẵn…</button></div>`;
}
const card = (title, body, extra = '') => `<section class="card ${extra}">${title ? `<h2>${title}</h2>` : ''}${body}</section>`;
const typeOptions = (sel, withAll) => (withAll ? `<option value="">Tất cả loại</option>` : '') +
  D.vang.loai.map(t => `<option value="${esc(t.id)}" ${t.id === sel ? 'selected' : ''}>${esc(t.ten)}</option>`).join('');
