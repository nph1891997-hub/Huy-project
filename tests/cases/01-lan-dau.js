// Lần đầu dùng: tạo file, thêm lô với loại mới, giá đầu tiên (so với đơn giá lô), nhóm lô, giữ, bán có nhắc mua lại, Cần tiền, Lịch sử
const { makeDisk, machine, T } = require('../harness');
exports.name = 'Lần đầu dùng: tạo file → thêm lô → nhập giá → giữ → bán → Cần tiền → Lịch sử';
exports.run = async (browser, chk) => {
  const { eq, ok, has, noErr, fails } = chk;
  const disk = makeDisk(), A = await machine(browser, disk);
  const page = await A.open({ time: '2026-10-11T09:00:00+07:00' });
  has(await T.app(page), 'Bước 1.', 'màn Bắt đầu');
  await T.click(page, 'file-new'); await page.waitForTimeout(150);
  eq(await page.evaluate(() => window.__lastSuggested), 'tai-san.json', 'tên gợi ý lần đầu');
  eq(await T.status(page), 'Đã lưu vào tai-san.json', 'trạng thái sau tạo file');
  // Thêm lô: loại mới theo chỉ, 2 món × 1 chỉ, đơn giá 15.200 (nghìn đồng)
  await T.click(page, 'lot-add'); const f = page.locator('#dlgForm');
  ok(await f.locator('#ntField').evaluate(e => e.classList.contains('hidden')), 'ô mức nhắc ẩn khi loại chưa có giá');
  await f.locator('[name=ten_moi]').fill('Nhẫn 9999'); await f.locator('[name=dv_moi]').selectOption('chi'); await f.locator('[name=dv_moi]').dispatchEvent('input');
  eq(await f.locator('[name=w_chi]').inputValue(), '1', 'trọng lượng mặc định 1 chỉ theo đơn vị loại mới');
  await f.locator('[name=so_mon]').fill('2'); await f.locator('[name=so_mon]').dispatchEvent('input');
  await f.locator('[name=don_gia]').fill('15.200'); await f.locator('[name=don_gia]').dispatchEvent('input');
  eq(await f.locator('[name=tong]').inputValue(), '30.400.000', 'tổng tiền = đơn giá × 2 chỉ, 15.200 hiểu là nghìn đồng');
  await f.locator('.dlg-actions button.primary').click(); await page.waitForTimeout(100);
  const D1 = await T.D(page); eq(D1.vang.lo.length, 1, 'đã thêm lô'); eq(disk.json('tai-san.json').vang.lo.length, 1, 'lô đã ghi vào file');
  has(await T.app(page), 'Vốn đang giữ 30.400.000 đ', 'vốn đang giữ tính cả lô chưa có giá (A18)');
  const tid = D1.vang.loai[0].id;
  // Giá đầu tiên gõ thiếu số → so với đơn giá lô, Hủy → ô trống, không lưu
  page.__policy = () => false; await T.price(page, tid, '1.520', '1.540');
  has(page.__log.dialogs.at(-1)?.msg, 'so với đơn giá lô V-2026-001', 'giá đầu tiên so với đơn giá lô (A14)');
  eq((await T.D(page)).vang.gia.length, 0, 'Hủy thì không lưu');
  page.__policy = () => true; await T.price(page, tid, '15.100', '15.400');
  eq((await T.D(page)).vang.gia[0], { ngay: '2026-10-11', loai_id: tid, mua_vao: 15100000, ban_ra: 15400000 }, 'giá lưu đúng');
  has(await T.app(page), 'Giữ — chưa đạt mục tiêu (1)', 'lô lỗ chênh lệch vào nhóm Giữ');
  await page.locator('details[data-lazy=giu] summary').click(); await page.waitForTimeout(50);
  const giu = await T.text(page, 'details[data-lazy=giu]');
  has(giu, 'chưa qua chênh lệch mua–bán', 'ghi chú lỗ chênh lệch'); has(giu, 'Bán…', 'nhóm Giữ có nút Bán… (B14)');
  // Hôm sau giá 17.600 → +15,8% → Nên chốt; Giữ, nâng mục tiêu
  await T.day(page, '2026-10-12T09:00:00+07:00');
  eq(await page.locator('#priceForm [name=ngay]').inputValue(), '2026-10-12', 'ô Ngày sang ngày mới');
  await T.price(page, tid, '17.600', '17.900');
  has(await T.app(page), 'Nên chốt — đã đạt mục tiêu (1)', 'đạt mục tiêu');
  await T.click(page, 'hold', 'V-2026-001');
  eq(await page.locator('#dlgForm [name=kv]').inputValue(), '20', 'mục tiêu mới mặc định'); eq(await page.locator('#dlgForm [name=nt]').inputValue(), '15', 'mức nhắc mặc định');
  await page.locator('#dlgForm .dlg-actions button.primary').click(); await page.waitForTimeout(80);
  eq((await T.D(page)).vang.lo[0].nhac_tut_pct, 15, 'đã lưu mức nhắc');
  // Bán 1 món ngay tại nhóm Giữ, đặt mua lại 16.500
  await T.click(page, 'sell', 'V-2026-001'); const fs_ = page.locator('#dlgForm');
  await fs_.locator('details summary').click(); await fs_.locator('[name=mua_lai]').fill('16.500'); await fs_.locator('.dlg-actions button.primary').click(); await page.waitForTimeout(80);
  eq((await T.D(page)).vang.ban[0].gia_mua_lai, 16500000, 'giá muốn mua lại'); has(await T.app(page), 'Đang chờ giá mua lại (1)', 'thẻ chờ mua lại');
  // Cần tiền 10tr
  await T.tab(page, 'cantien'); await page.locator('#cashForm [name=x]').fill('10'); await page.locator('#cashForm button[type=submit]').click(); await page.waitForTimeout(80);
  has(await T.app(page), 'Dư so với số cần 7.600.000 đ', 'phương án bán 1 món');
  // Lịch sử: lời đã chốt theo năm và theo loại phải khớp thẻ Hôm nay (A19)
  await T.tab(page, 'lichsu'); const ls = await T.app(page);
  has(ls, 'Lời đã chốt theo năm Năm Số lần bán Tiền thu Lời/lỗ chốt 2026 1 17.600.000 đ +2.400.000 đ', 'lời đã chốt theo năm (A19)');
  has(ls.match(/Thống kê theo loại vàng.*?Lịch sử giá/)?.[0], '+2.400.000 đ +2.400.000 đ', 'lời đã chốt theo loại (A19)');
  noErr(page, 'lỗi JS');
  return fails;
};
