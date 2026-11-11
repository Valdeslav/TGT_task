import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import type {
  Activity,
  AppState,
  CheckIn,
  Newcomer,
  NewcomerDraft,
  NewcomerWithRisk,
  Task,
} from '../types';
import { STORAGE_KEY, STATE_VERSION, buildSeed, mentors } from '../data/seed';
import { templatesFor } from '../data/templates';
import { addDays, daysBetween, daysSince, todayISO } from '../lib/dates';
import { assessRisk } from '../lib/risk';

interface ToastState {
  id: number;
  message: string;
  detail?: string;
}

interface StoreValue {
  state: AppState;
  newcomers: NewcomerWithRisk[];
  today: string;
  toast: ToastState | null;
  showToast: (message: string, detail?: string) => void;
  assignMentor: (newcomerId: string, mentorId: string) => void;
  completeCheckIn: (
    newcomerId: string,
    day: 7 | 30 | 60 | 90,
    mood: number,
    note: string,
    blockers: string[],
  ) => void;
  toggleTask: (taskId: string) => void;
  createTask: (
    newcomerId: string,
    data: { title: string; dueDate: string; owner: Task['owner']; critical: boolean },
  ) => string;
  addNote: (newcomerId: string, text: string) => void;
  addNewcomer: (draft: NewcomerDraft) => string;
  sync: () => void;
  resetDemo: () => void;
  activityFor: (newcomerId: string) => Activity[];
  tasksFor: (newcomerId: string) => Task[];
  checkInsFor: (newcomerId: string) => CheckIn[];
}

const StoreContext = createContext<StoreValue | null>(null);

function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AppState;
      if (parsed.version === STATE_VERSION && Array.isArray(parsed.newcomers)) {
        return parsed;
      }
    }
  } catch {
    // localStorage может быть недоступен — демо продолжит работать в памяти.
  }
  return buildSeed();
}

function nextActivityId(): string {
  return `a-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function nextBitrixId(tasks: Task[]): string {
  const max = tasks.reduce((current, task) => {
    const value = Number(task.bitrixTaskId?.replace('#', '') ?? 0);
    return Number.isFinite(value) ? Math.max(current, value) : current;
  }, 1200);
  return `#${max + 1}`;
}

function phaseForDay(day: number): Task['phase'] {
  if (day <= 1) return 'day1';
  if (day <= 7) return 'week1';
  if (day <= 30) return 'day30';
  if (day <= 60) return 'day60';
  return 'day90';
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppState>(loadState);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimer = useRef<number | null>(null);
  const today = todayISO();

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Демо не должно падать из-за приватного режима браузера.
    }
  }, [state]);

  useEffect(() => {
    return () => {
      if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    };
  }, []);

  const showToast = useCallback((message: string, detail?: string) => {
    if (toastTimer.current !== null) window.clearTimeout(toastTimer.current);
    setToast({ id: Date.now(), message, detail });
    toastTimer.current = window.setTimeout(() => setToast(null), 4200);
  }, []);

  const addActivity = useCallback(
    (activities: Activity[], activity: Omit<Activity, 'id' | 'at'> & { at?: string }): Activity[] => {
      return [
        {
          ...activity,
          id: nextActivityId(),
          at: activity.at ?? todayISO(),
        },
        ...activities,
      ];
    },
    [],
  );

  const assignMentor = useCallback(
    (newcomerId: string, mentorId: string) => {
      setState((current) => {
        const mentor = mentors.find((item) => item.id === mentorId);
        const newcomer = current.newcomers.find((item) => item.id === newcomerId);
        if (!mentor || !newcomer) return current;
        const updated = current.newcomers.map((item) =>
          item.id === newcomerId
            ? {
                ...item,
                mentorId,
                lastMentorMeetingAt: todayISO(),
              }
            : item,
        );
        const bitrixTaskId = nextBitrixId(current.tasks);
        const introTask: Task = {
          id: `t-${newcomerId}-mentor-intro-${Date.now()}`,
          newcomerId,
          templateId: 'action-mentor-intro',
          title: `Познакомиться с наставником: ${mentor.name}`,
          phase: 'week1',
          dueDate: addDays(todayISO(), 1),
          owner: 'Наставник',
          critical: false,
          doneAt: null,
          bitrixTaskId,
        };
        const activities = addActivity(current.activities, {
          newcomerId,
          type: 'mentor',
          text: `Наставник назначен: ${mentor.name}. Задача ${bitrixTaskId} создана в Битрикс24.`,
        });
        return {
          ...current,
          newcomers: updated,
          tasks: [...current.tasks, introTask],
          activities,
        };
      });
      const mentor = mentors.find((item) => item.id === mentorId);
      showToast(
        `Наставник назначен: ${mentor?.name ?? ''}`,
        'Задача на знакомство создана в Битрикс24',
      );
    },
    [addActivity, showToast],
  );

  const completeCheckIn = useCallback(
    (
      newcomerId: string,
      day: 7 | 30 | 60 | 90,
      mood: number,
      note: string,
      blockers: string[],
    ) => {
      setState((current) => {
        const newcomer = current.newcomers.find((item) => item.id === newcomerId);
        if (!newcomer) return current;
        const checkIns = current.checkIns.map((checkIn) =>
          checkIn.newcomerId === newcomerId && checkIn.day === day
            ? {
                ...checkIn,
                doneAt: todayISO(),
                mood,
                note,
                blockers,
              }
            : checkIn,
        );
        const newcomers = current.newcomers.map((item) =>
          item.id === newcomerId ? { ...item, lastOneOnOneAt: todayISO() } : item,
        );
        const activities = addActivity(current.activities, {
          newcomerId,
          type: 'checkin',
          text: `Чек-ин ${day}-го дня пройден: ${mood}/5${note ? ` — «${note}»` : ''}`,
        });
        return { ...current, checkIns, newcomers, activities };
      });
      showToast(`Чек-ин ${day}-го дня закрыт`, 'Оценка и заметка сохранены');
    },
    [addActivity, showToast],
  );

  const toggleTask = useCallback(
    (taskId: string) => {
      setState((current) => {
        const task = current.tasks.find((item) => item.id === taskId);
        if (!task) return current;
        const willBeDone = !task.doneAt;
        const tasks = current.tasks.map((item) =>
          item.id === taskId
            ? { ...item, doneAt: willBeDone ? todayISO() : null }
            : item,
        );
        const activities = addActivity(current.activities, {
          newcomerId: task.newcomerId,
          type: 'task',
          text: willBeDone
            ? `Закрыта задача: ${task.title}`
            : `Задача возвращена в работу: ${task.title}`,
        });
        return { ...current, tasks, activities };
      });
    },
    [addActivity],
  );

  const createTask = useCallback(
    (
      newcomerId: string,
      data: { title: string; dueDate: string; owner: Task['owner']; critical: boolean },
    ) => {
      const bitrixTaskId = nextBitrixId(state.tasks);
      setState((current) => {
        const newcomer = current.newcomers.find((item) => item.id === newcomerId);
        if (!newcomer) return current;
        const day = Math.max(0, daysBetween(newcomer.startDate, data.dueDate));
        const task: Task = {
          id: `t-${newcomerId}-custom-${Date.now()}`,
          newcomerId,
          templateId: 'custom',
          title: data.title,
          phase: phaseForDay(day),
          dueDate: data.dueDate,
          owner: data.owner,
          critical: data.critical,
          doneAt: null,
          bitrixTaskId,
        };
        const activities = addActivity(current.activities, {
          newcomerId,
          type: 'task',
          text: `Создана задача ${bitrixTaskId} в Битрикс24: ${data.title}`,
        });
        return { ...current, tasks: [...current.tasks, task], activities };
      });
      return bitrixTaskId;
    },
    [addActivity, state.tasks],
  );

  const addNote = useCallback(
    (newcomerId: string, text: string) => {
      setState((current) => ({
        ...current,
        activities: addActivity(current.activities, {
          newcomerId,
          type: 'note',
          text,
        }),
      }));
      showToast('Заметка добавлена');
    },
    [addActivity, showToast],
  );

  const addNewcomer = useCallback(
    (draft: NewcomerDraft) => {
      const id = `n-${Date.now()}`;
      const startDate = draft.startDate;
      const day = Math.max(0, daysSince(startDate, todayISO()));
      const newTasks: Task[] = templatesFor(draft.roleKey).map((template, index) => {
        const dueDate = addDays(startDate, template.dueOffset);
        return {
          id: `t-${id}-${template.id}`,
          newcomerId: id,
          templateId: template.id,
          title: template.title,
          phase: template.phase,
          dueDate,
          owner: template.owner,
          critical: template.critical,
          doneAt: dueDate < todayISO() ? dueDate : null,
          bitrixTaskId: `#${1300 + index}`,
        };
      });
      const newCheckIns: CheckIn[] = ([7, 30, 60, 90] as const).map((checkInDay) => {
        const dueDate = addDays(startDate, checkInDay);
        const done = dueDate < todayISO();
        return {
          id: `c-${id}-${checkInDay}`,
          newcomerId: id,
          day: checkInDay,
          dueDate,
          doneAt: done ? dueDate : null,
          mood: done ? 4 : null,
          note: done ? 'Импортировано из Битрикс24.' : '',
          blockers: [],
        };
      });
      const newcomer: Newcomer = {
        id,
        name: draft.name,
        roleKey: draft.roleKey,
        roleTitle: draft.roleTitle,
        department: draft.department,
        location: draft.location,
        manager: draft.manager,
        mentorId: draft.mentorId,
        startDate,
        source: draft.source,
        lastOneOnOneAt: day > 0 ? addDays(todayISO(), -Math.min(day, 7)) : null,
        lastMentorMeetingAt: draft.mentorId
          ? addDays(todayISO(), -Math.min(day, 7))
          : null,
      };
      setState((current) => ({
        ...current,
        newcomers: [newcomer, ...current.newcomers],
        tasks: [...current.tasks, ...newTasks],
        checkIns: [...current.checkIns, ...newCheckIns],
        activities: addActivity(current.activities, {
          newcomerId: id,
          type: 'hire',
          text: `Добавлен новичок: ${draft.name}, ${draft.roleTitle}. План на 90 дней создан.`,
        }),
      }));
      showToast('Новичок добавлен', 'План на 90 дней и чек-ины созданы автоматически');
      return id;
    },
    [addActivity, showToast],
  );

  const sync = useCallback(() => {
    setState((current) => ({
      ...current,
      activities: addActivity(current.activities, {
        newcomerId: null,
        type: 'sync',
        text: `Синхронизация с Битрикс24: ${current.newcomers.length} новичков, ${current.tasks.length} задач`,
      }),
    }));
    showToast('Синхронизировано с Битрикс24', 'Демо-адаптер: данные не покидают браузер');
  }, [addActivity, showToast]);

  const resetDemo = useCallback(() => {
    setState(buildSeed());
    showToast('Демо-данные сброшены', 'Все изменения в браузере удалены');
  }, [showToast]);

  const newcomers = useMemo<NewcomerWithRisk[]>(() => {
    return state.newcomers
      .map((newcomer) => {
        const risk = assessRisk(newcomer, state.tasks, state.checkIns, state.mentors, today);
        return {
          ...newcomer,
          risk,
          day: Math.max(0, daysSince(newcomer.startDate, today)),
          mentor: state.mentors.find((mentor) => mentor.id === newcomer.mentorId) ?? null,
        };
      })
      .sort((a, b) => b.risk.score - a.risk.score);
  }, [state, today]);

  const activityFor = useCallback(
    (newcomerId: string) =>
      state.activities
        .filter((activity) => activity.newcomerId === newcomerId)
        .sort((a, b) => (a.at < b.at ? 1 : -1)),
    [state.activities],
  );

  const tasksFor = useCallback(
    (newcomerId: string) => state.tasks.filter((task) => task.newcomerId === newcomerId),
    [state.tasks],
  );

  const checkInsFor = useCallback(
    (newcomerId: string) =>
      state.checkIns
        .filter((checkIn) => checkIn.newcomerId === newcomerId)
        .sort((a, b) => a.day - b.day),
    [state.checkIns],
  );

  const value: StoreValue = {
    state,
    newcomers,
    today,
    toast,
    showToast,
    assignMentor,
    completeCheckIn,
    toggleTask,
    createTask,
    addNote,
    addNewcomer,
    sync,
    resetDemo,
    activityFor,
    tasksFor,
    checkInsFor,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore должен использоваться внутри StoreProvider');
  return context;
}
