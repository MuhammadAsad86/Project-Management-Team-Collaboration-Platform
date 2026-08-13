import { useState } from "react";
import { updateUser } from "../../services/userService";
import { FiX, FiUserCheck, FiMail, FiShield, FiCheck } from "react-icons/fi";
import toast from "react-hot-toast";

const EditUserModal = ({
  user,
  onClose,
  onUserUpdated,
}) => {
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    role: user?.role || "team_member",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      await updateUser(user._id, formData);

      toast.success("User updated successfully.");

      onUserUpdated();
      onClose();
    } catch (error) {
      console.error("Update User Error:", error);
      toast.error(
        error.response?.data?.message || "Failed to update user."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      <div 
        className="nf-depth-card w-full max-w-md rounded-3xl border border-slate-200/80 bg-white shadow-2xl overflow-hidden flex flex-col"
        style={{ padding: "32px 28px", gap: "24px", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center" style={{ gap: "12px" }}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <FiUserCheck className="h-5 w-5" />
            </div>
            <div className="flex flex-col" style={{ gap: "2px" }}>
              <h2 className="text-lg font-black text-slate-900 tracking-tight sm:text-xl" style={{ margin: 0 }}>
                Edit User
              </h2>
              <p className="text-xs font-medium text-slate-500" style={{ margin: 0 }}>
                Update account details and system access permissions.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-800 active:scale-95 cursor-pointer"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Content Area */}
        <div className="overflow-y-auto pr-1 flex-1 min-h-0">
          <form onSubmit={handleSubmit} className="flex flex-col w-full" style={{ gap: "12px", padding: "0 2px" }}>
            {/* Name Field */}
            <div className="flex flex-col" style={{ gap: "4px" }}>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 flex items-center pointer-events-none text-slate-400">
                  <FiUserCheck className="h-3.5 w-3.5" />
                </span>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 sm:text-xs"
                  style={{ padding: "9px 12px 9px 36px" }}
                />
              </div>
            </div>

            {/* Email Field */}
            <div className="flex flex-col" style={{ gap: "4px" }}>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 flex items-center pointer-events-none text-slate-400">
                  <FiMail className="h-3.5 w-3.5" />
                </span>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 sm:text-xs"
                  style={{ padding: "9px 12px 9px 36px" }}
                />
              </div>
            </div>

            {/* Role Select Field */}
            <div className="flex flex-col" style={{ gap: "4px" }}>
              <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
                System Role <span className="text-red-500">*</span>
              </label>
              <div className="relative flex items-center">
                <span className="absolute left-3 flex items-center pointer-events-none text-slate-400">
                  <FiShield className="h-3.5 w-3.5" />
                </span>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 sm:text-xs appearance-none cursor-pointer"
                  style={{ padding: "9px 12px 9px 36px" }}
                >
                  <option value="admin">Admin</option>
                  <option value="project_manager">Project Manager</option>
                  <option value="team_member">Team Member</option>
                </select>
              </div>
            </div>

            {/* Form Actions Footer */}
            <div className="pt-4 flex items-center justify-end" style={{ gap: "10px" }}>
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm transition-all hover:bg-slate-50 active:scale-95 cursor-pointer"
                style={{ padding: "10px 16px" }}
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 cursor-pointer"
                style={{ padding: "10px 18px", gap: "6px" }}
              >
                <FiCheck className="h-3.5 w-3.5 shrink-0" />
                <span>{loading ? "Updating..." : "Update User"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditUserModal;