import { addDoc, collection, getDocs, onSnapshot, query, where } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { AuditLog } from '../types';

export async function logAuditEvent(
  actor: { uid: string; displayName: string; role: string },
  action: AuditLog['action'],
  details: string,
  assignmentId?: string
): Promise<void> {
  try {
    await addDoc(collection(db, 'audit_logs'), {
      assignmentId: assignmentId || '',
      actorId: actor.uid,
      actorName: actor.displayName,
      actorRole: actor.role,
      action,
      details,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Audit logging error:', error);
    // Non-blocking for UI, but still captures in logs
  }
}

export function subscribeToAuditLogs(
  onUpdate: (logs: AuditLog[]) => void,
  assignmentId?: string
) {
  try {
    const q = assignmentId
      ? query(collection(db, 'audit_logs'), where('assignmentId', '==', assignmentId))
      : collection(db, 'audit_logs');

    return onSnapshot(
      q,
      (snapshot) => {
        const logs: AuditLog[] = [];
        snapshot.forEach((d) => {
          logs.push({ id: d.id, ...d.data() } as AuditLog);
        });
        logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        onUpdate(logs);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'audit_logs');
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'audit_logs');
    return () => {};
  }
}

export async function fetchAllAuditLogs(): Promise<AuditLog[]> {
  try {
    const snap = await getDocs(collection(db, 'audit_logs'));
    const logs: AuditLog[] = [];
    snap.forEach((d) => {
      logs.push({ id: d.id, ...d.data() } as AuditLog);
    });
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'audit_logs');
    return [];
  }
}
