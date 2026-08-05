import { Link } from "react-router-dom";

const Unauthorized = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-100 px-4">
      <h1 className="mb-4 text-4xl font-bold text-red-600">
        403
      </h1>

      <p className="mb-6 text-lg text-gray-700">
        You are not authorized to access this page.
      </p>

      <Link
        to="/"
        className="rounded-lg bg-indigo-600 px-5 py-2 text-white transition hover:bg-indigo-700"
      >
        Go to Dashboard
      </Link>
    </div>
  );
};

export default Unauthorized;