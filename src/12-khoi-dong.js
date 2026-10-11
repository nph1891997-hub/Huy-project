// ===================== Khởi động =====================
(async () => {
  render();
  if (hasFSA) {
    // IndexedDB hay quyền file mà treo thì sau 2 giây vẫn vẽ app, không để trang trắng
    const timeout = p => Promise.race([p, new Promise(r => setTimeout(() => r(null), 2000))]);
    let h = null;
    try { h = await timeout(idbGet('file')); } catch { }
    if (h) {
      pendingHandle = h;
      try { if (await timeout(h.queryPermission({ mode: 'readwrite' })) === 'granted') { booting = false; await useFile(h, false); return; } }
      catch (e) { fileError(e, h); }   // file hỏng, rỗng, mất…: về màn chờ, báo lý do, không để trang trắng
    }
  }
  booting = false; render(); persistStatus();
})();
