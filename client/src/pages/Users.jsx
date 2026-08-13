import { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../services/userService";
import toast from "react-hot-toast";

import UserModal from "../components/users/UserModal";
import EditUserModal from "../components/users/EditUserModal";

import {
  FiUsers,
  FiUserPlus,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiShield,
  FiChevronLeft,
  FiChevronRight,
  FiSliders,
  FiUserCheck,
  FiBriefcase,
  FiMail,
} from "react-icons/fi";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [role, setRole] = useState("");
  const [sort, setSort] = useState("");

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

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

      setUsers(response.users || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error("Users Error:", error);
      toast.error(error.response?.data?.message || "Failed to load users");
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
      toast.success("User deleted successfully.");
      fetchUsers();
    } catch (error) {
      console.error("Delete User Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to delete user."
      );
    }
  };

  // Helper for generating initial avatars
  const getInitials = (name = "") => {
    return name
      .split(" ")
      .map((part) => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  // Helper for role badge styling
  const renderRoleBadge = (userRole = "") => {
    const formatted = userRole.replaceAll("_", " ");
    switch (userRole) {
      case "admin":
        return <span className="nf-badge nf-badge-primary">Admin</span>;
      case "project_manager":
        return (
          <span className="nf-badge nf-badge-violet">Project Manager</span>
        );
      case "team_member":
        return <span className="nf-badge nf-badge-cyan">Team Member</span>;
      default:
        return (
          <span className="nf-badge nf-badge-neutral capitalize">
            {formatted || "User"}
          </span>
        );
    }
  };

  // Derived user statistics for quick header summary using currently fetched users
  const adminCount = users.filter((u) => u.role === "admin").length;
  const pmCount = users.filter((u) => u.role === "project_manager").length;
  const memberCount = users.filter((u) => u.role === "team_member").length;

  if (loading && users.length === 0) {
    return (
      <div className="flex w-full items-center justify-center py-20">
        <div className="flex flex-col items-center" style={{ gap: "12px" }}>
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-600" />
          <p className="text-xs font-medium text-slate-500">
            Loading team members...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col" style={{ gap: "24px" }}>
      {/* 1. PAGE HEADER */}
      <div 
        className="relative flex w-full flex-col justify-between rounded-2xl border border-white/80 bg-gradient-to-r from-white via-slate-50/80 to-indigo-50/30 shadow-sm sm:flex-row sm:items-center"
        style={{ padding: "18px 20px", gap: "16px" }}
      >
        <div className="flex flex-col" style={{ gap: "4px", minWidth: 0 }}>
          <div className="flex items-center" style={{ gap: "8px" }}>
            <span 
              className="inline-flex items-center rounded-full border border-indigo-200/60 bg-indigo-50 text-xs font-semibold text-indigo-700"
              style={{ padding: "2px 10px", gap: "6px" }}
            >
              <FiShield className="h-3.5 w-3.5" />
              Access & Management
            </span>
          </div>
          <h1 className="truncate text-xl font-bold text-slate-900 sm:text-2xl" style={{ margin: 0 }}>
            User Management
          </h1>
          <p className="truncate text-xs font-medium text-slate-500 sm:text-sm" style={{ margin: 0 }}>
            Control member roles, permissions, and workspace access.
          </p>
        </div>

        <div className="shrink-0">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-semibold text-white shadow-md transition-all hover:opacity-95 active:scale-95 sm:text-sm"
            style={{ padding: "10px 18px", gap: "8px", whiteSpace: "nowrap" }}
          >
            <FiUserPlus className="h-4 w-4 shrink-0" />
            <span>Create User</span>
          </button>
        </div>
      </div>

      {/* 2. STATS SECTION */}
      <div 
        className="grid w-full grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        style={{ gap: "18px" }}
      >
        <div 
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "16px 20px" }}
        >
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400" style={{ margin: 0 }}>
              Page Users
            </p>
            <p className="text-2xl font-extrabold text-slate-900" style={{ margin: 0, lineHeight: 1 }}>
              {users.length}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <FiUsers className="h-5 w-5" />
          </div>
        </div>

        <div 
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "16px 20px" }}
        >
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400" style={{ margin: 0 }}>
              Admins
            </p>
            <p className="text-2xl font-extrabold text-slate-900" style={{ margin: 0, lineHeight: 1 }}>
              {adminCount}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100">
            <FiShield className="h-5 w-5" />
          </div>
        </div>

        <div 
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "16px 20px" }}
        >
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400" style={{ margin: 0 }}>
              Managers
            </p>
            <p className="text-2xl font-extrabold text-slate-900" style={{ margin: 0, lineHeight: 1 }}>
              {pmCount}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-600 border border-purple-100">
            <FiBriefcase className="h-5 w-5" />
          </div>
        </div>

        <div 
          className="flex items-center justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "16px 20px" }}
        >
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400" style={{ margin: 0 }}>
              Team Members
            </p>
            <p className="text-2xl font-extrabold text-slate-900" style={{ margin: 0, lineHeight: 1 }}>
              {memberCount}
            </p>
          </div>
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600 border border-cyan-100">
            <FiUserCheck className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* 3. SEARCH AND FILTER AREA */}
      <div 
        className="flex w-full flex-col rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:flex-row sm:items-center sm:justify-between"
        style={{ padding: "12px 16px", gap: "12px" }}
      >
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px] flex items-center">
          <FiSearch 
            className="absolute text-slate-400 pointer-events-none" 
            style={{ left: "14px", width: "16px", height: "16px", zIndex: 10 }} 
          />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
            style={{ 
              paddingLeft: "42px", 
              paddingRight: "16px", 
              paddingTop: "10px", 
              paddingBottom: "10px" 
            }}
          />
        </div>

        {/* Filters and Sort Dropdowns */}
        <div className="flex flex-wrap items-center" style={{ gap: "10px" }}>
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50" style={{ padding: "6px 12px", gap: "6px" }}>
            <FiSliders className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="project_manager">Project Manager</option>
              <option value="team_member">Team Member</option>
            </select>
          </div>

          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50/50" style={{ padding: "6px 12px", gap: "6px" }}>
            <span className="text-xs font-medium text-slate-400 shrink-0">Sort:</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
            >
              <option value="">Newest</option>
              <option value="name">Name</option>
              <option value="email">Email</option>
              <option value="role">Role</option>
            </select>
          </div>
        </div>
      </div>

      {/* 4. USERS TABLE */}
      <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th scope="col" style={{ padding: "14px 20px" }}>
                  User
                </th>
                <th scope="col" style={{ padding: "14px 20px" }}>
                  Email
                </th>
                <th scope="col" style={{ padding: "14px 20px" }}>
                  Role
                </th>
                <th scope="col" className="text-center" style={{ padding: "14px 20px" }}>
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr
                  key={user._id}
                  className="transition-colors hover:bg-slate-50/80"
                >
                  {/* Name + Avatar */}
                  <td className="whitespace-nowrap" style={{ padding: "14px 20px" }}>
                    <div className="flex items-center" style={{ gap: "12px" }}>
                      <div
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white shadow-sm"
                        style={{
                          background:
                            "linear-gradient(135deg, #4F46E5, #7C3AED)",
                        }}
                      >
                        {getInitials(user.name)}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="truncate text-xs font-bold text-slate-800 sm:text-sm">
                          {user.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="whitespace-nowrap text-xs text-slate-600 font-medium" style={{ padding: "14px 20px" }}>
                    <div className="flex items-center" style={{ gap: "6px" }}>
                      <FiMail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{user.email}</span>
                    </div>
                  </td>

                  {/* Role Badge */}
                  <td className="whitespace-nowrap" style={{ padding: "14px 20px" }}>
                    {renderRoleBadge(user.role)}
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap text-center" style={{ padding: "14px 20px" }}>
                    <div className="flex items-center justify-center" style={{ gap: "8px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(user);
                          setShowEditModal(true);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-amber-300 hover:bg-amber-50 hover:text-amber-600"
                        title="Edit User"
                      >
                        <FiEdit2 className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(user._id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 shadow-sm transition-all hover:border-red-300 hover:bg-red-50 hover:text-red-600"
                        title="Delete User"
                      >
                        <FiTrash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* EMPTY STATE */}
        {!loading && users.length === 0 && (
          <div className="flex flex-col items-center justify-center text-center" style={{ padding: "48px 20px" }}>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-500" style={{ marginBottom: "12px" }}>
              <FiUsers className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-slate-800" style={{ margin: 0 }}>No users found</p>
            <p className="text-xs text-slate-500 max-w-sm" style={{ marginTop: "4px" }}>
              Try adjusting your search or filter parameters to find the team member you are looking for.
            </p>
          </div>
        )}
      </div>

      {/* 5. PAGINATION */}
      <div 
        className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm sm:flex-row sm:items-center"
        style={{ padding: "12px 20px", gap: "12px" }}
      >
        <span className="text-xs font-semibold text-slate-500 text-center sm:text-left">
          Showing page <span className="text-slate-800">{page}</span> of{" "}
          <span className="text-slate-800">{totalPages || 1}</span>
        </span>

        <div className="flex items-center justify-center" style={{ gap: "8px" }}>
          <button
            type="button"
            onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
            disabled={page === 1}
            className="flex items-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ padding: "6px 12px", gap: "4px" }}
          >
            <FiChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>

          <button
            type="button"
            onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={page === totalPages || totalPages === 0}
            className="flex items-center rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
            style={{ padding: "6px 12px", gap: "4px" }}
          >
            Next
            <FiChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* MODALS */}
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