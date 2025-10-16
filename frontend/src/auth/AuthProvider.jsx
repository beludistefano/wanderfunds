import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../supabaseClient";

const AuthenticationContext = createContext({
  user: null,
  session: null,
  loading: true,
  initialized: false,
});

export const useAuth = () => useContext(AuthenticationContext);

export default function AuthProvider({ children }) {
  var componentMounted = true;

  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let unsub = () => {};

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session ?? null);
      setUser(data.session?.user ?? null);
      setLoading(false);
      setInitialized(true);
    });

    const { data: sub } = supabase.auth.onAuthStateChange(
      (_event, newSession) => {
        setSession(newSession ?? null);
        setUser(newSession?.user ?? null);
      }
    );
    unsub = () => sub.subscription.unsubscribe();

    return () => unsub();
  }, []);

  const value = { user, session, loading, initialized };
  return (
    <AuthenticationContext.Provider value={value}>
      {children}
    </AuthenticationContext.Provider>
  );
}
