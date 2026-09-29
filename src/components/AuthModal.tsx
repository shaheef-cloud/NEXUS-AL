import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  UserCheck,
  CheckCircle2,
  GraduationCap,
  ArrowRight,
  ShieldCheck,
  LogOut,
  Mail
} from 'lucide-react';
import { User } from '../types';
import { api } from '../api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User | null;
  onUserChanged: (user: User) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUserChanged,
}) => {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [googleEmail, setGoogleEmail] = useState<string>('engineersworld.services@gmail.com');
  const [googleName, setGoogleName] = useState<string>('Nexus Scholar');
  const [isLoggingIn, setIsLoggingIn] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      api.getSession().then((data) => {
        setAllUsers(data.allUsers || []);
      }).catch(console.error);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSwitchUser = async (userId: string) => {
    try {
      setIsLoggingIn(true);
      const res = await api.switchUser(userId);
      onUserChanged(res.user);
      onClose();
    } catch (err) {
      setMessage('Failed to switch student profile.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGoogleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsLoggingIn(true);
      setMessage(null);
      const res = await api.googleLogin({
        email: googleEmail.trim(),
        name: googleName.trim(),
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      });
      onUserChanged(res.user);
      onClose();
    } catch (err) {
      setMessage('Google authentication failed. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-[#4d3c12] border border-slate-300/40 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-1 text-base cursor-pointer"
        >
          ✕
        </button>

        <div className="text-center pb-4 border-b border-slate-300/20">
          <div className="w-12 h-12 rounded-xl bg-[#5e4914] border border-amber-300/50 flex items-center justify-center text-amber-300 shadow-sm mx-auto mb-2">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-100 font-serif">NEXUS AI Student Access</h2>
          <p className="text-xs text-slate-300 mt-1">
            Google Authentication & Separate Student Workspace Sessions
          </p>
        </div>

        {message && (
          <div className="my-3 p-3 rounded-lg text-xs bg-rose-950/60 border border-rose-500/50 text-rose-300">
            {message}
          </div>
        )}

        {/* Current Active Account */}
        {currentUser && (
          <div className="mt-4 p-3 rounded-xl bg-[#40310c] border border-slate-300/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full border border-amber-300/50 object-cover"
              />
              <div className="text-left">
                <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
                  <span>{currentUser.name}</span>
                  <span className="text-[10px] text-emerald-400 font-normal">(Current)</span>
                </div>
                <div className="text-[11px] text-slate-300">{currentUser.email}</div>
              </div>
            </div>
            <span className="px-2 py-0.5 text-[10px] uppercase font-semibold rounded bg-emerald-950/60 text-emerald-300 border border-emerald-500/40">
              Active
            </span>
          </div>
        )}

        {/* Google One-Click Login */}
        <div className="mt-5">
          <div className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-amber-300" />
            <span>Sign In with Google</span>
          </div>

          <form onSubmit={handleGoogleLogin} className="space-y-3 bg-[#42330d] p-3.5 rounded-xl border border-slate-300/20">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Student Google Account Email</label>
              <input
                type="email"
                value={googleEmail}
                onChange={(e) => setGoogleEmail(e.target.value)}
                placeholder="student@university.edu"
                required
                className="w-full bg-[#36290a] border border-slate-300/30 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/80"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">Student Full Name</label>
              <input
                type="text"
                value={googleName}
                onChange={(e) => setGoogleName(e.target.value)}
                placeholder="e.g. Nexus Scholar"
                required
                className="w-full bg-[#36290a] border border-slate-300/30 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/80"
              />
            </div>
            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-2.5 px-4 rounded-lg bg-[#5e4914] hover:bg-[#705819] text-slate-100 font-semibold text-xs border border-slate-300/40 shadow-sm transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.29 21.36 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.99 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.29 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>{isLoggingIn ? 'Authenticating with Google...' : 'Continue with Google'}</span>
            </button>
          </form>
        </div>

        {/* Demo Student Switcher */}
        <div className="mt-5">
          <div className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Switch Pre-Configured Student Profile
          </div>
          <div className="space-y-2">
            {allUsers.map((u) => {
              const isCurrent = currentUser?.id === u.id;
              return (
                <div
                  key={u.id}
                  onClick={() => !isCurrent && handleSwitchUser(u.id)}
                  className={`p-2.5 rounded-lg border flex items-center justify-between transition-colors ${
                    isCurrent
                      ? 'bg-[#523f11] border-amber-300/40 opacity-90'
                      : 'bg-[#40310c] border-slate-300/20 hover:border-slate-300/50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <img src={u.avatar} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                    <div>
                      <div className="text-xs font-semibold text-slate-100">{u.name}</div>
                      <div className="text-[10px] text-slate-400">{u.year} • {u.course}</div>
                    </div>
                  </div>
                  {isCurrent ? (
                    <span className="text-[10px] text-emerald-400 font-semibold">Active</span>
                  ) : (
                    <button className="text-xs text-amber-300 hover:text-amber-200 flex items-center gap-1 font-medium">
                      <span>Switch</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-300/20 text-center text-[11px] text-slate-400">
          User records (Knowledge Vault, Mission Planner, Quiz attempts) remain strictly segregated by student ID.
        </div>
      </div>
    </div>
  );
};
