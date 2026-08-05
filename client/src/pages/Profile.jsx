import { useAuth } from "../context/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold">
        My Profile
      </h1>

      <div className="rounded-xl bg-white p-6 shadow">
        <div className="mb-6 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-indigo-600 text-3xl font-bold text-white">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Name</p>
            <p className="text-lg font-semibold">
              {user?.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Email</p>
            <p className="text-lg font-semibold">
              {user?.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Role</p>
            <span className="inline-block rounded-full bg-indigo-100 px-4 py-1 text-sm font-medium text-indigo-700">
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;