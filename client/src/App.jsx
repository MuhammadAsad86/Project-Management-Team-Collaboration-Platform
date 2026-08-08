import { Routes, Route } from "react-router-dom";

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

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>

          {/* =========================
              ADMIN ONLY
          ========================== */}
          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            <Route path="/" element={<Dashboard />} />

            <Route path="/users" element={<Users />} />

            <Route path="/teams" element={<Teams />} />
          </Route>

          {/* =========================
              PROJECT MANAGER ONLY
          ========================== */}
          <Route
            element={
              <RoleRoute allowedRoles={["project_manager"]} />
            }
          >
            <Route
              path="/pm-dashboard"
              element={<ProjectManagerDashboard />}
            />
          </Route>

          {/* =========================
              TEAM MEMBER ONLY
          ========================== */}
          <Route
            element={
              <RoleRoute allowedRoles={["team_member"]} />
            }
          >
            <Route
              path="/team-member-dashboard"
              element={<TeamMemberDashboard />}
            />
          </Route>

          {/* =========================
              SHARED PROJECT ROUTES
          ========================== */}

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

          {/* =========================
              SHARED TASK ROUTE
          ========================== */}

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
              path="/tasks"
              element={<Tasks />}
            />
          </Route>

          {/* =========================
              SHARED CALENDAR
          ========================== */}

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

          {/* =========================
              SHARED PROFILE
          ========================== */}

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