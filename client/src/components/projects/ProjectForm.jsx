import { useEffect, useState } from "react";
import { getUsers } from "../../services/userService";
import { FiFolder, FiFileText, FiFlag, FiActivity, FiUser, FiCalendar, FiCheck } from "react-icons/fi";

const ProjectForm = ({ onSubmit, initialData = {}, loading = false }) => {
  const [formData, setFormData] = useState({
    name: initialData.name || "",
    description: initialData.description || "",
    priority: initialData.priority || "medium",
    status: initialData.status || "pending",
    assignedManager: initialData.assignedManager?._id || "",
    startDate: initialData.startDate
      ? initialData.startDate.substring(0, 10)
      : "",
    endDate: initialData.endDate
      ? initialData.endDate.substring(0, 10)
      : "",
  });

  const [projectManagers, setProjectManagers] = useState([]);

  useEffect(() => {
    fetchProjectManagers();
  }, []);

  const fetchProjectManagers = async () => {
    try {
      const response = await getUsers({
        role: "project_manager",
        limit: 100,
      });

      setProjectManagers(response.users || []);
    } catch (error) {
      console.error("Project Managers Error:", error);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col w-full" style={{ gap: "12px", padding: "0 2px", marginTop: "4px" }}>
      {/* Project Name Field */}
      <div className="flex flex-col" style={{ gap: "4px" }}>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
          Project Name <span className="text-red-500">*</span>
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3 flex items-center pointer-events-none text-slate-400">
            <FiFolder className="h-3.5 w-3.5" />
          </span>
          <input
            type="text"
            name="name"
            placeholder="e.g. Enterprise SaaS Redesign"
            value={formData.name}
            onChange={handleChange}
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
            placeholder="Brief overview of project scope..."
            value={formData.description}
            onChange={handleChange}
            rows={2}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 sm:text-xs resize-none"
            style={{ padding: "8px 12px 8px 36px" }}
          />
        </div>
      </div>

      {/* Two-Column Grid for Select Options */}
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
            Project Status
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
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Assigned Manager Select */}
      <div className="flex flex-col" style={{ gap: "4px" }}>
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
          Assigned Project Manager
        </label>
        <div className="relative flex items-center">
          <span className="absolute left-3 flex items-center pointer-events-none text-slate-400">
            <FiUser className="h-3.5 w-3.5" />
          </span>
          <select
            name="assignedManager"
            value={formData.assignedManager}
            onChange={handleChange}
            className="w-full rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 sm:text-xs appearance-none cursor-pointer"
            style={{ padding: "9px 12px 9px 36px" }}
          >
            <option value="">Select Project Manager</option>
            {projectManagers.map((manager) => (
              <option key={manager._id} value={manager._id}>
                {manager.name} ({manager.email})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Two-Column Grid for Dates */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Start Date */}
        <div className="flex flex-col" style={{ gap: "4px" }}>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
            Start Date
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              <FiCalendar className="h-3.5 w-3.5" />
            </span>
            <input
              type="date"
              name="startDate"
              value={formData.startDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 sm:text-xs cursor-pointer"
              style={{ padding: "9px 12px 9px 36px" }}
            />
          </div>
        </div>

        {/* End Date */}
        <div className="flex flex-col" style={{ gap: "4px" }}>
          <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
            Target End Date
          </label>
          <div className="relative flex items-center">
            <span className="absolute left-3 flex items-center pointer-events-none text-slate-400">
              <FiCalendar className="h-3.5 w-3.5" />
            </span>
            <input
              type="date"
              name="endDate"
              value={formData.endDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 sm:text-xs cursor-pointer"
              style={{ padding: "9px 12px 9px 36px" }}
            />
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 sm:text-xs cursor-pointer"
          style={{ padding: "10px 16px", gap: "6px" }}
        >
          <FiCheck className="h-3.5 w-3.5 shrink-0" />
          <span>{loading ? "Saving Project..." : "Save Project"}</span>
        </button>
      </div>
    </form>
  );
};

export default ProjectForm;