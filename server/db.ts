import fs from 'fs';
import path from 'path';

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
  questions: QuizQuestion[];
}

interface DatabaseSchema {
  users: User[];
  materials: Material[];
  tasks: Task[];
  quizzes: QuizRecord[];
}

const DB_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DB_DIR, 'nexus_database.json');

const INITIAL_USER_ID = 'student_001';

const INITIAL_DATA: DatabaseSchema = {
  users: [
    {
      id: INITIAL_USER_ID,
      email: 'alex.sterling@university.edu',
      name: 'Alex Sterling',
      course: 'Computer Science & Software Engineering',
      year: 'Year 3',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'student_002',
      email: 'elena.rostova@university.edu',
      name: 'Elena Rostova',
      course: 'Data Science & Artificial Intelligence',
      year: 'Year 2',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      createdAt: new Date().toISOString(),
    }
  ],
  materials: [
    {
      id: 'mat_001',
      userId: INITIAL_USER_ID,
      type: 'note',
      subject: 'Data Structures & Algorithms',
      topic: 'Graph Traversal (BFS & DFS)',
      content: 'Breadth-First Search (BFS) uses a Queue to traverse level by level, ideal for shortest paths in unweighted graphs with time complexity O(V + E). Depth-First Search (DFS) uses a Stack (or recursion) to explore paths down to leaves before backtracking, ideal for cycle detection and topological sorting.',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'mat_002',
      userId: INITIAL_USER_ID,
      type: 'note',
      subject: 'Database Systems',
      topic: 'ACID Properties & Transaction Isolation',
      content: 'ACID stands for Atomicity (all-or-nothing transactions), Consistency (state transitions obey constraints), Isolation (concurrent transactions execute independently without interference), and Durability (committed data survives system crashes via write-ahead logging). Isolation levels range from Read Uncommitted to Serializable.',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
    {
      id: 'mat_003',
      userId: INITIAL_USER_ID,
      type: 'file',
      subject: 'Computer Networks',
      topic: 'TCP vs UDP Protocols & 3-Way Handshake',
      content: 'Transmission Control Protocol (TCP) provides connection-oriented, reliable, ordered, and error-checked stream delivery using sequence numbers, ACKs, sliding window flow control, and congestion collapse prevention. The 3-way handshake is SYN, SYN-ACK, ACK.',
      fileName: 'Computer_Networks_Chapter_4_Transport.pdf',
      fileType: 'application/pdf',
      fileSize: 2450000,
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'mat_004',
      userId: INITIAL_USER_ID,
      type: 'file',
      subject: 'Operating Systems',
      topic: 'Virtual Memory & Page Replacement',
      content: 'Virtual memory separates user logical memory from physical memory via paging. Translation Lookaside Buffer (TLB) caches page table lookups. Page replacement algorithms include FIFO, LRU (Least Recently Used), and Clock/Second Chance. Thrashing occurs when a process spends more time paging than executing.',
      fileName: 'OS_Virtual_Memory_LectureNotes.docx',
      fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      fileSize: 1820000,
      createdAt: new Date().toISOString(),
    }
  ],
  tasks: [
    {
      id: 'task_001',
      userId: INITIAL_USER_ID,
      subject: 'Data Structures & Algorithms',
      topic: 'Implement Dijkstra and A* pathfinding algorithm',
      dueDate: new Date(Date.now() + 1 * 86400000).toISOString().split('T')[0],
      status: 'completed',
      source: 'manual',
      createdAt: new Date(Date.now() - 4 * 86400000).toISOString(),
    },
    {
      id: 'task_002',
      userId: INITIAL_USER_ID,
      subject: 'Database Systems',
      topic: 'Design normalized 3NF database schema for e-commerce',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      status: 'completed',
      source: 'manual',
      createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
    },
    {
      id: 'task_003',
      userId: INITIAL_USER_ID,
      subject: 'Computer Networks',
      topic: 'Analyze Wireshark packet capture of TCP handshake',
      dueDate: new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0],
      status: 'pending',
      source: 'ai_mission',
      createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    },
    {
      id: 'task_004',
      userId: INITIAL_USER_ID,
      subject: 'Operating Systems',
      topic: 'Solve 5 virtual memory paging practice questions',
      dueDate: new Date(Date.now() + 3 * 86400000).toISOString().split('T')[0],
      status: 'pending',
      source: 'manual',
      createdAt: new Date().toISOString(),
    }
  ],
  quizzes: [
    {
      id: 'quiz_001',
      userId: INITIAL_USER_ID,
      topic: 'Data Structures & Algorithms',
      difficulty: 'medium',
      questionsCount: 5,
      score: 5,
      totalQuestions: 5,
      completedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
      questions: []
    },
    {
      id: 'quiz_002',
      userId: INITIAL_USER_ID,
      topic: 'Database Systems',
      difficulty: 'hard',
      questionsCount: 4,
      score: 3,
      totalQuestions: 4,
      completedAt: new Date(Date.now() - 1 * 86400000).toISOString(),
      questions: []
    }
  ]
};

function ensureDb(): DatabaseSchema {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    if (!fs.existsSync(DB_FILE)) {
      fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DATA, null, 2), 'utf-8');
      return INITIAL_DATA;
    }
    const raw = fs.readFileSync(DB_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading DB, using initial data:', err);
    return INITIAL_DATA;
  }
}

function saveDb(data: DatabaseSchema): void {
  try {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving DB:', err);
  }
}

export const db = {
  // Users
  getUser(userId: string): User | undefined {
    const data = ensureDb();
    return data.users.find(u => u.id === userId);
  },
  getUserByEmail(email: string): User | undefined {
    const data = ensureDb();
    return data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  getAllUsers(): User[] {
    const data = ensureDb();
    return data.users;
  },
  createUser(user: Omit<User, 'createdAt'>): User {
    const data = ensureDb();
    const newUser: User = {
      ...user,
      createdAt: new Date().toISOString(),
    };
    data.users.push(newUser);
    saveDb(data);
    return newUser;
  },
  updateUser(userId: string, updates: Partial<User>): User | null {
    const data = ensureDb();
    const index = data.users.findIndex(u => u.id === userId);
    if (index === -1) return null;
    data.users[index] = { ...data.users[index], ...updates };
    saveDb(data);
    return data.users[index];
  },

  // Materials
  getMaterials(userId: string): Material[] {
    const data = ensureDb();
    return data.materials
      .filter(m => m.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  },
  getMaterialById(id: string, userId: string): Material | undefined {
    const data = ensureDb();
    return data.materials.find(m => m.id === id && m.userId === userId);
  },
  createMaterial(material: Omit<Material, 'id' | 'createdAt'>): Material {
    const data = ensureDb();
    const newMaterial: Material = {
      ...material,
      id: `mat_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    data.materials.unshift(newMaterial);
    saveDb(data);
    return newMaterial;
  },
  deleteMaterial(id: string, userId: string): boolean {
    const data = ensureDb();
    const initialLen = data.materials.length;
    data.materials = data.materials.filter(m => !(m.id === id && m.userId === userId));
    if (data.materials.length !== initialLen) {
      saveDb(data);
      return true;
    }
    return false;
  },

  // Tasks / Missions
  getTasks(userId: string): Task[] {
    const data = ensureDb();
    return data.tasks
      .filter(t => t.userId === userId)
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },
  createTask(task: Omit<Task, 'id' | 'createdAt'>): Task {
    const data = ensureDb();
    const newTask: Task = {
      ...task,
      id: `task_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
    };
    data.tasks.push(newTask);
    saveDb(data);
    return newTask;
  },
  updateTaskStatus(id: string, userId: string, status: 'pending' | 'completed'): Task | null {
    const data = ensureDb();
    const item = data.tasks.find(t => t.id === id && t.userId === userId);
    if (!item) return null;
    item.status = status;
    saveDb(data);
    return item;
  },
  deleteTask(id: string, userId: string): boolean {
    const data = ensureDb();
    const initialLen = data.tasks.length;
    data.tasks = data.tasks.filter(t => !(t.id === id && t.userId === userId));
    if (data.tasks.length !== initialLen) {
      saveDb(data);
      return true;
    }
    return false;
  },

  // Quizzes
  getQuizzes(userId: string): QuizRecord[] {
    const data = ensureDb();
    return data.quizzes
      .filter(q => q.userId === userId)
      .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime());
  },
  saveQuiz(quiz: Omit<QuizRecord, 'id' | 'completedAt'>): QuizRecord {
    const data = ensureDb();
    const newQuiz: QuizRecord = {
      ...quiz,
      id: `quiz_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      completedAt: new Date().toISOString(),
    };
    data.quizzes.unshift(newQuiz);
    saveDb(data);
    return newQuiz;
  },

  // Analytics summary for user
  getAnalytics(userId: string) {
    const materials = this.getMaterials(userId);
    const tasks = this.getTasks(userId);
    const quizzes = this.getQuizzes(userId);

    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const totalTasks = tasks.length;
    const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalQuizzes = quizzes.length;
    const totalScore = quizzes.reduce((sum, q) => sum + (q.score / (q.totalQuestions || 1)), 0);
    const quizAverage = totalQuizzes > 0 ? Math.round((totalScore / totalQuizzes) * 100) : 0;

    // Overall progress formula: weighted 50% task completion + 30% quiz score average + 20% materials study factor
    const materialsFactor = Math.min(100, materials.length * 15);
    const overallProgress = totalTasks === 0 && totalQuizzes === 0
      ? 0
      : Math.round(
          (taskCompletionRate * 0.5) +
          (quizAverage * 0.3) +
          (materialsFactor * 0.2)
        );

    // Subject breakdown
    const subjectMap: Record<string, { materials: number; tasks: number }> = {};
    materials.forEach(m => {
      if (!subjectMap[m.subject]) subjectMap[m.subject] = { materials: 0, tasks: 0 };
      subjectMap[m.subject].materials += 1;
    });
    tasks.forEach(t => {
      if (!subjectMap[t.subject]) subjectMap[t.subject] = { materials: 0, tasks: 0 };
      subjectMap[t.subject].tasks += 1;
    });

    return {
      completedTasks,
      totalTasks,
      quizzes: totalQuizzes,
      quizAverage,
      materials: materials.length,
      progress: Math.min(100, Math.max(0, overallProgress)),
      subjectCount: Object.keys(subjectMap).length,
      subjects: subjectMap,
    };
  }
};
