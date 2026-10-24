const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 512, height: 512 } });
  await p.goto('file://' + process.cwd() + '/dist/index.html');
  await p.evaluate(() => {
    document.body.innerHTML = `<div id="ic" style="width:512px;height:512px;display:grid;place-items:center;background:radial-gradient(circle at 50% 35%,#3a2f4a,#16121d 70%)">${mimicSVG('chest', 'open')}</div>`;
    const m = document.querySelector('.mimic'); m.style.cssText = 'position:static;transform:none;width:400px;height:auto'; document.querySelector('.tongue').style.opacity = 1;
    document.querySelectorAll('.top').forEach(t => t.style.transform = 'translate(0,-24px) rotate(-5deg)');
    document.documentElement.style.padding = '0';
  });
  await p.waitForTimeout(200);
  await p.locator('#ic').screenshot({ path: 'assets/icon-512.png' });
  await b.close();
})();
