export interface Task {
  id: string;
  name: string;
  points: number;
  completedDates: string[]; // ISO strings (YYYY-MM-DD)
  icon?: string;
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  icon?: string;
  availableDays?: number[]; // 0-6 (Sunday-Saturday)
}

export interface HistoryEntry {
  date: string; // ISO string
  dateStr?: string; // YYYY-MM-DD local string
  points: number;
  reason: string;
  type: 'earn' | 'spend' | 'admin';
}

export interface AppState {
  children: ChildProfile[];
  pin: string;
  taskMode: 'single' | 'repeatable';
  maxDailyPoints: number;
  allowedEmails: string[];
}

export interface ChildProfile {
  id: string;
  name: string;
  theme: 'robots' | 'space' | 'dinosaurs' | 'princesses' | 'cars';
  totalPoints: number;
  tasks: Task[];
  rewards: Reward[];
  history: HistoryEntry[];
}
