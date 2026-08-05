import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <header className="flex items-center justify-between bg-white border-b px-6 py-4">
      <div>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="font-medium">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.role}</p>
        </div>

        <button
          onClick={logout}
          className="rounded-lg bg-red-500 px-4 py-2 text-white hover:bg-red-600"
        >
          Logout
        </button>
      </div>
    </header>
  );
};

export default Navbar;