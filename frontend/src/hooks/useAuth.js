import { useEffect, useState } from "react";
import supabase from "../services/supabase";

function useAuth() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser()
      .then(({ data }) => {
        setUser(data.user);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });

    const {
      data: listener
    } = supabase.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);
  return { user, loading };
}

export default useAuth;