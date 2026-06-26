import { create } from 'zustand';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential,
  EmailAuthProvider,
  reauthenticateWithCredential,
  deleteUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { Platform } from 'react-native';
import { auth, db } from '@/lib/firebase';
import { useVehiclesStore } from './useVehiclesStore';
import { useMaintenanceStore } from './useMaintenanceStore';
import { useFuelStore } from './useFuelStore';
import { useExpensesStore } from './useExpensesStore';
import { useRemindersStore } from './useRemindersStore';
import type { AuthState, User, Session } from '@/types';

interface AuthStore extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: (password: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  session: null,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    return new Promise((resolve) => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (firebaseUser) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          const userData = userDoc.data();

          const user: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            name:
              userData?.name ??
              userData?.displayName ??
              firebaseUser.displayName ??
              undefined,
            avatarUrl:
              userData?.avatarUrl ??
              userData?.photoURL ??
              firebaseUser.photoURL ??
              undefined,
            pushToken: userData?.pushToken,
            preferences: userData?.preferences,
          };

          const session: Session = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
          };

          set({ user, session, isInitialized: true });
        } else {
          set({ user: null, session: null, isInitialized: true });
        }
        resolve();
      });

      return unsubscribe;
    });
  },

  signInWithGoogle: async () => {
    set({ isLoading: true });
    try {
      const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
      GoogleSignin.configure({
        webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
        iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      });
      if (Platform.OS === 'android') {
        await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
      }
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (!idToken) throw new Error('No se pudo obtener el token de Google');
      const googleCredential = GoogleAuthProvider.credential(idToken);
      const { user: firebaseUser } = await signInWithCredential(auth, googleCredential);
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: firebaseUser.displayName ?? 'Usuario',
          email: firebaseUser.email,
          avatarUrl: firebaseUser.photoURL ?? null,
          pushToken: null,
          createdAt: serverTimestamp(),
        });
      }
    } finally {
      set({ isLoading: false });
    }
  },

  signInWithApple: async () => {
    set({ isLoading: true });
    try {
      const AppleAuthentication = await import('expo-apple-authentication');
      const Crypto = await import('expo-crypto');

      // Apple exige un nonce hasheado (SHA256) en la solicitud;
      // Firebase requiere el nonce en crudo para validar la credencial.
      const rawNonce = generateNonce();
      const hashedNonce = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        rawNonce,
      );

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
        nonce: hashedNonce,
      });

      if (!credential.identityToken) {
        throw new Error('No se pudo obtener el token de Apple');
      }

      const provider = new OAuthProvider('apple.com');
      const firebaseCredential = provider.credential({
        idToken: credential.identityToken,
        rawNonce,
      });
      const { user: firebaseUser } = await signInWithCredential(auth, firebaseCredential);

      // Apple solo entrega el nombre en el PRIMER inicio de sesión.
      const appleName = [credential.fullName?.givenName, credential.fullName?.familyName]
        .filter(Boolean)
        .join(' ')
        .trim();

      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (!userDoc.exists()) {
        const displayName = appleName || firebaseUser.displayName || 'Usuario';
        if (!firebaseUser.displayName && displayName) {
          await updateProfile(firebaseUser, { displayName });
        }
        await setDoc(doc(db, 'users', firebaseUser.uid), {
          name: displayName,
          email: firebaseUser.email ?? credential.email ?? null,
          avatarUrl: null,
          pushToken: null,
          createdAt: serverTimestamp(),
        });
      }
    } catch (err) {
      // El usuario canceló el diálogo nativo: no es un error que mostrar.
      if (err instanceof Error && 'code' in err && (err as { code?: string }).code === 'ERR_REQUEST_CANCELED') {
        return;
      }
      throw err;
    } finally {
      set({ isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } finally {
      set({ isLoading: false });
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true });
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(firebaseUser, { displayName: name });
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        name,
        email,
        avatarUrl: null,
        pushToken: null,
        createdAt: serverTimestamp(),
      });
    } finally {
      set({ isLoading: false });
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      if (Platform.OS !== 'web') {
        const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
        await GoogleSignin.signOut().catch(() => {});
      }
      await signOut(auth);
      // Reset domain stores
      useVehiclesStore.getState().reset();
      useMaintenanceStore.getState().reset();
      useFuelStore.getState().reset();
      useExpensesStore.getState().reset();
      useRemindersStore.getState().reset();
      set({ user: null, session: null });
    } finally {
      set({ isLoading: false });
    }
  },

  deleteAccount: async (password) => {
    set({ isLoading: true });
    try {
      const user = auth.currentUser;
      if (!user?.email) throw new Error('No hay usuario autenticado');

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);

      await deleteDoc(doc(db, 'users', user.uid));
      await deleteUser(user);

      set({ user: null, session: null });
    } finally {
      set({ isLoading: false });
    }
  },

  resetPassword: async (email) => {
    set({ isLoading: true });
    try {
      await sendPasswordResetEmail(auth, email);
    } finally {
      set({ isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
}));

/** Genera un nonce aleatorio para el flujo de Sign in with Apple. */
function generateNonce(length = 32): string {
  const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += charset[Math.floor(Math.random() * charset.length)];
  }
  return result;
}
