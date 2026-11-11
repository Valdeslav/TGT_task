import type { Phase, RoleKey, TaskOwner } from '../types';

export interface TaskTemplate {
  id: string;
  title: string;
  phase: Phase;
  dueOffset: number;
  owner: TaskOwner;
  critical: boolean;
  roles: RoleKey[] | 'all';
}

export const PHASES: Array<{ id: Phase; label: string; short: string }> = [
  { id: 'day1', label: 'День 1', short: '01' },
  { id: 'week1', label: 'Первая неделя', short: '07' },
  { id: 'day30', label: 'До 30-го дня', short: '30' },
  { id: 'day60', label: 'До 60-го дня', short: '60' },
  { id: 'day90', label: 'До 90-го дня', short: '90' },
];

const common: TaskTemplate[] = [
  {
    id: 'common-docs',
    title: 'Оформить документы и подписать договор',
    phase: 'day1',
    dueOffset: 0,
    owner: 'HR',
    critical: true,
    roles: 'all',
  },
  {
    id: 'common-access',
    title: 'Выдать пропуск, доступы к 1С и CRM',
    phase: 'week1',
    dueOffset: 2,
    owner: 'HR',
    critical: true,
    roles: 'all',
  },
  {
    id: 'common-workplace',
    title: 'Подготовить рабочее место и экипировку',
    phase: 'day1',
    dueOffset: 1,
    owner: 'Руководитель',
    critical: false,
    roles: 'all',
  },
  {
    id: 'common-team',
    title: 'Познакомить с командой и показать точки',
    phase: 'day1',
    dueOffset: 1,
    owner: 'Руководитель',
    critical: false,
    roles: 'all',
  },
  {
    id: 'common-tb',
    title: 'Провести вводный инструктаж по охране труда',
    phase: 'week1',
    dueOffset: 2,
    owner: 'Руководитель',
    critical: true,
    roles: 'all',
  },
  {
    id: 'common-plan',
    title: 'Составить план адаптации на 30 дней',
    phase: 'week1',
    dueOffset: 5,
    owner: 'Руководитель',
    critical: false,
    roles: 'all',
  },
  {
    id: 'common-feedback',
    title: 'Собрать обратную связь по первой неделе',
    phase: 'week1',
    dueOffset: 7,
    owner: 'HR',
    critical: false,
    roles: 'all',
  },
  {
    id: 'common-mentor-feedback',
    title: 'Собрать обратную связь от наставника',
    phase: 'day30',
    dueOffset: 30,
    owner: 'HR',
    critical: false,
    roles: 'all',
  },
  {
    id: 'common-autonomy',
    title: 'Оценить самостоятельность и скорректировать план',
    phase: 'day60',
    dueOffset: 62,
    owner: 'Руководитель',
    critical: false,
    roles: 'all',
  },
  {
    id: 'common-probation',
    title: 'Принять решение по испытательному сроку',
    phase: 'day90',
    dueOffset: 90,
    owner: 'HR',
    critical: true,
    roles: 'all',
  },
];

const byRole: Record<RoleKey, TaskTemplate[]> = {
  sales: [
    {
      id: 'sales-assortment',
      title: 'Пройти обучение по ассортименту и брендам',
      phase: 'week1',
      dueOffset: 4,
      owner: 'Наставник',
      critical: false,
      roles: ['sales'],
    },
    {
      id: 'sales-cash',
      title: 'Стажировка на кассе и оформление продаж',
      phase: 'week1',
      dueOffset: 6,
      owner: 'Наставник',
      critical: true,
      roles: ['sales'],
    },
    {
      id: 'sales-service',
      title: 'Изучить стандарты сервиса и работу примерочной',
      phase: 'day30',
      dueOffset: 12,
      owner: 'Наставник',
      critical: true,
      roles: ['sales'],
    },
    {
      id: 'sales-solo',
      title: 'Провести самостоятельную смену под наблюдением',
      phase: 'day30',
      dueOffset: 21,
      owner: 'Руководитель',
      critical: false,
      roles: ['sales'],
    },
  ],
  warehouse: [
    {
      id: 'warehouse-safety',
      title: 'Инструктаж по ТБ и работе с погрузчиком',
      phase: 'week1',
      dueOffset: 3,
      owner: 'Руководитель',
      critical: true,
      roles: ['warehouse'],
    },
    {
      id: 'warehouse-topology',
      title: 'Изучить топологию склада и адресное хранение',
      phase: 'week1',
      dueOffset: 4,
      owner: 'Наставник',
      critical: false,
      roles: ['warehouse'],
    },
    {
      id: 'warehouse-tcd',
      title: 'Освоить ТСД и 1С:Склад',
      phase: 'day30',
      dueOffset: 10,
      owner: 'Наставник',
      critical: true,
      roles: ['warehouse'],
    },
    {
      id: 'warehouse-solo',
      title: 'Самостоятельная приёмка и отгрузка',
      phase: 'day30',
      dueOffset: 21,
      owner: 'Руководитель',
      critical: false,
      roles: ['warehouse'],
    },
  ],
  office: [
    {
      id: 'office-process',
      title: 'Изучить регламенты и ключевые процессы',
      phase: 'week1',
      dueOffset: 4,
      owner: 'Руководитель',
      critical: false,
      roles: ['office'],
    },
    {
      id: 'office-product',
      title: 'Пройти обучение по продукту и категориям',
      phase: 'day30',
      dueOffset: 14,
      owner: 'Наставник',
      critical: false,
      roles: ['office'],
    },
    {
      id: 'office-project',
      title: 'Выполнить первую самостоятельную задачу',
      phase: 'day60',
      dueOffset: 45,
      owner: 'Руководитель',
      critical: true,
      roles: ['office'],
    },
  ],
  b2b: [
    {
      id: 'b2b-crm',
      title: 'Изучить воронку B2B и CRM',
      phase: 'week1',
      dueOffset: 3,
      owner: 'Наставник',
      critical: true,
      roles: ['b2b'],
    },
    {
      id: 'b2b-product',
      title: 'Пройти обучение по продукту и категориям',
      phase: 'week1',
      dueOffset: 5,
      owner: 'Наставник',
      critical: false,
      roles: ['b2b'],
    },
    {
      id: 'b2b-calls',
      title: 'Совместные звонки и встречи с наставником',
      phase: 'day30',
      dueOffset: 12,
      owner: 'Наставник',
      critical: false,
      roles: ['b2b'],
    },
    {
      id: 'b2b-clients',
      title: 'Провести первых клиентов самостоятельно',
      phase: 'day30',
      dueOffset: 25,
      owner: 'Руководитель',
      critical: true,
      roles: ['b2b'],
    },
  ],
  cashier: [
    {
      id: 'cashier-cash',
      title: 'Пройти обучение по кассе и возвратам',
      phase: 'week1',
      dueOffset: 3,
      owner: 'Наставник',
      critical: true,
      roles: ['cashier'],
    },
    {
      id: 'cashier-assortment',
      title: 'Изучить ассортимент и размерные сетки',
      phase: 'week1',
      dueOffset: 5,
      owner: 'Наставник',
      critical: false,
      roles: ['cashier'],
    },
    {
      id: 'cashier-solo',
      title: 'Самостоятельная смена на кассе',
      phase: 'day30',
      dueOffset: 18,
      owner: 'Руководитель',
      critical: false,
      roles: ['cashier'],
    },
  ],
  driver: [
    {
      id: 'driver-med',
      title: 'Пройти медосмотр и инструктаж по ТБ',
      phase: 'week1',
      dueOffset: 2,
      owner: 'HR',
      critical: true,
      roles: ['driver'],
    },
    {
      id: 'driver-routes',
      title: 'Изучить маршруты и правила передачи товара',
      phase: 'week1',
      dueOffset: 4,
      owner: 'Наставник',
      critical: false,
      roles: ['driver'],
    },
    {
      id: 'driver-solo',
      title: 'Самостоятельный выезд с наставником',
      phase: 'day30',
      dueOffset: 14,
      owner: 'Руководитель',
      critical: false,
      roles: ['driver'],
    },
  ],
};

export function templatesFor(roleKey: RoleKey): TaskTemplate[] {
  return [...common, ...byRole[roleKey]];
}

export function phaseLabel(phase: Phase): string {
  return PHASES.find((item) => item.id === phase)?.label ?? phase;
}
