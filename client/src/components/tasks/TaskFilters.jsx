import { FiSearch, FiSliders, FiFlag, FiUser, FiFilter } from "react-icons/fi";

const TaskFilters = ({
  filters,
  setFilters,
  users = [],
  isAdmin = false,
}) => {
  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      className="nf-depth-card flex w-full flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:flex-row lg:items-center lg:justify-between"
      style={{ padding: "16px 20px", gap: "16px" }}
    >
      {/* Search Input Control */}
      <div
        className="relative flex flex-1 items-center"
        style={{ minWidth: "240px" }}
      >
        <FiSearch
          className="pointer-events-none absolute text-slate-400"
          style={{ left: "14px", width: "16px", height: "16px", zIndex: 10 }}
        />
        <input
          type="text"
          name="search"
          placeholder="Search tasks by title or description..."
          value={filters.search}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
          style={{
            paddingLeft: "42px",
            paddingRight: "16px",
            paddingTop: "11px",
            paddingBottom: "11px",
          }}
        />
      </div>

      {/* Filter Dropdowns Group */}
      <div className="flex flex-wrap items-center" style={{ gap: "12px" }}>
        {/* Status Filter */}
        <div
          className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 transition-all hover:border-slate-300 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20"
          style={{ padding: "8px 14px", gap: "8px" }}
        >
          <FiSliders className="h-3.5 w-3.5 shrink-0 text-indigo-500" />
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 focus:outline-none appearance-none pr-2"
          >
            <option value="">All Status</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div
          className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 transition-all hover:border-slate-300 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20"
          style={{ padding: "8px 14px", gap: "8px" }}
        >
          <FiFlag className="h-3.5 w-3.5 shrink-0 text-purple-500" />
          <select
            name="priority"
            value={filters.priority}
            onChange={handleChange}
            className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 focus:outline-none appearance-none pr-2"
          >
            <option value="">All Priority</option>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>

        {/* Assignee Filter - Admin Only */}
        {isAdmin && (
          <div
            className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 transition-all hover:border-slate-300 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20"
            style={{ padding: "8px 14px", gap: "8px" }}
          >
            <FiUser className="h-3.5 w-3.5 shrink-0 text-cyan-600" />
            <select
              name="assignedTo"
              value={filters.assignedTo}
              onChange={handleChange}
              className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 focus:outline-none appearance-none pr-2"
            >
              <option value="">All Assignees</option>
              {users
                .filter((user) => user.role === "team_member")
                .map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.name}
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Sort Filter */}
        <div
          className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50 transition-all hover:border-slate-300 focus-within:border-indigo-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-indigo-500/20"
          style={{ padding: "8px 14px", gap: "8px" }}
        >
          <FiFilter className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <select
            name="sort"
            value={filters.sort}
            onChange={handleChange}
            className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 focus:outline-none appearance-none pr-2"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="title_asc">Title (A-Z)</option>
            <option value="title_desc">Title (Z-A)</option>
            <option value="priority">Priority Level</option>
            <option value="dueDate">Due Date</option>
            <option value="updatedAt">Recently Updated</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default TaskFilters;