import { useEffect, useState } from "react";
import supabase from "../services/supabase";

function useAuth() {

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    // Get current user

    supabase.auth.getUser()
      .then(({ data }) => {

        setUser(data.user);
        setLoading(false);

      })
      .catch(() => {

        setLoading(false);

      });

    // Listen for login/logout

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

  // IMPORTANT: always return object

  return { user, loading };

}

export default useAuth;