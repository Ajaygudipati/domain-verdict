import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("domain_verdict_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("domain_verdict_user");
    return stored ? JSON.parse(stored) : null;
  });

  function signIn(payload) {
    localStorage.setItem("domain_verdict_token", payload.access_token);
    localStorage.setItem("domain_verdict_user", JSON.stringify(payload.user));
    setToken(payload.access_token);
    setUser(payload.user);
  }

  function signOut() {
    localStorage.removeItem("domain_verdict_token");
    localStorage.removeItem("domain_verdict_user");
    setToken(null);
    setUser(null);
  }

  return <AuthContext.Provider value={{ token, user, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
