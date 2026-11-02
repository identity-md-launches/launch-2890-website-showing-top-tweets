// Tests the committed export under a subpath, without a backend or external requests.
// PLAYWRIGHT_MODULE=/absolute/path/to/playwright/index.mjs node scripts/check-interactions.mjs
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
import { pathToFileURL } from 'node:url';
const { chromium, webkit } = await import(process.env.PLAYWRIGHT_MODULE ? pathToFileURL(process.env.PLAYWRIGHT_MODULE).href : 'playwright');
const root = resolve('dist');
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.png': 'image/png', '.woff2': 'font/woff2' };
const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://localhost');
    if (!url.pathname.startsWith('/pond/')) { res.writeHead(404).end(); return; }
    const path = resolve(root, '.' + decodeURIComponent(url.pathname.slice('/pond'.length)), url.pathname.endsWith('/') ? 'index.html' : '');
    if (!path.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const body = await readFile(path);
    res.writeHead(200, { 'Content-Type': mime[extname(path)] || 'application/octet-stream' }).end(body);
  } catch { res.writeHead(404).end(); }
});
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}/pond/`;
const checks = [], errors = [], resources = [], external = [];
let browser;
async function check(name, fn) {
  try { const detail = await fn(); checks.push({ name, passed: true, detail: detail ?? '' }); console.log('PASS', name); }
  catch (error) { checks.push({ name, passed: false, detail: error.message }); console.log('FAIL', name, error.message); }
}
const cards = page => page.locator('article.post');
const filter = (page, name) => page.getByRole('group', { name: 'Filter by topic' }).getByRole('button', { name, exact: true });
async function count(page, expected) { await page.waitForFunction(n => document.querySelectorAll('article.post').length === n, expected); }
async function clean(page) { await page.goto(base); await page.evaluate(() => { localStorage.clear(); }); await page.reload(); }
try {
 browser = await chromium.launch({ headless: true });
 const context = await browser.newContext({ viewport: { width: 390, height: 844 }, permissions: ['clipboard-read', 'clipboard-write'] });
 await context.route('**/*', route => {
   if (new URL(route.request().url()).origin !== new URL(base).origin) { external.push(route.request().url()); return route.abort(); }
   return route.continue();
 });
 const page = await context.newPage();
 page.on('pageerror', e => errors.push(e.message));
 page.on('console', e => { if (e.type() === 'error') errors.push(e.text()); });
 page.on('response', r => { if (r.status() >= 400) resources.push(`${r.status()} ${r.url()}`); });
 await page.goto(base);
 await check('Static subpath loads all local runtime and share assets', async () => {
   await count(page, 6);
   assert.match(await page.title(), /IdentityMD/);
   for (const resource of ['favicon.svg', 'images/og-pond.png', 'fonts/manrope-latin.woff2']) assert.equal((await page.request.get(base + resource)).status(), 200, resource);
   assert.equal(await page.evaluate(() => document.fonts.check('700 32px Manrope')), true);
 });
 await check('390 × 844 first screen contains product, browse action, first tweet and bookmark', async () => {
   await page.evaluate(() => document.fonts.ready);
   for (const loc of [page.locator('h1'), page.getByRole('link', { name: 'Explore the feed' }), cards(page).first().locator('blockquote'), cards(page).first().getByRole('button', { name: /Save Adam/ })]) {
     const box = await loc.boundingBox(); assert(box && box.y >= 0 && box.y + box.height <= 844, JSON.stringify(box));
   }
 });
 await check('Explore the feed scrolls to the actual tweets', async () => {
   await page.getByRole('link', { name: 'Explore the feed' }).click();
   assert.equal(new URL(page.url()).hash, '#feed');
   assert((await page.locator('#feed').boundingBox()).y < 25);
 });
 await check('All four topic filters return matching real posts', async () => {
   for (const [name, n] of [['Building', 4], ['AI agents', 3], ['Community', 3], ['Memes', 2]]) {
     await filter(page, name).click(); await count(page, n);
     assert.equal(await filter(page, name).getAttribute('aria-pressed'), 'true');
     for (const txt of await cards(page).locator('.topic').allTextContents()) assert.equal(txt, name);
   }
 });
 await check('Search by author, case-insensitive text and combined topic', async () => {
   await filter(page, 'All').click();
   const input = page.getByRole('searchbox', { name: 'Search tweets' });
   await input.fill('@0xFINNE'); await count(page, 1); assert.match(await cards(page).innerText(), /Redesigned imd terminal/);
   await input.fill('swarm'); await filter(page, 'AI agents').click(); await count(page, 2);
 });
 await check('Search empty state explains recovery and Clear filters resets it', async () => {
   await page.getByRole('searchbox').fill('unfindable-pond-phrase'); await count(page, 0);
   assert.equal(await page.getByRole('heading', { name: 'No signals found.' }).count(), 1);
   await page.getByRole('button', { name: 'Clear filters', exact: true }).click(); await count(page, 6);
   assert.equal(await page.getByRole('searchbox').inputValue(), '');
 });
 await check('Most liked and newest sort change the first post correctly', async () => {
   assert.equal(await cards(page).first().getAttribute('data-post-id'), '2117065610790379903');
   await page.getByLabel('Sort tweets').selectOption('newest');
   await page.waitForFunction(() => document.querySelector('article')?.dataset.postId === '2117290919560909154');
   await page.getByLabel('Sort tweets').selectOption('top');
   await page.waitForFunction(() => document.querySelector('article')?.dataset.postId === '2117065610790379903');
 });
 await check('Load more reveals all twelve posts and moves focus into new content', async () => {
   await page.getByRole('button', { name: 'Load 6 more tweets' }).click(); await count(page, 12);
   assert.equal(await page.locator('.feed-end').count(), 1);
   assert.equal(await page.evaluate(() => document.activeElement?.tagName), 'ARTICLE');
 });
 await check('Saved empty state, keyboard save, reload persistence and remove all work', async () => {
   await page.getByRole('link', { name: /^Saved tweets/ }).click(); await count(page, 0);
   assert.equal(await page.getByRole('heading', { name: 'Keep the good ones.' }).count(), 1);
   await page.getByRole('link', { name: 'Explore tweets', exact: true }).click(); await count(page, 6);
   const save = cards(page).first().getByRole('button', { name: 'Save Adam’s tweet', exact: true });
   await save.focus(); await page.keyboard.press('Space');
   assert.equal(await cards(page).first().getByRole('button', { name: 'Unsave Adam’s tweet' }).getAttribute('aria-pressed'), 'true');
   await page.getByRole('link', { name: /^Saved tweets/ }).click(); await count(page, 1);
   await page.reload(); await count(page, 1); assert.equal(new URL(page.url()).hash, '#saved');
   await page.getByRole('button', { name: 'Unsave Adam’s tweet' }).click(); await count(page, 0);
   assert.equal(await page.evaluate(() => document.activeElement?.textContent?.includes('Explore tweets')), true);
 });
 await check('Copy link writes the original X URL to the clipboard', async () => {
   await page.getByRole('link', { name: 'Top tweets', exact: true }).click(); await count(page, 6);
   await cards(page).first().getByRole('button', { name: 'Copy link to Adam’s tweet' }).click();
   await page.getByRole('status').filter({ hasText: 'Tweet link copied.' }).waitFor();
   assert.equal(await page.evaluate(() => navigator.clipboard.readText()), 'https://x.com/surfcoderepeat/status/2117065610790379903');
 });
 await check('About dialog traps focus, explains data, and Escape returns focus', async () => {
   await page.getByRole('button', { name: 'About the pond', exact: true }).click();
   const dialog = page.getByRole('dialog', { name: 'A little more signal.' });
   await dialog.waitFor(); assert.match(await dialog.innerText(), /selected snapshot/);
   for (let i = 0; i < 8; i++) { await page.keyboard.press('Tab'); assert.equal(await page.evaluate(() => document.activeElement?.closest('dialog') !== null), true); }
   for (let i = 0; i < 8; i++) { await page.keyboard.press('Shift+Tab'); assert.equal(await page.evaluate(() => document.activeElement?.closest('dialog') !== null), true); }
   await page.keyboard.press('Escape'); assert.equal(await dialog.isVisible(), false);
   assert.equal(await page.getByRole('button', { name: 'About the pond', exact: true }).evaluate(el => el === document.activeElement), true);
 });
 await check('Clipboard rejection offers a selectable link instead of false success', async () => {
   await page.evaluate(() => { navigator.clipboard.writeText = async () => { throw new DOMException('Blocked', 'NotAllowedError'); }; });
   await cards(page).first().getByRole('button', { name: 'Copy link to Adam’s tweet' }).click();
   const dialog = page.getByRole('dialog', { name: 'Copy this tweet link' }); await dialog.waitFor();
   assert.equal(await dialog.getByLabel('Tweet link', { exact: true }).inputValue(), 'https://x.com/surfcoderepeat/status/2117065610790379903');
   await dialog.getByRole('button', { name: 'Select link' }).click();
   assert.match(await page.evaluate(() => window.getSelection().toString() || document.activeElement.value.slice(document.activeElement.selectionStart, document.activeElement.selectionEnd)), /x.com/);
   await page.keyboard.press('Escape');
 });
 await check('Blocked local storage preserves saves for the visit and explains the limit', async () => {
   await page.evaluate(() => { Storage.prototype.setItem = () => { throw new DOMException('Blocked', 'SecurityError'); }; });
   await cards(page).first().getByRole('button', { name: 'Save Adam’s tweet' }).click();
   await page.locator('.storage-warning').waitFor();
   assert.match(await page.locator('.storage-warning').innerText(), /last for this visit/);
   await page.getByRole('link', { name: /^Saved tweets/ }).click(); await count(page, 1);
 });
 await check('History and reload resolve the saved hash without server rewrites', async () => {
   await page.getByRole('link', { name: 'Top tweets', exact: true }).click(); await count(page, 6);
   await page.goBack(); await count(page, 1); assert.equal(new URL(page.url()).hash, '#saved');
   await page.goForward(); await count(page, 6);
 });
 await check('Malformed storage recovers to an empty saved collection', async () => {
   const corrupt = await browser.newContext(); await corrupt.addInitScript(() => localStorage.setItem('the-pond:saved:v1', '{bad-json'));
   const p = await corrupt.newPage(); await p.goto(base + '#saved'); await count(p, 0); assert.equal(await p.locator('h1').innerText(), 'Saved tweets'); await corrupt.close();
 });
 await check('Layout and resources at 320, 390, 580, 720, 840, 960, 1260, 1440 and 1920 CSS pixels', async () => {
   await clean(page);
   for (const width of [320, 390, 580, 720, 840, 960, 1260, 1440, 1920]) {
     await page.setViewportSize({ width, height: 900 }); await page.evaluate(() => document.fonts.ready);
     assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `Overflow at ${width}`);
     for (const img of await page.locator('img:visible').all()) {
       await img.scrollIntoViewIfNeeded();
       assert.equal(await img.evaluate(el => el.complete && el.naturalWidth > 0), true, await img.getAttribute('src'));
     }
     await page.evaluate(() => scrollTo(0, 0));
   }
 });
 await check('RTL and expanded text spacing retain content and controls', async () => {
   await page.setViewportSize({ width: 390, height: 844 });
   await page.evaluate(() => document.documentElement.dir = 'rtl');
   assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'RTL overflow');
   await page.evaluate(() => document.documentElement.dir = 'ltr');
   const style = await page.addStyleTag({ content: '* { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; } p { margin-bottom: 2em !important; }' });
   assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, 'Expanded text spacing overflow');
   await style.evaluate(el => el.remove());
 });
 await check('Reduced motion disables interactive transforms and animations', async () => {
   await page.emulateMedia({ reducedMotion: 'reduce' });
   assert.equal(await page.locator('.primary').first().evaluate(el => getComputedStyle(el).transitionDuration), '0s');
   assert.equal(await page.evaluate(() => document.getAnimations().filter(a => a.effect.getTiming().iterations === Infinity).length), 0);
 });
 await check('Desktop conversation shortcuts apply their topic filter', async () => {
   await page.setViewportSize({ width: 1440, height: 900 }); await page.goto(base);
   await page.locator('.conversation-topics button').filter({ hasText: 'AIAgents' }).click(); await count(page, 3);
   assert.equal(await filter(page, 'AI agents').getAttribute('aria-pressed'), 'true');
 });
 await check('Keyboard search focus has a visible two-pixel perimeter', async () => {
   await page.getByRole('searchbox').focus();
   const ring = await page.locator('.search-box').evaluate(el => ({ width: getComputedStyle(el).outlineWidth, style: getComputedStyle(el).outlineStyle }));
   assert.equal(ring.width, '2px'); assert.equal(ring.style, 'solid');
 });
 await check('All source links are actual X post URLs and external links protect the opener', async () => {
   for (const link of await page.locator('a[target="_blank"]').all()) assert.match(await link.getAttribute('rel'), /noreferrer/);
   for (const post of await cards(page).all()) assert.match(await post.locator('.post-x').getAttribute('href'), /^https:\/\/x\.com\/\w+\/status\/\d+$/);
 });
 await check('Chromium page has no script, console, resource or external runtime failures', async () => {
   assert.deepEqual(errors, []); assert.deepEqual(resources, []); assert.deepEqual(external, []);
 });
 await context.close();
} finally {
 if (browser) await browser.close();
 const result = { browser: 'Chromium', base: '/pond/', checks, passed: checks.filter(c => c.passed).length, total: checks.length, errors, resources, external };
 await mkdir('test/scratch', { recursive: true }); await writeFile('test/scratch/interactions.json', JSON.stringify(result, null, 2) + '\n');
 await new Promise(resolve => server.close(resolve));
}
// Report WebKit capability separately, without treating a missing host library as an app failure.
try { const safari = await webkit.launch({ headless: true }); await safari.close(); console.log('WebKit runtime is available.'); }
catch (error) { console.log('WebKit runtime unavailable: host libraries are missing. See validation limitations.'); }
if (checks.some(c => !c.passed)) process.exitCode = 1;
console.log(`${checks.filter(c => c.passed).length}/${checks.length} interaction checks passed.`);
