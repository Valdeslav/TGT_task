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
await page.getByRole('button', { name: /Разобрать/ }).click();
await page.waitForSelector('.drawer');
await page.screenshot({ path: out('drawer-before.png'), fullPage: false });

const riskBefore = await page.locator('.drawer-score b').innerText();
const signalsBefore = await page.locator('.signal-row').count();

await page.getByRole('button', { name: /Назначить наставника/ }).click();
await page.waitForSelector('.modal');
await page.getByRole('button', { name: /Светлана Романова/ }).click();
await page.getByRole('button', { name: 'Назначить', exact: true }).click();
await page.waitForTimeout(400);
const riskAfterMentor = await page.locator('.drawer-score b').innerText();
const mentorName = await page.locator('.drawer-meta div').nth(1).locator('b').innerText();

await page.locator('.drawer').getByRole('button', { name: /Провести чек-ин/ }).first().click();
await page.waitForSelector('.modal');
await page.getByRole('button', { name: /3 Нормально/ }).click();
await page.locator('#checkin-note').fill('Нужна помощь с кассой, пока неуверенно. С руководителем договорились о наставнике.');
await page.getByRole('button', { name: 'Сохранить чек-ин' }).click();
await page.waitForTimeout(400);
const riskAfterCheckIn = await page.locator('.drawer-score b').innerText();
await page.screenshot({ path: out('drawer-after.png'), fullPage: false });

await page.getByRole('button', { name: 'Закрыть карточку' }).click();
await page.waitForTimeout(250);
await page.screenshot({ path: out('dashboard-after.png'), fullPage: false });

console.log(
  JSON.stringify(
    {
      errors,
      riskBefore,
      signalsBefore,
      riskAfterMentor,
      mentorName,
      riskAfterCheckIn,
      dashboardText: (await page.locator('body').innerText()).slice(0, 900),
    },
    null,
    2,
  ),
);
await browser.close();
