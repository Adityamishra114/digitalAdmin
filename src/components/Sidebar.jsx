import React, { useState, useEffect } from "react";
import {
  FiMenu,
  FiHome,
  FiBookOpen,
  FiFileText,
  FiCreditCard,
  FiAward,
  FiChevronDown,
  FiChevronRight,
  FiUser,
  FiEdit,
} from "react-icons/fi";
import { Link, useLocation } from "react-router-dom";
import Logo from "/assets/logo.png"
const Sidebar = () => {
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [isCourseOpen, setIsCourseOpen] = useState(false);
  const [isCourseStudentOpen, setIsCourseStudentOpen] = useState(false);
  const [isCourseTestOpen, setIsCourseTestOpen] = useState(false);
  const [isBlogOpen, setIsBlogOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      setIsOpen(!mobile);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => setIsOpen(!isOpen);

  const linkStyle = (path) =>
    location.pathname.includes(path)
      ? "bg-primary text-white"
      : "hover:bg-primary hover:text-white text-primary";

  const showText = isOpen;
  const dropdownHandlers = (isDropdownOpenSetter) =>
    !isOpen
      ? {
          onMouseEnter: () => isDropdownOpenSetter(true),
          onMouseLeave: () => isDropdownOpenSetter(false),
        }
      : {};

  return (
    <div
      className={`bg-white text-primary h-screen transition-all duration-300 ${
        isOpen ? "w-64" : "w-16"
      } flex flex-col shadow-md sticky top-0`}
    >
      <div className="flex items-center justify-between p-4">
        {showText && !isMobile && <img src={Logo} alt="Logo" className="h-8 w-auto" />}
        {!isMobile && (
          <button onClick={toggleSidebar} className="text-primary ml-auto">
            <FiMenu size={20} />
          </button>
        )}
      </div>

      <nav className="flex-1 px-2 space-y-1 text-sm font-bold font-nunito overflow-y-auto">
        <Link
          to="/admin/dashboard"
          className={`flex items-center p-2 rounded-md transition ${linkStyle(
            "/admin/dashboard"
          )}`}
        >
          <FiHome size={20} />
          {showText && <span className="ml-3">Dashboard</span>}
        </Link>

        {/* Course */}
        <div
          {...dropdownHandlers(setIsCourseOpen)}
        >
          <button
            onClick={() => setIsCourseOpen(!isCourseOpen)}
            className={`flex items-center w-full p-2 rounded-md transition ${linkStyle(
              "/admin/courses"
            )}`}
          >
            <FiBookOpen size={20} />
            {showText && (
              <>
                <span className="ml-3">Course</span>
                <span className="ml-auto">
                  {isCourseOpen ? <FiChevronDown /> : <FiChevronRight />}
                </span>
              </>
            )}
          </button>
          {(isCourseOpen && showText) && (
            <div className="ml-8 mt-1 space-y-1">
              <Link
                to="/admin/courses/add"
                className={`flex items-center text-sm p-2 rounded-md transition ${linkStyle(
                  "/admin/courses/add"
                )}`}
              >
                <span>Course Add</span>
              </Link>
              <Link
                to="/admin/courses/list"
                className={`flex items-center text-sm p-2 rounded-md transition ${linkStyle(
                  "/admin/courses/list"
                )}`}
              >
                <span>Course List</span>
              </Link>
            </div>
          )}
        </div>
        <div
          {...dropdownHandlers(setIsCourseStudentOpen)}
        >
          <button
            onClick={() => setIsCourseStudentOpen(!isCourseStudentOpen)}
            className={`flex items-center w-full p-2 rounded-md transition ${linkStyle(
              "/admin/CourseStudent"
            )}`}
          >
            <FiUser size={20} />
            {showText && (
              <>
                <span className="ml-3">Course Student</span>
                <span className="ml-auto">
                  {isCourseStudentOpen ? <FiChevronDown /> : <FiChevronRight />}
                </span>
              </>
            )}
          </button>
          {(isCourseStudentOpen && showText) && (
            <div className="ml-8 mt-1 space-y-1">
              <Link
                to="/admin/CourseStudent/add"
                className={`flex items-center text-sm p-2 rounded-md transition ${linkStyle(
                  "/admin/CourseStudent/add"
                )}`}
              >
                <span>Course Enrolled Add</span>
              </Link>
              <Link
                to="/admin/CourseStudent/list"
                className={`flex items-center text-sm p-2 rounded-md transition ${linkStyle(
                  "/admin/CourseStudent/list"
                )}`}
              >
                <span>Course Enrolled List</span>
              </Link>
              <Link
                to="/admin/CourseStudent/progress"
                className={`flex items-center text-sm p-2 rounded-md transition ${linkStyle(
                  "/admin/CourseStudent/progress"
                )}`}
              >
                <span>Course Student Progress</span>
              </Link>
            </div>
          )}
        </div>
        <div
          {...dropdownHandlers(setIsCourseTestOpen)}
        >
          <button
            onClick={() => setIsCourseTestOpen(!isCourseTestOpen)}
            className={`flex items-center w-full p-2 rounded-md transition ${linkStyle(
              "/admin/tests"
            )}`}
          >
            <FiFileText size={20} />
            {showText && (
              <>
                <span className="ml-3">Test</span>
                <span className="ml-auto">
                  {isCourseTestOpen ? <FiChevronDown /> : <FiChevronRight />}
                </span>
              </>
            )}
          </button>
          {(isCourseTestOpen && showText) && (
            <div className="ml-8 mt-1 space-y-1">
              <Link
                to="/admin/tests/add"
                className={`flex items-center text-sm p-2 rounded-md transition ${linkStyle(
                  "/admin/tests/add"
                )}`}
              >
                <span>Course Test Add</span>
              </Link>
              <Link
                to="/admin/tests/list"
                className={`flex items-center text-sm p-2 rounded-md transition ${linkStyle(
                  "/admin/tests/list"
                )}`}
              >
                <span>Course Test List</span>
              </Link>
              <Link
                to="/admin/tests/score"
                className={`flex items-center text-sm p-2 rounded-md transition ${linkStyle(
                  "/admin/tests/score"
                )}`}
              >
                <span>Course Test Score</span>
              </Link>
            </div>
          )}
        </div>
        <div {...dropdownHandlers(setIsBlogOpen)}>
  <button
    onClick={() => setIsBlogOpen(!isBlogOpen)}
    className={`flex items-center w-full p-2 rounded-md transition ${linkStyle(
      "/admin/blogs"
    )}`}
  >
    <FiEdit size={20} />
    {showText && (
      <>
        <span className="ml-3">Blog</span>
        <span className="ml-auto">
          {isBlogOpen ? <FiChevronDown /> : <FiChevronRight />}
        </span>
      </>
    )}
  </button>
  {(isBlogOpen && showText) && (
    <div className="ml-8 mt-1 space-y-1">
      <Link
        to="/admin/blogs/add"
        className={`flex items-center text-sm p-2 rounded-md transition ${linkStyle(
          "/admin/blogs/add"
        )}`}
      >
        <span>Blog Add</span>
      </Link>
      <Link
        to="/admin/blogs/list"
        className={`flex items-center text-sm p-2 rounded-md transition ${linkStyle(
          "/admin/blogs/list"
        )}`}
      >
        <span>Blog List</span>
      </Link>
    </div>
  )}
</div>

        <Link
          to="/admin/payments"
          className={`flex items-center p-2 rounded-md transition ${linkStyle(
            "/admin/payments"
          )}`}
        >
          <FiCreditCard size={20} />
          {showText && <span className="ml-3">Payment</span>}
        </Link>
        <Link
          to="/admin/certificates"
          className={`flex items-center p-2 rounded-md transition ${linkStyle(
            "/admin/certificates"
          )}`}
        >
          <FiAward size={20} />
          {showText && <span className="ml-3">Certificate</span>}
        </Link>

      </nav>
    </div>
  );
};

export default Sidebar;
