const ProjectFilters = ({
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
        placeholder="Search project..."
        className="rounded-lg border px-3 py-2"
      />


      {/* Status */}
      <select
        name="status"
        value={filters.status}
        onChange={handleChange}
        className="rounded-lg border px-3 py-2"
      >
        <option value="">
          All Status
        </option>

        <option value="pending">
          Pending
        </option>

        <option value="active">
          Active
        </option>

        <option value="completed">
          Completed
        </option>

      </select>


      {/* Priority */}
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


      {/* Sort */}
      <select
        name="sort"
        value={filters.sort}
        onChange={handleChange}
        className="rounded-lg border px-3 py-2"
      >
        <option value="">
          Latest
        </option>

        <option value="name">
          Name
        </option>

        <option value="priority">
          Priority
        </option>

        <option value="startDate">
          Start Date
        </option>

        <option value="endDate">
          End Date
        </option>

      </select>

    </div>
  );
};

export default ProjectFilters;