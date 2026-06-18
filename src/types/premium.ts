export type Recurrence = 'none' | 'weekly' | 'monthly';

export type AppView = 'home' | 'focus' | 'eisenhower';

export type ThemeMode = 'light' | 'dark' | 'auto';

export type ResolvedTheme = 'light' | 'dark';

type PingSpace = 'user_a' | 'user_b' | 'shared';

export interface EncouragementPing {
  id: string;
  fromSpace: PingSpace;
  toSpace: PingSpace;
  taskTitle?: string;
  createdAt: string;
  read: boolean;
}

export interface PartnerActivity {
  space: PingSpace;
  taskTitle: string;
  at: string;
}
