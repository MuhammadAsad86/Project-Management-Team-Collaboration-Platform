import { useEffect, useState, useCallback } from "react";

import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
} from "../services/taskService";

import CreateTaskModal from "../components/tasks/CreateTaskModal";
import TaskFilters from "../components/tasks/TaskFilters";

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Create Task Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);

  // Edit Task Modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editing, setEditing] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    sort: "",
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  // Fetch Tasks
  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getTasks({
        ...filters,
        page: pagination.page,
        limit: pagination.limit,
      });

      setTasks(response.tasks || []);

      setPaginationInfo({
        currentPage: response.currentPage,
        totalPages: response.totalPages,
        hasNextPage: response.hasNextPage,
        hasPreviousPage: response.hasPreviousPage,
      });
    } catch (error) {
      console.error("Tasks API Error:", error);
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filters change -> always reset to page 1
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Create Task
  const handleCreateTask = async (formData) => {
    try {
      setCreating(true);

      await createTask(formData);

      alert("Task created successfully.");

      setShowCreateModal(false);

      await fetchTasks();
    } catch (error) {
      console.error("Create Task Error:", error);

      alert(error.response?.data?.message || "Failed to create task.");
    } finally {
      setCreating(false);
    }
  };

  // Update Task
  const handleUpdateTask = async (formData) => {
    try {
      setEditing(true);

      await updateTask(selectedTask._id, formData);

      alert("Task updated successfully.");

      setShowEditModal(false);
      setSelectedTask(null);

      await fetchTasks();
    } catch (error) {
      console.error("Update Task Error:", error);

      alert(error.response?.data?.message || "Failed to update task.");
    } finally {
      setEditing(false);
    }
  };

  // Delete Task
  const handleDeleteTask = async (id) => {
    try {
      const confirmDelete = window.confirm(
        "Are you sure you want to delete this task?"
      );

      if (!confirmDelete) return;

      await deleteTask(id);

      alert("Task deleted successfully.");

      // If this was the last task on a page beyond page 1,
      // step back a page so we don't land on an empty page.
      if (tasks.length === 1 && pagination.page > 1) {
        setPagination((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        await fetchTasks();
      }
    } catch (error) {
      console.error("Delete Task Error:", error);

      alert(error.response?.data?.message || "Failed to delete task.");
    }
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="rounded-lg bg-blue-50 p-3 text-center text-blue-600">
          Loading tasks...
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tasks</h1>

        <button
          onClick={() => setShowCreateModal(true)}
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          + Create Task
        </button>
      </div>

      {/* Task Filters */}
      <TaskFilters filters={filters} setFilters={handleFilterChange} />

      {/* Tasks List */}
      {tasks.length === 0 ? (
        <div className="rounded-lg bg-white p-8 shadow">
          <p className="text-gray-500">No tasks found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {tasks.map((task) => (
            <div key={task._id} className="rounded-lg bg-white p-5 shadow">
              <h2 className="text-xl font-semibold">{task.title}</h2>

              <p className="mt-2 text-gray-600">{task.description}</p>

              <div className="mt-4 flex flex-wrap gap-5 text-sm">
                <span>
                  <strong>Project:</strong> {task.project?.name || "N/A"}
                </span>

                <span>
                  <strong>Assigned To:</strong>{" "}
                  {task.assignedTo?.name || "N/A"}
                </span>

                <span>
                  <strong>Status:</strong> {task.status}
                </span>

                <span>
                  <strong>Priority:</strong> {task.priority}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 flex gap-3">
                <button
                  onClick={() => {
                    setSelectedTask(task);
                    setShowEditModal(true);
                  }}
                  className="rounded-lg bg-yellow-500 px-4 py-2 text-white hover:bg-yellow-600"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDeleteTask(task._id)}
                  className="rounded-lg bg-red-600 px-4 py-2 text-white hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <button
          disabled={!paginationInfo.hasPreviousPage}
          onClick={() =>
            setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
          }
          className="rounded-lg bg-gray-200 px-4 py-2 disabled:opacity-50"
        >
          Previous
        </button>

        <span className="font-medium">
          Page {paginationInfo.currentPage} of {paginationInfo.totalPages}
        </span>

        <button
          disabled={!paginationInfo.hasNextPage}
          onClick={() =>
            setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
          }
          className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Create Task Modal */}
      <CreateTaskModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateTask}
        loading={creating}
      />

      {/* Edit Task Modal */}
      <CreateTaskModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedTask(null);
        }}
        onSubmit={handleUpdateTask}
        loading={editing}
        title="Edit Task"
        initialData={selectedTask || {}}
      />
    </div>
  );
};

export default Tasks;