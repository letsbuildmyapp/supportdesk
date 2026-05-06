import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
  signOut as fbSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import type { User, Role } from './types';

type AuthCtx = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, role?: Role) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signInGoogle: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (!fbUser) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const ref = doc(db, 'users', fbUser.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setUser(snap.data() as User);
        } else {
          // First Google sign-in: create as customer by default
          const profile: User = {
            uid: fbUser.uid,
            email: fbUser.email ?? '',
            name: fbUser.displayName ?? (fbUser.email?.split('@')[0] ?? 'User'),
            role: 'customer',
            createdAt: Date.now(),
          };
          await setDoc(ref, profile);
          setUser(profile);
        }
      } catch (e) {
        console.error('[auth] profile load failed', e);
      } finally {
        setLoading(false);
      }
    });
    return unsub;
  }, []);

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(email: string, password: string, name: string, role: Role = 'customer') {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const profile: User = {
      uid: cred.user.uid,
      email,
      name,
      role,
      createdAt: Date.now(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), profile);
    setUser(profile);
  }

  async function signInGoogle() {
    await signInWithPopup(auth, new GoogleAuthProvider());
  }

  async function signOut() {
    await fbSignOut(auth);
  }

  return (
    <Ctx.Provider value={{ user, loading, signIn, signUp, signInGoogle, signOut }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
