// 2 máy dùng chung file (OneDrive) và 2 tab cùng máy: mở chỉ đọc, nạp lại khi quay lại tab, không ghi đè khi file đã đổi, OneDrive chỉ chạm file
const { makeDisk, machine, T, sample } = require('../harness');
exports.name = '2 máy, 2 tab dùng chung file (A1, A13)';
exports.run = async (browser, chk) => {
  const { eq, has, ok, noErr, fails } = chk;
  const disk = makeDisk(), d = sample({ days: 20, end: '2026-10-11' });
  d.vang.lo.push({ id: 'V-2026-001', loai_id: 'tsjc', ngay_mua: '2026-09-20', so_mon: 3, trong_luong_mon_dem: 10000, tong_tien_mua: 450e6, ky_vong_pct: 15, sap_dat_pct: 2, nhac_tut_pct: null, ghi_chu: '' });
  disk.set('tai-san.json', JSON.stringify(d));
  const A = await machine(browser, disk, { name: 'A' }), B = await machine(browser, disk, { name: 'B' });
  A.idb.set('file', 'tai-san.json'); B.idb.set('file', 'tai-san.json');
  const pa = await A.open({ time: '2026-10-11T09:00:00+07:00', perm: { query: 'prompt' } });
  has(await T.app(pa), 'Mở lại tai-san.json', 'màn chờ khi chưa cấp quyền'); eq(await T.status(pa), 'Chưa mở file dữ liệu', 'trạng thái màn chờ');
  const mod0 = disk.get('tai-san.json').mod;
  await T.click(pa, 'file-reconnect'); await pa.waitForTimeout(100);
  has(await T.status(pa), 'Đã mở tai-san.json · sửa lần cuối', 'A mở lại'); eq(disk.get('tai-san.json').mod, mod0, 'mở lại không ghi file (A13)');
  const pb = await B.open({ time: '2026-10-11T09:01:00+07:00', perm: { query: 'granted' } });
  eq(disk.get('tai-san.json').mod, mod0, 'B tự mở cũng không ghi file');
  await T.sell(pb, 'V-2026-001', { k: 1, gia: '160' }); await pb.waitForTimeout(100);
  eq(disk.json('tai-san.json').vang.ban.length, 1, 'B bán → file có 1 lần bán');
  await pa.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await pa.waitForTimeout(150);
  has(await T.notice(pa), 'vừa được cập nhật ở nơi khác', 'A quay lại tab: báo nạp bản mới'); eq((await T.D(pa)).vang.ban.length, 1, 'A đã nạp lần bán của B');
  // B sửa tiếp, A không quay lại tab mà nhập giá → A không được ghi đè
  await T.sell(pb, 'V-2026-001', { k: 1, gia: '161' }); await pb.waitForTimeout(100);
  await pa.evaluate(() => act['notice-close']()); await T.price(pa, 'tsjc', '159', '161'); await pa.waitForTimeout(150);
  eq(disk.json('tai-san.json').vang.ban.length, 2, 'file giữ 2 lần bán của B (A không ghi đè)');
  has(await T.notice(pa), 'Thay đổi vừa rồi chưa được lưu', 'A báo chưa lưu'); eq((await T.dl(pa)).length, 1, 'A tải bản trình duyệt về');
  eq((await T.D(pa)).vang.gia.find(p => p.ngay === '2026-10-11').mua_vao, 158000000, 'A dùng giá trong file');
  // Hộp thoại đang mở ở A thì B sửa, A quay lại → hộp đóng
  await T.click(pa, 'lot-add'); await T.price(pb, 'tsjc', '158,5', '160,5'); await pb.waitForTimeout(100);
  await pa.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await pa.waitForTimeout(150);
  eq(await T.dlgOpen(pa), false, 'hộp thoại đóng khi nạp bản mới'); has(await T.notice(pa), 'Hộp thoại đang mở đã đóng lại', 'báo hộp đã đóng');
  // OneDrive chỉ chạm file (nội dung không đổi) → không báo
  disk.touch('tai-san.json'); await pa.evaluate(() => act['notice-close']());
  await pa.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await pa.waitForTimeout(150);
  eq(await T.notice(pa), '', 'OneDrive chỉ chạm file thì không báo');
  // 2 tab cùng máy B
  const pb2 = await B.open({ time: '2026-10-11T09:10:00+07:00', perm: { query: 'granted' } });
  await T.price(pb2, 'tsjc', '157', '159'); await pb2.waitForTimeout(100);
  await pb.evaluate(() => document.dispatchEvent(new Event('visibilitychange'))); await pb.waitForTimeout(150);
  eq((await T.D(pb)).vang.gia.find(p => p.ngay === '2026-10-11').mua_vao, 157000000, 'tab 1 nạp giá tab 2 vừa lưu');
  // Tải lại A: không ghi, không tải về gì
  const pa2 = await A.open({ time: '2026-10-11T09:20:00+07:00', perm: { query: 'granted' } });
  has(await T.status(pa2), 'Đã mở tai-san.json · sửa lần cuối', 'A tải lại'); eq((await T.dl(pa2)).length, 0, 'không tải về gì khi bản trình duyệt khớp file');
  ok([pa, pb, pb2, pa2].every(p => !p.__log.errors.length), 'không lỗi JS');
  return fails;
};
