import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../firebase/config';
import { Category, Hall, UserProfile } from '../types';

export const DEFAULT_CATEGORIES: Omit<Category, 'id'>[] = [
  {
    name: 'Cleaning & Janitorial',
    description: 'Auditorium sanitizing, restroom supplies, window cleaning, trash disposal',
    color: '#3B82F6',
    requiredQualifications: ['General Maintenance'],
    order: 1
  },
  {
    name: 'Electrical Maintenance',
    description: 'Lighting ballasts, emergency exit signs, main distribution panels, circuit breakers',
    color: '#F59E0B',
    requiredQualifications: ['Certified Electrician', 'Electrical Safety'],
    order: 2
  },
  {
    name: 'Plumbing',
    description: 'Restroom valves, pressure regulators, sump pumps, water heater flush',
    color: '#06B6D4',
    requiredQualifications: ['Plumbing License / Experience'],
    order: 3
  },
  {
    name: 'Heating & Cooling (HVAC)',
    description: 'Air filter changes, thermostat calibration, condenser coil rinse, belt tension',
    color: '#10B981',
    requiredQualifications: ['HVAC Certified'],
    order: 4
  },
  {
    name: 'Audio / Visual Equipment',
    description: 'Sound console maintenance, microphone cords, stage lighting, video screens & projectors',
    color: '#8B5CF6',
    requiredQualifications: ['AV Technician Training'],
    order: 5
  },
  {
    name: 'Grounds & Outdoor',
    description: 'Lawn mowing, sprinkler head check, snow/ice clearance, perimeter fence, gutters',
    color: '#84CC16',
    requiredQualifications: ['Equipment Operator', 'General Maintenance'],
    order: 6
  },
  {
    name: 'Safety & Fire Inspections',
    description: 'Monthly fire extinguisher checks, AED battery test, first aid kit restock, panic hardware',
    color: '#EF4444',
    requiredQualifications: ['Safety Inspector / Elder'],
    order: 7
  },
  {
    name: 'Furniture & Fixtures',
    description: 'Auditorium seating alignment, literature counter repair, acoustic panels',
    color: '#EC4899',
    requiredQualifications: ['Carpentry / Furniture Care'],
    order: 8
  },
  {
    name: 'Repairs & General Maintenance',
    description: 'Drywall patching, painting, door closer adjustments, weather stripping',
    color: '#64748B',
    requiredQualifications: ['General Maintenance'],
    order: 9
  }
];

export const DEFAULT_HALL: Omit<Hall, 'id'> = {
  name: 'Central Kingdom Hall',
  address: '742 Kingdom Way, Springfield',
  timezone: 'America/New_York',
  congregations: ['East Congregation', 'West Congregation', 'Central Congregation'],
  createdAt: new Date().toISOString()
};

export const SEED_BROTHERS: UserProfile[] = [
  {
    uid: 'demo_admin_michael',
    email: 'michael.admin@kingdomhall.org',
    displayName: 'Brother Michael (Admin)',
    role: 'admin',
    phone: '+1 (555) 234-5678',
    congregation: 'East Congregation',
    qualifications: ['Safety Inspector / Elder', 'General Maintenance'],
    hallId: 'default_hall',
    createdAt: new Date().toISOString()
  },
  {
    uid: 'demo_coordinator_mark',
    email: 'mark.coordinator@kingdomhall.org',
    displayName: 'Brother Mark (Coordinator)',
    role: 'coordinator',
    phone: '+1 (555) 345-6789',
    congregation: 'East Congregation',
    qualifications: ['Safety Inspector / Elder', 'HVAC Certified', 'General Maintenance'],
    hallId: 'default_hall',
    createdAt: new Date().toISOString()
  },
  {
    uid: 'demo_brother_david',
    email: 'david.brother@kingdomhall.org',
    displayName: 'Brother David',
    role: 'brother',
    phone: '+1 (555) 456-7890',
    congregation: 'East Congregation',
    qualifications: ['HVAC Certified', 'General Maintenance', 'Equipment Operator'],
    hallId: 'default_hall',
    createdAt: new Date().toISOString()
  },
  {
    uid: 'demo_brother_samuel',
    email: 'samuel.brother@kingdomhall.org',
    displayName: 'Brother Samuel',
    role: 'brother',
    phone: '+1 (555) 567-8901',
    congregation: 'West Congregation',
    qualifications: ['Certified Electrician', 'Electrical Safety', 'AV Technician Training'],
    hallId: 'default_hall',
    createdAt: new Date().toISOString()
  },
  {
    uid: 'demo_brother_john',
    email: 'john.brother@kingdomhall.org',
    displayName: 'Brother John',
    role: 'brother',
    phone: '+1 (555) 678-9012',
    congregation: 'Central Congregation',
    qualifications: ['Plumbing License / Experience', 'Carpentry / Furniture Care'],
    hallId: 'default_hall',
    createdAt: new Date().toISOString()
  }
];

export async function ensureInitialSeed(): Promise<void> {
  try {
    // 1. Check if categories exist
    const catSnap = await getDocs(collection(db, 'categories'));
    if (catSnap.empty) {
      console.log('Seeding initial categories...');
      for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
        const cat = DEFAULT_CATEGORIES[i];
        const catId = `cat_${i + 1}`;
        await setDoc(doc(db, 'categories', catId), {
          ...cat,
          id: catId
        });
      }
    }

    // 2. Check if default hall exists
    const hallSnap = await getDocs(collection(db, 'halls'));
    if (hallSnap.empty) {
      console.log('Seeding default Kingdom Hall...');
      await setDoc(doc(db, 'halls', 'default_hall'), {
        ...DEFAULT_HALL,
        id: 'default_hall'
      });
    }

    // 3. Check if app settings exist
    const settingSnap = await getDocs(collection(db, 'app_settings'));
    if (settingSnap.empty) {
      console.log('Seeding default app settings...');
      await setDoc(doc(db, 'app_settings', 'main_config'), {
        hallName: 'Central Kingdom Hall',
        defaultTimezone: 'America/New_York',
        autoRemindersEnabled: true,
        allowBrotherPhotoUploads: true,
        contactPerson: 'Brother Mark (Maintenance Coordinator)',
        updatedAt: new Date().toISOString()
      });
    }

    // 4. Seed demo brother profiles if empty
    const userSnap = await getDocs(collection(db, 'users'));
    if (userSnap.empty) {
      console.log('Seeding initial brother profiles for multi-role workflows...');
      for (const user of SEED_BROTHERS) {
        await setDoc(doc(db, 'users', user.uid), user);
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, 'seed');
  }
}
