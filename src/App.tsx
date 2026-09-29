/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { TutorView } from './components/TutorView';
import { VaultView } from './components/VaultView';
import { QuizView } from './components/QuizView';
import { PlannerView } from './components/PlannerView';
import { AnalyticsView } from './components/AnalyticsView';
import { ProfileView } from './components/ProfileView';
import { AuthModal } from './components/AuthModal';
import { User } from './types';
import { api, getStoredUserId, setStoredUserId } from './api';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [selectedTopicForQuiz, setSelectedTopicForQuiz] = useState<string>('');
  const [plannerRefreshTrigger, setPlannerRefreshTrigger] = useState<number>(0);

  // Initialize session
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const session = await api.getSession();
        setUser(session.user);
      } catch (err) {
        console.error('Failed to load initial session:', err);
      }
    };
    fetchSession();
  }, []);

  const handleUserChanged = (newUser: User) => {
    setUser(newUser);
    setStoredUserId(newUser.id);
  };

  const handleNavigate = (tab: NavTab) => {
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectTopicForQuiz = (topic: string) => {
    setSelectedTopicForQuiz(topic);
    setCurrentTab('quiz');
  };

  const handleMissionAddedToPlanner = () => {
    setPlannerRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#4a3b10] text-slate-100 flex flex-col font-sans selection:bg-amber-300/30 selection:text-white">
      {/* Navigation Header */}
      <Header
        currentTab={currentTab}
        onTabChange={handleNavigate}
        user={user}
        onOpenAuth={() => setIsAuthOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {currentTab === 'dashboard' && (
          <DashboardView
            user={user}
            onNavigate={handleNavigate}
            onMissionAddedToPlanner={handleMissionAddedToPlanner}
          />
        )}

        {currentTab === 'tutor' && (
          <TutorView user={user} />
        )}

        {currentTab === 'vault' && (
          <VaultView
            user={user}
            onNavigate={handleNavigate}
            onSelectTopicForQuiz={handleSelectTopicForQuiz}
          />
        )}

        {currentTab === 'quiz' && (
          <QuizView
            user={user}
            initialTopic={selectedTopicForQuiz}
            onQuizCompleted={() => {
              // Can trigger analytics refresh
            }}
          />
        )}

        {currentTab === 'planner' && (
          <PlannerView
            key={plannerRefreshTrigger}
            user={user}
            onTasksUpdated={() => {
              // Task update callback
            }}
          />
        )}

        {currentTab === 'analytics' && (
          <AnalyticsView user={user} />
        )}

        {currentTab === 'profile' && (
          <ProfileView
            user={user}
            onProfileUpdated={handleUserChanged}
            onOpenAuth={() => setIsAuthOpen(true)}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-[#382b0b] border-t border-slate-300/20 py-6 text-center text-xs text-slate-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-slate-100">NEXUS AI</span>
            <span>— Student Learning & Productivity Platform</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Learn • Ask • Store • Practice • Plan • Analyze</span>
          </div>
        </div>
      </footer>

      {/* Google Auth & Student Switcher Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={user}
        onUserChanged={handleUserChanged}
      />
    </div>
  );
}
