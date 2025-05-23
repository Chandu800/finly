import { cloneElement, useRef, useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { FiHome, FiCreditCard, FiPieChart, FiUser } from "react-icons/fi";
import { MdAutoGraph } from "react-icons/md";
import { GrTransaction } from "react-icons/gr";
import { GoGoal } from "react-icons/go";
import { AiOutlineMessage } from "react-icons/ai";

const navLinks = [
  { name: "Dashboard", icon: <FiHome />, path: "/" },
  { name: "Accounts", icon: <FiCreditCard />, path: "/accounts" },
  { name: "Transactions", icon: <GrTransaction />, path: "/transactions" },
  { name: "Budgets", icon: <FiPieChart />, path: "/budgets" },
  { name: "Goals", icon: <GoGoal />, path: "/goals" },
  { name: "Reports", icon: <MdAutoGraph />, path: "/reports" },
  { name: "Send Feedback", icon: <AiOutlineMessage />, path: "/sendfeedback" },
];

const profileMenu = [
  { label: "Change Currency", action: "currency" },
  { label: "Logout", action: "logout" },
  { label: "Delete Account", action: "delete" },
];

export default function Sidebar({
  collapsed,
  setCollapsed,
  open,
  setOpen,
  user,
  onProfileAction,
  onSignOut,
}) {
  const location = useLocation();
  const sidebarRef = useRef(null);
  const [profileOpen, setProfileOpen] = useState(false);

  // Close sidebar on outside click (mobile/tablet)
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (!sidebarRef.current?.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open, setOpen]);

  // Close profile dropdown on outside click
  useEffect(() => {
    if (!profileOpen) return;
    function handleClick(e) {
      if (!sidebarRef.current?.contains(e.target)) {
        setProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [profileOpen]);

  return (
    <>
      {/* Overlay for mobile/tablet */}
      <div
        className={`lg:hidden fixed inset-0 bg-black/30 z-30 transition-opacity
          ${open ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      />

      {/* Desktop Sidebar (collapsible, always visible) */}
      <aside
        className={`
          hidden lg:flex flex-col transition-all duration-200 z-40
          bg-[#F3F3EE] px-2 h-full
          ${collapsed ? "w-20" : "w-60"}
        `}
      >
        <nav className="flex-1 overflow-x-hidden overflow-y-auto">
          <ul>
            {navLinks.map((link) => {
              const isActive =
                location.pathname === link.path ||
                (link.path !== "/" && location.pathname.startsWith(link.path));
              return (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`flex ${collapsed ? "flex-col justify-center items-center" : "items-center"} gap-1 py-2 px-4 mb-3 transition rounded-lg
                      ${isActive ? "bg-blue-200 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-200"}
                    `}
                    title={collapsed ? link.name : undefined}
                    style={{ minHeight: collapsed ? 48 : undefined }}
                  >
                    {cloneElement(link.icon, { size: collapsed ? 24 : 20 })}
                    {collapsed ? (
                      <span className="text-[10px] mt-1 font-normal truncate w-12 text-center opacity-80">
                        {link.name}
                      </span>
                    ) : (
                      <span className="ml-2">{link.name}</span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {/* Profile section (sticky footer) */}
        <div className="mt-auto px-2 py-2 mb-3">
          <div
            className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-200 cursor-pointer"
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <img
              src={user?.avatar}
              className="w-8 h-8 rounded-full"
              alt="Profile"
            />
            {!collapsed && (
              <span className="truncate">{user?.name || "Profile"}</span>
            )}
          </div>
          {/* Dropdown */}
          {profileOpen && (
            <div className="absolute left-0 bottom-12 w-40 bg-white shadow-lg rounded-lg border z-50">
              <ul>
                {profileMenu.map((item) => (
                  <li key={item.action}>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-gray-700"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProfileOpen(false);
                        onProfileAction(item.action);
                      }}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
                <li>
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600"
                    onClick={onSignOut}
                  >
                    Sign Out
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile/Tablet Sidebar (full, only when open) */}
      <aside
        ref={sidebarRef}
        className={`lg:hidden fixed top-0 left-0 h-full w-64 z-40
          bg-[#F3F3EE] transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        {/* Mobile/Tablet Header (with close button) */}
        <div className="flex justify-between p-4">
          <h3 className="font-bold text-2xl">Finsight</h3>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-600 hover:text-gray-800"
            aria-label="Close sidebar"
          >
            <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto">
          <ul>
            {navLinks.map((link) => {
              const isActive =
                location.pathname === link.path ||
                (link.path !== "/" && location.pathname.startsWith(link.path));
              return (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className={`flex items-center gap-4 px-4 py-3
                      ${isActive ? "bg-blue-200 text-blue-600 font-semibold" : "text-gray-700 hover:bg-gray-200"}
                    `}
                    onClick={() => setOpen(false)}
                  >
                    {cloneElement(link.icon, { size: 24 })}
                    <span className="text-lg">{link.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        {/* Profile section (bottom, no dropdown for mobile) */}
        <div className="px-4 py-4 border-t border-gray-200">
          <button
            className="mt-4 w-full text-left px-4 py-2 hover:bg-gray-100 text-red-600 rounded"
            onClick={onSignOut}
          >
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}
