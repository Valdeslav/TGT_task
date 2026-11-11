import { useMemo, useState } from 'react';
import { ArrowRight, Plus, Search, SlidersHorizontal, UserRound } from 'lucide-react';
import type { RiskLevel } from '../types';
import { useStore } from '../store/useStore';
import { Avatar } from '../components/Avatar';
import { RiskBadge } from '../components/RiskBadge';
import { AddNewcomerModal } from '../components/AddNewcomerModal';
import { nextAction } from '../lib/risk';

type StatusFilter = 'all' | RiskLevel;

const statusFilters: Array<{ id: StatusFilter; label: string }> = [
  { id: 'all', label: 'Все' },
  { id: 'red', label: 'Красная зона' },
  { id: 'yellow', label: 'Жёлтая зона' },
  { id: 'green', label: 'Зелёная зона' },
];

export function NewcomersPage({
  onOpenNewcomer,
}: {
  onOpenNewcomer: (id: string) => void;
}) {
  const { newcomers } = useStore();
  const [status, setStatus] = useState<StatusFilter>('all');
  const [department, setDepartment] = useState('all');
  const [query, setQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);

  const departments = useMemo(
    () => Array.from(new Set(newcomers.map((item) => item.department))),
    [newcomers],
  );

  const filtered = newcomers.filter((item) => {
    if (status !== 'all' && item.risk.level !== status) return false;
    if (department !== 'all' && item.department !== department) return false;
    const haystack = `${item.name} ${item.roleTitle} ${item.location} ${item.manager}`.toLowerCase();
    return haystack.includes(query.trim().toLowerCase());
  });

  const counts = {
    all: newcomers.length,
    red: newcomers.filter((item) => item.risk.level === 'red').length,
    yellow: newcomers.filter((item) => item.risk.level === 'yellow').length,
    green: newcomers.filter((item) => item.risk.level === 'green').length,
  };

  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">Все новички · первые 90 дней</div>
          <h1>Команда в адаптации</h1>
          <p className="page-sub">
            {newcomers.length} человек. В карточке — план, наставник, чек-ины и задачи,
            которые уже стоят в Битрикс24.
          </p>
        </div>
        <div className="page-actions">
          <button className="btn btn-primary" onClick={() => setAddOpen(true)}>
            <Plus size={16} />
            Добавить новичка
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="filter-chips" role="group" aria-label="Фильтр по риску">
          {statusFilters.map((item) => (
            <button
              key={item.id}
              className={`filter-chip ${status === item.id ? 'active' : ''}`}
              onClick={() => setStatus(item.id)}
            >
              {item.label}
              <span>{counts[item.id]}</span>
            </button>
          ))}
        </div>
        <div className="filters-right">
          <label className="search-box">
            <Search size={15} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Имя, роль, точка, руководитель"
              aria-label="Поиск новичка"
            />
          </label>
          <label className="select-box">
            <SlidersHorizontal size={15} />
            <select
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              aria-label="Подразделение"
            >
              <option value="all">Все подразделения</option>
              {departments.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <section className="card table-card">
        {filtered.length === 0 ? (
          <div className="empty-state large">
            <UserRound size={28} />
            <b>Никого не нашли</b>
            <span>Попробуйте изменить фильтры или добавить новичка.</span>
            <button
              className="btn btn-ghost"
              onClick={() => {
                setStatus('all');
                setDepartment('all');
                setQuery('');
              }}
            >
              Сбросить фильтры
            </button>
          </div>
        ) : (
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Новичок</th>
                  <th>Роль и точка</th>
                  <th>День</th>
                  <th>Наставник</th>
                  <th>Риск</th>
                  <th>Следующий шаг</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr key={item.id} onClick={() => onOpenNewcomer(item.id)}>
                    <td>
                      <div className="table-person">
                        <Avatar name={item.name} risk={item.risk.level} />
                        <div>
                          <div className="person-name">{item.name}</div>
                          <div className="person-meta">с {item.startDate.split('-').reverse().join('.')}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="table-main">{item.roleTitle}</div>
                      <div className="person-meta">{item.location}</div>
                    </td>
                    <td>
                      <span className="day-badge">{item.day}</span>
                      <span className="person-meta"> / 90</span>
                    </td>
                    <td>
                      {item.mentor ? (
                        <div>
                          <div className="table-main">{item.mentor.name}</div>
                          {!item.mentor.active && (
                            <div className="mentor-inactive">недоступен</div>
                          )}
                        </div>
                      ) : (
                        <span className="mentor-missing">не назначен</span>
                      )}
                    </td>
                    <td>
                      <RiskBadge level={item.risk.level} score={item.risk.score} />
                    </td>
                    <td>
                      <span className="next-action">{nextAction(item, item.risk)}</span>
                    </td>
                    <td>
                      <ArrowRight size={16} className="muted-icon" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="card-footer">
          <span>
            Показано {filtered.length} из {newcomers.length}
          </span>
          <span className="footer-note">
            <span className="bitrix-mini">Б</span> Задачи синхронизированы с Битрикс24
          </span>
        </div>
      </section>

      {addOpen && (
        <AddNewcomerModal
          onClose={() => setAddOpen(false)}
          onCreated={(id) => onOpenNewcomer(id)}
        />
      )}
    </div>
  );
}
