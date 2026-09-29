import React, { useState, useEffect } from 'react';
import {
  CalendarCheck,
  CheckCircle2,
  Circle,
  Trash2,
  PlusCircle,
  Clock,
  Sparkles,
  Calendar as CalendarIcon,
  AlertCircle,
  Filter
} from 'lucide-react';
import { User, Task } from '../types';
import { api } from '../api';

interface PlannerViewProps {
  user: User | null;
  onTasksUpdated?: () => void;
}

export const PlannerView: React.FC<PlannerViewProps> = ({
  user,
  onTasksUpdated,
}) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [loading, setLoading] = useState<boolean>(true);

  // Form states
  const [subject, setSubject] = useState<string>('');
  const [topic, setTopic] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split('T')[0]
  );
  const [taskMessage, setTaskMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Load planner tasks
  const loadPlanner = async () => {
    try {
      setLoading(true);
      const data = await api.getTasks();
      setTasks(data);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlanner();
  }, [user?.id]);

  // Handle task submission
  const handleTaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !topic.trim()) {
      setTaskMessage({ text: 'Please specify both Subject and Mission Topic.', type: 'error' });
      return;
    }

    try {
      setIsSubmitting(true);
      setTaskMessage(null);
      await api.createTask({
        subject: subject.trim(),
        topic: topic.trim(),
        dueDate: dueDate || new Date(Date.now() + 86400000).toISOString().split('T')[0],
        source: 'manual',
      });

      setSubject('');
      setTopic('');
      setTaskMessage({ text: 'Mission successfully scheduled into planner!', type: 'success' });
      await loadPlanner();
      if (onTasksUpdated) onTasksUpdated();
      setTimeout(() => setTaskMessage(null), 3000);
    } catch (err) {
      setTaskMessage({ text: 'Failed to schedule mission. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle task status
  const toggleTask = async (id: string) => {
    const target = tasks.find((t) => t.id === id);
    if (!target) return;
    const newStatus = target.status === 'completed' ? 'pending' : 'completed';
    try {
      await api.updateTaskStatus(id, newStatus);
      await loadPlanner();
      if (onTasksUpdated) onTasksUpdated();
    } catch (err) {
      console.error('Failed to toggle task:', err);
    }
  };

  // Explicit complete task
  const completeTask = async (id: string) => {
    try {
      await api.updateTaskStatus(id, 'completed');
      await loadPlanner();
      if (onTasksUpdated) onTasksUpdated();
    } catch (err) {
      console.error('Failed to complete task:', err);
    }
  };

  // Delete task
  const deleteTask = async (id: string) => {
    try {
      await api.deleteTask(id);
      await loadPlanner();
      if (onTasksUpdated) onTasksUpdated();
    } catch (err) {
      console.error('Failed to delete task:', err);
    }
  };

  // Expose JavaScript functions for compatibility
  useEffect(() => {
    (window as any).toggleTask = (id: string) => toggleTask(id);
    (window as any).completeTask = (id: string) => completeTask(id);
    (window as any).deleteTask = (id: string) => deleteTask(id);
    (window as any).loadPlanner = () => loadPlanner();

    return () => {
      delete (window as any).toggleTask;
      delete (window as any).completeTask;
      delete (window as any).deleteTask;
      delete (window as any).loadPlanner;
    };
  }, [tasks]);

  const filteredTasks = tasks.filter((t) => {
    if (filter === 'pending') return t.status === 'pending';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const pendingCount = tasks.filter((t) => t.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#4d3c12] border border-slate-300/30 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
              <CalendarCheck className="w-4 h-4" />
              <span>Goal Tracking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 font-serif">Mission Planner</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Turn your coursework and revision milestones into actionable missions. Track completion and build consistent daily momentum.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-[#3e300c] border border-slate-300/20 rounded-lg px-4 py-2 text-center">
              <span className="text-xl font-bold text-amber-300 block">{pendingCount}</span>
              <span className="text-[11px] text-slate-300">Pending</span>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-lg px-4 py-2 text-center">
              <span className="text-xl font-bold text-emerald-400 block">{completedCount}</span>
              <span className="text-[11px] text-slate-300">Completed</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mission Creation Form (1 col) */}
        <div className="bg-[#523f11] border border-slate-300/30 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-300/20">
            <PlusCircle className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold text-slate-100 font-serif">Schedule New Mission</h2>
          </div>

          {taskMessage && (
            <div
              id="task-message"
              className={`mt-3 p-3 rounded-lg text-xs flex items-center gap-2 ${
                taskMessage.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/50 text-rose-300'
              }`}
            >
              {taskMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{taskMessage.text}</span>
            </div>
          )}

          <form id="task-form" onSubmit={handleTaskSubmit} className="mt-4 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Subject / Course</label>
              <input
                id="task-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Operating Systems"
                required
                className="w-full bg-[#40310c] border border-slate-300/30 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/80"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Mission Topic & Objective</label>
              <input
                id="task-topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Solve 5 scheduling algorithm problems"
                required
                className="w-full bg-[#40310c] border border-slate-300/30 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/80"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Due Date</label>
              <input
                id="task-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className="w-full bg-[#40310c] border border-slate-300/30 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-300/80"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 rounded-lg bg-[#614d16] hover:bg-[#735b1b] text-slate-100 font-semibold text-sm border border-slate-300/40 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? 'Scheduling...' : 'Add Mission'}
            </button>
          </form>
        </div>

        {/* Mission Listing (2 cols) */}
        <div className="lg:col-span-2 bg-[#523f11] border border-slate-300/30 rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-300/20">
              <h2 className="text-base font-bold text-slate-100 font-serif">Missions List</h2>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 bg-[#40310c] p-1 rounded-lg border border-slate-300/20 self-start sm:self-auto">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                    filter === 'all'
                      ? 'bg-[#5c4613] text-slate-100 font-semibold border border-slate-300/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({tasks.length})
                </button>
                <button
                  onClick={() => setFilter('pending')}
                  className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                    filter === 'pending'
                      ? 'bg-[#5c4613] text-slate-100 font-semibold border border-slate-300/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Pending ({pendingCount})
                </button>
                <button
                  onClick={() => setFilter('completed')}
                  className={`px-3 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                    filter === 'completed'
                      ? 'bg-[#5c4613] text-slate-100 font-semibold border border-slate-300/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Completed ({completedCount})
                </button>
              </div>
            </div>

            {/* Tasks List Container with exact id="tasks-list" */}
            <div id="tasks-list" className="mt-4 space-y-2.5">
              {loading ? (
                <div className="py-12 text-center text-slate-300 text-sm">Loading missions...</div>
              ) : filteredTasks.length > 0 ? (
                filteredTasks.map((task) => {
                  const isDone = task.status === 'completed';
                  return (
                    <div
                      key={task.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        isDone
                          ? 'bg-[#43340d]/60 border-slate-300/20 text-slate-400'
                          : 'bg-[#574413] border-slate-300/30 text-slate-100 hover:border-slate-300/50'
                      }`}
                    >
                      {/* Checkbox & Topic */}
                      <div className="flex items-center gap-3 min-w-0">
                        <button
                          onClick={() => toggleTask(task.id)}
                          className="cursor-pointer shrink-0 transition-transform active:scale-95"
                          title={isDone ? 'Mark as Pending' : 'Mark as Completed'}
                        >
                          {isDone ? (
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-400 hover:text-amber-300" />
                          )}
                        </button>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-[#40310c] text-amber-300 border border-slate-300/20">
                              {task.subject}
                            </span>
                            {task.source === 'ai_mission' && (
                              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" />
                                <span>AI Mission</span>
                              </span>
                            )}
                          </div>

                          <div className={`text-sm font-semibold mt-1 truncate ${isDone ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                            {task.topic}
                          </div>
                        </div>
                      </div>

                      {/* Due Date & Delete Action */}
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="flex items-center gap-1 text-xs text-slate-300 bg-[#40310c] px-2.5 py-1 rounded border border-slate-300/20">
                          <CalendarIcon className="w-3 h-3 text-slate-400" />
                          <span>{task.dueDate}</span>
                        </div>

                        <button
                          onClick={() => deleteTask(task.id)}
                          className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/40 rounded transition-colors cursor-pointer"
                          title="Delete mission"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs sm:text-sm">
                  No missions found in this view. Schedule a new mission using the form on the left.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-300/20 text-xs text-slate-400 flex items-center justify-between">
            <span>Tip: Check off missions as you finish study sessions.</span>
            <span>{tasks.length} total scheduled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
