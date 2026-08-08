const TaskFilters = ({
  filters,
  setFilters,
}) => {
  const handleChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="grid gap-4 rounded-lg bg-white p-5 shadow md:grid-cols-4">
      {/* Search */}
      <input
        type="text"
        name="search"
        value={filters.search}
        onChange={handleChange}
        placeholder="Search tasks..."
        className="rounded-lg border px-3 py-2"
      />

      {/* Status Filter */}
      <select
        name="status"
        value={filters.status}
        onChange={handleChange}
        className="rounded-lg border px-3 py-2"
      >
        <option value="">
          All Status
        </option>

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

      {/* Priority Filter */}
      <select
        name="priority"
        value={filters.priority}
        onChange={handleChange}
        className="rounded-lg border px-3 py-2"
      >
        <option value="">
          All Priority
        </option>

        <option value="low">
          Low
        </option>

        <option value="medium">
          Medium
        </option>

        <option value="high">
          High
        </option>
      </select>

      {/* Sorting */}
      <select
        name="sort"
        value={filters.sort}
        onChange={handleChange}
        className="rounded-lg border px-3 py-2"
      >
        <option value="">
          Latest
        </option>

        <option value="title">
          Title
        </option>

        <option value="priority">
          Priority
        </option>

        <option value="dueDate">
          Due Date
        </option>
      </select>
    </div>
  );
};

export default TaskFilters;