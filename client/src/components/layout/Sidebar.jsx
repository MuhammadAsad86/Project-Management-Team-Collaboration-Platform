import { NavLink } from "react-router-dom";
import {
  FiGrid,
  FiUsers,
  FiFolder,
  FiCheckSquare,
  FiUserCheck,
  FiCalendar,
  FiUser,
  FiX,
} from "react-icons/fi";
import { HiSparkles } from "react-icons/hi2";

import { useAuth } from "../../context/AuthContext";
import logo from "../../assets/logo.png";

const ICONS = {
  Dashboard: FiGrid,
  Users: FiUsers,
  Projects: FiFolder,
  Tasks: FiCheckSquare,
  Teams: FiUserCheck,
  Calendar: FiCalendar,
  Profile: FiUser,
};

const NavItems = ({ links, onNavigate }) => {
  return (
    <nav style={{ paddingLeft: "16px", paddingRight: "16px" }}>
      <div className="flex flex-col" style={{ gap: "6px" }}>
        {links.map((link) => {
          const Icon = ICONS[link.name] || FiGrid;

          return (
            <NavLink
              key={link.path}
              to={link.path}
              end={
                link.path === "/" ||
                link.path === "/pm-dashboard" ||
                link.path === "/team-member-dashboard"
              }
              onClick={onNavigate}
              className={({ isActive }) =>
                `group flex w-full items-center rounded-2xl transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-600/30"
                    : "text-slate-300 hover:bg-slate-800/40 hover:text-white"
                }`
              }
              style={{ height: "42px", paddingLeft: "8px", paddingRight: "12px" }}
            >
              {({ isActive }) => (
                <>
                  {/* Icon */}
                  <span
                    className={`flex shrink-0 items-center justify-center rounded-xl transition-all duration-300 ${
                      isActive
                        ? "bg-white/20 text-white"
                        : "bg-slate-800/60 text-slate-400 group-hover:bg-slate-800 group-hover:text-slate-200"
                    }`}
                    style={{ width: "32px", height: "36px" }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>

                  {/* Text */}
                  <span 
                    className="truncate text-sm font-medium"
                    style={{ marginLeft: "12px", whiteSpace: "nowrap" }}
                  >
                    {link.name}
                  </span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

const Sidebar = ({
  isMobileOpen = false,
  onCloseMobile = () => {},
}) => {
  const { user } = useAuth();

  const adminLinks = [
    { name: "Dashboard", path: "/" },
    { name: "Users", path: "/users" },
    { name: "Projects", path: "/projects" },
    { name: "Tasks", path: "/tasks" },
    { name: "Teams", path: "/teams" },
    { name: "Calendar", path: "/calendar" },
    { name: "Profile", path: "/profile" },
  ];

  const projectManagerLinks = [
    { name: "Dashboard", path: "/pm-dashboard" },
    { name: "Projects", path: "/projects" },
    { name: "Tasks", path: "/tasks" },
    { name: "Calendar", path: "/calendar" },
    { name: "Profile", path: "/profile" },
  ];

  const teamMemberLinks = [
    {
      name: "Dashboard",
      path: "/team-member-dashboard",
    },
    { name: "Tasks", path: "/tasks" },
    { name: "Calendar", path: "/calendar" },
    { name: "Profile", path: "/profile" },
  ];

  let links = [];

  if (user?.role === "admin") {
    links = adminLinks;
  } else if (user?.role === "project_manager") {
    links = projectManagerLinks;
  } else if (user?.role === "team_member") {
    links = teamMemberLinks;
  }

  const SidebarContent = ({ mobile = false }) => (
    <aside
      className={`flex h-full flex-col overflow-hidden bg-[#070b19] text-white ${
        mobile
          ? "w-[250px] rounded-r-3xl"
          : "w-[250px] rounded-3xl"
      }`}
    >
      {/* Header / Logo */}
      <div 
        className="flex shrink-0 items-center justify-between"
        style={{ height: "60px", paddingLeft: "20px", paddingRight: "16px" }}
      >
        <div className="flex items-center" style={{ gap: "10px" }}>
          <div
            className="flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-white shadow-md"
            style={{ width: "34px", height: "34px", padding: "4px" }}
          >
            <img
              src={logo}
              alt="NexaFlow logo"
              className="h-full w-full object-contain"
            />
          </div>

          <h1 className="whitespace-nowrap text-xl font-bold tracking-tight">
            <span className="text-white">Nexa</span>
            <span className="text-purple-400">Flow</span>
          </h1>
        </div>

        {mobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close menu"
          >
            <FiX className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto" style={{ paddingTop: "8px" }}>
        <NavItems
          links={links}
          onNavigate={onCloseMobile}
        />
      </div>

      {/* Footer */}
      <div className="shrink-0" style={{ padding: "16px 20px" }}>
        <div className="flex items-center" style={{ gap: "10px" }}>
          <div 
            className="flex shrink-0 items-center justify-center rounded-lg bg-slate-800/60 text-purple-400"
            style={{ width: "32px", height: "32px" }}
          >
            <HiSparkles className="h-4 w-4" />
          </div>

          <p className="whitespace-nowrap text-[11px] font-medium text-slate-400" style={{ margin: 0 }}>
            Organize. Collaborate. Flow.
          </p>
        </div>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden h-full sm:block">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 sm:hidden">
          <div
            className="absolute inset-0 bg-slate-950/70 backdrop-blur-sm"
            onClick={onCloseMobile}
          />

          <div className="nf-drawer-enter relative h-full">
            <SidebarContent mobile />
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;