// ===================== Hằng số & tiện ích =====================
const KEY = 'tai-san-v1';
const UNITS = [['luong', 10000, 'lượng'], ['chi', 1000, 'chỉ'], ['phan', 100, 'phân'], ['ly', 10, 'ly'], ['dem', 1, 'dem']];
const UNIT_DEM = { luong: 10000, chi: 1000, phan: 100, ly: 10, dem: 1 };
const UNIT_NAME = { luong: 'lượng', chi: 'chỉ', phan: 'phân', ly: 'ly', dem: 'dem' };
const unitOptions = sel => Object.keys(UNIT_NAME).map(u => `<option value="${u}" ${sel === u ? 'selected' : ''}>${UNIT_NAME[u]}</option>`).join('');
const TABS = [['homnay', 'Hôm nay'], ['lo', 'Lô vàng'], ['cantien', 'Cần tiền'], ['lichsu', 'Lịch sử'], ['thamso', 'Tham số']];

const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const today = () => { const d = new Date(); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const addDays = (iso, n) => new Date(Date.parse(iso) + n * 864e5).toISOString().slice(0, 10);
const median = a => { const b = a.slice().sort((x, y) => x - y), m = b.length >> 1; return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; };
const fmtD = iso => iso ? iso.slice(8, 10) + '/' + iso.slice(5, 7) + '/' + iso.slice(0, 4) : '';
// Định dạng số kiểu Việt Nam; tạo sẵn một lần (toLocaleString tạo bộ định dạng mới mỗi lần gọi, chậm khi vẽ hàng nghìn dòng)
const NF = new Intl.NumberFormat('vi-VN'), NF1 = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 }), NF2 = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 2 }),
  NFP = new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const digits = x => (x == null || x === '' || isNaN(x)) ? '' : NF.format(Math.round(x));
// Nhập tiền: "118.500.000", "118500000", "118,5" hoặc "118.5" (số nhỏ hơn 1.000 hiểu là triệu),
// "148.500" hoặc "148500" (từ 1.000 đến dưới 1.000.000 hiểu là nghìn đồng, như bảng giá các tiệm), "118,5tr", "500k";
// ghi kèm "đ" thì đúng số đồng như gõ ("500.000đ")
function parseM(s) {
  let t = String(s ?? '').toLowerCase().replace(/\s/g, ''), mult = 1;
  const exact = t.endsWith('đ'); t = t.replace(/đ/g, '');
  if (t.endsWith('tr')) { mult = 1e6; t = t.slice(0, -2); } else if (t.endsWith('k')) { mult = 1e3; t = t.slice(0, -1); }
  if (t.includes(',')) t = t.replace(/\./g, '').replace(',', '.');      // dấu phẩy là phần thập phân
  else if (/^\d{1,3}(\.\d{3})+$/.test(t)) t = t.replace(/\./g, '');  // 11.700.000 → dấu chấm ngăn nghìn
  const v = parseFloat(t.replace(/[^\d.]/g, ''));
  if (!isFinite(v) || v <= 0) return 0;
  if (mult === 1 && !exact) mult = v < 1000 ? 1e6 : v < 1e6 ? 1e3 : 1;
  return Math.round(v * mult);
}
// Số tiền viết vào ô nhập: dưới 1 triệu thì kèm "đ", để đọc lại (bấm Lưu) không bị hiểu thành nghìn đồng
const fmtIn = x => !x ? '' : x < 1e6 ? digits(x) + 'đ' : digits(x);
const parseN = s => { const v = Number(String(s ?? '').replace(',', '.')); return isNaN(v) ? 0 : v; };
const fmtM = x => (x == null || isNaN(x)) ? '—' : NF.format(Math.round(x)) + ' đ';
const fmtTr = x => x >= 1e6 ? (x >= 1e8 ? NF1 : NF2).format(x / 1e6) + 'tr' : digits(x) + 'đ';
const fmtMS = x => (x == null || isNaN(x)) ? '—' : (x > 0.5 ? '+' : '') + fmtM(x);
const fmtP = (x, sign = true) => (x == null || isNaN(x) || !isFinite(x)) ? '—' :
  (sign && x > 0 ? '+' : '') + NFP.format(x * 100) + '%';
const cls = x => x > 0.5 ? 'pos' : x < -0.5 ? 'neg' : '';
const clsP = x => x > 0 ? 'pos' : x < 0 ? 'neg' : '';
function fmtW(dem) {
  if (!dem) return '0';
  const parts = []; let r = dem;
  for (const [, v, name] of UNITS) { const q = Math.floor(r / v); r -= q * v; if (q) parts.push(q + ' ' + name); }
  return parts.join(' ');
}
function splitW(dem) { const o = {}; let r = dem; for (const [k, v] of UNITS) { o[k] = Math.floor(r / v); r -= o[k] * v; } return o; }
