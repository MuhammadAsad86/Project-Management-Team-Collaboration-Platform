import { Routes, Route, Navigate } from "react-router-dom";

import "./App.css";

import MainLayout from "./layouts/MainLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProjectManagerDashboard from "./pages/ProjectManagerDashboard";
import TeamMemberDashboard from "./pages/TeamMemberDashboard";
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

const HomeRedirect = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "admin") {
    return <Dashboard />;
  }

  if (user.role === "project_manager") {
    return <Navigate to="/pm-dashboard" replace />;
  }

  if (user.role === "team_member") {
    return <Navigate to="/team-member-dashboard" replace />;
  }

  return <Navigate to="/unauthorized" replace />;
};

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

      <Route path="/register" element={<Register />} />

      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Application */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          {/* Home / Role Dashboard */}
          <Route path="/" element={<HomeRedirect />} />

          {/* Admin Only */}
          <Route
            element={
              <RoleRoute allowedRoles={["admin"]} />
            }
          >
            <Route path="/users" element={<Users />} />

            <Route path="/teams" element={<Teams />} />
          </Route>

          {/* Project Manager Only */}
          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  "project_manager",
                ]}
              />
            }
          >
            <Route
              path="/pm-dashboard"
              element={<ProjectManagerDashboard />}
            />
          </Route>

          {/* Team Member Only */}
          <Route
            element={
              <RoleRoute
                allowedRoles={[
                  "team_member",
                ]}
              />
            }
          >
            <Route
              path="/team-member-dashboard"
              element={<TeamMemberDashboard />}
            />
          </Route>

          {/* Shared Project Routes */}
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
            <Route
              path="/projects"
              element={<Projects />}
            />

            <Route
              path="/projects/:id"
              element={<ProjectDetails />}
            />
          </Route>

          {/* Shared Task Route */}
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
            <Route path="/tasks" element={<Tasks />} />
          </Route>

          {/* Shared Calendar */}
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
            <Route
              path="/calendar"
              element={<Calendar />}
            />
          </Route>

          {/* Shared Profile */}
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
            <Route
              path="/profile"
              element={<Profile />}
            />
          </Route>
        </Route>
      </Route>

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;