export type RoleKey = 'sales' | 'warehouse' | 'office' | 'b2b' | 'cashier' | 'driver';

export type PageId = 'pulse' | 'newcomers' | 'analytics';

export type Department = 'Магазины' | 'Склад' | 'Офис' | 'Отдел продаж';

export type Phase = 'day1' | 'week1' | 'day30' | 'day60' | 'day90';

export type TaskOwner = 'HR' | 'Руководитель' | 'Наставник' | 'Новичок';

export type RiskLevel = 'red' | 'yellow' | 'green';

export type ActivityType =
  | 'hire'
  | 'mentor'
  | 'task'
  | 'checkin'
  | 'note'
  | 'risk'
  | 'sync';

export interface Mentor {
  id: string;
  name: string;
  role: string;
  location: string;
  active: boolean;
  load: number;
}

export interface Newcomer {
  id: string;
  name: string;
  roleKey: RoleKey;
  roleTitle: string;
  department: Department;
  location: string;
  manager: string;
  mentorId: string | null;
  startDate: string;
  source: string;
  lastOneOnOneAt: string | null;
  lastMentorMeetingAt: string | null;
}

export interface Task {
  id: string;
  newcomerId: string;
  templateId: string;
  title: string;
  phase: Phase;
  dueDate: string;
  owner: TaskOwner;
  critical: boolean;
  doneAt: string | null;
  bitrixTaskId: string | null;
}

export interface CheckIn {
  id: string;
  newcomerId: string;
  day: 7 | 30 | 60 | 90;
  dueDate: string;
  doneAt: string | null;
  mood: number | null;
  note: string;
  blockers: string[];
}

export interface Activity {
  id: string;
  newcomerId: string | null;
  type: ActivityType;
  text: string;
  at: string;
}

export interface AppState {
  version: number;
  seededAt: string;
  newcomers: Newcomer[];
  tasks: Task[];
  checkIns: CheckIn[];
  activities: Activity[];
  mentors: Mentor[];
}

export interface RiskSignal {
  id: string;
  label: string;
  detail: string;
  points: number;
  tone: 'danger' | 'warning';
}

export interface RiskResult {
  score: number;
  level: RiskLevel;
  signals: RiskSignal[];
  topSignal: RiskSignal | null;
}

export interface NewcomerWithRisk extends Newcomer {
  risk: RiskResult;
  day: number;
  mentor: Mentor | null;
}

export interface NewcomerDraft {
  name: string;
  roleKey: RoleKey;
  roleTitle: string;
  department: Department;
  location: string;
  manager: string;
  mentorId: string | null;
  startDate: string;
  source: string;
}
