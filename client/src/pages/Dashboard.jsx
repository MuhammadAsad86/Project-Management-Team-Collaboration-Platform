import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/adminService";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    activeProjects: 0,
    pendingProjects: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getDashboardStats();
        setStats(response.stats);
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const cards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
    },
    {
      title: "Total Projects",
      value: stats.totalProjects,
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
    },
    {
      title: "Pending Projects",
      value: stats.pendingProjects,
    },
  ];

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">
        Admin Dashboard
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