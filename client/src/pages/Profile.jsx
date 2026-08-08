import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import {
  updateMyProfile,
  changeMyPassword,
} from "../services/userService";
import toast from "react-hot-toast";

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

      toast.success(
        "Password changed successfully"
      );

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

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">
        My Profile
      </h1>

      {/* Profile Information */}
      <div className="mb-6 rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm text-gray-500">
                Name
              </p>

              <p className="text-lg font-semibold">
                {user?.name}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Email
              </p>

              <p className="text-lg font-semibold">
                {user?.email}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-500">
                Role
              </p>

              <span className="inline-block rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-700">
                {user?.role}
              </span>
            </div>

            <button
              onClick={() => setIsEditing(true)}
              className="rounded-lg bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
            >
              Edit Profile
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Name
              </label>

              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Email
              </label>

              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full rounded-lg border p-2"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Role
              </label>

              <input
                type="text"
                value={user?.role || ""}
                disabled
                className="w-full rounded-lg border bg-gray-100 p-2 text-gray-500"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-lg bg-blue-600 px-5 py-2 text-white disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
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
                className="rounded-lg bg-gray-200 px-5 py-2"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Change Password */}
      <div className="rounded-xl bg-white p-6 shadow">
        <h2 className="mb-5 text-xl font-semibold">
          Change Password
        </h2>

        <form
          onSubmit={handlePasswordSubmit}
          className="space-y-4"
        >
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Current Password
            </label>

            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              New Password
            </label>

            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              minLength={6}
              required
              className="w-full rounded-lg border p-2"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Confirm New Password
            </label>

            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              minLength={6}
              required
              className="w-full rounded-lg border p-2"
            />
          </div>

          <button
            type="submit"
            disabled={passwordSaving}
            className="rounded-lg bg-indigo-600 px-5 py-2 text-white disabled:opacity-50"
          >
            {passwordSaving
              ? "Changing..."
              : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;