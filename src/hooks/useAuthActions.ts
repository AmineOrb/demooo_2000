import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut 
} from "firebase/auth";

import { auth } from "@/lib/firebase";

export function useAuthActions() {
  
  // --- Signup
  const signup = async (email: string, password: string) => {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (err: any) {
      return { user: null, error: err.message };
    }
  };

  // --- Login
  const login = async (email: string, password: string) => {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      return { user: result.user, error: null };
    } catch (err: any) {
      return { user: null, error: err.message };
    }
  };

  // --- Logout
  const logout = async () => {
    try {
      await signOut(auth);
      return { error: null };
    } catch (err: any) {
      return { error: err.message };
    }
  };

  return { signup, login, logout };
}
