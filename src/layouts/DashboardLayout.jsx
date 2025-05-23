import { useState } from "react";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import { supabase } from "../supabaseClient";

export default function DashboardLayout({ children, user }) {
  // Desktop: collapsed state | Mobile: sidebar open state
  const [collapsed, setCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  // Toggle desktop collapse OR mobile sidebar
  const handleHamburgerClick = () => {
    if (window.innerWidth >= 1024) {
      setCollapsed(!collapsed); // Desktop: toggle icon/full sidebar
    } else {
      setSidebarOpen(!sidebarOpen); // Mobile: toggle sidebar visibility
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <Topbar
        user={user}
        onMobileMenuClick={handleHamburgerClick}
        onSignOut={handleSignOut}
      />
      
      <div className="flex flex-1 min-h-0">
        <Sidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          open={sidebarOpen}
          setOpen={setSidebarOpen}
          user={user}
          onSignOut={handleSignOut}
        />
        
        <main className="overflow-auto p-8 bg-[#fcfcf9] rounded-xl w-full h-[98%]">
          {children}
        </main>
      </div>
    </div>
  );
}
