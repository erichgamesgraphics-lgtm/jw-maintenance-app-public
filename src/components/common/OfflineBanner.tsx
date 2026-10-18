import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';

export const OfflineBanner: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-amber-500 text-white px-3 py-1.5 text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm sticky top-14 z-20">
      <WifiOff className="w-3.5 h-3.5 animate-pulse" />
      <span>Offline Mode — Firestore local cache active</span>
    </div>
  );
};
