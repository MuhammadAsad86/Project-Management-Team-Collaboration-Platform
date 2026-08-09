import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

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
      <div className="text-center text-lg">
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Team Member Dashboard
        </h1>

        <p className="mt-1 text-gray-500">
          Overview of your assigned projects and
          tasks.
        </p>
      </div>

      {/* Main Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Assigned Projects */}
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Assigned Projects
          </p>

          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {projects.length}
          </p>
        </div>

        {/* Total Tasks */}
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Total Assigned Tasks
          </p>

          <p className="mt-2 text-3xl font-bold text-indigo-600">
            {totalTasks}
          </p>
        </div>

        {/* Pending Tasks */}
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Pending Tasks
          </p>

          <p className="mt-2 text-3xl font-bold text-yellow-600">
            {pendingTasks}
          </p>
        </div>

        {/* Completed Tasks */}
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Completed Tasks
          </p>

          <p className="mt-2 text-3xl font-bold text-green-600">
            {completedTasks}
          </p>
        </div>
      </div>

      {/* Secondary Statistics */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {/* In Progress */}
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            In Progress
          </p>

          <p className="mt-2 text-2xl font-bold">
            {inProgressTasks}
          </p>
        </div>

        {/* Review */}
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Review
          </p>

          <p className="mt-2 text-2xl font-bold">
            {reviewTasks}
          </p>
        </div>

        {/* Overall Progress */}
        <div className="rounded-xl bg-white p-6 shadow">
          <p className="text-sm text-gray-500">
            Overall Progress
          </p>

          <p className="mt-2 text-2xl font-bold">
            {totalTasks > 0
              ? Math.round(
                  (completedTasks /
                    totalTasks) *
                    100
                )
              : 0}
            %
          </p>
        </div>
      </div>

      {/* Assigned Projects */}
      <div className="rounded-xl bg-white p-6 shadow">
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
              <button
                key={project._id}
                type="button"
                onClick={() =>
                  navigate(
                    `/projects/${project._id}`
                  )
                }
                className="w-full rounded-lg border p-4 text-left transition hover:border-blue-500 hover:bg-blue-50"
              >
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                  <div>
                    <h3 className="font-semibold">
                      {project.name}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {project.description ||
                        "No description"}
                    </p>

                    <p className="mt-2 text-xs text-blue-600">
                      Click to open project
                    </p>
                  </div>

                  <span className="w-fit rounded bg-blue-100 px-3 py-1 text-sm font-medium capitalize text-blue-700">
                    {project.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming Deadlines */}
      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-4 text-xl font-semibold">
          Upcoming Deadlines
        </h2>

        {upcomingDeadlines.length === 0 ? (
          <p className="text-gray-500">
            No upcoming deadlines.
          </p>
        ) : (
          <div className="space-y-3">
            {upcomingDeadlines.map((task) => (
              <div
                key={task._id}
                className="flex flex-col justify-between gap-3 rounded-lg border p-4 sm:flex-row sm:items-center"
              >
                <div>
                  <h3 className="font-semibold">
                    {task.title}
                  </h3>

                  <p className="text-sm text-gray-500">
                    {task.project?.name ||
                      "No project"}
                  </p>
                </div>

                <span className="text-sm font-medium">
                  {new Date(
                    task.dueDate
                  ).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamMemberDashboard;