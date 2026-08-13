import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiCheckCircle,
  FiClock,
  FiFolder,
  FiLayers,
  FiList,
  FiPlayCircle,
  FiTrendingUp,
  FiArrowUpRight,
  FiAlertCircle,
  FiCheckSquare,
} from "react-icons/fi";

import { getAssignedTasks } from "../services/taskService";
import { getProjects } from "../services/projectService";

const TeamMemberDashboard = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [projectsRes, tasksRes] =
          await Promise.all([
            getProjects({
              page: 1,
              limit: 100,
            }),

            // Team Member:
            // Backend determines assigned tasks
            // using req.user.id
            getAssignedTasks(),
          ]);

        setProjects(projectsRes.projects || []);
        setTasks(tasksRes.tasks || []);
      } catch (error) {
        console.error(
          "Team Member Dashboard Error:",
          error
        );

        toast.error(
          error.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const totalTasks = tasks.length;

  const pendingTasks = tasks.filter(
    (task) => task.status === "todo"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in_progress"
  ).length;

  const reviewTasks = tasks.filter(
    (task) => task.status === "review"
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "completed"
  ).length;

  const upcomingDeadlines = tasks
    .filter((task) => task.dueDate)
    .filter(
      (task) =>
        task.status !== "completed" &&
        new Date(task.dueDate) >= new Date()
    )
    .sort(
      (a, b) =>
        new Date(a.dueDate) -
        new Date(b.dueDate)
    )
    .slice(0, 5);

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <div className="flex flex-col items-center" style={{ gap: "12px" }}>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-600" />
          <p className="text-xs font-medium text-slate-500">
            Loading dashboard workspace...
          </p>
        </div>
      </div>
    );
  }

  const statCardsData = [
    {
      title: "Assigned Projects",
      value: projects.length,
      subtext: "Associated spaces",
      icon: FiFolder,
      accent: {
        bg: "rgba(79, 70, 229, 0.08)",
        border: "rgba(79, 70, 229, 0.15)",
        fg: "#4F46E5",
        glow: "rgba(79, 70, 229, 0.12)",
      },
    },
    {
      title: "Total Assigned Tasks",
      value: totalTasks,
      subtext: "Active workload",
      icon: FiList,
      accent: {
        bg: "rgba(124, 58, 237, 0.08)",
        border: "rgba(124, 58, 237, 0.15)",
        fg: "#7C3AED",
        glow: "rgba(124, 58, 237, 0.12)",
      },
    },
    {
      title: "Pending Tasks",
      value: pendingTasks,
      subtext: "Pending kickoff",
      icon: FiClock,
      accent: {
        bg: "rgba(234, 179, 8, 0.08)",
        border: "rgba(234, 179, 8, 0.15)",
        fg: "#CA8A04",
        glow: "rgba(234, 179, 8, 0.12)",
      },
    },
    {
      title: "Completed Tasks",
      value: completedTasks,
      subtext: "Successfully finished",
      icon: FiCheckCircle,
      accent: {
        bg: "rgba(16, 185, 129, 0.08)",
        border: "rgba(16, 185, 129, 0.15)",
        fg: "#059669",
        glow: "rgba(16, 185, 129, 0.12)",
      },
    },
  ];

  const secondaryStatsData = [
    {
      title: "In Progress",
      value: inProgressTasks,
      icon: FiPlayCircle,
      textColor: "text-indigo-600",
    },
    {
      title: "Review",
      value: reviewTasks,
      icon: FiAlertCircle,
      textColor: "text-purple-600",
    },
    {
      title: "Overall Progress",
      value: `${
        totalTasks > 0
          ? Math.round(
              (completedTasks /
                totalTasks) *
                100
            )
          : 0
      }%`,
      icon: FiTrendingUp,
      textColor: "text-emerald-600",
    },
  ];

  return (
    <div className="flex w-full flex-col" style={{ gap: "24px" }}>
      {/* 1. HEADER SECTION */}
      <div 
        className="relative flex w-full flex-col justify-between rounded-2xl border border-white/80 bg-gradient-to-r from-white via-slate-50/80 to-indigo-50/30 shadow-sm sm:flex-row sm:items-center"
        style={{ padding: "18px 20px", gap: "16px" }}
      >
        <div className="flex flex-col min-w-0" style={{ gap: "4px" }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <span 
              className="inline-flex items-center rounded-full border border-indigo-200/60 bg-indigo-50 text-xs font-semibold text-indigo-700"
              style={{ padding: "2px 10px", gap: "6px" }}
            >
              <FiCheckSquare className="h-3.5 w-3.5" />
              Team Member Workspace
            </span>
          </div>
          <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl" style={{ margin: 0 }}>
            Team Member Dashboard
          </h1>
          <p className="truncate text-xs font-medium text-slate-500 sm:text-sm" style={{ margin: 0 }}>
            Overview of your assigned projects and tasks.
          </p>
        </div>

        <div className="flex shrink-0 items-center">
          <div 
            className="flex items-center rounded-xl border border-slate-200/80 bg-white shadow-sm"
            style={{ padding: "6px 12px", gap: "10px" }}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
              <FiLayers className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400" style={{ margin: 0 }}>
                Active Session
              </p>
              <p className="text-xs font-bold text-slate-800" style={{ margin: 0 }}>
                Personal Hub
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. MAIN STATISTICS GRID */}
      <div 
        className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ gap: "18px" }}
      >
        {statCardsData.map((card) => {
          const Icon = card.icon;
          const accent = card.accent;

          return (
            <div
              key={card.title}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
              style={{ padding: "18px", gap: "14px" }}
            >
              <div className="min-w-0">
                <div className="flex items-center justify-between min-w-0" style={{ gap: "10px" }}>
                  <span className="truncate text-xs font-semibold uppercase tracking-wider text-slate-400">
                    {card.title}
                  </span>

                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border"
                    style={{
                      backgroundColor: accent.bg,
                      borderColor: accent.border,
                      color: accent.fg,
                      boxShadow: `0 4px 12px ${accent.glow}`,
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                </div>

                <div className="flex items-baseline" style={{ marginTop: "10px" }}>
                  <span className="text-2xl font-extrabold text-slate-900 sm:text-3xl" style={{ lineHeight: 1 }}>
                    {card.value}
                  </span>
                </div>
              </div>

              <div 
                className="flex items-center justify-between border-t border-slate-100 text-xs font-medium text-slate-500 min-w-0"
                style={{ paddingTop: "10px" }}
              >
                <span className="truncate">{card.subtext}</span>
                <FiArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. SECONDARY STATISTICS GRID */}
      <div 
        className="grid w-full grid-cols-1 sm:grid-cols-3"
        style={{ gap: "18px" }}
      >
        {secondaryStatsData.map((secCard) => {
          const SecIcon = secCard.icon;
          return (
            <div
              key={secCard.title}
              className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:border-indigo-200 hover:shadow-md"
              style={{ padding: "18px" }}
            >
              <div className="flex flex-col min-w-0" style={{ gap: "4px" }}>
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 truncate">
                  {secCard.title}
                </span>
                <span className={`text-xl font-black ${secCard.textColor}`}>
                  {secCard.value}
                </span>
              </div>
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-50 border border-slate-200/60 text-slate-600">
                <SecIcon className="h-4 w-4" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. ASSIGNED PROJECTS SECTION */}
      <div 
        className="flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        style={{ padding: "20px", gap: "16px" }}
      >
        <div className="flex items-center justify-between border-b border-slate-100" style={{ paddingBottom: "14px" }}>
          <div className="flex items-center min-w-0" style={{ gap: "10px" }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
              <FiFolder className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 truncate" style={{ margin: 0 }}>
              Assigned Projects
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 shrink-0">
            {projects.length} Total
          </span>
        </div>

        {projects.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center" style={{ gap: "8px" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FiFolder className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-800" style={{ margin: 0 }}>No assigned projects found</p>
            <p className="text-[11px] font-medium text-slate-400 max-w-[220px]" style={{ margin: 0 }}>
              You are not currently assigned to any projects. Check back later for updates.
            </p>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: "12px" }}>
            {projects.map((project) => (
              <button
                key={project._id}
                type="button"
                onClick={() =>
                  navigate(
                    `/projects/${project._id}`
                  )
                }
                className="group flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200/70 bg-white p-4 text-left transition-all hover:border-indigo-300 hover:bg-slate-50/60 hover:shadow-sm min-w-0"
                style={{ gap: "16px" }}
              >
                <div className="flex-1 min-w-0 flex flex-col" style={{ gap: "4px" }}>
                  <h3 className="truncate text-xs font-bold text-slate-800 group-hover:text-indigo-600 transition-colors" style={{ margin: 0 }}>
                    {project.name}
                  </h3>

                  <p className="truncate text-[11px] font-medium text-slate-500" style={{ margin: 0 }}>
                    {project.description ||
                      "No description"}
                  </p>

                  <span className="text-[10px] font-semibold text-indigo-600 mt-0.5">
                    Click to open project
                  </span>
                </div>

                <div className="flex items-center shrink-0" style={{ gap: "12px" }}>
                  <span className="rounded-full border border-indigo-200/60 bg-indigo-50 px-3 py-1 text-[11px] font-semibold capitalize text-indigo-700">
                    {project.status}
                  </span>
                  <FiArrowUpRight className="h-4 w-4 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* 5. UPCOMING DEADLINES SECTION */}
      <div 
        className="flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm"
        style={{ padding: "20px", gap: "16px" }}
      >
        <div className="flex items-center justify-between border-b border-slate-100" style={{ paddingBottom: "14px" }}>
          <div className="flex items-center min-w-0" style={{ gap: "10px" }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 shrink-0">
              <FiClock className="h-4 w-4" />
            </div>
            <h2 className="text-sm font-bold text-slate-800 truncate" style={{ margin: 0 }}>
              Upcoming Deadlines
            </h2>
          </div>
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600 shrink-0">
            {upcomingDeadlines.length} Due Soon
          </span>
        </div>

        {upcomingDeadlines.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center" style={{ gap: "8px" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <FiClock className="h-6 w-6" />
            </div>
            <p className="text-xs font-bold text-slate-800" style={{ margin: 0 }}>No upcoming deadlines</p>
            <p className="text-[11px] font-medium text-slate-400 max-w-[200px]" style={{ margin: 0 }}>
              You are all caught up with your scheduled tasks.
            </p>
          </div>
        ) : (
          <div className="flex flex-col" style={{ gap: "12px" }}>
            {upcomingDeadlines.map((task) => (
              <div
                key={task._id}
                className="flex items-center justify-between rounded-xl border border-slate-200/70 bg-white p-4 transition-all hover:border-slate-300 min-w-0"
                style={{ gap: "16px" }}
              >
                <div className="flex-1 min-w-0 flex flex-col" style={{ gap: "4px" }}>
                  <h3 className="truncate text-xs font-bold text-slate-800" style={{ margin: 0 }}>
                    {task.title}
                  </h3>

                  <p className="truncate text-[11px] font-medium text-slate-500" style={{ margin: 0 }}>
                    {task.project?.name ||
                      "No project"}
                  </p>
                </div>

                <div className="flex items-center shrink-0">
                  <span className="flex items-center rounded-full border border-amber-200/60 bg-amber-50 px-3 py-1 text-[11px] font-semibold text-amber-700" style={{ gap: "6px" }}>
                    <FiClock className="h-3 w-3 shrink-0" />
                    <span>
                      {new Date(
                        task.dueDate
                      ).toLocaleDateString()}
                    </span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMemberDashboard;