const Input = ({
  label,
  type = "text",
  placeholder = "",
  error,
  className = "",
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label className="mb-2 block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}

      <input
        type={type}
        placeholder={placeholder}
        className={`w-full rounded-lg border border-gray-300 px-4 py-2 outline-none transition focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 ${className}`}
        {...props}
      />

      {error && (
        <p className="mt-1 text-sm text-red-500">{error}</p>
      )}
    </div>
  );
};

export default Input;