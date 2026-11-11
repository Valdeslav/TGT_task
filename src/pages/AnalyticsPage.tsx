import {
  AlertTriangle,
  BarChart3,
  Clock3,
  Lightbulb,
  Target,
  TrendingDown,
  Users,
} from 'lucide-react';
import { KpiCard } from '../components/KpiCard';
import { SurvivalChart } from '../components/SurvivalChart';
import { useStore } from '../store/useStore';

const departmentLoss = [
  { label: 'Магазины', hires: 58, loss: 38, reason: 'Нагрузка и график' },
  { label: 'Склад', hires: 31, loss: 34, reason: 'Ожидания от работы' },
  { label: 'Офис', hires: 21, loss: 12, reason: 'Отношения с руководителем' },
  { label: 'Отдел продаж', hires: 18, loss: 16, reason: 'Не сошлись ожидания' },
];

const reasons = [
  { label: 'Не сошлись ожидания', value: 31, tone: 'ink' },
  { label: 'Нагрузка и темп', value: 24, tone: 'amber' },
  { label: 'Отношения с руководителем', value: 18, tone: 'red' },
  { label: 'График и дорога', value: 15, tone: 'muted' },
  { label: 'Другое', value: 12, tone: 'muted' },
];

const signals = [
  { label: 'Пропущен чек-ин', points: 24, note: '7, 30, 60 или 90-й день' },
  { label: 'Не назначен наставник', points: 22, note: 'дольше 3 дней' },
  { label: 'Низкая оценка на чек-ине', points: 20, note: '2/5 и ниже' },
  { label: 'Просрочена обязательная задача', points: 18, note: 'за каждую, максимум 36' },
  { label: 'Наставник недоступен', points: 16, note: 'уволился или в отпуске' },
  { label: 'Нет 1:1 с руководителем', points: 14, note: 'дольше 14 дней' },
  { label: 'Не закрыта первая неделя', points: 12, note: 'после 7-го дня' },
  { label: 'Наставник не встречался', points: 10, note: 'дольше 14 дней' },
];

export function AnalyticsPage() {
  const { newcomers } = useStore();
  const red = newcomers.filter((item) => item.risk.level === 'red').length;

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Аналитика · демо-данные за 12 месяцев</div>
          <h1>Где и когда мы теряем новичков</h1>
          <p className="page-sub">
            Не отчёт ради отчёта: цифры показывают, какие сигналы нужно ловить в первые
            30 дней, пока уход ещё можно предотвратить.
          </p>
        </div>
        <span className="demo-badge">128 увольнений · 400 человек</span>
      </div>

      <section className="kpi-grid" aria-label="Показатели удержания">
        <KpiCard
          label="Не доходят до 90 дней"
          value="33%"
          note="каждый третий ушедший"
          icon={<TrendingDown size={18} />}
          tone="red"
        />
        <KpiCard
          label="Пик потерь"
          value="8–21"
          note="день адаптации"
          icon={<Clock3 size={18} />}
          tone="amber"
        />
        <KpiCard
          label="В красной зоне сейчас"
          value={red}
          note={`из ${newcomers.length} новичков`}
          icon={<AlertTriangle size={18} />}
          tone="red"
        />
        <KpiCard
          label="Цель по выживаемости"
          value="80%"
          note="сейчас 67%"
          icon={<Target size={18} />}
          tone="green"
        />
      </section>

      <div className="analytics-grid">
        <section className="card">
          <div className="card-head">
            <div className="card-title">
              <BarChart3 size={18} />
              Кривая выживаемости
            </div>
            <span className="card-hint">когорта 12 месяцев</span>
          </div>
          <div className="card-body analytics-chart-body">
            <div className="analytics-chart-hero">
              <div>
                <span className="survival-big">67%</span>
                <span className="survival-caption">доходят до 90-го дня</span>
              </div>
              <div className="analytics-chart-stat">
                <b>−11 п.п.</b>
                <span>к цели 80%</span>
              </div>
            </div>
            <SurvivalChart />
            <div className="chart-legend">
              <span>
                <i className="legend-dot ink" /> факт
              </span>
              <span>
                <i className="legend-dot lime" /> цель 80%
              </span>
            </div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="card-title">
              <Users size={18} />
              Где теряем
            </div>
            <span className="card-hint">доля уходов</span>
          </div>
          <div className="card-body">
            <div className="department-list">
              {departmentLoss.map((item) => (
                <div className="department-row" key={item.label}>
                  <div className="department-top">
                    <span>{item.label}</span>
                    <b>{item.loss}%</b>
                  </div>
                  <div className="department-bar">
                    <span style={{ width: `${item.loss * 2.2}%` }} />
                  </div>
                  <div className="department-meta">
                    {item.hires} найма · чаще всего: {item.reason.toLowerCase()}
                  </div>
                </div>
              ))}
            </div>
            <div className="insight-box">
              <span className="insight-icon">
                <Lightbulb size={16} />
              </span>
              <span>
                <b>Склад и магазины — 72% всех уходов.</b> Там же больше всего новичков
                без наставника в первые две недели.
              </span>
            </div>
          </div>
        </section>
      </div>

      <div className="analytics-grid">
        <section className="card">
          <div className="card-head">
            <div className="card-title">Причины ухода до 90 дней</div>
            <span className="card-hint">из интервью и exit-форм</span>
          </div>
          <div className="card-body">
            <div className="reason-list large">
              {reasons.map((reason) => (
                <div className="reason-row" key={reason.label}>
                  <span>{reason.label}</span>
                  <b>{reason.value}%</b>
                  <span className="reason-bar">
                    <span
                      className={`reason-fill ${reason.tone}`}
                      style={{ width: `${reason.value * 2.6}%` }}
                    />
                  </span>
                </div>
              ))}
            </div>
            <p className="card-note">
              Ожидания и нагрузка — управляемые причины. Их можно ловить на 7-й и 14-й
              день, а не на выходном интервью.
            </p>
          </div>
        </section>

        <section className="card">
          <div className="card-head">
            <div className="card-title">Как считается риск</div>
            <span className="card-hint">прозрачные веса</span>
          </div>
          <div className="card-body">
            <div className="signal-table">
              {signals.map((signal) => (
                <div className="signal-table-row" key={signal.label}>
                  <span>
                    <b>{signal.label}</b>
                    <small>{signal.note}</small>
                  </span>
                  <span className="signal-points">+{signal.points}</span>
                </div>
              ))}
            </div>
            <p className="card-note">
              Красная зона — 50+ баллов, жёлтая — 25–49. Веса — гипотеза для демо; следующий
              шаг — откалибровать их на исторических уходах.
            </p>
          </div>
        </section>
      </div>

      <section className="insight-grid">
        <article className="insight-card">
          <span className="insight-number">01</span>
          <h3>Раньше сигнал — дешевле решение</h3>
          <p>
            На 8–21-й день новичок ещё не пишет заявление. Просроченный инструктаж и
            пропущенный 1:1 — это дешевле, чем закрывать вакансию заново.
          </p>
        </article>
        <article className="insight-card">
          <span className="insight-number">02</span>
          <h3>Один владелец — руководитель</h3>
          <p>
            HR видит красную зону, но действие делает руководитель или наставник. Поэтому
            система создаёт задачу в Битрикс24, а не просто показывает красивый дашборд.
          </p>
        </article>
        <article className="insight-card">
          <span className="insight-number">03</span>
          <h3>Не заменяем Битрикс24</h3>
          <p>
            Мы не переносим задачи в новый портал. Система читает задачи и чек-ины и
            возвращает в Битрикс24 конкретное действие с дедлайном.
          </p>
        </article>
      </section>
    </div>
  );
}
