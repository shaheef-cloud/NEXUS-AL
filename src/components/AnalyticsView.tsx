import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  Award,
  BookOpen,
  CalendarCheck,
  Target,
  PieChart,
  Layers
} from 'lucide-react';
import { User, AnalyticsData, QuizRecord } from '../types';
import { api } from '../api';

interface AnalyticsViewProps {
  user: User | null;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ user }) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [quizHistory, setQuizHistory] = useState<QuizRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const [analyticsData, sessionData] = await Promise.all([
        api.getAnalytics(),
        fetch('/api/auth/session', {
          headers: { 'x-user-id': localStorage.getItem('nexus_user_id') || 'student_001' },
        }).then((res) => res.json()),
      ]);
      setAnalytics(analyticsData);

      // fetch past quizzes
      const res = await fetch('/api/tasks', {
        headers: { 'x-user-id': localStorage.getItem('nexus_user_id') || 'student_001' },
      });
      // We can also query past quizzes
    } catch (err) {
      console.error('Failed to load analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user?.id]);

  const progressPercent = analytics ? Math.min(100, Math.max(0, analytics.progress)) : 0;
  const taskRate = analytics && analytics.totalTasks > 0
    ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-[#4d3c12] border border-slate-300/30 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
              <BarChart3 className="w-4 h-4" />
              <span>Academic Performance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 font-serif">Learning Analytics</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Real-time insights across your missions, practice quiz retention, and knowledge vault resources.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#3e300c] border border-slate-300/20 px-4 py-2 rounded-lg">
            <TrendingUp className="w-5 h-5 text-emerald-400" />
            <div>
              <div className="text-[10px] text-slate-300 uppercase font-semibold">Overall Index</div>
              <div className="text-lg font-bold text-slate-100">{progressPercent}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Analytics Content Container with exact id="analytics-content" */}
      <div id="analytics-content" className="space-y-6">
        {/* Metric Cards Grid with required IDs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Completed / Total Tasks */}
          <div className="bg-[#523f11] border border-slate-300/30 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Mission Milestones</span>
              <div className="p-2 rounded-lg bg-emerald-950/40 text-emerald-400 border border-emerald-500/40">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span id="analytics-completed-tasks" className="text-3xl font-bold text-slate-100">
                {analytics ? analytics.completedTasks : 0}
              </span>
              <span className="text-xs text-slate-300">
                completed of <strong id="analytics-total-tasks" className="text-slate-200">{analytics ? analytics.totalTasks : 0}</strong> total
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-300">
              Task completion rate: <span className="text-emerald-400 font-semibold">{taskRate}%</span>
            </div>
          </div>

          {/* Quizzes & Quiz Average */}
          <div className="bg-[#523f11] border border-slate-300/30 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Active Recall Quizzes</span>
              <div className="p-2 rounded-lg bg-[#665017] text-amber-300 border border-slate-300/30">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span id="analytics-quiz-average" className="text-3xl font-bold text-slate-100">
                {analytics ? analytics.quizAverage : 0}%
              </span>
              <span className="text-xs text-slate-300">average retention</span>
            </div>
            <div className="mt-2 text-xs text-slate-300">
              Total assessed quizzes: <strong id="analytics-quizzes" className="text-amber-300 font-semibold">{analytics ? analytics.quizzes : 0}</strong>
            </div>
          </div>

          {/* Stored Knowledge Materials */}
          <div className="bg-[#523f11] border border-slate-300/30 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Vault Archive</span>
              <div className="p-2 rounded-lg bg-[#665017] text-slate-200 border border-slate-300/30">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span id="analytics-materials" className="text-3xl font-bold text-slate-100">
                {analytics ? analytics.materials : 0}
              </span>
              <span className="text-xs text-slate-300">vaulted items</span>
            </div>
            <div className="mt-2 text-xs text-slate-300">
              Across <strong className="text-slate-200">{analytics ? analytics.subjectCount : 0}</strong> unique subjects
            </div>
          </div>
        </div>

        {/* Overall Progress Section with required IDs */}
        <div className="bg-[#523f11] border border-slate-300/30 rounded-xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-300/20">
            <div>
              <h2 className="text-base font-bold text-slate-100 font-serif">Comprehensive Learning Progress</h2>
              <p className="text-xs text-slate-300">Synthesizes mission completion (50%), quiz performance (30%), and vault repository (20%)</p>
            </div>
            <div className="text-right">
              <span id="analytics-progress" className="text-2xl font-bold text-emerald-400">
                {progressPercent}%
              </span>
            </div>
          </div>

          <div className="mt-5">
            {/* Main Progress Bar Container with exact id="analytics-progress-bar" */}
            <div
              id="analytics-progress-bar"
              className="w-full bg-[#3d2e0b] h-4 rounded-full overflow-hidden border border-slate-300/20 relative"
            >
              <div
                className="bg-emerald-500 h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.max(5, progressPercent)}%` }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 text-xs">
              <div className="p-3 bg-[#43340d] rounded-lg border border-slate-300/20">
                <div className="text-slate-400">Mission Progress Weight (50%)</div>
                <div className="font-semibold text-slate-100 text-sm mt-0.5">{taskRate}% Task Rate</div>
              </div>
              <div className="p-3 bg-[#43340d] rounded-lg border border-slate-300/20">
                <div className="text-slate-400">Quiz Retention Weight (30%)</div>
                <div className="font-semibold text-slate-100 text-sm mt-0.5">{analytics ? analytics.quizAverage : 0}% Average</div>
              </div>
              <div className="p-3 bg-[#43340d] rounded-lg border border-slate-300/20">
                <div className="text-slate-400">Knowledge Depth (20%)</div>
                <div className="font-semibold text-slate-100 text-sm mt-0.5">{analytics ? analytics.materials : 0} Vault Items</div>
              </div>
            </div>
          </div>
        </div>

        {/* Subject Breakdown Table */}
        <div className="bg-[#4d3c12] border border-slate-300/30 rounded-xl p-6 shadow-sm">
          <h2 className="text-base font-bold text-slate-100 font-serif pb-3 border-b border-slate-300/20">
            Subject Coverage Breakdown
          </h2>

          <div className="mt-4 overflow-x-auto">
            {analytics && Object.keys(analytics.subjects).length > 0 ? (
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-slate-300/20 text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="pb-2.5 font-semibold">Subject / Academic Domain</th>
                    <th className="pb-2.5 font-semibold">Vault Materials</th>
                    <th className="pb-2.5 font-semibold">Scheduled Missions</th>
                    <th className="pb-2.5 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-300/10">
                  {Object.entries(analytics.subjects).map(([subj, data], idx) => (
                    <tr key={idx} className="hover:bg-[#574413]/50 transition-colors">
                      <td className="py-3 font-semibold text-slate-100">{subj}</td>
                      <td className="py-3 text-slate-300">{data.materials} items</td>
                      <td className="py-3 text-slate-300">{data.tasks} missions</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 text-[10px] font-semibold uppercase rounded bg-emerald-950/60 border border-emerald-500/40 text-emerald-300">
                          Active
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="py-8 text-center text-slate-400 text-xs">
                No subject records logged yet. Add materials or missions to see analytics!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
