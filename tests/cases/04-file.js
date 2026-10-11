// File hỏng, rỗng, mất; Khôi phục từ bản sao lưu (hỏi quyền, từ chối rồi cho); Dùng bản trình duyệt; Tạo file mới trùng tên; mở nhầm bản sao lưu
const { makeDisk, machine, T, sample } = require('../harness');
exports.name = 'File hỏng / rỗng / mất, Tạo file mới, mở nhầm bản sao lưu (A12, A16, A20, C6, C7, C8)';
exports.run = async (browser, chk) => {
  const { eq, has, not, ok, noErr, fails } = chk;
  const disk = makeDisk(), d = sample({ days: 12, end: '2026-10-11' });
  d.vang.lo.push({ id: 'V-2026-001', loai_id: 'tsjc', ngay_mua: '2026-09-20', so_mon: 2, trong_luong_mon_dem: 10000, tong_tien_mua: 300e6, ky_vong_pct: 15, sap_dat_pct: 2, nhac_tut_pct: null, ghi_chu: '' });
  disk.set('tai-san.json', JSON.stringify(d));
  const A = await machine(browser, disk); A.idb.set('file', 'tai-san.json');
  let p = await A.open({ time: '2026-10-11T09:00:00+07:00', perm: { query: 'granted' } });
  await T.sell(p, 'V-2026-001', { k: 1, gia: '160' }); await p.waitForTimeout(100); await p.close();
  const good = disk.get('tai-san.json').text;
  // (1) file hỏng lúc khởi động → màn chờ với cách lấy lại; khôi phục bản sao lưu cần quyền, từ chối rồi cho
  disk.set('tai-san.json', good.slice(0, 200));
  p = await A.open({ time: '2026-10-11T09:05:00+07:00', perm: { query: 'granted' } });
  let app = await T.app(p);
  has(app, 'không phải dữ liệu JSON hợp lệ', 'báo file hỏng'); has(app, 'Khôi phục từ bản sao lưu…', 'nút khôi phục'); has(app, 'Dùng bản trong trình duyệt', 'nút dùng bản trình duyệt'); has(app, 'Tạo file mới…', 'có Tạo file mới khi file hỏng');
  await p.evaluate(() => { window.__perm.byName['tai-san.json'] = { query: 'prompt', request: 'denied' }; });
  disk.set('sao-luu-vang-2026-10-10.json', JSON.stringify(sample({ days: 11, end: '2026-10-10' })));
  await p.evaluate(() => { window.__pick = 'sao-luu-vang-2026-10-10.json'; }); await T.click(p, 'gate-restore'); await p.waitForTimeout(100);
  has(await T.app(p), 'Ghi bản sao lưu sao-luu-vang-2026-10-10.json vào tai-san.json', 'chưa có quyền ghi → nút Ghi');
  await T.click(p, 'gate-restore-go'); await p.waitForTimeout(100);
  app = await T.app(p); has(app, 'Chưa được cho phép ghi', 'từ chối quyền → báo'); has(app, 'Ghi bản sao lưu', 'từ chối quyền vẫn còn nút Ghi');
  await p.evaluate(() => { window.__perm.byName['tai-san.json'].request = 'granted'; }); await T.click(p, 'gate-restore-go'); await p.waitForTimeout(150);
  eq(await T.status(p), 'Đã lưu vào tai-san.json', 'khôi phục xong'); eq((await T.dl(p)).map(x => x.name.slice(0, 24)), ['tai-san-truoc-khoi-phuc-'], 'nội dung hỏng tải về trước');
  eq(disk.json('tai-san.json').vang.gia.length, 11, 'file = bản sao lưu'); await p.close();
  // (2) file rỗng → Dùng bản trong trình duyệt
  disk.set('tai-san.json', ''); p = await A.open({ time: '2026-10-11T09:10:00+07:00', perm: { query: 'granted' } });
  has(await T.app(p), 'đang rỗng (0 byte)', 'báo file rỗng'); await T.click(p, 'gate-local'); await p.waitForTimeout(150);
  eq(await T.status(p), 'Đã lưu vào tai-san.json', 'ghi bản trình duyệt'); eq(disk.json('tai-san.json').vang.gia.length, 11, 'file = bản trình duyệt');
  // (3) đang mở file: Tạo file mới… chọn trùng chính file (Chrome xóa trắng) → ghi lại; tên gợi ý không trùng
  await T.tab(p, 'thamso'); await p.evaluate(() => { window.__saveAs = 'tai-san.json'; }); await T.click(p, 'file-new'); await p.waitForTimeout(150);
  eq(await p.evaluate(() => window.__lastSuggested), 'tai-san-moi.json', 'tên gợi ý khác file đang dùng (A12)');
  has(await T.notice(p), 'Đây là file đang dùng', 'báo ghi lại'); eq(disk.json('tai-san.json').vang.gia.length, 11, 'file được ghi lại');
  // (3b) Tạo file mới tên mới → chuyển sang file đó; (3c) Mở file khác chọn bản sao lưu → hỏi khôi phục, có hoàn tác
  await p.evaluate(() => { window.__saveAs = undefined; }); await T.click(p, 'file-new'); await p.waitForTimeout(150);
  eq(await T.status(p), 'Đã lưu vào tai-san-moi.json', 'chuyển sang file mới'); eq(A.idb.get('file'), 'tai-san-moi.json', 'nhớ file mới');
  await p.evaluate(() => { window.__pick = 'sao-luu-vang-2026-10-10.json'; }); await T.click(p, 'file-open'); await p.waitForTimeout(150);
  has(p.__log.dialogs.at(-1)?.msg, 'là bản sao lưu. Khôi phục nội dung này vào tai-san-moi.json?', 'hỏi khôi phục');
  has(await T.text(p, '#btnUndo'), 'khôi phục từ sao-luu-vang-2026-10-10.json', 'có hoàn tác'); eq(await T.status(p), 'Đã lưu vào tai-san-moi.json', 'vẫn ghi vào file dữ liệu');
  // (3d) Mở file khác chọn file tai-san-truoc-khoi-phuc-… (app tự tải về) → cũng hỏi khôi phục (A20)
  disk.set('tai-san-truoc-khoi-phuc-2026-10-11-09h05.json', good);
  await p.evaluate(() => { window.__pick = 'tai-san-truoc-khoi-phuc-2026-10-11-09h05.json'; }); await T.click(p, 'file-open'); await p.waitForTimeout(150);
  has(p.__log.dialogs.at(-1)?.msg, 'tai-san-truoc-khoi-phuc-2026-10-11-09h05.json là bản sao lưu', 'file truoc-khoi-phuc được nhận là bản sao lưu (A20)');
  eq(await T.status(p), 'Đã lưu vào tai-san-moi.json', 'không chuyển sang ghi vào bản sao lưu'); eq((await T.D(p)).vang.ban.length, 1, 'đã khôi phục nội dung');
  await p.close();
  // (4) file mất: màn chờ không còn "Dữ liệu nằm trong file" và nút Mở lại (C6); Tạo file mới có
  disk.del('tai-san-moi.json'); p = await A.open({ time: '2026-10-11T09:20:00+07:00', perm: { query: 'prompt' } });
  await T.click(p, 'file-reconnect'); await p.waitForTimeout(100); app = await T.app(p);
  has(app, 'Không tìm thấy file tai-san-moi.json', 'báo file mất'); not(app, 'Dữ liệu nằm trong file', 'bỏ đoạn Dữ liệu nằm trong file (C6)'); not(app, 'Mở lại tai-san-moi.json', 'bỏ nút Mở lại (C6)'); has(app, 'Tạo file mới…', 'có Tạo file mới');
  await p.close();
  // (5) màn chờ, file hỏng, Mở file khác… chọn đúng file đang nhớ → hiện cách lấy lại ngay (C7)
  disk.set('tai-san.json', '{"vang":'); A.idb.set('file', 'tai-san.json'); p = await A.open({ time: '2026-10-11T09:30:00+07:00', perm: { query: 'prompt' } });
  await p.evaluate(() => { window.__pick = 'tai-san.json'; }); await T.click(p, 'file-open'); await p.waitForTimeout(100); app = await T.app(p);
  has(app, 'không phải dữ liệu JSON hợp lệ', 'báo hỏng'); has(app, 'Khôi phục từ bản sao lưu…', 'có nút khôi phục ngay (C7)');
  // (6) Tạo file mới… ở màn chờ chọn file dữ liệu khác: Chrome xóa trắng, app ghi bản trình duyệt vào (rủi ro đã ghi ở mục 5), không có nhánh chết (C8)
  disk.set('khac.json', good); await p.evaluate(() => { window.__saveAs = 'khac.json'; }); await T.click(p, 'file-new'); await p.waitForTimeout(150);
  eq(await T.status(p), 'Đã lưu vào khac.json', 'ghi vào file vừa chọn'); eq(disk.json('khac.json').vang.gia.length, 12, 'nội dung = bản trình duyệt');
  noErr(p, 'lỗi JS'); return fails;
};
