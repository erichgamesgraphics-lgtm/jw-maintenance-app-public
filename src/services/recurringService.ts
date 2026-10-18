import { Assignment, AssignmentPriority, UserProfile } from '../types';
import { createAssignment } from './assignmentService';

export interface RecurringTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'semi-annual';
  defaultPriority: AssignmentPriority;
  checklist: string[];
  suggestedQualifications: string[];
}

export const RECURRING_TEMPLATES: RecurringTemplate[] = [
  {
    id: 'rec_weekly_cleaning',
    title: 'Weekly Kingdom Hall Deep Clean & Restroom Sanitizing',
    description: 'Complete thorough cleaning before weekend meetings: vacuum auditorium carpet, sanitize all touch surfaces, restock restroom paper goods & soap.',
    category: 'Cleaning & Janitorial',
    frequency: 'weekly',
    defaultPriority: 'normal',
    checklist: [
      'Vacuum auditorium rows, aisles, and stage',
      'Sanitize all door handles, push bars, and podium',
      'Thoroughly clean and disinfect male & female restrooms',
      'Restock paper towels, toilet paper, and soap dispensers',
      'Empty all indoor trash receptacles and replace liners',
      'Mop entrance foyer and corridor tile floors'
    ],
    suggestedQualifications: ['General Maintenance']
  },
  {
    id: 'rec_monthly_hvac',
    title: 'Monthly HVAC Air Filter & Condenser Inspection',
    description: 'Inspect rooftop HVAC units, replace pleated air filters (MERV 11), inspect belt tension, and verify condensate drain lines are clear.',
    category: 'Heating & Cooling (HVAC)',
    frequency: 'monthly',
    defaultPriority: 'normal',
    checklist: [
      'Inspect and replace 4x Return Air Filters (Unit 1 & Unit 2)',
      'Inspect blower belts for wear, cracking, or slack',
      'Pour 1 cup vinegar/water solution down condensate drain lines',
      'Verify digital programmable thermostats are tracking scheduled temperatures',
      'Check outdoor condenser coils for debris or blockage'
    ],
    suggestedQualifications: ['HVAC Certified']
  },
  {
    id: 'rec_monthly_fire_safety',
    title: 'Monthly Life Safety & Fire Extinguisher Check',
    description: 'Inspect all portable fire extinguishers, test emergency exit sign battery backups, and verify AED green status indicator.',
    category: 'Safety & Fire Inspections',
    frequency: 'monthly',
    defaultPriority: 'high',
    checklist: [
      'Check pressure gauge on all 6 fire extinguishers in green zone',
      'Confirm safety pull-pins and tamper seals are intact',
      'Sign and date monthly inspection tags on each extinguisher',
      'Perform 30-second battery backup push-test on all EXIT signs',
      'Verify Automated External Defibrillator (AED) status light is flashing green',
      'Inspect emergency first aid kits and log any missing supplies'
    ],
    suggestedQualifications: ['Safety Inspector / Elder']
  },
  {
    id: 'rec_av_audio_check',
    title: 'Bi-Monthly Sound System & Video Display Calibration',
    description: 'Test all wireless microphone frequencies, inspect stage audio cables, clean projector dust filters, and test stream encoder audio levels.',
    category: 'Audio / Visual Equipment',
    frequency: 'monthly',
    defaultPriority: 'normal',
    checklist: [
      'Inspect handheld and lapel wireless microphone cables and battery bays',
      'Test sound console input levels and clean dust with compressed air',
      'Clean air intake filters on video projectors / displays',
      'Verify backup audio patch cable to stage podium is ready',
      'Test assisted listening system (hearing loop / FM receivers)'
    ],
    suggestedQualifications: ['AV Technician Training']
  },
  {
    id: 'rec_plumbing_check',
    title: 'Quarterly Plumbing Valves & Water Heater Flush',
    description: 'Cycle main shutoff valves, inspect water heater relief valve, test basement sump pump float switch, and check for hidden faucet leaks.',
    category: 'Plumbing',
    frequency: 'quarterly',
    defaultPriority: 'normal',
    checklist: [
      'Operate main water shut-off valve 1/4 turn to ensure free movement',
      'Briefly flush bottom drain of commercial water heater to remove sediment',
      'Test emergency relief (T&P) valve operation',
      'Pour 5 gallons of water into sump pit to verify float pump activation',
      'Inspect under all vanity sinks for dripping p-traps or supply lines'
    ],
    suggestedQualifications: ['Plumbing License / Experience']
  }
];

// Helper to check for schedule conflicts
export function checkScheduleConflicts(
  existingAssignments: Assignment[],
  assignedUserIds: string[],
  scheduledDate: string,
  excludeAssignmentId?: string
): { userId: string; assignmentTitle: string; scheduledTime?: string }[] {
  const conflicts: { userId: string; assignmentTitle: string; scheduledTime?: string }[] = [];

  if (!scheduledDate) return conflicts;

  for (const assignment of existingAssignments) {
    if (excludeAssignmentId && assignment.id === excludeAssignmentId) continue;
    if (assignment.status === 'cancelled' || assignment.status === 'completed' || assignment.status === 'reviewed') continue;

    if (assignment.scheduledDate === scheduledDate) {
      for (const uid of assignedUserIds) {
        if (assignment.assignedUserIds.includes(uid)) {
          conflicts.push({
            userId: uid,
            assignmentTitle: assignment.title,
            scheduledTime: assignment.scheduledTime
          });
        }
      }
    }
  }

  return conflicts;
}

// Generate real assignment from recurring template
export async function generateRecurringAssignment(
  template: RecurringTemplate,
  scheduledDate: string,
  deadline: string,
  assignedBrothers: UserProfile[],
  actor: UserProfile,
  hallId: string,
  hallName: string
): Promise<string> {
  const assignedUserIds = assignedBrothers.map(b => b.uid);
  const assignedUserNames: Record<string, string> = {};
  assignedBrothers.forEach(b => {
    assignedUserNames[b.uid] = b.displayName;
  });

  return await createAssignment(
    {
      title: template.title,
      description: template.description,
      category: template.category,
      hallId,
      hallName,
      assignedUserIds,
      assignedUserNames,
      scheduledDate,
      deadline,
      priority: template.defaultPriority,
      checklist: template.checklist,
      instructions: `Generated from recurring template (${template.frequency.toUpperCase()}). Please coordinate and perform all checklist steps.`
    },
    actor
  );
}
