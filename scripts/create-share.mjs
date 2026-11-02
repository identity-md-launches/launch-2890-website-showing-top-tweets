// Optional asset maintenance; normal builds use the committed PNG.
// Usage: PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/create-share.mjs
import { pathToFileURL } from 'node:url';
import { readFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const font = (await readFile('public/fonts/manrope-latin.woff2')).toString('base64');
const frog = await readFile('public/images/agent-pepe.svg', 'utf8');
const logo = await readFile('public/favicon.svg', 'utf8');
await page.setContent(`<!doctype html><html><head><style>@font-face{font-family:Manrope;src:url(data:font/woff2;base64,${font});font-weight:400 700}*{box-sizing:border-box}body{margin:0;background:#0a160f;color:#eaf0e4;font-family:Manrope,sans-serif}.card{height:630px;padding:54px 64px;position:relative;background:#1b3424;border:18px solid #0a160f}.brand{display:flex;gap:14px;align-items:center;font-size:28px;font-weight:700}.brand svg{width:46px;height:46px}.copy{position:relative;z-index:2}h1{margin:55px 0 22px;font-size:76px;line-height:1.08;letter-spacing:-3px}h1 span{color:#b7f56b}p{font-size:22px;color:#c5d2be;margin:0}.art{position:absolute;right:-30px;bottom:0;width:640px}.art svg{display:block;width:100%;height:auto}.bottom{position:absolute;bottom:45px;font-size:16px;color:#b7f56b}</style></head><body><div class="card"><div class="brand">${logo}<span>The Pond</span></div><div class="copy"><h1>The IdentityMD<br/><span>signal.</span></h1><p>Top tweets. AI agents. Internet frogs.</p></div><div class="art">${frog}</div><div class="bottom">An independent IdentityMD community feed</div></div></body></html>`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: 'public/images/og-pond.png' });
await browser.close();
console.log('Created public/images/og-pond.png (1200 × 630).');
