import { useEffect, useState } from "react";
import { getUsers } from "../services/userService";

const Teams = () => {
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [filters, setFilters] = useState({
    search: "",
    role: "",
    sort: "",
  });

  const [debouncedSearch, setDebouncedSearch] =
    useState("");

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
          currentPage:
            response.currentPage || 1,
          totalPages:
            response.totalPages || 1,
          hasNextPage:
            response.hasNextPage || false,
          hasPreviousPage:
            response.hasPreviousPage || false,
          totalRecords:
            response.totalRecords || 0,
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Teams
        </h1>

        <p className="mt-1 text-gray-500">
          Manage and view all users and their
          roles.
        </p>
      </div>

      {/* Filters */}
      <div className="rounded-lg bg-white p-5 shadow">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Search name or email..."
            className="rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
          />

          <select
            value={filters.role}
            onChange={handleRoleChange}
            className="rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="">
              All Roles
            </option>

            <option value="admin">
              Admin
            </option>

            <option value="project_manager">
              Project Manager
            </option>

            <option value="team_member">
              Team Member
            </option>
          </select>

          <select
            value={filters.sort}
            onChange={handleSortChange}
            className="rounded-lg border px-3 py-2 outline-none focus:border-blue-500"
          >
            <option value="">
              Newest
            </option>

            <option value="name">
              Name A-Z
            </option>

            <option value="email">
              Email A-Z
            </option>

            <option value="role">
              Role
            </option>
          </select>

          <button
            type="button"
            onClick={handleReset}
            className="rounded-lg bg-gray-200 px-4 py-2 hover:bg-gray-300"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-red-600">
          {error}
        </div>
      )}

      {/* Users */}
      <div className="rounded-lg bg-white shadow">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            Loading users...
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No users found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="px-5 py-3">
                    Name
                  </th>

                  <th className="px-5 py-3">
                    Email
                  </th>

                  <th className="px-5 py-3">
                    Role
                  </th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr
                    key={user._id}
                    className="border-b last:border-b-0"
                  >
                    <td className="px-5 py-4 font-medium">
                      {user.name}
                    </td>

                    <td className="px-5 py-4 text-gray-600">
                      {user.email}
                    </td>

                    <td className="px-5 py-4">
                      {formatRole(user.role)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          disabled={
            !paginationInfo.hasPreviousPage
          }
          onClick={() =>
            setPagination((current) => ({
              ...current,
              page: current.page - 1,
            }))
          }
          className="rounded bg-gray-200 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <span>
          Page{" "}
          {paginationInfo.currentPage} of{" "}
          {paginationInfo.totalPages}
        </span>

        <button
          type="button"
          disabled={
            !paginationInfo.hasNextPage
          }
          onClick={() =>
            setPagination((current) => ({
              ...current,
              page: current.page + 1,
            }))
          }
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {/* Total */}
      <p className="text-center text-sm text-gray-500">
        Total users:{" "}
        {paginationInfo.totalRecords}
      </p>
    </div>
  );
};

export default Teams;