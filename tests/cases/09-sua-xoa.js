// Đối chiếu khi mở file có sẵn, sửa/xóa loại vàng, kiểm tra form Sửa lô, Bán một nửa, xóa lô có lần bán, chế độ xem tải bản cũ, biểu đồ
const { makeDisk, machine, T, sample } = require('../harness');
exports.name = 'Đối chiếu khi mở file, sửa/xóa loại và lô, Bán một nửa, bản cũ ở chế độ xem, biểu đồ';
exports.run = async (browser, chk) => {
  const { eq, has, not, ok, noErr } = chk;
  const disk = makeDisk(), d = sample({ days: 20, end: '2026-10-11', mv0: 160e6 });
  d.vang.loai.push({ id: 'tnhan', ten: 'Nhẫn 9999', don_vi_niem_yet: 'chi' }, { id: 't18k', ten: 'Vàng 18K', don_vi_niem_yet: 'chi' });
  for (let i = 0; i < 12; i++) { const ngay = new Date(Date.parse('2026-10-11') - i * 864e5).toISOString().slice(0, 10); d.vang.gia.push({ ngay, loai_id: 't18k', mua_vao: 9e6, ban_ra: 9.3e6 }); }
  d.vang.lo.push({ id: 'V-2026-001', loai_id: 'tsjc', ngay_mua: '2026-06-20', so_mon: 5, trong_luong_mon_dem: 10000, tong_tien_mua: 650e6, ky_vong_pct: 15, sap_dat_pct: 2, nhac_tut_pct: null, ghi_chu: '' });
  d.vang.ban.push({ id: 'B-0001', lo_id: 'V-2026-001', ngay: '2026-08-01', so_mon: 2, gia_ban: 140e6, gia_mua_lai: null, ghi_chu: '' });
  d.vang.so_thu_tu = { lo: { 2026: 1 }, ban: 1 };
  disk.set('tai-san.json', JSON.stringify(d));
  const A = await machine(browser, disk); A.idb.set('file', 'tai-san.json');
  let p = await A.open({ time: '2026-10-11T09:00:00+07:00', perm: { query: 'granted' } });
  const gia = () => (disk.json('tai-san.json').vang.gia.find(x => x.ngay === '2026-10-11' && x.loai_id === 'tsjc') || {}).mua_vao;
  // (1) Đối chiếu khi mở: lần trước ghi file lỗi (trình duyệt có thay đổi, file không đổi) → mở lại thì ghi bản trình duyệt vào file
  await p.evaluate(() => { window.__perm.byName['tai-san.json'] = { query: 'denied', request: 'denied' }; });
  await T.price(p, 'tsjc', '161', '163'); await p.waitForTimeout(100);
  has(await T.status(p), 'Lỗi ghi file', 'ghi file lỗi');
  ok(gia() !== 161000000, 'file chưa có giá mới'); await p.close();
  p = await A.open({ time: '2026-10-11T09:05:00+07:00', perm: { query: 'granted' } });
  eq(gia(), 161000000, 'mở lại: bản trình duyệt được ghi vào file'); eq((await T.dl(p)).length, 0, 'không tải về gì');
  // (2) Cả trình duyệt lẫn file cùng đổi → dùng file, tải bản trình duyệt về
  await p.evaluate(() => { window.__perm.byName['tai-san.json'] = { query: 'denied', request: 'denied' }; });
  await T.price(p, 'tsjc', '162', '164'); await p.waitForTimeout(100); await p.close();
  const F = disk.json('tai-san.json'); F.vang.gia.find(x => x.ngay === '2026-10-11' && x.loai_id === 'tsjc').mua_vao = 159e6; F.cap_nhat = '2026-10-11T02:10:00.000Z'; disk.set('tai-san.json', JSON.stringify(F));
  p = await A.open({ time: '2026-10-11T09:15:00+07:00', perm: { query: 'granted' } });
  eq((await T.D(p)).vang.gia.find(x => x.ngay === '2026-10-11' && x.loai_id === 'tsjc').mua_vao, 159000000, 'cả hai cùng đổi: dùng file');
  has(await T.notice(p), 'Bản trong trình duyệt khác với file', 'báo một dòng'); eq((await T.dl(p)).map(x => x.name.slice(0, 16)), ['ban-trinh-duyet-'], 'tải bản trình duyệt về');
  // (3) Loại vàng: đổi tên; đổi đơn vị bị khóa khi đã có giá; xóa loại có lô bị khóa; xóa loại chỉ có giá
  await T.tab(p, 'thamso');
  ok(await p.locator('[data-type-unit=t18k]').isDisabled(), 'loại đã có giá không đổi đơn vị'); ok(await p.locator('[data-act=type-del][data-id=tsjc]').isDisabled(), 'loại có lô không xóa được');
  ok(!(await p.locator('[data-type-unit=tnhan]').isDisabled()), 'loại chưa dùng đổi được đơn vị');
  const nm = p.locator('[data-type-name=tnhan]'); await nm.fill('Nhẫn tròn'); await nm.dispatchEvent('change'); await p.waitForTimeout(50);
  eq((await T.D(p)).vang.loai.find(t => t.id === 'tnhan').ten, 'Nhẫn tròn', 'đổi tên loại');
  await T.click(p, 'type-del', 't18k'); await p.waitForTimeout(80);
  ok(!(await T.D(p)).vang.loai.some(t => t.id === 't18k') && !(await T.D(p)).vang.gia.some(x => x.loai_id === 't18k'), 'xóa loại cùng lịch sử giá');
  // (4) Sửa lô: số món < đã bán; ngày mua sau ngày bán; đổi sang loại khác đơn vị khi đã bán
  await T.tab(p, 'lo'); await T.click(p, 'lot-edit', 'V-2026-001'); const f = p.locator('#dlgForm'), save = () => f.locator('.dlg-actions button.primary').click();
  await f.locator('[name=so_mon]').fill('0'); await f.locator('[name=so_mon]').dispatchEvent('input'); await save(); has(p.__log.dialogs.at(-1)?.msg, 'Số món phải từ 1', 'số món 0');
  await f.locator('[name=so_mon]').fill('1'); await f.locator('[name=so_mon]').dispatchEvent('input'); await f.locator('[name=tong]').fill('130'); await f.locator('[name=tong]').dispatchEvent('input'); await save();
  has(p.__log.dialogs.at(-1)?.msg, 'Lô đã bán 2 món, số món không được nhỏ hơn', 'số món < đã bán');
  await f.locator('[name=so_mon]').fill('5'); await f.locator('[name=so_mon]').dispatchEvent('input'); await f.locator('[name=tong]').fill('650'); await f.locator('[name=tong]').dispatchEvent('input');
  await f.locator('[name=ngay]').fill('2026-09-01'); await save(); has(p.__log.dialogs.at(-1)?.msg, 'Ngày mua không được sau ngày của các lần bán', 'ngày mua sau ngày bán');
  await f.locator('[name=ngay]').fill('2026-06-20'); await f.locator('[name=loai]').selectOption('tnhan'); await f.locator('[name=loai]').dispatchEvent('input'); await save();
  has(p.__log.dialogs.at(-1)?.msg, 'không đổi sang loại vàng có đơn vị niêm yết khác', 'đổi loại khác đơn vị khi đã bán');
  eq(await T.dlgOpen(p), true, 'hộp còn mở sau mọi lỗi'); await f.locator('button[value=cancel]').click();
  // (5) Bán một nửa: còn 3 món (lẻ) → làm tròn lên 2; Bán hết = 3
  await T.click(p, 'sell', 'V-2026-001'); await p.locator('[data-fill=nua]').click(); eq(await p.locator('#dlgForm [name=k]').inputValue(), '2', 'Bán một nửa 3 món = 2');
  await p.locator('[data-fill=het]').click(); eq(await p.locator('#dlgForm [name=k]').inputValue(), '3', 'Bán hết = 3'); await p.locator('#dlgForm button[value=cancel]').click();
  // (6) Xóa lô có lần bán: hỏi rõ, xóa cả lần bán, hoàn tác lấy lại
  await T.click(p, 'lot-del', 'V-2026-001'); await p.waitForTimeout(80);
  has(p.__log.dialogs.at(-1)?.msg, 'cùng 1 lần bán của nó', 'hỏi rõ số lần bán'); eq([(await T.D(p)).vang.lo.length, (await T.D(p)).vang.ban.length], [0, 0], 'xóa lô và lần bán');
  await T.click(p, 'undo'); await p.waitForTimeout(80); eq([(await T.D(p)).vang.lo.length, (await T.D(p)).vang.ban.length], [1, 1], 'hoàn tác');
  // (7) Biểu đồ: rê chuột hiện giá ngày
  await T.tab(p, 'homnay'); await p.locator('#buyWhy summary').click(); await p.waitForTimeout(80);
  const svg = p.locator('svg.chart[data-chart=tsjc]'), bb = await svg.boundingBox(); await p.mouse.move(bb.x + bb.width - 12, bb.y + bb.height / 2); await p.waitForTimeout(50);
  has(await T.text(p, '#tip_tsjc'), '11/10/2026: tiệm bán ra', 'tooltip biểu đồ');
  noErr(p, 'lỗi JS');
  // (8) Chế độ xem: trình duyệt còn dữ liệu bản cũ → nút tải về
  const V = await machine(browser, disk, { name: 'V', fsa: false });
  await V.ctx.addInitScript(() => { try { if (!localStorage.getItem('tai-san-v1')) localStorage.setItem('tai-san-v1', '{"vang":{"lo":[1]}}'); } catch { } });
  const pv = await V.open({ time: '2026-10-11T09:00:00+07:00' });
  has(await T.app(pv), 'Tải bản dữ liệu cũ trong trình duyệt', 'nút tải bản cũ'); await T.click(pv, 'view-old');
  eq((await T.dl(pv)).map(x => [x.name.slice(0, 29), x.text]), [['du-lieu-cu-trong-trinh-duyet-', '{"vang":{"lo":[1]}}']], 'tải bản cũ');
  noErr(pv, 'lỗi JS chế độ xem');
};
