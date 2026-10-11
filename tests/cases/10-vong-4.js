// Các sửa vòng này: hỏi trước Tạo file mới, màn Bắt đầu cho máy thứ hai, giờ sửa lần cuối khi mở, sàn ngưỡng chênh lệch cao,
// ghi "tiệm hạ giá mua vào" ở mọi nhóm, hạn mức khi sửa lô, ngày giá ở thẻ mua lại
const { makeDisk, machine, T, sample } = require('../harness');
exports.name = 'Vòng 4: Tạo file mới, máy thứ hai, ngưỡng chênh lệch, hạ giá mua vào mọi nhóm, hạn mức khi sửa lô, ngày giá mua lại';
exports.run = async (browser, chk) => {
  const { eq, has, not, ok, noErr } = chk;
  // (1) Máy thứ hai: màn Bắt đầu đưa Mở file có sẵn lên trước; Tạo file mới hỏi trước, Hủy thì không mở hộp Lưu
  const disk = makeDisk(), d0 = sample({ days: 12, end: '2026-10-11' }); disk.set('tai-san.json', JSON.stringify(d0));
  const B = await machine(browser, disk, { name: 'B' }); let p = await B.open({ time: '2026-10-11T09:00:00+07:00' });
  const app = await T.app(p); ok(app.indexOf('Mở file có sẵn') < app.indexOf('Tạo file dữ liệu'), 'Mở file có sẵn đứng trước');
  eq(await p.locator('[data-act=file-open]').first().getAttribute('class'), 'primary', 'Mở file có sẵn là nút chính');
  p.__policy = () => false; await p.evaluate(() => { window.__saveAs = 'tai-san.json'; }); await T.click(p, 'file-new'); await p.waitForTimeout(100);
  has(p.__log.dialogs.at(-1)?.msg, 'Nếu đã có file tai-san.json', 'hỏi trước khi mở hộp Lưu'); eq(await p.evaluate(() => window.__lastSuggested), null, 'Hủy thì không mở hộp Lưu');
  eq(disk.json('tai-san.json').vang.gia.length, 12, 'file của máy kia còn nguyên'); p.__policy = () => true;
  await p.evaluate(() => { window.__pick = 'tai-san.json'; }); await T.click(p, 'file-open'); await p.waitForTimeout(100);
  has(await T.status(p), 'Đã mở tai-san.json · sửa lần cuối 11/10', 'mở file có sẵn, ghi giờ sửa lần cuối'); noErr(p, 'lỗi JS (1)');
  // (2) Sàn ngưỡng chênh lệch cao: chênh lệch thường 0,5% → 0,8% chưa cao, 1,1% là cao
  const disk2 = makeDisk(), d = sample({ days: 40, end: '2026-10-10', mv0: 160e6, spread: 0.005 });
  d.vang.lo.push({ id: 'V-2026-001', loai_id: 'tsjc', ngay_mua: '2026-07-01', so_mon: 2, trong_luong_mon_dem: 10000, tong_tien_mua: 300e6, ky_vong_pct: 30, sap_dat_pct: 2, nhac_tut_pct: null, ghi_chu: '' });
  d.vang.lo.push({ id: 'V-2026-002', loai_id: 'tsjc', ngay_mua: '2026-07-05', so_mon: 1, trong_luong_mon_dem: 10000, tong_tien_mua: 165e6, ky_vong_pct: 15, sap_dat_pct: 2, nhac_tut_pct: null, ghi_chu: '' });
  d.vang.ban.push({ id: 'B-0001', lo_id: 'V-2026-001', ngay: '2026-09-01', so_mon: 1, gia_ban: 165e6, gia_mua_lai: 140e6, ghi_chu: '' }); d.vang.so_thu_tu = { lo: { 2026: 2 }, ban: 1 };
  d.tham_so.vang_han_muc_von = 500e6; disk2.set('tai-san.json', JSON.stringify(d));
  const A = await machine(browser, disk2); A.idb.set('file', 'tai-san.json'); p = await A.open({ time: '2026-10-11T09:00:00+07:00', perm: { query: 'granted' } });
  await T.price(p, 'tsjc', '159', '160,3'); not(await T.text(p, '#buy_tsjc'), 'Đợi, chênh lệch cao', 'chênh lệch 0,8% (thường 0,5%) chưa cao');
  await T.price(p, 'tsjc', '159', '160,8'); has(await T.text(p, '#buy_tsjc'), 'Đợi, chênh lệch cao', 'chênh lệch 1,1% là cao');
  // (3) Tiệm hạ giá mua vào 150/160,8: lô Giữ (+...%) và lô Đang lỗ đều ghi thiệt
  await T.price(p, 'tsjc', '150', '160,8'); const g = (await T.app(p)).replace(/^.*?Tổng lời [^ ]+ đ /, '');
  has(g, 'Đang lỗ', 'lô 002 lỗ'); has(g.match(/Đang lỗ.*$/)?.[0], 'tiệm đang hạ giá mua vào', 'Đang lỗ ghi hạ giá mua vào');
  await p.locator('details[data-lazy=giu] summary').click(); await p.waitForTimeout(50);
  has(await T.text(p, 'details[data-lazy=giu]'), 'tiệm đang hạ giá mua vào', 'nhóm Giữ ghi hạ giá mua vào');
  // (4) Thẻ mua lại ghi ngày của giá khi giá cũ: sang ngày mới mà chưa nhập giá
  await T.price(p, 'tsjc', '138', '139'); await T.day(p, '2026-10-12T08:00:00+07:00');
  has(await T.text(p, '#homRest'), '139.000.000 đ (giá ngày 11/10)', 'thẻ Có thể mua lại ghi ngày giá cũ');
  // (5) Hạn mức khi sửa lô: tăng tổng tiền vượt hạn mức → hỏi; Hủy thì không lưu
  p.__policy = m => !m.includes('vượt hạn mức');
  await T.tab(p, 'lo'); await T.click(p, 'lot-edit', 'V-2026-002'); const f = p.locator('#dlgForm');
  await f.locator('[name=tong]').fill('400'); await f.locator('[name=tong]').dispatchEvent('input'); await f.locator('.dlg-actions button.primary').click(); await p.waitForTimeout(80);
  has(p.__log.dialogs.at(-1)?.msg, 'vượt hạn mức 500tr', 'hỏi khi sửa lô vượt hạn mức'); eq((await T.D(p)).vang.lo[1].tong_tien_mua, 165e6, 'Hủy thì không lưu');
  // sửa ghi chú (vốn không tăng) thì không hỏi
  const n0 = p.__log.dialogs.length; await f.locator('[name=tong]').fill('165'); await f.locator('[name=tong]').dispatchEvent('input');
  await f.locator('details summary').click(); await f.locator('[name=ghi_chu]').fill('tiệm A'); await f.locator('.dlg-actions button.primary').click(); await p.waitForTimeout(80);
  eq(p.__log.dialogs.slice(n0).filter(x => x.msg.includes('hạn mức')).length, 0, 'không tăng vốn thì không hỏi'); eq((await T.D(p)).vang.lo[1].ghi_chu, 'tiệm A', 'đã lưu');
  noErr(p, 'lỗi JS');
};
