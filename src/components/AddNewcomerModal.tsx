import { useState } from 'react';
import type { Department, NewcomerDraft, RoleKey } from '../types';
import { useStore } from '../store/useStore';
import { Modal } from './Modal';
import { todayISO } from '../lib/dates';

const roleDefaults: Record<RoleKey, { title: string; department: Department; location: string }> = {
  sales: {
    title: 'Продавец-консультант',
    department: 'Магазины',
    location: 'Спорт-Парк на Ленина',
  },
  warehouse: { title: 'Кладовщик', department: 'Склад', location: 'Склад «Восток»' },
  office: {
    title: 'Специалист офиса',
    department: 'Офис',
    location: 'Офис на Московской',
  },
  b2b: {
    title: 'Менеджер B2B',
    department: 'Отдел продаж',
    location: 'Офис на Московской',
  },
  cashier: { title: 'Кассир', department: 'Магазины', location: 'Спорт-Парк на Ленина' },
  driver: {
    title: 'Водитель-экспедитор',
    department: 'Склад',
    location: 'Склад «Восток»',
  },
};

const roleLabels: Record<RoleKey, string> = {
  sales: 'Продавец',
  warehouse: 'Склад',
  office: 'Офис',
  b2b: 'B2B-продажи',
  cashier: 'Касса',
  driver: 'Водитель',
};

const locations: Record<Department, string[]> = {
  Магазины: ['Спорт-Парк на Ленина', 'ТЦ Арена', 'ТЦ Северный'],
  Склад: ['Склад «Восток»'],
  Офис: ['Офис на Московской'],
  'Отдел продаж': ['Офис на Московской'],
};

const managers = [
  'Ольга Смирнова',
  'Сергей Кузнецов',
  'Ирина Попова',
  'Анна Воронова',
  'Марина Фомина',
];

export function AddNewcomerModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (id: string) => void;
}) {
  const { addNewcomer, state } = useStore();
  const [name, setName] = useState('');
  const [roleKey, setRoleKey] = useState<RoleKey>('sales');
  const [roleTitle, setRoleTitle] = useState(roleDefaults.sales.title);
  const [department, setDepartment] = useState<Department>(roleDefaults.sales.department);
  const [location, setLocation] = useState(roleDefaults.sales.location);
  const [manager, setManager] = useState(managers[0]);
  const [mentorId, setMentorId] = useState('');
  const [startDate, setStartDate] = useState(todayISO());
  const [source, setSource] = useState('HH.ru');
  const [error, setError] = useState('');

  const changeRole = (next: RoleKey) => {
    const defaults = roleDefaults[next];
    setRoleKey(next);
    setRoleTitle(defaults.title);
    setDepartment(defaults.department);
    setLocation(defaults.location);
  };

  const changeDepartment = (next: Department) => {
    setDepartment(next);
    setLocation(locations[next][0]);
  };

  const submit = () => {
    if (!name.trim()) {
      setError('Укажите имя новичка');
      return;
    }
    const draft: NewcomerDraft = {
      name: name.trim(),
      roleKey,
      roleTitle: roleTitle.trim() || roleDefaults[roleKey].title,
      department,
      location,
      manager,
      mentorId: mentorId || null,
      startDate,
      source,
    };
    const id = addNewcomer(draft);
    onCreated(id);
    onClose();
  };

  return (
    <Modal
      title="Добавить новичка"
      subtitle="План на 90 дней и чек-ины создадутся автоматически"
      onClose={onClose}
      footer={
        <>
          <button className="btn btn-ghost" onClick={onClose}>
            Отмена
          </button>
          <button className="btn btn-primary" onClick={submit}>
            Добавить и открыть
          </button>
        </>
      }
    >
      <div className="form-grid">
        <div className="field field-full">
          <label htmlFor="newcomer-name">ФИО</label>
          <input
            id="newcomer-name"
            className="input"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              setError('');
            }}
            placeholder="Например, Анна Смирнова"
            autoFocus
          />
          {error && <span className="field-error">{error}</span>}
        </div>

        <div className="field">
          <label htmlFor="newcomer-role">Тип роли</label>
          <select
            id="newcomer-role"
            className="input"
            value={roleKey}
            onChange={(event) => changeRole(event.target.value as RoleKey)}
          >
            {(Object.keys(roleDefaults) as RoleKey[]).map((key) => (
              <option key={key} value={key}>
                {roleLabels[key]}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="newcomer-title">Должность</label>
          <input
            id="newcomer-title"
            className="input"
            value={roleTitle}
            onChange={(event) => setRoleTitle(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="newcomer-department">Подразделение</label>
          <select
            id="newcomer-department"
            className="input"
            value={department}
            onChange={(event) => changeDepartment(event.target.value as Department)}
          >
            {(Object.keys(locations) as Department[]).map((key) => (
              <option key={key} value={key}>
                {key}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="newcomer-location">Точка</label>
          <select
            id="newcomer-location"
            className="input"
            value={location}
            onChange={(event) => setLocation(event.target.value)}
          >
            {locations[department].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="newcomer-manager">Руководитель</label>
          <select
            id="newcomer-manager"
            className="input"
            value={manager}
            onChange={(event) => setManager(event.target.value)}
          >
            {managers.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="newcomer-mentor">Наставник</label>
          <select
            id="newcomer-mentor"
            className="input"
            value={mentorId}
            onChange={(event) => setMentorId(event.target.value)}
          >
            <option value="">Не назначать</option>
            {state.mentors
              .filter((mentor) => mentor.active)
              .map((mentor) => (
                <option key={mentor.id} value={mentor.id}>
                  {mentor.name} · {mentor.role}
                </option>
              ))}
          </select>
        </div>

        <div className="field">
          <label htmlFor="newcomer-start">Дата выхода</label>
          <input
            id="newcomer-start"
            type="date"
            className="input"
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
        </div>

        <div className="field">
          <label htmlFor="newcomer-source">Источник</label>
          <select
            id="newcomer-source"
            className="input"
            value={source}
            onChange={(event) => setSource(event.target.value)}
          >
            <option>HH.ru</option>
            <option>Авито</option>
            <option>Рекомендация</option>
            <option>Другое</option>
          </select>
        </div>
      </div>
    </Modal>
  );
}
