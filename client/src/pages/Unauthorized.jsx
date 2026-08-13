import { FiAlertOctagon, FiArrowLeft } from "react-icons/fi";

const Unauthorized = () => {
  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center px-4">
      <div 
        className="flex w-full max-w-md flex-col items-center rounded-3xl border border-slate-200/80 bg-white text-center shadow-sm relative"
        style={{ padding: "40px 32px", gap: "20px", zIndex: 99999, pointerEvents: "auto" }}
      >
        {/* Error Icon Badge */}
        <div 
          className="flex h-16 w-16 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-red-600 shadow-sm"
          style={{ marginBottom: "4px" }}
        >
          <FiAlertOctagon className="h-8 w-8" />
        </div>

        {/* Heading & Subtitle */}
        <div className="flex flex-col items-center" style={{ gap: "8px", width: "100%" }}>
          <span className="inline-flex items-center rounded-full border border-red-200/60 bg-red-50 text-xs font-semibold text-red-700 px-3 py-1">
            Error 403 • Access Restricted
          </span>
          <h1 
            className="text-2xl font-extrabold text-slate-900 sm:text-3xl"
            style={{ margin: 0 }}
          >
            Unauthorized Access
          </h1>
          <p 
            className="text-xs font-medium text-slate-500 sm:text-sm leading-relaxed max-w-xs"
            style={{ margin: 0 }}
          >
            You do not have the required permissions or role clearance to view this workspace page.
          </p>
        </div>

        {/* Action Button as Native Anchor */}
        <div className="pt-2 w-full" style={{ pointerEvents: "auto" }}>
          <a
            href="/"
            className="flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-xs font-semibold text-white shadow-md transition-all hover:opacity-95 active:scale-95 sm:text-sm cursor-pointer"
            style={{ padding: "12px 20px", gap: "8px", textDecoration: "none", pointerEvents: "auto" }}
          >
            <FiArrowLeft className="h-4 w-4 shrink-0" />
            <span>Return to Dashboard</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;