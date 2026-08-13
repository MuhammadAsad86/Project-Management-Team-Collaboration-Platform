import { useEffect, useState } from "react";
import {
  FiSearch,
  FiChevronLeft,
  FiChevronRight,
  FiUsers,
  FiShield,
  FiBriefcase,
  FiUserCheck,
  FiRotateCcw,
  FiSliders,
  FiMail,
  FiLayers,
} from "react-icons/fi";
import { getUsers } from "../services/userService";

const ROLE_BADGE = {
  admin: "nf-badge-violet",
  project_manager: "nf-badge-primary",
  team_member: "nf-badge-cyan",
};

const Teams = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    sort: "",
  });

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });

  const [paginationInfo, setPaginationInfo] = useState({
    currentPage: 1,
    totalPages: 1,
    hasNextPage: false,
    hasPreviousPage: false,
    totalRecords: 0,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(filters.search);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [filters.search]);

  // Fetch users
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getUsers({
          search: debouncedSearch,
          role: filters.role,
          sort: filters.sort,
          page: pagination.page,
          limit: pagination.limit,
        });

        setUsers(response.users || []);

        setPaginationInfo({
          currentPage: response.currentPage || 1,
          totalPages: response.totalPages || 1,
          hasNextPage: response.hasNextPage || false,
          hasPreviousPage: response.hasPreviousPage || false,
          totalRecords: response.totalRecords || 0,
        });
      } catch (error) {
        setError(
          error.response?.data?.message ||
            "Failed to load team members."
        );

        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [
    debouncedSearch,
    filters.role,
    filters.sort,
    pagination.page,
    pagination.limit,
  ]);

  const handleSearchChange = (event) => {
    setFilters((current) => ({
      ...current,
      search: event.target.value,
    }));

    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  };

  const handleRoleChange = (event) => {
    setFilters((current) => ({
      ...current,
      role: event.target.value,
    }));

    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  };

  const handleSortChange = (event) => {
    setFilters((current) => ({
      ...current,
      sort: event.target.value,
    }));

    setPagination((current) => ({
      ...current,
      page: 1,
    }));
  };

  const handleReset = () => {
    setFilters({
      search: "",
      role: "",
      sort: "",
    });

    setPagination({
      page: 1,
      limit: 10,
    });
  };

  const formatRole = (role) => {
    if (!role) return "N/A";

    return role
      .replace("_", " ")
      .replace(/\b\w/g, (letter) =>
        letter.toUpperCase()
      );
  };

  const initials = (name) =>
    (name || "?")
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();

  // Derived user statistics from the current page view
  const adminCount = users.filter((u) => u.role === "admin").length;
  const pmCount = users.filter((u) => u.role === "project_manager").length;
  const memberCount = users.filter((u) => u.role === "team_member").length;

  return (
    <div className="nf-page-enter flex w-full flex-col" style={{ gap: "24px" }}>
      {/* 1. PAGE HEADER */}
      <div
        className="nf-depth-soft relative flex w-full flex-col justify-between rounded-2xl border border-white/80 bg-gradient-to-r from-white via-slate-50/80 to-indigo-50/30 shadow-sm sm:flex-row sm:items-center"
        style={{ padding: "18px 20px", gap: "16px" }}
      >
        <div className="flex flex-col" style={{ gap: "4px", minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <span className="nf-badge nf-badge-primary">
              <FiLayers className="h-3.5 w-3.5" />
              Team Management
            </span>
          </div>
          <h1
            className="truncate text-xl font-bold text-slate-900 sm:text-2xl"
            style={{ margin: 0 }}
          >
            Teams
          </h1>
          <p
            className="truncate text-xs font-medium text-slate-500 sm:text-sm"
            style={{ margin: 0 }}
          >
            Manage and view all users, roles, and team member permissions across the platform.
          </p>
        </div>

        <div className="flex shrink-0 items-center" style={{ gap: "10px" }}>
          <div
            className="flex items-center rounded-xl border border-slate-200/80 bg-white shadow-sm"
            style={{ padding: "6px 12px", gap: "10px" }}
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md">
              <FiUsers className="h-3.5 w-3.5" />
            </div>
            <div>
              <p
                className="text-[10px] font-semibold uppercase tracking-wider text-slate-400"
                style={{ margin: 0 }}
              >
                Total Workspace
              </p>
              <p
                className="text-xs font-bold capitalize text-slate-800"
                style={{ margin: 0 }}
              >
                {paginationInfo.totalRecords} Members
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 2. STATS SUMMARY SECTION */}
      <div
        className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ gap: "18px" }}
      >
        <div
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "16px 20px" }}
        >
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
              style={{ margin: 0 }}
            >
              Page Members
            </p>
            <p
              className="text-2xl font-extrabold text-slate-900"
              style={{ margin: 0, lineHeight: 1 }}
            >
              {users.length}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <FiUsers className="h-5 w-5" />
          </div>
        </div>

        <div
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "16px 20px" }}
        >
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
              style={{ margin: 0 }}
            >
              Admins
            </p>
            <p
              className="text-2xl font-extrabold text-slate-900"
              style={{ margin: 0, lineHeight: 1 }}
            >
              {adminCount}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-purple-100 bg-purple-50 text-purple-600">
            <FiShield className="h-5 w-5" />
          </div>
        </div>

        <div
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "16px 20px" }}
        >
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
              style={{ margin: 0 }}
            >
              Managers
            </p>
            <p
              className="text-2xl font-extrabold text-slate-900"
              style={{ margin: 0, lineHeight: 1 }}
            >
              {pmCount}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-indigo-100 bg-indigo-50 text-indigo-600">
            <FiBriefcase className="h-5 w-5" />
          </div>
        </div>

        <div
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "16px 20px" }}
        >
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <p
              className="text-[11px] font-semibold uppercase tracking-wider text-slate-400"
              style={{ margin: 0 }}
            >
              Team Members
            </p>
            <p
              className="text-2xl font-extrabold text-slate-900"
              style={{ margin: 0, lineHeight: 1 }}
            >
              {memberCount}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-100 bg-cyan-50 text-cyan-600">
            <FiUserCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH AND FILTERS AREA */}
      <div
        className="flex w-full flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:flex-row sm:items-center sm:justify-between"
        style={{ padding: "12px 16px", gap: "12px" }}
      >
        {/* Search Input with Explicit Padding */}
        <div
          className="relative flex flex-1 items-center"
          style={{ minWidth: "220px" }}
        >
          <FiSearch
            className="pointer-events-none absolute text-slate-400"
            style={{ left: "14px", width: "16px", height: "16px", zIndex: 10 }}
          />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search name or email..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
            style={{
              paddingLeft: "42px",
              paddingRight: "16px",
              paddingTop: "10px",
              paddingBottom: "10px",
            }}
          />
        </div>

        {/* Filter Dropdowns & Reset Button */}
        <div className="flex flex-wrap items-center" style={{ gap: "10px" }}>
          <div
            className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50"
            style={{ padding: "6px 12px", gap: "6px" }}
          >
            <FiSliders className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <select
              value={filters.role}
              onChange={handleRoleChange}
              className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="project_manager">Project Manager</option>
              <option value="team_member">Team Member</option>
            </select>
          </div>

          <div
            className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50"
            style={{ padding: "6px 12px", gap: "6px" }}
          >
            <span className="shrink-0 text-xs font-medium text-slate-400">
              Sort:
            </span>
            <select
              value={filters.sort}
              onChange={handleSortChange}
              className="cursor-pointer bg-transparent text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="">Newest</option>
              <option value="name">Name A-Z</option>
              <option value="email">Email A-Z</option>
              <option value="role">Role</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleReset}
            className="flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50/80 text-xs font-semibold text-slate-600 transition-all hover:bg-slate-100 active:scale-95"
            style={{
              padding: "8px 14px",
              gap: "6px",
              whiteSpace: "nowrap",
            }}
          >
            <FiRotateCcw className="h-3.5 w-3.5 shrink-0" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* ERROR BANNER */}
      {error && (
        <div
          className="rounded-2xl border border-red-200 bg-red-50/70 text-xs font-semibold text-red-600 shadow-sm"
          style={{ padding: "14px 20px" }}
        >
          {error}
        </div>
      )}

      {/* 4. TEAMS / USERS TABLE */}
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        {loading ? (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ padding: "48px 20px", gap: "12px" }}
          >
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-600" />
            <p className="text-xs font-medium text-slate-500">
              Loading team members...
            </p>
          </div>
        ) : users.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center text-center"
            style={{ padding: "48px 20px", gap: "12px" }}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500">
              <FiUsers className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-800" style={{ margin: 0 }}>
              No users found
            </p>
            <p
              className="max-w-sm text-xs text-slate-500"
              style={{ marginTop: "2px", margin: 0 }}
            >
              Try adjusting your search query or role filter parameters.
            </p>
          </div>
        ) : (
          <div className="nf-scroll overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th scope="col" style={{ padding: "14px 20px" }}>
                    Name
                  </th>
                  <th scope="col" style={{ padding: "14px 20px" }}>
                    Email
                  </th>
                  <th scope="col" style={{ padding: "14px 20px" }}>
                    Role
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="transition-colors hover:bg-slate-50/80"
                  >
                    <td
                      className="whitespace-nowrap"
                      style={{ padding: "14px 20px" }}
                    >
                      <div className="flex items-center" style={{ gap: "12px" }}>
                        <div
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                          style={{
                            background:
                              "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
                          }}
                        >
                          {initials(user.name)}
                        </div>
                        <div className="flex flex-col min-w-0">
                          <span className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                            {user.name}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td
                      className="whitespace-nowrap text-xs text-slate-600 font-medium"
                      style={{ padding: "14px 20px" }}
                    >
                      <div className="flex items-center" style={{ gap: "6px" }}>
                        <FiMail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{user.email}</span>
                      </div>
                    </td>

                    <td
                      className="whitespace-nowrap"
                      style={{ padding: "14px 20px" }}
                    >
                      <span
                        className={`nf-badge ${
                          ROLE_BADGE[user.role] || "nf-badge-neutral"
                        }`}
                      >
                        {formatRole(user.role)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 5. PAGINATION */}
      <div
        className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:flex-row sm:items-center"
        style={{ padding: "12px 20px", gap: "12px" }}
      >
        <span className="text-center text-xs font-semibold text-slate-500 sm:text-left">
          Showing page{" "}
          <span className="text-slate-800">{paginationInfo.currentPage}</span>{" "}
          of{" "}
          <span className="text-slate-800">{paginationInfo.totalPages}</span>{" "}
          • <span className="text-slate-500">Total: {paginationInfo.totalRecords}</span>
        </span>

        <div
          className="flex items-center justify-center"
          style={{ gap: "8px" }}
        >
          <button
            type="button"
            disabled={!paginationInfo.hasPreviousPage}
            onClick={() =>
              setPagination((current) => ({
                ...current,
                page: current.page - 1,
              }))
            }
            className="flex items-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ padding: "6px 12px", gap: "4px" }}
          >
            <FiChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>

          <button
            type="button"
            disabled={!paginationInfo.hasNextPage}
            onClick={() =>
              setPagination((current) => ({
                ...current,
                page: current.page + 1,
              }))
            }
            className="flex items-center rounded-xl bg-[#4F46E5] text-xs font-semibold text-white shadow-sm transition-all hover:bg-[#4338CA] disabled:cursor-not-allowed disabled:opacity-40"
            style={{ padding: "6px 12px", gap: "4px" }}
          >
            Next
            <FiChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Teams;