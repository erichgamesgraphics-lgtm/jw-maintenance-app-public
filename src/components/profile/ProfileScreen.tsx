import React, { useState } from 'react';
import {
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  FileSpreadsheet,
  Globe,
  LogIn,
  LogOut,
  Mail,
  Moon,
  Phone,
  Settings,
  Shield,
  Smartphone,
  UserCheck,
  Users,
  Wrench
} from 'lucide-react';
import { PWAInstallButton } from '../common/PWAInstallButton';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';

interface ProfileScreenProps {
  onOpenSettings: () => void;
  onOpenReports: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenSettings,
  onOpenReports
}) => {
  const {
    profile,
    firebaseUser,
    isAdmin,
    isCoordinator,
    signInWithGoogle,
    signOut,
    switchPersona,
    allUsers,
    isOnline
  } = useAuth();

  const [showPersonaPicker, setShowPersonaPicker] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(profile?.phone || '');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const { updateCurrentProfile } = useAuth();

  const handleSavePhone = async () => {
    if (phoneNumber !== profile?.phone) {
      await updateCurrentProfile({ phone: phoneNumber });
    }
    setIsEditingPhone(false);
  };

  return (
    <div className="space-y-4 pb-4">
      {/* User Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700 text-white font-extrabold text-xl flex items-center justify-center shadow-md shadow-blue-500/20 shrink-0">
            {profile?.displayName.charAt(0) || 'B'}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="font-extrabold text-slate-900 dark:text-slate-100 text-base leading-tight truncate">
                {profile?.displayName}
              </h2>
              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                isAdmin ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300' :
                isCoordinator ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300' :
                'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
              }`}>
                {profile?.role}
              </span>
            </div>

            <p className="text-xs text-slate-500 truncate mt-0.5">
              {profile?.congregation || 'Local Congregation'} • Central Kingdom Hall
            </p>
          </div>
        </div>

        {/* Contact info list */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs">
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-400" /> Email:
            </span>
            <span className="font-medium text-slate-900 dark:text-slate-200 truncate max-w-[200px]">
              {profile?.email || 'Not connected'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-slate-400" /> Phone:
            </span>
            {isEditingPhone ? (
              <div className="flex items-center gap-1.5">
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="(555) 000-0000"
                  className="px-2 py-1 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                />
                <button
                  onClick={handleSavePhone}
                  className="px-2 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold"
                >
                  Save
                </button>
              </div>
            ) : (
              <span
                onClick={() => setIsEditingPhone(true)}
                className="font-medium text-blue-600 hover:underline cursor-pointer"
              >
                {profile?.phone || 'Tap to set phone'}
              </span>
            )}
          </div>
        </div>

        {/* Qualifications */}
        <div>
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
            Registered Skills & Qualifications
          </p>
          <div className="flex flex-wrap gap-1.5">
            {profile?.qualifications && profile.qualifications.length > 0 ? (
              profile.qualifications.map((q, i) => (
                <span
                  key={i}
                  className="text-xs px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium"
                >
                  {q}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">General Maintenance</span>
            )}
          </div>
        </div>
      </div>

      {/* Switch Persona / Account Testing (Important for multi-role workflows) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100 font-bold text-sm">
            <Users className="w-4 h-4 text-blue-600" />
            <span>Switch Member Persona</span>
          </div>
          <button
            onClick={() => setShowPersonaPicker(!showPersonaPicker)}
            className="text-xs text-blue-600 font-semibold"
          >
            {showPersonaPicker ? 'Close' : 'Switch'}
          </button>
        </div>
        <p className="text-[11px] text-slate-500">
          Switch between brothers to test accepting/declining from a brother's perspective, or assigning and reviewing from a coordinator's perspective.
        </p>

        {showPersonaPicker && (
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            {allUsers.map((u) => {
              const isSelected = profile?.uid === u.uid;
              return (
                <button
                  key={u.uid}
                  onClick={() => {
                    switchPersona(u.uid);
                    setShowPersonaPicker(false);
                  }}
                  className={`w-full min-h-[44px] p-2.5 rounded-2xl flex items-center justify-between text-left text-xs transition-colors ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-bold border border-blue-200 dark:border-blue-800'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{u.displayName}</p>
                    <p className="text-[10px] text-slate-400 capitalize">
                      {u.role} • {u.congregation}
                    </p>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-blue-600" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* PWA Home Screen Installation */}
      <PWAInstallButton />

      {/* Navigation Shortcuts for Coordinator / Admin */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-2 border border-slate-200/80 dark:border-slate-800 shadow-2xs divide-y divide-slate-100 dark:divide-slate-800/80">
        <button
          onClick={onOpenReports}
          className="w-full min-h-[44px] p-3 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900 dark:text-slate-100">Maintenance History & Reports</p>
              <p className="text-[11px] text-slate-400">Completed archive, CSV export & audit trail</p>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {(isCoordinator || isAdmin) && (
          <button
            onClick={onOpenSettings}
            className="w-full min-h-[44px] p-3 flex items-center justify-between text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-2xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
                <Settings className="w-4 h-4" />
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-900 dark:text-slate-100">Kingdom Hall & Category Settings</p>
                <p className="text-[11px] text-slate-400">Facility configuration, categories, and timezones</p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        )}
      </div>

      {/* App Preferences & Sign Out */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-2xs space-y-3 text-xs">
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span>Application Version:</span>
          <span className="font-semibold text-slate-900 dark:text-slate-200">2.1.0 Mobile PWA</span>
        </div>
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span>Cloud Database:</span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Firestore
          </span>
        </div>

        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          {firebaseUser ? (
            <button
              onClick={signOut}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-red-50 hover:bg-red-100 text-red-600 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
            >
              <LogOut className="w-4 h-4" /> Sign Out of Account
            </button>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="w-full min-h-[44px] py-2.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <LogIn className="w-4 h-4" /> Sign In with Google
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
