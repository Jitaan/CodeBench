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
    <button onClick={handleLogin}
        style={{
            padding: "10px",
            fontSize: "16px",
            cursor: "pointer"
        }}
        variant="outline" className="w-80 flex items-center justify-center gap-3 px-4 border-2 rounded-2xl">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="20"
        height="20"
      >
        <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.2 36 24 36c-6.6 0-12-5.4-12-12
          s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4 24 4
          12.9 4 4 12.9 4 24s8.9 20 20 20
          20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
        <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16.1 19 12 24 12
          c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.5 29.6 4 24 4
          16.3 4 9.7 8.3 6.3 14.7z"/>
        <path fill="#4CAF50" d="M24 44c5.1 0 9.8-2 13.4-5.2l-6.2-5.1
          C29.2 36 26.7 37 24 37
          c-5.2 0-9.6-3.5-11.2-8.2l-6.5 5
          C9.6 39.7 16.2 44 24 44z"/>
        <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3
          c-1.1 3-3.4 5.5-6.6 6.9l6.2 5.1
          C38.4 36.8 44 30.8 44 24
          c0-1.3-.1-2.7-.4-3.5z"/>
      </svg>
      Sign in with Google
    </button>

  );

}

export default GoogleLoginButton;