import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  orderBy,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type { ServiceReminder } from '@/types';

function sanitizeFirestoreData<T extends Record<string, unknown>>(data: T): T {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => {
      if (value === undefined) return false;
      if (typeof value === 'number' && !Number.isFinite(value)) return false;
      return true;
    }),
  ) as T;
}

function fromFirestore(id: string, data: Record<string, unknown>): ServiceReminder {
  return {
    ...(data as Omit<ServiceReminder, 'id' | 'createdAt' | 'updatedAt'>),
    id,
    createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toMillis() : Date.now(),
    updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toMillis() : Date.now(),
  };
}

export async function getReminders(
  userId: string,
  vehicleId?: string,
): Promise<ServiceReminder[]> {
  const conditions = [where('userId', '==', userId), where('isActive', '==', true)];
  if (vehicleId) conditions.push(where('vehicleId', '==', vehicleId));

  const q = query(
    collection(db, 'reminders'),
    ...conditions,
    orderBy('createdAt', 'desc'),
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => fromFirestore(d.id, d.data()));
}

export async function addReminder(
  data: Omit<ServiceReminder, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<string> {
  const ref = await addDoc(collection(db, 'reminders'), {
    ...sanitizeFirestoreData(data),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function updateReminder(
  id: string,
  updates: Partial<Omit<ServiceReminder, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'reminders', id), {
    ...sanitizeFirestoreData(updates),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteReminder(id: string): Promise<void> {
  await deleteDoc(doc(db, 'reminders', id));
}

export async function completeReminder(
  id: string,
  updates: Partial<Omit<ServiceReminder, 'id' | 'userId' | 'createdAt'>>,
): Promise<void> {
  await updateDoc(doc(db, 'reminders', id), {
    ...sanitizeFirestoreData(updates),
    updatedAt: serverTimestamp(),
  });
}
