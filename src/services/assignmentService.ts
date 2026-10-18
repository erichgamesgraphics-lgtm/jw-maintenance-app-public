import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  updateDoc,
  where
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Assignment, AssignmentPriority, AssignmentResponse, AssignmentStatus, ChecklistItem, ResponseStatus, UserProfile } from '../types';
import { logAuditEvent } from './auditService';
import { sendNotification } from './notificationService';

export function subscribeToAssignments(
  onUpdate: (assignments: Assignment[]) => void,
  userProfile?: UserProfile | null
) {
  try {
    // If ordinary brother, they can see assignments assigned to them OR all if coordinator/admin
    return onSnapshot(
      collection(db, 'assignments'),
      (snapshot) => {
        const assignments: Assignment[] = [];
        snapshot.forEach((d) => {
          assignments.push({ id: d.id, ...d.data() } as Assignment);
        });
        // Sort by deadline or createdAt
        assignments.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        onUpdate(assignments);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, 'assignments');
      }
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, 'assignments');
    return () => {};
  }
}

export async function createAssignment(
  data: {
    title: string;
    description: string;
    category: string;
    hallId: string;
    hallName?: string;
    assignedUserIds: string[];
    assignedUserNames?: Record<string, string>;
    scheduledDate?: string;
    scheduledTime?: string;
    deadline: string;
    priority: AssignmentPriority;
    checklist?: string[];
    instructions?: string;
    referencePhotos?: string[];
  },
  actor: UserProfile
): Promise<string> {
  try {
    const checklistItems: ChecklistItem[] = (data.checklist || []).map((text, idx) => ({
      id: `chk_${Date.now()}_${idx}`,
      text,
      completed: false
    }));

    // Setup initial pending responses for each assigned brother
    const responses: Record<string, { status: ResponseStatus; reason?: string; respondedAt?: string }> = {};
    data.assignedUserIds.forEach((uid) => {
      responses[uid] = {
        status: 'pending'
      };
    });

    const initialStatus: AssignmentStatus = data.assignedUserIds.length > 0 ? 'assigned' : 'draft';

    const newDoc = {
      title: data.title,
      description: data.description,
      category: data.category,
      hallId: data.hallId,
      hallName: data.hallName || 'Central Kingdom Hall',
      assignedUserIds: data.assignedUserIds,
      assignedUserNames: data.assignedUserNames || {},
      createdBy: actor.uid,
      createdByName: actor.displayName,
      scheduledDate: data.scheduledDate || '',
      scheduledTime: data.scheduledTime || '',
      deadline: data.deadline,
      priority: data.priority,
      checklist: checklistItems,
      referencePhotos: data.referencePhotos || [],
      instructions: data.instructions || '',
      status: initialStatus,
      completionNotes: '',
      completionPhotos: [],
      responses,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const docRef = await addDoc(collection(db, 'assignments'), newDoc);
    const assignmentId = docRef.id;

    // Create individual records in assignment_responses collection for robust querying
    for (const uid of data.assignedUserIds) {
      await addDoc(collection(db, 'assignment_responses'), {
        assignmentId,
        userId: uid,
        userName: data.assignedUserNames?.[uid] || 'Brother',
        status: 'pending',
        respondedAt: ''
      });

      // Send in-app notification to the assigned brother
      await sendNotification(
        uid,
        `New Assignment: ${data.title}`,
        `You have been assigned "${data.title}" by ${actor.displayName}. Priority: ${data.priority.toUpperCase()}. Deadline: ${data.deadline}. Please respond.`,
        'assignment',
        assignmentId
      );
    }

    // Log to immutable audit trail
    await logAuditEvent(
      actor,
      'created',
      `Created maintenance assignment "${data.title}" in category "${data.category}" assigned to ${data.assignedUserIds.length} brother(s).`,
      assignmentId
    );

    return assignmentId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, 'assignments');
    throw error;
  }
}

export async function respondToAssignment(
  assignment: Assignment,
  actor: UserProfile,
  status: 'accepted' | 'declined',
  reason?: string
): Promise<void> {
  try {
    const updatedResponses = { ...(assignment.responses || {}) };
    updatedResponses[actor.uid] = {
      status,
      reason: reason || '',
      respondedAt: new Date().toISOString()
    };

    // Calculate aggregated assignment status
    // If status is draft or assigned, and this brother accepted:
    // If all declined -> remains or goes to 'declined' / attention
    // If at least one accepted -> status can move to 'in_progress' or 'accepted'
    let nextStatus = assignment.status;
    const responseValues = Object.values(updatedResponses);
    const anyAccepted = responseValues.some(r => r.status === 'accepted');
    const allDeclined = responseValues.length > 0 && responseValues.every(r => r.status === 'declined');

    if (allDeclined) {
      // Mark as requiring coordinator attention/reassignment
      nextStatus = 'assigned';
    } else if (anyAccepted && (assignment.status === 'assigned' || assignment.status === 'draft')) {
      nextStatus = 'in_progress';
    }

    await updateDoc(doc(db, 'assignments', assignment.id), {
      responses: updatedResponses,
      status: nextStatus,
      updatedAt: new Date().toISOString()
    });

    // Notify coordinator/creator
    const actionText = status === 'accepted' ? 'accepted' : `declined${reason ? ` (Reason: "${reason}")` : ''}`;
    await sendNotification(
      assignment.createdBy,
      `Assignment ${status === 'accepted' ? 'Accepted' : 'Declined'}: ${assignment.title}`,
      `${actor.displayName} has ${actionText} the assignment "${assignment.title}".`,
      status === 'accepted' ? 'accepted' : 'declined',
      assignment.id
    );

    // Audit log
    await logAuditEvent(
      actor,
      status === 'accepted' ? 'accepted' : 'declined',
      `${actor.displayName} ${status.toUpperCase()} the assignment "${assignment.title}"${reason ? `. Explanation: ${reason}` : ''}.`,
      assignment.id
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `assignments/${assignment.id}`);
    throw error;
  }
}

export async function updateAssignmentStatus(
  assignment: Assignment,
  newStatus: AssignmentStatus,
  actor: UserProfile,
  notes?: string,
  photos?: string[]
): Promise<void> {
  try {
    const updates: Partial<Assignment> = {
      status: newStatus,
      updatedAt: new Date().toISOString()
    };

    if (notes !== undefined) {
      updates.completionNotes = notes;
    }
    if (photos !== undefined) {
      updates.completionPhotos = photos;
    }

    if (newStatus === 'reviewed') {
      updates.reviewedBy = actor.uid;
      updates.reviewedAt = new Date().toISOString();
    }

    await updateDoc(doc(db, 'assignments', assignment.id), updates);

    // Notifications
    if (newStatus === 'completed') {
      // Notify coordinator that work is ready for review
      await sendNotification(
        assignment.createdBy,
        `Work Completed: ${assignment.title}`,
        `${actor.displayName} marked "${assignment.title}" as completed with completion notes. Please review and close.`,
        'status_change',
        assignment.id
      );
    } else if (newStatus === 'reviewed') {
      // Notify assigned brothers that their work was reviewed and approved
      for (const uid of assignment.assignedUserIds) {
        await sendNotification(
          uid,
          `Assignment Reviewed & Closed: ${assignment.title}`,
          `${actor.displayName} reviewed and closed "${assignment.title}". Thank you for your service!`,
          'status_change',
          assignment.id
        );
      }
    }

    // Audit Log
    const actionMap: Record<AssignmentStatus, any> = {
      draft: 'edited',
      assigned: 'assigned',
      in_progress: 'status_updated',
      completed: 'completed',
      reviewed: 'reviewed',
      cancelled: 'cancelled',
      reassigned: 'reassigned'
    };

    await logAuditEvent(
      actor,
      actionMap[newStatus] || 'status_updated',
      `Updated status of "${assignment.title}" to ${newStatus.toUpperCase()}${notes ? `. Notes: ${notes}` : ''}.`,
      assignment.id
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `assignments/${assignment.id}`);
    throw error;
  }
}

export async function reassignAssignment(
  assignment: Assignment,
  newAssignedUserIds: string[],
  newAssignedUserNames: Record<string, string>,
  actor: UserProfile,
  reason?: string
): Promise<void> {
  try {
    const newResponses: Record<string, { status: ResponseStatus; reason?: string; respondedAt?: string }> = {};
    newAssignedUserIds.forEach((uid) => {
      newResponses[uid] = { status: 'pending' };
    });

    await updateDoc(doc(db, 'assignments', assignment.id), {
      assignedUserIds: newAssignedUserIds,
      assignedUserNames: newAssignedUserNames,
      responses: newResponses,
      status: 'assigned',
      updatedAt: new Date().toISOString()
    });

    // Notify newly assigned brothers
    for (const uid of newAssignedUserIds) {
      await sendNotification(
        uid,
        `Reassigned Task: ${assignment.title}`,
        `You have been assigned "${assignment.title}" by ${actor.displayName}. Priority: ${assignment.priority.toUpperCase()}. Deadline: ${assignment.deadline}.`,
        'assignment',
        assignment.id
      );
    }

    // Audit log
    const names = Object.values(newAssignedUserNames).join(', ');
    await logAuditEvent(
      actor,
      'reassigned',
      `Reassigned task "${assignment.title}" to ${names}${reason ? `. Reassignment note: ${reason}` : ''}.`,
      assignment.id
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `assignments/${assignment.id}`);
    throw error;
  }
}

export async function toggleChecklistItem(
  assignment: Assignment,
  itemId: string,
  completed: boolean,
  actor: UserProfile
): Promise<void> {
  try {
    const updatedChecklist = assignment.checklist.map((item) => {
      if (item.id === itemId) {
        return {
          ...item,
          completed,
          completedBy: completed ? actor.displayName : undefined,
          completedAt: completed ? new Date().toISOString() : undefined
        };
      }
      return item;
    });

    await updateDoc(doc(db, 'assignments', assignment.id), {
      checklist: updatedChecklist,
      updatedAt: new Date().toISOString()
    });

    const targetItem = assignment.checklist.find(i => i.id === itemId);
    await logAuditEvent(
      actor,
      'status_updated',
      `${completed ? 'Checked' : 'Unchecked'} checklist item "${targetItem?.text || itemId}" on "${assignment.title}".`,
      assignment.id
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `assignments/${assignment.id}`);
    throw error;
  }
}

export async function deleteAssignment(assignmentId: string, actor: UserProfile): Promise<void> {
  try {
    await deleteDoc(doc(db, 'assignments', assignmentId));
    await logAuditEvent(
      actor,
      'cancelled',
      `Permanently deleted assignment ${assignmentId}.`,
      assignmentId
    );
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `assignments/${assignmentId}`);
    throw error;
  }
}
