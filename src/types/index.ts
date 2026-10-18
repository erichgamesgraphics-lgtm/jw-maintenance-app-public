export type UserRole = 'admin' | 'coordinator' | 'brother';

export type NavTab = 'dashboard' | 'assignments' | 'calendar' | 'notifications' | 'profile' | 'team' | 'reports' | 'settings';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  congregation?: string;
  qualifications?: string[];
  hallId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export type AssignmentPriority = 'low' | 'normal' | 'high' | 'urgent';

export type AssignmentStatus =
  | 'draft'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'reviewed'
  | 'cancelled'
  | 'reassigned';

export type ResponseStatus = 'pending' | 'accepted' | 'declined';

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  completedBy?: string;
  completedAt?: string;
}

export interface AssignmentResponse {
  id: string;
  assignmentId: string;
  userId: string;
  userName: string;
  status: ResponseStatus;
  reason?: string;
  respondedAt: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  category: string;
  hallId: string;
  hallName?: string;
  assignedUserIds: string[];
  assignedUserNames?: Record<string, string>;
  createdBy: string;
  createdByName?: string;
  scheduledDate?: string; // YYYY-MM-DD
  scheduledTime?: string; // HH:MM
  deadline: string; // YYYY-MM-DD
  priority: AssignmentPriority;
  checklist: ChecklistItem[];
  referencePhotos?: string[];
  instructions?: string;
  status: AssignmentStatus;
  completionNotes?: string;
  completionPhotos?: string[];
  responses?: Record<string, {
    status: ResponseStatus;
    reason?: string;
    respondedAt?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  requiredQualifications?: string[];
  order?: number;
}

export interface Hall {
  id: string;
  name: string;
  address: string;
  timezone: string;
  congregations?: string[];
  createdAt?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'assignment' | 'accepted' | 'declined' | 'status_change' | 'announcement' | 'reminder';
  assignmentId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  assignmentId?: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  action: 'created' | 'assigned' | 'accepted' | 'declined' | 'reassigned' | 'status_updated' | 'completed' | 'reviewed' | 'cancelled' | 'edited';
  details: string;
  timestamp: string;
}

export interface AppSetting {
  id?: string;
  hallName: string;
  defaultTimezone: string;
  autoRemindersEnabled: boolean;
  allowBrotherPhotoUploads: boolean;
  contactPerson?: string;
  updatedAt?: string;
}
