import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocFromServer,
} from 'firebase/firestore';
import appletFirebaseConfig from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || appletFirebaseConfig.apiKey,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || appletFirebaseConfig.authDomain,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || appletFirebaseConfig.projectId,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || appletFirebaseConfig.storageBucket,
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || appletFirebaseConfig.messagingSenderId,
  appId: import.meta.env.VITE_FIREBASE_APP_ID || appletFirebaseConfig.appId,
  firestoreDatabaseId:
    import.meta.env.VITE_FIRESTORE_DATABASE_ID || appletFirebaseConfig.firestoreDatabaseId,
};

export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const BOOTSTRAPPED_TEACHER_EMAIL = 'luqnirahman@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): FirestoreErrorInfo {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData.map((provider) => ({
          providerId: provider.providerId,
          displayName: provider.displayName,
          email: provider.email,
          photoUrl: provider.photoURL,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Validates connection to Firestore on boot as required by Firebase integration guidelines.
 */
async function testFirestoreConnection(): Promise<void> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration. The client is offline.');
    }
  }
}

void testFirestoreConnection();

/**
 * Checks whether an authenticated Firebase user is an authorized Teacher/Admin.
 * Supports:
 * 1. Bootstrapped teacher email (luqnirahman@gmail.com with verified Google account)
 * 2. Email/Password teacher accounts provisioned in Firebase Authentication
 * 3. Accounts explicitly listed in /admins/{uid}
 */
export async function checkIsAuthorizedTeacher(user: User | null): Promise<boolean> {
  if (!user) return false;
  if (user.emailVerified && user.email?.toLowerCase() === BOOTSTRAPPED_TEACHER_EMAIL) {
    return true;
  }
  const hasPasswordProvider = user.providerData.some((p) => p.providerId === 'password');
  if (hasPasswordProvider) {
    return true;
  }
  try {
    const adminSnap = await getDoc(doc(db, 'admins', user.uid));
    return adminSnap.exists();
  } catch {
    return false;
  }
}

export async function signInTeacherWithEmail(email: string, password: string): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email.trim(), password);
  const authorized = await checkIsAuthorizedTeacher(credential.user);
  if (!authorized) {
    await signOut(auth);
    throw new Error('Akun ini tidak memiliki izin akses ke Dashboard Guru.');
  }
  return credential.user;
}

export async function signInTeacherWithGoogle(): Promise<User> {
  const credential = await signInWithPopup(auth, googleProvider);
  const authorized = await checkIsAuthorizedTeacher(credential.user);
  if (!authorized) {
    await signOut(auth);
    throw new Error(
      `Akun Google (${credential.user.email || 'tidak dikenal'}) belum terdaftar sebagai Guru/Admin.`
    );
  }
  return credential.user;
}

export async function signOutTeacher(): Promise<void> {
  await signOut(auth);
}

export { onAuthStateChanged };
export type { User };
