// Chụp màn hình ở bề rộng điện thoại (390 px) để xem bố cục. Chạy tay: npm run screens → ảnh trong tests/screens/
const fs = require('fs'), path = require('path');
const { launch, makeDisk, machine, T, sample } = require('./harness');
(async () => {
  const out = path.join(__dirname, 'screens'); fs.mkdirSync(out, { recursive: true });
  const browser = await launch(), disk = makeDisk(), d = sample({ days: 40, end: '2026-10-10', mv0: 170e6 });
  d.vang.lo.push({ id: 'V-2026-001', loai_id: 'tsjc', ngay_mua: '2026-07-01', so_mon: 2, trong_luong_mon_dem: 10000, tong_tien_mua: 260e6, ky_vong_pct: 35, sap_dat_pct: 2, nhac_tut_pct: 25, ghi_chu: '' });
  d.vang.lo.push({ id: 'V-2026-002', loai_id: 'tsjc', ngay_mua: '2026-07-05', so_mon: 2, trong_luong_mon_dem: 10000, tong_tien_mua: 264e6, ky_vong_pct: 35, sap_dat_pct: 2, nhac_tut_pct: null, ghi_chu: '' });
  d.vang.lo.push({ id: 'V-2026-003', loai_id: 'tsjc', ngay_mua: '2026-10-01', so_mon: 1, trong_luong_mon_dem: 10000, tong_tien_mua: 172e6, ky_vong_pct: 15, sap_dat_pct: 2, nhac_tut_pct: null, ghi_chu: '' });
  d.vang.ban.push({ id: 'B-0001', lo_id: 'V-2026-002', ngay: '2026-09-01', so_mon: 0, gia_ban: 165e6, gia_mua_lai: 150e6, ghi_chu: '' });
  disk.set('tai-san.json', JSON.stringify(d));
  const shot = async (p, name) => { await p.screenshot({ path: path.join(out, name + '.png'), fullPage: true }); console.log('đã chụp', name); };
  for (const [fsa, tag] of [[true, 'may-tinh-hep'], [false, 'dien-thoai-che-do-xem']]) {
    const M = await machine(browser, disk, { name: tag, fsa }); M.idb.set('file', 'tai-san.json');
    const p = await M.ctx.newPage(); await p.setViewportSize({ width: 390, height: 844 }); p.__log = { dialogs: [], errors: [] }; p.__policy = () => true;
    p.on('dialog', x => x.accept()); await p.clock.setSystemTime('2026-10-11T09:00:00+07:00');
    if (fsa) await p.addInitScript(() => { window.__permInit = { query: 'granted' }; });
    await p.addInitScript(() => { if (window.__permInit && window.__perm) Object.assign(window.__perm, window.__permInit); });
    await p.goto(require('./harness').URL); await p.waitForTimeout(300);
    if (!fsa) { const [fc] = await Promise.all([p.waitForEvent('filechooser'), T.click(p, 'view-open')]); await fc.setFiles({ name: 'tai-san.json', mimeType: 'application/json', buffer: Buffer.from(disk.get('tai-san.json').text) }); await p.waitForTimeout(200); }
    await T.price(p, 'tsjc', '158', '170'); await p.locator('details[data-lazy=giu] summary').click().catch(() => { }); await p.waitForTimeout(100);
    await shot(p, tag + '-1-hom-nay');
    await T.price(p, 'tsjc', '148', '150'); await shot(p, tag + '-2-mua-lai');
    await T.tab(p, 'cantien'); await p.locator('#cashForm [name=x]').fill('200'); await p.locator('#cashForm button[type=submit]').click(); await p.waitForTimeout(100); await shot(p, tag + '-3-can-tien');
    if (fsa) { await T.tab(p, 'homnay'); await p.locator('[data-act=sell]').first().click(); await p.waitForTimeout(100); await shot(p, tag + '-4-hop-ban'); }
  }
  await browser.close();
})();
