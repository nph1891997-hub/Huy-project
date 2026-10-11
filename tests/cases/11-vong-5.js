// Review lần 4: gõ lại đúng giá cũ, lô mua hôm qua nhập sáng nay, gõ tiền bằng chữ (tỷ, triệu, nghìn), hộp Giữ khi giá cũ, hàng đợi lưu gặp lỗi bất ngờ
const { makeDisk, machine, T, sample } = require('../harness');
exports.name = 'Vòng 5: gõ lại giá cũ, lô mua hôm qua, tiền bằng chữ, hộp Giữ giá cũ, hàng đợi lưu (A24–A26, B15, C10)';
exports.run = async (browser, chk) => {
  const { eq, has, not, ok, noErr } = chk;
  const disk = makeDisk(), d = sample({ days: 20, end: '2026-10-10', mv0: 158e6 });
  d.vang.loai.push({ id: 'tnhan', ten: 'Nhẫn 9999', don_vi_niem_yet: 'chi' });
  for (let i = 1; i < 15; i++) { const ngay = new Date(Date.parse('2026-10-11') - i * 864e5).toISOString().slice(0, 10); d.vang.gia.push({ ngay, loai_id: 'tnhan', mua_vao: 15e6, ban_ra: 15.3e6 }); }
  d.vang.lo.push({ id: 'V-2026-001', loai_id: 'tsjc', ngay_mua: '2026-03-20', so_mon: 2, trong_luong_mon_dem: 10000, tong_tien_mua: 270e6, ky_vong_pct: 15, sap_dat_pct: 2, nhac_tut_pct: null, ghi_chu: '' });
  d.vang.so_thu_tu = { lo: { 2026: 1 }, ban: 0 };
  disk.set('tai-san.json', JSON.stringify(d));
  const A = await machine(browser, disk); A.idb.set('file', 'tai-san.json');
  const p = await A.open({ time: '2026-10-11T09:00:00+07:00', perm: { query: 'granted' } });
  const today = async t => (await T.D(p)).vang.gia.find(x => x.ngay === '2026-10-11' && x.loai_id === t);
  // (1) Hộp Giữ khi giá chưa phải của hôm nay: ghi ngày của giá (C10)
  await T.click(p, 'hold', 'V-2026-001'); has(await T.dlgText(p), 'Giá tiệm mua vào ngày 10/10/2026', 'hộp Giữ ghi ngày giá cũ'); await p.keyboard.press('Escape');
  // (2) Gõ lại đúng giá hôm qua (tiệm giữ giá) rồi Enter: ghi nhận như Không đổi; cột Mua thêm? tính ngay khi gõ (B15)
  const mv = p.locator('#priceForm [name=mv_tsjc]'); await mv.fill('158'); await mv.dispatchEvent('input');
  not(await T.text(p, '#buy_tsjc'), 'nhập giá hôm nay', 'đang gõ lại giá cũ: Mua thêm? đã tính');
  await mv.press('Enter'); await T.settle(p);
  eq((await today('tsjc'))?.mua_vao, 158000000, 'gõ lại đúng giá cũ + Enter: lưu cho hôm nay'); has(await T.text(p, '#btnUndo'), 'giá SJC miếng không đổi ngày 11/10', 'nhãn hoàn tác');
  not(await T.text(p, '#priceForm tr[data-id=tsjc] .c-note'), 'chưa cập nhật hôm nay', 'dòng hết vàng');
  // Chỉ lướt qua dòng (Enter, không gõ) thì không lưu
  eq(await p.evaluate(() => document.activeElement?.name), 'mv_tnhan', 'Enter xuống dòng Nhẫn'); await p.keyboard.press('Enter'); await T.settle(p);
  eq(await today('tnhan'), undefined, 'lướt qua dòng không gõ: không lưu');
  // Gõ rồi Hủy hỏi lại (lệch 15%) thì dòng về giá cũ và không còn tính là đã gõ
  p.__policy = () => false; await T.price(p, 'tnhan', '152'); p.__policy = () => true;
  await p.locator('#priceForm [name=mv_tnhan]').focus(); await p.locator('body').click({ position: { x: 5, y: 5 } }); await T.settle(p);
  eq(await today('tnhan'), undefined, 'Hủy rồi rời dòng: vẫn chưa lưu');
  // (3) Lô mua hôm qua, sáng nay mới nhập (giá hôm nay đã có): đơn giá điền giá ngày mua, gõ thiếu số thì hỏi (A24)
  await T.price(p, 'tsjc', '160', '162');
  await T.click(p, 'lot-add'); const f = p.locator('#dlgForm');
  await f.locator('[name=ngay]').fill('2026-10-10'); await f.locator('[name=ngay]').dispatchEvent('input');
  eq(await f.locator('[name=don_gia]').inputValue(), '159.900.000', 'đơn giá điền giá tiệm bán ra ngày mua');
  p.__policy = () => false; await f.locator('[name=don_gia]').fill('16'); await f.locator('[name=don_gia]').dispatchEvent('input'); await f.locator('.dlg-actions button.primary').click(); await p.waitForTimeout(80);
  has(p.__log.dialogs.at(-1)?.msg, 'so với giá tiệm bán ra ngày 10/10/2026', 'gõ thiếu số bị hỏi'); eq((await T.D(p)).vang.lo.length, 1, 'Hủy thì không lưu'); p.__policy = () => true;
  await f.locator('[name=don_gia]').fill('130'); await f.locator('[name=don_gia]').dispatchEvent('input'); await f.locator('.dlg-actions button.primary').click(); await p.waitForTimeout(80);
  eq((await T.D(p)).vang.lo.at(-1).tong_tien_mua, 130e6, 'xác nhận giá lệch thì lưu');
  // Sửa ghi chú lô đó (giá không đổi) thì không hỏi lại lệch 15%
  const n0 = p.__log.dialogs.length; await T.tab(p, 'lo'); await T.click(p, 'lot-edit', 'V-2026-002');
  await f.locator('details summary').click(); await f.locator('[name=ghi_chu]').fill('tiệm B'); await f.locator('.dlg-actions button.primary').click(); await p.waitForTimeout(80);
  eq(p.__log.dialogs.length, n0, 'sửa ghi chú không hỏi'); eq((await T.D(p)).vang.lo.at(-1).ghi_chu, 'tiệm B', 'đã lưu ghi chú');
  // Lô mua từ lâu, không có giá quanh ngày đó: không điền, không hỏi
  await T.click(p, 'lot-add'); await f.locator('[name=ngay]').fill('2025-01-10'); await f.locator('[name=ngay]').dispatchEvent('input');
  eq(await f.locator('[name=don_gia]').inputValue(), '', 'lô cũ không có giá quanh ngày mua: để trống'); await p.keyboard.press('Escape');
  // (4) Tiền bằng chữ (A25)
  const cs = { '2 tỷ': '2.000.000.000', '1,5 tỷ': '1.500.000.000', '1tỷ2': '1.200.000.000', '2tr5': '2.500.000', '15 triệu': '15.000.000', '150 nghìn': '150.000đ', '500k': '500.000đ', '148.500': '148.500.000', '500.000 đ': '500.000đ', '1,5tr2': '' };
  eq(await p.evaluate(cs => Object.fromEntries(Object.keys(cs).map(c => [c, fmtIn(parseM(c))])), cs), cs, 'parseM hiểu tỷ, triệu, nghìn');
  await T.tab(p, 'thamso'); const hm = p.locator('[data-set-money=vang_han_muc_von]'); await hm.fill('2 tỷ'); await hm.dispatchEvent('change'); await p.waitForTimeout(60);
  eq((await T.D(p)).tham_so.vang_han_muc_von, 2e9, 'hạn mức "2 tỷ"');
  await T.tab(p, 'cantien'); await p.locator('#cashForm [name=x]').fill('1,5 tỷ'); await p.locator('#cashForm button[type=submit]').click(); await p.waitForTimeout(60);
  eq((await T.ui(p)).cash, 1.5e9, 'cần tiền "1,5 tỷ"');
  // (5) Hàng đợi lưu gặp lỗi bất ngờ một lần (vẽ lại sau khi nạp bản từ máy khác): báo đỏ, lần lưu sau vẫn vào file (A26)
  await T.tab(p, 'homnay');
  const F = disk.json('tai-san.json'); F.vang.ban = []; F.cap_nhat = '2026-10-11T03:00:00.000Z'; disk.set('tai-san.json', JSON.stringify(F));
  await p.evaluate(() => { const r0 = render; let once = true; window.render = function () { if (once) { once = false; throw new Error('lỗi vẽ bất ngờ'); } return r0(); }; });
  await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await p.waitForTimeout(120);
  has(await T.status(p), 'Lỗi khi lưu', 'báo đỏ khi gặp lỗi bất ngờ');
  await T.price(p, 'tsjc', '161', '163'); await p.waitForTimeout(120);
  eq(disk.json('tai-san.json').vang.gia.find(x => x.ngay === '2026-10-11' && x.loai_id === 'tsjc').mua_vao, 161000000, 'lần lưu sau vẫn vào file');
  eq(await T.status(p), 'Đã lưu vào tai-san.json', 'trạng thái trở lại bình thường');
  noErr(p, 'lỗi JS');
};
