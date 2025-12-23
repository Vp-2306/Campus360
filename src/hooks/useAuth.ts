import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

export type AppUser = {
  uid: string;
  name: string | null;
  email: string | null;
  role: "student" | "guide";
  profileCompleted: boolean;
};

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // EMAIL SIGNUP
  const signupWithEmail = async (email: string, password: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const firebaseUser = res.user;

    await setDoc(doc(db, "users", firebaseUser.uid), {
      name: null,
      email: firebaseUser.email,
      role: "student",
      profileCompleted: false,
      createdAt: serverTimestamp(),
    });
  };

  // EMAIL LOGIN
  const loginWithEmail = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  // GOOGLE SIGN IN
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const res = await signInWithPopup(auth, provider);
    const firebaseUser = res.user;

    const ref = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(ref);

    if (!snap.exists()) {
      await setDoc(ref, {
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        role: "student",
        profileCompleted: false,
        createdAt: serverTimestamp(),
      });
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setLoading(false);
        return;
      }

      const snap = await getDoc(doc(db, "users", firebaseUser.uid));
      if (snap.exists()) {
        const data = snap.data();
        setUser({
          uid: firebaseUser.uid,
          name: data.name ?? null,
          email: data.email ?? firebaseUser.email,
          role: data.role ?? "student",
          profileCompleted: data.profileCompleted ?? false,
        });
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  return {
    user,
    loading,
    signupWithEmail,
    loginWithEmail,
    signInWithGoogle,
    logout,
  };
}
