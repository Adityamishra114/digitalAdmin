import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { getInitials, logout } from "../store/authSlice";
import { HiOutlineMenu, HiX } from "react-icons/hi";
import Logo from "/assets/logo.png"
const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const dropdownTimeout = useRef(null);

  const { isLoggedIn, user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const toggleMenu = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/");
  };

 const handleProfileClick = () => navigate("/profile");

  const handleProfileEnter = () => {
    clearTimeout(dropdownTimeout.current);
    setProfileDropdown(true);
  };

  const handleProfileLeave = () => {
    dropdownTimeout.current = setTimeout(() => {
      setProfileDropdown(false);
    }, 250);
  };

  const toggleDropdownClick = () => {
    setProfileDropdown((prev) => !prev);
  };

  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  return (
    <header className="bg-white shadow">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/">
            <img src={Logo} alt="Logo" className="h-12 w-auto" />
          </Link>

          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <Link
                to="/auth"
                className="text-gray-600 font-semibold hover:text-primary"
              >
                Login
              </Link>
            ) : (
              <div
                className="relative"
                onMouseEnter={handleProfileEnter}
                onMouseLeave={handleProfileLeave}
              >
                <button
                  onClick={handleProfileClick}
                  className="flex items-center focus:outline-none"
                  title="Profile"
                >
                  {user?.profileImage?.trim() ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-6 h-6 rounded-full object-cover border border-gray-300"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold border border-gray-300">
                      {getInitials(user?.name || "User")}
                    </div>
                  )}
                </button>
                {profileDropdown && (
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 w-36 bg-white border border-gray-200 rounded-md shadow-md z-50 transition-all duration-300 ease-in-out">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-center px-4 py-2 text-sm text-gray-700 hover:bg-[#f3f4f6] hover:text-red-600 transition duration-300"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="md:hidden">
            <button
              onClick={toggleMenu}
              className="text-gray-600 hover:text-primary focus:outline-none"
            >
              {isOpen ? (
                <HiX className="w-6 h-6" />
              ) : (
                <HiOutlineMenu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {isOpen && (
          <div className="md:hidden mt-2 h-[calc(100vh-4rem)] space-y-2 pb-4 border-t pt-4">
            {!isLoggedIn ? (
              <Link
                to="/auth"
                className="block text-gray-600 font-semibold hover:text-primary"
                onClick={() => setIsOpen(false)}
              >
                Login
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => {
                    handleProfileClick();
                    toggleDropdownClick();
                    setIsOpen(false);
                  }}
                  className="flex items-center gap-2 text-gray-600 font-semibold hover:text-primary"
                >
                  {user?.profileImage?.trim() ? (
                    <img
                      src={user.profileImage}
                      alt="Profile"
                      className="w-6 h-6 rounded-full object-cover border border-gray-300"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center text-xs font-bold border border-gray-300">
                      {getInitials(user?.name || "User")}
                    </div>
                  )}
                  Profile
                </button>
                {profileDropdown && (
                  <div className="mt-2 w-full bg-white border border-gray-200 rounded-md shadow-md z-50">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-[#f3f4f6] hover:text-red-600"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
