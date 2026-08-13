import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  updateMyProfile,
  changeMyPassword,
} from "../services/userService";
import toast from "react-hot-toast";
import {
  FiUser,
  FiMail,
  FiShield,
  FiLock,
  FiEdit3,
  FiSave,
  FiX,
  FiKey,
} from "react-icons/fi";

const Profile = () => {
  const { user, login } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [passwordSaving, setPasswordSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setFormData({
      name: user?.name || "",
      email: user?.email || "",
    });
  }, [user]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handlePasswordChange = (e) => {
    setPasswordData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);

      const response = await updateMyProfile(formData);
      const updatedUser = response.user;

      login(
        updatedUser,
        localStorage.getItem("token")
      );

      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (
      passwordData.newPassword !==
      passwordData.confirmPassword
    ) {
      toast.error("New passwords do not match");
      return;
    }

    try {
      setPasswordSaving(true);

      await changeMyPassword({
        currentPassword:
          passwordData.currentPassword,
        newPassword:
          passwordData.newPassword,
      });

      toast.success("Password changed successfully");

      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "Failed to change password"
      );
    } finally {
      setPasswordSaving(false);
    }
  };

  const formatRole = (role) => {
    if (!role) return "N/A";
    return role
      .replace("_", " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  };

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
              <FiUser className="h-3.5 w-3.5" />
              Account Settings
            </span>
          </div>
          <h1
            className="truncate text-xl font-bold text-slate-900 sm:text-2xl"
            style={{ margin: 0 }}
          >
            My Profile
          </h1>
          <p
            className="truncate text-xs font-medium text-slate-500 sm:text-sm"
            style={{ margin: 0 }}
          >
            Manage your personal details, credentials, and account role settings.
          </p>
        </div>
      </div>

      {/* Main Grid Layout for Profile & Security Cards */}
      <div className="grid w-full grid-cols-1 lg:grid-cols-3" style={{ gap: "24px" }}>
        
        {/* 2. PROFILE INFORMATION CARD (Span 2) */}
        <div
          className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm lg:col-span-2"
          style={{ padding: "24px", gap: "20px" }}
        >
          {/* Hero Banner with Avatar */}
          <div className="flex items-center border-b border-slate-100 pb-5" style={{ gap: "16px" }}>
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl text-xl font-black text-white shadow-md shadow-indigo-500/25 sm:h-20 sm:w-20 sm:text-2xl"
              style={{
                background: "linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)",
              }}
            >
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex flex-col min-w-0" style={{ gap: "4px" }}>
              <h2 className="truncate text-lg font-bold text-slate-900 sm:text-xl" style={{ margin: 0 }}>
                {user?.name || "User"}
              </h2>
              <p className="truncate text-xs font-medium text-slate-500" style={{ margin: 0 }}>
                {user?.email || "No email provided"}
              </p>
              <div className="mt-1 flex items-center gap-2">
                <span className="nf-badge nf-badge-primary capitalize">
                  {formatRole(user?.role)}
                </span>
              </div>
            </div>
          </div>

          {!isEditing ? (
            <div className="flex flex-col" style={{ gap: "16px" }}>
              <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: "16px" }}>
                <div
                  className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/60"
                  style={{ padding: "14px 16px", gap: "4px" }}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Full Name
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 sm:text-sm">
                    <FiUser className="h-4 w-4 text-indigo-600 shrink-0" />
                    <span className="truncate">{user?.name}</span>
                  </div>
                </div>

                <div
                  className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/60"
                  style={{ padding: "14px 16px", gap: "4px" }}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                    Email Address
                  </span>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 sm:text-sm">
                    <FiMail className="h-4 w-4 text-purple-600 shrink-0" />
                    <span className="truncate">{user?.email}</span>
                  </div>
                </div>
              </div>

              <div
                className="flex flex-col rounded-xl border border-slate-100 bg-slate-50/60"
                style={{ padding: "14px 16px", gap: "4px" }}
              >
                <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Workspace Role & Permissions
                </span>
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800 sm:text-sm">
                  <FiShield className="h-4 w-4 text-cyan-600 shrink-0" />
                  <span className="truncate capitalize">{formatRole(user?.role)}</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="flex items-center justify-center rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95 sm:text-sm"
                  style={{ padding: "10px 20px", gap: "8px" }}
                >
                  <FiEdit3 className="h-4 w-4 shrink-0" />
                  <span>Edit Profile</span>
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: "16px" }}>
              <div className="flex flex-col" style={{ gap: "6px" }}>
                <label className="text-xs font-semibold text-slate-700">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                  style={{ padding: "10px 14px" }}
                />
              </div>

              <div className="flex flex-col" style={{ gap: "6px" }}>
                <label className="text-xs font-semibold text-slate-700">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                  style={{ padding: "10px 14px" }}
                />
              </div>

              <div className="flex flex-col" style={{ gap: "6px" }}>
                <label className="text-xs font-semibold text-slate-700">
                  Role (Locked)
                </label>
                <input
                  type="text"
                  value={formatRole(user?.role)}
                  disabled
                  className="w-full rounded-xl border border-slate-200 bg-slate-100 text-xs font-medium text-slate-400 cursor-not-allowed sm:text-sm"
                  style={{ padding: "10px 14px" }}
                />
              </div>

              <div className="flex items-center pt-2" style={{ gap: "10px" }}>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center rounded-xl bg-indigo-600 text-xs font-semibold text-white shadow-md transition-all hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                  style={{ padding: "10px 20px", gap: "8px" }}
                >
                  <FiSave className="h-4 w-4 shrink-0" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || "",
                      email: user?.email || "",
                    });
                  }}
                  className="flex items-center justify-center rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-700 transition-all hover:bg-slate-50 sm:text-sm"
                  style={{ padding: "10px 20px", gap: "8px" }}
                >
                  <FiX className="h-4 w-4 shrink-0" />
                  <span>Cancel</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* 3. CHANGE PASSWORD CARD (Span 1) */}
        <div
          className="flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white shadow-sm"
          style={{ padding: "24px", gap: "20px" }}
        >
          <div className="flex items-center border-b border-slate-100 pb-4" style={{ gap: "10px" }}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
              <FiKey className="h-4 w-4" />
            </div>
            <h2 className="text-base font-bold text-slate-900" style={{ margin: 0 }}>
              Change Password
            </h2>
          </div>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col" style={{ gap: "16px" }}>
            <div className="flex flex-col" style={{ gap: "6px" }}>
              <label className="text-xs font-semibold text-slate-700">
                Current Password
              </label>
              <input
                type="password"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                style={{ padding: "10px 14px" }}
              />
            </div>

            <div className="flex flex-col" style={{ gap: "6px" }}>
              <label className="text-xs font-semibold text-slate-700">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                minLength={6}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                style={{ padding: "10px 14px" }}
              />
            </div>

            <div className="flex flex-col" style={{ gap: "6px" }}>
              <label className="text-xs font-semibold text-slate-700">
                Confirm New Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                minLength={6}
                required
                placeholder="••••••••"
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 transition-all focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                style={{ padding: "10px 14px" }}
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={passwordSaving}
                className="w-full flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-semibold text-white shadow-md transition-all hover:opacity-95 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
                style={{ padding: "10px 20px", gap: "8px" }}
              >
                <FiLock className="h-4 w-4 shrink-0" />
                <span>{passwordSaving ? "Changing..." : "Update Password"}</span>
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Profile;