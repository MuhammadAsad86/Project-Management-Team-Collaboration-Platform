import { useEffect, useState } from "react";
import { getProjects } from "../../services/projectService";
import { getUsers } from "../../services/userService";
import { 
  FiFileText, 
  FiFolder, 
  FiUser, 
  FiFlag, 
  FiActivity, 
  FiCalendar, 
  FiCheck 
} from "react-icons/fi";

const TaskForm = ({
  onSubmit,
  loading = false,
  initialData = {},
}) => {
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [formData, setFormData] = useState({
    title: initialData.title || "",
    description: initialData.description || "",
    project: initialData.project?._id || initialData.project || "",
    assignedTo: initialData.assignedTo?._id || initialData.assignedTo || "",
    priority: initialData.priority || "medium",
    status: initialData.status || "todo",
    dueDate: initialData.dueDate ? initialData.dueDate.split("T")[0] : "",
  });

  // Update form when editing task
  useEffect(() => {
    setFormData({
      title: initialData.title || "",
      description: initialData.description || "",
      project: initialData.project?._id || initialData.project || "",
      assignedTo: initialData.assignedTo?._id || initialData.assignedTo || "",
      priority: initialData.priority || "medium",
      status: initialData.status || "todo",
      dueDate: initialData.dueDate
        ? initialData.dueDate.split("T")[0]
        : "",
    });
  }, [initialData]);

  // Load Projects and Users
  useEffect(() => {
    const fetchData = async () => {
      try {
        const projectResponse = await getProjects();
        setProjects(projectResponse.projects || []);
      } catch (error) {
        console.error("Projects Dropdown Error:", error);
      }

      try {
        const userResponse = await getUsers();
        setUsers(userResponse.users || []);
      } catch (error) {
        console.error("Users Dropdown Error:", error);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // If editing an existing task (initialData has _id), exclude status to prevent 400 error
    if (initialData?._id) {
      const { status, ...updatePayload } = formData;
      onSubmit(updatePayload);
    } else {
      // Creating a new task includes status
      onSubmit(formData);
    }
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="flex flex-col w-full" 
      style={{ gap: "12px", padding: "0 2px", marginTop: "4px" }}
    >
      {/* Task Title Field */}
      <div className="flex flex-col" style={{ gap: "4px" }}>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
          Task Title <span className="text-red-500">*</span>
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3 flex items-center pointer-events-none text-slate-400">
            <FiFileText className="h-3.5 w-3.5" />
          </span>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Implement user authentication workflow"
            required
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 sm:text-xs"
            style={{ padding: "9px 12px 9px 36px" }}
          />
        </div>
      </div>

      {/* Description Field */}
      <div className="flex flex-col" style={{ gap: "4px" }}>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
          Description
        </label>
        <div className="relative flex">
          <span className="absolute left-3 top-2.5 flex items-start pointer-events-none text-slate-400">
            <FiFileText className="h-3.5 w-3.5" />
          </span>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Provide brief task scope and technical details..."
            rows={2}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 sm:text-xs resize-none"
            style={{ padding: "8px 12px 8px 36px" }}
          />
        </div>
      </div>

      {/* Two-Column Grid for Project & Assignee */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Project Select */}
        <div className="flex flex-col" style={{ gap: "4px" }}>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
            Project <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              <FiFolder className="h-3.5 w-3.5" />
            </span>
            <select
              name="project"
              value={formData.project}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 sm:text-xs appearance-none cursor-pointer"
              style={{ padding: "9px 12px 9px 36px" }}
            >
              <option value="">Select Project</option>
              {projects.map((project) => (
                <option key={project._id} value={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Assigned User Select */}
        <div className="flex flex-col" style={{ gap: "4px" }}>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
            Assigned Member <span className="text-red-500">*</span>
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              <FiUser className="h-3.5 w-3.5" />
            </span>
            <select
              name="assignedTo"
              value={formData.assignedTo}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 sm:text-xs appearance-none cursor-pointer"
              style={{ padding: "9px 12px 9px 36px" }}
            >
              <option value="">Select User</option>
              {users.map((user) => (
                <option key={user._id} value={user._id}>
                  {user.name} ({user.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Two-Column Grid for Priority & Status */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Priority Select */}
        <div className="flex flex-col" style={{ gap: "4px" }}>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
            Priority Level
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              <FiFlag className="h-3.5 w-3.5" />
            </span>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 sm:text-xs appearance-none cursor-pointer"
              style={{ padding: "9px 12px 9px 36px" }}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
            </select>
          </div>
        </div>

        {/* Status Select */}
        <div className="flex flex-col" style={{ gap: "4px" }}>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
            Task Status
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              <FiActivity className="h-3.5 w-3.5" />
            </span>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 sm:text-xs appearance-none cursor-pointer"
              style={{ padding: "9px 12px 9px 36px" }}
            >
              <option value="todo">Todo</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Due Date Field */}
      <div className="flex flex-col" style={{ gap: "4px" }}>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
          Target Due Date
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3 flex items-center pointer-events-none text-slate-400">
            <FiCalendar className="h-3.5 w-3.5" />
          </span>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 sm:text-xs cursor-pointer"
            style={{ padding: "9px 12px 9px 36px" }}
          />
        </div>
      </div>

      {/* Form Action Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 sm:text-xs cursor-pointer"
          style={{ padding: "10px 16px", gap: "6px" }}
        >
          <FiCheck className="h-3.5 w-3.5 shrink-0" />
          <span>
            {loading 
              ? "Saving Task..." 
              : initialData._id 
                ? "Update Task" 
                : "Save Task"}
          </span>
        </button>
      </div>
    </form>
  );
};

export default TaskForm;