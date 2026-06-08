import * as React from "react";

export type Session = {
  workspace: string;
  email: string;
  apiKeyHint: string;
  signedInAt: number;
};

type Ctx = {
  session: Session | null;
  isAuthenticated: boolean;
  signIn: (input: { workspace: string; email: string; apiKey: string }) => Promise<void>;
  signOut: () => void;
};

const AuthContext = React.createContext<Ctx | null>(null);
const STORAGE_KEY = "clearance402.session.v1";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);

  React.useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? window.localStorage.getItem(STORAGE_KEY) : null;
      if (raw) setSession(JSON.parse(raw) as Session);
    } catch {
      /* ignore */
    }
  }, []);

  const signIn: Ctx["signIn"] = async ({ workspace, email, apiKey }) => {
    if (!workspace || !email || !apiKey) throw new Error("Workspace, email and API key are required.");
    if (apiKey.length < 12) throw new Error("API key looks malformed.");
    const next: Session = {
      workspace,
      email,
      apiKeyHint: `${apiKey.slice(0, 4)}…${apiKey.slice(-4)}`,
      signedInAt: Date.now(),
    };
    setSession(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const signOut = () => {
    setSession(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  return (
    <AuthContext.Provider value={{ session, isAuthenticated: !!session, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
