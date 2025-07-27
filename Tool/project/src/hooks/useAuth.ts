import { useEffect, useState } from "react";
import { AuthService } from "../services";
import type { ApiUser } from "../types";

export function useAuth() {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Helper to extract user from any backend response shape
  function extractUser(res: any): ApiUser | null {
    // Handle deeply nested response: { status, data: { data: { ...user } } }
    if (
      res?.data?.data &&
      typeof res.data.data === "object" &&
      res.data.data._id
    ) {
      return res.data.data;
    }
    if (res.user) return res.user;
    if (res.data && res.data.user) {
      return res.data.user;
    }
    return null;
  }

  // Check session on mount
  useEffect(() => {
    setLoading(true);
    AuthService.getCurrentUser()
      .then((res) => {
        setUser(extractUser(res));
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => setLoading(false));
    // console.log("useAuth mounted, checking session", user);
  }, [user]);

  // Login
  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      const res = await AuthService.signIn({ email, password });
      setUser(extractUser(res));
      setLoading(false);
      return { data: res, error: null };
    } catch (error: unknown) {
      setUser(null);
      setLoading(false);
      return { data: null, error };
    }
  };

  // Register
  const signUp = async (
    name: string,
    email: string,
    password: string,
    passwordConfirm: string
  ) => {
    setLoading(true);
    try {
      const res = await AuthService.signUp({
        name,
        email,
        password,
        passwordConfirm,
      });
      setUser(extractUser(res));
      setLoading(false);
      return { data: res, error: null };
    } catch (error: unknown) {
      setUser(null);
      setLoading(false);
      return { data: null, error };
    }
  };

  // Logout
  const signOut = async () => {
    setLoading(true);
    try {
      await AuthService.signOut();
    } catch {
      // ignore
    }
    setUser(null);
    setLoading(false);
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
