import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { auth } from "../lib/firebase";
import { buildApiUrl } from "../services/apiBase";

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticating: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    password: string;
  }) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const getFallbackName = (email: string) => {
  const [namePart] = email.split("@");
  if (!namePart) return "Usuario";
  return namePart
    .split(/[._-]+/)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setIsLoading(false);
        return;
      }

      setUser({
        id: currentUser.uid,
        email: currentUser.email ?? "",
        name:
          currentUser.displayName ?? getFallbackName(currentUser.email ?? ""),
      });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setIsAuthenticating(true);

    try {
      const credentials = await signInWithEmailAndPassword(
        auth,
        email,
        password,
      );
      const token = await credentials.user.getIdToken();
      const response = await fetch(buildApiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        let message = "No fue posible iniciar sesion.";
        const responseText = await response.text();
        try {
          const body = JSON.parse(responseText) as { message?: string };
          message = body.message ?? message;
        } catch (parseError) {
          void parseError;
        }

        const error = new Error(message) as Error & { status?: number };
        error.status = response.status;
        throw error;
      }
    } catch (error) {
      await signOut(auth);
      throw error;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const register = useCallback(
    async (data: { name: string; email: string; password: string }) => {
      const credentials = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      const displayName = data.name.trim() || getFallbackName(data.email);

      if (displayName) {
        await updateProfile(credentials.user, { displayName });
      }
    },
    [],
  );

  const logout = useCallback(async () => {
    await signOut(auth);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticating, login, register, logout }),
    [user, isLoading, isAuthenticating, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
