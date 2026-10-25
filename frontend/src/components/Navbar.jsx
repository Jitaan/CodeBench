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
    <div className="mx-auto max-w-6xl px-5 flex h-20 items-center justify-between relative">
      <div className="flex items-center">
        <div
          className="cursor-pointer text-4xl font-extrabold leading-none"
          onClick={() => navigate("/")}
        >
          CodeBench
        </div>
      </div>

      <nav className="absolute left-1/2 hidden h-full -translate-x-1/2 items-center justify-center gap-1 sm:flex">
        <div
          className="cursor-pointer rounded-md px-3 py-2 text-base text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => navigate("/")}
        >
          Problems
        </div>
        <div
          className="cursor-pointer rounded-md px-3 py-2 text-base text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          onClick={() => navigate("/contests")}
        >
          Contests
        </div>
      </nav>

      <div className="flex items-center" ref={dropdownRef}>
        {!loading && !user && (
          <button
            onClick={() => navigate("/login")}
            className="cursor-pointer rounded-md bg-foreground px-4 py-2 text-base font-medium text-background transition-opacity hover:opacity-90"
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
            className="h-10 w-10 cursor-pointer rounded-full ring-1 ring-border transition-shadow hover:ring-2 hover:ring-primary"
            onClick={() => setOpen(!open)}
            referrerPolicy="no-referrer"
          />
        )}
        {open && user && (
          <div
            className="absolute right-0 top-20 z-10 w-64 overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
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
