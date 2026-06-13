import * as React from "react";

export type Session = {
  workspace: string;
  email: string;
  signedInAt: number;
};

type Ctx = {
  session: Session | null;
  isAuthenticated: boolean;
  signIn: (input: { workspace: string; email: string }) => Promise<void>;
  signOut: () => void;
};

const AuthContext = React.createContext<Ctx | null>(null);

/** Wallet + env config only — no localStorage. Session resets on reload. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);

  const signIn: Ctx["signIn"] = async ({ workspace, email }) => {
    if (!workspace || !email) throw new Error("Workspace and email are required.");
    setSession({
      workspace,
      email,
      signedInAt: Date.now(),
    });
  };

  const signOut = () => {
    setSession(null);
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
