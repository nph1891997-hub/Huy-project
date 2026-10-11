// Tab mở qua đêm: sáng gõ giá; đang gõ dở thì qua nửa đêm; đang nhập bù ngày cũ; hộp Bán mở trước nửa đêm
const { makeDisk, machine, T, sample } = require('../harness');
exports.name = 'Tab mở qua đêm (A11, C5)';
exports.run = async (browser, chk) => {
  const { eq, has, noErr, fails } = chk;
  const disk = makeDisk(), d = sample({ days: 20, end: '2026-10-11' });
  d.vang.lo.push({ id: 'V-2026-001', loai_id: 'tsjc', ngay_mua: '2026-09-20', so_mon: 2, trong_luong_mon_dem: 10000, tong_tien_mua: 300e6, ky_vong_pct: 15, sap_dat_pct: 2, nhac_tut_pct: null, ghi_chu: '' });
  disk.set('tai-san.json', JSON.stringify(d));
  const A = await machine(browser, disk); A.idb.set('file', 'tai-san.json');
  const page = await A.open({ time: '2026-10-11T23:50:00+07:00', perm: { query: 'granted' } });
  const mod0 = disk.get('tai-san.json').mod;
  has(await T.status(page), 'Đã mở tai-san.json · sửa lần cuối', 'mở chỉ đọc'); eq(disk.get('tai-san.json').mod, mod0, 'mở không ghi lại file (A13)');
  const gia = async ngay => (await T.D(page)).vang.gia.find(p => p.ngay === ngay)?.mua_vao;
  // (a) qua đêm, sáng quay lại tab rồi gõ giá
  await page.clock.setSystemTime('2026-10-12T07:00:00+07:00'); await page.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await page.waitForTimeout(80);
  eq(await page.locator('#priceForm [name=ngay]').inputValue(), '2026-10-12', 'ô Ngày sang 12/10'); eq(await page.locator('#priceForm [name=ngay]').getAttribute('max'), '2026-10-12', 'lịch cho chọn tới hôm nay');
  has(await T.text(page, '#priceForm .c-note'), 'chưa cập nhật hôm nay', 'dòng vàng');
  await T.price(page, 'tsjc', '163', '165');
  eq(await gia('2026-10-11'), 158000000, 'giá 11/10 giữ nguyên'); eq(await gia('2026-10-12'), 163000000, 'giá lưu cho 12/10');
  // (b) 23:59 đang gõ dở thì tick nửa đêm; rời dòng → lưu cho ngày mới và có dòng báo (C5)
  await T.day(page, '2026-10-12T23:59:00+07:00');
  const mv = page.locator('#priceForm [name=mv_tsjc]'); await mv.fill('166'); await mv.dispatchEvent('input');
  await T.day(page, '2026-10-13T00:00:30+07:00');
  eq(await mv.inputValue(), '166', 'dòng đang gõ không bị vẽ lại');
  await page.locator('body').click({ position: { x: 5, y: 5 } }); await page.waitForTimeout(80);
  eq(await gia('2026-13'.replace('13', '10-13')), 166000000, 'giá lưu cho 13/10'); eq(await gia('2026-10-12'), 163000000, 'giá 12/10 giữ nguyên');
  has(await T.notice(page), 'Đã sang ngày 13/10', 'báo đã sang ngày khi gõ dở qua nửa đêm (C5)');
  // (c) đang nhập bù 10/10 thì qua nửa đêm: giữ ngày đang nhập
  await page.evaluate(() => act['notice-close']()); await T.day(page, '2026-10-13T23:58:00+07:00');
  const ng = page.locator('#priceForm [name=ngay]'); await ng.fill('2026-10-10'); await ng.dispatchEvent('input'); await page.waitForTimeout(50);
  await T.day(page, '2026-10-14T00:01:00+07:00');
  eq(await ng.inputValue(), '2026-10-10', 'đang nhập bù thì giữ ngày'); await page.locator('[data-act=price-today]').click(); await page.waitForTimeout(50);
  eq(await ng.inputValue(), '2026-10-14', 'Về hôm nay = ngày mới');
  // (d) hộp Bán mở 23:59, xác nhận 00:02 → ngày bán là hôm nay mới (C5)
  await T.day(page, '2026-10-14T23:59:00+07:00'); await T.price(page, 'tsjc', '172', '174');
  await T.click(page, 'sell', 'V-2026-001'); eq(await page.locator('#dlgForm [name=ngay]').inputValue(), '2026-10-14', 'ngày bán mặc định lúc mở');
  await T.day(page, '2026-10-15T00:02:00+07:00');
  await page.locator('#dlgForm .dlg-actions button.primary').click(); await page.waitForTimeout(80);
  eq((await T.D(page)).vang.ban.at(-1).ngay, '2026-10-15', 'ngày bán lấy lúc xác nhận');
  noErr(page, 'lỗi JS'); return fails;
};
