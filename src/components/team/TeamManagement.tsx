import React, { useState } from 'react';
import {
  Building2,
  Check,
  Edit2,
  Mail,
  Phone,
  Plus,
  Shield,
  ShieldCheck,
  UserCheck,
  UserPlus,
  Users,
  Wrench,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserProfile, UserRole } from '../../types';

export const TeamManagement: React.FC = () => {
  const { allUsers, profile, isAdmin, isCoordinator, refreshUsers } = useAuth();

  const [selectedUserForEdit, setSelectedUserForEdit] = useState<UserProfile | null>(null);
  const [newRole, setNewRole] = useState<UserRole>('brother');
  const [newQualifications, setNewQualifications] = useState<string[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [filterRole, setFilterRole] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const QUALIFICATION_OPTIONS = [
    'General Maintenance',
    'Certified Electrician',
    'Electrical Safety',
    'Plumbing License / Experience',
    'HVAC Certified',
    'AV Technician Training',
    'Equipment Operator',
    'Safety Inspector / Elder',
    'Carpentry / Furniture Care'
  ];

  const filteredUsers = allUsers.filter((u) => {
    if (filterRole !== 'all' && u.role !== filterRole) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = u.displayName.toLowerCase().includes(q);
      const matchEmail = u.email.toLowerCase().includes(q);
      const matchCong = u.congregation?.toLowerCase().includes(q);
      if (!matchName && !matchEmail && !matchCong) return false;
    }
    return true;
  });

  const openEditModal = (user: UserProfile) => {
    setSelectedUserForEdit(user);
    setNewRole(user.role);
    setNewQualifications(user.qualifications || []);
    setIsEditing(true);
  };

  const toggleQualification = (qual: string) => {
    setNewQualifications(prev =>
      prev.includes(qual) ? prev.filter(q => q !== qual) : [...prev, qual]
    );
  };

  const handleSaveUserRoles = async () => {
    if (!selectedUserForEdit) return;

    try {
      const { doc, updateDoc } = await import('firebase/firestore');
      const { db } = await import('../../firebase/config');

      await updateDoc(doc(db, 'users', selectedUserForEdit.uid), {
        role: newRole,
        qualifications: newQualifications,
        updatedAt: new Date().toISOString()
      });

      // If made admin, also add to admins collection
      if (newRole === 'admin') {
        const { setDoc } = await import('firebase/firestore');
        await setDoc(doc(db, 'admins', selectedUserForEdit.uid), {
          email: selectedUserForEdit.email,
          addedAt: new Date().toISOString()
        });
      }

      await refreshUsers();
      setIsEditing(false);
      setSelectedUserForEdit(null);
    } catch (err) {
      console.error('Failed to update brother permissions:', err);
      alert('Failed to update user. Please check your permissions.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
            Kingdom Hall Maintenance Team & Brothers
          </h2>
          <p className="text-xs text-slate-500">
            Congregation volunteers, qualifications, and role-based permissions
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <span className="text-xs px-3 py-1.5 rounded-xl bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300 font-semibold flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" /> Administrator Access Enabled
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search brother by name, email, or congregation..."
          className="w-full sm:w-72 px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-slate-900 dark:text-slate-100"
        />

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-400">Role:</span>
          <select
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 py-1.5 px-3 text-xs text-slate-700 dark:text-slate-200"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="coordinator">Maintenance Coordinators</option>
            <option value="brother">Assigned Brothers</option>
          </select>
        </div>
      </div>

      {/* Team Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {filteredUsers.map((brother) => {
          const isCurrentUser = profile?.uid === brother.uid;
          return (
            <div
              key={brother.uid}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-2xs hover:border-blue-400 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-xs">
                      {brother.displayName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                          {brother.displayName}
                        </h4>
                        {isCurrentUser && (
                          <span className="text-[9px] bg-blue-100 text-blue-700 font-bold px-1.5 py-0.2 rounded">
                            You
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-400">{brother.congregation || 'Local Congregation'}</p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    brother.role === 'admin' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' :
                    brother.role === 'coordinator' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                    'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  }`}>
                    {brother.role}
                  </span>
                </div>

                {/* Contact info */}
                <div className="space-y-1 text-slate-500 text-[11px] my-3">
                  {brother.email && (
                    <div className="flex items-center gap-1.5 truncate">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{brother.email}</span>
                    </div>
                  )}
                  {brother.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      <span>{brother.phone}</span>
                    </div>
                  )}
                </div>

                {/* Qualifications */}
                <div>
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                    Qualifications & Skills
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {brother.qualifications && brother.qualifications.length > 0 ? (
                      brother.qualifications.map((q, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {q}
                        </span>
                      ))
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">General Maintenance</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Admin Actions */}
              {(isAdmin || isCoordinator) && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => openEditModal(brother)}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Role & Qualifications
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Role & Qualifications Modal */}
      {isEditing && selectedUserForEdit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                Edit Brother Permissions
              </h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {selectedUserForEdit.displayName}
                </p>
                <p className="text-xs text-slate-500">{selectedUserForEdit.email}</p>
              </div>

              {/* Role selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  System Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                >
                  <option value="brother">Assigned Brother (Accept/Decline, perform work, checklists)</option>
                  <option value="coordinator">Maintenance Coordinator (Create, assign, schedule, reassign, review)</option>
                  {isAdmin && <option value="admin">Administrator (Full administrative access, manage roles)</option>}
                </select>
              </div>

              {/* Qualifications */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Qualifications & Skills
                </label>
                <div className="space-y-1.5 max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 bg-slate-50 dark:bg-slate-900/40">
                  {QUALIFICATION_OPTIONS.map((qual) => {
                    const isChecked = newQualifications.includes(qual);
                    return (
                      <div
                        key={qual}
                        onClick={() => toggleQualification(qual)}
                        className={`flex items-center gap-2 p-1.5 rounded-lg text-xs cursor-pointer ${
                          isChecked ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 font-semibold' : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded text-blue-600"
                        />
                        <span>{qual}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveUserRoles}
                  className="px-5 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs"
                >
                  Save Permissions
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
