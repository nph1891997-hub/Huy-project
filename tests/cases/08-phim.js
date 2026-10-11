// Phím: Enter ở dòng giá có hỏi lại 15%, bấm Bán… khi dòng giá chưa lưu, Không đổi khi đang gõ dở, nhập bù rồi Về hôm nay, Enter/Esc trong hộp thoại, Ctrl+Z
const { makeDisk, machine, T, sample } = require('../harness');
exports.name = 'Phím Enter, Esc, Ctrl+Z; lưu khi rời dòng (A2, A3, A8)';
exports.run = async (browser, chk) => {
  const { eq, has, ok, noErr, fails } = chk;
  const disk = makeDisk(), d = sample({ days: 20, end: '2026-10-10', mv0: 150e6 });
  d.vang.loai.push({ id: 'tnhan', ten: 'Nhẫn 9999', don_vi_niem_yet: 'chi' });
  for (let i = 1; i < 12; i++) { const ngay = new Date(Date.parse('2026-10-11') - i * 864e5).toISOString().slice(0, 10); d.vang.gia.push({ ngay, loai_id: 'tnhan', mua_vao: 15e6, ban_ra: 15.3e6 }); }
  d.vang.lo.push({ id: 'V-2026-001', loai_id: 'tsjc', ngay_mua: '2026-06-20', so_mon: 2, trong_luong_mon_dem: 10000, tong_tien_mua: 260e6, ky_vong_pct: 15, sap_dat_pct: 2, nhac_tut_pct: null, ghi_chu: '' });
  disk.set('tai-san.json', JSON.stringify(d));
  const A = await machine(browser, disk); A.idb.set('file', 'tai-san.json');
  const p = await A.open({ time: '2026-10-11T09:00:00+07:00', perm: { query: 'granted' } });
  const mv = p.locator('#priceForm [name=mv_tsjc]'), gia = async (ngay, t = 'tsjc') => (await T.D(p)).vang.gia.find(x => x.ngay === ngay && x.loai_id === t)?.mua_vao;
  // Enter + lệch >15% + OK → lưu, xuống dòng dưới
  await mv.fill('175'); await mv.dispatchEvent('input'); await mv.press('Enter'); await p.waitForTimeout(100);
  eq(await p.evaluate(() => document.activeElement?.name), 'mv_tnhan', 'Enter xuống dòng dưới'); eq(await gia('2026-10-11'), 175000000, 'giá lưu sau confirm');
  // Enter + Hủy → ô về giá cũ, không lưu
  p.__policy = () => false; await mv.fill('120'); await mv.dispatchEvent('input'); await mv.press('Enter'); await p.waitForTimeout(100);
  eq(await mv.inputValue(), '175.000.000', 'Hủy thì ô về giá cũ'); eq(await gia('2026-10-11'), 175000000, 'không lưu'); p.__policy = () => true;
  // Gõ giá mới (chưa rời ô) rồi bấm Bán… → giá đã lưu và hộp Bán điền giá mới (A3)
  await mv.fill('176'); await mv.dispatchEvent('input'); await p.locator('[data-act=sell]').first().click(); await p.waitForTimeout(100);
  eq(await T.dlgOpen(p), true, 'hộp Bán mở'); eq(await p.locator('#dlgForm [name=gia]').inputValue(), '176.000.000', 'hộp Bán điền giá vừa gõ'); eq(await gia('2026-10-11'), 176000000, 'giá vừa gõ đã lưu');
  await p.keyboard.press('Escape'); await p.waitForTimeout(50); eq(await T.dlgOpen(p), false, 'Esc đóng hộp');
  // Gõ dở dòng Nhẫn rồi tick Không đổi của dòng đó → giá gõ được lưu, ô Không đổi ẩn
  const mv2 = p.locator('#priceForm [name=mv_tnhan]'); await mv2.fill('15,1'); await mv2.dispatchEvent('input');
  // click thay vì check(): sau khi lưu, dòng được vẽ lại và ô Không đổi ẩn đi, check() sẽ chờ trạng thái của ô cũ
  await p.locator('#priceForm [name=kd_tnhan]').click(); await p.waitForTimeout(150);
  eq(await gia('2026-10-11', 'tnhan'), 15100000, 'giá gõ dở được lưu khi tick Không đổi');
  // Nhập bù 05/10, gõ giá dở, bấm Về hôm nay → giá lưu cho 05/10 (A8)
  const ng = p.locator('#priceForm [name=ngay]'); await ng.fill('2026-10-05'); await ng.dispatchEvent('input'); await p.waitForTimeout(50);
  has(await T.text(p, '#priceForm tr[data-id=tsjc] .c-note'), 'giá ngày 05/10/2026', 'điền giá ngày 05/10');
  await mv.fill('151'); await mv.dispatchEvent('input'); await p.locator('[data-act=price-today]').click(); await p.waitForTimeout(100);
  eq(await gia('2026-10-05'), 151000000, 'giá lưu cho 05/10'); eq(await gia('2026-10-11'), 176000000, 'hôm nay giữ nguyên'); eq(await ng.inputValue(), '2026-10-11', 'về hôm nay');
  // Enter trong hộp Thêm lô ở ô Số món = Lưu (đơn giá tự điền theo giá bán ra) (A2); Ctrl+Z hoàn tác
  await T.click(p, 'lot-add'); await p.locator('#dlgForm [name=so_mon]').press('Enter'); await p.waitForTimeout(80);
  eq(await T.dlgOpen(p), false, 'Enter = Lưu'); eq((await T.D(p)).vang.lo.length, 2, 'lô đã thêm');
  await p.keyboard.press('Control+z'); await p.waitForTimeout(80); eq((await T.D(p)).vang.lo.length, 1, 'Ctrl+Z hoàn tác');
  noErr(p, 'lỗi JS'); return fails;
};
