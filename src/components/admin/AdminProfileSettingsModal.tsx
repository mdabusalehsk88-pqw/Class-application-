import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  User,
  Lock,
  Mail,
  Upload,
  Eye,
  EyeOff,
  X,
  ShieldCheck,
  Save,
  CheckCircle2,
  Camera
} from 'lucide-react';

interface AdminProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminProfileSettingsModal: React.FC<AdminProfileSettingsModalProps> = ({
  isOpen,
  onClose
}) => {
  const { currentUser, updateAdminProfile } = useAuth();
  const { playChime, addNotification } = useNotifications();

  // Load existing credentials
  const storedCreds = (() => {
    try {
      const saved = localStorage.getItem('smartclass_admin_custom_credentials');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return null;
  })();

  const [name, setName] = useState(currentUser.name || 'Abu Saleh');
  const [username, setUsername] = useState(
    storedCreds?.username || currentUser.username || 'superadminabu@smartclass.pro'
  );
  const [email, setEmail] = useState(
    storedCreds?.email || currentUser.email || 'superadminabu@smartclass.pro'
  );
  const [password, setPassword] = useState(
    storedCreds?.password || 'superadminabuforsmartclass.pro'
  );
  const [confirmPassword, setConfirmPassword] = useState(
    storedCreds?.password || 'superadminabuforsmartclass.pro'
  );
  const [avatar, setAvatar] = useState(currentUser.avatar || '');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Handle direct file upload for profile photo
  const handlePhotoUpload = (file?: File) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      addNotification({
        title: 'File Too Large',
        message: 'Please choose an image under 5 MB.',
        type: 'warning'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setAvatar(reader.result);
        playChime('success');
        addNotification({
          title: 'Photo Uploaded',
          message: 'Profile picture preview updated. Click "Save Profile Changes" to apply.',
          type: 'info'
        });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim()) {
      setErrorMsg('Full name cannot be empty.');
      return;
    }
    if (!username.trim()) {
      setErrorMsg('Username cannot be empty.');
      return;
    }
    if (!password.trim()) {
      setErrorMsg('Password cannot be empty.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      updateAdminProfile({
        name: name.trim(),
        username: username.trim(),
        email: email.trim() || username.trim(),
        password: password.trim(),
        avatar: avatar.trim()
      });

      setIsSaving(false);
      playChime('success');
      addNotification({
        title: 'Credentials & Profile Updated',
        message: `Your username, password, and profile picture have been updated. You can now log in with username: ${username.trim()}`,
        type: 'success'
      });
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative max-h-[92vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          title="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="space-y-1 pr-8">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-300 text-xs font-bold border border-rose-500/20">
            <ShieldCheck size={14} className="text-rose-400" />
            <span>ADMIN ACCOUNT SETTINGS</span>
          </div>
          <h3 className="text-xl font-black text-white">
            Change Username, Password & Profile Picture
          </h3>
          <p className="text-xs text-slate-400">
            Update your admin sign-in credentials and display photo. All changes take effect immediately.
          </p>
        </div>

        {/* Profile Picture Uploader */}
        <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-slate-950/80 border border-slate-800">
          <div className="relative group w-20 h-20 rounded-2xl overflow-hidden border-2 border-rose-500/50 shrink-0 bg-slate-900 flex items-center justify-center">
            {avatar ? (
              <img src={avatar} alt={name} className="w-full h-full object-cover" />
            ) : (
              <User size={36} className="text-slate-500" />
            )}
            <label
              title="Upload new photo"
              className="absolute inset-0 bg-slate-950/80 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-rose-300 text-[10px] font-bold cursor-pointer"
            >
              <Camera size={16} />
              <span>Change</span>
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={e => handlePhotoUpload(e.target.files?.[0])}
              />
            </label>
          </div>

          <div className="flex-1 min-w-0 space-y-2 text-center sm:text-left">
            <div className="text-xs font-bold text-white">Profile Photo</div>
            <div className="flex flex-wrap items-center gap-2 justify-center sm:justify-start">
              <label className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition shadow-md shadow-rose-600/20">
                <Upload size={13} />
                <span>Upload from Device</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handlePhotoUpload(e.target.files?.[0])}
                />
              </label>
              {avatar && (
                <button
                  type="button"
                  onClick={() => setAvatar('')}
                  className="text-xs text-slate-400 hover:text-rose-400 underline cursor-pointer"
                >
                  Remove Photo
                </button>
              )}
            </div>
            <input
              type="text"
              value={avatar}
              onChange={e => setAvatar(e.target.value)}
              placeholder="Or paste photo link (URL)..."
              className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] text-slate-300 font-mono"
            />
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">
              Admin Full Name *
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g., Abu Saleh"
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Admin Username *
              </label>
              <div className="relative">
                <ShieldCheck size={15} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  placeholder="Username for sign in"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Admin Email (Optional)
              </label>
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                New Password *
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-9 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300 cursor-pointer"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Confirm Password *
              </label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
                  required
                />
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMsg}
            </div>
          )}

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black transition flex items-center gap-2 shadow-lg shadow-rose-600/30 cursor-pointer"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>

        <div className="pt-2 text-center text-[11px] text-slate-500 flex items-center justify-center gap-1.5">
          <CheckCircle2 size={13} className="text-emerald-400" />
          <span>Your credentials are saved securely in your browser session.</span>
        </div>
      </div>
    </div>
  );
};
