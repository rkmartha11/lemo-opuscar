// shared boot: fonts, shot selection, DUR/READY contract
(function () {
  const q = new URLSearchParams(location.search);
  window.SHOT = q.get('shot') || 'S01';
  window.S = window.DATA[window.SHOT];
  window.DUR = Math.round(window.S.dur * 30) / 30;
  window.CTX = document.getElementById('c').getContext('2d');
  window.bootFonts = async function (extra) {
    const f1 = new FontFace('Montserrat', 'url(fonts/Montserrat.ttf)', { weight: '100 900' });
    const f2 = new FontFace('Caveat', 'url(fonts/Caveat.ttf)', { weight: '400 700' });
    await Promise.all([f1.load(), f2.load()]).then(fs => fs.forEach(f => document.fonts.add(f)));
    if (extra) await extra();
    window.READY = true;
  };
})();
