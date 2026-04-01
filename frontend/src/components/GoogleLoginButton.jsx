import supabase from "../services/supabase";

function GoogleLoginButton() {

  const handleLogin = async () => {

    const { error } =
      await supabase.auth.signInWithOAuth({

        provider: "google",

        options: {
          redirectTo:
            "http://localhost:5173"
        }

      });

    if (error) {
      console.error("Login error:", error);
    }

  };

  return (

    <button
      onClick={handleLogin}
      style={{
        padding: "10px",
        fontSize: "16px",
        cursor: "pointer"
      }}
    >
      Sign in with Google
    </button>

  );

}

export default GoogleLoginButton;