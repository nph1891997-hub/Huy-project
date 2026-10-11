// Ghép các file trong src/ thành index.html (một file duy nhất để người dùng mở bằng trình duyệt).
// Chạy: node build.js   ·   Kiểm tra index.html đã khớp src/ chưa: node build.js --check
const fs = require('fs'), path = require('path');
const S = p => fs.readFileSync(path.join(__dirname, 'src', p), 'utf8');
const js = fs.readdirSync(path.join(__dirname, 'src')).filter(f => /^\d\d-.*\.js$/.test(f)).sort();
const out = S('head.html') + '<style>\n' + S('style.css') + '</style>\n' + S('body.html') +
  '<script>\n\'use strict\';\n' + js.map(f => `// ===== ${f} =====\n` + S(f)).join('\n') + '</script>\n</body>\n</html>\n';
const target = path.join(__dirname, 'index.html');
if (process.argv.includes('--check')) {
  // Hộp hỏi / báo phải đi qua ask/tell (src/01-tien-ich.js), xem lý do ở đó
  const raw = js.filter(f => /(?<![\w.$])(confirm|alert)\(/.test(S(f).replace(/window\.(confirm|alert)\(/g, '')));
  if (raw.length) { console.error('Gọi thẳng confirm/alert trong ' + raw.join(', ') + ': dùng ask/tell'); process.exit(1); }
  if (fs.readFileSync(target, 'utf8') !== out) { console.error('index.html chưa khớp src/: chạy node build.js'); process.exit(1); }
  console.log('index.html khớp src/');
} else { fs.writeFileSync(target, out); console.log('đã ghép', js.length, 'file JS →', target); }
