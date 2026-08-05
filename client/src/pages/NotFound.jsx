import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="text-6xl font-bold text-indigo-600">404</h1>

      <p className="mt-4 text-lg text-gray-600">
        Oops! The page you're looking for doesn't exist.
      </p>

      <Link
        to="/"
        className="mt-6 rounded-lg bg-indigo-600 px-5 py-2 text-white transition hover:bg-indigo-700"
      >
        Back to Dashboard
      </Link>
    </div>
  );
};

export default NotFound;