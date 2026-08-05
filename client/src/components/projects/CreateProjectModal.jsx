import ProjectForm from "./ProjectForm";

const CreateProjectModal = ({
  isOpen,
  onClose,
  onSubmit,
  loading = false,
  title = "Create Project",
  initialData = {},
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">
            {title}
          </h2>

          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none text-gray-500 transition hover:text-black"
          >
            ×
          </button>
        </div>

        {/* Reusable Form */}
        <ProjectForm
          initialData={initialData}
          onSubmit={onSubmit}
          loading={loading}
        />
      </div>
    </div>
  );
};

export default CreateProjectModal;