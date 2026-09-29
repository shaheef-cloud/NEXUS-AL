import { User, Material, Task, QuizRecord, QuizQuestion, AnalyticsData, RandomMission, ChatMessage } from './types';

// Stored current user ID in localStorage
export function getStoredUserId(): string {
  return localStorage.getItem('nexus_user_id') || 'student_001';
}

export function setStoredUserId(id: string): void {
  localStorage.setItem('nexus_user_id', id);
}

function getHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
    'x-user-id': getStoredUserId(),
  };
}

export const api = {
  // Session / Auth
  async getSession(): Promise<{ user: User; allUsers: User[] }> {
    const res = await fetch('/api/auth/session', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load session');
    return res.json();
  },

  async switchUser(userId: string): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/auth/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId }),
    });
    if (!res.ok) throw new Error('Failed to switch user');
    const data = await res.json();
    setStoredUserId(data.user.id);
    return data;
  },

  async googleLogin(payload: { email: string; name: string; avatar?: string }): Promise<{ success: boolean; user: User }> {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to login with Google');
    const data = await res.json();
    setStoredUserId(data.user.id);
    return data;
  },

  // Profile
  async getProfile(): Promise<User> {
    const res = await fetch('/api/profile', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load profile');
    return res.json();
  },

  async updateProfile(updates: Partial<User>): Promise<User> {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(updates),
    });
    if (!res.ok) throw new Error('Failed to update profile');
    return res.json();
  },

  // Materials / Knowledge Vault
  async getMaterials(query?: string): Promise<{
    materials: Material[];
    totalCount: number;
    notesCount: number;
    filesCount: number;
    subjectCount: number;
  }> {
    const url = query ? `/api/materials?q=${encodeURIComponent(query)}` : '/api/materials';
    const res = await fetch(url, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load materials');
    return res.json();
  },

  async createMaterial(payload: {
    type: 'note' | 'file';
    subject: string;
    topic: string;
    content: string;
    fileName?: string;
    fileType?: string;
    fileSize?: number;
  }): Promise<Material> {
    const res = await fetch('/api/materials', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save material');
    return res.json();
  },

  async deleteMaterial(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/materials/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete material');
    return res.json();
  },

  // Tasks / Missions
  async getTasks(): Promise<Task[]> {
    const res = await fetch('/api/tasks', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load missions');
    return res.json();
  },

  async createTask(payload: {
    subject: string;
    topic: string;
    dueDate: string;
    source?: 'manual' | 'ai_mission';
  }): Promise<Task> {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to create mission');
    return res.json();
  },

  async updateTaskStatus(id: string, status: 'pending' | 'completed'): Promise<Task> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'PATCH',
      headers: getHeaders(),
      body: JSON.stringify({ status }),
    });
    if (!res.ok) throw new Error('Failed to update mission');
    return res.json();
  },

  async deleteTask(id: string): Promise<{ success: boolean }> {
    const res = await fetch(`/api/tasks/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to delete mission');
    return res.json();
  },

  // AI Tutor
  async sendChatMessage(message: string, history: ChatMessage[]): Promise<{ reply: string }> {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error('AI Tutor unavailable at the moment');
    return res.json();
  },

  // AI Quiz Generator
  async generateQuiz(payload: {
    topic: string;
    count: number;
    difficulty: 'easy' | 'medium' | 'hard';
  }): Promise<{ topic: string; difficulty: string; questions: QuizQuestion[] }> {
    const res = await fetch('/api/quiz/generate', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to generate quiz');
    return res.json();
  },

  async saveQuizResults(payload: {
    topic: string;
    difficulty: string;
    questionsCount: number;
    score: number;
    totalQuestions: number;
    questions?: QuizQuestion[];
  }): Promise<QuizRecord> {
    const res = await fetch('/api/quiz/results', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('Failed to save quiz results');
    return res.json();
  },

  // Random AI Mission
  async getRandomMission(materialId?: string): Promise<RandomMission> {
    const res = await fetch('/api/mission/random', {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ materialId }),
    });
    if (!res.ok) throw new Error('Failed to generate random mission');
    return res.json();
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await fetch('/api/analytics', { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to load analytics');
    return res.json();
  },
};
