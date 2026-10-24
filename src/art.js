// ---------- Mimic drawing ----------
// Each form is drawn whole, then split at the mouth line into a top half that lifts and a bottom half that stays.
const FORM_ART = {
  chest: { m: 78, x1: 30, x2: 170, o: '30px 78px', eyes: [[95, 73], [105, 73]], eyeR: [2.6, 3.4], body: `
    <rect x="34" y="146" width="16" height="10" rx="2" fill="#3b2614"/><rect x="150" y="146" width="16" height="10" rx="2" fill="#3b2614"/>
    <rect x="28" y="78" width="144" height="72" rx="4" fill="url(#gWood)" stroke="#3b2614" stroke-width="2"/>
    <path d="M28 104h144M28 128h144" stroke="#4a2f17" stroke-width="2" opacity=".7"/>
    <path d="M28 78 L28 54 Q100 20 172 54 L172 78 Z" fill="url(#gLid)" stroke="#3b2614" stroke-width="2"/>
    <path d="M40 66 Q100 38 160 66" stroke="#4a2f17" stroke-width="2" fill="none" opacity=".6"/>
    <rect x="50" y="36" width="12" height="114" fill="url(#gBrass)" stroke="#5b4219" stroke-width="1.5"/>
    <rect x="138" y="36" width="12" height="114" fill="url(#gBrass)" stroke="#5b4219" stroke-width="1.5"/>
    <rect x="28" y="74" width="144" height="8" fill="url(#gBrass)" stroke="#5b4219" stroke-width="1.5"/>
    <rect x="87" y="64" width="26" height="30" rx="4" fill="url(#gBrass)" stroke="#5b4219" stroke-width="1.5"/>
    <circle cx="56" cy="44" r="2" fill="#5b4219"/><circle cx="144" cy="44" r="2" fill="#5b4219"/><circle cx="56" cy="140" r="2" fill="#5b4219"/><circle cx="144" cy="140" r="2" fill="#5b4219"/>
    <path d="M100 84 l-3 7h6z" fill="#2a1a0c"/>` },
  barrel: { m: 92, x1: 46, x2: 154, o: '46px 92px', eyes: [[90, 84], [110, 84]], eyeR: [3, 3.6], body: `
    <path d="M54 18 Q38 90 54 162 L146 162 Q162 90 146 18 Z" fill="url(#gWood)" stroke="#3b2614" stroke-width="2"/>
    <path d="M78 18 Q70 90 78 162M100 18v144M122 18 Q130 90 122 162" stroke="#4a2f17" stroke-width="2" fill="none" opacity=".7"/>
    <ellipse cx="100" cy="19" rx="46" ry="6" fill="#6e4524" stroke="#3b2614" stroke-width="2"/>
    <path d="M49 38 Q100 46 151 38" stroke="url(#gBrass)" stroke-width="7" fill="none"/><path d="M45 120 Q100 128 155 120" stroke="url(#gBrass)" stroke-width="7" fill="none"/>
    <path d="M51 150 Q100 158 149 150" stroke="url(#gBrass)" stroke-width="7" fill="none"/>
    <circle cx="140" cy="104" r="5" fill="#3b2614"/>` },
  bookshelf: { m: 88, x1: 38, x2: 162, o: '38px 88px', eyes: [[86, 78], [112, 78]], eyeR: [2.6, 3.2], body: `
    <rect x="34" y="8" width="132" height="156" rx="3" fill="#4c2f17" stroke="#2c1a0b" stroke-width="2"/>
    <rect x="42" y="14" width="116" height="144" fill="#2a1a10"/>
    <g stroke="#1b1008" stroke-width="1">
      <rect x="44" y="20" width="12" height="28" fill="#7b2d3a"/><rect x="57" y="24" width="10" height="24" fill="#2f5a6b"/><rect x="68" y="18" width="14" height="30" fill="#6b5a2a"/><rect x="83" y="26" width="9" height="22" fill="#3e6b3a"/><rect x="93" y="20" width="13" height="28" fill="#7b2d3a"/><rect x="107" y="22" width="11" height="26" fill="#5a3a6b"/><rect x="119" y="18" width="15" height="30" fill="#2f5a6b"/><rect x="135" y="24" width="10" height="24" fill="#6b5a2a"/><rect x="146" y="20" width="10" height="28" fill="#3e6b3a"/>
      <rect x="44" y="60" width="14" height="28" fill="#5a3a6b"/><rect x="59" y="64" width="11" height="24" fill="#6b5a2a"/><rect x="71" y="58" width="12" height="30" fill="#7b2d3a"/><rect x="118" y="62" width="12" height="26" fill="#2f5a6b"/><rect x="131" y="58" width="14" height="30" fill="#3e6b3a"/><rect x="146" y="64" width="10" height="24" fill="#7b2d3a"/>
      <rect x="44" y="100" width="12" height="28" fill="#2f5a6b"/><rect x="57" y="96" width="15" height="32" fill="#7b2d3a"/><rect x="73" y="102" width="10" height="26" fill="#6b5a2a"/><rect x="84" y="98" width="13" height="30" fill="#3e6b3a"/><rect x="98" y="104" width="12" height="24" fill="#5a3a6b"/><rect x="111" y="98" width="14" height="30" fill="#2f5a6b"/><rect x="126" y="100" width="11" height="28" fill="#7b2d3a"/><rect x="138" y="96" width="18" height="32" fill="#6b5a2a"/>
      <rect x="46" y="140" width="40" height="16" fill="#6b5a2a"/><rect x="88" y="136" width="14" height="20" fill="#7b2d3a"/><rect x="104" y="140" width="36" height="16" fill="#2f5a6b"/>
    </g>
    <rect x="84" y="64" width="34" height="24" fill="#2a1a10"/>
    <path d="M42 48h116M42 88h116M42 128h116" stroke="#5e3b1d" stroke-width="5"/>` },
  door: { m: 96, x1: 56, x2: 144, o: '56px 96px', eyes: [[93, 84], [107, 84]], eyeR: [2.4, 3], body: `
    <path d="M48 168 L48 52 Q100 -4 152 52 L152 168 Z" fill="#3b2614"/>
    <path d="M56 168 L56 54 Q100 6 144 54 L144 168 Z" fill="url(#gWood)" stroke="#2c1a0b" stroke-width="2"/>
    <path d="M78 22v146M100 12v156M122 22v146" stroke="#4a2f17" stroke-width="2" opacity=".7"/>
    <rect x="56" y="58" width="88" height="9" fill="#4b4f57" stroke="#22252b"/><rect x="56" y="136" width="88" height="9" fill="#4b4f57" stroke="#22252b"/>
    <rect x="86" y="76" width="28" height="16" rx="2" fill="#22252b" stroke="#4b4f57" stroke-width="2"/>
    <circle cx="130" cy="112" r="7" fill="none" stroke="url(#gBrass)" stroke-width="3"/><circle cx="130" cy="104" r="3" fill="url(#gBrass)"/>` },
  wardrobe: { m: 84, x1: 42, x2: 158, o: '42px 84px', eyes: [[90, 74], [110, 74]], eyeR: [2.6, 3.2], body: `
    <rect x="38" y="20" width="124" height="142" rx="3" fill="url(#gWood)" stroke="#3b2614" stroke-width="2"/>
    <path d="M32 22 h136 l-6 -12 h-124 z" fill="#6e4524" stroke="#3b2614" stroke-width="2"/>
    <path d="M100 22v140" stroke="#3b2614" stroke-width="3"/>
    <rect x="48" y="32" width="44" height="54" rx="3" fill="none" stroke="#4a2f17" stroke-width="2"/><rect x="108" y="32" width="44" height="54" rx="3" fill="none" stroke="#4a2f17" stroke-width="2"/>
    <rect x="48" y="96" width="44" height="54" rx="3" fill="none" stroke="#4a2f17" stroke-width="2"/><rect x="108" y="96" width="44" height="54" rx="3" fill="none" stroke="#4a2f17" stroke-width="2"/>
    <circle cx="94" cy="94" r="3.5" fill="url(#gBrass)"/><circle cx="106" cy="94" r="3.5" fill="url(#gBrass)"/>
    <rect x="44" y="160" width="12" height="8" fill="#3b2614"/><rect x="144" y="160" width="12" height="8" fill="#3b2614"/>` },
  coffin: { m: 104, x1: 26, x2: 174, o: '26px 104px', eyes: [[92, 96], [108, 96]], eyeR: [2.6, 3.2], body: `
    <path d="M14 104 L40 66 L160 66 L186 104 L160 146 L40 146 Z" fill="#3e2a1e" stroke="#1f140c" stroke-width="2"/>
    <path d="M22 104 L44 72 L156 72 L178 104 Z" fill="#54382a"/>
    <path d="M70 84h60M100 76v18" stroke="url(#gBrass)" stroke-width="4"/>
    <path d="M20 104 h160" stroke="url(#gBrass)" stroke-width="3"/>
    <circle cx="44" cy="120" r="3" fill="url(#gBrass)"/><circle cx="156" cy="120" r="3" fill="url(#gBrass)"/>` },
};
function teeth(x1, x2, y, down, n) { let d = ''; const w = (x2 - x1) / n; for (let i = 0; i < n; i++) { const a = x1 + i * w, b = a + w, c = (a + b) / 2; d += down ? `M${a} ${y}L${c} ${y + 12}L${b} ${y}Z` : `M${a} ${y}L${c} ${y - 12}L${b} ${y}Z`; } return d; }
function mimicSVG(formKey, cls) {
  const A = FORM_ART[formKey] || FORM_ART.chest; const m = A.m, x1 = A.x1, x2 = A.x2, w = x2 - x1, cx = (x1 + x2) / 2;
  const angry = /open/.test(cls);
  const eyes = A.eyes.map(([x, y]) => `<ellipse class="eye" cx="${x}" cy="${y}" rx="${A.eyeR[0]}" ry="${A.eyeR[1]}" fill="${angry ? '#ff5470' : '#ffd36b'}"/>`).join('');
  return `<div class="mimic ${cls}"><svg viewBox="0 0 200 170" role="img" aria-label="You, disguised as a ${esc(FORMS[formKey].name.toLowerCase())}">
  <defs>
    <linearGradient id="gWood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#9a6635"/><stop offset="1" stop-color="#6a4320"/></linearGradient>
    <linearGradient id="gLid" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b07a44"/><stop offset="1" stop-color="#875627"/></linearGradient>
    <linearGradient id="gBrass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4cd73"/><stop offset="1" stop-color="#b7832e"/></linearGradient>
    <clipPath id="cTop"><rect x="0" y="-20" width="200" height="${m + 20}"/></clipPath>
    <clipPath id="cBot"><rect x="0" y="${m}" width="200" height="${190 - m}"/></clipPath>
  </defs>
  <ellipse cx="100" cy="164" rx="${w / 2 + 6}" ry="5" fill="rgba(0,0,0,.45)"/>
  <ellipse cx="${cx}" cy="${m - 4}" rx="${w / 2 - 4}" ry="26" fill="#3b0c19"/>
  <g class="top" style="transform-origin:${A.o}"><path d="${teeth(x1 + 6, x2 - 6, m, true, 9)}" fill="#f4ecd6"/></g>
  <g clip-path="url(#cBot)">${A.body}</g>
  <path d="${teeth(x1 + 8, x2 - 8, m, false, 8)}" fill="#f4ecd6"/>
  <path class="tongue" d="M${cx - 13} ${m - 4} Q${cx - 18} ${m + 24} ${cx + 2} ${m + 42} Q${cx + 8} ${m + 46} ${cx + 12} ${m + 36} Q${cx + 20} ${m + 18} ${cx + 13} ${m - 4} Z" fill="#ea5c7d" stroke="#a8304f" stroke-width="1.5"/>
  <g class="top" style="transform-origin:${A.o}"><g clip-path="url(#cTop)">${A.body}</g>${eyes}</g>
  </svg></div>`;
}
