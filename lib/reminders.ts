import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { FirebaseError } from 'firebase/app';
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
  const q = query(collection(db, 'reminders'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  let reminders = snapshot.docs.map((d) => fromFirestore(d.id, d.data()));
  if (vehicleId) {
    reminders = reminders.filter((r) => r.vehicleId === vehicleId);
  }
  return reminders.sort((a, b) => b.createdAt - a.createdAt);
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

export async function deleteReminder(id: string): Promise<'deleted' | 'absent'> {
  const trimmedId = id.trim();
  if (!trimmedId) {
    throw new Error('ID de recordatorio inválido');
  }

  const ref = doc(db, 'reminders', trimmedId);
  const snap = await getDoc(ref);

  if (!snap.exists()) {
    return 'absent';
  }

  try {
    await deleteDoc(ref);
    return 'deleted';
  } catch (error) {
    if (error instanceof FirebaseError && error.code === 'not-found') {
      return 'absent';
    }
    throw error;
  }
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
