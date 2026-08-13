import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
    if (loading) return; // Prevent multiple rapid clicks
    setLoading(true);

    try {
      const data = await loginUser(formData);

      login(data.user, data.token);
      toast.success("Login successful");

      switch (data.user.role) {
        case "admin":
          navigate("/");
          break;
        case "project_manager":
          navigate("/pm-dashboard");
          break;
        case "team_member":
          navigate("/team-member-dashboard");
          break;
        default:
          navigate("/");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Login failed"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="nf-page-enter flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-slate-50 via-indigo-50/20 to-slate-100 px-4 py-10">
      <div 
        className="nf-depth-card flex w-full max-w-md flex-col rounded-3xl border border-slate-200/80 bg-white shadow-lg"
        style={{ padding: "40px 36px", gap: "28px" }}
      >
        <div className="flex flex-col items-center text-center" style={{ gap: "12px" }}>
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
            <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="flex flex-col" style={{ gap: "4px" }}>
            <h1 className="text-2xl font-black text-slate-900 sm:text-3xl" style={{ margin: 0 }}>
              Welcome to <span className="text-indigo-600">NexaFlow</span>
            </h1>
            <p className="text-xs font-medium text-slate-500 sm:text-sm" style={{ margin: 0 }}>
              Sign in to your project workspace & team hub
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col" style={{ gap: "20px" }}>
          <div className="flex flex-col" style={{ gap: "6px" }}>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Email Address
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </span>
              <input
                type="email"
                name="email"
                placeholder="name@company.com"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                style={{ padding: "12px 16px 12px 42px" }}
                required
              />
            </div>
          </div>

          <div className="flex flex-col" style={{ gap: "6px" }}>
            <label className="text-xs font-bold uppercase tracking-wider text-slate-600">
              Password
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </span>
              <input
                type="password"
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 sm:text-sm"
                style={{ padding: "12px 16px 12px 42px" }}
                required
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-semibold text-white shadow-md shadow-indigo-500/25 transition-all hover:opacity-95 active:scale-95 disabled:opacity-50 sm:text-sm cursor-pointer"
              style={{ padding: "12px 20px", gap: "8px" }}
            >
              <span>{loading ? "Signing in..." : "Sign in to Workspace"}</span>
              {!loading && (
                <svg className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;