import { useEffect, useState } from "react";
import { getDashboardStats } from "../services/adminService";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTeamMembers: 0,
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getDashboardStats();

        setStats(response.stats);
      } catch (error) {
        console.error("Dashboard Error:", error);
      }
    };

    fetchDashboard();
  }, []);

  const cards = [
    {
      title: "Total Projects",
      value: stats.totalProjects,
    },
    {
      title: "Active Projects",
      value: stats.activeProjects,
    },
    {
      title: "Completed Projects",
      value: stats.completedProjects,
    },
    {
      title: "Team Members",
      value: stats.totalTeamMembers,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">
        Dashboard
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

            <p className="mt-3 text-3xl font-bold">
              {card.value}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;