import { chromium } from 'playwright-core';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('pageerror', (error) => errors.push(String(error)));
const out = (name) => path.resolve('docs', name);

await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });

const metrics = await page.evaluate(() => ({
  innerWidth: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  bodyText: document.body.innerText.length,
  kpiCount: document.querySelectorAll('.kpi-card').length,
  attentionRows: document.querySelectorAll('.attention-row').length,
  cards: Array.from(document.querySelectorAll('.card')).length,
}));

await page.getByRole('button', { name: /Все новички/ }).first().click();
await page.waitForSelector('.table-card');
await page.getByRole('button', { name: /Красная зона/ }).click();
const redRows = await page.locator('tbody tr').count();
await page.screenshot({ path: out('newcomers.png'), fullPage: false });

await page.locator('tbody tr').first().click();
await page.waitForSelector('.drawer');
await page.locator('.drawer').getByRole('button', { name: /Задача в Битрикс24/ }).first().click();
await page.waitForSelector('.modal');
await page.locator('#task-title').fill('Проверить наставника и провести 1:1');
await page.getByRole('button', { name: 'Создать задачу' }).click();
await page.waitForTimeout(300);
const toast = await page.locator('.toast').innerText();
const hasNewTask = await page.locator('.task-title', { hasText: 'Проверить наставника' }).count();
await page.screenshot({ path: out('task-created.png'), fullPage: false });
await page.getByRole('button', { name: 'Закрыть карточку' }).click();

await page.getByRole('button', { name: /Аналитика 90 дней/ }).click();
await page.waitForSelector('.analytics-grid');
const analyticsText = (await page.locator('.page').innerText()).slice(0, 500);
await page.screenshot({ path: out('analytics.png'), fullPage: false });

const overflow = await page.evaluate(() => ({
  innerWidth: window.innerWidth,
  scrollWidth: document.documentElement.scrollWidth,
  hasOverflow: document.documentElement.scrollWidth > window.innerWidth + 1,
}));

console.log(
  JSON.stringify({ errors, metrics, redRows, toast, hasNewTask, analyticsText, overflow }, null, 2),
);
await browser.close();
