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
    <div className="mb-6 flex flex-wrap gap-3">
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

      {/* Assignee Filter - Admin Only */}
      {isAdmin && (
        <select
          name="assignedTo"
          value={filters.assignedTo}
          onChange={handleChange}
          className="rounded-lg border px-3 py-2"
        >
          <option value="">
            All Assignees
          </option>

          {users
            .filter(
              (user) =>
                user.role === "team_member"
            )
            .map((user) => (
              <option
                key={user._id}
                value={user._id}
              >
                {user.name}
              </option>
            ))}
        </select>
      )}

      {/* Sorting */}
      <select
        name="sort"
        value={filters.sort}
        onChange={handleChange}
        className="rounded-lg border px-3 py-2"
      >
        <option value="newest">
          Newest
        </option>

        <option value="oldest">
          Oldest
        </option>

        <option value="title_asc">
          Title A-Z
        </option>

        <option value="title_desc">
          Title Z-A
        </option>

        <option value="priority">
          Priority
        </option>

        <option value="dueDate">
          Due Date
        </option>

        <option value="updatedAt">
          Updated Date
        </option>
      </select>
    </div>
  );
};

export default TaskFilters;