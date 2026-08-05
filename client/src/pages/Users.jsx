import { useEffect, useState } from "react";
import {
  getUsers,
  deleteUser,
} from "../services/userService";

import UserModal from "../components/users/UserModal";
import EditUserModal from "../components/users/EditUserModal";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [sort, setSort] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] =
    useState(1);

  const [showModal, setShowModal] =
    useState(false);

  const [showEditModal, setShowEditModal] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const response = await getUsers({
        search,
        role,
        sort,
        page,
        limit: 5,
      });

      setUsers(response.users);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Users Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, role, sort, page]);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this user?"
    );

    if (!confirmDelete) return;

    try {
      await deleteUser(id);
      fetchUsers();
    } catch (error) {
      console.error(
        "Delete User Error:",
        error
      );
    }
  };

  if (loading) {
    return <h2>Loading...</h2>;
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-3xl font-bold">
          User Management
        </h1>

        <div className="flex flex-wrap items-center gap-3">

          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="rounded-lg border px-4 py-2"
          />

          <select
            value={role}
            onChange={(e) =>
              setRole(e.target.value)
            }
            className="rounded-lg border px-4 py-2"
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
            value={sort}
            onChange={(e) =>
              setSort(e.target.value)
            }
            className="rounded-lg border px-4 py-2"
          >
            <option value="">
              Newest
            </option>

            <option value="name">
              Name
            </option>

            <option value="email">
              Email
            </option>

            <option value="role">
              Role
            </option>
          </select>

          <button
            onClick={() =>
              setShowModal(true)
            }
            className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            + Create User
          </button>

        </div>
      </div>

      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-4 py-3 text-left">
                Name
              </th>

              <th className="px-4 py-3 text-left">
                Email
              </th>

              <th className="px-4 py-3 text-left">
                Role
              </th>

              <th className="px-4 py-3 text-center">
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
                        {users.map((user) => (
              <tr
                key={user._id}
                className="border-t"
              >
                <td className="px-4 py-3">
                  {user.name}
                </td>

                <td className="px-4 py-3">
                  {user.email}
                </td>

                <td className="px-4 py-3 capitalize">
                  {user.role.replaceAll("_", " ")}
                </td>

                <td className="px-4 py-3">
                  <div className="flex justify-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedUser(user);
                        setShowEditModal(true);
                      }}
                      className="rounded bg-yellow-500 px-3 py-1 text-white hover:bg-yellow-600"
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(user._id)
                      }
                      className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <p className="p-6 text-center">
            No users found.
          </p>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() =>
            setPage((prev) =>
              Math.max(prev - 1, 1)
            )
          }
          disabled={page === 1}
          className="rounded bg-gray-200 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Previous
        </button>

        <span className="font-medium">
          Page {page} of {totalPages}
        </span>

        <button
          onClick={() =>
            setPage((prev) =>
              Math.min(prev + 1, totalPages)
            )
          }
          disabled={page === totalPages}
          className="rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
        </button>
      </div>

      {showModal && (
        <UserModal
          onClose={() => setShowModal(false)}
          onUserCreated={fetchUsers}
        />
      )}

      {showEditModal && selectedUser && (
        <EditUserModal
          user={selectedUser}
          onClose={() => {
            setShowEditModal(false);
            setSelectedUser(null);
          }}
          onUserUpdated={fetchUsers}
        />
      )}
    </div>
  );
};

export default Users;