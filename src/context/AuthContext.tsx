import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, User } from 'firebase/auth';
import { collection, doc, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType, testConnection } from '../firebase/config';
import { ensureInitialSeed, SEED_BROTHERS } from '../services/seedData';
import { UserProfile, UserRole } from '../types';

interface AuthContextType {
  firebaseUser: User | null;
  profile: UserProfile | null;
  loading: boolean;
  isOnline: boolean;
  isAdmin: boolean;
  isCoordinator: boolean;
  isBrother: boolean;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  switchPersona: (personaUid: string) => Promise<void>;
  updateCurrentProfile: (updates: Partial<UserProfile>) => Promise<void>;
  allUsers: UserProfile[];
  refreshUsers: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_BOOTSTRAP_EMAIL = 'erichgamesgraphics@gmail.com';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);

  // Check connection and seed data
  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const online = await testConnection();
      if (!mounted) return;
      setIsOnline(online);

      try {
        await ensureInitialSeed();
        await loadAllUsers();
      } catch (err) {
        console.warn('Initial seed or users fetch notice:', err);
      }
    };
    init();
    return () => { mounted = false; };
  }, []);

  const loadAllUsers = async () => {
    try {
      const snap = await getDocs(collection(db, 'users'));
      const users: UserProfile[] = [];
      snap.forEach(d => {
        users.push(d.data() as UserProfile);
      });
      setAllUsers(users);
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, 'users');
    }
  };

  // Auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const userDocRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userDocRef);

          const isBootstrapAdmin = user.email?.toLowerCase() === ADMIN_BOOTSTRAP_EMAIL.toLowerCase();

          if (userSnap.exists()) {
            const data = userSnap.data() as UserProfile;
            // Upgrade to admin if email matches bootstrap
            if (isBootstrapAdmin && data.role !== 'admin') {
              await updateDoc(userDocRef, { role: 'admin' });
              data.role = 'admin';
            }
            setProfile(data);
          } else {
            // New registered user
            const newRole: UserRole = isBootstrapAdmin ? 'admin' : 'brother';
            const newProfile: UserProfile = {
              uid: user.uid,
              email: user.email || '',
              displayName: user.displayName || user.email?.split('@')[0] || 'Brother',
              role: newRole,
              phone: user.phoneNumber || '',
              congregation: 'East Congregation',
              qualifications: ['General Maintenance'],
              hallId: 'default_hall',
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newProfile);

            if (isBootstrapAdmin) {
              await setDoc(doc(db, 'admins', user.uid), {
                email: user.email,
                addedAt: new Date().toISOString()
              });
            }
            setProfile(newProfile);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      } else {
        // If not logged in via Google popup, check if local storage persona was active
        const savedPersonaUid = localStorage.getItem('kh_active_persona_uid');
        if (savedPersonaUid) {
          const persona = SEED_BROTHERS.find(b => b.uid === savedPersonaUid);
          if (persona) {
            setProfile(persona);
          } else {
            // Default to coordinator Brother Mark for rich first-time experience
            setProfile(SEED_BROTHERS[1]); // Brother Mark (Coordinator)
          }
        } else {
          // Default to Coordinator Brother Mark so the app is immediately testable and functional
          setProfile(SEED_BROTHERS[1]);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      localStorage.removeItem('kh_active_persona_uid');
    } catch (error) {
      console.error('Google Sign-In failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
      // Switch back to Brother Mark demo or default
      setProfile(SEED_BROTHERS[1]);
      localStorage.removeItem('kh_active_persona_uid');
    } catch (error) {
      console.error('Sign Out failed:', error);
    }
  };

  const switchPersona = async (personaUid: string) => {
    // If signed into real firebase auth, log out first
    if (firebaseUser) {
      await fbSignOut(auth);
    }
    const found = allUsers.find(u => u.uid === personaUid) || SEED_BROTHERS.find(u => u.uid === personaUid);
    if (found) {
      setProfile(found);
      localStorage.setItem('kh_active_persona_uid', found.uid);
    }
  };

  const updateCurrentProfile = async (updates: Partial<UserProfile>) => {
    if (!profile) return;
    try {
      const userRef = doc(db, 'users', profile.uid);
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      setProfile(prev => (prev ? { ...prev, ...updates } : null));
      await loadAllUsers();
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `users/${profile.uid}`);
    }
  };

  const isAdmin = profile?.role === 'admin';
  const isCoordinator = profile?.role === 'coordinator' || isAdmin;
  const isBrother = profile?.role === 'brother';

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        profile,
        loading,
        isOnline,
        isAdmin,
        isCoordinator,
        isBrother,
        signInWithGoogle,
        signOut,
        switchPersona,
        updateCurrentProfile,
        allUsers,
        refreshUsers: loadAllUsers
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
