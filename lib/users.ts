import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import type { UserPreferences } from '@/types';

export async function updateUserPreferences(
  userId: string,
  preferences: UserPreferences,
): Promise<void> {
  await updateDoc(doc(db, 'users', userId), { preferences });
}
