import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import supabase from "../services/supabase";
import useAuth from "../hooks/useAuth";

function Navbar() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setOpen(false);
      }
    }

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setOpen(false);
    navigate("/");
  };

  return (
    <header className="w-full border-b border-border bg-background/80 backdrop-blur-sm">
    <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 relative">
      <div
        className="cursor-pointer text-lg font-semibold tracking-tight"
        onClick={() => navigate("/")}
      >
        CodeBench
      </div>

      <nav className="hidden items-center gap-1 sm:flex">
        <div
          className="cursor-pointer rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => navigate("/")}
        >
          Home
        </div>
        <div
          className="cursor-pointer rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => navigate("/contests")}
        >
          Contests
        </div>
        <div
          className="cursor-pointer rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => navigate("/#")}
        >
          About
        </div>
      </nav>

      <div className="flex justify-end" ref={dropdownRef}>
        {!loading && !user && (
          <button
            onClick={() => navigate("/login")}
            className="cursor-pointer rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Login
          </button>
        )}

        {!loading && user && (
          <img
            src={
              user?.user_metadata?.avatar_url ||
              user?.user_metadata?.picture ||
              `https://ui-avatars.com/api/?name=${
                user?.email?.charAt(0) || "U"
              }`
            }
            alt="avatar"
            className="h-8 w-8 cursor-pointer rounded-full ring-1 ring-border transition-shadow hover:ring-2 hover:ring-primary"
            onClick={() => setOpen(!open)}
            referrerPolicy="no-referrer"
          />
        )}
        {open && user && (
        <div
          className="absolute right-0 top-12 z-10 w-64 overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
        >

          <div className="border-b border-border px-4 py-3 text-sm text-muted-foreground">
            {user.email}
          </div>

          <div
            className="cursor-pointer px-4 py-3 text-sm transition-colors hover:bg-muted"
            onClick={handleLogout}
          >
            Logout
          </div>

        </div>
      )}
      </div>
    </div>
    </header>
  );

}

export default Navbar;
