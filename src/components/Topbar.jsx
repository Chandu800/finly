import { FiMenu } from "react-icons/fi";
import { useState } from "react";

export default function Topbar({ 
  user, 
  onMobileMenuClick, 
  onSignOut 
}) {
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <header className="flex justify-between items-center px-4 h-14 bg-[#F3F3EE] dark:bg-dark-background">
      {/* Left Section - Hamburger + Logo */}
      <div className="flex items-center gap-4">
        {/* Mobile Hamburger (lg:hidden) */}
        <button
          onClick={onMobileMenuClick}
          className="lg:hidden text-gray-500 hover:text-blue-600"
          aria-label="Open sidebar"
        >
          <FiMenu size={24} />
        </button>

        {/* Desktop Hamburger (hidden on mobile) */}
        <button
          onClick={onMobileMenuClick}
          className="hidden lg:block text-gray-500 hover:text-blue-600"
          aria-label="Toggle sidebar"
        >
          <FiMenu size={24} />
        </button>

        <span className="text-2xl font-bold text-blue-600 dark:text-dark-accent tracking-wide">
          FinSight
        </span>
      </div>

      {/* Right Section - Profile (mobile/tablet only) */}
      <div className="lg:hidden relative">
        <div 
          className="p-2 rounded-lg hover:bg-gray-200 cursor-pointer"
          onClick={() => setProfileOpen(!profileOpen)}
        >
          <img
            src={user?.avatar}
            className="w-8 h-8 rounded-full border border-gray-300"
            alt="Profile"
          />
        </div>
        
        {/* Profile Dropdown */}
        {profileOpen && (
          <div className="absolute right-0 top-12 w-48 bg-white dark:bg-dark-card shadow-lg rounded-lg border dark:border-dark-border z-50">
            <ul>
              <li>
                <button
                  className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-dark-background text-gray-700 dark:text-dark-text"
                  onClick={onSignOut}
                >
                  Sign Out
                </button>
              </li>
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}
