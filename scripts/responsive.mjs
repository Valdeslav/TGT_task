import { chromium } from 'playwright-core';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await chromium.launch({ executablePath: chromePath, headless: true });

const results = [];
for (const viewport of [
  { width: 390, height: 844, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
]) {
  const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(String(error)));
  await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });
  const metrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    sidebarPosition: getComputedStyle(document.querySelector('.sidebar')).position,
    mainMarginLeft: getComputedStyle(document.querySelector('.main')).marginLeft,
    kpiColumns: getComputedStyle(document.querySelector('.kpi-grid')).gridTemplateColumns,
  }));
  await page.screenshot({ path: path.resolve('docs', `${viewport.name}.png`), fullPage: false });
  await page.getByRole('button', { name: /Все новички/ }).first().click();
  await page.waitForSelector('.table-card');
  const tableMetrics = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
    tableScrollWidth: document.querySelector('.table-scroll')?.scrollWidth,
    tableClientWidth: document.querySelector('.table-scroll')?.clientWidth,
  }));
  await page.screenshot({ path: path.resolve('docs', `${viewport.name}-newcomers.png`), fullPage: false });
  results.push({ viewport, errors, metrics, tableMetrics });
  await page.close();
}

console.log(JSON.stringify(results, null, 2));
await browser.close();
