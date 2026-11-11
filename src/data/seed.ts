import type {
  Activity,
  AppState,
  CheckIn,
  Department,
  Mentor,
  Newcomer,
  RoleKey,
  Task,
} from '../types';
import { addDays, todayISO } from '../lib/dates';
import { templatesFor } from './templates';

export const STORAGE_KEY = 'novichok-90-demo-v1';
export const STATE_VERSION = 1;

export const mentors: Mentor[] = [
  {
    id: 'm-volkov',
    name: 'Дмитрий Волков',
    role: 'Кладовщик',
    location: 'Склад «Восток»',
    active: true,
    load: 2,
  },
  {
    id: 'm-orlov',
    name: 'Павел Орлов',
    role: 'Продавец-консультант',
    location: 'ТЦ Арена',
    active: true,
    load: 2,
  },
  {
    id: 'm-morozov',
    name: 'Алексей Морозов',
    role: 'Менеджер B2B',
    location: 'Офис на Московской',
    active: true,
    load: 1,
  },
  {
    id: 'm-romanova',
    name: 'Светлана Романова',
    role: 'Кассир',
    location: 'Спорт-Парк на Ленина',
    active: true,
    load: 2,
  },
  {
    id: 'm-sokolova',
    name: 'Мария Соколова',
    role: 'Специалист офиса',
    location: 'Офис на Московской',
    active: true,
    load: 1,
  },
  {
    id: 'm-lebedev',
    name: 'Игорь Лебедев',
    role: 'Водитель-экспедитор',
    location: 'Склад «Восток»',
    active: false,
    load: 0,
  },
  {
    id: 'm-frolova',
    name: 'Наталья Фролова',
    role: 'Продавец-консультант',
    location: 'ТЦ Северный',
    active: true,
    load: 1,
  },
];

interface SeedNewcomer {
  id: string;
  name: string;
  roleKey: RoleKey;
  roleTitle: string;
  department: Department;
  location: string;
  manager: string;
  mentorId: string | null;
  startOffset: number;
  source: string;
  openTasks: string[];
  missedCheckIns: Array<7 | 30 | 60 | 90>;
  moods: Partial<Record<7 | 30 | 60 | 90, number>>;
  notes?: Partial<Record<7 | 30 | 60 | 90, string>>;
  blockers?: Partial<Record<7 | 30 | 60 | 90, string[]>>;
  lastOneOnOneOffset: number | null;
  lastMentorOffset: number | null;
}

const seedNewcomers: SeedNewcomer[] = [
  {
    id: 'n-marina',
    name: 'Марина Ковалёва',
    roleKey: 'sales',
    roleTitle: 'Продавец-консультант',
    department: 'Магазины',
    location: 'Спорт-Парк на Ленина',
    manager: 'Ольга Смирнова',
    mentorId: null,
    startOffset: 12,
    source: 'HH.ru',
    openTasks: ['common-access', 'sales-cash'],
    missedCheckIns: [7],
    moods: {},
    lastOneOnOneOffset: null,
    lastMentorOffset: null,
  },
  {
    id: 'n-artem',
    name: 'Артём Соколов',
    roleKey: 'warehouse',
    roleTitle: 'Кладовщик',
    department: 'Склад',
    location: 'Склад «Восток»',
    manager: 'Сергей Кузнецов',
    mentorId: 'm-volkov',
    startOffset: 26,
    source: 'Авито',
    openTasks: ['warehouse-safety'],
    missedCheckIns: [],
    moods: { 7: 4 },
    notes: {
      7: 'Разобрался с адресным хранением, но по ТБ остались вопросы.',
    },
    lastOneOnOneOffset: 8,
    lastMentorOffset: 20,
  },
  {
    id: 'n-daria',
    name: 'Дарья Лебедева',
    roleKey: 'b2b',
    roleTitle: 'Менеджер B2B',
    department: 'Отдел продаж',
    location: 'Офис на Московской',
    manager: 'Ирина Попова',
    mentorId: 'm-morozov',
    startOffset: 5,
    source: 'Рекомендация',
    openTasks: [],
    missedCheckIns: [],
    moods: {},
    lastOneOnOneOffset: 2,
    lastMentorOffset: 2,
  },
  {
    id: 'n-nikita',
    name: 'Никита Егоров',
    roleKey: 'sales',
    roleTitle: 'Продавец-консультант',
    department: 'Магазины',
    location: 'ТЦ Арена',
    manager: 'Ольга Смирнова',
    mentorId: 'm-orlov',
    startOffset: 47,
    source: 'HH.ru',
    openTasks: ['sales-assortment', 'sales-service'],
    missedCheckIns: [],
    moods: { 7: 4, 30: 2 },
    notes: {
      30: 'Много работы на кассе, не хватает времени на обучение. Сомневаюсь, что это моё.',
    },
    blockers: { 30: ['Нагрузка', 'Ожидания'] },
    lastOneOnOneOffset: 18,
    lastMentorOffset: 18,
  },
  {
    id: 'n-alina',
    name: 'Алина Гусева',
    roleKey: 'cashier',
    roleTitle: 'Кассир',
    department: 'Магазины',
    location: 'Спорт-Парк на Ленина',
    manager: 'Ольга Смирнова',
    mentorId: 'm-romanova',
    startOffset: 68,
    source: 'Авито',
    openTasks: [],
    missedCheckIns: [],
    moods: { 7: 4, 30: 5, 60: 5 },
    notes: {
      30: 'Уверенно работаю на кассе, помогаю новым коллегам.',
      60: 'Хочу остаться в команде, готова брать больше смен.',
    },
    lastOneOnOneOffset: 5,
    lastMentorOffset: 5,
  },
  {
    id: 'n-ilya',
    name: 'Илья Фролов',
    roleKey: 'warehouse',
    roleTitle: 'Комплектовщик',
    department: 'Склад',
    location: 'Склад «Восток»',
    manager: 'Сергей Кузнецов',
    mentorId: 'm-lebedev',
    startOffset: 81,
    source: 'HH.ru',
    openTasks: [],
    missedCheckIns: [],
    moods: { 7: 4, 30: 4, 60: 3 },
    notes: {
      60: 'Наставник уволился, новые задачи приходится разбирать самому.',
    },
    blockers: { 60: ['Процессы'] },
    lastOneOnOneOffset: 30,
    lastMentorOffset: 30,
  },
  {
    id: 'n-sofia',
    name: 'Софья Титова',
    roleKey: 'office',
    roleTitle: 'Маркетолог',
    department: 'Офис',
    location: 'Офис на Московской',
    manager: 'Анна Воронова',
    mentorId: 'm-sokolova',
    startOffset: 33,
    source: 'Рекомендация',
    openTasks: [],
    missedCheckIns: [],
    moods: { 7: 4, 30: 4 },
    notes: {
      30: 'Поняла, как устроены категории и сезонность. Нравится темп.',
    },
    lastOneOnOneOffset: 7,
    lastMentorOffset: 7,
  },
  {
    id: 'n-maxim',
    name: 'Максим Белов',
    roleKey: 'sales',
    roleTitle: 'Продавец-консультант',
    department: 'Магазины',
    location: 'ТЦ Арена',
    manager: 'Ольга Смирнова',
    mentorId: 'm-orlov',
    startOffset: 9,
    source: 'Авито',
    openTasks: [],
    missedCheckIns: [],
    moods: { 7: 4 },
    lastOneOnOneOffset: 3,
    lastMentorOffset: 3,
  },
  {
    id: 'n-elena',
    name: 'Елена Крылова',
    roleKey: 'office',
    roleTitle: 'Бухгалтер',
    department: 'Офис',
    location: 'Офис на Московской',
    manager: 'Анна Воронова',
    mentorId: 'm-sokolova',
    startOffset: 58,
    source: 'HH.ru',
    openTasks: ['office-project'],
    missedCheckIns: [],
    moods: { 7: 4, 30: 3 },
    notes: {
      30: 'Много рутины, но справляюсь. Нужна помощь с закрытием месяца.',
    },
    blockers: { 30: ['Процессы'] },
    lastOneOnOneOffset: 25,
    lastMentorOffset: 25,
  },
  {
    id: 'n-roman',
    name: 'Роман Зайцев',
    roleKey: 'warehouse',
    roleTitle: 'Кладовщик',
    department: 'Склад',
    location: 'Склад «Восток»',
    manager: 'Сергей Кузнецов',
    mentorId: 'm-volkov',
    startOffset: 3,
    source: 'Авито',
    openTasks: [],
    missedCheckIns: [],
    moods: {},
    lastOneOnOneOffset: 1,
    lastMentorOffset: 1,
  },
  {
    id: 'n-victoria',
    name: 'Виктория Павлова',
    roleKey: 'sales',
    roleTitle: 'Продавец-консультант',
    department: 'Магазины',
    location: 'ТЦ Северный',
    manager: 'Марина Фомина',
    mentorId: 'm-frolova',
    startOffset: 22,
    source: 'HH.ru',
    openTasks: [],
    missedCheckIns: [],
    moods: { 7: 5 },
    notes: { 7: 'Отличная первая неделя, быстро нашла контакт с командой.' },
    lastOneOnOneOffset: 6,
    lastMentorOffset: 6,
  },
  {
    id: 'n-kirill',
    name: 'Кирилл Семёнов',
    roleKey: 'office',
    roleTitle: 'Менеджер по закупкам',
    department: 'Офис',
    location: 'Офис на Московской',
    manager: 'Ирина Попова',
    mentorId: 'm-morozov',
    startOffset: 74,
    source: 'HH.ru',
    openTasks: ['office-project'],
    missedCheckIns: [60],
    moods: { 7: 4, 30: 2 },
    notes: {
      30: 'Ожидал большего влияния на ассортимент. Пока много согласований.',
    },
    blockers: { 30: ['Ожидания', 'Процессы'] },
    lastOneOnOneOffset: 35,
    lastMentorOffset: 35,
  },
  {
    id: 'n-polina',
    name: 'Полина Орлова',
    roleKey: 'sales',
    roleTitle: 'Продавец-консультант',
    department: 'Магазины',
    location: 'ТЦ Северный',
    manager: 'Марина Фомина',
    mentorId: 'm-frolova',
    startOffset: 88,
    source: 'Рекомендация',
    openTasks: [],
    missedCheckIns: [],
    moods: { 7: 5, 30: 5, 60: 4 },
    notes: {
      60: 'Уже сама обучаю стажёров на смене. Готова закрыть испытательный.',
    },
    lastOneOnOneOffset: 4,
    lastMentorOffset: 4,
  },
  {
    id: 'n-timur',
    name: 'Тимур Ахметов',
    roleKey: 'driver',
    roleTitle: 'Водитель-экспедитор',
    department: 'Склад',
    location: 'Склад «Восток»',
    manager: 'Сергей Кузнецов',
    mentorId: 'm-volkov',
    startOffset: 15,
    source: 'Авито',
    openTasks: ['driver-med'],
    missedCheckIns: [],
    moods: { 7: 4 },
    notes: {
      7: 'Маршруты понял, но медосмотр пока не прошёл — езжу с наставником.',
    },
    lastOneOnOneOffset: 4,
    lastMentorOffset: 4,
  },
];

const checkInDays: Array<7 | 30 | 60 | 90> = [7, 30, 60, 90];

function defaultCheckInNote(day: 7 | 30 | 60 | 90): string {
  if (day === 7) return 'Первая неделя прошла спокойно. Вопросы есть, наставник помогает.';
  if (day === 30) return 'Втянулся в процессы, беру больше задач самостоятельно.';
  if (day === 60) return 'Чувствую себя увереннее, понимаю приоритеты и зону ответственности.';
  return 'Готов работать самостоятельно, испытательный срок можно завершать.';
}

export function buildSeed(today = todayISO()): AppState {
  const newcomers: Newcomer[] = [];
  const tasks: Task[] = [];
  const checkIns: CheckIn[] = [];
  const activities: Activity[] = [];
  let taskCounter = 1200;

  for (const item of seedNewcomers) {
    const startDate = addDays(today, -item.startOffset);
    newcomers.push({
      id: item.id,
      name: item.name,
      roleKey: item.roleKey,
      roleTitle: item.roleTitle,
      department: item.department,
      location: item.location,
      manager: item.manager,
      mentorId: item.mentorId,
      startDate,
      source: item.source,
      lastOneOnOneAt:
        item.lastOneOnOneOffset === null ? null : addDays(today, -item.lastOneOnOneOffset),
      lastMentorMeetingAt:
        item.lastMentorOffset === null ? null : addDays(today, -item.lastMentorOffset),
    });

    for (const template of templatesFor(item.roleKey)) {
      const dueDate = addDays(startDate, template.dueOffset);
      const isOpen = item.openTasks.includes(template.id);
      const isPast = dueDate < today;
      const doneAt = isPast && !isOpen ? dueDate : null;
      taskCounter += 1;
      tasks.push({
        id: `t-${item.id}-${template.id}`,
        newcomerId: item.id,
        templateId: template.id,
        title: template.title,
        phase: template.phase,
        dueDate,
        owner: template.owner,
        critical: template.critical,
        doneAt,
        bitrixTaskId: `#${taskCounter}`,
      });
    }

    for (const day of checkInDays) {
      const dueDate = addDays(startDate, day);
      const isMissed = item.missedCheckIns.includes(day);
      const isPast = dueDate < today;
      const isDone = isPast && !isMissed;
      checkIns.push({
        id: `c-${item.id}-${day}`,
        newcomerId: item.id,
        day,
        dueDate,
        doneAt: isDone ? dueDate : null,
        mood: isDone ? item.moods[day] ?? 4 : null,
        note: isDone
          ? item.notes?.[day] ?? defaultCheckInNote(day)
          : isMissed
            ? 'Чек-ин не проведён.'
            : '',
        blockers: isDone ? item.blockers?.[day] ?? [] : [],
      });
    }

    activities.push({
      id: `a-${item.id}-hire`,
      newcomerId: item.id,
      type: 'hire',
      text: `Вышел на работу: ${item.roleTitle}, ${item.location}`,
      at: startDate,
    });

    for (const day of item.missedCheckIns) {
      activities.push({
        id: `a-${item.id}-missed-${day}`,
        newcomerId: item.id,
        type: 'risk',
        text: `Пропущен чек-ин ${day}-го дня`,
        at: addDays(startDate, day + 1),
      });
    }

    for (const [day, mood] of Object.entries(item.moods)) {
      if (mood !== undefined && mood <= 2) {
        activities.push({
          id: `a-${item.id}-mood-${day}`,
          newcomerId: item.id,
          type: 'checkin',
          text: `Чек-ин ${day}-го дня: оценка ${mood}/5`,
          at: addDays(startDate, Number(day)),
        });
      }
    }

    for (const templateId of item.openTasks) {
      const template = templatesFor(item.roleKey).find((entry) => entry.id === templateId);
      if (!template) continue;
      const dueDate = addDays(startDate, template.dueOffset);
      if (dueDate < today) {
        activities.push({
          id: `a-${item.id}-overdue-${templateId}`,
          newcomerId: item.id,
          type: 'task',
          text: `Просрочена задача: ${template.title}`,
          at: addDays(dueDate, 1),
        });
      }
    }
  }

  const ilya = newcomers.find((item) => item.id === 'n-ilya');
  if (ilya) {
    activities.push({
      id: 'a-ilya-mentor-left',
      newcomerId: 'n-ilya',
      type: 'risk',
      text: 'Наставник Игорь Лебедев уволился. Новичок остался без наставника.',
      at: addDays(today, -20),
    });
  }

  activities.push(
    {
      id: 'a-sync',
      newcomerId: null,
      type: 'sync',
      text: `Синхронизация с Битрикс24: ${newcomers.length} новичков, ${tasks.length} задач`,
      at: today,
    },
    {
      id: 'a-polina-plan',
      newcomerId: 'n-polina',
      type: 'checkin',
      text: '90-дневный чек-ин запланирован на конец испытательного срока',
      at: today,
    },
  );

  activities.sort((a, b) => (a.at < b.at ? 1 : -1));

  return {
    version: STATE_VERSION,
    seededAt: today,
    newcomers,
    tasks,
    checkIns,
    activities,
    mentors,
  };
}
