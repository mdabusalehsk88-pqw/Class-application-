import React, { useState } from 'react';
import { mockStudyMaterials } from '../../data/mockData';
import { StudyMaterial } from '../../types';
import { useNotifications } from '../../context/NotificationContext';
import { useInstitution } from '../../context/InstitutionContext';
import {
  BookOpen,
  FileText,
  Video,
  Download,
  Bookmark,
  Search,
  Eye,
  X,
  FolderOpen
} from 'lucide-react';

export const MaterialsView: React.FC = () => {
  const { classFiles } = useInstitution();
  const [materials, setMaterials] = useState<StudyMaterial[]>(mockStudyMaterials);
  const [search, setSearch] = useState('');
  const [previewMaterial, setPreviewMaterial] = useState<StudyMaterial | null>(null);
  const { playChime, addNotification } = useNotifications();

  const handleDownload = (mat: StudyMaterial) => {
    setMaterials(prev =>
      prev.map(m => (m.id === mat.id ? { ...m, downloadCount: m.downloadCount + 1 } : m))
    );
    playChime('success');
    addNotification({
      title: 'Download Complete',
      message: `${mat.title} saved to your device.`,
      type: 'success'
    });

    const blob = new Blob([`Class 10-A Material: ${mat.title}\nSubject: ${mat.subject}\nChapter: ${mat.chapter}\nUploader: ${mat.uploader}\n\nNotes Content: Verified study material for Grade 10 Science & Technology.`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${mat.title}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleToggleBookmark = (id: string) => {
    setMaterials(prev =>
      prev.map(m => (m.id === id ? { ...m, bookmarked: !m.bookmarked } : m))
    );
    playChime('click');
  };

  const filteredMaterials = materials.filter(
    m =>
      m.title.toLowerCase().includes(search.toLowerCase()) ||
      m.subject.toLowerCase().includes(search.toLowerCase()) ||
      m.chapter.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFiles = (classFiles || []).filter(
    f =>
      f.name.toLowerCase().includes(search.toLowerCase()) ||
      f.subject.toLowerCase().includes(search.toLowerCase()) ||
      f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
            <BookOpen size={14} />
            <span>Class 10-A Digital Repository & Study Materials</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Handouts, Lecture Slides, Files & Video Tutorials
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Subject-specific notes, worksheets, and uploaded resources curated by Class IT Admin & Teachers.
          </p>
        </div>

        {/* Search */}
        <div className="w-full md:w-72 relative">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search notes, chapters, or files..."
            className="w-full bg-slate-800 border border-slate-700 rounded-2xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Uploaded Class Files Section (From Super Admin) */}
      {filteredFiles.length > 0 && (
        <div className="space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
            <FolderOpen size={14} className="text-cyan-400" />
            <span>Official Class Files & Documents ({filteredFiles.length})</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFiles.map(file => (
              <div
                key={file.id}
                className="p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition shadow-lg flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 text-[11px] font-bold border border-cyan-500/30">
                      {file.category} • {file.subject}
                    </span>
                    <span className="text-[11px] font-mono text-slate-400">{file.size}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-1">{file.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                    {file.description || 'Uploaded for Class 10-A members.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500">By {file.uploader}</span>
                  <button
                    onClick={() => {
                      playChime('success');
                      addNotification({
                        title: 'File Downloaded',
                        message: `"${file.name}" downloaded to your device.`,
                        type: 'success'
                      });
                      const blob = new Blob([`Class 10-A Document: ${file.name}\nSubject: ${file.subject}\nCategory: ${file.category}\nUploader: ${file.uploader}`], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = file.name;
                      document.body.appendChild(a);
                      a.click();
                      document.body.removeChild(a);
                      URL.revokeObjectURL(url);
                    }}
                    className="px-3.5 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow"
                  >
                    <Download size={13} />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Grid of Standard Materials */}
      <div className="space-y-3">
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <BookOpen size={14} className="text-indigo-400" />
          <span>Curriculum Lecture Notes & Problem Sheets ({filteredMaterials.length})</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredMaterials.map(mat => (
            <div
              key={mat.id}
              className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-indigo-300 text-[11px] font-bold border border-slate-700">
                    {mat.subject} • {mat.chapter}
                  </span>
                  <button
                    onClick={() => handleToggleBookmark(mat.id)}
                    className={`p-1.5 rounded-lg transition ${
                      mat.bookmarked
                        ? 'text-amber-400 bg-amber-500/10'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    <Bookmark size={16} className={mat.bookmarked ? 'fill-amber-400' : ''} />
                  </button>
                </div>

                <h3 className="text-base font-bold text-white mb-1.5">{mat.title}</h3>
                <p className="text-xs text-slate-400 line-clamp-2 mb-3 leading-relaxed">
                  {mat.description || mat.title}
                </p>

                <div className="text-xs text-slate-400 space-y-1 mb-4 pt-3 border-t border-slate-800">
                  <div className="flex items-center justify-between">
                    <span>Uploader:</span>
                    <span className="font-semibold text-slate-300">{mat.uploader}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>File Format:</span>
                    <span className="font-semibold text-slate-300">
                      {mat.type} {mat.fileSize ? `(${mat.fileSize})` : mat.duration ? `(${mat.duration})` : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Downloads:</span>
                    <span className="font-semibold text-indigo-400">{mat.downloadCount} times</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPreviewMaterial(mat)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Eye size={14} />
                  <span>Preview</span>
                </button>
                <button
                  onClick={() => handleDownload(mat)}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/30 active:scale-95 cursor-pointer"
                >
                  <Download size={14} />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Modal */}
      {previewMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl animate-in zoom-in-95 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">{previewMaterial.title}</h3>
              <button onClick={() => setPreviewMaterial(null)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-8 bg-slate-950 rounded-2xl border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-600/20 text-indigo-400 mx-auto flex items-center justify-center">
                {previewMaterial.type === 'VIDEO' ? <Video size={32} /> : <FileText size={32} />}
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">{previewMaterial.title}</h4>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  {previewMaterial.description}
                </p>
              </div>
              <div className="inline-block p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300">
                Document Viewer Active • Verified by {previewMaterial.uploader}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setPreviewMaterial(null)}
                className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  handleDownload(previewMaterial);
                  setPreviewMaterial(null);
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Download size={14} />
                <span>Download File</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
