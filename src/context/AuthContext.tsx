import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { mockUsers } from '../data/mockData';
import { useNotifications } from './NotificationContext';
import { ManagedClassMember } from './InstitutionContext';

export interface AdminCredentialsRecord {
  name: string;
  username: string;
  email: string;
  password?: string;
  avatar: string;
}

interface AuthContextType {
  currentUser: UserProfile;
  currentRole: UserRole;
  authenticatedStudent: ManagedClassMember | null;
  switchRole: (role: UserRole) => void;
  login: (role: UserRole) => void;
  loginStudent: (student: ManagedClassMember) => void;
  logout: () => void;
  isAuthenticated: boolean;
  updateUser: (fields: Partial<UserProfile>) => void;
  updateAdminProfile: (data: AdminCredentialsRecord) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<UserRole>(() => {
    return (localStorage.getItem('smartclass_role') as UserRole) || 'GUEST';
  });

  const [authenticatedStudent, setAuthenticatedStudent] = useState<ManagedClassMember | null>(() => {
    try {
      const stored = localStorage.getItem('smartclass_student_data');
      if (stored) return JSON.parse(stored);
    } catch {
      // ignore
    }
    return null;
  });

  const getCustomAdminUser = (): UserProfile => {
    const base = mockUsers['SUPER_ADMIN'];
    try {
      const custom = localStorage.getItem('smartclass_admin_custom_credentials');
      if (custom) {
        const parsed: AdminCredentialsRecord = JSON.parse(custom);
        return {
          ...base,
          name: parsed.name || base.name,
          username: parsed.username || base.username,
          email: parsed.email || base.email,
          avatar: parsed.avatar || base.avatar
        };
      }
    } catch {
      // ignore
    }
    return base;
  };

  const [currentUser, setCurrentUser] = useState<UserProfile>(() => {
    const savedRole = (localStorage.getItem('smartclass_role') as UserRole) || 'GUEST';
    
    // Check if student was previously logged in
    if (savedRole === 'STUDENT') {
      try {
        const stored = localStorage.getItem('smartclass_student_data');
        if (stored) {
          const student: ManagedClassMember = JSON.parse(stored);
          return {
            id: student.id,
            name: student.name,
            email: student.email,
            role: 'STUDENT',
            avatar: student.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
            admissionNumber: student.admissionNumber,
            roll: student.roll,
            phone: student.phone,
            class: 'AL-USWAH',
            section: 'A',
            xp: 320,
            level: 3,
            streak: 7,
            coins: 150,
            badges: ['AL-USWAH Scholar', 'Verified Student'],
            attendancePercentage: student.attendanceRate || 0,
            cgpa: student.gpa || 0
          };
        }
      } catch {
        // ignore
      }
    }

    if (savedRole === 'SUPER_ADMIN') {
      return getCustomAdminUser();
    }

    if (savedRole && mockUsers[savedRole]) {
      return mockUsers[savedRole];
    }

    return {
      id: 'usr_guest',
      name: 'Guest Visitor',
      email: 'visitor@smartclass.edu',
      role: 'GUEST',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      xp: 0,
      level: 1,
      streak: 0,
      coins: 0,
      badges: []
    };
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    const savedRole = localStorage.getItem('smartclass_role');
    return Boolean(savedRole && savedRole !== 'GUEST');
  });
  const { playChime, addNotification } = useNotifications();

  useEffect(() => {
    if (currentRole === 'GUEST') {
      setIsAuthenticated(false);
      localStorage.setItem('smartclass_role', 'GUEST');
      localStorage.removeItem('smartclass_student_data');
      localStorage.removeItem('smartclass_student_id');
      setAuthenticatedStudent(null);
      setCurrentUser({
        id: 'usr_guest',
        name: 'Guest Visitor',
        email: 'visitor@smartclass.edu',
        role: 'GUEST',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        xp: 0,
        level: 1,
        streak: 0,
        coins: 0,
        badges: []
      });
    } else if (currentRole === 'SUPER_ADMIN') {
      setIsAuthenticated(true);
      setCurrentUser(getCustomAdminUser());
      localStorage.setItem('smartclass_role', 'SUPER_ADMIN');
      localStorage.removeItem('smartclass_student_data');
      localStorage.removeItem('smartclass_student_id');
      setAuthenticatedStudent(null);
    } else if (mockUsers[currentRole]) {
      setIsAuthenticated(true);
      setCurrentUser(mockUsers[currentRole]);
      localStorage.setItem('smartclass_role', currentRole);
    }
  }, [currentRole]);

  const switchRole = (newRole: UserRole) => {
    setCurrentRole(newRole);
    if (newRole === 'GUEST') {
      setIsAuthenticated(false);
      playChime('click');
      addNotification({
        title: 'Logged Out',
        message: 'You have logged out of the portal.',
        type: 'info'
      });
    } else {
      setIsAuthenticated(true);
      playChime('click');
      const targetUser = newRole === 'SUPER_ADMIN' ? getCustomAdminUser() : mockUsers[newRole];
      addNotification({
        title: `Role Active: ${newRole.replace('_', ' ')}`,
        message: `Now viewing as ${targetUser?.name || newRole}.`,
        type: 'info'
      });
    }
  };

  const login = (role: UserRole) => {
    setCurrentRole(role);
    setIsAuthenticated(true);
    playChime('success');
    const targetUser = role === 'SUPER_ADMIN' ? getCustomAdminUser() : mockUsers[role];
    addNotification({
      title: 'Class Portal Access Granted',
      message: `Welcome, ${targetUser?.name || role}! Access verified.`,
      type: 'success'
    });
  };

  const loginStudent = (student: ManagedClassMember) => {
    // If the student has been granted Super Admin role, authenticate directly as SUPER_ADMIN
    if (student.role === 'SUPER_ADMIN') {
      login('SUPER_ADMIN');
      return;
    }

    const studentProfile: UserProfile = {
      id: student.id,
      name: student.name,
      email: student.email,
      role: 'STUDENT',
      avatar: student.photo || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      admissionNumber: student.admissionNumber,
      roll: student.roll,
      phone: student.phone,
      class: 'AL-USWAH',
      section: 'A',
      xp: 320,
      level: 3,
      streak: 7,
      coins: 150,
      badges: ['AL-USWAH Scholar', 'Verified Student'],
      attendancePercentage: student.attendanceRate || 0,
      cgpa: student.gpa || 0
    };

    setAuthenticatedStudent(student);
    setCurrentUser(studentProfile);
    setCurrentRole('STUDENT');
    setIsAuthenticated(true);

    localStorage.setItem('smartclass_role', 'STUDENT');
    localStorage.setItem('smartclass_student_id', student.id);
    localStorage.setItem('smartclass_student_data', JSON.stringify(student));

    playChime('success');
    addNotification({
      title: 'Student Portal Access Granted',
      message: `Welcome back, ${student.name}! Your AL-USWAH personal dashboard is active.`,
      type: 'success'
    });
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentRole('GUEST');
    setAuthenticatedStudent(null);
    localStorage.setItem('smartclass_role', 'GUEST');
    localStorage.removeItem('smartclass_student_data');
    localStorage.removeItem('smartclass_student_id');
    playChime('click');
    addNotification({
      title: 'Logged Out',
      message: 'You have logged out of the portal.',
      type: 'info'
    });
  };

  const updateUser = (fields: Partial<UserProfile>) => {
    setCurrentUser(prev => ({ ...prev, ...fields }));
  };

  const updateAdminProfile = (data: AdminCredentialsRecord) => {
    try {
      localStorage.setItem('smartclass_admin_custom_credentials', JSON.stringify(data));
      setCurrentUser(prev => ({
        ...prev,
        name: data.name,
        username: data.username,
        email: data.email,
        avatar: data.avatar || prev.avatar
      }));
    } catch (e) {
      console.warn('Could not save custom admin credentials:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        currentRole,
        authenticatedStudent,
        switchRole,
        login,
        loginStudent,
        logout,
        isAuthenticated,
        updateUser,
        updateAdminProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
