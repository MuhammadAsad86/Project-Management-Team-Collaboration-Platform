const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 shadow-md p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;