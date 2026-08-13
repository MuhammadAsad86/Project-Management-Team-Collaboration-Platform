import { FiCompass, FiArrowLeft } from "react-icons/fi";

const NotFound = () => {
  return (
    <div className="flex min-h-[80vh] w-full items-center justify-center px-4">
      <div 
        className="flex w-full max-w-md flex-col items-center rounded-3xl border border-slate-200/80 bg-white text-center shadow-sm relative"
        style={{ padding: "40px 32px", gap: "20px", zIndex: 99999, pointerEvents: "auto" }}
      >
        {/* Icon Badge */}
        <div 
          className="flex h-16 w-16 items-center justify-center rounded-2xl border border-indigo-100 bg-indigo-50 text-indigo-600 shadow-sm"
          style={{ marginBottom: "4px" }}
        >
          <FiCompass className="h-8 w-8 animate-pulse" />
        </div>

        {/* Heading & Subtitle */}
        <div className="flex flex-col items-center" style={{ gap: "8px", width: "100%" }}>
          <span className="inline-flex items-center rounded-full border border-indigo-200/60 bg-indigo-50 text-xs font-semibold text-indigo-700 px-3 py-1">
            Error 404 • Page Missing
          </span>
          <h1 
            className="text-4xl font-black text-slate-900 sm:text-5xl"
            style={{ margin: 0 }}
          >
            Page Not Found
          </h1>
          <p 
            className="text-xs font-medium text-slate-500 sm:text-sm leading-relaxed max-w-xs"
            style={{ margin: 0 }}
          >
            Oops! The page you are looking for doesn't exist or has been moved to a different workspace route.
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
            <span>Back to Dashboard</span>
          </a>
        </div>
      </div>
    </div>
  );
};

export default NotFound;