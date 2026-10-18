import React, { useState } from 'react';
import { Download, Share2, Smartphone, X } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs text-emerald-800 dark:text-emerald-300">
        <Smartphone className="w-4 h-4 text-emerald-600 shrink-0" />
        <span className="font-semibold">Installed on Home Screen (Standalone App)</span>
      </div>
    );
  }

  return (
    <>
      <div className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl shadow-sm space-y-2">
        <div className="flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-blue-200 shrink-0" />
          <h4 className="font-bold text-sm">Install on Your Phone</h4>
        </div>
        <p className="text-xs text-blue-100 leading-relaxed">
          Add Kingdom Hall Maintenance Hub to your home screen for one-tap access and full-screen mobile experience.
        </p>

        {isInstallable ? (
          <button
            onClick={install}
            className="w-full mt-1 min-h-[44px] py-2.5 px-4 bg-white text-blue-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Download className="w-4 h-4" /> Add to Home Screen
          </button>
        ) : isIOS ? (
          <button
            onClick={() => setShowIOSModal(true)}
            className="w-full mt-1 min-h-[44px] py-2.5 px-4 bg-white text-blue-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-2 shadow-xs"
          >
            <Share2 className="w-4 h-4" /> Install on iPhone / iPad
          </button>
        ) : (
          <p className="text-[11px] text-blue-200 mt-1">
            Tap browser menu (⋮) and choose <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.
          </p>
        )}
      </div>

      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-850 rounded-2xl max-w-sm w-full p-6 space-y-4 shadow-2xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Install on iPhone / iPad
              </h3>
              <button
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ol className="text-xs text-slate-600 dark:text-slate-300 space-y-3 pl-1">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">1</span>
                <span>Tap the <strong>Share</strong> icon (box with upward arrow) at the bottom of Safari.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">2</span>
                <span>Scroll down and select <strong>Add to Home Screen</strong>.</span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center shrink-0 text-[11px]">3</span>
                <span>Tap <strong>Add</strong> in the top right corner.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSModal(false)}
              className="w-full min-h-[44px] py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-xs rounded-xl"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
