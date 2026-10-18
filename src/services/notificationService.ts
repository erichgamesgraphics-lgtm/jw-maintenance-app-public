import { addDoc, collection, doc, onSnapshot, orderBy, query, updateDoc, where, writeBatch } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { NotificationItem } from '../types';

export async function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationItem['type'],
  assignmentId?: string
): Promise<string | null> {
  try {
    const docRef = await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type,
      assignmentId: assignmentId || '',
      read: false,
      createdAt: new Date().toISOString()
    });
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'notifications');
    return null;
  }
}

export function subscribeToNotifications(
  userId: string,
  onUpdate: (notifications: NotificationItem[]) => void
) {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const items: NotificationItem[] = [];
        snapshot.forEach((d) => {
          items.push({ id: d.id, ...d.data() } as NotificationItem);
        });
        // Sort descending by date
        items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(items);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'notifications');
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'notifications');
    return () => {};
  }
}

export async function markNotificationAsRead(notificationId: string): Promise<void> {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `notifications/${notificationId}`);
  }
}

export async function markAllNotificationsAsRead(notifications: NotificationItem[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, 'notifications');
  }
}
