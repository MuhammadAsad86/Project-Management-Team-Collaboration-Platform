import { NavLink } from "react-router-dom";
import { FaHome, FaProjectDiagram, FaTasks, FaUsers } from "react-icons/fa";

const Sidebar = () => {
  const navClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-4 py-3 transition ${
      isActive
        ? "bg-indigo-600 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <aside className="h-screen w-64 border-r bg-white p-4">
      <h2 className="mb-8 text-2xl font-bold text-indigo-600">
        PM Platform
      </h2>

      <nav className="space-y-2">
        <NavLink to="/" className={navClass}>
          <FaHome />
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/projects" className={navClass}>
          <FaProjectDiagram />
          <span>Projects</span>
        </NavLink>

        <NavLink to="/tasks" className={navClass}>
          <FaTasks />
          <span>Tasks</span>
        </NavLink>

        <NavLink to="/team" className={navClass}>
          <FaUsers />
          <span>Team</span>
        </NavLink>
      </nav>
    </aside>
  );
};

export default Sidebar;