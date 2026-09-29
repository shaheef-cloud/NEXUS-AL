import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type } from '@google/genai';
import { db } from './server/db.ts';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Initialize GoogleGenAI SDK safely
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;
if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
  try {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (err) {
    console.warn('Could not initialize GoogleGenAI with provided key:', err);
  }
}

// Current active session tracking
let currentUserId = 'student_001';

// Helper to get authenticated user
const getAuthUserId = (req: Request): string => {
  const headerUser = req.headers['x-user-id'] as string;
  if (headerUser && db.getUser(headerUser)) {
    return headerUser;
  }
  return currentUserId;
};

// ---------------- API ROUTES ----------------

// Auth / Session
app.get('/api/auth/session', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = db.getUser(userId) || db.getUser('student_001');
  const allUsers = db.getAllUsers();
  res.json({ user, allUsers });
});

app.post('/api/auth/switch', (req: Request, res: Response) => {
  const { userId } = req.body;
  const user = db.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  currentUserId = user.id;
  res.json({ success: true, user });
});

app.post('/api/auth/google', (req: Request, res: Response) => {
  const { email, name, avatar } = req.body;
  if (!email || !name) {
    return res.status(400).json({ error: 'Email and name are required' });
  }

  let existing = db.getUserByEmail(email);
  if (!existing) {
    existing = db.createUser({
      id: `google_${Date.now()}`,
      email,
      name,
      course: 'Computer Science',
      year: 'Year 1',
      avatar: avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    });
  }
  currentUserId = existing.id;
  res.json({ success: true, user: existing });
});

// Profile
app.get('/api/profile', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const user = db.getUser(userId);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

app.put('/api/profile', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { name, course, year, avatar } = req.body;
  const updated = db.updateUser(userId, { name, course, year, avatar });
  if (!updated) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(updated);
});

// Materials / Knowledge Vault
app.get('/api/materials', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const search = (req.query.q as string || '').toLowerCase().trim();
  let materials = db.getMaterials(userId);

  if (search) {
    materials = materials.filter(m =>
      m.subject.toLowerCase().includes(search) ||
      m.topic.toLowerCase().includes(search) ||
      m.content.toLowerCase().includes(search) ||
      (m.fileName && m.fileName.toLowerCase().includes(search))
    );
  }

  const notesCount = materials.filter(m => m.type === 'note').length;
  const filesCount = materials.filter(m => m.type === 'file').length;
  const uniqueSubjects = new Set(materials.map(m => m.subject)).size;

  res.json({
    materials,
    totalCount: materials.length,
    notesCount,
    filesCount,
    subjectCount: uniqueSubjects,
  });
});

app.post('/api/materials', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { type, subject, topic, content, fileName, fileType, fileSize } = req.body;

  if (!subject || !topic) {
    return res.status(400).json({ error: 'Subject and Topic are required' });
  }

  const created = db.createMaterial({
    userId,
    type: type === 'file' ? 'file' : 'note',
    subject: subject.trim(),
    topic: topic.trim(),
    content: (content || '').trim(),
    fileName: fileName ? fileName.trim() : undefined,
    fileType: fileType || undefined,
    fileSize: fileSize ? Number(fileSize) : undefined,
  });

  res.status(201).json(created);
});

app.delete('/api/materials/:id', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const success = db.deleteMaterial(req.params.id, userId);
  if (!success) {
    return res.status(404).json({ error: 'Material not found or access denied' });
  }
  res.json({ success: true, id: req.params.id });
});

// Tasks / Mission Planner
app.get('/api/tasks', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const tasks = db.getTasks(userId);
  res.json(tasks);
});

app.post('/api/tasks', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { subject, topic, dueDate, source } = req.body;

  if (!subject || !topic) {
    return res.status(400).json({ error: 'Subject and Topic are required' });
  }

  const task = db.createTask({
    userId,
    subject: subject.trim(),
    topic: topic.trim(),
    dueDate: dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
    status: 'pending',
    source: source === 'ai_mission' ? 'ai_mission' : 'manual',
  });

  res.status(201).json(task);
});

app.patch('/api/tasks/:id', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { status } = req.body;
  if (status !== 'pending' && status !== 'completed') {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const updated = db.updateTaskStatus(req.params.id, userId, status);
  if (!updated) {
    return res.status(404).json({ error: 'Task not found or unauthorized' });
  }
  res.json(updated);
});

app.delete('/api/tasks/:id', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const success = db.deleteTask(req.params.id, userId);
  if (!success) {
    return res.status(404).json({ error: 'Task not found or unauthorized' });
  }
  res.json({ success: true, id: req.params.id });
});

// Analytics
app.get('/api/analytics', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const analytics = db.getAnalytics(userId);
  res.json(analytics);
});

// AI Tutor Chat
app.post('/api/chat', async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { message, history } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  // If Gemini API is available
  if (ai) {
    try {
      // Build conversation context
      const studentMaterials = db.getMaterials(userId).slice(0, 5);
      const studentContext = studentMaterials.length > 0
        ? `The student is currently studying: ${studentMaterials.map(m => `${m.subject} (${m.topic})`).join('; ')}.`
        : '';

      const systemInstruction = `You are NEXUS AI, an elite educational tutor, mentor, and academic problem-solving assistant.
Your student is seeking your guidance.
Context: ${studentContext}
Guidelines:
1. Provide accurate, structured, conceptually rich explanations.
2. Use formatting, step-by-step points, bold terms, and code blocks with language tags when relevant.
3. Include intuitive analogies and practical real-world applications.
4. Conclude with a helpful check-for-understanding question or study tip.
5. Keep your tone encouraging, scholarly, professional, and clear.`;

      // Build contents
      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      if (Array.isArray(history)) {
        for (const item of history.slice(-6)) {
          if (item.sender === 'user') {
            contents.push({ role: 'user', parts: [{ text: item.text }] });
          } else if (item.sender === 'ai') {
            contents.push({ role: 'model', parts: [{ text: item.text }] });
          }
        }
      }

      contents.push({ role: 'user', parts: [{ text: message }] });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text || 'I have analyzed your query. Let me know if you would like to explore this concept further.';
      return res.json({ reply });
    } catch (err: any) {
      console.error('Gemini Chat Error:', err);
    }
  }

  // High quality educational fallback response
  const queryLower = message.toLowerCase();
  let fallbackReply = `**NEXUS AI Educational Tutor Response:**\n\nRegarding **"${message.trim()}"**:\n\n1. **Core Concept:** Understanding the fundamental principles is the key to mastering this topic.\n2. **Key Breakdown:**\n   - Identify the primary components and definitions.\n   - Trace how inputs transform into outputs or how causes lead to effects.\n   - Practice with concrete problems or sample edge cases.\n\n3. **Recommended Study Next Step:** Review your notes in the Knowledge Vault and try generating a quick 3-question AI Quiz to test your retention!`;

  if (queryLower.includes('recursion') || queryLower.includes('algorithm')) {
    fallbackReply = `**Understanding Recursion & Algorithmic Thinking:**\n\nRecursion solves problems by breaking them into smaller instances of the exact same problem.\n\nEvery recursive solution requires:\n1. **Base Case:** The condition where recursion stops (e.g. \`if (n <= 1) return 1;\`). Without this, you get a stack overflow.\n2. **Recursive Step:** Progressing towards the base case with a smaller input (e.g. \`return n * factorial(n - 1);\`).\n3. **Call Stack State:** Each call preserves its local scope on the execution stack.\n\nWould you like to trace a tree traversal or divide-and-conquer algorithm next?`;
  } else if (queryLower.includes('database') || queryLower.includes('sql') || queryLower.includes('acid')) {
    fallbackReply = `**Database Transactions & ACID Guarantees:**\n\nRelational databases maintain data integrity through ACID:\n- **Atomicity:** "All or Nothing". If one query in a transaction fails, everything rolls back.\n- **Consistency:** Transactions only transition the database between valid states adhering to constraints.\n- **Isolation:** Concurrent transactions don't produce dirty reads or race conditions.\n- **Durability:** Once committed, writes are written to WAL (Write-Ahead Logging) and survive crashes.\n\nTip: You can test this topic in the AI Quiz section!`;
  }

  return res.json({ reply: fallbackReply });
});

// AI Quiz Generator
app.post('/api/quiz/generate', async (req: Request, res: Response) => {
  const { topic, count, difficulty } = req.body;
  const numQuestions = Math.min(10, Math.max(1, Number(count) || 4));
  const diff = difficulty || 'medium';
  const topicName = (topic || 'General Science & Computing').trim();

  if (ai) {
    try {
      const prompt = `Generate an educational multiple-choice quiz of exactly ${numQuestions} questions about "${topicName}" at ${diff} difficulty.
Return strict JSON with an array of objects having:
- question: string
- options: array of 4 distinct string choices
- correctAnswer: integer (0, 1, 2, or 3) indicating the index of the correct option
- explanation: concise explanation of why the correct option is right.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                question: { type: Type.STRING },
                options: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                correctAnswer: { type: Type.INTEGER },
                explanation: { type: Type.STRING },
              },
              required: ['question', 'options', 'correctAnswer', 'explanation'],
            },
          },
        },
      });

      const parsed = JSON.parse(response.text || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) {
        return res.json({
          topic: topicName,
          difficulty: diff,
          questions: parsed,
        });
      }
    } catch (err: any) {
      console.error('Quiz Generation Error with Gemini:', err);
    }
  }

  // High quality educational fallback quiz
  const fallbackQuestions = [
    {
      question: `In the context of ${topicName}, what is the primary fundamental objective or core principle?`,
      options: [
        `Optimizing performance and correctness systematically`,
        `Completely eliminating the need for data structures`,
        `Bypassing memory safety protocols for convenience`,
        `Hardcoding all edge cases at initialization`,
      ],
      correctAnswer: 0,
      explanation: `Systematic optimization, correctness, and adherence to proven architectural principles form the cornerstone of ${topicName}.`,
    },
    {
      question: `When analyzing trade-offs in ${topicName}, what factor is typically prioritized for scalability?`,
      options: [
        `Asymptotic time and space complexity efficiency`,
        `Maximizing redundant network roundtrips`,
        `Ignoring concurrency constraints`,
        `Decreasing readability and testability`,
      ],
      correctAnswer: 0,
      explanation: `Evaluating algorithmic complexity (Big-O time and space) ensures systems scale predictably under high volume.`,
    },
    {
      question: `Which methodology represents best practice when verifying solutions in ${topicName}?`,
      options: [
        `Empirical validation with edge cases and rigorous boundary testing`,
        `Assuming correctness if it compiles once without syntax errors`,
        `Deploying directly to production without unit or integration tests`,
        `Disabling error checking to improve raw benchmark speed`,
      ],
      correctAnswer: 0,
      explanation: `Rigorous edge-case analysis and unit testing prevent subtle regression bugs and runtime crashes.`,
    },
    {
      question: `How does continuous review and modular decomposition benefit mastery of ${topicName}?`,
      options: [
        `It reduces cognitive load and isolates functional responsibilities`,
        `It multiplies dependencies across unrelated subsystems`,
        `It requires rewriting the complete architecture on every iteration`,
        `It replaces all conceptual documentation with guesswork`,
      ],
      correctAnswer: 0,
      explanation: `Modular decomposition separates concerns, making complex systems easier to comprehend, test, and maintain.`,
    },
  ];

  return res.json({
    topic: topicName,
    difficulty: diff,
    questions: fallbackQuestions.slice(0, numQuestions),
  });
});

// Save Quiz Results
app.post('/api/quiz/results', (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const { topic, difficulty, questionsCount, score, totalQuestions, questions } = req.body;

  const saved = db.saveQuiz({
    userId,
    topic: topic || 'General Topic',
    difficulty: difficulty || 'medium',
    questionsCount: Number(questionsCount) || Number(totalQuestions) || 4,
    score: Number(score) || 0,
    totalQuestions: Number(totalQuestions) || 4,
    questions: Array.isArray(questions) ? questions : [],
  });

  res.status(201).json(saved);
});

// Random AI Mission Generator
app.post('/api/mission/random', async (req: Request, res: Response) => {
  const userId = getAuthUserId(req);
  const materials = db.getMaterials(userId);

  if (materials.length === 0) {
    // Generate a foundational learning mission
    return res.json({
      subject: 'Academic Foundations',
      topic: 'Create your first study note in the Knowledge Vault',
      objective: 'Populate your Knowledge Vault with key course concepts so NEXUS AI can personalize your learning missions and quizzes.',
      estimatedMinutes: 20,
      difficulty: 'Easy',
      materialId: null,
      steps: [
        'Open the Knowledge Vault from the navigation bar',
        'Add a manual note or upload lecture notes/slides',
        'Return here to generate subject-tailored AI missions',
      ],
    });
  }

  // Select a random material or one passed in
  const requestedId = req.body.materialId;
  let selected = materials.find(m => m.id === requestedId);
  if (!selected) {
    selected = materials[Math.floor(Math.random() * materials.length)];
  }

  if (ai) {
    try {
      const prompt = `Based on this student learning material:
Subject: ${selected.subject}
Topic: ${selected.topic}
Content Summary: ${selected.content.slice(0, 1000)}

Create an engaging, actionable learning mission for the student.
Return strict JSON with:
- subject: string (the material's subject)
- topic: string (a punchy, actionable mission title like "Master BFS: Implement and Trace Shortest Path")
- objective: string (1-2 clear sentences explaining the learning outcome)
- estimatedMinutes: integer (e.g. 30, 45, 60)
- difficulty: string ("Easy" | "Medium" | "Hard")
- steps: array of 3 concise actionable steps`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              subject: { type: Type.STRING },
              topic: { type: Type.STRING },
              objective: { type: Type.STRING },
              estimatedMinutes: { type: Type.INTEGER },
              difficulty: { type: Type.STRING },
              steps: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
              },
            },
            required: ['subject', 'topic', 'objective', 'estimatedMinutes', 'difficulty', 'steps'],
          },
        },
      });

      const mission = JSON.parse(response.text || '{}');
      return res.json({
        ...mission,
        materialId: selected.id,
        sourceMaterialTitle: `${selected.subject} — ${selected.topic}`,
      });
    } catch (err: any) {
      console.error('Mission Generation Error with Gemini:', err);
    }
  }

  // Educational fallback mission tailored to the selected material
  const mission = {
    subject: selected.subject,
    topic: `Deep-Dive Mastery: ${selected.topic}`,
    objective: `Consolidate key concepts of ${selected.topic} through active recall, synthesizing core definitions, and applying them to problem scenarios.`,
    estimatedMinutes: 45,
    difficulty: 'Medium',
    materialId: selected.id,
    sourceMaterialTitle: `${selected.subject} — ${selected.topic}`,
    steps: [
      `Review key notes on "${selected.topic}" in your Knowledge Vault`,
      `Synthesize 3 primary principles and explain them aloud or write a 1-page summary`,
      `Generate and pass a 5-question AI Quiz on this topic with 80%+ score`,
    ],
  };

  return res.json(mission);
});

// ---------------- VITE / STATIC SERVING ----------------

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve('dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NEXUS AI Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
