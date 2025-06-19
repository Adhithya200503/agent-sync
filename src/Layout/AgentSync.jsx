 
import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AppSidebar } from "../components/ui/appSideBar";
import { SidebarProvider, SidebarTrigger } from "../components/ui/sidebar";

import { useAuth } from "../context/AuthContext";

import { ModeToggle } from "../components/mode-toggle";
import { NavigationMenuDemo } from "../components/AppComponents/NavBar";
import { MobileNav } from "../components/AppComponents/MobileNavItem";

import { MenuIcon } from "lucide-react";

const AgentSync = () => {
  const { currentUser } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);

  if (!currentUser) {
    return <Navigate to="/auth/login" replace />;
  }

  const navHeight = "70px";

  return (
    <div className="min-h-screen overflow-x-hidden flex">
      <SidebarProvider>
        <AppSidebar />

        <div className="flex-1 flex flex-col">
          <nav
            className={`fixed top-0 left-0 right-0 z-10 bg-white border-b border-gray-300 flex items-center gap-4 p-4 dark:bg-gray-900 dark:text-white`}
            style={{ height: navHeight }}
          >
            <SidebarTrigger />
            <span className="font-extrabold text-2xl font-mono mx-3.5 ">Zapper Kit</span>
            <button
              className="md:hidden p-2 rounded-md text-gray-700 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => setIsMobileNavOpen(true)}
              aria-label="Open mobile navigation menu"
            >
              <MenuIcon className="h-6 w-6" />
            </button>

            <div className="hidden md:flex flex-grow justify-center">
              <NavigationMenuDemo />
            </div>

          
            <ModeToggle className="ml-auto" />
          </nav>

          <MobileNav isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />

          <main
            className="flex-1 overflow-x-hidden p-6 bg-white dark:bg-gray-900 dark:text-white mt-14"
            style={{ paddingTop: navHeight }}
          >
            <Outlet />
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
};

export default AgentSync;