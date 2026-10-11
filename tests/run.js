// Chạy mọi ca trong tests/cases/*.js song song, mỗi ca một trình duyệt. Dùng: node tests/run.js [tên-ca]
const fs = require('fs'), path = require('path');
const { launch, checker } = require('./harness');
(async () => {
  const dir = path.join(__dirname, 'cases'), filter = process.argv[2];
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') && (!filter || f.includes(filter))).sort();
  const t0 = Date.now();
  const results = await Promise.all(files.map(async f => {
    const c = require(path.join(dir, f)); const browser = await launch(); const chk = checker(); let fails = chk.fails;
    try { await c.run(browser, chk); } catch (e) { fails.push('ca kiểm thử gãy: ' + String(e).split('\n')[0]); }
    await browser.close(); return { f, name: c.name, fails };
  }));
  let bad = 0;
  for (const r of results) { console.log((r.fails.length ? '✗ ' : '✓ ') + r.f + ' · ' + r.name); for (const x of r.fails) { console.log('    - ' + x); bad++; } }
  console.log(`${results.length} ca, ${bad} lỗi, ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  process.exit(bad ? 1 : 0);
})();
