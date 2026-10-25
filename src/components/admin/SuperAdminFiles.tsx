import React, { useState, useRef } from 'react';
import { useInstitution } from '../../context/InstitutionContext';
import { useNotifications } from '../../context/NotificationContext';
import { ClassFileItem } from '../../types';
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Search,
  Plus,
  Eye,
  FileCheck,
  FileSpreadsheet,
  FileCode,
  FolderOpen,
  X,
  Check
} from 'lucide-react';

export const SuperAdminFiles: React.FC = () => {
  const { classFiles, addClassFile, deleteClassFile } = useInstitution();
  const { playChime, addNotification } = useNotifications();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Form Fields
  const [fileName, setFileName] = useState('');
  const [category, setCategory] = useState('Study Notes');
  const [subject, setSubject] = useState('Physics');
  const [description, setDescription] = useState('');
  const [fileSize, setFileSize] = useState('2.4 MB');
  const [fileType, setFileType] = useState('PDF');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRealFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      setFileSize(`${sizeMB} MB`);
      const ext = file.name.split('.').pop()?.toUpperCase() || 'PDF';
      setFileType(ext);
      playChime('click');
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileName.trim()) return;

    addClassFile({
      name: fileName.trim(),
      category,
      subject,
      size: fileSize || '1.8 MB',
      fileType: fileType || 'PDF',
      description: description.trim() || 'Uploaded by Class IT Officer for AL-USWAH.'
    });

    setShowUploadModal(false);
    setFileName('');
    setDescription('');
  };

  const handleDownload = (file: ClassFileItem) => {
    playChime('success');
    addNotification({
      title: 'File Downloaded',
      message: `"${file.name}" has been downloaded to your device.`,
      type: 'success'
    });

    // Simulated blob download for real UX
    const blob = new Blob([`AL-USWAH Document: ${file.name}\nSubject: ${file.subject}\nCategory: ${file.category}\nUploader: ${file.uploader}\n\nThis is an official document of AL-USWAH SmartClass portal.`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredFiles = classFiles.filter(f => {
    const matchesSearch =
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.subject.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'ALL' || f.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  const getFileIcon = (type: string) => {
    if (type.includes('XLS') || type.includes('SHEET')) {
      return <FileSpreadsheet size={20} className="text-emerald-400" />;
    }
    if (type.includes('CODE') || type.includes('JSON')) {
      return <FileCode size={20} className="text-cyan-400" />;
    }
    return <FileText size={20} className="text-rose-400" />;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <FolderOpen size={14} />
            <span>AL-USWAH Shared Documents & Files Repository</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Class Files Vault & Materials Upload
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Upload PDF lecture notes, class routines, lab formula sheets, worksheets, and cashier fund reports by file name.
          </p>
        </div>

        <button
          onClick={() => {
            setShowUploadModal(true);
            playChime('click');
          }}
          className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-cyan-600/30 transition flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <Upload size={16} />
          <span>Upload File by Name</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search files by name or subject..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: `All Files (${classFiles.length})` },
            { id: 'Class Routine', label: 'Routines' },
            { id: 'Study Notes', label: 'Study Notes' },
            { id: 'Worksheet', label: 'Worksheets' },
            { id: 'Fund Report', label: 'Fund Reports' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setCategoryFilter(tab.id);
                playChime('click');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                categoryFilter === tab.id
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Files Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredFiles.map(file => (
          <div
            key={file.id}
            className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition shadow-lg flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-3 rounded-2xl bg-slate-800 border border-slate-700">
                    {getFileIcon(file.fileType)}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white leading-snug">
                      {file.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
                        {file.category}
                      </span>
                      <span>•</span>
                      <span className="text-cyan-300 font-semibold">{file.subject}</span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => deleteClassFile(file.id)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-xl transition cursor-pointer"
                  title="Delete File"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {file.description && (
                <p className="mt-3 text-xs text-slate-300 line-clamp-2 leading-relaxed">
                  {file.description}
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-2">
                <span className="font-mono text-slate-300">{file.size}</span>
                <span>•</span>
                <span>{file.uploadedAt}</span>
              </div>

              <button
                onClick={() => handleDownload(file)}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-cyan-200 border border-slate-700/80 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={13} />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ===================== UPLOAD FILE MODAL ===================== */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400">
                  <Upload size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Upload Class Document</h3>
                  <p className="text-xs text-slate-400">Specify file name and details for AL-USWAH repository</p>
                </div>
              </div>
              <button
                onClick={() => setShowUploadModal(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              {/* Optional Choose File */}
              <div className="p-4 rounded-2xl bg-slate-800/60 border border-dashed border-slate-700 flex flex-col items-center justify-center gap-2 cursor-pointer"
                   onClick={() => fileInputRef.current?.click()}>
                <Upload size={24} className="text-cyan-400" />
                <div className="text-xs font-bold text-white">
                  Click to select a file from your computer
                </div>
                <div className="text-[11px] text-slate-400">
                  PDF, DOCX, XLSX, PPT, ZIP up to 25MB (auto-fills name)
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleRealFileSelect}
                  className="hidden"
                />
              </div>

              {/* File Name (User requirement: add and upload by names) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  File Name <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Physics Chapter 5 Sound Wave Equations.pdf"
                  value={fileName}
                  onChange={e => setFileName(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Category & Subject */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Study Notes">Study Notes</option>
                    <option value="Class Routine">Class Routine</option>
                    <option value="Worksheet">Practice Worksheet</option>
                    <option value="Fund Report">Cashier Fund Report</option>
                    <option value="Syllabus">Exam Syllabus</option>
                    <option value="Other">Other Document</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Subject</label>
                  <select
                    value={subject}
                    onChange={e => setSubject(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    <option value="Physics">Physics</option>
                    <option value="Advanced Mathematics">Advanced Mathematics</option>
                    <option value="Chemistry">Chemistry</option>
                    <option value="Biology">Biology</option>
                    <option value="Computer Science">Computer Science & AI</option>
                    <option value="English">English Literature</option>
                    <option value="All Subjects">All Subjects</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Brief Description / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Comprehensive formula sheet with solved examples for Term 1"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-600/30 flex items-center gap-1.5"
                >
                  <Upload size={14} />
                  <span>Upload & Save File</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
