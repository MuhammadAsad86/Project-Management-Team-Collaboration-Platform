import TaskForm from "./TaskForm";
import { FiX, FiCheckSquare } from "react-icons/fi";

const CreateTaskModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  title = "Create Task",
  initialData = {},
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(initialData && Object.keys(initialData).length > 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 animate-fade-in">
      <div 
        className="nf-depth-card w-full max-w-xl rounded-3xl border border-slate-200/80 bg-white shadow-2xl overflow-hidden flex flex-col"
        style={{ padding: "32px 28px", gap: "24px", maxHeight: "90vh" }}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4 shrink-0">
          <div className="flex items-center" style={{ gap: "12px" }}>
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20">
              <FiCheckSquare className="h-5 w-5" />
            </div>
            <div className="flex flex-col" style={{ gap: "2px" }}>
              <h2 className="text-lg font-black text-slate-900 tracking-tight sm:text-xl" style={{ margin: 0 }}>
                {title}
              </h2>
              <p className="text-xs font-medium text-slate-500" style={{ margin: 0 }}>
                {isEditing 
                  ? "Modify task specifications, assignee, and priority levels." 
                  : "Define deliverables, assign team members, and set target due dates."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition-all hover:bg-slate-200 hover:text-slate-800 active:scale-95 cursor-pointer"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable Form Content Area */}
        <div className="overflow-y-auto pr-1 flex-1 min-h-0">
          <TaskForm
            onSubmit={onSubmit}
            loading={loading}
            initialData={initialData}
          />
        </div>
      </div>
    </div>
  );
};

export default CreateTaskModal;