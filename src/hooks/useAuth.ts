import { useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../firebase/firebase";

type AppUser = {
  uid: string;
  name: string;
  email: string;
  role: "guide" | "student";
};

export function useAuth() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  const signIn = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const firebaseUser = result.user;

    const userRef = doc(db, "users", firebaseUser.uid);
    const snap = await getDoc(userRef);

    if (!snap.exists()) {
      // 🔹 FIRST TIME LOGIN → CREATE USER
      await setDoc(userRef, {
        name: firebaseUser.displayName,
        email: firebaseUser.email,
        role: "student", // default
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
        setUser({
          uid: firebaseUser.uid,
          ...(snap.data() as Omit<AppUser, "uid">),
        });
      }

      setLoading(false);
    });

    return () => unsub();
  }, []);

  return { user, loading, signIn, logout };
}
