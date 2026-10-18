import React, { useState } from 'react';
import {
  Building,
  CheckCircle2,
  Database,
  Globe,
  Plus,
  Save,
  Shield,
  Smartphone,
  Trash2,
  Wrench,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { createCategory, deleteCategory, updateAppSettings } from '../../services/categoryService';
import { AppSetting, Category, Hall } from '../../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  halls: Hall[];
  appSettings: AppSetting | null;
  onRefreshCategories: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  categories,
  halls,
  appSettings,
  onRefreshCategories
}) => {
  const { isAdmin, isCoordinator } = useAuth();

  const [activeTab, setActiveTab] = useState<'hall' | 'categories' | 'firebase' | 'pwa'>('hall');

  // Hall settings state
  const [hallName, setHallName] = useState(appSettings?.hallName || 'Central Kingdom Hall');
  const [timezone, setTimezone] = useState(appSettings?.defaultTimezone || 'America/New_York');
  const [contactPerson, setContactPerson] = useState(appSettings?.contactPerson || 'Brother Mark (Maintenance Coordinator)');
  const [savingSettings, setSavingSettings] = useState(false);

  // New Category state
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [newCatQual, setNewCatQual] = useState('');
  const [addingCategory, setAddingCategory] = useState(false);

  if (!isOpen) return null;

  const handleSaveHallSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    try {
      await updateAppSettings({
        hallName,
        defaultTimezone: timezone,
        contactPerson
      });
      alert('Hall settings updated successfully.');
    } catch (err) {
      console.error(err);
      alert('Failed to update settings.');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;

    setAddingCategory(true);
    try {
      await createCategory({
        name: newCatName.trim(),
        description: newCatDesc.trim(),
        color: '#3B82F6',
        requiredQualifications: newCatQual.trim() ? [newCatQual.trim()] : ['General Maintenance'],
        order: categories.length + 1
      });
      setNewCatName('');
      setNewCatDesc('');
      setNewCatQual('');
      onRefreshCategories();
    } catch (err) {
      console.error(err);
      alert('Failed to create category.');
    } finally {
      setAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Are you sure you want to remove this maintenance category?')) return;
    try {
      await deleteCategory(id);
      onRefreshCategories();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-700 my-8 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              Kingdom Hall Settings & Configuration
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="border-b border-slate-200 dark:border-slate-800 flex px-6 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('hall')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'hall'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Kingdom Hall Facility
          </button>
          <button
            onClick={() => setActiveTab('categories')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'categories'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Maintenance Categories ({categories.length})
          </button>
          <button
            onClick={() => setActiveTab('firebase')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'firebase'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Cloud Firestore & Security
          </button>
          <button
            onClick={() => setActiveTab('pwa')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'pwa'
                ? 'border-blue-600 text-blue-600 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Android / Mobile Wrapper
          </button>
        </div>

        {/* Tab contents */}
        <div className="p-6 max-h-[75vh] overflow-y-auto">
          {/* Hall Tab */}
          {activeTab === 'hall' && (
            <form onSubmit={handleSaveHallSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Facility Name
                </label>
                <input
                  type="text"
                  value={hallName}
                  onChange={(e) => setHallName(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Congregation Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                >
                  <option value="America/New_York">Eastern Time (America/New_York)</option>
                  <option value="America/Chicago">Central Time (America/Chicago)</option>
                  <option value="America/Denver">Mountain Time (America/Denver)</option>
                  <option value="America/Los_Angeles">Pacific Time (America/Los_Angeles)</option>
                  <option value="Europe/London">London (GMT / BST)</option>
                  <option value="Europe/Berlin">Central European Time (Berlin)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider mb-1">
                  Key Contact Person (Maintenance Coordinator)
                </label>
                <input
                  type="text"
                  value={contactPerson}
                  onChange={(e) => setContactPerson(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-2.5 text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-4 py-2 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" /> Save Hall Configuration
                </button>
              </div>
            </form>
          )}

          {/* Categories Tab */}
          {activeTab === 'categories' && (
            <div className="space-y-5">
              {/* Add category form */}
              {(isAdmin || isCoordinator) && (
                <form onSubmit={handleAddCategory} className="p-3.5 rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/20 space-y-2 text-xs">
                  <p className="font-bold text-slate-900 dark:text-slate-100">Add New Category</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <input
                      type="text"
                      required
                      placeholder="Category Name *"
                      value={newCatName}
                      onChange={(e) => setNewCatName(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={newCatDesc}
                      onChange={(e) => setNewCatDesc(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5"
                    />
                    <input
                      type="text"
                      placeholder="Required qualification"
                      value={newCatQual}
                      onChange={(e) => setNewCatQual(e.target.value)}
                      className="rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-1.5"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={addingCategory}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Category
                  </button>
                </form>
              )}

              {/* List */}
              <div className="space-y-2">
                {categories.map((c) => (
                  <div
                    key={c.id}
                    className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-900 dark:text-slate-100">{c.name}</span>
                        {c.requiredQualifications && c.requiredQualifications.length > 0 && (
                          <span className="text-[10px] px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                            {c.requiredQualifications.join(', ')}
                          </span>
                        )}
                      </div>
                      {c.description && <p className="text-[11px] text-slate-500 mt-0.5">{c.description}</p>}
                    </div>

                    {isAdmin && (
                      <button
                        onClick={() => handleDeleteCategory(c.id)}
                        className="p-1 text-slate-400 hover:text-red-600"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Firebase Architecture Tab */}
          {activeTab === 'firebase' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span>Real Cloud Firestore Provisioned & Deployed</span>
                </div>
                <p className="text-[11px]">
                  Database ID: <code className="font-mono font-semibold">ai-studio-kingdomhallmaint-c15f610f-a445-409f-9920-abd4c65a852c</code>
                </p>
                <p className="text-[11px]">
                  Firestore Security Rules deployed via fax.DeployRules RPC. Zero-trust validation and role verification enforced.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-purple-600" />
                  Free Spark Tier Design Architecture
                </h4>
                <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px] list-disc pl-4">
                  <li>Operates 100% within Firebase Spark Free Plan quotas (50k daily document reads, 20k writes).</li>
                  <li>No paid external APIs or mandatory billing account required.</li>
                  <li>Image photos are compressed and safely stored directly with the assignment record or Firebase Storage on free tier.</li>
                  <li>In-app notification center fallback guarantees delivery even when FCM push is not supported.</li>
                </ul>
              </div>
            </div>
          )}

          {/* PWA / Android Packaging Tab */}
          {activeTab === 'pwa' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Smartphone className="w-4 h-4 text-blue-600" />
                  <span>Android & Mobile PWA Deployment Guide</span>
                </div>
                <p className="text-[11px]">
                  This app is engineered mobile-first with responsive touch targets, offline Firestore cache, and viewport constraints suitable for Android APK packaging via Capacitor / Bubblewrap TWA (Trusted Web Activity).
                </p>
              </div>

              <div className="space-y-2 text-slate-600 dark:text-slate-400 text-[11px]">
                <p className="font-semibold text-slate-800 dark:text-slate-200">How to package as an Android App:</p>
                <ol className="list-decimal pl-4 space-y-1">
                  <li>Deploy to Firebase Hosting using <code className="bg-slate-100 p-0.5 rounded">npm run build && firebase deploy</code>.</li>
                  <li>Run <code className="bg-slate-100 p-0.5 rounded">bubblewrap init --manifest=https://YOUR_DOMAIN/manifest.json</code> to generate the Android Studio project.</li>
                  <li>Build signed release APK or bundle for congregation distribution or Google Play private track.</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
