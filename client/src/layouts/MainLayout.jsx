import { useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

const MainLayout = () => {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div 
      className="min-h-screen w-full bg-[#F8FAFC] overflow-x-hidden relative"
      style={{ padding: "1.25rem" }}
    >
      {/* 3D Ambient Lighting Glow Effects */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-[#4F46E5]/10 blur-[100px]" />
        <div className="absolute top-1/3 -right-40 h-96 w-96 rounded-full bg-[#7C3AED]/10 blur-[100px]" />
        <div className="absolute -bottom-40 left-1/3 h-96 w-96 rounded-full bg-[#06B6D4]/10 blur-[100px]" />
      </div>

      {/* Main Centered 3D Layout Structure */}
      <div className="mx-auto flex min-h-[calc(100vh-2.5rem)] w-full max-w-[1600px] items-stretch gap-4 sm:gap-6">
        {/* Sidebar Container */}
        <div className="shrink-0 flex flex-col">
          <Sidebar
            isMobileOpen={mobileNavOpen}
            onCloseMobile={() => setMobileNavOpen(false)}
          />
        </div>

        {/* Right Column: Navbar & Elevated Main Surface */}
        <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-6">
          <Navbar onOpenMobileNav={() => setMobileNavOpen(true)} />

          <main className="w-full flex-1">
            <div className="w-full min-w-0 rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-[0_10px_30px_-5px_rgba(0,0,0,0.05)] backdrop-blur-md transition-all duration-300 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;