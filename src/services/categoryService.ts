import { addDoc, collection, deleteDoc, doc, getDoc, getDocs, onSnapshot, setDoc, updateDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { AppSetting, Category, Hall } from '../types';

export function subscribeToCategories(onUpdate: (categories: Category[]) => void) {
  try {
    return onSnapshot(
      collection(db, 'categories'),
      (snapshot) => {
        const categories: Category[] = [];
        snapshot.forEach((d) => {
          categories.push({ id: d.id, ...d.data() } as Category);
        });
        categories.sort((a, b) => (a.order || 99) - (b.order || 99));
        onUpdate(categories);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'categories');
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'categories');
    return () => {};
  }
}

export async function createCategory(category: Omit<Category, 'id'>): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'categories'), category);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'categories');
    throw error;
  }
}

export async function updateCategory(id: string, updates: Partial<Category>): Promise<void> {
  try {
    await updateDoc(doc(db, 'categories', id), updates);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `categories/${id}`);
    throw error;
  }
}

export async function deleteCategory(id: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `categories/${id}`);
    throw error;
  }
}

export function subscribeToHalls(onUpdate: (halls: Hall[]) => void) {
  try {
    return onSnapshot(
      collection(db, 'halls'),
      (snapshot) => {
        const halls: Hall[] = [];
        snapshot.forEach((d) => {
          halls.push({ id: d.id, ...d.data() } as Hall);
        });
        onUpdate(halls);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'halls');
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'halls');
    return () => {};
  }
}

export async function getAppSettings(): Promise<AppSetting | null> {
  try {
    const snap = await getDoc(doc(db, 'app_settings', 'main_config'));
    if (snap.exists()) {
      return { id: snap.id, ...snap.data() } as AppSetting;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'app_settings/main_config');
    return null;
  }
}

export async function updateAppSettings(settings: Partial<AppSetting>): Promise<void> {
  try {
    await setDoc(doc(db, 'app_settings', 'main_config'), {
      ...settings,
      updatedAt: new Date().toISOString()
    }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'app_settings/main_config');
    throw error;
  }
}
