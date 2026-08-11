import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/adminService";
import { getProjectStats } from "../services/projectService";
import { getMyTaskStats } from "../services/taskService";
import toast from "react-hot-toast";

const Dashboard = () => {
  const user = JSON.parse(
    localStorage.getItem("user")
  );

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
          error.response?.data?.message ||
            "Failed to load dashboard"
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
      <div className="text-center text-lg">
        Loading...
      </div>
    );
  }

  if (!role) {
    return (
      <div className="text-center text-red-500">
        User information not found.
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center text-red-500">
        Failed to load dashboard.
      </div>
    );
  }

  let title = "";
  let cards = [];

  if (role === "admin") {
    title = "Admin Dashboard";

    cards = [
      {
        title: "Total Users",
        value: stats.totalUsers ?? 0,
      },
      {
        title: "Total Projects",
        value: stats.totalProjects ?? 0,
      },
      {
        title: "Active Projects",
        value: stats.activeProjects ?? 0,
      },
      {
        title: "Pending Projects",
        value: stats.pendingProjects ?? 0,
      },
    ];
  }

  if (role === "project_manager") {
    title = "Project Manager Dashboard";

    cards = [
      {
        title: "Total Projects",
        value: stats.totalProjects ?? 0,
      },
      {
        title: "Active Projects",
        value: stats.activeProjects ?? 0,
      },
      {
        title: "Total Tasks",
        value: stats.totalTasks ?? 0,
      },
      {
        title: "Completed Tasks",
        value: stats.completedTasks ?? 0,
      },
    ];
  }

  if (role === "team_member") {
    title = "Team Member Dashboard";

    cards = [
      {
        title: "Total Tasks",
        value: stats.totalTasks ?? 0,
      },
      {
        title: "To Do",
        value: stats.todoTasks ?? 0,
      },
      {
        title: "In Progress",
        value: stats.inProgressTasks ?? 0,
      },
      {
        title: "Completed",
        value: stats.completedTasks ?? 0,
      },
    ];
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">
        {title}
      </h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="rounded-xl bg-white p-6 shadow"
          >
            <h3 className="text-gray-500">
              {card.title}
            </h3>

            <p className="mt-3 text-3xl font-bold text-indigo-600">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;