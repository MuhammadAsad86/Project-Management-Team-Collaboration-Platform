import { useState } from "react";
import { createUser } from "../../services/userService";

const UserModal = ({ onClose, onUserCreated }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "team_member",
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

      await createUser(formData);

      onUserCreated();
      onClose();
    } catch (error) {
      console.error("Create User Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-md rounded-lg bg-white p-6">
        <h2 className="mb-4 text-xl font-bold">
          Create User
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            className="w-full rounded border p-2"
            required
          />

          <input
            name="email"
            placeholder="Email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full rounded border p-2"
            required
          />

          <input
            name="password"
            placeholder="Password"
            type="password"
            value={formData.password}
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


          <div className="flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              className="rounded bg-gray-300 px-4 py-2"
            >
              Cancel
            </button>

            <button
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 text-white"
            >
              {loading ? "Creating..." : "Create"}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
};

export default UserModal;