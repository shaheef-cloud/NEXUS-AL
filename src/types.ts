export interface User {
  id: string;
  email: string;
  name: string;
  course: string;
  year: string;
  avatar: string;
  createdAt: string;
}

export interface Material {
  id: string;
  userId: string;
  type: 'note' | 'file';
  subject: string;
  topic: string;
  content: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  createdAt: string;
}

export interface Task {
  id: string;
  userId: string;
  subject: string;
  topic: string;
  dueDate: string;
  status: 'pending' | 'completed';
  source?: 'manual' | 'ai_mission';
  createdAt: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizRecord {
  id: string;
  userId: string;
  topic: string;
  difficulty: 'easy' | 'medium' | 'hard';
  questionsCount: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
  questions?: QuizQuestion[];
}

export interface AnalyticsData {
  completedTasks: number;
  totalTasks: number;
  quizzes: number;
  quizAverage: number;
  materials: number;
  progress: number;
  subjectCount: number;
  subjects: Record<string, { materials: number; tasks: number }>;
}

export interface RandomMission {
  subject: string;
  topic: string;
  objective: string;
  estimatedMinutes: number;
  difficulty: string;
  materialId?: string | null;
  sourceMaterialTitle?: string;
  steps: string[];
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}
