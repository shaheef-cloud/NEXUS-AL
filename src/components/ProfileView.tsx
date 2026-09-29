import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Save,
  CheckCircle2,
  AlertCircle,
  GraduationCap,
  Sparkles,
  Camera,
  Mail,
  Calendar
} from 'lucide-react';
import { User } from '../types';
import { api } from '../api';

interface ProfileViewProps {
  user: User | null;
  onProfileUpdated: (updatedUser: User) => void;
  onOpenAuth: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onProfileUpdated,
  onOpenAuth,
}) => {
  const [name, setName] = useState<string>(user?.name || '');
  const [course, setCourse] = useState<string>(user?.course || '');
  const [year, setYear] = useState<string>(user?.year || 'Year 1');
  const [avatar, setAvatar] = useState<string>(user?.avatar || '');
  const [profileMessage, setProfileMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setCourse(user.course);
      setYear(user.year);
      setAvatar(user.avatar);
    }
  }, [user]);

  const presetAvatars = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !course.trim()) {
      setProfileMessage({ text: 'Name and Course cannot be empty.', type: 'error' });
      return;
    }

    try {
      setIsSaving(true);
      setProfileMessage(null);
      const updated = await api.updateProfile({
        name: name.trim(),
        course: course.trim(),
        year: year.trim(),
        avatar: avatar || presetAvatars[0],
      });
      onProfileUpdated(updated);
      setProfileMessage({ text: 'Student profile updated successfully!', type: 'success' });
      setTimeout(() => setProfileMessage(null), 4000);
    } catch (err) {
      setProfileMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-[#4d3c12] border border-slate-300/30 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
              <GraduationCap className="w-4 h-4" />
              <span>Student Identity</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 font-serif">Student Profile</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Manage your academic credentials, enrollment year, and user avatar.
            </p>
          </div>

          <button
            onClick={onOpenAuth}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-[#554313] hover:bg-[#685217] text-slate-100 border border-slate-300/40 cursor-pointer self-start sm:self-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Switch / Login Student</span>
          </button>
        </div>
      </div>

      {/* Profile Overview Card with required IDs */}
      <div className="bg-[#523f11] border border-slate-300/30 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-300/20">
          {/* Avatar with id="profile-avatar" */}
          <div className="relative group shrink-0">
            <img
              id="profile-avatar"
              src={avatar || presetAvatars[0]}
              alt="Student Avatar"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-amber-300/60 shadow-md bg-[#40310c]"
            />
          </div>

          <div className="text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1">
              {/* Display name with id="profile-display-name" */}
              <h2 id="profile-display-name" className="text-xl sm:text-2xl font-bold text-slate-100 font-serif">
                {user?.name || 'Alex Sterling'}
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
                Active Student
              </span>
            </div>

            {/* Display course with id="profile-display-course" */}
            <p id="profile-display-course" className="text-sm text-slate-300 font-medium">
              {user?.course || 'Computer Science & Software Engineering'}
            </p>

            <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.email || 'student@university.edu'}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                <span>{user?.year || 'Year 3'}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Profile Edit Form with required IDs */}
        <div className="mt-6">
          <h3 className="text-base font-bold text-slate-100 font-serif mb-4">Edit Profile Information</h3>

          {profileMessage && (
            <div
              id="profile-message"
              className={`mb-4 p-3 rounded-lg text-xs flex items-center gap-2 ${
                profileMessage.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/50 text-rose-300'
              }`}
            >
              {profileMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{profileMessage.text}</span>
            </div>
          )}

          <form id="profile-form" onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Display Name</label>
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your full student name"
                  required
                  className="w-full bg-[#40310c] border border-slate-300/30 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/80"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Academic Year</label>
                <select
                  id="profile-year"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  className="w-full bg-[#40310c] border border-slate-300/30 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-300/80"
                >
                  <option value="Year 1">Year 1 (Freshman)</option>
                  <option value="Year 2">Year 2 (Sophomore)</option>
                  <option value="Year 3">Year 3 (Junior)</option>
                  <option value="Year 4">Year 4 (Senior)</option>
                  <option value="Postgraduate">Postgraduate / Masters</option>
                  <option value="Doctorate">Doctorate / PhD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Degree / Course</label>
              <input
                id="profile-course"
                type="text"
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                placeholder="e.g. Computer Science & Software Engineering"
                required
                className="w-full bg-[#40310c] border border-slate-300/30 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/80"
              />
            </div>

            {/* Avatar Selection */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Choose Avatar Preset</label>
              <div className="flex flex-wrap gap-3">
                {presetAvatars.map((url, idx) => (
                  <img
                    key={idx}
                    src={url}
                    alt={`Preset ${idx + 1}`}
                    onClick={() => setAvatar(url)}
                    className={`w-12 h-12 rounded-xl object-cover cursor-pointer border-2 transition-all ${
                      avatar === url
                        ? 'border-amber-300 scale-105 shadow-md'
                        : 'border-slate-300/30 hover:border-slate-300/60 opacity-70 hover:opacity-100'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-[#614d16] hover:bg-[#735b1b] text-slate-100 font-semibold text-sm border border-slate-300/40 shadow-sm transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4 text-amber-300" />
                <span>{isSaving ? 'Updating Profile...' : 'Save Profile Changes'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
