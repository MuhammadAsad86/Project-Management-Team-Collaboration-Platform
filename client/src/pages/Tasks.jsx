import { useEffect, useState, useCallback } from "react";

import {
  getTasks,
  getAssignedTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} from "../services/taskService";

import { getUsers } from "../services/userService";

import CreateTaskModal from "../components/tasks/CreateTaskModal";
import TaskFilters from "../components/tasks/TaskFilters";

const Tasks = () => {
  const currentUser = JSON.parse(
    localStorage.getItem("user") || "{}"
  );

  const isTeamMember =
    currentUser?.role === "team_member";

  const isAdmin =
    currentUser?.role === "admin";

  const [tasks, setTasks] = useState([]);

  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  // Create Modal
  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [creating, setCreating] =
    useState(false);

  // Edit Modal
  const [showEditModal, setShowEditModal] =
    useState(false);

  const [editing, setEditing] =
    useState(false);

  const [selectedTask, setSelectedTask] =
    useState(null);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    sort: "",
    assignedTo: "",
  });

  // Debounced Search
  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [filters.search]);

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [paginationInfo, setPaginationInfo] =
    useState({
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
    });

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);

      const requestFilters = {
        search: debouncedSearch,
        status: filters.status,
        priority: filters.priority,
        sort: filters.sort,
        assignedTo: filters.assignedTo,
        page: pagination.page,
        limit: pagination.limit,
      };

      let response;

      if (isTeamMember) {
        // Team Member:
        // Backend determines ownership using req.user.id.
        response = await getAssignedTasks(
          requestFilters
        );
      } else {
        // Admin + Project Manager
        response = await getTasks(
          requestFilters
        );
      }

      setTasks(response.tasks || []);

      setPaginationInfo({
        currentPage:
          response.currentPage || 1,
        totalPages:
          response.totalPages || 1,
        hasNextPage:
          response.hasNextPage || false,
        hasPreviousPage:
          response.hasPreviousPage || false,
      });
    } catch (error) {
      console.error(
        "Tasks API Error:",
        error
      );
    } finally {
      setLoading(false);
    }
  }, [
    isTeamMember,
    filters.status,
    filters.priority,
    filters.sort,
    filters.assignedTo,
    debouncedSearch,
    pagination.page,
    pagination.limit,
  ]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Fetch Users
  // Only Admin needs the user list
  // for the Assignee filter.
  useEffect(() => {
    const fetchUsers = async () => {
      if (!isAdmin) return;

      try {
        const response = await getUsers({
          limit: 100,
        });

        setUsers(
          response.users || []
        );
      } catch (error) {
        console.error(
          "Users API Error:",
          error
        );
      }
    };

    fetchUsers();
  }, [isAdmin]);

  // Filter Change
  const handleFilterChange = (
    newFilters
  ) => {
    setFilters(newFilters);

    setPagination((prev) => ({
      ...prev,
      page: 1,
    }));
  };

  // Create Task
  const handleCreateTask = async (
    formData
  ) => {
    try {
      setCreating(true);

      await createTask(formData);

      alert(
        "Task created successfully."
      );

      setShowCreateModal(false);

      await fetchTasks();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to create task."
      );
    } finally {
      setCreating(false);
    }
  };

  // Update Task
  const handleUpdateTask = async (
    formData
  ) => {
    try {
      setEditing(true);

      await updateTask(
        selectedTask._id,
        formData
      );

      alert(
        "Task updated successfully."
      );

      setShowEditModal(false);
      setSelectedTask(null);

      await fetchTasks();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to update task."
      );
    } finally {
      setEditing(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async (
    id
  ) => {
    try {
      const confirmDelete =
        window.confirm(
          "Are you sure you want to delete this task?"
        );

      if (!confirmDelete) return;

      await deleteTask(id);

      alert(
        "Task deleted successfully."
      );

      await fetchTasks();
    } catch (error) {
      alert(
        error.response?.data?.message ||
          "Failed to delete task."
      );
    }
  };

  // Team Member Status Update
  const handleStatusUpdate = async (
    id,
    status
  ) => {
    try {
      await updateTaskStatus(
        id,
        status
      );

      alert(
        "Task status updated successfully."
      );

      await fetchTasks();
    } catch (error) {
      console.error(
        "Status Update Error:",
        error
      );

      alert(
        error.response?.data?.message ||
          "Failed to update status."
      );
    }
  };

  return (
    <div>
      {loading && (
        <p>
          Loading tasks...
        </p>
      )}

      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">
          Tasks
        </h1>

        {!isTeamMember && (
          <button
            onClick={() =>
              setShowCreateModal(true)
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-white"
          >
            + Create Task
          </button>
        )}
      </div>

      <TaskFilters
        filters={filters}
        setFilters={handleFilterChange}
        users={
          isAdmin ? users : []
        }
        isAdmin={isAdmin}
      />

      {tasks.length === 0 ? (
        <div className="rounded-lg bg-white p-8 shadow">
          <p>
            No tasks found.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task._id}
              className="rounded-lg bg-white p-5 shadow"
            >
              <h2 className="text-xl font-semibold">
                {task.title}
              </h2>

              <p>
                {task.description}
              </p>

              <div className="mt-4 flex flex-wrap gap-5 text-sm">
                <span>
                  <strong>Project:</strong>{" "}
                  {task.project?.name ||
                    "N/A"}
                </span>

                <span>
                  <strong>Assigned To:</strong>{" "}
                  {task.assignedTo?.name ||
                    "N/A"}
                </span>

                <span>
                  <strong>Status:</strong>{" "}
                  {task.status}
                </span>

                <span>
                  <strong>Priority:</strong>{" "}
                  {task.priority}
                </span>

                <span>
                  <strong>Due Date:</strong>{" "}
                  {task.dueDate
                    ? new Date(
                        task.dueDate
                      ).toLocaleDateString()
                    : "Not set"}
                </span>
              </div>

              {/* Status History */}
              {task.statusHistory?.length >
                0 && (
                <div className="mt-5 rounded-lg border p-4">
                  <h3 className="mb-3 font-semibold">
                    Status History
                  </h3>

                  <div className="space-y-3">
                    {[...task.statusHistory]
                      .reverse()
                      .map((history) => (
                        <div
                          key={
                            history._id
                          }
                          className="border-l-2 pl-3"
                        >
                          <p className="font-medium">
                            {
                              history.from
                            }{" "}
                            →{" "}
                            {
                              history.to
                            }
                          </p>

                          <p className="text-sm text-gray-500">
                            Changed by:{" "}
                            {
                              history.changedBy
                            }
                          </p>

                          <p className="text-sm text-gray-500">
                            {new Date(
                              history.changedAt
                            ).toLocaleString()}
                          </p>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <div className="mt-5 flex gap-3">
                {isTeamMember && (
                  <select
                    value={task.status}
                    onChange={(e) =>
                      handleStatusUpdate(
                        task._id,
                        e.target.value
                      )
                    }
                    className="rounded border px-3 py-1"
                  >
                    <option value="todo">
                      Todo
                    </option>

                    <option value="in_progress">
                      In Progress
                    </option>

                    <option value="review">
                      Review
                    </option>

                    <option value="completed">
                      Completed
                    </option>
                  </select>
                )}

                {!isTeamMember && (
                  <button
                    onClick={() => {
                      setSelectedTask(
                        task
                      );
                      setShowEditModal(
                        true
                      );
                    }}
                    className="bg-yellow-500 px-3 py-1 text-white"
                  >
                    Edit
                  </button>
                )}

                {!isTeamMember && (
                  <button
                    onClick={() =>
                      handleDeleteTask(
                        task._id
                      )
                    }
                    className="rounded bg-red-600 px-4 py-2 text-white"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-center gap-4">
        <button
          disabled={
            !paginationInfo.hasPreviousPage
          }
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              page:
                prev.page - 1,
            }))
          }
          className="rounded bg-gray-200 px-4 py-2"
        >
          Previous
        </button>

        <span>
          Page{" "}
          {
            paginationInfo.currentPage
          }{" "}
          of{" "}
          {
            paginationInfo.totalPages
          }
        </span>

        <button
          disabled={
            !paginationInfo.hasNextPage
          }
          onClick={() =>
            setPagination((prev) => ({
              ...prev,
              page:
                prev.page + 1,
            }))
          }
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Next
        </button>
      </div>

      <CreateTaskModal
        isOpen={
          showCreateModal
        }
        onClose={() =>
          setShowCreateModal(
            false
          )
        }
        onSubmit={
          handleCreateTask
        }
        loading={creating}
      />

      <CreateTaskModal
        isOpen={
          showEditModal
        }
        onClose={() => {
          setShowEditModal(
            false
          );
          setSelectedTask(
            null
          );
        }}
        onSubmit={
          handleUpdateTask
        }
        loading={editing}
        title="Edit Task"
        initialData={
          selectedTask || {}
        }
      />
    </div>
  );
};

export default Tasks;