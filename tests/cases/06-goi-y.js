// Tiệm hạ giá mua vào, nhắc mua lại tự tắt, ô mức nhắc, Cần tiền ưu tiên Nên chốt, mốc mua lại thắng Cân nhắc, hạn mức, Lịch sử giá lọc + xóa, tham số lạ
const { makeDisk, machine, T, sample } = require('../harness');
exports.name = 'Gợi ý: hạ giá mua vào, mua lại, hạn mức, Cần tiền, Lịch sử giá, tham số (B8–B12, A21, C4, C9)';
exports.run = async (browser, chk) => {
  const { eq, has, not, ok, noErr, fails } = chk;
  const disk = makeDisk(), d = sample({ days: 40, end: '2026-10-10', mv0: 170e6, spread: 0.012 });
  d.vang.lo.push({ id: 'V-2026-001', loai_id: 'tsjc', ngay_mua: '2026-07-01', so_mon: 2, trong_luong_mon_dem: 10000, tong_tien_mua: 260e6, ky_vong_pct: 35, sap_dat_pct: 2, nhac_tut_pct: 25, ghi_chu: '' });
  d.vang.lo.push({ id: 'V-2026-002', loai_id: 'tsjc', ngay_mua: '2026-07-05', so_mon: 2, trong_luong_mon_dem: 10000, tong_tien_mua: 264e6, ky_vong_pct: 35, sap_dat_pct: 2, nhac_tut_pct: null, ghi_chu: '' });
  disk.set('tai-san.json', JSON.stringify(d));
  const A = await machine(browser, disk); A.idb.set('file', 'tai-san.json');
  const p = await A.open({ time: '2026-10-11T09:00:00+07:00', perm: { query: 'granted' } });
  const grp = async () => (await T.app(p)).replace(/^.*?Tổng lời [^ ]+ đ /, '');
  // (1) tiệm hạ giá mua vào 158/170: lô tụt vào Nên chốt, ghi rõ thiệt; hộp Bán, Cần tiền cũng ghi
  await T.price(p, 'tsjc', '158', '170'); let g = await grp();
  has(g, 'lời tụt từ +31,0% (15/09) về +21,5%, dưới mức nhắc 25,0%', 'lời tụt'); has(g, 'tiệm đang hạ giá mua vào, chênh lệch 7,6% (thường 1,2%): bán hôm nay được ít hơn ngày thường khoảng 20,0tr', 'ghi thiệt (B8)');
  has(g, 'nếu chênh lệch như mọi khi, lời là +29,2%, chưa dưới mức nhắc; không gấp thì đợi', 'lời nếu chênh lệch bình thường');
  await T.click(p, 'sell', 'V-2026-001'); has(await T.dlgText(p), 'bán số món này được ít hơn ngày thường khoảng 10,0tr', 'hộp Bán ghi thiệt'); await p.locator('#dlgForm button[value=cancel]').click();
  await T.tab(p, 'cantien'); await p.locator('#cashForm [name=x]').fill('200'); await p.locator('#cashForm button[type=submit]').click(); await p.waitForTimeout(80);
  const ct = await T.app(p); has(ct, 'Tiệm đang hạ giá mua vào: SJC miếng, chênh lệch 7,6% (thường 1,2%)', 'Cần tiền cảnh báo'); has(ct, 'Thiệt do tiệm hạ giá mua vào khoảng 20,0tr', 'thiệt ước lượng ghi gọn (C9)');
  await T.tab(p, 'homnay'); has(await T.text(p, '#buy_tsjc'), 'Đợi, chênh lệch cao', 'Mua thêm? đợi');
  // (2) tiệm nâng giá bán ra 170/182: không ghi "hạ giá mua vào"
  await T.price(p, 'tsjc', '170', '182'); not(await grp(), 'hạ giá mua vào', 'nâng bán ra thì không ghi thiệt');
  // (3) lời tụt thật 160/162: Cần tiền A lấy lô Nên chốt trước (B10)
  await T.price(p, 'tsjc', '160', '162'); has(await grp(), 'Nên chốt — đạt mục tiêu hoặc lời tụt dưới mức nhắc (1)', 'lô 001 Nên chốt');
  await T.tab(p, 'cantien'); await p.locator('#cashForm [name=x]').fill('150'); await p.locator('#cashForm button[type=submit]').click(); await p.waitForTimeout(80);
  has((await T.app(p)).match(/A\. Chốt lời tốt nhất.*?Xác nhận bán/)?.[0], 'V-2026-001', 'phương án A bán lô Nên chốt (B10)');
  // (4) bán 1 món đặt mua lại 150; giá 148/150 chạm mốc: cột Mua lại thắng Cân nhắc, ghi kèm lô đang tụt (B12)
  await T.tab(p, 'homnay'); await T.sell(p, 'V-2026-001', { k: 1, gia: '160', muaLai: '150' });
  await T.price(p, 'tsjc', '148', '150'); const cell = await T.text(p, '#buy_tsjc');
  has(cell, 'Mua lại', 'chạm mốc mua lại → Mua lại (B12)'); has(cell, 'V-2026-001 đang tụt dưới mức nhắc cũng ở Nên chốt: muốn mua lại thì Giữ tiếp lô đó trước', 'ghi kèm lô Nên chốt');
  ok(await p.locator('#buy_tsjc [data-act=rebuy]').count() === 1, 'có nút Mua lại… trong cột');
  // (5) form Thêm lô: ô mức nhắc ẩn khi lô lỗ, hiện khi đơn giá thấp (lời) (B11); lô cũ không tắt nhắc mua lại
  await T.click(p, 'lot-add'); const f = p.locator('#dlgForm');
  eq(await f.locator('[name=don_gia]').inputValue(), '150.000.000', 'đơn giá tự điền theo giá bán ra'); ok(await f.locator('#ntField').evaluate(e => e.classList.contains('hidden')), 'ô mức nhắc ẩn (lô lỗ)');
  await f.locator('[name=don_gia]').fill('130'); await f.locator('[name=don_gia]').dispatchEvent('input'); ok(!(await f.locator('#ntField').evaluate(e => e.classList.contains('hidden'))), 'ô mức nhắc hiện (lô lời)');
  await f.locator('details summary').click(); await f.locator('[name=nt]').fill('10'); await f.locator('[name=ngay]').fill('2026-06-01'); await f.locator('.dlg-actions button.primary').click(); await p.waitForTimeout(100);
  eq((await T.D(p)).vang.lo.at(-1).nhac_tut_pct, 10, 'lô cũ lưu mức nhắc'); eq((await T.D(p)).vang.ban.at(-1).gia_mua_lai, 150000000, 'lô mua trước ngày bán không tắt nhắc');
  // (6) thêm lô hôm nay cùng loại → tắt nhắc, Giữ lại nhắc; hoàn tác xóa dòng báo (B9, C9)
  await T.addLot(p, { donGia: '150' });
  has(await T.notice(p), 'Đã tắt nhắc mua lại B-0001 (150tr) vì vừa mua V-2026-004 cùng loại', 'báo tắt nhắc (B9)'); eq((await T.D(p)).vang.ban.at(-1).gia_mua_lai, null, 'nhắc đã tắt');
  await T.click(p, 'rebuy-keep'); await p.waitForTimeout(80); eq((await T.D(p)).vang.ban.at(-1).gia_mua_lai, 150000000, 'Giữ lại nhắc');
  await T.click(p, 'undo'); await p.waitForTimeout(80); await T.click(p, 'undo'); await p.waitForTimeout(80);
  eq((await T.D(p)).vang.lo.length, 3, 'hoàn tác 2 lần'); eq(await T.notice(p), '', 'hoàn tác xóa dòng báo (C9)');
  await T.addLot(p, { donGia: '150' }); await T.click(p, 'undo'); await p.waitForTimeout(80); eq(await T.notice(p), '', 'hoàn tác thêm lô cũng xóa dòng báo');
  // (7) Mua lại… từ cột → form điền sẵn; lưu → tắt nhắc, cột về Chưa tới (mốc rải)
  await p.locator('#buy_tsjc [data-act=rebuy]').click(); has(await T.dlgText(p), 'Mua lại (từ lần bán B-0001)', 'form Mua lại');
  await p.locator('#dlgForm .dlg-actions button.primary').click(); await p.waitForTimeout(100);
  eq((await T.D(p)).vang.ban.at(-1).gia_mua_lai, null, 'mua lại xong tắt nhắc'); has(await T.text(p, '#buy_tsjc'), 'Chưa tới', 'cột về Chưa tới');
  // (8) hạn mức 700tr khi giữ ~674tr → Đủ hạn mức
  await T.tab(p, 'thamso'); const hm = p.locator('[data-set-money=vang_han_muc_von]'); await hm.fill('700'); await hm.dispatchEvent('change'); await p.waitForTimeout(80);
  await T.tab(p, 'homnay'); has(await T.text(p, '#buy_tsjc'), 'Đủ hạn mức', 'đủ hạn mức'); has(await T.app(p), '/ hạn mức 700tr · còn 26tr', 'dòng tổng ghi hạn mức');
  // (9) tham số lạ bị từ chối (A21)
  await T.tab(p, 'thamso'); const kvd = p.locator('[data-set=vang_ky_vong_mac_dinh]'); await kvd.fill('0'); await kvd.dispatchEvent('change'); await p.waitForTimeout(50);
  has(p.__log.dialogs.at(-1)?.msg, '% kỳ vọng mặc định phải lớn hơn 0', 'kỳ vọng 0 bị từ chối'); eq((await T.D(p)).tham_so.vang_ky_vong_mac_dinh, 15, 'giữ giá trị cũ');
  const sdd = p.locator('[data-set=vang_sap_dat_mac_dinh]'); await sdd.fill('-3'); await sdd.dispatchEvent('change'); await p.waitForTimeout(50);
  eq((await T.D(p)).tham_so.vang_sap_dat_mac_dinh, 2, 'sắp đạt âm bị từ chối');
  // (10) Lịch sử giá: lọc năm, xóa đúng dòng (C4)
  await T.tab(p, 'lichsu'); await p.locator('#lsPYear').selectOption('2026'); await p.waitForTimeout(80);
  const rows = p.locator('#app section:last-of-type table tr'); eq(await rows.count() - 1, (await T.D(p)).vang.gia.length, 'lọc năm hiện đủ dòng');
  const btn = rows.nth(1).locator('[data-act=price-del]'); const idx = +(await btn.getAttribute('data-i')); const target = (await T.D(p)).vang.gia[idx];
  eq(target.ngay, '2026-10-11', 'dòng đầu là ngày mới nhất'); await btn.click(); await p.waitForTimeout(80);
  ok(!(await T.D(p)).vang.gia.some(x => x.ngay === target.ngay && x.loai_id === target.loai_id), 'xóa đúng dòng');
  noErr(p, 'lỗi JS'); return fails;
};
