import { chromium } from 'playwright-core';
import fs from 'node:fs';
import path from 'node:path';

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const browser = await chromium.launch({ executablePath: chromePath, headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  recordVideo: { dir: path.resolve('docs', 'video-raw'), size: { width: 1440, height: 900 } },
});
const page = await context.newPage();
const errors = [];
page.on('console', (message) => {
  if (message.type() === 'error') errors.push(message.text());
});
page.on('pageerror', (error) => errors.push(String(error)));

const wait = (ms) => page.waitForTimeout(ms);

async function caption(title, text) {
  await page.evaluate(
    ({ title, text }) => {
      let box = document.getElementById('demo-caption');
      if (!box) {
        box = document.createElement('div');
        box.id = 'demo-caption';
        box.innerHTML = '<b></b><span></span>';
        document.body.appendChild(box);
        const style = document.createElement('style');
        style.textContent = `
          #demo-caption {
            position: fixed; left: 50%; bottom: 28px; transform: translateX(-50%);
            z-index: 99999; pointer-events: none; max-width: 920px;
            background: rgba(16, 26, 21, 0.94); color: #f5f2e8;
            border: 1px solid rgba(203, 255, 60, 0.35); border-radius: 14px;
            padding: 14px 20px; box-shadow: 0 18px 50px rgba(0,0,0,0.35);
            font: 15px/1.4 "Segoe UI", system-ui, sans-serif;
          }
          #demo-caption b { display: block; color: #cbff3c; font-size: 18px; margin-bottom: 4px; }
          #demo-caption span { color: #d9ddd4; }
        `;
        document.head.appendChild(style);
      }
      box.querySelector('b').textContent = title;
      box.querySelector('span').textContent = text;
    },
    { title, text },
  );
}

await page.goto('http://127.0.0.1:5173', { waitUntil: 'networkidle' });

await caption(
  'Понедельник, 9:00',
  'HR-партнёр открывает «Пульс новичков»: 14 человек в адаптации, 3 — в красной зоне.',
);
await wait(2600);

await page.getByRole('button', { name: /Разобрать/ }).click();
await page.waitForSelector('.drawer');
await wait(600);
await caption(
  'Марина Ковалёва · день 12',
  'Риск 94: нет наставника, 2 просроченные обязательные задачи, пропущен чек-ин на 7-й день.',
);
await wait(3400);

await page.getByRole('button', { name: /Назначить наставника/ }).click();
await page.waitForSelector('.modal');
await wait(500);
await caption(
  'Действие №1 — наставник',
  'Выбираем Светлану Романову из того же магазина. Нагрузка — 2 новичка, ещё есть место.',
);
await wait(2600);
await page.getByRole('button', { name: /Светлана Романова/ }).click();
await wait(500);
await page.getByRole('button', { name: 'Назначить', exact: true }).click();
await wait(900);
await caption(
  'Риск 94 → 72',
  'Сигнал «нет наставника» убран. В Битрикс24 создана задача на знакомство со сроком «завтра».',
);
await wait(3400);

await page.locator('.drawer').getByRole('button', { name: /Провести чек-ин/ }).first().click();
await page.waitForSelector('.modal');
await wait(500);
await caption(
  'Действие №2 — чек-ин',
  'Настроение 3/5, блокер — касса. Фиксируем договорённость и следующий шаг.',
);
await wait(2400);
await page.getByRole('button', { name: /3 Нормально/ }).click();
await page
  .locator('#checkin-note')
  .fill('Нужна помощь с кассой, пока неуверенно. С руководителем договорились о наставнике.');
await wait(1200);
await page.getByRole('button', { name: 'Сохранить чек-ин' }).click();
await wait(900);
await caption(
  'Риск 72 → 48',
  'Красная зона снята. Новичок остаётся на контроле, но уже не горит.',
);
await wait(3400);

await page.getByRole('button', { name: 'Закрыть карточку' }).click();
await wait(700);
await caption(
  'Красных было 3 — осталось 2',
  'Следующий в очереди — Кирилл: 74 балла, пропущен чек-ин на 60-й день.',
);
await wait(3200);

await page
  .getByRole('navigation', { name: 'Разделы' })
  .getByRole('button', { name: 'Все новички' })
  .click();
await wait(800);
await caption(
  'Все новички',
  'Поиск и фильтры по риску, стажу и подразделению. Данные — синтетические.',
);
await wait(2800);

await page.getByRole('button', { name: /Аналитика 90 дней/ }).click();
await wait(800);
await caption(
  'Аналитика 90 дней',
  'Удержание по дням, причины ухода и прозрачные веса риск-модели — без «чёрного ящика».',
);
await wait(3400);

await page.getByRole('button', { name: /Пульс новичков/ }).click();
await wait(700);
await caption(
  'НОВИЧОК — первые 90 дней',
  'Не отчёт, а следующее действие. Демо-адаптер Битрикс24, данные не покидают браузер.',
);
await wait(3200);

const video = page.video();
await context.close();
await browser.close();

const raw = await video.path();
fs.mkdirSync(path.resolve('docs'), { recursive: true });
const target = path.resolve('docs', 'demo.webm');
fs.copyFileSync(raw, target);
fs.rmSync(path.dirname(raw), { recursive: true, force: true });
console.log(JSON.stringify({ target, errors }, null, 2));
