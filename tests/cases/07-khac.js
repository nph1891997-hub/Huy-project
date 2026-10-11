// Sửa lần bán, lô đã đóng, Bán lấy lại vốn, Giữ khi lời đúng bằng mục tiêu, Cần tiền sửa số món rồi xác nhận, thêm loại ở Tham số
const { makeDisk, machine, T, sample } = require('../harness');
exports.name = 'Sửa lần bán, Bán lấy lại vốn, Giữ khi lời = mục tiêu, xác nhận Cần tiền, thêm loại (B13)';
exports.run = async (browser, chk) => {
  const { eq, has, ok, noErr, fails } = chk;
  const disk = makeDisk(), d = sample({ days: 15, end: '2026-10-11', mv0: 160e6 });
  d.vang.loai.push({ id: 'tnhan', ten: 'Nhẫn 9999', don_vi_niem_yet: 'chi' });
  for (let i = 0; i < 12; i++) { const ngay = new Date(Date.parse('2026-10-11') - i * 864e5).toISOString().slice(0, 10); d.vang.gia.push({ ngay, loai_id: 'tnhan', mua_vao: 15e6, ban_ra: 15.3e6 }); }
  d.vang.lo.push({ id: 'V-2025-001', loai_id: 'tsjc', ngay_mua: '2025-09-20', so_mon: 3, trong_luong_mon_dem: 10000, tong_tien_mua: 300e6, ky_vong_pct: 15, sap_dat_pct: 2, nhac_tut_pct: null, ghi_chu: '' });
  d.vang.lo.push({ id: 'V-2026-001', loai_id: 'tnhan', ngay_mua: '2026-01-10', so_mon: 10, trong_luong_mon_dem: 1000, tong_tien_mua: 120e6, ky_vong_pct: 15, sap_dat_pct: 2, nhac_tut_pct: null, ghi_chu: '' });
  d.vang.ban.push({ id: 'B-0001', lo_id: 'V-2025-001', ngay: '2025-12-20', so_mon: 1, gia_ban: 120e6, gia_mua_lai: null, ghi_chu: '' });
  d.vang.ban.push({ id: 'B-0002', lo_id: 'V-2026-001', ngay: '2026-05-05', so_mon: 2, gia_ban: 14e6, gia_mua_lai: null, ghi_chu: '' });
  d.vang.so_thu_tu = { lo: { 2025: 1, 2026: 1 }, ban: 2 };
  disk.set('tai-san.json', JSON.stringify(d));
  const A = await machine(browser, disk); A.idb.set('file', 'tai-san.json');
  const p = await A.open({ time: '2026-10-11T09:00:00+07:00', perm: { query: 'granted' } });
  has(await T.app(p), 'Lời đã chốt (từ trước đến nay) +24.000.000 đ', 'lời đã chốt ở Hôm nay');
  // Lịch sử với 2 lần bán ở 2 năm, 2 loại (A19)
  await T.tab(p, 'lichsu'); const ls = await T.app(p);
  has(ls, '2026 1 28.000.000 đ +4.000.000 đ', 'năm 2026'); has(ls, '2025 1 120.000.000 đ +20.000.000 đ', 'năm 2025');
  has(ls.match(/Thống kê theo loại vàng.*?Lịch sử giá/)?.[0], 'SJC miếng 2 lượng 200.000.000 đ 100.000.000 đ/lượng 320.000.000 đ +120.000.000 đ +20.000.000 đ', 'theo loại SJC');
  // Sửa lần bán: 1 → 2 món giá 125
  await T.click(p, 'sale-edit', 'B-0001'); const f = p.locator('#dlgForm');
  has(await T.dlgText(p), 'Có thể bán 3 món', 'khi sửa, món của lần bán này tính lại vào');
  await f.locator('[name=k]').fill('2'); await f.locator('[name=k]').dispatchEvent('input'); await f.locator('[name=gia]').fill('125'); await f.locator('[name=gia]').dispatchEvent('input');
  has(await T.text(p, '#salePreview'), 'Lời/lỗ chốt+50.000.000 đ (+25,0%)', 'xem trước'); await f.locator('.dlg-actions button.primary').click(); await p.waitForTimeout(80);
  eq((await T.D(p)).vang.ban[0].so_mon, 2, 'đã sửa số món');
  // Lô đã đóng + chi tiết
  await T.tab(p, 'lo'); await p.locator('#loStatus').selectOption('all'); await p.waitForTimeout(50); await T.click(p, 'lot-detail', 'V-2025-001'); await p.waitForTimeout(50);
  has(await T.app(p), 'Đã giữ 386 ngày', 'chi tiết lô');
  // Bán lấy lại vốn: lô nhẫn 8 món còn, vốn 96tr, giá 15tr → 7 món
  await T.click(p, 'sell', 'V-2026-001'); await p.locator('[data-fill=von]').click(); await p.waitForTimeout(50);
  eq(await p.locator('#dlgForm [name=k]').inputValue(), '7', 'Bán lấy lại vốn = 7 món'); await p.locator('#dlgForm button[value=cancel]').click();
  // Giữ khi lời đúng bằng mục tiêu 15,0%: mức nhắc mặc định lùi về 10 (B13)
  await T.tab(p, 'homnay'); await T.price(p, 'tsjc', '115', '116,5'); await p.waitForTimeout(50);
  has(await T.app(p), 'V-2025-001 SJC miếng 1 × 1 lượng 100.000.000 đ 115.000.000 đ +15.000.000 đ +15,0% 15,0%', 'lô +15,0% vào Nên chốt (A7)');
  await T.click(p, 'hold', 'V-2025-001'); eq(await p.locator('#dlgForm [name=kv]').inputValue(), '20', 'mục tiêu mới'); eq(await p.locator('#dlgForm [name=nt]').inputValue(), '10', 'mức nhắc mặc định 10 (B13)');
  await p.locator('#dlgForm button[value=cancel]').click();
  // Cần tiền 400: thiếu tiền được báo; sửa số món; xác nhận → sang Lịch sử, ghi chú Cần tiền
  await T.tab(p, 'cantien'); await p.locator('#cashForm [name=x]').fill('400'); await p.locator('#cashForm button[type=submit]').click(); await p.waitForTimeout(80);
  has(await T.app(p), 'cũng chỉ được 235.000.000 đ, còn thiếu 165.000.000 đ', 'báo thiếu');
  const inp = p.locator('input[data-plan="0"][data-row="0"]'); await inp.fill('1'); await inp.dispatchEvent('change'); await p.waitForTimeout(80);
  has((await T.app(p)).match(/A\. Chốt lời.*?Xác nhận bán/)?.[0], 'Tổng thu 130.000.000 đ', 'sửa số món tính lại');
  await p.locator('[data-act=plan-confirm]').first().click(); await p.waitForTimeout(100);
  eq(await p.evaluate(() => tab), 'lichsu', 'xác nhận xong sang Lịch sử'); eq((await T.D(p)).vang.ban.slice(2).map(b => [b.lo_id, b.so_mon, b.ghi_chu]), [['V-2026-001', 1, 'Cần tiền 400.000.000 đ'], ['V-2025-001', 1, 'Cần tiền 400.000.000 đ']], 'hai lần bán ghi đúng');
  // Thêm loại ở Tham số → có dòng giá
  await T.tab(p, 'thamso'); await p.locator('#typeForm [name=ten]').fill('Vàng 18K'); await p.locator('#typeForm button[type=submit]').click(); await p.waitForTimeout(80);
  await T.tab(p, 'homnay'); has(await T.app(p), 'Vàng 18K chỉ — — chưa có giá', 'loại mới có dòng giá');
  noErr(p, 'lỗi JS'); return fails;
};
