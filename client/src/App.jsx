import { Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProjectManagerDashboard from "./pages/ProjectManagerDashboard";
import Users from "./pages/Users";
import Projects from "./pages/Projects";
import ProjectDetails from "./pages/ProjectDetails";
import Tasks from "./pages/Tasks";
import Teams from "./pages/Teams";
import Calendar from "./pages/Calendar";
import Profile from "./pages/Profile";
import Unauthorized from "./pages/Unauthorized";
import NotFound from "./pages/NotFound";

import ProtectedRoute from "./routes/ProtectedRoute";
import RoleRoute from "./routes/RoleRoute";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route
          element={
            <RoleRoute
              allowedRoles={[
                "admin",
                "project_manager",
                "team_member",
              ]}
            />
          }
        >
          <Route element={<MainLayout />}>
            {/* Dashboard */}
            <Route path="/" element={<Dashboard />} />

            {/* Project Manager Dashboard */}
            <Route
              path="/pm-dashboard"
              element={<ProjectManagerDashboard />}
            />

            {/* Users */}
            <Route path="/users" element={<Users />} />

            {/* Projects */}
            <Route path="/projects" element={<Projects />} />
            <Route
              path="/projects/:id"
              element={<ProjectDetails />}
            />

            {/* Tasks */}
            <Route path="/tasks" element={<Tasks />} />

            {/* Teams */}
            <Route path="/teams" element={<Teams />} />

            {/* Calendar */}
            <Route path="/calendar" element={<Calendar />} />

            {/* Profile */}
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;