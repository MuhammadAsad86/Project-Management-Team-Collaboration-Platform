import { FiSearch, FiSliders } from "react-icons/fi";

const ProjectFilters = ({ filters, setFilters }) => {
  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div
      className="flex w-full flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:flex-row sm:items-center sm:justify-between"
      style={{ padding: "12px 16px", gap: "12px" }}
    >
      {/* Search Input with Explicit Padding */}
      <div className="relative flex flex-1 items-center" style={{ minWidth: "220px" }}>
        <FiSearch
          className="pointer-events-none absolute text-slate-400"
          style={{ left: "14px", width: "16px", height: "16px", zIndex: 10 }}
        />
        <input
          type="text"
          name="search"
          placeholder="Search project..."
          value={filters.search}
          onChange={handleChange}
          className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
          style={{
            paddingLeft: "42px",
            paddingRight: "16px",
            paddingTop: "10px",
            paddingBottom: "10px",
          }}
        />
      </div>

      {/* Filter Dropdowns */}
      <div className="flex flex-wrap items-center" style={{ gap: "10px" }}>
        {/* Status Filter */}
        <div
          className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50"
          style={{ padding: "6px 12px", gap: "6px" }}
        >
          <FiSliders className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        {/* Priority Filter */}
        <div
          className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50"
          style={{ padding: "6px 12px", gap: "6px" }}
        >
          <span className="shrink-0 text-xs font-medium text-slate-400">
            Priority:
          </span>
          <select
            name="priority"
            value={filters.priority}
            onChange={handleChange}
            className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">All Priority</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div
          className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50"
          style={{ padding: "6px 12px", gap: "6px" }}
        >
          <span className="shrink-0 text-xs font-medium text-slate-400">
            Sort:
          </span>
          <select
            name="sort"
            value={filters.sort}
            onChange={handleChange}
            className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="">Latest</option>
            <option value="name">Name</option>
            <option value="priority">Priority</option>
            <option value="startDate">Start Date</option>
            <option value="endDate">End Date</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProjectFilters;