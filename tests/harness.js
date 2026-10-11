// Bộ giả lập app quản lý vàng trong Chromium (Playwright): mock File System Access (có mô phỏng Chrome xóa trắng file ở hộp Lưu),
// IndexedDB giả nhớ file giữa các lần tải lại, đĩa dùng chung giữa các "máy", đồng hồ giả, ghi lại mọi alert/confirm và file tải về.
// Dùng bởi tests/run.js; không đụng vào file thật trên máy.
const { chromium } = require('playwright');
const path = require('path');
const URL = 'file://' + path.resolve(__dirname, '..', 'index.html');
let modSeq = 1000;

function makeDisk() {
  const files = new Map();
  return {
    files,
    get: n => files.get(n) || null,
    set: (n, text) => { files.set(n, { text, mod: ++modSeq }); },
    del: n => files.delete(n),
    touch: n => { const f = files.get(n); if (f) f.mod = ++modSeq; },
    json: n => JSON.parse(files.get(n).text),
  };
}

const INIT = `(() => {
  window.__perm = { query: 'prompt', request: 'granted', byName: {} };
  const P = n => window.__perm.byName[n] || window.__perm;
  window.__pick = null; window.__saveAs = undefined; window.__lastSuggested = null;
  class H {
    constructor(name) { this.name = name; this.kind = 'file'; }
    async getFile() {
      const r = await window.__fs('read', this.name);
      if (!r) throw Object.assign(new Error('A requested file or directory could not be found'), { name: 'NotFoundError' });
      const text = r.text;
      return { name: this.name, lastModified: r.mod, size: text.length, text: async () => text };
    }
    async createWritable() {
      if (P(this.name).query !== 'granted') throw Object.assign(new Error('not allowed'), { name: 'NotAllowedError' });
      let buf = ''; const name = this.name;
      return { write: async t => { buf += t; }, close: async () => { await window.__fs('write', name, buf); } };
    }
    async queryPermission() { return P(this.name).query; }
    async requestPermission() { const q = P(this.name), r = q.request; if (r === 'granted') window.__perm.byName[this.name] = { query: 'granted', request: 'granted' }; return r; }
    async isSameEntry(o) { return !!o && o.name === this.name; }
  }
  window.__H = H;
  const abort = () => Object.assign(new Error('The user aborted a request.'), { name: 'AbortError' });
  window.showOpenFilePicker = async () => { const n = window.__pick; window.__pick = null; if (!n) throw abort(); window.__perm.byName[n] = { query: 'granted', request: 'granted' }; return [new H(n)]; };
  window.showSaveFilePicker = async (o) => {
    window.__lastSuggested = o && o.suggestedName; const n = window.__saveAs === undefined ? o.suggestedName : window.__saveAs; window.__saveAs = undefined;
    if (!n) throw abort();
    await window.__fs('truncate', n);   // Chrome xóa trắng file được chọn trong hộp Lưu
    window.__perm.byName[n] = { query: 'granted', request: 'granted' };
    return new H(n);
  };
  // IndexedDB giả: chỉ nhớ tên file (qua Node) để tải lại trang vẫn nhớ
  Object.defineProperty(window, 'indexedDB', { configurable: true, value: { open() {
    const rq = {};
    setTimeout(() => {
      rq.result = { transaction() { const tx = {}; const store = {
        get: k => { const r = {}; (async () => { const n = await window.__idb('get', k); r.result = n ? new H(n) : undefined; setTimeout(() => tx.oncomplete && tx.oncomplete(), 0); })(); return r; },
        put: (v, k) => { const r = {}; (async () => { await window.__idb('put', k, v && v.name); setTimeout(() => tx.oncomplete && tx.oncomplete(), 0); })(); return r; } };
        tx.objectStore = () => store; return tx; } };
      rq.onsuccess && rq.onsuccess();
    }, 0);
    return rq;
  } } });
  window.__dl = [];
})();`;

async function launch() { return chromium.launch().catch(() => chromium.launch({ executablePath: process.env.CHROME_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' })); }

// Một "máy": context riêng (localStorage riêng, IndexedDB riêng), đĩa dùng chung
async function machine(browser, disk, { name = 'A', fsa = true, tz = 'Asia/Ho_Chi_Minh' } = {}) {
  const ctx = await browser.newContext({ timezoneId: tz, locale: 'vi-VN', acceptDownloads: true });
  const idb = new Map();
  await ctx.exposeFunction('__fs', (op, n, text) => {
    if (op === 'read') return disk.get(n);
    if (op === 'write') { disk.set(n, text); return true; }
    if (op === 'truncate') { if (disk.get(n)) disk.set(n, ''); else disk.set(n, ''); return true; }
  });
  await ctx.exposeFunction('__idb', (op, k, v) => { if (op === 'get') return idb.get(k) || null; idb.set(k, v); return true; });
  if (fsa) await ctx.addInitScript(INIT);
  else await ctx.addInitScript(`window.__dl = []; delete window.showOpenFilePicker;`);
  const m = { name, ctx, idb, pages: [] };
  m.open = async (opts = {}) => {
    const page = await ctx.newPage();
    const log = { dialogs: [], errors: [], console: [] };
    page.__log = log; page.__policy = opts.policy || (() => true);
    page.on('dialog', async d => { const ans = page.__policy(d.message(), d.type()); log.dialogs.push({ type: d.type(), msg: d.message(), ans }); if (d.type() === 'confirm' && !ans) await d.dismiss(); else await d.accept(); });
    page.on('pageerror', e => log.errors.push(String(e)));
    page.on('console', c => { if (c.type() === 'error' || c.type() === 'warning') log.console.push(c.text()); });
    if (opts.perm) await page.addInitScript(p => { window.__permInit = p; }, opts.perm);
    await page.addInitScript(() => { if (window.__permInit && window.__perm) Object.assign(window.__perm, window.__permInit); });
    if (opts.time) await page.clock.setSystemTime(opts.time);
    await page.goto(URL);
    // Đếm thao tác (act) đang chạy dở, kể cả phần bất đồng bộ (xin quyền, đọc/ghi file), để T.idle biết khi nào app rảnh
    await page.evaluate(() => {
      window.download = (n, t) => window.__dl.push({ name: n, text: t });
      window.__busy = 0;
      for (const k of Object.keys(act)) { const f = act[k]; act[k] = (...a) => { window.__busy++; let r; try { r = f(...a); } catch (e) { window.__busy--; throw e; } return Promise.resolve(r).finally(() => window.__busy--); }; }
    });
    // Mở xong: dòng trạng thái luôn có chữ khi khởi động xong (đã mở file, màn chờ, chưa kết nối file, chế độ xem)
    await page.waitForFunction(() => document.getElementById('status').textContent !== '', null, { timeout: 5000 }).catch(() => { });
    await T.idle(page);
    m.pages.push(page);
    return page;
  };
  return m;
}

// Tiện ích thao tác
const T = {
  // Đợi app vẽ lại xong (softRender hẹn giờ 0 ms; máy chậm thì có thể trễ hơn mọi waitForTimeout ngắn)
  settle: async page => { await page.waitForFunction(() => !softPending && !softTimer).catch(() => { }); await page.waitForTimeout(30); },
  // Đợi app rảnh: không còn thao tác chạy dở, không còn phần vẽ lại đang chờ, hàng đợi lưu đã ghi xong.
  // Dùng thay cho chờ cố định: máy chậm (nhiều trình duyệt chạy song song) thì lần ghi file có thể trễ hơn mọi khoảng chờ ngắn
  idle: async page => {
    await page.waitForFunction(() => !window.__busy && !softPending && !softTimer, null, { timeout: 10000 }).catch(() => { });
    await page.evaluate(async () => { let c; do { c = saveChain; await c; } while (c !== saveChain); }).catch(() => { });
    await page.waitForTimeout(20);
  },
  // Đổi giờ hệ thống rồi cho app kiểm tra sang ngày như mỗi phút
  day: async (page, time) => { await page.clock.setSystemTime(time); await page.evaluate(() => tickDay()); await T.settle(page); },
  text: async (page, sel) => (await page.locator(sel).first().textContent().catch(() => null))?.replace(/\s+/g, ' ').trim(),
  app: async page => (await page.locator('#app').innerText()).replace(/\s+/g, ' ').trim(),
  status: page => page.locator('#status').textContent(),
  click: async (page, act, id) => { await page.locator(`[data-act="${act}"]${id ? `[data-id="${id}"]` : ''}`).first().click(); await T.idle(page); },
  tab: (page, k) => page.locator(`nav [data-k="${k}"]`).click(),
  dl: page => page.evaluate(() => window.__dl.splice(0)),
  D: page => page.evaluate(() => JSON.parse(JSON.stringify(D))),
  ui: page => page.evaluate(() => JSON.parse(JSON.stringify(ui))),
  notice: async page => (await page.locator('#noticeSlot').innerText().catch(() => '')).replace(/\s+/g, ' ').trim(),
  // Gõ giá vào dòng của loại typeId cho form giá; rời dòng bằng Tab/blur
  price: async (page, typeId, mv, br) => {
    const f = page.locator('#priceForm');
    await f.locator(`[name="mv_${typeId}"]`).fill(String(mv));
    await f.locator(`[name="mv_${typeId}"]`).dispatchEvent('input');
    if (br != null) { await f.locator(`[name="br_${typeId}"]`).fill(String(br)); await f.locator(`[name="br_${typeId}"]`).dispatchEvent('input'); }
    await page.locator('body').click({ position: { x: 5, y: 5 } });   // rời dòng
    await T.idle(page); await page.waitForTimeout(40);
  },
  // Thêm lô qua hộp thoại
  addLot: async (page, { ngay, loai, tenMoi, dvMoi, soMon = 1, w = {}, donGia, tong, kv, nt, sd, ghiChu } = {}) => {
    await T.click(page, 'lot-add');
    const f = page.locator('#dlgForm');
    const det = f.locator('details'); if (await det.count() && !(await det.evaluate(e => e.open))) await det.locator('summary').click();
    if (ngay) await f.locator('[name=ngay]').fill(ngay);
    if (loai) { await f.locator('[name=loai]').selectOption(loai); await f.locator('[name=loai]').dispatchEvent('input'); }
    if (tenMoi) { await f.locator('[name=ten_moi]').fill(tenMoi); if (dvMoi) { await f.locator('[name=dv_moi]').selectOption(dvMoi); await f.locator('[name=dv_moi]').dispatchEvent('input'); } }
    await f.locator('[name=so_mon]').fill(String(soMon));
    for (const [k, v] of Object.entries(w)) { await f.locator(`[name=w_${k}]`).fill(String(v)); await f.locator(`[name=w_${k}]`).dispatchEvent('input'); }
    if (donGia != null) { await f.locator('[name=don_gia]').fill(String(donGia)); await f.locator('[name=don_gia]').dispatchEvent('input'); }
    if (tong != null) { await f.locator('[name=tong]').fill(String(tong)); await f.locator('[name=tong]').dispatchEvent('input'); }
    if (kv != null) await f.locator('[name=kv]').fill(String(kv));
    if (sd != null) await f.locator('[name=sd]').fill(String(sd));
    if (nt != null) await f.locator('[name=nt]').fill(String(nt));
    if (ghiChu != null) await f.locator('[name=ghi_chu]').fill(ghiChu);
    await f.locator('.dlg-actions button.primary').click();
    await page.waitForTimeout(80);
  },
  sell: async (page, lotId, { k, gia, ngay, muaLai, ghiChu } = {}) => {
    const cur = await page.evaluate(() => tab); await T.tab(page, 'lo');
    await T.click(page, 'sell', lotId);
    const f = page.locator('#dlgForm');
    const det = f.locator('details'); if (await det.count() && !(await det.evaluate(e => e.open))) await det.locator('summary').click();
    if (k != null) { await f.locator('[name=k]').fill(String(k)); await f.locator('[name=k]').dispatchEvent('input'); }
    if (gia != null) { await f.locator('[name=gia]').fill(String(gia)); await f.locator('[name=gia]').dispatchEvent('input'); }
    if (ngay) await f.locator('[name=ngay]').fill(ngay);
    if (muaLai != null) await f.locator('[name=mua_lai]').fill(String(muaLai));
    if (ghiChu != null) await f.locator('[name=ghi_chu]').fill(ghiChu);
    await f.locator('.dlg-actions button.primary').click();
    await page.waitForTimeout(80);
    if (cur !== 'lo') await T.tab(page, cur);
  },
  dlgText: async page => (await page.locator('#dlg').innerText().catch(() => '')).replace(/\s+/g, ' ').trim(),
  dlgOpen: page => page.evaluate(() => document.getElementById('dlg').open),
};

// Dữ liệu mẫu
function sample({ days = 30, end = '2026-10-11', mv0 = 158e6, spread = 0.012, typeId = 'tsjc', unit = 'luong' } = {}) {
  const d = { phien_ban: 1, cap_nhat: '2026-10-11T01:00:00.000Z', tham_so: { lai_suat_ngan_hang: 5.5, lam_phat: 3.5, vang_ky_vong_mac_dinh: 15, vang_sap_dat_mac_dinh: 2, vang_mua_giam_pct: 5, vang_han_muc_von: null },
    vang: { loai: [{ id: typeId, ten: 'SJC miếng', don_vi_niem_yet: unit }], gia: [], lo: [], ban: [], so_thu_tu: { lo: {}, ban: 0 } }, tiet_kiem: [], cctg: [], dat: [] };
  const endT = Date.parse(end);
  for (let i = days - 1; i >= 0; i--) {
    const ngay = new Date(endT - i * 864e5).toISOString().slice(0, 10);
    const mv = Math.round(mv0 * (1 + 0.002 * Math.sin(i / 3)) / 1e5) * 1e5;
    d.vang.gia.push({ ngay, loai_id: typeId, mua_vao: mv, ban_ra: Math.round(mv * (1 + spread) / 1e5) * 1e5 });
  }
  return d;
}


// Kiểm tra: eq(thực tế, mong đợi, nhãn); has(chuỗi, mẩu, nhãn). Gom lỗi, không dừng ca kiểm thử
function checker() {
  const fails = [];
  const show = v => typeof v === 'string' ? JSON.stringify(v.length > 160 ? v.slice(0, 160) + '…' : v) : JSON.stringify(v);
  return {
    fails,
    eq: (a, b, label) => { if (JSON.stringify(a) !== JSON.stringify(b)) fails.push(`${label}: được ${show(a)}, mong ${show(b)}`); },
    ok: (c, label) => { if (!c) fails.push(label); },
    has: (s, part, label) => { if (!String(s ?? '').includes(part)) fails.push(`${label}: không thấy ${show(part)} trong ${show(String(s ?? ''))}`); },
    not: (s, part, label) => { if (String(s ?? '').includes(part)) fails.push(`${label}: không mong có ${show(part)}`); },
    noErr: (page, label) => { if (page.__log.errors.length) fails.push(`${label}: lỗi JS ${show(page.__log.errors.join(' | '))}`); },
  };
}
module.exports = { launch, makeDisk, machine, T, sample, URL, checker };
