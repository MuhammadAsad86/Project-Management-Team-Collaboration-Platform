import { NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Sidebar = () => {
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
     { name: "Dashboard", path: "/team-member-dashboard" },
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

  return (
    <aside className="min-h-screen w-64 bg-slate-900 text-white">
      <div className="border-b border-slate-700 p-6">
        <h1 className="text-xl font-bold">
          Project Manager
        </h1>
      </div>

      <nav className="space-y-2 p-4">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            end={link.path === "/" || link.path === "/pm-dashboard"}
            className={({ isActive }) =>
              `block rounded-lg px-4 py-2 transition ${
                isActive
                  ? "bg-blue-600 text-white"
                  : "hover:bg-slate-800"
              }`
            }
          >
            {link.name}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;