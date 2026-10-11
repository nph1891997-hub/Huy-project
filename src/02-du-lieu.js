// ===================== Dữ liệu =====================
function emptyData() {
  return {
    phien_ban: 1, cap_nhat: '',
    tham_so: { lai_suat_ngan_hang: 5.5, lam_phat: 3.5, vang_ky_vong_mac_dinh: 15, vang_sap_dat_mac_dinh: 2, vang_mua_giam_pct: 5, vang_han_muc_von: null },
    vang: { loai: [], gia: [], lo: [], ban: [], so_thu_tu: { lo: {}, ban: 0 } },
    tiet_kiem: [], cctg: [], dat: []
  };
}
function normalize(d) {
  const e = emptyData();
  d = d && typeof d === 'object' ? d : {};
  d.phien_ban = d.phien_ban || 1;
  d.tham_so = Object.assign(e.tham_so, d.tham_so || {});
  d.vang = Object.assign(e.vang, d.vang || {});
  d.vang.so_thu_tu = Object.assign({ lo: {}, ban: 0 }, d.vang.so_thu_tu || {});
  for (const k of ['tiet_kiem', 'cctg', 'dat']) if (!Array.isArray(d[k])) d[k] = [];
  return d;
}
const hasFSA = 'showOpenFilePicker' in window;
const JSON_TYPES = [{ description: 'Dữ liệu tài sản', accept: { 'application/json': ['.json'] } }];
// Trình duyệt không ghi thẳng vào file được (điện thoại, Safari, Firefox): chế độ xem, không lưu gì,
// để không sinh bộ dữ liệu thứ hai lệch với file trên máy tính
const VIEW = !hasFSA;
const oldLocal = VIEW ? (() => { try { return localStorage.getItem(KEY); } catch { return null; } })() : null;
let D = VIEW ? emptyData() : (() => { try { return normalize(JSON.parse(localStorage.getItem(KEY))); } catch { return emptyData(); } })();

// ----- Lưu: trình duyệt + file -----
let fileHandle = null, pendingHandle = null, saveChain = Promise.resolve(), saveErrShown = false, localErrShown = false;
let booting = hasFSA;   // đang kiểm tra file đã nhớ: chưa hiện gì để không lộ số liệu cũ trong trình duyệt
function setStatus(msg, err) { const s = $('#status'); s.textContent = msg; s.className = err ? 'err' : ''; }
// Mốc đồng bộ: cap_nhat của lần cuối đọc hoặc ghi file thành công (lưu trong trình duyệt, không nằm trong file)
const SYNC_KEY = 'tai-san-dong-bo', CAP_KEY = KEY + '-cap';
const getMark = () => { try { return localStorage.getItem(SYNC_KEY) || ''; } catch { return ''; } };
const setMark = v => { try { localStorage.setItem(SYNC_KEY, v); } catch { } };
// Dấu lần đọc/ghi cuối của riêng tab này (không dùng chung giữa các tab như mốc đồng bộ):
// thời điểm sửa file và cap_nhat. Dùng để biết nơi lưu có bị tab/máy khác sửa không.
let seen = { mod: null, cap: (() => { try { return localStorage.getItem(CAP_KEY) ?? ''; } catch { return ''; } })() };
let gen = 0;   // tăng mỗi khi nạp dữ liệu từ nơi khác: các lần lưu xếp hàng từ trước đó bỏ đi
const stamp = () => { const n = new Date(); return `${today()}-${String(n.getHours()).padStart(2, '0')}h${String(n.getMinutes()).padStart(2, '0')}`; };
// Tên các file app tự tải về (đều là bản sao lưu, không phải file dữ liệu): đặt một chỗ, để "Mở file khác…" nhận ra mọi tên
const DL = { saoLuu: 'sao-luu-vang-', trinhDuyet: 'ban-trinh-duyet-', truocKhoiPhuc: 'tai-san-truoc-khoi-phuc-', cu: 'du-lieu-cu-trong-trinh-duyet-' };
const isBackupName = n => Object.values(DL).some(p => String(n).startsWith(p));
const backupName = () => `${DL.trinhDuyet}${stamp()}.json`;
// Nơi lưu (file, hoặc bản trong trình duyệt khi chưa kết nối file) có bị sửa ở nơi khác kể từ lần tab này đọc/ghi cuối không.
// Xem thời điểm sửa của file trước, khác mới đọc file để so cap_nhat (OneDrive chỉ chạm vào file thì không tính).
async function storeChanged() {
  try {
    if (fileHandle) {
      const fi = await fileHandle.getFile();
      if (seen.mod != null && fi.lastModified === seen.mod) return null;
      const text = await fi.text(); if (!text.trim()) return null;
      const raw = JSON.parse(text); if (!raw || typeof raw.vang !== 'object') return null;
      if ((raw.cap_nhat || '') === seen.cap) { seen.mod = fi.lastModified; return null; }
      return { F: normalize(raw), mod: fi.lastModified };
    }
    if (VIEW) return null;
    const c = localStorage.getItem(CAP_KEY);
    if (c == null || c === seen.cap) return null;
    return { F: normalize(JSON.parse(localStorage.getItem(KEY))), mod: null };
  } catch { return null; }
}
// Nạp dữ liệu đã bị sửa ở nơi khác: bỏ hoàn tác và các lần lưu đang xếp hàng, đóng hộp thoại đang mở (nó giữ dữ liệu cũ)
function adopt(F, mod) {
  gen++; D = F; _cache = null; undoStack.length = 0; ui.plans = null;
  lastJSON = JSON.stringify(D);
  try { localStorage.setItem(KEY, lastJSON); localStorage.setItem(CAP_KEY, D.cap_nhat || ''); } catch { }
  seen = { mod, cap: D.cap_nhat || '' };
  if (fileHandle) setMark(D.cap_nhat || '');
  const hadDlg = dlg.open; if (hadDlg) dlg.close();
  return hadDlg;
}
function persist() {
  D.cap_nhat = new Date().toISOString();
  const compact = lastJSON = JSON.stringify(D), text = fileHandle ? JSON.stringify(D, null, 2) : '', ts = D.cap_nhat, h = fileHandle, myGen = gen;
  saveChain = saveChain.then(async () => {
    if (myGen !== gen) return;                     // dữ liệu đã được nạp lại từ nơi khác sau lần thay đổi này
    const ext = await storeChanged();              // trước mỗi lần lưu: nơi lưu bị sửa ở nơi khác thì không ghi đè
    if (ext) {
      const name = backupName(); download(name, h ? text : compact, 'application/json');
      const hadDlg = adopt(ext.F, ext.mod);
      ui.notice = `Thay đổi vừa rồi chưa được lưu vì dữ liệu đã được sửa ở nơi khác (tab hoặc máy khác). App đã nạp dữ liệu mới, hãy làm lại thao tác.${hadDlg ? ' Hộp thoại đang mở đã đóng lại.' : ''} Bản trình duyệt có thay đổi vừa rồi đã tải về thành <b>${name}</b>.`;
      return render();
    }
    let localOK = true;
    try { localStorage.setItem(KEY, compact); localStorage.setItem(CAP_KEY, ts); } catch (e) { localOK = false; }
    if (!h) {
      // Lần ghi lỗi không tính là đã lưu: lần lưu sau so với lần ghi thành công cuối, không báo nhầm "sửa ở nơi khác"
      if (localOK) { seen = { mod: null, cap: ts }; return persistStatus(); }
      setStatus('Chưa lưu được: bộ nhớ trình duyệt đầy', true);
      if (!localErrShown) { localErrShown = true; alert('Không lưu được vào bộ nhớ trình duyệt (có thể đã đầy). Hãy lưu vào file để không mất dữ liệu: Tham số → Dữ liệu → Tạo file mới….'); }
      return;
    }
    try {
      const w = await h.createWritable(); await w.write(text); await w.close();
      seen = { mod: (await h.getFile()).lastModified, cap: ts };
      if (localOK) setMark(ts);
      else {   // bản trong trình duyệt đã cũ: xóa mốc để lần mở sau dùng dữ liệu trong file
        try { localStorage.removeItem(SYNC_KEY); } catch { }
        if (!localErrShown) { localErrShown = true; alert('Bộ nhớ trình duyệt đầy; dữ liệu vẫn được lưu vào file ' + h.name + '.'); }
      }
      setStatus('Đã lưu vào ' + h.name);
    } catch (e) {
      setStatus('Lỗi ghi file: ' + e.message, true);
      if (!saveErrShown) { saveErrShown = true; alert('Không ghi được vào file ' + h.name + ' (' + e.message + ').\nDữ liệu vẫn còn trong trình duyệt. Kiểm tra file rồi vào Tham số → Dữ liệu → Mở file khác… để kết nối lại.'); }
    }
  });
}
// Quay lại tab hoặc cửa sổ: nơi lưu bị sửa ở nơi khác thì nạp lại trước khi người dùng thao tác trên số cũ
function checkOnReturn() {
  if (document.visibilityState !== 'visible' || VIEW || booting || (!fileHandle && pendingHandle)) return;
  saveChain = saveChain.then(async () => {
    const ext = await storeChanged(); if (!ext) return;
    const hadDlg = adopt(ext.F, ext.mod);
    ui.notice = 'Dữ liệu vừa được cập nhật ở nơi khác (tab hoặc máy khác); app đã nạp bản mới.' + (hadDlg ? ' Hộp thoại đang mở đã đóng lại, hãy mở lại thao tác.' : '');
    render();
  });
}
function persistStatus() {
  if (VIEW) setStatus('Chế độ xem');
  else if (pendingHandle) setStatus('Chưa mở file dữ liệu');
  else setStatus('Chưa kết nối file — đang lưu tạm trong trình duyệt', true);
}
// Hoàn tác: nhớ trạng thái trước mỗi thay đổi (tối đa 10 bước, mất khi tải lại trang)
const undoStack = [];
let lastJSON = JSON.stringify(D);
function commit(label = 'thay đổi', opts = {}) {
  _cache = null;
  if (ui.plans) ui.plans = cashPlans(ui.cash);
  if (!VIEW) {   // chế độ xem: chỉ tính lại, không lưu, không hoàn tác
    if (opts.noUndo) undoStack.length = 0;
    else { undoStack.push({ label, json: lastJSON }); if (undoStack.length > 10) undoStack.shift(); }
    persist();
  }
  opts.soft ? softRender() : render();
}
function undo() {
  const u = !VIEW && undoStack.pop(); if (!u) return;
  D = normalize(JSON.parse(u.json)); _cache = null; ui.plans = null; ui.notice = ''; ui.rebuyOff = null;
  persist(); render();
}

// IndexedDB để nhớ file đã chọn giữa các lần mở app
function idb(mode, fn) {
  return new Promise((res, rej) => {
    const rq = indexedDB.open('tai-san', 1);
    rq.onupgradeneeded = () => rq.result.createObjectStore('kv');
    rq.onerror = () => rej(rq.error);
    rq.onsuccess = () => { const tx = rq.result.transaction('kv', mode); const r = fn(tx.objectStore('kv')); tx.oncomplete = () => res(r && r.result); tx.onerror = () => rej(tx.error); };
  });
}
const idbGet = k => idb('readonly', s => s.get(k));
const idbSet = (k, v) => idb('readwrite', s => s.put(v, k));

const hasData = x => x.vang.lo.length + x.vang.gia.length + x.vang.ban.length > 0;
// File không dùng được (rỗng, hỏng, không phải dữ liệu của app): màn chờ chỉ cách lấy lại, không tự ghi gì vào file
const badFile = msg => Object.assign(new Error(msg), { bad: true });
// Đọc dữ liệu của app từ một file (bản sao lưu hoặc file dữ liệu); lỗi thì ném badFile
async function readData(h) {
  const text = await (await h.getFile()).text();
  if (!text.trim()) throw badFile(`File ${h.name} đang rỗng (0 byte), có thể vừa bị xóa trắng.`);
  let raw; try { raw = JSON.parse(text); } catch { throw badFile(`File ${h.name} không phải dữ liệu JSON hợp lệ (có thể đã bị hỏng).`); }
  if (!raw || typeof raw !== 'object' || typeof raw.vang !== 'object') throw badFile(`File ${h.name} không phải dữ liệu của app quản lý vàng.`);
  return normalize(raw);
}
// seenAs: dấu của nội dung đang nằm trong file khi ghi đè có chủ ý (khôi phục, ghi lại vào chính file đang dùng)
async function useFile(handle, fromNew, seenAs) {
  let mod = null, fileCap = '', keepLocal = false;
  if (!fromNew) {
    mod = (await handle.getFile()).lastModified;
    const F = await readData(handle);
    fileCap = F.cap_nhat || '';
    // Đối chiếu với mốc đồng bộ, không hỏi OK/Hủy:
    // trình duyệt không có thay đổi mới → dùng file; có thay đổi mà file không đổi → ghi bản trình duyệt vào file;
    // cả hai cùng đổi → dùng file, bản trình duyệt tự tải về để không mất
    const mark = getMark(), body = x => JSON.stringify(Object.assign({}, x, { cap_nhat: '' }));
    const localDirty = hasData(D) && (D.cap_nhat || '') !== mark && body(D) !== body(F);
    const fileChanged = (F.cap_nhat || '') !== mark;
    if (!localDirty || fileChanged) {
      if (localDirty) {
        const name = backupName();
        download(name, JSON.stringify(D, null, 2), 'application/json');
        ui.notice = `Bản trong trình duyệt khác với file <b>${esc(handle.name)}</b> (file đã được sửa ở nơi khác). App dùng dữ liệu trong file; bản trình duyệt đã tải về thành <b>${name}</b>. Cần lấy lại thì vào Tham số → Khôi phục từ bản sao lưu.`;
      }
      D = F;
    } else keepLocal = true;
  }
  gen++; seen = seenAs || { mod, cap: fileCap };   // dấu của nội dung đang nằm trong file (kể cả khi giữ bản trình duyệt để ghi vào)
  ui.gateError = ''; ui.gateBad = ui.gateLost = false; ui.gateRestore = null;
  fileHandle = handle; pendingHandle = null;
  try { await idbSet('file', handle); } catch { }
  if (fromNew || keepLocal) return commit('', { noUndo: true });   // tạo file mới, hoặc đưa bản trình duyệt vào file
  // Mở file chỉ đọc: không ghi lại file (mở để xem không đổi cap_nhat, không gây xung đột OneDrive).
  // Bản trong trình duyệt vẫn thay bằng dữ liệu file, kẻo lần mở sau tưởng trình duyệt có thay đổi chưa ghi rồi ghi bản cũ đè file
  _cache = null; undoStack.length = 0; ui.plans = null;
  lastJSON = JSON.stringify(D);
  let localOK = true;
  try { localStorage.setItem(KEY, lastJSON); localStorage.setItem(CAP_KEY, D.cap_nhat || ''); } catch { localOK = false; }
  if (localOK) setMark(D.cap_nhat || '');
  else {   // bộ nhớ trình duyệt đầy: xóa mốc để lần mở sau dùng dữ liệu trong file
    try { localStorage.removeItem(SYNC_KEY); } catch { }
    if (!localErrShown) { localErrShown = true; alert('Bộ nhớ trình duyệt đầy; dữ liệu vẫn nằm trong file ' + handle.name + '.'); }
  }
  setStatus('Đã mở ' + handle.name);
  render();
}
// Dấu hiện tại của một file (để ghi đè có chủ ý mà không bị coi là "file đã bị sửa ở nơi khác")
async function fileSeen(h) {
  const fi = await h.getFile(), text = await fi.text();
  let cap = ''; try { cap = JSON.parse(text).cap_nhat || ''; } catch { }
  return { mod: fi.lastModified, cap, text };
}
// Ghi dữ liệu F vào đúng file đang nhớ (file hỏng, rỗng, hoặc khôi phục bản sao lưu) rồi mở như thường.
// Nội dung cũ của file (nếu còn) tải về trước, để còn gỡ tay nếu cần. Cần quyền ghi file.
async function writeInto(h, F, what) {
  const s = await fileSeen(h), old = s.text.trim() ? `${DL.truocKhoiPhuc}${stamp()}.json` : '';
  if (old) download(old, s.text, 'application/json');
  D = normalize(JSON.parse(JSON.stringify(F))); ui.plans = null;
  await useFile(h, true, { mod: s.mod, cap: s.cap });
  setNotice(`${what} đã được ghi vào <b>${esc(h.name)}</b>.${old ? ` Nội dung cũ của file đã tải về thành <b>${old}</b>.` : ''}`);
}
// Khôi phục bản sao lưu vào file đang nhớ ở màn chờ: chưa có quyền ghi thì hiện thêm một nút để Chrome hỏi quyền
async function restoreInto(h, F, name) {
  if (await h.queryPermission({ mode: 'readwrite' }) === 'granted') return writeInto(h, F, 'Bản sao lưu ' + esc(name));
  ui.gateRestore = { F, name }; render();
}
