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
    <div className="w-[70vw] pb-10 flex items-center justify-between relative">
      <div
        className="w-75 font-extrabold text-4xl cursor-pointer"
        onClick={() => navigate("/")}
      >
        CodeBench
      </div>

      <div className="w-75 flex flex-row gap-8 text-lg justify-center">
        <div
          className="cursor-pointer hover:underline"
          onClick={() => navigate("/")}
        >
          Home
        </div>
        <div
          className="cursor-pointer hover:underline"
          onClick={() => navigate("/#")}
        >
          About
        </div>
      </div>

      <div className="w-75 flex justify-end" ref={dropdownRef}>
        {!loading && !user && (
          <button
            onClick={() => navigate("/login")}
            className="cursor-pointer px-4 py-2 border rounded-lg"
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
            className="w-10 h-10 rounded-full cursor-pointer hover:ring-2 hover:ring-white"
            onClick={() => setOpen(!open)}
            referrerPolicy="no-referrer"
          />
        )}
        {open && user && (
        <div
          className="absolute right-0 mt-2 w-70 bg-[#1a1d26] border border-[#252a3a] rounded-lg shadow-lg"
        >

          <div className="px-4 py-2 text-sm text-gray-400 border-b border-[#252a3a]">
            {user.email}
          </div>

          <div
            className="px-4 py-2 text-sm cursor-pointer hover:bg-[#252a3a]"
            onClick={handleLogout}
          >
            Logout
          </div>

        </div>
      )}
      </div>
    </div>
  );

}

export default Navbar;