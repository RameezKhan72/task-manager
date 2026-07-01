export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate: string; // YYYY-MM-DD
  completed: boolean;
  createdAt: string; // ISO String
}

export interface User {
  id: string;
  email: string;
  passwordHash: string; // Simulating simple encrypted or plain string
  name: string;
  createdAt: string;
}

export type SortField = 'dueDate' | 'createdAt' | 'priority' | 'title';
export type SortOrder = 'asc' | 'desc';

export interface CategorySpec {
  name: string;
  color: string; // Tailwind color class e.g., 'bg-blue-100 text-blue-700'
  dotColor: string; // Tailwind dot color e.g. 'bg-blue-500'
}

