import { useState } from "react";
import { updateUser } from "../../services/userService";

const EditUserModal = ({
  user,
  onClose,
  onUserUpdated,
}) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    role: user.role,
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

      onUserUpdated();

      onClose();
    } catch (error) {
      console.error("Update User Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">
          Edit User
        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded border p-2"
            required
          />

          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded border p-2"
            required
          />

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full rounded border p-2"
          >
            <option value="admin">Admin</option>
            <option value="project_manager">
              Project Manager
            </option>
            <option value="team_member">
              Team Member
            </option>
          </select>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray-300 px-4 py-2"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;