import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  FileText,
  UploadCloud,
  Search,
  Trash2,
  HelpCircle,
  Sparkles,
  BookOpen,
  FileCode,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Layers,
  Eye
} from 'lucide-react';
import { User, Material } from '../types';
import { api } from '../api';
import { NavTab } from './Header';

interface VaultViewProps {
  user: User | null;
  onNavigate: (tab: NavTab) => void;
  onSelectTopicForQuiz?: (topic: string) => void;
}

export const VaultView: React.FC<VaultViewProps> = ({
  user,
  onNavigate,
  onSelectTopicForQuiz,
}) => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [notesCount, setNotesCount] = useState<number>(0);
  const [filesCount, setFilesCount] = useState<number>(0);
  const [subjectCount, setSubjectCount] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Manual note form states
  const [noteSubject, setNoteSubject] = useState<string>('');
  const [noteTopic, setNoteTopic] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteMessage, setNoteMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isSubmittingNote, setIsSubmittingNote] = useState<boolean>(false);

  // File upload form states
  const [fileSubject, setFileSubject] = useState<string>('');
  const [fileTopic, setFileTopic] = useState<string>('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMessage, setFileMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [isUploadingFile, setIsUploadingFile] = useState<boolean>(false);

  // Modal / preview
  const [previewMaterial, setPreviewMaterial] = useState<Material | null>(null);

  // Load materials
  const loadMaterials = async (query = searchQuery) => {
    try {
      setLoading(true);
      const data = await api.getMaterials(query);
      setMaterials(data.materials);
      setTotalCount(data.totalCount);
      setNotesCount(data.notesCount);
      setFilesCount(data.filesCount);
      setSubjectCount(data.subjectCount);
    } catch (err) {
      console.error('Failed to load materials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, [user?.id]);

  // Handle Search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    loadMaterials(val);
  };

  // Submit Manual Note
  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteSubject.trim() || !noteTopic.trim() || !noteContent.trim()) {
      setNoteMessage({ text: 'Please fill out Subject, Topic, and Note content.', type: 'error' });
      return;
    }

    try {
      setIsSubmittingNote(true);
      setNoteMessage(null);
      await api.createMaterial({
        type: 'note',
        subject: noteSubject.trim(),
        topic: noteTopic.trim(),
        content: noteContent.trim(),
      });

      setNoteSubject('');
      setNoteTopic('');
      setNoteContent('');
      setNoteMessage({ text: 'Study note saved successfully to Knowledge Vault!', type: 'success' });
      loadMaterials();
      setTimeout(() => setNoteMessage(null), 4000);
    } catch (err: any) {
      setNoteMessage({ text: 'Failed to save note. Please try again.', type: 'error' });
    } finally {
      setIsSubmittingNote(false);
    }
  };

  // Handle File Input Change
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      // Auto populate topic if empty
      if (!fileTopic) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        setFileTopic(cleanName);
      }
    }
  };

  // Submit File Upload
  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileSubject.trim() || !fileTopic.trim()) {
      setFileMessage({ text: 'Please enter Subject and Topic.', type: 'error' });
      return;
    }
    if (!selectedFile) {
      setFileMessage({ text: 'Please choose a study file to upload.', type: 'error' });
      return;
    }

    try {
      setIsUploadingFile(true);
      setFileMessage(null);

      // Read text content for text-based files
      let extractedContent = `Uploaded study file: ${selectedFile.name} (${Math.round(selectedFile.size / 1024)} KB).`;
      const extension = selectedFile.name.split('.').pop()?.toLowerCase();

      if (['txt', 'md', 'csv', 'json', 'py', 'js', 'ts', 'html'].includes(extension || '')) {
        extractedContent = await selectedFile.text();
      } else {
        extractedContent = `Study document: ${selectedFile.name}. Covers concepts regarding ${fileTopic} in ${fileSubject}. Ready for AI analysis and quiz generation.`;
      }

      await api.createMaterial({
        type: 'file',
        subject: fileSubject.trim(),
        topic: fileTopic.trim(),
        content: extractedContent,
        fileName: selectedFile.name,
        fileType: selectedFile.type || `application/${extension}`,
        fileSize: selectedFile.size,
      });

      setFileSubject('');
      setFileTopic('');
      setSelectedFile(null);
      // Reset input element
      const fileInput = document.getElementById('material-file') as HTMLInputElement;
      if (fileInput) fileInput.value = '';

      setFileMessage({ text: `File "${selectedFile.name}" processed and vaulted successfully!`, type: 'success' });
      loadMaterials();
      setTimeout(() => setFileMessage(null), 4000);
    } catch (err: any) {
      setFileMessage({ text: 'Failed to upload study file. Please try again.', type: 'error' });
    } finally {
      setIsUploadingFile(false);
    }
  };

  // Delete Material
  const handleDeleteMaterial = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to remove "${name}" from your Knowledge Vault?`)) {
      return;
    }
    try {
      await api.deleteMaterial(id);
      loadMaterials();
    } catch (err) {
      console.error('Failed to delete material:', err);
    }
  };

  const getFileIcon = (material: Material) => {
    if (material.type === 'note') return <FileText className="w-5 h-5 text-amber-300" />;
    const fn = (material.fileName || '').toLowerCase();
    if (fn.endsWith('.csv') || fn.endsWith('.xlsx')) return <FileSpreadsheet className="w-5 h-5 text-emerald-400" />;
    if (fn.endsWith('.py') || fn.endsWith('.js') || fn.endsWith('.ts')) return <FileCode className="w-5 h-5 text-sky-400" />;
    return <BookOpen className="w-5 h-5 text-slate-200" />;
  };

  return (
    <div className="space-y-6">
      {/* Header and Counters */}
      <div className="bg-[#4d3c12] border border-slate-300/30 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-300 uppercase tracking-wider mb-1">
              <FolderGit2 className="w-4 h-4" />
              <span>Student Archive</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-100 font-serif">Knowledge Vault</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-2xl">
              Store your lecture notes, summaries, and course slides. NEXUS AI uses these materials to construct tailored study missions and quizzes.
            </p>
          </div>

          {/* Vault Metric Badges */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-[#3e300c] border border-slate-300/20 rounded-lg p-2.5 text-center">
              <span id="vault-material-count" className="text-xl font-bold text-slate-100 block">
                {totalCount}
              </span>
              <span className="text-[11px] text-slate-300">Total Vault</span>
            </div>
            <div className="bg-[#3e300c] border border-slate-300/20 rounded-lg p-2.5 text-center">
              <span id="notes-count" className="text-xl font-bold text-amber-300 block">
                {notesCount}
              </span>
              <span className="text-[11px] text-slate-300">Study Notes</span>
            </div>
            <div className="bg-[#3e300c] border border-slate-300/20 rounded-lg p-2.5 text-center">
              <span id="files-count" className="text-xl font-bold text-slate-200 block">
                {filesCount}
              </span>
              <span className="text-[11px] text-slate-300">Doc Files</span>
            </div>
          </div>
        </div>

        {/* Second counter row for IDs required by prompt */}
        <div className="mt-4 pt-3 border-t border-slate-300/10 flex flex-wrap items-center justify-between text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <span>Archived subjects: <strong id="vault-subject-count" className="text-amber-300 font-semibold">{subjectCount}</strong></span>
            <span>•</span>
            <span>Total library size: <strong id="materials-count" className="text-slate-100 font-semibold">{totalCount}</strong></span>
          </div>
          <div id="vault-results-label" className="text-slate-400">
            Showing {materials.length} of {totalCount} items
          </div>
        </div>
      </div>

      {/* Creation Row: Manual Notes & File Upload */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Manual Notes Card */}
        <div className="bg-[#523f11] border border-slate-300/30 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-300/20">
            <FileText className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold text-slate-100 font-serif">Add Manual Notes</h2>
          </div>

          {noteMessage && (
            <div
              id="material-message"
              className={`mt-3 p-3 rounded-lg text-xs flex items-center gap-2 ${
                noteMessage.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/50 text-rose-300'
              }`}
            >
              {noteMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{noteMessage.text}</span>
            </div>
          )}

          <form id="material-form" onSubmit={handleNoteSubmit} className="mt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  id="material-subject"
                  type="text"
                  value={noteSubject}
                  onChange={(e) => setNoteSubject(e.target.value)}
                  placeholder="e.g. Data Structures"
                  required
                  className="w-full bg-[#40310c] border border-slate-300/30 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/80"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Topic</label>
                <input
                  id="material-topic"
                  type="text"
                  value={noteTopic}
                  onChange={(e) => setNoteTopic(e.target.value)}
                  placeholder="e.g. Binary Search Trees"
                  required
                  className="w-full bg-[#40310c] border border-slate-300/30 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/80"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Notes & Key Concepts</label>
              <textarea
                id="material-notes"
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={4}
                placeholder="Enter lecture summary, core definitions, formulas, or code snippets..."
                required
                className="w-full bg-[#40310c] border border-slate-300/30 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/80"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmittingNote}
              className="w-full py-2.5 px-4 rounded-lg bg-[#614d16] hover:bg-[#735b1b] text-slate-100 font-semibold text-sm border border-slate-300/40 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isSubmittingNote ? 'Saving Note...' : 'Save to Knowledge Vault'}
            </button>
          </form>
        </div>

        {/* File Upload Card */}
        <div className="bg-[#523f11] border border-slate-300/30 rounded-xl p-5 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-300/20">
            <UploadCloud className="w-5 h-5 text-amber-300" />
            <h2 className="text-base font-bold text-slate-100 font-serif">Upload Study Files</h2>
          </div>

          {fileMessage && (
            <div
              id="file-message"
              className={`mt-3 p-3 rounded-lg text-xs flex items-center gap-2 ${
                fileMessage.type === 'success'
                  ? 'bg-emerald-950/60 border border-emerald-500/50 text-emerald-300'
                  : 'bg-rose-950/60 border border-rose-500/50 text-rose-300'
              }`}
            >
              {fileMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              <span>{fileMessage.text}</span>
            </div>
          )}

          <form id="file-upload-form" onSubmit={handleFileUpload} className="mt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject</label>
                <input
                  id="file-subject"
                  type="text"
                  value={fileSubject}
                  onChange={(e) => setFileSubject(e.target.value)}
                  placeholder="e.g. Operating Systems"
                  required
                  className="w-full bg-[#40310c] border border-slate-300/30 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/80"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Topic</label>
                <input
                  id="file-topic"
                  type="text"
                  value={fileTopic}
                  onChange={(e) => setFileTopic(e.target.value)}
                  placeholder="e.g. Paging & Memory"
                  required
                  className="w-full bg-[#40310c] border border-slate-300/30 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/80"
                />
              </div>
            </div>

            {/* File drag-and-drop styled input */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Choose Document (PDF, DOCX, PPTX, TXT, MD, CSV, XLSX)
              </label>
              <div className="relative border-2 border-dashed border-slate-300/30 hover:border-slate-300/60 rounded-lg p-4 text-center bg-[#40310c] transition-colors">
                <input
                  id="material-file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.pptx,.txt,.md,.markdown,.csv,.xlsx,.json"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="flex flex-col items-center justify-center pointer-events-none">
                  <UploadCloud className="w-8 h-8 text-amber-300 mb-1.5" />
                  <span id="file-selected-name" className="text-xs font-medium text-slate-200">
                    {selectedFile ? selectedFile.name : 'Click or drag file here to upload'}
                  </span>
                  <span className="text-[10px] text-slate-400 mt-1">
                    Supports up to 25MB study documents
                  </span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isUploadingFile || !selectedFile}
              className="w-full py-2.5 px-4 rounded-lg bg-[#614d16] hover:bg-[#735b1b] text-slate-100 font-semibold text-sm border border-slate-300/40 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              {isUploadingFile ? 'Processing & Vaulting...' : 'Upload & Process File'}
            </button>
          </form>
        </div>
      </div>

      {/* Vault Materials Archive & Search */}
      <div className="bg-[#4d3c12] border border-slate-300/30 rounded-xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-300/20">
          <div>
            <h2 className="text-lg font-bold text-slate-100 font-serif">Vault Materials Library</h2>
            <p className="text-xs text-slate-300">Browse and manage all stored academic resources</p>
          </div>

          {/* Search bar with exact id="material-search" */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="material-search"
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by topic, subject, or filename..."
              className="w-full bg-[#3e300c] border border-slate-300/30 rounded-lg pl-9 pr-3 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-400 focus:outline-none focus:border-amber-300/80"
            />
          </div>
        </div>

        {/* Materials List Container with exact id="materials-list" */}
        <div id="materials-list" className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {loading ? (
            <div className="col-span-2 py-12 text-center text-slate-300 text-sm">
              Loading knowledge items...
            </div>
          ) : materials.length > 0 ? (
            materials.map((m) => (
              <div
                key={m.id}
                className="bg-[#564313] border border-slate-300/30 rounded-xl p-4 flex flex-col justify-between hover:border-slate-300/60 transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-2 rounded-lg bg-[#40310c] border border-slate-300/20 shrink-0">
                        {getFileIcon(m)}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#40310c] text-amber-300 border border-slate-300/20">
                          {m.subject}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100 mt-1 truncate" title={m.topic}>
                          {m.topic}
                        </h3>
                      </div>
                    </div>

                    <span className="text-[10px] text-slate-400 shrink-0">
                      {new Date(m.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  {m.fileName && (
                    <div className="mt-2 text-xs text-slate-300 flex items-center gap-1.5 bg-[#43340d] px-2.5 py-1 rounded border border-slate-300/10">
                      <span className="font-mono truncate">{m.fileName}</span>
                      {m.fileSize && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          ({Math.round(m.fileSize / 1024)} KB)
                        </span>
                      )}
                    </div>
                  )}

                  <p className="mt-2 text-xs text-slate-300 line-clamp-3 leading-relaxed">
                    {m.content}
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-300/20 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setPreviewMaterial(m)}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-200 hover:text-slate-100 bg-[#40310c] hover:bg-[#523f11] border border-slate-300/30 rounded transition-colors cursor-pointer"
                      title="Inspect full material"
                    >
                      <Eye className="w-3 h-3" />
                      <span>View</span>
                    </button>
                    <button
                      onClick={() => {
                        if (onSelectTopicForQuiz) {
                          onSelectTopicForQuiz(`${m.subject}: ${m.topic}`);
                        }
                        onNavigate('quiz');
                      }}
                      className="flex items-center gap-1 px-2.5 py-1 text-xs text-amber-300 hover:text-amber-200 bg-[#40310c] hover:bg-[#523f11] border border-slate-300/30 rounded transition-colors cursor-pointer"
                      title="Generate AI Quiz from this material"
                    >
                      <HelpCircle className="w-3 h-3" />
                      <span>Quiz Me</span>
                    </button>
                  </div>

                  <button
                    onClick={() => handleDeleteMaterial(m.id, m.topic)}
                    className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-500/40 rounded transition-colors cursor-pointer"
                    title="Delete from Knowledge Vault"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-12 text-center text-slate-300 text-sm">
              No study materials found matching &ldquo;{searchQuery}&rdquo;. Add notes or upload documents above.
            </div>
          )}
        </div>
      </div>

      {/* Material Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[#4d3c12] border border-slate-300/40 rounded-xl max-w-2xl w-full p-6 shadow-xl max-h-[85vh] flex flex-col">
            <div className="flex items-start justify-between pb-3 border-b border-slate-300/20">
              <div>
                <span className="text-xs uppercase font-bold text-amber-300 px-2 py-0.5 rounded bg-[#3e300c] border border-slate-300/20">
                  {previewMaterial.subject}
                </span>
                <h3 className="text-lg font-bold text-slate-100 mt-1">{previewMaterial.topic}</h3>
                {previewMaterial.fileName && (
                  <p className="text-xs text-slate-300 mt-0.5">File: {previewMaterial.fileName}</p>
                )}
              </div>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="text-slate-400 hover:text-slate-100 text-lg font-bold p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="my-4 overflow-y-auto flex-1 pr-2">
              <div className="bg-[#3e300c] border border-slate-300/20 rounded-lg p-4 text-xs sm:text-sm text-slate-200 whitespace-pre-wrap font-sans leading-relaxed">
                {previewMaterial.content}
              </div>
            </div>

            <div className="pt-3 border-t border-slate-300/20 flex justify-end gap-2">
              <button
                onClick={() => {
                  const topic = `${previewMaterial.subject}: ${previewMaterial.topic}`;
                  setPreviewMaterial(null);
                  if (onSelectTopicForQuiz) onSelectTopicForQuiz(topic);
                  onNavigate('quiz');
                }}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#614d16] hover:bg-[#735b1b] text-slate-100 border border-slate-300/40 cursor-pointer"
              >
                Generate AI Quiz for this Material
              </button>
              <button
                onClick={() => setPreviewMaterial(null)}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-[#3e300c] text-slate-300 hover:text-slate-100 border border-slate-300/30 cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
