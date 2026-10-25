import React, { useState, useRef } from 'react';
import { useNotifications } from '../../context/NotificationContext';
import { useInstitution, ManagedClassMember } from '../../context/InstitutionContext';
import { UserRole, UserPermissions } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Trash2,
  Edit,
  X,
  Shield,
  GraduationCap,
  Briefcase,
  Camera,
  Upload,
  Mail,
  Hash,
  Phone,
  Save,
  Check,
  AlertCircle,
  Key,
  Copy,
  Lock,
  Eye,
  EyeOff
} from 'lucide-react';

export const AdminUserManagement: React.FC = () => {
  const { studentsList, addUser, updateUser, deleteUser, toggleUserStatus, toggleCashierRole, updateUserPermissions } = useInstitution();
  const { playChime, addNotification } = useNotifications();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Add User State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserAdmissionNo, setNewUserAdmissionNo] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole>('STUDENT');
  const [newUserRoll, setNewUserRoll] = useState('');
  const [newUserPhone, setNewUserPhone] = useState('');
  const [newUserGender, setNewUserGender] = useState<'Boy' | 'Girl'>('Boy');
  const [newUserPhoto, setNewUserPhoto] = useState<string>('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('student123');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [newUserPermissions, setNewUserPermissions] = useState<UserPermissions>({});
  const [newUserIsCashier, setNewUserIsCashier] = useState(false);
  const addFileInputRef = useRef<HTMLInputElement>(null);

  // Edit User State
  const [editingUser, setEditingUser] = useState<ManagedClassMember | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAdmissionNo, setEditAdmissionNo] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('STUDENT');
  const [editRoll, setEditRoll] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editGender, setEditGender] = useState<'Boy' | 'Girl'>('Boy');
  const [editPhoto, setEditPhoto] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'SUSPENDED'>('ACTIVE');
  const [editUsername, setEditUsername] = useState('');
  const [editPassword, setEditPassword] = useState('');
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [editPermissions, setEditPermissions] = useState<UserPermissions>({});
  const [editIsCashier, setEditIsCashier] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  // Handle Photo Upload (File reader to DataURL)
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, isEdit: boolean) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        addNotification({
          title: 'File too large',
          message: 'Please choose an image under 5MB.',
          type: 'warning'
        });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (isEdit) {
          setEditPhoto(result);
        } else {
          setNewUserPhoto(result);
        }
        playChime('click');
      };
      reader.readAsDataURL(file);
    }
  };

  const openEditModal = (member: ManagedClassMember) => {
    setEditingUser(member);
    setEditName(member.name);
    setEditEmail(member.email);
    setEditAdmissionNo(member.admissionNumber || '');
    setEditRole(member.role);
    setEditRoll(member.roll || '');
    setEditPhone(member.phone || '');
    setEditGender(member.gender || 'Boy');
    setEditPhoto(member.photo || '');
    setEditStatus(member.status);
    setEditUsername(member.username || member.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'student');
    setEditPassword(member.password || 'student123');
    setEditPermissions(member.permissions || {});
    setEditIsCashier(member.isCashier || member.role === 'CASHIER' || (member.permissions?.funds ?? false));
    setShowEditPassword(false);
    playChime('click');
  };

  const handleCopyCredentials = (member: ManagedClassMember) => {
    const userStr = member.username || member.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || 'student';
    const passStr = member.password || 'student123';
    navigator.clipboard?.writeText(`Username: ${userStr}\nPassword: ${passStr}`);
    playChime('click');
    addNotification({
      title: 'Credentials Copied',
      message: `Login details for ${member.name}: Username: ${userStr} | Password: ${passStr}`,
      type: 'success'
    });
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    if (!editName.trim() || !editEmail.trim() || !editAdmissionNo.trim()) {
      addNotification({
        title: 'Missing Required Fields',
        message: 'Name, Email, and Admission Number are required.',
        type: 'warning'
      });
      return;
    }

    const isCashierRole = editRole === 'CASHIER' || editIsCashier;

    updateUser(editingUser.id, {
      name: editName.trim(),
      email: editEmail.trim(),
      admissionNumber: editAdmissionNo.trim(),
      role: editRole,
      roll: (editRole === 'STUDENT' || editRole === 'CASHIER') ? editRoll.trim() || 'N/A' : undefined,
      phone: editPhone.trim() || '+1 (555) 000-0000',
      gender: editGender,
      photo: editPhoto || editingUser.photo,
      status: editStatus,
      isCashier: isCashierRole,
      permissions: {
        ...editPermissions,
        funds: isCashierRole || editPermissions.funds
      },
      username: editUsername.trim().toLowerCase() || editName.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10),
      password: editPassword.trim() || 'student123'
    });

    setEditingUser(null);
  };

  const handleAddUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim() || !newUserAdmissionNo.trim()) {
      addNotification({
        title: 'Missing Required Fields',
        message: 'Please provide Name, Email, and Admission Number.',
        type: 'warning'
      });
      return;
    }

    const defaultAvatar = newUserPhoto || (
      newUserGender === 'Girl'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
    );

    const generatedUser = newUserUsername.trim().toLowerCase() || newUserName.trim().toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) || newUserAdmissionNo.toLowerCase();
    const generatedPass = newUserPassword.trim() || 'student123';

    const isCashierRole = newUserRole === 'CASHIER' || newUserIsCashier || Boolean(newUserPermissions.funds);

    addUser({
      name: newUserName.trim(),
      email: newUserEmail.trim(),
      admissionNumber: newUserAdmissionNo.trim(),
      role: newUserRole,
      roll: (newUserRole === 'STUDENT' || newUserRole === 'CASHIER') ? newUserRoll.trim() || '12' : undefined,
      phone: newUserPhone.trim() || '+1 (555) 000-0000',
      gender: newUserGender,
      photo: defaultAvatar,
      status: 'ACTIVE',
      attendanceRate: 95.0,
      gpa: 3.8,
      username: generatedUser,
      password: generatedPass,
      isCashier: isCashierRole,
      permissions: {
        ...newUserPermissions,
        funds: isCashierRole || (newUserPermissions.funds ?? false)
      }
    });

    // Reset Form
    setShowAddModal(false);
    setNewUserName('');
    setNewUserEmail('');
    setNewUserAdmissionNo('');
    setNewUserRoll('');
    setNewUserPhone('');
    setNewUserPhoto('');
    setNewUserUsername('');
    setNewUserPassword('student123');
    setShowNewPassword(false);
    setNewUserPermissions({});
    setNewUserIsCashier(false);
  };

  const filteredMembers = studentsList.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.admissionNumber && m.admissionNumber.toLowerCase().includes(search.toLowerCase())) ||
      (m.roll && m.roll.toLowerCase().includes(search.toLowerCase()));
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-rose-400 uppercase tracking-wider">
            <Shield size={14} />
            <span>AL-USWAH IT Admin Roster & Directory</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
            Class Members & Student Profiles
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Create new students with photos & admission numbers, edit profiles anytime, and manage access.
          </p>
        </div>

        <button
          onClick={() => {
            setShowAddModal(true);
            playChime('click');
          }}
          className="px-5 py-2.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white rounded-2xl text-xs font-bold shadow-lg shadow-rose-600/30 transition flex items-center gap-2 active:scale-95 cursor-pointer"
        >
          <UserPlus size={16} />
          <span>Add New Class Member</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, email, admission #, roll..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-400 focus:outline-none focus:border-rose-500 transition"
          />
        </div>

        {/* Role Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          {[
            { id: 'ALL', label: `All (${studentsList.length})` },
            { id: 'STUDENT', label: `Students (${studentsList.filter(s => s.role === 'STUDENT').length})` },
            { id: 'SUPER_ADMIN', label: `Super Admin (${studentsList.filter(s => s.role === 'SUPER_ADMIN').length})` }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => {
                setRoleFilter(tab.id);
                playChime('click');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                roleFilter === tab.id
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Roster Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMembers.map(member => (
          <div
            key={member.id}
            className={`p-5 rounded-3xl border transition shadow-lg relative flex flex-col justify-between ${
              member.status === 'ACTIVE'
                ? 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                : 'bg-rose-950/20 border-rose-900/50 opacity-75'
            }`}
          >
            <div>
              {/* Member Card Top */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={member.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                      alt={member.name}
                      className="w-13 h-13 rounded-2xl object-cover border-2 border-slate-700 shadow-md"
                    />
                    <span
                      className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-slate-900 ${
                        member.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white flex items-center gap-1.5">
                      <span>{member.name}</span>
                      {member.roll && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                          Roll {member.roll}
                        </span>
                      )}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                      <span className="font-mono text-cyan-300 font-semibold">
                        {member.admissionNumber || 'No Adm #'}
                      </span>
                      <span>•</span>
                      <span className="text-slate-400">{member.gender || 'Class Member'}</span>
                    </div>
                  </div>
                </div>

                {/* Role Badge & Cashier Quick Toggle */}
                <div className="flex flex-col items-end gap-1">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      member.role === 'SUPER_ADMIN'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : member.role === 'CASHIER' || member.isCashier
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
                    }`}
                  >
                    {member.role === 'SUPER_ADMIN'
                      ? 'SUPER ADMIN'
                      : member.role === 'CASHIER' || member.isCashier
                      ? '💰 CASHIER'
                      : 'STUDENT'}
                  </span>
                  {member.role !== 'SUPER_ADMIN' && (
                    <button
                      type="button"
                      onClick={() => toggleCashierRole(member.id)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition cursor-pointer ${
                        member.isCashier || member.role === 'CASHIER'
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                      title="Grant or remove cashier access to add/edit/modify Class Funds"
                    >
                      {member.isCashier || member.role === 'CASHIER' ? '✓ Cashier Active' : '+ Grant Cashier'}
                    </button>
                  )}
                </div>
              </div>

              {/* Details & Contacts */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Mail size={13} className="text-slate-500 shrink-0" />
                  <span className="truncate font-mono text-[11px] text-slate-300">{member.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={13} className="text-slate-500 shrink-0" />
                  <span className="text-[11px] text-slate-400">{member.phone || 'No phone listed'}</span>
                </div>
              </div>

              {/* Student Login Credentials */}
              <div className="mt-3 p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-[11px] space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-slate-300">
                    <Key size={12} className="text-amber-400" />
                    <span>Student Login Credentials:</span>
                  </div>
                  <button
                    onClick={() => handleCopyCredentials(member)}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 transition flex items-center gap-1 font-mono font-semibold cursor-pointer px-1.5 py-0.5 rounded bg-indigo-500/10 hover:bg-indigo-500/20"
                    title="Copy username & password"
                  >
                    <Copy size={10} />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-0.5 text-[11px] font-mono">
                  <div className="bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-sans">Username:</span>
                    <span className="text-amber-300 truncate block font-bold">{member.username || member.name.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10)}</span>
                  </div>
                  <div className="bg-slate-900/90 px-2 py-1 rounded-lg border border-slate-800/80">
                    <span className="text-[10px] text-slate-400 block font-sans">Password:</span>
                    <span className="text-indigo-300 truncate block font-bold">{member.password || 'student123'}</span>
                  </div>
                </div>
              </div>

              {/* Granted Delegated Permissions */}
              {(member.isCashier || member.role === 'CASHIER' || (member.permissions && Object.values(member.permissions).some(Boolean))) && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex flex-wrap gap-1 items-center">
                  <span className="text-[10px] text-slate-500 font-semibold mr-1">Access:</span>
                  {(member.isCashier || member.role === 'CASHIER' || member.permissions?.funds) && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                      💰 Funds & Dues
                    </span>
                  )}
                  {member.permissions?.attendance && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                      📋 Attendance
                    </span>
                  )}
                  {member.permissions?.marks && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/15 text-rose-300 border border-rose-500/30 font-semibold">
                      📝 Marks
                    </span>
                  )}
                  {member.permissions?.routine && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 font-semibold">
                      📅 Routine
                    </span>
                  )}
                  {member.permissions?.notices && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                      📢 Notices
                    </span>
                  )}
                  {member.permissions?.files && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 font-semibold">
                      📁 Files
                    </span>
                  )}
                  {member.permissions?.website_builder && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-semibold">
                      🌐 Website
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <button
                onClick={() => toggleUserStatus(member.id)}
                className={`text-[11px] font-bold px-2 py-1 rounded-lg transition cursor-pointer flex items-center gap-1 ${
                  member.status === 'ACTIVE'
                    ? 'text-emerald-400 hover:bg-emerald-500/10'
                    : 'text-amber-400 hover:bg-amber-500/10'
                }`}
              >
                {member.status === 'ACTIVE' ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
                <span>{member.status}</span>
              </button>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(member)}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-bold transition flex items-center gap-1 border border-slate-700/80 cursor-pointer"
                  title="Edit user details"
                >
                  <Edit size={13} />
                  <span>Edit</span>
                </button>

                {member.role !== 'SUPER_ADMIN' && (
                  <button
                    onClick={() => deleteUser(member.id)}
                    className="p-1.5 text-rose-400 hover:bg-rose-500/20 rounded-xl transition cursor-pointer"
                    title="Remove user"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {filteredMembers.length === 0 && (
          <div className="col-span-full py-16 px-6 text-center rounded-3xl bg-slate-900/40 border border-dashed border-slate-800 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Users size={32} />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">No Members Found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                {roleFilter === 'STUDENT'
                  ? 'No students added yet. Click "Enroll New Class Member" to register your first student with custom credentials.'
                  : 'No class members match this search criteria or filter.'}
              </p>
            </div>
            <button
              onClick={() => {
                setShowAddModal(true);
                playChime('click');
              }}
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-2xl text-xs font-bold transition inline-flex items-center gap-2 cursor-pointer shadow-lg shadow-rose-600/30"
            >
              <UserPlus size={15} />
              <span>Enroll New Class Member</span>
            </button>
          </div>
        )}
      </div>

      {/* ===================== ADD USER MODAL ===================== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Enroll New Class Member</h3>
                  <p className="text-xs text-slate-400">AL-USWAH Directory Registration</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-4">
              {/* Photo Upload Section */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <div className="relative">
                  <img
                    src={
                      newUserPhoto ||
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'
                    }
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-600 shadow"
                  />
                  <button
                    type="button"
                    onClick={() => addFileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg shadow cursor-pointer"
                    title="Upload photo"
                  >
                    <Camera size={12} />
                  </button>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Upload size={13} className="text-rose-400" />
                    <span>Upload Student / Member Photo</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Upload JPEG/PNG image or enter image URL below
                  </p>
                  <input
                    ref={addFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={e => handlePhotoUpload(e, false)}
                    className="hidden"
                  />
                  <input
                    type="url"
                    placeholder="Or paste photo URL here..."
                    value={newUserPhoto}
                    onChange={e => setNewUserPhoto(e.target.value)}
                    className="w-full px-2.5 py-1 text-[11px] bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              {/* Full Name & Admission Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Ahsan Habib"
                    value={newUserName}
                    onChange={e => setNewUserName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Hash size={12} className="text-rose-400" />
                    <span>Admission Number</span> <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., ADM-2026-042"
                    value={newUserAdmissionNo}
                    onChange={e => setNewUserAdmissionNo(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
              </div>

              {/* Email Box */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Mail size={12} className="text-indigo-400" />
                  <span>Email Address</span> <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="student@smartclass.edu"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>

              {/* Role & Roll */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Role in Class
                  </label>
                  <select
                    value={newUserRole}
                    onChange={e => {
                      const newRole = e.target.value as UserRole;
                      setNewUserRole(newRole);
                      if (newRole === 'CASHIER') {
                        setNewUserIsCashier(true);
                        setNewUserPermissions(prev => ({ ...prev, funds: true }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="CASHIER">Cashier (Class Fund & Fees Manager)</option>
                    <option value="SUPER_ADMIN">Super Admin (IT Officer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Roll No (If Student)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 11"
                    value={newUserRoll}
                    onChange={e => setNewUserRoll(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={newUserGender}
                    onChange={e => setNewUserGender(e.target.value as 'Boy' | 'Girl')}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500 cursor-pointer"
                  >
                    <option value="Boy">Boy</option>
                    <option value="Girl">Girl</option>
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  placeholder="+1 (555) 789-0123"
                  value={newUserPhone}
                  onChange={e => setNewUserPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>

              {/* Login Credentials Section */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <Key size={14} className="text-amber-400" />
                    <span>Student Login Credentials (Required for Portal)</span>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-semibold">
                    Login Access
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Provide the username and password this student will type to log in to their student marksheet & fee dashboard.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Login Username
                    </label>
                    <input
                      type="text"
                      placeholder={newUserName ? newUserName.toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 10) : 'e.g., sadia'}
                      value={newUserUsername}
                      onChange={e => setNewUserUsername(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-300">
                        Login Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setNewUserPassword(`pass${Math.floor(100 + Math.random() * 900)}`)}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        Auto-generate
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={newUserPassword}
                        onChange={e => setNewUserPassword(e.target.value)}
                        placeholder="student123"
                        className="w-full pl-3 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 transition"
                      >
                        {showNewPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Granular Section Access & Delegated Permissions */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                    <Shield size={14} className="text-amber-400" />
                    <span>Admin Panel Delegated Permissions</span>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-semibold">
                    Access Control
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Grant this user permission to access corresponding management pages inside their student dashboard.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUserIsCashier || newUserPermissions.funds || newUserRole === 'CASHIER'}
                      onChange={e => {
                        const checked = e.target.checked;
                        setNewUserIsCashier(checked);
                        setNewUserPermissions(prev => ({ ...prev, funds: checked }));
                        if (checked && newUserRole === 'STUDENT') setNewUserRole('CASHIER');
                      }}
                      className="rounded accent-amber-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">💰 Class Funds, Ledger & Student Dues</div>
                      <div className="text-[10px] text-slate-400">Add, edit, and modify funds & dues</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUserPermissions.attendance ?? false}
                      onChange={e => setNewUserPermissions(prev => ({ ...prev, attendance: e.target.checked }))}
                      className="rounded accent-cyan-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">📋 Class Attendance Management</div>
                      <div className="text-[10px] text-slate-400">Take & modify daily attendance</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUserPermissions.marks ?? false}
                      onChange={e => setNewUserPermissions(prev => ({ ...prev, marks: e.target.checked }))}
                      className="rounded accent-rose-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">📝 Student Marks Portal</div>
                      <div className="text-[10px] text-slate-400">Edit grades and evaluation cards</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUserPermissions.routine ?? false}
                      onChange={e => setNewUserPermissions(prev => ({ ...prev, routine: e.target.checked }))}
                      className="rounded accent-indigo-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">📅 Class Routine Builder</div>
                      <div className="text-[10px] text-slate-400">Manage weekly period schedule</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUserPermissions.notices ?? false}
                      onChange={e => setNewUserPermissions(prev => ({ ...prev, notices: e.target.checked }))}
                      className="rounded accent-amber-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">📢 Class Notices Manager</div>
                      <div className="text-[10px] text-slate-400">Post urgent class announcements</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUserPermissions.files ?? false}
                      onChange={e => setNewUserPermissions(prev => ({ ...prev, files: e.target.checked }))}
                      className="rounded accent-blue-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">📁 Class Files Management</div>
                      <div className="text-[10px] text-slate-400">Upload and organize study docs</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newUserPermissions.website_builder ?? false}
                      onChange={e => setNewUserPermissions(prev => ({ ...prev, website_builder: e.target.checked }))}
                      className="rounded accent-emerald-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">🌐 Public Website Builder</div>
                      <div className="text-[10px] text-slate-400">Modify CMS, pages & theme</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Check size={14} />
                  <span>Enroll Member & Save</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===================== EDIT USER MODAL ===================== */}
      {editingUser && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Edit size={18} />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Edit Member Profile</h3>
                  <p className="text-xs text-slate-400">Update photo, admission number, email & role</p>
                </div>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Photo Upload Section */}
              <div className="flex items-center gap-4 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/80">
                <div className="relative">
                  <img
                    src={editPhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
                    alt="Preview"
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-600 shadow"
                  />
                  <button
                    type="button"
                    onClick={() => editFileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg shadow cursor-pointer"
                    title="Change photo"
                  >
                    <Camera size={12} />
                  </button>
                </div>
                <div className="flex-1 space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Upload size={13} className="text-indigo-400" />
                    <span>Change Member Photo</span>
                  </div>
                  <input
                    ref={editFileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={e => handlePhotoUpload(e, true)}
                    className="hidden"
                  />
                  <input
                    type="url"
                    placeholder="Or paste photo URL here..."
                    value={editPhoto}
                    onChange={e => setEditPhoto(e.target.value)}
                    className="w-full px-2.5 py-1 text-[11px] bg-slate-900 border border-slate-700 rounded-lg text-slate-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Name & Admission Number */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Full Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                    <Hash size={12} className="text-cyan-400" />
                    <span>Admission Number</span> <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editAdmissionNo}
                    onChange={e => setEditAdmissionNo(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                  />
                </div>
              </div>

              {/* Email Box */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1 flex items-center gap-1">
                  <Mail size={12} className="text-indigo-400" />
                  <span>Email Address</span> <span className="text-rose-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={editEmail}
                  onChange={e => setEditEmail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                />
              </div>

              {/* Role, Roll & Gender */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Role in Class
                  </label>
                  <select
                    value={editRole}
                    onChange={e => {
                      const newR = e.target.value as UserRole;
                      setEditRole(newR);
                      if (newR === 'CASHIER') {
                        setEditIsCashier(true);
                        setEditPermissions(prev => ({ ...prev, funds: true }));
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="STUDENT">Student</option>
                    <option value="CASHIER">Cashier (Class Fund & Fees Manager)</option>
                    <option value="SUPER_ADMIN">Super Admin (IT Officer)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Roll No
                  </label>
                  <input
                    type="text"
                    value={editRoll}
                    onChange={e => setEditRoll(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Account Status
                  </label>
                  <select
                    value={editStatus}
                    onChange={e => setEditStatus(e.target.value as 'ACTIVE' | 'SUSPENDED')}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-[11px] font-bold text-slate-300 mb-1">
                  Contact Phone
                </label>
                <input
                  type="tel"
                  value={editPhone}
                  onChange={e => setEditPhone(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Login Credentials Section */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-300">
                    <Key size={14} className="text-amber-400" />
                    <span>Student Login Credentials</span>
                  </div>
                  <span className="text-[10px] text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 font-semibold">
                    Portal Login
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Update username and password for this member's student portal sign in.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">
                      Login Username
                    </label>
                    <input
                      type="text"
                      value={editUsername}
                      onChange={e => setEditUsername(e.target.value)}
                      placeholder="e.g., sadia"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-slate-300">
                        Login Password
                      </label>
                      <button
                        type="button"
                        onClick={() => setEditPassword(`pass${Math.floor(100 + Math.random() * 900)}`)}
                        className="text-[10px] text-indigo-400 hover:text-indigo-300 cursor-pointer"
                      >
                        Reset pass
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showEditPassword ? 'text' : 'password'}
                        value={editPassword}
                        onChange={e => setEditPassword(e.target.value)}
                        placeholder="student123"
                        className="w-full pl-3 pr-8 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        className="absolute right-2.5 top-2.5 text-slate-500 hover:text-slate-300 transition"
                      >
                        {showEditPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Granular Section Access & Cashier Role Delegation */}
              <div className="p-4 rounded-2xl bg-slate-800/40 border border-slate-700/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 font-bold text-white text-xs">
                    <Shield size={14} className="text-amber-400" />
                    <span>Admin Panel Delegated Permissions</span>
                  </div>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-semibold">
                    Access Control
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Grant this user direct permission to manage specific areas of the class management system.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editIsCashier || editPermissions.funds || editRole === 'CASHIER'}
                      onChange={e => {
                        const checked = e.target.checked;
                        setEditIsCashier(checked);
                        setEditPermissions(prev => ({ ...prev, funds: checked }));
                        if (checked && editRole === 'STUDENT') setEditRole('CASHIER');
                      }}
                      className="rounded accent-amber-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">💰 Class Funds & Dues (Cashier)</div>
                      <div className="text-[10px] text-slate-400">Add, edit, and modify funds & dues</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.attendance ?? false}
                      onChange={e => setEditPermissions(prev => ({ ...prev, attendance: e.target.checked }))}
                      className="rounded accent-cyan-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">📋 Attendance Register</div>
                      <div className="text-[10px] text-slate-400">Take & modify daily attendance</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.marks ?? false}
                      onChange={e => setEditPermissions(prev => ({ ...prev, marks: e.target.checked }))}
                      className="rounded accent-rose-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">📝 Student Marks Portal</div>
                      <div className="text-[10px] text-slate-400">Edit grades and evaluation cards</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.routine ?? false}
                      onChange={e => setEditPermissions(prev => ({ ...prev, routine: e.target.checked }))}
                      className="rounded accent-indigo-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">📅 Class Routine Builder</div>
                      <div className="text-[10px] text-slate-400">Manage weekly period schedule</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.notices ?? false}
                      onChange={e => setEditPermissions(prev => ({ ...prev, notices: e.target.checked }))}
                      className="rounded accent-amber-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">📢 Class Notices Manager</div>
                      <div className="text-[10px] text-slate-400">Post urgent class announcements</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.files ?? false}
                      onChange={e => setEditPermissions(prev => ({ ...prev, files: e.target.checked }))}
                      className="rounded accent-blue-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">📁 Class Files Management</div>
                      <div className="text-[10px] text-slate-400">Upload and organize study docs</div>
                    </div>
                  </label>

                  <label className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editPermissions.website_builder ?? false}
                      onChange={e => setEditPermissions(prev => ({ ...prev, website_builder: e.target.checked }))}
                      className="rounded accent-emerald-500 cursor-pointer"
                    />
                    <div>
                      <div className="font-bold text-white text-[11px]">🌐 Public Website Builder</div>
                      <div className="text-[10px] text-slate-400">Modify CMS, pages & theme</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
