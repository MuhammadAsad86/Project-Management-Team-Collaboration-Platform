import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/adminService";
import { getProjectStats } from "../services/projectService";
import { getMyTaskStats } from "../services/taskService";
import toast from "react-hot-toast";
import {
  FiUsers,
  FiFolder,
  FiActivity,
  FiClock,
  FiCheckCircle,
  FiList,
  FiPlayCircle,
  FiTrendingUp,
  FiLayers,
  FiArrowUpRight,
  FiGrid,
  FiPieChart,
} from "react-icons/fi";

const ICONS = {
  "Total Users": FiUsers,
  "Total Projects": FiFolder,
  "Active Projects": FiActivity,
  "Pending Projects": FiClock,
  "Total Tasks": FiList,
  "Completed Tasks": FiCheckCircle,
  "To Do": FiList,
  "In Progress": FiPlayCircle,
  Completed: FiCheckCircle,
};

const ACCENTS = [
  {
    bg: "rgba(79, 70, 229, 0.08)",
    border: "rgba(79, 70, 229, 0.15)",
    fg: "#4F46E5",
    glow: "rgba(79, 70, 229, 0.12)",
  },
  {
    bg: "rgba(124, 58, 237, 0.08)",
    border: "rgba(124, 58, 237, 0.15)",
    fg: "#7C3AED",
    glow: "rgba(124, 58, 237, 0.12)",
  },
  {
    bg: "rgba(6, 182, 212, 0.08)",
    border: "rgba(6, 182, 212, 0.15)",
    fg: "#0891B2",
    glow: "rgba(6, 182, 212, 0.12)",
  },
  {
    bg: "rgba(16, 185, 129, 0.08)",
    border: "rgba(16, 185, 129, 0.15)",
    fg: "#059669",
    glow: "rgba(16, 185, 129, 0.12)",
  },
];

const Dashboard = () => {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        let response;

        if (role === "admin") {
          response = await getDashboardStats();
        } else if (role === "project_manager") {
          response = await getProjectStats();
        } else if (role === "team_member") {
          response = await getMyTaskStats();
        } else {
          throw new Error("Unsupported user role");
        }

        setStats(response.stats || {});
      } catch (error) {
        toast.error(
          error.response?.data?.message || "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    if (role) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [role]);

  if (loading) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <div className="flex flex-col items-center" style={{ gap: "12px" }}>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-600" />
          <p className="text-xs font-medium text-slate-500">
            Loading dashboard analytics...
          </p>
        </div>
      </div>
    );
  }

  if (!role) {
    return (
      <div className="w-full rounded-2xl border border-red-200/80 bg-red-50/50 p-6 text-center">
        <p className="text-sm font-semibold text-red-600">
          User session invalid or role not found. Please log in again.
        </p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="w-full rounded-2xl border border-amber-200/80 bg-amber-50/50 p-6 text-center">
        <p className="text-sm font-semibold text-amber-700">
          Failed to load dashboard statistics.
        </p>
      </div>
    );
  }

  let title = "";
  let subtitle = "";
  let cards = [];

  if (role === "admin") {
    title = "Admin Dashboard";
    subtitle = "A workspace-wide view of users and project activity.";

    cards = [
      {
        title: "Total Users",
        value: stats.totalUsers ?? 0,
        subtext: "Registered across workspace",
      },
      {
        title: "Total Projects",
        value: stats.totalProjects ?? 0,
        subtext: "Created to date",
      },
      {
        title: "Active Projects",
        value: stats.activeProjects ?? 0,
        subtext: "Currently in progress",
      },
      {
        title: "Pending Projects",
        value: stats.pendingProjects ?? 0,
        subtext: "Awaiting execution",
      },
    ];
  }

  if (role === "project_manager") {
    title = "Project Manager Dashboard";
    subtitle = "Track your projects and task progress at a glance.";

    cards = [
      {
        title: "Total Projects",
        value: stats.totalProjects ?? 0,
        subtext: "Managed by you",
      },
      {
        title: "Active Projects",
        value: stats.activeProjects ?? 0,
        subtext: "Currently active",
      },
      {
        title: "Total Tasks",
        value: stats.totalTasks ?? 0,
        subtext: "Across managed projects",
      },
      {
        title: "Completed Tasks",
        value: stats.completedTasks ?? 0,
        subtext: "Successfully finished",
      },
    ];
  }

  if (role === "team_member") {
    title = "Team Member Dashboard";
    subtitle = "Here's where your assigned work stands today.";

    cards = [
      {
        title: "Total Tasks",
        value: stats.totalTasks ?? 0,
        subtext: "Assigned to you",
      },
      {
        title: "To Do",
        value: stats.todoTasks ?? 0,
        subtext: "Pending kickoff",
      },
      {
        title: "In Progress",
        value: stats.inProgressTasks ?? 0,
        subtext: "Actively working",
      },
      {
        title: "Completed",
        value: stats.completedTasks ?? 0,
        subtext: "Tasks finished",
      },
    ];
  }

  // Dynamic Calculation for Donut Chart Slices
  const totalVal = cards.reduce((sum, item) => sum + (Number(item.value) || 0), 0) || 1;
  const chartColors = ["#4F46E5", "#7C3AED", "#06B6D4", "#10B981"];
  
  let accumulatedAngle = 0;
  const chartSlices = cards.map((card, idx) => {
    const value = Number(card.value) || 0;
    const percentage = Math.round((value / totalVal) * 100);
    const angle = (value / totalVal) * 360;
    const startAngle = accumulatedAngle;
    accumulatedAngle += angle;

    return {
      title: card.title,
      value,
      percentage,
      color: chartColors[idx % chartColors.length],
      startAngle,
      angle,
    };
  });

  // Conic gradient string for pure CSS pie chart
  const gradientParts = chartSlices.map(
    (slice) => `${slice.color} ${slice.startAngle}deg ${slice.startAngle + slice.angle}deg`
  ).join(", ");

  const conicGradient = `conic-gradient(${gradientParts || "#4F46E5 0deg 360deg"})`;

  return (
    <div className="flex w-full flex-col" style={{ gap: "24px" }}>
      {/* 1. HEADER SECTION */}
      <div 
        className="relative flex w-full flex-col justify-between rounded-2xl border border-white/80 bg-gradient-to-r from-white via-slate-50/80 to-indigo-50/30 shadow-sm sm:flex-row sm:items-center"
        style={{ padding: "18px 20px", gap: "16px" }}
      >
        <div className="flex flex-col" style={{ gap: "4px", minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <span 
              className="inline-flex items-center rounded-full border border-indigo-200/60 bg-indigo-50 text-xs font-semibold text-indigo-700"
              style={{ padding: "2px 10px", gap: "6px" }}
            >
              <FiTrendingUp className="h-3.5 w-3.5" />
              Live Overview
            </span>
          </div>
          <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl" style={{ margin: 0 }}>
            {title}
          </h1>
          <p className="truncate text-xs font-medium text-slate-500 sm:text-sm" style={{ margin: 0 }}>
            {subtitle}
          </p>
        </div>

        <div className="flex shrink-0 items-center" style={{ gap: "10px" }}>
          <div 
            className="flex items-center rounded-xl border border-slate-200/80 bg-white shadow-sm"
            style={{ padding: "6px 12px", gap: "10px" }}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
              <FiGrid className="h-3.5 w-3.5" />
            </div>
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400" style={{ margin: 0 }}>
                Role Workspace
              </p>
              <p className="text-xs font-bold capitalize text-slate-800" style={{ margin: 0 }}>
                {role?.replace("_", " ")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STAT CARDS GRID */}
      <div 
        className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ gap: "18px" }}
      >
        {cards.map((card, index) => {
          const Icon = ICONS[card.title] || FiActivity;
          const accent = ACCENTS[index % ACCENTS.length];

          return (
            <div
              key={card.title}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all hover:-translate-y-1 hover:border-indigo-200 hover:shadow-md"
              style={{ padding: "18px", gap: "14px" }}
            >
              <div>
                <div className="flex items-center justify-between" style={{ gap: "10px" }}>
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
                className="flex items-center justify-between border-t border-slate-100 text-xs font-medium text-slate-500"
                style={{ paddingTop: "10px" }}
              >
                <span className="truncate">{card.subtext}</span>
                <FiArrowUpRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. WORKSPACE SUMMARY & PIE CHART SECTION */}
      <div 
        className="grid w-full grid-cols-1 lg:grid-cols-3"
        style={{ gap: "20px" }}
      >
        {/* Activity Summary with Donut Chart */}
        <div 
          className="flex flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:col-span-2"
          style={{ padding: "20px", gap: "16px" }}
        >
          <div className="flex items-center border-b border-slate-100" style={{ paddingBottom: "14px", gap: "12px" }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
              <FiPieChart className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800" style={{ margin: 0 }}>
                Data Distribution Analytics
              </h3>
              <p className="text-xs text-slate-500" style={{ margin: 0 }}>
                Proportional breakdown of workspace metrics
              </p>
            </div>
          </div>

          {/* 3D Donut Pie Chart Layout */}
          <div className="flex flex-col items-center justify-around sm:flex-row" style={{ gap: "20px", padding: "10px 0" }}>
            {/* Visual Pie/Donut Graphics */}
            <div className="relative flex shrink-0 items-center justify-center" style={{ width: "160px", height: "160px" }}>
              <div 
                className="h-full w-full rounded-full shadow-lg"
                style={{ 
                  background: conicGradient,
                  boxShadow: "0 10px 25px -5px rgba(79, 70, 229, 0.25)" 
                }}
              />
              <div 
                className="absolute flex flex-col items-center justify-center rounded-full bg-white shadow-inner"
                style={{ width: "95px", height: "95px" }}
              >
                <span className="text-lg font-black text-slate-800" style={{ lineHeight: 1 }}>{totalVal}</span>
                <span className="text-[10px] font-semibold text-slate-400" style={{ marginTop: "2px" }}>Total Items</span>
              </div>
            </div>

            {/* Pie Chart Legend List */}
            <div className="flex flex-1 flex-col justify-center" style={{ gap: "10px", width: "100%", maxWidth: "280px" }}>
              {chartSlices.map((slice) => (
                <div key={slice.title} className="flex items-center justify-between text-xs" style={{ gap: "8px" }}>
                  <div className="flex items-center" style={{ gap: "8px" }}>
                    <span 
                      className="h-3 w-3 shrink-0 rounded-full" 
                      style={{ backgroundColor: slice.color, boxShadow: `0 2px 6px ${slice.color}66` }} 
                    />
                    <span className="font-semibold text-slate-700 truncate">{slice.title}</span>
                  </div>
                  <div className="flex items-center" style={{ gap: "8px" }}>
                    <span className="font-bold text-slate-800">{slice.value}</span>
                    <span className="text-[10px] font-semibold text-slate-400" style={{ width: "32px", textAlign: "right" }}>
                      ({slice.percentage}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pro Productivity Tip Card with 100% VISIBLE HEADING */}
        <div 
          className="relative overflow-hidden flex flex-col justify-between rounded-2xl border border-slate-800 bg-[#0F172A] text-white shadow-xl"
          style={{ padding: "22px", minHeight: "220px" }}
        >
          {/* Subtle Glows */}
          <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-indigo-500/25 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-purple-500/25 blur-2xl" />

          <div className="relative z-10 flex flex-col" style={{ gap: "10px" }}>
            <span 
              className="inline-block rounded-full bg-indigo-500/20 text-[10px] font-bold text-indigo-300 border border-indigo-500/30"
              style={{ padding: "3px 10px", width: "fit-content" }}
            >
              Pro Productivity Tip
            </span>
            <h4 
              className="text-base font-extrabold" 
              style={{ 
                margin: 0, 
                lineHeight: "1.35", 
                letterSpacing: "0.01em", 
                color: "#FFFFFF", 
                opacity: 1 
              }}
            >
              Streamline team collaboration with automated tasks
            </h4>
            <p className="text-xs font-medium text-slate-300" style={{ margin: 0, lineHeight: "1.5" }}>
              Keep your team aligned by organizing projects, setting milestones, and tracking real-time status updates directly from your dashboard.
            </p>
          </div>

          <div 
            className="relative z-10 flex items-center justify-between border-t border-slate-800 text-[11px] font-semibold text-slate-400"
            style={{ paddingTop: "12px", marginTop: "16px" }}
          >
            <span>NexaFlow SaaS Platform</span>
            <span className="flex items-center" style={{ gap: "6px" }}>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;