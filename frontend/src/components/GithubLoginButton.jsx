import supabase from "../services/supabase";

function GithubLoginButton() {
    const handleLogin = async () => {
        const { error } = 
        await supabase.auth.signInWithOAuth({
            provider: "github",
            options: {
            redirectTo:
                "http://localhost:5173"
            }
        });

        if (error) {
            console.error("GitHub login error:", error.message);
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
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="currentColor"
            >
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 
            3.44 9.8 8.2 11.39.6.11.82-.26.82-.58
            0-.29-.01-1.06-.02-2.08-3.34.73-4.04-1.61
            -4.04-1.61-.55-1.39-1.34-1.76-1.34-1.76
            -1.1-.75.08-.73.08-.73 1.22.09 1.86 1.25
            1.86 1.25 1.08 1.85 2.83 1.31 3.52 1
            .11-.78.42-1.31.76-1.61-2.66-.3-5.47-1.33
            -5.47-5.93 0-1.31.47-2.38 1.24-3.22
            -.13-.3-.54-1.52.12-3.18 0 0 1.01-.32
            3.3 1.23.96-.27 1.98-.4 3-.41
            1.02.01 2.04.14 3 .41
            2.28-1.55 3.29-1.23 3.29-1.23
            .66 1.66.25 2.88.12 3.18
            .77.84 1.23 1.91 1.23 3.22
            0 4.61-2.81 5.63-5.49 5.92
            .43.37.82 1.1.82 2.22
            0 1.6-.01 2.89-.01 3.28
            0 .32.21.69.82.57
            C20.56 21.8 24 17.3 24 12
            24 5.37 18.63 0 12 0z"/>
        </svg>
      Sign in with Github
    </button>

  );

}

export default GithubLoginButton;