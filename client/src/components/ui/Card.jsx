const Card = ({ children, className = "", ...props }) => {
  return (
    <div
      className={`nf-depth-card rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all ${className}`}
      style={{ padding: "24px", ...props.style }}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;