// Nhập tiền ở mọi ô (parseM), Enter ở bảng giá, bộ nhớ trình duyệt đầy khi chưa kết nối file, chế độ xem (điện thoại)
const { makeDisk, machine, T, sample } = require('../harness');
exports.name = 'Nhập tiền, bộ nhớ đầy, chế độ xem (A14, A15, A17)';
exports.run = async (browser, chk) => {
  const { eq, has, ok, noErr, fails } = chk;
  const disk = makeDisk(), d = sample({ days: 20, end: '2026-10-11' });
  d.vang.loai.push({ id: 'tnhan', ten: 'Nhẫn 9999', don_vi_niem_yet: 'chi' });
  for (let i = 0; i < 12; i++) { const ngay = new Date(Date.parse('2026-10-11') - i * 864e5).toISOString().slice(0, 10); d.vang.gia.push({ ngay, loai_id: 'tnhan', mua_vao: 15e6 + i * 1e4, ban_ra: 15.3e6 + i * 1e4 }); }
  d.vang.lo.push({ id: 'V-2026-001', loai_id: 'tsjc', ngay_mua: '2026-09-20', so_mon: 2, trong_luong_mon_dem: 10000, tong_tien_mua: 300e6, ky_vong_pct: 15, sap_dat_pct: 2, nhac_tut_pct: null, ghi_chu: '' });
  disk.set('tai-san.json', JSON.stringify(d));
  const A = await machine(browser, disk); A.idb.set('file', 'tai-san.json');
  const p = await A.open({ time: '2026-10-11T09:00:00+07:00', perm: { query: 'granted' } });
  // parseM
  const cases = { '148.500': '148.500.000', '148,5': '148.500.000', '148500': '148.500.000', '148.5': '148.500.000', '500k': '500.000đ', '118,5tr': '118.500.000', '160.000.000': '160.000.000', '500.000đ': '500.000đ', '0,5': '500.000đ', '1.000': '1.000.000', '15.200': '15.200.000', '15,2': '15.200.000' };
  eq(await p.evaluate(cs => Object.fromEntries(Object.keys(cs).map(c => [c, fmtIn(parseM(c))])), cases), cases, 'parseM/fmtIn (A14)');
  await T.tab(p, 'thamso'); const hm = p.locator('[data-set-money=vang_han_muc_von]'); await hm.fill('500'); await hm.dispatchEvent('change'); await p.waitForTimeout(80);
  eq((await T.D(p)).tham_so.vang_han_muc_von, 500000000, 'hạn mức "500" = 500tr');
  await T.tab(p, 'cantien'); await p.locator('#cashForm [name=x]').fill('50.000'); await p.locator('#cashForm button[type=submit]').click(); await p.waitForTimeout(80);
  eq((await T.ui(p)).cash, 50000000, 'cần tiền "50.000" = 50tr');
  // Enter ở bảng giá: lưu dòng, xuống dòng dưới, giá bán ra tự cộng chênh lệch
  await T.tab(p, 'homnay'); const mv = p.locator('#priceForm [name=mv_tsjc]'); await mv.fill('159'); await mv.dispatchEvent('input'); await mv.press('Enter'); await p.waitForTimeout(80);
  eq(await p.evaluate(() => document.activeElement?.name), 'mv_tnhan', 'Enter xuống dòng dưới');
  eq((await T.D(p)).vang.gia.find(x => x.ngay === '2026-10-11' && x.loai_id === 'tsjc').mua_vao, 159000000, 'Enter lưu giá');
  eq(await p.locator('#priceForm [name=br_tsjc]').inputValue(), '160.900.000', 'giá bán ra tự cộng chênh lệch lần trước');
  // Bộ nhớ trình duyệt đầy, chưa kết nối file: lần 2 không bị báo nhầm "sửa ở nơi khác"
  const B = await machine(browser, disk, { name: 'B' }); const pb = await B.open({ time: '2026-10-11T09:00:00+07:00' });
  await T.addLot(pb, { tenMoi: 'SJC', dvMoi: 'luong', donGia: '160' });
  has(await T.app(pb), 'Dữ liệu đang lưu tạm trong trình duyệt', 'nhắc tạo file');
  await pb.evaluate(() => { const o = Storage.prototype.setItem; Storage.prototype.setItem = function (k, v) { if (k === 'tai-san-v1') throw new DOMException('quota', 'QuotaExceededError'); return o.call(this, k, v); }; });
  const t1 = (await T.D(pb)).vang.loai[0].id;
  await T.price(pb, t1, '161', '163'); await pb.waitForTimeout(100);
  eq(await T.status(pb), 'Chưa lưu được: bộ nhớ trình duyệt đầy', 'báo đầy'); has(pb.__log.dialogs.at(-1)?.msg, 'Không lưu được vào bộ nhớ trình duyệt', 'alert một lần');
  await T.price(pb, t1, '162', '164'); await pb.waitForTimeout(100);
  eq(await T.notice(pb), '', 'lần 2 không báo nhầm sửa ở nơi khác (A17)'); eq((await T.D(pb)).vang.gia.at(-1)?.mua_vao, 162000000, 'giá vừa gõ còn nguyên');
  // Chế độ xem: mở file, gõ thiếu số → hỏi, Hủy → về giá cũ; gõ đúng → tính lại, không có nút sửa
  const V = await machine(browser, disk, { name: 'V', fsa: false }); const pv = await V.open({ time: '2026-10-11T09:00:00+07:00' });
  eq(await T.status(pv), 'Chế độ xem', 'trạng thái chế độ xem');
  const [fc] = await Promise.all([pv.waitForEvent('filechooser'), T.click(pv, 'view-open')]);
  await fc.setFiles({ name: 'tai-san.json', mimeType: 'application/json', buffer: Buffer.from(disk.get('tai-san.json').text) }); await pv.waitForTimeout(150);
  pv.__policy = () => false; await T.price(pv, 'tsjc', '16', '16,2'); await pv.waitForTimeout(80);
  has(pv.__log.dialogs.at(-1)?.msg, '159.000.000 đ → 16.000.000 đ', 'chế độ xem vẫn hỏi lại (A15)'); eq(await pv.locator('#priceForm [name=mv_tsjc]').inputValue(), '159.000.000', 'Hủy thì về giá cũ');
  pv.__policy = () => true; await T.price(pv, 'tsjc', '175', '177'); await pv.waitForTimeout(80);
  has(await T.app(pv), 'Đang xem với giá vừa gõ', 'xem với giá vừa gõ'); has(await T.app(pv), 'Nên chốt', 'tính lại nhóm');
  eq(await pv.locator('[data-act=sell]').first().isVisible().catch(() => false), false, 'không có nút Bán ở chế độ xem');
  ok([p, pb, pv].every(x => !x.__log.errors.length), 'không lỗi JS');
  return fails;
};
