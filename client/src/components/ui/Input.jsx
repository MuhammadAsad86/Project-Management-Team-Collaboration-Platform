const Input = ({
  label,
  type = "text",
  placeholder = "",
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="flex flex-col w-full" style={{ gap: "4px" }}>
      {label && (
        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-0.5">
          {label}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        className={`w-full rounded-lg border bg-slate-50/50 text-xs font-medium text-slate-800 placeholder-slate-400 outline-none transition-all focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20 sm:text-xs disabled:bg-slate-100 disabled:cursor-not-allowed ${
          error 
            ? "border-red-500 bg-red-50/30 focus:border-red-500 focus:ring-red-500/20" 
            : "border-slate-200"
        } ${className}`}
        style={{ padding: "9px 12px", ...props.style }}
        {...props}
      />

      {error && (
        <p className="text-[11px] font-medium text-red-500 px-0.5" style={{ margin: "2px 0 0 0" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;