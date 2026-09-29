import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Award,
  BookOpen,
  TrendingUp,
  Sparkles,
  ArrowRight,
  Bot,
  PlusCircle,
  Clock,
  Target,
  RefreshCw,
  FolderGit2,
  HelpCircle,
  CalendarCheck
} from 'lucide-react';
import { User, AnalyticsData, RandomMission, Task } from '../types';
import { api } from '../api';
import { NavTab } from './Header';

interface DashboardViewProps {
  user: User | null;
  onNavigate: (tab: NavTab) => void;
  onMissionAddedToPlanner?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  onNavigate,
  onMissionAddedToPlanner,
}) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [randomMission, setRandomMission] = useState<RandomMission | null>(null);
  const [missionLoading, setMissionLoading] = useState<boolean>(false);
  const [missionAdded, setMissionAdded] = useState<boolean>(false);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Load dashboard data
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsData, tasksData] = await Promise.all([
        api.getAnalytics(),
        api.getTasks(),
      ]);
      setAnalytics(analyticsData);
      setRecentTasks(tasksData.slice(0, 3));
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Generate or regenerate random AI mission
  const handleGenerateRandomMission = async () => {
    try {
      setMissionLoading(true);
      setMissionAdded(false);
      const mission = await api.getRandomMission();
      setRandomMission(mission);
    } catch (err) {
      console.error('Failed to generate random mission:', err);
    } finally {
      setMissionLoading(false);
    }
  };

  // Add random mission to mission planner
  const handleAddMissionToPlanner = async () => {
    if (!randomMission || missionAdded) return;
    try {
      await api.createTask({
        subject: randomMission.subject,
        topic: randomMission.topic,
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
        source: 'ai_mission',
      });
      setMissionAdded(true);
      if (onMissionAddedToPlanner) {
        onMissionAddedToPlanner();
      }
      // Refresh tasks
      const updatedTasks = await api.getTasks();
      setRecentTasks(updatedTasks.slice(0, 3));
      const updatedAnalytics = await api.getAnalytics();
      setAnalytics(updatedAnalytics);
    } catch (err) {
      console.error('Failed to add mission to planner:', err);
    }
  };

  useEffect(() => {
    loadDashboardData();
    handleGenerateRandomMission();
  }, [user?.id]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-[#4d3c12] border border-slate-300/30 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Overview</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 font-serif">
              Welcome back, <span id="welcome-name" className="text-amber-200">{user?.name || 'Student'}</span>!
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Track your daily learning progress, generate personalized study missions, and sharpen your understanding with NEXUS AI.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('tutor')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[#614d16] hover:bg-[#735b1b] text-slate-100 border border-slate-300/40 shadow-sm transition-all cursor-pointer"
            >
              <Bot className="w-4 h-4 text-amber-300" />
              <span>Ask AI Tutor</span>
            </button>
            <button
              onClick={() => onNavigate('quiz')}
              className="flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[#554313] hover:bg-[#685217] text-slate-100 border border-slate-300/30 shadow-sm transition-all cursor-pointer"
            >
              <HelpCircle className="w-4 h-4 text-amber-300" />
              <span>Take Quiz</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Completed Tasks */}
        <div className="bg-[#523f11] border border-slate-300/30 rounded-xl p-5 shadow-sm hover:border-slate-300/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Completed Tasks</span>
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span id="dashboard-completed-tasks" className="text-3xl font-bold text-slate-100">
              {analytics ? analytics.completedTasks : 0}
            </span>
            <span className="text-xs text-slate-300">
              / {analytics ? analytics.totalTasks : 0} total
            </span>
          </div>
          <div className="mt-2 text-xs text-emerald-300 flex items-center gap-1">
            <span>Positive mission completion rate</span>
          </div>
        </div>

        {/* Quiz Average */}
        <div className="bg-[#523f11] border border-slate-300/30 rounded-xl p-5 shadow-sm hover:border-slate-300/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Quiz Average</span>
            <div className="p-2 rounded-lg bg-[#665017] border border-slate-300/30 text-amber-300">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span id="dashboard-quiz-average" className="text-3xl font-bold text-slate-100">
              {analytics ? analytics.quizAverage : 0}%
            </span>
            <span className="text-xs text-slate-300">
              ({analytics ? analytics.quizzes : 0} quizzes)
            </span>
          </div>
          <div className="mt-2 text-xs text-slate-300">
            Assessed across Knowledge Vault topics
          </div>
        </div>

        {/* Study Materials */}
        <div className="bg-[#523f11] border border-slate-300/30 rounded-xl p-5 shadow-sm hover:border-slate-300/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Study Materials</span>
            <div className="p-2 rounded-lg bg-[#665017] border border-slate-300/30 text-slate-200">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span id="dashboard-materials" className="text-3xl font-bold text-slate-100">
              {analytics ? analytics.materials : 0}
            </span>
            <span className="text-xs text-slate-300">items in vault</span>
          </div>
          <div className="mt-2 text-xs text-slate-300">
            Notes & uploaded lecture documents
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-[#523f11] border border-slate-300/30 rounded-xl p-5 shadow-sm hover:border-slate-300/50 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">Overall Progress</span>
            <div className="p-2 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span id="dashboard-progress" className="text-3xl font-bold text-slate-100">
              {analytics ? analytics.progress : 0}%
            </span>
            <span className="text-xs text-slate-300">weighted score</span>
          </div>
          {/* Progress bar */}
          <div className="mt-3 w-full bg-[#3d2e0b] rounded-full h-2 overflow-hidden border border-slate-300/20">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${analytics ? Math.max(5, analytics.progress) : 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Row: Random AI Mission & Quick Access */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Random AI Mission Container (2 cols) */}
        <div
          id="random-mission-container"
          className="lg:col-span-2 bg-[#523f11] border border-slate-300/30 rounded-xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-300/20">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-md bg-[#665017] text-amber-300 border border-amber-300/40">
                  <Target className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-100 font-serif">Daily AI Learning Mission</h2>
                  <p className="text-xs text-slate-300">Generated dynamically from your Knowledge Vault materials</p>
                </div>
              </div>

              <button
                id="random-mission-button"
                onClick={handleGenerateRandomMission}
                disabled={missionLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-100 bg-[#634e16] hover:bg-[#755c1a] border border-slate-300/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                title="Generate another AI mission"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${missionLoading ? 'animate-spin' : ''}`} />
                <span>{missionLoading ? 'Generating...' : 'Roll New Mission'}</span>
              </button>
            </div>

            {/* Random Mission Content Area */}
            <div id="random-mission-content" className="mt-4">
              {randomMission ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded bg-[#40310c] text-amber-300 border border-slate-300/30">
                      {randomMission.subject}
                    </span>
                    <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded bg-[#40310c] text-slate-200 border border-slate-300/20">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {randomMission.estimatedMinutes} mins
                    </span>
                    <span className="px-2.5 py-1 text-xs font-medium rounded bg-[#40310c] text-slate-200 border border-slate-300/20">
                      Difficulty: {randomMission.difficulty}
                    </span>
                    {randomMission.sourceMaterialTitle && (
                      <span className="text-xs text-slate-400 truncate max-w-xs">
                        From: {randomMission.sourceMaterialTitle}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-slate-100">{randomMission.topic}</h3>
                    <p className="text-sm text-slate-300 mt-1 leading-relaxed">{randomMission.objective}</p>
                  </div>

                  {randomMission.steps && randomMission.steps.length > 0 && (
                    <div className="bg-[#43340d] border border-slate-300/20 rounded-lg p-3.5">
                      <div className="text-xs font-semibold text-slate-200 mb-2 uppercase tracking-wider">Action Steps</div>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {randomMission.steps.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="w-4 h-4 rounded-full bg-[#5c4613] text-amber-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                              {idx + 1}
                            </span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-300 text-sm">
                  {missionLoading ? 'Crafting your personalized mission...' : 'No mission generated yet. Click Roll New Mission above.'}
                </div>
              )}
            </div>
          </div>

          {/* Mission Actions */}
          <div className="mt-5 pt-4 border-t border-slate-300/20 flex flex-wrap items-center justify-between gap-3">
            <span className="text-xs text-slate-300">
              Completed missions count towards your daily academic goals.
            </span>

            {missionAdded ? (
              <div className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-emerald-400 bg-emerald-950/40 border border-emerald-500/50 rounded-lg">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Mission Added to Planner!</span>
              </div>
            ) : (
              <button
                onClick={handleAddMissionToPlanner}
                disabled={!randomMission || missionLoading}
                className="flex items-center gap-2 px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white border border-emerald-400/50 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add to Mission Planner</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Access & Study Toolkit */}
        <div className="bg-[#523f11] border border-slate-300/30 rounded-xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-100 font-serif pb-3 border-b border-slate-300/20">
              Quick Navigation
            </h2>
            <p className="text-xs text-slate-300 mt-2">
              Instant access to core NEXUS AI student modules:
            </p>

            <div className="grid grid-cols-1 gap-2.5 mt-4">
              <button
                onClick={() => onNavigate('tutor')}
                className="flex items-center justify-between p-3 rounded-lg bg-[#46360e] hover:bg-[#5b4613] border border-slate-300/20 hover:border-slate-300/40 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#5a4513] text-amber-300">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100">AI Tutor</div>
                    <div className="text-xs text-slate-300">Concept breakdowns & coding help</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-100 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigate('vault')}
                className="flex items-center justify-between p-3 rounded-lg bg-[#46360e] hover:bg-[#5b4613] border border-slate-300/20 hover:border-slate-300/40 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#5a4513] text-slate-200">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100">Knowledge Vault</div>
                    <div className="text-xs text-slate-300">Manage notes & lecture files</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-100 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigate('quiz')}
                className="flex items-center justify-between p-3 rounded-lg bg-[#46360e] hover:bg-[#5b4613] border border-slate-300/20 hover:border-slate-300/40 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#5a4513] text-amber-300">
                    <HelpCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100">AI Quiz Generator</div>
                    <div className="text-xs text-slate-300">Custom multiple-choice practice</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-100 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onNavigate('planner')}
                className="flex items-center justify-between p-3 rounded-lg bg-[#46360e] hover:bg-[#5b4613] border border-slate-300/20 hover:border-slate-300/40 text-left transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-[#5a4513] text-emerald-400">
                    <CalendarCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-slate-100">Mission Planner</div>
                    <div className="text-xs text-slate-300">Organize due dates and tasks</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-slate-100 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-300/20 text-center">
            <button
              onClick={() => onNavigate('analytics')}
              className="text-xs font-semibold text-amber-300 hover:text-amber-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View Full Analytics Report</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Recent Missions / Tasks Preview */}
      <div className="bg-[#4d3c12] border border-slate-300/30 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-slate-300/20">
          <div>
            <h2 className="text-base font-bold text-slate-100 font-serif">Upcoming Missions & Deadlines</h2>
            <p className="text-xs text-slate-300">Key milestones scheduled in your mission planner</p>
          </div>
          <button
            onClick={() => onNavigate('planner')}
            className="text-xs font-semibold text-amber-300 hover:text-amber-200 flex items-center gap-1 cursor-pointer"
          >
            <span>Manage All Missions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-4 divide-y divide-slate-300/10">
          {recentTasks.length > 0 ? (
            recentTasks.map((t) => (
              <div key={t.id} className="py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-1.5 rounded-full ${t.status === 'completed' ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40' : 'bg-[#40310c] text-slate-400 border border-slate-300/20'}`}>
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className={`text-sm font-medium truncate ${t.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-100'}`}>
                      {t.topic}
                    </div>
                    <div className="text-xs text-slate-400">
                      {t.subject} • Due {t.dueDate}
                    </div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded border ${
                  t.status === 'completed'
                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-950/40 text-amber-300 border-amber-500/40'
                }`}>
                  {t.status}
                </span>
              </div>
            ))
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              No pending missions right now. Create one in the Mission Planner!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
