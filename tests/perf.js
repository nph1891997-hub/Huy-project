// Đo thời gian các thao tác trên dữ liệu 20 năm (3 loại, ~21.900 dòng giá, 60 lô, 40 lần bán). Chạy tay: npm run perf
// Số đo phụ thuộc máy nên không nằm trong npm test; dùng để so trước/sau khi sửa phần tính toán hay vẽ.
const { launch, makeDisk, machine, T, sample } = require('./harness');
(async () => {
  const browser = await launch(); const disk = makeDisk();
  const d = sample({ days: 0, end: '2026-10-11' });
  d.vang.loai = [{ id: 't1', ten: 'SJC miếng', don_vi_niem_yet: 'luong' }, { id: 't2', ten: 'Nhẫn 9999', don_vi_niem_yet: 'chi' }, { id: 't3', ten: 'Vàng 18K', don_vi_niem_yet: 'chi' }];
  const endT = Date.parse('2026-10-11');
  for (let i = 365 * 20; i >= 0; i--) { const ngay = new Date(endT - i * 864e5).toISOString().slice(0, 10), k = 1 + (365 * 20 - i) / (365 * 20) * 4;
    d.vang.gia.push({ ngay, loai_id: 't1', mua_vao: Math.round(30e6 * k), ban_ra: Math.round(30e6 * k * 1.012) }, { ngay, loai_id: 't2', mua_vao: Math.round(3e6 * k), ban_ra: Math.round(3e6 * k * 1.02) }, { ngay, loai_id: 't3', mua_vao: Math.round(2e6 * k), ban_ra: Math.round(2e6 * k * 1.03) }); }
  for (let j = 0; j < 60; j++) { const y = 2007 + Math.floor(j / 3); d.vang.lo.push({ id: `V-${y}-${String(j % 3 + 1).padStart(3, '0')}`, loai_id: 't' + (j % 3 + 1), ngay_mua: `${y}-03-1${j % 3}`, so_mon: 5, trong_luong_mon_dem: j % 3 ? 1000 : 10000, tong_tien_mua: (j % 3 ? 15e6 : 150e6) * (1 + (y - 2007) / 10), ky_vong_pct: 15, sap_dat_pct: 2, nhac_tut_pct: j % 4 ? null : 10, ghi_chu: '' }); }
  for (let j = 0; j < 40; j++) d.vang.ban.push({ id: 'B-' + String(j + 1).padStart(4, '0'), lo_id: d.vang.lo[j].id, ngay: `${2008 + Math.floor(j / 3)}-06-01`, so_mon: 2, gia_ban: (j % 3 ? 4e6 : 40e6) * (1 + j / 40), gia_mua_lai: j % 5 ? null : 3e6, ghi_chu: '' });
  disk.set('tai-san.json', JSON.stringify(d)); console.log(`file ${(disk.get('tai-san.json').text.length / 1e6).toFixed(2)} MB, ${d.vang.gia.length} dòng giá`);
  const A = await machine(browser, disk); A.idb.set('file', 'tai-san.json');
  const time = async (label, fn) => { const t = Date.now(); await fn(); console.log(`${String(Date.now() - t).padStart(5)} ms  ${label}`); };
  let p; await time('mở app tới khi hiện bảng giá', async () => { p = await A.open({ time: '2026-10-11T09:00:00+07:00', perm: { query: 'granted' } }); await p.waitForSelector('#priceForm'); });
  console.log(`${(await p.evaluate(() => { const el = document.getElementById('priceForm').mv_t1; el.value = '150'; const t = performance.now(); el.dispatchEvent(new Event('input', { bubbles: true })); return performance.now() - t; })).toFixed(1).padStart(5)} ms  gõ một phím ở ô giá`);
  await time('rời dòng giá (lưu cả file)', () => T.price(p, 't1', '150', '152'));
  await time('mở Vì sao? (3 biểu đồ)', async () => { await p.locator('#buyWhy summary').click(); await p.waitForTimeout(20); });
  await time('tab Lô vàng', () => T.tab(p, 'lo'));
  await time('tab Cần tiền + gợi ý 500tr', async () => { await T.tab(p, 'cantien'); await p.locator('#cashForm [name=x]').fill('500'); await p.locator('#cashForm button[type=submit]').click(); });
  await time('tab Lịch sử', () => T.tab(p, 'lichsu'));
  await time('Lịch sử giá lọc năm 2015', async () => { await p.locator('#lsPYear').selectOption('2015'); await p.waitForTimeout(20); });
  await time('tab Hôm nay', () => T.tab(p, 'homnay'));
  await time('quay lại tab (file không đổi)', async () => { await p.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await p.waitForTimeout(20); });
  if (p.__log.errors.length) console.log('Lỗi JS:', p.__log.errors);
  await browser.close();
})();
