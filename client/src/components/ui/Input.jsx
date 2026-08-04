const Input = ({
  type = "text",
  placeholder = "",
  className = "",
  ...props
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      className={`w-full rounded-lg border border-gray-300 px-4 py-2 outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-200 ${className}`}
      {...props}
    />
  );
};

export default Input;