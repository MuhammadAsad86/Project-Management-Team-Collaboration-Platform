import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAssignedProjects,
  getProjectStats,
} from "../services/projectService";
import toast from "react-hot-toast";

const ProjectManagerDashboard = () => {
  const navigate = useNavigate();

  const [projects, setProjects] = useState([]);

  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const [projectsRes, statsRes] = await Promise.all([
          getAssignedProjects(),
          getProjectStats(),
        ]);

        setProjects(projectsRes.projects || []);

        setStats({
          totalProjects:
            projectsRes.count ??
            statsRes.stats?.totalProjects ??
            0,
          activeProjects:
            statsRes.stats?.activeProjects ?? 0,
          totalTasks:
            statsRes.stats?.totalTasks ?? 0,
          completedTasks:
            statsRes.stats?.completedTasks ?? 0,
        });
      } catch (error) {
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

  if (loading) {
    return (
      <div className="text-center text-lg">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">
        Project Manager Dashboard
      </h1>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-gray-500">
            Assigned Projects
          </h2>
          <p className="mt-2 text-3xl font-bold">
            {stats.totalProjects}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-gray-500">
            Active Projects
          </h2>
          <p className="mt-2 text-3xl font-bold">
            {stats.activeProjects}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-gray-500">
            Pending Tasks
          </h2>
          <p className="mt-2 text-3xl font-bold">
            {stats.totalTasks - stats.completedTasks}
          </p>
        </div>

        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="text-gray-500">
            Completed Tasks
          </h2>
          <p className="mt-2 text-3xl font-bold">
            {stats.completedTasks}
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">
          Assigned Projects
        </h2>

        {projects.length === 0 ? (
          <p className="text-gray-500">
            No assigned projects found.
          </p>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() =>
                  navigate(`/projects/${project._id}`)
                }
                className="flex cursor-pointer items-center justify-between rounded-lg border p-4 transition hover:bg-gray-50 hover:shadow"
              >
                <div>
                  <h3 className="font-semibold">
                    {project.name}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {project.description ||
                      "No description"}
                  </p>
                </div>

                <span className="rounded bg-blue-100 px-3 py-1 text-sm font-medium capitalize text-blue-700">
                  {project.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectManagerDashboard;